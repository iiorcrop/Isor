import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Mail, Phone, MapPin, Clock, Save, 
    Inbox, Trash2, CheckCircle, Info, 
    Globe, ExternalLink
} from 'lucide-react';

const ContactManagement = () => {
    const [activeTab, setActiveTab] = useState('inbox');
    const [settings, setSettings] = useState(null);
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [settingsRes, inquiriesRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/contact/settings`),
                axios.get(`${import.meta.env.VITE_API_URL}/contact/inquiries`)
            ]);
            setSettings(settingsRes.data);
            setInquiries(inquiriesRes.data);
            setLoading(false);
        } catch (err) { console.error(err); }
    };

    const handleSettingsUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.patch(`${import.meta.env.VITE_API_URL}/contact/settings`, settings);
            setMessage('Settings updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) { console.error(err); }
    };

    const updateInquiryStatus = async (id, status) => {
        try {
            await axios.patch(`${import.meta.env.VITE_API_URL}/contact/inquiry/${id}/status`, { status });
            fetchData();
        } catch (err) { console.error(err); }
    };

    const deleteInquiry = async (id) => {
        if (!window.confirm('Delete this inquiry?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/contact/inquiry/${id}`);
            fetchData();
        } catch (err) { console.error(err); }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-[#064e3b]">Contact Management</h2>
                    <p className="text-gray-500 text-sm">Manage visitor inquiries and organizational contact info.</p>
                </div>
                <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                    <button 
                        onClick={() => setActiveTab('inbox')}
                        className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'inbox' ? 'bg-white text-[#064e3b] shadow-sm' : 'text-gray-500 hover:text-[#064e3b]'}`}
                    >
                        <Inbox size={18} /> Inbox ({inquiries.filter(i => i.status === 'New').length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('settings')}
                        className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'settings' ? 'bg-white text-[#064e3b] shadow-sm' : 'text-gray-500 hover:text-[#064e3b]'}`}
                    >
                        <MapPin size={18} /> Settings
                    </button>
                </div>
            </div>

            {message && (
                <div className="bg-green-100 text-green-700 p-4 rounded-2xl font-bold animate-in fade-in slide-in-from-top-4">
                    {message}
                </div>
            )}

            {activeTab === 'inbox' ? (
                <div className="space-y-4">
                    {inquiries.length === 0 ? (
                        <div className="bg-white p-20 rounded-[2rem] text-center text-gray-400">
                            <Mail size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No inquiries found.</p>
                        </div>
                    ) : (
                        inquiries.map(inq => (
                            <div key={inq._id} className={`bg-white p-6 rounded-3xl border-2 transition-all hover:shadow-lg ${inq.status === 'New' ? 'border-[#064e3b]/10 bg-[#064e3b]/[0.02]' : 'border-transparent opacity-80'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-[#064e3b]/5 flex items-center justify-center text-[#064e3b]">
                                            <Mail size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#064e3b]">{inq.name}</h4>
                                            <p className="text-xs text-gray-500">{inq.email} • {new Date(inq.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {inq.status === 'New' && (
                                            <button 
                                                onClick={() => updateInquiryStatus(inq._id, 'Read')}
                                                className="text-[10px] font-bold uppercase tracking-widest text-[#b47c1c] hover:bg-[#b47c1c]/10 px-3 py-1.5 rounded-lg transition-all"
                                            >
                                                Mark as Read
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => deleteInquiry(inq._id)}
                                            className="text-red-400 hover:bg-red-50 p-2 rounded-xl transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="ml-16">
                                    <div className="text-xs font-bold text-[#b47c1c] uppercase tracking-tighter mb-1">Subject: {inq.subject}</div>
                                    <p className="text-gray-600 text-sm leading-relaxed">{inq.message}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <form onSubmit={handleSettingsUpdate} className="lg:col-span-8 bg-white p-8 rounded-[2rem] shadow-sm space-y-6">
                        <h3 className="text-xl font-bold text-[#064e3b] mb-4">Company Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Official Email</label>
                                <input 
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4"
                                    value={settings.email}
                                    onChange={e => setSettings({...settings, email: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
                                <input 
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4"
                                    value={settings.phone}
                                    onChange={e => setSettings({...settings, phone: e.target.value})}
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Address</label>
                                <textarea 
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 h-24"
                                    value={settings.address}
                                    onChange={e => setSettings({...settings, address: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Working Hours</label>
                                <input 
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4"
                                    value={settings.workingHours}
                                    onChange={e => setSettings({...settings, workingHours: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Google Map Embed URL</label>
                                <input 
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4"
                                    placeholder="https://www.google.com/maps/embed?pb=..."
                                    value={settings.mapUrl}
                                    onChange={e => setSettings({...settings, mapUrl: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="pt-6">
                            <button className="bg-[#064e3b] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-[#04392b] transition-all">
                                <Save size={20} /> Save Changes
                            </button>
                        </div>
                    </form>

                    <div className="lg:col-span-4 bg-[#064e3b] p-8 rounded-[2rem] text-white space-y-8">
                        <div>
                            <h3 className="text-xl font-bold mb-2">Social Media</h3>
                            <p className="text-white/60 text-xs">Update your social profiles.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl group hover:bg-white/10 transition-all">
                                <Globe className="text-white/40 group-hover:text-white" />
                                <input 
                                    className="bg-transparent border-none text-sm w-full focus:outline-none"
                                    placeholder="Facebook URL"
                                    value={settings.socialLinks?.facebook || ''}
                                    onChange={e => setSettings({...settings, socialLinks: {...settings.socialLinks, facebook: e.target.value}})}
                                />
                            </div>
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl group hover:bg-white/10 transition-all">
                                <Globe className="text-white/40 group-hover:text-white" />
                                <input 
                                    className="bg-transparent border-none text-sm w-full focus:outline-none"
                                    placeholder="Twitter URL"
                                    value={settings.socialLinks?.twitter || ''}
                                    onChange={e => setSettings({...settings, socialLinks: {...settings.socialLinks, twitter: e.target.value}})}
                                />
                            </div>
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl group hover:bg-white/10 transition-all">
                                <Globe className="text-white/40 group-hover:text-white" />
                                <input 
                                    className="bg-transparent border-none text-sm w-full focus:outline-none"
                                    placeholder="LinkedIn URL"
                                    value={settings.socialLinks?.linkedin || ''}
                                    onChange={e => setSettings({...settings, socialLinks: {...settings.socialLinks, linkedin: e.target.value}})}
                                />
                            </div>
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl group hover:bg-white/10 transition-all">
                                <Globe className="text-white/40 group-hover:text-white" />
                                <input 
                                    className="bg-transparent border-none text-sm w-full focus:outline-none"
                                    placeholder="YouTube URL"
                                    value={settings.socialLinks?.youtube || ''}
                                    onChange={e => setSettings({...settings, socialLinks: {...settings.socialLinks, youtube: e.target.value}})}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactManagement;
