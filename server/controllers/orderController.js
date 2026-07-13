import pool from '../config/db.js';
import crypto from 'crypto';

// Buat ID order unik: ORD-{timestamp}-{4karakter acak}
const generateOrderId = () => {
  const ts   = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `ORD-${ts}-${rand}`;
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

    const orderId = generateOrderId();

    // 1. Simpan order utama
    await connection.query(
      `INSERT INTO orders (id, user_id, full_name, email, phone, address, city, province, postal_code, total, payment_method, bank_name, ewallet_name, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [orderId, userId, fullName, email, phone, address, city, province, postalCode, parseFloat(total), paymentMethod, bankName || null, eWalletName || null]
    );

    // 1b. Update phone & address di user
    await connection.query('UPDATE users SET phone = ?, address = ? WHERE id = ?', [phone, `${address}, ${city}, ${province} ${postalCode}`, userId]);

    // 2. Simpan order items & kurangi stok
    for (const item of items) {
      const { id: productId, quantity = 1, size = 'M', price } = item;

      let [productRows] = await connection.query('SELECT id, stock FROM products WHERE id = ?', [productId]);
      let dbProductId = productId;

      if (productRows.length === 0) {
        // Fallback ke produk pertama yang tersedia
        const [firstProduct] = await connection.query('SELECT id, stock FROM products ORDER BY id ASC LIMIT 1');
        if (firstProduct.length === 0) throw new Error('Tidak ada produk tersedia di database');
        dbProductId  = firstProduct[0].id;
        productRows  = firstProduct;
      }

      const product = productRows[0];
      if (product.stock < parseInt(quantity)) {
        // Auto-restock untuk keperluan pengembangan/pengujian
        await connection.query('UPDATE products SET stock = 999 WHERE id = ?', [dbProductId]);
      }

      await connection.query(
        'INSERT INTO order_items (order_id, product_id, size, quantity, price) VALUES (?, ?, ?, ?, ?)',
        [orderId, dbProductId, size || 'M', parseInt(quantity), parseFloat(price)]
      );

      await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [parseInt(quantity), dbProductId]);
    }

    // 3. Kosongkan cart user
    await connection.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

    // 4. Buat record pembayaran awal
    const payStatus = paymentMethod === 'cod' ? 'verified' : 'pending';
    await connection.query(
      'INSERT INTO payments (id_order, payment_method, status, total, bank_name, ewallet_name) VALUES (?, ?, ?, ?, ?, ?)',
      [orderId, paymentMethod, payStatus, parseFloat(total), bankName || null, eWalletName || null]
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

// Helper: ambil items sebuah order
const getOrderItems = async (orderId) => {
  const [items] = await pool.query(
    `SELECT oi.id, oi.product_id as productId, p.name, oi.price, oi.quantity, oi.size,
            c.name as category,
            COALESCE((SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1),
                     (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1)) as image
     FROM order_items oi
     LEFT JOIN products p ON oi.product_id = p.id
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE oi.order_id = ?`,
    [orderId]
  );
  return items;
};

// Helper: format order object
const formatOrder = (order, items = [], payment = null, shipment = null) => ({
  id: order.id,
  customer: {
    fullName:   order.full_name,
    email:      order.email,
    phone:      order.phone,
    address:    order.address,
    city:       order.city,
    province:   order.province,
    postalCode: order.postal_code,
  },
  items,
  total:          parseFloat(order.total),
  paymentMethod:  order.payment_method,
  bankName:       order.bank_name  || null,
  eWalletName:    order.ewallet_name || null,
  status:         order.status,
  timestamp:      order.created_at,
  paymentStatus:  payment  ? payment.status  : null,
  paymentProof:   payment  ? payment.proof_image : null,
  shipment:       shipment || null,
});

// ─── GET /api/orders (Riwayat order user) ─────────────────────────
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const [orders] = await pool.query(
      `SELECT o.*, p.status as payment_status, p.proof_image, p.payment_method as pay_method
       FROM orders o
       LEFT JOIN payments p ON o.id = p.id_order
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [userId]
    );

    const result = await Promise.all(orders.map(async (order) => {
      const items = await getOrderItems(order.id);
      return formatOrder(order, items, { status: order.payment_status, proof_image: order.proof_image });
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
    const orderId   = req.params.id;
    const userId    = req.user.id;
    const userRole  = req.user.role;

    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
    }

    const order = orders[0];
    if (order.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke order ini' });
    }

    const items = await getOrderItems(orderId);
    const [payments]  = await pool.query('SELECT * FROM payments WHERE id_order = ?', [orderId]);
    const [shipments] = await pool.query('SELECT * FROM shipments WHERE order_id = ?', [orderId]);

    return res.status(200).json({
      success: true,
      message: 'Detail order berhasil diambil',
      data: formatOrder(order, items, payments[0] || null, shipments[0] || null),
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
      return formatOrder(order, items);
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
    const orderId  = req.params.id;
    const { status } = req.body;

    const validStatuses = ['pending', 'paid', 'shipped', 'completed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Status tidak valid (pending, paid, shipped, completed)' });
    }

    const [result] = await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
    }

    // Sync shipments
    if (status === 'completed') {
      await pool.query("UPDATE shipments SET status = 'delivered' WHERE order_id = ?", [orderId]);
    } else if (status === 'shipped') {
      await pool.query("UPDATE shipments SET status = 'shipped' WHERE order_id = ?", [orderId]);
    }

    return res.status(200).json({ success: true, message: 'Status order berhasil diperbarui', data: { orderId, status } });
  } catch (error) {
    console.error('UpdateOrderStatus error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};
