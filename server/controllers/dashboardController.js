import pool from '../config/db.js';

// Mapping Status Orders dari database (dibayar/dikirim/selesai/ditolak/pending) ke format frontend (paid/shipped/completed/cancelled/pending)
const mapStatusToFrontend = (dbStatus) => {
  switch (dbStatus) {
    case 'dibayar': return 'paid';
    case 'dikirim': return 'shipped';
    case 'selesai': return 'completed';
    case 'ditolak': return 'cancelled';
    default: return 'pending';
  }
};

// ─── GET /api/admin/dashboard ─────────────────────────────────────
export const getDashboardStats = async (req, res) => {
  try {
    // 1. Total users (role: user)
    const [[{ totalUsers }]] = await pool.query("SELECT COUNT(*) as totalUsers FROM users WHERE role = 'user'");

    // 2. Total produk
    const [[{ totalProducts }]] = await pool.query('SELECT COUNT(*) as totalProducts FROM products');

    // 3. Total orders
    const [[{ totalOrders }]] = await pool.query('SELECT COUNT(*) as totalOrders FROM orders');

    // 4. Total revenue (dibayar/dikirim/selesai)
    const [[{ revenueSum }]] = await pool.query(
      "SELECT SUM(total_harga) as revenueSum FROM orders WHERE status IN ('dibayar', 'dikirim', 'selesai')"
    );
    const totalRevenue = parseFloat(revenueSum || 0);

    // 5. Pending orders
    const [[{ pendingOrders }]] = await pool.query("SELECT COUNT(*) as pendingOrders FROM orders WHERE status = 'pending'");

    // 6. Produk stok menipis (< 5)
    const [lowStockProducts] = await pool.query(
      `SELECT p.id, p.nama_produk as name, p.stok as stock, p.harga as price, p.gambar as image
       FROM products p
       WHERE p.stok < 5
       ORDER BY p.stok ASC`
    );

    // Format harga & stok untuk lowStockProducts
    const lowStockFormatted = lowStockProducts.map(p => ({
      ...p,
      price: Number(p.price),
      stock: Number(p.stock)
    }));

    // 7. Recent orders (5 terakhir)
    const [recentOrdersRows] = await pool.query(`
      SELECT o.id, o.alamat_pengiriman, o.total_harga as total, o.status, o.created_at as date
      FROM orders o
      ORDER BY o.created_at DESC
      LIMIT 5
    `);
    
    const recentOrders = recentOrdersRows.map(o => {
      const lines = (o.alamat_pengiriman || '').split('\n');
      const customer = lines[0] || 'Pembeli';
      return {
        id: String(o.id),
        customer,
        total: parseFloat(o.total || 0),
        status: mapStatusToFrontend(o.status),
        date: o.date
      };
    });

    // 8. Top Products
    const [topProducts] = await pool.query(`
      SELECT p.id, p.nama_produk as name, p.harga as price, p.stok as stock,
             c.nama_kategori as category, p.gambar as image,
             IFNULL(SUM(oi.jumlah), 0) as salesCount
      FROM products p
      LEFT JOIN categories c ON p.kategori_id = c.id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN ('dibayar', 'dikirim', 'selesai')
      GROUP BY p.id, p.nama_produk, p.harga, p.stok, c.nama_kategori, p.gambar
      ORDER BY salesCount DESC, p.nama_produk ASC
      LIMIT 4
    `);

    const topProductsFormatted = topProducts.map(p => ({
      ...p,
      price: Number(p.price),
      stock: Number(p.stock),
      salesCount: Number(p.salesCount)
    }));

    // 9. Trend 7 hari terakhir
    const [trendRows] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as date,
             COUNT(*) as count,
             SUM(total_harga) as revenue
      FROM orders
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
      ORDER BY date ASC
    `);

    const trendMap  = new Map(trendRows.map(r => [r.date, { count: r.count, revenue: parseFloat(r.revenue || 0) }]));
    const daysName  = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const ordersTrend = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const data    = trendMap.get(dateStr) || { count: 0, revenue: 0 };
      ordersTrend.push({ date: dateStr, day: daysName[d.getDay()], orders: data.count, revenue: data.revenue });
    }

    return res.status(200).json({
      success: true,
      message: 'Dashboard stats berhasil diambil',
      data: {
        stats: { totalUsers, totalProducts, totalOrders, totalRevenue, pendingOrders },
        lowStockProducts: lowStockFormatted,
        recentOrders,
        topProducts: topProductsFormatted,
        ordersTrend,
      },
    });
  } catch (error) {
    console.error('GetDashboardStats error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};
