import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <>
      <div className="bg-ethnic-line" />
      <footer className="bg-foreground text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="mb-4">Aparel Khas Papua Store</h3>
            <p className="text-white/70 text-sm">Mahakarya Etnik Papua dalam Gaya Modern</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Produk</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/category/pakaian" className="hover:text-white transition">Pakaian</Link></li>
              <li><Link to="/category/tas-noken" className="hover:text-white transition">Tas Noken</Link></li>
              <li><Link to="/category/aksesoris" className="hover:text-white transition">Aksesoris</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Perusahaan</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/about" className="hover:text-white transition">Tentang Kami</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Hubungi Kami</Link></li>
              <li><Link to="/reviews" className="hover:text-white transition">Review</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition">Wishlist</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Ikuti Kami</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a href="#" className="hover:text-white transition">Instagram</a></li>
              <li><a href="#" className="hover:text-white transition">Facebook</a></li>
              <li><a href="#" className="hover:text-white transition">TikTok</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/20 pt-8 text-center text-white/70 text-sm">
          <p>
            &copy; {new Date().getFullYear()} Aparel Khas Papua Store. Semua hak cipta dilindungi.
          </p>
        </div>
      </div>
    </footer>
    </>
  );
}
