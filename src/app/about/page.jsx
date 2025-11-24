"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, Mail, Instagram, MessageCircle, MapPin, ArrowRight, Menu, X, ShoppingBag, Sun, Moon } from 'lucide-react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

// --- DATA TIM (11 ORANG) ---
const teamMembers = [
  {
    id: 1,
    name: 'Anggi Putri Maliky',
    role: 'Product Coordinator',
    email: 'anggiputrimaliky@gmail.com',
    phone: '6285275437848', // 0 diganti 62 untuk link WA
    ig: 'anggiiipm_',
    img: '/founders/anggi.jpeg'
  },
  {
    id: 2,
    name: 'Ratu Andini Pane',
    role: 'Branding & Identity',
    email: 'ratuandini26ok@gmail.com',
    phone: '6285730262668',
    ig: 'ratuandinipane',
    img: '/founders/ratu.jpeg'
  },
  {
    id: 3,
    name: 'Nisa Delfianti',
    role: 'Competitive Analysis',
    email: 'nisadelvianti387@gmail.com',
    phone: '6289506503542',
    ig: 'nsfiynti',
    img: '/founders/nisa.jpeg'
  },
  {
    id: 4,
    name: 'Venny',
    role: 'Documentation & Data',
    email: 'vennyc14@gmail.com',
    phone: '62882017501503',
    ig: 'vennrj',
    img: '/founders/venny.jpeg'
  },
  {
    id: 5,
    name: 'Putri Balqis Lubis',
    role: 'Quality Control',
    email: 'putribalqis1803@gmail.com',
    phone: '6282151521106',
    ig: 'balqislubis18',
    img: '/founders/putri.jpeg'
  },
  {
    id: 6,
    name: 'Hamidah',
    role: 'Value & Strategy Planner',
    email: 'hamiddahh313@gmail.com',
    phone: '6287729802124',
    ig: 'midaaa31',
    img: '/founders/hamidah.jpeg'
  },
  {
    id: 7,
    name: 'Syahyuni',
    role: 'Product Needs Analyst',
    email: 'syahyuni784@gmail.com',
    phone: '6289650226809',
    ig: 's__yuniie',
    img: '/founders/syahyuni.jpeg'
  },
  {
    id: 8,
    name: 'Rika Nopita Sari',
    role: 'Concept Developer',
    email: 'rikanopitasari99@gmail.com',
    phone: '6281362554443',
    ig: 'rikanpita',
    img: '/founders/rika.jpeg'
  },
  {
    id: 9,
    name: 'Nurlian M Sihombing',
    role: 'Feature Planner',
    email: 'nurlyansihombing18@gmail.com',
    phone: '6282184395753',
    ig: 'lyanmshb',
    img: '/founders/nurlian.jpeg'
  },
  {
    id: 10,
    name: 'Yeni Astrika Nanda S.',
    role: 'Market Research',
    email: 'asriskayeni@gmail.com',
    phone: '6282183065883',
    ig: 'astrikananda_',
    img: '/founders/yeni.jpeg'
  },
  {
    id: 11,
    name: 'Risky Rahman Sanjaya',
    role: 'Product Evaluation',
    email: 'riskyrahman045@gmail.com',
    phone: '6282161740890',
    ig: 'Riskyrahsan_',
    img: '/founders/risky.jpeg'
  },
];

// --- ANIMASI ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const WhatsappIcon = (props) => (
  <svg
    fill="currentColor"
    viewBox="0 0 16 16"
    className="w-5 h-5"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M11.42 9.49c-.19-.09-1.1-.54-1.27-.61s-.29-.09-.42.1-.48.6-.59.73-.21.14-.4 0a5.13 5.13 0 0 1-1.49-.92 5.25 5.25 0 0 1-1-1.29c-.11-.18 0-.28.08-.38s.18-.21.28-.32a1.39 1.39 0 0 0 .18-.31.38.38 0 0 0 0-.33c0-.09-.42-1-.58-1.37s-.3-.32-.41-.32h-.4a.72.72 0 0 0-.5.23 2.1 2.1 0 0 0-.65 1.55A3.59 3.59 0 0 0 5 8.2 8.32 8.32 0 0 0 8.19 11c.44.19.78.3 1.05.39a2.53 2.53 0 0 0 1.17.07 1.93 1.93 0 0 0 1.26-.88 1.67 1.67 0 0 0 .11-.88c-.05-.07-.17-.12-.36-.21z" />
    <path d="M13.29 2.68A7.36 7.36 0 0 0 8 .5a7.44 7.44 0 0 0-6.41 11.15l-1 3.85 3.94-1a7.4 7.4 0 0 0 3.55.9H8a7.44 7.44 0 0 0 5.29-12.72zM8 14.12a6.12 6.12 0 0 1-3.15-.87l-.22-.13-2.34.61.62-2.28-.14-.23a6.18 6.18 0 0 1 9.6-7.65 6.12 6.12 0 0 1 1.81 4.37A6.19 6.19 0 0 1 8 14.12z" />
  </svg>
);


// --- KOMPONEN TEAM CARD (EDITORIAL STYLE) ---
const TeamCard = ({ member }) => {
  const cleanIg = member.ig.replace('@', '');

  return (
    <motion.div
      // variants={itemVariants} // Pastikan variants dipassing dari parent atau didefinisikan
      className="group relative flex flex-col gap-4"
    >
      {/* --- IMAGE CONTAINER --- */}
      <div className="relative aspect-3/4 overflow-hidden rounded-xl bg-gray-200 dark:bg-[#1a1a1a]">
        <img
          src={member.img}
          alt={member.name}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
        />

        {/* Overlay Gradient (Hanya Desktop) */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden lg:block"></div>

        {/* Social Icons - Desktop Only (Hover Slide Up) */}
        <div className="hidden lg:flex absolute -bottom-4 left-0 right-0 justify-center gap-3 translate-y-full group-hover:-translate-y-7 transition-transform duration-300">
          <SocialButton href={`https://instagram.com/${cleanIg}`} color="pink" icon={<Instagram size={18} />} />
          <SocialButton href={`https://wa.me/${member.phone}`} color="green" icon={<WhatsappIcon size={18} />} />
          <SocialButton href={`mailto:${member.email}`} color="blue" icon={<Mail size={18} />} />
        </div>
      </div>

      {/* --- INFO SECTION --- */}
      <div className="text-center flex flex-col gap-1">
        <h3 className="text-lg font-serif font-bold text-gray-900 dark:text-white">
          {member.name}
        </h3>
        <p className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-widest">
          {member.role}
        </p>

        {/* --- MOBILE/TABLET SOCIAL LINKS (New) --- */}
        {/* Muncul hanya di layar < 1024px (Mobile & Tablet) */}
        <div className="flex lg:hidden justify-center gap-4 mt-3 items-center">
           {/* Instagram Mobile */}
           <a 
            href={`https://instagram.com/${cleanIg}`}
            className="text-gray-500 hover:text-pink-600 transition-colors dark:text-gray-400 dark:hover:text-pink-400"
           >
             <Instagram size={20} />
           </a>

           {/* WA Mobile */}
           <a 
            href={`https://wa.me/${member.phone}`}
            className="text-gray-500 hover:text-green-600 transition-colors dark:text-gray-400 dark:hover:text-green-400"
           >
             <WhatsappIcon size={20} />
           </a>

           {/* Email Mobile */}
           <a 
            href={`mailto:${member.email}`}
            className="text-gray-500 hover:text-blue-600 transition-colors dark:text-gray-400 dark:hover:text-blue-400"
           >
             <Mail size={20} />
           </a>
        </div>
      </div>
    </motion.div>
  );
};

// Helper Component untuk Desktop Button agar code lebih rapi
const SocialButton = ({ href, color, icon }) => {
  // Mapping warna hover tailwind dinamis
  const hoverColors = {
    pink: 'hover:text-pink-600',
    green: 'hover:text-green-600',
    blue: 'hover:text-blue-600',
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white ${hoverColors[color]} transition-colors`}
    >
      {icon}
    </a>
  );
};


// --- KOMPONEN INPUT FORMULIR (MINIMALIST) ---
const FormInput = ({ id, label, type = 'text', placeholder }) => (
  <div className="group">
    <label htmlFor={id} className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors">
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
      required
    />
  </div>
);

// --- KOMPONEN UTAMA ---
const AboutUs = () => {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#0a0a0a] transition-colors duration-500 font-sans">
      <Header />

      {/* Dekorasi Background (Noise) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}>
      </div>

      <main className="relative z-10 pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-7xl">

          {/* --- HERO SECTION: ABOUT --- */}
          <div className="flex flex-col items-center text-center mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-purple-600 dark:text-purple-400 font-bold tracking-[0.2em] text-xs uppercase mb-4 block">The Collective</span>
              <h1 className="text-5xl md:text-7xl font-serif text-gray-900 dark:text-white mb-6 leading-tight">
                Meet the <span className="italic text-gray-500 dark:text-gray-500">Minds</span> <br /> Behind OffMode.
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                Kami adalah sekumpulan individu yang percaya bahwa fashion bukan sekadar pakaian, melainkan bahasa.
                Dari desainer hingga pengrajin, setiap tangan memiliki peran dalam menciptakan cerita Anda.
              </p>
            </motion.div>
          </div>

          {/* --- TEAM GRID (11 PEOPLE) --- */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 mb-32"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {teamMembers.map((member) => (
              <TeamCard key={member.id} member={member} />
            ))}

            {/* Card "Join Us" untuk mengisi slot ke-12 agar grid genap */}
            <motion.div variants={itemVariants} className="flex flex-col justify-center items-center h-full min-h-[300px] border border-dashed border-gray-300 dark:border-white/10 rounded-xl bg-white/50 dark:bg-white/2 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors cursor-pointer group">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ArrowRight className="text-gray-500 dark:text-white" />
              </div>
              <h3 className="text-lg font-serif font-bold text-gray-900 dark:text-white">Join the Team</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">We are always hiring.</p>
            </motion.div>
          </motion.div>

          {/* --- LOCATION & CONTACT (SPLIT LAYOUT) --- */}
          <div className="border-t border-gray-200 dark:border-white/10 pt-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

              {/* Left: Location Info & Map */}
              <div>
                <span className="text-purple-600 dark:text-purple-400 font-bold tracking-[0.2em] text-xs uppercase mb-4 block">Visit Us</span>
                <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white mb-6">
                  Our Studio
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-lg">
                  Rasakan langsung kualitas material kami di showroom utama. <br />
                  Buka setiap hari untuk Anda yang ingin mencoba sebelum memiliki.
                </p>

                <div className="space-y-4 mb-10">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-100 dark:bg-white/5 rounded-lg text-gray-900 dark:text-white"><MapPin size={20} /></div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">Jakarta HQ</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Jl. Kreatif No. 123, Jakarta Selatan</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-100 dark:bg-white/5 rounded-lg text-gray-900 dark:text-white"><MessageCircle size={20} /></div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">Contact</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">+62 852 7543 7848</p>
                    </div>
                  </div>
                </div>

                {/* Styled Map Container */}
                <div className="w-full h-64 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 filter transition-all duration-500">
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

              {/* Right: Contact Form */}
              <div className="bg-white dark:bg-[#111] p-8 md:p-10 rounded-3xl border border-gray-200 dark:border-white/10 shadow-xl shadow-gray-200/50 dark:shadow-none">
                <h2 className="text-2xl md:text-3xl font-serif text-gray-900 dark:text-white mb-8">
                  Get in Touch
                </h2>

                <form action="mailto:callmeyuyun6@gmail.com" method="POST" encType="text/plain" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput id="name" label="Full Name" placeholder="John Doe" />
                    <FormInput id="email" label="Email Address" type="email" placeholder="john@example.com" />
                  </div>
                  <FormInput id="subject" label="Subject" placeholder="Collaboration, Order Inquiry, etc." />

                  <div className="group">
                    <label htmlFor="message" className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows="5"
                      placeholder="How can we help you?"
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 resize-none"
                      required
                    ></textarea>
                  </div>

                  <motion.button
                    type="submit"
                    className="w-full py-4 px-6 rounded-xl font-bold text-white bg-gray-900 dark:bg-white dark:text-black transition-all hover:opacity-90 shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Send Message
                  </motion.button>
                </form>
              </div>

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;