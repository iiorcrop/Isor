import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, ArrowRight, ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const LatestEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLatest = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/events/latest`);
                setEvents(res.data);
                setLoading(false);
            } catch (err) { console.error(err); }
        };
        fetchLatest();
    }, []);

    const getImageUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${import.meta.env.VITE_API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    if (!loading && events.length === 0) return null;

    return (
        <section className="py-24 bg-[#f8fafc] relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-4xl font-serif font-bold text-[#064e3b] mb-4">Latest Events</h2>
                        <p className="text-gray-600 max-w-xl text-lg">Stay updated with our recent activities, seminars, and academic gallery.</p>
                    </div>
                    <Link to="/events" className="hidden md:flex items-center gap-2 text-[#064e3b] font-bold hover:gap-3 transition-all">
                        View All Events <ArrowRight size={20} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {events.map((event) => (
                        <div key={event._id} className="bg-white rounded-[2.5rem] p-4 shadow-xl shadow-gray-200/50 group hover:-translate-y-2 transition-all duration-500 border border-transparent hover:border-[#064e3b]/10">
                            <div className="aspect-[4/3] rounded-[2rem] overflow-hidden mb-6 relative">
                                {event.images && event.images.length > 0 ? (
                                    <img 
                                        src={getImageUrl(event.images[0])} 
                                        alt={event.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                        <ImageIcon size={40} className="text-gray-300" />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-bold text-[#064e3b] shadow-lg">
                                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                            </div>
                            <div className="px-4 pb-4">
                                <h3 className="text-xl font-bold text-[#0f172a] mb-2 group-hover:text-[#064e3b] transition-colors line-clamp-1">{event.title}</h3>
                                <p className="text-gray-500 text-sm line-clamp-2 mb-6">{event.description}</p>
                                <Link 
                                    to="/events" 
                                    className="inline-flex items-center gap-2 text-sm font-bold text-[#064e3b] border-b-2 border-transparent hover:border-[#064e3b] transition-all"
                                >
                                    Gallery Preview <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 md:hidden">
                    <Link to="/events" className="flex items-center justify-center gap-2 text-[#064e3b] font-bold py-4 bg-white rounded-2xl shadow-lg border border-gray-100">
                        View All Events <ArrowRight size={20} />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default LatestEvents;
