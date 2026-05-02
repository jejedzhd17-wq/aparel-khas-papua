import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import AdminTable from '@/components/AdminTable';
import AdminModal from '@/components/AdminModal';
import { Plus, AlertCircle } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
}

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Kaos',
    price: '',
    stock: '',
    image: '',
    description: '',
  });

  useEffect(() => {
    const savedAdmin = localStorage.getItem('noken-admin');
    if (!savedAdmin) {
      navigate('/admin/login');
      return;
    }

    loadProducts();
  }, [navigate]);

  const loadProducts = () => {
    setIsLoading(true);
    // Mock data
    setTimeout(() => {
      setProducts([
        {
          id: 1,
          name: 'Kaos Raja Ampat',
          category: 'Kaos',
          price: 149000,
          stock: 45,
          image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop',
        },
        {
          id: 2,
          name: 'Hoodie Papua Tribal',
          category: 'Hoodie',
          price: 299000,
          stock: 28,
          image: 'https://images.unsplash.com/photo-1556821552-919ad7b37f69?w=100&h=100&fit=crop',
        },
        {
          id: 3,
          name: 'Tas Noken Original',
          category: 'Tas',
          price: 199000,
          stock: 15,
          image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=100&h=100&fit=crop',
        },
        {
          id: 4,
          name: 'Gelang Tradisional',
          category: 'Aksesoris',
          price: 79000,
          stock: 62,
          image: 'https://images.unsplash.com/photo-1515617293615-121f0c5c1241?w=100&h=100&fit=crop',
        },
      ]);
      setIsLoading(false);
    }, 500);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      image: product.image,
      description: '',
    });
    setShowModal(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (selectedProduct) {
      setProducts(products.filter((p) => p.id !== selectedProduct.id));
      setShowDeleteConfirm(false);
      setSelectedProduct(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedProduct) {
      // Update existing
      setProducts(
        products.map((p) =>
          p.id === selectedProduct.id
            ? {
                ...p,
                name: formData.name,
                category: formData.category,
                price: parseInt(formData.price),
                stock: parseInt(formData.stock),
              }
            : p
        )
      );
    } else {
      // Add new
      setProducts([
        ...products,
        {
          id: Math.max(...products.map((p) => p.id), 0) + 1,
          name: formData.name,
          category: formData.category,
          price: parseInt(formData.price),
          stock: parseInt(formData.stock),
          image: formData.image || 'https://via.placeholder.com/100',
        },
      ]);
    }

    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Kaos',
      price: '',
      stock: '',
      image: '',
      description: '',
    });
    setSelectedProduct(null);
  };

  const columns = [
    {
      key: 'image' as const,
      label: 'Image',
      render: (value: string) => (
        <img src={value} alt="product" className="w-10 h-10 rounded object-cover" />
      ),
      width: 'w-12',
    },
    { key: 'name' as const, label: 'Product Name' },
    { key: 'category' as const, label: 'Category' },
    {
      key: 'price' as const,
      label: 'Price',
      render: (value: number) => `Rp ${value.toLocaleString('id-ID')}`,
    },
    { key: 'stock' as const, label: 'Stock' },
    { key: 'actions' as const, label: 'Actions' },
  ];

  return (
    <AdminLayout
      title="Products"
      description="Manage your product catalog"
    >
      {/* Add Product Button */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Product List</h2>
          <p className="text-sm text-gray-600">Total: {products.length} products</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Products Table */}
      <AdminTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        emptyMessage="No products found"
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Add/Edit Modal */}
      <AdminModal
        title={selectedProduct ? 'Edit Product' : 'Add New Product'}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Product Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option>Kaos</option>
                <option>Hoodie</option>
                <option>Tas</option>
                <option>Aksesoris</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Price (Rp)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Stock
            </label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
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
              className="flex-1 bg-primary text-white font-medium py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              {selectedProduct ? 'Update' : 'Add'} Product
            </button>
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="flex-1 border border-gray-300 text-gray-900 font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <AdminModal
        title="Confirm Delete"
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <p className="text-gray-900">
              Are you sure you want to delete <strong>{selectedProduct?.name}</strong>? This
              action cannot be undone.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={confirmDelete}
              className="flex-1 bg-red-600 text-white font-medium py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 border border-gray-300 text-gray-900 font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </AdminModal>
    </AdminLayout>
  );
}
