// OrderDetailModal.jsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { getStatusDetails, formatRupiah } from '../utils/utils';
import { 
  User,
  CreditCard,
  MapPin,
  Calendar,
  Tag,
  XCircle,
  Receipt // Import icon baru untuk section pembayaran
} from 'lucide-react';

// Sub-komponen untuk Info Box dalam Modal
const InfoBox = ({ title, icon: Icon, className, children }) => (
  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl border dark:border-gray-600">
    <div className="flex items-center gap-2 mb-1">
      <Icon className={`w-4 h-4 ${className}`} />
      <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{title}</span>
    </div>
    {children}
  </div>
);

export default function OrderDetailModal({ order, onClose }) {
  const statusDetail = getStatusDetails(order.status);

  // Hitung Subtotal dari item list (Total harga barang saja)
  const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-purple-700 dark:text-purple-400">Detail Pesanan</h3>
            <h3 className="text-lg font-bold text-purple-500 dark:text-purple-300">#{order.id}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content (Scrollable) */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Status Info */}
          <div className="flex justify-between items-center border-b pb-4 dark:border-gray-700">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Status Pesanan</p>
              <div className={`px-3 py-1 text-sm font-bold rounded-full ${statusDetail.bg} ${statusDetail.color} flex items-center gap-1 w-fit mt-1`}>
                <statusDetail.icon className="w-4 h-4" /> {statusDetail.label}
              </div>
            </div>
            {/* Tracking Number jika ada */}
            {order.tracking && (
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">No. Resi</p>
                <p className="font-mono font-semibold text-gray-800 dark:text-gray-200">{order.tracking}</p>
              </div>
            )}
          </div>

          {/* Customer & Shipping Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoBox title="Pelanggan" icon={User} className="text-blue-600 dark:text-blue-400">
              <p className="font-semibold text-gray-900 dark:text-white">{order.customer}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{order.phone || '-'}</p>
            </InfoBox>
            <InfoBox title="Pembayaran" icon={CreditCard} className="text-purple-600 dark:text-purple-400">
              <p className="font-semibold text-gray-900 dark:text-white uppercase">{order.payment_method}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Virtual/E-wallet</p>
            </InfoBox>
            <InfoBox title="Alamat Kirim" icon={MapPin} className="text-red-600 dark:text-red-400">
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{order.address}</p>
            </InfoBox>
            <InfoBox title="Tanggal Pesan" icon={Calendar} className="text-yellow-600 dark:text-yellow-400">
              <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(order.date).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
            </InfoBox>
          </div>

          {/* Item List */}
          <div>
            <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-3 border-b dark:border-gray-700 pb-1 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Daftar Barang ({order.itemsCount} Item)
            </h4>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between text-sm py-2 border-b border-dashed dark:border-gray-700 last:border-0"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-md bg-gray-200 dark:bg-gray-700 shrink-0 overflow-hidden border dark:border-gray-600">
                            <img 
                                src={item.image_url} 
                                alt={item.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => e.currentTarget.src = `https://placehold.co/100x100/94a3b8/ffffff?text=${item.name.substring(0, 2)}`}
                            />
                        </div>
                        <div>
                            <p className="text-gray-800 dark:text-gray-200 font-medium line-clamp-1">{item.name}</p>
                            <p className="text-gray-500 dark:text-gray-400 text-xs">
                              {formatRupiah(item.price)} x {item.qty}
                            </p>
                        </div>
                    </div>
                  <p className="font-semibold text-gray-900 dark:text-white">{formatRupiah(item.price * item.qty)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* NEW SECTION: Rincian Pembayaran / Cost Breakdown */}
          <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
            <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Receipt className="w-4 h-4" /> Rincian Pembayaran
            </h4>
            
            <div className="space-y-2 text-sm">
              {/* Subtotal */}
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal Produk</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>

              {/* Shipping Cost */}
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Ongkos Kirim</span>
                <span>{formatRupiah(order.shipping_cost)}</span>
              </div>

              {/* Admin Fee */}
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Biaya Layanan / Admin</span>
                <span>{formatRupiah(order.admin_fee)}</span>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-300 dark:bg-gray-600 my-2"></div>

              {/* Grand Total */}
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800 dark:text-white text-base">Total Belanja</span>
                <span className="font-bold text-purple-600 dark:text-purple-400 text-xl">
                  {formatRupiah(order.total)}
                </span>
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
}