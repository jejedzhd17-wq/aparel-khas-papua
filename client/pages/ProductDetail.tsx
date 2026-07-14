import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ReviewList from '@/components/ReviewList';
import ReviewForm from '@/components/ReviewForm';
import { Star, Heart, Share2, ShoppingCart, Check, ArrowLeft, Truck, RotateCcw, Wallet } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { toast } from 'sonner';

const PRODUCTS = {
  1: {
    id: 1,
    name: 'Kaos Raja Ampat',
    price: 149000,
    category: 'Pakaian',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop',
    rating: 5,
    reviews: 24,
    description: 'Kaos premium dengan desain Raja Ampat yang memukau. Terbuat dari bahan cotton 100% berkualitas tinggi yang nyaman dipakai.',
    fullDescription: `Kaos ini dirancang khusus untuk merayakan keindahan Raja Ampat, salah satu destinasi terindah di Indonesia. Dengan desain yang minimalis namun bermakna, kaos ini menceritakan kisah alam laut yang megah.

Spesifikasi:
- Bahan: 100% Cotton Premium
- Fit: Regular fit
- Warna: Biru Laut Turquoise
- Ukuran: XS, S, M, L, XL, XXL
- Berat: 200 gsm

Perawatan:
- Cuci dengan air dingin
- Jangan gunakan pemutih
- Keringkan di tempat teduh
- Setrika dengan suhu sedang`,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    inStock: true,
  },
  3: {
    id: 3,
    name: 'Tas Noken Original',
    price: 199000,
    category: 'Tas Noken',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop',
    rating: 5,
    reviews: 31,
    description: 'Tas tradisional noken asli Papua dengan kerajinan tangan yang detail. Fungsional dan memukau secara visual.',
    fullDescription: `Tas noken adalah warisan budaya Papua yang telah digunakan selama berabad-abad. Tas ini dibuat dengan teknik tradisional yang diwariskan turun-temurun.

Spesifikasi:
- Bahan: Tali alami dari serat tumbuhan Papua
- Teknik: Handmade dengan ketelitian tinggi
- Warna: Alami dengan aksen warna tradisional
- Dimensi: 35cm x 40cm x 15cm
- Kapasitas: Hingga 10kg

Keunggulan:
- Tahan lama
- Ramah lingkungan
- Unik dan autentik
- Mendukung pengrajin lokal Papua`,
    sizes: ['One Size'],
    inStock: true,
  },
  4: {
    id: 4,
    name: 'Gelang Tradisional',
    price: 79000,
    category: 'Aksesoris',
    image: 'https://images.unsplash.com/photo-1515617293615-121f0c5c1241?w=600&h=600&fit=crop',
    rating: 5,
    reviews: 12,
    description: 'Gelang dengan motif tradisional Papua yang elegan. Sempurna untuk menambah gaya Anda.',
    fullDescription: `Gelang ekslusif dengan desain yang terinspirasi dari motif tradisional Papua. Setiap detail dirancang dengan cermat untuk mencerminkan keindahan budaya Papua.

Spesifikasi:
- Bahan: Akar kayu tradisional
- Teknik: Ukiran manual
- Diameter: 6cm
- Berat: 20 gram
- Warna: Cokelat alami

Cara Penggunaan:
- Cocok untuk pria dan wanita
- Dapat dipadukan dengan berbagai gaya
- Nyaman dipakai sehari-hari`,
    sizes: ['One Size'],
    inStock: true,
  },
  5: {
    id: 5,
    name: 'Kaos Wayang Papua',
    price: 159000,
    category: 'Pakaian',
    image: 'https://images.unsplash.com/photo-1503341455253-b2e723bb12dd?w=600&h=600&fit=crop',
    rating: 5,
    reviews: 15,
    description: 'Kaos dengan desain wayang Papua yang bernilai seni tinggi. Terbuat dari cotton berkualitas.',
    fullDescription: `Kaos istimewa menampilkan desain perpaduan seni Wayang dan ornamen khas Papua.

Spesifikasi:
- Bahan: Cotton Combed 30s
- Sablon: Discharge (Cabut Warna) lembut di kulit
- Warna: Hitam
- Ukuran: S, M, L, XL, XXL`,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    inStock: true,
  },
  7: {
    id: 7,
    name: 'Tas Noken Kulit',
    price: 249000,
    category: 'Tas Noken',
    image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600&h=600&fit=crop',
    rating: 5,
    reviews: 9,
    description: 'Tas noken tradisional dengan sentuhan kulit sapi asli untuk ketahanan ekstra.',
    fullDescription: `Perpaduan unik antara anyaman serat pohon tradisional Papua dengan aksen kulit sapi asli premium, menghasilkan tas noken yang modern dan elegan.

Spesifikasi:
- Bahan: Serat kayu alami & Kulit Sapi Asli
- Warna: Natural & Cokelat Tan
- Ukuran: Medium`,
    sizes: ['One Size'],
    inStock: true,
  },
  8: {
    id: 8,
    name: 'Kalung Batu Mulia',
    price: 129000,
    category: 'Aksesoris',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop',
    rating: 5,
    reviews: 7,
    description: 'Kalung premium dengan ornamen batu mulia khas Papua yang indah.',
    fullDescription: `Kalung buatan tangan dengan liontin batu mulia asli dari alam Papua. Setiap batu memiliki corak unik yang alami.

Spesifikasi:
- Bahan: Tali kulit premium & Batu mulia asli Papua
- Panjang tali: Adjustable (dapat diatur)`,
    sizes: ['One Size'],
    inStock: true,
  },
  9: {
    id: 9,
    name: 'Hoodie Papua Indonesia',
    price: 329000,
    category: 'Pakaian',
    image: '/hoodie-papua-indonesia.jpg',
    rating: 5,
    reviews: 12,
    description: 'Hoodie nyaman dengan desain eksklusif peta Papua dan pesan kebanggaan nasional.',
    fullDescription: `Hoodie Maroon premium "Dari Papua Untuk Indonesia". Didesain dengan penuh kebanggaan menampilkan siluet pulau Papua yang elegan.

Spesifikasi:
- Bahan: 100% Cotton Fleece Premium
- Sablon: Plastisol kualitas tinggi
- Warna: Maroon
- Ukuran: S, M, L, XL, XXL
- Fitur: Kupluk dengan tali serut, kantong kanguru depan.`,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    inStock: true,
  },
  10: {
    id: 10,
    name: 'Hoodie Bumi Papua',
    price: 349000,
    category: 'Pakaian',
    image: '/hoodie-bumi-papua.jpg',
    rating: 5,
    reviews: 8,
    description: 'Hoodie edisi khusus dengan sablon emas peta Papua dari bumi Papua.',
    fullDescription: `Hoodie Charcoal premium "Dari Bumi Papua". Desain artistik berlapis warna emas berkilau yang melambangkan kekayaan alam bumi Papua.

Spesifikasi:
- Bahan: Heavyweight Cotton Fleece
- Sablon: Gold Metallic Foil Premium
- Warna: Charcoal / Abu-abu Gelap
- Ukuran: S, M, L, XL, XXL
- Fitur: Jahitan double-needle, ketebalan ekstra untuk kehangatan maksimal.`,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    inStock: true,
  },
};

const getResolvedSrc = (raw?: string) => {
  if (!raw) return '/placeholder.svg';
  if (raw.startsWith('data:')) return raw;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  if (raw.startsWith('/')) return raw;
  return `/uploads/${raw}`;
};

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  description: string;
  fullDescription: string;
  sizes: string[];
  inStock: boolean;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('One Size');
  const [addedToCart, setAddedToCart] = useState(false);
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);
  const reviewsRef = useRef<HTMLDivElement>(null);

  // ─── Fetch product from database ──────────────────────────────────────────
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (data.success && data.data) {
          const item = data.data;
          const mappedProduct: Product = {
            id: Number(item.id),
            name: item.name,
            price: Number(item.price),
            category: item.category || 'Pakaian',
            image: item.image,
            rating: item.rating !== undefined ? item.rating : 5,
            reviews: item.reviewCount !== undefined ? item.reviewCount : 0,
            description: item.description || '',
            fullDescription: item.description || '',
            sizes: item.sizes || ['S', 'M', 'L', 'XL'],
            inStock: item.stock !== undefined ? (item.stock > 0) : item.in_stock,
          };
          setProduct(mappedProduct);
        } else {
          // Fallback to static PRODUCTS
          const fallback = PRODUCTS[Number(id) as keyof typeof PRODUCTS];
          if (fallback) {
            setProduct(fallback as any);
          } else {
            setProduct(null);
          }
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
        // Fallback to static PRODUCTS
        const fallback = PRODUCTS[Number(id) as keyof typeof PRODUCTS];
        if (fallback) {
          setProduct(fallback as any);
        } else {
          setProduct(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Update selected size when product changes
  useEffect(() => {
    if (product && product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product?.id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity,
        size: selectedSize,
      });
      toast.success(`${product.name} (${selectedSize}) ditambahkan ke keranjang`);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleReviewSubmitSuccess = () => {
    // Refresh reviews
    setReviewRefreshTrigger(prev => prev + 1);

    // Scroll to reviews section
    setTimeout(() => {
      reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-lg text-muted-foreground animate-pulse">Memuat detail produk...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-lg text-muted-foreground">Produk tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 font-semibold text-sm group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Kembali
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="flex items-center justify-center">
            <div className="w-full aspect-square bg-gray-100 rounded-xl overflow-hidden">
              <img
                src={getResolvedSrc(product.image)}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-between">
            {/* Category Badge */}
            <div className="mb-4">
              <span className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-semibold">
                {product.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-playfair">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(product.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-muted-foreground">({product.reviews} ulasan)</span>
            </div>

            {/* Price */}
            <div className="mb-8">
              <p className="text-5xl font-bold text-primary mb-2">
                Rp {Number(product.price).toLocaleString('id-ID')}
              </p>
              <p className="text-muted-foreground">
                {product.inStock ? (
                  <span className="text-green-600 font-semibold">✓ Stok tersedia</span>
                ) : (
                  <span className="text-red-600 font-semibold">Habis terjual</span>
                )}
              </p>
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* Size Selection */}
            {product.sizes.length > 1 && (
              <div className="mb-8">
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Pilih Ukuran
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border-2 rounded-lg font-semibold transition-all ${
                        selectedSize === size
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 text-foreground hover:border-primary'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-foreground mb-3">
                Jumlah
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                className={`flex-1 font-semibold py-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                  addedToCart
                    ? 'bg-green-600 text-white'
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    Ditambahkan ke Keranjang
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Tambah ke Keranjang
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  if (product) {
                    toggleWishlist({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      category: product.category,
                    });
                  }
                }}
                className={`px-6 py-4 border-2 rounded-lg transition-all duration-300 ${
                  isInWishlist(product.id)
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-300 hover:border-primary'
                }`}
                title={isInWishlist(product.id) ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    isInWishlist(product.id)
                      ? 'fill-red-500 text-red-500'
                      : 'text-foreground hover:text-primary'
                  }`}
                />
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: product.name,
                      text: product.description,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Tautan produk berhasil disalin!');
                  }
                }}
                className="px-6 py-4 border-2 border-gray-300 rounded-lg hover:border-primary transition-colors"
                title="Bagikan produk"
              >
                <Share2 className="w-5 h-5 text-foreground hover:text-primary transition-colors" />
              </button>
            </div>

            {/* Additional Info */}
            <div className="space-y-3 text-sm text-muted-foreground">
              {[
                {
                  icon: <Truck className="w-4 h-4" />,
                  color: 'bg-blue-50 text-blue-600',
                  title: 'Pengiriman Cepat',
                  desc: 'Gratis ongkir untuk pembelian di atas Rp 500.000',
                },
                {
                  icon: <RotateCcw className="w-4 h-4" />,
                  color: 'bg-green-50 text-green-600',
                  title: 'Garansi Puas',
                  desc: 'Kembalikan hingga 14 hari tanpa pertanyaan',
                },
                {
                  icon: <Wallet className="w-4 h-4" />,
                  color: 'bg-amber-50 text-amber-600',
                  title: 'Berbagai Metode Pembayaran',
                  desc: 'Transfer bank, e-wallet, dan cicilan',
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80 border border-gray-100 hover:border-primary/20 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-xs leading-tight">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Full Description */}
        <div className="mt-16 border-t border-gray-200 pt-12 mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6 font-playfair">
            Detail Lengkap
          </h2>
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
              {product.fullDescription}
            </p>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div ref={reviewsRef} className="border-t border-gray-200 pt-12">
          <h2 className="text-2xl font-bold text-foreground mb-8 font-playfair">
            Review Pelanggan
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Review Form */}
            <div className="lg:col-span-1">
              <ReviewForm
                productId={product.id}
                onSubmitSuccess={handleReviewSubmitSuccess}
              />
            </div>

            {/* Review List */}
            <div className="lg:col-span-2">
              <ReviewList
                productId={product.id}
                refreshTrigger={reviewRefreshTrigger}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
