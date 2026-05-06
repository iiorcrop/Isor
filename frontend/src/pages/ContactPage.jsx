import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Globe } from 'lucide-react';

const ContactPage = () => {
    const [settings, setSettings] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/contact/settings`).then(res => setSettings(res.data));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/contact/inquiry`, formData);
            setStatus({ type: 'success', msg: res.data.message });
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            setStatus({ type: 'error', msg: 'Something went wrong. Please try again.' });
        }
        setLoading(false);
    };

    if (!settings) return null;

    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <section className="bg-[#064e3b] py-24 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:32px_32px]" />
                <div className="max-w-4xl mx-auto px-6 relative">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-serif font-bold text-white mb-6"
                    >
                        Get in Touch
                    </motion.h1>
                    <p className="text-white/70 text-lg md:text-xl font-medium max-w-2xl mx-auto">
                        Have questions about membership, journals, or events? We're here to help you.
                    </p>
                </div>
            </section>

            <section className="py-20 -mt-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        
                        {/* Left: Contact Info */}
                        <div className="lg:col-span-5 space-y-8">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="bg-[#fff9f0] p-8 rounded-[2.5rem] border border-[#b47c1c]/10 flex gap-6 group hover:bg-white hover:shadow-2xl transition-all">
                                    <div className="w-14 h-14 rounded-2xl bg-[#064e3b] flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                                        <MapPin size={28} />
                                    </div>
                                    <div>
                                        <h4 className="text-[#064e3b] font-bold text-lg mb-2">Our Address</h4>
                                        <p className="text-gray-600 leading-relaxed text-sm">{settings.address}</p>
                                    </div>
                                </div>

                                <div className="bg-[#fff9f0] p-8 rounded-[2.5rem] border border-[#b47c1c]/10 flex gap-6 group hover:bg-white hover:shadow-2xl transition-all">
                                    <div className="w-14 h-14 rounded-2xl bg-[#b47c1c] flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                                        <Phone size={28} />
                                    </div>
                                    <div>
                                        <h4 className="text-[#064e3b] font-bold text-lg mb-2">Call Us</h4>
                                        <p className="text-gray-600 font-bold text-lg">{settings.phone}</p>
                                        <p className="text-gray-400 text-xs uppercase font-bold mt-1 tracking-widest">{settings.workingHours}</p>
                                    </div>
                                </div>

                                <div className="bg-[#fff9f0] p-8 rounded-[2.5rem] border border-[#b47c1c]/10 flex gap-6 group hover:bg-white hover:shadow-2xl transition-all">
                                    <div className="w-14 h-14 rounded-2xl bg-[#064e3b] flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                                        <Mail size={28} />
                                    </div>
                                    <div>
                                        <h4 className="text-[#064e3b] font-bold text-lg mb-2">Email Support</h4>
                                        <p className="text-[#b47c1c] font-bold">{settings.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="p-8">
                                <h4 className="text-[#064e3b] font-bold mb-6 flex items-center gap-2">
                                    <span className="w-8 h-px bg-[#b47c1c]" /> Follow Us
                                </h4>
                                <div className="flex gap-4">
                                    {settings.socialLinks?.facebook && <a href={settings.socialLinks.facebook} className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-[#064e3b] hover:bg-[#064e3b] hover:text-white transition-all"><Globe size={20} /></a>}
                                    {settings.socialLinks?.twitter && <a href={settings.socialLinks.twitter} className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-[#064e3b] hover:bg-[#064e3b] hover:text-white transition-all"><Globe size={20} /></a>}
                                    {settings.socialLinks?.linkedin && <a href={settings.socialLinks.linkedin} className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-[#064e3b] hover:bg-[#064e3b] hover:text-white transition-all"><Globe size={20} /></a>}
                                    {settings.socialLinks?.youtube && <a href={settings.socialLinks.youtube} className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-[#064e3b] hover:bg-[#064e3b] hover:text-white transition-all"><Globe size={20} /></a>}
                                </div>
                            </div>
                        </div>

                        {/* Right: Contact Form */}
                        <div className="lg:col-span-7">
                            <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-[#064e3b]/5 border border-black/5">
                                <h3 className="text-2xl font-bold text-[#064e3b] mb-8">Send us a Message</h3>
                                
                                {status.msg && (
                                    <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 font-bold ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        {status.type === 'success' ? <CheckCircle size={20} /> : null}
                                        {status.msg}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                            <input 
                                                required
                                                className="w-full bg-gray-50 border border-transparent focus:border-[#b47c1c] focus:bg-white rounded-2xl p-4 transition-all outline-none"
                                                placeholder="John Doe"
                                                value={formData.name}
                                                onChange={e => setFormData({...formData, name: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                            <input 
                                                required type="email"
                                                className="w-full bg-gray-50 border border-transparent focus:border-[#b47c1c] focus:bg-white rounded-2xl p-4 transition-all outline-none"
                                                placeholder="john@example.com"
                                                value={formData.email}
                                                onChange={e => setFormData({...formData, email: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                                        <input 
                                            required
                                            className="w-full bg-gray-50 border border-transparent focus:border-[#b47c1c] focus:bg-white rounded-2xl p-4 transition-all outline-none"
                                            placeholder="Inquiry about Membership"
                                            value={formData.subject}
                                            onChange={e => setFormData({...formData, subject: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Message</label>
                                        <textarea 
                                            required
                                            className="w-full bg-gray-50 border border-transparent focus:border-[#b47c1c] focus:bg-white rounded-2xl p-4 h-40 transition-all outline-none resize-none"
                                            placeholder="Write your message here..."
                                            value={formData.message}
                                            onChange={e => setFormData({...formData, message: e.target.value})}
                                        />
                                    </div>
                                    <button 
                                        disabled={loading}
                                        className="w-full bg-[#064e3b] text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-[#b47c1c] transition-all shadow-xl shadow-[#064e3b]/10 active:scale-[0.98]"
                                    >
                                        {loading ? 'Sending...' : <>Send Message <Send size={20} /></>}
                                    </button>
                                </form>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Map Section */}
            {settings.mapUrl && (
                <section className="h-[500px] w-full bg-gray-100 grayscale hover:grayscale-0 transition-all duration-1000">
                    <iframe 
                        title="Location Map"
                        src={settings.mapUrl}
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }} 
                        allowFullScreen="" 
                        loading="lazy" 
                    />
                </section>
            )}
        </div>
    );
};

export default ContactPage;
