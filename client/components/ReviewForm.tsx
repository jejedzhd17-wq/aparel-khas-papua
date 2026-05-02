import { useState } from 'react';
import StarRating from './StarRating';
import { Send } from 'lucide-react';

interface ReviewFormProps {
  productId: number;
  onSubmitSuccess?: () => void;
}

export default function ReviewForm({ productId, onSubmitSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!userName.trim() || rating === 0 || !comment.trim()) {
      setError('Lengkapi semua field');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call to POST /reviews
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          userName: userName.trim(),
          rating,
          comment: comment.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal mengirim review');
      }

      // Reset form
      setUserName('');
      setRating(0);
      setComment('');
      setSuccess(true);

      // Show success message for 3 seconds
      setTimeout(() => setSuccess(false), 3000);

      // Callback to refresh reviews
      onSubmitSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-foreground mb-6 font-playfair">
        Tulis Review
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          ✓ Review berhasil dikirim!
        </div>
      )}

      <div className="space-y-4">
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
            disabled={isSubmitting}
          />
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
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
            isSubmitting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary/90'
          }`}
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? 'Mengirim...' : 'Kirim Review'}
        </button>
      </div>
    </form>
  );
}
