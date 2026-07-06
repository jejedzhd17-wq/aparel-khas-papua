import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu, X, LogOut, Bell, Package, ShoppingCart, Truck,
  MessageSquare, Users, Layers, Home, ChevronRight, Wallet
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const navItems = [
  { icon: Home,          label: 'Dasbor',    path: '/admin/dashboard' },
  { icon: Package,       label: 'Produk',    path: '/admin/products' },
  { icon: Layers,        label: 'Kategori',  path: '/admin/categories' },
  { icon: ShoppingCart,  label: 'Pesanan',   path: '/admin/orders' },
  { icon: Truck,         label: 'Kirim',     path: '/admin/shipments' },
  { icon: MessageSquare, label: 'Ulasan',    path: '/admin/reviews' },
  { icon: Users,         label: 'Pengguna',  path: '/admin/users' },
  { icon: Wallet,        label: 'Rekening',  path: '/admin/bank-accounts' },
];

export default function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // On desktop sidebar starts open; on mobile it starts closed
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar automatically when navigating on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar on ESC key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSidebarOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('noken-admin');
    localStorage.removeItem('noken-admin-token');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100 flex overflow-hidden">

      {/* ═══════════════════════════════════════════════════
          SIDEBAR — desktop always visible, mobile slide-in
      ═══════════════════════════════════════════════════ */}
      {/* Backdrop for mobile */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-72 bg-gray-900 text-white flex flex-col shadow-2xl
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:relative lg:z-auto lg:shadow-none lg:flex-shrink-0
        `}
      >
        {/* Logo */}
        <div className="border-b border-gray-800 p-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
              NK
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">Aparel Khas Papua</h1>
              <p className="text-xs text-gray-400">Panel Admin</p>
            </div>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-0.5 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 text-sm font-medium group ${
                  active
                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="w-4 h-4 opacity-70" />}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-800 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-900/30 transition-colors text-sm font-medium text-red-400 hover:text-red-300"
          >
            <LogOut className="w-5 h-5" />
            Keluar
          </button>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════
          MAIN CONTENT AREA
      ═══════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-auto">

        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">

            {/* Left: Hamburger + Page Title */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors flex-shrink-0"
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              {title && (
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">{title}</h2>
                  {description && (
                    <p className="text-xs text-gray-500 hidden sm:block truncate">{description}</p>
                  )}
                </div>
              )}
            </div>

            {/* Right: Bell + Avatar */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-gray-900 leading-tight">Super Admin</p>
                  <p className="text-[10px] text-gray-400">Manajer Toko</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  A
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
            {/* Page Header — shown only if title passed and NOT in header (desktop only) */}
            {title && (
              <div className="mb-6 hidden lg:block">
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {description && <p className="text-gray-500 mt-1 text-sm">{description}</p>}
              </div>
            )}
            {children}
          </div>
        </main>

        {/* ═══════════════════════════════════════════════════
            BOTTOM NAVIGATION BAR — mobile only
        ═══════════════════════════════════════════════════ */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-lg">
          <div className="grid grid-cols-5 h-16">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                    active ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-primary' : ''}`} />
                  <span className={`text-[10px] font-medium ${active ? 'text-primary' : ''}`}>
                    {item.label}
                  </span>
                  {active && (
                    <span className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-t-full" style={{ position: 'relative' }} />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
