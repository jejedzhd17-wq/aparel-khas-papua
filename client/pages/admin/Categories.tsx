import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import AdminTable from '@/components/AdminTable';
import AdminModal from '@/components/AdminModal';
import { Plus } from 'lucide-react';

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

  useEffect(() => {
    const savedAdmin = localStorage.getItem('noken-admin');
    if (!savedAdmin) {
      navigate('/admin/login');
      return;
    }

    loadCategories();
  }, [navigate]);

  const loadCategories = () => {
    setIsLoading(true);
    setTimeout(() => {
      setCategories([
        { id: 1, name: 'Kaos', description: 'T-shirts and casual wear', productCount: 12 },
        { id: 2, name: 'Hoodie', description: 'Hoodies and sweatshirts', productCount: 8 },
        { id: 3, name: 'Tas', description: 'Bags and accessories', productCount: 6 },
        { id: 4, name: 'Aksesoris', description: 'Jewelry and small items', productCount: 10 },
      ]);
      setIsLoading(false);
    }, 500);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({ name: category.name, description: category.description });
    setShowModal(true);
  };

  const handleDelete = (category: Category) => {
    if (confirm(`Delete category "${category.name}"?`)) {
      setCategories(categories.filter((c) => c.id !== category.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedCategory) {
      setCategories(
        categories.map((c) =>
          c.id === selectedCategory.id ? { ...c, ...formData } : c
        )
      );
    } else {
      setCategories([
        ...categories,
        {
          id: Math.max(...categories.map((c) => c.id), 0) + 1,
          name: formData.name,
          description: formData.description,
          productCount: 0,
        },
      ]);
    }

    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setSelectedCategory(null);
  };

  const columns = [
    { key: 'name' as const, label: 'Category Name' },
    { key: 'description' as const, label: 'Description' },
    { key: 'productCount' as const, label: 'Products' },
    { key: 'actions' as const, label: 'Actions' },
  ];

  return (
    <AdminLayout title="Categories" description="Manage product categories">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Category List</h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
        >
          <Plus className="w-5 h-5" />
          Add Category
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
        title={selectedCategory ? 'Edit Category' : 'Add Category'}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Category Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary text-white font-medium py-2 rounded-lg hover:bg-primary/90"
            >
              {selectedCategory ? 'Update' : 'Add'} Category
            </button>
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="flex-1 border border-gray-300 text-gray-900 font-medium py-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </AdminModal>
    </AdminLayout>
  );
}
