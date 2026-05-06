import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getServerUrl } from '../utils/urlHelper';

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const HomeCommittee = () => {
    const [members, setMembers] = useState([]);
    const [period, setPeriod] = useState('');
    const [loading, setLoading] = useState(true);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const fetchExecutive = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/committees/Executive`);

                if (res.data.length > 0) {
                    const periods = [...new Set(res.data.map(m => m.period))].sort().reverse();
                    const latestPeriod = periods[0];
                    setPeriod(latestPeriod);
                    setMembers(res.data.filter(m => m.period === latestPeriod));
                }
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch home committee', err);
                setLoading(false);
            }
        };
        fetchExecutive();
    }, []);

    if (loading || members.length === 0) return null;

    const doubledMembers = [...members, ...members, ...members];

    return (
        <>
            <section className="bg-white pt-12 pb-10 border-t border-gray-50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 mb-12">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-[#b47c1c] rounded-full" />
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#064e3b]">
                            Current Executive Committee
                        </h2>
                    </div>
                    <p className="text-[#b47c1c] font-bold tracking-[0.2em] uppercase text-xs mt-2 ml-4">
                        Period: {period}
                    </p>
                </div>

                <div 
                    className="relative group"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <motion.div 
                        className="flex gap-6"
                        animate={{ x: isPaused ? undefined : [0, -1 * (320 + 24) * members.length] }}
                        transition={{ 
                            duration: members.length * 10, 
                            repeat: Infinity, 
                            ease: "linear" 
                        }}
                        style={{ width: "fit-content" }}
                    >
                        {doubledMembers.map((member, index) => (
                            <div
                                key={`${member._id}-${index}`}
                                className="w-[320px] bg-[#fff9f0]/50 border border-[#064e3b]/5 rounded-[2.5rem] p-8 text-center hover:bg-white hover:shadow-2xl hover:shadow-[#064e3b]/5 transition-all duration-500"
                            >
                                <div className="relative mb-6 mx-auto w-32 h-32">
                                    <div className="absolute inset-0 bg-[#b47c1c] rounded-full rotate-6 opacity-20" />
                                    <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                                        {member.photoUrl && typeof member.photoUrl === 'string' ? (
                                            <img 
                                                src={getServerUrl(member.photoUrl)} 
                                                alt={member.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-[#064e3b] text-white flex items-center justify-center text-3xl font-bold uppercase">
                                                {member.name ? member.name.split(' ').map(n => n[0]).join('') : 'U'}

                                            </div>
                                        )}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-[#064e3b] mb-1">
                                    {member.name}
                                </h3>
                                <div className="text-[#b47c1c] text-[10px] font-bold uppercase tracking-widest mb-4">
                                    {member.designation}
                                </div>
                                
                                <div className="pt-4 border-t border-gray-100">
                                    <p className="text-gray-500 text-xs font-medium leading-relaxed">
                                        {member.organization}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                <div className="mt-6 text-center">
                    <a 
                        href="/committee/Executive" 
                        className="inline-flex items-center gap-2 text-[#064e3b] font-bold text-sm hover:text-[#b47c1c] transition-colors group"
                    >
                        View Full Committee Details
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>
            </section>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </>
    );
};

export default HomeCommittee;
