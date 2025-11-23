// OrderFilterBar.jsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown } from 'lucide-react';

export default function OrderFilterBar({ searchTerm, setSearchTerm, sortMethod, setSortMethod, sortOptions }) {
  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-4 mb-6"
    >
        {/* Input Pencarian */}
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
                type="text"
                placeholder="Cari ID Pesanan atau Nama Pelanggan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-10 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 transition"
            />
        </div>
        
        {/* Dropdown Sortir */}
        <div className="relative w-full sm:w-64">
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <select
                value={sortMethod}
                onChange={(e) => setSortMethod(e.target.value)}
                className="appearance-none w-full p-3 pr-10 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-purple-500 focus:border-purple-500 transition cursor-pointer"
            >
                {sortOptions.map(option => (
                    <option key={option.key} value={option.key}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    </motion.div>
  );
}