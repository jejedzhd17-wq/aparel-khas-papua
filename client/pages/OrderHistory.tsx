import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import {
  ShoppingBag, Calendar, CreditCard, ArrowRight,
  ClipboardList, Clock, CheckCircle2, Truck, PackageCheck,
  RefreshCw, AlertCircle,
} from 'lucide-react';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  status: string;
  timestamp: string;
  alamat?: string;
  paymentStatus?: string | null;
  paymentProof?: string | null;
}

const getResolvedSrc = (raw?: string) => {
  if (!raw) return '/placeholder.svg';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  if (raw.startsWith('/')) return raw;
  return `/uploads/${raw}`;
};

const STATUS_CONFIG: Record<string, { label: string; desc: string; dotColor: string; badgeCls: string; icon: React.FC<any> }> = {
  pending: {
    label: 'Menunggu Pembayaran',
    desc: 'Silakan upload bukti transfer, admin akan memverifikasi.',
    dotColor: 'bg-yellow-500 animate-pulse',
    badgeCls: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    icon: Clock,
  },
  dibayar: {
    label: '✅ Pembayaran Terverifikasi',
    desc: 'Admin telah memverifikasi pembayaran Anda. Pesanan sedang diproses.',
    dotColor: 'bg-green-500',
    badgeCls: 'bg-green-50 text-green-800 border-green-200',
    icon: CheckCircle2,
  },
  dikirim: {
    label: '🚚 Sedang Dikirim',
    desc: 'Pesanan Anda sedang dalam perjalanan ke alamat tujuan.',
    dotColor: 'bg-blue-500',
    badgeCls: 'bg-blue-50 text-blue-800 border-blue-200',
    icon: Truck,
  },
  selesai: {
    label: '🎉 Pesanan Selesai',
    desc: 'Pesanan telah diterima. Terima kasih telah berbelanja!',
    dotColor: 'bg-purple-500',
    badgeCls: 'bg-purple-50 text-purple-800 border-purple-200',
    icon: PackageCheck,
  },
  ditolak: {
    label: '❌ Pesanan Ditolak',
    desc: 'Pesanan Anda ditolak oleh admin.',
    dotColor: 'bg-red-500',
    badgeCls: 'bg-red-50 text-red-800 border-red-200',
    icon: AlertCircle,
  },
  // Fallback untuk status lama dari localStorage
  paid: {
    label: '✅ Pembayaran Terverifikasi',
    desc: 'Admin telah memverifikasi pembayaran Anda.',
    dotColor: 'bg-green-500',
    badgeCls: 'bg-green-50 text-green-800 border-green-200',
    icon: CheckCircle2,
  },
  shipped: {
    label: '🚚 Sedang Dikirim',
    desc: 'Pesanan sedang dalam perjalanan.',
    dotColor: 'bg-blue-500',
    badgeCls: 'bg-blue-50 text-blue-800 border-blue-200',
    icon: Truck,
  },
  completed: {
    label: '🎉 Selesai',
    desc: 'Pesanan selesai.',
    dotColor: 'bg-purple-500',
    badgeCls: 'bg-purple-50 text-purple-800 border-purple-200',
    icon: PackageCheck,
  },
};

export default function OrderHistory() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('noken-user');
    if (!savedUser) {
      setLoading(false);
      return;
    }
    const parsedUser = JSON.parse(savedUser);
    setUser(parsedUser);
    fetchOrders(parsedUser);
  }, []);

  const fetchOrders = async (parsedUser?: any) => {
    setError(null);
    try {
      const token = localStorage.getItem('noken-token');

      if (token) {
        // ── Fetch dari backend database (real-time status) ──
        const res = await fetch('/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.success && data.data) {
          const mapped: Order[] = data.data.map((o: any) => {
            const localOrder = localStorage.getItem(`order-${o.id}`);
            const localPaymentMethod = localOrder ? JSON.parse(localOrder).paymentMethod : null;
            return {
              id: String(o.id),
              items: (o.items || []).map((item: any) => ({
                id: item.id,
                name: item.name || item.nama_produk || 'Produk',
                price: item.price || item.harga || 0,
                quantity: item.quantity || item.jumlah || 1,
                image: item.image || item.gambar || null,
              })),
              total: o.total || 0,
              paymentMethod: localPaymentMethod || o.paymentMethod || 'transfer',
              status: o.status,
              timestamp: o.timestamp || new Date().toISOString(),
              alamat: o.customer?.address || '',
              paymentStatus: o.paymentStatus || null,
              paymentProof: o.paymentProof || null,
            };
          });

          // Sort terbaru di atas
          mapped.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setOrders(mapped);
          return;
        }
      }

      // ── Fallback ke localStorage jika tidak ada token ──
      const currentUser = parsedUser || user;
      const localOrders: Order[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('order-')) {
          try {
            const orderData = localStorage.getItem(key);
            if (orderData) {
              const order = JSON.parse(orderData);
              if (order.customer && order.customer.email === currentUser?.email) {
                localOrders.push(order);
              }
            }
          } catch { /* skip invalid */ }
        }
      }
      localOrders.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setOrders(localOrders);

    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Gagal memuat riwayat pesanan. Coba refresh halaman.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchOrders();
  };

  const getStatusBadge = (order: Order) => {
    const isCod = order.paymentMethod === 'cod';

    // Jika order COD dan statusnya pending / dibayar
    if (isCod && (order.status === 'pending' || order.status === 'dibayar')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border bg-amber-50 text-amber-800 border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <Clock className="w-3 h-3" />
          Diproses (Bayar di Tempat)
        </span>
      );
    }

    // Jika order masih pending tapi bukti pembayaran sudah dikirim (non-COD)
    if (order.status === 'pending' && order.paymentProof) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border bg-amber-50 text-amber-800 border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <Clock className="w-3 h-3" />
          Menunggu Verifikasi Admin
        </span>
      );
    }

    const cfg = STATUS_CONFIG[order.status] || {
      label: order.status,
      dotColor: 'bg-gray-400',
      badgeCls: 'bg-gray-50 text-gray-700 border-gray-200',
      icon: Clock,
    };
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${cfg.badgeCls}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
        <Icon className="w-3 h-3" />
        {cfg.label}
      </span>
    );
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat riwayat pesanan...</p>
        </div>
      </div>
    );
  }

  // ── Not logged in ──
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
              <Clock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 font-playfair">Akses Dibatasi</h1>
            <p className="text-gray-600 mb-8">Silakan masuk ke akun Anda terlebih dahulu untuk melihat riwayat belanja.</p>
            <Link to="/login" className="block w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
              Masuk Sekarang
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Header */}
      <section className="bg-gradient-to-r from-primary/15 to-secondary/15 py-12 px-4 border-b border-gray-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-md">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-playfair">Riwayat Pesanan</h1>
              <p className="text-muted-foreground text-sm mt-1">Pantau status pembayaran & pengiriman Anda secara real-time</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-60 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        </div>
      )}

      {/* Orders */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2 font-playfair">Belum Ada Pesanan</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Anda belum melakukan pembelian apa pun. Kunjungi toko kami dan temukan busana Papua terbaik!
            </p>
            <Link to="/shop" className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
              Mulai Belanja <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const isWaitingVerification = order.status === 'pending' && order.paymentProof;
              const cfg = STATUS_CONFIG[order.status];
              return (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Order Header */}
                  <div className="bg-gray-50/70 border-b border-gray-100 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-bold text-gray-900 text-lg font-mono">#{order.id}</span>
                        {getStatusBadge(order)}
                      </div>
                      {/* Status description */}
                      {isWaitingVerification ? (
                        <p className="text-xs font-semibold text-amber-700">
                          Bukti pembayaran sudah dikirim dan sedang diverifikasi oleh admin. Mohon ditunggu.
                        </p>
                      ) : (
                        cfg && (
                          <p className={`text-xs font-medium ${
                            order.status === 'dibayar' || order.status === 'paid' ? 'text-green-700' :
                            order.status === 'pending' ? 'text-yellow-700' :
                            order.status === 'dikirim' || order.status === 'shipped' ? 'text-blue-700' : 'text-purple-700'
                          }`}>
                            {order.paymentMethod === 'cod' && (order.status === 'pending' || order.status === 'dibayar')
                              ? 'Pesanan Anda sedang diproses. Pembayaran akan dilakukan saat paket tiba.'
                              : cfg.desc}
                          </p>
                        )
                      )}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(order.timestamp).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'long', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5" />
                          {order.paymentMethod === 'bank-transfer' ? 'Transfer Bank' :
                           order.paymentMethod === 'ewallet' ? 'E-Wallet' :
                           order.paymentMethod === 'cod' ? 'Bayar di Tempat' :
                           order.paymentMethod || 'Transfer'}
                        </span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right w-full sm:w-auto">
                      <p className="text-xs text-muted-foreground">Total Belanja</p>
                      <p className="font-extrabold text-primary text-xl">Rp {Number(order.total).toLocaleString('id-ID')}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="p-4 sm:p-6 divide-y divide-gray-100">
                    {(order.items || []).map((item) => (
                      <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img
                              src={getResolvedSrc(item.image)}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover border bg-gray-100 shrink-0"
                              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                            />
                          )}
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity} x Rp {Number(item.price).toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-gray-900 text-sm shrink-0">
                          Rp {(Number(item.price) * item.quantity).toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="bg-gray-50/50 border-t border-gray-100 px-4 py-4 sm:px-6 flex justify-end gap-3">
                    {order.status === 'pending' && !order.paymentProof && order.paymentMethod !== 'cod' && (
                      <Link
                        to={`/payment/${order.id}`}
                        className="inline-flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
                      >
                        Upload Bukti Bayar
                      </Link>
                    )}
                    {isWaitingVerification && (
                      <span className="inline-flex items-center text-xs text-gray-500 font-medium italic border rounded-lg px-3 py-2 bg-gray-100/50">
                        Bukti sudah diunggah
                      </span>
                    )}
                    <Link
                      to={`/order-confirmation/${order.id}`}
                      className="inline-flex items-center gap-2 bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                    >
                      Detail Transaksi <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
