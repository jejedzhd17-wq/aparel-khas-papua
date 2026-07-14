import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import AdminTable from '@/components/AdminTable';
import AdminModal from '@/components/AdminModal';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: number;
  name: string;
  description: string;
  productCount: number;
}

export default function AdminCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const getAdminToken = () => {
    return sessionStorage.getItem('noken-admin-token');
  };

  useEffect(() => {
    const savedAdmin = sessionStorage.getItem('noken-admin');
    if (!savedAdmin) {
      navigate('/admin/login');
      return;
    }
    loadCategories();
  }, [navigate]);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success && data.data) {
        setCategories(data.data);
      } else {
        toast.error(data.message || 'Gagal memuat kategori');
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan koneksi server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({ name: category.name, description: category.description });
    setShowModal(true);
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Hapus kategori "${category.name}"?`)) return;

    try {
      const token = getAdminToken();
      const res = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Kategori berhasil dihapus');
        loadCategories();
      } else {
        toast.error(data.message || 'Gagal menghapus kategori');
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghubungi server');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = getAdminToken();
      const method = selectedCategory ? 'PUT' : 'POST';
      const url = selectedCategory ? `/api/categories/${selectedCategory.id}` : '/api/categories';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(selectedCategory ? 'Kategori berhasil diupdate' : 'Kategori baru berhasil dibuat');
        loadCategories();
        setShowModal(false);
        resetForm();
      } else {
        toast.error(data.message || 'Gagal menyimpan kategori');
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghubungi server');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setSelectedCategory(null);
  };

  const columns = [
    { key: 'name' as const, label: 'Nama Kategori' },
    { key: 'description' as const, label: 'Deskripsi', hideOnMobile: true },
    { key: 'productCount' as const, label: 'Total Produk' },
    { key: 'actions' as const, label: 'Aksi' },
  ];

  return (
    <AdminLayout title="Kategori" description="Kelola kategori produk toko Aparel Khas Papua Store">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Daftar Kategori</h2>
          <p className="text-xs text-gray-500 mt-0.5">{categories.length} kategori tersedia</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-1.5 bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary/90 text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Kategori Baru
        </button>
      </div>

      <AdminTable
        columns={columns}
        data={categories}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AdminModal
        title={selectedCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Nama Kategori
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
              placeholder="cth: Tas Noken"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Deskripsi Kategori
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm resize-none"
              rows={3}
              placeholder="Tulis deskripsi singkat..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary/90 text-sm transition-colors"
            >
              {selectedCategory ? 'Simpan' : 'Tambah'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-50 text-sm transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </AdminModal>
    </AdminLayout>
  );
}
