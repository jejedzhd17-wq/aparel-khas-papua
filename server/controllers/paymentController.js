import pool from '../config/db.js';

// ─── POST /api/payments ───────────────────────────────────────────
export const createPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;

    if (!orderId || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Order ID dan payment method harus diisi' });
    }

    const [orders] = await pool.query('SELECT id, total FROM orders WHERE id = ?', [orderId]);
    if (orders.length === 0) return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });

    const [existing] = await pool.query('SELECT id_payments FROM payments WHERE id_order = ?', [orderId]);

    let paymentId;
    if (existing.length > 0) {
      await pool.query("UPDATE payments SET payment_method = ?, status = 'pending' WHERE id_order = ?", [paymentMethod, orderId]);
      paymentId = existing[0].id_payments;
    } else {
      const [result] = await pool.query(
        'INSERT INTO payments (id_order, payment_method, status, total) VALUES (?, ?, ?, ?)',
        [orderId, paymentMethod, 'pending', orders[0].total]
      );
      paymentId = result.insertId;
    }

    return res.status(201).json({ success: true, message: 'Record pembayaran berhasil dibuat', data: { paymentId, orderId, paymentMethod, status: 'pending' } });
  } catch (error) {
    console.error('CreatePayment error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ─── GET /api/payments/:orderId ───────────────────────────────────
export const getPaymentByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const [payments] = await pool.query('SELECT * FROM payments WHERE id_order = ?', [orderId]);
    if (payments.length === 0) return res.status(404).json({ success: false, message: 'Data pembayaran tidak ditemukan' });
    return res.status(200).json({ success: true, message: 'Detail pembayaran berhasil diambil', data: payments[0] });
  } catch (error) {
    console.error('GetPaymentByOrderId error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ─── POST /api/payments/upload-proof ─────────────────────────────
export const uploadProof = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) return res.status(400).json({ success: false, message: 'Order ID harus disertakan' });
    if (!req.file) return res.status(400).json({ success: false, message: 'File bukti pembayaran harus diupload' });

    const proofImage = req.file.filename;

    const [existing] = await pool.query('SELECT id_payments FROM payments WHERE id_order = ?', [orderId]);
    if (existing.length === 0) {
      const [order] = await pool.query('SELECT id, total FROM orders WHERE id = ?', [orderId]);
      if (order.length === 0) return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
      await pool.query(
        'INSERT INTO payments (id_order, payment_method, status, total, proof_image) VALUES (?, ?, ?, ?, ?)',
        [orderId, 'transfer', 'pending', order[0].total, proofImage]
      );
    } else {
      await pool.query('UPDATE payments SET proof_image = ?, status = ? WHERE id_order = ?', [proofImage, 'pending', orderId]);
    }

    return res.status(200).json({ success: true, message: 'Bukti pembayaran berhasil diupload', data: { orderId, proofImage } });
  } catch (error) {
    console.error('UploadProof error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ─── PUT /api/payments/:orderId/verify (Admin) ────────────────────
export const verifyPayment = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { orderId } = req.params;
    const { status }  = req.body; // 'verified' atau 'rejected'

    if (!status || !['verified', 'rejected'].includes(status)) {
      connection.release();
      return res.status(400).json({ success: false, message: 'Status tidak valid (verified, rejected)' });
    }

    const [payments] = await pool.query('SELECT id_payments FROM payments WHERE id_order = ?', [orderId]);
    if (payments.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Pembayaran tidak ditemukan' });
    }

    await connection.query('UPDATE payments SET status = ? WHERE id_order = ?', [status, orderId]);

    if (status === 'verified') {
      await connection.query("UPDATE orders SET status = 'paid' WHERE id = ?", [orderId]);
    }

    await connection.commit();
    return res.status(200).json({ success: true, message: `Pembayaran berhasil di-${status}`, data: { orderId, status } });
  } catch (error) {
    await connection.rollback();
    console.error('VerifyPayment error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  } finally {
    connection.release();
  }
};

// ─── GET /api/payments/admin (Admin) ─────────────────────────────
export const getAllPaymentsAdmin = async (req, res) => {
  try {
    const [payments] = await pool.query(`
      SELECT p.*, o.total as orderTotal, u.name as customer_name
      FROM payments p
      LEFT JOIN orders o ON p.id_order = o.id
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY p.created_at DESC
    `);

    return res.status(200).json({ success: true, message: 'Daftar pembayaran berhasil diambil', data: payments });
  } catch (error) {
    console.error('GetAllPaymentsAdmin error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};
