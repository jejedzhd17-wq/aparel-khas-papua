import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Timeline from '@/components/Timeline';
import { Copy, Search, Filter, PackageOpen, Truck, MapPin } from 'lucide-react';

interface Shipment {
  id: string;
  orderId: string;
  trackingNumber: string;
  courier: string;
  status: 'pending' | 'shipped' | 'in_transit' | 'delivered';
  shippingDate: string;
  estimatedDelivery: string;
  address: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  timeline: Array<{
    id: string;
    label: string;
    date: string;
    time?: string;
    completed: boolean;
    description?: string;
  }>;
}

// Mock shipment data
const MOCK_SHIPMENTS: Shipment[] = [
  {
    id: 'ship-1',
    orderId: 'ORD-1705334800000',
    trackingNumber: 'JNE123456789ABC',
    courier: 'JNE',
    status: 'delivered',
    shippingDate: '2024-01-10',
    estimatedDelivery: '2024-01-15',
    address: 'Jl. Sudirman No. 123, Jakarta 12190',
    items: [
      { name: 'Kaos Raja Ampat', quantity: 2 },
      { name: 'Gelang Tradisional', quantity: 1 },
    ],
    timeline: [
      {
        id: 'step-1',
        label: 'Pesanan Diterima',
        date: '10 Jan 2024',
        time: '14:30',
        completed: true,
      },
      {
        id: 'step-2',
        label: 'Pembayaran Dikonfirmasi',
        date: '10 Jan 2024',
        time: '15:45',
        completed: true,
      },
      {
        id: 'step-3',
        label: 'Paket Dikirim',
        date: '11 Jan 2024',
        time: '09:00',
        completed: true,
        description: 'Paket diambil dari warehouse',
      },
      {
        id: 'step-4',
        label: 'Dalam Perjalanan',
        date: '12 Jan 2024',
        time: '11:20',
        completed: true,
        description: 'Paket sedang dalam pengiriman',
      },
      {
        id: 'step-5',
        label: 'Tiba di Tujuan',
        date: '15 Jan 2024',
        time: '16:30',
        completed: true,
        description: 'Paket telah diterima oleh penerima',
      },
    ],
  },
  {
    id: 'ship-2',
    orderId: 'ORD-1705420200000',
    trackingNumber: 'JT987654321DEF',
    courier: 'J&T',
    status: 'in_transit',
    shippingDate: '2024-01-12',
    estimatedDelivery: '2024-01-18',
    address: 'Jl. Ahmad Yani No. 456, Bandung 40123',
    items: [
      { name: 'Hoodie Papua Tribal', quantity: 1 },
    ],
    timeline: [
      {
        id: 'step-1',
        label: 'Pesanan Diterima',
        date: '12 Jan 2024',
        time: '10:00',
        completed: true,
      },
      {
        id: 'step-2',
        label: 'Pembayaran Dikonfirmasi',
        date: '12 Jan 2024',
        time: '11:15',
        completed: true,
      },
      {
        id: 'step-3',
        label: 'Paket Dikirim',
        date: '13 Jan 2024',
        time: '08:30',
        completed: true,
        description: 'Paket diambil dari warehouse',
      },
      {
        id: 'step-4',
        label: 'Dalam Perjalanan',
        date: '14 Jan 2024',
        time: '13:00',
        completed: true,
        description: 'Paket sedang dalam pengiriman ke kota tujuan',
      },
      {
        id: 'step-5',
        label: 'Tiba di Tujuan',
        date: '18 Jan 2024',
        time: '—',
        completed: false,
        description: 'Estimasi tiba: 18 Jan 2024',
      },
    ],
  },
  {
    id: 'ship-3',
    orderId: 'ORD-1705506600000',
    trackingNumber: 'SHP111222333GHI',
    courier: 'SiCepat',
    status: 'shipped',
    shippingDate: '2024-01-14',
    estimatedDelivery: '2024-01-19',
    address: 'Jl. Merdeka No. 789, Surabaya 60123',
    items: [
      { name: 'Tas Noken Original', quantity: 1 },
    ],
    timeline: [
      {
        id: 'step-1',
        label: 'Pesanan Diterima',
        date: '14 Jan 2024',
        time: '09:00',
        completed: true,
      },
      {
        id: 'step-2',
        label: 'Pembayaran Dikonfirmasi',
        date: '14 Jan 2024',
        time: '10:30',
        completed: true,
      },
      {
        id: 'step-3',
        label: 'Paket Dikirim',
        date: '15 Jan 2024',
        time: '07:45',
        completed: true,
        description: 'Paket diambil dari warehouse',
      },
      {
        id: 'step-4',
        label: 'Dalam Perjalanan',
        date: '16 Jan 2024',
        time: '—',
        completed: false,
        description: 'Estimasi: 19 Jan 2024',
      },
      {
        id: 'step-5',
        label: 'Tiba di Tujuan',
        date: '19 Jan 2024',
        time: '—',
        completed: false,
      },
    ],
  },
  {
    id: 'ship-4',
    orderId: 'ORD-1705593000000',
    trackingNumber: 'POS444555666JKL',
    courier: 'Pos Indonesia',
    status: 'pending',
    shippingDate: '2024-01-15',
    estimatedDelivery: '2024-01-22',
    address: 'Jl. Gatot Subroto No. 200, Medan 20122',
    items: [
      { name: 'Kaos Wayang Papua', quantity: 1 },
      { name: 'Hoodie Laut Biru', quantity: 1 },
    ],
    timeline: [
      {
        id: 'step-1',
        label: 'Pesanan Diterima',
        date: '15 Jan 2024',
        time: '11:00',
        completed: true,
      },
      {
        id: 'step-2',
        label: 'Pembayaran Dikonfirmasi',
        date: '15 Jan 2024',
        time: '12:45',
        completed: true,
      },
      {
        id: 'step-3',
        label: 'Paket Dikirim',
        date: '17 Jan 2024',
        time: '—',
        completed: false,
      },
      {
        id: 'step-4',
        label: 'Dalam Perjalanan',
        date: '20 Jan 2024',
        time: '—',
        completed: false,
      },
      {
        id: 'step-5',
        label: 'Tiba di Tujuan',
        date: '22 Jan 2024',
        time: '—',
        completed: false,
      },
    ],
  },
];

const STATUS_CONFIG = {
  pending: {
    label: 'Menunggu Pengiriman',
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    bgColor: 'bg-gray-50',
  },
  shipped: {
    label: 'Sudah Dikirim',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    bgColor: 'bg-blue-50',
  },
  in_transit: {
    label: 'Dalam Perjalanan',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    bgColor: 'bg-yellow-50',
  },
  delivered: {
    label: 'Terkirim',
    color: 'bg-green-100 text-green-700 border-green-300',
    bgColor: 'bg-green-50',
  },
};

export default function ShipmentTracking() {
  const [shipments, setShipments] = useState<Shipment[]>(MOCK_SHIPMENTS);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Filter shipments
  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch = shipment.trackingNumber
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus ? shipment.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  const handleCopyTracking = (trackingNumber: string) => {
    navigator.clipboard.writeText(trackingNumber);
    setCopied(trackingNumber);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-8 md:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground font-playfair mb-2">
            Lacak Pengiriman
          </h1>
          <p className="text-muted-foreground text-lg">
            Pantau status pengiriman pesanan Anda secara real-time
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search & Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari nomor resi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Filter */}
            <select
              value={filterStatus || ''}
              onChange={(e) => setFilterStatus(e.target.value || null)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary md:w-64"
            >
              <option value="">Semua Status</option>
              <option value="pending">Menunggu Pengiriman</option>
              <option value="shipped">Sudah Dikirim</option>
              <option value="in_transit">Dalam Perjalanan</option>
              <option value="delivered">Terkirim</option>
            </select>
          </div>

          {(searchQuery || filterStatus) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterStatus(null);
              }}
              className="text-primary hover:underline text-sm font-semibold"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Content */}
        {filteredShipments.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <PackageOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg mb-2">
              {searchQuery || filterStatus ? 'Pengiriman tidak ditemukan' : 'Belum ada pengiriman'}
            </p>
            <p className="text-muted-foreground text-sm">
              {searchQuery || filterStatus
                ? 'Coba ubah filter pencarian Anda'
                : 'Mulai berbelanja untuk melihat pengiriman Anda di sini'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Shipment List */}
            <div className="lg:col-span-1">
              <h2 className="text-lg font-bold text-foreground mb-4">
                Pengiriman ({filteredShipments.length})
              </h2>
              <div className="space-y-3">
                {filteredShipments.map((shipment) => {
                  const config = STATUS_CONFIG[shipment.status];
                  const isSelected = selectedShipment?.id === shipment.id;

                  return (
                    <button
                      key={shipment.id}
                      onClick={() => setSelectedShipment(shipment)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      {/* Courier & Tracking */}
                      <div className="mb-2">
                        <p className="text-xs font-semibold text-muted-foreground">
                          {shipment.courier}
                        </p>
                        <p className="text-xs text-gray-500 font-mono truncate">
                          {shipment.trackingNumber}
                        </p>
                      </div>

                      {/* Status */}
                      <div className="mb-2">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${config.color}`}>
                          {config.label}
                        </span>
                      </div>

                      {/* Date */}
                      <p className="text-xs text-muted-foreground">
                        {new Date(shipment.shippingDate).toLocaleDateString('id-ID', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Shipment Detail */}
            <div className="lg:col-span-2">
              {selectedShipment ? (
                <div className="space-y-6">
                  {/* Header */}
                  <div className={`rounded-lg p-6 ${STATUS_CONFIG[selectedShipment.status].bgColor}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground font-playfair">
                          {selectedShipment.courier}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Nomor Resi: {selectedShipment.trackingNumber}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopyTracking(selectedShipment.trackingNumber)}
                        className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                        title="Salin nomor resi"
                      >
                        <Copy className="w-5 h-5 text-foreground" />
                      </button>
                    </div>

                    {copied === selectedShipment.trackingNumber && (
                      <p className="text-xs text-green-600 font-semibold">✓ Disalin!</p>
                    )}

                    {/* Status Badge */}
                    <span className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${STATUS_CONFIG[selectedShipment.status].color}`}>
                      {STATUS_CONFIG[selectedShipment.status].label}
                    </span>
                  </div>

                  {/* Address */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      Alamat Pengiriman
                    </h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {selectedShipment.address}
                    </p>
                  </div>

                  {/* Items */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-secondary" />
                      Produk yang Dikirim
                    </h4>
                    <div className="space-y-2">
                      {selectedShipment.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between text-sm text-muted-foreground pb-2 border-b border-gray-100 last:border-b-0"
                        >
                          <span>{item.name}</span>
                          <span className="font-semibold">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-foreground mb-6">
                      Status Pengiriman
                    </h4>
                    <Timeline steps={selectedShipment.timeline} />
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Tanggal Pengiriman</p>
                      <p className="font-semibold text-foreground">
                        {new Date(selectedShipment.shippingDate).toLocaleDateString('id-ID', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Estimasi Tiba</p>
                      <p className="font-semibold text-foreground">
                        {new Date(selectedShipment.estimatedDelivery).toLocaleDateString(
                          'id-ID',
                          {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-12 text-center">
                  <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">
                    Pilih pengiriman untuk melihat detail
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
