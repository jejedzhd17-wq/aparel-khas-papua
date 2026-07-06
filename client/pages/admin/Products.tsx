import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import AdminModal from '@/components/AdminModal';
import { Plus, AlertCircle, Pencil, Trash2, Search, ImageOff } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  description?: string;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop';

function getResolvedUrl(raw: string) {
  if (!raw) return FALLBACK_IMAGE;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  if (raw.startsWith('/')) return raw;
  return `/uploads/${raw}`;
}

function ProductImage({ src, alt, size = 'sm' }: { src: string; alt: string; size?: 'sm' | 'md' }) {
  const [imgSrc, setImgSrc] = useState(getResolvedUrl(src));
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Sync when src prop changes (e.g. after product list reload)
  useEffect(() => {
    setImgSrc(getResolvedUrl(src));
    setLoaded(false);
    setHasError(false);
  }, [src]);

  const sizeClass = size === 'md'
    ? 'w-16 h-16 sm:w-20 sm:h-20'
    : 'w-10 h-10 sm:w-12 sm:h-12';

  return (
    <div className={`relative ${sizeClass} rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0 shadow-sm`}>
      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
          <ImageOff className="w-4 h-4 text-amber-400" />
        </div>
      ) : (
        <img
          src={imgSrc}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => {
            setHasError(true);
            setLoaded(true);
          }}
        />
      )}
    </div>
  );
}

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Pakaian',
    price: '',
    stock: '',
    image: '',
    description: '',
  });

  useEffect(() => {
    const savedAdmin = localStorage.getItem('noken-admin');
    if (!savedAdmin) {
      navigate('/login');
      return;
    }
    loadProducts();
  }, [navigate]);

  const getAuthHeader = () => {
    const token = localStorage.getItem('noken-admin-token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/products?limit=100');
      const data = await res.json();
      if (data.success && data.data) {
        const mapped = data.data.map((p: any) => ({
          id: p.id,
          name: p.name || p.nama_produk,
          category: p.category || p.kategori || '-',
          price: parseFloat(p.price || p.harga || 0),
          stock: parseInt(p.stock || p.stok || 0),
          image: p.image || p.gambar || '',
          description: p.description || p.deskripsi || '',
        }));
        setProducts(mapped);
      }
    } catch (err) {
      toast.error('Gagal memuat data produk dari server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      image: product.image,
      description: product.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    try {
      const res = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      });
      const data = await res.json();
      if (data.success) {
        setProducts(products.filter((p) => p.id !== selectedProduct.id));
        toast.success(`Produk "${selectedProduct.name}" berhasil dihapus.`);
      } else {
        toast.error(data.message || 'Gagal menghapus produk.');
      }
    } catch {
      toast.error('Terjadi kesalahan saat menghapus produk.');
    }
    setShowDeleteConfirm(false);
    setSelectedProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = selectedProduct ? 'PUT' : 'POST';
      const endpoint = selectedProduct ? `/api/products/${selectedProduct.id}` : '/api/products';
      const body = {
        name: formData.name,
        category: formData.category,
        price: parseInt(formData.price),
        stock: parseInt(formData.stock),
        image: formData.image,
        description: formData.description,
      };
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(selectedProduct ? 'Produk berhasil diupdate!' : 'Produk berhasil ditambahkan!');
        await loadProducts();
      } else {
        toast.error(data.message || 'Gagal menyimpan produk.');
      }
    } catch {
      toast.error('Terjadi kesalahan saat menyimpan produk.');
    }
    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setFormData({ name: '', category: 'Pakaian', price: '', stock: '', image: '', description: '' });
    setSelectedProduct(null);
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStockBadge = (stock: number) => {
    if (stock === 0) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Habis</span>;
    if (stock < 10) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">{stock}</span>;
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">{stock}</span>;
  };

  return (
    <AdminLayout title="Produk" description="Kelola katalog produk Aparel Khas Papua Store">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Daftar Produk</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {isLoading ? 'Memuat...' : `${products.length} produk terdaftar`}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Tambah Produk
          </button>
        </div>
      </div>

      {/* Responsive Content Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Memuat data produk...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            {searchQuery ? `Tidak ada produk yang cocok dengan "${searchQuery}"` : 'Belum ada produk.'}
          </div>
        ) : (
          <>
            {/* Mobile List View (only on screens smaller than sm) */}
            <div className="sm:hidden divide-y divide-gray-100">
              {filtered.map((product) => (
                <div key={product.id} className="p-4 flex items-start gap-3">
                  <ProductImage src={product.image} alt={product.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Kategori: {product.category}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm font-semibold text-gray-950">
                        Rp {product.price.toLocaleString('id-ID')}
                      </span>
                      <span className="text-xs text-gray-400">|</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-400">Stok:</span>
                        {getStockBadge(product.stock)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100 flex items-center justify-center"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100 flex items-center justify-center"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (hidden on mobile) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Produk</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kategori</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Harga</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stok</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <ProductImage src={product.image} alt={product.name} />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate max-w-xs">{product.name}</p>
                            {product.description && (
                              <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{product.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        Rp {product.price.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3">
                        {getStockBadge(product.stock)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AdminModal
        title={selectedProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Nama Produk</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                placeholder="cth: Aparel Khas Papua Anyaman Alami"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
              >
                <option>Pakaian</option>
                <option>Tas Noken</option>
                <option>Aksesoris</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Harga (Rp)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                placeholder="cth: 150000"
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Stok</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                placeholder="cth: 50"
                required
                min="0"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">URL Gambar</label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                placeholder="https://images.unsplash.com/... atau URL gambar lainnya"
              />
              <p className="text-[11px] text-gray-400 mt-1">Tempel URL gambar dari internet (harus dimulai dengan https://)</p>
            </div>

            {/* Image Preview — Full size, clear feedback */}
            {formData.image && (
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-500 font-semibold uppercase mb-2">Preview Gambar:</p>
                <div className="relative w-full max-w-xs h-48 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
                  <img
                    key={formData.image}
                    src={formData.image.startsWith('http') ? formData.image : formData.image.startsWith('/') ? formData.image : `/uploads/${formData.image}`}
                    alt="preview"
                    className="w-full h-full object-cover rounded-xl"
                    onLoad={(e) => { (e.target as HTMLImageElement).style.opacity = '1'; }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.img-error-msg')) {
                        const msg = document.createElement('div');
                        msg.className = 'img-error-msg flex flex-col items-center justify-center gap-2 text-center p-4';
                        msg.innerHTML = '<span style="font-size:2rem">⚠️</span><p class="text-xs text-red-500 font-semibold">URL gambar tidak valid atau tidak dapat dimuat.<br/>Pastikan URL benar dan dapat diakses.</p>';
                        parent.appendChild(msg);
                      }
                    }}
                    style={{ opacity: 0, transition: 'opacity 0.3s' }}
                  />
                </div>
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Deskripsi</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm resize-none"
                rows={3}
                placeholder="Deskripsi singkat produk..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              {selectedProduct ? 'Simpan' : 'Tambah'}
            </button>
            <button
              type="button"
              onClick={() => { setShowModal(false); resetForm(); }}
              className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Batal
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirm Modal */}
      <AdminModal
        title="Konfirmasi Hapus Produk"
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex gap-3 items-start">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Hapus produk ini?</p>
              <p className="text-xs text-gray-600 mt-1">
                Produk <strong className="text-gray-900">{selectedProduct?.name}</strong> akan dihapus secara permanen.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={confirmDelete}
              className="flex-1 bg-red-600 text-white font-semibold py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Hapus
            </button>
            <button
              onClick={() => { setShowDeleteConfirm(false); setSelectedProduct(null); }}
              className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Batal
            </button>
          </div>
        </div>
      </AdminModal>
    </AdminLayout>
  );
}