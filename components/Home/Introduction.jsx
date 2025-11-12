"use client";

import React, { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useInView,
} from 'framer-motion';


// --- Ikon Baru dari Lucide-React ---
import {
  Gem,
  Palette,
  Users,
  ShieldCheck,
  Truck,
  Star as StarIcon,
  CheckCircle,
  Sparkle,
  Feather
} from 'lucide-react';
import TestimonialMarquee from './TestimonialMarquee';

// --- Varian Animasi (Tetap) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100 }
  },
};

const sectionFadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', duration: 0.8, bounce: 0.3 }
  }
};

// --- Komponen Counter (Tetap) ---
const AnimatedStat = ({ toValue, label }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, latest => Math.round(latest));
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      animate(count, toValue, {
        duration: 2,
        ease: "easeOut"
      });
    }
  }, [isInView, count, toValue]);

  return (
    <div ref={ref} className="text-center">
      <span className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400">
        <motion.span>{rounded}</motion.span>+
      </span>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{label}</p>
    </div>
  );
};

// --- Komponen Utama: Introduction ---
const Introduction = () => {

  // Fitur (Icon diupdate ke Lucide)
  const features = [
    { title: 'Premium Quality Materials', desc: 'Diseleksi ketat agar tetap lembut, kuat, dan tahan lama.', icon: Feather },
    { title: 'Signature Modern Designs', desc: 'Siluet yang elegan, versatile, dan mudah dipadu padankan.', icon: Palette },
    { title: 'Handcrafted Details', desc: 'Setiap detail diperhatikan untuk menghasilkan finishing terbaik.', icon: Gem },
    { title: 'Comfort for Everyday', desc: 'Ringan, breathable, dan nyaman dipakai dalam aktivitas apa pun.', icon: Users },
    { title: 'Limited Monthly Drops', desc: 'Dirilis dalam jumlah terbatas untuk menjaga eksklusivitas.', icon: StarIcon }, // Ganti nama di sini
    { title: 'Secure & Fast Delivery', desc: 'Packing rapi dan terjamin aman hingga ke tangan Anda.', icon: Truck },
  ];

  const stats = [
    { value: 500, label: 'Produk Original' },
    { value: 100, label: 'Brand Eksklusif' },
    { value: 10000, label: 'Pelanggan Puas' },
  ];

  return (
    <>
      {/* === Bagian Hero (Layout 2 Kolom Baru) === */}
      <section className="relative grid min-h-screen grid-cols-1 items-center gap-10 bg-stone-50 dark:bg-gray-900 md:grid-cols-2">

        {/* Kolom Kiri: Pinterest Grid*/}
        <motion.div
          className="w-full h-[60vh] md:h-[80vh] rounded-2xl overflow-hidden relative md:ml-6"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          {/* Mulai: Konten Grid Baru */}
          <motion.div
            className="grid h-full grid-cols-2 grid-rows-2 gap-2 md:gap-4 p-2 md:p-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {/* Gambar 1: Tinggi (Span 2 baris) */}
            <motion.div
              className="col-span-1 row-span-2 rounded-lg overflow-hidden"
              variants={itemVariants}
            >
              <img
                src="https://i.pinimg.com/736x/04/ce/7e/04ce7ee3d4daebdce6271220ee290a1e.jpg"
                alt="Fashion Look 1"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </motion.div>

            {/* Gambar 2: Kotak (Atas Kanan) */}
            <motion.div
              className="col-span-1 row-span-1 rounded-lg overflow-hidden"
              variants={itemVariants}
            >
              <img
                src="https://i.pinimg.com/1200x/b4/4f/23/b44f23a1f6c200fbdc4b8052430742a9.jpg"
                alt="Fashion Detail"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </motion.div>

            {/* Gambar 3: Kotak (Bawah Kanan) */}
            <motion.div
              className="col-span-1 row-span-1 rounded-lg overflow-hidden"
              variants={itemVariants}
            >
              <img
                src="https://i.pinimg.com/736x/a2/0e/c6/a20ec6085a0537cc014790083c3f69c3.jpg"
                alt="Fabric Texture"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </motion.div>
          </motion.div>
          {/* Selesai: Konten Grid Baru */}
        </motion.div>

        {/* Kolom Kanan: Teks */}
        <div className="container px-6 flex flex-col justify-start md:justify-center text-center md:text-left">
          <motion.h2
            className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight"
            variants={sectionFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            Redefinisi Gaya Anda
          </motion.h2>

          <motion.p
            className="mt-4 text-lg md:text-xl font-medium text-gray-700 dark:text-gray-300 max-w-lg"
            variants={sectionFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.1 }}
          >
            Koleksi premium yang memadukan kenyamanan dan estetika modern.
          </motion.p>

          {/* List Keunggulan dengan Deskripsi */}
          <motion.ul
            className="mt-10 space-y-6 max-w-xl"
            variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.2 }}
          >
            <motion.li variants={itemVariants} className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-purple-500 mt-1 shrink-0" strokeWidth={2.2} />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Material Pilihan Terbaik</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Setiap kain dipilih dengan detail untuk kenyamanan dan durabilitas.</p>
              </div>
            </motion.li>

            <motion.li variants={itemVariants} className="flex items-start gap-4">
              <Sparkle className="w-6 h-6 text-purple-500 mt-1 shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Finishing yang Rapi & Presisi</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Dijahit dengan teknik presisi untuk tampilan premium yang menawan.</p>
              </div>
            </motion.li>

            <motion.li variants={itemVariants} className="flex items-start gap-4">
              <Gem className="w-6 h-6 text-purple-500 mt-1 shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Nyaman Dipakai Seharian</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Ringan, breathable, dan tetap stylish — tanpa kompromi.</p>
              </div>
            </motion.li>
          </motion.ul>
          {/* CTA dipindah ke sini */}
          <motion.div
            className="mt-10"
            variants={sectionFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.4 }}
          >
            <motion.a
              href="#"
              className="inline-block px-10 py-4 text-lg font-semibold text-white rounded-full shadow-lg
                         bg-linear-to-r from-purple-600 to-blue-600
                         dark:from-purple-500 dark:to-blue-500
                         transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
              whileTap={{ scale: 0.95 }}
            >
              Lihat Koleksi
            </motion.a>
          </motion.div>
        </div>
      </section >

      {/* === Bagian Sisa (Konten di bawah Hero) === */}
      <motion.section className="bg-stone-50 dark:bg-gray-900 relative overflow-hidden py-5" >
        <div className="container px-6 text-center relative z-10">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">
            Kenapa Memilih Kami?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-3 max-w-2xl mx-auto">
            Setiap detail dirancang untuk memberikan kualitas terbaik dan kenyamanan saat dikenakan.
          </p>

          <motion.div
            className="grid md:grid-cols-3 gap-8 mt-16"
            variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                className="p-8 rounded-2xl shadow-lg border border-gray-100/50
                           bg-linear-to-br from-white to-gray-50
                           dark:from-gray-800 dark:to-gray-800/70 dark:border-gray-700
                           backdrop-blur-sm transition-all duration-300 hover:shadow-2xl"
                variants={itemVariants}
              >
                <div className="text-4xl mb-4 text-purple-600 dark:text-purple-400">
                  <feature.icon className="w-12 h-12 inline-block" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* === Statistik Brand — Section === */}
          <section className="w-full text-center py-10 md:pt-28 md:pb-20">

            {/* Title */}
            <motion.h3
              className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"
              variants={sectionFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            >
              Dipercaya & Dicintai Pelanggan Kami
            </motion.h3>

            {/* Deskripsi */}
            <motion.p
              className="mt-3 text-gray-600 dark:text-gray-400 max-w-3xl mx-auto text-base md:text-lg"
              variants={sectionFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.1 }}
            >
              Setiap detail pada koleksi kami dibuat dengan dedikasi — dan hasilnya terlihat dari kepercayaan yang terus tumbuh.
            </motion.p>

            {/* Statistik */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 mt-16"
              variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
            >
              {stats.map((stat, idx) => (
                <motion.div key={idx} variants={itemVariants}>
                  <AnimatedStat toValue={stat.value} label={stat.label} />
                </motion.div>
              ))}
            </motion.div>

          </section>
          
          {/* Komponen TestimonialMarquee sekarang dipanggil dari file yang sama */}
          <TestimonialMarquee />
        </div>
      </motion.section>
    </>
  );
};

// Pastikan untuk mengekspor 'Introduction' sebagai default
export default Introduction;