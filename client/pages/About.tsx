import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Palette, Leaf, Handshake, Gem } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Page Header dengan Background Wanita Adat Papua */}
      <section 
        className="relative py-24 md:py-36 px-4 bg-cover bg-[center_35%] text-white overflow-hidden"
        style={{ backgroundImage: "url('/papua-about.jpg')" }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/45" />
        
        <div className="relative max-w-7xl mx-auto z-10">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
            Tentang Kami
          </h1>
          <p className="text-white/90 text-lg md:text-xl max-w-2xl">
            Pelajari kisah di balik Aparel Khas Papua Store
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4 font-playfair">
              Visi Kami
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Membawa keindahan budaya Papua ke tingkat global sambil memberikan dampak positif bagi komunitas lokal. Kami percaya bahwa fashion dapat menjadi medium untuk menceritakan kisah budaya yang kaya dan menginspirasi orang di seluruh dunia.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4 font-playfair">
              Misi Kami
            </h2>
            <ul className="space-y-3 text-muted-foreground text-lg">
              <li className="flex gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>Menciptakan produk berkualitas tinggi yang menampilkan desain tradisional Papua</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>Mendukung pengrajin lokal Papua dan memberikan mereka penghasilan yang layak</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>Menjaga keberlanjutan lingkungan dengan praktik bisnis yang bertanggung jawab</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">✓</span>
                <span>Mengedukasi konsumen tentang kekayaan budaya Papua</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4 font-playfair">
              Nilai-Nilai Kami
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: <Palette className="w-6 h-6 text-primary" />,
                  title: 'Autentisitas',
                  desc: 'Setiap desain mencerminkan kebenaran budaya Papua'
                },
                {
                  icon: <Leaf className="w-6 h-6 text-primary" />,
                  title: 'Keberlanjutan',
                  desc: 'Komitmen kami terhadap planet dan komunitas lokal'
                },
                {
                  icon: <Handshake className="w-6 h-6 text-primary" />,
                  title: 'Pemberdayaan',
                  desc: 'Kami memberdayakan pengrajin lokal melalui peluang ekonomi'
                },
                {
                  icon: <Gem className="w-6 h-6 text-primary" />,
                  title: 'Kualitas',
                  desc: 'Standar tinggi dalam setiap aspek produk kami'
                },
              ].map((item, idx) => (
                <div key={idx} className="group bg-white border border-primary/30 rounded-xl p-6 flex gap-4 items-start shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/20 transition-all duration-300 group-hover:bg-primary/20 group-hover:border-primary/50 group-hover:scale-110">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg mb-1 transition-colors duration-300 group-hover:text-primary">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
