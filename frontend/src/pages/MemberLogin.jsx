import React, { useState } from 'react';
import axios from 'axios';
import { User, Lock, Loader2, ArrowRight, ShieldCheck, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const MemberLogin = () => {
    const [credentials, setCredentials] = useState({ membershipId: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [statusData, setStatusData] = useState(null);
    const [resubmitFile, setResubmitFile] = useState(null);
    const [resubmitting, setResubmitting] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/membership/login`, credentials);
            const { member } = res.data;
            
            if (member.approvalStatus === 'Approved') {
                localStorage.setItem('memberToken', res.data.token);
                localStorage.setItem('memberData', JSON.stringify(member));
                window.location.href = '/member-dashboard';
            } else {
                setStatusData(member);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResubmit = async () => {
        if (!resubmitFile) return alert('Please select a file');
        setResubmitting(true);
        const formData = new FormData();
        formData.append('memberId', statusData.id);
        formData.append('paymentProof', resubmitFile);

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/membership/resubmit-proof`, formData);
            alert('Proof resubmitted! Our team will review it.');
            setStatusData(null);
        } catch (err) {
            alert('Failed to resubmit');
        } finally {
            setResubmitting(false);
        }
    };

    if (statusData) {
        return (
            <div className="min-h-screen bg-[#fff9f0] flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 border border-[#064e3b]/5 text-center">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${statusData.approvalStatus === 'Rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                        {statusData.approvalStatus === 'Rejected' ? <XCircle size={32} /> : <Clock size={32} />}
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-[#064e3b] mb-2">Membership Status</h2>
                    <p className="text-gray-500 text-sm mb-6">
                        {statusData.approvalStatus === 'Rejected' 
                            ? 'Your enrollment was rejected due to invalid payment proof.' 
                            : 'Your application is currently under review.'}
                    </p>

                    <div className="bg-gray-50 p-6 rounded-2xl mb-6 text-left space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400 uppercase font-bold">Membership ID</span>
                            <span className="text-[#064e3b] font-bold">{statusData.membershipId}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400 uppercase font-bold">Status</span>
                            <span className={`font-bold ${statusData.approvalStatus === 'Rejected' ? 'text-red-500' : 'text-amber-500'}`}>
                                {statusData.approvalStatus}
                            </span>
                        </div>
                    </div>

                    {statusData.approvalStatus === 'Rejected' && (
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Upload Proper Payment Proof (JPG/PNG/PDF)</label>
                            <input 
                                type="file" 
                                className="w-full text-xs bg-gray-50 p-3 rounded-xl border border-dashed border-gray-200"
                                onChange={e => setResubmitFile(e.target.files[0])}
                            />
                            <button 
                                onClick={handleResubmit}
                                disabled={resubmitting}
                                className="w-full bg-[#064e3b] text-white py-4 rounded-xl font-bold hover:bg-[#04392b] transition-all shadow-lg"
                            >
                                {resubmitting ? 'Submitting...' : 'Resubmit Proof for Approval'}
                            </button>
                        </div>
                    )}

                    <button onClick={() => setStatusData(null)} className="mt-6 text-xs font-bold text-gray-400 hover:text-[#064e3b]">Back to Login</button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fff9f0] flex items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-[#064e3b]/5"
            >
                <div className="bg-[#064e3b] p-10 text-center space-y-2">
                    <div className="w-16 h-16 bg-[#fbbf24] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl rotate-3">
                        <ShieldCheck size={32} className="text-[#064e3b]" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-white uppercase tracking-tight">Member Portal</h2>
                    <p className="text-white/60 text-xs font-medium tracking-widest uppercase">Indian Society of Oilseeds Research</p>
                </div>

                <form onSubmit={handleLogin} className="p-10 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold text-center border border-red-100">
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Membership ID</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                required
                                type="text" 
                                placeholder="ISOR-2026-XXXX"
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#1e703c] transition-all"
                                onChange={e => setCredentials({...credentials, membershipId: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                required
                                type="password" 
                                placeholder="••••••••"
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#1e703c] transition-all"
                                onChange={e => setCredentials({...credentials, password: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <a href="/forgot-password" size="sm" className="text-xs font-bold text-[#b47c1c] hover:underline">Forgot Password?</a>
                        <a href="/membership" className="text-xs font-bold text-[#064e3b] hover:underline">New Enrollment</a>
                    </div>

                    <button 
                        disabled={loading}
                        className="w-full bg-[#064e3b] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#04392b] transition-all shadow-xl group"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                        {loading ? 'Verifying...' : 'Sign In to Portal'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default MemberLogin;
