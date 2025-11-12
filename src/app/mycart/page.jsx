"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// DI-UPDATE: Ikon baru ditambahkan
import { 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingCart, // <-- Untuk keranjang kosong
  Ticket,       // <-- Untuk voucher
  FileText      // <-- Untuk ringkasan
} from 'lucide-react';

// --- PLACEHOLDER HEADERUNIVERSAL ---
const HeaderUniversal = () => {
  return (
    <header className="w-full p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold text-gray-900 dark:text-white">LOGO</div>
        <div className="flex gap-4">
          <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-purple-600">Home</a>
          <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-purple-600">Products</a>
          <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-purple-600">Login</a>
        </div>
      </nav>
    </header>
  );
};

// --- DATA CONTOH UNTUK KERANJANG ---
// (Berdasarkan data produk Anda sebelumnya)
const initialCartData = [
  {
    id: 1,
    name: 'Kemeja Linen Oversized',
    image: 'https://placehold.co/800x800/f5f5f5/333?text=Kemeja+Putih',
    price: 450000,
    quantity: 1,
    color: 'Putih Gading',
    size: 'M',
    stock: 12,
  },
  {
    id: 3,
    name: 'Celana Chino Slim',
    image: 'https://placehold.co/800x800/f0e8e0/333?text=Celana+Chino',
    price: 550000,
    quantity: 2,
    color: 'Khaki',
    size: '30',
    stock: 10,
  },
];

// --- Helper untuk format harga (Rupiah) ---
const formatPrice = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
};

// --- KOMPONEN UTAMA HALAMAN KERANJANG ---
const CartPage = () => {
  const [cartItems, setCartItems] = useState(initialCartData);
  const [selectedItems, setSelectedItems] = useState(initialCartData.map(item => item.id)); // Default pilih semua
  // State baru untuk voucher
  const [voucherCode, setVoucherCode] = useState('');

  // --- FUNGSI-FUNGSI LOGIKA ---

  // Menangani centang pada satu item
  const handleSelectItem = (id) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  // Menangani centang "Pilih Semua"
  const handleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]); // Batal pilih semua
    } else {
      setSelectedItems(cartItems.map(item => item.id)); // Pilih semua
    }
  };

  // Mengubah kuantitas item
  const handleQuantityChange = (id, change) => {
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          // Batasi kuantitas antara 1 dan stok
          if (newQuantity >= 1 && newQuantity <= item.stock) {
            return { ...item, quantity: newQuantity };
          }
        }
        return item;
      })
    );
  };

  // Menghapus item dari keranjang
  const handleRemoveItem = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    // Juga hapus dari item yang dipilih
    setSelectedItems(prev => prev.filter(itemId => itemId !== id));
  };

  // --- KALKULASI TOTAL (DINAMIS BERDASARKAN CHECKBOX) ---
  const { subtotal, totalItems } = useMemo(() => {
    let subtotal = 0;
    let totalItems = 0;

    // Hanya hitung item yang ada di 'selectedItems'
    for (const item of cartItems) {
      if (selectedItems.includes(item.id)) {
        subtotal += item.price * item.quantity;
        totalItems += item.quantity;
      }
    }
    return { subtotal, totalItems };
  }, [cartItems, selectedItems]);
  // DI-HAPUS: Biaya pengiriman dan grandTotal
  // const shippingCost = subtotal > 500000 || subtotal === 0 ? 0 : 20000;
  // const grandTotal = subtotal + shippingCost;
  // SEKARANG: Total adalah subtotal
  const grandTotal = subtotal; // Cukup ganti nama variabel untuk meminimalisir refactor

  const allItemsSelected = selectedItems.length === cartItems.length && cartItems.length > 0;

  return (
    <>
      <HeaderUniversal />
      {/* Padding bottom untuk memberi ruang bagi footer mobile */}
      <div className="min-h-screen bg-stone-50 dark:bg-gray-900 pb-32 lg:pb-0">
        <motion.div
          className="container mx-auto px-4 md:px-6 py-12 md:py-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Keranjang Saya
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
            {/* --- KOLOM KIRI: DAFTAR ITEM --- */}
            <div className="lg:col-span-2 space-y-5">
              
              {/* Tombol Pilih Semua */}
              {cartItems.length > 0 && (
                <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                  <label htmlFor="selectAll" className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      id="selectAll"
                      checked={allItemsSelected}
                      onChange={handleSelectAll}
                      className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Pilih Semua ({cartItems.length} produk)
                    </span>
                  </label>
                  <button
                    onClick={() => {
                      // Hapus hanya item yang terpilih
                      setCartItems(cartItems.filter(item => !selectedItems.includes(item.id)));
                      setSelectedItems([]);
                    }}
                    disabled={selectedItems.length === 0}
                    className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-700 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" /> {/* <-- IKON DITAMBAHKAN */}
                    Hapus ({selectedItems.length})
                  </button>
                </div>
              )}

              {/* Daftar Item Keranjang */}
              <AnimatePresence>
                {cartItems.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50, transition: { duration: 0.3 } }}
                    className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 mt-1"
                    />

                    {/* Gambar */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover"
                    />

                    {/* Info & Kuantitas */}
                    <div className="flex-1 flex flex-col md:flex-row justify-between">
                      {/* Info */}
                      <div className="flex-1 mb-4 md:mb-0">
                        <h3 className="font-bold text-gray-900 dark:text-white">{item.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.color}, {item.size}
                        </p>
                        <p className="text-lg font-semibold text-purple-600 dark:text-purple-400 mt-2">
                          {formatPrice(item.price)}
                        </p>
                        {/* Peringatan Stok */}
                        {item.quantity === item.stock && (
                          <p className="text-xs font-semibold text-red-500 mt-1">
                            Stok maks. tercapai
                          </p>
                        )}
                        {item.stock < 5 && item.quantity < item.stock && (
                          <p className="text-xs font-semibold text-yellow-600 mt-1">
                            Stok hampir habis
                          </p>
                        )}
                      </div>

                      {/* Kontrol Kuantitas & Hapus */}
                      <div className="flex items-center justify-between md:justify-end gap-4">
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(item.id, -1)}
                            disabled={item.quantity <= 1}
                            className="px-3 py-2 text-gray-600 dark:text-gray-400 disabled:opacity-50"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-1 text-lg font-semibold text-gray-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, 1)}
                            disabled={item.quantity >= item.stock}
                            className="px-3 py-2 text-gray-600 dark:text-gray-400 disabled:opacity-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Hapus item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {cartItems.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg shadow">
                  {/* IKON DITAMBAHKAN */}
                  <ShoppingCart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-6" strokeWidth={1.5} />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Keranjang Anda Kosong</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Ayo, cari produk favorit Anda!</p>
                  <a
                    href="/products" // Arahkan ke halaman produk
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-all"
                  >
                    Mulai Belanja
                    <ArrowRight className="w-5 h-5" />
                  </a>
                </div>
              )}
            </div>

            {/* --- KOLOM KANAN: RINGKASAN PESANAN (DESKTOP) --- */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 space-y-4">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
                  <FileText className="w-6 h-6" /> {/* <-- IKON DITAMBAHKAN */}
                  Ringkasan Pesanan
                </h2>
                
                {/* BAGIAN BARU: KODE VOUCHER */}
                <div className="pt-4">
                  <label htmlFor="voucher" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <Ticket className="w-5 h-5" />
                    Punya Kode Voucher?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="voucher"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      placeholder="Masukkan kode..."
                      className="w-full px-4 py-2 rounded-lg border text-gray-900 dark:text-white bg-transparent dark:bg-gray-700/30 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                    <button className="px-4 py-2 rounded-lg font-semibold text-purple-600 border border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">
                      Terapkan
                    </button>
                  </div>
                </div>
                {/* Akhir Bagian Voucher */}
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Subtotal ({totalItems} item)</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  {/* DI-HAPUS: Ongkos Kirim */}
                  {/* <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Ongkos Kirim</span>
                    <span className="font-medium">{shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}</span>
                  </div> */}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                  <span>Total Harga</span>
                  {/* DI-UPDATE: Menggunakan grandTotal (yang kini = subtotal) */}
                  <span>{formatPrice(grandTotal)}</span>
                </div>
                <motion.button
                  disabled={selectedItems.length === 0}
                  className="w-full py-4 px-6 rounded-lg font-semibold text-white bg-purple-600 dark:bg-purple-500 transition-all
                             hover:bg-purple-700 dark:hover:bg-purple-600
                             disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={{ scale: selectedItems.length > 0 ? 1.03 : 1 }}
                  whileTap={{ scale: selectedItems.length > 0 ? 0.98 : 1 }}
                >
                  Pesan Sekarang ({selectedItems.length})
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* --- FOOTER: RINGKASAN (MOBILE) --- */}
        {cartItems.length > 0 && (
          <div className="lg:hidden fixed bottom-0 left-0 w-full p-4 bg-white dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-700 shadow-lg-top">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Harga:</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {/* DI-UPDATE: Menggunakan grandTotal */}
                  {formatPrice(grandTotal)}
                </p>
              </div>
              <motion.button
                disabled={selectedItems.length === 0}
                className="py-3 px-6 rounded-lg font-semibold text-white bg-purple-600 transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Pesan ({selectedItems.length})
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartPage;