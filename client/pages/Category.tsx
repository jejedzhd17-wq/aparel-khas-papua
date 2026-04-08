import { useParams, Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Star, ArrowLeft } from 'lucide-react';

const CATEGORY_DATA: Record<string, { title: string; description: string; icon: string }> = {
  kaos: {
    title: 'Kaos',
    description: 'Koleksi kaos premium dengan desain eksklusif terinspirasi dari keindahan Papua',
    icon: '👕',
  },
  hoodie: {
    title: 'Hoodie',
    description: 'Hoodie nyaman dan hangat dengan motif tradisional Papua',
    icon: '🧥',
  },
  'tas-noken': {
    title: 'Tas Noken',
    description: 'Tas tradisional noken asli Papua dengan kerajinan tangan yang detail',
    icon: '👜',
  },
  aksesoris: {
    title: 'Aksesoris',
    description: 'Aksesoris eksklusif dengan desain dan material berkualitas',
    icon: '✨',
  },
};

const ALL_PRODUCTS = [
  {
    id: 1,
    name: 'Kaos Raja Ampat',
    price: 149000,
    category: 'Kaos',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    rating: 5,
    slug: 'kaos',
  },
  {
    id: 2,
    name: 'Hoodie Papua Tribal',
    price: 299000,
    category: 'Hoodie',
    image: 'https://images.unsplash.com/photo-1556821552-919ad7b37f69?w=400&h=400&fit=crop',
    rating: 5,
    slug: 'hoodie',
  },
  {
    id: 3,
    name: 'Tas Noken Original',
    price: 199000,
    category: 'Tas Noken',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop',
    rating: 5,
    slug: 'tas-noken',
  },
  {
    id: 4,
    name: 'Gelang Tradisional',
    price: 79000,
    category: 'Aksesoris',
    image: 'https://images.unsplash.com/photo-1515617293615-121f0c5c1241?w=400&h=400&fit=crop',
    rating: 5,
    slug: 'aksesoris',
  },
  {
    id: 5,
    name: 'Kaos Wayang Papua',
    price: 159000,
    category: 'Kaos',
    image: 'https://images.unsplash.com/photo-1503341455253-b2e723bb12dd?w=400&h=400&fit=crop',
    rating: 5,
    slug: 'kaos',
  },
  {
    id: 6,
    name: 'Hoodie Laut Biru',
    price: 319000,
    category: 'Hoodie',
    image: 'https://images.unsplash.com/photo-1571028846478-e8e62d7f8bf0?w=400&h=400&fit=crop',
    rating: 4,
    slug: 'hoodie',
  },
  {
    id: 7,
    name: 'Tas Noken Kulit',
    price: 249000,
    category: 'Tas Noken',
    image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400&h=400&fit=crop',
    rating: 5,
    slug: 'tas-noken',
  },
  {
    id: 8,
    name: 'Kalung Batu Mulia',
    price: 129000,
    category: 'Aksesoris',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop',
    rating: 5,
    slug: 'aksesoris',
  },
];

export default function Category() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const categoryInfo = CATEGORY_DATA[categorySlug || ''];

  if (!categoryInfo) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-4">Kategori tidak ditemukan</p>
            <Link
              to="/shop"
              className="inline-block bg-primary text-white font-semibold px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Kembali ke Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const products = ALL_PRODUCTS.filter(p => p.slug === categorySlug);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-primary font-semibold mb-6 hover:gap-4 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Shop
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{categoryInfo.icon}</span>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground font-playfair">
                {categoryInfo.title}
              </h1>
            </div>
          </div>

          <p className="text-muted-foreground text-lg max-w-2xl">
            {categoryInfo.description}
          </p>
        </div>
      </section>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {products.map((product) => (
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

            <div className="text-center text-muted-foreground">
              <p className="text-lg">
                Menampilkan {products.length} produk dalam kategori {categoryInfo.title}
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-6">
              Tidak ada produk dalam kategori ini
            </p>
            <Link
              to="/shop"
              className="inline-block bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Jelajahi Kategori Lain
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
