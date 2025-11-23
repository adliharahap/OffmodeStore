"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Phone, Sparkles, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import HeaderUniversal from '../../../components/Header';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import Footer from '../../../components/Footer';

// --- VARIAN ANIMASI ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.4 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
};

// --- KOMPONEN INPUT FIELD ---
const InputField = ({ icon: Icon, isPassword, showPass, togglePass, error, ...props }) => (
  <div className="space-y-1.5">
    <div className="group relative">
      <div className="absolute top-3.5 left-4 text-gray-400 group-focus-within:text-purple-600 dark:text-gray-500 dark:group-focus-within:text-purple-400 transition-colors">
        <Icon size={20} />
      </div>
      <input
        {...props}
        type={isPassword ? (showPass ? 'text' : 'password') : props.type}
        className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 border rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-white/10'}`}
      />
      {isPassword && (
        <button
          type="button"
          onClick={togglePass}
          className="absolute top-3.5 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </div>
    {error && (
      <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-xs text-red-500 font-medium ml-1">
        {error}
      </motion.p>
    )}
  </div>
);

const LoginPage = () => {
  const router = useRouter();
  const [isLoginView, setIsLoginView] = useState(true);

  // State Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Gambar Editorial (Gunakan gambar high-res fashion)
  const loginImage = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop"; // Potret Wanita Elegan
  const registerImage = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200&auto=format&fit=crop"; // Potret Pria Elegan (atau style berbeda)

  // --- VALIDASI ---
  const validate = () => {
    const newErrors = {};
    setErrors({});
    setSuccessMessage('');

    if (!email) newErrors.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Format email tidak valid';

    if (!password) newErrors.password = 'Password wajib diisi';
    else if (password.length < 8) newErrors.password = 'Minimal 8 karakter';

    if (!isLoginView) {
      if (!name.trim()) newErrors.name = 'Nama lengkap wajib diisi';
      
      if (!phone) newErrors.phone = 'No. HP wajib diisi';
      else if (!/^08[0-9]{8,12}$/.test(phone)) newErrors.phone = 'Format HP harus 08...';
      
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
      if (!passwordRegex.test(password)) newErrors.password = 'Harus ada Huruf Besar, Kecil, Angka & Simbol';

      if (!confirmPassword) newErrors.confirmPassword = 'Konfirmasi password wajib';
      else if (password !== confirmPassword) newErrors.confirmPassword = 'Password tidak cocok';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      if (isLoginView) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setErrors({ general: 'Email atau password salah.' });
        } else {
          setSuccessMessage('Login berhasil! Mengalihkan...');
          setTimeout(() => window.location.href = '/', 1500);
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email, password, phone,
          options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
            data: { full_name: name, phone, email }
          }
        });
        if (error) {
          setErrors({ general: error.message });
        } else {
          setSuccessMessage('Registrasi berhasil! Cek email untuk verifikasi.');
        }
      }
    } catch (error) {
      setErrors({ general: 'Terjadi kesalahan sistem.' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setName(''); setEmail(''); setPhone(''); setPassword(''); setConfirmPassword('');
    setErrors({}); setSuccessMessage('');
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white font-sans transition-colors duration-500 flex flex-col">
      <HeaderUniversal />

      {/* Background Noise */}
      <div className=" inset-0 opacity-[0.03] dark:opacity-[0.03] pointer-events-none z-0 fixed mix-blend-multiply dark:mix-blend-normal" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}>
      </div>

      <div className="mt-16 mb-30 flex-1 flex items-center justify-center p-4 md:p-8 z-10 pt-24">
        <motion.div 
          layout
          className="bg-white dark:bg-[#111] w-full max-w-5xl rounded-3xl shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col md:flex-row min-h-[600px] md:min-h-[700px]"
        >
          
          {/* --- LEFT / RIGHT PANEL: IMAGE (Order Changes on Desktop) --- */}
          <motion.div 
            layout
            className={`w-full md:w-1/2 relative overflow-hidden ${isLoginView ? 'md:order-1' : 'md:order-2'}`}
          >
            <AnimatePresence mode='wait'>
               <motion.div
                 key={isLoginView ? 'img-login' : 'img-reg'}
                 initial={{ opacity: 0, scale: 1.1 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 0.8 }}
                 className="absolute inset-0 h-full w-full"
               >
                 <img 
                    src={isLoginView ? loginImage : registerImage} 
                    alt="Auth Visual" 
                    className="w-full h-full object-cover"
                 />
                 {/* Gradient Overlay */}
                 <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
                 
                 <div className="absolute bottom-10 left-10 right-10 text-white">
                    <motion.div 
                       initial={{ y: 20, opacity: 0 }} 
                       animate={{ y: 0, opacity: 1 }} 
                       transition={{ delay: 0.3 }}
                    >
                       <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3 text-purple-300">
                         {isLoginView ? "Welcome Back" : "Join the Movement"}
                       </p>
                       <h2 className="text-3xl md:text-4xl font-serif font-bold leading-tight mb-4">
                         {isLoginView ? "Redefining modern elegance." : "Start your journey with OffMode."}
                       </h2>
                       <p className="text-sm text-gray-300 leading-relaxed max-w-xs">
                         {isLoginView ? "Login to access your curated collection and exclusive offers." : "Create an account to enjoy personalized recommendations and fast checkout."}
                       </p>
                    </motion.div>
                 </div>
               </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* --- FORM PANEL --- */}
          <motion.div 
            layout
            className={`w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center ${isLoginView ? 'md:order-2' : 'md:order-1'}`}
          >
            <AnimatePresence mode='wait'>
               <motion.div
                 key={isLoginView ? 'form-login' : 'form-reg'}
                 variants={containerVariants}
                 initial="hidden"
                 animate="visible"
                 exit="exit"
                 className="w-full max-w-sm mx-auto"
               >
                 {/* Header Form */}
                 <motion.div variants={itemVariants} className="mb-8">
                    <span className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-widest mb-2">
                      <Sparkles size={14} /> {isLoginView ? "Member Access" : "New Account"}
                    </span>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white mb-2">
                      {isLoginView ? "Sign In" : "Sign Up"}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {isLoginView ? "Enter your details to proceed." : "Fill in your details to get started."}
                    </p>
                 </motion.div>

                 {/* Success / Error Messages */}
                 <AnimatePresence>
                    {errors.general && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400 text-sm">
                         <AlertCircle size={18} className="shrink-0 mt-0.5" />
                         <span>{errors.general}</span>
                      </motion.div>
                    )}
                    {successMessage && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3 text-green-600 dark:text-green-400 text-sm">
                         <CheckCircle size={18} className="shrink-0 mt-0.5" />
                         <span>{successMessage}</span>
                      </motion.div>
                    )}
                 </AnimatePresence>

                 {/* Form Inputs */}
                 <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {!isLoginView && (
                      <motion.div variants={itemVariants} className="space-y-5">
                         <InputField icon={User} type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} error={errors.name} />
                         <InputField icon={Phone} type="tel" placeholder="Phone Number (08...)" value={phone} onChange={e => setPhone(e.target.value)} error={errors.phone} />
                      </motion.div>
                    )}

                    <motion.div variants={itemVariants}>
                       <InputField icon={Mail} type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} error={errors.email} />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                       <InputField icon={Lock} isPassword showPass={showPassword} togglePass={() => setShowPassword(!showPassword)} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} error={errors.password} />
                    </motion.div>

                    {!isLoginView && (
                       <motion.div variants={itemVariants}>
                          <InputField icon={Lock} isPassword showPass={showConfirmPassword} togglePass={() => setShowConfirmPassword(!showConfirmPassword)} placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} error={errors.confirmPassword} />
                       </motion.div>
                    )}

                    {isLoginView && (
                       <motion.div variants={itemVariants} className="flex justify-end">
                          <a href="#" className="text-xs font-bold text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Forgot Password?</a>
                       </motion.div>
                    )}

                    <motion.div variants={itemVariants} className="pt-2">
                       <button
                         type="submit"
                         disabled={isLoading}
                         className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold shadow-lg shadow-purple-900/10 hover:shadow-purple-900/20 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                       >
                         {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLoginView ? "Sign In" : "Create Account")}
                         {!isLoading && <ArrowRight size={18} />}
                       </button>
                    </motion.div>
                 </form>

                 {/* Footer Switcher */}
                 <motion.div variants={itemVariants} className="mt-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {isLoginView ? "Don't have an account?" : "Already have an account?"}{' '}
                      <button onClick={toggleView} className="font-bold text-purple-600 dark:text-purple-400 hover:underline ml-1">
                        {isLoginView ? "Register Now" : "Login Here"}
                      </button>
                    </p>
                 </motion.div>

               </motion.div>
            </AnimatePresence>
          </motion.div>

        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;