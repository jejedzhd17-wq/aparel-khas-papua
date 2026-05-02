import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import { Package, ShoppingCart, DollarSign, Clock, TrendingUp, Users } from 'lucide-react';

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface RecentOrder {
  id: string;
  customer: string;
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'completed';
  date: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    // Check if admin is logged in
    const savedAdmin = localStorage.getItem('noken-admin');
    if (!savedAdmin) {
      navigate('/admin/login');
      return;
    }

    // Load dashboard data
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = () => {
    // Mock stats
    const mockStats: StatCard[] = [
      {
        title: 'Total Products',
        value: '48',
        icon: <Package className="w-6 h-6" />,
        color: 'text-primary',
        bgColor: 'bg-primary/10',
      },
      {
        title: 'Total Orders',
        value: '156',
        icon: <ShoppingCart className="w-6 h-6" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
      },
      {
        title: 'Total Revenue',
        value: 'Rp 45.2M',
        icon: <DollarSign className="w-6 h-6" />,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      },
      {
        title: 'Pending Orders',
        value: '12',
        icon: <Clock className="w-6 h-6" />,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
      },
    ];

    const mockOrders: RecentOrder[] = [
      {
        id: 'ORD-001',
        customer: 'Budi Santoso',
        total: 450000,
        status: 'completed',
        date: '2024-01-20',
      },
      {
        id: 'ORD-002',
        customer: 'Siti Nurhaliza',
        total: 899000,
        status: 'shipped',
        date: '2024-01-19',
      },
      {
        id: 'ORD-003',
        customer: 'Ahmad Wijaya',
        total: 299000,
        status: 'paid',
        date: '2024-01-18',
      },
      {
        id: 'ORD-004',
        customer: 'Dewi Lestari',
        total: 599000,
        status: 'pending',
        date: '2024-01-17',
      },
      {
        id: 'ORD-005',
        customer: 'Rinto Harahap',
        total: 1200000,
        status: 'completed',
        date: '2024-01-16',
      },
    ];

    setStats(mockStats);
    setRecentOrders(mockOrders);
  };

  const statusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout title="Dashboard" description="Welcome to your admin dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`${stat.bgColor} rounded-lg p-6 border border-gray-200`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color}`}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Orders Trend (Last 7 Days)
            </h2>
          </div>

          {/* Simple bar chart visualization */}
          <div className="h-64 flex items-end justify-around gap-2 bg-gray-50 p-4 rounded-lg">
            {[45, 52, 48, 61, 55, 67, 72].map((value, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center flex-1"
                style={{ height: '100%' }}
              >
                <div
                  className="w-full bg-gradient-to-t from-primary to-primary/50 rounded-t-lg transition-all"
                  style={{ height: `${(value / 100) * 100}%` }}
                />
                <span className="text-xs text-gray-600 mt-2">Day {idx + 1}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p className="text-gray-600">Total Orders</p>
              <p className="text-xl font-bold text-gray-900">400</p>
            </div>
            <div>
              <p className="text-gray-600">Avg Orders/Day</p>
              <p className="text-xl font-bold text-gray-900">57</p>
            </div>
            <div>
              <p className="text-gray-600">Growth</p>
              <p className="text-xl font-bold text-green-600">+18%</p>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Top Products</h2>
          <div className="space-y-4">
            {[
              { name: 'Kaos Raja Ampat', sales: 145 },
              { name: 'Hoodie Papua', sales: 98 },
              { name: 'Tas Noken', sales: 87 },
              { name: 'Gelang Tradisional', sales: 62 },
            ].map((product, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2"
                      style={{ width: `${(product.sales / 150) * 100}%` }}
                    />
                  </div>
                </div>
                <p className="ml-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                  {product.sales}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-900">
                  Order ID
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-900">
                  Customer
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-900">
                  Total
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-900">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-900">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{order.customer}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    Rp {order.total.toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
