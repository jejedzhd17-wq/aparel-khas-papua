import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { ArrowRight, Check } from 'lucide-react';
import { toast } from 'sonner';

type PaymentMethod = 'qris' | 'bank-transfer' | 'ewallet' | 'cod' | null;

interface CheckoutForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

const INDONESIA_REGIONS: Record<string, string[]> = {
  'Aceh': ['Kota Banda Aceh', 'Kota Lhokseumawe', 'Kota Langsa', 'Kabupaten Aceh Besar', 'Kabupaten Aceh Utara', 'Lainnya (Tulis Manual)'],
  'Bali': ['Kota Denpasar', 'Kabupaten Badung', 'Kabupaten Gianyar', 'Kabupaten Buleleng', 'Kabupaten Tabanan', 'Lainnya (Tulis Manual)'],
  'Banten': ['Kota Tangerang', 'Kota Tangerang Selatan', 'Kota Serang', 'Kota Cilegon', 'Kabupaten Tangerang', 'Lainnya (Tulis Manual)'],
  'Bengkulu': ['Kota Bengkulu', 'Kabupaten Rejang Lebong', 'Kabupaten Bengkulu Utara', 'Lainnya (Tulis Manual)'],
  'DI Yogyakarta': ['Kota Yogyakarta', 'Kabupaten Sleman', 'Kabupaten Bantul', 'Kabupaten Gunungkidul', 'Kabupaten Kulon Progo', 'Lainnya (Tulis Manual)'],
  'DKI Jakarta': ['Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Barat', 'Jakarta Utara', 'Jakarta Timur', 'Lainnya (Tulis Manual)'],
  'Gorontalo': ['Kota Gorontalo', 'Kabupaten Gorontalo', 'Kabupaten Bone Bolango', 'Lainnya (Tulis Manual)'],
  'Jambi': ['Kota Jambi', 'Kota Sungai Penuh', 'Kabupaten Muaro Jambi', 'Lainnya (Tulis Manual)'],
  'Jawa Barat': ['Kota Bandung', 'Kota Bekasi', 'Kota Depok', 'Kota Bogor', 'Kota Tasikmalaya', 'Kota Cimahi', 'Kota Sukabumi', 'Kota Cirebon', 'Kabupaten Garut', 'Kabupaten Karawang', 'Lainnya (Tulis Manual)'],
  'Jawa Tengah': ['Kota Semarang', 'Kota Surakarta', 'Kota Magelang', 'Kota Tegal', 'Kota Pekalongan', 'Kabupaten Banyumas', 'Lainnya (Tulis Manual)'],
  'Jawa Timur': ['Kota Surabaya', 'Kota Malang', 'Kota Kediri', 'Kota Madiun', 'Kota Pasuruan', 'Kota Probolinggo', 'Kota Blitar', 'Kota Batu', 'Kabupaten Sidoarjo', 'Kabupaten Gresik', 'Lainnya (Tulis Manual)'],
  'Kalimantan Barat': ['Kota Pontianak', 'Kota Singkawang', 'Kabupaten Kubu Raya', 'Kabupaten Ketapang', 'Lainnya (Tulis Manual)'],
  'Kalimantan Selatan': ['Kota Banjarmasin', 'Kota Banjarbaru', 'Kabupaten Banjar', 'Kabupaten Tanah Bumbu', 'Lainnya (Tulis Manual)'],
  'Kalimantan Tengah': ['Kota Palangkaraya', 'Kabupaten Kotawaringin Timur', 'Kabupaten Kotawaringin Barat', 'Lainnya (Tulis Manual)'],
  'Kalimantan Timur': ['Kota Samarinda', 'Kota Balikpapan', 'Kota Bontang', 'Kabupaten Kutai Kartanegara', 'Lainnya (Tulis Manual)'],
  'Kalimantan Utara': ['Kota Tarakan', 'Kabupaten Bulungan', 'Kabupaten Nunukan', 'Lainnya (Tulis Manual)'],
  'Kepulauan Bangka Belitung': ['Kota Pangkalpinang', 'Kabupaten Bangka', 'Kabupaten Belitung', 'Lainnya (Tulis Manual)'],
  'Kepulauan Riau': ['Kota Batam', 'Kota Tanjungpinang', 'Kabupaten Bintan', 'Kabupaten Karimun', 'Lainnya (Tulis Manual)'],
  'Lampung': ['Kota Bandar Lampung', 'Kota Metro', 'Kabupaten Lampung Selatan', 'Kabupaten Lampung Tengah', 'Lainnya (Tulis Manual)'],
  'Maluku': ['Kota Ambon', 'Kota Tual', 'Kabupaten Maluku Tengah', 'Lainnya (Tulis Manual)'],
  'Maluku Utara': ['Kota Ternate', 'Kota Tidore Kepulauan', 'Kabupaten Halmahera Utara', 'Lainnya (Tulis Manual)'],
  'Nusa Tenggara Barat': ['Kota Mataram', 'Kota Bima', 'Kabupaten Lombok Barat', 'Kabupaten Lombok Tengah', 'Kabupaten Lombok Timur', 'Lainnya (Tulis Manual)'],
  'Nusa Tenggara Timur': ['Kota Kupang', 'Kabupaten Sikka', 'Kabupaten Ende', 'Kabupaten Belu', 'Lainnya (Tulis Manual)'],
  // Papua (wilayah utara setelah pemekaran 2022)
  'Papua': ['Kota Jayapura', 'Kabupaten Jayapura', 'Kabupaten Biak Numfor', 'Kabupaten Kepulauan Yapen', 'Kabupaten Sarmi', 'Kabupaten Waropen', 'Lainnya (Tulis Manual)'],
  // Papua Barat (setelah pemekaran tidak termasuk Sorong & Raja Ampat)
  'Papua Barat': ['Kabupaten Manokwari', 'Kabupaten Fakfak', 'Kabupaten Kaimana', 'Kabupaten Manokwari Selatan', 'Kabupaten Pegunungan Arfak', 'Kabupaten Teluk Bintuni', 'Kabupaten Teluk Wondama', 'Lainnya (Tulis Manual)'],
  // Papua Barat Daya (provinsi baru 2022, ibukota Kota Sorong)
  'Papua Barat Daya': ['Kota Sorong', 'Kabupaten Sorong', 'Kabupaten Sorong Selatan', 'Kabupaten Raja Ampat', 'Kabupaten Maybrat', 'Kabupaten Tambraw', 'Lainnya (Tulis Manual)'],
  // Papua Pegunungan (provinsi baru 2022, ibukota Wamena)
  'Papua Pegunungan': ['Kabupaten Jayawijaya', 'Kabupaten Lanny Jaya', 'Kabupaten Tolikara', 'Kabupaten Puncak Jaya', 'Kabupaten Yahukimo', 'Lainnya (Tulis Manual)'],
  // Papua Selatan (provinsi baru 2022, ibukota Merauke)
  'Papua Selatan': ['Kabupaten Merauke', 'Kabupaten Mappi', 'Kabupaten Asmat', 'Kabupaten Boven Digoel', 'Lainnya (Tulis Manual)'],
  // Papua Tengah (provinsi baru 2022, ibukota Nabire)
  'Papua Tengah': ['Kabupaten Nabire', 'Kabupaten Mimika', 'Kabupaten Puncak', 'Kabupaten Intan Jaya', 'Kabupaten Dogiyai', 'Kabupaten Deiyai', 'Kabupaten Paniai', 'Lainnya (Tulis Manual)'],
  'Riau': ['Kota Pekanbaru', 'Kota Dumai', 'Kabupaten Kampar', 'Kabupaten Bengkalis', 'Lainnya (Tulis Manual)'],
  'Sulawesi Barat': ['Kabupaten Mamuju', 'Kabupaten Polewali Mandar', 'Kabupaten Majene', 'Lainnya (Tulis Manual)'],
  'Sulawesi Selatan': ['Kota Makassar', 'Kota Parepare', 'Kota Palopo', 'Kabupaten Gowa', 'Kabupaten Bone', 'Lainnya (Tulis Manual)'],
  'Sulawesi Tengah': ['Kota Palu', 'Kabupaten Donggala', 'Kabupaten Poso', 'Kabupaten Sigi', 'Lainnya (Tulis Manual)'],
  'Sulawesi Tenggara': ['Kota Kendari', 'Kota Baubau', 'Kabupaten Kolaka', 'Kabupaten Konawe', 'Lainnya (Tulis Manual)'],
  'Sulawesi Utara': ['Kota Manado', 'Kota Bitung', 'Kota Tomohon', 'Kabupaten Minahasa', 'Lainnya (Tulis Manual)'],
  'Sumatera Barat': ['Kota Padang', 'Kota Bukittinggi', 'Kota Payakumbuh', 'Kota Solok', 'Lainnya (Tulis Manual)'],
  'Sumatera Selatan': ['Kota Palembang', 'Kota Lubuklinggau', 'Kota Prabumulih', 'Lainnya (Tulis Manual)'],
  'Sumatera Utara': ['Kota Medan', 'Kota Binjai', 'Kota Pematangsiantar', 'Kabupaten Deli Serdang', 'Kabupaten Langkat', 'Lainnya (Tulis Manual)']
};

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [selectedBank, setSelectedBank] = useState('bca');
  const [selectedEWallet, setSelectedEWallet] = useState('ovo');
  const [customCity, setCustomCity] = useState('');
  const [form, setForm] = useState<CheckoutForm>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
  });

  // ─── Load form dari localStorage saat mount ──────────────────────────────
  useEffect(() => {
    // 1. Coba restore dari form yang sudah disimpan sebelumnya
    const savedForm = localStorage.getItem('noken-checkout-form');
    const savedPayment = localStorage.getItem('noken-checkout-payment');
    const savedBank = localStorage.getItem('noken-checkout-bank');
    const savedEwallet = localStorage.getItem('noken-checkout-ewallet');

    const savedUser = localStorage.getItem('noken-user');
    let currentUser: any = null;
    if (savedUser) {
      try {
        currentUser = JSON.parse(savedUser);
      } catch {}
    }

    if (savedForm) {
      try {
        const parsedForm = JSON.parse(savedForm);
        // Jika user login ada, dan email di form berbeda dengan email user login, jangan gunakan savedForm
        if (currentUser && parsedForm.email && parsedForm.email.toLowerCase() !== currentUser.email.toLowerCase()) {
          setForm(prev => ({
            ...prev,
            fullName: currentUser.name || currentUser.nama || '',
            email: currentUser.email || '',
            phone: currentUser.phone || currentUser.no_hp || '',
            address: currentUser.address || currentUser.alamat || '',
            city: '',
            province: '',
            postalCode: '',
          }));
          localStorage.removeItem('noken-checkout-form');
          localStorage.removeItem('noken-checkout-customcity');
        } else {
          setForm(parsedForm);
          // Pulihkan customCity jika sebelumnya memilih 'Lainnya (Tulis Manual)'
          const savedCustomCity = localStorage.getItem('noken-checkout-customcity');
          if (parsedForm.city === 'Lainnya (Tulis Manual)' && savedCustomCity) {
            setCustomCity(savedCustomCity);
          }
        }
      } catch {}
    } else if (currentUser) {
      // Fallback: isi dari data user jika belum ada form tersimpan
      setForm(prev => ({
        ...prev,
        fullName: currentUser.name || currentUser.nama || '',
        email: currentUser.email || '',
        phone: currentUser.phone || currentUser.no_hp || '',
        address: currentUser.address || currentUser.alamat || '',
      }));
    }

    if (savedPayment) setPaymentMethod(savedPayment as PaymentMethod);
    if (savedBank) setSelectedBank(savedBank);
    if (savedEwallet) setSelectedEWallet(savedEwallet);
  }, []);

  // ─── Simpan form ke localStorage setiap kali berubah ─────────────────────
  useEffect(() => {
    localStorage.setItem('noken-checkout-form', JSON.stringify(form));
  }, [form]);

  // ─── Simpan customCity ke localStorage setiap kali berubah ───────────────
  useEffect(() => {
    if (customCity) {
      localStorage.setItem('noken-checkout-customcity', customCity);
    }
  }, [customCity]);

  useEffect(() => {
    if (paymentMethod) localStorage.setItem('noken-checkout-payment', paymentMethod);
  }, [paymentMethod]);

  useEffect(() => {
    localStorage.setItem('noken-checkout-bank', selectedBank);
  }, [selectedBank]);

  useEffect(() => {
    localStorage.setItem('noken-checkout-ewallet', selectedEWallet);
  }, [selectedEWallet]);

  // ─── Jika cart kosong, cek ada pending order (user balik dari payment) ─────
  if (items.length === 0) {
    const pendingOrderId = localStorage.getItem('noken-pending-order');
    if (pendingOrderId) {
      // Tampilkan form checkout pre-filled agar user bisa ubah metode pembayaran
      const handleChangeMethod = () => {
        if (!paymentMethod) {
          toast.warning('Pilih metode pembayaran terlebih dahulu');
          return;
        }
        // Update localStorage order dengan metode baru
        const savedOrder = localStorage.getItem(`order-${pendingOrderId}`);
        if (savedOrder) {
          const parsedOrder = JSON.parse(savedOrder);
          parsedOrder.paymentMethod = paymentMethod;
          parsedOrder.bankName = selectedBank;
          parsedOrder.eWalletName = selectedEWallet;
          localStorage.setItem(`order-${pendingOrderId}`, JSON.stringify(parsedOrder));
        }
        navigate(`/payment/${pendingOrderId}`);
      };

      return (
        <div className="min-h-screen bg-white">
          <Navigation />

          <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-8 md:py-12 px-4">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground font-playfair mb-2">
                Ubah Metode Pembayaran
              </h1>
              <p className="text-muted-foreground text-lg">
                Pesanan #{pendingOrderId} — pilih metode pembayaran baru
              </p>
            </div>
          </section>

          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Panel Ubah Metode */}
              <div className="lg:col-span-2 space-y-8">

                {/* Info Data Pengiriman (read-only) */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-foreground mb-4 font-playfair">Data Pengiriman</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {[
                      { label: 'Nama', value: form.fullName },
                      { label: 'Email', value: form.email },
                      { label: 'No. Telepon', value: form.phone },
                      { label: 'Alamat', value: form.address },
                      { label: 'Kota', value: form.city },
                      { label: 'Provinsi', value: form.province },
                    ].map(row => row.value ? (
                      <div key={row.label} className="flex flex-col gap-0.5">
                        <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{row.label}</span>
                        <span className="font-semibold text-gray-800">{row.value}</span>
                      </div>
                    ) : null)}
                  </div>
                </div>

                {/* Pilih Metode Pembayaran */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-foreground mb-6 font-playfair">
                    Pilih Metode Pembayaran
                  </h2>
                  <div className="space-y-4">
                    {/* QRIS */}
                    <label className="block p-4 border border-gray-300 rounded-lg hover:border-primary cursor-pointer">
                      <input type="radio" name="payment" value="qris" checked={paymentMethod === 'qris'} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className="mr-3" />
                      <span className="font-semibold text-foreground">QRIS (Otomatis)</span>
                      <p className="text-sm text-muted-foreground mt-1">Bayar instan menggunakan GoPay, OVO, Dana, LinkAja, atau Mobile Banking</p>
                    </label>

                    {/* Bank Transfer */}
                    <label className="block">
                      <input type="radio" name="payment" value="bank-transfer" checked={paymentMethod === 'bank-transfer'} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className="mr-3" />
                      <span className="font-semibold text-foreground">Transfer Bank</span>
                    </label>
                    {paymentMethod === 'bank-transfer' && (
                      <div className="ml-6 space-y-2 mb-6">
                        {[{ id: 'bca', name: 'BCA' }, { id: 'bri', name: 'BRI' }, { id: 'mandiri', name: 'Mandiri' }].map(bank => (
                          <label key={bank.id} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-primary">
                            <input type="radio" name="bank" value={bank.id} checked={selectedBank === bank.id} onChange={(e) => setSelectedBank(e.target.value)} className="mr-3" />
                            <span className="font-semibold text-foreground">{bank.name}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* E-Wallet */}
                    <label className="block">
                      <input type="radio" name="payment" value="ewallet" checked={paymentMethod === 'ewallet'} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className="mr-3" />
                      <span className="font-semibold text-foreground">E-Wallet</span>
                    </label>
                    {paymentMethod === 'ewallet' && (
                      <div className="ml-6 space-y-2 mb-6">
                        {[{ id: 'ovo', name: 'OVO' }, { id: 'dana', name: 'Dana' }, { id: 'gopay', name: 'GoPay' }].map(wallet => (
                          <label key={wallet.id} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-primary">
                            <input type="radio" name="ewallet" value={wallet.id} checked={selectedEWallet === wallet.id} onChange={(e) => setSelectedEWallet(e.target.value)} className="mr-3" />
                            <span className="font-semibold text-foreground">{wallet.name}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* COD */}
                    <label className="block p-4 border border-gray-300 rounded-lg hover:border-primary cursor-pointer">
                      <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className="mr-3" />
                      <span className="font-semibold text-foreground">Bayar di Tempat (COD)</span>
                      <p className="text-sm text-muted-foreground mt-1">Pembayaran saat paket tiba di tangan Anda</p>
                    </label>
                  </div>
                </div>
              </div>

              {/* Ringkasan + Aksi */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-6 sticky top-20">
                  <h2 className="text-xl font-bold text-foreground mb-4">Ringkasan</h2>
                  <div className="mb-4 text-sm text-gray-500 space-y-1">
                    <p>Pesanan <span className="font-bold text-gray-800">#{pendingOrderId}</span></p>
                    <p className="text-xs text-gray-400">Data pesanan sudah tersimpan</p>
                  </div>
                  <button
                    onClick={handleChangeMethod}
                    disabled={!paymentMethod}
                    className={`w-full font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors mb-3 ${
                      paymentMethod ? 'bg-primary text-white hover:bg-primary/90' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <ArrowRight className="w-5 h-5" />
                    Lanjutkan ke Pembayaran
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem('noken-pending-order');
                      navigate('/shop');
                    }}
                    className="block w-full text-center border-2 border-gray-300 text-foreground font-semibold py-2 rounded-lg hover:border-red-400 hover:text-red-500 transition-colors"
                  >
                    Batalkan Pesanan
                  </button>
                </div>
              </div>

            </div>
          </div>
          <Footer />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4 font-playfair">
            Keranjang Kosong
          </h1>
          <p className="text-muted-foreground mb-8">
            Silakan tambahkan produk sebelum melakukan checkout
          </p>
          <Link to="/shop" className="inline-block bg-primary text-white font-semibold px-8 py-3 rounded-lg hover:bg-primary/90">
            Kembali ke Shop
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const cleaned = value.replace(/[^0-9+]/g, '');
      setForm(prev => ({ ...prev, [name]: cleaned }));
      return;
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentMethod) {
      toast.warning('Silakan pilih metode pembayaran terlebih dahulu');
      return;
    }

    if (!form.fullName || !form.email || !form.phone || !form.address) {
      toast.warning('Silakan lengkapi data pengiriman Anda');
      return;
    }

    const phoneRegex = /^(?:\+62|62|0)8[1-9][0-9]{7,11}$/;
    if (!phoneRegex.test(form.phone)) {
      toast.error('Nomor telepon tidak valid. Masukkan nomor telepon Indonesia yang benar.');
      return;
    }

    if (!form.province || !form.city) {
      toast.warning('Silakan pilih Provinsi dan Kota/Kabupaten Anda.');
      return;
    }

    let finalCity = form.city;
    if (form.city === 'Lainnya (Tulis Manual)') {
      if (!customCity.trim()) {
        toast.warning('Silakan masukkan nama Kota/Kabupaten Anda.');
        return;
      }
      finalCity = customCity.trim();
    }

    // Menyiapkan body request sesuai dengan format Controller backend
    const orderData = {
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      address: form.address,
      city: finalCity,
      province: form.province,
      postalCode: form.postalCode,
      paymentMethod: paymentMethod,
      bankName: selectedBank,
      eWalletName: selectedEWallet,
      items: items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        size: item.size || 'M', // default size
        price: item.price
      })),
      total: total
    };

    // Mengambil token autentikasi user
    const token = localStorage.getItem('noken-token');
    
    // Kirim data ke API backend
    fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        const orderId = data.data.orderId;
        
        // Simpan order di localStorage untuk cadangan visual/state jika diperlukan halaman berikutnya
        const order = {
          id: orderId,
          customer: { ...form, city: finalCity },
          items: items,
          total: total,
          paymentMethod: paymentMethod,
          bankName: selectedBank,
          eWalletName: selectedEWallet,
          status: 'pending',
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(`order-${orderId}`, JSON.stringify(order));
        
        if (paymentMethod === 'cod') {
          clearCart();
          localStorage.removeItem('noken-pending-order');
          navigate(`/order-confirmation/${orderId}`);
        } else {
          // Simpan pending order ID agar bisa redirect kembali jika user kembali ke checkout
          localStorage.setItem('noken-pending-order', String(orderId));
          navigate(`/payment/${orderId}`);
        }
      } else {
        toast.error('Gagal membuat pesanan: ' + data.message);
      }
    })
    .catch(err => {
      console.error('Error checkout:', err);
      toast.error('Terjadi kesalahan koneksi server saat checkout.');
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-8 md:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground font-playfair mb-2">
            Checkout
          </h1>
          <p className="text-muted-foreground text-lg">
            Selesaikan pesanan Anda
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <form id="checkout-form" onSubmit={handleSubmitOrder} className="lg:col-span-2 space-y-8">
            {/* Customer Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6 font-playfair">
                Data Pembeli
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleInputChange}
                    placeholder="Nama Anda"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      placeholder="email@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      No. Telepon
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleInputChange}
                      placeholder="+62..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Alamat Lengkap
                  </label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleInputChange}
                    placeholder="Jalan, no rumah, RT/RW"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Provinsi
                    </label>
                    <select
                      name="province"
                      value={form.province}
                      onChange={(e) => {
                        const selectedProv = e.target.value;
                        setForm(prev => ({
                          ...prev,
                          province: selectedProv,
                          city: INDONESIA_REGIONS[selectedProv]?.[0] || ''
                        }));
                        setCustomCity(''); // Reset custom city saat provinsi berubah
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white"
                      required
                    >
                      <option value="">Pilih Provinsi</option>
                      {Object.keys(INDONESIA_REGIONS).map(prov => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Kota/Kabupaten
                    </label>
                    <select
                      name="city"
                      value={form.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white"
                      required
                      disabled={!form.province}
                    >
                      <option value="">Pilih Kota/Kabupaten</option>
                      {form.province && INDONESIA_REGIONS[form.province]?.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>

                    {form.city === 'Lainnya (Tulis Manual)' && (
                      <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                        <input
                          type="text"
                          placeholder="Tulis nama Kota/Kabupaten..."
                          value={customCity}
                          onChange={(e) => setCustomCity(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                          required
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Kode Pos
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={form.postalCode}
                      onChange={handleInputChange}
                      placeholder="12345"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6 font-playfair">
                Pilih Metode Pembayaran
              </h2>

              <div className="space-y-4">
                {/* QRIS */}
                <label className="block p-4 border border-gray-300 rounded-lg hover:border-primary cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="qris"
                    checked={paymentMethod === 'qris'}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="mr-3"
                  />
                  <span className="font-semibold text-foreground">QRIS (Otomatis)</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Bayar instan menggunakan GoPay, OVO, Dana, LinkAja, atau Mobile Banking
                  </p>
                </label>

                {/* Bank Transfer */}
                <label className="block">
                  <input
                    type="radio"
                    name="payment"
                    value="bank-transfer"
                    checked={paymentMethod === 'bank-transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="mr-3"
                  />
                  <span className="font-semibold text-foreground">Transfer Bank</span>
                </label>
                {paymentMethod === 'bank-transfer' && (
                  <div className="ml-6 space-y-2 mb-6">
                    {[
                      { id: 'bca', name: 'BCA', account: '1234567890' },
                      { id: 'bri', name: 'BRI', account: '0987654321' },
                      { id: 'mandiri', name: 'Mandiri', account: '1122334455' },
                    ].map((bank) => (
                      <label key={bank.id} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-primary">
                        <input
                          type="radio"
                          name="bank"
                          value={bank.id}
                          checked={selectedBank === bank.id}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="mr-3"
                        />
                        <div>
                          <span className="font-semibold text-foreground">{bank.name}</span>
                          <p className="text-sm text-muted-foreground">{bank.account}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {/* E-Wallet */}
                <label className="block">
                  <input
                    type="radio"
                    name="payment"
                    value="ewallet"
                    checked={paymentMethod === 'ewallet'}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="mr-3"
                  />
                  <span className="font-semibold text-foreground">E-Wallet</span>
                </label>
                {paymentMethod === 'ewallet' && (
                  <div className="ml-6 space-y-2 mb-6">
                    {[
                      { id: 'ovo', name: 'OVO' },
                      { id: 'dana', name: 'Dana' },
                      { id: 'gopay', name: 'GoPay' },
                    ].map((wallet) => (
                      <label key={wallet.id} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-primary">
                        <input
                          type="radio"
                          name="ewallet"
                          value={wallet.id}
                          checked={selectedEWallet === wallet.id}
                          onChange={(e) => setSelectedEWallet(e.target.value)}
                          className="mr-3"
                        />
                        <span className="font-semibold text-foreground">{wallet.name}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* COD */}
                <label className="block p-4 border border-gray-300 rounded-lg hover:border-primary cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="mr-3"
                  />
                  <span className="font-semibold text-foreground">Bayar di Tempat (COD)</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pembayaran saat paket tiba di tangan Anda
                  </p>
                </label>
              </div>
            </div>
          </form>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-6 sticky top-20">
              <h2 className="text-xl font-bold text-foreground mb-6">
                Ringkasan Pesanan
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-300 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.name} x {item.quantity}
                    </span>
                    <span className="font-semibold">
                      Rp {(Number(item.price) * item.quantity).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-300">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">Rp {Number(total).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ongkir</span>
                  <span className="font-semibold text-green-600">Gratis</span>
                </div>
              </div>

              <div className="flex justify-between mb-6 text-lg">
                <span className="font-bold text-foreground">Total Pembayaran</span>
                <span className="font-bold text-primary text-2xl">
                  Rp {Number(total).toLocaleString('id-ID')}
                </span>
              </div>

              <button
                type="submit"
                form="checkout-form"
                onClick={handleSubmitOrder}
                disabled={!paymentMethod}
                className={`w-full font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  paymentMethod
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {paymentMethod ? (
                  <>
                    <Check className="w-5 h-5" />
                    Lanjut ke Pembayaran
                  </>
                ) : (
                  'Pilih Metode Pembayaran'
                )}
              </button>

              <Link
                to="/cart"
                className="block w-full text-center mt-3 border-2 border-gray-300 text-foreground font-semibold py-2 rounded-lg hover:border-gray-400 transition-colors"
              >
                Kembali ke Keranjang
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
