import Navigation from '@/components/Navigation';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-8 md:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground font-playfair mb-2">
            Tentang Kami
          </h1>
          <p className="text-muted-foreground text-lg">
            Pelajari kisah di balik Noken Papua Store
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
                  icon: '🎨',
                  title: 'Autentisitas',
                  desc: 'Setiap desain mencerminkan kebenaran budaya Papua'
                },
                {
                  icon: '♻️',
                  title: 'Keberlanjutan',
                  desc: 'Komitmen kami terhadap planet dan komunitas lokal'
                },
                {
                  icon: '🤝',
                  title: 'Pemberdayaan',
                  desc: 'Kami memberdayakan pengrajin lokal melalui peluang ekonomi'
                },
                {
                  icon: '💎',
                  title: 'Kualitas',
                  desc: 'Standar tinggi dalam setiap aspek produk kami'
                },
              ].map((item, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-6">
                  <span className="text-4xl mb-3 block">{item.icon}</span>
                  <h3 className="font-bold text-foreground text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-8 md:p-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 font-playfair">
              Hubungi Kami
            </h2>
            <p className="text-muted-foreground mb-6">
              Pertanyaan tentang produk kami atau ingin berkolaborasi? Jangan ragu untuk menghubungi kami.
            </p>
            <a 
              href="/contact" 
              className="inline-block bg-primary text-white font-semibold px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Kirim Pesan
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
