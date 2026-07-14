import pool from '../config/db.js';
import fs from 'fs';

// Helper: format produk dari skema Indonesia ke format frontend
const formatProduct = (p, image = null) => ({
  id: p.id,
  name: p.nama_produk || p.name || '',
  price: Number(p.harga || p.price || 0),
  stock: p.stok !== undefined ? p.stok : (p.stock !== undefined ? p.stock : 0),
  description: p.deskripsi || p.description || '',
  fullDescription: p.full_description || null,
  sizes: p.sizes ? p.sizes.split(',').map(s => s.trim()) : ['S', 'M', 'L', 'XL', 'XXL'],
  in_stock: p.stok > 0 || p.stock > 0 || !!p.in_stock,
  category: p.nama_kategori || p.category || null,
  categoryId: p.kategori_id || p.categoryId || p.category_id || null,
  categorySlug: p.categorySlug || null,
  image: image || p.gambar || p.image || null,
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
      SELECT p.id, p.nama_produk, p.harga, p.stok, p.deskripsi, p.gambar,
             p.kategori_id,
             c.nama_kategori,
             IFNULL((SELECT AVG(rating) FROM reviews WHERE product_id = p.id), 0) as rating,
             (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as reviewCount,
             p.created_at
      FROM products p
      LEFT JOIN categories c ON p.kategori_id = c.id
      WHERE 1=1
    `;

    const queryParams = [];

    if (search) {
      query += ' AND (p.nama_produk LIKE ? OR p.deskripsi LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      query += ' AND (c.nama_kategori LIKE ?)';
      queryParams.push(`%${category}%`);
    }

    switch (sort) {
      case 'price_asc':  query += ' ORDER BY p.harga ASC'; break;
      case 'price_desc': query += ' ORDER BY p.harga DESC'; break;
      case 'popular':    query += ' ORDER BY reviewCount DESC'; break;
      default:           query += ' ORDER BY p.created_at DESC';
    }

    query += ' LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);

    const [products] = await pool.query(query, queryParams);

    // Hitung total
    let countQuery = `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.kategori_id = c.id WHERE 1=1`;
    const countParams = [];
    if (search) { countQuery += ' AND (p.nama_produk LIKE ? OR p.deskripsi LIKE ?)'; countParams.push(`%${search}%`, `%${search}%`); }
    if (category) { countQuery += ' AND (c.nama_kategori LIKE ?)'; countParams.push(`%${category}%`); }
    const [[{ total }]] = await pool.query(countQuery, countParams);

    const productsFormatted = products.map(p => formatProduct(p, p.gambar));

    return res.status(200).json({
      success: true,
      message: 'Daftar produk berhasil diambil',
      data: productsFormatted,
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
      SELECT p.id, p.nama_produk, p.harga, p.stok, p.deskripsi, p.gambar,
             p.kategori_id,
             c.nama_kategori,
             IFNULL((SELECT AVG(rating) FROM reviews WHERE product_id = p.id), 0) as rating,
             (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as reviewCount
      FROM products p
      LEFT JOIN categories c ON p.kategori_id = c.id
      ORDER BY reviewCount DESC, p.created_at DESC
      LIMIT 8
    `);

    const productsFormatted = products.map(p => formatProduct(p, p.gambar));
    return res.status(200).json({ success: true, message: 'Produk unggulan berhasil diambil', data: productsFormatted });
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
      SELECT p.id, p.nama_produk, p.harga, p.stok, p.deskripsi, p.gambar,
             p.kategori_id, c.nama_kategori
      FROM products p
      LEFT JOIN categories c ON p.kategori_id = c.id
      WHERE p.id = ?
    `, [id]);

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    const product = products[0];
    const primaryImage = product.gambar;

    // Cek tabel reviews
    let reviews = [];
    let avgRating = 0;
    try {
      const [reviewRows] = await pool.query('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC', [id]);
      reviews = reviewRows;
      avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: 'Detail produk berhasil diambil',
      data: {
        ...formatProduct(product, primaryImage),
        images: primaryImage ? [{ id: 0, image_url: primaryImage, is_primary: 1 }] : [],
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
    const { name, price, stock, description, category_id, image } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'Nama produk dan harga harus diisi' });
    }

    let catId = category_id ? parseInt(category_id) : null;

    let imageUrl = image || null;
    if (req.file) {
      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        const base64Image = fileBuffer.toString('base64');
        imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;
        // Hapus file temporary di disk setelah dikonversi ke base64
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Failed to convert uploaded image to base64:', err);
      }
    }

    const [result] = await pool.query(
      'INSERT INTO products (nama_produk, harga, stok, deskripsi, kategori_id, gambar) VALUES (?, ?, ?, ?, ?, ?)',
      [name, parseFloat(price), parseInt(stock || 0), description || '', catId, imageUrl]
    );

    const productId = result.insertId;

    // Sinkronisasi ke product_images
    if (imageUrl) {
      try {
        await pool.query(
          'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, 1)',
          [productId, imageUrl]
        );
      } catch (err) {
        console.error('Failed to sync to product_images on create:', err);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Produk berhasil dibuat',
      data: { id: productId, name, price: parseFloat(price), stock: parseInt(stock || 0), description, category_id: catId, image: imageUrl },
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
    const { name, price, stock, description, category_id, image } = req.body;

    const [existing] = await pool.query('SELECT id FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    const updateFields = [];
    const updateValues = [];

    if (name !== undefined)        { updateFields.push('nama_produk = ?');   updateValues.push(name); }
    if (price !== undefined)       { updateFields.push('harga = ?');         updateValues.push(parseFloat(price)); }
    if (stock !== undefined)       { updateFields.push('stok = ?');          updateValues.push(parseInt(stock)); }
    if (description !== undefined) { updateFields.push('deskripsi = ?');     updateValues.push(description); }
    if (category_id !== undefined) { updateFields.push('kategori_id = ?');   updateValues.push(category_id ? parseInt(category_id) : null); }

    let imageUrl = null;
    if (req.file) {
      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        const base64Image = fileBuffer.toString('base64');
        imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;
        // Hapus file temporary di disk setelah dikonversi ke base64
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Failed to convert updated image to base64:', err);
      }
    } else if (image !== undefined) {
      imageUrl = image;
    }

    if (imageUrl !== null) {
      updateFields.push('gambar = ?');
      updateValues.push(imageUrl);
    }

    if (updateFields.length > 0) {
      updateValues.push(id);
      await pool.query(`UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);
    }

    // Sinkronisasi ke product_images jika gambar terupdate
    if (imageUrl !== null) {
      try {
        await pool.query('DELETE FROM product_images WHERE product_id = ?', [id]);
        await pool.query(
          'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, 1)',
          [id, imageUrl]
        );
      } catch (err) {
        console.error('Failed to sync to product_images on update:', err);
      }
    }

    const [updatedRows] = await pool.query(`
      SELECT p.id, p.nama_produk, p.harga, p.stok, p.deskripsi, p.gambar,
             p.kategori_id, c.nama_kategori
      FROM products p LEFT JOIN categories c ON p.kategori_id = c.id WHERE p.id = ?
    `, [id]);

    return res.status(200).json({ success: true, message: 'Produk berhasil diupdate', data: formatProduct(updatedRows[0], updatedRows[0]?.gambar) });
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

    // Hapus relasi dari product_images terlebih dahulu
    try {
      await pool.query('DELETE FROM product_images WHERE product_id = ?', [id]);
    } catch (err) {
      console.error('Failed to delete from product_images:', err);
    }

    await pool.query('DELETE FROM products WHERE id = ?', [id]);

    return res.status(200).json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (error) {
    console.error('DeleteProduct error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};
