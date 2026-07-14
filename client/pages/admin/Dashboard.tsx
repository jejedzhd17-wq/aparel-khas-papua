import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import { Package, ShoppingCart, DollarSign, Clock, TrendingUp, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  textColor: string;
}

interface RecentOrder {
  id: string;
  customer: string;
  total: number;
  status: string;
  date: string;
}

const STATUS_STYLE: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  dibayar:   'bg-green-100  text-green-800',
  paid:      'bg-green-100  text-green-800',
  dikirim:   'bg-blue-100   text-blue-800',
  shipped:   'bg-blue-100   text-blue-800',
  selesai:   'bg-purple-100 text-purple-800',
  completed: 'bg-purple-100 text-purple-800',
};

const STATUS_LABEL: Record<string, string> = {
  pending:   'Menunggu',
  dibayar:   'Dibayar',
  paid:      'Dibayar',
  dikirim:   'Dikirim',
  shipped:   'Dikirim',
  selesai:   'Selesai',
  completed: 'Selesai',
};

const getResolvedSrc = (raw?: string) => {
  if (!raw) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  if (raw.startsWith('/')) return raw;
  return `/uploads/${raw}`;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedAdmin = sessionStorage.getItem('noken-admin');
    if (!savedAdmin) { navigate('/admin/login'); return; }
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    const token = sessionStorage.getItem('noken-admin-token');
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        const { stats: s, recentOrders: ro, topProducts: tp, ordersTrend } = data.data;
        setStats([
          {
            title: 'Total Produk',
            value: s.totalProducts,
            icon: <Package className="w-5 h-5" />,
            color: 'text-primary',
            bgColor: 'bg-primary/10',
            textColor: 'text-primary',
          },
          {
            title: 'Total Pesanan',
            value: s.totalOrders,
            icon: <ShoppingCart className="w-5 h-5" />,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
          },
          {
            title: 'Pendapatan',
            value: `Rp ${parseFloat(s.totalRevenue || 0).toLocaleString('id-ID')}`,
            icon: <DollarSign className="w-5 h-5" />,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
          },
          {
            title: 'Belum Bayar',
            value: s.pendingOrders,
            icon: <Clock className="w-5 h-5" />,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-600',
          },
        ]);
        setRecentOrders(ro || []);
        setTopProducts(tp || []);
        setChartData(ordersTrend || []);
      } else {
        toast.error(data.message || 'Gagal memuat data dashboard');
        if (res.status === 401 || res.status === 403) navigate('/admin/login');
      }
    } catch {
      toast.error('Gagal terhubung ke server');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-gray-500">Memuat data...</p>
        </div>
      </AdminLayout>
    );
  }

  const totalRevenue7d = chartData.reduce((s, i) => s + (i.revenue || 0), 0);
  const totalOrders7d  = chartData.reduce((s, i) => s + (i.orders || 0), 0);
  const avgDaily = chartData.length > 0 ? (totalOrders7d / chartData.length).toFixed(1) : '0';

  return (
    <AdminLayout title="Dashboard" description="Ringkasan aktivitas toko Anda">

      {/* ── Stat Cards ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6"
      >
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
            className={`${stat.bgColor} rounded-xl p-4 border border-white/60 shadow-sm`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`${stat.color} opacity-80`}>{stat.icon}</div>
            </div>
            <p className="text-xs text-gray-500 font-medium truncate">{stat.title}</p>
            <p className={`text-lg sm:text-xl font-bold mt-0.5 ${stat.textColor} truncate`}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Chart + Top Products ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-gray-900">Tren Penjualan (7 Hari)</h2>
          </div>

          {chartData.length > 0 ? (
            <>
              <div className="h-44 sm:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorOrd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', border: 'none', fontSize: '11px' }}
                      labelStyle={{ color: '#10B981', fontWeight: 'bold' }}
                      itemStyle={{ color: '#F1F5F9' }}
                    />
                    <Area type="monotone" dataKey="revenue" name="Pendapatan" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                    <Area type="monotone" dataKey="orders"  name="Pesanan"    stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorOrd)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                {[
                  { label: 'Pesanan (7h)', value: totalOrders7d },
                  { label: 'Rata-rata/hari', value: avgDaily },
                  { label: 'Pendapatan', value: `Rp ${totalRevenue7d.toLocaleString('id-ID')}`, green: true },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <p className="text-[10px] text-gray-400 truncate">{item.label}</p>
                    <p className={`text-sm font-bold ${item.green ? 'text-green-600' : 'text-gray-800'} truncate`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-44 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-400">Belum ada data penjualan</p>
            </div>
          )}
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm"
        >
          <h2 className="text-sm font-bold text-gray-900 mb-4">Produk Terlaris</h2>
          <div className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-gray-400 w-4 flex-shrink-0">{i + 1}</span>
                  <img
                    src={getResolvedSrc(p.image)}
                    alt={p.name}
                    className="w-8 h-8 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=80&h=80&fit=crop'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{p.name}</p>
                    <div className="mt-1 w-full bg-gray-100 rounded-full h-1">
                      <div
                        className="bg-primary rounded-full h-1"
                        style={{ width: `${Math.min(100, (p.salesCount / 20) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-600 flex-shrink-0">{p.salesCount}x</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">Belum ada produk terjual</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Recent Orders ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Pesanan Terbaru</h2>
          <button
            onClick={() => navigate('/admin/orders')}
            className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:underline"
          >
            Lihat semua <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">Belum ada pesanan</div>
        ) : (
          <>
            {/* Mobile card view */}
            <div className="sm:hidden divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <div key={order.id} className="px-4 py-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 font-mono">#{order.id}</p>
                    <p className="text-xs text-gray-500 truncate">{order.customer || 'Pelanggan'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-gray-900">Rp {order.total.toLocaleString('id-ID')}</p>
                    <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_STYLE[order.status] || 'bg-gray-100 text-gray-700'}`}>
                      {STATUS_LABEL[order.status] || order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table view */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Order ID', 'Pelanggan', 'Total', 'Status', 'Tanggal'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono font-bold text-gray-700">#{order.id}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 max-w-[140px] truncate">{order.customer || 'Pelanggan'}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-gray-900 whitespace-nowrap">
                        Rp {order.total.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLE[order.status] || 'bg-gray-100 text-gray-700'}`}>
                          {STATUS_LABEL[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(order.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </motion.div>
    </AdminLayout>
  );
}
