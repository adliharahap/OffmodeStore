"use client";
import React from 'react';
import { ModalWrapper, ModalFooter } from './ModalBase';
import { AlertTriangle } from 'lucide-react';

export default function ProductDeleteModal({ product, onClose, onConfirm }) {
  return (
    <ModalWrapper onClose={onClose}>
      <div className="p-6">
        <div className="flex">
          <div className="shrink-0 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle size={24} className="text-red-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-bold text-gray-900">Hapus Produk</h3>
            <p className="text-sm text-gray-500 mt-1">
              Anda yakin ingin menghapus <strong>"{product.name}"</strong>? 
              <br/>
              Semua data terkait produk ini akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>
      </div>
      <ModalFooter>
        <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Batal</button>
        <button type="button" onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Ya, Hapus</button>
      </ModalFooter>
    </ModalWrapper>
  );
}