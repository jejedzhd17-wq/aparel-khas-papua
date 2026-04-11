import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

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
          <ShoppingCart className="w-20 h-20 text-primary/20 mx-auto mb-6" />
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
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.size}`}
                  className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 flex gap-4"
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <Link
                      to={`/product/${item.id}`}
                      className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-muted-foreground mb-2">
                      Ukuran: {item.size}
                    </p>
                    <p className="font-bold text-primary">
                      Rp {item.price.toLocaleString('id-ID')}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end gap-4">
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

                    {/* Subtotal & Delete */}
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-2">
                        Subtotal: Rp{' '}
                        {(item.price * item.quantity).toLocaleString('id-ID')}
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

            {/* Continue Shopping Link */}
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 text-primary font-semibold hover:gap-4 transition-all"
            >
              ← Lanjut Belanja
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-6 sticky top-20">
              <h2 className="text-xl font-bold text-foreground mb-6">
                Ringkasan Pesanan
              </h2>

              <div className="space-y-4 mb-6 pb-6 border-b border-gray-300">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">Rp {total.toLocaleString('id-ID')}</span>
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
                  Rp {total.toLocaleString('id-ID')}
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
    </div>
  );
}
