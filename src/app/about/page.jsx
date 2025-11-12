"use client";

import React from 'react';
import { motion } from 'framer-motion';
// DI-UPDATE: Impor ikon baru (Tiktok dihapus)
import { Linkedin, Mail, Instagram, MessageCircle } from 'lucide-react';
import HeaderUniversal from '../../../components/HeaderUniversal';
import Footer from '../../../components/Footer';



// --- DATA TIM (4 ORANG) ---
// DI-UPDATE: Data sosial diubah
const teamMembers = [
  {
    id: 1,
    name: 'Anggi Lestari',
    role: 'Lead Designer',
    img: 'https://placehold.co/600x600/5E548E/fff?text=Anggi',
    bio: 'Anggi adalah visi kreatif di balik setiap koleksi, memadukan tren global dengan warisan lokal.',
    social: {
      instagram: '#',
      tiktok: '#',
      whatsapp: 'https://wa.me/6281234567890', // Ganti dengan nomor WA
      mail: 'mailto:anggi@example.com'
    }
  },
  {
    id: 2,
    name: 'Bima Sakti',
    role: 'Head of Operations',
    img: 'https://placehold.co/600x600/9F86C0/fff?text=Bima',
    bio: 'Bima memastikan setiap material berkualitas tinggi dan proses produksi berjalan lancar.',
    social: {
      instagram: '#',
      tiktok: '#',
      whatsapp: 'https://wa.me/6281234567891',
      mail: 'mailto:bima@example.com'
    }
  },
  {
    id: 3,
    name: 'Citra Dewi',
    role: 'Marketing Director',
    img: 'https://placehold.co/600x600/f0e8e0/333?text=Citra',
    bio: 'Citra menceritakan kisah di balik setiap produk, menghubungkan brand kami dengan Anda.',
    social: {
      instagram: '#',
      tiktok: '#',
      whatsapp: 'https://wa.me/6281234567892',
      mail: 'mailto:citra@example.com'
    }
  },
  {
    id: 4,
    name: 'Doni Firmansyah',
    role: 'Lead Developer',
    img: 'https://placehold.co/600x600/333/eee?text=Doni',
    bio: 'Doni adalah arsitek di balik pengalaman digital Anda, memastikan website kami se-elegan pakaian kami.',
    social: {
      instagram: '#',
      tiktok: '#',
      whatsapp: 'https://wa.me/6281234567893',
      mail: 'mailto:doni@example.com'
    }
  },
];

// --- VARIAN ANIMASI ---
const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100
    }
  }
};

// --- KOMPONEN KARTU TIM ---
const TeamCard = ({ member }) => {
  return (
    <motion.div
      className="group flex flex-col items-center text-center bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 p-6"
      variants={itemVariants}
      whileHover={{ y: -10, boxShadow: '0 20px 25px -5px rgba(99, 102, 241, 0.1), 0 10px 10px -5px rgba(99, 102, 241, 0.05)' }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {/* Foto Tim (DI-UPDATE: rounded-lg) */}
      <div className="w-40 h-40 rounded-lg overflow-hidden mb-6 shadow-xl border-4 border-white dark:border-gray-700">
        <img
          src={member.img}
          alt={member.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      
      {/* Info Teks */}
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {member.name}
      </h3>
      <p className="text-base font-semibold text-purple-600 dark:text-purple-400 mb-4">
        {member.role}
      </p>
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm leading-relaxed">
        {member.bio}
      </p>
      
      {/* Ikon Sosial (DI-UPDATE) */}
      <div className="flex gap-4 mt-auto">
        <a
          href={member.social.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          title="Instagram"
        >
          <Instagram className="w-6 h-6" />
        </a>
        <a
          href={member.social.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          title="WhatsApp"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
        <a
          href={member.social.mail}
          className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          title="Email"
        >
          <Mail className="w-6 h-6" />
        </a>
      </div>
    </motion.div>
  );
};

// --- KOMPONEN INPUT FORMULIR ---
const FormInput = ({ id, label, type = 'text', placeholder }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
      required
    />
  </div>
);

// --- KOMPONEN UTAMA HALAMAN ABOUT US ---
const AboutUs = () => {
  return (
    <>
      <HeaderUniversal />

      <div className="bg-stone-50 dark:bg-gray-900 py-20 md:py-32">
        <div className="container mx-auto px-6">
          
          {/* --- Bagian Hero --- */}
          <motion.section
            className="text-center max-w-3xl mx-auto mb-16 md:mb-24"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Tentang Kami
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Kami adalah tim desainer, pengrajin, dan pemimpi yang berdedikasi untuk menciptakan pakaian berkualitas tinggi yang menceritakan sebuah kisah. 
              Kami percaya pada desain yang abadi dan kualitas yang bertahan lama.
            </p>
          </motion.section>

          {/* --- Grid Tim (DI-UPDATE: lg:grid-cols-2) --- */}
          <motion.section
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {teamMembers.map((member) => (
              <TeamCard key={member.id} member={member} />
            ))}
          </motion.section>

          {/* --- BAGIAN BARU: LOKASI & KONTAK --- */}
          <div className="mt-24 md:mt-32 border-t border-gray-200 dark:border-gray-700 pt-16 md:pt-24">
            <motion.section
              className="grid grid-cols-1 lg:grid-cols-2 gap-16"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {/* Kolom Kiri: Lokasi & Gmaps */}
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Lokasi Kami
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Datang dan kunjungi toko fisik kami. Kami senang bisa bertemu Anda secara langsung dan membantu Anda menemukan gaya yang sempurna.
                </p>
                <p className="text-gray-800 dark:text-gray-200 mb-2">
                  <strong>Alamat:</strong> Jl. Kreatif No. 123, Jakarta, Indonesia
                </p>
                <p className="text-gray-800 dark:text-gray-200 mb-6">
                  <strong>Jam Buka:</strong> Sen - Jum (10.00 - 21.00), Sab (10.00 - 22.00)
                </p>

                {/* Google Maps Iframe */}
                <div className="h-88 w-full shadow-lg border border-gray-200 dark:border-gray-700">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.570073289037!2d106.8249641750012!3d-6.188233893800609!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f432b04b934d%3A0xe5f2796e6a1006e8!2sMonumen%20Nasional!5e0!3m2!1sid!2sid!4v1731131494883!5m2!1sid!2sid"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full"
                  ></iframe>
                </div>
              </div>

              {/* Kolom Kanan: Formulir Kontak */}
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Hubungi Kami
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Ada pertanyaan, kritik, atau saran? Jangan ragu untuk mengirimkan pesan kepada kami.
                </p>

                {/* Formulir 'mailto:' */}
                <form 
                  action="mailto:adliharahap1123@gmail.com" // Ganti dengan email support Anda
                  method="POST" 
                  encType="text/plain" 
                  className="space-y-4"
                >
                  <FormInput id="name" label="Nama Anda" placeholder="John Doe" />
                  <FormInput id="email" label="Email Anda" type="email" placeholder="john@example.com" />
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Pesan Anda
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows="5"
                      placeholder="Apa yang ingin Anda sampaikan?"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                      required
                    ></textarea>
                  </div>
                  <motion.button
                    type="submit"
                    className="w-full py-4 px-6 rounded-lg font-semibold text-white bg-purple-600 dark:bg-purple-500 transition-all hover:bg-purple-700 dark:hover:bg-purple-600 shadow-lg"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Kirim Pesan
                  </motion.button>
                </form>
              </div>
            </motion.section>
          </div>
          
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AboutUs;