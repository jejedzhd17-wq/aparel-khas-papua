import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Plus, Trash2, Edit2, X } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
}

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Kaos Raja Ampat',
    price: 149000,
    category: 'Kaos',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
  },
  {
    id: 2,
    name: 'Hoodie Papua Tribal',
    price: 299000,
    category: 'Hoodie',
    image: 'https://images.unsplash.com/photo-1556821552-919ad7b37f69?w=400&h=400&fit=crop',
  },
  {
    id: 3,
    name: 'Tas Noken Original',
    price: 199000,
    category: 'Tas Noken',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop',
  },
  {
    id: 4,
    name: 'Gelang Tradisional',
    price: 79000,
    category: 'Aksesoris',
    image: 'https://images.unsplash.com/photo-1515617293615-121f0c5c1241?w=400&h=400&fit=crop',
  },
  {
    id: 5,
    name: 'Kaos Wayang Papua',
    price: 159000,
    category: 'Kaos',
    image: 'https://images.unsplash.com/photo-1503341455253-b2e723bb12dd?w=400&h=400&fit=crop',
  },
  {
    id: 6,
    name: 'Hoodie Laut Biru',
    price: 319000,
    category: 'Hoodie',
    image: 'https://images.unsplash.com/photo-1571028846478-e8e62d7f8bf0?w=400&h=400&fit=crop',
  },
  {
    id: 7,
    name: 'Tas Noken Kulit',
    price: 249000,
    category: 'Tas Noken',
    image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400&h=400&fit=crop',
  },
  {
    id: 8,
    name: 'Kalung Batu Mulia',
    price: 129000,
    category: 'Aksesoris',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop',
  },
];

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Kaos',
    image: '',
  });

  useEffect(() => {
    const savedAdmin = localStorage.getItem('noken-admin');
    if (!savedAdmin) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.image) {
      alert('Lengkapi semua field');
      return;
    }

    const newProduct: Product = {
      id: Math.max(...products.map(p => p.id), 0) + 1,
      name: formData.name,
      price: parseInt(formData.price),
      category: formData.category,
      image: formData.image,
    };

    setProducts([...products, newProduct]);
    setFormData({ name: '', price: '', category: 'Kaos', image: '' });
    setShowAddForm(false);
  };

  const handleDeleteProduct = (id: number) => {
    if (confirm('Hapus produk ini?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('noken-admin');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="flex items-center justify-between px-4 py-4 md:px-8 max-w-7xl mx-auto">
          <Link to="/admin/dashboard" className="text-xl font-bold text-foreground font-playfair">
            Admin Panel
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-gray-100 rounded-lg text-muted-foreground hover:text-red-600"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Breadcrumb & Title */}
        <div className="mb-8">
          <Link to="/admin/dashboard" className="text-primary hover:underline text-sm mb-2 inline-block">
            ← Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-foreground font-playfair mb-2">
            Manajemen Produk
          </h1>
          <p className="text-muted-foreground">
            Total {products.length} produk
          </p>
        </div>

        {/* Add Product Button */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="mb-6 flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Produk Baru
        </button>

        {/* Add Product Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-foreground">Tambah Produk Baru</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Nama Produk
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nama produk"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Harga (Rp)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>Kaos</option>
                    <option>Hoodie</option>
                    <option>Tas Noken</option>
                    <option>Aksesoris</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  URL Gambar
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Simpan Produk
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2 border border-gray-300 text-foreground font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Produk</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Kategori</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Harga</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <span className="font-medium text-foreground">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 font-semibold text-foreground">
                      Rp {product.price.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-muted-foreground hover:text-primary transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-muted-foreground hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
