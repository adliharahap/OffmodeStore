"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Star, Minus, Plus,
  ShoppingCart, ShoppingBag, Loader2, X, LogIn, CheckCircle, AlertCircle,
  Share2,
  LinkIcon,
  Send
} from "lucide-react";

import { addToCartAction, getCartCount } from "../../../../utils/cartActions";
import FloatingChatButton from "../../../../components/products/FloatingChatButton";
import { setCartCount } from "../../../../store/slice/cartSlice";

// --- ANIMATION VARIANTS (ELEGANT PRESETS) ---
const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 50, damping: 20 }
  }
};

const imageEntrance = {
  hidden: { opacity: 0, x: -30, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const sliderVariants = {
  enter: (direction) => ({ x: direction > 0 ? 1000 : -1000, opacity: 0 }),
  center: { zIndex: 1, x: 0, opacity: 1 },
  exit: (direction) => ({ zIndex: 0, x: direction < 0 ? 1000 : -1000, opacity: 0 })
};

// --- 1. KOMPONEN TOAST (PENGGANTI ALERT) ---
const SimpleToast = ({ show, message, type, onClose }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -20, x: "-50%" }}
          className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-100 px-6 py-3 rounded-full shadow-xl flex items-center gap-3 border ${type === 'success'
            ? 'bg-white border-green-100 text-green-700'
            : 'bg-white border-red-100 text-red-700'
            }`}
        >
          {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium text-sm">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- 2. KOMPONEN WHATSAPP ICON ---
const WhatsappIcon = (props) => (
  <svg
    fill="currentColor"
    viewBox="0 0 16 16"
    className="w-6 h-6"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M11.42 9.49c-.19-.09-1.1-.54-1.27-.61s-.29-.09-.42.1-.48.6-.59.73-.21.14-.4 0a5.13 5.13 0 0 1-1.49-.92 5.25 5.25 0 0 1-1-1.29c-.11-.18 0-.28.08-.38s.18-.21.28-.32a1.39 1.39 0 0 0 .18-.31.38.38 0 0 0 0-.33c0-.09-.42-1-.58-1.37s-.3-.32-.41-.32h-.4a.72.72 0 0 0-.5.23 2.1 2.1 0 0 0-.65 1.55A3.59 3.59 0 0 0 5 8.2 8.32 8.32 0 0 0 8.19 11c.44.19.78.3 1.05.39a2.53 2.53 0 0 0 1.17.07 1.93 1.93 0 0 0 1.26-.88 1.67 1.67 0 0 0 .11-.88c-.05-.07-.17-.12-.36-.21z" />
    <path d="M13.29 2.68A7.36 7.36 0 0 0 8 .5a7.44 7.44 0 0 0-6.41 11.15l-1 3.85 3.94-1a7.4 7.4 0 0 0 3.55.9H8a7.44 7.44 0 0 0 5.29-12.72zM8 14.12a6.12 6.12 0 0 1-3.15-.87l-.22-.13-2.34.61.62-2.28-.14-.23a6.18 6.18 0 0 1 9.6-7.65 6.12 6.12 0 0 1 1.81 4.37A6.19 6.19 0 0 1 8 14.12z" />
  </svg>
);


// --- 3. KOMPONEN SHARE MODAL ---
const ShareModal = ({ isVisible, onClose, productUrl, productName }) => {
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const shareText = `Lihat produk ini: ${productName}. Cek di sini: ${productUrl}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(productUrl).then(() => {
        triggerToast("Tautan berhasil disalin!", "success");
        onClose();
      }).catch(err => {
        triggerToast("Gagal menyalin tautan.", "error");
      });
    } else {
      triggerToast("Browser Anda tidak mendukung fitur salin otomatis.", "error");
    }
  };

  const handleWebShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Bagikan ${productName}`,
        text: shareText,
        url: productUrl,
      })
      .then(() => onClose())
      .catch((error) => {
          if (error.name !== 'AbortError') {
              triggerToast("Gagal membagikan. Mungkin dibatalkan.", "error");
          }
      });
    } else {
        // Fallback for browsers without Web Share API
        triggerToast("Web Share API tidak tersedia. Silakan gunakan opsi Salin Tautan.", "error");
    }
  };

  const ShareButton = ({ icon: Icon, text, onClick, colorClass, isLink = false, href = "#" }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="w-full"
    >
      {isLink ? (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`flex items-center justify-start gap-4 p-4 rounded-xl font-semibold transition-all ${colorClass} text-white shadow-lg`}
        >
          <Icon className="w-6 h-6" />
          <span>{text}</span>
        </a>
      ) : (
        <button
          onClick={onClick}
          className={`w-full flex items-center justify-start gap-4 p-4 rounded-xl font-semibold transition-all ${colorClass} text-white shadow-lg`}
        >
          <Icon className="w-6 h-6" />
          <span>{text}</span>
        </button>
      )}
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <SimpleToast show={toast.show} message={toast.message} type={toast.type} />

            <div className="flex justify-between items-center mb-6 border-b pb-3 border-gray-100 dark:border-white/5">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Bagikan Produk
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Opsi 1: Salin Tautan */}
              <ShareButton
                icon={LinkIcon}
                text="Salin Tautan"
                onClick={handleCopyLink}
                colorClass="bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
              />
              
              {/* Opsi 2: WhatsApp */}
              <ShareButton
                icon={WhatsappIcon}
                text="WhatsApp"
                isLink={true}
                href={whatsappUrl}
                colorClass="bg-[#25D366] hover:bg-[#1DA851]"
              />

              {/* Opsi 3: Web Share API / Lainnya */}
              <ShareButton
                icon={Send}
                text="Opsi Lainnya (Web Share)"
                onClick={handleWebShare}
                colorClass="bg-purple-600 hover:bg-purple-700"
              />
            </div>
            
            <p className="text-xs text-center text-gray-400 dark:text-gray-600 mt-6">
                URL Produk: {productUrl.substring(0, 30)}...
            </p>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- HELPER ---
const variants = {
  enter: (direction) => ({ x: direction > 0 ? 1000 : -1000, opacity: 0 }),
  center: { zIndex: 1, x: 0, opacity: 1 },
  exit: (direction) => ({ zIndex: 0, x: direction < 0 ? 1000 : -1000, opacity: 0 })
};

const formatPrice = (value) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

// --- KOMPONEN UTAMA ---
const DetailProduct = ({ product }) => {
  const { user, isLoading: isAuthLoading } = useSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();

  // State Slide & Pilihan
  const [[page, direction], setPage] = useState([0, 0]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [currentUrl, setCurrentUrl] = useState('');

  // State UI Interaction
  const [isAddToCartLoading, setIsAddToCartLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false); // New state for Share Modal


  // State Toast Notification
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const imageIndex = ((page % product.images.length) + product.images.length) % product.images.length;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  // --- FUNGSI TOAST TRIGGER ---
  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000); // Hilang otomatis 3 detik
  };

  // --- LOGIKA SLIDER ---
  const paginate = (newDirection) => setPage([page + newDirection, newDirection]);
  const goToSlide = (slideIndex) => {
    const newDirection = slideIndex > imageIndex ? 1 : (slideIndex < imageIndex ? -1 : 0);
    setPage([slideIndex, newDirection]);
  };
  const handleDragEnd = (e, { offset, velocity }) => {
    const swipeThreshold = 10000;
    const swipePower = Math.abs(offset.x) * velocity.x;
    if (swipePower < -swipeThreshold) paginate(1);
    else if (swipePower > swipeThreshold) paginate(-1);
  };

  const handleSizeSelect = (sizeName) => {
    const variantToCheck = product.variants.find(
      v => v.color_name === selectedColor && v.size_name === sizeName
    );

    if (variantToCheck && variantToCheck.stock > 0) {
      setSelectedSize(sizeName);
      setQuantity(1);
    } else {
      triggerToast("Stok habis untuk varian warna ini", "error");
    }
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color.name);
    goToSlide(color.mainImageIndex);
  };

  useEffect(() => {
    const currentImage = product.images[imageIndex];
    if (currentImage && currentImage.linkedColorName && selectedColor !== currentImage.linkedColorName) {
      setSelectedColor(currentImage.linkedColorName);
    }
  }, [imageIndex, product.images, selectedColor]);

  const activeVariant = product.variants.find(
    (v) => v.color_name === selectedColor && v.size_name === selectedSize
  );

  // --- LOGIKA STOCK ---
  const getSelectedStock = () => {
    if (!selectedSize) return 'Pilih ukuran';
    // Ambil stok dari activeVariant, bukan dari product.sizes
    return activeVariant ? `Stok: ${activeVariant.stock}` : 'Stok: 0';
  };
  const canIncreaseQuantity = () => {
    // Validasi berdasarkan stok variant spesifik
    if (!activeVariant) return false;
    return quantity < activeVariant.stock;
  };

  // --- LOGIKA ADD TO CART (FIXED) ---
  const handleAddToCart = async () => {
    // 1. Validasi Ukuran (Ganti Alert dengan Toast)
    if (!selectedSize) {
      triggerToast("Harap pilih ukuran terlebih dahulu!", "error");
      return;
    }

    // 2. Validasi Login Client-Side
    if (!isAuthLoading && !user) {
      setShowLoginModal(true);
      return;
    }

    setIsAddToCartLoading(true);

    try {
      // 3. Cari Variant
      const targetVariant = product.variants.find(
        v => v.color_name === selectedColor && v.size_name === selectedSize
      );

      if (!targetVariant) {
        triggerToast("Varian tidak ditemukan / Stok habis.", "error");
        setIsAddToCartLoading(false);
        return;
      }

      // 4. Panggil Server Action
      const result = await addToCartAction(targetVariant.id, quantity);

      if (result.success) {
        triggerToast("Berhasil masuk keranjang!", "success");

        const latestCount = await getCartCount();
        // Update state global (Header akan otomatis berubah)
        dispatch(setCartCount(latestCount));
      } else {
        // --- PENGECEKAN KHUSUS PESAN LOGIN ---
        // Jika server merespon "Silakan login...", berarti cookie server expired/missing
        // meskipun di client Redux masih ada user. Kita tangkap ini.
        if (result.message.toLowerCase().includes("login")) {
          setShowLoginModal(true);
        } else {
          triggerToast(result.message, "error");
        }
      }

    } catch (error) {
      console.error(error);
      triggerToast("Gagal menghubungi server.", "error");
    } finally {
      setIsAddToCartLoading(false);
    }
  };

  const handleBuyNow = () => {
    // 1. Validasi Ukuran
    if (!selectedSize) {
      triggerToast("Harap pilih ukuran terlebih dahulu!", "error");
      return;
    }

    // 2. Validasi Login Client-Side
    if (!isAuthLoading && !user) {
      setShowLoginModal(true);
      return;
    }

    // 3. Cari Variant
    const targetVariant = product.variants.find(
      v => v.color_name === selectedColor && v.size_name === selectedSize
    );

    if (!targetVariant) {
      triggerToast("Varian tidak ditemukan / Stok habis.", "error");
      return;
    }

    if (targetVariant.stock < quantity) {
      triggerToast(`Stok tidak cukup. Tersedia: ${targetVariant.stock}`, "error");
      return;
    }

    // 4. Redirect Langsung ke Checkout
    // Kita kirim variantId, quantity, dan mode='direct'
    router.push(`/checkout?variantId=${targetVariant.id}&quantity=${quantity}&mode=direct`);
  };

  const chatProductData = {
    name: product.name,
    productUrl: currentUrl,
    price: formatPrice(product.price),
    storeName: "OffMode Store", // Ganti dengan nama toko Anda
    whatsappNumber: "6285275437848", // Nomor WA sesuai permintaan (format 62...)
    email: "callmeyuyun6@gmail.com" // Ganti dengan email toko Anda
  };

  // 2. Tentukan harga display
  // Jika user sudah pilih size & color (activeVariant ketemu), pakai harga variant tersebut.
  // Jika belum pilih size (activeVariant null), pakai harga default (product.price).
  const displayPrice = activeVariant ? activeVariant.price : product.price;

  // 3. Tentukan harga coret (original price)
  // Sama logikanya, ambil dari variant jika ada, atau default jika tidak.
  const displayOriginalPrice = activeVariant
    ? activeVariant.original_price
    : product.originalPrice;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="py-20 min-h-screen bg-stone-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors duration-500 font-sans">
      <FloatingChatButton product={chatProductData} />

      {/* Render Toast Component */}
      <SimpleToast show={toast.show} message={toast.message} type={toast.type} />

      {/* Background Noise */}
      {/* <div className=" inset-0 opacity-[0.03] dark:opacity-[0.03] pointer-events-none z-0 fixed mix-blend-multiply dark:mix-blend-normal" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}>
      </div> */}

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* IMAGE SECTION */}
          <motion.div variants={imageEntrance} className="w-full flex flex-col gap-4">
            <div className="relative aspect-square w-full max-w-lg mx-auto lg:max-w-none lg:mx-0 flex-1 overflow-hidden rounded-2xl shadow-lg bg-white dark:bg-gray-950">
              <AnimatePresence initial={false} custom={direction}>
                <motion.img
                  key={page}
                  src={product.images[imageIndex]?.src || 'https://placehold.co/600x600?text=No+Image'}
                  alt={`${product.name}`}
                  className="absolute w-full h-full object-cover"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={handleDragEnd}
                />
              </AnimatePresence>
              <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-4 z-20">
                <button onClick={() => paginate(-1)} className="hidden md:flex items-center justify-center w-10 h-10 bg-white/70 dark:bg-black/50 backdrop-blur-sm rounded-full shadow-md transition-all hover:bg-white"><ChevronLeft className="w-6 h-6 text-gray-800 dark:text-white" /></button>
                <button onClick={() => paginate(1)} className="hidden md:flex items-center justify-center w-10 h-10 bg-white/70 dark:bg-black/50 backdrop-blur-sm rounded-full shadow-md transition-all hover:bg-white"><ChevronRight className="w-6 h-6 text-gray-800 dark:text-white" /></button>
              </div>
            </div>
            <div className="flex flex-row flex-nowrap overflow-x-auto justify-center gap-3 mt-4">
              {product.images.map((img, idx) => (
                <button key={idx} onClick={() => goToSlide(idx)} className={`shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${idx === imageIndex ? 'border-purple-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                  <img src={img.src} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* INFO SECTION */}
          <div className="w-full max-w-lg mx-auto lg:max-w-none lg:mx-0 flex flex-col gap-6">

            {/* Title & Price */}
            <motion.div variants={fadeInUp}>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold uppercase tracking-wide">{product.is_new_arrival ? "New Arrival" : product.badge}</span>
                {product.rating && (
                  <div className="flex items-center gap-1 text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                    <Star size={14} fill="currentColor" /> {product.rating}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl md:text-5xl font-serif font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
                  {product.name}
                </h1>
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="p-2 ml-4 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 rounded-full bg-gray-100 dark:bg-white/5"
                  aria-label="Bagikan Produk"
                >
                  <Share2 size={24} />
                </button>
              </div>

              <div className="flex items-baseline gap-4 mt-2">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={displayPrice}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400"
                  >
                    {formatPrice(displayPrice)}
                  </motion.span>
                </AnimatePresence>

                {displayOriginalPrice > displayPrice && (
                  <span className="text-xl text-gray-400 line-through decoration-gray-400/50">
                    {formatPrice(displayOriginalPrice)}
                  </span>
                )}
              </div>
            </motion.div>

            {/* Description Short */}
            <motion.p variants={fadeInUp} className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg border-l-4 border-purple-200 dark:border-purple-800 pl-4 italic">
              "{product.description}"
            </motion.p>

            <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>

            {/* Pilihan Warna */}
            <motion.div variants={fadeInUp}>
              <label className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 block">
                Pilih Warna: <span className="text-gray-900 dark:text-white ml-1 font-extrabold">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => handleColorSelect(color)}
                    className={`group relative flex items-center gap-3 p-2 pr-4 rounded-xl border-2 transition-all duration-300 ${selectedColor === color.name
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-transparent bg-gray-100 dark:bg-gray-950 hover:border-purple-300 dark:hover:border-purple-600'
                      }`}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 shadow-sm ring-1 ring-black/5">
                      <img src={color.thumbnail} alt={color.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    </div>
                    <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{color.name}</span>
                    {selectedColor === color.name && (
                      <motion.div layoutId="colorCheck" className="absolute -top-2 -right-2 bg-purple-600 text-white rounded-full p-0.5">
                        <CheckCircle size={14} />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Pilihan Ukuran */}
            <motion.div variants={fadeInUp}>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Pilih Ukuran</label>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${activeVariant && activeVariant.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                  {getSelectedStock()}
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((sizeItem) => {
                  const variantForThisSize = product.variants.find(
                    v => v.color_name === selectedColor && v.size_name === sizeItem.name
                  );
                  // Simulasi stok untuk demo jika varian tidak lengkap di mock
                  const realStock = variantForThisSize ? variantForThisSize.stock : 10;
                  const isOutOfStock = realStock === 0;
                  const isSelected = selectedSize === sizeItem.name;

                  return (
                    <button
                      key={sizeItem.name}
                      onClick={() => handleSizeSelect(sizeItem.name)}
                      disabled={isOutOfStock}
                      className={`
                        relative w-14 h-14 rounded-2xl text-sm font-bold transition-all duration-200 flex items-center justify-center
                        ${isOutOfStock
                          ? 'bg-gray-100 text-gray-300 cursor-not-allowed border border-transparent dark:bg-slate-950 dark:text-slate-600'
                          : isSelected
                            ? 'bg-gray-900 text-white dark:bg-slate-100 dark:text-gray-900 shadow-xl scale-110'
                            : 'bg-white dark:bg-slate-950 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700 hover:border-purple-500'
                        }
                      `}
                    >
                      {sizeItem.name}
                      {isOutOfStock && <div className="absolute w-full h-px bg-gray-300 -rotate-45"></div>}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Kuantitas */}
            <motion.div variants={fadeInUp}>
              <label className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 block">Jumlah</label>
              <div className="flex items-center w-fit bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1} className="p-3.5 text-gray-600 dark:text-gray-400 hover:text-purple-600 disabled:opacity-30 transition-colors"><Minus className="w-5 h-5" /></button>
                <span className="w-12 text-center text-lg font-bold">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} disabled={!canIncreaseQuantity()} className="p-3.5 text-gray-600 dark:text-gray-400 hover:text-purple-600 disabled:opacity-30 transition-colors"><Plus className="w-5 h-5" /></button>
              </div>
            </motion.div>

            {/* Tombol Aksi */}
            {/* Action Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
              <motion.button
                onClick={handleAddToCart}
                disabled={isAddToCartLoading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-gray-900 bg-white border-2 border-gray-200 hover:border-gray-900 dark:hover:bg-gray-900/20 dark:bg-slate-950 dark:text-white dark:border-slate-600 dark:hover:border-white transition-all shadow-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isAddToCartLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
                <span>+ Keranjang</span>
              </motion.button>

              <motion.button
                onClick={handleBuyNow}
                className="flex-[1.5] flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-white bg-gray-900 dark:bg-purple-600 hover:bg-black dark:hover:bg-purple-700 shadow-xl shadow-gray-200 dark:shadow-purple-900/20 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Beli Sekarang</span>
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Deskripsi Bawah */}
        <div className="mt-24 border-t border-gray-200 dark:border-white/10 pt-10">
          <div className="flex gap-8 mb-8 border-b border-gray-200 dark:border-white/10 pb-1">
            {['description', 'specs', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-purple-600 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
              >
                {tab}
                {activeTab === tab && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-white" />}
              </button>
            ))}
          </div>

          <div className="min-h-[200px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'description' && (
                  <div className="prose dark:prose-invert max-w-3xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    <p>{product.fullDescription}</p>
                  </div>
                )}
                {activeTab === 'specs' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                    {product.specifications.map(spec => (
                      <div key={spec.name} className="flex justify-between py-3 border-b border-gray-100 dark:border-white/5">
                        <span className="font-bold text-gray-900 dark:text-white">{spec.name}</span>
                        <span className="text-gray-500 dark:text-gray-400">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    {/* STATISTIK REVIEW (HEADER) */}
                    <div className="flex items-center gap-4 mb-8 bg-gray-50 dark:bg-white/5 p-6 rounded-2xl border border-gray-100 dark:border-white/5">
                      <div className="text-center px-4 border-r border-gray-200 dark:border-gray-700">
                        <span className="text-5xl font-black text-gray-900 dark:text-white block">{product.rating || 0}</span>
                        <div className="flex gap-1 justify-center my-2 text-yellow-400">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} size={16} fill={star <= Math.round(product.rating || 0) ? "currentColor" : "none"} className={star <= Math.round(product.rating || 0) ? "" : "text-gray-300 dark:text-gray-600"} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">{product.reviews?.length || 0} Ulasan</span>
                      </div>
                      <div className="flex-1 pl-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                          "Pendapat pelanggan tentang produk ini."
                        </p>
                      </div>
                    </div>

                    {/* LIST REVIEW */}
                    {product.reviews && product.reviews.length > 0 ? (
                      <div className="grid gap-4">
                        {product.reviews.map((review) => (
                          <div key={review.id} className="p-6 rounded-2xl bg-white border border-gray-100 dark:bg-white/5 dark:border-white/5 shadow-sm">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={review.user.avatar}
                                  alt={review.user.name}
                                  className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                                />
                                <div>
                                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">{review.user.name}</h4>
                                  <span className="text-xs text-gray-400">
                                    {new Date(review.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-0.5 text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-lg">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-300/50"} />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                              "{review.comment}"
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                          <Star size={24} />
                        </div>
                        <p className="text-gray-500 font-medium">Belum ada ulasan.</p>
                        <p className="text-xs text-gray-400 mt-1">Jadilah yang pertama mengulas produk ini!</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* --- MODAL LOGIN --- */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-950 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center relative overflow-hidden"
            >
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>

              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Login Diperlukan
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Anda harus login terlebih dahulu untuk menambahkan barang ke keranjang belanja.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Batal
                </button>
                <Link href="/login" className="flex-1">
                  <button className="w-full py-2.5 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20">
                    Login Sekarang
                  </button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ShareModal 
        isVisible={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        productUrl={currentUrl}
        productName={product.name}
      />
    </motion.div>
  );
};

export default DetailProduct;