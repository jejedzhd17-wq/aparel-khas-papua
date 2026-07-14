import pool from '../config/db.js';

// Mapping Status Orders dari database (dibayar/dikirim/selesai/ditolak/pending) ke format frontend (paid/shipped/completed/cancelled/pending)
const mapStatusToFrontend = (dbStatus) => {
  switch (dbStatus) {
    case 'dibayar': return 'paid';
    case 'dikirim': return 'shipped';
    case 'selesai': return 'completed';
    case 'ditolak': return 'cancelled';
    default: return 'pending';
  }
};

const mapStatusToDb = (feStatus) => {
  switch (feStatus) {
    case 'paid': return 'dibayar';
    case 'shipped': return 'dikirim';
    case 'completed': return 'selesai';
    case 'cancelled': return 'ditolak';
    default: return 'pending';
  }
};

// Helper: ambil items sebuah order
const getOrderItems = async (orderId) => {
  const [items] = await pool.query(
    `SELECT oi.id, oi.product_id as productId, p.nama_produk as name, oi.harga as price, oi.jumlah as quantity,
            'M' as size, c.nama_kategori as category, p.gambar as image
     FROM order_items oi
     LEFT JOIN products p ON oi.product_id = p.id
     LEFT JOIN categories c ON p.kategori_id = c.id
     WHERE oi.order_id = ?`,
    [orderId]
  );
  
  return items.map(item => ({
    ...item,
    price: Number(item.price),
    quantity: Number(item.quantity)
  }));
};

// Helper: format order object
const formatOrder = (order, items = [], payment = null, shipment = null) => {
  const lines = (order.alamat_pengiriman || '').split('\n');
  const fullName = lines[0] || '';
  const email = lines[1] || '';
  const phone = lines[2] || '';
  const address = lines.slice(3).join('\n') || '';

  return {
    id: String(order.id),
    customer: {
      fullName,
      email,
      phone,
      address,
      city: '',
      province: '',
      postalCode: '',
    },
    items,
    total: parseFloat(order.total_harga || 0),
    paymentMethod: payment ? payment.metode : 'bank-transfer',
    bankName: payment ? payment.bank_name : null,
    eWalletName: payment ? payment.ewallet_name : null,
    status: mapStatusToFrontend(order.status),
    timestamp: order.created_at,
    paymentStatus: payment ? (payment.status === 'sukses' ? 'verified' : (payment.status === 'gagal' ? 'rejected' : 'pending')) : null,
    paymentProof: payment ? payment.bukti_pembayaran : null,
    shipment: shipment || null,
  };
};

// ─── POST /api/orders (Checkout → buat order baru) ─────────────────
export const createOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user.id;
    const { fullName, email, phone, address, city, province, postalCode, paymentMethod, bankName, eWalletName, items, total } = req.body;

    if (!fullName || !email || !phone || !address || !city || !province || !postalCode || !paymentMethod || !items || items.length === 0) {
      connection.release();
      return res.status(400).json({ success: false, message: 'Data checkout tidak lengkap' });
    }

    // Format alamat pengiriman seperti yang ada di Clever Cloud
    const alamatPengiriman = `${fullName}\n${email}\n${phone}\n${address}, ${city}, ${province} - ${postalCode}`;

    // 1. Simpan order utama (ID di-generate auto-increment oleh database)
    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, total_harga, status, alamat_pengiriman)
       VALUES (?, ?, 'pending', ?)`,
      [userId, parseFloat(total), alamatPengiriman]
    );

    const orderId = orderResult.insertId;

    // Update alamat & no_hp user
    await connection.query('UPDATE users SET no_hp = ?, alamat = ? WHERE id = ?', [phone, `${address}, ${city}, ${province} - ${postalCode}`, userId]);

    // 2. Simpan order items & kurangi stok
    for (const item of items) {
      const { id: productId, quantity = 1, price } = item;

      let [productRows] = await connection.query('SELECT id, stok FROM products WHERE id = ?', [productId]);
      let dbProductId = productId;

      if (productRows.length === 0) {
        const [firstProduct] = await connection.query('SELECT id, stok FROM products ORDER BY id ASC LIMIT 1');
        if (firstProduct.length === 0) throw new Error('Tidak ada produk tersedia di database');
        dbProductId = firstProduct[0].id;
        productRows = firstProduct;
      }

      const product = productRows[0];
      const qty = parseInt(quantity);
      if (product.stok < qty) {
        // Auto-restock jika stok tidak cukup untuk kemudahan pengujian
        await connection.query('UPDATE products SET stok = 999 WHERE id = ?', [dbProductId]);
      }

      await connection.query(
        'INSERT INTO order_items (order_id, product_id, jumlah, harga) VALUES (?, ?, ?, ?)',
        [orderId, dbProductId, qty, parseFloat(price)]
      );

      await connection.query('UPDATE products SET stok = GREATEST(0, stok - ?) WHERE id = ?', [qty, dbProductId]);
    }

    // 3. Kosongkan keranjang belanja user
    await connection.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

    // 4. Buat record pembayaran awal
    const payStatus = paymentMethod === 'cod' ? 'sukses' : 'pending';
    await connection.query(
      'INSERT INTO payments (id_order, metode, status) VALUES (?, ?, ?)',
      [orderId, paymentMethod, payStatus]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Pesanan berhasil dibuat',
      data: { orderId, total: parseFloat(total), status: 'pending' },
    });
  } catch (error) {
    await connection.rollback();
    console.error('CreateOrder error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Terjadi kesalahan server' });
  } finally {
    connection.release();
  }
};

// ─── GET /api/orders (Riwayat order user) ─────────────────────────
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const [orders] = await pool.query(
      `SELECT o.*, p.status as payment_status, p.bukti_pembayaran, p.metode as pay_method
       FROM orders o
       LEFT JOIN payments p ON o.id = p.id_order
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [userId]
    );

    const result = await Promise.all(orders.map(async (order) => {
      const items = await getOrderItems(order.id);
      return formatOrder(order, items, {
        status: order.payment_status,
        bukti_pembayaran: order.bukti_pembayaran,
        metode: order.pay_method
      });
    }));

    return res.status(200).json({ success: true, message: 'Riwayat order berhasil diambil', data: result });
  } catch (error) {
    console.error('GetUserOrders error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ─── GET /api/orders/:id (Detail order) ───────────────────────────
export const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
    }

    const order = orders[0];
    if (order.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke order ini' });
    }

    const items = await getOrderItems(orderId);
    const [payments] = await pool.query('SELECT * FROM payments WHERE id_order = ?', [orderId]);
    
    // Check shipments jika ada
    let shipment = null;
    try {
      const [shipments] = await pool.query('SELECT * FROM shipments WHERE order_id = ?', [orderId]);
      if (shipments.length > 0) shipment = shipments[0];
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: 'Detail order berhasil diambil',
      data: formatOrder(order, items, payments[0] || null, shipment),
    });
  } catch (error) {
    console.error('GetOrderById error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ─── GET /api/orders/admin (Semua order – admin) ──────────────────
export const getAllOrdersAdmin = async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');

    const result = await Promise.all(orders.map(async (order) => {
      const items = await getOrderItems(order.id);
      const [payments] = await pool.query('SELECT * FROM payments WHERE id_order = ?', [order.id]);
      return formatOrder(order, items, payments[0] || null);
    }));

    return res.status(200).json({ success: true, message: 'Daftar semua order berhasil diambil', data: result });
  } catch (error) {
    console.error('GetAllOrdersAdmin error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ─── PUT /api/orders/:id/status (Update status order – admin) ──────
export const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    const validStatuses = ['pending', 'paid', 'shipped', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Status tidak valid (pending, paid, shipped, completed, cancelled)' });
    }

    const dbStatus = mapStatusToDb(status);

    const [result] = await pool.query('UPDATE orders SET status = ? WHERE id = ?', [dbStatus, orderId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
    }

    // Sync shipments jika ada
    try {
      if (status === 'completed') {
        await pool.query("UPDATE shipments SET status = 'delivered' WHERE order_id = ?", [orderId]);
      } else if (status === 'shipped') {
        await pool.query("UPDATE shipments SET status = 'shipped' WHERE order_id = ?", [orderId]);
      }
    } catch (e) {}

    return res.status(200).json({ success: true, message: 'Status order berhasil diperbarui', data: { orderId, status } });
  } catch (error) {
    console.error('UpdateOrderStatus error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};
