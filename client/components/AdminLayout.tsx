import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Bell, Search, BarChart3, Package, ShoppingCart, Truck, MessageSquare, Users, Layers, Home } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: Layers, label: 'Categories', path: '/admin/categories' },
  { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
  { icon: Truck, label: 'Shipments', path: '/admin/shipments' },
  { icon: MessageSquare, label: 'Reviews', path: '/admin/reviews' },
  { icon: Users, label: 'Users', path: '/admin/users' },
];

export default function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('noken-admin');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 bg-gray-900 text-white transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:relative md:w-64 overflow-y-auto`}
      >
        {/* Logo */}
        <div className="border-b border-gray-800 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold">
              NK
            </div>
            <div>
              <h1 className="font-bold text-lg">Noken</h1>
              <p className="text-xs text-gray-400">Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium text-red-400"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-4 md:px-8">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* Search */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-6">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">Store Manager</p>
                </div>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                  A
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">
            {/* Page Header */}
            {title && (
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                {description && <p className="text-gray-600 mt-2">{description}</p>}
              </div>
            )}

            {/* Page Content */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
