import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Page Header dengan Background Anak Adat Papua */}
      <section 
        className="relative py-24 md:py-36 px-4 bg-cover bg-[center_35%] text-white overflow-hidden"
        style={{ backgroundImage: "url('/papua-contact.jpg')" }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/45" />
        
        <div className="relative max-w-7xl mx-auto z-10">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
            Hubungi Kami
          </h1>
          <p className="text-white/90 text-lg md:text-xl max-w-2xl">
            Kami siap membantu Anda dengan pertanyaan atau masukan apapun
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16">
          {[
            {
              icon: Mail,
              title: 'Email',
              content: 'aparelkhas.papua@gmail.com',
              description: 'Balas dalam 24 jam',
              href: 'mailto:aparelkhas.papua@gmail.com'
            },
            {
              icon: Phone,
              title: 'Telepon',
              content: '081247386685',
              description: 'Senin - Jumat, 09:00 - 17:00',
              href: 'tel:081247386685'
            },
            {
              icon: MapPin,
              title: 'Alamat',
              content: 'Sorong, Papua Barat Daya',
              description: 'Indonesia',
              href: null
            },
          ].map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div key={idx} className="bg-gray-50 rounded-xl p-6 md:p-8 text-center border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center justify-between min-h-[200px]">
                <div>
                  <IconComponent className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="font-bold text-base md:text-lg text-foreground mb-2">{item.title}</h3>
                  {item.href ? (
                    <a 
                      href={item.href} 
                      className="block text-primary font-semibold mb-1 text-[11px] sm:text-sm lg:text-base hover:underline break-words px-1"
                    >
                      {item.content}
                    </a>
                  ) : (
                    <p className="text-primary font-semibold mb-1 text-xs sm:text-sm lg:text-base break-words px-1">
                      {item.content}
                    </p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">{item.description}</p>
              </div>
            );
          })}
        </div>

        {/* Center-aligned Social Media Section */}
        <div className="max-w-2xl mx-auto border-t border-gray-100 pt-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 font-playfair">
              Ikuti Kami
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">
              Dapatkan update terbaru tentang produk, promo, dan berita dari Aparel Khas Papua Store dengan mengikuti media sosial kami.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { 
                name: 'Instagram', 
                url: '#', 
                icon: (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="insta-gradient-real" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#fdf497" />
                        <stop offset="5%" stopColor="#fdf497" />
                        <stop offset="45%" stopColor="#fd5949" />
                        <stop offset="60%" stopColor="#d6249f" />
                        <stop offset="90%" stopColor="#285AEB" />
                      </linearGradient>
                    </defs>
                    <path fill="url(#insta-gradient-real)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                ),
                desc: '@aparel.khaspapua'
              },
              { 
                name: 'Facebook', 
                url: '#', 
                icon: (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                ),
                desc: 'Aparel Khas Papua'
              },
              { 
                name: 'TikTok', 
                url: '#', 
                icon: (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#000000" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.95-1.72-.1.08-.21.17-.31.25v6.52c-.08 2.45-1.12 4.88-3.08 6.33-2.02 1.52-4.8 1.95-7.14 1.14-2.34-.81-4.22-2.73-4.9-5.1-.81-2.8-.2-6.02 1.63-8.26C6.54 7.22 9.07 6 11.75 6.01c.26 0 .52.02.78.05V10.2c-.89-.26-1.89-.17-2.69.32-1.03.62-1.63 1.83-1.61 3.02.01 1.37.83 2.68 2.1 3.19 1.17.47 2.56.2 3.46-.66.69-.66 1.05-1.63 1.02-2.58V.02z" />
                  </svg>
                ),
                desc: '@khaspapua.store'
              },
              { 
                name: 'WhatsApp', 
                url: 'https://wa.me/6281247386685', 
                icon: (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#25D366" xmlns="http://www.w3.org/2000/svg">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.29 1.97 13.824.947 12.01.947c-5.438 0-9.864 4.37-9.868 9.8-.001 1.77.472 3.498 1.372 5.061L2.527 22l6.12-1.592c1.6.012 0 0 0 0zM17.52 14.34c-.3-.15-1.77-.874-2.045-.974-.274-.1-.474-.15-.674.15-.2.3-.77.974-.945 1.174-.175.2-.35.225-.65.075-.3-.15-1.265-.467-2.41-1.485-.89-.79-1.49-1.77-1.665-2.07-.175-.3-.02-.46.13-.61.135-.133.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.674-1.624-.925-2.225-.244-.589-.496-.51-.674-.519-.175-.009-.375-.01-.575-.01-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5 0 1.475 1.075 2.9 1.225 3.1.15.2 2.11 3.22 5.115 4.52.715.31 1.273.496 1.71.635.717.227 1.37.195 1.885.118.574-.086 1.77-.724 2.02-1.385.25-.66.25-1.225.175-1.385-.075-.16-.275-.26-.575-.41z" />
                  </svg>
                ),
                desc: '0812-4738-6685'
              },
            ].map((social, idx) => (
              <div
                key={idx}
                className="block p-4 border border-primary/30 rounded-xl bg-white shadow-sm select-none"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-[#e8d5c4]/60 shadow-sm">
                    {social.icon}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm sm:text-base leading-tight">{social.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{social.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
