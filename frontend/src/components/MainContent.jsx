import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, Bell } from 'lucide-react';

const MainContent = () => {
    const [about, setAbout] = useState({ title: '', content: [] });
    const [stats, setStats] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = React.useRef(null);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [aboutRes, statsRes, annRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/home-content/about`),
                    axios.get(`${import.meta.env.VITE_API_URL}/home-content/stats`),
                    axios.get(`${import.meta.env.VITE_API_URL}/home-content/announcements`)
                ]);
                setAbout(aboutRes.data);
                setStats(statsRes.data);
                setAnnouncements(annRes.data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch content', err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Auto-scroll Logic
    useEffect(() => {
        if (loading || announcements.length === 0 || isPaused) return;

        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        const scroll = () => {
            // Since we doubled the items, we reset when we've scrolled past the first set
            if (scrollContainer.scrollTop >= scrollContainer.scrollHeight / 2) {
                scrollContainer.scrollTop = 0;
            } else {
                scrollContainer.scrollTop += 1;
            }
        };

        const interval = setInterval(scroll, 50);
        return () => clearInterval(interval);
    }, [loading, announcements, isPaused]);

    if (loading) return null;

    return (
        <section className="bg-[#fff9f0] py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                    
                    {/* Left Column: About & Stats */}
                    <div className="lg:col-span-8 space-y-12">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-1.5 h-10 bg-[#b47c1c] rounded-full" />
                                <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#064e3b]">
                                    {about.title}
                                </h2>
                            </div>
                            
                            <div className="space-y-6 text-[#374151] leading-relaxed text-lg">
                                {about.content.map((paragraph, index) => (
                                    <motion.p 
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                    >
                                        {paragraph}
                                    </motion.p>
                                ))}
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                            {stats.map((stat, index) => (
                                <motion.div 
                                    key={stat._id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="bg-white/60 backdrop-blur-sm border border-[#1e703c]/10 p-8 rounded-[2rem] text-center group hover:bg-white transition-all shadow-sm hover:shadow-xl"
                                >
                                    <div className="text-4xl font-serif font-bold text-[#1e703c] mb-2 group-hover:scale-110 transition-transform">
                                        {stat.value}
                                    </div>
                                    <div className="text-xs uppercase font-bold tracking-widest text-[#6b7280]">
                                        {stat.label}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: News & Announcements */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-[#064e3b]/5 border border-black/5 overflow-hidden sticky top-8">
                            <div className="bg-[#064e3b] p-6 text-white flex items-center justify-between">
                                <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                    <Bell size={20} className="text-[#fbbf24]" />
                                    NEWS & EVENTS
                                </h3>
                                <button className="text-[10px] uppercase font-bold tracking-widest opacity-60 hover:opacity-100 transition-opacity">
                                    View All
                                </button>
                            </div>

                            <div 
                                ref={scrollRef}
                                onMouseEnter={() => setIsPaused(true)}
                                onMouseLeave={() => setIsPaused(false)}
                                className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto hidden-scrollbar scroll-smooth"
                            >
                                {/* Double the list for seamless looping */}
                                {[...announcements, ...announcements].map((ann, index) => (
                                    <motion.a 
                                        key={`${ann._id}-${index}`}
                                        href={ann.link}
                                        className="p-6 block hover:bg-gray-50 transition-colors group"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                                <Calendar size={14} />
                                                {new Date(ann.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            {ann.badge && (
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter ${
                                                    ann.badgeColor === 'urgent' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                                }`}>
                                                    {ann.badge}
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="text-[#064e3b] font-bold leading-snug group-hover:text-[#b47c1c] transition-colors">
                                            {ann.title}
                                        </h4>
                                        <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-[#b47c1c] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                                            Read More <ChevronRight size={12} />
                                        </div>
                                    </motion.a>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default MainContent;
