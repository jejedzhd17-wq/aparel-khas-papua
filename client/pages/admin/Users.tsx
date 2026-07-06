import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import AdminTable from '@/components/AdminTable';
import AdminModal from '@/components/AdminModal';
import { Plus, AlertCircle } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  address?: string;
  joinDate: string;
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user' as 'user' | 'admin',
    password: '',
    phone: '',
  });

  const getToken = () => localStorage.getItem('noken-admin-token');

  useEffect(() => {
    const savedAdmin = localStorage.getItem('noken-admin');
    if (!savedAdmin) {
      navigate('/login');
      return;
    }
    loadUsers();
  }, [navigate]);

  const loadUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        setError(data.message || 'Gagal memuat data');
      }
    } catch {
      setError('Gagal terhubung ke server');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', role: 'user', password: '', phone: '' });
    setSelectedUser(null);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role, password: '', phone: user.phone || '' });
    setShowModal(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter((u) => u.id !== selectedUser.id));
      } else {
        alert(data.message || 'Gagal menghapus');
      }
    } catch {
      alert('Gagal terhubung ke server');
    } finally {
      setShowDeleteConfirm(false);
      setSelectedUser(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        const res = await fetch(`/api/users/${selectedUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify({ name: formData.name, email: formData.email, role: formData.role, phone: formData.phone || undefined }),
        });
        const data = await res.json();
        if (data.success) await loadUsers();
        else alert(data.message || 'Gagal mengupdate');
      } else {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify({ name: formData.name, email: formData.email, role: formData.role, password: formData.password, phone: formData.phone || undefined }),
        });
        const data = await res.json();
        if (data.success) await loadUsers();
        else alert(data.message || 'Gagal membuat user');
      }
    } catch {
      alert('Gagal terhubung ke server');
    } finally {
      resetForm();
      setShowModal(false);
    }
  };

  const columns = [
    { key: 'name' as const, label: 'Nama Lengkap' },
    { key: 'email' as const, label: 'Email', hideOnMobile: true },
    { key: 'phone' as const, label: 'No. HP', hideOnMobile: true },
    {
      key: 'role' as const,
      label: 'Peran',
      render: (value: string) => (
        <span
          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${
            value === 'admin'
              ? 'bg-purple-50 text-purple-700 border-purple-100'
              : 'bg-gray-50 text-gray-700 border-gray-200'
          }`}
        >
          {value === 'admin' ? 'Admin' : 'Pelanggan'}
        </span>
      ),
    },
    { key: 'joinDate' as const, label: 'Tanggal Gabung', hideOnMobile: true },
    { key: 'actions' as const, label: 'Aksi' },
  ];

  return (
    <AdminLayout title="Pengguna" description="Kelola hak akses pengguna dan admin store">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Daftar Pengguna</h2>
          <p className="text-xs text-gray-500 mt-0.5">Total {users.length} user terdaftar</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-1.5 bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary/90 text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Pengguna Baru
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <AdminTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Add / Edit Modal */}
      <AdminModal
        title={selectedUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Nama Lengkap</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
              placeholder="cth: Budi Santoso"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
              placeholder="budi@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">No. HP</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
              placeholder="08xxxxxxxxxx"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Peran</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'admin' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm bg-white"
            >
              <option value="user">Pelanggan</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {!selectedUser && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Password</label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                placeholder="••••••••"
                required={!selectedUser}
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary/90 text-sm transition-colors"
            >
              {selectedUser ? 'Simpan' : 'Tambah'}
            </button>
            <button
              type="button"
              onClick={() => { setShowModal(false); resetForm(); }}
              className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-50 text-sm transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirm Modal */}
      <AdminModal
        title="Konfirmasi Hapus Pengguna"
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setSelectedUser(null); }}
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex gap-3 items-start">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Hapus pengguna ini?</p>
              <p className="text-xs text-gray-600 mt-1">
                Akun <strong className="text-gray-900">{selectedUser?.name}</strong> akan dihapus permanen.
              </p>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={confirmDelete}
              className="flex-1 bg-red-600 text-white font-semibold py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Hapus
            </button>
            <button
              onClick={() => { setShowDeleteConfirm(false); setSelectedUser(null); }}
              className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-50 text-sm transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      </AdminModal>
    </AdminLayout>
  );
}
