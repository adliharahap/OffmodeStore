"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2, Plus, Minus, ArrowRight, ShoppingBag, Ticket, FileText, Loader2,
  ChevronLeft, Check, X, Sun, Moon, Menu,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

// Import Actions
import {
  getCartItemsAction,
  updateCartQuantityAction,
  deleteCartItemAction
} from '../../../utils/cartActions';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';


// --- FORMAT HARGA ---
const formatPrice = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

// --- SKELETON LOADER ---
const CartSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {[1, 2, 3].map(i => (
      <div key={i} className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded mt-1"></div>
        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="flex-1 space-y-3">
          <div className="h-5 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
        </div>
      </div>
    ))}
  </div>
);

// --- KOMPONEN UTAMA ---
const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [voucherCode, setVoucherCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(null); // ID item yang sedang loading update
  const router = useRouter();

  // 1. FETCH DATA REAL SAAT MOUNT
  useEffect(() => {
    const fetchCart = async () => {
      setIsLoading(true);
      try {
        const data = await getCartItemsAction();
        setCartItems(data);
        // Opsional: Default pilih semua saat load
        // setSelectedItems(data.map(item => item.id)); 
      } catch (error) {
        console.error("Gagal load cart:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCart();
  }, []);

  // 2. LOGIKA SELECT
  const handleSelectItem = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.id));
    }
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) return;

    // Filter item keranjang yang terpilih, ambil ID Cart-nya
    // (Pastikan ID yang dikirim adalah ID Cart, bukan Variant ID, 
    //  sesuai dengan logika getCheckoutItemsAction nanti)
    const itemsToCheckout = selectedItems.join(',');

    // Redirect ke halaman checkout dengan query params
    router.push(`/checkout?items=${itemsToCheckout}`);
  };

  // 3. LOGIKA UPDATE KUANTITAS (REALTIME KE DB)
  const handleQuantityChange = async (id, change, currentQuantity, maxStock) => {
    const newQuantity = currentQuantity + change;

    if (newQuantity < 1 || newQuantity > maxStock) return;

    // Optimistic Update (Update UI duluan biar cepat)
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
    setIsUpdating(id); // Set loading state untuk item spesifik

    try {
      const res = await updateCartQuantityAction(id, newQuantity);
      if (!res.success) throw new Error(res.message);
    } catch (error) {
      console.error("Gagal update stok:", error);
      alert("Gagal update stok. Kembalikan ke jumlah sebelumnya.");
      // Rollback jika gagal
      setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: currentQuantity } : item));
    } finally {
      setIsUpdating(null);
    }
  };

  // 4. LOGIKA HAPUS (REALTIME KE DB)
  const handleRemoveItem = async (id) => {
    if (!confirm("Hapus barang ini dari keranjang?")) return;

    // Optimistic Update
    const backupItems = [...cartItems];
    setCartItems(prev => prev.filter(item => item.id !== id));
    setSelectedItems(prev => prev.filter(itemId => itemId !== id));

    try {
      const res = await deleteCartItemAction(id);
      if (!res.success) throw new Error(res.message);
    } catch (error) {
      console.error("Gagal hapus:", error);
      setCartItems(backupItems); // Rollback
    }
  };

  // --- KALKULASI TOTAL ---
  const { subtotal, totalItems } = useMemo(() => {
    let subtotal = 0;
    let totalItems = 0;
    for (const item of cartItems) {
      if (selectedItems.includes(item.id)) {
        subtotal += item.price * item.quantity;
        totalItems += item.quantity;
      }
    }
    return { subtotal, totalItems };
  }, [cartItems, selectedItems]);

  const allItemsSelected = cartItems.length > 0 && selectedItems.length === cartItems.length;
  const grandTotal = subtotal;
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors duration-500 font-sans">
      <Header />

      {/* Background Noise Texture */}
      <div
        className="fixed inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.03] pointer-events-none z-1 mix-blend-multiply dark:mix-blend-normal"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`
        }}
      >
      </div>

      <main className="relative z-10 pt-32 pb-32">
        <motion.div
          className="container mx-auto px-6 md:px-10 max-w-7xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* HEADER PAGE */}
          <div className="flex items-center justify-between mb-10 border-b border-gray-200 dark:border-white/10 pb-6">
            <div>
              <span className="text-purple-600 dark:text-purple-400 font-bold tracking-[0.2em] text-xs uppercase mb-2 block">My Bag</span>
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white">
                Your Selection
              </h1>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest">{cartItems.length} Items</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">

            {/* --- KOLOM KIRI: DAFTAR ITEM --- */}
            <div className="lg:col-span-2 space-y-6">

              {/* Loading State */}
              {isLoading ? (
                <CartSkeleton />
              ) : cartItems.length > 0 ? (
                <>
                  {/* Toolbar: Select All & Delete */}
                  <div className="flex justify-between items-center p-4 rounded-xl bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10">
                    <label htmlFor="selectAll" className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${allItemsSelected ? 'bg-purple-600 border-purple-600' : 'bg-transparent border-gray-400 dark:border-gray-600 group-hover:border-purple-500'}`}>
                        {allItemsSelected && <Check size={12} className="text-white" />}
                      </div>
                      <input type="checkbox" id="selectAll" checked={allItemsSelected} onChange={handleSelectAll} className="hidden" />
                      <span className="text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        Select All ({cartItems.length})
                      </span>
                    </label>

                    {selectedItems.length > 0 && (
                      <button
                        onClick={() => alert("Fitur hapus massal")}
                        className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-wider transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Remove ({selectedItems.length})
                      </button>
                    )}
                  </div>

                  {/* Cart List */}
                  <div className="space-y-4">
                    <AnimatePresence mode='popLayout'>
                      {cartItems.map(item => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                          className="group flex gap-4 p-5 bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-white/10 relative transition-all hover:border-purple-200 dark:hover:border-white/20"
                        >
                          {/* Loading Overlay */}
                          {isUpdating === item.id && (
                            <div className="absolute inset-0 bg-white/60 dark:bg-black/60 z-10 flex items-center justify-center rounded-xl backdrop-blur-sm">
                              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                            </div>
                          )}

                          {/* Checkbox */}
                          <div className="mt-1">
                            <label className="cursor-pointer">
                              <input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => handleSelectItem(item.id)} className="hidden" />
                              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedItems.includes(item.id) ? 'bg-purple-600 border-purple-600' : 'bg-transparent border-gray-400 dark:border-gray-600'}`}>
                                {selectedItems.includes(item.id) && <Check size={12} className="text-white" />}
                              </div>
                            </label>
                          </div>

                          {/* Image */}
                          <div className="w-24 h-32 shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-[#1a1a1a]">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>

                          {/* Details (UPDATED LAYOUT) */}
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <a href={`/detailproduct/${item.productId}`} className="block">
                                  <h3 className="font-serif font-bold text-base md:text-lg text-gray-900 dark:text-white leading-tight hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer">
                                    {item.name}
                                  </h3>
                                </a>
                                <button onClick={() => handleRemoveItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                                  <X size={18} />
                                </button>
                              </div>
                              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">
                                {item.color} / {item.size}
                              </p>
                            </div>

                            {/* Price & Quantity: Column on Mobile, Row on Desktop */}
                            <div className="flex flex-col md:flex-row md:items-end justify-between mt-4 gap-3 md:gap-0">
                              <div>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                  {formatPrice(item.price)}
                                </p>
                                {item.quantity >= item.stock && (
                                  <p className="text-[10px] text-red-500 font-bold uppercase mt-1">Max Stock Reached</p>
                                )}
                              </div>

                              {/* Quantity Control */}
                              <div className="flex items-center self-start md:self-auto bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10">
                                <button
                                  onClick={() => handleQuantityChange(item.id, -1, item.quantity, item.stock)}
                                  disabled={item.quantity <= 1}
                                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white disabled:opacity-30 transition-colors"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="w-8 text-center text-sm font-bold text-gray-900 dark:text-white font-mono">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(item.id, 1, item.quantity, item.stock)}
                                  disabled={item.quantity >= item.stock}
                                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white disabled:opacity-30 transition-colors"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                /* KONDISI KOSONG */
                <div className="text-center py-24 bg-white dark:bg-[#111] rounded-2xl border border-dashed border-gray-300 dark:border-white/10">
                  <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="w-8 h-8 text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-2">Your bag is empty</h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">Looks like you haven't added anything to your cart yet.</p>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold text-white bg-gray-900 dark:bg-white dark:text-black hover:opacity-90 transition-all"
                  >
                    Start Shopping <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            {/* --- KOLOM KANAN: RINGKASAN --- */}
            <div className="lg:col-span-1 mt-10 lg:mt-0">
              <div className="sticky top-24 p-8 bg-white dark:bg-[#111] rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-200 dark:border-white/10 space-y-6">
                <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/10 pb-4">
                  Order Summary
                </h2>

                {/* Voucher (Minimalist Input) */}
                <div className="space-y-2">
                  <label htmlFor="voucher" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    <Ticket className="w-4 h-4" /> Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="voucher"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      placeholder="Enter code"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none text-sm"
                    />
                    <button className="px-4 py-2 rounded-lg font-bold text-sm bg-gray-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity">
                      Apply
                    </button>
                  </div>
                </div>

                <div className="space-y-3 py-4 border-t border-gray-100 dark:border-white/10 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="font-mono">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping</span>
                    <span className="text-xs italic">Calculated at checkout</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-white/10 pt-4">
                  <div className="flex justify-between items-end text-xl font-serif font-bold text-gray-900 dark:text-white mb-6">
                    <span>Total</span>
                    <span>{formatPrice(grandTotal)}</span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={selectedItems.length === 0}
                    className="w-full py-4 px-6 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 dark:disabled:bg-gray-700
                             flex items-center justify-center gap-3 transition-all shadow-lg shadow-purple-600/20"
                  >
                    Checkout Now ({selectedItems.length})
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500 dark:text-gray-400">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    <p>Secure Checkout • Garansi Pengiriman Aman</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Mobile Footer Summary */}
      {cartItems.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 w-full p-4 bg-white dark:bg-[#111] border-t border-gray-200 dark:border-white/10 z-40 safe-area-bottom">
          <div className="flex justify-between items-center gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</p>
              <p className="text-xl font-serif font-bold text-gray-900 dark:text-white">
                {formatPrice(grandTotal)}
              </p>
            </div>
            <button
              onClick={handleCheckout}
              disabled={selectedItems.length === 0}
              className="flex-1 py-3 px-6 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-all"
            >
              Checkout ({selectedItems.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;