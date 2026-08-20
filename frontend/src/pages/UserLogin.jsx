import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const UserLogin = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/user/login`, {
                email: credentials.email,
                password: credentials.password
            });

            const { token, user } = res.data;

            localStorage.setItem('userToken', token);
            localStorage.setItem('userData', JSON.stringify(user));
            // Trigger storage event so TopBar updates automatically
            window.dispatchEvent(new Event('storage'));

            if (user.role === 'editor') {
                navigate('/editor/dashboard');
            } else if (user.role === 'reviewer') {
                navigate('/reviewer/dashboard');
            } else {
                const searchParams = new URLSearchParams(window.location.search);
                const redirectPath = searchParams.get('redirect') || '/user/dashboard';
                navigate(redirectPath);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fff9f0] flex items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-[#064e3b]/5"
            >
                {/* Header Banner */}
                <div className="bg-[#064e3b] p-10 text-center space-y-2 relative overflow-hidden">
                    <div className="w-16 h-16 bg-[#fbbf24] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl rotate-3">
                        <UserCheck size={32} className="text-[#064e3b]" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-white uppercase tracking-tight">User Login</h2>
                    <p className="text-white/70 text-xs font-medium tracking-widest uppercase">
                        Indian Society of Oilseeds Research
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="p-10 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold text-center border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                required
                                type="email" 
                                placeholder="your.email@example.com"
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-xs font-medium focus:outline-none focus:border-[#1e703c] transition-all"
                                value={credentials.email}
                                onChange={e => setCredentials({ ...credentials, email: e.target.value })}
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
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-xs font-medium focus:outline-none focus:border-[#1e703c] transition-all"
                                value={credentials.password}
                                onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <Link to="/user/register" className="text-xs font-bold text-[#064e3b] hover:underline">
                            Create Free Account
                        </Link>
                        <Link to="/membership/login" className="text-xs font-bold text-[#b47c1c] hover:underline">
                            Member Portal Login
                        </Link>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#064e3b] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#04392b] transition-all shadow-xl group"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                        {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default UserLogin;
