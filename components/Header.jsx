"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Menu, X, User, ShoppingBag, Store, Sun, Moon, ShoppingCart, CopyCheckIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { navLinks } from '../data/HeaderHref';

// Varian untuk backdrop/overlay di belakang sidebar
const backdropVariants = {
  open: {
    opacity: 1,
    display: 'block',
    transition: { duration: 0.3 }
  },
  closed: {
    opacity: 0,
    transition: { duration: 0.3 },
    transitionEnd: {
      display: 'none',
    },
  },
};

// Varian untuk panel sidebar itu sendiri (geser dari kanan)
const sidebarVariants = {
  open: {
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 30,
    },
  },
  closed: {
    x: '100%', // Mulai dari luar layar sebelah kanan
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 30,
    },
  },
};

// Varian untuk kontainer link di dalam sidebar (untuk staggered animation)
const navListVariants = {
  open: {
    transition: {
      staggerChildren: 0.07, // Jeda antar animasi anak
      delayChildren: 0.2, // Mulai setelah sidebar masuk
    },
  },
  closed: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1, // Balik urutan saat keluar
    },
  },
};

// Varian untuk setiap item link (fade in & geser dari kanan)
const navItemVariants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    },
  },
  closed: {
    x: 30, // Mulai 30px dari kanan
    opacity: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  },
};



const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {

      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // Cleanup
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  const ThemeToggleButton = () => {
    return (
      <motion.button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}

        className={`transition-colors ${isScrolled
          ? 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          : 'text-white hover:text-gray-200'
          }`}
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

      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-stone-50/80 backdrop-blur-md shadow-sm border-b border-gray-200/60 dark:bg-gray-900/80 dark:border-gray-700/60'
        : 'bg-transparent border-b border-transparent font-medium'
        }`}
    >
      <div className="container mx-auto px-6 py-4 relative flex justify-between items-center">
        {/* Logo (Kiri) */}
        <motion.a
          href="#"

          className={`text-2xl font-bold flex items-center gap-2 transition-all duration-300 ${isScrolled
            ? 'text-gray-900 dark:text-white opacity-100'
            : 'opacity-0 pointer-events-none'
            }`}
          whileHover={{ scale: 1.05 }}
        >
          <Store size={24} />
          OffMode Store
        </motion.a>

        {/* Navigasi Desktop (Tengah) */}
        <div className="hidden md:flex items-center gap-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {navLinks.map((link) => (
            <Link href={link.href} key={link.name}>
              <motion.p
                className={`transition-colors ${isScrolled
                  ? 'text-gray-600 hover:text-gray-900 font-medium dark:text-gray-300 dark:hover:text-white'
                  : 'text-white hover:text-gray-200'
                  }`}
                whileHover={{ y: -2 }}
              >
                {link.name}
              </motion.p>
            </Link>
          ))}
        </div>

        {/* Tombol Aksi Desktop (Kanan) */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggleButton />
          <Link href="/login">
            <motion.p
              className={`transition-colors ${isScrolled
                ? 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                : 'text-white hover:text-gray-200'
                }`}
              whileHover={{ scale: 1.1 }}
              title="Sign In"
            >
              <User size={20} />
            </motion.p>
          </Link>
          <motion.a
            href="#"

            className={`transition-colors ${isScrolled
              ? 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              : 'text-white hover:text-gray-200'
              }`}
            whileHover={{ scale: 1.1 }}
            title="Cart"
          >
            <ShoppingBag size={20} />
          </motion.a>
        </div>

        {/* Tombol Aksi Mobile (Kanan) */}
        <div className="md:hidden flex items-center gap-4">
          <ThemeToggleButton />
          <motion.a
            href="#"

            className={`transition-colors ${isScrolled
              ? 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              : 'text-white hover:text-gray-200'
              }`}
            whileHover={{ scale: 1.1 }}
            title="Cart"
          >
            <ShoppingBag size={20} />
          </motion.a>
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.9 }}

            className={`transition-colors ${isScrolled
              ? 'text-gray-900 dark:text-white'
              : 'text-white'
              }`}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>

      {/* --- Menu Mobile Sidebar --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              variants={backdropVariants}
              initial="closed"
              animate="open"
              exit="closed"
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 h-screen w-screen bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Panel Sidebar */}
            <motion.div
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-0 right-0 h-screen w-[80%] bg-white dark:bg-gray-900 shadow-xl z-50 p-6"
            >
              <div className="flex flex-col h-full">
                {/* Header Sidebar (Logo & Tombol Close) */}
                <div className="flex justify-between items-center mb-10">
                  <a href="#" className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                    {/* <CopyCheckIcon size={24} /> */}
                    OffMode Store
                  </a>
                  <motion.button
                    onClick={() => setIsMobileMenuOpen(false)}
                    whileTap={{ scale: 0.9 }}
                    className="text-gray-600 dark:text-gray-300"
                  >
                    <X size={28} />
                  </motion.button>
                </div>

                {/* Daftar Link Navigasi */}
                <motion.nav
                  variants={navListVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  className="flex flex-col gap-5"
                >
                  {navLinks.map((link) => (
                    <Link href={link.href} key={link.name}>
                      <motion.p
                        variants={navItemVariants}
                        className="text-lg font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.name}
                      </motion.p>
                    </Link>
                  ))}

                  {/* Garis Pemisah */}
                  <motion.div
                    variants={navItemVariants}
                    className="border-t border-gray-200 dark:border-gray-700 my-4"
                  />

                  {/* Link Sign In Terpisah */}
                  <Link href="#">
                    <motion.p
                      variants={navItemVariants}
                      className="flex items-center gap-3 text-lg font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User size={22} />
                      Sign In
                    </motion.p>
                  </Link>
                  <Link href="#">
                    <motion.p
                      variants={navItemVariants}
                      className="flex items-center gap-3 text-lg font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ShoppingBag size={22} />
                      Belanjaan Saya
                    </motion.p>
                  </Link>
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