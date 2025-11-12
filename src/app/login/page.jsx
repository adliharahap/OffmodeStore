"use client";

import React, { useState } from 'react';
// DI-UPDATE: Impor AnimatePresence dan ikon User
import { motion, AnimatePresence } from 'framer-motion';
// DI-UPDATE: Impor ikon yang diperlukan
import { Mail, Lock, Eye, EyeOff, ArrowRight, User } from 'lucide-react';
import HeaderUniversal from '../../../components/HeaderUniversal';
import { supabase } from '../../../lib/supabaseClient';


// --- VARIAN ANIMASI ---
const formContainerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: 'easeIn'
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

// --- KOMPONEN UTAMA HALAMAN LOGIN & REGISTER ---
const LoginPage = () => {
  // --- STATE BARU ---
  const [isLoginView, setIsLoginView] = useState(true); // true = Login, false = Register

  // State untuk kedua form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Baru

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Baru
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // DI-UPDATE: State untuk pesan sukses atau error global
  const [successMessage, setSuccessMessage] = useState('');

  // URL Gambar
  const loginImage = "https://placehold.co/800x1200/5E548E/FFFFFF?text=Welcome+Style";
  const registerImage = "https://placehold.co/800x1200/9F86C0/FFFFFF?text=Join+Us";

  // --- FUNGSI VALIDASI (DI-UPDATE) ---
  const validate = () => {
    const newErrors = {};
    setErrors({}); // Reset error setiap validasi
    setSuccessMessage('');

    // Validasi untuk Register
    if (!isLoginView) {
      if (!name.trim()) {
        newErrors.name = 'Nama lengkap tidak boleh kosong';
      }
    }

    // Validasi Email (Sama untuk keduanya)
    if (!email) {
      newErrors.email = 'Email tidak boleh kosong';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Format email tidak valid';
    }

    // Validasi Password (Sama untuk keduanya)
    if (!password) {
      newErrors.password = 'Password tidak boleh kosong';
    } else if (password.length < 8) {
      newErrors.password = 'Password minimal 8 karakter';
    }

    // DI-UPDATE: Validasi kompleksitas password HANYA untuk register
    if (!isLoginView) {
      // Regex: min 8 karakter, 1 huruf besar, 1 huruf kecil, 1 angka, 1 simbol
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

      if (!passwordRegex.test(password)) {
        newErrors.password = 'Password harus mengandung huruf besar, huruf kecil, angka, dan simbol (@$!%*?&#)';
      }

      // Validasi Konfirmasi Password (Hanya Register)
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Konfirmasi password tidak boleh kosong';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Password tidak cocok';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- FUNGSI SUBMIT (DI-UPDATE) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return; // Hentikan jika validasi gagal
    }

    setIsLoading(true);
    setErrors({});

    try {
      if (isLoginView) {
        // --- Logika Submit Login ---
        console.log('Login data:', { email, password });

        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) {
          setErrors({ general: 'Email atau password salah.' }); // Pesan error generik
          console.error('Supabase Login Error:', error.message);
        } else {
          setSuccessMessage('Login berhasil! Anda akan diarahkan...');
          console.log('Login Sukses:', data);
          // Di aplikasi nyata, Anda akan redirect di sini, misal:
          // window.location.href = '/dashboard';
          // Untuk simulasi:
          setTimeout(() => {
            // DI-UPDATE: Mengganti alert() dengan console.log()
            console.log('Login Berhasil! (Simulasi Redirect)');
          }, 1500);
        }
      } else {
        // --- Logika Submit Register (SUPABASE) ---
        console.log('Register data:', { name, email, password });

        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
            data: {
              full_name: name, // Menyimpan nama ke metadata user
            }
          }
        });

        if (error) {
          setErrors({ general: error.message }); // Tampilkan error dari Supabase
          console.error('Supabase Sign Up Error:', error.message);
        } else {
          setSuccessMessage('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.');
          console.log('Sign Up Sukses:', data);
          // Biarkan user di halaman ini untuk melihat pesan sukses.
          // Jangan langsung toggleView
        }
      }
    } catch (error) {
      setErrors({ general: 'Terjadi kesalahan tidak terduga. Silakan coba lagi.' });
      console.error('Submit Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- FUNGSI BARU: TOGGLE VIEW ---
  const toggleView = () => {
    setIsLoginView(!isLoginView);
    // Reset semua state form
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsLoading(false);
    setSuccessMessage(''); // DI-UPDATE: Reset pesan sukses
  };

    const FormMessages = () => (
    <AnimatePresence>
      {errors.general && (
        <motion.div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {errors.general}
        </motion.div>
      )}
      {successMessage && (
        <motion.div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {successMessage}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <HeaderUniversal />
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-gray-900 py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          layout // Animasikan perubahan layout
          className={`relative flex flex-col w-full max-w-4xl mx-auto rounded-2xl shadow-2xl overflow-hidden
                      ${isLoginView ? 'md:flex-row' : 'md:flex-row-reverse'} 
                     `} // DI-UPDATE: Toggle flex-direction
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* --- KOLOM GAMBAR (KIRI ATAU KANAN) --- */}
          <div className="w-full md:w-1/2 h-64 md:h-auto overflow-hidden relative">
            {/* Menggunakan AnimatePresence untuk transisi gambar */}
            <AnimatePresence>
              <motion.img
                key={isLoginView ? 'login' : 'register'} // Key untuk memicu transisi
                src={isLoginView ? loginImage : registerImage}
                alt="Visual"
                className="w-full h-full object-cover absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              />
            </AnimatePresence>
          </div>

          {/* --- KOLOM FORMULIR (KIRI ATAU KANAN) --- */}
          <div className="w-full md:w-1/2 p-8 md:p-12 bg-white dark:bg-gray-800">
            {/* Menggunakan AnimatePresence untuk transisi form */}
            <AnimatePresence mode="wait">
              {isLoginView ? (
                // --- FORMULIR LOGIN ---
                <motion.div
                  key="login"
                  variants={formContainerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <motion.h2
                    className="text-3xl font-bold text-gray-900 dark:text-white mb-3"
                    variants={itemVariants}
                  >
                    Selamat Datang Kembali
                  </motion.h2>
                  <motion.p
                    className="text-gray-600 dark:text-gray-400 mb-8"
                    variants={itemVariants}
                  >
                    Masuk ke akun Anda untuk melanjutkan.
                  </motion.p>

                  <FormMessages />

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Input Email */}
                    <motion.div variants={itemVariants}>
                      <label htmlFor="login-email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Alamat Email
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <Mail className="w-5 h-5" />
                        </span>
                        <input
                          type="email"
                          id="login-email"
                          placeholder="anda@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full pl-12 pr-4 py-3 rounded-lg border text-gray-900 dark:text-white bg-transparent dark:bg-gray-700/30 transition-all ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'
                            } focus:ring-2 focus:border-transparent outline-none`}
                        />
                      </div>
                      {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
                    </motion.div>

                    {/* Input Password */}
                    <motion.div variants={itemVariants}>
                      <label htmlFor="login-password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <Lock className="w-5 h-5" />
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="login-password"
                          placeholder="Minimal 8 karakter"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`w-full pl-12 pr-12 py-3 rounded-lg border text-gray-900 dark:text-white bg-transparent dark:bg-gray-700/30 transition-all ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'
                            } focus:ring-2 focus:border-transparent outline-none`}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>}
                    </motion.div>

                    <motion.div className="flex justify-end" variants={itemVariants}>
                      <a href="#" className="text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400">
                        Lupa Password?
                      </a>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <motion.button type="submit" disabled={isLoading} className="w-full py-4 px-6 rounded-lg font-semibold text-white bg-purple-600 dark:bg-purple-500 transition-all disabled:opacity-60 flex items-center justify-center gap-2" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                        {isLoading ? <motion.div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} /> : <span>Masuk</span>}
                      </motion.button>
                    </motion.div>
                  </form>

                  <motion.p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-8" variants={itemVariants}>
                    Belum punya akun?{' '}
                    <button onClick={toggleView} className="font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 bg-transparent border-none p-0 cursor-pointer">
                      Daftar di sini
                    </button>
                  </motion.p>
                </motion.div>
              ) : (
                // --- FORMULIR REGISTER ---
                <motion.div
                  key="register"
                  variants={formContainerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <motion.h2
                    className="text-3xl font-bold text-gray-900 dark:text-white mb-3"
                    variants={itemVariants}
                  >
                    Buat Akun Baru
                  </motion.h2>
                  <motion.p
                    className="text-gray-600 dark:text-gray-400 mb-8"
                    variants={itemVariants}
                  >
                    Bergabunglah dengan kami hari ini.
                  </motion.p>

                  <FormMessages />

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Input Nama */}
                    <motion.div variants={itemVariants}>
                      <label htmlFor="register-name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Nama Lengkap
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <User className="w-5 h-5" />
                        </span>
                        <input
                          type="text"
                          id="register-name"
                          placeholder="Nama Anda"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={`w-full pl-12 pr-4 py-3 rounded-lg border text-gray-900 dark:text-white bg-transparent dark:bg-gray-700/30 transition-all ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'
                            } focus:ring-2 focus:border-transparent outline-none`}
                        />
                      </div>
                      {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
                    </motion.div>

                    {/* Input Email */}
                    <motion.div variants={itemVariants}>
                      <label htmlFor="register-email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Alamat Email
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <Mail className="w-5 h-5" />
                        </span>
                        <input
                          type="email"
                          id="register-email"
                          placeholder="anda@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full pl-12 pr-4 py-3 rounded-lg border text-gray-900 dark:text-white bg-transparent dark:bg-gray-700/30 transition-all ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'
                            } focus:ring-2 focus:border-transparent outline-none`}
                        />
                      </div>
                      {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
                    </motion.div>

                    {/* Input Password */}
                    <motion.div variants={itemVariants}>
                      <label htmlFor="register-password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <Lock className="w-5 h-5" />
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="register-password"
                          placeholder="Minimal 8 karakter"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`w-full pl-12 pr-12 py-3 rounded-lg border text-gray-900 dark:text-white bg-transparent dark:bg-gray-700/30 transition-all ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'
                            } focus:ring-2 focus:border-transparent outline-none`}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>}
                    </motion.div>

                    {/* Input Konfirmasi Password */}
                    <motion.div variants={itemVariants}>
                      <label htmlFor="confirm-password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Konfirmasi Password
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <Lock className="w-5 h-5" />
                        </span>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirm-password"
                          placeholder="Ulangi password Anda"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`w-full pl-12 pr-12 py-3 rounded-lg border text-gray-900 dark:text-white bg-transparent dark:bg-gray-700/30 transition-all ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'
                            } focus:ring-2 focus:border-transparent outline-none`}
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5">{errors.confirmPassword}</p>}
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <motion.button type="submit" disabled={isLoading} className="w-full py-4 px-6 rounded-lg font-semibold text-white bg-purple-600 dark:bg-purple-500 transition-all disabled:opacity-60 flex items-center justify-center gap-2" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                        {isLoading ? <motion.div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} /> : <span>Buat Akun</span>}
                      </motion.button>
                    </motion.div>
                  </form>

                  <motion.p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-8" variants={itemVariants}>
                    Sudah punya akun?{' '}
                    <button onClick={toggleView} className="font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 bg-transparent border-none p-0 cursor-pointer">
                      Masuk di sini
                    </button>
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;