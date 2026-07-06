import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import AdminTable from '@/components/AdminTable';
import AdminModal from '@/components/AdminModal';
import { Plus } from 'lucide-react';

interface Shipment {
  id: string;
  orderId: string;
  courier: string;
  trackingNumber: string;
  status: 'pending' | 'shipped' | 'in_transit' | 'delivered';
  date: string;
}

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  shipped: 'bg-blue-50 text-blue-700 border-blue-100',
  in_transit: 'bg-purple-50 text-purple-700 border-purple-100',
  delivered: 'bg-green-50 text-green-700 border-green-100',
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu',
  shipped: 'Dikirim',
  in_transit: 'Dalam Perjalanan',
  delivered: 'Sampai Tujuan',
};

export default function AdminShipments() {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [formData, setFormData] = useState({
    orderId: '',
    courier: 'JNE',
    trackingNumber: '',
  });

  useEffect(() => {
    const savedAdmin = localStorage.getItem('noken-admin');
    if (!savedAdmin) {
      navigate('/login');
      return;
    }
    loadShipments();
  }, [navigate]);

  const loadShipments = () => {
    setIsLoading(true);
    setTimeout(() => {
      setShipments([
        { id: 'SHIP-1', orderId: 'ORD-001', courier: 'JNE', trackingNumber: 'JNE123456789', status: 'delivered', date: '2024-01-15' },
        { id: 'SHIP-2', orderId: 'ORD-002', courier: 'J&T', trackingNumber: 'JT987654321', status: 'in_transit', date: '2024-01-18' },
        { id: 'SHIP-3', orderId: 'ORD-003', courier: 'SiCepat', trackingNumber: 'SC555666777', status: 'shipped', date: '2024-01-19' },
        { id: 'SHIP-4', orderId: 'ORD-004', courier: 'Pos Indonesia', trackingNumber: 'POS111222333', status: 'pending', date: '2024-01-17' },
      ]);
      setIsLoading(false);
    }, 450);
  };

  const handleAddShipment = () => {
    setSelectedShipment(null);
    setFormData({ orderId: '', courier: 'JNE', trackingNumber: '' });
    setShowModal(true);
  };

  const handleEdit = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setFormData({
      orderId: shipment.orderId,
      courier: shipment.courier,
      trackingNumber: shipment.trackingNumber,
    });
    setShowModal(true);
  };

  const handleDelete = (shipment: Shipment) => {
    if (confirm(`Hapus pengiriman ${shipment.id}?`)) {
      setShipments(shipments.filter((s) => s.id !== shipment.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedShipment) {
      setShipments(
        shipments.map((s) =>
          s.id === selectedShipment.id ? { ...s, ...formData } : s
        )
      );
    } else {
      setShipments([
        ...shipments,
        {
          id: `SHIP-${Math.max(...shipments.map((s) => parseInt(s.id.split('-')[1])), 0) + 1}`,
          ...formData,
          status: 'pending' as const,
          date: new Date().toISOString().split('T')[0],
        },
      ]);
    }

    setShowModal(false);
  };

  const columns = [
    { key: 'id' as const, label: 'ID Kirim' },
    { key: 'orderId' as const, label: 'ID Pesanan' },
    { key: 'courier' as const, label: 'Kurir' },
    { key: 'trackingNumber' as const, label: 'No Resi', hideOnMobile: true },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: keyof typeof STATUS_LABEL) => (
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_STYLE[value] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
          {STATUS_LABEL[value] || value}
        </span>
      ),
    },
    { key: 'date' as const, label: 'Tanggal', hideOnMobile: true },
    { key: 'actions' as const, label: 'Aksi' },
  ];

  return (
    <AdminLayout title="Pengiriman" description="Lacak dan kelola logistik pengiriman pesanan">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Daftar Pengiriman</h2>
          <p className="text-xs text-gray-500 mt-0.5">{shipments.length} transaksi pengiriman</p>
        </div>
        <button
          onClick={handleAddShipment}
          className="flex items-center gap-1.5 bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary/90 text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Pengiriman Baru
        </button>
      </div>

      <AdminTable
        columns={columns}
        data={shipments}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AdminModal
        title={selectedShipment ? 'Edit Pengiriman' : 'Buat Pengiriman Baru'}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              ID Pesanan
            </label>
            <input
              type="text"
              value={formData.orderId}
              onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
              placeholder="cth: ORD-001"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Kurir
            </label>
            <select
              value={formData.courier}
              onChange={(e) => setFormData({ ...formData, courier: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm bg-white"
            >
              <option>JNE</option>
              <option>J&T</option>
              <option>SiCepat</option>
              <option>Pos Indonesia</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Nomor Resi
            </label>
            <input
              type="text"
              value={formData.trackingNumber}
              onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
              placeholder="Masukkan nomor resi pengiriman"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary/90 text-sm transition-colors"
            >
              {selectedShipment ? 'Simpan' : 'Buat'}
            </button>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-50 text-sm transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </AdminModal>
    </AdminLayout>
  );
}
