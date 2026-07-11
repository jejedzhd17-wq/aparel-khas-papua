import pool from '../config/db.js';

// Helper: ambil primary image dari product_images
const getPrimaryImage = async (productId) => {
  const [imgs] = await pool.query(
    'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, id ASC LIMIT 1',
    [productId]
  );
  return imgs.length > 0 ? imgs[0].image_url : null;
};

// Helper: format produk dengan gambar
const formatProduct = (p, image = null) => ({
  id: p.id,
  name: p.name,
  price: Number(p.price),
  stock: p.stock,
  description: p.description,
  fullDescription: p.full_description || null,
  sizes: p.sizes ? p.sizes.split(',').map(s => s.trim()) : ['S', 'M', 'L', 'XL', 'XXL'],
  in_stock: !!p.in_stock,
  category: p.category || null,
  categoryId: p.categoryId || p.category_id || null,
  categorySlug: p.categorySlug || null,
  image: image || p.image || null,
  rating: Number(p.rating || 0),
  reviewCount: Number(p.reviewCount || 0),
  createdAt: p.created_at,
});

// ─── GET /api/products ────────────────────────────────────────────
export const getAllProducts = async (req, res) => {
  try {
    const { search, category, sort = 'newest', limit = 50, page = 1 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT p.id, p.name, p.price, p.stock, p.description, p.full_description,
             p.sizes, p.in_stock, p.category_id,
             c.name as category, c.id as categoryId, c.slug as categorySlug,
             IFNULL((SELECT AVG(rating) FROM reviews WHERE product_id = p.id), 0) as rating,
             (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as reviewCount,
             p.created_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;

    const queryParams = [];

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      query += ' AND (c.name LIKE ? OR c.slug LIKE ?)';
      queryParams.push(`%${category}%`, `%${category}%`);
    }

    switch (sort) {
      case 'price_asc':  query += ' ORDER BY p.price ASC'; break;
      case 'price_desc': query += ' ORDER BY p.price DESC'; break;
      case 'popular':    query += ' ORDER BY reviewCount DESC'; break;
      default:           query += ' ORDER BY p.created_at DESC';
    }

    query += ' LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);

    const [products] = await pool.query(query, queryParams);

    // Count query
    let countQuery = `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1`;
    const countParams = [];
    if (search) { countQuery += ' AND (p.name LIKE ? OR p.description LIKE ?)'; countParams.push(`%${search}%`, `%${search}%`); }
    if (category) { countQuery += ' AND (c.name LIKE ? OR c.slug LIKE ?)'; countParams.push(`%${category}%`, `%${category}%`); }
    const [[{ total }]] = await pool.query(countQuery, countParams);

    // Resolve images
    const productsWithImages = await Promise.all(products.map(async (p) => {
      const image = await getPrimaryImage(p.id);
      return formatProduct(p, image);
    }));

    return res.status(200).json({
      success: true,
      message: 'Daftar produk berhasil diambil',
      data: productsWithImages,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    console.error('GetAllProducts error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ─── GET /api/products/featured ───────────────────────────────────
export const getFeaturedProducts = async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT p.id, p.name, p.price, p.stock, p.description, p.full_description,
             p.sizes, p.in_stock, p.category_id,
             c.name as category, c.id as categoryId, c.slug as categorySlug,
             IFNULL((SELECT AVG(rating) FROM reviews WHERE product_id = p.id), 0) as rating,
             (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as reviewCount
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY reviewCount DESC, p.created_at DESC
      LIMIT 8
    `);

    const productsWithImages = await Promise.all(products.map(async (p) => {
      const image = await getPrimaryImage(p.id);
      return formatProduct(p, image);
    }));

    return res.status(200).json({ success: true, message: 'Produk unggulan berhasil diambil', data: productsWithImages });
  } catch (error) {
    console.error('GetFeaturedProducts error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ─── GET /api/products/:id ────────────────────────────────────────
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await pool.query(`
      SELECT p.id, p.name, p.price, p.stock, p.description, p.full_description,
             p.sizes, p.in_stock, p.category_id,
             c.name as category, c.id as categoryId, c.slug as categorySlug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [id]);

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    const product = products[0];

    // Ambil semua gambar produk
    const [imgRows] = await pool.query('SELECT id, image_url, is_primary FROM product_images WHERE product_id = ? ORDER BY is_primary DESC', [id]);
    const images = imgRows;
    const primaryImage = images.length > 0 ? images[0].image_url : null;

    // Ambil reviews
    const [reviews] = await pool.query('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC', [id]);
    const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

    return res.status(200).json({
      success: true,
      message: 'Detail produk berhasil diambil',
      data: {
        ...formatProduct(product, primaryImage),
        images,
        reviews,
        rating: avgRating,
        reviewCount: reviews.length,
      },
    });
  } catch (error) {
    console.error('GetProductById error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ─── POST /api/products (admin) ───────────────────────────────────
export const createProduct = async (req, res) => {
  try {
    const { name, price, stock, description, full_description, category, category_id, image, sizes } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'Nama produk dan harga harus diisi' });
    }

    let catId = category_id;
    if (!catId && category) {
      const [catRows] = await pool.query('SELECT id FROM categories WHERE name LIKE ? OR slug LIKE ? LIMIT 1', [`%${category}%`, `%${category}%`]);
      if (catRows.length > 0) catId = catRows[0].id;
    }

    let imageUrl = image || null;
    if (req.file) imageUrl = `/uploads/${req.file.filename}`;

    const sizesStr = Array.isArray(sizes) ? sizes.join(',') : (sizes || 'S,M,L,XL,XXL');

    const [result] = await pool.query(
      'INSERT INTO products (name, price, stock, description, full_description, category_id, sizes, in_stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, parseFloat(price), parseInt(stock || 0), description || '', full_description || '', catId ? parseInt(catId) : null, sizesStr, parseInt(stock || 0) > 0 ? 1 : 0]
    );

    const productId = result.insertId;

    if (imageUrl) {
      await pool.query('INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)', [productId, imageUrl, 1]);
    }

    return res.status(201).json({
      success: true,
      message: 'Produk berhasil dibuat',
      data: { id: productId, name, price: parseFloat(price), stock: parseInt(stock || 0), description, category },
    });
  } catch (error) {
    console.error('CreateProduct error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ─── PUT /api/products/:id (admin) ────────────────────────────────
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, description, full_description, category, category_id, image, sizes } = req.body;

    const [existing] = await pool.query('SELECT id FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    let catId = category_id;
    if (!catId && category) {
      const [catRows] = await pool.query('SELECT id FROM categories WHERE name LIKE ? LIMIT 1', [`%${category}%`]);
      if (catRows.length > 0) catId = catRows[0].id;
    }

    const updateFields = [];
    const updateValues = [];

    if (name)                   { updateFields.push('name = ?');             updateValues.push(name); }
    if (price !== undefined)    { updateFields.push('price = ?');            updateValues.push(parseFloat(price)); }
    if (stock !== undefined)    { updateFields.push('stock = ?', 'in_stock = ?'); updateValues.push(parseInt(stock), parseInt(stock) > 0 ? 1 : 0); }
    if (description !== undefined)  { updateFields.push('description = ?');      updateValues.push(description); }
    if (full_description !== undefined) { updateFields.push('full_description = ?'); updateValues.push(full_description); }
    if (catId)                  { updateFields.push('category_id = ?');      updateValues.push(parseInt(catId)); }
    if (sizes)                  { const s = Array.isArray(sizes) ? sizes.join(',') : sizes; updateFields.push('sizes = ?'); updateValues.push(s); }

    let imageUrl = null;
    if (req.file) imageUrl = `/uploads/${req.file.filename}`;
    else if (image !== undefined) imageUrl = image;

    if (updateFields.length > 0) {
      updateValues.push(id);
      await pool.query(`UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);
    }

    if (imageUrl) {
      const [imgExist] = await pool.query('SELECT id FROM product_images WHERE product_id = ? AND image_url = ?', [id, imageUrl]);
      if (imgExist.length === 0) {
        await pool.query('INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)', [id, imageUrl, 0]);
      }
    }

    const [updatedRows] = await pool.query(`
      SELECT p.id, p.name, p.price, p.stock, p.description, p.full_description, p.sizes, p.in_stock,
             c.name as category
      FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?
    `, [id]);

    const primaryImage = await getPrimaryImage(id);

    return res.status(200).json({ success: true, message: 'Produk berhasil diupdate', data: formatProduct(updatedRows[0], primaryImage) });
  } catch (error) {
    console.error('UpdateProduct error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ─── DELETE /api/products/:id (admin) ─────────────────────────────
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    // product_images hapus otomatis via FK CASCADE
    await pool.query('DELETE FROM products WHERE id = ?', [id]);

    return res.status(200).json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (error) {
    console.error('DeleteProduct error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};
