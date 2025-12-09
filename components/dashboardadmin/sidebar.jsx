"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BookOpen,
  Settings,
  Shield,
  ChevronsRight,
  ChevronsLeft,
  LogOut,
  Menu, // Icon untuk Hamburger
  X,       // Icon untuk Tombol Close
  Home,
  AlertTriangle
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { openLogoutModal } from '../../store/slice/uiSlice';

// === Variasi Animasi Tombol Desktop ===
// (Tidak berubah, ini untuk DesktopSidebar)
const toggleButtonVariants = {
  expanded: { left: "14.5rem", x: 0 },
  collapsed: { left: "3.625rem", x: [0, 3, 0] }
};

const toggleButtonTransition = {
  left: { type: "spring", stiffness: 260, damping: 40 },
  x: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
};

/**
 * ====================================================================
 * Komponen Induk Utama (Controller)
 * ====================================================================
 * Ini adalah komponen default export yang baru.
 * Tugasnya mengelola state mobile/desktop dan menampilkannya.
 */
export default function AdminNavigationShell({isMobileOpen, setIsMobileOpen, userId}) {
// State Sidebar
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(false);

  // Hooks
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  // Konfigurasi Navigasi
  const navLinks = [
    { 
      name: "Dashboard", 
      icon: LayoutDashboard, 
      href: `/dashboardAdmin/${userId}` 
    },
    { 
      name: "Produk", 
      icon: Package, 
      href: `/dashboardAdmin/${userId}/products` 
    },
    { 
      name: "Pesanan", 
      icon: ShoppingCart, 
      href: `/dashboardAdmin/${userId}/orders` 
    },
    { 
      name: "Pelanggan", 
      icon: Users, 
      href: `/dashboardAdmin/${userId}/customers` 
    },
    { 
      name: "Outloook", 
      icon: BookOpen, 
      href: `/dashboardAdmin/${userId}/outlook` 
    },
    // --- PERUBAHAN DI SINI: Ganti Pengaturan jadi Halaman Utama ---
    { 
      name: "Halaman Utama", 
      icon: Home, 
      href: `/` 
    },
  ];



  // Normalisasi data user (seperti sebelumnya)
  const userData = {
    name: user?.full_name || 'Guest User',
    email: user?.email || 'guest@example.com',
    role: user?.role || 'Guest',
    avatarUrl: user?.avatar_url || 
    `https://ui-avatars.com/api/?name=${user?.email || 'User'}&background=random&color=ffffff`,
  };

  return (
    <>
{/* Sidebar Mobile */}
      <MobileSidebar 
        isOpen={isMobileOpen} 
        navLinks={navLinks}
        onClose={() => setIsMobileOpen(false)}
        user={userData}
        onLogoutClick={() => dispatch(openLogoutModal())} // Trigger Modal
      />

      {/* Sidebar Desktop */}
      <DesktopSidebar 
        navLinks={navLinks}
        isExpanded={isDesktopExpanded} 
        setIsExpanded={setIsDesktopExpanded} 
        user={userData}
        onLogoutClick={() => dispatch(openLogoutModal())} // Trigger Modal
      />
    </>
  );
}

/**
 * ====================================================================
 * 2. Mobile Sidebar (Komponen Baru)
 * ====================================================================
 * Overlay yang muncul dari kiri.
 */
function MobileSidebar({ isOpen, onClose, user, navLinks, onLogoutClick }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (untuk menutup saat diklik) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            aria-hidden="true"
          />
          
          {/* Konten Sidebar */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 150 }}
            className="fixed top-0 left-0 bottom-0 w-64 bg-gray-950 text-gray-200 p-4 flex flex-col justify-between z-50 md:hidden overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            {/* Bagian Atas: Logo, Tombol Close, Navigasi */}
            <div>
              <div className="flex items-center justify-between mb-10">
                {/* Menggunakan komponen Logo yang sama, paksa expanded */}
                <Logo isExpanded={true} />
                <button 
                  onClick={onClose} 
                  className="p-2 rounded-md hover:bg-gray-700 transition-colors"
                  aria-label="Tutup menu"
                >
                  <X size={24} />
                </button>
              </div>
              
              <nav>
                <ul>
                  {/* Menggunakan komponen NavItem yang sama, paksa expanded */}
                  {navLinks.map((link) => (
                    <NavItem key={link.name} link={link} isExpanded={true} onNavigate={onClose} />
                  ))}
                </ul>
              </nav>
            </div>

            {/* Bagian Bawah: Logout, Info User */}
            <div>
              {/* Menggunakan komponen LogOutButton yang sama, paksa expanded */}
              <LogOutButton isExpanded={true} onClick={onLogoutClick} />
              {/* Menggunakan komponen UserInfo yang sama, paksa expanded */}
              <UserInfo user={user} isExpanded={true} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


/**
 * ====================================================================
 * 3. Desktop Sidebar (Komponen Asli Anda)
 * ====================================================================
 * Komponen ini adalah <aside> asli Anda, sekarang di-refactor
 * untuk menerima props state dan disembunyikan di mobile.
 */
function DesktopSidebar({ isExpanded, setIsExpanded, user, navLinks, onLogoutClick }) {
  // Variasi animasi (dari kode asli Anda)
  const sidebarVariants = {
    expanded: {
      width: "256px",
      transition: { type: "spring", damping: 15, stiffness: 100 },
    },
    collapsed: {
      width: "80px",
      transition: { type: "spring", damping: 15, stiffness: 100 },
    },
  };

  return (
    // KUNCI: 'hidden' di mobile, 'lg:flex' di desktop
    <motion.aside
      variants={sidebarVariants}
      animate={isExpanded ? "expanded" : "collapsed"}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className="hidden md:flex h-screen bg-gray-950 dark:bg-black text-gray-200 p-4 flex-col justify-between shadow-lg overflow-hidden"
    >
      {/* Bagian Atas: Logo dan Navigasi */}
      <div>
        <Logo isExpanded={isExpanded} />
        <nav className="mt-10">
          <ul>
            {navLinks.map((link) => (
              <NavItem key={link.name} link={link} isExpanded={isExpanded} />
            ))}
          </ul>
        </nav>
      </div>

      {/* Bagian Bawah: Logout dan Info Pengguna */}
      <div>
        <LogOutButton isExpanded={isExpanded} onClick={onLogoutClick} />
        <UserInfo user={user} isExpanded={isExpanded} />
      </div>

      {/* Tombol Toggle (Animasi diperbarui) */}
      <motion.div
        variants={toggleButtonVariants}
        animate={isExpanded ? "expanded" : "collapsed"}
        transition={toggleButtonTransition}
        className="absolute z-50 top-9 h-9 w-9 bg-gray-800 border-4 border-gray-900 rounded-full flex items-center justify-center cursor-pointer"
      >
        {isExpanded ? <ChevronsLeft size={20} /> : <ChevronsRight size={20} />}
      </motion.div>
    </motion.aside>
  );
}


function Logo({ isExpanded }) {
  return (
    <div className="flex items-center justify-center h-10 px-2">
      <motion.img
        src="/logo.png"
        alt="OffMode Store Logo"
        className="h-10 w-auto object-contain"
        animate={{ rotate: isExpanded ? 360 : 0 }}
        transition={{ duration: 0.7 }}
        onError={(e) => { e.target.src = 'https://placehold.co/100x40/333333/FFFFFF?text=OffMode&font=arial'; e.target.style.height = '40px'; }}
      />
      <AnimatePresence>
        {isExpanded && (
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, delay: 0.15 }}
            className="ml-2 text-lg font-bold whitespace-nowrap"
          >
            OffMode<span className="text-gray-500">Admin</span>
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Sub-Komponen: NavItem
 */
function NavItem({ link, isExpanded, onNavigate }) {
  // TODO: Tambahkan logika 'active' di sini jika perlu
  // const isActive = window.location.pathname === link.href;
  const isActive = false; // Ganti dengan logika routing Anda

  return (
    <li className="mb-2">
      <Link
        href={link.href}
        onClick={() => {
          if (onNavigate) onNavigate(); // <--- tutup sidebar setelah klik
        }}
        className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
          isActive 
            ? 'bg-gray-700 text-white' 
            : 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
        }`}
      >
        <link.icon className={`w-6 h-6 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
        <AnimatePresence>
          {isExpanded && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="ml-4 text-sm font-medium whitespace-nowrap"
            >
              {link.name}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    </li>
  );
}

/**
 * Sub-Komponen: Tombol LogOut
 */
function LogOutButton({ isExpanded, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center w-full p-3 rounded-lg hover:bg-red-800/50 hover:text-red-400 text-gray-400 transition-colors duration-200"
    >
      <LogOut className="w-6 h-6 shrink-0" />
      <AnimatePresence>
        {isExpanded && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="ml-4 text-sm font-medium whitespace-nowrap"
          >
            Log Out
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}


/**
 * Sub-Komponen: UserInfo
 */
function UserInfo({ user, isExpanded }) {
  return (
    <div className="flex items-center justify-center border-t border-gray-700 mt-2 py-3">
      <img
        src={user.avatarUrl}
        alt={user.name}
        className={`w-10 h-10 rounded-full shrink-0 object-cover bg-gray-700`}
        onError={(e) => { e.target.src = 'https://placehold.co/100x100/333333/FFFFFF?text=A&font=arial'; }}
      />
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="ml-3 whitespace-nowrap overflow-hidden"
          >
            <p className="font-semibold text-sm truncate" title={user.name}>{user.name}</p>
            <p className="text-xs text-gray-400 truncate" title={user.email}>{user.email}</p>
            <span className="mt-1 flex items-center w-full">
              <Shield size={14} className="text-green-500 mr-1.5 shrink-0" />
              <p className="text-xs font-medium text-green-500 truncate">{user.role}</p>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}