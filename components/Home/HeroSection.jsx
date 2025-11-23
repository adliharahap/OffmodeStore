"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from "framer-motion";
import { ArrowRight, Star, Play, MoveRight } from "lucide-react";
import Link from "next/link";

// --- 1. KOMPONEN PENDUKUNG ---

// Teks berjalan (Marquee) - Adaptive Colors
const InfiniteMarquee = () => {
  return (
    // Light: bg-white border-gray-200 | Dark: bg-white (tetap putih untuk kontras atau bisa diubah)
    // Disini saya buat tetap putih di kedua mode agar konsisten sebagai "pita", tapi border disesuaikan.
    <div className="absolute bottom-0 left-0 w-full overflow-hidden bg-white/90 backdrop-blur-sm text-black py-3 z-20 border-t border-gray-200 dark:border-gray-800">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      >
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-8 mx-8">
            <span className="text-lg font-bold tracking-widest uppercase">New Season 2025</span>
            <Star size={14} className="fill-black" />
            <span className="text-lg font-serif italic">Premium Collection</span>
            <Star size={14} className="fill-black" />
            <span className="text-lg font-bold tracking-widest uppercase">Limited Edition</span>
            <Star size={14} className="fill-black" />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

// Efek Tilt pada Gambar Utama
const TiltCard = ({ src, alt, className }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const xPct = (clientX - left) / width - 0.5;
    const yPct = (clientY - top) / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-7, 7]);

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative group ${className}`}
    >
      {/* Glow Effect: Ungu di Dark, Sedikit lebih gelap di Light */}
      <div style={{ transform: "translateZ(50px)" }} className="absolute inset-0 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-purple-500/20 blur-2xl -z-10" />
      
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover rounded-xl shadow-2xl border border-black/5 dark:border-white/10"
        style={{ transform: "translateZ(20px)" }}
      />
      
      {/* Overlay Gradient: Tetap gelap di bawah agar gambar pop-out */}
      <div className="absolute inset-0 rounded-xl bg-linear-to-t from-black/40 to-transparent pointer-events-none" />
    </motion.div>
  );
};

// --- 2. VARIAN ANIMASI ---
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const fadeInUp = {
  hidden: { y: 60, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 50, damping: 20 }
  },
};

const revealImage = {
  hidden: { scale: 1.2, opacity: 0 },
  show: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] }
  },
};


// --- 3. MAIN COMPONENT ---
const HeroSection = () => {
  const mainImage = "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=2073&auto=format&fit=crop"; 
  const secondaryImage = "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop";

  return (
    // ROOT: bg-stone-50 (Light) vs bg-[#0a0a0a] (Dark)
    <section className="relative w-full min-h-[110vh] bg-stone-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white overflow-hidden flex flex-col transition-colors duration-500">
      
      {/* --- Background Texture (Noise) --- */}
      {/* Mix blend mode disesuaikan agar noise terlihat di light mode juga */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.03] pointer-events-none z-0 mix-blend-multiply dark:mix-blend-normal" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}>
      </div>

      {/* --- Gradient Blurs (PARTIKEL YANG TIDAK DIBUANG) --- */}
      {/* Light: Warna lebih soft (purple-300/40) | Dark: Warna deep (purple-900/20) */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-300/40 dark:bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-300/40 dark:bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* --- Main Grid Layout --- */}
      <div className="relative z-10 container mx-auto px-6 h-full flex-1 flex flex-col lg:flex-row items-center lg:items-stretch pt-24 lg:pt-0 pb-20">
        
        {/* 1. LEFT COLUMN: Typography & Content */}
        <motion.div 
          className="w-full lg:w-1/2 flex flex-col justify-center items-start z-20 mb-12 lg:mb-0"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-6">
            <span className="h-px w-12 bg-purple-600 dark:bg-purple-400"></span>
            <span className="text-purple-700 dark:text-purple-300 uppercase tracking-[0.2em] text-xs font-bold">Est. 2021</span>
          </motion.div>

          {/* Headline Besar */}
          <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-serif leading-[0.9] mb-6 text-gray-900 dark:text-white">
            Beyond <br />
            <span className="italic font-light text-gray-500 dark:text-gray-400">Classic</span> <br />
            <span className="bg-clip-text text-transparent bg-linear-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">Fashion.</span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-gray-600 dark:text-gray-400 text-lg max-w-md leading-relaxed mb-10 border-l border-gray-300 dark:border-gray-800 pl-6">
            OffMode Store menghadirkan kurasi eksklusif yang memadukan estetika urban dengan kenyamanan premium. Definisikan ulang gaya Anda.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 items-center">
            <Link href='/products' className="group relative px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full font-bold text-sm overflow-hidden transition-all hover:pr-12 shadow-lg shadow-gray-300 dark:shadow-none">
              <span className="relative z-10">SHOP COLLECTION</span>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                <ArrowRight size={16} />
              </div>
              <div className="absolute inset-0 bg-white/10 dark:bg-purple-50 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 z-0" />
            </Link>
            
            <button className="flex items-center gap-3 px-6 py-4 text-gray-600 dark:text-white/80 hover:text-black dark:hover:text-white transition-colors group">
               <div className="w-10 h-10 rounded-full border border-gray-300 dark:border-white/20 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-white/10 transition-all">
                 <Play size={14} className="fill-gray-900 dark:fill-white ml-1" />
               </div>
               <span className="text-sm font-medium tracking-wide uppercase">Watch Film</span>
            </button>
          </motion.div>
        </motion.div>


        {/* 2. RIGHT COLUMN: Visuals & Parallax */}
        <div className="w-full lg:w-1/2 relative flex items-center justify-center lg:justify-end h-[500px] lg:h-auto perspective-1000">
            
            {/* Gambar Utama (Besar) */}
            <motion.div 
                className="relative w-[85%] h-[80%] lg:h-[75%] z-10"
                variants={revealImage}
                initial="hidden"
                animate="show"
            >
               <TiltCard src={mainImage} alt="Fashion Model Main" className="w-full h-full" />
               
               {/* Floating Label/Price Tag */}
               <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="absolute top-10 -right-6 md:-right-12 bg-white/80 dark:bg-white/10 backdrop-blur-md border border-white/40 dark:border-white/20 p-4 rounded-xl shadow-xl z-30 flex items-center gap-4 max-w-[200px]"
               >
                  <div className="bg-black p-2 rounded-full shadow-sm">
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-300 uppercase tracking-wider">Featured</p>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">Urban Jacket V2</p>
                  </div>
               </motion.div>
            </motion.div>

            {/* Gambar Kedua (Kecil / Floating) */}
            <motion.div 
                className="absolute bottom-0 left-0 lg:left-10 w-[40%] h-[35%] z-20 hidden sm:block"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8, ease: "backOut" }}
            >
                <TiltCard src={secondaryImage} alt="Fashion Detail" className="w-full h-full" />
            </motion.div>

            {/* Dekorasi Circle Text di belakang (Adaptive Fill) */}
            <motion.div 
              className="absolute top-10 right-10 lg:right-20 w-32 h-32 z-0 opacity-30"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                <path id="curve" d="M 50 50 m -37 0 a 37 37 0 1 1 74 0 a 37 37 0 1 1 -74 0" fill="transparent" />
                <text className="text-[10px] font-bold uppercase tracking-widest fill-gray-900 dark:fill-white">
                  <textPath href="#curve">
                    OffMode • Premium Quality • Since 2021 •
                  </textPath>
                </text>
              </svg>
            </motion.div>

        </div>

      </div>

      {/* --- 4. BOTTOM MARQUEE --- */}
      <InfiniteMarquee />
      
    </section>
  );
};

export default HeroSection;