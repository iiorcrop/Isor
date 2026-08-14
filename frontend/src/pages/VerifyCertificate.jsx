import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
    ShieldCheck, 
    Search, 
    CheckCircle, 
    XCircle, 
    AlertTriangle, 
    Award, 
    User, 
    Briefcase, 
    Building, 
    Calendar, 
    Printer, 
    Loader2,
    FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MemberCertificate from '../components/MemberCertificate';

const VerifyCertificate = () => {
    const { enrollmentId: pathId } = useParams();
    const [searchParams] = useSearchParams();
    const queryId = searchParams.get('id');

    const [searchId, setSearchId] = useState(pathId || queryId || '');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [showCertModal, setShowCertModal] = useState(false);

    useEffect(() => {
        const targetId = pathId || queryId;
        if (targetId) {
            setSearchId(targetId);
            performVerification(targetId);
        }
    }, [pathId, queryId]);

    const performVerification = async (idToVerify) => {
        const query = (idToVerify || searchId).trim();
        if (!query) return alert('Please enter an Enrollment ID or Membership ID');

        setLoading(true);
        setErrorMsg('');
        setResult(null);

        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/membership/verify/${encodeURIComponent(query)}`);
            setResult(res.data);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Certificate verification failed. No record found for the provided Enrollment ID.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        performVerification(searchId);
    };

    return (
        <div className="min-h-screen bg-[#fff9f0] py-16 px-6">
            <div className="max-w-3xl mx-auto space-y-10">
                {/* Header */}
                <header className="text-center space-y-4">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-20 h-20 bg-[#064e3b] text-[#fbbf24] rounded-3xl flex items-center justify-center mx-auto shadow-xl"
                    >
                        <ShieldCheck size={40} />
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-serif font-bold text-[#064e3b]"
                    >
                        Public Certificate Verification
                    </motion.h1>
                    <p className="text-[#b47c1c] font-bold tracking-[0.2em] uppercase text-xs">
                        Indian Society of Oilseeds Research (ISOR)
                    </p>
                    <p className="text-gray-600 text-sm max-w-xl mx-auto">
                        Enter a member's Enrollment ID or Membership ID below to verify the authenticity and validity of their ISOR Membership Certificate.
                    </p>
                </header>

                {/* Search Card */}
                <motion.form 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                    className="bg-white p-4 rounded-3xl shadow-2xl border border-[#064e3b]/5 flex flex-col sm:flex-row gap-3"
                >
                    <div className="relative flex-1">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            value={searchId}
                            onChange={e => setSearchId(e.target.value)}
                            placeholder="e.g. ENR-2026-0001 or ISOR-2026-A0001"
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-[#064e3b] transition-all"
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={loading}
                        className="bg-[#064e3b] text-white px-8 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#04392b] transition-all shadow-lg disabled:opacity-50 min-w-[160px]"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <FileCheck size={18} />}
                        {loading ? 'Verifying...' : 'Verify Certificate'}
                    </button>
                </motion.form>

                {/* Verification Results */}
                <AnimatePresence mode="wait">
                    {errorMsg && (
                        <motion.div 
                            key="error"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-red-50 border border-red-200 p-8 rounded-[2.5rem] text-center space-y-4"
                        >
                            <XCircle size={48} className="mx-auto text-red-500" />
                            <h3 className="text-xl font-serif font-bold text-red-900">Certificate Not Verified</h3>
                            <p className="text-red-700 text-xs max-w-md mx-auto">{errorMsg}</p>
                        </motion.div>
                    )}

                    {result && (
                        <motion.div 
                            key="result"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-[3rem] shadow-2xl p-8 md:p-12 border border-[#064e3b]/10 space-y-8 overflow-hidden relative"
                        >
                            {/* Verification Status Banner */}
                            <div className={`p-6 rounded-3xl flex items-center gap-4 border ${
                                result.isValid && !result.isExpired
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                : result.isExpired
                                ? 'bg-amber-50 border-amber-200 text-amber-900'
                                : 'bg-red-50 border-red-200 text-red-900'
                            }`}>
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                                    result.isValid && !result.isExpired ? 'bg-emerald-600 text-white' :
                                    result.isExpired ? 'bg-amber-600 text-white' : 'bg-red-600 text-white'
                                }`}>
                                    {result.isValid && !result.isExpired ? <CheckCircle size={32} /> :
                                     result.isExpired ? <AlertTriangle size={32} /> : <XCircle size={32} />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold font-serif">
                                        {result.isValid && !result.isExpired ? 'Official Certificate Authenticated & Valid' :
                                         result.isExpired ? 'Certificate Record Found (Subscription Expired)' : 'Membership Unverified / Pending'}
                                    </h3>
                                    <p className="text-xs opacity-80 mt-0.5">
                                        {result.isValid && !result.isExpired 
                                            ? 'This certificate has been issued by the Indian Society of Oilseeds Research and is currently active.'
                                            : result.isExpired 
                                            ? 'This membership record was issued by ISOR, but the yearly subscription has expired.'
                                            : 'This membership application is pending administrative approval.'}
                                    </p>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                        <User size={14} className="text-[#b47c1c]" /> Member Name
                                    </span>
                                    <p className="text-lg font-serif font-bold text-[#064e3b]">{result.fullName}</p>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                        <Award size={14} className="text-[#b47c1c]" /> Enrollment ID
                                    </span>
                                    <p className="text-lg font-mono font-bold text-[#064e3b]">{result.enrollmentId}</p>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                        <Award size={14} className="text-[#b47c1c]" /> Membership ID
                                    </span>
                                    <p className="text-sm font-mono font-bold text-gray-700">{result.membershipId || 'N/A'}</p>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                        <Award size={14} className="text-[#b47c1c]" /> Membership Category
                                    </span>
                                    <p className="text-sm font-bold text-[#064e3b]">{result.membershipType} Member</p>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                        <Briefcase size={14} className="text-[#b47c1c]" /> Designation
                                    </span>
                                    <p className="text-xs font-bold text-gray-700">{result.designation || 'Not specified'}</p>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                        <Building size={14} className="text-[#b47c1c]" /> Organization
                                    </span>
                                    <p className="text-xs font-bold text-gray-700">{result.organization || 'Not specified'}</p>
                                </div>

                                <div className="space-y-1 md:col-span-2 pt-4 border-t border-gray-200 flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                        <Calendar size={14} className="text-[#b47c1c]" /> Certificate Expiry Date
                                    </span>
                                    <span className="font-bold text-sm text-[#064e3b]">
                                        {(result.membershipType === 'Lifetime' || result.membershipType === 'Life') 
                                            ? 'Lifetime Member (Permanent)' 
                                            : result.subscriptionEndDate 
                                                ? new Date(result.subscriptionEndDate).toLocaleDateString('en-GB')
                                                : '1 Year from Approval'}
                                    </span>
                                </div>
                            </div>

                            {/* View Certificate Button */}
                            {result.isValid && !result.isExpired && (
                                <button 
                                    onClick={() => setShowCertModal(true)}
                                    className="w-full bg-[#064e3b] text-white py-5 rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:bg-[#04392b] transition-all shadow-xl"
                                >
                                    <Printer size={20} /> View Official Verified Certificate
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Certificate Preview Modal */}
            <AnimatePresence>
                {showCertModal && result && (
                    <MemberCertificate 
                        member={{
                            title: result.title,
                            firstName: result.firstName,
                            lastName: result.lastName,
                            membershipType: result.membershipType,
                            membershipId: result.membershipId,
                            enrollmentId: result.enrollmentId,
                            subscriptionEndDate: result.subscriptionEndDate
                        }}
                        onClose={() => setShowCertModal(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default VerifyCertificate;
