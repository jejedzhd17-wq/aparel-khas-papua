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
      navigate('/admin/login');
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
    }, 500);
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
    if (confirm(`Delete shipment ${shipment.id}?`)) {
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

  const statusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      shipped: 'bg-blue-100 text-blue-800',
      in_transit: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    { key: 'id' as const, label: 'Shipment ID' },
    { key: 'orderId' as const, label: 'Order ID' },
    { key: 'courier' as const, label: 'Courier' },
    { key: 'trackingNumber' as const, label: 'Tracking #' },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string) => (
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeColor(value)}`}>
          {value}
        </span>
      ),
    },
    { key: 'date' as const, label: 'Date' },
    { key: 'actions' as const, label: 'Actions' },
  ];

  return (
    <AdminLayout title="Shipments" description="Track and manage shipments">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Shipment List</h2>
        <button
          onClick={handleAddShipment}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
        >
          <Plus className="w-5 h-5" />
          New Shipment
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
        title={selectedShipment ? 'Edit Shipment' : 'Create Shipment'}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Order ID
            </label>
            <input
              type="text"
              value={formData.orderId}
              onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Courier
            </label>
            <select
              value={formData.courier}
              onChange={(e) => setFormData({ ...formData, courier: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option>JNE</option>
              <option>J&T</option>
              <option>SiCepat</option>
              <option>Pos Indonesia</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Tracking Number
            </label>
            <input
              type="text"
              value={formData.trackingNumber}
              onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary text-white font-medium py-2 rounded-lg hover:bg-primary/90"
            >
              {selectedShipment ? 'Update' : 'Create'} Shipment
            </button>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 border border-gray-300 text-gray-900 font-medium py-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </AdminModal>
    </AdminLayout>
  );
}
