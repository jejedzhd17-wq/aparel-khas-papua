import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[...Array(maxRating)].map((_, index) => {
        const fillPercentage = Math.max(0, Math.min(1, rating - index));
        const isFilled = fillPercentage >= 1;
        const isPartial = fillPercentage > 0 && fillPercentage < 1;

        return (
          <button
            key={index}
            onClick={() => handleClick(index + 1)}
            className={`relative transition-transform ${
              interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
            }`}
            disabled={!interactive}
          >
            {/* Background star (empty) */}
            <Star
              className={`${sizeClasses[size]} text-gray-300`}
              strokeWidth={1.5}
            />

            {/* Filled star (overlay) */}
            {(isFilled || isPartial) && (
              <div
                className="absolute top-0 left-0 overflow-hidden transition-all"
                style={{ width: `${fillPercentage * 100}%` }}
              >
                <Star
                  className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`}
                  strokeWidth={1.5}
                />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
