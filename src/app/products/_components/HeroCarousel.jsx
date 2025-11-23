import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

// Default data (bisa di-override lewat props 'slides')
const DEFAULT_SLIDES = [
    {
        id: 1,
        tag: "New Collection",
        title: "Urban Street Style",
        description: "Tampil beda dengan koleksi streetwear terbaru.",
        image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1600&auto=format&fit=crop",
        gradient: "from-purple-900 to-slate-900"
    },
    {
        id: 2,
        tag: "Limited Offer",
        title: "Summer Vibes 50% OFF",
        description: "Diskon spesial untuk menyambut musim panas.",
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop",
        gradient: "from-orange-900 to-slate-900"
    },
    {
        id: 3,
        tag: "Exclusive",
        title: "Minimalist Essentials",
        description: "Koleksi basic yang wajib ada di lemari kamu.",
        image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1600&auto=format&fit=crop",
        gradient: "from-slate-800 to-gray-900"
    }
];

const HeroCarousel = ({ slides = DEFAULT_SLIDES, autoPlayInterval = 6000 }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [direction, setDirection] = useState(0);

    // Auto-play logic
    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, autoPlayInterval);
        return () => clearInterval(timer);
    }, [currentSlide, autoPlayInterval]);

    const nextSlide = useCallback(() => {
        setDirection(1);
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, [slides.length]);

    const prevSlide = () => {
        setDirection(-1);
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const goToSlide = (index) => {
        setDirection(index > currentSlide ? 1 : -1);
        setCurrentSlide(index);
    };

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0
        })
    };

    return (
        <div className="relative w-full h-80 md:h-[380px] rounded-3xl overflow-hidden shadow-2xl mb-8 mt-6 bg-slate-900 group">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                    key={currentSlide}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                    }}
                    className="absolute inset-0 w-full h-full"
                >
                    {/* Background Image & Overlay */}
                    <div className="absolute inset-0">
                        <img
                            src={slides[currentSlide].image}
                            alt={slides[currentSlide].title}
                            className="w-full h-full object-cover"
                        />
                        <div className={`absolute inset-0 bg-linear-to-r ${slides[currentSlide].gradient} opacity-90 mix-blend-multiply`}></div>
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>
                    </div>

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 lg:px-20 text-white z-10">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="max-w-xl"
                        >
                            <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/10 text-xs font-bold tracking-widest uppercase mb-3">
                                {slides[currentSlide].tag}
                            </span>
                            <h1 className="text-3xl md:text-5xl font-black leading-tight mb-3 tracking-tight">
                                {slides[currentSlide].title}
                            </h1>
                            <p className="text-slate-200 text-sm md:text-base mb-6 max-w-md line-clamp-2">
                                {slides[currentSlide].description}
                            </p>

                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    const element = document.getElementById('belanja');
                                    if (element) {
                                        // Opsi behavior: 'smooth' membuat scroll jadi halus
                                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }
                                }}
                                className="px-6 py-2.5 bg-white text-slate-900 rounded-full font-bold text-sm hover:bg-purple-50 transition-all shadow-lg flex items-center gap-2 w-fit cursor-pointer"
                            >
                                Belanja Sekarang <ArrowRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 z-20"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 z-20"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => goToSlide(idx)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-6 bg-white' : 'bg-white/40 hover:bg-white/60'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroCarousel;