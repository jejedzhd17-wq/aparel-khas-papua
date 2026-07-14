import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import { toast } from 'sonner';
import {
  Eye,
  RefreshCw,
  ShoppingBag,
  Clock,
  Truck,
  PackageCheck,
  CreditCard,
  AlertCircle,
  X,
  ChevronRight,
  CheckCircle2,
  Package,
  XCircle,
  Ban,
} from 'lucide-react';

interface Order {
  id: number;
  customer: string;
  address: string;
  total: number;
  status: string;
  date: string;
  items?: any[];
}

interface PaymentDetail {
  id: number;
  order_id: number;
  metode: string;
  status: 'pending' | 'sukses' | 'gagal';
  bukti_pembayaran: string | null;
  paid_at: string | null;
}

// Progress steps — only 3 visible stages for admin
const STEPS = [
  { key: 'pending',  label: 'Pesanan Masuk',  icon: Package,       color: 'text-yellow-500', ring: 'ring-yellow-400' },
  { key: 'dikirim', label: 'Dikirim',         icon: Truck,         color: 'text-blue-500',   ring: 'ring-blue-400' },
  { key: 'selesai', label: 'Selesai',         icon: PackageCheck,  color: 'text-emerald-500',ring: 'ring-emerald-400' },
];

// Map db status → step index
const statusToStep = (s: string) => {
  if (s === 'selesai') return 2;
  if (s === 'dikirim') return 1;
  return 0; // pending or dibayar
};

// Next status after current
const nextStatus = (s: string): string | null => {
  if (s === 'pending' || s === 'dibayar') return 'dikirim';
  if (s === 'dikirim') return 'selesai';
  return null;
};

const nextLabel = (s: string): string => {
  if (s === 'pending' || s === 'dibayar') return '🚚 Proses & Kirim Sekarang';
  if (s === 'dikirim') return '✅ Tandai Selesai';
  return '';
};

const nextBtnClass = (s: string): string => {
  if (s === 'pending' || s === 'dibayar')
    return 'bg-blue-600 hover:bg-blue-700 text-white';
  if (s === 'dikirim')
    return 'bg-emerald-600 hover:bg-emerald-700 text-white';
  return '';
};

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending:  { label: 'Menunggu',  color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200',  dot: 'bg-yellow-400' },
  dibayar:  { label: 'Menunggu',  color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200',  dot: 'bg-yellow-400' },
  dikirim:  { label: 'Dikirim',   color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',      dot: 'bg-blue-400' },
  selesai:  { label: 'Selesai',   color: 'text-emerald-700',bg: 'bg-emerald-50 border-emerald-200',dot: 'bg-emerald-400' },
  ditolak:  { label: 'Ditolak',   color: 'text-red-700',    bg: 'bg-red-50 border-red-200',        dot: 'bg-red-400' },
};

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'semua' | 'pending' | 'dikirim' | 'selesai' | 'ditolak'>('semua');

  // Resi form states
  const [showResiForm, setShowResiForm] = useState(false);
  const [resiKurir, setResiKurir] = useState('JNE');
  const [resiNomor, setResiNomor] = useState('');
  const [isSubmittingResi, setIsSubmittingResi] = useState(false);

  useEffect(() => {
    const savedAdmin = sessionStorage.getItem('noken-admin');
    if (!savedAdmin) { navigate('/admin/login'); return; }
    loadOrders();
  }, [navigate]);

  const getToken = () => sessionStorage.getItem('noken-admin-token');

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders/admin', {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        const mapped: Order[] = data.data.map((o: any) => {
          const lines = (o.customer?.address || '').split('\n');
          return {
            id: o.id,
            customer: lines[0] || 'Pelanggan',
            address: lines.slice(1).join(', ') || o.address || '',
            total: o.total || 0,
            status: o.status,
            date: o.timestamp ? new Date(o.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
            items: o.items || [],
          };
        });
        setOrders(mapped);
      } else {
        toast.error(data.message || 'Gagal memuat pesanan');
      }
    } catch {
      toast.error('Gagal terhubung ke server');
    } finally {
      setIsLoading(false);
    }
  };

  const openOrder = async (order: Order) => {
    setSelectedOrder(order);
    setPayment(null);
    setIsLoadingPayment(true);
    try {
      const res = await fetch(`/api/payments/${order.id}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success && data.data) setPayment(data.data);
    } catch { /* no payment */ } finally {
      setIsLoadingPayment(false);
    }
  };

  const closeDetail = () => { setSelectedOrder(null); setPayment(null); };

  // Advance order to next status — single action, no choice needed
  const handleAdvance = async () => {
    if (!selectedOrder) return;
    const next = nextStatus(selectedOrder.status);
    if (!next) return;

    setIsAdvancing(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Status pesanan berhasil diubah ke "${STATUS_LABEL[next]?.label || next}"!`);
        setSelectedOrder(prev => prev ? { ...prev, status: next } : null);
        await loadOrders();
      } else {
        toast.error(data.message || 'Gagal memperbarui status');
      }
    } catch {
      toast.error('Koneksi server gagal');
    } finally {
      setIsAdvancing(false);
    }
  };

  // Reject order
  const handleReject = async () => {
    if (!selectedOrder) return;
    if (!window.confirm(`Yakin ingin menolak pesanan #${selectedOrder.id}? Tindakan ini tidak dapat dibatalkan.`)) return;

    setIsRejecting(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status: 'ditolak' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.error(`Pesanan #${selectedOrder.id} telah ditolak.`);
        setSelectedOrder(prev => prev ? { ...prev, status: 'ditolak' } : null);
        await loadOrders();
      } else {
        toast.error(data.message || 'Gagal menolak pesanan');
      }
    } catch {
      toast.error('Koneksi server gagal');
    } finally {
      setIsRejecting(false);
    }
  };

  // Submit resi & kurir ke POST /api/shipments (auto-update order status ke dikirim)
  const handleSubmitResi = async () => {
    if (!selectedOrder) return;
    if (!resiNomor.trim()) {
      toast.error('Nomor resi harus diisi');
      return;
    }
    setIsSubmittingResi(true);
    try {
      const res = await fetch('/api/shipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          courier: resiKurir,
          trackingNumber: resiNomor.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Pesanan #${selectedOrder.id} dikirim via ${resiKurir}. Resi: ${resiNomor.trim()}`);
        setSelectedOrder(prev => prev ? { ...prev, status: 'dikirim' } : null);
        setShowResiForm(false);
        setResiNomor('');
        await loadOrders();
      } else {
        toast.error(data.message || 'Gagal mendaftarkan pengiriman');
      }
    } catch {
      toast.error('Koneksi server gagal');
    } finally {
      setIsSubmittingResi(false);
    }
  };

  const filteredOrders = activeTab === 'semua'
    ? orders
    : activeTab === 'pending'
      ? orders.filter(o => o.status === 'pending' || o.status === 'dibayar')
      : orders.filter(o => o.status === activeTab);

  const countByStatus = (s: string) => orders.filter(o => o.status === s).length;

  const tabs = [
    { key: 'semua',   label: 'Semua',     count: orders.length },
    { key: 'pending', label: 'Menunggu',  count: countByStatus('pending') + countByStatus('dibayar') },
    { key: 'dikirim', label: 'Dikirim',   count: countByStatus('dikirim') },
    { key: 'selesai', label: 'Selesai',   count: countByStatus('selesai') },
    { key: 'ditolak', label: 'Ditolak',   count: countByStatus('ditolak') },
  ] as const;

  return (
    <AdminLayout title="Kelola Pesanan" description="Pantau dan proses pesanan pelanggan">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Daftar Pesanan</h2>
          <p className="text-xs text-gray-500 mt-0.5">Total {orders.length} pesanan</p>
        </div>
        <button
          onClick={loadOrders}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto pb-2 mb-5">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-max">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                  activeTab === tab.key ? 'bg-primary text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Memuat pesanan...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Belum ada pesanan di kategori ini</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="sm:hidden divide-y divide-gray-100">
              {filteredOrders.map(order => {
                const si = STATUS_LABEL[order.status] || STATUS_LABEL['pending'];
                return (
                  <div key={order.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900 font-mono">#{order.id}</span>
                      <span className="text-xs text-gray-400">{order.date}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{order.customer}</p>
                      <p className="text-xs text-gray-500 truncate max-w-xs">{order.address}</p>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-sm font-extrabold text-gray-900">
                        Rp {order.total.toLocaleString('id-ID')}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${si.bg} ${si.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${si.dot}`} />
                          {si.label}
                        </span>
                        <button
                          onClick={() => openOrder(order)}
                          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          Detail
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['ID', 'Pelanggan', 'Total', 'Status', 'Tanggal', 'Aksi'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map(order => {
                    const si = STATUS_LABEL[order.status] || STATUS_LABEL['pending'];
                    return (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-xs font-mono font-bold text-gray-600">#{order.id}</td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-gray-900">{order.customer}</p>
                          <p className="text-xs text-gray-400 truncate max-w-xs">{order.address}</p>
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">
                          Rp {order.total.toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${si.bg} ${si.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${si.dot}`} />
                            {si.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{order.date}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => openOrder(order)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors border border-primary/15"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ── Slide-in Detail Panel ── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeDetail} />

          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">

            {/* Panel Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50 flex-shrink-0">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Pesanan #{selectedOrder.id}</h3>
                <p className="text-[11px] text-gray-500">{selectedOrder.customer} · {selectedOrder.date}</p>
              </div>
              <button onClick={closeDetail} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">

              {/* ── Progress Stepper ── */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">Progress Pesanan</p>
                <div className="flex items-center">
                  {STEPS.map((step, idx) => {
                    const currentStep = statusToStep(selectedOrder.status);
                    const done = idx < currentStep;
                    const active = idx === currentStep;
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className="flex items-center flex-1 last:flex-none">
                        {/* Circle */}
                        <div className="flex flex-col items-center gap-1.5">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                            done    ? 'bg-emerald-500 text-white' :
                            active  ? `bg-white ring-2 ${step.ring} ${step.color}` :
                                      'bg-gray-100 text-gray-300'
                          }`}>
                            {done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                          </div>
                          <span className={`text-[10px] font-semibold text-center leading-tight ${
                            done ? 'text-emerald-600' : active ? 'text-gray-800' : 'text-gray-400'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                        {/* Connector */}
                        {idx < STEPS.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1 mb-5 rounded-full transition-all ${
                            idx < currentStep ? 'bg-emerald-400' : 'bg-gray-200'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Order Info ── */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Info Pesanan</p>
                {[
                  { label: 'Pelanggan', value: selectedOrder.customer },
                  { label: 'Total',     value: `Rp ${selectedOrder.total.toLocaleString('id-ID')}`, bold: true },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-xs">
                    <span className="text-gray-500">{row.label}</span>
                    <span className={row.bold ? 'font-extrabold text-primary text-sm' : 'font-semibold text-gray-900'}>{row.value}</span>
                  </div>
                ))}
                <div className="flex justify-between text-xs gap-4">
                  <span className="text-gray-500 flex-shrink-0">Alamat</span>
                  <span className="font-medium text-gray-700 text-right break-words line-clamp-3">{selectedOrder.address}</span>
                </div>
              </div>

              {/* ── Items ── */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Item Dipesan</p>
                  <div className="divide-y divide-gray-100 max-h-44 overflow-y-auto">
                    {selectedOrder.items.map((item: any, idx: number) => (
                      <div key={idx} className="py-2 flex justify-between gap-3 text-xs">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{item.name || item.nama_produk}</p>
                          <p className="text-[10px] text-gray-400">{item.qty || item.jumlah}x @ Rp {(item.price || item.harga || 0).toLocaleString('id-ID')}</p>
                        </div>
                        <span className="font-bold text-gray-900 flex-shrink-0">
                          Rp {((item.qty || item.jumlah || 1) * (item.price || item.harga || 0)).toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Info Pembayaran (read-only) ── */}
              {(isLoadingPayment || payment) && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2.5 flex items-center gap-2 border-b border-gray-100">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <p className="text-xs font-bold text-gray-600">Info Pembayaran</p>
                  </div>
                  <div className="p-4">
                    {isLoadingPayment ? (
                      <div className="text-center py-4">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-[11px] text-gray-400">Memuat...</p>
                      </div>
                    ) : payment ? (
                      payment.metode === 'cod' ? (
                        <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-800 font-medium">
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                          <span>Metode: Bayar di Tempat (COD). Pembeli akan membayar tunai saat paket tiba.</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
                              <p className="text-[10px] text-gray-400 mb-0.5">Metode</p>
                              <p className="text-xs font-bold uppercase text-gray-800">{payment.metode}</p>
                            </div>
                            <div className={`rounded-lg p-2.5 border ${
                              payment.status === 'sukses' ? 'bg-emerald-50 border-emerald-200' :
                              payment.status === 'gagal'  ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
                            }`}>
                              <p className="text-[10px] text-gray-400 mb-0.5">Status</p>
                              <p className={`text-xs font-bold ${
                                payment.status === 'sukses' ? 'text-emerald-700' :
                                payment.status === 'gagal'  ? 'text-red-700' : 'text-yellow-700'
                              }`}>
                                {payment.status === 'sukses' ? '✅ Lunas' :
                                 payment.status === 'gagal'  ? '❌ Ditolak' : '⏳ Menunggu'}
                              </p>
                            </div>
                          </div>
                          {payment.bukti_pembayaran ? (
                            <a href={`/uploads/${payment.bukti_pembayaran}`} target="_blank" rel="noopener noreferrer">
                              <img
                                src={`/uploads/${payment.bukti_pembayaran}`}
                                alt="Bukti Transfer"
                                className="w-full max-h-48 object-contain rounded-xl border border-dashed border-gray-300 bg-gray-50 hover:border-primary transition-colors cursor-zoom-in"
                              />
                              <p className="text-[9px] text-gray-400 text-center mt-1">Tap untuk zoom</p>
                            </a>
                          ) : (
                            <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg p-2.5 text-[11px] text-amber-700">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>Pembeli belum mengunggah bukti transfer.</span>
                            </div>
                          )}
                        </div>
                      )
                    ) : null}
                  </div>
                </div>
              )}

            </div>

            {/* ── Sticky Bottom Action ── */}
            <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 bg-white space-y-2">
              {selectedOrder.status === 'selesai' ? (
                <div className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl py-3 text-sm font-bold text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                  Pesanan Selesai
                </div>
              ) : selectedOrder.status === 'ditolak' ? (
                <div className="flex items-center justify-center gap-2 bg-red-50 border border-red-200 rounded-xl py-3 text-sm font-bold text-red-700">
                  <Ban className="w-5 h-5" />
                  Pesanan Telah Ditolak
                </div>
              ) : showResiForm ? (
                /* ── Resi Input Form ── */
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-700">📦 Input Data Pengiriman</p>
                  <div>
                    <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Kurir</label>
                    <select
                      value={resiKurir}
                      onChange={e => setResiKurir(e.target.value)}
                      className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                    >
                      {['JNE', 'J&T Express', 'SiCepat', 'Pos Indonesia', 'AnterAja', 'Ninja Xpress', 'GoSend', 'GrabExpress'].map(k => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Nomor Resi</label>
                    <input
                      type="text"
                      value={resiNomor}
                      onChange={e => setResiNomor(e.target.value)}
                      placeholder="cth: JNE1234567890"
                      className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <button
                    onClick={handleSubmitResi}
                    disabled={isSubmittingResi || !resiNomor.trim()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-60"
                  >
                    {isSubmittingResi ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Memproses...</>
                    ) : (
                      <><Truck className="w-4 h-4" /> Simpan & Kirim Sekarang</>
                    )}
                  </button>
                  <button
                    onClick={() => setShowResiForm(false)}
                    className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <>
                  {/* Advance button */}
                  <button
                    onClick={() => {
                      if (selectedOrder.status === 'pending' || selectedOrder.status === 'dibayar') {
                        setResiKurir('JNE');
                        setResiNomor('');
                        setShowResiForm(true);
                      } else {
                        handleAdvance();
                      }
                    }}
                    disabled={isAdvancing || isRejecting}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-60 ${nextBtnClass(selectedOrder.status)}`}
                  >
                    {isAdvancing ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Memproses...</>
                    ) : (
                      <>{nextLabel(selectedOrder.status)} <ChevronRight className="w-4 h-4" /></>
                    )}
                  </button>
                  {/* Reject button */}
                  <button
                    onClick={handleReject}
                    disabled={isRejecting || isAdvancing}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm border border-red-200 text-red-600 hover:bg-red-50 transition-all disabled:opacity-60"
                  >
                    {isRejecting ? (
                      <><div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> Memproses...</>
                    ) : (
                      <><XCircle className="w-4 h-4" /> Tolak Pesanan</>  
                    )}
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </AdminLayout>
  );
}
