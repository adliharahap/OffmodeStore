import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Mail } from 'lucide-react';

// --- Icon Kustom WhatsApp ---
// Lucide-react tidak memiliki ikon WhatsApp, jadi kita buat SVG-nya di sini
const WhatsappIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6"
    {...props}
  >
    <path d="M19.02 4.97c-2.61-2.61-6.09-4.07-9.82-4.07C4.6 0 .98 3.62.98 8.22c0 1.58.46 3.06 1.3 4.34l-1.32 4.82 4.93-1.3c1.23.78 2.64 1.2 4.1 1.2h.02c4.6 0 8.22-3.62 8.22-8.22 0-3.73-1.46-7.21-4.07-9.82zM12.02 14.88c-1.18 0-2.33-.2-3.39-.58l-.24-.14-2.53.67.68-2.47-.16-.26c-.44-1.09-.68-2.27-.68-3.48 0-3.3 2.69-5.99 6-5.99 1.63 0 3.17.65 4.25 1.73s1.73 2.62 1.73 4.25c-.01 3.3-2.7 5.99-6.01 5.99zm3.5-4.5c-.19-.1-.44-.2-.64-.28-.2-.08-.47-.13-.72-.13-.25 0-.44.05-.58.1-.14.05-.33.24-.48.48-.15.24-.3.48-.4.63-.1.15-.2.15-.38.1-.18-.05-1.04-.38-1.98-1.23-.73-.66-1.22-1.48-1.36-1.72-.14-.24-.03-.38.08-.5.1-.1.22-.25.33-.37.11-.12.18-.2.25-.33s.13-.25.18-.4c.05-.15.03-.28-.02-.38-.05-.1-.22-.48-.3-.66-.08-.18-.16-.15-.24-.15-.08 0-.18-.03-.28-.03-.1 0-.25.03-.38.18-.13.15-.48.45-.48 1.1 0 .65.5 1.28.58 1.38.08.1.95 1.5 2.3 2.05 1.35.55 1.8.68 2.15.63.35-.05.88-.35 1-.7.12-.35.12-.65.08-.75-.04-.1-.18-.15-.37-.25z" />
  </svg>
);

// --- JSDoc untuk Prop Product (Pengganti TypeScript) ---
/**
 * @typedef {object} Product
 * @property {string} name - Nama produk
 * @property {string} imageUrl - URL gambar produk
 * @property {string} price - Harga produk
 * @property {string} storeName - Nama toko Anda
 * @property {string} whatsappNumber - Nomor WA toko (format: 628XXXXXXXXX)
 * @property {string} email - Email toko
 */

/**
 * Komponen tombol chat mengambang dengan opsi WA dan Gmail.
 * @param {object} props
 * @param {Product} props.product - Objek yang berisi detail produk untuk pesan otomatis.
 */
// --- Komponen Utama FloatingChatButton ---
const FloatingChatButton = ({ product }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  // Fungsi untuk handle klik WhatsApp
  const handleWhatsAppClick = () => {
    const message = `
Halo ${product.storeName},
Saya tertarik dengan produk ini:
Nama Produk: ${product.name}
Harga: ${product.price}
Link Gambar: ${product.imageUrl}

Apakah produk ini masih tersedia?
Terima kasih.
    `;
    const encodedMessage = encodeURIComponent(message.trim());
    const waUrl = `https://wa.me/${product.whatsappNumber}?text=${encodedMessage}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  // Fungsi untuk handle klik Gmail
  const handleGmailClick = () => {
    const subject = `Pertanyaan Mengenai Produk: ${product.name}`;
    const body = `
Halo ${product.storeName},

Saya ingin bertanya mengenai produk berikut:
Nama Produk: ${product.name}
Harga: ${product.price}
Link Gambar: ${product.imageUrl}

[Silakan tulis pertanyaan Anda di sini]

Terima kasih.
    `;
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body.trim());
    const mailUrl = `mailto:${product.email}?subject=${encodedSubject}&body=${encodedBody}`;
    window.open(mailUrl);
    setIsOpen(false);
  };

  // Varian animasi untuk child buttons (WA & Gmail)
  const itemVariants = {
    // Kondisi tertutup (sebelum animasi)
    closed: {
      translateY: 0,
      rotate: 0,
      opacity: 0,
      scale: 0.1, // Mulai dari kecil di tengah tombol
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    // Kondisi terbuka (setelah animasi)
    // 'index' adalah custom prop (0 untuk WA, 1 untuk Gmail)
    open: (index) => ({
      translateY: -(index + 1) * 72, // 72px = 14 (size) + 4 (gap)
      rotate: 360, // Animasi "berputar"
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring', // Efek pegas
        stiffness: 300,
        damping: 20,
        delay: index * 0.1 // Sedikit jeda antar ikon
      }
    }),
    // Kondisi saat menutup (animasi keluar)
    exit: (index) => ({
      translateY: 0,
      rotate: -360, // Berputar ke arah sebaliknya
      opacity: 0,
      scale: 0.1,
      transition: {
        duration: 0.3,
        ease: 'easeIn',
        delay: (1 - index) * 0.1 // Stagger terbalik
      }
    })
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Kontainer relatif untuk menampung semua tombol */}
      <div className="relative flex flex-col items-center">

        {/* Wrapper AnimatePresence untuk child buttons */}
        {/* Ini penting agar animasi 'exit' bisa berjalan */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Tombol WhatsApp (Index 0) */}
              <motion.button
                custom={0} // index untuk varian
                variants={itemVariants}
                initial="closed"
                animate="open"
                exit="exit"
                onClick={handleWhatsAppClick}
                className="absolute bottom-[9px] w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 focus:outline-none"
                aria-label="Chat on WhatsApp"
              >
                <WhatsappIcon />
              </motion.button>

              {/* Tombol Gmail (Index 1) */}
              <motion.button
                custom={1} // index untuk varian
                variants={itemVariants}
                initial="closed"
                animate="open"
                exit="exit"
                onClick={handleGmailClick}
                className="absolute bottom-[9px] w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 focus:outline-none"
                aria-label="Send Email"
              >
                <Mail className="w-6 h-6" />
              </motion.button>
            </>
          )}
        </AnimatePresence>

        {/* Tombol Utama (Parent) */}
        <motion.button
          onClick={toggleOpen}
          className="relative w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xl z-10 hover:bg-blue-700 focus:outline-none"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={isOpen ? "Tutup opsi chat" : "Buka opsi chat"}
        >
          {/* AnimatePresence untuk animasi ikon (Chat <-> X) */}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={isOpen ? 'x' : 'chat'}
              initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30, duration: 0.2 }}
              className="absolute" // Ikon saling menimpa di tengah
            >
              {isOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
            </motion.div>
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
};

export default FloatingChatButton;