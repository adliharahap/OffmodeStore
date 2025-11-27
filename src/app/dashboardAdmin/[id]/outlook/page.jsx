"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Save, X, Image as ImageIcon, Search, Check, Trash2, LayoutTemplate } from 'lucide-react';
import { getAllProductsAdmin } from '../../../../../utils/getProductDataAction';
import { getLookbooks, createLookbookAction } from '../../../../../utils/outlookAction';

export default function AdminOutlook() {
  const [lookbooks, setLookbooks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State Form
  const [form, setForm] = useState({
    title: '', category: '', description: '', mainImageUrl: '', galleryUrls: [], productIds: []
  });
  
  // Helper State
  const [tempGalleryUrl, setTempGalleryUrl] = useState('');
  const [allProducts, setAllProducts] = useState([]); 
  const [productSearch, setProductSearch] = useState('');

  // 1. Load Data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const lbData = await getLookbooks();
      setLookbooks(lbData || []); // Pastikan selalu array
      
      const prodData = await getAllProductsAdmin(); 
      setAllProducts(prodData || []); // Pastikan selalu array
      
      console.log("✅ Data Loaded. Lookbooks:", lbData.length, "Products:", prodData.length);
    } catch (error) {
      console.error("❌ Gagal load data:", error);
    }
  };

  // 2. Handlers
  const handleAddGallery = () => {
    if(tempGalleryUrl) {
      setForm(prev => ({ ...prev, galleryUrls: [...prev.galleryUrls, tempGalleryUrl] }));
      setTempGalleryUrl('');
    }
  };

  const toggleProductSelect = (productId) => {
    setForm(prev => {
      const exists = prev.productIds.includes(productId);
      return {
        ...prev,
        productIds: exists 
          ? prev.productIds.filter(id => id !== productId) // Hapus
          : [...prev.productIds, productId] // Tambah
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    if(!form.title || !form.mainImageUrl) {
        alert("Judul dan Gambar Utama wajib diisi!");
        setIsLoading(false);
        return;
    }

    const res = await createLookbookAction(form);
    
    if(res.success) {
        alert("✅ Outlook berhasil dibuat!");
        setIsModalOpen(false);
        // Reset Form
        setForm({ title: '', category: '', description: '', mainImageUrl: '', galleryUrls: [], productIds: [] });
        loadData(); 
    } else {
        alert("❌ Gagal: " + res.message);
    }
    setIsLoading(false);
  };

  // Filter produk dengan aman
  const filteredProducts = Array.isArray(allProducts) 
    ? allProducts.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())) 
    : [];

  return (
    <div className="p-8 bg-gray-50 min-h-screen pt-25 md:pt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Kelola Outlook</h1>
            <p className="text-gray-500 text-sm mt-1">Atur koleksi "New Arrivals" untuk halaman depan.</p>
        </div>
        <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 shadow-lg transition-all active:scale-95"
        >
          <Plus size={20} /> Buat Outlook Baru
        </button>
      </div>

      {/* LIST LOOKBOOKS */}
      {lookbooks.length === 0 ? (
        // --- EMPTY STATE UI (Muncul jika data kosong) ---
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <LayoutTemplate className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Belum ada koleksi Outlook</h3>
            <p className="text-gray-500 max-w-md mt-2 mb-6">
                Outlook yang kamu buat akan muncul di sini dan ditampilkan sebagai "New Arrivals" di website utama.
            </p>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="text-purple-600 font-semibold hover:underline"
            >
                Buat koleksi pertama sekarang &rarr;
            </button>
        </div>
      ) : (
        // --- DATA EXIST UI ---
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lookbooks.map(lb => (
                <div key={lb.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="h-48 w-full bg-gray-100 relative">
                        <img src={lb.mainImage} className="w-full h-full object-cover" alt={lb.title} />
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold">
                            {lb.category}
                        </div>
                    </div>
                    <div className="p-5">
                        <h3 className="font-bold text-xl text-gray-900 mb-1">{lb.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 min-h-[2.5em]">{lb.description}</p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex -space-x-2">
                                {lb.relatedProducts.slice(0,3).map((prod, i) => (
                                    <img key={i} src={prod.image} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 object-cover" alt="" />
                                ))}
                                {lb.relatedProducts.length > 3 && (
                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                        +{lb.relatedProducts.length - 3}
                                    </div>
                                )}
                            </div>
                            <span className="text-xs text-gray-400 font-medium">
                                {new Date(lb.created_at || Date.now()).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Buat Outlook Baru</h2>
                        <p className="text-sm text-gray-500">Isi detail koleksi dan pilih produk terkait.</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><X /></button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Judul & Kategori */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Judul Koleksi</label>
                            <input 
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" 
                                value={form.title} 
                                onChange={e => setForm({...form, title: e.target.value})} 
                                placeholder="Contoh: Autumn Vibes" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Kategori</label>
                            <input 
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" 
                                value={form.category} 
                                onChange={e => setForm({...form, category: e.target.value})} 
                                placeholder="Contoh: Casual / Formal" 
                            />
                        </div>
                    </div>

                    {/* Deskripsi */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Deskripsi Singkat</label>
                        <textarea 
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" 
                            rows={3} 
                            value={form.description} 
                            onChange={e => setForm({...form, description: e.target.value})}
                            placeholder="Ceritakan sedikit tentang tema koleksi ini..." 
                        />
                    </div>

                    {/* Main Image */}
                    <div>
                         <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">URL Gambar Utama (Cover)</label>
                         <div className="flex gap-3">
                             <input 
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none font-mono text-sm" 
                                value={form.mainImageUrl} 
                                onChange={e => setForm({...form, mainImageUrl: e.target.value})} 
                                placeholder="https://..." 
                             />
                             {form.mainImageUrl && (
                                <img src={form.mainImageUrl} className="w-10 h-10 rounded border object-cover bg-gray-100" alt="Preview" />
                             )}
                         </div>
                    </div>

                    {/* Gallery Input */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                         <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Gallery Tambahan (Opsional)</label>
                         <div className="flex gap-2 mb-3">
                            <input 
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none text-sm" 
                                value={tempGalleryUrl} 
                                onChange={e => setTempGalleryUrl(e.target.value)} 
                                placeholder="Paste URL gambar disini..." 
                            />
                            <button type="button" onClick={handleAddGallery} className="bg-gray-900 text-white px-4 rounded-lg text-sm font-medium hover:bg-gray-700">Add</button>
                         </div>
                         
                         {form.galleryUrls.length > 0 ? (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {form.galleryUrls.map((url, idx) => (
                                    <div key={idx} className="w-20 h-20 relative shrink-0 group">
                                        <img src={url} className="w-full h-full object-cover rounded-lg border border-gray-300" alt="" />
                                        <button 
                                            onClick={() => setForm(prev => ({...prev, galleryUrls: prev.galleryUrls.filter((_, i) => i !== idx)}))} 
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                        >
                                            <X size={12}/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                         ) : (
                             <p className="text-xs text-gray-400 italic">Belum ada gambar gallery.</p>
                         )}
                    </div>

                    {/* Product Selector */}
                    <div className="border border-gray-200 p-4 rounded-xl bg-white shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                             <label className="block text-sm font-bold text-gray-900">
                                Pilih Produk Terkait <span className="text-purple-600">({form.productIds.length} terpilih)</span>
                             </label>
                        </div>
                        
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                            <input 
                                className="w-full pl-9 pr-3 py-2 rounded-lg border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm" 
                                placeholder="Cari nama produk..." 
                                value={productSearch}
                                onChange={e => setProductSearch(e.target.value)}
                            />
                        </div>

                        <div className="h-56 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map(prod => {
                                    const isSelected = form.productIds.includes(prod.id);
                                    return (
                                        <div 
                                            key={prod.id} 
                                            onClick={() => toggleProductSelect(prod.id)}
                                            className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all border ${
                                                isSelected 
                                                ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-500' 
                                                : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-300'}`}>
                                                {isSelected && <Check size={12} className="text-white" />}
                                            </div>
                                            <img 
                                                src={prod.thumbnail || 'https://placehold.co/50'} 
                                                className="w-10 h-10 rounded object-cover bg-gray-200" 
                                                alt="" 
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{prod.name}</p>
                                                <p className="text-xs text-gray-500">Stok: {prod.total_stock || '?'}</p>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="text-center py-8 text-gray-400 text-sm">
                                    Produk tidak ditemukan.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex justify-end gap-3 shrink-0">
                    <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg border bg-white text-gray-700 font-medium hover:bg-gray-100 transition-colors">Batal</button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={isLoading} 
                        className="px-5 py-2.5 rounded-lg bg-black text-white font-medium hover:bg-gray-800 flex items-center gap-2 shadow-lg shadow-gray-500/20 disabled:opacity-70"
                    >
                        {isLoading ? 'Menyimpan...' : <><Save size={18}/> Simpan Outlook</>}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}