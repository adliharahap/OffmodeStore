"use client";

// DI-UPDATE: Impor useState, AnimatePresence, dan ikon baru
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react';
import HeaderUniversal from '../../../components/HeaderUniversal';
import Footer from '../../../components/Footer';


// --- DATA DIPERBARUI: Lebih kaya untuk modal ---
const lookbookItems = [
  {
    id: 1,
    title: 'Autumn Layers',
    category: 'Outerwear',
    mainImage: 'https://placehold.co/600x800/333/eee?text=Look+1',
    description: 'Padu padan esensial untuk musim gugur. Fokus pada kenyamanan dan siluet yang modern, menggabungkan bahan-bahan premium seperti wol dan katun tebal.',
    gallery: [
      'https://placehold.co/800x1000/333/eee?text=Look+1+Detail+A',
      'https://placehold.co/800x1000/444/eee?text=Look+1+Detail+B',
      'https://placehold.co/800x1000/555/eee?text=Look+1+Detail+C',
    ],
    relatedProducts: [
      { id: 10, name: 'Jaket Wol Korduroi', url: '#' },
      { id: 12, name: 'Celana Kargo Tapered', url: '#' },
    ]
  },
  {
    id: 2,
    title: 'Urban Minimalist',
    category: 'Essentials',
    mainImage: 'https://placehold.co/600x800/5E548E/fff?text=Look+2',
    description: 'Estetika bersih untuk kehidupan kota. Koleksi ini berfokus pada palet warna netral, potongan yang presisi, dan fungsionalitas untuk dipakai sehari-hari.',
    gallery: [
      'https://placehold.co/800x1000/5E548E/fff?text=Look+2+Detail+A',
      'https://placehold.co/800x1000/6a5f9a/fff?text=Look+2+Detail+B',
    ],
    relatedProducts: [
      { id: 1, name: 'Kemeja Linen Oversized', url: '#' },
      { id: 3, name: 'Celana Chino Slim', url: '#' },
    ]
  },
  {
    id: 3,
    title: 'Soft Tailoring',
    category: 'Formal',
    mainImage: 'https://placehold.co/600x800/f0e8e0/333?text=Look+3',
    description: 'Mendefinisikan ulang pakaian formal. Menggunakan bahan yang lebih ringan dan potongan yang lebih rileks, blazer dan celana bahan ini cocok untuk acara semi-formal.',
    gallery: [
      'https://placehold.co/800x1000/f0e8e0/333?text=Look+3+Detail+A',
    ],
    relatedProducts: [
      { id: 20, name: 'Blazer Katun Rileks', url: '#' },
      { id: 21, name: 'Celana Bahan Ankle', url: '#' },
    ]
  },
  {
    id: 4,
    title: 'Weekend Comfort',
    category: 'Loungewear',
    mainImage: 'https://placehold.co/600x800/9F86C0/fff?text=Look+4',
    description: 'Kenyamanan maksimal untuk akhir pekan. Bahan fleece lembut dan katun premium didesain untuk bersantai tanpa mengorbankan gaya.',
    gallery: [
      'https://placehold.co/800x1000/9F86C0/fff?text=Look+4+Detail+A',
      'https://placehold.co/800x1000/b19dcf/333?text=Look+4+Detail+B',
    ],
    relatedProducts: [
      { id: 30, name: 'Hoodie Fleece Premium', url: '#' },
      { id: 31, name: 'Jogger Katun Terstruktur', url: '#' },
    ]
  },
];

// --- VARIAN ANIMASI ---
const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const galleryContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 10 } }
};

const modalBackdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const modalContentVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 30, delay: 0.1 } }
};

// --- KOMPONEN KARTU LOOKBOOK ---
// DI-UPDATE: Menambahkan 'onClick'
const LookCard = ({ item, onClick }) => {
  return (
    <motion.div
      className="group relative w-72 md:w-80 shrink-0 cursor-pointer"
      variants={itemVariants}
      onClick={onClick} // Memanggil fungsi saat diklik
    >
      <div className="block rounded-2xl shadow-md overflow-hidden relative">
        <div className="h-112 md:h-120 overflow-hidden">
          <img
            src={item.mainImage}
            alt={item.title}
            className="w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-110"
          />
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-transparent">
          <div className="absolute bottom-0 left-0 p-6">
            <h3 className="text-2xl font-bold text-white leading-tight">
              {item.title}
            </h3>
            <p className="text-sm text-gray-200 mt-1">
              {item.category}
            </p>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-3">
              <span className="inline-block text-white font-semibold text-sm py-1 border-b-2 border-white">
                Lihat Detail
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- BARU: KOMPONEN MODAL DETAIL ---
const LookbookModal = ({ item, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextSlide = () => {
    setCurrentImageIndex((prev) => (prev === item.gallery.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? item.gallery.length - 1 : prev - 1));
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md"
      variants={modalBackdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose} // Menutup modal saat backdrop diklik
    >
      <motion.div
        className="relative w-full max-w-4xl h-[90vh] max-h-[800px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden"
        variants={modalContentVariants}
        onClick={(e) => e.stopPropagation()} // Mencegah penutupan modal saat konten diklik
      >
        {/* Tombol Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-white/50 dark:bg-black/50 rounded-full text-gray-800 dark:text-white hover:bg-white dark:hover:bg-black"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Kolom Kiri: Galeri Gambar */}
        <div className="w-full md:w-3/5 h-1/2 md:h-full relative overflow-hidden bg-gray-100 dark:bg-gray-900">
          <AnimatePresence initial={false}>
            <motion.img
              key={currentImageIndex}
              src={item.gallery[currentImageIndex]}
              alt={`${item.title} ${currentImageIndex + 1}`}
              className="absolute w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>
          {/* Navigasi Galeri */}
          <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-4">
            <button
              onClick={prevSlide}
              className="w-10 h-10 flex items-center justify-center bg-white/70 dark:bg-black/50 backdrop-blur-sm rounded-full shadow-md transition-all hover:bg-white dark:hover:bg-black/70"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800 dark:text-white" />
            </button>
            <button
              onClick={nextSlide}
              className="w-10 h-10 flex items-center justify-center bg-white/70 dark:bg-black/50 backdrop-blur-sm rounded-full shadow-md transition-all hover:bg-white dark:hover:bg-black/70"
            >
              <ChevronRight className="w-6 h-6 text-gray-800 dark:text-white" />
            </button>
          </div>
          {/* Indikator Poin */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {item.gallery.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>

        {/* Kolom Kanan: Detail Konten */}
        <div className="w-full md:w-2/5 h-1/2 md:h-full p-6 md:p-8 overflow-y-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {item.title}
          </h3>
          <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-4">
            {item.category}
          </p>
          <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            {item.description}
          </p>

          <div className="my-6 border-t border-gray-200 dark:border-gray-700"></div>

          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Produk dalam Look Ini
          </h4>
          <div className="space-y-3">
            {item.relatedProducts.map((product) => (
              <a
                key={product.id}
                href={product.url}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <img
                  src={`https://placehold.co/100x100/f0f0f0/333?text=${product.name.split(' ')[0]}`}
                  alt={product.name}
                  className="w-12 h-12 rounded-md object-cover"
                />
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {product.name}
                </span>
                <ArrowRight className="w-5 h-5 text-gray-500 dark:text-gray-400 ml-auto" />
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- KOMPONEN UTAMA NEW ARRIVALS ---
const NewArrivals = () => {
  // --- BARU: State untuk mengelola modal ---
  const [selectedLook, setSelectedLook] = useState(null);

  return (
    <>
      <HeaderUniversal />
      
      {/* DI-UPDATE: BG, Text disesuaikan untuk Light/Dark */}
      <motion.section
        className="w-full py-20 md:py-32 bg-stone-50 dark:bg-gray-900 text-gray-900 dark:text-white overflow-x-hidden"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                New Arrivals
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg">
                Intip koleksi eksklusif kami yang akan datang. 
                Gaya terbaru yang mendefinisikan musim ini.
              </p>
            </div>
            
            <motion.a
              href="/products"
              className="hidden md:flex items-center gap-2 text-base font-semibold py-2 px-6 rounded-full border-2 
                         border-gray-800/50 text-gray-800
                         dark:border-white/50 dark:text-white
                         hover:bg-gray-800 hover:text-white
                         dark:hover:bg-white dark:hover:text-black transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              Lihat Semua Koleksi
              <ArrowRight className="w-5 h-5" />
            </motion.a>
          </div>

          <motion.div
            className="flex gap-6 md:gap-8 overflow-x-auto pb-10"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            variants={galleryContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="shrink-0 w-1 md:w-4"></div>
            {lookbookItems.map((item) => (
              // DI-UPDATE: Memberi 'onClick' handler
              <LookCard key={item.id} item={item} onClick={() => setSelectedLook(item)} />
            ))}
            <div className="shrink-0 w-1 md:w-4"></div>
          </motion.div>
          
          <style jsx global>{`
            .overflow-x-auto::-webkit-scrollbar { display: none; }
          `}</style>
          
          <div className="mt-10 text-center md:hidden">
            <motion.a
              href="/products"
              className="inline-flex items-center justify-center gap-2 text-base font-semibold py-3 px-8 rounded-full border-2
                         border-gray-800/50 text-gray-800
                         dark:border-white/50 dark:text-white
                         hover:bg-gray-800 hover:text-white
                         dark:hover:bg-white dark:hover:text-black transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              Lihat Semua Koleksi
              <ArrowRight className="w-5 h-5" />
            </motion.a>
          </div>
        </div>
      </motion.section>

      {/* --- BARU: Render Modal --- */}
      <AnimatePresence>
        {selectedLook && (
          <LookbookModal
            item={selectedLook}
            onClose={() => setSelectedLook(null)}
          />
        )}
      </AnimatePresence>
      <Footer />
    </>
  );
};

export default NewArrivals;