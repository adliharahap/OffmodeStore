"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";

export default function ThemeManager() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    const isAdminRoute = pathname.startsWith("/dashboardAdmin");

    if (isAdminRoute) {
      // --- SKENARIO 1: MASUK KE ADMIN ---
      
      // Cek apakah kita sudah menyimpan backup tema user?
      const savedTheme = sessionStorage.getItem("user-prev-theme");

      // Jika belum ada backup, dan tema saat ini BUKAN light (artinya user pakai Dark/System),
      // maka simpan tema user tersebut untuk dikembalikan nanti.
      if (!savedTheme && theme !== "light") {
        sessionStorage.setItem("user-prev-theme", theme);
      }

      // PAKSA JADI LIGHT MODE
      if (theme !== "light") {
        setTheme("light");
      }

    } else {
      // --- SKENARIO 2: KELUAR DARI ADMIN (KE PUBLIK) ---
      
      // Cek apakah ada tema yang harus dikembalikan (Restore)?
      const savedTheme = sessionStorage.getItem("user-prev-theme");

      if (savedTheme) {
        // Kembalikan ke tema pilihan user sebelumnya
        setTheme(savedTheme);
        // Hapus backup agar tidak mengganggu toggle manual user selanjutnya
        sessionStorage.removeItem("user-prev-theme");
      }
      
      // JIKA TIDAK ADA savedTheme:
      // Jangan lakukan apa-apa. Biarkan user menggunakan toggle manual di Header.
    }
  }, [pathname, setTheme, theme]);

  return null;
}