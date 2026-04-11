import { Link } from 'react-router-dom';
import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Star, ArrowRight, Search } from 'lucide-react';

const CATEGORIES = [
  { name: 'Kaos', slug: 'kaos', icon: '👕' },
  { name: 'Hoodie', slug: 'hoodie', icon: '🧥' },
  { name: 'Tas Noken', slug: 'tas-noken', icon: '👜' },
  { name: 'Aksesoris', slug: 'aksesoris', icon: '✨' },
];

const ALL_PRODUCTS = [
  {
    id: 1,
    name: 'Kaos Raja Ampat',
    price: 149000,
    category: 'Kaos',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    rating: 5,
    description: 'Kaos premium dengan desain Raja Ampat',
  },
  {
    id: 2,
    name: 'Hoodie Papua Tribal',
    price: 299000,
    category: 'Hoodie',
    image: 'https://images.unsplash.com/photo-1556821552-919ad7b37f69?w=400&h=400&fit=crop',
    rating: 5,
    description: 'Hoodie nyaman dengan motif tribal Papua',
  },
  {
    id: 3,
    name: 'Tas Noken Original',
    price: 199000,
    category: 'Tas Noken',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop',
    rating: 5,
    description: 'Tas tradisional noken asli Papua',
  },
  {
    id: 4,
    name: 'Gelang Tradisional',
    price: 79000,
    category: 'Aksesoris',
    image: 'https://images.unsplash.com/photo-1515617293615-121f0c5c1241?w=400&h=400&fit=crop',
    rating: 5,
    description: 'Gelang dengan motif tradisional Papua',
  },
  {
    id: 5,
    name: 'Kaos Wayang Papua',
    price: 159000,
    category: 'Kaos',
    image: 'https://images.unsplash.com/photo-1503341455253-b2e723bb12dd?w=400&h=400&fit=crop',
    rating: 5,
    description: 'Kaos dengan desain wayang Papua',
  },
  {
    id: 6,
    name: 'Hoodie Laut Biru',
    price: 319000,
    category: 'Hoodie',
    image: 'https://images.unsplash.com/photo-1571028846478-e8e62d7f8bf0?w=400&h=400&fit=crop',
    rating: 4,
    description: 'Hoodie dengan inspirasi laut Raja Ampat',
  },
  {
    id: 7,
    name: 'Tas Noken Kulit',
    price: 249000,
    category: 'Tas Noken',
    image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400&h=400&fit=crop',
    rating: 5,
    description: 'Tas noken dengan kombinasi kulit asli',
  },
  {
    id: 8,
    name: 'Kalung Batu Mulia',
    price: 129000,
    category: 'Aksesoris',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop',
    rating: 5,
    description: 'Kalung dengan batu mulia Papua',
  },
];

export default function Shop() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = ALL_PRODUCTS.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-8 md:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground font-playfair mb-2">
            Shop
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            Jelajahi koleksi apparel Papua yang eksklusif dan berkualitas
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        {/* Category Cards */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 font-playfair">
            Telusuri Kategori
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                to={`/category/${category.slug}`}
                className="group"
              >
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-8 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col items-center justify-center">
                  <span className="text-6xl mb-4 group-hover:scale-110 transition-transform">{category.icon}</span>
                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-4 transition-all">
                    Lihat <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* All Products */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground font-playfair">
              {searchQuery ? 'Hasil Pencarian' : 'Semua Produk'}
            </h2>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-primary hover:underline text-sm font-semibold"
              >
                Reset
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
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
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(product.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline justify-between mb-4">
                      <span className="text-2xl font-bold text-primary">
                        Rp {product.price.toLocaleString('id-ID')}
                      </span>
                    </div>

                    {/* View Button */}
                    <button className="w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200">
                      Lihat Detail
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg mb-4">
                Tidak ada produk yang sesuai dengan pencarian Anda
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-primary hover:underline font-semibold"
              >
                Lihat Semua Produk
              </button>
            </div>
          )}

          {/* Results Count */}
          {filteredProducts.length > 0 && (
            <div className="mt-12 text-center text-muted-foreground">
              <p>Menampilkan {filteredProducts.length} produk {searchQuery && `untuk "${searchQuery}"`}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
