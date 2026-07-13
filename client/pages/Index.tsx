import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Star, ArrowRight, Palette, Leaf, Handshake } from 'lucide-react';
import SplitText from '@/components/ui/SplitText';
import { motion } from 'framer-motion';

const getResolvedSrc = (raw?: string) => {
  if (!raw) return '/placeholder.svg';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  if (raw.startsWith('/')) return raw;
  return `/uploads/${raw}`;
};

const DEFAULT_FEATURED = [
  {
    id: 1,
    name: 'Kaos Raja Ampat',
    price: 149000,
    category: 'Pakaian',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    rating: 5,
  },
  {
    id: 9,
    name: 'Hoodie Papua Indonesia',
    price: 329000,
    category: 'Pakaian',
    image: '/hoodie-papua-indonesia.jpg',
    rating: 5,
  },
  {
    id: 3,
    name: 'Tas Noken Original',
    price: 199000,
    category: 'Tas Noken',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop',
    rating: 5,
  },
  {
    id: 4,
    name: 'Gelang Tradisional',
    price: 79000,
    category: 'Aksesoris',
    image: 'https://images.unsplash.com/photo-1515617293615-121f0c5c1241?w=400&h=400&fit=crop',
    rating: 5,
  },
];

export default function Index() {
  const [featured, setFeatured] = useState<any[]>(DEFAULT_FEATURED);
  const [isLoading, setIsLoading] = useState(true);

  // Loop tanpa batas: 2 salinan data, snap saat melewati setengah jalan
  const displayItems = featured.length > 0
    ? [...featured, ...featured, ...featured, ...featured]
    : [];

  // Ref untuk ticker bergulir tak terbatas berbasis scroll
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInteracting = useRef(false);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch('/api/products/featured');
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          setFeatured(data.data);
        }
      } catch (err) {
        console.error('Gagal mengambil produk unggulan:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  // Gulir otomatis menggunakan requestAnimationFrame
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || displayItems.length === 0) return;

    let lastTime = 0;
    const SPEED = 0.1; // px per ms — kecepatan setara animasi CSS 22 detik

    const tick = (time: number) => {
      if (!isInteracting.current && el) {
        const dt = lastTime ? time - lastTime : 0;
        el.scrollLeft += SPEED * dt;
        // Snap mulus: saat guliran melewati setengah lebar pertama
        const halfWidth = el.scrollWidth / 2;
        if (el.scrollLeft >= halfWidth) {
          el.scrollLeft -= halfWidth;
        }
      }
      lastTime = time;
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    const pause = () => { isInteracting.current = true; };
    const resume = () => { isInteracting.current = false; };
    const resumeTouch = () => {
      setTimeout(() => { isInteracting.current = false; }, 500);
    };

    el.addEventListener('touchstart', pause, { passive: true });
    el.addEventListener('touchend', resumeTouch, { passive: true });
    el.addEventListener('mousedown', pause);
    el.addEventListener('mouseup', resume);
    el.addEventListener('mouseleave', resume);
    el.addEventListener('mouseenter', pause);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      el.removeEventListener('touchstart', pause);
      el.removeEventListener('touchend', resumeTouch);
      el.removeEventListener('mousedown', pause);
      el.removeEventListener('mouseup', resume);
      el.removeEventListener('mouseleave', resume);
      el.removeEventListener('mouseenter', pause);
    };
  }, [displayItems.length]);

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Bagian Hero */}
      <section className="relative h-[600px] md:h-[800px] overflow-hidden bg-[#0a0a0a]">
        {/* Video Latar Belakang */}
        <div className="absolute inset-0" style={{ backgroundImage: "url('/video_first_frame.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="/video_first_frame.jpg"
            className="w-full h-full object-cover"
          >
            <source src="/rajaampat3.mp4" type="video/mp4" />
          </video>
          {/* Lapisan gelap agar teks mudah terbaca */}
          <div className="absolute inset-0 bg-black/45" />
        </div>

        <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
          <div className="max-w-3xl mx-auto">
            <SplitText
              text="Keindahan Papua dalam Setiap Karya"
              tag="h1"
              className="text-white mb-6"
              delay={60}
              duration={0.8}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-50px"
              textAlign="center"
            />
            <SplitText
              text="Terinspirasi dari kekayaan budaya dan alam Papua, kami menghadirkan koleksi yang memadukan tradisi dengan gaya modern."
              tag="p"
              className="text-lg md:text-xl text-white/90 mb-8 font-lora"
              delay={30}
              duration={0.6}
              ease="power3.out"
              splitType="words"
              from={{ opacity: 0, y: 20 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-50px"
              textAlign="center"
            />
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-8 py-3 rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
              >
                Mulai Belanja <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
              >
                Pelajari Cerita Kami
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bagian Produk Unggulan */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h2 className="text-foreground mb-4">
              Produk Unggulan
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Pilihan terbaik kami yang menggabungkan kualitas premium dengan desain yang terinspirasi budaya Papua
            </p>
          </motion.div>

          {/* Ticker gulir tak terbatas — otomatis bergulir, bisa digeser pengguna */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <style>{`.ticker-container::-webkit-scrollbar { display: none; }`}</style>
            <div
              ref={scrollRef}
              className="ticker-container overflow-x-scroll py-4 cursor-grab active:cursor-grabbing"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex gap-5 w-max">
                {displayItems.map((product, idx) => (
                  <div
                    key={`${product.id}-${idx}`}
                    className="flex-shrink-0 w-56 sm:w-64 md:w-72"
                  >
                    <Link
                      to={`/product/${product.id}`}
                      className="group block h-full"
                      draggable={false}
                    >
                      <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col select-none">
                        {/* Gambar Produk */}
                        <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden bg-gray-100">
                          <img
                            src={getResolvedSrc(product.image)}
                            alt={product.name}
                            draggable={false}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 pointer-events-none"
                          />
                          <div className="absolute top-3 right-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                            {product.category}
                          </div>
                        </div>

                        {/* Info Produk */}
                        <div className="p-4 flex flex-col flex-grow">
                          <h3 className="text-sm sm:text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">
                            {product.name}
                          </h3>

                          {/* Penilaian */}
                          <div className="flex items-center gap-1 mb-3">
                            {[...Array(product.rating)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>

                          {/* Harga */}
                          <div className="mt-auto">
                            <span className="text-lg font-bold text-primary block mb-3">
                              Rp {Number(product.price).toLocaleString('id-ID')}
                            </span>
                            <button className="w-full bg-primary text-white font-semibold text-xs py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200">
                              Lihat Detail
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-4 transition-all"
            >
              Lihat Semua Produk <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Banner Motif Papua */}
      <section
        className="relative py-28 px-4 overflow-hidden"
        style={{
          backgroundImage: "url('/papua-motif.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Lapisan gelap menyeluruh */}
        <div className="absolute inset-0 bg-black/70" />
        {/* Efek pudar halus bagian atas — menyesuaikan warna latar halaman */}
        <div
          className="absolute inset-x-0 top-0 h-28"
          style={{ background: 'linear-gradient(to bottom, #faf8f5 0%, transparent 100%)' }}
        />
        {/* Efek pudar halus bagian bawah — menyesuaikan warna latar halaman */}
        <div
          className="absolute inset-x-0 bottom-0 h-28"
          style={{ background: 'linear-gradient(to top, #faf8f5 0%, transparent 100%)' }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-3xl mx-auto text-center"
        >
          <span className="inline-block text-xs font-bold uppercase tracking-[0.3em] text-amber-300/90 mb-4">
            ✦ Warisan Budaya Papua ✦
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white font-playfair tracking-tight leading-tight mb-5">
            Setiap Motif Punya{' '}
            <span className="text-amber-300 italic">Ceritanya</span>
          </h2>
          <p className="text-white/75 text-base md:text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            Dari ukiran Asmat hingga lambang Cenderawasih — setiap goresan desain kami lahir dari kearifan lokal tanah Papua yang kaya dan mengagumkan.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-black font-bold px-8 py-3 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-amber-400/30 hover:gap-3"
          >
            Temukan Koleksi Kami <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* Bagian Tentang Papua */}
      <section className="py-16 md:py-24 px-4 bg-[#faf8f5] border-t border-b border-[#e8d5c4]">
        <div className="max-w-6xl mx-auto">

          {/* 2 Foto Berdampingan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-14">
            {[
              {
                src: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=700&q=80',
                alt: 'Raja Ampat Papua',
                label: '📍 Raja Ampat',
              },
              {
                src: '/jayapura.jpg',
                alt: 'Jayapura Papua',
                label: '📍 Jayapura, Papua',
              },
            ].map((photo, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: idx * 0.15, ease: "easeOut" }}
                className="relative group h-72 rounded-2xl overflow-hidden shadow-lg border border-[#e8d5c4]/40 cursor-pointer"
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="backdrop-blur-md bg-white/10 border border-white/20 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                    {photo.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Konten Teks - di bawah foto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">Filosofi Brand</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-6 font-playfair tracking-tight leading-tight">
                Lebih Dari Sekadar <span className="text-primary italic font-serif">Sandang</span>
              </h2>
              <p className="text-muted-foreground text-base mb-4 leading-relaxed font-semibold">
                Sebuah kolaborasi visual untuk merayakan kekayaan tradisi, kedalaman seni rupa, dan keindahan alam liar tanah Papua yang magis.
              </p>
              <p className="text-muted-foreground text-base leading-relaxed">
                Setiap helai kain dan goresan sablon di Aparel Khas Papua didesain dengan penuh rasa hormat terhadap warisan leluhur. Kami berkolaborasi langsung dengan seniman lokal untuk membawa keelokan burung Cenderawasih dan eksotisme pulau Raja Ampat ke dalam koleksi streetwear urban yang ikonik.
              </p>
            </motion.div>

            <div className="space-y-6">
              {[
                { icon: <Palette className="w-5 h-5" />, title: 'Seni Asli Leluhur', desc: 'Motif eksklusif yang dirancang langsung dari inspirasi seni ukir suku Asmat, Sentani, dan ragam etnik tradisional Papua.' },
                { icon: <Leaf className="w-5 h-5" />, title: 'Langkah Ramah Alam', desc: 'Kami berkomitmen melestarikan bumi Papua dengan menggunakan bahan berkualitas tinggi yang awet serta proses produksi yang bertanggung jawab.' },
                { icon: <Handshake className="w-5 h-5" />, title: 'Kesejahteraan Bersama', desc: 'Setiap transaksi berkontribusi langsung dalam mendukung ekonomi kreatif mama-mama perajin noken dan seniman lokal di Papua.' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.6, delay: idx * 0.15, ease: "easeOut" }}
                  className="flex gap-4 items-start group"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:shadow-md">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </section>


      <Footer />
    </div>
  );
}
