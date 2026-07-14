import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import AdminTable from '@/components/AdminTable';
import StarRating from '@/components/StarRating';
import { toast } from 'sonner';

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

  const getAdminToken = () => {
    return sessionStorage.getItem('noken-admin-token');
  };

  useEffect(() => {
    const savedAdmin = sessionStorage.getItem('noken-admin');
    if (!savedAdmin) {
      navigate('/admin/login');
      return;
    }
    loadReviews();
  }, [navigate]);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (data.success && data.data) {
        const mapped = data.data.map((r: any) => ({
          id: r.id,
          product: r.productName || 'Produk',
          user: r.userName || 'Anonim',
          rating: r.rating,
          comment: r.comment || '',
          date: r.date ? r.date.split('T')[0] : '2024-01-01',
        }));
        setReviews(mapped);
      } else {
        toast.error('Gagal memuat ulasan');
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
      toast.error('Gagal menghubungkan ke server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (review: Review) => {
    if (!confirm(`Hapus ulasan dari ${review.user}?`)) return;
    try {
      const token = getAdminToken();
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Ulasan berhasil dihapus');
        loadReviews();
      } else {
        toast.error(data.message || 'Gagal menghapus ulasan');
      }
    } catch (err) {
      console.error('Delete review error:', err);
      toast.error('Terjadi kesalahan koneksi');
    }
  };

  const columns = [
    { key: 'product' as const, label: 'Produk' },
    { key: 'user' as const, label: 'Nama User' },
    {
      key: 'rating' as const,
      label: 'Rating',
      render: (value: number) => <StarRating rating={value} size="sm" />,
    },
    {
      key: 'comment' as const,
      label: 'Komentar/Ulasan',
      render: (value: string) => (
        <p className="max-w-[200px] truncate text-xs text-gray-600" title={value}>{value}</p>
      ),
    },
    { key: 'date' as const, label: 'Tanggal', hideOnMobile: true },
    { key: 'actions' as const, label: 'Aksi' },
  ];

  return (
    <AdminLayout title="Ulasan" description="Pantau ulasan dan rating produk dari pembeli">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">Daftar Ulasan</h2>
        <p className="text-xs text-gray-500 mt-0.5">{reviews.length} ulasan diterima</p>
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
