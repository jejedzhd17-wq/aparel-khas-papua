import pool from '../config/db.js';

// ─── GET /api/admin/dashboard ─────────────────────────────────────
export const getDashboardStats = async (req, res) => {
  try {
    // 1. Total users (role: user)
    const [[{ totalUsers }]] = await pool.query("SELECT COUNT(*) as totalUsers FROM users WHERE role = 'user'");

    // 2. Total produk
    const [[{ totalProducts }]] = await pool.query('SELECT COUNT(*) as totalProducts FROM products');

    // 3. Total orders
    const [[{ totalOrders }]] = await pool.query('SELECT COUNT(*) as totalOrders FROM orders');

    // 4. Total revenue (paid/shipped/completed)
    const [[{ revenueSum }]] = await pool.query(
      "SELECT SUM(total) as revenueSum FROM orders WHERE status IN ('paid', 'shipped', 'completed')"
    );
    const totalRevenue = parseFloat(revenueSum || 0);

    // 5. Pending orders
    const [[{ pendingOrders }]] = await pool.query("SELECT COUNT(*) as pendingOrders FROM orders WHERE status = 'pending'");

    // 6. Produk stok menipis (< 5)
    const [lowStockProducts] = await pool.query(
      `SELECT p.id, p.name, p.stock, p.price,
              COALESCE((SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1),
                       (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1)) as image
       FROM products p
       WHERE p.stock < 5
       ORDER BY p.stock ASC`
    );

    // 7. Recent orders (5 terakhir)
    const [recentOrdersRows] = await pool.query(`
      SELECT o.id, o.full_name as customer, o.total, o.status, o.created_at as date
      FROM orders o
      ORDER BY o.created_at DESC
      LIMIT 5
    `);
    const recentOrders = recentOrdersRows.map(o => ({ ...o, total: parseFloat(o.total) }));

    // 8. Top Products
    const [topProducts] = await pool.query(`
      SELECT p.id, p.name, p.price, p.stock,
             c.name as category,
             COALESCE((SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1),
                      (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1)) as image,
             IFNULL(SUM(oi.quantity), 0) as salesCount
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN ('paid', 'shipped', 'completed')
      GROUP BY p.id, p.name, p.price, p.stock, c.name
      ORDER BY salesCount DESC, p.name ASC
      LIMIT 4
    `);

    // 9. Trend 7 hari terakhir
    const [trendRows] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as date,
             COUNT(*) as count,
             SUM(total) as revenue
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
        lowStockProducts,
        recentOrders,
        topProducts,
        ordersTrend,
      },
    });
  } catch (error) {
    console.error('GetDashboardStats error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};
