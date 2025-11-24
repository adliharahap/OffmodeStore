"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Briefcase, Building, User, Phone, MapPin, Building2, Loader2 } from 'lucide-react';
import { addUserAddress, updateAddressAction } from '../../../../utils/addressAction'; // Import Actions

const InputField = ({ icon: Icon, label, ...props }) => (
    <div className="relative group">
      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <div className="absolute top-3 left-3 text-gray-400 dark:text-gray-500 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 pointer-events-none">
          <Icon className="w-5 h-5" />
        </div>
        {props.type === 'textarea' ? (
            <textarea {...props} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-500/50 focus:bg-white dark:focus:bg-black transition-all resize-none" />
        ) : (
            <input {...props} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-500/50 focus:bg-white dark:focus:bg-black transition-all" />
        )}
      </div>
    </div>
);

export const AddressModal = ({ isVisible, onClose, addressToEdit, onSaveSuccess }) => {
  const isEditMode = !!addressToEdit;
  const [isProcessing, setIsProcessing] = useState(false);

  // Default State
  const initialForm = {
    address_label: 'Rumah', recipient_name: '', phone: '', street: '', city: '', province: '', postal_code: ''
  };

  const [form, setForm] = useState(initialForm);

  // Load data jika mode edit
  useEffect(() => {
    if (addressToEdit) {
      setForm({
        address_label: addressToEdit.address_label,
        recipient_name: addressToEdit.recipient_name,
        phone: addressToEdit.phone_number || addressToEdit.phone, // Handle beda nama field
        street: addressToEdit.street,
        city: addressToEdit.city,
        province: addressToEdit.province,
        postal_code: addressToEdit.postal_code
      });
    } else {
      setForm(initialForm);
    }
  }, [addressToEdit, isVisible]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      let res;
      if (isEditMode) {
        res = await updateAddressAction(addressToEdit.id, form);
      } else {
        res = await addUserAddress(form);
      }

      if (res.success) {
        onSaveSuccess(); // Refresh data parent
        onClose();
      } else {
        alert("Gagal menyimpan: " + res.message);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 50 }}
            className="relative bg-white dark:bg-[#111] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-gray-200 dark:border-white/10"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 dark:border-white/10 sticky top-0 bg-white/80 dark:bg-[#111]/80 backdrop-blur-md z-20 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{isEditMode ? "Ubah Alamat" : "Alamat Baru"}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Lengkapi detail lokasi pengiriman.</p>
              </div>
              <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-white/10 rounded-full hover:bg-gray-200 dark:hover:bg-white/20 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar">
                <form onSubmit={handleSubmit} className="space-y-6">
                     {/* Label Selector */}
                     <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Simpan Sebagai</label>
                        <div className="flex flex-wrap gap-3 mb-3">
                            {['Rumah', 'Kantor', 'Apartemen'].map(label => (
                                <button key={label} type="button" onClick={() => setForm({...form, address_label: label})}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all flex items-center gap-2 ${form.address_label === label ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200 dark:shadow-none' : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-purple-200 dark:hover:border-purple-500/50 hover:bg-purple-50 dark:hover:bg-purple-900/20'}`}>
                                    {label === 'Rumah' && <Home className="w-4 h-4" />}
                                    {label === 'Kantor' && <Briefcase className="w-4 h-4" />}
                                    {label === 'Apartemen' && <Building2 className="w-4 h-4" />}
                                    {label}
                                </button>
                            ))}
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-5">
                        <InputField icon={User} label="Nama Penerima" placeholder="Nama lengkap" required value={form.recipient_name} onChange={e => setForm({...form, recipient_name: e.target.value})} />
                        <InputField icon={Phone} label="Nomor HP" placeholder="08xx-xxxx-xxxx" type="tel" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                     </div>

                     <InputField type="textarea" rows="3" icon={MapPin} label="Alamat Lengkap" placeholder="Nama Jalan, No. Rumah, RT/RW" required value={form.street} onChange={e => setForm({...form, street: e.target.value})} />

                     <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                             <InputField icon={Building2} label="Kota / Kab" placeholder="Jakarta Selatan" required value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
                        </div>
                        <InputField icon={MapPin} label="Kode Pos" placeholder="12xxx" required value={form.postal_code} onChange={e => setForm({...form, postal_code: e.target.value})} />
                     </div>
                     
                     <InputField icon={Building} label="Provinsi" placeholder="DKI Jakarta" required value={form.province} onChange={e => setForm({...form, province: e.target.value})} />

                     <div className="flex gap-3 pt-6">
                        <button type="button" onClick={onClose} className="flex-1 py-3.5 font-bold text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">Batal</button>
                        <button type="submit" disabled={isProcessing} className="flex-2 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-black dark:hover:bg-gray-200 shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95">
                           {isProcessing ? <Loader2 className="animate-spin w-5 h-5" /> : "Simpan Alamat"}
                        </button>
                     </div>
                  </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};