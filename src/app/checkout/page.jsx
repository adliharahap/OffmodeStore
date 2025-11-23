"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  MapPin, ChevronRight, CreditCard, QrCode, ShoppingBag, Plus,
  CheckCircle2, Loader2, Banknote, ShieldCheck, X,
  User, Phone, Building, Home, Briefcase, Building2, Receipt, Calendar, Truck, Sun, Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HeaderUniversal from '../../../components/Header';

// ACTIONS (Mock / Actual Imports)
import { getUserAddresses, addUserAddress } from '../../../utils/addressAction';
import { getCartCount, getCheckoutItemsAction, getDirectCheckoutItemAction } from '../../../utils/cartActions';
import { processCheckoutAction } from '../../../utils/checkoutAction';
import { setCartCount } from '../../../store/slice/cartSlice';
import { useDispatch } from 'react-redux';

// UTILS
const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);


// --- PAYMENT METHODS (STATIC) ---
const PAYMENT_METHODS = [
  {
    category: 'E-Wallet / QRIS',
    icon: <QrCode className="w-5 h-5" />,
    options: [
      { id: 'qris', name: 'QRIS', logo: '/payment_icon/qris.png' },
      { id: 'gopay', name: 'GoPay', logo: '/payment_icon/gopay.jpeg' },
      { id: 'ovo', name: 'OVO', logo: '/payment_icon/ovo.jpeg' },
      { id: 'dana', name: 'DANA', logo: '/payment_icon/dana.png' },
      { id: 'shopeepay', name: 'ShopeePay', logo: '/payment_icon/shopeepay.png' },
    ]
  },
  {
    category: 'Transfer Bank',
    icon: <CreditCard className="w-5 h-5" />,
    options: [
      { id: 'bca', name: 'BCA Virtual Account', logo: '/payment_icon/bca.png' },
      { id: 'mandiri', name: 'Mandiri Virtual Account', logo: '/payment_icon/mandiri.jpeg' },
      { id: 'bni', name: 'BNI Virtual Account', logo: '/payment_icon/bni.jpeg' },
      { id: 'bri', name: 'BRI Virtual Account', logo: '/payment_icon/bri.png' },
    ]
  },
  {
    category: 'PayLater',
    icon: <Banknote className="w-5 h-5" />,
    options: [
      { id: 'shopee_paylater', name: 'Shopee PayLater', logo: '/payment_icon/shopeepay.png' },
      { id: 'gopay_later', name: 'GoPay Later', logo: '/payment_icon/gopay.jpeg' },
    ]
  }
];

const InputField = ({ icon: Icon, label, ...props }) => (
  <div className="group">
    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-600 transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <input
        {...props}
        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
      />
    </div>
  </div>
);

const SummaryRow = ({ label, value, isTotal }) => (
  <div className={`flex justify-between items-center ${isTotal ? 'pt-4 mt-4 border-t border-gray-200 dark:border-white/10' : ''}`}>
    <span className={`text-sm ${isTotal ? 'text-lg font-serif font-bold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
      {label}
    </span>
    <span className={`font-medium ${isTotal ? 'text-xl font-bold text-purple-600 dark:text-purple-400' : 'text-gray-900 dark:text-white'}`}>
      {value}
    </span>
  </div>
);

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  // --- STATE DATA ---
  const [addresses, setAddresses] = useState([]);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // --- STATE UI ---
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('qris');

  // State khusus untuk menampung data final transaksi agar modal sukses statis tidak berubah meski background berubah
  const [successData, setSuccessData] = useState({
    orderId: '',
    totalAmount: 0,
    paymentName: '',
    paymentLogo: '',
    itemsCount: 0
  });

  // --- STATE FORM ALAMAT BARU ---
  const [newAddressForm, setNewAddressForm] = useState({
    address_label: 'Rumah',
    recipient_name: '',
    phone: '',
    street: '',
    city: '',
    province: '',
    postal_code: ''
  });

  // --- 1. FETCH DATA SAAT LOAD ---
  useEffect(() => {
    const initData = async () => {
      setIsLoadingData(true);
      try {
        const addrData = await getUserAddresses();
        setAddresses(addrData);
        const defaultAddr = addrData.find(a => a.is_default) || addrData[0];
        if (defaultAddr) setSelectedAddress(defaultAddr);

        // B. LOGIKA BARU: Cek Mode Checkout
        const mode = searchParams.get('mode');

        if (mode === 'direct') {
          // --- MODE 1: PESAN SEKARANG ---
          const variantId = searchParams.get('variantId');
          const qty = searchParams.get('quantity');

          if (variantId && qty) {
            const directItem = await getDirectCheckoutItemAction(variantId, qty);
            if (directItem) {
              setCheckoutItems(directItem);
            } else {
              alert("Gagal mengambil data produk.");
              router.push('/'); // Kembalikan ke home jika error
            }
          }
        } else {
          // --- MODE 2: DARI KERANJANG (Logic Lama) ---
          const itemsParam = searchParams.get('items');
          if (itemsParam) {
            const ids = itemsParam.split(',');
            const itemsData = await getCheckoutItemsAction(ids);
            setCheckoutItems(itemsData);
          }
        }
      } catch (err) {
        console.error("Error init checkout:", err);
      } finally {
        setIsLoadingData(false);
      }
    };
    initData();
  }, [searchParams]);

  // --- 2. CALCULATIONS ---
  const subtotal = useMemo(() => checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0), [checkoutItems]);
  const shippingCost = 15000;
  const adminFee = 1000;
  const grandTotal = subtotal + shippingCost + adminFee;

  // Helper untuk mencari nama payment method
  const getPaymentDetails = (id) => {
    for (const group of PAYMENT_METHODS) {
      const found = group.options.find(opt => opt.id === id);
      if (found) return found;
    }
    return { name: 'Unknown Payment', logo: '❓' };
  };

  // --- 3. HANDLER TAMBAH ALAMAT ---
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await addUserAddress(newAddressForm);
      if (res.success) {
        const updatedAddrs = await getUserAddresses();
        setAddresses(updatedAddrs);
        // Auto select alamat baru (ambil yg terakhir ditambahkan atau logikanya disesuaikan)
        const newest = updatedAddrs[updatedAddrs.length - 1];
        if (newest) setSelectedAddress(newest);

        setIsAddingAddress(false);
        setShowAddressModal(false); // Opsional: langsung tutup modal atau kembali ke list
        setNewAddressForm({ address_label: 'Rumah', recipient_name: '', phone: '', street: '', city: '', province: '', postal_code: '' });
      } else {
        alert("Gagal simpan alamat: " + res.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 4. HANDLER CHECKOUT ---
  const handleCheckout = async () => {
    if (!selectedAddress) {
      alert("Mohon pilih alamat pengiriman.");
      return;
    }

    setIsProcessing(true);

    const payload = {
      addressId: selectedAddress.id,
      paymentMethod: selectedPayment,
      items: checkoutItems.map(i => ({
        variantId: i.variantId,
        quantity: i.quantity,
        price: i.price
      })),
      totalAmount: grandTotal // Kirim total amount untuk validasi backend
    };

    try {
      const res = await processCheckoutAction(payload);

      if (res.success) {
        const paymentDetail = getPaymentDetails(selectedPayment);

        // SIMPAN SNAPSHOT DATA UNTUK MODAL SUKSES
        setSuccessData({
          orderId: res.orderId || 'ORD-' + Math.floor(Math.random() * 1000000),
          totalAmount: grandTotal,
          paymentName: paymentDetail.name,
          paymentLogo: paymentDetail.logo,
          itemsCount: checkoutItems.length
        });


        setIsSuccess(true);

        //update data keranjang
        const latestCount = await getCartCount();
        // Update state global (Header akan otomatis berubah)
        dispatch(setCartCount(latestCount));
      } else {
        alert("Gagal checkout: " + res.message);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-[#0a0a0a]">
        <Loader2 className="animate-spin w-10 h-10 text-purple-600" />
        <p className="text-gray-500 font-medium">Menyiapkan pesanan Anda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#0a0a0a] text-gray-900 font-sans pb-24 md:pb-10">
      <HeaderUniversal />

      <div className="inset-0 opacity-[0.03] dark:opacity-[0.03] pointer-events-none z-0 fixed mix-blend-multiply dark:mix-blend-normal"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}>
      </div>

      <main className="relative z-10 pt-32 pb-32 container mx-auto px-6 md:px-10 max-w-7xl">

        <div className="mb-10">
          <span className="text-purple-600 dark:text-purple-400 font-bold tracking-[0.2em] text-xs uppercase mb-2 block">Secure Checkout</span>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white">Finalize Order</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* --- LEFT COLUMN: FORMS --- */}
          <div className="lg:col-span-8 space-y-8">

            {/* 1. ALAMAT PENGIRIMAN */}
            <section className="bg-white dark:bg-[#111] p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2 uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <MapPin className="w-4 h-4" /> Shipping Address
                </h2>
                <button
                  onClick={() => { setShowAddressModal(true); setIsAddingAddress(false); }}
                  className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                >
                  CHANGE ADDRESS
                </button>
              </div>

              {selectedAddress ? (
                <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                  <div className="p-2.5 bg-white dark:bg-white/10 rounded-full text-gray-900 dark:text-white shrink-0">
                    {selectedAddress.address_label.toLowerCase() === 'kantor' ? <Building size={20} /> : <Home size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white">{selectedAddress.address_label}</h3>
                      {selectedAddress.is_default && <span className="text-[10px] font-bold bg-gray-200 dark:bg-white/20 text-gray-600 dark:text-white px-2 py-0.5 rounded-full">DEFAULT</span>}
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{selectedAddress.recipient_name} <span className="text-gray-400 mx-1">•</span> {selectedAddress.phone_number}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed max-w-md">
                      {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.province}, {selectedAddress.postal_code}
                    </p>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setShowAddressModal(true); setIsAddingAddress(true); }} className="w-full py-8 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl text-gray-400 hover:text-purple-600 hover:border-purple-200 hover:bg-purple-50/50 transition-all flex flex-col items-center gap-2">
                  <Plus className="w-6 h-6" />
                  <span className="font-medium text-sm">Add New Address</span>
                </button>
              )}
            </section>

            {/* 2. ITEMS REVIEW */}
            <section className="bg-white dark:bg-[#111] p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
              <h2 className="text-lg font-bold flex items-center gap-2 uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-6">
                <ShoppingBag className="w-4 h-4" /> Order Items
              </h2>

              <div className="space-y-6">
                {checkoutItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4 group">
                    <div className="w-20 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-white/5 shrink-0 border border-gray-200 dark:border-white/5">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h3 className="font-serif font-bold text-gray-900 dark:text-white text-lg">{item.name}</h3>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">
                          {item.color} / {item.size}
                        </p>
                      </div>
                      <div className="flex justify-between items-end border-t border-dashed border-gray-100 dark:border-white/10 pt-2 mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                        <p className="font-bold text-gray-900 dark:text-white">{formatRupiah(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. PAYMENT METHOD */}
            <section className="bg-white dark:bg-[#111] p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
              <h2 className="text-lg font-bold flex items-center gap-2 uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-6">
                <Banknote className="w-4 h-4" /> Payment Method
              </h2>

              <div className="space-y-6">
                {PAYMENT_METHODS.map((group, idx) => (
                  <div key={idx}>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 ml-1">{group.category}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {group.options.map((method) => (
                        <div
                          key={method.id}
                          onClick={() => setSelectedPayment(method.id)}
                          className={`
                            relative cursor-pointer rounded-xl p-4 border transition-all duration-200
                            flex items-center gap-4
                            ${selectedPayment === method.id
                              ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 ring-1 ring-purple-600'
                              : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'}
                          `}
                        >
                          <img src={method.logo} className="w-10 h-10 rounded-lg border border-gray-100 dark:border-white/10 flex items-center justify-center text-xl shadow-sm" />
                          <div className="flex-1">
                            <p className={`text-sm font-bold ${selectedPayment === method.id ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'}`}>
                              {method.name}
                            </p>
                          </div>
                          {selectedPayment === method.id && (
                            <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-white">
                              <CheckCircle2 className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* --- RIGHT COLUMN: SUMMARY --- */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white dark:bg-[#111] p-8 rounded-3xl shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-200 dark:border-white/10 relative overflow-hidden">

                {/* Decorative Blur */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl z-0"></div>

                <h2 className="text-xl font-serif font-bold mb-6 text-gray-900 dark:text-white relative z-10 border-b border-gray-100 dark:border-white/10 pb-4">
                  Summary
                </h2>

                <div className="space-y-1 relative z-10">
                  <SummaryRow label="Subtotal" value={formatRupiah(subtotal)} />
                  <SummaryRow label="Shipping" value={formatRupiah(shippingCost)} />
                  <SummaryRow label="Service Fee" value={formatRupiah(adminFee)} />
                  <SummaryRow label="Total" value={formatRupiah(grandTotal)} isTotal />
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isProcessing || !selectedAddress || checkoutItems.length === 0}
                  className="w-full mt-8 bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-black font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative z-10"
                >
                  {isProcessing ? (
                    <> <Loader2 className="w-5 h-5 animate-spin" /> Processing... </>
                  ) : (
                    <> Place Order <ChevronRight className="w-5 h-5" /> </>
                  )}
                </button>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-center gap-2 relative z-10 text-xs text-gray-500 dark:text-gray-400">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <p>Secure Checkout • Encrypted Data</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>


      {/* --- MODAL 1: ADDRESS LIST & ADD FORM (REDESIGNED DARK MODE) --- */}
      <AnimatePresence>
        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setShowAddressModal(false); setIsAddingAddress(false); }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="relative bg-white dark:bg-[#111] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-gray-200 dark:border-white/10"
            >
              {/* Header Modal */}
              <div className="px-8 py-6 border-b border-gray-100 dark:border-white/10 sticky top-0 bg-white/80 dark:bg-[#111]/80 backdrop-blur-md z-20 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isAddingAddress ? "Alamat Baru" : "Pilih Alamat"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {isAddingAddress ? "Lengkapi detail lokasi pengiriman." : "Mau kirim pesanan kemana?"}
                  </p>
                </div>
                <button onClick={() => { setShowAddressModal(false); setIsAddingAddress(false); }} className="p-2 bg-gray-100 dark:bg-white/10 rounded-full hover:bg-gray-200 dark:hover:bg-white/20 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar">

                {/* === FORM TAMBAH ALAMAT DESIGN BARU === */}
                {isAddingAddress ? (
                  <form onSubmit={handleSaveAddress} className="space-y-6">

                    {/* Label Selector */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Simpan Sebagai</label>
                      <div className="flex gap-3 mb-3">
                        {['Rumah', 'Kantor', 'Apartemen'].map(label => (
                          <button
                            key={label} type="button"
                            onClick={() => setNewAddressForm({ ...newAddressForm, address_label: label })}
                            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all flex items-center gap-2
                                        ${newAddressForm.address_label === label
                                ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200 dark:shadow-none'
                                : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-purple-200 dark:hover:border-purple-500/50 hover:bg-purple-50 dark:hover:bg-purple-900/20'}
                                    `}
                          >
                            {label === 'Rumah' && <Home className="w-4 h-4" />}
                            {label === 'Kantor' && <Briefcase className="w-4 h-4" />}
                            {label === 'Apartemen' && <Building2 className="w-4 h-4" />}
                            {label}
                          </button>
                        ))}
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                          <Building className="w-5 h-5" />
                        </div>
                        <input
                          type="text" placeholder="Atau ketik label lain (contoh: Kosan)"
                          value={newAddressForm.address_label}
                          onChange={e => setNewAddressForm({ ...newAddressForm, address_label: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 border-b-2 border-gray-100 dark:border-white/10 focus:border-purple-600 dark:focus:border-purple-500 focus:outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      {/* Note: Pastikan komponen InputField kamu juga mendukung dark mode (bg-transparent/dark:bg-white/5 & dark:text-white) */}
                      <InputField
                        icon={User} label="Nama Penerima" placeholder="Nama lengkap" required
                        value={newAddressForm.recipient_name}
                        onChange={e => setNewAddressForm({ ...newAddressForm, recipient_name: e.target.value })}
                      />
                      <InputField
                        icon={Phone} label="Nomor HP" placeholder="08xx-xxxx-xxxx" type="tel" required
                        value={newAddressForm.phone}
                        onChange={e => setNewAddressForm({ ...newAddressForm, phone: e.target.value })}
                      />
                    </div>

                    <div className="relative group">
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Alamat Lengkap</label>
                      <div className="relative">
                        <div className="absolute top-3 left-3 text-gray-400 dark:text-gray-500 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <textarea
                          rows="3" required placeholder="Nama Jalan, No. Rumah, RT/RW, Patokan"
                          value={newAddressForm.street}
                          onChange={e => setNewAddressForm({ ...newAddressForm, street: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-500/50 focus:bg-white dark:focus:bg-black transition-all resize-none"
                        ></textarea>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <InputField
                          icon={Building2} label="Kota / Kabupaten" placeholder="Contoh: Jakarta Selatan" required
                          value={newAddressForm.city}
                          onChange={e => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
                        />
                      </div>
                      <InputField
                        icon={MapPin} label="Kode Pos" placeholder="12xxx" required
                        value={newAddressForm.postal_code}
                        onChange={e => setNewAddressForm({ ...newAddressForm, postal_code: e.target.value })}
                      />
                    </div>

                    <InputField
                      icon={Building} label="Provinsi" placeholder="Contoh: DKI Jakarta" required
                      value={newAddressForm.province}
                      onChange={e => setNewAddressForm({ ...newAddressForm, province: e.target.value })}
                    />

                    <div className="flex gap-3 pt-6">
                      <button type="button" onClick={() => setIsAddingAddress(false)} className="flex-1 py-3.5 font-bold text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">Batal</button>
                      <button type="submit" disabled={isProcessing} className="flex-2 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-black dark:hover:bg-gray-200 shadow-lg shadow-gray-900/20 dark:shadow-none flex items-center justify-center gap-2 transition-all transform active:scale-95">
                        {isProcessing ? <Loader2 className="animate-spin w-5 h-5" /> : "Simpan Alamat"}
                      </button>
                    </div>
                  </form>
                ) : (
                  // MODE LIST ALAMAT
                  <div className="space-y-4">
                    {addresses.length > 0 ? addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => { setSelectedAddress(addr); setShowAddressModal(false); }}
                        className={`
                          p-5 rounded-2xl border cursor-pointer relative group transition-all duration-200
                          flex items-start gap-4
                          ${selectedAddress?.id === addr.id
                                                  ? 'border-purple-600 dark:border-purple-500 bg-purple-50/50 dark:bg-purple-900/20 shadow-inner'
                                                  : 'border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 hover:border-purple-200 dark:hover:border-purple-500/50 hover:bg-gray-50 dark:hover:bg-white/10 hover:shadow-md'}
                        `}
                        >
                        {/* --- RADIO BUTTON INDICATOR --- */}
                        <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${selectedAddress?.id === addr.id ? 'border-purple-600 dark:border-purple-500' : 'border-gray-300 dark:border-white/20'}`}>
                          {selectedAddress?.id === addr.id && <div className="w-2.5 h-2.5 bg-purple-600 dark:bg-purple-500 rounded-full" />}
                        </div>

                        <div className="flex-1 space-y-2">

                          {/* --- HEADER: LABEL & DEFAULT BADGE --- */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {/* Logic Icon Label Otomatis */}
                              <span className={`${selectedAddress?.id === addr.id ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 dark:text-gray-500'}`}>
                                {addr.address_label.toLowerCase().includes('kantor') ? <Briefcase size={16} /> :
                                  addr.address_label.toLowerCase().includes('apartemen') ? <Building2 size={16} /> :
                                    <Home size={16} />}
                              </span>
                              <span className="font-bold text-gray-900 dark:text-gray-100 text-base">{addr.address_label}</span>
                            </div>

                            {addr.is_default && (
                              <span className="flex items-center gap-1 text-[10px] font-bold bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full border border-transparent dark:border-white/5">
                                DEFAULT
                              </span>
                            )}
                          </div>

                          {/* --- INFO PENERIMA & TELEPON (Updated with Icons) --- */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-300 font-medium">
                              <User size={14} className="text-gray-400 dark:text-gray-500 shrink-0" />
                              <span>{addr.recipient_name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <Phone size={14} className="text-gray-400 dark:text-gray-500 shrink-0" />
                              <span>{addr.phone_number}</span>
                            </div>
                          </div>

                          {/* --- ALAMAT LENGKAP BOX (Updated with Icon) --- */}
                          <div className="flex items-start gap-2 mt-2 bg-white/50 dark:bg-black/20 p-2.5 rounded-xl border border-gray-50/50 dark:border-white/5">
                            <MapPin size={14} className="text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                              {addr.street}, {addr.city}, {addr.province}, {addr.postal_code}
                            </p>
                          </div>

                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-white/10">
                          <MapPin className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                        </div>
                        <h4 className="text-gray-900 dark:text-white font-bold">Alamat Kosong</h4>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Kamu belum menambahkan alamat pengiriman.</p>
                      </div>
                    )}

                    <button
                      onClick={() => setIsAddingAddress(true)}
                      className="w-full py-4 mt-4 border-2 border-dashed border-gray-200 dark:border-white/20 text-gray-500 dark:text-gray-400 font-bold rounded-2xl hover:border-purple-500 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center justify-center gap-2 group"
                    >
                      <div className="bg-gray-200 dark:bg-white/10 rounded-full p-1 group-hover:bg-purple-200 dark:group-hover:bg-purple-500/20 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
                        <Plus className="w-4 h-4" />
                      </div>
                      Tambah Alamat Baru
                    </button>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL 2: SUKSES ORDER (DYNAMIC DATA) --- */}
      <AnimatePresence>
        {isSuccess && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 bg-purple-900/90 backdrop-blur-lg"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Decoration Header */}
              <div className="bg-green-500 h-32 relative overflow-hidden flex items-center justify-center">
                <div className="absolute w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", damping: 15 }}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg relative z-10"
                >
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </motion.div>
              </div>

              <div className="px-8 pt-6 pb-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Pesanan Diterima!</h2>
                <p className="text-gray-500 text-sm mb-6">Terima kasih, pesananmu sedang diproses.</p>

                {/* TICKET INFO CARD */}
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-0 overflow-hidden relative mb-6">
                  {/* Zigzag border top/bottom effect simulation using CSS could go here */}

                  <div className="p-4 border-b border-gray-200 border-dashed flex justify-between items-center bg-white">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Order ID</span>
                    <span className="font-mono font-bold text-gray-800">{successData.orderId}</span>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Metode Bayar</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{successData.paymentLogo}</span>
                        <span className="text-sm font-bold text-gray-900">{successData.paymentName}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Estimasi Tiba</span>
                      <div className="flex items-center gap-1.5 text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
                        <Calendar className="w-3.5 h-3.5" /> 2 - 3 Hari
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 flex justify-between items-end">
                      <div className="text-left">
                        <p className="text-xs text-gray-400">Total Pembayaran</p>
                        <p className="text-xs text-gray-400">({successData.itemsCount} Barang)</p>
                      </div>
                      <span className="text-2xl font-bold text-purple-600">{formatRupiah(successData.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => router.push('/')} className="w-full py-3.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors text-sm">
                    Kembali ke Home
                  </button>
                  <button onClick={() => router.push('/myorders')} className="w-full py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold shadow-lg shadow-gray-400/20 transition-colors text-sm flex items-center justify-center gap-2">
                    <Receipt className="w-4 h-4" /> Lihat Pesanan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}