import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Award, 
    Search, 
    Calendar, 
    CheckCircle, 
    ExternalLink, 
    Loader2, 
    ArrowRight,
    Trophy,
    BookOpen,
    Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getServerUrl } from '../utils/urlHelper';

const Awards = () => {
    const [awards, setAwards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        fetchAwards();
    }, []);

    const fetchAwards = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/awards?active=true`);
            setAwards(res.data || []);
        } catch (err) {
            console.error('Failed to fetch awards', err);
        } finally {
            setLoading(false);
        }
    };

    // Extract unique categories for filter tabs
    const categories = ['All', ...Array.from(new Set(awards.map(a => a.category).filter(Boolean)))];

    const filteredAwards = awards.filter(a => {
        const matchesSearch = 
            a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.awardBy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.description?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCategory = selectedCategory === 'All' || a.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-[#fff9f0] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-10">

                {/* Hero Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-[#064e3b] via-[#04392b] to-[#1e703c] rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#b47c1c]/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="space-y-4 max-w-2xl z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#b47c1c]/20 border border-[#b47c1c]/30 text-[#fbbf24] text-xs font-bold uppercase tracking-widest">
                            <Trophy size={14} /> ISOR Honors & Recognition
                        </div>
                        <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight leading-tight">
                            Society Awards
                        </h1>
                        <p className="text-white/80 text-sm md:text-base leading-relaxed font-light">
                            Recognizing excellence, innovation, and outstanding contributions of scientists, scholars, and researchers in oilseeds research and development.
                        </p>
                    </div>

                    <div className="w-24 h-24 rounded-3xl bg-[#fbbf24] text-[#064e3b] flex items-center justify-center shadow-2xl border-4 border-white/20 shrink-0 rotate-3 z-10">
                        <Award size={48} />
                    </div>
                </motion.div>

                {/* Filter and Search Section */}
                <div className="bg-white p-6 rounded-3xl shadow-xl border border-[#064e3b]/5 space-y-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        
                        {/* Search Input */}
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search awards by title, donor, keyword..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-medium focus:outline-none focus:border-[#064e3b] focus:bg-white transition-all"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 sm:pb-0">
                            {categories.map((cat, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                        selectedCategory === cat 
                                            ? 'bg-[#064e3b] text-white shadow-md' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                    </div>
                </div>

                {/* Main Awards Table Format */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2.5rem] shadow-xl border border-[#064e3b]/5 overflow-hidden"
                >
                    {loading ? (
                        <div className="p-16 text-center text-gray-500 flex flex-col items-center justify-center">
                            <Loader2 className="animate-spin text-[#064e3b] mb-4" size={32} />
                            <p className="text-xs font-bold uppercase tracking-wider">Loading Society Awards...</p>
                        </div>
                    ) : filteredAwards.length === 0 ? (
                        <div className="p-16 text-center text-gray-500 space-y-3">
                            <Award size={48} className="mx-auto text-gray-300" />
                            <h3 className="text-lg font-serif font-bold text-[#064e3b]">No Awards Found</h3>
                            <p className="text-xs text-gray-400">Try adjusting your search criteria or category filter.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#064e3b] text-white text-[11px] font-bold uppercase tracking-wider border-b border-white/10">
                                        <th className="p-5 pl-8">Award & Image</th>
                                        <th className="p-5">Awarded By</th>
                                        <th className="p-5">Category & Prize</th>
                                        <th className="p-5">Eligibility Summary</th>
                                        <th className="p-5 pr-8 text-right">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-xs">
                                    {filteredAwards.map((award, index) => (
                                        <tr 
                                            key={award._id || index}
                                            className="hover:bg-[#fff9f0]/60 transition-colors group"
                                        >
                                            {/* Photo & Title */}
                                            <td className="p-5 pl-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center text-gray-400 shadow-sm group-hover:scale-105 transition-transform">
                                                        {award.mainPhoto ? (
                                                            <img src={getServerUrl(award.mainPhoto)} alt={award.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Award size={24} className="text-[#b47c1c]" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-sm text-[#064e3b] group-hover:text-[#b47c1c] transition-colors leading-snug">
                                                            {award.title}
                                                        </h3>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 block">
                                                            {award.frequency || 'Annual'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Awarded By */}
                                            <td className="p-5 font-semibold text-gray-700 max-w-xs">
                                                {award.awardBy}
                                            </td>

                                            {/* Category & Prize */}
                                            <td className="p-5 space-y-1">
                                                <span className="inline-block px-3 py-1 rounded-full bg-[#064e3b]/10 text-[#064e3b] text-[10px] font-bold">
                                                    {award.category || 'General'}
                                                </span>
                                                {award.cashPrize && (
                                                    <div className="font-bold text-[#b47c1c] text-xs">
                                                        {award.cashPrize}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Eligibility */}
                                            <td className="p-5 text-gray-600 max-w-sm leading-relaxed line-clamp-2">
                                                {award.eligibility || 'Refer to detailed guidelines.'}
                                            </td>

                                            {/* Action Button */}
                                            <td className="p-5 pr-8 text-right">
                                                <Link 
                                                    to={`/awards/${award._id}`}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#064e3b] text-white font-bold text-xs hover:bg-[#04392b] transition-all shadow-md group-hover:shadow-lg shrink-0"
                                                >
                                                    View Details <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>

            </div>
        </div>
    );
};

export default Awards;
