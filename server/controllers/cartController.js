import pool from '../config/db.js';

// Helper: ambil gambar produk
const getProductImage = async (productId) => {
  const [imgs] = await pool.query(
    'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY is_primary DESC LIMIT 1',
    [productId]
  );
  return imgs.length > 0 ? imgs[0].image_url : null;
};

// ─── GET /api/cart ────────────────────────────────────────────────
// New schema: cart_items punya user_id langsung (tidak ada tabel carts)
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const [items] = await pool.query(`
      SELECT ci.id as cartItemId, ci.quantity, ci.size,
             p.id, p.name, p.price, p.stock, p.in_stock,
             cat.name as category, cat.slug as categorySlug
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN categories cat ON p.category_id = cat.id
      WHERE ci.user_id = ?
    `, [userId]);

    // Resolve images
    const itemsWithImages = await Promise.all(items.map(async (item) => {
      const image = await getProductImage(item.id);
      return {
        id: item.id,
        cartItemId: item.cartItemId,
        name: item.name,
        price: Number(item.price),
        image,
        category: item.category || 'Produk',
        categorySlug: item.categorySlug || null,
        quantity: item.quantity,
        size: item.size || 'M',
        stock: item.stock,
      };
    }));

    const total     = itemsWithImages.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = itemsWithImages.reduce((sum, item) => sum + item.quantity, 0);

    return res.status(200).json({
      success: true,
      message: 'Cart berhasil diambil',
      data: { items: itemsWithImages, total, itemCount },
    });
  } catch (error) {
    console.error('GetCart error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ─── POST /api/cart ───────────────────────────────────────────────
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1, size = 'M' } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId harus diisi' });
    }

    // Cek produk ada & stok
    const [products] = await pool.query('SELECT id, stock FROM products WHERE id = ?', [productId]);
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }
    if (products[0].stock !== null && products[0].stock < parseInt(quantity)) {
      return res.status(400).json({ success: false, message: `Stok tidak cukup. Tersedia: ${products[0].stock}` });
    }

    // Cek apakah item dengan produk + size yang sama sudah ada
    const [existing] = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ? AND size = ?',
      [userId, productId, size]
    );

    if (existing.length > 0) {
      const newQty = existing[0].quantity + parseInt(quantity);
      await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, existing[0].id]);
    } else {
      await pool.query(
        'INSERT INTO cart_items (user_id, product_id, quantity, size) VALUES (?, ?, ?, ?)',
        [userId, parseInt(productId), parseInt(quantity), size]
      );
    }

    return res.status(201).json({ success: true, message: 'Produk berhasil ditambahkan ke cart' });
  } catch (error) {
    console.error('AddToCart error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ─── PUT /api/cart/:itemId ────────────────────────────────────────
export const updateCartItem = async (req, res) => {
  try {
    const userId   = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ success: false, message: 'Quantity harus diisi dan >= 0' });
    }

    // Verifikasi item milik user ini
    const [items] = await pool.query('SELECT id FROM cart_items WHERE id = ? AND user_id = ?', [itemId, userId]);
    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Item cart tidak ditemukan' });
    }

    if (parseInt(quantity) === 0) {
      await pool.query('DELETE FROM cart_items WHERE id = ?', [itemId]);
      return res.status(200).json({ success: true, message: 'Item berhasil dihapus dari cart' });
    }

    await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [parseInt(quantity), itemId]);
    return res.status(200).json({ success: true, message: 'Jumlah item berhasil diupdate' });
  } catch (error) {
    console.error('UpdateCartItem error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ─── DELETE /api/cart/:itemId ─────────────────────────────────────
export const removeCartItem = async (req, res) => {
  try {
    const userId   = req.user.id;
    const { itemId } = req.params;

    const [items] = await pool.query('SELECT id FROM cart_items WHERE id = ? AND user_id = ?', [itemId, userId]);
    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Item cart tidak ditemukan' });
    }

    await pool.query('DELETE FROM cart_items WHERE id = ?', [itemId]);
    return res.status(200).json({ success: true, message: 'Item berhasil dihapus dari cart' });
  } catch (error) {
    console.error('RemoveCartItem error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ─── DELETE /api/cart (clear all) ────────────────────────────────
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    await pool.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
    return res.status(200).json({ success: true, message: 'Cart berhasil dikosongkan' });
  } catch (error) {
    console.error('ClearCart error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};
