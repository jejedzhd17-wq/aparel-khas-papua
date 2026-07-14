import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Star, ArrowRight, Search, Shirt } from 'lucide-react';
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

const CATEGORIES = [
  {
    name: 'Pakaian',
    slug: 'pakaian',
    Icon: KaosPapuaIcon,
    iconStyle: { background: 'linear-gradient(135deg, #e08644, #8f4a1e)' },
    activeColor: 'text-[#b8622a] hover:text-[#8f4a1e]',
    description: 'Koleksi pakaian premium, kaos, dan outerwear bermotif ukiran etnik khas Papua.',
  },
  {
    name: 'Tas Noken',
    slug: 'tas-noken',
    Icon: NokenPapuaIcon,
    iconStyle: { background: 'linear-gradient(135deg, #e08644, #8f4a1e)' },
    activeColor: 'text-[#b8622a] hover:text-[#8f4a1e]',
    description: 'Tas rajutan tradisional asli hasil karya tangan mama-mama Papua dari serat kayu pilihan.',
  },
  {
    name: 'Aksesoris',
    slug: 'aksesoris',
    Icon: MahkotaAksesorisIcon,
    iconStyle: { background: 'linear-gradient(135deg, #e08644, #8f4a1e)' },
    activeColor: 'text-[#b8622a] hover:text-[#8f4a1e]',
    description: 'Mahkota burung khas, gelang tari tradisional, dan pernak-pernik etnik Papua.',
  },
];



const ALL_PRODUCTS = [
  {
    id: 1,
    name: 'Kaos Raja Ampat',
    price: 149000,
    category: 'Pakaian',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    rating: 5,
    description: 'Kaos premium dengan desain Raja Ampat',
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
    category: 'Pakaian',
    image: 'https://images.unsplash.com/photo-1503341455253-b2e723bb12dd?w=400&h=400&fit=crop',
    rating: 5,
    description: 'Kaos dengan desain wayang Papua',
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
  {
    id: 9,
    name: 'Hoodie Papua Indonesia',
    price: 329000,
    category: 'Pakaian',
    image: '/hoodie-papua-indonesia.jpg',
    rating: 5,
    description: 'Hoodie premium dengan motif peta Papua bertuliskan Dari Papua Untuk Indonesia',
  },
  {
    id: 10,
    name: 'Hoodie Bumi Papua',
    price: 349000,
    category: 'Pakaian',
    image: '/hoodie-bumi-papua.jpg',
    rating: 5,
    description: 'Hoodie premium dengan sablon peta Papua berwarna emas bertuliskan Dari Bumi Papua',
  },
];

const getResolvedSrc = (raw?: string) => {
  if (!raw) return '/placeholder.svg';
  if (raw.startsWith('data:')) return raw;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  if (raw.startsWith('/')) return raw;
  return `/uploads/${raw}`;
};

export default function Shop() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>(ALL_PRODUCTS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?limit=100');
        const data = await res.json();
        if (data.success && data.data) {
          const mapped = data.data.map((p: any) => ({
            id: p.id,
            name: p.name || p.nama_produk,
            price: parseFloat(p.price || p.harga || 0),
            category: p.category || p.kategori || 'Pakaian',
            image: p.image || p.gambar || '',
            rating: p.rating ? Math.round(p.rating) : 5,
            description: p.description || p.deskripsi || '',
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.error("Gagal memuat produk dari DB:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Page Header dengan Background Foto Papua */}
      <section 
        className="relative py-24 md:py-36 px-4 bg-cover bg-[center_35%] text-white overflow-hidden"
        style={{ backgroundImage: "url('/papua-shop.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/45" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative max-w-7xl mx-auto z-10"
        >
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
            Shop
          </h1>
          <p className="text-white/90 text-lg md:text-xl mb-6">
            Jelajahi koleksi apparel Papua yang eksklusif dan berkualitas
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-white/20 bg-white text-gray-800 placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-lg"
            />
          </div>
        </motion.div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        {/* Category Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="mb-16"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 font-playfair">
            Telusuri Kategori
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {CATEGORIES.map((category, catIdx) => (
              <Link
                key={category.slug}
                to={`/category/${category.slug}`}
                className="group"
              >
                {/* Gradient border wrapper */}
                <div
                  className="rounded-2xl p-[3px] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 h-full shadow-md"
                  style={{ background: 'linear-gradient(135deg, #e08644 0%, #b8622a 50%, #8f4a1e 100%)' }}
                >
                  {/* White inner card */}
                  <div className="bg-white rounded-[14px] p-5 h-full flex flex-col justify-between">
                    <div>
                      {/* Icon container */}
                      <div
                        className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 group-hover:scale-105 transition-transform duration-300 shadow-sm"
                        style={category.iconStyle}
                      >
                        <category.Icon className="w-6 h-6 text-white" strokeWidth={2} />
                      </div>

                      {/* Heading */}
                      <h3 className="text-lg font-bold text-gray-900 mb-2 font-outfit">
                        {category.name}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-600 leading-relaxed mb-4 font-medium">
                        {category.description}
                      </p>
                    </div>

                    {/* Action link */}
                    <span className={`inline-flex items-center gap-1 text-sm font-bold ${category.activeColor} transition-all mt-auto`}>
                      Lihat Koleksi <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-200" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}

          </div>
        </motion.div>


        {/* All Products */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
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
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
            {filteredProducts.map((product, pIdx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: (pIdx % 4) * 0.1, ease: 'easeOut' }}
              >
              <Link
                to={`/product/${product.id}`}
                className="group"
              >
                <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
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
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
