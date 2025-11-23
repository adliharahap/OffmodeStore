"use client";
import React from 'react';
import { CheckCircle, XCircle, Archive } from 'lucide-react';

export default function StockStatusLabel({ stock, showIcon = false }) {
  const stockLevel = stock > 10 ? 'high' : stock > 0 ? 'low' : 'out';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      stockLevel === 'high' ? 'bg-green-100 text-green-800' :
      stockLevel === 'low' ? 'bg-yellow-100 text-yellow-800' :
      'bg-red-100 text-red-800'
    }`}>
      {showIcon && (
        stockLevel === 'high' ? <CheckCircle size={14} className="mr-1" /> :
        stockLevel === 'low' ? <Archive size={14} className="mr-1" /> :
        <XCircle size={14} className="mr-1" />
      )}
      {stock} unit {stockLevel === 'low' ? '(Stok Tipis)' : stockLevel === 'out' ? '(Habis)' : '(Tersedia)'}
    </span>
  );
}