"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { ModalWrapper, ModalBody } from './ModalBase';
import StockStatusLabel from './StockLabel';
import { 
  X, BarChart2, Info, Package, FilePenLine, Trash2, 
  Search, Filter, ArrowUpDown, AlertCircle 
} from 'lucide-react';
import { getProductDataById } from '../../../../../../utils/getProductDataAction';

export default function ProductDetailModal({ product: initialProduct, onClose, onGoToEdit, onGoToDelete }) {
  const [activeTab, setActiveTab] = useState('variants');
  
  // State untuk data lengkap & loading
  const [fullData, setFullData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Data Lengkap saat Modal Mount
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!initialProduct?.id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getProductDataById(initialProduct.id);
        if (isMounted) {
          setFullData(data);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching detail:", err);
          setError("Gagal memuat detail produk.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, [initialProduct]);

  // Data yang akan dirender (Full data jika ada, atau fallback ke initialProduct untuk header sementara)
  const displayProduct = fullData || initialProduct;

  return (
    <ModalWrapper onClose={onClose}>
      
      {/* Header (Selalu tampil, tombol disable jika loading) */}
      <div className="flex flex-col gap-4 sm:flex-row justify-between items-center p-6 border-b border-gray-200">
        <div>
          {/* Tampilkan Skeleton Text jika loading untuk nama panjang, tapi minimal nama dari tabel ada */}
          <h2 className="text-2xl font-bold text-gray-900">
            {displayProduct.name}
          </h2>
          <p className="text-sm text-gray-500 mt-1">ID: {displayProduct.id}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            onClick={(e) => onGoToEdit(e, displayProduct)} // Pass full data
            disabled={isLoading}
          >
            <FilePenLine size={16} />
            <span>Edit</span>
          </button>
          <button
            className="flex items-center space-x-2 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            onClick={(e) => onGoToDelete(e, displayProduct)} // Pass full data
            disabled={isLoading}
          >
            <Trash2 size={16} />
            <span>Hapus</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors ml-2"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <ModalBody>
        {/* KONDISI 1: ERROR */}
        {error ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-500">
            <AlertCircle size={48} className="mb-4" />
            <p className="font-medium">{error}</p>
            <button onClick={onClose} className="mt-4 text-gray-500 hover:underline text-sm">Tutup</button>
          </div>
        ) : 
        /* KONDISI 2: LOADING SKELETON */
        isLoading ? (
          <DetailSkeleton />
        ) : 
        /* KONDISI 3: DATA LOADED */
        (
          <>
            {/* Tab Navigation */}
            <div className="flex space-x-4 border-b border-gray-200 mb-6">
              <TabButton title="Varian & Stok" icon={BarChart2} isActive={activeTab === 'variants'} onClick={() => setActiveTab('variants')} />
              <TabButton title="Info Umum" icon={Info} isActive={activeTab === 'info'} onClick={() => setActiveTab('info')} />
              <TabButton title="Galeri & Spek" icon={Package} isActive={activeTab === 'specs'} onClick={() => setActiveTab('specs')} />
            </div>

            {/* Tab Content - Menggunakan Full Data dari Supabase */}
            {activeTab === 'variants' && <VariantSalesTab product={fullData} />}
            {activeTab === 'info' && <GeneralInfoTab product={fullData} />}
            {activeTab === 'specs' && <SpecsGalleryTab product={fullData} />}
          </>
        )}
      </ModalBody>
    </ModalWrapper>
  );
}

// --- Sub Components (Tabs & Skeleton) ---

function TabButton({ title, icon: Icon, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-1 py-3 border-b-2 font-medium text-sm transition-all ${
        isActive ? 'border-gray-800 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      <Icon size={16} />
      <span>{title}</span>
    </button>
  );
}

/**
 * SKELETON LOADER COMPONENT
 */
function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Tabs Skeleton */}
      <div className="flex space-x-4 border-b border-gray-200 pb-3">
        <div className="h-8 w-32 bg-gray-200 rounded"></div>
        <div className="h-8 w-24 bg-gray-200 rounded"></div>
        <div className="h-8 w-28 bg-gray-200 rounded"></div>
      </div>

      {/* Content Skeleton */}
      <div className="space-y-4">
        <div className="flex justify-between">
          <div className="h-10 w-48 bg-gray-200 rounded"></div>
          <div className="h-10 w-40 bg-gray-200 rounded"></div>
        </div>
        
        {/* Table Skeleton */}
        <div className="border border-gray-200 rounded-lg overflow-hidden mt-4">
          <div className="bg-gray-100 h-10 w-full"></div>
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-5 w-1/3 bg-gray-200 rounded"></div>
                <div className="h-5 w-1/4 bg-gray-200 rounded"></div>
                <div className="h-5 w-1/6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * TAB 1: Variant & Sales (REAL DATA ADAPTER)
 */
function VariantSalesTab({ product }) {
const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');

  // 1. Ambil varian dari data relasi Supabase
  const baseVariants = useMemo(() => {
    const variants = product.product_variants || [];
    
    return variants.map(v => ({
      id: v.id,
      color: v.color_name,
      size: v.size_name,
      stock: v.stock,
      // UPDATE DI SINI: Ambil data sold_count asli dari database
      sold: v.sold_count || 0 
    }));
  }, [product]);

  // 2. Filter & Sort Logic
  const processedVariants = useMemo(() => {
    let data = [...baseVariants];

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      data = data.filter(v => 
        v.color.toLowerCase().includes(lowerTerm) || 
        v.size.toLowerCase().includes(lowerTerm)
      );
    }

    switch (sortBy) {
      case 'stock_high': data.sort((a, b) => b.stock - a.stock); break;
      case 'stock_low': data.sort((a, b) => a.stock - b.stock); break;
      case 'sold_high': data.sort((a, b) => b.sold - a.sold); break; // Tambahan sort terjual
      default: break;
    }

    return data;
  }, [baseVariants, searchTerm, sortBy]);

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h3 className="text-lg font-semibold text-gray-800">Data Stok Varian</h3>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-48">
            <input
              type="text"
              placeholder="Cari..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <div className="relative w-full sm:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 bg-white cursor-pointer"
            >
              <option value="default">Default</option>
              <option value="stock_high">Stok Terbanyak</option>
              <option value="stock_low">Stok Sedikit</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Varian</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Stok</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Estimasi Terjual</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {processedVariants.length > 0 ? (
              processedVariants.map(variant => (
                <tr key={variant.id}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-medium text-gray-900">{variant.color}</span>
                    <span className="text-gray-500"> / {variant.size}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StockStatusLabel stock={variant.stock} showIcon={true} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {variant.sold}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-4 py-8 text-center text-gray-500 text-sm">
                  Tidak ada varian yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * TAB 2: General Info (REAL DATA)
 */
function GeneralInfoTab({ product }) {
  return (
    <div className="animate-fadeIn space-y-6">
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
        <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Deskripsi Singkat</h3>
        <p className="text-gray-900 text-sm">{product.description || "-"}</p>
      </div>
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-2">Deskripsi Lengkap</h3>
        <div className="prose prose-sm max-w-none text-gray-600">
          {product.full_description ? (
            <p className="whitespace-pre-line">{product.full_description}</p>
          ) : (
            <p className="italic text-gray-400">Tidak ada deskripsi lengkap.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * TAB 3: Specs & Gallery (REAL DATA)
 */
function SpecsGalleryTab({ product }) {
  // Adaptasi data Supabase
  const images = product.product_images || [];
  const specs = product.product_specifications || [];

  return (
    <div className="animate-fadeIn grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Galeri */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Galeri ({images.length})</h3>
        {images.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {images.map((img) => (
              <div key={img.id} className="relative group aspect-square">
                <img
                  src={img.image_url}
                  alt="Product"
                  className="w-full h-full rounded-md object-cover bg-gray-100 border border-gray-200"
                  onError={(e) => { e.target.src = 'https://placehold.co/300x300/f0f0f0/333?text=Err'; }}
                />
                {img.linked_color_name && (
                  <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded">
                    {img.linked_color_name}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded text-center">
            Belum ada gambar yang diunggah.
          </div>
        )}
      </div>

      {/* Spesifikasi */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Spesifikasi</h3>
        {specs.length > 0 ? (
          <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg bg-white">
            {specs.map((spec) => (
              <li key={spec.id} className="flex justify-between items-center px-4 py-3">
                <span className="text-sm font-medium text-gray-600">{spec.spec_name}</span>
                <span className="text-sm text-gray-900 font-medium text-right">{spec.spec_value}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded text-center">
            Belum ada spesifikasi.
          </div>
        )}
      </div>
    </div>
  );
}