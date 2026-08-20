import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    User, 
    Mail, 
    Phone, 
    Building2, 
    Briefcase, 
    MapPin, 
    LogOut, 
    CheckCircle2, 
    Edit3, 
    Calendar, 
    FileText, 
    Award, 
    ExternalLink,
    Loader2,
    ShieldCheck,
    BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const UserDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        mobileNumber: '',
        organization: '',
        designation: '',
        city: ''
    });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            navigate('/user/login');
            return;
        }

        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/user/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data);
            setEditForm({
                name: res.data.name || '',
                mobileNumber: res.data.mobileNumber || '',
                organization: res.data.organization || '',
                designation: res.data.designation || '',
                city: res.data.city || ''
            });
            localStorage.setItem('userData', JSON.stringify(res.data));
        } catch (err) {
            console.error('Failed to fetch user profile:', err);
            // Fallback to local storage if network glitch
            const cachedUser = localStorage.getItem('userData');
            if (cachedUser) {
                try {
                    const parsed = JSON.parse(cachedUser);
                    setUser(parsed);
                    setEditForm({
                        name: parsed.name || '',
                        mobileNumber: parsed.mobileNumber || '',
                        organization: parsed.organization || '',
                        designation: parsed.designation || '',
                        city: parsed.city || ''
                    });
                } catch (e) {
                    navigate('/user/login');
                }
            } else {
                navigate('/user/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        window.dispatchEvent(new Event('storage'));
        navigate('/user/login');
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMsg('');

        try {
            const token = localStorage.getItem('userToken');
            const res = await axios.put(`${import.meta.env.VITE_API_URL}/user/profile`, editForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data.user);
            localStorage.setItem('userData', JSON.stringify(res.data.user));
            window.dispatchEvent(new Event('storage'));
            setMsg('Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            setMsg(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fff9f0] flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-[#064e3b] w-10 h-10 mb-4" />
                <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">Loading User Dashboard...</p>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#fff9f0] py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Top Profile Header Banner */}
                <motion.div 
                    initial={{ opacity: 0, y: -15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-[#064e3b] via-[#04392b] to-[#1e703c] rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
                >
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left z-10">
                        <div className="w-24 h-24 rounded-3xl bg-[#fbbf24] text-[#064e3b] flex items-center justify-center font-serif text-4xl font-bold shadow-xl border-4 border-white/20 shrink-0">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>

                        <div>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] uppercase font-bold rounded-full flex items-center gap-1">
                                    <CheckCircle2 size={12} /> {user.status || 'Active Account'}
                                </span>
                                <span className="px-3 py-1 bg-[#b47c1c]/30 text-[#fbbf24] border border-[#b47c1c]/40 text-[10px] uppercase font-bold rounded-full">
                                    General User
                                </span>
                            </div>
                            <h1 className="text-3xl font-serif font-bold tracking-tight">{user.name}</h1>
                            <p className="text-white/70 text-xs mt-1 flex items-center justify-center md:justify-start gap-1 font-medium">
                                <Mail size={13} className="text-[#fbbf24]" /> {user.email}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 z-10">
                        <button 
                            onClick={() => setIsEditing(!isEditing)}
                            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold flex items-center gap-2 transition-all"
                        >
                            <Edit3 size={15} /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                        </button>

                        <button 
                            onClick={handleLogout}
                            className="px-5 py-3 rounded-2xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-200 text-xs font-bold flex items-center gap-2 transition-all"
                        >
                            <LogOut size={15} /> Logout
                        </button>
                    </div>
                </motion.div>

                {msg && (
                    <div className="bg-emerald-100 text-emerald-800 p-4 rounded-2xl text-xs font-bold border border-emerald-200 text-center">
                        {msg}
                    </div>
                )}

                {/* Edit Profile Form Modal / Box */}
                {isEditing && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-8 rounded-[2rem] shadow-xl border border-[#064e3b]/10 space-y-6"
                    >
                        <h3 className="text-lg font-serif font-bold text-[#064e3b] flex items-center gap-2">
                            <Edit3 size={18} className="text-[#b47c1c]" /> Edit Profile Information
                        </h3>

                        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Full Name</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                    value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Mobile Number</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                    value={editForm.mobileNumber}
                                    onChange={e => setEditForm({ ...editForm, mobileNumber: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Organization / Institution</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                    value={editForm.organization}
                                    onChange={e => setEditForm({ ...editForm, organization: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Designation</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                    value={editForm.designation}
                                    onChange={e => setEditForm({ ...editForm, designation: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">City / Location</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                    value={editForm.city}
                                    onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                                />
                            </div>

                            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={saving}
                                    className="px-8 py-3 rounded-xl bg-[#064e3b] text-white text-xs font-bold hover:bg-[#04392b] shadow-lg"
                                >
                                    {saving ? 'Saving...' : 'Save Profile'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {/* Dashboard Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* User Profile Overview */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-[#064e3b]/5 space-y-6">
                        <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
                            <h3 className="text-lg font-serif font-bold text-[#064e3b] flex items-center gap-2">
                                <User size={18} className="text-[#b47c1c]" /> Profile Summary
                            </h3>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                Logged In
                            </span>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                <span className="text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <Mail size={14} className="text-gray-400" /> Email
                                </span>
                                <span className="font-semibold text-gray-800">{user.email}</span>
                            </div>

                            <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                <span className="text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <Phone size={14} className="text-gray-400" /> Mobile
                                </span>
                                <span className="font-semibold text-gray-800">{user.mobileNumber || 'Not provided'}</span>
                            </div>

                            <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                <span className="text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <Building2 size={14} className="text-gray-400" /> Organization
                                </span>
                                <span className="font-semibold text-gray-800">{user.organization || 'Not provided'}</span>
                            </div>

                            <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                <span className="text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <Briefcase size={14} className="text-gray-400" /> Designation
                                </span>
                                <span className="font-semibold text-gray-800">{user.designation || 'Not provided'}</span>
                            </div>

                            <div className="flex items-center justify-between py-2">
                                <span className="text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <MapPin size={14} className="text-gray-400" /> Location
                                </span>
                                <span className="font-semibold text-gray-800">{user.city || 'Not provided'}</span>
                            </div>
                        </div>

                        {/* Upgrade Banner */}
                        <div className="bg-gradient-to-br from-[#fff9f0] to-[#fef3c7] p-5 rounded-2xl border border-[#b47c1c]/30 space-y-3">
                            <div className="flex items-center gap-2 text-[#b47c1c] font-bold text-xs uppercase">
                                <Award size={16} /> Become an ISOR Life / Annual Member
                            </div>
                            <p className="text-gray-600 text-[11px] leading-relaxed">
                                Upgrade to official ISOR membership to unlock journal privileges, voting rights, and discounted conference registrations.
                            </p>
                            <Link 
                                to="/membership" 
                                className="w-full py-3 px-4 rounded-xl bg-[#064e3b] text-white text-xs font-bold hover:bg-[#04392b] transition-all shadow-md flex items-center justify-center gap-2"
                            >
                                <Award size={15} className="text-[#fbbf24]" /> Apply for Membership (Pre-fill My Info) <ExternalLink size={12} />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Access Services & Resources */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-[#064e3b]/5 space-y-6">
                            <h3 className="text-lg font-serif font-bold text-[#064e3b] border-b border-gray-100 pb-4">
                                Quick Navigation & Services
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Link 
                                    to="/events" 
                                    className="p-5 rounded-2xl bg-gray-50 hover:bg-[#064e3b]/5 border border-gray-100 hover:border-[#064e3b]/20 transition-all group flex items-start gap-4"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-[#064e3b]/10 text-[#064e3b] flex items-center justify-center shrink-0 group-hover:bg-[#064e3b] group-hover:text-white transition-colors">
                                        <Calendar size={22} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#064e3b] text-sm group-hover:text-[#b47c1c] transition-colors">ISOR Events & Conferences</h4>
                                        <p className="text-gray-500 text-xs mt-1">Explore upcoming national symposia, seminars, and workshops.</p>
                                    </div>
                                </Link>

                                <Link 
                                    to="/downloads" 
                                    className="p-5 rounded-2xl bg-gray-50 hover:bg-[#064e3b]/5 border border-gray-100 hover:border-[#064e3b]/20 transition-all group flex items-start gap-4"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-[#064e3b]/10 text-[#064e3b] flex items-center justify-center shrink-0 group-hover:bg-[#064e3b] group-hover:text-white transition-colors">
                                        <FileText size={22} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#064e3b] text-sm group-hover:text-[#b47c1c] transition-colors">Downloads & Publications</h4>
                                        <p className="text-gray-500 text-xs mt-1">Access society guidelines, reports, and public documentation.</p>
                                    </div>
                                </Link>

                                <Link 
                                    to="/verify-certificate" 
                                    className="p-5 rounded-2xl bg-gray-50 hover:bg-[#064e3b]/5 border border-gray-100 hover:border-[#064e3b]/20 transition-all group flex items-start gap-4"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-[#064e3b]/10 text-[#064e3b] flex items-center justify-center shrink-0 group-hover:bg-[#064e3b] group-hover:text-white transition-colors">
                                        <ShieldCheck size={22} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#064e3b] text-sm group-hover:text-[#b47c1c] transition-colors">Certificate Verification</h4>
                                        <p className="text-gray-500 text-xs mt-1">Verify membership credentials and event certificates.</p>
                                    </div>
                                </Link>

                                <a 
                                    href="http://www.isor.in/" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="p-5 rounded-2xl bg-gray-50 hover:bg-[#064e3b]/5 border border-gray-100 hover:border-[#064e3b]/20 transition-all group flex items-start gap-4"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-[#064e3b]/10 text-[#064e3b] flex items-center justify-center shrink-0 group-hover:bg-[#064e3b] group-hover:text-white transition-colors">
                                        <BookOpen size={22} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#064e3b] text-sm group-hover:text-[#b47c1c] transition-colors">Journal of Oilseeds Research</h4>
                                        <p className="text-gray-500 text-xs mt-1">Browse open research papers and society archives.</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default UserDashboard;
