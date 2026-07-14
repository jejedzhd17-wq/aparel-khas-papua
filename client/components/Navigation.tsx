import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { useWishlist } from '@/context/WishlistContext';

interface User {
  name: string;
  email: string;
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { items } = useCart();
  useTheme();
  const { items: wishlistItems } = useWishlist();
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<User | null>(null);
  const location = useLocation();

  useEffect(() => {
    const loadUser = () => {
      const savedUser = localStorage.getItem('noken-user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        setUser(null);
      }
      const savedAdmin = sessionStorage.getItem('noken-admin');
      if (savedAdmin) {
        setAdmin(JSON.parse(savedAdmin));
      } else {
        setAdmin(null);
      }
    };

    loadUser();

    window.addEventListener('noken-login', loadUser);
    window.addEventListener('storage', loadUser);
    return () => {
      window.removeEventListener('noken-login', loadUser);
      window.removeEventListener('storage', loadUser);
    };
  }, []);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    const isAdmin = !!admin;
    localStorage.removeItem('noken-user');
    localStorage.removeItem('noken-token');
    sessionStorage.removeItem('noken-admin');
    sessionStorage.removeItem('noken-admin-token');
    setUser(null);
    setAdmin(null);
    setIsOpen(false);
    window.location.href = isAdmin ? '/admin/login' : '/';
  };

  const navLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/shop', label: 'Shop' },
    { href: '/shipment-tracking', label: 'Lacak Paket' },
    { href: '/about', label: 'Tentang' },
    { href: '/contact', label: 'Kontak' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="">
              <img src='/cendrawasih.png' alt="Logo" className="w-6 h-6" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg text-foreground">Aparel Papua</h1>
              <p className="text-xs text-muted-foreground">Store</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`transition-colors duration-200 text-sm font-medium ${
                    isActive ? 'text-primary font-semibold' : 'text-foreground hover:text-primary'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* User Menu */}
            {admin ? (
              <div className="flex items-center gap-3 pl-8 border-l border-gray-200">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white font-bold">
                  {admin.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-foreground">{admin.name} (Admin)</p>
                  <div className="flex items-center gap-2">
                    <Link
                      to="/admin/orders"
                      className="text-xs text-primary hover:underline transition-colors font-medium"
                    >
                      Panel Admin
                    </Link>
                    <span className="text-xs text-gray-300">|</span>
                    <button
                      onClick={handleLogout}
                      className="text-xs text-muted-foreground hover:text-red-600 transition-colors"
                    >
                      Keluar
                    </button>
                  </div>
                </div>
              </div>
            ) : user ? (
              <div className="flex items-center gap-3 pl-8 border-l border-gray-200">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-foreground">{user.name}</p>
                  <div className="flex items-center gap-2">
                    <Link
                      to="/order-history"
                      className="text-xs text-primary hover:underline transition-colors font-medium"
                    >
                      Riwayat
                    </Link>
                    <span className="text-xs text-gray-300">|</span>
                    <button
                      onClick={handleLogout}
                      className="text-xs text-muted-foreground hover:text-red-600 transition-colors"
                    >
                      Keluar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 pl-8 border-l border-gray-200">
                <Link
                  to="/login"
                  className="text-foreground font-medium hover:text-primary transition-colors text-sm"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-white font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">

            <Link
              to="/wishlist"
              className="relative p-2 text-foreground hover:text-primary transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="relative p-2 text-foreground hover:text-primary transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-accent rounded-full text-white text-xs flex items-center justify-center font-bold">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`block px-4 py-2 hover:bg-gray-50 transition-colors text-sm font-medium ${
                    isActive ? 'text-primary bg-primary/5 font-semibold' : 'text-foreground hover:text-primary'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Mobile User Menu */}
            <div className="border-t border-gray-200 mt-2 pt-2">
              {admin ? (
                <>
                  <div className="px-4 py-3 bg-gray-50">
                    <p className="font-semibold text-foreground text-sm">{admin.name} (Admin)</p>
                    <p className="text-xs text-muted-foreground">{admin.email}</p>
                  </div>
                  <Link
                    to="/admin/orders"
                    className="block px-4 py-2 text-primary hover:bg-gray-50 font-medium text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    Panel Admin
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 font-medium text-sm"
                  >
                    Keluar
                  </button>
                </>
              ) : user ? (
                <>
                  <div className="px-4 py-3 bg-gray-50">
                    <p className="font-semibold text-foreground text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Link
                    to="/order-history"
                    className="block px-4 py-2 text-primary hover:bg-gray-50 font-medium text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    Riwayat Pesanan
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 font-medium text-sm"
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-foreground hover:bg-gray-50 font-medium text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    Masuk
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-2 text-primary hover:bg-gray-50 font-medium text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    Daftar
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
