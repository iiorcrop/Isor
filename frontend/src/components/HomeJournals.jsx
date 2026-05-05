import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Download, ChevronRight, BookOpen } from 'lucide-react';

const HomeJournals = () => {
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const fetchJournals = async () => {
            try {
                const res = await axios.get('/api/journal');
                setJournals(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch journals', err);
                setLoading(false);
            }
        };
        fetchJournals();
    }, []);

    if (loading || journals.length === 0) return null;

    const doubledJournals = [...journals, ...journals, ...journals];

    return (
        <section className="bg-[#fff9f0] py-24 overflow-hidden border-t border-[#064e3b]/5">
            <div className="max-w-7xl mx-auto px-6 mb-12">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-[#b47c1c] rounded-full" />
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#064e3b]">
                        Journal of Oilseeds Research — Latest Volumes
                    </h2>
                </div>
                <p className="text-[#6b7280] font-medium text-sm mt-3 ml-4">
                    Peer-reviewed bi-annual journal. UGC-CARE listed. Hover to pause scrolling.
                </p>
            </div>

            <div 
                className="relative group"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <motion.div 
                    className="flex gap-8"
                    animate={{ x: isPaused ? undefined : [0, -1 * (280 + 32) * journals.length] }}
                    transition={{ 
                        duration: journals.length * 10, 
                        repeat: Infinity, 
                        ease: "linear" 
                    }}
                    style={{ width: "fit-content" }}
                >
                    {doubledJournals.map((journal, index) => (
                        <div
                            key={`${journal._id}-${index}`}
                            className="w-[280px] bg-white rounded-[2.5rem] shadow-xl shadow-[#064e3b]/5 border border-black/5 p-6 flex flex-col hover:-translate-y-2 transition-all duration-500"
                        >
                            {/* Cover Image */}
                            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-6 bg-gray-50 group-hover:shadow-2xl transition-all">
                                {journal.coverImageUrl ? (
                                    <img 
                                        src={`/${journal.coverImageUrl}`} 
                                        alt={journal.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-200">
                                        <BookOpen size={64} />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-[#064e3b] text-white text-[10px] font-bold px-3 py-1 rounded-full">
                                    {journal.year}
                                </div>
                            </div>

                            <div className="flex-1 text-center">
                                <h3 className="text-lg font-bold text-[#064e3b] mb-1">
                                    {journal.title}
                                </h3>
                                <p className="text-[#b47c1c] text-[10px] font-bold uppercase tracking-widest mb-2">
                                    {journal.issues}
                                </p>
                                <p className="text-gray-400 text-[11px] font-medium mb-6">
                                    Complete • {journal.articleCount}
                                </p>
                            </div>

                            <a 
                                href={journal.pdfUrl ? `/${journal.pdfUrl}` : '#'} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3 rounded-xl border-2 border-[#1e703c]/20 text-[#1e703c] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#1e703c] hover:text-white transition-all"
                            >
                                <Download size={14} /> Download PDF
                            </a>
                        </div>
                    ))}
                </motion.div>
            </div>

            <div className="mt-16 text-center">
                <a 
                    href="/archives" 
                    className="inline-flex items-center gap-2 text-[#064e3b] font-bold text-sm hover:text-[#b47c1c] transition-colors group"
                >
                    Explore Complete Journal Archives
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </a>
            </div>
        </section>
    );
};

export default HomeJournals;
