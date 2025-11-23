import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Mail, MessagesSquare } from 'lucide-react';

// --- Icon Kustom WhatsApp ---
// Lucide-react tidak memiliki ikon WhatsApp, jadi kita buat SVG-nya di sini
const WhatsappIcon = (props) => (
  <svg
    fill="currentColor"
    viewBox="0 0 16 16"
    className="w-6 h-6"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M11.42 9.49c-.19-.09-1.1-.54-1.27-.61s-.29-.09-.42.1-.48.6-.59.73-.21.14-.4 0a5.13 5.13 0 0 1-1.49-.92 5.25 5.25 0 0 1-1-1.29c-.11-.18 0-.28.08-.38s.18-.21.28-.32a1.39 1.39 0 0 0 .18-.31.38.38 0 0 0 0-.33c0-.09-.42-1-.58-1.37s-.3-.32-.41-.32h-.4a.72.72 0 0 0-.5.23 2.1 2.1 0 0 0-.65 1.55A3.59 3.59 0 0 0 5 8.2 8.32 8.32 0 0 0 8.19 11c.44.19.78.3 1.05.39a2.53 2.53 0 0 0 1.17.07 1.93 1.93 0 0 0 1.26-.88 1.67 1.67 0 0 0 .11-.88c-.05-.07-.17-.12-.36-.21z" />
    <path d="M13.29 2.68A7.36 7.36 0 0 0 8 .5a7.44 7.44 0 0 0-6.41 11.15l-1 3.85 3.94-1a7.4 7.4 0 0 0 3.55.9H8a7.44 7.44 0 0 0 5.29-12.72zM8 14.12a6.12 6.12 0 0 1-3.15-.87l-.22-.13-2.34.61.62-2.28-.14-.23a6.18 6.18 0 0 1 9.6-7.65 6.12 6.12 0 0 1 1.81 4.37A6.19 6.19 0 0 1 8 14.12z" />
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

Link Produk:
${product.productUrl}

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
          className="relative w-16 h-16 bg-purple-700 text-white rounded-full flex items-center justify-center shadow-xl z-10 hover:bg-purple-600 duration-100 transition-all focus:outline-none"
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
              {isOpen ? <X className="w-8 h-8" /> : <MessagesSquare className="w-8 h-8" />}
            </motion.div>
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
};

export default FloatingChatButton;