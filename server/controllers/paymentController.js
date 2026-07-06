import pool from '../config/db.js';

// ─── POST /api/payments (Buat/record pembayaran baru) ──────────────
export const createPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;

    if (!orderId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Order ID dan payment method harus diisi',
      });
    }

    // Cek apakah order exist
    const [orders] = await pool.query('SELECT id, total_harga FROM orders WHERE id = ?', [orderId]);
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order tidak ditemukan',
      });
    }

    // Cek apakah pembayaran untuk order ini sudah dibuat
    const [existing] = await pool.query('SELECT id_payments FROM payments WHERE id_order = ?', [orderId]);
    
    let paymentId;
    if (existing.length > 0) {
      // Update data pembayaran yang sudah ada
      await pool.query(
        `UPDATE payments 
         SET metode = ?, status = 'pending'
         WHERE id_order = ?`,
        [paymentMethod, orderId]
      );
      paymentId = existing[0].id_payments;
    } else {
      // Buat pembayaran baru
      const [result] = await pool.query(
        `INSERT INTO payments (id_order, metode, status)
         VALUES (?, ?, ?)`,
        [orderId, paymentMethod, 'pending']
      );
      paymentId = result.insertId;
    }

    return res.status(201).json({
      success: true,
      message: 'Record pembayaran berhasil dibuat',
      data: {
        paymentId,
        orderId,
        paymentMethod,
        status: 'pending',
      },
    });
  } catch (error) {
    console.error('CreatePayment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// ─── GET /api/payments/:orderId (Detail pembayaran) ─────────────
export const getPaymentByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const [payments] = await pool.query('SELECT * FROM payments WHERE id_order = ?', [orderId]);

    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data pembayaran untuk order ini tidak ditemukan',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Detail pembayaran berhasil diambil',
      data: payments[0],
    });
  } catch (error) {
    console.error('GetPaymentByOrderId error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// ─── POST /api/payments/upload-proof (Upload bukti bayar) ─────────
export const uploadProof = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID harus disertakan',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File bukti pembayaran harus diupload',
      });
    }

    const proofImage = req.file.filename;

    // Pastikan record pembayaran ada
    const [payments] = await pool.query('SELECT id_payments FROM payments WHERE id_order = ?', [orderId]);
    if (payments.length === 0) {
      // Buat record pembayaran baru
      const [order] = await pool.query('SELECT id FROM orders WHERE id = ?', [orderId]);
      if (order.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Order tidak ditemukan',
        });
      }
      await pool.query(
        `INSERT INTO payments (id_order, metode, status, bukti_pembayaran)
         VALUES (?, ?, ?, ?)`,
        [orderId, 'transfer', 'pending', proofImage]
      );
    } else {
      // Update bukti_pembayaran
      await pool.query(
        'UPDATE payments SET bukti_pembayaran = ?, status = ? WHERE id_order = ?',
        [proofImage, 'pending', orderId]
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Bukti pembayaran berhasil diupload',
      data: {
        orderId,
        proofImage,
      },
    });
  } catch (error) {
    console.error('UploadProof error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// ─── PUT /api/payments/:orderId/verify (Verifikasi pembayaran - admin) ──
export const verifyPayment = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { orderId } = req.params;
    const { status } = req.body; // 'verified' atau 'rejected'

    if (!status || !['verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status verifikasi tidak valid (verified, rejected)',
      });
    }

    const [payments] = await pool.query('SELECT id_payments FROM payments WHERE id_order = ?', [orderId]);
    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pembayaran tidak ditemukan',
      });
    }

    // 1. Update status pembayaran
    const dbStatus = status === 'verified' ? 'sukses' : 'gagal';
    await connection.query(
      'UPDATE payments SET status = ? WHERE id_order = ?',
      [dbStatus, orderId]
    );

    // 2. Jika diverifikasi (verified), update status order menjadi 'dibayar' (paid)
    // Sesuai enum status di database: 'pending','dibayar','dikirim','selesai'
    if (status === 'verified') {
      await connection.query(
        "UPDATE orders SET status = 'dibayar' WHERE id = ?",
        [orderId]
      );
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: `Pembayaran berhasil di-${status}`,
      data: {
        orderId,
        status,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error('VerifyPayment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// ─── GET /api/payments/admin (Semua data pembayaran - admin only) ───────
export const getAllPaymentsAdmin = async (req, res) => {
  try {
    const [payments] = await pool.query(`
      SELECT p.*, o.total_harga, u.nama as customer_name
      FROM payments p
      LEFT JOIN orders o ON p.id_order = o.id
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY p.paid_at DESC
    `);

    return res.status(200).json({
      success: true,
      message: 'Daftar pembayaran berhasil diambil',
      data: payments,
    });
  } catch (error) {
    console.error('GetAllPaymentsAdmin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};
