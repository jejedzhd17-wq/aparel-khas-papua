import pool from '../config/db.js';

// ─── GET /api/categories ──────────────────────────────────────────
export const getAllCategories = async (req, res) => {
  try {
    const [categories] = await pool.query(`
      SELECT c.id, c.name, c.slug, c.description, c.icon,
             COUNT(p.id) as productCount
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id, c.name, c.slug, c.description, c.icon
      ORDER BY c.name ASC
    `);

    return res.status(200).json({
      success: true,
      message: 'Daftar kategori berhasil diambil',
      data: categories,
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

    const [categories] = await pool.query(
      'SELECT id, name, slug, description, icon FROM categories WHERE slug = ?',
      [slug]
    );

    if (categories.length === 0) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    }

    const category = categories[0];

    const [products] = await pool.query(`
      SELECT p.id, p.name, p.price, p.stock, p.description,
             c.name as category, c.slug as categorySlug,
             COALESCE((SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1),
                      (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1)) as image,
             IFNULL((SELECT AVG(rating) FROM reviews WHERE product_id = p.id), 0) as rating,
             (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as reviewCount,
             p.in_stock, p.sizes
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ?
      ORDER BY p.created_at DESC
    `, [category.id]);

    return res.status(200).json({
      success: true,
      message: 'Data kategori berhasil diambil',
      data: { ...category, products },
    });
  } catch (error) {
    console.error('GetCategoryBySlug error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ─── POST /api/categories (admin) ────────────────────────────────
export const createCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama kategori harus diisi' });
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const [existing] = await pool.query('SELECT id FROM categories WHERE LOWER(name) = ?', [name.toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Kategori dengan nama ini sudah ada' });
    }

    const [result] = await pool.query(
      'INSERT INTO categories (name, slug, description, icon) VALUES (?, ?, ?, ?)',
      [name, slug, description || '', icon || '🛍️']
    );

    return res.status(201).json({
      success: true,
      message: 'Kategori berhasil dibuat',
      data: { id: result.insertId, name, slug, description: description || '', icon: icon || '🛍️' },
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
    const { name, description, icon } = req.body;

    const [existing] = await pool.query('SELECT id FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    }

    const updateFields = [];
    const updateValues = [];

    if (name) {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      updateFields.push('name = ?', 'slug = ?');
      updateValues.push(name, slug);
    }
    if (description !== undefined) { updateFields.push('description = ?'); updateValues.push(description); }
    if (icon !== undefined) { updateFields.push('icon = ?'); updateValues.push(icon); }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada data yang diupdate' });
    }

    updateValues.push(id);
    await pool.query(`UPDATE categories SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);

    const [updated] = await pool.query('SELECT id, name, slug, description, icon FROM categories WHERE id = ?', [id]);

    return res.status(200).json({ success: true, message: 'Kategori berhasil diupdate', data: updated[0] });
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

    const [[{ count }]] = await pool.query('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [id]);
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
