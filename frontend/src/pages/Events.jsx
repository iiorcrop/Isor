import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, MapPin, ImageIcon, ArrowRight, X } from 'lucide-react';

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
            } catch (err) { console.error(err); }
        };
        fetchEvents();
    }, []);

    const getImageUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${import.meta.env.VITE_API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    return (
        <div className="min-h-screen bg-[#0a0f1d] pt-24 pb-20">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-6 mb-16">
                <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-[3rem] p-12 border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] rounded-full -mr-48 -mt-48"></div>
                    <div className="relative z-10">
                        <h1 className="text-5xl font-serif font-bold text-white mb-4">Events & Gallery</h1>
                        <p className="text-white/60 text-lg max-w-2xl">
                            Explore our latest conferences, meetings, and academic gatherings. 
                            Stay updated with ISOR activities across the country.
                        </p>
                    </div>
                </div>
            </div>

            {/* Events List */}
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event) => (
                    <div 
                        key={event._id}
                        className="bg-[#1e293b]/50 backdrop-blur-xl rounded-[2.5rem] border border-white/5 overflow-hidden hover:border-primary/50 transition-all group cursor-pointer"
                        onClick={() => setSelectedEvent(event)}
                    >
                        <div className="aspect-[4/3] overflow-hidden relative">
                            {event.images && event.images.length > 0 ? (
                                <img 
                                    src={getImageUrl(event.images[0])} 
                                    alt={event.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full bg-black/20 flex items-center justify-center">
                                    <ImageIcon size={48} className="text-white/10" />
                                </div>
                            )}
                            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-bold text-white border border-white/10">
                                {event.images?.length || 0} Photos
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="flex items-center gap-3 text-primary text-xs font-bold uppercase tracking-widest mb-4">
                                <Calendar size={14} />
                                {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">{event.title}</h3>
                            <div className="flex items-center gap-2 text-white/40 text-sm mb-6">
                                <MapPin size={14} />
                                {event.location}
                            </div>
                            <button className="flex items-center gap-2 text-primary font-bold text-sm group-hover:gap-3 transition-all">
                                View Gallery <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Gallery Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setSelectedEvent(null)}></div>
                    <div className="relative z-10 w-full max-w-6xl bg-[#1e293b] rounded-[3rem] border border-white/10 overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#1e293b]">
                            <div>
                                <h2 className="text-2xl font-bold text-white">{selectedEvent.title}</h2>
                                <p className="text-white/40 text-sm">{selectedEvent.location} • {new Date(selectedEvent.date).toLocaleDateString()}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedEvent(null)}
                                className="bg-white/5 hover:bg-white/10 p-4 rounded-full text-white transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {selectedEvent.images.map((img, idx) => (
                                    <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all cursor-zoom-in">
                                        <img 
                                            src={getImageUrl(img)} 
                                            alt="" 
                                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                            onClick={() => window.open(getImageUrl(img), '_blank')}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {loading && (
                <div className="flex flex-col items-center justify-center py-40">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                    <p className="text-white/40 font-medium">Loading events...</p>
                </div>
            )}

            {!loading && events.length === 0 && (
                <div className="text-center py-40">
                    <ImageIcon size={64} className="mx-auto text-white/5 mb-6" />
                    <p className="text-white/40 text-lg">No events have been posted yet.</p>
                </div>
            )}
        </div>
    );
};

export default Events;
