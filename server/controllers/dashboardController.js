import pool from '../config/db.js';

// ─── GET /api/admin/dashboard (Dashboard stats & trends) ──────────
export const getDashboardStats = async (req, res) => {
  try {
    // 1. Hitung total users (role: user)
    const [userCount] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
    const totalUsers = userCount[0].count;

    // 2. Hitung total produk
    const [productCount] = await pool.query('SELECT COUNT(*) as count FROM products');
    const totalProducts = productCount[0].count;

    // 3. Hitung total orders
    const [orderCount] = await pool.query('SELECT COUNT(*) as count FROM orders');
    const totalOrders = orderCount[0].count;

    // 4. Hitung total revenue (dari order yang statusnya paid, shipped, completed, dibayar, dikirim, selesai)
    const [revenueSum] = await pool.query("SELECT SUM(total_harga) as sum FROM orders WHERE status IN ('paid', 'shipped', 'completed', 'dibayar', 'dikirim', 'selesai')");
    const totalRevenue = parseFloat(revenueSum[0].sum || 0);

    // 5. Hitung pending orders
    const [pendingCount] = await pool.query("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'");
    const pendingOrders = pendingCount[0].count;

    // 6. Produk dengan stok menipis (low stock < 5)
    const [lowStockProducts] = await pool.query('SELECT id, nama_produk as name, stok as stock, harga as price FROM products WHERE stok < 5 ORDER BY stok ASC');

    // 7. Recent orders (5 transaksi terakhir)
    const [recentOrdersRows] = await pool.query(`
      SELECT o.id, 
             COALESCE(u.nama, SUBSTRING_INDEX(o.alamat_pengiriman, '\n', 1)) as customer, 
             o.total_harga as total, 
             o.status, 
             o.created_at as date
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);
    const recentOrders = recentOrdersRows.map(o => ({
      ...o,
      total: parseFloat(o.total)
    }));

    // 8. Top Products (berdasarkan total kuantitas terjual di order_items)
    const [topProducts] = await pool.query(`
      SELECT p.id, p.nama_produk as name, p.harga as price, p.stok as stock, p.gambar as image, c.nama_kategori as category,
             IFNULL(SUM(oi.jumlah), 0) as salesCount
      FROM products p
      LEFT JOIN categories c ON p.kategori_id = c.id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN ('paid', 'shipped', 'completed', 'dibayar', 'dikirim', 'selesai')
      GROUP BY p.id
      ORDER BY salesCount DESC, p.nama_produk ASC
      LIMIT 4
    `);

    // 9. Trend Orders 7 Hari Terakhir
    const [trendRows] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as date, 
             COUNT(*) as count, 
             SUM(total_harga) as revenue
      FROM orders
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
      ORDER BY date ASC
    `);

    // Format trend orders agar selalu ada 7 hari terakhir, walaupun tidak ada order
    const trendMap = new Map(trendRows.map(r => [r.date, { count: r.count, revenue: parseFloat(r.revenue || 0) }]));
    const ordersTrend = [];
    const daysName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = daysName[d.getDay()];

      const data = trendMap.get(dateStr) || { count: 0, revenue: 0 };
      ordersTrend.push({
        date: dateStr,
        day: dayName,
        orders: data.count,
        revenue: data.revenue
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Dashboard stats berhasil diambil',
      data: {
        stats: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue,
          pendingOrders,
        },
        lowStockProducts,
        recentOrders,
        topProducts,
        ordersTrend,
      },
    });
  } catch (error) {
    console.error('GetDashboardStats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};
