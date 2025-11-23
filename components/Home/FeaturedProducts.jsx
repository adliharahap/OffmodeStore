"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ProductCard } from '../ProductCard';
import { getFeaturedProducts } from '../../utils/featuredProductsAction';

// --- Varian Animasi ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.15 } 
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: 'spring', stiffness: 50, damping: 20 } 
  },
};

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getFeaturedProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to load featured products", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
        <section className="py-24 bg-stone-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white border-t border-gray-200 dark:border-white/5 relative overflow-hidden transition-colors duration-500">
      
      {/* Dekorasi Background (Noise Texture) - Subtle di Light Mode */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.03] pointer-events-none -z-10 mix-blend-multiply dark:mix-blend-normal" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}>
      </div>

      <div className="container mx-auto px-6">
        
        {/* HEADER SECTION (EDITORIAL STYLE) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold tracking-[0.2em] text-xs uppercase mb-4">
              <Sparkles size={14} /> Weekly Selection
            </span>
            <h2 className="text-4xl md:text-5xl font-serif leading-tight text-gray-900 dark:text-white">
              Curated For You
            </h2>
          </motion.div>

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <a href="#" className="group flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-black dark:text-white/70 dark:hover:text-white transition-colors border-b border-transparent hover:border-black dark:hover:border-white pb-1">
              View All Products 
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
            </a>
          </motion.div>
        </div>

        {/* LOADING STATE (SKELETON ADAPTIVE) */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#111] rounded-xl h-[450px] animate-pulse border border-gray-200 dark:border-white/5" />
            ))}
          </div>
        ) : (
          /* DATA LOADED */
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {products.length > 0 ? (
              products.map((product) => (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  className="h-full"
                >
                  <div className="h-full transition-transform duration-500 hover:-translate-y-2 cursor-pointer">
                      <ProductCard product={product} />
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 border border-dashed border-gray-300 dark:border-white/10 rounded-3xl bg-white/50 dark:bg-white/2">
                <p className="text-gray-500 font-serif italic text-xl">Belum ada produk unggulan saat ini.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;