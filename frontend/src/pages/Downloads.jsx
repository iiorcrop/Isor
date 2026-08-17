import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, FileText, Calendar, Search, Loader2, Sparkles, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const Downloads = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/brainstorm`);
                setSessions(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch brainstorm sessions:', err);
                setLoading(false);
            }
        };
        fetchSessions();
    }, []);

    const getFileUrl = (path) => {
        if (!path) return '#';
        if (path.startsWith('http')) return path;
        const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
        return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const filteredSessions = sessions.filter(session =>
        session.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#fff9f0] py-16 px-6">
            <div className="max-w-7xl mx-auto mb-12">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[3rem] p-10 md:p-14 border border-[#064e3b]/10 shadow-2xl shadow-[#064e3b]/5 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8"
                >
                    <div className="space-y-4 max-w-2xl text-center md:text-left">
                        <span className="text-[#b47c1c] text-xs font-bold tracking-[0.25em] uppercase flex items-center gap-2 justify-center md:justify-start">
                            <Sparkles size={16} /> ISOR Publications & Resources
                        </span>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#064e3b]">
                            Brainstorm Sessions & Downloads
                        </h1>
                        <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                            Access official PDFs, brainstorming session proceedings, research recommendations, and downloadable resources.
                        </p>
                    </div>

                    <div className="bg-[#064e3b] text-white p-8 rounded-3xl shrink-0 text-center space-y-2 shadow-xl border border-[#b47c1c]/20 w-full md:w-auto">
                        <FileText size={36} className="mx-auto text-[#fbbf24]" />
                        <h3 className="font-serif font-bold text-2xl">{sessions.length} Documents</h3>
                        <p className="text-xs text-white/80 uppercase font-bold tracking-widest">Available for Download</p>
                    </div>
                </motion.div>
            </div>

            {/* Search Filter */}
            <div className="max-w-7xl mx-auto mb-10">
                <div className="relative max-w-xl mx-auto">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text"
                        placeholder="Search brainstorm sessions and PDF titles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 rounded-full bg-white border border-[#064e3b]/15 focus:outline-none focus:border-[#b47c1c] shadow-lg shadow-[#064e3b]/5 text-gray-800 text-sm"
                    />
                </div>
            </div>

            {/* Sessions / PDFs List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                    <Loader2 className="animate-spin text-[#064e3b]" size={48} />
                    <p className="text-[#064e3b] font-bold text-sm">Loading downloads repository...</p>
                </div>
            ) : filteredSessions.length === 0 ? (
                <div className="text-center py-24 bg-white max-w-2xl mx-auto rounded-[3rem] border border-[#064e3b]/10 shadow-xl p-12 space-y-4">
                    <FileText size={64} className="mx-auto text-[#b47c1c]/40" />
                    <h3 className="text-xl font-serif font-bold text-[#064e3b]">No Downloads Available</h3>
                    <p className="text-gray-500 text-xs">Brainstorming session PDFs and resources added by administration will appear here.</p>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredSessions.map((session, idx) => (
                        <motion.div 
                            key={session._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white rounded-[2.5rem] border border-[#064e3b]/10 p-8 shadow-xl shadow-[#064e3b]/5 flex flex-col justify-between space-y-6 hover:-translate-y-1 transition-all duration-300 group"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="bg-[#064e3b]/10 text-[#064e3b] px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                        <FileText size={14} className="text-[#b47c1c]" /> Brainstorm Session PDF
                                    </span>
                                    {session.date && (
                                        <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                            <Calendar size={13} />
                                            {new Date(session.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-xl font-serif font-bold text-[#064e3b] group-hover:text-[#b47c1c] transition-colors leading-snug">
                                    {session.title}
                                </h3>

                                {session.description && (
                                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                                        {session.description}
                                    </p>
                                )}
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                                <a 
                                    href={getFileUrl(session.pdfUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 py-3.5 px-4 rounded-2xl bg-[#064e3b] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#b47c1c] transition-all shadow-md group-hover:shadow-lg"
                                >
                                    <Download size={16} /> Download PDF
                                </a>
                                <a 
                                    href={getFileUrl(session.pdfUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3.5 rounded-2xl border border-gray-200 text-gray-600 hover:text-[#064e3b] hover:border-[#064e3b] transition-all"
                                    title="Open PDF"
                                >
                                    <ExternalLink size={16} />
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Downloads;
