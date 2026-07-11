import pool from '../config/db.js';

// ─── GET /api/reviews ─────────────────────────────────────────────
export const getReviews = async (req, res) => {
  try {
    const { product_id } = req.query;

    let query = `
      SELECT r.id, r.product_id as productId, r.user_name as userName, r.rating, r.comment,
             p.name as productName,
             COALESCE((SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1),
                      (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1)) as productImage,
             r.created_at as date
      FROM reviews r
      LEFT JOIN products p ON r.product_id = p.id
    `;
    const params = [];

    if (product_id) {
      query += ' WHERE r.product_id = ?';
      params.push(product_id);
    }

    query += ' ORDER BY r.created_at DESC';

    const [reviews] = await pool.query(query, params);

    return res.status(200).json({ success: true, message: 'Review berhasil diambil', data: reviews });
  } catch (error) {
    console.error('GetReviews error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ─── POST /api/reviews ────────────────────────────────────────────
export const createReview = async (req, res) => {
  try {
    const { productId, userName, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Product ID, rating (1-5), dan komentar harus diisi' });
    }

    const parsedRating = parseInt(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating harus angka di rentang 1 hingga 5' });
    }

    // Ambil nama user dari token jika tidak disediakan
    let reviewerName = userName;
    if (!reviewerName && req.user) {
      const [users] = await pool.query('SELECT name FROM users WHERE id = ?', [req.user.id]);
      reviewerName = users.length > 0 ? users[0].name : 'Pelanggan';
    }
    if (!reviewerName) reviewerName = 'Pelanggan';

    const [result] = await pool.query(
      'INSERT INTO reviews (product_id, user_name, rating, comment) VALUES (?, ?, ?, ?)',
      [productId, reviewerName, parsedRating, comment]
    );

    return res.status(201).json({
      success: true,
      message: 'Ulasan berhasil ditambahkan',
      data: { id: result.insertId, productId, userName: reviewerName, rating: parsedRating, comment, date: new Date() },
    });
  } catch (error) {
    console.error('CreateReview error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ─── DELETE /api/reviews/:id (admin) ─────────────────────────────
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Review tidak ditemukan' });
    }
    return res.status(200).json({ success: true, message: 'Review berhasil dihapus' });
  } catch (error) {
    console.error('DeleteReview error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};
