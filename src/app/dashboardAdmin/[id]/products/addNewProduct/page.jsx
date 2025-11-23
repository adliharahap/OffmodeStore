"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Upload, X, Plus, Trash2, ChevronLeft, Save, 
  Tag, Package, Warehouse, ImageIcon, Sparkles,
  ClipboardList, Loader2, Percent 
} from 'lucide-react';
import Link from 'next/link'; 
import { useRouter } from 'next/navigation'; 
import { supabase } from "../../../../../../lib/supabaseClient";

export default function AddNewProductPage() {
  // === STATE MANAGEMENT ===
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    description: '',
    fullDescription: '',
    badge: '',
    is_new_arrival: false,
  });
  
  // 1. DEFAULT VALUE '0' (Sesuai Request)
  const [defaultPrices, setDefaultPrices] = useState({
    price: '0', 
    originalPrice: '0',
  });

  const [specifications, setSpecifications] = useState([
    { id: 1, name: '', value: '' }
  ]);
  
  const [sizeInput, setSizeInput] = useState('S, M, L, XL');
  
  const [colors, setColors] = useState([
    { id: 1, name: 'Putih Gading', thumbnail: null },
    { id: 2, name: 'Biru Navy', thumbnail: null },
  ]);
  
  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const router = useRouter();

  // === MEMOIZED DATA & CALCULATIONS ===
  const definedSizes = useMemo(() => {
    return sizeInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }, [sizeInput]);

  const colorNames = useMemo(() => {
    return colors.map(c => c.name).filter(Boolean);
  }, [colors]);

  // 2. FUNGSI HITUNG DISKON OTOMATIS
  const discountPercentage = useMemo(() => {
    const price = parseInt(defaultPrices.price || 0);
    const original = parseInt(defaultPrices.originalPrice || 0);
    
    if (original > price && original > 0) {
      const discount = Math.round(((original - price) / original) * 100);
      return discount > 0 ? `${discount}%` : null;
    }
    return null;
  }, [defaultPrices.price, defaultPrices.originalPrice]);


  // === EFFECTS (LOGIC AUTO-SYNC) ===

  // Effect A: Generate Struktur Varian (Row Baru)
  useEffect(() => {
    setVariants(prevVariants => {
      const newVariants = [];
      colors.filter(c => c.name).forEach(color => {
        definedSizes.forEach(size => {
          const id = `${color.name}-${size}`;
          const existing = prevVariants.find(v => v.id === id);
          
          if (existing) {
            newVariants.push(existing);
          } else {
            // Row Baru: Gunakan harga dari Default Prices & isEdited false
            newVariants.push({
              id: id,
              color: color.name,
              size: size,
              price: defaultPrices.price,        
              originalPrice: defaultPrices.originalPrice, 
              stock: '0',
              isEdited: false // Flag: Belum diedit manual
            });
          }
        });
      });
      return newVariants;
    });
    // Dependency: Hanya jalan saat struktur warna/size berubah
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [definedSizes, colors]); 


  // Effect B: Smart Price Sync (Update Harga Varian yang Belum Diedit)
  // 3. LOGIC SINKRONISASI HARGA
  useEffect(() => {
    setVariants(prev => prev.map(v => {
      // Jika user sudah edit manual (isEdited === true), JANGAN diubah
      if (v.isEdited) return v;

      // Jika belum disentuh, ikuti harga induk
      return {
        ...v,
        price: defaultPrices.price,
        originalPrice: defaultPrices.originalPrice
      };
    }));
  }, [defaultPrices.price, defaultPrices.originalPrice]);


  // === HANDLERS ===

  const handleBasicInfoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBasicInfo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleNumericChange = (setter, field, value) => {
    // Regex angka only. Jika kosong '', biarkan agar user bisa hapus, 
    // nanti onBlur kita set ke '0' kalau mau strict.
    if (value === '' || /^[0-9]+$/.test(value)) {
      setter(prev => ({ ...prev, [field]: value }));
    }
  };

  // Saat input kehilangan fokus (onBlur), jika kosong set jadi '0'
  const handleBlur = (setter, field, value) => {
    if (value === '') {
      setter(prev => ({ ...prev, [field]: '0' }));
    }
  };

  const handleDefaultPriceChange = (e) => {
    const { name, value } = e.target;
    handleNumericChange(setDefaultPrices, name, value);
  };

  const handleSpecChange = (id, field, value) => {
    setSpecifications(prev => prev.map(spec => spec.id === id ? { ...spec, [field]: value } : spec));
  };
  const addSpec = () => setSpecifications(prev => [...prev, { id: Date.now(), name: '', value: '' }]);
  const removeSpec = (id) => setSpecifications(prev => prev.filter(spec => spec.id !== id));

  const handleColorChange = (id, field, value) => {
    setColors(prev => prev.map(color => color.id === id ? { ...color, [field]: value } : color));
  };
  const addColor = () => setColors(prev => [...prev, { id: Date.now(), name: '', thumbnail: null }]);
  const removeColor = (id) => setColors(prev => prev.filter(color => color.id !== id));

  // Handler Varian: Saat user mengetik di tabel, tandai sebagai Edited
  const handleVariantChange = (id, field, value) => {
    if (value === '' || /^[0-9]+$/.test(value)) {
      setVariants(prev => prev.map(variant => {
        if (variant.id === id) {
          // Cek apakah field yang diedit adalah harga
          const isPriceField = field === 'price' || field === 'originalPrice';
          
          return { 
            ...variant, 
            [field]: value,
            // Jika user ubah harga/stok, tandai isEdited = true 
            // (Agar tidak tertimpa otomatis lagi)
            isEdited: isPriceField ? true : variant.isEdited 
          };
        }
        return variant;
      }));
    }
  };

  // Tombol Reset Manual Edit (Opsional: Jika ingin mengembalikan ke mode auto)
  const resetVariantToDefault = (id) => {
    setVariants(prev => prev.map(v => {
      if (v.id === id) {
        return {
          ...v,
          price: defaultPrices.price,
          originalPrice: defaultPrices.originalPrice,
          isEdited: false // Kembalikan ke mode auto
        };
      }
      return v;
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      preview: URL.createObjectURL(file),
      linkedColorName: ''
    }));
    setImages(prev => [...prev, ...newImages]);
  };
  const removeImage = (id) => setImages(prev => prev.filter(img => img.id !== id));
  const handleImageColorLink = (id, colorName) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, linkedColorName: colorName } : img));
  };

  // === SUBMIT LOGIC ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    let newProductId = null;

    try {
      if (!basicInfo.name) throw new Error("Nama produk wajib diisi.");
      if (variants.length === 0) throw new Error("Minimal harus ada 1 varian produk.");
      if (images.length === 0) throw new Error("Minimal harus ada 1 gambar produk.");
      
      // Insert Produk
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert({
          name: basicInfo.name,
          description: basicInfo.description,
          full_description: basicInfo.fullDescription,
          badge: discountPercentage ? `${discountPercentage} OFF` : (basicInfo.badge || null), // Auto Badge Diskon jika ada
          is_new_arrival: basicInfo.is_new_arrival,
        })
        .select('id')
        .single();

      if (productError) throw new Error(`Gagal membuat produk: ${productError.message}`);
      newProductId = productData.id;

      // Upload Gambar
      const imageBucketName = 'product_images'; 
      const imagePromises = images.map(async (image) => {
        const file = image.file;
        const filePath = `products/${newProductId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const { error: uploadError } = await supabase.storage.from(imageBucketName).upload(filePath, file);
        if (uploadError) throw new Error(`Gagal upload gambar: ${uploadError.message}`);
        const { data: urlData } = supabase.storage.from(imageBucketName).getPublicUrl(filePath);
        return { product_id: newProductId, image_url: urlData.publicUrl, linked_color_name: image.linkedColorName || null };
      });
      const imagesToInsert = await Promise.all(imagePromises);
      const { error: imagesError } = await supabase.from('product_images').insert(imagesToInsert);
      if (imagesError) throw new Error(`Gagal menyimpan data gambar: ${imagesError.message}`);

      // Insert Spek
      const specsToInsert = specifications.filter(s => s.name && s.value).map(s => ({
        product_id: newProductId, spec_name: s.name, spec_value: s.value
      }));
      if (specsToInsert.length > 0) {
        const { error: specsError } = await supabase.from('product_specifications').insert(specsToInsert);
        if (specsError) throw new Error(`Gagal menyimpan spesifikasi: ${specsError.message}`);
      }

      // Insert Varian
      const variantsToInsert = variants.map(v => ({
        product_id: newProductId, 
        color_name: v.color, 
        size_name: v.size,
        price: parseInt(v.price) || 0, 
        original_price: parseInt(v.originalPrice) || null, 
        stock: parseInt(v.stock) || 0,
      }));
      
      const { error: variantsError } = await supabase.from('product_variants').insert(variantsToInsert);
      if (variantsError) throw new Error(`Gagal menyimpan varian: ${variantsError.message}`);

      setIsLoading(false);
      alert("Produk berhasil ditambahkan!"); 
      // router.push('/admin/products');

    } catch (err) {
      console.error(err);
      setError(err.message);
      setIsLoading(false);
      if (newProductId) {
        await supabase.from('products').delete().match({ id: newProductId });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6 mt-20 md:mt-0 p-8">
      
      {/* Kolom Kiri */}
      <div className="flex-1 lg:w-2/3 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tambah Produk Baru</h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-lg">
            <p className="font-bold">Error:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <FormCard title="Informasi Dasar" icon={Package}>
          <InputField label="Nama Produk" name="name" value={basicInfo.name} onChange={handleBasicInfoChange} placeholder="Kemeja Linen" required />
          <TextAreaField label="Deskripsi Singkat" name="description" value={basicInfo.description} onChange={handleBasicInfoChange} rows={3} />
          <TextAreaField label="Deskripsi Lengkap" name="fullDescription" value={basicInfo.fullDescription} onChange={handleBasicInfoChange} rows={6} />
        </FormCard>

        <FormCard title="Galeri Gambar" icon={ImageIcon}>
          <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center relative">
            <Upload size={40} className="mx-auto text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">Upload Gambar</p>
            <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" disabled={isLoading} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {images.map(img => (
              <ImagePreview key={img.id} image={img} colorNames={colorNames} onRemove={removeImage} onLinkColor={handleImageColorLink} />
            ))}
          </div>
        </FormCard>

        <FormCard title="Varian Produk" icon={Warehouse}>
          <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100 flex gap-3 items-start">
            <div className="mt-1"><Sparkles size={18} className="text-blue-600" /></div>
            <div className="text-sm text-blue-800">
              <p><strong>Auto Sync Harga:</strong> Tabel di bawah otomatis mengikuti "Harga Dasar".</p>
              <p className="mt-1 text-blue-600 text-xs">Jika Anda mengedit harga di tabel secara manual, baris tersebut akan terkunci dan tidak akan berubah otomatis lagi.</p>
            </div>
          </div>

          <InputField 
            label="Ukuran (Pisahkan dengan koma)"
            name="sizes"
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value.toUpperCase())}
            placeholder="S, M, L, XL"
          />
          
          <label className="block text-sm font-medium text-gray-700 mb-2">Warna</label>
          <div className="space-y-3 mb-6">
            {colors.map((color) => (
              <div key={color.id} className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={color.name} 
                  onChange={(e) => handleColorChange(color.id, 'name', e.target.value)}
                  placeholder="Nama Warna"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button type="button" onClick={() => removeColor(color.id)} className="text-red-500 p-2 hover:bg-red-100 rounded-full">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button type="button" onClick={addColor} className="flex items-center text-sm text-gray-700 font-medium hover:text-gray-900">
              <Plus size={16} className="mr-1" />
              Tambah Warna
            </button>
          </div>

          {/* Pass handler untuk resetManual */}
          <VariantStockTable 
            variants={variants} 
            onVariantChange={handleVariantChange}
            onResetRow={resetVariantToDefault}
          />
        </FormCard>

        <FormCard title="Spesifikasi" icon={ClipboardList}>
          <div className="space-y-3">
            {specifications.map((spec) => (
              <div key={spec.id} className="flex items-center gap-2">
                <input type="text" value={spec.name} onChange={(e) => handleSpecChange(spec.id, 'name', e.target.value)} placeholder="Nama" className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg" />
                <input type="text" value={spec.value} onChange={(e) => handleSpecChange(spec.id, 'value', e.target.value)} placeholder="Nilai" className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg" />
                <button type="button" onClick={() => removeSpec(spec.id)} className="text-red-500 p-2 hover:bg-red-100 rounded-full"><Trash2 size={16} /></button>
              </div>
            ))}
            <button type="button" onClick={addSpec} className="flex items-center text-sm text-gray-700 font-medium hover:text-gray-900"><Plus size={16} className="mr-1" /> Tambah Spesifikasi</button>
          </div>
        </FormCard>
      </div>

      {/* Kolom Kanan */}
      <div className="lg:w-1/3 flex flex-col gap-6 lg:sticky lg:top-10 h-fit">

        <div className="order-last lg:order-first">
          <FormCard title="Aksi" icon={Save}>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg flex items-center justify-center font-medium shadow-md hover:bg-gray-800 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Save size={18} className="mr-2" />}
              {isLoading ? 'Menyimpan...' : 'Simpan Produk'}
            </button>
            <Link href="/admin/products" className="w-full bg-white text-gray-700 border border-gray-300 px-4 py-3 mt-3 rounded-lg flex items-center justify-center font-medium hover:bg-gray-50 transition-colors">
              Batal
            </Link>
          </FormCard>
        </div>

        <div className="space-y-6">
          <FormCard title="Harga Dasar (Default)" icon={Tag}>
            <InputField 
              label="Harga Jual" 
              name="price" 
              type="text" 
              inputMode="numeric"
              value={defaultPrices.price} 
              onChange={handleDefaultPriceChange}
              onBlur={(e) => handleBlur(setDefaultPrices, 'price', e.target.value)}
            />
            <InputField 
              label="Harga Asli (IDR)" 
              name="originalPrice" 
              type="text" 
              inputMode="numeric"
              value={defaultPrices.originalPrice} 
              onChange={handleDefaultPriceChange} 
              onBlur={(e) => handleBlur(setDefaultPrices, 'originalPrice', e.target.value)}
            />
            
            {/* DISKON BADGE OTOMATIS */}
            {discountPercentage && (
              <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                <span className="text-sm text-red-700 font-medium">Diskon Terdeteksi:</span>
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center">
                  <Percent size={12} className="mr-1" /> {discountPercentage} OFF
                </span>
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-2">Harga jual Tidak boleh lebih tinggi dari harga asli <b>Antara harga asli & jual sama, atau harga jual lebih rendah</b>.</p>
            <p className="text-xs text-gray-500 mt-2">Mengubah ini akan mengupdate harga varian yang <b>belum diedit manual</b>.</p>
          </FormCard>
          
          <FormCard title="Meta" icon={Sparkles}>
            <InputField 
              label="Badge" 
              name="badge" 
              // Jika ada diskon, placeholder memberitahu user akan otomatis
              value={basicInfo.badge} 
              onChange={handleBasicInfoChange} 
              placeholder={discountPercentage ? `Otomatis: ${discountPercentage} OFF` : "New / Best Seller"} 
            />
            <p className="text-xs text-gray-500 mb-3 -mt-3">Kosongkan untuk menggunakan badge diskon otomatis.</p>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" name="is_new_arrival" checked={basicInfo.is_new_arrival} onChange={handleBasicInfoChange} className="h-4 w-4 rounded text-gray-800 focus:ring-gray-800" />
              <span className="text-sm font-medium text-gray-700">New Arrival</span>
            </label>
          </FormCard>
        </div>

      </div>
    </form>
  );
}

// ==================================================================
// == KOMPONEN HELPER
// ==================================================================

function FormCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center space-x-2 p-4 border-b border-gray-200">
        <Icon size={20} className="text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function InputField({ label, name, type = 'text', inputMode, value, onChange, onBlur, placeholder, required = false }) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input 
        type={type} 
        inputMode={inputMode} 
        name={name} 
        id={name} 
        value={value} 
        onChange={onChange} 
        onBlur={onBlur} // Tambahan onBlur untuk default '0'
        placeholder={placeholder} 
        required={required} 
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800" 
      />
    </div>
  );
}

function TextAreaField({ label, name, value, onChange, placeholder, rows = 3 }) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea name={name} id={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800" />
    </div>
  );
}

function ImagePreview({ image, colorNames, onRemove, onLinkColor }) {
  return (
    <div className="relative border border-gray-200 rounded-lg overflow-hidden group">
      <img src={image.preview} alt="Preview" className="w-full h-32 object-cover" />
      <button type="button" onClick={() => onRemove(image.id)} className="absolute top-1 right-1 p-1 bg-white/70 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={16} /></button>
      <div className="p-2">
        <select value={image.linkedColorName} onChange={(e) => onLinkColor(image.id, e.target.value)} className="w-full text-xs p-1 border border-gray-300 rounded mt-1">
          <option value="">Gambar Umum</option>
          {colorNames.map(name => <option key={name} value={name}>{name}</option>)}
        </select>
      </div>
    </div>
  );
}

// Update Tabel Stok dengan indikator Edited
function VariantStockTable({ variants, onVariantChange, onResetRow }) { 
  if (variants.length === 0) {
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-sm text-gray-600">Masukkan ukuran dan warna di atas untuk menghasilkan tabel stok.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 border border-gray-200 rounded-lg overflow-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Varian</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Stok</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Harga</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Harga Coret</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {variants.map(v => (
            <tr key={v.id} className={v.isEdited ? "bg-yellow-50" : ""}>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex flex-col">
                  <div>
                    <span className="font-medium text-gray-900">{v.color}</span>
                    <span className="text-gray-500"> / {v.size}</span>
                  </div>
                  {/* Indikator Manual Edit */}
                  {v.isEdited && (
                    <button 
                      type="button" 
                      onClick={() => onResetRow(v.id)}
                      className="text-[10px] text-blue-600 text-left hover:underline mt-1"
                    >
                      (Manual - Klik Reset)
                    </button>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <input 
                  type="text" 
                  inputMode="numeric"
                  value={v.stock} 
                  onChange={(e) => onVariantChange(v.id, 'stock', e.target.value)} 
                  className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-gray-800" 
                />
              </td>
              <td className="px-4 py-3">
                <input 
                  type="text" 
                  inputMode="numeric"
                  value={v.price} 
                  onChange={(e) => onVariantChange(v.id, 'price', e.target.value)} 
                  className={`w-28 px-2 py-1 border rounded-lg text-sm focus:ring-gray-800 ${v.isEdited ? 'border-yellow-400 bg-white' : 'border-gray-300'}`} 
                />
              </td>
              <td className="px-4 py-3">
                <input 
                  type="text" 
                  inputMode="numeric"
                  value={v.originalPrice} 
                  onChange={(e) => onVariantChange(v.id, 'originalPrice', e.target.value)} 
                  className={`w-28 px-2 py-1 border rounded-lg text-sm focus:ring-gray-800 ${v.isEdited ? 'border-yellow-400 bg-white' : 'border-gray-300'}`} 
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}