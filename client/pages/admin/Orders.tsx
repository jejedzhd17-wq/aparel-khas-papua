import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Eye, CheckCircle } from 'lucide-react';

interface Order {
  id: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  total: number;
  status: string;
  timestamp: string;
}

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const savedAdmin = localStorage.getItem('noken-admin');
    if (!savedAdmin) {
      navigate('/admin/login');
      return;
    }

    // Load orders from localStorage
    const loadedOrders: Order[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('order-')) {
        const orderData = JSON.parse(localStorage.getItem(key) || '{}');
        loadedOrders.push({
          id: key.replace('order-', ''),
          customer: orderData.customer,
          total: orderData.total,
          status: 'pending',
          timestamp: orderData.timestamp,
        });
      }
    }
    setOrders(loadedOrders.reverse());
  }, [navigate]);

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    setSelectedOrder(selectedOrder && selectedOrder.id === orderId
      ? { ...selectedOrder, status: newStatus }
      : selectedOrder
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('noken-admin');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="flex items-center justify-between px-4 py-4 md:px-8 max-w-7xl mx-auto">
          <Link to="/admin/dashboard" className="text-xl font-bold text-foreground font-playfair">
            Admin Panel
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-gray-100 rounded-lg text-muted-foreground hover:text-red-600"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Breadcrumb & Title */}
        <div className="mb-8">
          <Link to="/admin/dashboard" className="text-primary hover:underline text-sm mb-2 inline-block">
            ← Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-foreground font-playfair mb-2">
            Manajemen Pesanan
          </h1>
          <p className="text-muted-foreground">
            Total {orders.length} pesanan
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {orders.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p>Tidak ada pesanan</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">ID Pesanan</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Pelanggan</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Total</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <span className="font-mono text-sm font-semibold text-primary">
                              {order.id.substring(0, 12)}...
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-foreground">{order.customer.fullName}</p>
                              <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-foreground">
                            Rp {order.total.toLocaleString('id-ID')}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {order.status === 'pending' && 'Menunggu'}
                              {order.status === 'processing' && 'Diproses'}
                              {order.status === 'completed' && 'Selesai'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-2 hover:bg-gray-100 rounded-lg text-primary transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Order Detail */}
          <div>
            {selectedOrder ? (
              <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Detail Pesanan</h2>

                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">ID Pesanan</p>
                    <p className="font-mono font-semibold text-foreground text-xs">
                      {selectedOrder.id}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground mb-1">Nama Pelanggan</p>
                    <p className="font-semibold text-foreground">
                      {selectedOrder.customer.fullName}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground mb-1">Email</p>
                    <p className="text-foreground">{selectedOrder.customer.email}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground mb-1">No. Telepon</p>
                    <p className="text-foreground">{selectedOrder.customer.phone}</p>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-muted-foreground mb-1">Total Pembayaran</p>
                    <p className="text-2xl font-bold text-primary">
                      Rp {selectedOrder.total.toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-muted-foreground mb-3">Ubah Status</p>
                    <div className="space-y-2">
                      {['pending', 'processing', 'completed'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                          className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                            selectedOrder.status === status
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-foreground hover:bg-gray-200'
                          }`}
                        >
                          {status === 'pending' && 'Menunggu'}
                          {status === 'processing' && 'Diproses'}
                          {status === 'completed' && 'Selesai'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedOrder.status === 'completed' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <p className="text-xs text-green-700">Pesanan telah selesai</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-muted-foreground">
                <p>Pilih pesanan untuk melihat detail</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
