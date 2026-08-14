import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, MapPin, ImageIcon, ArrowRight, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/events`);
                setEvents(res.data);
                setLoading(false);
            } catch (err) { 
                console.error(err); 
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const getImageUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
        return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    return (
        <div className="min-h-screen bg-[#fff9f0] py-16 px-6">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto mb-16">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[3rem] p-10 md:p-14 border border-[#064e3b]/10 shadow-2xl shadow-[#064e3b]/5 relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8"
                >
                    <div className="space-y-4 max-w-2xl">
                        <span className="text-[#b47c1c] text-xs font-bold tracking-[0.25em] uppercase">
                            Indian Society of Oilseeds Research
                        </span>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#064e3b]">
                            Events & Photo Gallery
                        </h1>
                        <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                            Explore our latest national conferences, symposia, executive meetings, and academic gatherings across India.
                        </p>
                    </div>

                    <div className="bg-[#064e3b] text-white p-8 rounded-3xl shrink-0 text-center space-y-2 shadow-xl border border-[#b47c1c]/20">
                        <Calendar size={36} className="mx-auto text-[#fbbf24]" />
                        <h3 className="font-serif font-bold text-xl">{events.length} Events</h3>
                        <p className="text-xs text-white/80 uppercase font-bold tracking-widest">Documented</p>
                    </div>
                </motion.div>
            </div>

            {/* Events List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="animate-spin text-[#064e3b]" size={48} />
                    <p className="text-[#064e3b] font-bold text-sm">Loading ISOR events gallery...</p>
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-32 bg-white max-w-2xl mx-auto rounded-[3rem] border border-[#064e3b]/10 shadow-xl p-12 space-y-4">
                    <ImageIcon size={64} className="mx-auto text-[#b47c1c]/40" />
                    <h3 className="text-xl font-serif font-bold text-[#064e3b]">No Events Posted Yet</h3>
                    <p className="text-gray-500 text-xs">Events and gallery photos published by the administration will appear here.</p>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map((event, idx) => (
                        <motion.div 
                            key={event._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white rounded-[2.5rem] border border-[#064e3b]/10 overflow-hidden shadow-xl shadow-[#064e3b]/5 hover:-translate-y-2 transition-all duration-500 flex flex-col group cursor-pointer"
                            onClick={() => setSelectedEvent(event)}
                        >
                            <div className="aspect-[4/3] overflow-hidden relative bg-gray-50">
                                {event.images && event.images.length > 0 ? (
                                    <img 
                                        src={getImageUrl(event.images[0])} 
                                        alt={event.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <ImageIcon size={48} />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-[#064e3b] text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1">
                                    <ImageIcon size={12} className="text-[#fbbf24]" />
                                    {event.images?.length || 0} Photos
                                </div>
                            </div>

                            <div className="p-8 flex-1 flex flex-col justify-between space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[#b47c1c] text-xs font-bold uppercase tracking-widest">
                                        <Calendar size={14} />
                                        {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </div>
                                    <h3 className="text-xl font-serif font-bold text-[#064e3b] group-hover:text-[#b47c1c] transition-colors leading-snug">
                                        {event.title}
                                    </h3>
                                    {event.location && (
                                        <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium">
                                            <MapPin size={14} className="text-[#b47c1c]" />
                                            {event.location}
                                        </div>
                                    )}
                                </div>

                                <button className="w-full py-3 rounded-2xl border-2 border-[#064e3b]/20 text-[#064e3b] font-bold text-xs flex items-center justify-center gap-2 group-hover:bg-[#064e3b] group-hover:text-white transition-all">
                                    View Event Gallery <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Gallery Modal */}
            <AnimatePresence>
                {selectedEvent && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
                            onClick={() => setSelectedEvent(null)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative z-10 w-full max-w-5xl bg-white rounded-[3rem] border border-[#064e3b]/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-[#fff9f0]">
                                <div>
                                    <span className="text-[#b47c1c] text-[10px] font-bold uppercase tracking-widest">
                                        {new Date(selectedEvent.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • {selectedEvent.location || 'ISOR Event'}
                                    </span>
                                    <h2 className="text-2xl font-serif font-bold text-[#064e3b]">{selectedEvent.title}</h2>
                                </div>
                                <button 
                                    onClick={() => setSelectedEvent(null)}
                                    className="bg-[#064e3b] text-white p-3 rounded-full hover:bg-[#04392b] transition-all shadow-md"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-8 bg-white">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {selectedEvent.images.map((img, idx) => (
                                        <div 
                                            key={idx} 
                                            className="aspect-square rounded-2xl overflow-hidden border border-gray-200 hover:border-[#064e3b] transition-all cursor-zoom-in group shadow-sm hover:shadow-xl"
                                            onClick={() => window.open(getImageUrl(img), '_blank')}
                                        >
                                            <img 
                                                src={getImageUrl(img)} 
                                                alt="" 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Events;
