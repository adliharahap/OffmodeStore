"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Tag,
  Scaling,
  Palette,
} from 'lucide-react';
import { ProductCard } from '../../../components/ProductCard';
import Footer from '../../../components/Footer';
import { getAllProductsForCustomer } from '../../../utils/getProductDataAction';
import HeroCarousel from './_components/HeroCarousel';
import Header from '../../../components/Header';

// --- SKELETON COMPONENT (LOADING UI) ---
const ProductCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 h-full flex flex-col">
    {/* Image Skeleton */}
    <div className="relative w-full pt-[125%] bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
    {/* Content Skeleton */}
    <div className="p-4 flex flex-col gap-3 flex-1">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
      <div className="mt-auto flex justify-between items-center pt-2">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
);

// --- OPSI FILTER STATIS ---
const staticFilterOptions = {
  sort: [
    { value: 'populer', label: 'Paling Populer' },
    { value: 'terbaru', label: 'Terbaru' },
    { value: 'harga-rendah', label: 'Harga: Terendah' },
    { value: 'harga-tinggi', label: 'Harga: Tertinggi' },
  ],
};

// --- HOOK: GENERATE FILTER OTOMATIS ---
const useDynamicFilters = (products) => {
  return useMemo(() => {
    if (!products || products.length === 0) return { categories: ['Semua'], sizes: [], colors: [] };

    const allCategories = products.map(p => p.category);
    const allSizes = products.flatMap(p => p.sizes).map(s => s.name);
    const allColors = products.flatMap(p => p.colors).map(c => c.name);

    const uniqueCategories = ['Semua', ...new Set(allCategories)];
    const uniqueSizes = [...new Set(allSizes)];
    const uniqueColors = [...new Set(allColors)].sort();

    const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL', '28', '29', '30', '31', '32', '33', '34'];
    const sortedUniqueSizes = uniqueSizes.sort((a, b) => {
      const aIndex = sizeOrder.indexOf(a);
      const bIndex = sizeOrder.indexOf(b);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      return a.localeCompare(b);
    });

    return {
      categories: uniqueCategories,
      sizes: sortedUniqueSizes,
      colors: uniqueColors,
    };
  }, [products]);
};

const FilterCheckbox = ({ label, id, checked, onChange }) => (
  <label htmlFor={id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
    />
    <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
  </label>
);

// --- MAIN PAGE ---
const ProductsPage = () => {
  // 1. State Data & Loading
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. State Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [sortBy, setSortBy] = useState('terbaru'); // Default ke terbaru untuk data real
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showAllSizes, setShowAllSizes] = useState(false);
  const [showAllColors, setShowAllColors] = useState(false);

  // 3. Fetch Data on Mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getAllProductsForCustomer();
        if (data) {
          setProducts(data);
        }
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const dynamicFilterOptions = useDynamicFilters(products);
  const sizeLimit = 9;
  const colorLimit = 6;

  // 4. Logic Filter (Diperbarui untuk menangani data real)
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (searchTerm) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // Category
    if (selectedCategory !== 'Semua') {
      result = result.filter(p => p.category === selectedCategory);
    }
    // Size (Cek ketersediaan stok > 0)
    if (selectedSizes.length > 0) {
      result = result.filter(p =>
        p.sizes.some(s => selectedSizes.includes(s.name) && s.stock > 0)
      );
    }
    // Color
    if (selectedColors.length > 0) {
      result = result.filter(p =>
        p.colors.some(c => selectedColors.includes(c.name))
      );
    }
    // Sorting
    switch (sortBy) {
      case 'harga-rendah':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'harga-tinggi':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'terbaru':
        // Sort by created_at date string
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'populer':
      default:
        // Parse sold count (handling 'k' suffix manually if necessary, though DB returns number usually)
        const parseSold = (val) => {
          if (typeof val === 'number') return val;
          if (!val) return 0;
          const str = val.toString().toLowerCase();
          return parseFloat(str) * (str.endsWith('k') ? 1000 : 1);
        };
        result.sort((a, b) => parseSold(b.sold) - parseSold(a.sold));
        break;
    }
    return result;
  }, [products, searchTerm, selectedCategory, selectedSizes, selectedColors, sortBy]);

  // Handlers
  const handleFilterChange = (setter, value) => {
    setter(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
  };

  const resetFilters = () => {
    setSelectedCategory('Semua');
    setSelectedSizes([]);
    setSelectedColors([]);
    setSearchTerm('');
  };

  // Sidebar Component
  const FilterSidebarContent = () => {
    const visibleSizes = showAllSizes ? dynamicFilterOptions.sizes : dynamicFilterOptions.sizes.slice(0, sizeLimit);
    const visibleColors = showAllColors ? dynamicFilterOptions.colors : dynamicFilterOptions.colors.slice(0, colorLimit);

    // Jika loading, tampilkan skeleton sidebar sederhana
    if (isLoading) {
      return (
        <div className="space-y-8 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i}>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-col space-y-6">
        {/* Categories */}
        <div>
          <h4 className="flex items-center gap-2 font-semibold text-lg text-gray-900 dark:text-white mb-4">
            <Tag className="w-5 h-5" /> Kategori
          </h4>
          <div className="space-y-2">
            {dynamicFilterOptions.categories.map(category => (
              <label key={category} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value={category}
                  checked={selectedCategory === category}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-5 w-5 border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sizes */}
        {dynamicFilterOptions.sizes.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg text-gray-900 dark:text-white mb-4">
              <Scaling className="w-5 h-5" /> Ukuran
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {visibleSizes.map(size => (
                <label
                  key={size}
                  className={`flex items-center justify-center h-12 border rounded-lg text-sm font-semibold transition-all cursor-pointer ${selectedSizes.includes(size)
                    ? 'border-purple-600 bg-purple-50 dark:border-purple-400 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 ring-2 ring-purple-300'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-500'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedSizes.includes(size)}
                    onChange={() => handleFilterChange(setSelectedSizes, size)}
                    className="sr-only"
                  />
                  {size}
                </label>
              ))}
            </div>
            {dynamicFilterOptions.sizes.length > sizeLimit && (
              <button onClick={() => setShowAllSizes(!showAllSizes)} className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline mt-3">
                {showAllSizes ? 'Tampilkan sedikit' : `Tampilkan ${dynamicFilterOptions.sizes.length - sizeLimit} lagi`}
              </button>
            )}
          </div>
        )}

        {/* Colors */}
        {dynamicFilterOptions.colors.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg text-gray-900 dark:text-white mb-4">
              <Palette className="w-5 h-5" /> Warna
            </h4>
            <div className="space-y-2">
              {visibleColors.map(color => (
                <FilterCheckbox
                  key={color}
                  id={`color-${color}`}
                  label={color}
                  checked={selectedColors.includes(color)}
                  onChange={() => handleFilterChange(setSelectedColors, color)}
                />
              ))}
            </div>
            {dynamicFilterOptions.colors.length > colorLimit && (
              <button onClick={() => setShowAllColors(!showAllColors)} className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline mt-3">
                {showAllColors ? 'Tampilkan sedikit' : `Tampilkan ${dynamicFilterOptions.colors.length - colorLimit} lagi`}
              </button>
            )}
          </div>
        )}

        <button onClick={resetFilters} className="w-full py-3 px-4 rounded-lg font-semibold text-purple-600 dark:text-purple-400 border border-purple-600 dark:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">
          Reset Filter
        </button>
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-14">
        <div className="container px-4 mx-auto">
          <HeroCarousel />
          {/* Controls */}
          <div id='belanja' className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div className="relative w-full md:w-1/2 lg:w-1/3">
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-white/3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden flex items-center justify-center gap-2 w-full md:w-auto py-3 px-5 rounded-lg font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
              >
                <Filter className="w-5 h-5" />
                <span>Filter</span>
              </button>

              <div className="relative w-full md:w-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none py-3 pl-4 pr-10 rounded-lg font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
                >
                  {staticFilterOptions.sort.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-8 pb-20">  
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 shadow-lg border border-gray-200 dark:border-gray-700 sticky top-24">
                <FilterSidebarContent />
              </div>
            </aside>

            <main className="flex-1"> 
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="h-full">
                      <ProductCardSkeleton />
                    </div>
                  ))}
                </div>
              ) : (
                /* LOADED STATE */
                <AnimatePresence>
                  {filteredProducts.length > 0 ? (
                    <motion.div 
                      layout 
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6"
                    >
                      {filteredProducts.map(product => (
                        <motion.div
                          key={product.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3 }}
                          className="h-full"
                        >
                          <Link href={`/detailproduct/${product.id}`} className="h-full block">
                            <ProductCard product={product} />
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center text-center py-20 col-span-full">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Oops!</h3>
                      <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md">
                        Tidak ada produk yang cocok dengan filter Anda.
                      </p>
                      <button onClick={resetFilters} className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                        Hapus Filter
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </main>
          </div>
        </div>

        {/* Mobile Modal Filter */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsFilterOpen(false)}
            >
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed top-0 right-0 w-full max-w-md h-full bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Filter Produk</h3>
                  <button onClick={() => setIsFilterOpen(false)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-6">
                  <FilterSidebarContent />
                </div>
                <div className="p-5 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
                  <button onClick={() => setIsFilterOpen(false)} className="w-full py-3 px-5 rounded-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-all">
                    Terapkan Filter
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </>
  );
};

export default ProductsPage;