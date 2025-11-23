"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';

// Impor ikon
import {
  Menu, X, User, ShoppingBag, Store, Sun, Moon,
  Package, LogOut,
  Grid2X2
} from 'lucide-react';

import { navLinks } from '../data/HeaderHref';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../store/slice/authslice';
import { supabase } from '../lib/supabaseClient';
import { performLogout } from '../utils/authHelper';

// --- (Varian animasi Framer Motion) ---
const backdropVariants = {
  open: { opacity: 1, display: 'block', transition: { duration: 0.3 } },
  closed: { opacity: 0, transition: { duration: 0.3 }, transitionEnd: { display: 'none' } },
};
const sidebarVariants = {
  open: { x: 0, transition: { type: 'spring', stiffness: 260, damping: 30 } },
  closed: { x: '100%', transition: { type: 'spring', stiffness: 260, damping: 30 } },
};
const navListVariants = {
  open: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
  closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
};
const navItemVariants = {
  open: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  closed: { x: 30, opacity: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const { count } = useSelector((state) => state.cart);

  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  // State untuk dropdown
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileRef = useRef(null);

  // LOGIKA UTAMA: Mengatur background header berdasarkan Path URL
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    if (pathname === '/') {
      // Jika di Homepage: Cek posisi scroll awal
      handleScroll();
      window.addEventListener('scroll', handleScroll);
    } else {
      // Jika BUKAN Homepage: Header selalu solid (isScrolled dianggap true untuk styling)
      setIsScrolled(true);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname]);

  // Efek lock scroll
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  // Efek click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileRef]);

  const handleLogout = async () => {
    await performLogout(); // Ini akan hapus Supabase session + Redux + LocalStorage
    window.location.href = '/login';
    router.refresh();      // Refresh agar middleware server-side mendeteksi logout
  };

  const menuItems = [
    { label: 'Akun Saya', href: '/profile', icon: User },
    { label: 'Pesanan Saya', href: '/myorders', icon: Package },
  ];


  const headerClasses = isScrolled
    ? 'bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 shadow-sm py-3'
    : 'bg-transparent border-b border-transparent py-4';

  const textClasses = 'text-gray-900 dark:text-white'; // Selalu adaptif (Hitam di Light, Putih di Dark)
  // Avatar URL helper
  const getAvatarUrl = (u) => u?.avatar_url || `https://ui-avatars.com/api/?name=${u?.email || 'User'}&background=random&color=ffffff`;


  const ThemeToggleButton = () => {
    return (
      <motion.button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className={`transition-colors hover:text-purple-600 dark:hover:text-purple-400 ${textClasses}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Toggle Theme"
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </motion.button>
    );
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${headerClasses}`}
    >
      <div className="w-full px-6 md:px-10 relative flex justify-between items-center">
        {/* Logo (Kiri) - Font Serif untuk kesan Editorial */}
        <Link href="/">
          <motion.div
            className={`text-2xl font-bold flex items-center gap-2 font-serif tracking-tight ${textClasses} transition-all duration-500 ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
              }`}
            whileHover={{ scale: 1.02 }}
          >
            <img src='/logo.png' className="w-8 h-8 rounded-lg" />
            OffMode
          </motion.div>
        </Link>

        {/* Navigasi Desktop (Tengah) */}
        <div className="hidden md:flex items-center gap-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {navLinks.map((link) => (
            <Link href={link.href} key={link.name}>
              <motion.p
                className={`font-medium text-sm uppercase tracking-widest hover:text-purple-600 dark:hover:text-purple-400 transition-colors ${textClasses}`}
                whileHover={{ y: -2 }}
              >
                {link.name}
              </motion.p>
            </Link>
          ))}
        </div>

        {/* Tombol Aksi Desktop (Kanan) */}
        <div className="hidden md:flex items-center gap-5">
          <ThemeToggleButton />

          {/* Tombol Keranjang */}
          <Link href="/mycart">
            <motion.div
              className={`relative hover:text-purple-600 dark:hover:text-purple-400 transition-colors ${textClasses}`}
              whileHover={{ scale: 1.1 }}
              title="Cart"
            >
              <ShoppingBag size={20} />
              {user && count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 z-10 bg-purple-600 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm animate-in zoom-in">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </motion.div>
          </Link>

          {/* Profil / Login */}
          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
          ) : user ? (
            <div className="relative flex justify-center items-center" ref={profileRef}>
              <motion.button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="focus:outline-none ring-2 ring-transparent hover:ring-purple-200 rounded-full transition-all"
              >
                <img
                  src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email || 'User'}&background=random&color=ffffff`}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${user?.email || 'U'}&background=random&color=ffffff`;
                  }}
                />
              </motion.button>

              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-4 w-72 bg-white dark:bg-[#111] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden ring-1 ring-black/5"
                  >
                    {/* HEADER DROPDOWN DENGAN FOTO PROFILE */}
                    <div className="px-5 py-5 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/2 flex items-center gap-4">
                      <img
                        src={getAvatarUrl(user)}
                        alt="Profile Dropdown"
                        className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
                      />
                      <div className="overflow-hidden">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">Hello,</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate leading-tight" title={user.full_name}>
                          {user.full_name}
                        </p>
                        <p className="text-xs text-gray-400 truncate" title={user.email}>{user.email}</p>
                      </div>
                    </div>

                    <div className="p-2 space-y-1">
                      {menuItems.map((item) => (
                        <Link
                          href={item.href} // <-- Nah, ambil href dari object-nya
                          key={item.label}
                          onClick={() => setIsProfileDropdownOpen(false)} // Hapus e.preventDefault() biar link jalan!
                        >
                          <p className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors">
                            {/* Render Icon Dinamis */}
                            <item.icon size={18} className="text-gray-400" />

                            <span className="font-medium">{item.label}</span>
                          </p>
                        </Link>
                      ))}
                      {['owner', 'admin', 'pegawai'].includes(user.role) && (
                        <Link href={`/dashboardAdmin/${user.id}`}>
                          <p className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors" onClick={() => setIsProfileDropdownOpen(false)}>
                            <Grid2X2 size={16} /> Dashboard Saya
                          </p>
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-gray-100 dark:border-white/5 p-2">
                      <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium">
                        <LogOut size={18} /> Log Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link href="/login">
              <motion.div
                className={`hover:text-purple-600 dark:hover:text-purple-400 transition-colors ${textClasses}`}
                whileHover={{ scale: 1.1 }}
                title="Sign In"
              >
                <User size={20} />
              </motion.div>
            </Link>
          )}
        </div>

        {/* Tombol Aksi Mobile (Kanan) */}
        <div className="md:hidden flex items-center gap-4">
          <ThemeToggleButton />
          <Link href="/mycart">
            <motion.div
              className={`relative hover:text-purple-600 dark:hover:text-purple-400 transition-colors ${textClasses}`}
              whileHover={{ scale: 1.1 }}
            >
              <ShoppingBag size={20} />
              {user && count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 z-10 bg-purple-600 text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </motion.div>
          </Link>

          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.9 }}
            className={`${textClasses}`}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>

      {/* --- Menu Mobile Sidebar (Updated Design) --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              variants={backdropVariants}
              initial="closed"
              animate="open"
              exit="closed"
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 h-screen w-screen bg-black/60 backdrop-blur-sm z-50"
            />

            <motion.div
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-0 right-0 h-screen w-[85%] max-w-sm bg-white dark:bg-[#0a0a0a] shadow-2xl z-50 p-8 border-l border-gray-200 dark:border-white/10"
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-12">
                  <span className="text-xl font-bold font-serif text-gray-900 dark:text-white">OffMode</span>
                  <motion.button
                    onClick={() => setIsMobileMenuOpen(false)}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 bg-gray-100 dark:bg-white/10 rounded-full text-gray-900 dark:text-white"
                  >
                    <X size={20} />
                  </motion.button>
                </div>

                <motion.nav
                  variants={navListVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  className="flex flex-col gap-6 grow"
                >
                  {navLinks.map((link) => (
                    <Link href={link.href} key={link.name}>
                      <motion.p
                        variants={navItemVariants}
                        className="text-2xl font-serif font-medium text-gray-900 hover:text-purple-600 dark:text-white dark:hover:text-purple-400 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.name}
                      </motion.p>
                    </Link>
                  ))}

                  <motion.div variants={navItemVariants} className="border-t border-gray-200 dark:border-white/10 my-4" />

                  {user ? (
                    <div className="space-y-4">
                      <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                        <motion.div variants={navItemVariants} className="flex items-center gap-4 text-gray-700 dark:text-gray-300 p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg">
                          <User size={20} /> <span className="text-lg">Akun Saya</span>
                        </motion.div>
                      </Link>
                      <Link href="/myorders" onClick={() => setIsMobileMenuOpen(false)}>
                        <motion.div variants={navItemVariants} className="flex items-center gap-4 text-gray-700 dark:text-gray-300 p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg">
                          <Package size={20} /> <span className="text-lg">Pesanan</span>
                        </motion.div>
                      </Link>
                      {['owner', 'admin', 'pegawai'].includes(user.role) && (
                        <Link href={`/dashboardAdmin/${user?.id}`} onClick={() => setIsMobileMenuOpen(false)}>
                          <motion.div variants={navItemVariants} className="flex items-center gap-4 text-gray-700 dark:text-gray-300 p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg">
                            <Grid2X2 size={20} /> <span className="text-lg">Dashboard</span>
                          </motion.div>
                        </Link>
                      )}
                      <motion.button
                        variants={navItemVariants}
                        className="flex items-center gap-4 text-red-600 dark:text-red-400 p-2 w-full mt-4"
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut size={20} /> <span className="text-lg font-bold">Log Out</span>
                      </motion.button>
                    </div>
                  ) : (
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <motion.div variants={navItemVariants} className="flex items-center gap-4 text-gray-900 dark:text-white text-xl font-bold">
                        <User size={24} /> Sign In
                      </motion.div>
                    </Link>
                  )}
                </motion.nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Header;