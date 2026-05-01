import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Star, ArrowRight } from 'lucide-react';

export default function Index() {
  const featured = [
    {
      id: 1,
      name: 'Kaos Raja Ampat',
      price: 149000,
      category: 'Kaos',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
      rating: 5,
    },
    {
      id: 2,
      name: 'Hoodie Papua Tribal',
      price: 299000,
      category: 'Hoodie',
      image: 'https://images.unsplash.com/photo-1556821552-919ad7b37f69?w=400&h=400&fit=crop',
      rating: 5,
    },
    {
      id: 3,
      name: 'Tas Noken Original',
      price: 199000,
      category: 'Tas',
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop',
      rating: 5,
    },
    {
      id: 4,
      name: 'Gelang Tradisional',
      price: 79000,
      category: 'Aksesoris',
      image: 'https://images.unsplash.com/photo-1515617293615-121f0c5c1241?w=400&h=400&fit=crop',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-[600px] md:h-[700px] overflow-hidden">
        {/* Background gradient inspired by Raja Ampat waters */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-primary to-blue-600">
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="wave" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M0,50 Q25,40 50,50 T100,50" stroke="white" strokeWidth="0.5" fill="none" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="1200" height="800" fill="url(#wave)" />
              {/* Island silhouettes */}
              <ellipse cx="150" cy="450" rx="80" ry="120" fill="rgba(45, 134, 89, 0.3)" />
              <ellipse cx="1000" cy="500" rx="100" ry="140" fill="rgba(45, 134, 89, 0.2)" />
              <polygon points="400,600 450,450 500,600" fill="rgba(139, 111, 71, 0.2)" />
            </svg>
          </div>
        </div>

        <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-playfair">
              Keindahan Papua dalam Setiap Karya
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 font-poppins">
              Koleksi apparel eksklusif yang terinspirasi dari keindahan alam Raja Ampat dan kekayaan budaya Papua
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-8 py-3 rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
              >
                Mulai Belanja <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                Pelajari Cerita Kami
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-playfair">
              Produk Unggulan
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Pilihan terbaik kami yang menggabungkan kualitas premium dengan desain yang terinspirasi budaya Papua
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featured.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group"
              >
                <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  {/* Product Image */}
                  <div className="relative h-64 overflow-hidden bg-gray-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {product.category}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(product.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold text-primary">
                        Rp {product.price.toLocaleString('id-ID')}
                      </span>
                    </div>

                    {/* Add to Cart Button */}
                    <button className="w-full mt-4 bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200">
                      Lihat Detail
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-4 transition-all"
            >
              Lihat Semua Produk <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* About Papua Section */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left side - Image placeholder */}
            <div className="relative h-96 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <div className="text-center">
                <div className="text-primary text-6xl font-playfair font-bold mb-4">🏝️</div>
                <p className="text-primary font-semibold">Raja Ampat, Papua Barat</p>
              </div>
            </div>

            {/* Right side - Content */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 font-playfair">
                Keunikan Budaya Papua
              </h2>
              <p className="text-muted-foreground text-lg mb-4">
                Papua adalah harta karun budaya Indonesia yang kaya dengan tradisi, seni, dan kerajinan yang telah diwariskan turun-temurun selama berabad-abad.
              </p>
              <p className="text-muted-foreground text-lg mb-6">
                Setiap produk di Noken Papua Store dirancang untuk merayakan keindahan alam Raja Ampat dan menghormati warisan budaya masyarakat Papua. Kami percaya bahwa fashion dapat menjadi medium untuk menceritakan kisah budaya yang indah ini kepada dunia.
              </p>

              <div className="space-y-4">
                {[
                  { icon: '🎨', title: 'Desain Autentik', desc: 'Terinspirasi dari motif tradisional Papua' },
                  { icon: '♻️', title: 'Berkelanjutan', desc: 'Komitmen terhadap lingkungan dan komunitas lokal' },
                  { icon: '🤝', title: 'Mendukung Lokal', desc: 'Setiap pembelian mendukung pengrajin Papua' },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <span className="text-3xl">{item.icon}</span>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-playfair">
            Bergabunglah dengan Komunitas Kami
          </h2>
          <p className="text-lg mb-8 text-white/90">
            Dapatkan update produk terbaru, tips gaya, dan penawaran eksklusif langsung ke inbox Anda
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Masukkan email Anda"
              className="flex-1 px-4 py-3 rounded-lg text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-primary font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
              Daftar
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Noken Papua Store</h3>
              <p className="text-white/70 text-sm">Keindahan Papua dalam Setiap Karya</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produk</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link to="/shop" className="hover:text-white transition">Kaos</Link></li>
                <li><Link to="/shop" className="hover:text-white transition">Hoodie</Link></li>
                <li><Link to="/shop" className="hover:text-white transition">Tas Noken</Link></li>
                <li><Link to="/shop" className="hover:text-white transition">Aksesoris</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link to="/about" className="hover:text-white transition">Tentang Kami</Link></li>
                <li><Link to="/reviews" className="hover:text-white transition">Review Produk</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Hubungi Kami</Link></li>
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
            <p>&copy; 2024 Noken Papua Store. Semua hak cipta dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
