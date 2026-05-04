import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import AdminTable from '@/components/AdminTable';
import StarRating from '@/components/StarRating';

interface Review {
  id: number;
  product: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export default function AdminReviews() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedAdmin = localStorage.getItem('noken-admin');
    if (!savedAdmin) {
      navigate('/admin/login');
      return;
    }

    loadReviews();
  }, [navigate]);

  const loadReviews = () => {
    setIsLoading(true);
    setTimeout(() => {
      setReviews([
        {
          id: 1,
          product: 'Kaos Raja Ampat',
          user: 'Budi Santoso',
          rating: 5,
          comment: 'Great quality product, very satisfied!',
          date: '2024-01-15',
        },
        {
          id: 2,
          product: 'Hoodie Papua',
          user: 'Siti Nurhaliza',
          rating: 4,
          comment: 'Good product but sizing runs large',
          date: '2024-01-12',
        },
        {
          id: 3,
          product: 'Tas Noken',
          user: 'Ahmad Wijaya',
          rating: 5,
          comment: 'Authentic and beautiful design!',
          date: '2024-01-10',
        },
        {
          id: 4,
          product: 'Gelang Tradisional',
          user: 'Dewi Lestari',
          rating: 4,
          comment: 'Nice accessory, good value',
          date: '2024-01-08',
        },
        {
          id: 5,
          product: 'Kaos Wayang',
          user: 'Rinto Harahap',
          rating: 3,
          comment: 'Okay product but colors faded quickly',
          date: '2024-01-05',
        },
      ]);
      setIsLoading(false);
    }, 500);
  };

  const handleDelete = (review: Review) => {
    if (confirm(`Delete review by ${review.user}?`)) {
      setReviews(reviews.filter((r) => r.id !== review.id));
    }
  };

  const columns = [
    { key: 'product' as const, label: 'Product' },
    { key: 'user' as const, label: 'User' },
    {
      key: 'rating' as const,
      label: 'Rating',
      render: (value: number) => <StarRating rating={value} size="sm" />,
    },
    {
      key: 'comment' as const,
      label: 'Comment',
      render: (value: string) => (
        <p className="max-w-xs truncate">{value}</p>
      ),
    },
    { key: 'date' as const, label: 'Date' },
    { key: 'actions' as const, label: 'Actions' },
  ];

  return (
    <AdminLayout title="Reviews" description="Manage product reviews">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Review List</h2>
        <p className="text-sm text-gray-600">Total: {reviews.length} reviews</p>
      </div>

      <AdminTable
        columns={columns}
        data={reviews}
        isLoading={isLoading}
        onDelete={handleDelete}
      />
    </AdminLayout>
  );
}
