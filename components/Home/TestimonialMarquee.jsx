import React, { useEffect, useState, useRef } from "react";
import {
  motion,
  useAnimation,
} from "framer-motion";

// --- Komponen Bintang (SVG) ---
const Star = ({ className, fill = "none" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

// --- Komponen TestimonialCard (Tetap) ---
const TestimonialCard = ({ quote, name, role, stars }) => {
  return (
    <div className="shrink-0 w-full md:w-96 rounded-2xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-md p-6 shadow-lg">
      <div className="flex items-center justify-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
          {name.charAt(0)}
        </div>
        <div className="flex flex-col">
          <div className="w-full flex flex-col justify-center items-start">
            <h4 className="font-semibold text-gray-900 dark:text-white leading-tight">
              {name}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{role}</p>
          </div>
          <div className="flex mt-1">
            {Array.from({ length: stars }).map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4 text-yellow-400"
                fill="currentColor"
              />
            ))}
          </div>
        </div>
      </div>
      <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">
        “{quote}”
      </p>
    </div>
  );
};

// --- Data Testimoni ---
const testimonials = [
  {
    quote:
      "Kualitasnya benar-benar di luar ekspektasi. Sangat premium dan pelayanannya cepat.",
    name: "Andi R.",
    role: "Pecinta Fashion",
    stars: 5,
  },
  {
    quote:
      "Akhirnya nemu store yang koleksinya terkurasi dengan baik. Desainnya modern.",
    name: "Sarah K.",
    role: "Desainer Grafis",
    stars: 5,
  },
  {
    quote:
      "Pelayanan CS sangat ramah dan membantu. Pengiriman juga cepat. Recommended!",
    name: "Budi S.",
    role: "Mahasiswa",
    stars: 4,
  },
  {
    quote:
      "Barangnya otentik 100%. Saya cek dan memang original. Tidak perlu ragu lagi.",
    name: "Citra L.",
    role: "Karyawan Swasta",
    stars: 5,
  },
  {
    quote:
      "Desainnya 'clean' dan minimalis, pas sekali dengan selera saya. Suka banget!",
    name: "David H.",
    role: "Arsitek",
    stars: 5,
  },
  {
    quote:
      "Packing sangat aman dan rapi. Detail kecil yang membuat saya terkesan.",
    name: "Elisa F.",
    role: "Manajer",
    stars: 5,
  },
];

// Duplikasi array untuk loop marquee (HANYA UNTUK DESKTOP)
const duplicatedTestimonials = [...testimonials, ...testimonials];

// --- Komponen Utama (PERBAIKAN) ---
const TestimonialMarquee = () => {
  // State untuk melacak durasi marquee (desktop) dan status mobile
  const [marqueeDuration, setMarqueeDuration] = useState(25); // Desktop lebih cepat
  const [isMobile, setIsMobile] = useState(false);
  
  const controls = useAnimation();
  const mobileBreakpoint = 768; // md breakpoint

  // Efek untuk deteksi ukuran layar dan mengontrol animasi
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < mobileBreakpoint) {
        setIsMobile(true);
        controls.stop(); // Hentikan animasi marquee di mobile
      } else {
        // Mode Desktop/Tablet
        setIsMobile(false);
        const desktopDuration = 25; // Durasi cepat untuk desktop
        setMarqueeDuration(desktopDuration);
        
        // Mulai/Restart animasi marquee
        controls.start({
          x: "-50%",
          transition: {
            duration: desktopDuration,
            ease: "linear",
            repeat: Infinity,
          },
        });
      }
    };

    handleResize(); // Panggil saat komponen dimuat
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [controls]); // Hanya bergantung pada 'controls'

  // Fungsi untuk menghentikan animasi (hanya di desktop)
  const handleHoverStart = () => {
    if (!isMobile) controls.stop();
  };

  // Fungsi untuk melanjutkan animasi (hanya di desktop)
  const handleHoverEnd = () => {
    if (!isMobile) {
      controls.start({
        x: "-50%",
        transition: {
          duration: marqueeDuration, // Gunakan durasi dari state
          ease: "linear",
          repeat: Infinity,
        },
      });
    }
  };

  // Variants untuk animasi mobile
  const mobileCardVariants = {
    hiddenLeft: { opacity: 0, x: -100 },
    hiddenRight: { opacity: 0, x: 100 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  return (
    <div className="w-full py-10 dark:bg-gray-900 overflow-hidden">
      <div className="px-4">
        
        <h3
          className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white text-center"
        >
          Apa Kata Mereka
        </h3>

        {isMobile ? (
          // --- TAMPILAN MOBILE: KOLOM VERTIKAL ---
          <div className="flex flex-col items-center gap-6 mt-12 mx-auto">
            {testimonials.map((testi, idx) => (
              <motion.div
                key={testi.name} // Gunakan key unik
                className="w-full"
                variants={mobileCardVariants}
                // Tentukan 'initial' berdasarkan index (ganjil/genap)
                initial={idx % 2 === 0 ? "hiddenRight" : "hiddenLeft"}
                whileInView="visible"
                // 'viewport' untuk memicu animasi saat masuk layar
                viewport={{ once: true, amount: 0.3 }}
              >
                <TestimonialCard
                  quote={testi.quote}
                  name={testi.name}
                  role={testi.role}
                  stars={testi.stars}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          // --- TAMPILAN DESKTOP: MARQUEE ---
          <motion.div
            className="w-full mx-auto overflow-x-hidden mt-12"
            style={{
              maskImage:
                "linear-gradient(to right, transparent, white 10%, white 90%, transparent)",
            }}
            onHoverStart={handleHoverStart}
            onHoverEnd={handleHoverEnd}
          >
            <motion.div
              key={marqueeDuration} // Key untuk me-restart animasi saat durasi berubah
              className="flex gap-6"
              animate={controls}
            >
              {duplicatedTestimonials.map((testi, idx) => (
                <TestimonialCard
                  key={idx}
                  quote={testi.quote}
                  name={testi.name}
                  role={testi.role}
                  stars={testi.stars}
                />
              ))}
            </motion.div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default TestimonialMarquee;