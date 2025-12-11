"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Save, X, Image as ImageIcon, Search, Check, Trash2, LayoutTemplate, Edit, UploadCloud, Loader2 } from 'lucide-react';
import { getAllProductsAdmin } from '../../../../../utils/getProductDataAction';
import { getLookbooks, saveLookbookAction, deleteLookbookAction } from '../../../../../utils/outlookAction';
import { supabase } from '../../../../../lib/supabaseClient';

export default function AdminLookbook() {
  const [lookbooks, setLookbooks] = useState([]);
  const [allProducts, setAllProducts] = useState([]); 
  
  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  
  // Form State
  const initialForm = { id: null, title: '', category: '', description: '', mainImageUrl: '', galleryUrls: [], productIds: [] };
  const [form, setForm] = useState(initialForm);
  const [productSearch, setProductSearch] = useState('');
  
  // Upload States
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Helper untuk ID folder sementara (saat Create New)
  const [tempFolderId, setTempFolderId] = useState(null);

  // 1. Load Data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [lbData, prodData] = await Promise.all([
        getLookbooks(),
        getAllProductsAdmin()
    ]);
    setLookbooks(lbData || []);
    setAllProducts(prodData || []);
  };

  // 2. Handlers Open/Close
  const handleCreate = () => {
    setForm(initialForm);
    // Buat ID folder sementara agar file yang diupload saat "Create" terkumpul di satu folder
    setTempFolderId(`new-${Date.now()}`); 
    setIsModalOpen(true);
  };

  const handleEdit = (lb) => {
    setForm({
        id: lb.id,
        title: lb.title,
        category: lb.category,
        description: lb.description,
        mainImageUrl: lb.mainImage,
        galleryUrls: lb.gallery.map(g => g.url), 
        productIds: lb.relatedProducts.map(p => p.id)
    });
    setTempFolderId(null); // Tidak butuh temp ID karena sudah punya ID asli
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if(!confirm("Yakin hapus koleksi ini?")) return;
    setIsDeleting(id);
    const res = await deleteLookbookAction(id);
    if(res.success) loadData();
    else alert(res.message);
    setIsDeleting(null);
  };

  // 3. Upload Handlers
  const getStoragePath = (fileName) => {
    // Gunakan ID asli jika edit, atau Temp ID jika buat baru
    const folderId = form.id || tempFolderId;
    return `lookbook/${folderId}/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  };

  const handleUploadMain = async (e) => {
    const file = e.target.files[0];
    if(!file) return;

    setUploadingMain(true);
    try {
        const filePath = getStoragePath(file.name);
        
        // Upload ke bucket 'product_images'
        const { error } = await supabase.storage.from('product_images').upload(filePath, file);
        if(error) throw error;
        
        const { data } = supabase.storage.from('product_images').getPublicUrl(filePath);
        setForm(prev => ({ ...prev, mainImageUrl: data.publicUrl }));
    } catch (err) {
        alert("Gagal upload: " + err.message);
    } finally {
        setUploadingMain(false);
    }
  };

  const handleUploadGallery = async (e) => {
    const files = Array.from(e.target.files);
    if(files.length === 0) return;

    setUploadingGallery(true);
    try {
        const newUrls = [];
        for (const file of files) {
            const filePath = getStoragePath(file.name);
            
            // Upload ke bucket 'product_images'
            const { error } = await supabase.storage.from('product_images').upload(filePath, file);
            if(!error) {
                const { data } = supabase.storage.from('product_images').getPublicUrl(filePath);
                newUrls.push(data.publicUrl);
            }
        }
        setForm(prev => ({ ...prev, galleryUrls: [...prev.galleryUrls, ...newUrls] }));
    } catch (err) {
        alert("Gagal upload gallery.");
    } finally {
        setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (index) => {
    setForm(prev => ({
        ...prev,
        galleryUrls: prev.galleryUrls.filter((_, i) => i !== index)
    }));
  };

  // 4. Product Selection
  const toggleProductSelect = (id) => {
    setForm(prev => {
        const exists = prev.productIds.includes(id);
        return {
            ...prev,
            productIds: exists 
                ? prev.productIds.filter(pid => pid !== id)
                : [...prev.productIds, id]
        };
    });
  };

  // 5. Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!form.title || !form.mainImageUrl) return alert("Judul & Cover wajib diisi!");

    setIsLoading(true);
    const res = await saveLookbookAction(form);
    if(res.success) {
        setIsModalOpen(false);
        loadData();
    } else {
        alert("Gagal: " + res.message);
    }
    setIsLoading(false);
  };

  const filteredProducts = allProducts.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));

  return (
    <div className="p-8 bg-gray-50 min-h-screen pt-25 md:pt-8">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Kelola LookBook</h1>
            <p className="text-gray-500 text-sm mt-1">Koleksi akan tampil di halaman depan.</p>
        </div>
        <button onClick={handleCreate} className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200">
          <Plus size={20} /> Buat Baru
        </button>
      </div>

      {lookbooks.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-2xl bg-white">
            <LayoutTemplate className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-500 font-medium">Belum ada koleksi.</h3>
            <button onClick={handleCreate} className="text-blue-600 font-bold hover:underline mt-2">Buat Sekarang</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lookbooks.map(lb => (
                <div key={lb.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <div className="h-56 relative overflow-hidden">
                        <img src={lb.mainImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={lb.title} />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">{lb.category}</div>
                        
                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                             <button onClick={() => handleEdit(lb)} className="p-2 bg-white rounded-full text-gray-900 hover:bg-gray-100 transition-colors shadow-lg">
                                <Edit size={18} />
                             </button>
                             <button onClick={() => handleDelete(lb.id)} disabled={isDeleting === lb.id} className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors shadow-lg">
                                {isDeleting === lb.id ? <Loader2 size={18} className="animate-spin"/> : <Trash2 size={18}/>}
                             </button>
                        </div>
                    </div>
                    
                    <div className="p-5">
                        <h3 className="font-bold text-xl text-gray-900 mb-1 truncate">{lb.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5em]">{lb.description}</p>
                        
                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    {lb.relatedProducts.slice(0,3).map((p, i) => (
                                        <img key={i} src={p.image} className="w-7 h-7 rounded-full border border-white object-cover bg-gray-200" />
                                    ))}
                                </div>
                                <span className="text-xs text-gray-500 font-medium">
                                    {lb.relatedProducts.length > 0 ? `${lb.relatedProducts.length} Produk` : 'No Products'}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                <ImageIcon size={14} />
                                <span>{lb.gallery.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b flex justify-between items-center bg-white z-10 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{form.id ? "Edit Koleksi" : "Buat Koleksi Baru"}</h2>
                        <p className="text-sm text-gray-500 mt-1">ID: {form.id || 'New Draft'}</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><X /></button>
                </div>
                
                <div className="p-8 overflow-y-auto flex-1 space-y-8 bg-gray-50">
                    
                    {/* SECTION 1: INFO */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2">Informasi Dasar</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Judul Koleksi</label>
                                <input className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Contoh: Summer Vibes 2025" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Kategori</label>
                                <input className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all" value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="Casual / Formal" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Deskripsi</label>
                                <textarea className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Ceritakan tentang koleksi ini..." />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: MEDIA */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2">Media & Gallery</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Main Cover */}
                            <div className="md:col-span-1">
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Cover Image (Wajib)</label>
                                <label className="w-full aspect-4/5 bg-white border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-black transition-all relative overflow-hidden group">
                                    {form.mainImageUrl ? (
                                        <>
                                            <img src={form.mainImageUrl} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-white text-xs font-bold flex items-center gap-1"><Edit size={14}/> Ganti</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-gray-400 flex flex-col items-center gap-2">
                                            <div className="p-3 bg-gray-100 rounded-full"><UploadCloud size={24}/></div>
                                            <span className="text-xs font-medium">Upload Cover</span>
                                        </div>
                                    )}
                                    {uploadingMain && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-black"/></div>}
                                    <input type="file" accept="image/*" className="hidden" onChange={handleUploadMain} />
                                </label>
                            </div>

                            {/* Gallery */}
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Gallery Tambahan</label>
                                <div className="grid grid-cols-4 gap-3">
                                    <label className="aspect-square bg-white border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-black transition-colors">
                                        {uploadingGallery ? <Loader2 className="animate-spin text-gray-400"/> : <Plus className="text-gray-400"/>}
                                        <input type="file" accept="image/*" multiple className="hidden" onChange={handleUploadGallery} />
                                    </label>
                                    
                                    {form.galleryUrls.map((url, idx) => (
                                        <div key={idx} className="aspect-square relative group rounded-xl overflow-hidden shadow-sm border border-gray-200">
                                            <img src={url} className="w-full h-full object-cover" />
                                            <button onClick={() => removeGalleryImage(idx)} className="absolute top-1 right-1 bg-white text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-50">
                                                <X size={14}/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: PRODUCTS */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2 flex justify-between">
                            <span>Produk Terkait</span>
                            <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md text-xs">{form.productIds.length} Dipilih</span>
                        </h3>
                        
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-gray-400" size={18}/>
                            <input 
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all" 
                                placeholder="Cari nama produk..." 
                                value={productSearch}
                                onChange={e => setProductSearch(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {filteredProducts.map(prod => {
                                const isSelected = form.productIds.includes(prod.id);
                                return (
                                    <div 
                                        key={prod.id} 
                                        onClick={() => toggleProductSelect(prod.id)}
                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
                                            isSelected 
                                            ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-500' 
                                            : 'bg-white border-gray-200 hover:border-gray-400'
                                        }`}
                                    >
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}>
                                            {isSelected && <Check size={12} className="text-white"/>}
                                        </div>
                                        <img src={prod.thumbnail || 'https://placehold.co/50'} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{prod.name}</p>
                                            <p className="text-xs text-gray-500">Stok: {prod.total_stock}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                </div>

                <div className="p-6 border-t bg-white flex justify-end gap-3 shrink-0 z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                    <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors">Batal</button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={isLoading} 
                        className="px-6 py-3 rounded-xl bg-black text-white font-bold hover:bg-gray-800 flex items-center gap-2 shadow-lg shadow-black/20 disabled:opacity-70 transition-all"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} 
                        Simpan Koleksi
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}