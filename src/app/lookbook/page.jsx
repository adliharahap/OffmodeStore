"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, ChevronLeft, ChevronRight, Eye, Sparkles, ShoppingBag, Sun, Moon, ArrowUpRight } from 'lucide-react';
import HeaderUniversal from '../../../components/Header';
import Footer from '../../../components/Footer';
import { getLookbooks } from '../../../utils/outlookAction';
import Link from 'next/link';

// --- VARIAN ANIMASI DIPERBAIKI ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Jeda antar kartu
      delayChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

// --- KOMPONEN KARTU LOOKBOOK (RE-DESIGN) ---
const LookCard = ({ item, onClick }) => {
  return (
    <motion.div
      variants={cardVariants}
      className="relative flex-none w-[280px] md:w-[340px] snap-center group cursor-pointer"
      onClick={onClick}
    >
      {/* Image Wrapper */}
      <div className="relative aspect-3/4 overflow-hidden rounded-xl bg-gray-200 dark:bg-[#1a1a1a]">
        <img
          src={item?.mainImage}
          alt={item?.title}
          className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-95 group-hover:opacity-100"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-80 transition-opacity duration-300" />

        {/* Floating Button */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
          <div className="bg-white/20 backdrop-blur-md border border-white/20 text-white p-2.5 rounded-full shadow-xl hover:bg-white hover:text-black transition-colors">
            <Eye size={18} />
          </div>
        </div>

        {/* Content - Always visible text at bottom */}
        <div className="absolute bottom-0 left-0 w-full p-6 pt-12">
          <p className="text-xs font-bold tracking-[0.2em] text-purple-300 uppercase mb-2 opacity-90 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            {item?.category || 'Collection'}
          </p>
          <div className="flex items-end justify-between">
             <h3 className="text-2xl font-serif font-bold text-white leading-none group-hover:text-purple-100 transition-colors">
               {item?.title}
             </h3>
             <ArrowUpRight className="text-white opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- MODAL DETAIL (DIPERBAIKI & DIPERCANTIK) ---
const LookbookModal = ({ item, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = [item.mainImage, ...(item.gallery || [])].filter(Boolean);

  const navigate = (direction) => {
    if (direction === 'next') {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    } else {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') navigate('next');
      if (e.key === 'ArrowLeft') navigate('prev');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#111] w-full max-w-6xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative border border-gray-200 dark:border-white/10"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-black dark:text-white rounded-full transition-colors backdrop-blur-md"
        >
          <X size={20} />
        </button>

        {/* IMAGE SECTION */}
        <div className="w-full md:w-3/5 h-[40vh] md:h-[80vh] bg-gray-100 dark:bg-[#050505] relative group flex items-center justify-center">
          <AnimatePresence mode='wait'>
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              alt="Detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>

          {images.length > 1 && (
            <>
              <button onClick={() => navigate('prev')} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"><ChevronLeft size={24} /></button>
              <button onClick={() => navigate('next')} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"><ChevronRight size={24} /></button>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {images.map((_, idx) => (
                  <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* INFO SECTION */}
        <div className="w-full md:w-2/5 p-8 md:p-10 overflow-y-auto bg-white dark:bg-[#111]">
          <div className="space-y-8">
            <div>
              <span className="text-purple-600 dark:text-purple-400 font-bold tracking-[0.2em] text-xs uppercase">
                {item.category}
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mt-3 mb-4 text-gray-900 dark:text-white">{item.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                {item.description || "Deskripsi detail tidak tersedia."}
              </p>
            </div>

            <div className="h-px w-full bg-gray-100 dark:bg-white/10" />

            <div>
              <h3 className="font-bold text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-6">In This Look</h3>
              <div className="space-y-3">
                {item.relatedProducts?.length > 0 ? (
                  item.relatedProducts.map((prod, idx) => (
                    <Link key={idx} href={prod.url || '#'} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/20">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                        <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors font-serif">{prod.name}</h4>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">View Product</p>
                      </div>
                      <div className="p-2 bg-gray-100 dark:bg-white/10 rounded-full group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                        <ArrowRight size={16} className="text-gray-600 dark:text-white group-hover:text-purple-600" />
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic">Produk terkait tidak tersedia.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- MAIN COMPONENT ---
const NewArrivals = () => {
  const [lookbookData, setLookbookData] = useState([]);
  const [selectedLook, setSelectedLook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ref untuk scroll container agar kita bisa mengontrol scroll jika perlu
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getLookbooks();
        // Fallback jika data kosong atau error, biar UI tidak hancur saat dev
        setLookbookData(data || []);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white flex flex-col font-sans transition-colors duration-500">
      <HeaderUniversal />

      {/* Background Noise */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.03] pointer-events-none z-0 mix-blend-multiply dark:mix-blend-normal" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}>
      </div>

      <main className="grow relative z-10">
        <section className="relative py-20 md:py-32 overflow-hidden">

          <div className="container mx-auto px-6 md:px-10 max-w-[1400px]">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="max-w-2xl"
              >
                <span className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold tracking-[0.2em] text-xs uppercase mb-4">
                  <Sparkles size={14} /> Season 2025
                </span>
                <h1 className="text-5xl md:text-7xl font-serif font-bold leading-[0.95] mb-6 text-gray-900 dark:text-white">
                  The Lookbook
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 border-l border-gray-300 dark:border-gray-700 pl-6 max-w-lg">
                  Narasi visual dari koleksi terbaru kami. Eksplorasi gaya yang mendefinisikan karakter dan estetika modern.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Link href="/products" className="group flex items-center gap-3 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full font-bold text-sm transition-all hover:pr-10 shadow-lg hover:shadow-xl">
                  Shop Full Collection
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>

            {/* Gallery / Carousel Section */}
            <div className="relative">
              {isLoading ? (
                <div className="flex gap-6 overflow-hidden">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-[280px] md:w-[340px] aspect-3/4 bg-gray-200 dark:bg-white/5 rounded-xl animate-pulse shrink-0" />
                  ))}
                </div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }} 
                  ref={scrollContainerRef}
                  className="flex gap-6 overflow-x-auto pb-12 snap-x snap-mandatory scroll-smooth hide-scrollbar px-1"
                >
                  {lookbookData.map((item) => (
                    <LookCard
                      key={item.id}
                      item={item}
                      onClick={() => setSelectedLook(item)}
                    />
                  ))}
                </motion.div>
              )}
            </div>

          </div>

          {/* --- PROMOTIONAL SPLIT BANNER (Dark Editorial Style) --- */}
          <div className="container mx-auto px-6 md:px-10 max-w-[1400px] mt-20">
            <div className="relative overflow-hidden rounded-3xl bg-[#111] border border-gray-200 dark:border-white/10 shadow-2xl isolate">
              
              {/* Background Effects */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/30 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/30 rounded-full blur-[120px]"></div>
                <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
                
                {/* Text Content */}
                <div className="flex flex-col justify-center p-10 md:p-16 lg:p-20 z-10 order-2 lg:order-1">
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true }} 
                    transition={{ duration: 0.8 }}
                  >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-bold text-purple-300 mb-6 uppercase tracking-widest">
                      Limited Edition
                    </span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white leading-[1.1] mb-6">
                      Redefine Your <br />
                      <span className="italic text-gray-500">Statement.</span>
                    </h2>
                    <p className="text-gray-400 text-lg mb-10 max-w-md leading-relaxed">
                      Dapatkan akses awal ke koleksi kapsul eksklusif kami. Dibuat terbatas, untuk mereka yang menghargai kelangkaan.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <button className="px-8 py-4 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition-colors flex items-center gap-2">
                        Shop Now <ArrowRight className="w-4 h-4" />
                      </button>
                      <button className="px-8 py-4 rounded-full border border-white/20 text-white font-bold hover:bg-white/10 transition-colors backdrop-blur-sm">
                        View Lookbook
                      </button>
                    </div>
                  </motion.div>
                </div>

                {/* Visual Content */}
                <div className="relative h-[300px] lg:h-auto order-1 lg:order-2 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop" 
                    alt="Fashion Campaign" 
                    className="absolute inset-0 w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-[1.5s]"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-[#111] via-transparent to-transparent lg:bg-linear-to-l lg:from-[#111] lg:via-transparent lg:to-transparent"></div>
                  
                  {/* Floating Sticker */}
                  <div className="absolute top-8 right-8 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl rotate-3">
                     <p className="text-xs font-bold text-white uppercase tracking-widest mb-1">Discount</p>
                     <p className="text-3xl font-serif font-bold text-white">20%</p>
                     <p className="text-[10px] text-gray-300 mt-1">For first purchase</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </section>
      </main>

      <Footer />

      {/* Modal Overlay */}
      <AnimatePresence>
        {selectedLook && (
          <LookbookModal
            item={selectedLook}
            onClose={() => setSelectedLook(null)}
          />
        )}
      </AnimatePresence>

      {/* Style Scrollbar Hidden */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default NewArrivals;