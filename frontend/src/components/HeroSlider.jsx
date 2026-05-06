import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getServerUrl } from '../utils/urlHelper';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HeroSlider = () => {
    const [banners, setBanners] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/banner/active`);
                setBanners(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch banners', err);
                setLoading(false);
            }
        };
        fetchBanners();
    }, []);

    useEffect(() => {
        if (banners.length <= 1) return;
        const interval = setInterval(() => {
            handleNext();
        }, 5000);
        return () => clearInterval(interval);
    }, [banners, currentIndex]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    };

    if (loading || banners.length === 0) return null;

    return (
        <section className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full overflow-hidden bg-gray-900">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute inset-0"
                >
                    <img 
                        src={getServerUrl(banners[currentIndex].imageUrl)} 
                        alt={banners[currentIndex].title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent md:from-black/60 md:via-transparent" />
                    
                    {/* Content Overlay */}
                    <div className="absolute inset-0 flex items-center">
                        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
                            <motion.div 
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                                className="max-w-2xl space-y-4 md:space-y-6 text-center md:text-left"
                            >
                                {banners[currentIndex].title && (
                                    <h1 className="text-3xl md:text-6xl font-bold text-white leading-tight drop-shadow-2xl">
                                        {banners[currentIndex].title}
                                    </h1>
                                )}
                                {banners[currentIndex].subtitle && (
                                    <p className="text-base md:text-xl text-white/80 leading-relaxed drop-shadow-lg max-w-lg mx-auto md:mx-0">
                                        {banners[currentIndex].subtitle}
                                    </p>
                                )}
                                {banners[currentIndex].link && (
                                    <motion.a
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        href={banners[currentIndex].link}
                                        className="inline-block bg-[#b47c1c] hover:bg-[#9a6a18] text-white px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-xl transition-all"
                                    >
                                        Explore More
                                    </motion.a>
                                )}
                            </motion.div>
                        </div>
                    </div>

                </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {banners.length > 1 && (
                <>
                    <button 
                        onClick={handlePrev}
                        className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all z-20 group"
                    >
                        <ChevronLeft size={32} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <button 
                        onClick={handleNext}
                        className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all z-20 group"
                    >
                        <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Indicators */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`h-1.5 transition-all duration-300 rounded-full ${currentIndex === index ? 'w-8 bg-[#b47c1c]' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
};

export default HeroSlider;
