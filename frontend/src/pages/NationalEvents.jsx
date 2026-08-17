import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, MapPin, Tag, ArrowRight, Loader2, Sparkles, CheckCircle2, Ticket } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const NationalEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/national-events`);
                setEvents(res.data.filter(e => e.isActive));
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch national events:', err);
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
                        <span className="text-[#b47c1c] text-xs font-bold tracking-[0.25em] uppercase flex items-center gap-2 justify-center md:justify-start">
                            <Sparkles size={16} /> Indian Society of Oilseeds Research
                        </span>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#064e3b]">
                            National Events & Conferences
                        </h1>
                        <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                            Register online for premier national conferences, academic symposia, and specialized workshops organized by ISOR across India.
                        </p>
                    </div>

                    <div className="bg-[#064e3b] text-white p-8 rounded-3xl shrink-0 text-center space-y-2 shadow-xl border border-[#b47c1c]/20 w-full md:w-auto">
                        <Ticket size={36} className="mx-auto text-[#fbbf24]" />
                        <h3 className="font-serif font-bold text-2xl">{events.length} Open Events</h3>
                        <p className="text-xs text-white/80 uppercase font-bold tracking-widest">Available for Registration</p>
                    </div>
                </motion.div>
            </div>

            {/* Events List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="animate-spin text-[#064e3b]" size={48} />
                    <p className="text-[#064e3b] font-bold text-sm">Loading national events schedule...</p>
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-32 bg-white max-w-2xl mx-auto rounded-[3rem] border border-[#064e3b]/10 shadow-xl p-12 space-y-4">
                    <Calendar size={64} className="mx-auto text-[#b47c1c]/40" />
                    <h3 className="text-xl font-serif font-bold text-[#064e3b]">No Active Registrations</h3>
                    <p className="text-gray-500 text-xs">National event registration links published by administration will appear here.</p>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map((event, idx) => (
                        <motion.div 
                            key={event._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white rounded-[2.5rem] border border-[#064e3b]/10 overflow-hidden shadow-xl shadow-[#064e3b]/5 hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between group"
                        >
                            <div>
                                <div className="aspect-[16/9] overflow-hidden relative bg-gray-50">
                                    {event.bannerImage ? (
                                        <img 
                                            src={getImageUrl(event.bannerImage)} 
                                            alt={event.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-[#064e3b] to-[#04392b] flex items-center justify-center text-white/20">
                                            <Ticket size={56} />
                                        </div>
                                    )}

                                    {/* Fee Badge */}
                                    <div className="absolute top-4 right-4 bg-[#064e3b] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 border border-[#b47c1c]">
                                        <Tag size={12} className="text-[#fbbf24]" />
                                        {event.isFree ? 'FREE' : `₹${event.price}`}
                                    </div>
                                </div>

                                <div className="p-8 space-y-4">
                                    <div className="flex flex-wrap gap-4 text-xs font-bold text-[#b47c1c] uppercase tracking-wider">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={14} />
                                            {new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        {event.location && (
                                            <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                                                <MapPin size={14} className="text-[#b47c1c]" />
                                                {event.location}
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-2xl font-serif font-bold text-[#064e3b] group-hover:text-[#b47c1c] transition-colors leading-snug">
                                        {event.title}
                                    </h3>

                                    {event.description && (
                                        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                                            {event.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="p-8 pt-0">
                                <Link 
                                    to={`/events/register/${event._id}`}
                                    className="w-full py-4 rounded-2xl bg-[#064e3b] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#b47c1c] transition-all shadow-md group-hover:shadow-xl"
                                >
                                    Register Now <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NationalEvents;
