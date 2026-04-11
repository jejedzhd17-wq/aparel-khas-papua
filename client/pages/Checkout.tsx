import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { useCart } from '@/context/CartContext';
import { ArrowRight, Check } from 'lucide-react';

type PaymentMethod = 'bank-transfer' | 'ewallet' | 'cod' | null;

interface CheckoutForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [selectedBank, setSelectedBank] = useState('bca');
  const [selectedEWallet, setSelectedEWallet] = useState('ovo');
  const [form, setForm] = useState<CheckoutForm>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
  });

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4 font-playfair">
            Keranjang Kosong
          </h1>
          <p className="text-muted-foreground mb-8">
            Silakan tambahkan produk sebelum melakukan checkout
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentMethod) {
      alert('Pilih metode pembayaran');
      return;
    }

    if (!form.fullName || !form.email || !form.phone || !form.address) {
      alert('Lengkapi data pembeli');
      return;
    }

    // Generate fake order ID
    const orderId = `ORD-${Date.now()}`;

    // Save order to localStorage (in production, save to database)
    const order = {
      id: orderId,
      customer: form,
      items: items,
      total: total,
      paymentMethod: paymentMethod,
      bankName: selectedBank,
      eWalletName: selectedEWallet,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(`order-${orderId}`, JSON.stringify(order));
    clearCart();

    // Redirect to confirmation
    navigate(`/order-confirmation/${orderId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-8 md:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground font-playfair mb-2">
            Checkout
          </h1>
          <p className="text-muted-foreground text-lg">
            Selesaikan pesanan Anda
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <form onSubmit={handleSubmitOrder} className="lg:col-span-2 space-y-8">
            {/* Customer Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6 font-playfair">
                Data Pembeli
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleInputChange}
                    placeholder="Nama Anda"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      placeholder="email@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      No. Telepon
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleInputChange}
                      placeholder="+62..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Alamat Lengkap
                  </label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleInputChange}
                    placeholder="Jalan, no rumah, RT/RW"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Kota/Kabupaten
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleInputChange}
                      placeholder="Kota"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Provinsi
                    </label>
                    <input
                      type="text"
                      name="province"
                      value={form.province}
                      onChange={handleInputChange}
                      placeholder="Provinsi"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Kode Pos
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={form.postalCode}
                      onChange={handleInputChange}
                      placeholder="12345"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6 font-playfair">
                Pilih Metode Pembayaran
              </h2>

              <div className="space-y-4">
                {/* Bank Transfer */}
                <label className="block">
                  <input
                    type="radio"
                    name="payment"
                    value="bank-transfer"
                    checked={paymentMethod === 'bank-transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="mr-3"
                  />
                  <span className="font-semibold text-foreground">Transfer Bank</span>
                </label>
                {paymentMethod === 'bank-transfer' && (
                  <div className="ml-6 space-y-2 mb-6">
                    {[
                      { id: 'bca', name: 'BCA', account: '1234567890' },
                      { id: 'bri', name: 'BRI', account: '0987654321' },
                      { id: 'mandiri', name: 'Mandiri', account: '1122334455' },
                    ].map((bank) => (
                      <label key={bank.id} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-primary">
                        <input
                          type="radio"
                          name="bank"
                          value={bank.id}
                          checked={selectedBank === bank.id}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="mr-3"
                        />
                        <div>
                          <span className="font-semibold text-foreground">{bank.name}</span>
                          <p className="text-sm text-muted-foreground">{bank.account}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {/* E-Wallet */}
                <label className="block">
                  <input
                    type="radio"
                    name="payment"
                    value="ewallet"
                    checked={paymentMethod === 'ewallet'}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="mr-3"
                  />
                  <span className="font-semibold text-foreground">E-Wallet</span>
                </label>
                {paymentMethod === 'ewallet' && (
                  <div className="ml-6 space-y-2 mb-6">
                    {[
                      { id: 'ovo', name: 'OVO' },
                      { id: 'dana', name: 'Dana' },
                      { id: 'gopay', name: 'GoPay' },
                    ].map((wallet) => (
                      <label key={wallet.id} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-primary">
                        <input
                          type="radio"
                          name="ewallet"
                          value={wallet.id}
                          checked={selectedEWallet === wallet.id}
                          onChange={(e) => setSelectedEWallet(e.target.value)}
                          className="mr-3"
                        />
                        <span className="font-semibold text-foreground">{wallet.name}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* COD */}
                <label className="block p-4 border border-gray-300 rounded-lg hover:border-primary cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="mr-3"
                  />
                  <span className="font-semibold text-foreground">Bayar di Tempat (COD)</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pembayaran saat paket tiba di tangan Anda
                  </p>
                </label>
              </div>
            </div>
          </form>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-6 sticky top-20">
              <h2 className="text-xl font-bold text-foreground mb-6">
                Ringkasan Pesanan
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-300 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.name} x {item.quantity}
                    </span>
                    <span className="font-semibold">
                      Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-300">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">Rp {total.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ongkir</span>
                  <span className="font-semibold text-green-600">Gratis</span>
                </div>
              </div>

              <div className="flex justify-between mb-6 text-lg">
                <span className="font-bold text-foreground">Total Pembayaran</span>
                <span className="font-bold text-primary text-2xl">
                  Rp {total.toLocaleString('id-ID')}
                </span>
              </div>

              <button
                type="submit"
                form="checkout-form"
                onClick={handleSubmitOrder}
                disabled={!paymentMethod}
                className={`w-full font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  paymentMethod
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {paymentMethod ? (
                  <>
                    <Check className="w-5 h-5" />
                    Lanjut ke Pembayaran
                  </>
                ) : (
                  'Pilih Metode Pembayaran'
                )}
              </button>

              <Link
                to="/cart"
                className="block w-full text-center mt-3 border-2 border-gray-300 text-foreground font-semibold py-2 rounded-lg hover:border-gray-400 transition-colors"
              >
                Kembali ke Keranjang
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
