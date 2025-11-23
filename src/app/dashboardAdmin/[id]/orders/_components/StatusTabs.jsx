// StatusTabs.jsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function StatusTabs({ tabs, activeTab, setActiveTab }) {
  return (
    <div className="bg-white p-2 rounded-2xl shadow-xl flex overflow-x-auto mb-6 relative">
      {tabs.map(tab => (
        <motion.button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`
            shrink-0 px-5 py-2 text-sm font-semibold rounded-xl transition-colors duration-300
            relative z-10 whitespace-nowrap
            ${activeTab === tab.key 
              ? 'text-white'
              : 'text-gray-600 hover:text-purple-700'}
          `}
          whileTap={{ scale: 0.98 }}
        >
          {tab.label} ({tab.count})
          {activeTab === tab.key && (
            <motion.div
              layoutId="admin-tab-indicator"
              className="absolute inset-0 bg-purple-600 rounded-xl -z-10"
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
}