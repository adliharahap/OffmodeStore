/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // PERBAIKAN UTAMA ADA DI SINI:
        // Ini menghubungkan class "font-poppins" dengan variabel dari layout.js
        poppins: ["var(--font-poppins)", "sans-serif"], 
      },
      // ... konfigurasi lainnya
    },
  },
  plugins: [],
};