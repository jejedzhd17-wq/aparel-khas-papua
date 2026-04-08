import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Star, Filter } from 'lucide-react';

const CATEGORIES = ['Semua', 'Kaos', 'Hoodie', 'Tas Noken', 'Aksesoris'];

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
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const filteredProducts = selectedCategory === 'Semua'
    ? ALL_PRODUCTS
    : ALL_PRODUCTS.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-8 md:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground font-playfair mb-2">
            Koleksi Produk
          </h1>
          <p className="text-muted-foreground text-lg">
            Jelajahi koleksi apparel Papua yang eksklusif dan berkualitas
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex gap-8">
          {/* Desktop Sidebar Filter */}
          <div className="hidden md:block w-48 flex-shrink-0">
            <div className="sticky top-20">
              <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Kategori
              </h3>
              <div className="space-y-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`block w-full text-left px-4 py-2 rounded-lg transition-all duration-200 ${
                      selectedCategory === category
                        ? 'bg-primary text-white font-semibold'
                        : 'text-foreground hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Toggle */}
            <div className="md:hidden mb-6">
              <button
                onClick={() => setShowMobileFilter(!showMobileFilter)}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 rounded-lg"
              >
                <Filter className="w-5 h-5" />
                Kategori
              </button>

              {showMobileFilter && (
                <div className="mt-4 space-y-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowMobileFilter(false);
                      }}
                      className={`block w-full text-left px-4 py-2 rounded-lg transition-all ${
                        selectedCategory === category
                          ? 'bg-primary text-white font-semibold'
                          : 'text-foreground hover:bg-gray-100'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

                      {/* Add to Cart Button */}
                      <button className="w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200">
                        Lihat Detail
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  Tidak ada produk di kategori ini. Silakan pilih kategori lain.
                </p>
              </div>
            )}

            {/* Results Count */}
            <div className="mt-12 text-center text-muted-foreground">
              <p>Menampilkan {filteredProducts.length} produk</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
