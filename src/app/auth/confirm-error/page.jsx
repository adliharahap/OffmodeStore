"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, Mail, Send } from 'lucide-react';
import HeaderUniversal from '../../../../components/Header';
import { supabase } from '../../../../lib/supabaseClient';

export default function ConfirmErrorPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // 'info' atau 'error'

  const resendEmail = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage("Harap masukkan alamat email Anda.");
      setMessageType("error");
      return;
    }

    setSending(true);
    setMessage("");

    try {
      // Gunakan 'resend' untuk user yang sudah ada
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        setMessage(`Gagal mengirim email: ${error.message}`);
        setMessageType("error");
      } else {
        setMessage("Email verifikasi berhasil dikirim ulang! Silakan cek inbox Anda.");
        setMessageType("info");
      }
    } catch (err) {
      setMessage(`Terjadi kesalahan: ${err.message}`);
      setMessageType("error");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <HeaderUniversal />
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-gray-900 py-20 px-4">
        <motion.div
          className="w-full max-w-md p-8 md:p-12 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ duration: 0.7, type: 'spring' }}
            className="mx-auto w-24 h-24 flex items-center justify-center bg-red-100 dark:bg-red-900 rounded-full"
          >
            <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </motion.div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-6 mb-3">
            Verifikasi Gagal
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Link verifikasi ini sudah kadaluarsa atau tidak valid.
            Silakan kirim ulang link baru ke email Anda.
          </p>

          <form onSubmit={resendEmail} className="space-y-5">
            <div>
              <label htmlFor="resend-email" className="sr-only">Alamat Email</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  id="resend-email"
                  placeholder="anda@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border text-gray-900 dark:text-white bg-transparent dark:bg-gray-700/30 border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:ring-2 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <AnimatePresence>
              {message && (
                <motion.div
                  className={`px-4 py-3 rounded-lg text-sm ${messageType === 'error'
                      ? 'bg-red-100 border border-red-400 text-red-700'
                      : 'bg-green-100 border border-green-400 text-green-700'
                    }`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={sending}
              className="w-full py-4 px-6 rounded-lg font-semibold text-white bg-purple-600 dark:bg-purple-500 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              {sending ? (
                <motion.div
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Kirim Ulang Verifikasi</span>
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </>
  );
}