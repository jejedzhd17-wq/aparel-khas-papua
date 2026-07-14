import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import { Plus, Pencil, Trash2, CreditCard, Wallet, ToggleLeft, ToggleRight, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface BankAccount {
  id: number;
  type: 'bank' | 'ewallet';
  name: string;
  account_number: string;
  account_holder: string;
  color: string;
  is_active: number;
  sort_order: number;
}

const EMPTY_FORM = {
  type: 'bank' as 'bank' | 'ewallet',
  name: '',
  account_number: '',
  account_holder: 'Aparel Papua Store',
  color: '#005CA5',
  is_active: 1,
  sort_order: 0,
};

export default function AdminBankAccounts() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<BankAccount | null>(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [isSaving, setIsSaving] = useState(false);

  const getAdminToken = () => {
    return sessionStorage.getItem('noken-admin-token');
  };

  useEffect(() => {
    const savedAdmin = sessionStorage.getItem('noken-admin');
    if (!savedAdmin) { navigate('/admin/login'); return; }
    loadAccounts();
  }, [navigate]);

  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      const token = getAdminToken();
      const res = await fetch('/api/bank-accounts/admin', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setAccounts(data.data);
    } catch {
      toast.error('Gagal memuat data rekening');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setSelected(null);
    setFormData({ ...EMPTY_FORM, sort_order: accounts.length + 1 });
    setShowModal(true);
  };

  const openEdit = (acc: BankAccount) => {
    setSelected(acc);
    setFormData({
      type: acc.type,
      name: acc.name,
      account_number: acc.account_number,
      account_holder: acc.account_holder,
      color: acc.color,
      is_active: acc.is_active,
      sort_order: acc.sort_order,
    });
    setShowModal(true);
  };

  const handleDelete = async (acc: BankAccount) => {
    if (!confirm(`Hapus rekening "${acc.name}"?`)) return;
    const token = getAdminToken();
    try {
      await fetch(`/api/bank-accounts/${acc.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Rekening dihapus');
      loadAccounts();
    } catch {
      toast.error('Gagal menghapus rekening');
    }
  };

  const handleToggleActive = async (acc: BankAccount) => {
    const token = getAdminToken();
    try {
      await fetch(`/api/bank-accounts/${acc.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: acc.is_active ? 0 : 1 }),
      });
      toast.success(acc.is_active ? 'Rekening dinonaktifkan' : 'Rekening diaktifkan');
      loadAccounts();
    } catch {
      toast.error('Gagal mengubah status');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.account_number) {
      toast.error('Nama dan nomor rekening wajib diisi');
      return;
    }
    setIsSaving(true);
    const token = getAdminToken();
    const url = selected ? `/api/bank-accounts/${selected.id}` : '/api/bank-accounts';
    const method = selected ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(selected ? 'Rekening diperbarui' : 'Rekening ditambahkan');
        setShowModal(false);
        loadAccounts();
      } else {
        toast.error(data.message || 'Gagal menyimpan');
      }
    } catch {
      toast.error('Terjadi kesalahan');
    } finally {
      setIsSaving(false);
    }
  };

  const banks = accounts.filter(a => a.type === 'bank');
  const ewallets = accounts.filter(a => a.type === 'ewallet');

  const AccountCard = ({ acc }: { acc: BankAccount }) => (
    <div
      className="flex items-center gap-4 p-4 rounded-2xl border transition-all"
      style={{
        borderColor: acc.is_active ? '#e8d5c4' : '#e5e7eb',
        background: acc.is_active ? 'white' : '#f9fafb',
        opacity: acc.is_active ? 1 : 0.65,
      }}
    >
      <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0"
        style={{ background: acc.color }}
      >
        {acc.name.substring(0, 3).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900">{acc.name}</p>
        <p className="text-sm text-gray-500 font-mono tracking-wider">{acc.account_number}</p>
        <p className="text-xs text-gray-400">a.n. {acc.account_holder}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => handleToggleActive(acc)}
          title={acc.is_active ? 'Nonaktifkan' : 'Aktifkan'}
          className="p-2 rounded-lg transition-colors hover:bg-gray-100"
        >
          {acc.is_active
            ? <ToggleRight className="w-5 h-5" style={{ color: '#b8622a' }} />
            : <ToggleLeft className="w-5 h-5 text-gray-400" />}
        </button>
        <button
          onClick={() => openEdit(acc)}
          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleDelete(acc)}
          className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rekening Pembayaran</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola bank transfer & e-wallet yang tampil di halaman pembayaran</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #e08644 0%, #b8622a 100%)' }}
          >
            <Plus className="w-4 h-4" />
            Tambah Rekening
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-gray-400">Memuat data...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bank Transfer */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 p-5 border-b border-gray-100" style={{ background: '#fff7f0' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e08644, #b8622a)' }}>
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Bank Transfer</h2>
                  <p className="text-xs text-gray-400">{banks.length} rekening</p>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {banks.length === 0
                  ? <p className="text-center text-gray-400 text-sm py-8">Belum ada rekening bank</p>
                  : banks.map(acc => <AccountCard key={acc.id} acc={acc} />)
                }
              </div>
            </div>

            {/* E-Wallet */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 p-5 border-b border-gray-100" style={{ background: '#fff7f0' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e08644, #b8622a)' }}>
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">E-Wallet</h2>
                  <p className="text-xs text-gray-400">{ewallets.length} dompet digital</p>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {ewallets.length === 0
                  ? <p className="text-center text-gray-400 text-sm py-8">Belum ada e-wallet</p>
                  : ewallets.map(acc => <AccountCard key={acc.id} acc={acc} />)
                }
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {selected ? 'Edit Rekening' : 'Tambah Rekening'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Tipe */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tipe</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['bank', 'ewallet'] as const).map(t => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setFormData(f => ({ ...f, type: t }))}
                      className="py-2 rounded-xl border font-semibold text-sm capitalize transition-all"
                      style={{
                        borderColor: formData.type === t ? '#b8622a' : '#e5e7eb',
                        background: formData.type === t ? '#fff7f0' : 'white',
                        color: formData.type === t ? '#b8622a' : '#6b7280',
                      }}
                    >
                      {t === 'bank' ? '🏦 Bank Transfer' : '📱 E-Wallet'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nama */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nama Bank / E-Wallet</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  placeholder="Contoh: BCA, GoPay, OVO"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Nomor Rekening */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nomor Rekening / HP</label>
                <input
                  type="text"
                  value={formData.account_number}
                  onChange={e => setFormData(f => ({ ...f, account_number: e.target.value }))}
                  placeholder="Contoh: 1234567890"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Nama Pemilik */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Atas Nama</label>
                <input
                  type="text"
                  value={formData.account_holder}
                  onChange={e => setFormData(f => ({ ...f, account_holder: e.target.value }))}
                  placeholder="Nama pemilik rekening"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Warna */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Warna Logo</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={e => setFormData(f => ({ ...f, color: e.target.value }))}
                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                  />
                  <div className="flex-1 flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-xs"
                      style={{ background: formData.color }}
                    >
                      {formData.name ? formData.name.substring(0, 3).toUpperCase() : 'ABC'}
                    </div>
                    <span className="text-sm text-gray-500 font-mono">{formData.color}</span>
                  </div>
                </div>
              </div>

              {/* Status Aktif */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Aktif</p>
                  <p className="text-xs text-gray-400">Tampilkan di halaman pembayaran</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(f => ({ ...f, is_active: f.is_active ? 0 : 1 }))}
                >
                  {formData.is_active
                    ? <ToggleRight className="w-8 h-8" style={{ color: '#b8622a' }} />
                    : <ToggleLeft className="w-8 h-8 text-gray-400" />}
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #e08644, #b8622a)' }}
                >
                  {isSaving ? 'Menyimpan...' : (selected ? 'Simpan Perubahan' : 'Tambah Rekening')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
