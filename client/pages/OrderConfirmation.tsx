import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { CheckCircle, Copy, AlertCircle } from 'lucide-react';

interface Order {
  id: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
  };
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    size: string;
  }>;
  total: number;
  paymentMethod: string;
  bankName?: string;
  eWalletName?: string;
  timestamp: string;
}

export default function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (orderId) {
      const savedOrder = localStorage.getItem(`order-${orderId}`);
      if (savedOrder) {
        setOrder(JSON.parse(savedOrder));
      }
    }
  }, [orderId]);

  const handleCopyOrderId = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-4 font-playfair">
            Pesanan Tidak Ditemukan
          </h1>
          <p className="text-muted-foreground mb-8">
            Maaf, kami tidak dapat menemukan detail pesanan Anda.
          </p>
          <Link
            to="/shop"
            className="inline-block bg-primary text-white font-semibold px-8 py-3 rounded-lg hover:bg-primary/90"
          >
            Kembali ke Shop
          </Link>
        </div>
      </div>
    );
  }

  const bankInfo: Record<string, { name: string; account: string; accountName: string }> = {
    bca: { name: 'BCA', account: '1234567890', accountName: 'Noken Papua Store' },
    bri: { name: 'BRI', account: '0987654321', accountName: 'Noken Papua Store' },
    mandiri: { name: 'Mandiri', account: '1122334455', accountName: 'Noken Papua Store' },
  };

  const paymentInstructions = () => {
    if (order.paymentMethod === 'bank-transfer' && order.bankName) {
      const bank = bankInfo[order.bankName];
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-foreground mb-3">Instruksi Pembayaran</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Silakan transfer ke rekening berikut:
          </p>
          <div className="bg-white rounded p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bank</span>
              <span className="font-semibold">{bank.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nomor Rekening</span>
              <span className="font-semibold">{bank.account}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Atas Nama</span>
              <span className="font-semibold">{bank.accountName}</span>
            </div>
            <div className="flex justify-between bg-yellow-50 p-2 rounded">
              <span className="text-muted-foreground">Jumlah Transfer</span>
              <span className="font-bold text-primary">
                Rp {order.total.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Gunakan ID Pesanan sebagai berita transfer untuk identifikasi pembayaran
          </p>
        </div>
      );
    } else if (order.paymentMethod === 'ewallet') {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-foreground mb-3">Instruksi Pembayaran</h3>
          <p className="text-sm text-muted-foreground">
            Lakukan pembayaran melalui aplikasi {order.eWalletName?.toUpperCase()} Anda dengan nominal:
          </p>
          <div className="bg-yellow-50 p-3 rounded mt-3 text-center">
            <span className="font-bold text-primary text-2xl">
              Rp {order.total.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-foreground mb-3">Instruksi Pembayaran</h3>
          <p className="text-sm text-muted-foreground">
            Pembayaran akan dilakukan saat paket tiba di tangan Anda. Total pembayaran:
          </p>
          <div className="bg-yellow-50 p-3 rounded mt-3 text-center">
            <span className="font-bold text-primary text-2xl">
              Rp {order.total.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-8 md:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground font-playfair">
              Pesanan Berhasil Dibuat
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Terima kasih telah berbelanja di Noken Papua Store
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Order ID */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <p className="text-sm text-muted-foreground mb-2">ID Pesanan Anda</p>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-foreground">{orderId}</span>
            <button
              onClick={handleCopyOrderId}
              className="p-2 hover:bg-green-100 rounded transition-colors"
            >
              <Copy className="w-5 h-5 text-primary" />
            </button>
            {copied && <span className="text-green-600 text-sm font-semibold">Disalin!</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Instructions & Customer Info */}
          <div className="lg:col-span-2 space-y-8">
            {paymentInstructions()}

            {/* Customer Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4 font-playfair">
                Data Pengiriman
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Nama Penerima</p>
                  <p className="font-semibold text-foreground">{order.customer.fullName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Alamat</p>
                  <p className="font-semibold text-foreground">
                    {order.customer.address}
                    <br />
                    {order.customer.city}, {order.customer.province} {order.customer.postalCode}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">No. Telepon</p>
                  <p className="font-semibold text-foreground">{order.customer.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-semibold text-foreground">{order.customer.email}</p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4 font-playfair">
                Detail Pesanan
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={`${item.id}-${item.size}`}
                    className="flex justify-between items-center pb-4 border-b border-gray-200 last:border-b-0 last:pb-0"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Ukuran: {item.size} | Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-primary">
                      Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-6 sticky top-20">
              <h2 className="text-xl font-bold text-foreground mb-6">
                Ringkasan Pesanan
              </h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-300">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">Rp {order.total.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ongkir</span>
                  <span className="font-semibold text-green-600">Gratis</span>
                </div>
              </div>

              <div className="flex justify-between mb-6 text-lg">
                <span className="font-bold text-foreground">Total</span>
                <span className="font-bold text-primary text-2xl">
                  Rp {order.total.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="bg-white rounded-lg p-3 mb-6">
                <p className="text-xs text-muted-foreground mb-1">Status Pembayaran</p>
                <p className="font-bold text-yellow-600">Menunggu Pembayaran</p>
              </div>

              <Link
                to="/shop"
                className="w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary/90 transition-colors block text-center"
              >
                Lanjut Belanja
              </Link>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <h3 className="font-bold text-foreground mb-4">Butuh Bantuan?</h3>
          <p className="text-muted-foreground mb-4">
            Jika Anda memiliki pertanyaan tentang pesanan, silakan hubungi kami:
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <a
              href="tel:+6281234567890"
              className="flex-1 bg-white border border-gray-300 rounded-lg p-3 hover:border-primary transition-colors text-center"
            >
              <p className="font-semibold text-foreground">WhatsApp</p>
              <p className="text-sm text-muted-foreground">+62 812 3456 7890</p>
            </a>
            <a
              href="mailto:hello@nokenpapua.store"
              className="flex-1 bg-white border border-gray-300 rounded-lg p-3 hover:border-primary transition-colors text-center"
            >
              <p className="font-semibold text-foreground">Email</p>
              <p className="text-sm text-muted-foreground">hello@nokenpapua.store</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
