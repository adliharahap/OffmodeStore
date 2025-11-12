"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Twitter, Facebook } from 'lucide-react';
import { navLinks } from '../data/HeaderHref';

const Footer = () => {

  const socialIcons = [
    { icon: <Instagram size={20} />, href: '#' },
    { icon: <Twitter size={20} />, href: '#' },
    { icon: <Facebook size={20} />, href: '#' },
  ];

  return (
    <footer className="bg-black text-gray-300 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Kolom 1: Brand & Kontak */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">offmodestore</h3>
            <p className="mb-2">Exclusive Branded Fashion, Elegantly Yours.</p>
            <p className="text-sm">Email: contact@offmodestore.com</p>
            <p className="text-sm">WA: +62 123 4567 890</p>
          </div>

          {/* Kolom 2: Navigasi Cepat */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Navigasi</h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <motion.a 
                    href={link.href} 
                    className="hover:text-white transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    {link.name}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3: Social Media */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Ikuti Kami</h4>
            <div className="flex gap-5">
              {socialIcons.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  className="text-gray-300 hover:text-white"
                  whileHover={{ scale: 1.2, y: -2 }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 pt-8 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} offmodestore. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
