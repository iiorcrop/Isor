import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, BookOpen, Award, History, Users } from 'lucide-react';

const CommitteePage = () => {
    const { type } = useParams();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [periods, setPeriods] = useState([]);

    const titleMap = {
        'Executive': { label: 'Executive Committee', icon: Shield, color: 'text-blue-600' },
        'Editorial': { label: 'Editorial Committee', icon: BookOpen, color: 'text-emerald-600' },
        'Advisory': { label: 'Advisory Board', icon: Award, color: 'text-amber-600' },
        'PastPresidents': { label: 'Past Presidents', icon: History, color: 'text-purple-600' }
    };

    const current = titleMap[type] || titleMap['Executive'];

    useEffect(() => {
        fetchMembers();
    }, [type]);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/committees/${type || 'Executive'}`);

            setMembers(res.data);
            
            // Extract and sort periods (descending)
            const uniquePeriods = [...new Set(res.data.map(m => m.period).filter(Boolean))].sort((a, b) => b.localeCompare(a));
            setPeriods(uniquePeriods);
            
            if (uniquePeriods.length > 0) {
                setSelectedPeriod(uniquePeriods[0]); // Default to latest
            }
            
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const latestPeriod = periods[0];
    const isLatest = selectedPeriod === latestPeriod;

    // Filter members for selected period
    const filteredMembers = members.filter(m => m.period === selectedPeriod);

    // Grouping logic for filtered members
    const groupedMembers = filteredMembers.reduce((acc, member) => {
        const group = member.subGroup || 'Main Board';
        if (!acc[group]) acc[group] = [];
        acc[group].push(member);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-[#fff9f0] py-20 px-6">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-12 space-y-4">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`w-20 h-20 mx-auto rounded-3xl bg-white shadow-xl flex items-center justify-center ${current.color}`}
                    >
                        <current.icon size={40} />
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-serif font-bold text-[#064e3b]"
                    >
                        {current.label}
                    </motion.h1>
                    
                    {periods.length > 1 && (
                        <div className="flex flex-col items-center gap-4 mt-8">
                            <label className="text-[#b47c1c] text-xs font-bold uppercase tracking-widest">Select Committee Period</label>
                            <select 
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="bg-white border-2 border-[#064e3b]/10 rounded-full px-8 py-3 text-[#064e3b] font-bold shadow-sm focus:outline-none focus:border-[#064e3b] transition-colors cursor-pointer appearance-none text-center"
                                style={{ minWidth: '240px' }}
                            >
                                {periods.map(p => (
                                    <option key={p} value={p}>Period {p}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {selectedPeriod && (
                        <p className="text-[#b47c1c] font-bold tracking-[0.3em] uppercase text-sm mt-6">
                            For the Period {selectedPeriod}
                        </p>
                    )}
                    <div className="w-24 h-1 bg-[#b47c1c] mx-auto rounded-full mt-4" />
                </header>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-[#064e3b] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Unified Table Layout for All Committees */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-[#064e3b]/10"
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#064e3b] text-white">
                                            <th className="px-6 py-5 text-sm font-bold uppercase tracking-wider text-center w-20">S.No</th>
                                            <th className="px-6 py-5 text-sm font-bold uppercase tracking-wider text-center w-24">Photo</th>
                                            <th className="px-6 py-5 text-sm font-bold uppercase tracking-wider">Full Name</th>
                                            <th className="px-6 py-5 text-sm font-bold uppercase tracking-wider">Designation</th>
                                            <th className="px-6 py-5 text-sm font-bold uppercase tracking-wider">Organization / Affiliation</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        <AnimatePresence mode="popLayout">
                                            {filteredMembers.map((member, idx) => (
                                                <motion.tr 
                                                    key={member._id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="hover:bg-gray-50 transition-colors group"
                                                >
                                                    <td className="px-6 py-4 text-gray-400 font-bold text-sm text-center">{idx + 1}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-center">
                                                            <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden border-2 border-white shadow-md">
                                                                {member.photoUrl && typeof member.photoUrl === 'string' ? (
                                                                    <img 
                                                                        src={member.photoUrl.startsWith('http') ? member.photoUrl : `${import.meta.env.VITE_API_URL}/../${member.photoUrl}`} 
                                                                        alt={member.name} 
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-lg font-bold text-[#064e3b]/20">
                                                                        {member.name ? member.name.charAt(0) : 'U'}
                                                                    </div>
                                                                )}

                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-[#064e3b] group-hover:text-[#b47c1c] transition-colors text-base">{member.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="bg-[#b47c1c]/10 text-[#b47c1c] text-[11px] font-black px-2.5 py-1 rounded-md uppercase tracking-tight">
                                                            {member.designation}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 text-sm italic leading-relaxed">{member.organization || '-'}</td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </div>
                )}

                {filteredMembers.length === 0 && !loading && (
                    <div className="text-center py-20 bg-white rounded-[3rem] shadow-inner border border-black/5">
                        <Users size={64} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-400 font-medium">No members found for this period.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommitteePage;
