import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Star, ArrowLeft, Shirt } from 'lucide-react';
import { motion } from 'framer-motion';


// Custom SVG Icons dengan unsur etnik khas Papua untuk keempat kategori utama
const KaosPapuaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={props.strokeWidth || 2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    {/* Outline Kaos */}
    <path d="M15 4V2H9v2L3 6v4h3v10h12V10h3V6z" />
    {/* Motif ukiran Cenderawasih/Tifa abstrak di bagian tengah dada kaos */}
    <path d="M8 9.5c2 1 6 1 8 0" opacity={0.8} />
    <path d="M9 12c1.5 1.5 4.5 1.5 6 0" opacity={0.8} />
    <path d="M10 15h4" opacity={0.8} />
    {/* Garis tengah ornamen etnik */}
    <line x1="12" y1="8" x2="12" y2="16" opacity={0.8} />
    <circle cx="12" cy="10" r="1" fill="currentColor" />
  </svg>
);

const HoodiePapuaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={props.strokeWidth || 2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    {/* Tudung kepala (Hood) */}
    <path d="M8 8c0-3.5 1.5-5 4-5s4 1.5 4 5" />
    {/* Kerah leher segitiga */}
    <path d="M9 8.5h6l-3 3-3-3z" />
    {/* Lengan kanan & kiri dengan ukiran etnik tribal */}
    <path d="M17 9.5l4 4.5v3h-1.8l-2.2-3.5" />
    <path d="M7 9.5L3 14v3h1.8l2.2-3.5" />
    <path d="M4 14.5h1M19 14.5h1" opacity={0.7} />
    {/* Badan Utama Jaket */}
    <path d="M6 10v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10" />
    {/* Saku Depan Kangaroo */}
    <path d="M8.5 16.5h7l-0.8 3.5h-5.4z" />
    {/* Motif garis etnik horizontal di bagian bawah hoodie */}
    <path d="M6 20h12" />
  </svg>
);

const NokenPapuaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={props.strokeWidth || 2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    {/* Tali panjang khas Noken Papua yang biasa disampirkan di kepala atau bahu */}
    <path d="M5 12V4.5c0-1.5 2.5-2.5 7-2.5s7 1 7 2.5V12" />
    {/* Pouch / kantung tas rajutan berbahan serat alami */}
    <path d="M4 12h16a1 1 0 0 1 1 1v5.5c0 3-2.5 4.5-7.5 4.5S4.5 21.5 4.5 18.5V13a1 1 0 0 1 1-1z" />
    {/* Pola rajutan zig-zag khas motif Papua */}
    <path d="M4.5 15l3.75 3 3.75-3 3.75 3 3.75-3" opacity={0.85} />
    <path d="M4.5 18l3.75 3 3.75-3 3.75 3 3.75-3" opacity={0.85} />
  </svg>
);

const MahkotaAksesorisIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={props.strokeWidth || 2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    {/* Ikat kepala / Headband berbahan serat anyaman dengan ukiran geometris adat */}
    <rect x="3" y="15" width="18" height="4" rx="1" />
    <path d="M5 15l2 4M9 15l2 4M13 15l2 4M17 15l2 4" opacity={0.8} />
    {/* Hiasan bulu-bulu burung Cenderawasih yang megah tegak ke atas */}
    {/* Bulu tengah utama */}
    <path d="M12 15c0-4-1-8-2-11 1.5 3 2.5 7 2 11" />
    <path d="M12 4c1 3 2 7 2 11" />
    {/* Bulu kiri */}
    <path d="M8 15c-1-3.5-2.5-7-4.5-9.5 2 2.5 4 6.5 4.5 9.5" />
    {/* Bulu kanan */}
    <path d="M16 15c1-3.5 2.5-7 4.5-9.5-2 2.5-4 6.5-4.5 9.5" />
    {/* Tali manik-manik rumbai gantung di samping kiri-kanan ikat kepala */}
    <circle cx="3" cy="21" r="1.5" fill="currentColor" />
    <circle cx="21" cy="21" r="1.5" fill="currentColor" />
  </svg>
);

const CATEGORY_DATA: Record<string, { title: string; description: string; Icon: any; gradient: string; bgLight: string }> = {
  pakaian: {
    title: 'Pakaian',
    description: 'Koleksi pakaian premium, kaos, dan outerwear bermotif ukiran etnik khas Papua',
    Icon: KaosPapuaIcon,
    gradient: 'from-[#e08644] to-[#8f4a1e]',
    bgLight: 'from-[#fff7f0] via-white to-[#fff1f2]',
  },
  'tas-noken': {
    title: 'Tas Noken',
    description: 'Tas tradisional noken asli Papua dengan kerajinan tangan yang detail',
    Icon: NokenPapuaIcon,
    gradient: 'from-amber-500 to-yellow-600',
    bgLight: 'from-amber-50 via-white to-yellow-50',
  },
  aksesoris: {
    title: 'Aksesoris',
    description: 'Aksesoris eksklusif dengan desain dan material berkualitas',
    Icon: MahkotaAksesorisIcon,
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: 'from-emerald-50 via-white to-teal-50',
  },
};


const ALL_PRODUCTS = [
  {
    id: 1,
    name: 'Kaos Raja Ampat',
    price: 149000,
    category: 'Pakaian',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    rating: 5,
    slug: 'pakaian',
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
    category: 'Pakaian',
    image: 'https://images.unsplash.com/photo-1503341455253-b2e723bb12dd?w=400&h=400&fit=crop',
    rating: 5,
    slug: 'pakaian',
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
  {
    id: 9,
    name: 'Hoodie Papua Indonesia',
    price: 329000,
    category: 'Pakaian',
    image: '/hoodie-papua-indonesia.jpg',
    rating: 5,
    slug: 'pakaian',
  },
  {
    id: 10,
    name: 'Hoodie Bumi Papua',
    price: 349000,
    category: 'Pakaian',
    image: '/hoodie-bumi-papua.jpg',
    rating: 5,
    slug: 'pakaian',
  },
];

const getResolvedSrc = (raw?: string) => {
  if (!raw) return '/placeholder.svg';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  if (raw.startsWith('/')) return raw;
  return `/uploads/${raw}`;
};

const SLUG_TO_DB_NAME: Record<string, string> = {
  pakaian: 'Pakaian',
  'tas-noken': 'Tas Noken',
  aksesoris: 'Aksesoris'
};

export default function Category() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const categoryInfo = CATEGORY_DATA[categorySlug || ''];
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!categoryInfo || !categorySlug) return;
    
    // Set local fallback products immediately so the category screen renders instantly
    const fallbackProducts = ALL_PRODUCTS.filter(p => p.slug === categorySlug);
    setProducts(fallbackProducts);
    setIsLoading(true);

    const fetchProducts = async () => {
      try {
        const dbCategoryName = SLUG_TO_DB_NAME[categorySlug] || '';
        const res = await fetch(`/api/products?category=${encodeURIComponent(dbCategoryName)}&limit=100`);
        const data = await res.json();
        if (data.success && data.data) {
          const mapped = data.data.map((p: any) => ({
            id: p.id,
            name: p.name || p.nama_produk,
            price: parseFloat(p.price || p.harga || 0),
            category: p.category || p.kategori || dbCategoryName,
            image: p.image || p.gambar || '',
            rating: p.rating ? Math.round(p.rating) : 5,
            slug: categorySlug,
          }));
          
          setProducts(mapped);
        } else {
          // If no dynamic data, keep fallback
          setProducts(fallbackProducts);
        }
      } catch (err) {
        console.error("Gagal memuat produk kategori dari DB:", err);
        setProducts(fallbackProducts);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [categorySlug, categoryInfo]);

  if (!categoryInfo) {
    return (
      <div className="min-h-screen">
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

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Page Header */}
      <section className={`bg-gradient-to-r ${categoryInfo.bgLight} py-12 px-4`}>
        <div className="max-w-7xl mx-auto">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-gray-600 font-semibold mb-6 hover:gap-4 transition-all hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Shop
          </Link>

          <div className="flex items-center gap-5 mb-4">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${categoryInfo.gradient} shadow-xl`}>
              <categoryInfo.Icon className="w-8 h-8 text-white" strokeWidth={1.8} />
            </div>
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
        {isLoading && products.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white border border-gray-100 rounded-xl h-96 flex flex-col p-4 space-y-4">
                <div className="bg-gray-100 rounded-lg h-48 w-full" />
                <div className="bg-gray-100 h-6 rounded w-3/4" />
                <div className="bg-gray-100 h-4 rounded w-1/2" />
                <div className="bg-gray-100 h-10 rounded w-full mt-auto" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-8 mb-12">
              {products.map((product, pIdx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.5, delay: (pIdx % 3) * 0.1, ease: 'easeOut' }}
                >
                  <Link
                    to={`/product/${product.id}`}
                    className="group"
                  >
                    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col justify-between">
                      <div>
                        {/* Product Image */}
                        <div className="relative h-36 xs:h-40 sm:h-48 md:h-64 overflow-hidden bg-gray-100">
                          <img
                            src={getResolvedSrc(product.image)}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute top-3 right-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                            {product.category}
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-4">
                          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground mb-1 sm:mb-2 group-hover:text-primary transition-colors line-clamp-2">
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
                            <span className="text-lg sm:text-xl md:text-2xl font-bold text-primary">
                              Rp {Number(product.price).toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 pt-0">
                        {/* View Button */}
                        <button className="w-full bg-primary text-white font-semibold text-xs sm:text-sm py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200">
                          Lihat Detail
                        </button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
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

      <Footer />
    </div>
  );
}
