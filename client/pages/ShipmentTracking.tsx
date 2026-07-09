import { useState, useEffect, useRef } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Timeline from '@/components/Timeline';
import { motion } from 'framer-motion';
import {
  Copy,
  Search,
  PackageOpen,
  Truck,
  MapPin,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface TimelineStep {
  id: number | string;
  label: string;
  date: string;
  time?: string;
  completed: boolean;
  description?: string;
}

interface Shipment {
  id: number;
  orderId: number;
  trackingNumber: string;
  courier: string;
  status: string;
  shippingDate: string | null;
  address: string;
  customerName: string;
  total?: number;
  timeline: TimelineStep[];
}

// Map status dari DB ke label & warna tampilan
const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  pending:    { label: 'Menunggu Pengiriman', color: 'bg-gray-100 text-gray-700 border-gray-300',      bgColor: 'bg-gray-50' },
  dikirim:    { label: 'Dalam Pengiriman',    color: 'bg-blue-100 text-blue-700 border-blue-300',      bgColor: 'bg-blue-50' },
  shipped:    { label: 'Sudah Dikirim',       color: 'bg-blue-100 text-blue-700 border-blue-300',      bgColor: 'bg-blue-50' },
  in_transit: { label: 'Dalam Perjalanan',    color: 'bg-yellow-100 text-yellow-700 border-yellow-300', bgColor: 'bg-yellow-50' },
  delivered:  { label: 'Terkirim',            color: 'bg-green-100 text-green-700 border-green-300',   bgColor: 'bg-green-50' },
  selesai:    { label: 'Terkirim',            color: 'bg-green-100 text-green-700 border-green-300',   bgColor: 'bg-green-50' },
};

const getStatusCfg = (status: string) =>
  STATUS_CONFIG[status] ?? STATUS_CONFIG['dikirim'];

export default function ShipmentTracking() {
  const [shipments, setShipments]                 = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment]   = useState<Shipment | null>(null);
  const [searchQuery, setSearchQuery]             = useState('');
  const [isLoading, setIsLoading]                 = useState(false);
  const [isSearching, setIsSearching]             = useState(false);
  const [searchError, setSearchError]             = useState('');
  const [copied, setCopied]                       = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn]               = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);

  // Load pengiriman milik user (kalau sudah login)
  useEffect(() => {
    const token = localStorage.getItem('noken-token');
    const user = localStorage.getItem('noken-user');
    if (token && user) {
      setIsLoggedIn(true);
      loadUserShipments(token);
    } else {
      setIsLoggedIn(false);
      setShipments([]);
      setSelectedShipment(null);
    }
  }, []);

  const loadUserShipments = async (token: string) => {
    setIsLoading(true);
    try {
      const res  = await fetch('/api/shipments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setShipments(data.data);
        if (data.data.length > 0) setSelectedShipment(data.data[0]);
      }
    } catch {
      // Silently ignore—user will see empty state
    } finally {
      setIsLoading(false);
    }
  };

  // Lacak paket berdasarkan nomor resi (endpoint publik, tanpa login)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    setIsSearching(true);
    setSearchError('');
    try {
      const res  = await fetch(`/api/shipments/track/${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success && data.data) {
        const found: Shipment = data.data;
        setShipments(prev => {
          const exists = prev.find(s => s.id === found.id);
          return exists ? prev : [found, ...prev];
        });
        setSelectedShipment(found);
        setTimeout(() => {
          detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        setSearchError('Nomor resi tidak ditemukan. Pastikan nomor resi sudah benar.');
      }
    } catch {
      setSearchError('Gagal terhubung ke server. Silakan coba lagi.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCopyTracking = (trackingNumber: string) => {
    navigator.clipboard.writeText(trackingNumber);
    setCopied(trackingNumber);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSelectShipment = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const formatDate = (date: string | null, long = false) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', long
      ? { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }
      : { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Header */}
      <section
        className="relative py-16 md:py-24 px-4 bg-cover bg-[center_68%] text-white overflow-hidden"
        style={{ backgroundImage: "url('/papua-hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/25" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative max-w-7xl mx-auto z-10"
        >
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]">
            Lacak Pengiriman
          </h1>
          <p className="text-white/95 text-lg md:text-xl max-w-2xl font-medium drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
            Pantau status pengiriman pesanan Anda secara real-time
          </p>
        </motion.div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">

        {/* ── Search by Resi (publik) ── */}
        <motion.form
          onSubmit={handleSearch}
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="resi-search-input"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Masukkan nomor resi untuk melacak..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            <button
              id="resi-search-btn"
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm disabled:opacity-60 hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Mencari...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Lacak
                </>
              )}
            </button>
          </div>

          {searchError && (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 max-w-2xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {searchError}
            </div>
          )}

          {!isLoggedIn && !searchError && shipments.length === 0 && (
            <p className="mt-2 text-xs text-gray-400">
              Tidak perlu login untuk melacak resi.
            </p>
          )}
        </motion.form>

        {/* ── Loading ── */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Memuat pengiriman Anda...</p>
          </div>

        /* ── Empty State ── */
        ) : shipments.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-16 text-center border border-gray-100">
            <PackageOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-700 text-lg font-semibold mb-2">
              {isLoggedIn ? 'Belum ada pengiriman' : 'Lacak pesanan Anda'}
            </p>
            <p className="text-gray-400 text-sm">
              {isLoggedIn
                ? 'Pesanan yang sudah dikirim akan muncul di sini secara otomatis'
                : 'Masukkan nomor resi di atas — tidak perlu login!'}
            </p>
          </div>

        /* ── Main Content ── */
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* List Kiri */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="lg:col-span-1"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900">
                  {isLoggedIn ? 'Pengiriman Saya' : 'Hasil Pencarian'}
                  <span className="ml-1.5 text-gray-400 font-normal">({shipments.length})</span>
                </h2>
                {isLoggedIn && (
                  <button
                    onClick={() => {
                      const t = localStorage.getItem('noken-token');
                      if (t) loadUserShipments(t);
                    }}
                    title="Refresh daftar"
                    className="p-1.5 text-gray-400 hover:text-primary rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {shipments.map(shipment => {
                  const cfg       = getStatusCfg(shipment.status);
                  const isSelected = selectedShipment?.id === shipment.id;
                  return (
                    <button
                      key={shipment.id}
                      onClick={() => handleSelectShipment(shipment)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-primary/50 bg-white'
                      }`}
                    >
                      <div className="mb-2">
                        <p className="text-xs font-bold text-gray-800">{shipment.courier}</p>
                        <p className="text-xs text-gray-400 font-mono truncate">{shipment.trackingNumber}</p>
                      </div>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border mb-2 ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <p className="text-xs text-gray-400">{formatDate(shipment.shippingDate)}</p>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Detail Kanan */}
            <motion.div
              ref={detailRef}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
              className="lg:col-span-2"
            >
              {selectedShipment ? (
                <div className="space-y-5">

                  {/* Header Kartu */}
                  <div className={`rounded-2xl p-6 ${getStatusCfg(selectedShipment.status).bgColor}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{selectedShipment.courier}</h3>
                        <p className="text-sm text-gray-500 mt-0.5 font-mono">
                          {selectedShipment.trackingNumber}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopyTracking(selectedShipment.trackingNumber)}
                        title="Salin nomor resi"
                        className="p-2 hover:bg-white/70 rounded-lg transition-colors"
                      >
                        <Copy className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>

                    {copied === selectedShipment.trackingNumber && (
                      <p className="text-xs text-green-600 font-semibold mb-2">✓ Disalin ke clipboard!</p>
                    )}

                    <span className={`inline-block px-4 py-1.5 rounded-lg text-sm font-semibold border ${getStatusCfg(selectedShipment.status).color}`}>
                      {getStatusCfg(selectedShipment.status).label}
                    </span>

                    <div className="mt-3 text-xs text-gray-500 space-y-0.5">
                      <p>Pesanan #{selectedShipment.orderId}</p>
                      {selectedShipment.shippingDate && (
                        <p>Dikirim: {formatDate(selectedShipment.shippingDate, true)}</p>
                      )}
                    </div>
                  </div>

                  {/* Alamat */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-5">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-primary" />
                      Alamat Pengiriman
                    </h4>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {selectedShipment.address || '-'}
                    </p>
                  </div>

                  {/* Timeline */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-5">
                    <h4 className="font-semibold text-gray-900 mb-5 flex items-center gap-2 text-sm">
                      <Truck className="w-4 h-4 text-primary" />
                      Status Pengiriman
                    </h4>
                    <Timeline steps={selectedShipment.timeline.map(s => ({ ...s, id: String(s.id) }))} />
                  </div>

                </div>
              ) : (
                <div className="bg-gray-50 rounded-2xl p-16 text-center border border-gray-100">
                  <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-base">Pilih pengiriman untuk melihat detail</p>
                </div>
              )}
            </motion.div>

          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
