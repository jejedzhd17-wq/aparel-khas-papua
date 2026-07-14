import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const TifaIllustration = () => (
  <svg
    viewBox="0 0 100 120"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-32 h-32 text-primary mx-auto mb-6 opacity-85"
  >
    {/* Permukaan atas kulit Tifa */}
    <ellipse cx="50" cy="15" rx="20" ry="6" fill="currentColor" fillOpacity={0.1} />
    {/* Badan Utama Tifa (bentuk jam pasir) */}
    <path d="M30 15c0 10 5 18 10 30s5 20 5 35c0 10-5 15-15 25h40c-10-10-15-15-15-25 0-15 5-23 5-35s5-20 10-30H30z" />
    {/* Motif etnik melingkar di pinggang Tifa */}
    <path d="M40 50h20M41 55h18M42 60h16" />
    <path d="M40 50L50 60L60 50" />
    {/* Tali pengikat tali longitudinal */}
    <path d="M30 15l10 35M70 15L60 50M35 15l7 35M65 15L58 50" opacity={0.6} />
    {/* Gagang pegangan Tifa */}
    <path d="M36 60c-8 2-12 8-12 15s4 13 12 15" />
    {/* Dudukan bawah */}
    <ellipse cx="50" cy="105" rx="15" ry="5" />
  </svg>
);

const getResolvedSrc = (raw?: string) => {
  if (!raw) return '/placeholder.svg';
  if (raw.startsWith('data:')) return raw;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  if (raw.startsWith('/')) return raw;
  return `/uploads/${raw}`;
};

export default function Cart() {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />

        <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-8 md:py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground font-playfair mb-2">
              Keranjang Belanja
            </h1>
            <p className="text-muted-foreground text-lg">
              Kelola produk yang ingin Anda beli
            </p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 text-center">
          <TifaIllustration />
          <h2 className="text-2xl font-bold text-foreground mb-4 font-playfair">
            Keranjang Anda Kosong
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
            Mulai belanja sekarang dan temukan koleksi produk apparel Papua kami yang menakjubkan.
          </p>
          <Link
            to="/shop"
            className="inline-block bg-primary text-white font-semibold px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Lanjut Belanja
          </Link>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-8 md:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground font-playfair mb-2">
            Keranjang Belanja
          </h1>
          <p className="text-muted-foreground text-lg">
            {items.length} produk di keranjang Anda
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Daftar Keranjang */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.size}`}
                  className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 flex flex-col sm:flex-row gap-4"
                >
                  {/* Baris Gambar + Informasi Produk */}
                  <div className="flex gap-3 sm:gap-4 flex-1">
                    {/* Gambar Produk */}
                    <div className="flex-shrink-0">
                      <img
                        src={getResolvedSrc(item.image)}
                        alt={item.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg"
                      />
                    </div>

                    {/* Informasi Produk */}
                    <div className="flex-1">
                      <Link
                        to={`/product/${item.id}`}
                        className="text-sm sm:text-base md:text-lg font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-muted-foreground mb-1 sm:mb-2">
                        Ukuran: {item.size}
                      </p>
                      <p className="font-bold text-primary text-sm sm:text-base">
                        Rp {Number(item.price).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  {/* Kontrol Jumlah */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.size,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        className="p-2 hover:bg-gray-100 transition"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.size, item.quantity + 1)
                        }
                        className="p-2 hover:bg-gray-100 transition"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Subtotal & Hapus */}
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-2">
                        Subtotal: Rp{' '}
                        {(Number(item.price) * item.quantity).toLocaleString('id-ID')}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id, item.size)}
                        className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tombol Lanjut Belanja */}
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 text-primary font-semibold hover:gap-4 transition-all"
            >
              ← Lanjut Belanja
            </Link>
          </div>

          {/* Ringkasan Pesanan */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-6 sticky top-20">
              <h2 className="text-xl font-bold text-foreground mb-6">
                Ringkasan Pesanan
              </h2>

              <div className="space-y-4 mb-6 pb-6 border-b border-gray-300">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">Rp {Number(total).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ongkir</span>
                  <span className="font-semibold text-green-600">Gratis</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pajak</span>
                  <span className="font-semibold">Rp 0</span>
                </div>
              </div>

              <div className="flex justify-between mb-6 text-lg">
                <span className="font-bold text-foreground">Total</span>
                <span className="font-bold text-primary text-2xl">
                  Rp {Number(total).toLocaleString('id-ID')}
                </span>
              </div>

              <Link
                to="/checkout"
                className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mb-3"
              >
                Lanjut ke Checkout
                <ArrowRight className="w-5 h-5" />
              </Link>

              <button
                onClick={clearCart}
                className="w-full border-2 border-gray-300 text-foreground font-semibold py-2 rounded-lg hover:border-red-500 hover:text-red-600 transition-colors"
              >
                Kosongkan Keranjang
              </button>

              <p className="text-xs text-muted-foreground mt-4 text-center">
                Gratis ongkir untuk semua pesanan di Indonesia
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
