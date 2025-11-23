"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Edit, Save, X, Camera, Loader2, User, Mail, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { updateProfile, uploadAvatarAction } from "../../../../utils/profileActions"; 
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUser } from "../../../../store/slice/authslice";

const ModalInput = ({ label, icon: Icon, ...props }) => (
  <div className="group">
    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-purple-600 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <input 
        {...props}
        className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all ${props.disabled ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-white/5' : ''}`}
      />
    </div>
  </div>
);

export const EditProfileModal = ({ isVisible, onClose, profile, onSaveSuccess }) => {
  const [formData, setFormData] = useState(profile || {});
  const [selectedFile, setSelectedFile] = useState(null); 
  const [previewUrl, setPreviewUrl] = useState(profile?.avatar_url || ""); 
  const [isSaving, setIsSaving] = useState(false);
  const dispatch = useDispatch();
  
  // Reset state saat modal dibuka atau profile berubah
  useEffect(() => {
    if (profile) {
      setFormData(profile);
      setPreviewUrl(profile.avatar_url || "https://placehold.co/150x150?text=User");
      setSelectedFile(null); // Reset file agar tidak upload ulang file lama
    }
  }, [profile, isVisible]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- 1. HANDLE IMAGE SELECTION (PREVIEW ONLY) ---
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi ukuran (Maks 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file terlalu besar (Maks 5MB)");
      return;
    }

    // Buat URL Preview Lokal agar user lihat gambar yg dipilih
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedFile(file); // Simpan file di state untuk diupload nanti
  };

  // --- 2. HANDLE SUBMIT (UPLOAD VIA SERVER ACTION & SAVE DATA) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let finalAvatarUrl = formData.avatar_url;

      // A. Jika ada file baru dipilih, Upload dulu pakai Server Action
      if (selectedFile) {
        console.log("Mulai upload gambar via Server Action...");

        // Bungkus file ke dalam FormData
        const imageFormData = new FormData();
        imageFormData.append("file", selectedFile); // Key 'file' harus sama dengan di server action

        // Panggil Server Action
        const uploadResult = await uploadAvatarAction(imageFormData);

        if (!uploadResult.success) {
          throw new Error(uploadResult.message || "Gagal upload gambar.");
        }

        // Ambil URL baru dari hasil server action
        finalAvatarUrl = uploadResult.newUrl;
        console.log("Upload sukses. URL Baru:", finalAvatarUrl);
      }

      // B. Update Data Profil (Nama, No HP, dan URL Avatar terbaru)
      const dbPayload = { 
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        avatar_url: finalAvatarUrl 
      };
      
      // Panggil action update data text (pastikan updateProfile juga support server action atau API call)
      const res = await updateProfile(dbPayload);

      if (res.success) {
        console.log("Update sukses, merefresh UI...");

        const reduxPayload = {
            ...profile,    // <--- PENTING: Ini menjaga ID, Email, Role, Metadata tetap ada
            ...dbPayload   // <--- Ini menimpa Nama, HP, dan Foto dengan yang baru
        };
        dispatch(setUser(reduxPayload));
        if (onSaveSuccess) onSaveSuccess();
        onClose();
      } else {
        throw new Error(res.message || "Gagal update profil");
      }

    } catch (error) {
      console.error("Submit Error:", error);
      alert("Terjadi kesalahan: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 outline-none";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
          
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-all"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            className="relative bg-white dark:bg-[#111] w-full max-w-lg rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
            initial={{ scale: 0.95, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 dark:border-white/10 bg-white/80 dark:bg-[#111]/80 backdrop-blur-md z-20 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Edit Profile
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Update your personal information.</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-600 dark:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Area */}
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Avatar Section */}
                <div className="flex flex-col items-center">
                  <div className="relative group cursor-pointer">
                      <div className="w-32 h-32 rounded-full p-1 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 shadow-xl">
                        <img
                          className="w-full h-full rounded-full object-cover"
                          src={previewUrl} 
                          alt="Avatar Preview"
                          onError={(e) => e.target.src = "https://placehold.co/150x150?text=User"}
                        />
                      </div>
                      
                      <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2.5 rounded-full shadow-lg hover:bg-purple-700 transition-all transform hover:scale-110 active:scale-95 border-2 border-white dark:border-[#111] cursor-pointer">
                          <Camera size={18} />
                          <input 
                              type="file" 
                              className="hidden" 
                              accept="image/png, image/jpeg, image/jpg, image/webp" 
                              onChange={handleImageChange} 
                          />
                      </label>
                  </div>
                  <p className="text-xs font-medium text-gray-400 mt-3 uppercase tracking-wider">Max 5MB (JPG, PNG)</p>
                </div>

                {/* Inputs */}
                <div className="space-y-5">
                    <ModalInput 
                        label="Full Name" 
                        icon={User} 
                        id="full_name" 
                        name="full_name" 
                        value={formData.full_name || ''} 
                        onChange={handleChange} 
                        required 
                    />

                    <ModalInput 
                        label="Email Address" 
                        icon={Mail} 
                        type="email" 
                        value={formData.email || ''} 
                        disabled 
                    />

                    <ModalInput 
                        label="Phone Number" 
                        icon={Phone} 
                        id="phone_number" 
                        name="phone_number" 
                        value={formData.phone_number || ''} 
                        onChange={handleChange} 
                    />
                </div>

                {/* Footer Actions */}
                <div className="pt-2 flex gap-3">
                  <button 
                    type="button" 
                    onClick={onClose} 
                    className="flex-1 py-3.5 font-bold text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors border border-transparent"
                  >
                    Cancel
                  </button>
                  <button 
                      type="submit" 
                      disabled={isSaving} 
                      className="flex-1 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    <span>{isSaving ? "Saving..." : "Save Changes"}</span>
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