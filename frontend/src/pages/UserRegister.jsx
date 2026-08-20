import React, { useState } from 'react';
import axios from 'axios';
import { User, Mail, Lock, Phone, Building2, Briefcase, MapPin, Loader2, ArrowRight, CheckCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const UserRegister = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        mobileNumber: '',
        organization: '',
        designation: '',
        city: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match.');
        }

        if (formData.password.length < 6) {
            return setError('Password must be at least 6 characters long.');
        }

        setLoading(true);

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/user/register`, {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                mobileNumber: formData.mobileNumber,
                organization: formData.organization,
                designation: formData.designation,
                city: formData.city
            });

            const { token, user, message } = res.data;

            // Save token and user info
            localStorage.setItem('userToken', token);
            localStorage.setItem('userData', JSON.stringify(user));
            // Trigger storage event so TopBar updates automatically
            window.dispatchEvent(new Event('storage'));

            setSuccessMsg(message || 'Account created successfully!');
            setTimeout(() => {
                navigate('/user/dashboard');
            }, 1200);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please check your inputs and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fff9f0] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-[#064e3b]/10"
            >
                {/* Header Banner */}
                <div className="bg-[#064e3b] p-8 md:p-10 text-center relative overflow-hidden">
                    <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[#b47c1c]/20 rounded-full blur-2xl"></div>
                    <div className="w-16 h-16 bg-[#fbbf24] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg rotate-2">
                        <ShieldCheck size={32} className="text-[#064e3b]" />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-white tracking-tight">Create User Account</h2>
                    <p className="text-white/80 text-xs font-medium tracking-wide uppercase mt-2">
                        Free Registration — Instant Access (No Subscription Fee Required)
                    </p>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-2">
                            <span>⚠️ {error}</span>
                        </div>
                    )}

                    {successMsg && (
                        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-xs font-bold border border-emerald-100 flex items-center gap-2">
                            <CheckCircle size={18} />
                            <span>{successMsg} Redirecting to your dashboard...</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    required
                                    type="text" 
                                    name="name"
                                    placeholder="Dr. John Doe"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-medium focus:outline-none focus:border-[#064e3b] focus:bg-white transition-all"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    required
                                    type="email" 
                                    name="email"
                                    placeholder="john.doe@example.com"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-medium focus:outline-none focus:border-[#064e3b] focus:bg-white transition-all"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Mobile Number */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                                Mobile Number
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="tel" 
                                    name="mobileNumber"
                                    placeholder="+91 98765 43210"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-medium focus:outline-none focus:border-[#064e3b] focus:bg-white transition-all"
                                    value={formData.mobileNumber}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Organization */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                                Organization / University
                            </label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="text" 
                                    name="organization"
                                    placeholder="ICAR / University Name"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-medium focus:outline-none focus:border-[#064e3b] focus:bg-white transition-all"
                                    value={formData.organization}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Designation */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                                Designation
                            </label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="text" 
                                    name="designation"
                                    placeholder="Senior Scientist / Student"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-medium focus:outline-none focus:border-[#064e3b] focus:bg-white transition-all"
                                    value={formData.designation}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* City / State */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                                City / Location
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="text" 
                                    name="city"
                                    placeholder="Hyderabad"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-medium focus:outline-none focus:border-[#064e3b] focus:bg-white transition-all"
                                    value={formData.city}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    required
                                    type="password" 
                                    name="password"
                                    placeholder="••••••••"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-medium focus:outline-none focus:border-[#064e3b] focus:bg-white transition-all"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                                Confirm Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    required
                                    type="password" 
                                    name="confirmPassword"
                                    placeholder="••••••••"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-medium focus:outline-none focus:border-[#064e3b] focus:bg-white transition-all"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                            Already have an account?{' '}
                            <Link to="/user/login" className="font-bold text-[#064e3b] hover:underline">
                                Log in here
                            </Link>
                        </span>

                        <span className="text-xs text-gray-500">
                            Looking for Member Portal?{' '}
                            <Link to="/membership" className="font-bold text-[#b47c1c] hover:underline">
                                Member Enrollment
                            </Link>
                        </span>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#064e3b] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#04392b] transition-all shadow-xl text-sm group"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                        {loading ? 'Creating Account...' : 'Register & Access Dashboard'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default UserRegister;
