// SummaryCards.jsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
// Asumsi path utilitas sudah benar sesuai struktur project
import { formatRupiah } from '../utils/utils'; 

// Objek untuk mengelola styling berdasarkan tipe data (Pesanan vs. Pendapatan)
const getCardStyles = (isRevenue) => {
  if (isRevenue) {
    // Styling untuk Kartu Pendapatan
    return {
      // Warna utama (merah/cyan/kuning)
      shadowColor: 'rgba(239, 68, 68, 0.4)', // Merah
      // Gradient untuk Light Mode
      lightGradient: 'linear-gradient(to right, #ffffff, #f0f9ff 50%, #ffffff)',
      // Styling untuk Dark Mode (menggunakan warna gelap yang lembut)
      // darkBackground: 'dark:bg-gray-800 dark:border-gray-700',
      // darkHoverBg: 'dark:hover:bg-gray-700/50',
      // darkShadowColor: 'rgba(244, 114, 182, 0.4)', // Pink/Purple Shadow
      
      // Catatan: Warna gradient di Dark Mode akan di-simulasi oleh hover:bg-gray-700/50
    };
  } else {
    // Styling untuk Kartu Hitungan Pesanan (Purple theme)
    return {
      // Warna utama (purple/blue/yellow)
      shadowColor: 'rgba(139, 92, 246, 0.4)', // Purple
      // Gradient untuk Light Mode
      lightGradient: 'linear-gradient(to right, #ffffff, #f3f4ff 50%, #ffffff)', // Light Purple Tint
      // Styling untuk Dark Mode
      // darkBackground: 'dark:bg-gray-800 dark:border-gray-700',
      // darkHoverBg: 'dark:hover:bg-gray-700/50',
      // darkShadowColor: 'rgba(139, 92, 246, 0.4)', // Purple Shadow
    };
  }
};


const SummaryCard = ({ title, count, icon: Icon, colorClass, delay, isRevenue = false }) => {
  const styles = getCardStyles(isRevenue);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay }}
      whileHover={{ 
        // Menggunakan warna bayangan yang berbeda berdasarkan tipe data
        '--tw-shadow-color': styles.shadowColor,
        // Di Dark Mode, ganti shadow color agar tidak terlalu terang
        boxShadow: `0 20px 25px -5px var(--tw-shadow-color), 0 8px 10px -6px var(--tw-shadow-color)`,
        scale: 1.03,
        backgroundPosition: 'left center' 
      }}
      style={{
        // Menggunakan gradient yang berbeda di Light Mode
        background: styles.lightGradient,
        backgroundSize: '200% auto',
        transition: 'background-position 0.5s ease-out, box-shadow 0.3s ease-out, transform 0.3s ease-out',
        backgroundPosition: 'right center',
      }}
      className={`flex-1 p-6 rounded-2xl border border-gray-100 min-w-[200px] cursor-pointer
                 ${styles.darkBackground} ${styles.darkHoverBg}
                 hover:shadow-lg dark:hover:shadow-2xl`} 
      // Catatan: Penambahan shadow dark mode secara langsung di style/whileHover akan lebih bersih
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={`mt-1 font-extrabold text-gray-900 ${isRevenue ? 'text-2xl' : 'text-4xl'}`}>
            {isRevenue ? formatRupiah(count) : count}
          </p>
        </div>
        <div className={`p-3 rounded-full ${colorClass} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
      </div>
    </motion.div>
  );
};

export default function SummaryCards({ summaryData }) {
  return (
    <div className="flex flex-wrap gap-4 mb-10">
      {summaryData.map((data, index) => (
        <SummaryCard 
          key={data.title}
          title={data.title}
          count={data.count}
          icon={data.icon}
          colorClass={data.colorClass}
          delay={index * 0.08}
          isRevenue={data.isRevenue}
        />
      ))}
    </div>
  );
}