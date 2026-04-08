import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-8 md:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground font-playfair mb-2">
            Hubungi Kami
          </h1>
          <p className="text-muted-foreground text-lg">
            Kami siap membantu Anda dengan pertanyaan atau masukan apapun
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            {
              icon: Mail,
              title: 'Email',
              content: 'hello@nokenpapu.store',
              description: 'Balas dalam 24 jam',
            },
            {
              icon: Phone,
              title: 'Telepon',
              content: '+62 812 3456 7890',
              description: 'Senin - Jumat, 09:00 - 17:00',
            },
            {
              icon: MapPin,
              title: 'Alamat',
              content: 'Jayapura, Papua Barat',
              description: 'Indonesia',
            },
          ].map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div key={idx} className="bg-gray-50 rounded-xl p-8 text-center">
                <IconComponent className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-bold text-lg text-foreground mb-2">{item.title}</h3>
                <p className="text-foreground font-semibold mb-1">{item.content}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6 font-playfair">
              Kirim Pesan
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Nama Anda
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Masukkan nama Anda"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Email Anda
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Masukkan email Anda"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Subjek
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Masukkan subjek pesan"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Pesan
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Ketikkan pesan Anda di sini..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Kirim Pesan
              </button>
            </form>
          </div>

          {/* Social & Information */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6 font-playfair">
              Ikuti Kami
            </h2>
            <p className="text-muted-foreground mb-8">
              Dapatkan update terbaru tentang produk, promo, dan berita dari Noken Papua Store dengan mengikuti media sosial kami.
            </p>

            <div className="space-y-4 mb-12">
              {[
                { name: 'Instagram', url: '#', icon: '📸' },
                { name: 'Facebook', url: '#', icon: '👍' },
                { name: 'TikTok', url: '#', icon: '🎵' },
                { name: 'WhatsApp', url: '#', icon: '💬' },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{social.icon}</span>
                    <div>
                      <p className="font-semibold text-foreground">{social.name}</p>
                      <p className="text-sm text-muted-foreground">Follow us</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-8">
              <h3 className="font-bold text-lg text-foreground mb-3">FAQ</h3>
              <p className="text-muted-foreground mb-4">
                Pertanyaan umum dan jawaban dapat ditemukan di halaman FAQ kami.
              </p>
              <a href="#" className="text-primary font-semibold hover:underline">
                Buka Halaman FAQ →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
