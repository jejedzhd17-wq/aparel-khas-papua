import pool from '../config/db.js';

// ─── GET /api/reviews (Get reviews by product ID atau semua review) ──
export const getReviews = async (req, res) => {
  try {
    const { product_id } = req.query;

    let query = `
      SELECT r.id, r.product_id as productId, u.nama as userName, r.rating, r.komentar as comment,
             p.nama_produk as productName,
             p.gambar as productImage
      FROM reviews r
      LEFT JOIN products p ON r.product_id = p.id
      LEFT JOIN users u ON r.user_id = u.id
    `;
    const params = [];

    if (product_id) {
      query += ' WHERE r.product_id = ?';
      params.push(product_id);
    }

    query += ' ORDER BY r.id DESC';

    const [reviews] = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      message: 'Review berhasil diambil',
      data: reviews,
    });
  } catch (error) {
    console.error('GetReviews error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// ─── POST /api/reviews (Kirim review baru) ────────────────────────
export const createReview = async (req, res) => {
  try {
    const { productId, userName, rating, comment } = req.body;

    if (!productId || !userName || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, nama user, rating (1-5), dan komentar harus diisi',
      });
    }

    // Pastikan rating berada di rentang 1-5
    const parsedRating = parseInt(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating harus angka di rentang 1 hingga 5',
      });
    }

    // Simpan ke database (menggunakan user_id dari auth jika tersedia, atau default user_id = 1)
    const userId = req.user?.id || 1;
    const [result] = await pool.query(
      'INSERT INTO reviews (product_id, user_id, rating, komentar) VALUES (?, ?, ?, ?)',
      [productId, userId, parsedRating, comment]
    );

    return res.status(201).json({
      success: true,
      message: 'Ulasan berhasil ditambahkan',
      data: {
        id: result.insertId,
        productId,
        userName,
        rating: parsedRating,
        comment,
        date: new Date(),
      },
    });
  } catch (error) {
    console.error('CreateReview error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// ─── DELETE /api/reviews/:id (Hapus review - admin) ────────────────
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM reviews WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review tidak ditemukan',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Review berhasil dihapus',
    });
  } catch (error) {
    console.error('DeleteReview error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};
