"use client";

import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import HeaderUniversal from '../../../../components/Header';

export default function VerifiedPage() {
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
            transition={{ duration: 0.7, delay: 0.2, type: 'spring' }}
            className="mx-auto w-24 h-24 flex items-center justify-center bg-green-100 dark:bg-green-900 rounded-full"
          >
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-6 mb-3">
            Verifikasi Berhasil!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Akun Anda telah berhasil diverifikasi. Anda sekarang dapat masuk ke akun Anda.
          </p>
          
          <Link href="/login" passHref>
            <motion.div
              className="w-full py-4 px-6 rounded-lg font-semibold text-white bg-purple-600 dark:bg-purple-500 cursor-pointer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Kembali ke Halaman Login
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </>
  );
}