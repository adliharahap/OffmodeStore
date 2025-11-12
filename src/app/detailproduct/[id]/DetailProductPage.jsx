"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Minus, Plus, ShoppingCart, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import FloatingChatButton from "../../../../components/products/FloatingChatButton";

// 3. VARIAN ANIMASI (Tetap) ---
const variants = {
  enter: (direction) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

// 4. HELPER FORMAT HARGA (Tetap)
const formatPrice = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
};


const DetailProduct = ({ product }) => {
  const [[page, direction], setPage] = useState([0, 0]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(product.colors[0].name); // Default ke warna pertama
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  
  const imageIndex = ((page % product.images.length) + product.images.length) % product.images.length;

  const paginate = (newDirection) => {
    setPage([page + newDirection, newDirection]);
  };
  
  const goToSlide = (slideIndex) => {
    const newDirection = slideIndex > imageIndex ? 1 : (slideIndex < imageIndex ? -1 : 0);
    setPage([slideIndex, newDirection]);
  };

  const handleDragEnd = (e, { offset, velocity }) => {
    const swipeThreshold = 10000;
    const swipePower = Math.abs(offset.x) * velocity.x;

    if (swipePower < -swipeThreshold) {
      paginate(1);
    } else if (swipePower > swipeThreshold) {
      paginate(-1);
    }
  };
  
  const handleSizeSelect = (size) => {
    if (size.stock > 0) {
      setSelectedSize(size.name);
      setQuantity(1); 
    }
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color.name);
    goToSlide(color.mainImageIndex);
  };

  // --- LOGIKA BARU: SINKRONISASI CAROUSEL KE KARTU WARNA ---
  useEffect(() => {
    // Ambil gambar yang sedang aktif di carousel
    const currentImage = product.images[imageIndex];

    // Cek apakah gambar ini punya kaitan nama warna
    if (currentImage && currentImage.linkedColorName) {
      // Jika ya, dan warnanya belum terpilih, update state-nya
      if (selectedColor !== currentImage.linkedColorName) {
        setSelectedColor(currentImage.linkedColorName);
      }
    }
    // Jika 'linkedColorName' adalah null (gambar umum),
    // kita biarkan 'selectedColor' tetap pada nilainya.
    // Ini agar pilihan warna tidak hilang saat melihat gambar umum.
    
  }, [imageIndex, product.images, selectedColor]); // Pantau perubahan index gambar

  const getSelectedStock = () => {
    if (!selectedSize) return 'Pilih ukuran';
    const size = product.sizes.find(s => s.name === selectedSize);
    return size ? `Stok: ${size.stock}` : 'Stok: 0';
  };
  
  const canIncreaseQuantity = () => {
    if (!selectedSize) return false;
    const size = product.sizes.find(s => s.name === selectedSize);
    return size && quantity < size.stock;
  };

  const canDecreaseQuantity = () => {
    return quantity > 1;
  };

  // --- JSX (Return) dari DetailProduct ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 md:py-20 mt-10">
    <FloatingChatButton />
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* --- KOLOM KIRI: CAROUSEL GAMBAR --- */}
          <div className="w-full flex flex-col gap-4">
            <div className="relative aspect-square w-full max-w-lg mx-auto lg:max-w-none lg:mx-0 flex-1 overflow-hidden rounded-2xl shadow-lg bg-white dark:bg-gray-800">
              <AnimatePresence initial={false} custom={direction}>
                <motion.img
                  key={page}
                  // DIPERBARUI: Mengambil 'src' dari object
                  src={product.images[imageIndex].src} 
                  alt={`${product.name} ${imageIndex + 1}`}
                  className="absolute w-full h-full object-cover"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={handleDragEnd}
                />
              </AnimatePresence>
              
              <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-4 z-20">
                <button
                  onClick={() => paginate(-1)}
                  className="hidden md:flex items-center justify-center w-10 h-10 bg-white/70 dark:bg-black/50 backdrop-blur-sm rounded-full shadow-md transition-all hover:bg-white dark:hover:bg-black/70"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-800 dark:text-white" />
                </button>
                <button
                  onClick={() => paginate(1)}
                  className="hidden md:flex items-center justify-center w-10 h-10 bg-white/70 dark:bg-black/50 backdrop-blur-sm rounded-full shadow-md transition-all hover:bg-white dark:hover:bg-black/70"
                >
                  <ChevronRight className="w-6 h-6 text-gray-800 dark:text-white" />
                </button>
              </div>
            </div>
            
            {/* Galeri Thumbnail */}
            <div className="flex flex-row flex-nowrap overflow-x-auto justify-center gap-3 mt-4">
              {product.images.map((img, idx) => ( // 'img' sekarang adalah object
                <button
                  key={idx} // Key bisa tetap index
                  onClick={() => goToSlide(idx)}
                  className={`shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === imageIndex
                      ? 'border-purple-600 dark:border-purple-400 opacity-100'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  {/* DIPERBARUI: Mengambil 'src' dari object */}
                  <img src={img.src} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
          
          {/* --- KOLOM KANAN: INFO PRODUK --- */}
          <div className="w-full max-w-lg mx-auto lg:max-w-none lg:mx-0">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              {product.name}
            </h1>
            
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                <span className="font-semibold text-gray-800 dark:text-white">{product.rating}</span>
                <span className="ml-1">Penilaian</span>
              </div>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
              <span>{product.sold} terjual</span>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              {product.description}
            </p>

            <div className="mb-6">
              <label className="text-base font-semibold text-gray-900 dark:text-white mb-3 block">
                Warna: <span className="font-normal text-gray-600 dark:text-gray-400">{selectedColor}</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => handleColorSelect(color)}
                    title={color.name}
                    className={`flex items-center w-full p-2 rounded-lg border-2 transition-all duration-200 ${
                      selectedColor === color.name 
                        ? 'border-purple-600 dark:border-purple-400 ring-2 ring-purple-300 dark:ring-purple-500/50 bg-purple-50 dark:bg-purple-900/20' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-md overflow-hidden mr-3 shrink-0">
                      <img src={color.thumbnail} alt={color.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-200 text-left">
                      {color.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-baseline mb-3">
                <label className="text-base font-semibold text-gray-900 dark:text-white">Ukuran:</label>
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  {getSelectedStock()}
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => handleSizeSelect(size)}
                    disabled={size.stock === 0}
                    className={`flex items-center justify-center min-w-12 h-12 px-4 border rounded-lg text-sm font-semibold transition-all ${
                      size.stock === 0
                        ? 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed line-through'
                        : selectedSize === size.name
                        ? 'border-purple-600 bg-purple-50 dark:border-purple-400 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 ring-2 ring-purple-300 dark:ring-purple-500/50'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer'
                    }`}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-8">
              <label className="text-base font-semibold text-gray-900 dark:text-white mb-3 block">Kuantitas:</label>
              <div className="flex items-center w-fit border border-gray-300 dark:border-gray-600 rounded-lg">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={!canDecreaseQuantity()}
                  className="px-4 py-3 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-6 py-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  disabled={!canIncreaseQuantity()}
                  className="px-4 py-3 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold border border-purple-600 dark:border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 transition-all hover:bg-purple-100 dark:hover:bg-purple-900/50"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <ShoppingCart className="w-5 h-5" />
                Tambah ke Belanja
              </motion.button>
              <motion.button
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold text-white bg-purple-600 dark:bg-purple-500 transition-all hover:bg-purple-700 dark:hover:bg-purple-600"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <ShoppingBag className="w-5 h-5" />
                Pesan Sekarang
              </motion.button>
            </div>
          </div>
        </div>

        {/* --- DESKRIPSI LENGKAP & SPESIFIKASI --- */}
        <div className="w-full max-w-5xl mx-auto mt-16 pt-12 border-t border-gray-200 dark:border-gray-700">
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
            <button
              onClick={() => setActiveTab('description')}
              className={`py-3 px-6 text-base md:text-lg font-semibold transition-colors ${
                activeTab === 'description'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Deskripsi Lengkap
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`py-3 px-6 text-base md:text-lg font-semibold transition-colors ${
                activeTab === 'specs'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Spesifikasi Produk
            </button>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="max-w-none"
            >
              {activeTab === 'description' && (
                <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
                  <p>{product.fullDescription}</p>
                </div>
              )}
              {activeTab === 'specs' && (
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {product.specifications.map((spec) => (
                    <div key={spec.name} className="border-b border-gray-200 dark:border-gray-700 pb-3">
                      <dt className="font-semibold text-gray-900 dark:text-white">{spec.name}</dt>
                      <dd className="text-gray-600 dark:text-gray-400 mt-1">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default DetailProduct;