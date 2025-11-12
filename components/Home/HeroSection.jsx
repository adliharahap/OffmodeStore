"use client";

import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

// Varian animasi untuk kontainer, akan menganimasikan anak-anaknya satu per satu
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Waktu jeda antar animasi anak
      delayChildren: 0.2,
    },
  },
};

// Varian animasi untuk setiap item (teks, tombol, dll.)
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 12 },
  },
};

const HeroSection = () => {
  // Anda bisa mengganti ini dengan path gambar Anda
  const currentImage = '/landingpage3.jpg';

  // --- Komponen Bola Gradien (Baru) ---
  const AnimatedGradientOrbs = () => {
    // 1. Orb Pengikut Kursor (dengan spring/delay)
    const mouse = {
      x: useMotionValue(0),
      y: useMotionValue(0)
    };
  
    // Gunakan spring untuk "melembutkan" gerakan
    const smoothOptions = { damping: 20, stiffness: 150, mass: 0.5 };
    const smoothMouse = {
      x: useSpring(mouse.x, smoothOptions),
      y: useSpring(mouse.y, smoothOptions)
    };
  
    useEffect(() => {
      const handleMouseMove = (e) => {
        mouse.x.set(e.clientX);
        mouse.y.set(e.clientY);
      };
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouse.x, mouse.y]);
  
    return (
      <>
        {/* Orb 1: Mengikuti kursor */}
        <motion.div
          className="absolute top-0 left-0 w-[400px] h-[400px] bg-linear-to-br from-purple-200 to-blue-200 rounded-full opacity-30 dark:opacity-10 filter blur-3xl transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ x: smoothMouse.x, y: smoothMouse.y }}
        />
      </>
    );
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gray-900 text-white font-sans overflow-hidden">
      <AnimatedGradientOrbs />
      {/* 1. Latar Belakang Gambar dan Overlay */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      >
        <img
          src={currentImage}
          alt="Branded Fashion Background"
          className="w-full h-full object-cover"
          // Fallback jika gambar gagal dimuat
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/1920x1080/333/999?text=Fashion+Image';
            e.currentTarget.alt = 'Placeholder Image';
          }}
        />
        {/* Overlay yang sedikit lebih gelap untuk kontras yang lebih baik */}
        <div className="absolute inset-0 bg-black/50"></div>
      </motion.div>

      {/* 2. Kontainer Konten (Header + Teks Hero + Footer Tahun) */}
      <motion.div
        className="relative z-10 w-full min-h-screen flex flex-col px-6 pt-3 pb-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 2a. Header (Nama Toko) */}
        <motion.header
          className="flex justify-start items-start w-full"
          variants={itemVariants}
        >
          {/* Sisi Kiri: Nama Toko */}
          <div>
            <h3
              className="text-sm md:text-1xl font-bold font-poppins tracking-wide"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
            >
              OffMode Store
            </h3>
            <p className="text-sm font-semibold font-poppins text-amber-400 tracking-wider">
              KOLEKSI PREMIUM
            </p>
          </div>
        </motion.header>

        {/* 2b. Konten Hero Utama (Tengah) */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl font-bold font-serif tracking-tight"
            style={{ textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}
            variants={itemVariants}
          >
            Exclusive Branded Fashion,
          </motion.h1>
          <motion.h2
            className="text-5xl sm:text-6xl md:text-7xl font-bold font-serif tracking-tight mt-2"
            style={{ textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}
            variants={itemVariants}
          >
            Elegantly Yours.
          </motion.h2>
          <motion.p
            className="mt-6 text-lg md:text-xl max-w-2xl mx-auto font-light text-gray-200"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
            variants={itemVariants}
          >
            Temukan koleksi fashion branded premium pilihan yang memadukan
            gaya modern dan keanggunan abadi.
          </motion.p>
          
          {/* Tombol Aksi dengan Animasi Loop */}
          <motion.div variants={itemVariants} className="mt-12">
            <motion.a
              href="#"
              // DIHAPUS: transition-all duration-300 ease-in-out
              // Ini menyebabkan konflik dengan 'transition' dari Framer Motion
              className="bg-transparent border-2 border-white text-white px-10 py-3 rounded-full font-semibold text-lg"
              // Animasi loop untuk pulsing
              animate={{
                scale: [1, 1.03, 1], // Animasi membesar sedikit dan kembali
                borderColor: ['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 1)'], // Animasi border juga
              }}
              transition={{
                duration: 2, // Durasi satu siklus animasi
                ease: 'easeInOut',
                repeat: Infinity, // Ulangi tanpa henti
                repeatType: 'reverse', // Bolak-balik animasi
              }}
              // Animasi saat hover (akan menimpa animasi loop)
              whileHover={{
                scale: 1.05,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(4px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                borderColor: 'rgba(255, 255, 255, 1)', // Pastikan border putih solid saat hover
              }}
              whileTap={{ scale: 0.95 }}
            >
              Lihat Katalog
            </motion.a>
          </motion.div>
        </div>

        {/* 2c. Footer (Tahun di Kanan Bawah) */}
        <motion.footer
          className="flex justify-end items-end w-full mt-auto" // mt-auto mendorong footer ke bawah
          variants={itemVariants}
        >
          <p
            // DIUBAH: Ukuran font diperbesar dan ditambahkan text-right
            className="text-xl md:text-2xl font-semibold font-serif text-gray-300 text-right"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
          >
            {/* DIUBAH: Ditambahkan <br /> untuk ganti baris */}
            Since <br /> 2021
          </p>
        </motion.footer>
      </motion.div>
    </section>
  );
};

export default HeroSection;