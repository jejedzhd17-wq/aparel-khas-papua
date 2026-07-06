import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import StarRating from '@/components/StarRating';
import { Send, Filter, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface Review {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

interface Product {
  id: number;
  name: string;
  image: string;
  category: string;
}

const getResolvedSrc = (raw?: string) => {
  if (!raw) return '/placeholder.svg';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  if (raw.startsWith('/')) return raw;
  return `/uploads/${raw}`;
};

// Fallback mock products
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Kaos Raja Ampat',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop',
    category: 'Pakaian',
  },
  {
    id: 9,
    name: 'Hoodie Papua Indonesia',
    image: '/hoodie-papua-indonesia.jpg',
    category: 'Pakaian',
  },
  {
    id: 3,
    name: 'Tas Noken Original',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=100&h=100&fit=crop',
    category: 'Tas Noken',
  },
];

// Fallback mock reviews
const DEFAULT_REVIEWS: Review[] = [
  {
    id: 1,
    productId: 1,
    productName: 'Kaos Raja Ampat',
    productImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop',
    userName: 'Budi Santoso',
    rating: 5,
    comment: 'Sangat puas dengan kualitas kaosnya! Desainnya indah dan bahannya nyaman dipakai.',
    date: '2024-01-15',
  },
];

export default function Reviews() {
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [reviews, setReviews] = useState<Review[]>(DEFAULT_REVIEWS);
  const [filterProduct, setFilterProduct] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'rating'>('newest');
  const [rating, setRating] = useState<number>(0);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Fetch Products
      const prodRes = await fetch('/api/products');
      const prodData = await prodRes.json();
      if (prodData.success && prodData.data) {
        setProducts(prodData.data);
      }

      // Fetch Reviews
      const revRes = await fetch('/api/reviews');
      const revData = await revRes.json();
      if (revData.success && revData.data) {
        setReviews(
          revData.data.map((r: any) => ({
            id: r.id,
            productId: r.productId,
            productName: r.productName || 'Produk',
            productImage: r.productImage || '/placeholder.svg',
            userName: r.userName || 'Pelanggan',
            rating: r.rating,
            comment: r.comment || '',
            date: r.date || new Date().toISOString().split('T')[0],
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load reviews data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const savedUser = localStorage.getItem('noken-user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUserName(parsed.name || '');
      } catch {}
    }
  }, []);

  const isLoggedIn = !!localStorage.getItem('noken-token');

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter((review) => (filterProduct ? review.productId === filterProduct : true))
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return b.rating - a.rating;
      }
    });

  // Calculate average rating per product
  const getAverageRating = (productId: number) => {
    const productReviews = reviews.filter((r) => r.productId === productId);
    if (productReviews.length === 0) return '0.0';
    const total = productReviews.reduce((sum, r) => sum + r.rating, 0);
    return (total / productReviews.length).toFixed(1);
  };

  const getReviewCount = (productId: number) => {
    return reviews.filter((r) => r.productId === productId).length;
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('noken-token');
    if (!token) {
      toast.error('Silakan login terlebih dahulu untuk menulis review');
      return;
    }

    if (!userName || !selectedProduct || rating === 0 || !comment.trim()) {
      toast.warning('Silakan lengkapi semua bidang ulasan!');
      return;
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: selectedProduct,
          userName,
          rating,
          comment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Ulasan Anda berhasil dikirim! Terima kasih.');
        setSelectedProduct(null);
        setRating(0);
        setComment('');
        loadData(); // reload
      } else {
        toast.error(data.message || 'Gagal mengirim ulasan');
      }
    } catch (err) {
      toast.error('Gagal mengirim ulasan');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-8 md:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground font-playfair mb-2">
            Review Produk
          </h1>
          <p className="text-muted-foreground text-lg">
            Bagikan pengalaman Anda berbelanja dengan kami dan bantu pelanggan lain
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Review Form */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-20">
              <h2 className="text-2xl font-bold text-foreground mb-6 font-playfair">
                Tulis Review
              </h2>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Warning Login */}
                {!isLoggedIn && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-semibold">
                    Silakan login terlebih dahulu untuk mengirim review.
                  </div>
                )}
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Nama Anda
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder={isLoggedIn ? "" : "Silakan login terlebih dahulu"}
                    disabled={true}
                    className="w-full px-4 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg focus:outline-none text-sm cursor-not-allowed font-medium"
                  />
                </div>

                {/* Product Select */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Pilih Produk
                  </label>
                  <select
                    value={selectedProduct || ''}
                    onChange={(e) => setSelectedProduct(Number(e.target.value) || null)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="">-- Pilih Produk --</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Rating
                  </label>
                  <StarRating
                    rating={rating}
                    interactive
                    onRatingChange={setRating}
                    size="lg"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Komentar
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Bagikan pengalaman Anda..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!isLoggedIn}
                  className={`w-full font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-white ${
                    isLoggedIn ? 'bg-primary hover:bg-primary/90' : 'bg-gray-300 cursor-not-allowed text-gray-500'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  Kirim Review
                </button>
              </form>
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2">
            {/* Filter & Sort */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Filter */}
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Filter Produk
                  </label>
                  <select
                    value={filterProduct || ''}
                    onChange={(e) => setFilterProduct(Number(e.target.value) || null)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="">Semua Produk</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Urutkan
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'rating')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="newest">Terbaru</option>
                    <option value="rating">Rating Tertinggi</option>
                  </select>
                </div>
              </div>

              {filterProduct && (
                <button
                  onClick={() => setFilterProduct(null)}
                  className="text-primary hover:underline text-sm font-semibold"
                >
                  Reset Filter
                </button>
              )}
            </div>

            {/* Reviews */}
            {filteredReviews.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-12 text-center">
                <p className="text-muted-foreground text-lg mb-2">Belum ada review</p>
                <p className="text-muted-foreground text-sm">
                  Jadilah yang pertama memberikan review untuk produk ini
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={getResolvedSrc(review.productImage)}
                          alt={review.productName}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </div>

                      {/* Review Content */}
                      <div className="flex-1">
                        {/* Header */}
                        <div className="mb-3">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-1">
                            <div>
                              <p className="font-semibold text-foreground text-sm">
                                {review.userName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {review.productName}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.date).toLocaleDateString('id-ID', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>

                          {/* Rating */}
                          <div className="flex items-center gap-2">
                            <StarRating rating={review.rating} size="sm" />
                            <span className="text-xs font-semibold text-foreground">
                              {review.rating}.0
                            </span>
                          </div>
                        </div>

                        {/* Comment */}
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stats */}
            {filteredReviews.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-xl font-bold text-foreground mb-4 font-playfair flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Rating Produk
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((product) => {
                    const reviewCount = getReviewCount(product.id);
                    if (reviewCount === 0) return null;

                    return (
                      <div
                        key={product.id}
                        className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <img
                            src={getResolvedSrc(product.image)}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-foreground text-sm">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {reviewCount} review
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StarRating rating={parseFloat(getAverageRating(product.id))} size="sm" />
                          <span className="font-bold text-primary text-sm">
                            {getAverageRating(product.id)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
