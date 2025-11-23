"use client";

import React, { useState } from "react";
import AdminSidebar from "../../../../components/dashboardadmin/sidebar";
import { Menu } from "lucide-react";

function MobileHeader({ onMenuClick }) {
  return (
    <header className="md:hidden fixed top-0 z-40 w-full bg-gray-900 text-gray-200 p-4 flex items-center justify-between shadow-lg">
      {/* Logo di Header Mobile */}
      <div className="flex items-center h-10">
         <img
            src="/logo.png"
            alt="OffMode Store Logo"
            className="h-8 w-auto object-contain" // Sedikit lebih kecil untuk header
            onError={(e) => { e.target.src = 'https://placehold.co/80x32/333333/FFFFFF?text=OffMode&font=arial'; e.target.style.height = '32px'; }}
          />
          <span className="ml-2 text-lg font-bold">
            OffMode<span className="text-gray-500">Admin</span>
          </span>
      </div>
      
      {/* Tombol Hamburger */}
      <button 
        onClick={onMenuClick} 
        className="p-2 rounded-md hover:bg-gray-700 transition-colors"
        aria-label="Buka menu"
      >
        <Menu size={24} />
      </button>
    </header>
  );
}

export default function AdminLayout({ children, params }) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { id } = React.use(params);

    return (
        <div className="flex h-screen bg-gray-50">
            <MobileHeader onMenuClick={() => setIsMobileOpen(true)} />
            {/* 1. Sidebar yang Persisten */}
            <AdminSidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} userId={id} />

            {/* 2. Konten Halaman (Child) */}
            <main className="flex-1 overflow-y-auto dashboard-admin">
                {/* children di sini adalah page.js dari /dashboard atau /products */}
                {children}
            </main>
        </div>
    );
}