import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import ReviewList from '@/components/ReviewList';
import ReviewForm from '@/components/ReviewForm';
import { Star, Heart, Share2, ShoppingCart, Check } from 'lucide-react';
import { useState, useRef } from 'react';
import { useCart } from '@/context/CartContext';

const PRODUCTS = {
  1: {
    id: 1,
    name: 'Kaos Raja Ampat',
    price: 149000,
    category: 'Kaos',
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
  2: {
    id: 2,
    name: 'Hoodie Papua Tribal',
    price: 299000,
    category: 'Hoodie',
    image: 'https://images.unsplash.com/photo-1556821552-919ad7b37f69?w=600&h=600&fit=crop',
    rating: 5,
    reviews: 18,
    description: 'Hoodie nyaman dengan motif tribal Papua yang autentik. Sempurna untuk penggunaan sehari-hari atau santai.',
    fullDescription: `Hoodie eksklusif yang menampilkan motif tribal Papua asli. Dikombinasikan dengan desain modern, menciptakan harmoni sempurna antara tradisi dan kontemporer.

Spesifikasi:
- Bahan: 80% Cotton, 20% Polyester
- Fit: Relaxed fit
- Warna: Hijau Forest
- Ukuran: XS, S, M, L, XL, XXL
- Berat: 280 gsm
- Kantong depan tersedia

Fitur:
- Drawstring berkualitas
- Jahitan yang rapi
- Tahan lama`,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
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
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const product = PRODUCTS[id as keyof typeof PRODUCTS];
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || 'One Size');
  const [addedToCart, setAddedToCart] = useState(false);
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);
  const reviewsRef = useRef<HTMLDivElement>(null);

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="flex items-center justify-center">
            <div className="w-full aspect-square bg-gray-100 rounded-xl overflow-hidden">
              <img
                src={product.image}
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
                Rp {product.price.toLocaleString('id-ID')}
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
              <button className="px-6 py-4 border-2 border-gray-300 rounded-lg hover:border-primary transition-colors">
                <Heart className="w-5 h-5 text-foreground hover:text-primary transition-colors" />
              </button>
              <button className="px-6 py-4 border-2 border-gray-300 rounded-lg hover:border-primary transition-colors">
                <Share2 className="w-5 h-5 text-foreground hover:text-primary transition-colors" />
              </button>
            </div>

            {/* Additional Info */}
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🚚</span>
                <div>
                  <p className="font-semibold text-foreground">Pengiriman Cepat</p>
                  <p>Gratis ongkir untuk pembelian di atas Rp 500.000</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔄</span>
                <div>
                  <p className="font-semibold text-foreground">Garansi Puas</p>
                  <p>Kembalikan hingga 14 hari tanpa pertanyaan</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">💳</span>
                <div>
                  <p className="font-semibold text-foreground">Berbagai Metode Pembayaran</p>
                  <p>Transfer bank, e-wallet, dan cicilan</p>
                </div>
              </div>
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
    </div>
  );
}
