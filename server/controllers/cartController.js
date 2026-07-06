import pool from '../config/db.js';

// ─── GET /api/cart ────────────────────────────────────────────────
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Ambil atau buat cart untuk user ini
    let [carts] = await pool.query('SELECT id FROM carts WHERE user_id = ?', [userId]);

    if (carts.length === 0) {
      const [newCart] = await pool.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
      carts = [{ id: newCart.insertId }];
    }

    const cartId = carts[0].id;

    // Ambil semua item di cart
    const [items] = await pool.query(`
      SELECT ci.id as cartItemId, ci.quantity, ci.size,
             p.id, p.nama_produk as name, p.harga as price, p.stok as stock, p.gambar as image,
             cat.nama_kategori as category
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN categories cat ON p.kategori_id = cat.id
      WHERE ci.cart_id = ?
    `, [cartId]);

    const total = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

    return res.status(200).json({
      success: true,
      message: 'Cart berhasil diambil',
      data: {
        cartId,
        items: items.map(item => ({
          id: item.id,
          cartItemId: item.cartItemId,
          name: item.name,
          price: Number(item.price),
          image: item.image,
          category: item.category || 'Pakaian',
          quantity: item.quantity,
          size: item.size || 'M',
          stock: item.stock,
        })),
        total,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      },
    });
  } catch (error) {
    console.error('GetCart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// ─── POST /api/cart ───────────────────────────────────────────────
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1, size = 'M' } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'productId harus diisi',
      });
    }

    // Cek produk ada dan masih ada stok
    const [products] = await pool.query('SELECT id, stok FROM products WHERE id = ?', [productId]);
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan',
      });
    }

    // Jika stok ada, cek kecukupan stok
    if (products[0].stok !== null && products[0].stok < parseInt(quantity)) {
      return res.status(400).json({
        success: false,
        message: `Stok tidak cukup. Tersedia: ${products[0].stok}`,
      });
    }

    // Ambil atau buat cart
    let [carts] = await pool.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
    if (carts.length === 0) {
      const [newCart] = await pool.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
      carts = [{ id: newCart.insertId }];
    }
    const cartId = carts[0].id;

    // Cek apakah item dengan produk + size yang sama sudah ada
    const [existing] = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? AND size = ?',
      [cartId, productId, size]
    );

    if (existing.length > 0) {
      // Update quantity
      const newQuantity = existing[0].quantity + parseInt(quantity);
      await pool.query(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [newQuantity, existing[0].id]
      );
    } else {
      // Tambah item baru
      await pool.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity, size) VALUES (?, ?, ?, ?)',
        [cartId, productId, parseInt(quantity), size]
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Produk berhasil ditambahkan ke cart',
    });
  } catch (error) {
    console.error('AddToCart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// ─── PUT /api/cart/:itemId ────────────────────────────────────────
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity harus diisi dan >= 0',
      });
    }

    // Verifikasi item milik user ini
    const [items] = await pool.query(`
      SELECT ci.id FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      WHERE ci.id = ? AND c.user_id = ?
    `, [itemId, userId]);

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item cart tidak ditemukan',
      });
    }

    if (parseInt(quantity) === 0) {
      // Hapus item jika quantity 0
      await pool.query('DELETE FROM cart_items WHERE id = ?', [itemId]);
      return res.status(200).json({
        success: true,
        message: 'Item berhasil dihapus dari cart',
      });
    }

    await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [parseInt(quantity), itemId]);

    return res.status(200).json({
      success: true,
      message: 'Jumlah item berhasil diupdate',
    });
  } catch (error) {
    console.error('UpdateCartItem error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// ─── DELETE /api/cart/:itemId ─────────────────────────────────────
export const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const [items] = await pool.query(`
      SELECT ci.id FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      WHERE ci.id = ? AND c.user_id = ?
    `, [itemId, userId]);

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item cart tidak ditemukan',
      });
    }

    await pool.query('DELETE FROM cart_items WHERE id = ?', [itemId]);

    return res.status(200).json({
      success: true,
      message: 'Item berhasil dihapus dari cart',
    });
  } catch (error) {
    console.error('RemoveCartItem error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// ─── DELETE /api/cart (clear all) ────────────────────────────────
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const [carts] = await pool.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
    if (carts.length > 0) {
      await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [carts[0].id]);
    }

    return res.status(200).json({
      success: true,
      message: 'Cart berhasil dikosongkan',
    });
  } catch (error) {
    console.error('ClearCart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};
