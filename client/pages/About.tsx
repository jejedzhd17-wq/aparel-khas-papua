import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Palette, Leaf, Handshake, Gem } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, delay, ease: 'easeOut' },
});

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
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative max-w-7xl mx-auto z-10"
        >
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
            Tentang Kami
          </h1>
          <p className="text-white/90 text-lg md:text-xl max-w-2xl">
            Pelajari kisah di balik Aparel Khas Papua Store
          </p>
        </motion.div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <div className="space-y-12">
          <motion.section {...fadeUp(0)}>
            <h2 className="text-2xl font-bold text-foreground mb-4 font-playfair">
              Visi Kami
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Membawa keindahan budaya Papua ke tingkat global sambil memberikan dampak positif bagi komunitas lokal. Kami percaya bahwa fashion dapat menjadi medium untuk menceritakan kisah budaya yang kaya dan menginspirasi orang di seluruh dunia.
            </p>
          </motion.section>

          <motion.section {...fadeUp(0.1)}>
            <h2 className="text-2xl font-bold text-foreground mb-4 font-playfair">
              Misi Kami
            </h2>
            <ul className="space-y-3 text-muted-foreground text-lg">
              {[
                'Menciptakan produk berkualitas tinggi yang menampilkan desain tradisional Papua',
                'Mendukung pengrajin lokal Papua dan memberikan mereka penghasilan yang layak',
                'Menjaga keberlanjutan lingkungan dengan praktik bisnis yang bertanggung jawab',
                'Mengedukasi konsumen tentang kekayaan budaya Papua',
              ].map((text, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex gap-3"
                >
                  <span className="text-primary font-bold">✓</span>
                  <span>{text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.section>

          <motion.section {...fadeUp(0.15)}>
            <h2 className="text-2xl font-bold text-foreground mb-4 font-playfair">
              Nilai-Nilai Kami
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: <Palette className="w-6 h-6 text-primary" />, title: 'Autentisitas', desc: 'Setiap desain mencerminkan kebenaran budaya Papua' },
                { icon: <Leaf className="w-6 h-6 text-primary" />, title: 'Keberlanjutan', desc: 'Komitmen kami terhadap planet dan komunitas lokal' },
                { icon: <Handshake className="w-6 h-6 text-primary" />, title: 'Pemberdayaan', desc: 'Kami memberdayakan pengrajin lokal melalui peluang ekonomi' },
                { icon: <Gem className="w-6 h-6 text-primary" />, title: 'Kualitas', desc: 'Standar tinggi dalam setiap aspek produk kami' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.6, delay: idx * 0.12, ease: 'easeOut' }}
                  className="group bg-white border border-primary/30 rounded-xl p-6 flex gap-4 items-start shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/20 transition-all duration-300 group-hover:bg-primary/20 group-hover:border-primary/50 group-hover:scale-110">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg mb-1 transition-colors duration-300 group-hover:text-primary">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
