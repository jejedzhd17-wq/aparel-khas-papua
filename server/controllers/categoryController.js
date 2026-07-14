import pool from '../config/db.js';

// ─── GET /api/categories ──────────────────────────────────────────
export const getAllCategories = async (req, res) => {
  try {
    const [categories] = await pool.query(`
      SELECT c.id, c.nama_kategori as name, c.nama_kategori as slug,
             COUNT(p.id) as productCount
      FROM categories c
      LEFT JOIN products p ON p.kategori_id = c.id
      GROUP BY c.id, c.nama_kategori
      ORDER BY c.nama_kategori ASC
    `);

    // Format slug dari nama_kategori
    const formatted = categories.map(c => ({
      ...c,
      slug: c.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: '',
      icon: '🛍️',
    }));

    return res.status(200).json({
      success: true,
      message: 'Daftar kategori berhasil diambil',
      data: formatted,
    });
  } catch (error) {
    console.error('GetAllCategories error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ─── GET /api/categories/:slug ────────────────────────────────────
export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Decode slug ke nama (ganti - dengan spasi)
    const nameFromSlug = slug.replace(/-/g, ' ');

    // Cari by id jika slug adalah angka, atau by nama_kategori
    let categories;
    if (!isNaN(slug)) {
      [categories] = await pool.query('SELECT id, nama_kategori FROM categories WHERE id = ?', [slug]);
    } else {
      [categories] = await pool.query(
        'SELECT id, nama_kategori FROM categories WHERE LOWER(nama_kategori) LIKE ? OR LOWER(nama_kategori) = ?',
        [`%${nameFromSlug.toLowerCase()}%`, nameFromSlug.toLowerCase()]
      );
    }

    if (categories.length === 0) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    }

    const category = categories[0];
    const categorySlug = category.nama_kategori.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const [products] = await pool.query(`
      SELECT p.id, p.nama_produk as name, p.harga as price, p.stok as stock, p.deskripsi as description,
             p.gambar as image, c.nama_kategori as category,
             IFNULL((SELECT AVG(rating) FROM reviews WHERE product_id = p.id), 0) as rating,
             (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as reviewCount,
             p.stok as in_stock
      FROM products p
      LEFT JOIN categories c ON p.kategori_id = c.id
      WHERE p.kategori_id = ?
      ORDER BY p.created_at DESC
    `, [category.id]);

    const productsFormatted = products.map(p => ({
      ...p,
      price: Number(p.price),
      in_stock: p.in_stock > 0,
      categorySlug,
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    }));

    return res.status(200).json({
      success: true,
      message: 'Data kategori berhasil diambil',
      data: {
        id: category.id,
        name: category.nama_kategori,
        slug: categorySlug,
        description: '',
        icon: '🛍️',
        products: productsFormatted,
      },
    });
  } catch (error) {
    console.error('GetCategoryBySlug error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ─── POST /api/categories (admin) ────────────────────────────────
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama kategori harus diisi' });
    }

    const [existing] = await pool.query('SELECT id FROM categories WHERE LOWER(nama_kategori) = ?', [name.toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Kategori dengan nama ini sudah ada' });
    }

    const [result] = await pool.query(
      'INSERT INTO categories (nama_kategori) VALUES (?)',
      [name]
    );

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return res.status(201).json({
      success: true,
      message: 'Kategori berhasil dibuat',
      data: { id: result.insertId, name, slug, description: '', icon: '🛍️' },
    });
  } catch (error) {
    console.error('CreateCategory error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ─── PUT /api/categories/:id (admin) ─────────────────────────────
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const [existing] = await pool.query('SELECT id FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    }

    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama kategori harus diisi' });
    }

    await pool.query('UPDATE categories SET nama_kategori = ? WHERE id = ?', [name, id]);

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return res.status(200).json({
      success: true,
      message: 'Kategori berhasil diupdate',
      data: { id: parseInt(id), name, slug, description: '', icon: '🛍️' },
    });
  } catch (error) {
    console.error('UpdateCategory error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ─── DELETE /api/categories/:id (admin) ──────────────────────────
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    }

    const [[{ count }]] = await pool.query('SELECT COUNT(*) as count FROM products WHERE kategori_id = ?', [id]);
    if (count > 0) {
      return res.status(400).json({
        success: false,
        message: `Tidak dapat menghapus kategori yang memiliki ${count} produk.`,
      });
    }

    await pool.query('DELETE FROM categories WHERE id = ?', [id]);

    return res.status(200).json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (error) {
    console.error('DeleteCategory error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};
