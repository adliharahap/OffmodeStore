"use client";
import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Loader2, Plus, Trash2, Image as ImageIcon, Tag, Box, Layers, Save } from 'lucide-react';
import { getProductDataById, updateProductFullData } from '../../../../../../utils/getProductDataAction';


// --- UI COMPONENTS ---

const ModalWrapper = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden ring-1 ring-gray-200">
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
  <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0 z-10">
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

export default function ProductEditModal({ product = { id: '123' }, onClose, onSave }) {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);

  // Data States
  const [generalData, setGeneralData] = useState({
    name: '', description: '', full_description: '', badge: '', is_new_arrival: false, is_featured: false,
    rating: 0, sold_count_total: 0, created_at: ''
  });
  const [variants, setVariants] = useState([]);
  const [specifications, setSpecifications] = useState([]);
  const [images, setImages] = useState([]);

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
        console.error("Error fetching:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [product?.id]);

  // --- HANDLERS ---

  const handleGeneralChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGeneralData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleVariantChange = (id, field, value) => {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const handleSpecChange = (id, field, value) => {
    setSpecifications(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const addSpec = () => {
    setSpecifications(prev => [...prev, { id: `new-${Date.now()}`, spec_name: '', spec_value: '' }]);
  };

  const removeSpec = (id) => {
    setSpecifications(prev => prev.filter(s => s.id !== id));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Persiapkan Payload sesuai format yang diterima Server Action (updateProductFullData)
      const payload = {
        // Data General
        name: generalData.name,
        description: generalData.description,
        full_description: generalData.full_description,
        badge: generalData.badge,
        is_new_arrival: generalData.is_new_arrival,
        is_featured: generalData.is_featured,

        // Data Relasional
        variants: variants.map(v => ({
          id: v.id,
          product_id: product.id,
          price: parseInt(v.price), // Pastikan format number
          original_price: parseInt(v.original_price) || 0,
          stock: parseInt(v.stock),
          color_name: v.color_name, 
          size_name: v.size_name
        })),

        specifications: specifications.map(s => ({
          id: s.id, // ID lama atau 'new-...'
          spec_name: s.spec_name,
          spec_value: s.spec_value
        }))
      };

      // console.log("🚀 Sending Payload:", payload);

      // 2. Panggil Server Action
      const result = await updateProductFullData(product.id, payload);

      // 3. Cek Hasil
      if (result.success) {
        // Feedback Sukses
        // Jika pakai SweetAlert2:
        // Swal.fire('Berhasil!', 'Data produk berhasil diperbarui.', 'success');

        // Atau pakai alert standar:
        alert("✅ Produk berhasil diperbarui!");

        // Panggil onSave dari parent jika ada (misal untuk refresh table parent)
        if (onSave) onSave(result);

        // Tutup Modal
        if (onClose) onClose();
      } else {
        throw new Error(result.message);
      }

    } catch (error) {
      console.error("❌ Error Saving:", error);
      alert(`Gagal menyimpan: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- HELPER: GET IMAGE BY VARIANT COLOR ---
  const getVariantImage = (colorName) => {
    if (!colorName) return null;
    // Cari gambar yang 'linked_color_name' nya sama dengan warna variant ini
    const found = images.find(img => img.linked_color_name?.toLowerCase() === colorName.toLowerCase());
    // Jika tidak ada yang spesifik warna, kembalikan gambar pertama (default) atau null
    return found ? found.image_url : (images[0]?.image_url || null);
  };

  return (
    <ModalWrapper onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
        <ModalHeader title="Edit Produk" subtitle={`ID: ${product?.id}`} onClose={onClose} />

        {/* NAVIGATION TABS */}
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
              className={`flex items-center gap-2 py-4 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* === TAB: GENERAL === */}
              {activeTab === 'general' && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                  {/* Info Utama */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <InputField label="Nama Produk" name="name" value={generalData.name} onChange={handleGeneralChange} />
                    </div>
                    <div>
                      <InputField label="Badge Label" name="badge" value={generalData.badge || ''} onChange={handleGeneralChange} />
                    </div>
                  </div>

                  {/* Status Checkboxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <CheckboxField
                      label="New Arrival (Produk Baru)"
                      checked={generalData.is_new_arrival}
                      onChange={(val) => setGeneralData(prev => ({ ...prev, is_new_arrival: val }))}
                    />
                    <CheckboxField
                      label="Featured (Unggulan)"
                      checked={generalData.is_featured}
                      onChange={(val) => setGeneralData(prev => ({ ...prev, is_featured: val }))}
                    />
                  </div>

                  {/* Deskripsi */}
                  <div className="grid grid-cols-1 gap-6">
                    <TextAreaField label="Deskripsi Singkat" name="description" value={generalData.description} onChange={handleGeneralChange} rows={2} />
                    <TextAreaField label="Deskripsi Lengkap" name="full_description" value={generalData.full_description} onChange={handleGeneralChange} rows={5} />
                  </div>

                  {/* Read Only Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <span className="text-xs text-blue-600 font-bold uppercase">Total Terjual</span>
                      <p className="text-lg font-mono font-medium text-blue-900">{generalData.sold_count_total || 0}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <span className="text-xs text-yellow-600 font-bold uppercase">Rating</span>
                      <p className="text-lg font-mono font-medium text-yellow-900">{generalData.rating || '-'}</p>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <span className="text-xs text-gray-500 font-bold uppercase">Dibuat Pada</span>
                      <p className="text-xs font-mono text-gray-700 mt-1">{generalData.created_at ? new Date(generalData.created_at).toLocaleDateString('id-ID') : '-'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* === TAB: IMAGES === */}
              {activeTab === 'images' && (
                <div className="space-y-6">
                  {/* Group 1: General Gallery (linked_color_name == null) */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Galeri Utama</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {images.filter(img => !img.linked_color_name).map((img) => (
                        <div key={img.id} className="group relative aspect-square bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                          <img src={img.image_url} alt="Product" className="w-full h-full object-cover" />
                          <div className="absolute bottom-0 left-0 right-0 bg-white p-2 border-t text-xs font-mono text-center truncate">
                            Gambar Umum
                          </div>
                        </div>
                      ))}
                      {/* Tombol tambah dummy */}
                      <button type="button" onClick={() => { alert("Fitur Sedang Dalam Tahap Pengembangan") }} className="aspect-square rounded-xl cursor-not-allowed border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-all">
                        <Plus size={24} />
                        <span className="text-xs font-medium mt-2">Upload</span>
                      </button>
                    </div>
                  </div>

                  {/* Group 2: Color Linked (linked_color_name != null) */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Linked Varian Colors</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {images.filter(img => img.linked_color_name).map((img) => (
                        <div key={img.id} className="group relative aspect-square bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                          <img src={img.image_url} alt={img.linked_color_name} className="w-full h-full object-cover" />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-2 text-xs font-bold text-center text-white">
                            {img.linked_color_name}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      * Gambar ini akan otomatis muncul di tabel varian berdasarkan nama warna.
                    </p>
                  </div>
                </div>
              )}

              {/* === TAB: VARIANTS === */}
              {activeTab === 'variants' && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 w-16 text-center">Img</th>
                          <th className="px-4 py-3">Warna</th>
                          <th className="px-4 py-3 w-24">Size</th>
                          <th className="px-4 py-3 min-w-[140px]">Harga (IDR)</th>
                          <th className="px-4 py-3 min-w-[140px]">Harga Asli</th>
                          <th className="px-4 py-3 w-24">Stok</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {variants.map((variant) => {
                          // AUTO MATCH IMAGE BASED ON COLOR
                          const variantImg = getVariantImage(variant.color_name);

                          return (
                            <tr key={variant.id} className="hover:bg-gray-50 group">
                              {/* COL 1: IMAGE PREVIEW */}
                              <td className="px-4 py-3">
                                <div className="w-10 h-10 rounded-lg border border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                                  {variantImg ? (
                                    <img src={variantImg} alt={variant.color_name} className="w-full h-full object-cover" />
                                  ) : (
                                    <ImageIcon size={16} className="text-gray-300" />
                                  )}
                                </div>
                              </td>
                              {/* COL 2: COLOR */}
                              <td className="px-4 py-3 font-medium text-gray-900">
                                {variant.color_name}
                              </td>
                              {/* COL 3: SIZE */}
                              <td className="px-4 py-3">
                                <div className="inline-flex items-center justify-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                  {variant.size_name}
                                </div>
                              </td>
                              {/* COL 4: PRICE */}
                              <td className="px-4 py-3">
                                <input
                                  type="text"
                                  inputMode='numeric'
                                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black outline-none text-right font-mono text-sm"
                                  value={variant.price}
                                  onChange={(e) => {
                                    const onlyNum = e.target.value.replace(/[^0-9]/g, "");
                                    handleVariantChange(variant.id, "price", onlyNum);
                                  }}
                                />
                              </td>
                              {/* COL 5: ORIGINAL PRICE */}
                              <td className="px-4 py-3">
                                <input
                                  type="text"
                                  inputMode='numeric'
                                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black outline-none text-right font-mono text-sm text-gray-500"
                                  value={variant.original_price || 0}
                                  onChange={(e) => {
                                    const onlyNum = e.target.value.replace(/[^0-9]/g, "");
                                    handleVariantChange(variant.id, "original_price", onlyNum);
                                  }}
                                />
                              </td>
                              {/* COL 6: STOCK */}
                              <td className="px-4 py-3">
                                <input
                                  type="text"
                                  inputMode='numeric'
                                  className={`w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-black outline-none text-center font-mono text-sm ${variant.stock < 10 ? 'border-red-300 bg-red-50 text-red-600' : 'border-gray-300'
                                    }`}
                                  value={variant.stock}
                                  onChange={(e) => {
                                    const onlyNum = e.target.value.replace(/[^0-9]/g, "");
                                    handleVariantChange(variant.id, "stock", onlyNum);
                                  }}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* === TAB: SPECIFICATIONS === */}
              {activeTab === 'specs' && (
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
                            <td className="px-6 py-2">
                              <input
                                className="w-full bg-transparent border-b border-transparent focus:border-black outline-none py-1"
                                value={spec.spec_name}
                                placeholder="Contoh: Bahan"
                                onChange={(e) => handleSpecChange(spec.id, 'spec_name', e.target.value)}
                              />
                            </td>
                            <td className="px-6 py-2">
                              <input
                                className="w-full bg-transparent border-b border-transparent focus:border-black outline-none py-1"
                                value={spec.spec_value}
                                placeholder="Contoh: Katun 100%"
                                onChange={(e) => handleSpecChange(spec.id, 'spec_value', e.target.value)}
                              />
                            </td>
                            <td className="px-4 py-2 text-right">
                              <button
                                type="button"
                                onClick={() => removeSpec(spec.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {specifications.length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-6 py-8 text-center text-gray-400 italic">
                              Belum ada spesifikasi
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <button
                    type="button"
                    onClick={addSpec}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    <Plus size={16} />
                    Tambah Spesifikasi
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <ModalFooter>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-900 shadow-lg shadow-black/20 font-medium text-sm flex items-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={16} /> {/* Ganti icon Check dengan Save agar lebih relevan */}
                Simpan Perubahan
              </>
            )}
          </button>
        </ModalFooter>
      </form>
    </ModalWrapper>
  );
}