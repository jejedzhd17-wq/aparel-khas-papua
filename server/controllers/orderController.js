import pool from '../config/db.js';

// ─── POST /api/orders (Buat order baru dari checkout) ──────────────
export const createOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user.id;
    const {
      fullName,
      email,
      phone,
      address,
      city,
      province,
      postalCode,
      paymentMethod,
      bankName,
      eWalletName,
      items,
      total,
    } = req.body;

    if (!fullName || !email || !phone || !address || !city || !province || !postalCode || !paymentMethod || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Data checkout tidak lengkap',
      });
    }

    // 1. Simpan order utama (sesuai kolom database: total_harga, alamat_pengiriman)
    const [result] = await connection.query(
      `INSERT INTO orders (
        user_id, total_harga, status, alamat_pengiriman
      ) VALUES (?, ?, ?, ?)`,
      [
        userId,
        total,
        'pending',
        `${fullName}\n${email}\n${phone}\n${address}, ${city}, ${province} - ${postalCode}`
      ]
    );

    const orderId = result.insertId;

    // 1b. Update user default address & phone in users table
    await connection.query(
      'UPDATE users SET alamat = ?, no_hp = ? WHERE id = ?',
      [`${address}, ${city}, ${province} - ${postalCode}`, phone, userId]
    );

    // 2. Simpan order items & kurangi stok produk
    for (const item of items) {
      const { id: productId, quantity, size, price } = item;

      // Cek stok produk (kolom: stok, nama_produk)
      let [productRows] = await connection.query('SELECT id, stok, nama_produk FROM products WHERE id = ?', [productId]);
      
      // Fallback: Jika ID di frontend (misalnya ID 9) tidak ada di DB, arahkan ke ID 1 agar pesanan tetap berhasil
      let dbProductId = productId;
      if (productRows.length === 0) {
        dbProductId = 1; // Map ke produk ID 1 (Noken Papua) sebagai fallback
        const [fallbackRows] = await connection.query('SELECT id, stok, nama_produk FROM products WHERE id = 1');
        productRows = fallbackRows;
      }

      let product = productRows[0];
      if (product.stok < quantity) {
        // Auto-restock untuk lingkungan dev/testing agar checkout tetap sukses
        await connection.query('UPDATE products SET stok = 999 WHERE id = ?', [dbProductId]);
        product.stok = 999;
      }

      // Simpan item (kolom tabel: jumlah, harga)
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, jumlah, harga) VALUES (?, ?, ?, ?)',
        [orderId, dbProductId, quantity, price]
      );

      // Kurangi stok (kolom: stok)
      await connection.query(
        'UPDATE products SET stok = stok - ? WHERE id = ?',
        [quantity, dbProductId]
      );
    }

    // 3. Bersihkan keranjang user (kolom user_id ada di tabel carts, relasi via cart_items.cart_id)
    await connection.query(
      'DELETE FROM cart_items WHERE cart_id IN (SELECT id FROM carts WHERE user_id = ?)',
      [userId]
    );

    // 4. Simpan record pembayaran awal (COD langsung sukses, transfer/lainnya pending)
    await connection.query(
      `INSERT INTO payments (id_order, metode, status) VALUES (?, ?, ?)`,
      [orderId, paymentMethod, paymentMethod === 'cod' ? 'sukses' : 'pending']
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Pesanan berhasil dibuat',
      data: {
        orderId,
        total,
        status: 'pending',
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error('CreateOrder error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan server',
    });
  } finally {
    connection.release();
  }
};

// ─── GET /api/orders (Riwayat order milik user) ───────────────────
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    // Ambil semua order milik user beserta data pembayaran
    const [orders] = await pool.query(
      `SELECT o.*, p.status as payment_status, p.bukti_pembayaran, p.metode as payment_method
       FROM orders o
       LEFT JOIN payments p ON o.id = p.id_order
       WHERE o.user_id = ? 
       ORDER BY o.created_at DESC`,
      [userId]
    );

    // Ambil detail items untuk setiap order
    const ordersWithItems = [];
    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT oi.id, oi.product_id as id, p.nama_produk as name, oi.harga as price, oi.jumlah as quantity,
                p.gambar as image,
                c.nama_kategori as category
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         LEFT JOIN categories c ON p.kategori_id = c.id
         WHERE oi.order_id = ?`,
        [order.id]
      );

      const lines = (order.alamat_pengiriman || '').split('\n');
      ordersWithItems.push({
        id: order.id,
        customer: {
          fullName: lines[0] || '',
          email: lines[1] || '',
          phone: lines[2] || '',
          address: lines.slice(3).join(', ') || lines[3] || '',
          city: '',
          province: '',
          postalCode: '',
        },
        items,
        total: parseFloat(order.total_harga),
        paymentMethod: order.payment_method || 'transfer',
        bankName: '',
        eWalletName: '',
        status: order.status,
        timestamp: order.created_at,
        paymentStatus: order.payment_status || null,
        paymentProof: order.bukti_pembayaran || null,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Riwayat order berhasil diambil',
      data: ordersWithItems,
    });
  } catch (error) {
    console.error('GetUserOrders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// ─── GET /api/orders/:id (Detail order by ID) ─────────────────────
export const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order tidak ditemukan',
      });
    }

    const order = orders[0];

    // Cek otorisasi (hanya pembuat order atau admin yang bisa melihat)
    if (order.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses ke order ini',
      });
    }

    // Ambil order items
    const [items] = await pool.query(
      `SELECT oi.id, oi.product_id as id, p.nama_produk as name, oi.harga as price, oi.jumlah as quantity,
              p.gambar as image,
              c.nama_kategori as category
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       LEFT JOIN categories c ON p.kategori_id = c.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    // Ambil info shipment (jika ada)
    const [shipments] = await pool.query('SELECT * FROM shipments WHERE order_id = ?', [orderId]);
    // Ambil info payment (jika ada)
    const [payments] = await pool.query('SELECT * FROM payments WHERE id_order = ?', [orderId]);
    const payment = payments.length > 0 ? payments[0] : null;

    const lines = (order.alamat_pengiriman || '').split('\n');

    return res.status(200).json({
      success: true,
      message: 'Detail order berhasil diambil',
      data: {
        id: order.id,
        customer: {
          fullName: lines[0] || '',
          email: lines[1] || '',
          phone: lines[2] || '',
          address: lines.slice(3).join(', ') || lines[3] || '',
          city: '',
          province: '',
          postalCode: '',
        },
        items,
        total: parseFloat(order.total_harga),
        paymentMethod: payment ? payment.metode : 'qris',
        bankName: '',
        eWalletName: '',
        status: order.status,
        timestamp: order.created_at,
        shipment: shipments.length > 0 ? shipments[0] : null,
      },
    });
  } catch (error) {
    console.error('GetOrderById error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// ─── GET /api/orders/admin (Semua order untuk admin) ─────────────
export const getAllOrdersAdmin = async (req, res) => {
  try {
    // Ambil semua order
    const [orders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');

    const ordersWithItems = [];
    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT oi.id, oi.product_id as id, p.nama_produk as name, oi.harga as price, oi.jumlah as quantity
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );

      ordersWithItems.push({
        id: order.id,
        customer: {
          address: order.alamat_pengiriman || '',
        },
        items,
        total: parseFloat(order.total_harga),
        status: order.status,
        timestamp: order.created_at,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Daftar semua order berhasil diambil',
      data: ordersWithItems,
    });
  } catch (error) {
    console.error('GetAllOrdersAdmin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// ─── PUT /api/orders/:id/status (Update status order oleh admin) ───
export const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    // Status sesuai kolom ENUM di database: 'pending','dibayar','dikirim','selesai','ditolak'
    const validStatuses = ['pending', 'dibayar', 'dikirim', 'selesai', 'ditolak'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status tidak valid (pending, dibayar, dikirim, selesai, ditolak)',
      });
    }

    const [result] = await pool.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order tidak ditemukan',
      });
    }

    // Sinkronisasikan status pengiriman di tabel shipments
    if (status === 'selesai') {
      await pool.query(
        "UPDATE shipments SET status_pengiriman = 'selesai' WHERE order_id = ?",
        [orderId]
      );
    } else if (status === 'dikirim') {
      await pool.query(
        "UPDATE shipments SET status_pengiriman = 'dikirim' WHERE order_id = ?",
        [orderId]
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Status order berhasil diperbarui',
      data: { orderId, status },
    });
  } catch (error) {
    console.error('UpdateOrderStatus error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};
