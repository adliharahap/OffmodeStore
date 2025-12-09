"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Check, Loader2, Plus, Trash2, Image as ImageIcon, 
  Tag, Box, Layers, Save, ArrowLeft, UploadCloud, Edit 
} from 'lucide-react';

// IMPORT SERVER ACTIONS ASLI
import { getProductDataById, updateProductFullData } from '../../../../../../utils/getProductDataAction';
import { supabase } from '../../../../../../lib/supabaseClient';

// --- UI COMPONENTS ---

const ModalWrapper = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden ring-1 ring-gray-200">
      {children}
    </div>
  </div>
);

const ModalHeader = ({ title, subtitle, onClose }) => (
  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-start bg-white shrink-0 z-10">
    <div>
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-1 font-mono">{subtitle}</p>}
    </div>
    <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
      <X size={20} />
    </button>
  </div>
);

const ModalFooter = ({ children }) => (
  <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end items-center gap-3 shrink-0 z-10">
    {children}
  </div>
);

const InputField = ({ label, ...props }) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
    <input
      type='text'
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all text-sm placeholder-gray-400 bg-white disabled:bg-gray-100 disabled:text-gray-500"
      {...props}
    />
  </div>
);

const TextAreaField = ({ label, ...props }) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
    <textarea
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all text-sm min-h-[100px] placeholder-gray-400"
      {...props}
    />
  </div>
);

const CheckboxField = ({ label, checked, onChange }) => (
  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer select-none" onClick={() => onChange(!checked)}>
    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-black border-black' : 'bg-white border-gray-300'}`}>
      {checked && <Check size={14} className="text-white" />}
    </div>
    <span className="text-sm font-medium text-gray-700">{label}</span>
  </div>
);

// --- MAIN COMPONENT ---

export default function ProductEditModal({ product, onClose, onSave }) {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State untuk Fitur Tambah Varian Baru
  const [isAddingVariantMode, setIsAddingVariantMode] = useState(false);
  const [newVariantFile, setNewVariantFile] = useState(null); 
  const [newVariantForm, setNewVariantForm] = useState({
    color_name: '',
    items: [{ id: 'temp-1', size_name: '', price: 0, original_price: 0, stock: 0 }]
  });

  // State Loading saat ganti gambar per warna (untuk visual feedback)
  // Walaupun uploadnya di akhir, state ini bisa dipakai untuk validasi jika perlu
  const [uploadingColor, setUploadingColor] = useState(null);

  // Data States
  const [generalData, setGeneralData] = useState({
    name: '', description: '', full_description: '', badge: '', is_new_arrival: false, is_featured: false,
    rating: 0, sold_count_total: 0, created_at: ''
  });
  const [variants, setVariants] = useState([]);
  const [specifications, setSpecifications] = useState([]);
  
  // STATE IMAGES (Diubah sedikit cara kerjanya nanti)
  const [images, setImages] = useState([]);

  // STATE BARU: Menyimpan file pengganti sementara
  // Format: { [colorName]: File }
  const [replacedImages, setReplacedImages] = useState({});

  // 1. FETCH DATA 
  useEffect(() => {
    const fetchData = async () => {
      if (!product?.id) return;
      
      setIsLoading(true);
      try {
        const fullData = await getProductDataById(product.id);
        
        if (fullData) {
          setGeneralData({
            name: fullData.name || '',
            description: fullData.description || '',
            full_description: fullData.full_description || '',
            badge: fullData.badge || '',
            is_new_arrival: fullData.is_new_arrival || false,
            is_featured: fullData.is_featured || false,
            rating: fullData.rating,
            sold_count_total: fullData.sold_count_total,
            created_at: fullData.created_at
          });
          setVariants(fullData.product_variants || []);
          setSpecifications(fullData.product_specifications || []);
          setImages(fullData.product_images || []);
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        alert("Gagal memuat data produk.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [product?.id]);

  // --- HELPER ---
  const getDefaultPrice = () => variants.length > 0 ? variants[0].price : 0;
  const getDefaultOriginalPrice = () => variants.length > 0 ? variants[0].original_price : 0;

  // --- HANDLERS GENERIC ---
  const handleGeneralChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGeneralData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSpecChange = (id, field, value) => {
    setSpecifications(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };
  const addSpec = () => setSpecifications(prev => [...prev, { id: `new-${Date.now()}`, spec_name: '', spec_value: '' }]);
  const removeSpec = (id) => setSpecifications(prev => prev.filter(s => s.id !== id));

  // --- HANDLERS VARIANTS (EXISTING) ---
  const handleVariantChange = (id, field, value) => {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const removeVariant = (id) => {
    if (window.confirm("Hapus varian ini?")) {
      setVariants(prev => prev.filter(v => v.id !== id));
    }
  };

  const handleUpdateGroupName = (oldName, newName) => {
    setVariants(prev => prev.map(v => v.color_name === oldName ? { ...v, color_name: newName } : v));
    setImages(prev => prev.map(img => img.linked_color_name === oldName ? { ...img, linked_color_name: newName } : img));
    if (isAddingVariantMode && newVariantForm.color_name === oldName) {
        setNewVariantForm(prev => ({ ...prev, color_name: newName }));
    }
  };

  const addSizeToGroup = (colorName) => {
    const newVariant = {
      id: `new-${Date.now()}`,
      product_id: product?.id,
      color_name: colorName,
      size_name: '',
      price: getDefaultPrice(),
      original_price: getDefaultOriginalPrice(),
      stock: 0
    };
    setVariants(prev => [...prev, newVariant]);
  };

  // --- FEATURE: REPLACE IMAGE (LOGIKA BARU: PREVIEW ONLY) ---
  const handleReplaceVariantImage = (e, colorName) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Simpan File di State Sementara
    setReplacedImages(prev => ({ ...prev, [colorName]: file }));

    // 2. Buat Preview URL (Blob) untuk UI
    const previewUrl = URL.createObjectURL(file);

    // 3. Update State Images (Hanya Tampilan)
    setImages(prev => {
        // Cek apakah sudah ada gambar untuk warna ini
        const exists = prev.find(img => img.linked_color_name === colorName);
        
        if (exists) {
            // Update URL gambar lama dengan preview baru
            return prev.map(img => 
                img.linked_color_name === colorName 
                ? { ...img, image_url: previewUrl, isTempPreview: true } // Tandai sebagai preview
                : img
            );
        } else {
            // Jika belum ada, tambah placeholder baru
            return [...prev, {
                id: `temp-preview-${Date.now()}`,
                product_id: product?.id,
                image_url: previewUrl,
                linked_color_name: colorName,
                isTempPreview: true
            }];
        }
    });
  };

  // --- HANDLERS NEW VARIANT FORM (PAGE 2) ---
  const handleOpenAddVariant = () => {
    setNewVariantForm({
      color_name: '',
      items: [{ id: 'temp-1', size_name: '', price: getDefaultPrice(), original_price: getDefaultOriginalPrice(), stock: 0 }]
    });
    setNewVariantFile(null);
    setIsAddingVariantMode(true);
  };

  const handleNewVariantItemChange = (itemId, field, value) => {
    setNewVariantForm(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === itemId ? { ...item, [field]: value } : item)
    }));
  };

  const addNewItemRow = () => {
    setNewVariantForm(prev => ({
      ...prev,
      items: [...prev.items, { id: `temp-${Date.now()}`, size_name: '', price: getDefaultPrice(), original_price: getDefaultOriginalPrice(), stock: 0 }]
    }));
  };

  const removeNewItemRow = (itemId) => {
    if (newVariantForm.items.length > 1) {
      setNewVariantForm(prev => ({ ...prev, items: prev.items.filter(item => item.id !== itemId) }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setNewVariantFile(file);
  };

  const saveNewVariantGroup = async () => {
    if (!newVariantForm.color_name) {
      alert("Nama warna harus diisi!");
      return;
    }
    setIsSaving(true);
    try {
      if (newVariantFile) {
        const fileName = `${product.id}-${Date.now()}-${newVariantFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const filePath = `products/${product.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('product_images').upload(filePath, newVariantFile);
        if (uploadError) throw new Error("Gagal upload gambar: " + uploadError.message);
        
        const { data: urlData } = supabase.storage.from('product_images').getPublicUrl(filePath);
        setImages(prev => [...prev, {
           id: `new-img-${Date.now()}`,
           product_id: product.id,
           image_url: urlData.publicUrl,
           linked_color_name: newVariantForm.color_name
        }]);
      }

      const newVariantsToAdd = newVariantForm.items.map(item => ({
        id: `new-${Date.now()}-${Math.random()}`,
        product_id: product?.id,
        color_name: newVariantForm.color_name,
        size_name: item.size_name,
        price: parseInt(item.price) || 0,
        original_price: parseInt(item.original_price) || 0,
        stock: parseInt(item.stock) || 0
      }));

      setVariants(prev => [...prev, ...newVariantsToAdd]);
      setIsAddingVariantMode(false);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // --- SUBMIT FINAL KE SERVER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // A. PROSES GAMBAR PENGGANTI (REPLACED IMAGES)
      const finalImages = [...images];

      for (const [colorName, file] of Object.entries(replacedImages)) {
         console.log(`Mengupload gambar baru untuk warna: ${colorName}...`);
         
         const fileExt = file.name.split('.').pop();
         const fileName = `${product.id}-${Date.now()}-${colorName.replace(/\s+/g, '_')}.${fileExt}`;
         const filePath = `products/${product.id}/${fileName}`;

         // 1. Upload ke Storage
         const { error: uploadError } = await supabase.storage
            .from('product_images')
            .upload(filePath, file, { upsert: true });

         if (uploadError) throw new Error(`Gagal upload gambar (${colorName}): ${uploadError.message}`);

         // 2. Dapatkan URL Publik
         const { data: urlData } = supabase.storage
            .from('product_images')
            .getPublicUrl(filePath);
        
         const publicUrl = urlData.publicUrl;

         // 3. Update array finalImages dengan URL asli
         const imgIndex = finalImages.findIndex(img => img.linked_color_name === colorName);
         
         if (imgIndex !== -1) {
            const oldImg = finalImages[imgIndex];
            if (oldImg.image_url && !oldImg.isTempPreview && oldImg.image_url.includes('product_images')) {
                 const oldPath = oldImg.image_url.split('/product_images/')[1];
                 if(oldPath) await supabase.storage.from('product_images').remove([oldPath]);
            }

            finalImages[imgIndex] = {
                ...finalImages[imgIndex],
                image_url: publicUrl,
                isTempPreview: undefined // Hapus flag preview
            };
         }
      }

      const payload = {
        name: generalData.name,
        description: generalData.description,
        full_description: generalData.full_description,
        badge: generalData.badge,
        is_new_arrival: generalData.is_new_arrival,
        is_featured: generalData.is_featured,
        variants: variants.map(v => ({
          id: v.id,
          product_id: product?.id,
          price: parseInt(v.price) || 0,
          original_price: parseInt(v.original_price) || 0,
          stock: parseInt(v.stock) || 0,
          color_name: v.color_name, 
          size_name: v.size_name
        })),
        specifications: specifications.map(s => ({ id: s.id, spec_name: s.spec_name, spec_value: s.spec_value })),
        images: finalImages // Gunakan array gambar yang sudah di-update URL-nya
      };

      const result = await updateProductFullData(product?.id, payload);

      if (result.success) {
        alert("Produk berhasil diperbarui!");
        if (onSave) onSave(result);
        if (onClose) onClose();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("❌ Error Saving:", error);
      alert(`Gagal menyimpan: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // --- HELPER: GROUP VARIANTS ---
  const groupedVariants = useMemo(() => {
    const groups = {};
    variants.forEach(variant => {
      const colorKey = variant.color_name || 'Tanpa Warna';
      if (!groups[colorKey]) groups[colorKey] = [];
      groups[colorKey].push(variant);
    });
    return groups;
  }, [variants]);

  const getVariantImage = (colorName) => {
    if (!colorName) return null;
    const found = images.find(img => img.linked_color_name?.toLowerCase() === colorName.toLowerCase());
    return found ? found.image_url : null;
  };

  return (
    <ModalWrapper onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <ModalHeader title="Edit Produk" subtitle={`ID: ${product?.id}`} onClose={onClose} />

        {/* NAVIGATION TABS */}
        {!isAddingVariantMode && (
          <div className="flex border-b border-gray-200 px-6 bg-white shrink-0 overflow-x-auto">
            {[
              { id: 'general', label: 'Informasi Umum', icon: Box },
              { id: 'images', label: `Gambar (${images.length})`, icon: ImageIcon },
              { id: 'variants', label: `Varian & Harga (${variants.length})`, icon: Layers },
              { id: 'specs', label: `Spesifikasi (${specifications.length})`, icon: Tag },
            ].map(tab => (
              <button
                key={tab.id}
                type="button" 
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'}`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-hidden bg-gray-50 relative min-h-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Memuat data...</p>
            </div>
          ) : (
            <div className="w-full h-full relative">
              
              {/* ... (Tab General, Images, Specs TETAP SAMA) ... */}
              {/* Salin dari kode sebelumnya untuk tab General, Images, dan Specs */}
              {/* Saya ringkas di sini agar fokus ke bagian Variants yang error */}
               
               {activeTab === 'general' && (
                <div className="h-full overflow-y-auto p-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2"><InputField label="Nama Produk" name="name" value={generalData.name} onChange={handleGeneralChange} /></div>
                        <div><InputField label="Badge Label" name="badge" value={generalData.badge || ''} onChange={handleGeneralChange} /></div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <CheckboxField label="New Arrival" checked={generalData.is_new_arrival} onChange={(val) => setGeneralData(prev => ({ ...prev, is_new_arrival: val }))} />
                        <CheckboxField label="Featured" checked={generalData.is_featured} onChange={(val) => setGeneralData(prev => ({ ...prev, is_featured: val }))} />
                      </div>
                      <div className="grid grid-cols-1 gap-6">
                        <TextAreaField label="Deskripsi Singkat" name="description" value={generalData.description} onChange={handleGeneralChange} rows={2} />
                        <TextAreaField label="Deskripsi Lengkap" name="full_description" value={generalData.full_description} onChange={handleGeneralChange} rows={5} />
                      </div>
                    </div>
                </div>
              )}
               {activeTab === 'images' && (
                    <div className="h-full overflow-y-auto p-6">
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {images.map((img) => (
                            <div key={img.id} className="group relative aspect-square bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                              <img src={img.image_url} alt="Product" className="w-full h-full object-cover" />
                              {img.linked_color_name && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-1 text-xs font-bold text-center text-white">
                                  {img.linked_color_name}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="p-4 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-100">
                             💡 Untuk menambah gambar baru, silakan gunakan menu "Varian & Harga" "Tambah Varian Baru". Gambar akan otomatis masuk ke sini.
                        </div>
                    </div>
                    </div>
                  )}

                  {/* TAB SPECS */}
                  {activeTab === 'specs' && (
                    <div className="h-full overflow-y-auto p-6">
                    <div className="space-y-4">
                      <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-3 w-1/3">Nama Spesifikasi</th>
                              <th className="px-6 py-3">Nilai</th>
                              <th className="px-4 py-3 w-16"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {specifications.map((spec) => (
                              <tr key={spec.id} className="group hover:bg-gray-50">
                                <td className="px-6 py-2"><input className="w-full bg-transparent border-b border-transparent focus:border-black outline-none py-1" value={spec.spec_name} onChange={(e) => handleSpecChange(spec.id, 'spec_name', e.target.value)} /></td>
                                <td className="px-6 py-2"><input className="w-full bg-transparent border-b border-transparent focus:border-black outline-none py-1" value={spec.spec_value} onChange={(e) => handleSpecChange(spec.id, 'spec_value', e.target.value)} /></td>
                                <td className="px-4 py-2 text-right"><button type="button" onClick={() => removeSpec(spec.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded"><Trash2 size={16} /></button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <button type="button" onClick={addSpec} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"><Plus size={16} /> Tambah Spesifikasi</button>
                    </div>
                    </div>
                  )}

              {activeTab === 'variants' && (
                <div className={`flex w-[200%] h-full transition-transform duration-500 ease-in-out ${isAddingVariantMode ? '-translate-x-1/2' : 'translate-x-0'}`}>
                  
                  {/* --- PAGE 1: LIST VIEW (GROUPED) --- */}
                  <div className="w-1/2 h-full overflow-y-auto p-6">
                    <div className="space-y-6">
                      {Object.keys(groupedVariants).length === 0 ? (
                          <div className="text-center py-10 text-gray-400">Belum ada varian. Klik tombol di bawah untuk menambah.</div>
                      ) : (
                        Object.entries(groupedVariants).map(([colorName, groupItems], idx) => {
                          const variantImg = getVariantImage(colorName);
                          // Cek apakah gambar sedang diupload untuk grup warna ini
                          const isUploadingThis = uploadingColor === colorName;

                          return (
                            <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                              {/* Group Header */}
                              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-4">
                                
                                {/* IMAGE UPLOAD AREA (FITUR BARU & FIX) */}
                                <div className="relative group/img cursor-pointer w-12 h-12 shrink-0">
                                  <div className="w-full h-full rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden relative">
                                     {variantImg ? (
                                         <img src={variantImg} className={`w-full h-full object-cover transition-opacity ${isUploadingThis ? 'opacity-50' : ''}`} />
                                     ) : (
                                         <ImageIcon size={20} className="text-gray-300" />
                                     )}
                                     
                                     {/* Loading Spinner */}
                                     {isUploadingThis && (
                                         <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                                             <Loader2 className="w-5 h-5 animate-spin text-black" />
                                         </div>
                                     )}

                                     {/* Overlay Edit */}
                                     {!isUploadingThis && (
                                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity rounded-lg">
                                           <Edit size={16} className="text-white" />
                                       </div>
                                     )}
                                  </div>
                                  
                                  {/* Hidden Input File */}
                                  <input 
                                    type="file" 
                                    accept="image/*"
                                    disabled={!!isUploadingThis} // Disable saat loading
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={(e) => handleReplaceVariantImage(e, colorName)}
                                  />
                                </div>

                                <div className="flex-1">
                                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nama Warna / Varian</label>
                                  <input 
                                    type="text" 
                                    className="block w-full bg-transparent font-bold text-gray-900 border-b border-transparent focus:border-black outline-none focus:bg-white transition-all px-1 -ml-1"
                                    value={colorName}
                                    onChange={(e) => handleUpdateGroupName(colorName, e.target.value)}
                                  />
                                </div>
                                <div className="text-xs text-gray-400 font-mono bg-white px-2 py-1 rounded border">
                                  {groupItems.length} Sizes
                                </div>
                              </div>

                              {/* Group Items Table */}
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                  <thead className="bg-white text-gray-500 text-xs uppercase border-b border-gray-100">
                                    <tr>
                                      <th className="px-4 py-2 w-20">Size</th>
                                      <th className="px-4 py-2">Harga Jual</th>
                                      <th className="px-4 py-2">Harga Asli</th>
                                      <th className="px-4 py-2 w-20">Stok</th>
                                      <th className="px-4 py-2 w-10"></th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-50">
                                    {groupItems.map((v) => (
                                      <tr key={v.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2">
                                          <input className="w-full bg-transparent text-center font-medium border border-transparent hover:border-gray-200 focus:border-black focus:bg-white rounded px-1 py-0.5 outline-none" value={v.size_name} onChange={(e) => handleVariantChange(v.id, 'size_name', e.target.value)} placeholder="Size" />
                                        </td>
                                        <td className="px-4 py-2"><input className="w-full bg-transparent text-right font-mono text-gray-900 border border-transparent hover:border-gray-200 focus:border-black focus:bg-white rounded px-1 py-0.5 outline-none" value={v.price} onChange={(e) => handleVariantChange(v.id, 'price', e.target.value.replace(/\D/g,''))} /></td>
                                        <td className="px-4 py-2"><input className="w-full bg-transparent text-right font-mono text-gray-400 border border-transparent hover:border-gray-200 focus:border-black focus:bg-white rounded px-1 py-0.5 outline-none" value={v.original_price} onChange={(e) => handleVariantChange(v.id, 'original_price', e.target.value.replace(/\D/g,''))} /></td>
                                        <td className="px-4 py-2"><input className={`w-full bg-transparent text-center font-mono border border-transparent hover:border-gray-200 focus:border-black focus:bg-white rounded px-1 py-0.5 outline-none ${v.stock < 10 ? 'text-red-600 font-bold' : ''}`} value={v.stock} onChange={(e) => handleVariantChange(v.id, 'stock', e.target.value.replace(/\D/g,''))} /></td>
                                        <td className="px-4 py-2 text-right">
                                          <button type="button" onClick={() => removeVariant(v.id)} className="text-gray-300 hover:text-red-500 transition-colors"><X size={14}/></button>
                                        </td>
                                      </tr>
                                    ))}
                                    <tr>
                                      <td colSpan={5} className="px-2 py-1">
                                        <button type="button" onClick={() => addSizeToGroup(colorName)} className="w-full py-1 text-xs text-center text-gray-400 hover:text-black hover:bg-gray-50 border border-dashed border-gray-200 hover:border-gray-300 rounded transition-all">+ Tambah Size ke {colorName}</button>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* --- PAGE 2: ADD NEW VARIANT FORM --- */}
                  <div className="w-1/2 h-full overflow-y-auto p-6 bg-gray-50">
                    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[500px] flex flex-col">
                      {/* Header Page 2 */}
                      <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                        <button type="button" onClick={() => setIsAddingVariantMode(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                          <ArrowLeft size={20} />
                        </button>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Tambah Varian Baru</h3>
                          <p className="text-sm text-gray-500">Buat grup warna baru dan tambahkan ukuran</p>
                        </div>
                      </div>

                      {/* Form Content */}
                      <div className="space-y-6 flex-1">
                        
                        <div className="flex gap-6">
                           {/* Upload Real */}
                           <div className="w-32 shrink-0">
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Foto Varian</label>
                              <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-black hover:text-black cursor-pointer transition-colors group overflow-hidden relative">
                                {newVariantFile ? (
                                    <img src={URL.createObjectURL(newVariantFile)} className="w-full h-full object-cover absolute inset-0" />
                                ) : (
                                    <>
                                        <UploadCloud size={24} className="mb-2 group-hover:scale-110 transition-transform"/>
                                        <span className="text-[10px] text-center px-2">Upload</span>
                                    </>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                              </label>
                           </div>
                           
                           {/* Color Input */}
                           <div className="flex-1">
                              <InputField 
                                label="Nama Warna (Grup)" 
                                placeholder="Contoh: Merah Maroon" 
                                value={newVariantForm.color_name}
                                onChange={(e) => setNewVariantForm({...newVariantForm, color_name: e.target.value})}
                              />
                              <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded border border-blue-100">
                                💡 Tip: Menambahkan banyak ukuran sekaligus akan membuat stok manajemen lebih rapi.
                              </div>
                           </div>
                        </div>

                        {/* Dynamic Size List */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Daftar Ukuran & Harga</label>
                             <button type="button" onClick={addNewItemRow} className="text-xs font-bold text-blue-600 hover:underline">+ Baris Baru</button>
                          </div>
                          
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200">
                                <tr>
                                  <th className="px-3 py-2 text-left">Size</th>
                                  <th className="px-3 py-2 text-right">Harga Jual</th>
                                  <th className="px-3 py-2 text-right">Harga Coret</th>
                                  <th className="px-3 py-2 text-center">Stok</th>
                                  <th className="px-2 py-2 w-8"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {newVariantForm.items.map((item, idx) => (
                                  <tr key={item.id} className="bg-white">
                                    <td className="p-2"><input className="w-full border border-gray-300 rounded px-2 py-1.5 focus:border-black outline-none" placeholder="S/M/L" value={item.size_name} onChange={(e) => handleNewVariantItemChange(item.id, 'size_name', e.target.value)} /></td>
                                    <td className="p-2"><input className="w-full border border-gray-300 rounded px-2 py-1.5 focus:border-black outline-none text-right font-mono" placeholder="0" value={item.price} onChange={(e) => handleNewVariantItemChange(item.id, 'price', e.target.value.replace(/\D/g,''))} /></td>
                                    <td className="p-2"><input className="w-full border border-gray-300 rounded px-2 py-1.5 focus:border-black outline-none text-right font-mono text-gray-500" placeholder="0" value={item.original_price} onChange={(e) => handleNewVariantItemChange(item.id, 'original_price', e.target.value.replace(/\D/g,''))} /></td>
                                    <td className="p-2"><input className="w-full border border-gray-300 rounded px-2 py-1.5 focus:border-black outline-none text-center font-mono" placeholder="0" value={item.stock} onChange={(e) => handleNewVariantItemChange(item.id, 'stock', e.target.value.replace(/\D/g,''))} /></td>
                                    <td className="p-2 text-center"><button type="button" onClick={() => removeNewItemRow(item.id)} disabled={newVariantForm.items.length <= 1} className="text-gray-400 hover:text-red-500 disabled:opacity-30"><Trash2 size={16} /></button></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                      </div>

                      {/* Footer Page 2 */}
                      <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3">
                          <button type="button" onClick={() => setIsAddingVariantMode(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                          <button type="button" onClick={saveNewVariantGroup} disabled={isSaving} className="px-6 py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50">
                            {isSaving ? <Loader2 className="animate-spin w-4 h-4"/> : <Save size={16}/>} Simpan Varian
                          </button>
                      </div>

                    </div>
                  </div>

                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        {!isAddingVariantMode && (
          <ModalFooter>
              {activeTab === 'variants' && (
                <button type="button" onClick={handleOpenAddVariant} className="px-5 py-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-100 font-medium text-sm flex items-center gap-2 mr-auto">
                  <Plus size={16} /> Tambah Varian Baru
                </button>
              )}
            <button type="button" onClick={onClose} disabled={isSaving} className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm disabled:opacity-50">Batal</button>
            <button type="submit" disabled={isSaving} className="px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-900 shadow-lg shadow-black/20 font-medium text-sm flex items-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all">
              {isSaving ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : <><Save size={16} /> Simpan Perubahan</>}
            </button>
          </ModalFooter>
        )}
      </form>
    </ModalWrapper>
  );
}