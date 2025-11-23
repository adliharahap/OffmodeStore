"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export function ModalWrapper({ children, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function ModalHeader({ title, subtitle, onClose }) {
  return (
    <div className="flex justify-between items-center p-6 border-b border-gray-200">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      <button
        onClick={onClose}
        className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
      >
        <X size={24} />
      </button>
    </div>
  );
}

export function ModalBody({ children }) {
  return <div className="flex-1 overflow-y-auto p-6">{children}</div>;
}

export function ModalFooter({ children }) {
  return (
    <div className="flex justify-end items-center space-x-3 p-6 bg-gray-50 border-t border-gray-200 rounded-b-xl">
      {children}
    </div>
  );
}