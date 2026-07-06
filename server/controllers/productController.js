import pool from '../config/db.js';

// Helper: cek apakah tabel product_images ada
const hasProductImagesTable = async () => {
  try {
    const [rows] = await pool.query("SHOW TABLES LIKE 'product_images'");
    return rows.length > 0;
  } catch {
    return false;
  }
};

// Helper: ambil gambar dari kolom gambar atau tabel product_images
const resolveImage = async (productId, fallbackGambar) => {
  const hasPITable = await hasProductImagesTable();
  if (hasPITable) {
    const [imgs] = await pool.query(
      'SELECT url_gambar FROM product_images WHERE product_id = ? LIMIT 1',
      [productId]
    );
    if (imgs.length > 0) return imgs[0].url_gambar;
  }
  return fallbackGambar || null;
};

// ─── GET /api/products ────────────────────────────────────────────
export const getAllProducts = async (req, res) => {
  try {
    const { search, category, sort = 'newest', limit = 50, page = 1 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT p.id, 
             p.nama_produk as name, 
             p.harga as price, 
             p.stok as stock, 
             p.deskripsi as description,
             p.gambar as image,
             c.nama_kategori as category, 
             c.id as categoryId,
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
      query += ' AND c.nama_kategori LIKE ?';
      queryParams.push(`%${category}%`);
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        query += ' ORDER BY p.harga ASC';
        break;
      case 'price_desc':
        query += ' ORDER BY p.harga DESC';
        break;
      case 'popular':
        query += ' ORDER BY reviewCount DESC';
        break;
      default:
        query += ' ORDER BY p.created_at DESC';
    }

    query += ' LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);

    const [products] = await pool.query(query, queryParams);

    // Hitung total untuk pagination
    let countQuery = `
      SELECT COUNT(*) as total FROM products p
      LEFT JOIN categories c ON p.kategori_id = c.id
      WHERE 1=1
    `;
    const countParams = [];
    if (search) {
      countQuery += ' AND (p.nama_produk LIKE ? OR p.deskripsi LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      countQuery += ' AND c.nama_kategori LIKE ?';
      countParams.push(`%${category}%`);
    }

    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;

    // Resolve gambar dari product_images jika ada, fallback ke kolom gambar
    const hasPITable = await hasProductImagesTable();
    const productsWithImages = await Promise.all(products.map(async (p) => {
      let image = p.image;
      if (hasPITable) {
        const [imgs] = await pool.query(
          'SELECT url_gambar FROM product_images WHERE product_id = ? LIMIT 1',
          [p.id]
        );
        if (imgs.length > 0) image = imgs[0].url_gambar;
      }
      return { ...p, image };
    }));

    return res.status(200).json({
      success: true,
      message: 'Daftar produk berhasil diambil',
      data: productsWithImages,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('GetAllProducts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// ─── GET /api/products/featured ───────────────────────────────────
export const getFeaturedProducts = async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT p.id, 
             p.nama_produk as name, 
             p.harga as price, 
             p.stok as stock, 
             p.deskripsi as description,
             p.gambar as image,
             c.nama_kategori as category, 
             c.id as categoryId,
             IFNULL((SELECT AVG(rating) FROM reviews WHERE product_id = p.id), 0) as rating,
             (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as reviewCount
      FROM products p
      LEFT JOIN categories c ON p.kategori_id = c.id
      ORDER BY reviewCount DESC, p.created_at DESC
      LIMIT 8
    `);

    const hasPITable = await hasProductImagesTable();
    const productsWithImages = await Promise.all(products.map(async (p) => {
      let image = p.image;
      if (hasPITable) {
        const [imgs] = await pool.query(
          'SELECT url_gambar FROM product_images WHERE product_id = ? LIMIT 1',
          [p.id]
        );
        if (imgs.length > 0) image = imgs[0].url_gambar;
      }
      return { ...p, image };
    }));

    return res.status(200).json({
      success: true,
      message: 'Produk unggulan berhasil diambil',
      data: productsWithImages,
    });
  } catch (error) {
    console.error('GetFeaturedProducts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// ─── GET /api/products/:id ────────────────────────────────────────
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await pool.query(`
      SELECT p.id, 
             p.nama_produk as name, 
             p.harga as price, 
             p.stok as stock, 
             p.deskripsi as description,
             p.gambar as image,
             c.nama_kategori as category, 
             c.id as categoryId
      FROM products p
      LEFT JOIN categories c ON p.kategori_id = c.id
      WHERE p.id = ?
    `, [id]);

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan',
      });
    }

    const product = products[0];

    // Ambil semua gambar produk jika ada tabel product_images
    let images = [];
    let primaryImage = product.image;
    const hasPITable = await hasProductImagesTable();
    if (hasPITable) {
      const [imgRows] = await pool.query(
        'SELECT id, url_gambar FROM product_images WHERE product_id = ?',
        [id]
      );
      images = imgRows.map(r => ({ ...r, image_url: r.url_gambar }));
      if (images.length > 0) {
        primaryImage = images[0].url_gambar;
      }
    }

    // Default ukuran
    const sizes = ['S', 'M', 'L', 'XL'];

    return res.status(200).json({
      success: true,
      message: 'Detail produk berhasil diambil',
      data: {
        ...product,
        image: primaryImage,
        sizes,
        images,
        in_stock: product.stock > 0,
        rating: 0,
        reviewCount: 0,
      },
    });
  } catch (error) {
    console.error('GetProductById error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// ─── POST /api/products (admin) ───────────────────────────────────
export const createProduct = async (req, res) => {
  try {
    const { name, price, stock, description, category, category_id, image } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Nama produk dan harga harus diisi',
      });
    }

    // Cari category_id dari nama kategori jika dikirim sebagai string
    let katId = category_id;
    if (!katId && category) {
      const [catRows] = await pool.query(
        'SELECT id FROM categories WHERE nama_kategori LIKE ? LIMIT 1',
        [`%${category}%`]
      );
      if (catRows.length > 0) katId = catRows[0].id;
    }

    // Tentukan gambar dari upload file atau URL
    let gambar = image || '';
    if (req.file) {
      gambar = `/uploads/${req.file.filename}`;
    }

    const [result] = await pool.query(
      `INSERT INTO products (nama_produk, harga, stok, deskripsi, kategori_id, gambar)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name,
        parseFloat(price),
        parseInt(stock || 0),
        description || '',
        katId ? parseInt(katId) : null,
        gambar,
      ]
    );

    const productId = result.insertId;

    // Juga simpan ke product_images jika tabel ada dan ada gambar
    if (gambar) {
      const hasPITable = await hasProductImagesTable();
      if (hasPITable) {
        await pool.query(
          'INSERT INTO product_images (product_id, url_gambar) VALUES (?, ?)',
          [productId, gambar]
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Produk berhasil dibuat',
      data: { id: productId, name, price, stock, description, category },
    });
  } catch (error) {
    console.error('CreateProduct error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// ─── PUT /api/products/:id (admin) ────────────────────────────────
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, description, category, category_id, image } = req.body;

    const [existing] = await pool.query('SELECT id FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan',
      });
    }

    // Cari category_id dari nama kategori jika dikirim sebagai string
    let katId = category_id;
    if (!katId && category) {
      const [catRows] = await pool.query(
        'SELECT id FROM categories WHERE nama_kategori LIKE ? LIMIT 1',
        [`%${category}%`]
      );
      if (catRows.length > 0) katId = catRows[0].id;
    }

    const updateFields = [];
    const updateValues = [];

    if (name) { updateFields.push('nama_produk = ?'); updateValues.push(name); }
    if (price !== undefined) { updateFields.push('harga = ?'); updateValues.push(parseFloat(price)); }
    if (stock !== undefined) { updateFields.push('stok = ?'); updateValues.push(parseInt(stock)); }
    if (description !== undefined) { updateFields.push('deskripsi = ?'); updateValues.push(description); }
    if (katId) { updateFields.push('kategori_id = ?'); updateValues.push(parseInt(katId)); }

    // Tentukan gambar dari upload file atau URL
    let gambar = null;
    if (req.file) {
      gambar = `/uploads/${req.file.filename}`;
    } else if (image !== undefined) {
      gambar = image;
    }

    if (gambar !== null) {
      updateFields.push('gambar = ?');
      updateValues.push(gambar);
    }

    if (updateFields.length > 0) {
      updateValues.push(id);
      await pool.query(`UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);
    }

    // Update product_images jika tabel ada dan ada gambar baru
    if (gambar) {
      const hasPITable = await hasProductImagesTable();
      if (hasPITable) {
        // Cek apakah sudah ada gambar untuk produk ini
        const [imgExist] = await pool.query(
          'SELECT id FROM product_images WHERE product_id = ? AND url_gambar = ?',
          [id, gambar]
        );
        if (imgExist.length === 0) {
          await pool.query(
            'INSERT INTO product_images (product_id, url_gambar) VALUES (?, ?)',
            [id, gambar]
          );
        }
      }
    }

    const [updated] = await pool.query(`
      SELECT p.id, p.nama_produk as name, p.harga as price, p.stok as stock, p.deskripsi as description,
             p.gambar as image,
             c.nama_kategori as category
      FROM products p
      LEFT JOIN categories c ON p.kategori_id = c.id
      WHERE p.id = ?
    `, [id]);

    return res.status(200).json({
      success: true,
      message: 'Produk berhasil diupdate',
      data: updated[0],
    });
  } catch (error) {
    console.error('UpdateProduct error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// ─── DELETE /api/products/:id (admin) ─────────────────────────────
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan',
      });
    }

    // Hapus gambar produk dulu (jika tabel ada)
    const hasPITable = await hasProductImagesTable();
    if (hasPITable) {
      await pool.query('DELETE FROM product_images WHERE product_id = ?', [id]);
    }
    await pool.query('DELETE FROM products WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Produk berhasil dihapus',
    });
  } catch (error) {
    console.error('DeleteProduct error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};
