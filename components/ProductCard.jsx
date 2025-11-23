import React, { useState } from 'react';
import { Star, Heart } from 'lucide-react';
// Note: Removed ShoppingCart import as it's no longer used

// --- UTILITIES ---
const formatPrice = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// --- COMPONENT: COMPACT PRODUCT CARD ---
export const ProductCard = ({ product }) => {
  const [activeSize, setActiveSize] = useState(null);

  // Menghitung diskon jika ada
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  return (
    <div className="group relative bg-white dark:bg-slate-950 rounded-xl shadow-md hover:shadow-xl border border-gray-300 dark:border-slate-800 transition-all duration-300 overflow-hidden flex flex-col h-full w-full max-w-[280px] mx-auto">
      
      {/* --- GAMBAR & BADGE --- */}
      <div className="relative w-full aspect-4/5 overflow-hidden bg-gray-100">
        <img 
          src={product.images[0].src} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        
        {/* Badges Overlay (Hanya untuk badge non-diskon seperti 'Terlaris') */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {/* LOGIKA DISKON DI SINI DIHAPUS */}
          {product.badge && !product.badge.includes('Diskon') && (
            <span className="px-2 py-1 text-[10px] font-bold tracking-wider text-white bg-indigo-600/50 rounded-full shadow-sm">
              {product.badge}
            </span>
          )}
        </div>
      </div>

      {/* --- KONTEN INFORMASI --- */}
      <div className="px-3 pb-3 pt-1 flex flex-col grow gap-1.5">
        {/* Kategori (Dipercantik menjadi Pill/Badge kecil) */}
        <div className="mb-0.5">
            <span className="inline-block px-2 py-[3px] text-[9px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full uppercase tracking-wider leading-none">
              {product.category || 'Pakaian'}
            </span>
        </div>

        {/* Nama Produk - Clamp 2 baris */}
        <h3 className="font-semibold text-[0.92rem] text-gray-900 dark:text-gray-100 leading-tight line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer" title={product.name}>
          {product.name}
        </h3>

        {/* Rating & Sold - Satu baris compact */}
        <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="font-medium text-gray-700 dark:text-gray-300">{product.rating}</span>
          </div>
          <span className="w-0.5 h-0.5 rounded-full bg-gray-300"></span>
          <span>{product.sold} Terjual</span>
        </div>

        {/* Spacer agar harga selalu di bawah */}
        <div className="grow"></div>

        {/* Ukuran - Minimalis Dots/Text */}
        <div className="flex flex-wrap gap-1 mb-1 mt-1">
          {product.sizes.slice(0, 5).map((size) => (
            <button
              key={size.name}
              disabled={size.stock === 0}
              onClick={() => setActiveSize(size.name)}
              className={`
                h-5 min-w-5 px-1 text-[10px] rounded border transition-all duration-200
                ${size.stock === 0 
                  ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed box-decoration-slice line-through' 
                  : activeSize === size.name
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400'
                }
              `}
            >
              {size.name}
            </button>
          ))}
        </div>

        {/* Harga & Diskon */}
        <div className="pt-2 border-t border-dashed border-slate-400 dark:border-slate-800">
          {product.originalPrice ? (
            <div className="flex flex-col items-start gap-0.5">
              {/* Baris Atas: Hemat & Harga Coret */}
              <div className="flex items-center gap-2 w-full pb-2">
                 <span className="px-1.5 py-0.5 text-[10px] font-bold text-rose-600 bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 rounded-sm">
                    Hemat {discountPercentage}%
                 </span>
                 <span className="text-xs text-gray-400 line-through decoration-gray-400/50">
                    {formatPrice(product.originalPrice)}
                 </span>
              </div>
              {/* Baris Bawah: Harga Utama */}
              <div className="flex items-center justify-between w-full">
                <span className="text-2xl font-extrabold text-purple-600 dark:text-white tracking-tight">
                    {formatPrice(product.price)}
                </span>
              </div>
            </div>
          ) : (
            // Layout jika tidak ada diskon
            <div className="flex items-center justify-between w-full mt-1">
               <span className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {formatPrice(product.price)}
               </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};