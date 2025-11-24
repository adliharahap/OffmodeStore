'use client'; // Penting untuk Next.js App Router
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { closeLogoutModal } from '../store/slice/uiSlice';
import { performLogout } from '../utils/authHelper';


export default function LogoutConfirmationModal() {
  const dispatch = useDispatch();
  const router = useRouter();
  
  // 1. Ambil state dari Redux
  const { isLogoutModalOpen } = useSelector((state) => state.ui);
  
  // State lokal hanya untuk loading UI saat proses logout
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    if (!isLoading) dispatch(closeLogoutModal());
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    
    // 2. Eksekusi Logic Logout yang Anda buat sebelumnya
    await performLogout();
    
    // 3. Redirect
    setTimeout(() => {
        router.push('/login');
    }, 1000);
    
    // 4. Tutup modal dan reset loading
    dispatch(closeLogoutModal());
    setIsLoading(false);
  };

  return (
    <AnimatePresence>
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white dark:bg-stone-900 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden p-6 text-center"
          >
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Konfirmasi Logout
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
              Apakah Anda yakin ingin keluar dari akun ini?
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 shadow-lg shadow-red-600/20 transition-colors flex justify-center items-center gap-2"
              >
                 {isLoading ? <Loader2 className="animate-spin w-4 h-4"/> : "Ya, Keluar"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}