import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Award, 
    ArrowLeft, 
    Calendar, 
    CheckCircle2, 
    Download, 
    DollarSign, 
    UserCheck, 
    Building2, 
    FileText, 
    Loader2, 
    Trophy,
    Share2,
    ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getServerUrl } from '../utils/urlHelper';

const AwardDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [award, setAward] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAwardDetails();
    }, [id]);

    const fetchAwardDetails = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/awards/${id}`);
            setAward(res.data);
        } catch (err) {
            console.error('Failed to fetch award details', err);
            setError('Award not found or link has expired.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fff9f0] flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-[#064e3b] w-10 h-10 mb-4" />
                <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Loading Award Details...</p>
            </div>
        );
    }

    if (error || !award) {
        return (
            <div className="min-h-screen bg-[#fff9f0] py-16 px-4 flex flex-col items-center justify-center text-center">
                <Award size={48} className="text-gray-300 mb-4" />
                <h2 className="text-2xl font-serif font-bold text-[#064e3b] mb-2">{error || 'Award Not Found'}</h2>
                <p className="text-gray-500 text-xs mb-6">The requested award details could not be retrieved.</p>
                <Link to="/awards" className="px-6 py-3 rounded-2xl bg-[#064e3b] text-white font-bold text-xs flex items-center gap-2">
                    <ArrowLeft size={16} /> Back to All Awards
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fff9f0] py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Top Navigation */}
                <div className="flex items-center justify-between">
                    <button 
                        onClick={() => navigate('/awards')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-[#064e3b] hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <ArrowLeft size={16} /> Back to Awards Table
                    </button>

                    <span className="text-xs font-bold text-[#b47c1c] uppercase tracking-widest bg-[#b47c1c]/10 px-3 py-1 rounded-full border border-[#b47c1c]/20">
                        {award.category || 'ISOR Award'}
                    </span>
                </div>

                {/* Main Hero Header Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2.5rem] shadow-xl border border-[#064e3b]/5 overflow-hidden"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3">
                        
                        {/* Main Image */}
                        <div className="bg-[#064e3b]/5 min-h-[260px] md:min-h-full flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-gray-100 relative">
                            {award.mainPhoto ? (
                                <img 
                                    src={getServerUrl(award.mainPhoto)} 
                                    alt={award.title} 
                                    className="max-h-72 w-full object-contain rounded-2xl shadow-md" 
                                />
                            ) : (
                                <div className="text-center space-y-3">
                                    <div className="w-24 h-24 rounded-full bg-[#fbbf24] text-[#064e3b] flex items-center justify-center mx-auto shadow-lg border-4 border-white">
                                        <Award size={44} />
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">ISOR Emblem</span>
                                </div>
                            )}
                        </div>

                        {/* Award Details Header */}
                        <div className="md:col-span-2 p-8 md:p-10 space-y-6 flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 rounded-full bg-[#064e3b] text-white text-[10px] uppercase font-bold tracking-wider">
                                        {award.frequency || 'Annual Award'}
                                    </span>
                                    {award.applicationDeadline && (
                                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold">
                                            Deadline: {award.applicationDeadline}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-2xl md:text-4xl font-serif font-bold text-[#064e3b] tracking-tight leading-tight">
                                    {award.title}
                                </h1>

                                <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                                    <Building2 size={16} className="text-[#b47c1c]" />
                                    <span>Awarded By: <strong className="text-gray-900">{award.awardBy}</strong></span>
                                </div>
                            </div>

                            {/* Rewards Box */}
                            {award.cashPrize && (
                                <div className="bg-[#fff9f0] p-4 rounded-2xl border border-[#b47c1c]/20 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#fbbf24] text-[#064e3b] flex items-center justify-center shrink-0 shadow-sm">
                                        <Trophy size={22} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-[#b47c1c] uppercase tracking-wider block">Award Prize & Recognition</span>
                                        <span className="text-base font-bold text-[#064e3b]">{award.cashPrize}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </motion.div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Main Details (Left 2 Columns) */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Eligibility Box */}
                        {award.eligibility && (
                            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-[#064e3b]/5 space-y-3">
                                <h3 className="text-base font-serif font-bold text-[#064e3b] flex items-center gap-2 border-b border-gray-100 pb-3">
                                    <UserCheck size={20} className="text-[#b47c1c]" /> Eligibility Criteria
                                </h3>
                                <p className="text-gray-700 text-xs md:text-sm leading-relaxed whitespace-pre-line font-medium">
                                    {award.eligibility}
                                </p>
                            </div>
                        )}

                        {/* Detailed Description */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-[#064e3b]/5 space-y-4">
                            <h3 className="text-base font-serif font-bold text-[#064e3b] flex items-center gap-2 border-b border-gray-100 pb-3">
                                <FileText size={20} className="text-[#b47c1c]" /> Full Award Description & Guidelines
                            </h3>
                            <div className="text-gray-700 text-xs md:text-sm leading-relaxed whitespace-pre-line font-normal space-y-4">
                                {award.description || 'No additional description provided for this award.'}
                            </div>
                        </div>

                    </div>

                    {/* Sidebar Information (Right Column) */}
                    <div className="space-y-6">
                        
                        {/* Download Application / Form */}
                        {award.documentUrl && (
                            <div className="bg-gradient-to-br from-[#064e3b] to-[#04392b] p-6 rounded-[2rem] text-white shadow-xl space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#fbbf24] text-[#064e3b] flex items-center justify-center shrink-0">
                                        <Download size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-serif font-bold text-sm">Application Form & Guidelines</h4>
                                        <p className="text-white/70 text-[11px]">Download official nomination rules</p>
                                    </div>
                                </div>
                                <a 
                                    href={getServerUrl(award.documentUrl)} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-full py-3 px-4 rounded-xl bg-[#fbbf24] text-[#064e3b] font-bold text-xs hover:bg-amber-300 transition-all flex items-center justify-center gap-2 shadow-md"
                                >
                                    <Download size={14} /> Download Nomination Form (PDF)
                                </a>
                            </div>
                        )}

                        {/* Quick Summary Card */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-[#064e3b]/5 space-y-4 text-xs">
                            <h4 className="font-serif font-bold text-[#064e3b] border-b border-gray-100 pb-3 text-sm">
                                Award Summary
                            </h4>

                            <div className="space-y-3">
                                <div className="flex justify-between py-1 border-b border-gray-50">
                                    <span className="text-gray-400 font-bold uppercase text-[10px]">Frequency</span>
                                    <span className="font-semibold text-gray-800">{award.frequency || 'Annual'}</span>
                                </div>

                                <div className="flex justify-between py-1 border-b border-gray-50">
                                    <span className="text-gray-400 font-bold uppercase text-[10px]">Category</span>
                                    <span className="font-semibold text-[#064e3b]">{award.category || 'General'}</span>
                                </div>

                                <div className="flex justify-between py-1 border-b border-gray-50">
                                    <span className="text-gray-400 font-bold uppercase text-[10px]">Deadline</span>
                                    <span className="font-semibold text-amber-700">{award.applicationDeadline || 'Open'}</span>
                                </div>
                            </div>

                            <Link 
                                to="/contact"
                                className="w-full py-3 rounded-xl border border-[#064e3b]/20 text-[#064e3b] font-bold text-xs hover:bg-[#064e3b]/5 transition-all flex items-center justify-center gap-2"
                            >
                                Contact Secretariat for Enquiries
                            </Link>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
};

export default AwardDetails;
