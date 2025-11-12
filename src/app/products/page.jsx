"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Star, 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  LayoutGrid, 
  List,
  Tag,      // <-- IKON BARU
  Scaling,  // <-- IKON BARU
  Palette   // <-- IKON BARU
} from 'lucide-react';
import HeaderUniversal from '../../../components/HeaderUniversal';
import { ProductCard } from '../../../components/ProductCard';
import Footer from '../../../components/Footer';

// --- DATA PRODUK CONTOH (Tetap) ---
const allProductsData = [
  {
    id: 1,
    name: 'Kemeja Linen Oversized',
    category: 'Kemeja',
    description: 'Kemeja esensial yang ringan dan sejuk.',
    images: [{ src: 'https://placehold.co/600x800/f5f5f5/333?text=Kemeja+Linen', linkedColorName: null }],
    badge: 'New',
    rating: 4.9,
    sold: '1.2k',
    price: 450000,
    originalPrice: 600000,
    sizes: [
      { name: 'S', stock: 0 },
      { name: 'M', stock: 12 },
      { name: 'L', stock: 30 },
      { name: 'XL', stock: 5 },
    ],
    colors: [ { name: 'Putih Gading' }, { name: 'Biru Navy' }, { name: 'Hitam' } ],
  },
  {
    id: 2,
    name: 'Polo Shirt Modern Fit',
    category: 'Kemeja',
    description: 'Tampilan klasik dengan sentuhan modern.',
    images: [{ src: 'https://placehold.co/600x800/e0e0e0/333?text=Polo+Shirt', linkedColorName: null }],
    badge: 'Diskon 20%',
    rating: 4.8,
    sold: '2.4k',
    price: 320000,
    originalPrice: 400000,
    sizes: [
      { name: 'S', stock: 10 },
      { name: 'M', stock: 15 },
      { name: 'L', stock: 20 },
      { name: 'XL', stock: 22 },
    ],
    colors: [ { name: 'Abu-abu' }, { name: 'Biru Navy' } ],
  },
  {
    id: 3,
    name: 'Celana Chino Slim',
    category: 'Celana',
    description: 'Potongan slim-fit yang serbaguna.',
    images: [{ src: 'https://placehold.co/600x800/f0e8e0/333?text=Celana+Chino', linkedColorName: null }],
    badge: null,
    rating: 4.9,
    sold: '3.1k',
    price: 550000,
    originalPrice: null,
    sizes: [
      { name: '28', stock: 10 },
      { name: '30', stock: 10 },
      { name: '32', stock: 0 },
      { name: '34', stock: 13 },
    ],
    colors: [ { name: 'Krem' }, { name: 'Khaki' }, { name: 'Hitam' } ],
  },
  {
    id: 4,
    name: 'Essential Hoodie',
    category: 'Jaket',
    description: 'Hoodie katun tebal untuk kenyamanan.',
    images: [{ src: 'https://placehold.co/600x800/333/eee?text=Hoodie', linkedColorName: null }],
    badge: 'Best Seller',
    rating: 4.7,
    sold: '5.5k',
    price: 650000,
    originalPrice: null,
    sizes: [
      { name: 'M', stock: 10 },
      { name: 'L', stock: 10 },
      { name: 'XL', stock: 5 },
    ],
    colors: [ { name: 'Hitam' }, { name: 'Abu-abu' } ],
  },
  {
    id: 5,
    name: 'Kaos Grafis "Estetik"',
    category: 'Kemeja',
    description: 'Kaos katun premium dengan sablon minimalis.',
    images: [{ src: 'https://placehold.co/600x800/ffffff/333?text=Kaos+Grafis', linkedColorName: null }],
    badge: null,
    rating: 4.6,
    sold: '800',
    price: 250000,
    originalPrice: null,
    sizes: [
      { name: 'S', stock: 10 },
      { name: 'M', stock: 10 },
      { name: 'L', stock: 0 },
    ],
    colors: [ { name: 'Putih Gading' }, { name: 'Hitam' } ],
  },
  {
    id: 6,
    name: 'Celana Jeans "Vintage Wash"',
    category: 'Celana',
    description: 'Jeans potongan lurus dengan "wash" klasik.',
    images: [{ src: 'https://placehold.co/600x800/6082B6/eee?text=Jeans', linkedColorName: null }],
    badge: null,
    rating: 4.8,
    sold: '1.9k',
    price: 720000,
    originalPrice: null,
    sizes: [
      { name: '29', stock: 10 },
      { name: '30', stock: 10 },
      { name: '31', stock: 5 },
      { name: '32', stock: 8 },
    ],
    colors: [ { name: 'Biru Navy' } ],
  },
  // Tambahkan data dummy untuk filter "Show More"
  {
    id: 7,
    name: 'Kemeja Flanel Kotak',
    category: 'Kemeja',
    description: 'Flanel tebal dan lembut.',
    images: [{ src: 'https://placehold.co/600x800/A52A2A/eee?text=Flanel', linkedColorName: null }],
    badge: null,
    rating: 4.8,
    sold: '1.1k',
    price: 480000,
    originalPrice: null,
    sizes: [ { name: 'S', stock: 10 }, { name: 'M', stock: 10 }, { name: 'L', stock: 5 } ],
    colors: [ { name: 'Merah Marun' } ],
  },
  {
    id: 8,
    name: 'Jaket Denim',
    category: 'Jaket',
    description: 'Jaket denim klasik sepanjang masa.',
    images: [{ src: 'https://placehold.co/600x800/00008B/eee?text=Denim+Jacket', linkedColorName: null }],
    badge: null,
    rating: 4.9,
    sold: '4.2k',
    price: 850000,
    originalPrice: null,
    sizes: [ { name: 'S', stock: 10 }, { name: 'M', stock: 10 }, { name: 'L', stock: 5 }, { name: 'XL', stock: 2 } ],
    colors: [ { name: 'Biru Denim' } ],
  },
];

// --- OPSI FILTER STATIS (HANYA SORT) ---
const staticFilterOptions = {
  sort: [
    { value: 'populer', label: 'Paling Populer' },
    { value: 'terbaru', label: 'Terbaru' },
    { value: 'harga-rendah', label: 'Harga: Terendah' },
    { value: 'harga-tinggi', label: 'Harga: Tertinggi' },
  ],
};

// --- HOOK BARU: GENERATE FILTER OTOMATIS ---
const useDynamicFilters = (products) => {
  return useMemo(() => {
    // 1. Ambil semua data
    const allCategories = products.map(p => p.category);
    const allSizes = products.flatMap(p => p.sizes).map(s => s.name);
    const allColors = products.flatMap(p => p.colors).map(c => c.name);

    // 2. Dapatkan nilai unik
    const uniqueCategories = ['Semua', ...new Set(allCategories)];
    const uniqueSizes = [...new Set(allSizes)];
    const uniqueColors = [...new Set(allColors)].sort();
    
    // 3. Sortir ukuran secara logis (S, M, L lalu 28, 30, 32)
    const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL'];
    const sortedUniqueSizes = uniqueSizes.sort((a, b) => {
        const isANumber = /^\d+$/.test(a);
        const isBNumber = /^\d+$/.test(b);
        if (isANumber && !isBNumber) return 1; // Angka setelah huruf
        if (!isANumber && isBNumber) return -1; // Huruf sebelum angka
        if (isANumber && isBNumber) return parseInt(a, 10) - parseInt(b, 10); // Sortir angka
        
        // Sortir huruf berdasarkan sizeOrder
        const aIndex = sizeOrder.indexOf(a);
        const bIndex = sizeOrder.indexOf(b);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return a.localeCompare(b); // Fallback
    });

    return {
      categories: uniqueCategories,
      sizes: sortedUniqueSizes,
      colors: uniqueColors,
    };
  }, [products]); // Hanya dijalankan ulang jika 'products' berubah
};

// --- KOMPONEN CHECKBOX UNTUK FILTER ---
const FilterCheckbox = ({ label, id, checked, onChange }) => (
  <label htmlFor={id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
    />
    <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
  </label>
);

// --- KOMPONEN UTAMA PRODUCTS PAGE ---
const ProductsPage = () => {
  // State untuk filter (tetap)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [sortBy, setSortBy] = useState('populer');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // --- State baru untuk "Show More" ---
  const [showAllSizes, setShowAllSizes] = useState(false);
  const [showAllColors, setShowAllColors] = useState(false);

  // --- Gunakan hook baru untuk mendapatkan opsi filter ---
  const dynamicFilterOptions = useDynamicFilters(allProductsData);
  const sizeLimit = 9; // 3 baris
  const colorLimit = 6;

  // --- LOGIKA FILTER (useMemo tetap) ---
  const filteredProducts = useMemo(() => {
    let products = [...allProductsData];
    // ... (Logika filter dan sorting tidak berubah) ...
    // 1. Filter Pencarian
    if (searchTerm) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // 2. Filter Kategori
    if (selectedCategory !== 'Semua') {
      products = products.filter(p => p.category === selectedCategory);
    }
    // 3. Filter Ukuran
    if (selectedSizes.length > 0) {
      products = products.filter(p => 
        p.sizes.some(s => selectedSizes.includes(s.name) && s.stock > 0)
      );
    }
    // 4. Filter Warna
    if (selectedColors.length > 0) {
      products = products.filter(p => 
        p.colors.some(c => selectedColors.includes(c.name))
      );
    }
    // 5. Sorting
    switch (sortBy) {
      case 'harga-rendah':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'harga-tinggi':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'terbaru':
        products.sort((a, b) => b.id - a.id);
        break;
      case 'populer':
      default:
        const parseSold = (soldStr) => parseFloat(soldStr) * (soldStr.endsWith('k') ? 1000 : 1);
        products.sort((a, b) => parseSold(b.sold) - parseSold(a.sold));
        break;
    }
    return products;
  }, [searchTerm, selectedCategory, selectedSizes, selectedColors, sortBy]);

  // Handler (tetap)
  const handleFilterChange = (setter, value) => {
    setter(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  const resetFilters = () => {
    setSelectedCategory('Semua');
    setSelectedSizes([]);
    setSelectedColors([]);
    setSearchTerm('');
    setShowAllSizes(false);
    setShowAllColors(false);
  };

  // --- Komponen Sidebar (diperbarui) ---
  const FilterSidebarContent = () => {
    // Tentukan item yang terlihat berdasarkan state "Show More"
    const visibleSizes = showAllSizes ? dynamicFilterOptions.sizes : dynamicFilterOptions.sizes.slice(0, sizeLimit);
    const visibleColors = showAllColors ? dynamicFilterOptions.colors : dynamicFilterOptions.colors.slice(0, colorLimit);

    return (
      <div className="flex flex-col space-y-6">
        {/* Filter Kategori (Radio) */}
        <div>
          <h4 className="flex items-center gap-2 font-semibold text-lg text-gray-900 dark:text-white mb-4">
            <Tag className="w-5 h-5" /> {/* <-- IKON DITAMBAHKAN */}
            Kategori
          </h4>
          <div className="space-y-2">
            {/* Menggunakan 'dynamicFilterOptions' */}
            {dynamicFilterOptions.categories.map(category => (
              <label key={category} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value={category}
                  checked={selectedCategory === category}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-5 w-5 border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{category}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Filter Ukuran (Checkbox) */}
        <div>
          <h4 className="flex items-center gap-2 font-semibold text-lg text-gray-900 dark:text-white mb-4">
            <Scaling className="w-5 h-5" /> {/* <-- IKON DITAMBAHKAN */}
            Ukuran
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {/* Menggunakan 'visibleSizes' */}
            {visibleSizes.map(size => (
              <label 
                key={size}
                htmlFor={`size-${size}`} 
                className={`flex items-center justify-center h-12 border rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  selectedSizes.includes(size)
                  ? 'border-purple-600 bg-purple-50 dark:border-purple-400 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 ring-2 ring-purple-300'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-500'
                }`}
              >
                <input
                  type="checkbox"
                  id={`size-${size}`}
                  checked={selectedSizes.includes(size)}
                  onChange={() => handleFilterChange(setSelectedSizes, size)}
                  className="sr-only"
                />
                {size}
              </label>
            ))}
          </div>
          {/* Tombol Show More Ukuran */}
          {dynamicFilterOptions.sizes.length > sizeLimit && (
            <button
              onClick={() => setShowAllSizes(!showAllSizes)}
              className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline mt-3"
            >
              {showAllSizes ? 'Tampilkan lebih sedikit' : `Tampilkan ${dynamicFilterOptions.sizes.length - sizeLimit} lagi`}
            </button>
          )}
        </div>
        
        {/* Filter Warna (Checkbox) */}
        <div>
          <h4 className="flex items-center gap-2 font-semibold text-lg text-gray-900 dark:text-white mb-4">
            <Palette className="w-5 h-5" /> {/* <-- IKON DITAMBAHKAN */}
            Warna
          </h4>
          <div className="space-y-2">
            {/* Menggunakan 'visibleColors' */}
            {visibleColors.map(color => (
              <FilterCheckbox
                key={color}
                id={`color-${color}`}
                label={color}
                checked={selectedColors.includes(color)}
                onChange={() => handleFilterChange(setSelectedColors, color)}
              />
            ))}
          </div>
          {/* Tombol Show More Warna */}
          {dynamicFilterOptions.colors.length > colorLimit && (
            <button
              onClick={() => setShowAllColors(!showAllColors)}
              className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline mt-3"
            >
              {showAllColors ? 'Tampilkan lebih sedikit' : `Tampilkan ${dynamicFilterOptions.colors.length - colorLimit} lagi`}
            </button>
          )}
        </div>

        {/* Tombol Reset */}
        <button
          onClick={resetFilters}
          className="w-full py-3 px-4 rounded-lg font-semibold text-purple-600 dark:text-purple-400 border border-purple-600 dark:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
        >
          Reset Filter
        </button>
      </div>
    );
  }

  return (
    <>
    <HeaderUniversal />
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20"> {/* Dihapus: py-12 md:py-16 */}
      <div className="container mx-auto px-4 md:px-6">
        
        {/* --- HEADER BARU DENGAN GAMBAR --- */}
        <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-12 mt-12">
          {/* Gambar Banner */}
          <img 
            src="https://marketplace.canva.com/EAGHC5NUD-Q/1/0/800w/canva-black-and-white-modern-fashion-sale-banner-landscape-GSB3FcL4_vI.jpg" 
            alt="Banner Koleksi"
            className="w-full h-full object-cover"
          />
          {/* Overlay Gelap */}
          <div className="absolute inset-0 bg-black/50"></div>
          {/* Konten Teks di Tengah */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Semua Produk
            </h1>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto">
              Temukan koleksi pilihan kami, difilter khusus untuk Anda.
            </p>
          </div>
        </div>
        
        {/* --- KONTROL (PENCARIAN, SORT, TOMBOL FILTER HP) --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          {/* Pencarian */}
          <div className="relative w-full md:w-1/2 lg:w-1/3">
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Tombol Filter (Mobile) */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden flex items-center justify-center gap-2 w-full md:w-auto py-3 px-5 rounded-lg font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Filter className="w-5 h-5" />
              <span>Filter</span>
            </button>
            
            {/* Sorting (Dropdown) */}
            <div className="relative w-full md:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none py-3 pl-4 pr-10 rounded-lg font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              >
                {/* Menggunakan 'staticFilterOptions' */}
                {staticFilterOptions.sort.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
        
        {/* --- AREA KONTEN UTAMA (GRID: FILTER + PRODUK) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-20"> {/* Tambah padding bottom */}
          
          {/* --- SIDEBAR FILTER (DESKTOP) --- */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 sticky top-24">
              <FilterSidebarContent />
            </div>
          </aside>
          
          {/* --- GRID PRODUK --- */}
          <main className="lg:col-span-3">
            <AnimatePresence>
              {filteredProducts.length > 0 ? (
                <motion.div 
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8"
                >
                  {filteredProducts.map(product => (
                    <motion.div 
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="h-full"
                    >
                      {/* Ganti <a> dengan <Link> saat di Next.js */}
                      <Link href={`/detailproduct/${product.id}`} className="h-full block">
                        <ProductCard product={product} />
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center text-center py-20 col-span-full"
                >
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Oops!</h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md">
                    Tidak ada produk yang cocok dengan filter Anda. Coba kurangi filter atau cek kembali kata kunci pencarian Anda.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
      
      {/* --- MODAL FILTER (MOBILE) --- */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsFilterOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 w-full max-w-md h-full bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Modal */}
              <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Filter Produk</h3>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Konten Modal */}
              <div className="p-6">
                <FilterSidebarContent />
              </div>

              {/* Footer Modal (Tombol Terapkan) */}
              <div className="p-5 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full py-3 px-5 rounded-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-all"
                >
                  Terapkan Filter
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    <Footer />
    </>
  );
};

export default ProductsPage;