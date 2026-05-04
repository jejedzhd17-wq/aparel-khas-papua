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
      price: Number(formData.price),
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
          <Link to="/admin/dashboard" className="text-xl font-bold">
            Admin Panel
          </Link>

          <button onClick={handleLogout}>
            <LogOut />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">

        <h1 className="text-2xl font-bold mb-4">
          Manajemen Produk ({products.length})
        </h1>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="mb-4 flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          <Plus /> Tambah Produk
        </button>

        {/* FORM */}
        {showAddForm && (
          <form onSubmit={handleAddProduct} className="bg-white p-4 mb-4 rounded shadow space-y-2">
            <input
              type="text"
              placeholder="Nama"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border p-2 w-full"
            />

            <input
              type="number"
              placeholder="Harga"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="border p-2 w-full"
            />

            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="border p-2 w-full"
            >
              <option>Kaos</option>
              <option>Hoodie</option>
              <option>Tas Noken</option>
              <option>Aksesoris</option>
            </select>

            <input
              type="text"
              placeholder="URL Gambar"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="border p-2 w-full"
            />

            <div className="flex gap-2">
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
                Simpan
              </button>

              <button type="button" onClick={() => setShowAddForm(false)}>
                Batal
              </button>
            </div>
          </form>
        )}

        {/* TABLE */}
        <table className="w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Kategori</th>
              <th>Harga</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>Rp {p.price.toLocaleString()}</td>
                <td>
                  <button onClick={() => handleDeleteProduct(p.id)}>
                    <Trash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </main>
    </div>
  );
}