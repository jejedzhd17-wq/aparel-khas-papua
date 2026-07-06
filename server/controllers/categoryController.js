import pool from '../config/db.js';

// ─── GET /api/categories ──────────────────────────────────────────
export const getAllCategories = async (req, res) => {
  try {
    const [categories] = await pool.query(`
      SELECT c.id, c.nama_kategori as name,
             LOWER(REPLACE(c.nama_kategori, ' ', '-')) as slug,
             '' as description, '📦' as icon,
             COUNT(p.id) as productCount
      FROM categories c
      LEFT JOIN products p ON p.kategori_id = c.id
      GROUP BY c.id, c.nama_kategori
      ORDER BY c.nama_kategori ASC
    `);

    return res.status(200).json({
      success: true,
      message: 'Daftar kategori berhasil diambil',
      data: categories,
    });
  } catch (error) {
    console.error('GetAllCategories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// ─── GET /api/categories/:slug ────────────────────────────────────
export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const [categories] = await pool.query(
      `SELECT id, nama_kategori as name, 
              LOWER(REPLACE(nama_kategori, ' ', '-')) as slug,
              '' as description, '📦' as icon 
       FROM categories 
       WHERE LOWER(REPLACE(nama_kategori, ' ', '-')) = ?`,
      [slug]
    );

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan',
      });
    }

    const category = categories[0];

    // Ambil produk dalam kategori ini
    const [products] = await pool.query(`
      SELECT p.id, p.nama_produk as name, p.harga as price, p.stok as stock, p.deskripsi as description,
             c.nama_kategori as category, LOWER(REPLACE(c.nama_kategori, ' ', '-')) as categorySlug,
             COALESCE((SELECT url_gambar FROM product_images WHERE product_id = p.id LIMIT 1), p.gambar) as image,
             IFNULL((SELECT AVG(rating) FROM reviews WHERE product_id = p.id), 0) as rating,
             (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as reviewCount
      FROM products p
      LEFT JOIN categories c ON p.kategori_id = c.id
      WHERE p.kategori_id = ?
      ORDER BY p.created_at DESC
    `, [category.id]);

    return res.status(200).json({
      success: true,
      message: 'Data kategori berhasil diambil',
      data: { ...category, products },
    });
  } catch (error) {
    console.error('GetCategoryBySlug error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// ─── POST /api/categories (admin) ────────────────────────────────
export const createCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Nama kategori harus diisi',
      });
    }

    // Generate slug dari nama
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Cek duplikat
    const [existing] = await pool.query(
      'SELECT id FROM categories WHERE LOWER(nama_kategori) = ?',
      [name.toLowerCase()]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Kategori dengan nama ini sudah ada',
      });
    }

    const [result] = await pool.query(
      'INSERT INTO categories (nama_kategori) VALUES (?)',
      [name]
    );

    return res.status(201).json({
      success: true,
      message: 'Kategori berhasil dibuat',
      data: { id: result.insertId, name, slug, description: description || '', icon: icon || '📦' },
    });
  } catch (error) {
    console.error('CreateCategory error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// ─── PUT /api/categories/:id (admin) ─────────────────────────────
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon } = req.body;

    const [existing] = await pool.query('SELECT id FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan',
      });
    }

    const updateFields = [];
    const updateValues = [];

    if (name) {
      updateFields.push('nama_kategori = ?');
      updateValues.push(name);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada data yang diupdate',
      });
    }

    updateValues.push(id);
    await pool.query(`UPDATE categories SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);

    const [updated] = await pool.query('SELECT id, nama_kategori as name FROM categories WHERE id = ?', [id]);
    const category = updated[0];
    const slug = category.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    return res.status(200).json({
      success: true,
      message: 'Kategori berhasil diupdate',
      data: { id: category.id, name: category.name, slug, description: description || '', icon: icon || '📦' },
    });
  } catch (error) {
    console.error('UpdateCategory error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// ─── DELETE /api/categories/:id (admin) ──────────────────────────
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan',
      });
    }

    // Cek apakah ada produk dalam kategori ini
    const [products] = await pool.query('SELECT COUNT(*) as count FROM products WHERE kategori_id = ?', [id]);
    if (products[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `Tidak dapat menghapus kategori yang memiliki ${products[0].count} produk. Pindahkan atau hapus produk terlebih dahulu.`,
      });
    }

    await pool.query('DELETE FROM categories WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Kategori berhasil dihapus',
    });
  } catch (error) {
    console.error('DeleteCategory error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

