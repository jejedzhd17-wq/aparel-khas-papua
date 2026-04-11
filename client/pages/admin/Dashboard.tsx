import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Package, ShoppingCart, DollarSign, Menu, X } from 'lucide-react';

interface AdminUser {
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 8,
    totalOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const savedAdmin = localStorage.getItem('noken-admin');
    if (!savedAdmin) {
      navigate('/admin/login');
      return;
    }
    setAdmin(JSON.parse(savedAdmin));

    // Load orders from localStorage
    let ordersCount = 0;
    let totalRevenue = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('order-')) {
        const order = JSON.parse(localStorage.getItem(key) || '{}');
        ordersCount++;
        totalRevenue += order.total || 0;
      }
    }
    setStats(prev => ({
      ...prev,
      totalOrders: ordersCount,
      totalRevenue: totalRevenue,
    }));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('noken-admin');
    navigate('/admin/login');
  };

  if (!admin) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="flex items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div>
              <h1 className="text-xl font-bold text-foreground font-playfair">
                Admin Panel
              </h1>
              <p className="text-xs text-muted-foreground">Noken Papua Store</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-foreground">{admin.email}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-muted-foreground hover:text-red-600"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'block' : 'hidden'
          } md:block w-64 bg-white shadow-lg p-6 md:fixed md:h-[calc(100vh-64px)] md:overflow-y-auto`}
        >
          <nav className="space-y-2">
            <Link
              to="/admin/dashboard"
              className="block px-4 py-3 rounded-lg bg-primary text-white font-semibold transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/admin/products"
              className="block px-4 py-3 rounded-lg text-foreground hover:bg-gray-100 transition-colors font-semibold"
            >
              Produk
            </Link>
            <Link
              to="/admin/orders"
              className="block px-4 py-3 rounded-lg text-foreground hover:bg-gray-100 transition-colors font-semibold"
            >
              Pesanan
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Welcome */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground font-playfair mb-2">
                Selamat Datang, {admin.email.split('@')[0]}
              </h2>
              <p className="text-muted-foreground">
                Kelola toko Anda dari sini
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Products */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-semibold mb-1">
                      Total Produk
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats.totalProducts}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>

              {/* Total Orders */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-semibold mb-1">
                      Total Pesanan
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats.totalOrders}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-secondary" />
                  </div>
                </div>
              </div>

              {/* Total Revenue */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-semibold mb-1">
                      Total Pendapatan
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      Rp {stats.totalRevenue.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-foreground mb-4 font-playfair">
                  Manajemen Produk
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Tambah, edit, atau hapus produk dari katalog Anda.
                </p>
                <Link
                  to="/admin/products"
                  className="inline-block bg-primary text-white font-semibold px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Kelola Produk
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-foreground mb-4 font-playfair">
                  Manajemen Pesanan
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Lihat dan proses pesanan pelanggan.
                </p>
                <Link
                  to="/admin/orders"
                  className="inline-block bg-secondary text-white font-semibold px-6 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  Lihat Pesanan
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
