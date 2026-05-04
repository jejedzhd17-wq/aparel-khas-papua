import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import AdminTable from '@/components/AdminTable';
import AdminModal from '@/components/AdminModal';

interface Order {
  id: string;
  customer: string;
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'completed';
  date: string;
}

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    const savedAdmin = localStorage.getItem('noken-admin');
    if (!savedAdmin) {
      navigate('/admin/login');
      return;
    }

    loadOrders();
  }, [navigate]);

  const loadOrders = () => {
    setIsLoading(true);
    setTimeout(() => {
      setOrders([
        { id: 'ORD-001', customer: 'Budi Santoso', total: 450000, status: 'completed', date: '2024-01-20' },
        { id: 'ORD-002', customer: 'Siti Nurhaliza', total: 899000, status: 'shipped', date: '2024-01-19' },
        { id: 'ORD-003', customer: 'Ahmad Wijaya', total: 299000, status: 'paid', date: '2024-01-18' },
        { id: 'ORD-004', customer: 'Dewi Lestari', total: 599000, status: 'pending', date: '2024-01-17' },
        { id: 'ORD-005', customer: 'Rinto Harahap', total: 1200000, status: 'completed', date: '2024-01-16' },
      ]);
      setIsLoading(false);
    }, 500);
  };

  const handleStatusUpdate = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowModal(true);
  };

  const submitStatusUpdate = () => {
    if (selectedOrder) {
      setOrders(
        orders.map((o) =>
          o.id === selectedOrder.id ? { ...o, status: newStatus as Order['status'] } : o
        )
      );
      setShowModal(false);
      setSelectedOrder(null);
    }
  };

  const statusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    { key: 'id' as const, label: 'Order ID' },
    { key: 'customer' as const, label: 'Customer' },
    {
      key: 'total' as const,
      label: 'Total',
      render: (value: number) => `Rp ${value.toLocaleString('id-ID')}`,
    },
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
  ];

  return (
    <AdminLayout title="Orders" description="Manage customer orders">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Order List</h2>
        <p className="text-sm text-gray-600">Total: {orders.length} orders</p>
      </div>

      <AdminTable
        columns={columns}
        data={orders}
        isLoading={isLoading}
        onEdit={handleStatusUpdate}
      />

      <AdminModal
        title={`Update Order Status - ${selectedOrder?.id}`}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedOrder(null);
        }}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              New Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={submitStatusUpdate}
              className="flex-1 bg-primary text-white font-medium py-2 rounded-lg hover:bg-primary/90"
            >
              Update Status
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 border border-gray-300 text-gray-900 font-medium py-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </AdminModal>
    </AdminLayout>
  );
}
