import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { ShoppingCart } from 'lucide-react';

export default function Cart() {
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
