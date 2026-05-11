import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Loader2, Mail, Phone, MapPin, Globe, CheckCircle } from 'lucide-react';

const FooterSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        address: '',
        email: '',
        phone: '',
        website: '',
        socialLinks: {
            facebook: '',
            twitter: '',
            linkedin: '',
            youtube: ''
        },
        aboutShort: '',
        copyrightText: ''
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/footer`);
            if (res.data) {
                setFormData({
                    ...formData,
                    ...res.data,
                    socialLinks: {
                        ...formData.socialLinks,
                        ...(res.data.socialLinks || {})
                    }
                });
            }
            setLoading(false);
        } catch (err) { 
            console.error(err);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/footer`, formData);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-[#0a0f1d]">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
    );

    return (
        <div className="p-8 space-y-8 bg-[#0a0f1d] min-h-screen text-white">
            <div className="flex justify-between items-center bg-[#1e293b] p-8 rounded-[2rem] border border-white/5 shadow-2xl">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-white">Footer Settings</h2>
                    <p className="text-white/40 text-sm">Update website contact info, social links, and copyright text.</p>
                </div>
                {success && (
                    <div className="flex items-center gap-2 text-accent bg-accent/10 px-4 py-2 rounded-xl border border-accent/20 animate-in fade-in slide-in-from-right-4">
                        <CheckCircle size={18} />
                        <span className="font-bold text-sm">Settings Saved!</span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Contact Information */}
                    <div className="bg-[#1e293b] p-8 rounded-[2rem] border border-white/5 space-y-6">
                        <h3 className="text-xl font-bold flex items-center gap-3">
                            <MapPin className="text-primary" /> Contact Details
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Office Address</label>
                                <textarea 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary h-32"
                                    value={formData.address || ''}
                                    onChange={e => setFormData({...formData, address: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                        <input 
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-white focus:outline-none focus:border-primary"
                                            value={formData.email || ''}
                                            onChange={e => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                        <input 
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-white focus:outline-none focus:border-primary"
                                            value={formData.phone || ''}
                                            onChange={e => setFormData({...formData, phone: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Website URL</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                    <input 
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-white focus:outline-none focus:border-primary"
                                        value={formData.website || ''}
                                        onChange={e => setFormData({...formData, website: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="bg-[#1e293b] p-8 rounded-[2rem] border border-white/5 space-y-6">
                        <h3 className="text-xl font-bold flex items-center gap-3">
                            <Globe className="text-primary" /> Social Media Links
                        </h3>
                        <div className="space-y-4">
                            {[
                                { id: 'facebook', label: 'Facebook' },
                                { id: 'twitter', label: 'X / Twitter' },
                                { id: 'linkedin', label: 'LinkedIn' },
                                { id: 'youtube', label: 'YouTube' }
                            ].map(({ id, label }) => (
                                <div key={id} className="space-y-2">
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{label}</label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                        <input 
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-white focus:outline-none focus:border-primary"
                                            value={formData.socialLinks?.[id] || ''}
                                            onChange={e => setFormData({
                                                ...formData, 
                                                socialLinks: { ...formData.socialLinks, [id]: e.target.value }
                                            })}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Branding & Others */}
                    <div className="bg-[#1e293b] p-8 rounded-[2rem] border border-white/5 space-y-6 lg:col-span-2">
                        <h3 className="text-xl font-bold">Branding & Copyright</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Brand Tagline</label>
                                <input 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary"
                                    value={formData.aboutShort || ''}
                                    onChange={e => setFormData({...formData, aboutShort: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Copyright Text</label>
                                <input 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary"
                                    value={formData.copyrightText || ''}
                                    onChange={e => setFormData({...formData, copyrightText: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="fixed bottom-8 right-8 z-50">
                    <button className="bg-primary text-white px-10 py-5 rounded-[2rem] font-bold flex items-center gap-3 hover:opacity-90 transition-all shadow-2xl shadow-primary/40">
                        {saving ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                        Save Footer Settings
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FooterSettings;
