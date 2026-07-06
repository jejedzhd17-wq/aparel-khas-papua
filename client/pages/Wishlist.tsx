import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { Heart, ShoppingCart, Trash2, Star } from 'lucide-react';
import { useState } from 'react';

const CenderawasihIllustration = () => (
  <svg
    viewBox="0 0 120 120"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-32 h-32 text-primary mx-auto mb-6 opacity-85"
  >
    {/* Badan burung */}
    <path d="M60 45c3-1 6-2 9-2s4 2 2 4l-7 7c-3 3-5 5-4 8 1 2 4 1 6-1l8-8c2-2 3-5 1-7s-5-2-8 0" />
    {/* Kepala & paruh */}
    <path d="M72 41c1-1 3-1 4 0s.5 2-.5 3l-3.5 1.5Z" fill="currentColor" />
    {/* Sayap mengepak */}
    <path d="M56 47C42 42 28 42 16 48c10 5 22 7 36 3m4-4c-6 12-14 22-26 28 10-4 18-12 24-22" />
    {/* Bulu ekor panjang khas Cenderawasih */}
    <path d="M61 58c-2 15-5 32-15 47M64 57c2 15 8 32 23 48" strokeWidth="1" />
    <path d="M46 105c-3 2-6 1-5-2s4-5 5-2M87 105c3 2 6 1 5-2s-4-5-5-2" fill="currentColor" />
  </svg>
);

const getResolvedSrc = (raw?: string) => {
  if (!raw) return '/placeholder.svg';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  if (raw.startsWith('/')) return raw;
  return `/uploads/${raw}`;
};

export default function Wishlist() {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  const handleAddToCart = (item: typeof items[0]) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category,
      quantity: 1,
      size: 'M',
    });
    setAddedIds((prev) => new Set(prev).add(item.id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-8 md:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground font-playfair mb-2">
            Wishlist
          </h1>
          <p className="text-muted-foreground text-lg">
            Produk favorit yang sudah Anda simpan
          </p>
        </div>
      </section>

      <div className="flex-1 max-w-7xl mx-auto px-4 py-12 md:py-16 w-full">
        {items.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <CenderawasihIllustration />
            <h2 className="text-2xl font-bold text-foreground mb-4 font-playfair">
              Wishlist Anda Kosong
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Belum ada produk yang Anda simpan. Jelajahi koleksi kami dan simpan produk favorit Anda!
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <>
            {/* Header with Clear button */}
            <div className="flex items-center justify-between mb-8">
              <p className="text-muted-foreground">
                {items.length} produk dalam wishlist
              </p>
              <button
                onClick={clearWishlist}
                className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Hapus Semua
              </button>
            </div>

            {/* Wishlist Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
                >
                  {/* Product Image */}
                  <Link to={`/product/${item.id}`}>
                    <div className="relative h-36 xs:h-40 sm:h-48 md:h-64 overflow-hidden bg-gray-100">
                      <img
                        src={getResolvedSrc(item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {item.category}
                      </div>
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-4">
                    <Link to={`/product/${item.id}`}>
                      <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground mb-1 sm:mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {item.name}
                      </h3>
                    </Link>

                    {/* Rating placeholder */}
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <span className="text-lg sm:text-xl md:text-2xl font-bold text-primary">
                        Rp {Number(item.price).toLocaleString('id-ID')}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className={`flex-1 font-semibold py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-1 text-xs ${
                          addedIds.has(item.id)
                            ? 'bg-green-600 text-white'
                            : 'bg-primary text-white hover:bg-primary/90'
                        }`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {addedIds.has(item.id) ? 'Ditambahkan!' : 'Tambah ke Keranjang'}
                      </button>
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="px-3 py-2 border-2 border-red-200 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors group/remove"
                        title="Hapus dari wishlist"
                      >
                        <Trash2 className="w-4 h-4 text-red-400 group-hover/remove:text-red-600 transition-colors" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
