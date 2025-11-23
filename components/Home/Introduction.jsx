"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  Feather, Palette, Gem, Users, Star, Truck, ArrowUpRight, ChevronDown, Plus, Minus 
} from 'lucide-react';

// --- BAGIAN 1: KOMPONEN TESTIMONIAL (ADAPTIVE) ---

const TestimonialCard = ({ quote, name, role, stars }) => {
  return (
    <div className="shrink-0 w-[85vw] md:w-[450px] p-8 border-l border-gray-200 dark:border-white/10 bg-white dark:bg-[#111] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors duration-300 relative group">
      {/* Dekorasi Kutip */}
      <div className="absolute top-6 right-8 text-6xl font-serif text-gray-100 dark:text-white/5 group-hover:text-purple-200 dark:group-hover:text-purple-500/10 transition-colors">”</div>
      
      <div className="flex gap-1 mb-6">
        {Array.from({ length: stars }).map((_, i) => (
          // Star Color: Kuning/Emas di Light, Putih di Dark (atau bisa kuning di keduanya)
          <Star key={i} size={14} className="fill-gray-900 dark:fill-white text-gray-900 dark:text-white" />
        ))}
      </div>

      <p className="text-xl md:text-2xl font-serif text-gray-800 dark:text-gray-200 italic leading-relaxed mb-8 opacity-90">"{quote}"</p>
      
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-linear-to-tr from-purple-600 to-indigo-600 dark:from-purple-900 dark:to-slate-800 border border-white/20 flex items-center justify-center text-xs font-bold text-white uppercase tracking-wider shadow-md">
          {name.substring(0, 2)}
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">{name}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider mt-0.5">{role}</p>
        </div>
      </div>
    </div>
  );
};

const testimonials = [
  { quote: "Kualitas kainnya mengingatkan saya pada brand high-end Eropa. Sangat impresif.", name: "Andi R.", role: "Fashion Enthusiast", stars: 5 },
  { quote: "Potongan bajunya sangat flattering. Susah mencari cuttingan seperti ini.", name: "Sarah K.", role: "Creative Director", stars: 5 },
  { quote: "Pengalaman unboxing yang mewah. Detail kecilnya diperhatikan.", name: "Budi S.", role: "Entrepreneur", stars: 5 },
  { quote: "Basic wear terbaik yang tidak cepat melar setelah dicuci berkali-kali.", name: "Citra L.", role: "Architect", stars: 5 },
  { quote: "Pelayanan sangat personal. Rasanya seperti belanja di butik eksklusif.", name: "David H.", role: "Musician", stars: 5 },
];

const duplicatedTestimonials = [...testimonials, ...testimonials];

const TestimonialMarquee = () => {
  const [isMobile, setIsMobile] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    if (window.innerWidth >= 768) {
        controls.start({
          x: "-50%",
          transition: { duration: 50, ease: "linear", repeat: Infinity },
        });
    }
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [controls]);

  return (
    <div className="w-full py-20 border-t border-gray-200 dark:border-white/10 relative bg-stone-50 dark:bg-[#0a0a0a]">
      <div className="container mx-auto px-6 mb-10 flex items-end justify-between">
         <div>
            <h3 className="text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-[0.2em] mb-2">Community</h3>
            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white">Voices of Style</h2>
         </div>
         <div className="hidden md:block w-1/3 h-px bg-gray-300 dark:bg-white/10 mb-2"></div>
      </div>
      {isMobile ? (
        <div className="flex flex-col gap-6 px-6">
          {testimonials.slice(0, 3).map((testi, idx) => (
            <div key={idx} className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
                <TestimonialCard {...testi} />
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full overflow-hidden border-y border-gray-200 dark:border-white/10 bg-stone-50 dark:bg-[#0a0a0a]">
          <motion.div className="flex will-change-transform" animate={controls}>
            {duplicatedTestimonials.map((testi, idx) => (
              <TestimonialCard key={idx} {...testi} />
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
};

// --- BAGIAN 2: KOMPONEN FEATURE ACCORDION (ADAPTIVE) ---

const FeatureRow = ({ title, desc, icon: Icon, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      onClick={() => setIsOpen(!isOpen)}
      className="group cursor-pointer border-b border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/2 transition-colors duration-300"
    >
      <div className="flex items-center justify-between py-8">
        {/* Bagian Kiri */}
        <div className="flex items-center gap-6">
          <span className="text-xs font-mono text-gray-400 dark:text-gray-600">0{index + 1}</span>
          <div className={`p-3 rounded-full transition-all duration-300 ${
            isOpen 
              ? 'bg-purple-600 text-white' 
              : 'bg-purple-50 text-purple-600 dark:bg-white/5 dark:text-purple-300 group-hover:bg-purple-100 dark:group-hover:bg-white/10'
          }`}>
            <Icon size={20} strokeWidth={1.5} />
          </div>
          <h3 className={`text-xl md:text-2xl font-serif transition-colors ${
            isOpen 
              ? 'text-gray-900 dark:text-white' 
              : 'text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white'
          }`}>
            {title}
          </h3>
        </div>
        
        {/* Bagian Kanan */}
        <div className="pr-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
           {isOpen ? <Minus size={20} /> : <Plus size={20} />}
        </div>
      </div>

      {/* Bagian Bawah */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-8 pl-18 md:pl-22 pr-4 md:pr-20">
              <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed max-w-2xl">
                {desc}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatItem = ({ value, label }) => (
  <div className="flex flex-col items-center md:items-start border-r border-gray-200 dark:border-white/10 last:border-0 px-8 py-4">
    <span className="text-4xl md:text-5xl font-serif text-gray-900 dark:text-white mb-2">{value}</span>
    <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-500">{label}</span>
  </div>
);

// --- BAGIAN 3: KOMPONEN UTAMA ---

const Introduction = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  const features = [
    { title: 'Curated Materials', desc: 'Kami tidak sembarangan memilih kain. Setiap benang diseleksi dari supplier terbaik yang mengutamakan durabilitas dan kelembutan.', icon: Feather },
    { title: 'Timeless Silhouette', desc: 'Desain yang tidak akan basi dimakan zaman. Kami fokus pada potongan klasik yang dimodernisasi.', icon: Palette },
    { title: 'Artisan Details', desc: 'Perbedaan ada pada detail. Jahitan yang presisi, kancing berkualitas tinggi, dan finishing yang rapi.', icon: Gem },
    { title: 'Everyday Comfort', desc: 'Gaya tidak harus menyakitkan. Kami merancang pola (pattern) yang mengikuti gerak tubuh alami manusia.', icon: Users },
    { title: 'Limited Archives', desc: 'Kami memproduksi dalam jumlah terbatas (small batch) untuk menjaga eksklusivitas dan mengurangi limbah fashion.', icon: Star },
    { title: 'Global Shipping', desc: 'Kami melayani pengiriman ke seluruh wilayah dengan standar pengemasan premium yang aman.', icon: Truck },
  ];

  return (
    <section ref={containerRef} className="relative w-full bg-stone-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white overflow-hidden border-t border-gray-200 dark:border-white/5 transition-colors duration-500">
      
      {/* Background Gradient Simple (Adaptive) */}
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-stone-50 to-white dark:from-[#0a0a0a] dark:to-[#111]"></div>

      {/* --- 1. MANIFESTO SECTION (Split) --- */}
      <div className="container mx-auto px-6 pt-24 pb-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center lg:items-start">
           
           {/* Left: Typography */}
           <div className="w-full lg:w-1/2 lg:sticky lg:top-32">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <span className="text-purple-600 dark:text-purple-400 font-bold tracking-[0.2em] text-xs uppercase mb-4 block">The Philosophy</span>
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif leading-[1.1] mb-8 text-gray-900 dark:text-white">
                  Not just clothing. <br />
                  <span className="text-gray-500 dark:text-gray-600 italic">A statement.</span>
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed max-w-md mb-10">
                   Kami percaya gaya sejati tidak berteriak. Ia berbisik lewat kualitas jahitan dan detail. OffMode hadir untuk mereka yang mengerti perbedaan tersebut.
                </p>

                <div className="flex border border-gray-200 dark:border-white/10 rounded-2xl bg-white/50 dark:bg-[#111] backdrop-blur-sm w-fit shadow-sm dark:shadow-none">
                   <StatItem value="500+" label="Products" />
                   <StatItem value="10k+" label="Community" />
                </div>
              </motion.div>
           </div>

           {/* Right: Image (Adaptive Border & Shadow) */}
           <div className="w-full lg:w-1/2 relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg aspect-4/3 overflow-hidden rounded-xl bg-gray-100 dark:bg-[#111] shadow-2xl shadow-gray-200/50 dark:shadow-none">
                 <motion.div style={{ y }} className="absolute inset-0 h-[120%] w-full -top-[10%] will-change-transform">
                    <img 
                      src="https://images.unsplash.com/photo-1485230405346-71acb9518d9c?q=80&w=1000&auto=format&fit=crop" 
                      alt="Editorial Fashion" 
                      className="w-full h-full object-cover opacity-100 dark:opacity-80"
                      loading="lazy" 
                    />
                 </motion.div>
                 
                 {/* Overlay Gradient: Dark mode only to blend image */}
                 <div className="absolute inset-0 bg-linear-to-t from-black/10 via-transparent to-transparent dark:from-[#0a0a0a] dark:via-transparent dark:to-transparent opacity-90"></div>
                 
                 {/* Floating Quote */}
                 <div className="absolute bottom-6 left-6 right-6 p-5 border border-white/40 dark:border-white/10 bg-white/80 dark:bg-[#0a0a0a]/90 backdrop-blur-md rounded-lg shadow-lg">
                    <p className="font-serif text-lg italic text-gray-900 dark:text-white/90">"Fashion fades, only style remains the same."</p>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-2">— Coco Chanel</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* --- 2. FEATURES LIST (Adaptive Borders & Text) --- */}
      <div className="container mx-auto px-6 py-20 border-t border-gray-200 dark:border-white/10">
         <div className="mb-12">
            <h3 className="text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-[0.2em] mb-2">The Standards</h3>
            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white">Why OffMode?</h2>
         </div>

         <div className="flex flex-col">
            {features.map((feature, idx) => (
               <FeatureRow key={idx} index={idx} {...feature} />
            ))}
         </div>
      </div>

      {/* --- 3. TESTIMONIALS --- */}
      <TestimonialMarquee />

    </section>
  );
};

export default Introduction;