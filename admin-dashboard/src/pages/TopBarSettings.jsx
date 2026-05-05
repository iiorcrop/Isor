import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Save, 
    Globe, 
    Phone, 
    MapPin,
    Loader2,
    CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const TopBarSettings = () => {
    const [settings, setSettings] = useState({
        location: '',
        phone: '',
        socialLinks: {
            facebook: '',
            twitter: '',
            linkedin: '',
            youtube: ''
        }
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/topbar');
            setSettings(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            await axios.post('http://localhost:5000/api/topbar', settings);
            setMessage({ type: 'success', text: 'Settings updated successfully!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update settings' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
    );

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Top Bar Settings</h1>
                <p className="text-text-muted mt-2">Manage the dynamic information displayed in the dashboard header.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {/* General Info */}
                <div className="glass p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                        <Globe className="text-primary w-5 h-5" />
                        General Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-muted">Location Display</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input 
                                    type="text"
                                    value={settings.location}
                                    onChange={(e) => setSettings({...settings, location: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
                                    placeholder="e.g. Hyderabad, India"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-muted">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input 
                                    type="text"
                                    value={settings.phone}
                                    onChange={(e) => setSettings({...settings, phone: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
                                    placeholder="e.g. +91 99999 99999"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Links */}
                <div className="glass p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                        <Share2 className="text-accent w-5 h-5" />
                        Social Media Links
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-muted">Facebook URL</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1877F2] font-bold text-xs">F</div>
                                <input 
                                    type="text"
                                    value={settings.socialLinks.facebook}
                                    onChange={(e) => setSettings({
                                        ...settings, 
                                        socialLinks: { ...settings.socialLinks, facebook: e.target.value }
                                    })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
                                    placeholder="https://facebook.com/..."
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-muted">X (Twitter) URL</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white font-bold text-xs italic">X</div>
                                <input 
                                    type="text"
                                    value={settings.socialLinks.twitter}
                                    onChange={(e) => setSettings({
                                        ...settings, 
                                        socialLinks: { ...settings.socialLinks, twitter: e.target.value }
                                    })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
                                    placeholder="https://x.com/..."
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-muted">LinkedIn URL</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0A66C2] font-bold text-xs">in</div>
                                <input 
                                    type="text"
                                    value={settings.socialLinks.linkedin}
                                    onChange={(e) => setSettings({
                                        ...settings, 
                                        socialLinks: { ...settings.socialLinks, linkedin: e.target.value }
                                    })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
                                    placeholder="https://linkedin.com/..."
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-muted">YouTube URL</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FF0000] flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                </div>
                                <input 
                                    type="text"
                                    value={settings.socialLinks.youtube}
                                    onChange={(e) => setSettings({
                                        ...settings, 
                                        socialLinks: { ...settings.socialLinks, youtube: e.target.value }
                                    })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
                                    placeholder="https://youtube.com/..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4">
                    {message.text && (
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${message.type === 'success' ? 'bg-accent/20 text-accent' : 'bg-error/20 text-error'}`}
                        >
                            {message.type === 'success' && <CheckCircle size={18} />}
                            <span className="text-sm font-medium">{message.text}</span>
                        </motion.div>
                    )}
                    <div className="flex-1" />
                    <button 
                        type="submit"
                        disabled={saving}
                        className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

// Mock icon for the form header
const Share2 = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
);

export default TopBarSettings;
