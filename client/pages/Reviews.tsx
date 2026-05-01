import { useState } from 'react';
import Navigation from '@/components/Navigation';
import StarRating from '@/components/StarRating';
import { Send, Filter, TrendingUp } from 'lucide-react';

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

// Mock products
const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Kaos Raja Ampat',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop',
    category: 'Kaos',
  },
  {
    id: 2,
    name: 'Hoodie Papua Tribal',
    image: 'https://images.unsplash.com/photo-1556821552-919ad7b37f69?w=100&h=100&fit=crop',
    category: 'Hoodie',
  },
  {
    id: 3,
    name: 'Tas Noken Original',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=100&h=100&fit=crop',
    category: 'Tas',
  },
  {
    id: 4,
    name: 'Gelang Tradisional',
    image: 'https://images.unsplash.com/photo-1515617293615-121f0c5c1241?w=100&h=100&fit=crop',
    category: 'Aksesoris',
  },
  {
    id: 5,
    name: 'Kaos Wayang Papua',
    image: 'https://images.unsplash.com/photo-1503341455253-b2e723bb12dd?w=100&h=100&fit=crop',
    category: 'Kaos',
  },
];

// Mock reviews
const MOCK_REVIEWS: Review[] = [
  {
    id: 1,
    productId: 1,
    productName: 'Kaos Raja Ampat',
    productImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop',
    userName: 'Budi Santoso',
    rating: 5,
    comment:
      'Sangat puas dengan kualitas kaosnya! Desainnya indah dan bahannya nyaman dipakai. Akan beli lagi!',
    date: '2024-01-15',
  },
  {
    id: 2,
    productId: 2,
    productName: 'Hoodie Papua Tribal',
    productImage: 'https://images.unsplash.com/photo-1556821552-919ad7b37f69?w=100&h=100&fit=crop',
    userName: 'Siti Nurhaliza',
    rating: 4,
    comment:
      'Hoodie bagus dan nyaman. Hanya saja sizing sedikit kebesaran, tapi overall sangat memuaskan.',
    date: '2024-01-12',
  },
  {
    id: 3,
    productId: 3,
    productName: 'Tas Noken Original',
    productImage: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=100&h=100&fit=crop',
    userName: 'Ahmad Wijaya',
    rating: 5,
    comment:
      'Tas noken asli berkualitas tinggi. Desain tradisional yang sempurna dan bahan sangat kuat. Rekomendasi untuk semua!',
    date: '2024-01-10',
  },
  {
    id: 4,
    productId: 1,
    productName: 'Kaos Raja Ampat',
    productImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop',
    userName: 'Dewi Lestari',
    rating: 4,
    comment: 'Kaos berkualitas dengan desain yang unik. Warna cerah dan tidak mudah pudar.',
    date: '2024-01-08',
  },
  {
    id: 5,
    productId: 4,
    productName: 'Gelang Tradisional',
    productImage: 'https://images.unsplash.com/photo-1515617293615-121f0c5c1241?w=100&h=100&fit=crop',
    userName: 'Rinto Harahap',
    rating: 5,
    comment: 'Gelang sangat indah dan autentik. Craftsmanship nya luar biasa. Nilai jual beli sangat fair!',
    date: '2024-01-05',
  },
  {
    id: 6,
    productId: 2,
    productName: 'Hoodie Papua Tribal',
    productImage: 'https://images.unsplash.com/photo-1556821552-919ad7b37f69?w=100&h=100&fit=crop',
    userName: 'Maya Kusuma',
    rating: 3,
    comment: 'Desainnya bagus tapi harga agak mahal. Kualitas okaylah untuk harganya.',
    date: '2024-01-02',
  },
];

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [filterProduct, setFilterProduct] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'rating'>('newest');
  const [rating, setRating] = useState<number>(0);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');

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
    if (productReviews.length === 0) return 0;
    const total = productReviews.reduce((sum, r) => sum + r.rating, 0);
    return (total / productReviews.length).toFixed(1);
  };

  const getReviewCount = (productId: number) => {
    return reviews.filter((r) => r.productId === productId).length;
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName || !selectedProduct || rating === 0 || !comment.trim()) {
      alert('Lengkapi semua field');
      return;
    }

    const product = PRODUCTS.find((p) => p.id === selectedProduct);
    if (!product) return;

    const newReview: Review = {
      id: Math.max(...reviews.map((r) => r.id), 0) + 1,
      productId: selectedProduct,
      productName: product.name,
      productImage: product.image,
      userName,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0],
    };

    setReviews([newReview, ...reviews]);
    setUserName('');
    setSelectedProduct(null);
    setRating(0);
    setComment('');
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
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Nama Anda
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Nama"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
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
                    {PRODUCTS.map((product) => (
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
                  className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
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
                    {PRODUCTS.map((product) => (
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
                          src={review.productImage}
                          alt={review.productName}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </div>

                      {/* Review Content */}
                      <div className="flex-1">
                        {/* Header */}
                        <div className="mb-3">
                          <div className="flex items-start justify-between mb-2">
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
                  {PRODUCTS.map((product) => {
                    const reviewCount = getReviewCount(product.id);
                    if (reviewCount === 0) return null;

                    return (
                      <div
                        key={product.id}
                        className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <img
                            src={product.image}
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
    </div>
  );
}
