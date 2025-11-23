import localFont from "next/font/local";
import "./globals.css";
import ClientProviders from "../../components/ClientProviders";

// Load Fonts
const poppins = localFont({
  src: [
    { path: "../../public/fonts/Poppins-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/Poppins-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/Poppins-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/Poppins-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap", // Penting untuk performa font
});

// 1. Konfigurasi Base URL (Ganti dengan domain production Anda)
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://offmodestore.com";

// 2. Konfigurasi Viewport (Warna tema browser mobile)
export const viewport = {
  themeColor: "#9333ea", // Warna ungu (sesuai tema app Anda)
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// 3. Metadata SEO Lengkap
export const metadata = {
  metadataBase: new URL(SITE_URL),
  
  // Judul Halaman
  title: {
    default: "OffMode Store | Gaya Kasual & Trendy",
    template: "%s | OffMode Store", // Nanti di halaman lain cukup tulis title: "Kemeja", jadinya "Kemeja | OffMode Store"
  },
  
  // Deskripsi untuk Google Search
  description: "Temukan koleksi fashion terbaik di OffMode Store. Kemeja, celana, dan outfit kasual berkualitas tinggi dengan harga terjangkau. Tampil gaya setiap hari.",
  
  // Kata Kunci (Opsional tapi bagus)
  keywords: ["fashion pria", "fashion wanita", "kemeja linen", "baju kasual", "offmode store", "toko baju online indonesia"],
  
  // Penulis / Pembuat
  authors: [{ name: "OffMode Team", url: SITE_URL }],
  creator: "OffMode Developer",
  publisher: "OffMode Store",

  // Pengaturan Robot (Google Bot)
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Ikon Website (Favicon & Apple Icon)
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },

  // Open Graph (Tampilan saat link di-share di WhatsApp/Facebook)
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    title: "OffMode Store | Gaya Kasual & Trendy",
    description: "Belanja fashion kekinian dengan kualitas premium. Cek koleksi terbaru kami sekarang!",
    siteName: "OffMode Store",
    images: [
      {
        url: "/opengraph-image.png", // Pastikan file ini ada di folder public/
        width: 1200,
        height: 630,
        alt: "OffMode Store Collection Banner",
      },
    ],
  },

  // Twitter Card (Tampilan saat share di Twitter/X)
  twitter: {
    card: "summary_large_image",
    title: "OffMode Store | Fashion Harianmu",
    description: "Upgrade gayamu dengan koleksi terbaru dari OffMode Store.",
    images: ["/opengraph-image.png"],
    creator: "@offmodestore", // Ganti username twitter jika ada
  },

  // Verifikasi Google Search Console (Nanti diisi jika sudah deploy)
  verification: {
    google: "kode-verifikasi-google-anda",
  },
};

// --- JSON-LD SCHEMA (Structured Data) ---
// Agar Google mengenali ini sebagai Toko / Organisasi
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  "name": "OffMode Store",
  "image": `${SITE_URL}/opengraph-image.png`,
  "description": "Toko fashion online menyediakan kemeja, celana, dan aksesoris berkualitas.",
  "url": SITE_URL,
  "telephone": "+6289676655115",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Jalan Contoh No. 123",
    "addressLocality": "Jakarta",
    "postalCode": "12345",
    "addressCountry": "ID"
  },
  "priceRange": "$$"
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning={true}>
      <head>
        {/* Inject JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${poppins.variable} font-poppins antialiased bg-stone-50 dark:bg-gray-900 text-gray-900 dark:text-white`}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}