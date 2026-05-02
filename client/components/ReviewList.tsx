import { useState, useEffect } from 'react';
import StarRating from './StarRating';
import { Loader2, MessageCircle } from 'lucide-react';

interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

interface ReviewListProps {
  productId: number;
  refreshTrigger?: number;
}

export default function ReviewList({ productId, refreshTrigger = 0 }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [productId, refreshTrigger]);

  const fetchReviews = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call to GET /reviews?product_id={productId}
      const response = await fetch(`/api/reviews?product_id=${productId}`);

      if (!response.ok) {
        // For demo purposes, use mock data if API fails
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      setReviews(data);
      calculateAverageRating(data);
    } catch (err) {
      // Use mock reviews for demo
      const mockReviews: Review[] = [
        {
          id: 1,
          userName: 'Budi Santoso',
          rating: 5,
          comment: 'Sangat puas dengan kualitas produk! Desainnya indah dan bahannya nyaman dipakai.',
          date: '2024-01-15',
        },
        {
          id: 2,
          userName: 'Siti Nurhaliza',
          rating: 4,
          comment: 'Produk bagus dan berkualitas. Hanya saja pengiriman sedikit lama, tapi overall sangat memuaskan.',
          date: '2024-01-12',
        },
        {
          id: 3,
          userName: 'Ahmad Wijaya',
          rating: 5,
          comment: 'Kualitas terbaik! Design tradisional yang sempurna. Akan beli lagi!',
          date: '2024-01-10',
        },
      ];

      setReviews(mockReviews);
      calculateAverageRating(mockReviews);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAverageRating = (reviewList: Review[]) => {
    if (reviewList.length === 0) {
      setAverageRating(0);
      return;
    }

    const total = reviewList.reduce((sum, review) => sum + review.rating, 0);
    setAverageRating(total / reviewList.length);
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Memuat review...</p>
      </div>
    );
  }

  if (error && reviews.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Average Rating */}
      {reviews.length > 0 && (
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 font-playfair">
            Rating Produk
          </h3>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-4xl font-bold text-primary">
                {averageRating.toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">dari 5</p>
            </div>
            <div className="flex-1">
              <div className="mb-2">
                <StarRating rating={Math.round(averageRating * 2) / 2} size="md" />
              </div>
              <p className="text-sm text-muted-foreground">
                Berdasarkan {reviews.length} review
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg mb-2">
            Belum ada review untuk produk ini
          </p>
          <p className="text-muted-foreground text-sm">
            Jadilah yang pertama memberikan review
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground font-playfair">
            Review Pelanggan ({reviews.length})
          </h3>
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-foreground">{review.userName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.date).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <span className="text-xs font-semibold text-primary">
                  {review.rating}.0
                </span>
              </div>

              {/* Rating Stars */}
              <div className="mb-3">
                <StarRating rating={review.rating} size="sm" />
              </div>

              {/* Comment */}
              <p className="text-muted-foreground text-sm leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
