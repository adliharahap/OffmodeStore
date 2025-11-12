"use client";

import React from 'react';
import { Star } from 'lucide-react';


const formatPrice = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
};

// --- KOMPONEN PRODUCT CARD (DIGABUNG KE SINI UNTUK FIX PREVIEW) ---
export const ProductCard = ({ product }) => {
  return (
    <div
      className="flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden group border border-gray-200 dark:border-gray-700 transition-all duration-300 h-full"
    >
      {/* --- BAGIAN GAMBAR --- */}
      <div className="h-96 overflow-hidden relative">
        <img 
          src={product.images[0].src} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
        {product.badge && (
          <span className={`absolute top-4 left-4 text-xs font-semibold px-3 py-1 rounded-full text-white ${
            product.badge.includes('Diskon') ? 'bg-red-600' : 'bg-purple-600'
          }`}>
            {product.badge}
          </span>
        )}
      </div>

      {/* --- KONTEN WRAPPER --- */}
      <div className="p-6 flex flex-col grow">
        <div className="grow">
          {/* --- NAMA PRODUK --- */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {product.name}
          </h3>

          {/* --- KETERANGAN SINGKAT --- */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{product.description}</p>

          {/* --- RATING & TERJUAL --- */}
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4 gap-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
              <span className="font-semibold">{product.rating}</span>
            </div>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
            <span>{product.sold} terjual</span>
          </div>

          {/* --- UKURAN BAJU --- */}
          <div className="mb-5">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Ukuran:</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <span
                  key={size.name}
                  className={`flex items-center justify-center w-9 h-9 border rounded-md text-xs font-medium transition-colors ${
                    size.stock > 0
                      ? 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 line-through'
                  }`}
                >
                  {size.name}
                </span>
              ))}
            </div>
          </div>

          {/* --- HARGA (UTAMA & CORET) --- */}
          <div>
            <span className="block text-3xl font-bold text-purple-600 dark:text-purple-400">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="block text-sm text-gray-500 line-through mt-1">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};