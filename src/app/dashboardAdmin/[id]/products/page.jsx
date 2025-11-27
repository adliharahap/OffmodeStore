"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Plus, Search, ChevronDown, FilePenLine, Trash2, PackageOpen
} from 'lucide-react';

// Import Komponen Modular
import StockStatusLabel from './_components/StockLabel';
import ProductDetailModal from './_components/ProductDetailModal';
import ProductEditModal from './_components/ProductEditModal';
import ProductDeleteModal from './_components/ProductDeleteModal';
import { deleteProduct, getAllProductsAdmin } from '../../../../../utils/getProductDataAction';

// Helper Utils
const calculateTotalStock = (product) => product.sizes?.reduce((acc, size) => acc + size.stock, 0) || 0;
const calculateDiscountPercent = (price, originalPrice) => (!originalPrice || originalPrice <= price) ? 0 : Math.round(((originalPrice - price) / originalPrice) * 100);

export default function ProductsPage() {
  const pathname = usePathname();
  const [productData, setProductData] = useState([]); // Default array kosong
  const [isLoading, setIsLoading] = useState(true); // State Loading
  const [isDeleting, setIsDeleting] = useState(false);

  // State Filter
  const [filters, setFilters] = useState({
    search: '',
    stockStatus: 'all',
    isNew: false,
  });

  // State Modal
  const [modalState, setModalState] = useState('none');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllProductsAdmin();
      if (response) {
        setProductData(response);
      }
    } catch (error) {
      console.error("Gagal mengambil data products", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter Logic
  const filteredProducts = useMemo(() => {
    // Pastikan productData adalah array sebelum di-filter
    const sourceData = Array.isArray(productData) ? productData : [];

    return sourceData.filter(product => {
      if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) return false;

      // Logic Stok (prioritas data API 'total_stock', fallback ke hitung manual)
      const totalStock = product.total_stock !== undefined ? product.total_stock : calculateTotalStock(product);

      if (filters.stockStatus === 'in-stock' && totalStock === 0) return false;
      if (filters.stockStatus === 'out-of-stock' && totalStock > 0) return false;
      if (filters.isNew && !product.is_new_arrival) return false;
      return true;
    });
  }, [filters, productData]);

  // Handlers
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const openModal = (type, product) => {
    setSelectedProduct(product);
    setModalState(type);
  };

  const closeModal = () => {
    setModalState('none');
    setSelectedProduct(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct?.id) return;

    setIsDeleting(true);

    const result = await deleteProduct(selectedProduct.id);

    if (result.success) {
      alert("Produk dan gambar berhasil dihapus permanen.");
      closeModal();

      // PANGGIL FUNGSI FETCH DI SINI UNTUK REFRESH UI
      await fetchProducts();

    } else {
      alert("Gagal menghapus: " + result.message);
    }

    setIsDeleting(false);
  };

  return (
    <div className='px-8 pb-8 pt-30 md:pt-8'>
      {/* Header */}
      <div className="flex flex-col gap-3 justify-between items-start sm:flex-row md:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Produk</h1>
        <Link href={`${pathname}/addNewProduct`} className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center shadow-md hover:bg-gray-800 transition-colors">
          <Plus size={18} className="mr-2" /> Tambah Produk
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Cari Nama Produk</label>
            <input type="text" name="search" value={filters.search} onChange={handleFilterChange} placeholder="Kemeja, Celana..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800" />
            <Search size={18} className="absolute left-3 top-9 text-gray-400" />
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status Stok</label>
            <select name="stockStatus" value={filters.stockStatus} onChange={handleFilterChange} className="w-full appearance-none bg-white pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800">
              <option value="all">Semua Status</option>
              <option value="in-stock">Stok Tersedia</option>
              <option value="out-of-stock">Stok Habis</option>
            </select>
            <ChevronDown size={18} className="absolute right-3 top-9 text-gray-400 pointer-events-none" />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" name="isNew" checked={filters.isNew} onChange={handleFilterChange} className="h-4 w-4 rounded text-gray-800 focus:ring-gray-800" />
              <span className="text-sm font-medium text-gray-700">Hanya Produk Baru</span>
            </label>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className='overflow-x-auto'>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Produk</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Harga</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Total Stok</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Terjual</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">

              {/* 1. KONDISI LOADING: Tampilkan Skeleton */}
              {isLoading ? (
                <>
                  <TableSkeletonRow />
                  <TableSkeletonRow />
                  <TableSkeletonRow />
                  <TableSkeletonRow />
                  <TableSkeletonRow />
                </>
              ) : filteredProducts.length === 0 ? (

                /* 2. KONDISI DATA KOSONG: Tampilkan Pesan Empty State */
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <PackageOpen size={48} className="text-gray-300 mb-3" />
                      <p className="text-lg font-medium text-gray-700">Tidak ada produk ditemukan</p>
                      <p className="text-sm">Coba ubah filter atau kata kunci pencarian Anda.</p>
                    </div>
                  </td>
                </tr>

              ) : (

                /* 3. KONDISI ADA DATA: Render Rows */
                filteredProducts.map((product) => {
                  const displayImage = product.thumbnail || product.images?.[0]?.src || 'https://placehold.co/100x100/f0f0f0/333?text=No+Image';
                  const displayStock = product.total_stock !== undefined ? product.total_stock : calculateTotalStock(product);

                  return (
                    <tr key={product.id} onClick={() => openModal('detail', product)} className="hover:bg-gray-50 cursor-pointer transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="shrink-0 h-12 w-12">
                            <img
                              className="h-12 w-12 rounded-md object-cover bg-gray-100"
                              src={displayImage}
                              alt={product.name}
                              onError={(e) => { e.target.src = 'https://placehold.co/100x100/f0f0f0/333?text=Img'; }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            {product.badge && <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.badge === 'Best Seller' ? 'bg-yellow-100 text-yellow-800' : product.badge === 'New' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>{product.badge}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm text-gray-900">Rp {product.price?.toLocaleString('id-ID') || 0}</div>
                          {product.originalPrice > 0 && <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs font-bold rounded-full">{calculateDiscountPercent(product.price, product.originalPrice)}% OFF</span>}
                        </div>
                        {product.originalPrice > 0 && <div className="text-xs text-gray-500 line-through">Rp {product.originalPrice.toLocaleString('id-ID')}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StockStatusLabel stock={displayStock} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.sold_count_total || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.rating ? `${product.rating} ★` : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={(e) => { e.stopPropagation(); openModal('edit', product); }} className="text-gray-600 hover:text-gray-900 mr-3 p-1" title="Edit"><FilePenLine size={18} /></button>
                        <button onClick={(e) => { e.stopPropagation(); openModal('delete', product); }} className="text-red-500 hover:text-red-700 p-1" title="Hapus"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals Manager */}
      <AnimatePresence>
        {modalState === 'detail' && selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={closeModal}
            onGoToEdit={() => openModal('edit', selectedProduct)}
            onGoToDelete={() => openModal('delete', selectedProduct)}
          />
        )}
        {modalState === 'edit' && selectedProduct && (
          <ProductEditModal product={selectedProduct} onClose={closeModal} />
        )}
        {modalState === 'delete' && selectedProduct && (
          <ProductDeleteModal product={selectedProduct} onClose={closeModal} onConfirm={handleConfirmDelete} />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Internal Component: Table Skeleton ---
function TableSkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-gray-100">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <motion.div
            className="h-12 w-12 bg-gray-200 rounded-md"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <div className="ml-4 space-y-2">
            <motion.div
              className="h-4 w-32 bg-gray-200 rounded"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="h-3 w-20 bg-gray-200 rounded"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            />
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-24 bg-gray-200 rounded mb-1"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-12 bg-gray-200 rounded"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-10 bg-gray-200 rounded"></div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-2">
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
        </div>
      </td>
    </tr>
  );
}