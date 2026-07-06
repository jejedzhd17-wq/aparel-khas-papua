import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Shield, CreditCard, Wallet, Clock, Copy, CheckCircle2, ArrowLeft, QrCode, Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  size: string;
}

interface Order {
  id: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
  };
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  status: 'pending' | 'paid' | 'shipped' | 'completed';
  timestamp: string;
}

// ─── QRIS Generator (EMVCo standard) ───────────────────────────────────────
function makeCRC16(str: string): string {
  let crc = 0xFFFF;
  for (let c = 0; c < str.length; c++) {
    let code = str.charCodeAt(c);
    crc ^= (code << 8);
    for (let i = 0; i < 8; i++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function getDynamicQRIS(amount: number, orderId: string | number): string {
  const orderIdStr = String(orderId);
  const tag00 = "000201";
  const tag01 = "010212";
  const tag26 = "26570011ID.DANA.WWW011893600915303274938302090327493830303UMI";
  const tag51 = "51440014ID.CO.QRIS.WWW0215ID10265359253780303UMI";
  const tag52 = "52045611";
  const tag53 = "5303360";
  const amountStr = amount.toString();
  const tag54 = "54" + amountStr.length.toString().padStart(2, '0') + amountStr;
  const tag58 = "5802ID";
  const tag59 = "5912Aparel Papua";
  const tag60 = "6011Kota Sorong";
  const tag61 = "610598418";
  const billNumberSubtag = "07" + orderIdStr.length.toString().padStart(2, '0') + orderIdStr;
  const tag62 = "62" + billNumberSubtag.length.toString().padStart(2, '0') + billNumberSubtag;
  const payload = tag00 + tag01 + tag26 + tag51 + tag52 + tag53 + tag54 + tag58 + tag59 + tag60 + tag61 + tag62 + "6304";
  return payload + makeCRC16(payload);
}

// ─── Color constants ────────────────────────────────────────────────────────
const PRIMARY = '#b8622a';
const PRIMARY_DARK = '#8f4a1e';
const PRIMARY_LIGHT = '#e08644';
const GRADIENT = `linear-gradient(135deg, ${PRIMARY_LIGHT} 0%, ${PRIMARY} 50%, ${PRIMARY_DARK} 100%)`;

// Default fallback (jika API belum dimuat)
const DEFAULT_BANKS = [
  { name: 'BCA', account_number: '8077708571234567', color: '#005CA5' },
  { name: 'Mandiri', account_number: '8877608571234567', color: '#003D7C' },
  { name: 'BRI', account_number: '9922108571234567', color: '#005B9A' },
  { name: 'BNI', account_number: '8800108571234567', color: '#FF6600' },
];

const DEFAULT_EWALLETS = [
  { name: 'GoPay', account_number: '081234567890', color: '#00AED6' },
  { name: 'OVO', account_number: '081234567890', color: '#4C3494' },
  { name: 'DANA', account_number: '081234567890', color: '#108EE9' },
  { name: 'ShopeePay', account_number: '081234567890', color: '#EE4D2D' },
];

interface BankAccount {
  id: number;
  type: 'bank' | 'ewallet';
  name: string;
  account_number: string;
  account_holder: string;
  color: string;
}

export default function PaymentGateway() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [timeLeft, setTimeLeft] = useState(900);
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedEwallet, setSelectedEwallet] = useState('GoPay');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [ewallets, setEwallets] = useState<BankAccount[]>([]);
  // Metode aktif — bisa diubah user di halaman ini
  const [activeMethod, setActiveMethod] = useState<'bank-transfer' | 'ewallet' | 'qris'>('bank-transfer');

  // ─── Fetch rekening bank dari database ────────────────────────────────────
  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        const res = await fetch('/api/bank-accounts');
        const data = await res.json();
        if (data.success && data.data) {
          setBanks(data.data.filter((a: BankAccount) => a.type === 'bank'));
          setEwallets(data.data.filter((a: BankAccount) => a.type === 'ewallet'));
        } else {
          setBanks(DEFAULT_BANKS as any);
          setEwallets(DEFAULT_EWALLETS as any);
        }
      } catch {
        setBanks(DEFAULT_BANKS as any);
        setEwallets(DEFAULT_EWALLETS as any);
      }
    };
    fetchBankAccounts();
  }, []);

  // ─── Set default ewallet selection ketika ewallets loaded ─────────────────
  useEffect(() => {
    if (ewallets.length > 0) setSelectedEwallet(ewallets[0].name);
  }, [ewallets]);

  // ─── Fetch order ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      const savedOrder = localStorage.getItem(`order-${orderId}`);
      if (savedOrder) {
        const parsed = JSON.parse(savedOrder);
        setOrder(parsed);
        // Set activeMethod dari order yang sudah disimpan
        const m = parsed.paymentMethod;
        if (m === 'qris' || m === 'ewallet' || m === 'bank-transfer') {
          setActiveMethod(m);
        }
      }

      const token = localStorage.getItem('noken-token');
      if (token) {
        try {
          const res = await fetch(`/api/orders/${orderId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success && data.data) {
            const o = data.data;
            const lines = (o.customer?.address || '').split('\n');
            const localOrder = localStorage.getItem(`order-${orderId}`);
            const localPaymentMethod = localOrder ? JSON.parse(localOrder).paymentMethod : null;
            const mapped = {
              id: String(o.id),
              customer: {
                fullName: lines[0] || o.customer?.fullName || '',
                email: lines[1] || o.customer?.email || '',
                phone: lines[2] || o.customer?.phone || '',
                address: lines.slice(3).join(', ') || o.customer?.address || '',
              },
              items: (o.items || []).map((item: any) => ({
                id: item.id,
                name: item.name || item.nama_produk,
                price: item.price || item.harga || 0,
                quantity: item.quantity || item.jumlah || 1,
                size: item.size || 'M',
              })),
              total: o.total,
              paymentMethod: localPaymentMethod || o.paymentMethod || 'bank-transfer',
              status: o.status,
              timestamp: o.timestamp,
            };
            setOrder(mapped);
            localStorage.setItem(`order-${orderId}`, JSON.stringify(mapped));
          }
        } catch (err) {
          console.error('Error fetching order:', err);
        }
      }
    };
    fetchOrder();
  }, [orderId]);

  // ─── Redirect COD ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (order && order.paymentMethod === 'cod') {
      navigate(`/order-confirmation/${order.id}`);
    }
  }, [order, navigate]);

  // ─── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  // ─── Copy VA ──────────────────────────────────────────────────────────────
  const handleCopy = (text: string, bankName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(bankName);
    setTimeout(() => setCopiedBank(null), 2500);
    toast.success(`Nomor VA ${bankName} disalin!`);
  };

  // ─── Upload Bukti ─────────────────────────────────────────────────────────
  const handleUploadProof = async () => {
    if (!file || !order) return;
    setIsUploading(true);
    try {
      const token = localStorage.getItem('noken-token');
      const resPay = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ orderId: order.id, paymentMethod: order.paymentMethod })
      });
      const payData = await resPay.json();
      if (!payData.success) throw new Error(payData.message || 'Gagal inisialisasi pembayaran');

      const formData = new FormData();
      formData.append('orderId', order.id);
      formData.append('proof', file);
      const resUpload = await fetch('/api/payments/upload-proof', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const uploadData = await resUpload.json();
      if (!uploadData.success) throw new Error(uploadData.message || 'Gagal mengunggah bukti');

      clearCart();
      localStorage.removeItem('noken-pending-order');
      setUploadSuccess(true);
      toast.success('Bukti pembayaran berhasil dikirim! Menunggu konfirmasi admin.');
      const updated = { ...order, status: 'pending' as const };
      localStorage.setItem(`order-${order.id}`, JSON.stringify(updated));
      setOrder(updated);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Gagal mengirim bukti pembayaran.');
    } finally {
      setIsUploading(false);
    }
  };

  // ─── Simulate Payment ─────────────────────────────────────────────────────
  const handleSimulatePayment = () => {
    if (!order) return;
    setIsProcessing(true);
    setProcessingStep('Menghubungkan ke gateway pembayaran...');
    setTimeout(() => {
      setProcessingStep('Mengirim permintaan transaksi ke server bank...');
      setTimeout(() => {
        setProcessingStep('Memverifikasi tanda tangan digital & dana...');
        setTimeout(() => {
          clearCart();
          localStorage.removeItem('noken-pending-order');
          const updated = { ...order, status: 'paid' as const };
          localStorage.setItem(`order-${order.id}`, JSON.stringify(updated));
          setOrder(updated);
          setProcessingStep('Pembayaran sukses terverifikasi!');
          setIsProcessing(false);
          setPaymentSuccess(true);
          setTimeout(() => navigate(`/order-confirmation/${order.id}`), 2000);
        }, 1500);
      }, 1500);
    }, 1500);
  };

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#faf8f5' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: PRIMARY, borderTopColor: 'transparent' }} />
          <p className="font-medium text-gray-500">Memuat detail pesanan...</p>
        </div>
      </div>
    );
  }

  // ─── Upload success ────────────────────────────────────────────────────────
  if (uploadSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#faf8f5' }}>
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center border" style={{ borderColor: '#e8d5c4' }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'linear-gradient(135deg, #e08644, #b8622a)' }}>
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 font-playfair">Bukti Berhasil Dikirim!</h2>
          <p className="text-gray-500 mb-6 text-sm leading-relaxed">
            Bukti pembayaran Anda telah diunggah dan sedang dalam proses verifikasi oleh Admin. Kami akan segera mengkonfirmasi.
          </p>
          <button
            onClick={() => navigate('/order-history')}
            className="w-full text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
            style={{ background: GRADIENT }}
          >
            Lihat Riwayat Pesanan
          </button>
        </div>
      </div>
    );
  }

  // ─── Already paid ──────────────────────────────────────────────────────────
  if (order.status !== 'pending' && !paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#faf8f5' }}>
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center border" style={{ borderColor: '#e8d5c4' }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'linear-gradient(135deg, #e08644, #b8622a)' }}>
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 font-playfair">Pesanan Sudah Dibayar</h2>
          <p className="text-gray-500 mb-6">Pesanan #{order.id} telah lunas dan sedang diproses.</p>
          <button
            onClick={() => navigate(`/order-confirmation/${order.id}`)}
            className="w-full text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
            style={{ background: GRADIENT }}
          >
            Lihat Detail Pesanan
          </button>
        </div>
      </div>
    );
  }

  const isQRIS = activeMethod === 'qris';
  const isBank = activeMethod === 'bank-transfer';
  const isEwallet = activeMethod === 'ewallet';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#faf8f5' }}>

      {/* ── Header ── */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm" style={{ borderColor: '#e8d5c4' }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/checkout')}
              className="p-2 rounded-xl hover:bg-orange-50 text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: GRADIENT }}>
                <Lock className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-extrabold text-lg font-outfit" style={{ color: PRIMARY }}>NokenPay</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border" style={{ color: PRIMARY, borderColor: '#e8d5c4', background: '#fff7f0' }}>
                SECURE
              </span>
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold text-sm" style={{ color: timeLeft < 120 ? '#dc2626' : PRIMARY, borderColor: timeLeft < 120 ? '#fecaca' : '#e8d5c4', background: timeLeft < 120 ? '#fef2f2' : '#fff7f0' }}>
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:py-8 grid md:grid-cols-[1fr_1.4fr] gap-6 items-start">

        {/* ── Left: Order Summary ── */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#e8d5c4' }}>
          {/* Header gradient strip */}
          <div className="px-6 py-4 text-white" style={{ background: GRADIENT }}>
            <p className="text-xs font-semibold opacity-80 uppercase tracking-wider mb-0.5">Ringkasan Pesanan</p>
            <h2 className="text-lg font-bold font-playfair">Aparel Khas Papua</h2>
          </div>

          <div className="p-5 space-y-4">
            {/* Order info */}
            <div className="space-y-2">
              {[
                { label: 'ID Pesanan', value: `#${order.id}` },
                { label: 'Nama Pembeli', value: order.customer.fullName },
                { label: 'Metode', value: isQRIS ? 'QRIS' : isBank ? 'Transfer Bank' : isEwallet ? 'E-Wallet' : 'COD' },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center text-sm py-1.5 border-b" style={{ borderColor: '#f5ede6' }}>
                  <span className="text-gray-500">{row.label}</span>
                  <span className="font-semibold text-gray-800">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Items */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: PRIMARY }}>Detail Barang</p>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {order.items.map(item => (
                  <div key={`${item.id}-${item.size}`} className="flex justify-between items-start text-xs text-gray-600 py-1">
                    <span className="pr-2 leading-relaxed">{item.name} (Ukuran: {item.size}) × {item.quantity}</span>
                    <span className="font-semibold text-gray-800 whitespace-nowrap">Rp {(Number(item.price) * item.quantity).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="rounded-xl p-4 text-white" style={{ background: GRADIENT }}>
              <p className="text-xs font-semibold opacity-80 mb-0.5">Total Tagihan</p>
              <p className="text-2xl font-extrabold font-outfit">Rp {Number(order.total).toLocaleString('id-ID')}</p>
            </div>

            {/* Security note */}
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Lock className="w-3 h-3 flex-shrink-0" />
              <span>Transaksi dienkripsi aman oleh NokenPay Secure Node</span>
            </div>
          </div>
        </div>

        {/* ── Right: Payment Method ── */}
        <div className="relative bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#e8d5c4' }}>

          {/* Header Metode Pembayaran Aktif */}
          <div className="border-b px-6 py-4 bg-[#fff7f0]" style={{ borderColor: '#e8d5c4' }}>
            <div className="flex items-center gap-2.5">
              {activeMethod === 'bank-transfer' && (
                <>
                  <CreditCard className="w-5 h-5" style={{ color: PRIMARY }} />
                  <span className="font-bold text-gray-800">Metode Pembayaran: Transfer Bank</span>
                </>
              )}
              {activeMethod === 'ewallet' && (
                <>
                  <Wallet className="w-5 h-5" style={{ color: PRIMARY }} />
                  <span className="font-bold text-gray-800">Metode Pembayaran: E-Wallet</span>
                </>
              )}
              {activeMethod === 'qris' && (
                <>
                  <QrCode className="w-5 h-5" style={{ color: PRIMARY }} />
                  <span className="font-bold text-gray-800">Metode Pembayaran: QRIS</span>
                </>
              )}
            </div>
          </div>

          {/* Processing overlay */}
          {isProcessing && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center bg-white/95">
              <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mb-6" style={{ borderColor: PRIMARY, borderTopColor: 'transparent' }} />
              <h3 className="text-xl font-bold text-gray-900 mb-2 font-playfair">Memproses Pembayaran</h3>
              <p className="text-sm font-semibold" style={{ color: PRIMARY }}>{processingStep}</p>
            </div>
          )}

          {/* Success overlay */}
          {paymentSuccess && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center bg-white">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: GRADIENT }}>
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 font-playfair">Pembayaran Berhasil!</h3>
              <p className="text-gray-500 text-sm mb-4">Terima kasih, pesanan Anda sedang diproses.</p>
              <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: PRIMARY, borderTopColor: 'transparent' }} />
            </div>
          )}

          {/* ─ QRIS ─ */}
          {isQRIS && (
            <div className="p-6 flex flex-col items-center gap-5">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3" style={{ background: '#fff7f0', border: `1px solid #e8d5c4` }}>
                  <QrCode className="w-4 h-4" style={{ color: PRIMARY }} />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: PRIMARY }}>Scan QRIS untuk Bayar</span>
                </div>
                <p className="text-sm text-gray-500">Buka aplikasi apapun, scan QR di bawah ini</p>
              </div>

              {/* QR Code */}
              <div className="p-[3px] rounded-2xl shadow-lg" style={{ background: GRADIENT }}>
                <div className="bg-white rounded-[14px] p-3">
                  {order.total && order.id ? (
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(getDynamicQRIS(order.total, order.id))}`}
                      alt="Scan QRIS Aparel Khas Papua"
                      className="w-56 h-56 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-56 h-56 flex items-center justify-center text-gray-400 text-sm">Loading QR...</div>
                  )}
                </div>
              </div>

              <div className="text-center space-y-1">
                <p className="font-bold text-gray-800 font-outfit">Total: <span style={{ color: PRIMARY }}>Rp {Number(order.total).toLocaleString('id-ID')}</span></p>
                <p className="text-xs text-gray-400">Nominal sudah otomatis terinput saat scan</p>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {['GoPay','OVO','DANA','LinkAja','ShopeePay','M-BCA'].map(app => (
                    <span key={app} className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ background: '#fff7f0', color: PRIMARY, border: `1px solid #e8d5c4` }}>{app}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─ Bank Transfer ─ */}
          {isBank && (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: GRADIENT }}>
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 font-outfit">Transfer Virtual Account</h3>
                  <p className="text-xs text-gray-400">Pilih bank dan salin nomor VA</p>
                </div>
              </div>

              <div className="space-y-3">
                {banks.map(bank => (
                  <div key={bank.name} className="rounded-xl border p-4 flex items-center justify-between gap-3 hover:shadow-sm transition-shadow" style={{ borderColor: copiedBank === bank.name ? PRIMARY : '#e8d5c4', background: copiedBank === bank.name ? '#fff7f0' : 'white' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0" style={{ background: bank.color }}>
                        {bank.name.substring(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400">{bank.name} Virtual Account</p>
                        <p className="font-bold text-gray-900 tracking-wider text-sm">{bank.account_number}</p>
                        <p className="text-xs text-gray-400">a.n. {bank.account_holder}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(bank.account_number, bank.name)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={{ background: copiedBank === bank.name ? PRIMARY : '#fff7f0', color: copiedBank === bank.name ? 'white' : PRIMARY, border: `1px solid ${copiedBank === bank.name ? PRIMARY : '#e8d5c4'}` }}
                    >
                      {copiedBank === bank.name ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedBank === bank.name ? 'Tersalin' : 'Salin'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 p-3 rounded-xl text-xs text-gray-500" style={{ background: '#fff7f0', border: `1px solid #e8d5c4` }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: PRIMARY }} />
                <span>Pastikan nominal transfer tepat <strong style={{ color: PRIMARY }}>Rp {Number(order.total).toLocaleString('id-ID')}</strong>. Transfer berbeda nominal tidak akan diproses otomatis.</span>
              </div>
            </div>
          )}

          {/* ─ E-Wallet ─ */}
          {isEwallet && (
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: GRADIENT }}>
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 font-outfit">Pembayaran E-Wallet</h3>
                  <p className="text-xs text-gray-400">Pilih e-wallet dan lakukan transfer ke nomor HP admin</p>
                </div>
              </div>

              {/* Pilih E-Wallet */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pilih E-Wallet</p>
                <div className="grid grid-cols-2 gap-2">
                  {ewallets.map(ew => (
                    <button
                      key={ew.name}
                      onClick={() => setSelectedEwallet(ew.name)}
                      className="flex items-center gap-2.5 p-3 rounded-xl border font-semibold text-sm transition-all"
                      style={{
                        borderColor: selectedEwallet === ew.name ? PRIMARY : '#e8d5c4',
                        background: selectedEwallet === ew.name ? '#fff7f0' : 'white',
                        color: selectedEwallet === ew.name ? PRIMARY : '#6b7280',
                      }}
                    >
                      <span className="w-6 h-6 rounded-full flex-shrink-0" style={{ background: ew.color }} />
                      <span>{ew.name}</span>
                      {selectedEwallet === ew.name && <CheckCircle2 className="w-4 h-4 ml-auto" style={{ color: PRIMARY }} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Info Rekening/Nomor HP E-Wallet Admin */}
              {(() => {
                const selectedEwalletObj = ewallets.find(ew => ew.name === selectedEwallet);
                if (!selectedEwalletObj) return null;
                return (
                  <div className="rounded-xl border p-4 flex items-center justify-between gap-3 mt-4" style={{ borderColor: PRIMARY, background: '#fff7f0' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0" style={{ background: selectedEwalletObj.color }}>
                        {selectedEwalletObj.name.substring(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 font-outfit">Nomor Transfer {selectedEwalletObj.name} Admin</p>
                        <p className="font-bold text-gray-900 tracking-wider text-sm">{selectedEwalletObj.account_number}</p>
                        <p className="text-xs text-gray-400 font-medium">a.n. {selectedEwalletObj.account_holder || 'Aparel Khas Papua'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(selectedEwalletObj.account_number, selectedEwalletObj.name)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={{ background: copiedBank === selectedEwalletObj.name ? PRIMARY : '#fff7f0', color: copiedBank === selectedEwalletObj.name ? 'white' : PRIMARY, border: `1px solid ${copiedBank === selectedEwalletObj.name ? PRIMARY : '#e8d5c4'}` }}
                    >
                      {copiedBank === selectedEwalletObj.name ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedBank === selectedEwalletObj.name ? 'Tersalin' : 'Salin'}
                    </button>
                  </div>
                );
              })()}

              {/* Input Nomor HP */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Nomor Handphone Anda ({selectedEwallet})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm text-gray-400">+62</span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="8123456789"
                    className="w-full pl-12 pr-4 py-3 border rounded-xl text-sm font-semibold text-gray-800 focus:outline-none transition-colors"
                    style={{ borderColor: '#e8d5c4', background: '#fafafa' }}
                    onFocus={e => e.target.style.borderColor = PRIMARY}
                    onBlur={e => e.target.style.borderColor = '#e8d5c4'}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl text-xs text-gray-500 leading-relaxed" style={{ background: '#fff7f0', border: `1px solid #e8d5c4` }}>
                Setelah klik "Kirim Permintaan", buka aplikasi <strong style={{ color: PRIMARY }}>{selectedEwallet}</strong> Anda dan setujui pembayaran sebesar <strong style={{ color: PRIMARY }}>Rp {Number(order.total).toLocaleString('id-ID')}</strong>.
              </div>
            </div>
          )}

          {/* ── Upload Bukti & Aksi ── */}
          {order.paymentMethod !== 'cod' && (
            <div className="px-6 pb-6 space-y-3 border-t pt-5 mt-2" style={{ borderColor: '#f5ede6' }}>
              {/* Upload area */}
              <div className="rounded-xl border-2 border-dashed p-4 space-y-3 transition-colors" style={{ borderColor: file ? PRIMARY : '#e8d5c4', background: file ? '#fff7f0' : 'white' }}>
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4" style={{ color: PRIMARY }} />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: PRIMARY }}>
                    {file ? '✅ File Siap Dikirim' : 'Unggah Bukti Pembayaran'}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:text-white cursor-pointer"
                  style={{ '--tw-file-selector-button-bg': PRIMARY } as any}
                />
                {file && <p className="text-xs font-medium" style={{ color: PRIMARY }}>📎 {file.name}</p>}
                <button
                  type="button"
                  disabled={!file || isUploading}
                  onClick={handleUploadProof}
                  className="w-full text-white font-bold py-2.5 rounded-xl transition-opacity disabled:opacity-40 text-sm"
                  style={{ background: GRADIENT }}
                >
                  {isUploading ? 'Mengunggah...' : 'Kirim Bukti Pembayaran'}
                </button>
              </div>

              {/* Simulate */}
              <button
                onClick={handleSimulatePayment}
                className="w-full font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 border transition-all hover:shadow-sm"
                style={{ color: PRIMARY, borderColor: '#e8d5c4', background: '#fff7f0' }}
              >
                <Shield className="w-4 h-4" />
                Simulasi Bayar Otomatis (Demo)
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t py-3 text-center text-xs text-gray-400" style={{ borderColor: '#e8d5c4', background: 'white' }}>
        © {new Date().getFullYear()} NokenPay — Aparel Khas Papua Store. Transaksi aman & terenkripsi.
      </footer>
    </div>
  );
}
