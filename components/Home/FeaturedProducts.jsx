"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import Link from 'next/link'; // Impor Link dari Next.js
import { ProductCard } from '../ProductCard';

// Varian animasi (tetap di file ini)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};

// --- DATA PRODUK DIPERBARUI ---
// Disesuaikan agar strukturnya relevan dengan 'productData' di DetailProduct
// 'images' adalah array, dan 'sizes' menggunakan 'stock'
const featuredProductsData = [
  {
    id: 1,
    name: 'Kemeja Linen Oversized',
    description: 'Kemeja esensial yang ringan dan sejuk.',
    images: [
      { src: 'https://placehold.co/800x800/f0f0f0/333?text=Linen+1', linkedColorName: null },
      { src: 'https://placehold.co/800x800/e8e8e8/333?text=Linen+2', linkedColorName: null },
      { src: 'https://placehold.co/800x800/f5f5f5/333?text=Putih', linkedColorName: 'Putih Gading' },
      { src: 'https://placehold.co/800x800/000080/eee?text=Navy', linkedColorName: 'Biru Navy' },
      { src: 'https://placehold.co/800x800/000000/eee?text=Hitam', linkedColorName: 'Hitam' },
      { src: 'https://placehold.co/800x800/C3B091/333?text=Khaki', linkedColorName: 'Khaki' },
    ],
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
    colors: [
      { name: 'Putih Gading', thumbnail: 'https://placehold.co/100x100/f5f5f5/333?text=Putih', mainImageIndex: 2 },
      { name: 'Biru Navy', thumbnail: 'https://placehold.co/100x100/000080/eee?text=Navy', mainImageIndex: 3 },
      { name: 'Hitam', thumbnail: 'https://placehold.co/100x100/000000/eee?text=Hitam', mainImageIndex: 4 },
      { name: 'Khaki', thumbnail: 'https://placehold.co/100x100/C3B091/333?text=Khaki', mainImageIndex: 5 },
    ],
    fullDescription: 'Kemeja esensial yang ringan dan sejuk, dibuat dari 100% linen premium. Potongan oversized memberikan tampilan santai namun tetap elegan. Sempurna untuk cuaca hangat, bisa dipakai sebagai atasan atau outer ringan. Didesain dengan kerah klasik, kancing depan penuh, dan satu saku di dada. Lengan panjang dengan manset berkancing yang bisa digulung untuk gaya yang lebih kasual.',
    specifications: [
      { name: 'Bahan', value: '100% Linen Premium' },
      { name: 'Fit', value: 'Oversized' },
      { name: 'Kerah', value: 'Klasik (Spread Collar)' },
      { name: 'Saku', value: '1 Saku Dada' },
      { name: 'Negara Asal', value: 'Indonesia' },
      { name: 'Petunjuk Cuci', value: 'Mesin cuci suhu rendah, jangan gunakan pemutih, setrika suhu sedang.' },
    ],
  },
  {
    id: 2,
    name: 'Polo Shirt Modern Fit',
    description: 'Tampilan klasik dengan sentuhan modern.',
    images: [
      { src: 'https://placehold.co/800x800/e0e0e0/333?text=Polo+1', linkedColorName: null },
      { src: 'https://placehold.co/800x800/dcdcdc/333?text=Polo+2', linkedColorName: null },
      { src: 'https://placehold.co/800x800/ff0000/fff?text=Merah', linkedColorName: 'Merah' },
      { src: 'https://placehold.co/800x800/008000/fff?text=Hijau', linkedColorName: 'Hijau' },
    ],
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
    colors: [
      { name: 'Merah', thumbnail: 'https://placehold.co/100x100/ff0000/fff?text=Merah', mainImageIndex: 2 },
      { name: 'Hijau', thumbnail: 'https://placehold.co/100x100/008000/fff?text=Hijau', mainImageIndex: 3 },
    ],
    fullDescription: 'Polo shirt klasik dengan fit modern, nyaman dipakai sehari-hari. Cocok untuk kegiatan santai maupun semi-formal.',
    specifications: [
      { name: 'Bahan', value: '100% Cotton' },
      { name: 'Fit', value: 'Modern' },
      { name: 'Kerah', value: 'Klasik' },
    ],
  },
  {
    id: 3,
    name: 'Celana Chino Slim',
    description: 'Potongan slim-fit yang serbaguna.',
    images: [
      { src: 'https://placehold.co/800x800/f0e8e0/333?text=Chino+1', linkedColorName: null },
      { src: 'https://placehold.co/800x800/e0d8c0/333?text=Chino+2', linkedColorName: null },
      { src: 'https://placehold.co/800x800/0000ff/fff?text=Biru', linkedColorName: 'Biru' },
      { src: 'https://placehold.co/800x800/808080/fff?text=Abu', linkedColorName: 'Abu' },
    ],
    badge: null,
    rating: 4.9,
    sold: '3.1k',
    price: 550000,
    originalPrice: null,
    sizes: [
      { name: 'S', stock: 10 },
      { name: 'M', stock: 10 },
      { name: 'L', stock: 0 },
      { name: 'XL', stock: 13 },
      { name: 'XXL', stock: 15 },
    ],
    colors: [
      { name: 'Biru', thumbnail: 'https://placehold.co/100x100/0000ff/fff?text=Biru', mainImageIndex: 2 },
      { name: 'Abu', thumbnail: 'https://placehold.co/100x100/808080/fff?text=Abu', mainImageIndex: 3 },
    ],
    fullDescription: 'Celana chino slim-fit, nyaman untuk aktivitas sehari-hari, bisa dipadukan dengan kemeja maupun polo shirt. Material ringan tapi kuat, cocok untuk berbagai cuaca.',
    specifications: [
      { name: 'Bahan', value: 'Cotton Blend' },
      { name: 'Fit', value: 'Slim' },
      { name: 'Negara Asal', value: 'Indonesia' },
    ],
  },
];


const FeaturedProducts = () => {
  return (
    <section className="py-10 md:py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <motion.h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-16"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.5 }}
        >
          Produk Unggulan
        </motion.h2>
        
        {/* Grid container untuk animasi 'stagger' */}
        <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch"
          variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
        >
          {featuredProductsData.map((product) => (
            // Wrapper motion untuk animasi 'item' dan 'whileHover'
            <motion.div
              key={product.id}
              variants={itemVariants}
              whileHover={{ y: -10, boxShadow: '0 20px 25px -5px rgba(99, 102, 241, 0.1), 0 10px 10px -5px rgba(99, 102, 241, 0.05)' }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="h-full" // Memastikan motion div mengisi sel grid
            >
              {/* Link membungkus komponen card */}
              <Link href={`/detailproduct/${product.id}`} legacyBehavior={false} className="h-full">
                {/* Komponen Card baru dipanggil di sini */}
                <ProductCard product={product} />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProducts;