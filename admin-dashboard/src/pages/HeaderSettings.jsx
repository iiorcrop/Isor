import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Save, 
    Type, 
    Image as ImageIcon,
    Info,
    Loader2,
    CheckCircle,
    Upload
} from 'lucide-react';
import { motion } from 'framer-motion';

const HeaderSettings = () => {
    const [settings, setSettings] = useState({
        title: '',
        subTitle: '',
        tagline: '',
        affiliationText: '',
        estdText: '',
        journalTitle: '',
        journalScore: '',
        logoUrl: ''
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/header`);
            setSettings(res.data);
            if (res.data.logoUrl) {
                setLogoPreview(res.data.logoUrl);
            }
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch header settings', err);
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        const formData = new FormData();
        Object.keys(settings).forEach(key => {
            if (key !== 'logoUrl') {
                formData.append(key, settings[key]);
            }
        });
        if (logoFile) {
            formData.append('logo', logoFile);
        }

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/header`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSettings(res.data);
            setMessage('Settings updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Failed to save header settings', err);
            setMessage('Error saving settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Header Management</h1>
                    <p className="text-text-muted mt-1">Configure your website's primary identity and logo.</p>
                </div>
                {message && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-success/10 text-success px-4 py-2 rounded-xl flex items-center gap-2 border border-success/20"
                    >
                        <CheckCircle size={18} />
                        {message}
                    </motion.div>
                )}
            </header>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo & Identity Section */}
                <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 space-y-6">
                    <div className="flex items-center gap-2 text-primary font-bold">
                        <ImageIcon size={20} />
                        <h2>Logo & Identity</h2>
                    </div>
                    
                    <div className="space-y-4">
                        {/* Logo Upload */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-muted text-white">Society Logo</label>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon size={24} className="text-white/20" />
                                    )}
                                </div>
                                <label className="flex-1">
                                    <div className="bg-white/5 border border-dashed border-white/20 rounded-xl py-4 px-4 text-center cursor-pointer hover:bg-white/10 transition-colors">
                                        <Upload size={18} className="mx-auto mb-1 text-primary" />
                                        <span className="text-xs text-white/60">Click to upload new logo</span>
                                        <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-2 text-white">
                            <label className="text-sm font-medium text-text-muted ">Society Name (Title)</label>
                            <input 
                                type="text"
                                value={settings.title}
                                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-colors"
                                placeholder="e.g. Indian Society of Oilseeds Research"
                            />
                        </div>
                        <div className="space-y-2 text-white">
                            <label className="text-sm font-medium text-text-muted ">Sub-title (Location/Address)</label>
                            <textarea 
                                value={settings.subTitle}
                                onChange={(e) => setSettings({ ...settings, subTitle: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-colors min-h-[80px]"
                                placeholder="e.g. ICAR-Directorate of Oilseeds Research..."
                            />
                        </div>
                        <div className="space-y-2 text-white">
                            <label className="text-sm font-medium text-text-muted ">Tagline</label>
                            <input 
                                type="text"
                                value={settings.tagline}
                                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-[#fbbf24] font-medium focus:outline-none focus:border-primary transition-colors"
                                placeholder="e.g. ISOR — Promoting Oilseeds Research..."
                            />
                        </div>
                    </div>
                </div>

                {/* Affiliations & Journal Section */}
                <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 space-y-6">
                    <div className="flex items-center gap-2 text-accent font-bold">
                        <Info size={20} />
                        <h2>Affiliations & Journal</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2 text-white">
                            <label className="text-sm font-medium text-text-muted ">Affiliation Text</label>
                            <input 
                                type="text"
                                value={settings.affiliationText}
                                onChange={(e) => setSettings({ ...settings, affiliationText: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-colors"
                                placeholder="e.g. An ICAR Affiliated Society"
                            />
                        </div>
                        <div className="space-y-2 text-white">
                            <label className="text-sm font-medium text-text-muted ">Establishment Details</label>
                            <input 
                                type="text"
                                value={settings.estdText}
                                onChange={(e) => setSettings({ ...settings, estdText: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-colors"
                                placeholder="e.g. Estd. 1984 | Regd. No. 823/84"
                            />
                        </div>
                        <hr className="border-white/5 my-4" />
                        <div className="space-y-2 text-white">
                            <label className="text-sm font-medium text-text-muted ">Journal Title</label>
                            <input 
                                type="text"
                                value={settings.journalTitle}
                                onChange={(e) => setSettings({ ...settings, journalTitle: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-colors font-semibold"
                                placeholder="e.g. Journal of Oilseeds Research"
                            />
                        </div>
                        <div className="space-y-2 text-white">
                            <label className="text-sm font-medium text-text-muted ">Journal Score/Listing</label>
                            <input 
                                type="text"
                                value={settings.journalScore}
                                onChange={(e) => setSettings({ ...settings, journalScore: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-colors"
                                placeholder="e.g. UGC-CARE Listed | NAAS Score: 7.16"
                            />
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 flex justify-end">
                    <button 
                        type="submit"
                        disabled={saving}
                        className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                    >
                        {saving ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <Save size={20} />
                        )}
                        {saving ? 'Saving...' : 'Save Header Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default HeaderSettings;
