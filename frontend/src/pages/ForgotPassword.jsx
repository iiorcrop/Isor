import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Loader2, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // 'success' or 'error'
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/membership/forgot-password`, { email });
            setStatus('success');
            setMessage(res.data.message);
            setLoading(false);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Something went wrong');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fff9f0] flex items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-[#064e3b]/5"
            >
                <div className="bg-[#b47c1c] p-10 text-center space-y-2">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl rotate-3">
                        <Mail size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-white uppercase tracking-tight">Password Recovery</h2>
                    <p className="text-white/80 text-xs font-medium tracking-widest uppercase">Indian Society of Oilseeds Research</p>
                </div>

                <div className="p-10 space-y-6">
                    {status === 'success' ? (
                        <div className="text-center space-y-6 py-4">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle size={32} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-[#064e3b]">Reset Email Sent!</h3>
                                <p className="text-gray-500 text-sm">{message}</p>
                            </div>
                            <button 
                                onClick={() => window.location.href = '/login'}
                                className="w-full bg-[#064e3b] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#04392b] transition-all"
                            >
                                Back to Login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <p className="text-sm text-gray-500 text-center">Enter your registered email address and we'll send you a temporary password.</p>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input 
                                        required
                                        type="email" 
                                        placeholder="email@example.com"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#1e703c] transition-all"
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            {status === 'error' && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2">
                                    <AlertCircle size={16} /> {message}
                                </div>
                            )}

                            <button 
                                disabled={loading}
                                className="w-full bg-[#064e3b] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#04392b] transition-all shadow-xl"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Request Temporary Password'}
                            </button>

                            <button 
                                type="button"
                                onClick={() => window.location.href = '/login'}
                                className="w-full flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-[#064e3b] transition-all"
                            >
                                <ArrowLeft size={14} /> Back to Login
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
