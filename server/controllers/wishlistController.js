import pool from '../config/db.js';

// ─── GET /api/wishlist ────────────────────────────────────────────
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const [items] = await pool.query(`
      SELECT w.id as wishlistId, p.id, p.name, p.price, p.stock, p.in_stock,
             cat.name as category, cat.slug as categorySlug,
             COALESCE((SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1),
                      (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1)) as image
      FROM wishlists w
      JOIN products p ON w.product_id = p.id
      LEFT JOIN categories cat ON p.category_id = cat.id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `, [userId]);

    return res.status(200).json({ success: true, message: 'Wishlist berhasil diambil', data: items });
  } catch (error) {
    console.error('GetWishlist error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ─── POST /api/wishlist ───────────────────────────────────────────
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) return res.status(400).json({ success: false, message: 'productId harus diisi' });

    const [product] = await pool.query('SELECT id FROM products WHERE id = ?', [productId]);
    if (product.length === 0) return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });

    const [existing] = await pool.query('SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?', [userId, productId]);
    if (existing.length > 0) return res.status(409).json({ success: false, message: 'Produk sudah ada di wishlist' });

    await pool.query('INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)', [userId, productId]);
    return res.status(201).json({ success: true, message: 'Produk berhasil ditambahkan ke wishlist' });
  } catch (error) {
    console.error('AddToWishlist error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ─── DELETE /api/wishlist/:productId ─────────────────────────────
export const removeFromWishlist = async (req, res) => {
  try {
    const userId    = req.user.id;
    const { productId } = req.params;

    const [existing] = await pool.query('SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?', [userId, productId]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Produk tidak ada di wishlist' });

    await pool.query('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?', [userId, productId]);
    return res.status(200).json({ success: true, message: 'Produk berhasil dihapus dari wishlist' });
  } catch (error) {
    console.error('RemoveFromWishlist error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ─── DELETE /api/wishlist (clear all) ────────────────────────────
export const clearWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    await pool.query('DELETE FROM wishlists WHERE user_id = ?', [userId]);
    return res.status(200).json({ success: true, message: 'Wishlist berhasil dikosongkan' });
  } catch (error) {
    console.error('ClearWishlist error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};
