import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Plus, 
    Trash2, 
    Save, 
    X, 
    Loader2, 
    CheckCircle,
    Eye,
    EyeOff,
    Settings,
    FileText,
    Users,
    Calendar,
    PenTool,
    BookOpen,
    Info,
    Layout,
    ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Available icons for selection
const ICON_OPTIONS = {
    FileText: FileText,
    Users: Users,
    Calendar: Calendar,
    PenTool: PenTool,
    BookOpen: BookOpen,
    Info: Info,
    Layout: Layout,
};

const QuickLinksSettings = () => {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLink, setEditingLink] = useState(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        icon: 'FileText',
        link: '',
        isActive: true,
        order: 0
    });

    useEffect(() => {
        fetchLinks();
    }, []);

    const fetchLinks = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/quicklinks`);
            setLinks(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch links', err);
            setLoading(false);
        }
    };

    const handleOpenModal = (link = null) => {
        if (link) {
            setEditingLink(link);
            setFormData({
                title: link.title,
                icon: link.icon || 'FileText',
                link: link.link || '',
                isActive: link.isActive,
                order: link.order || 0
            });
        } else {
            setEditingLink(null);
            setFormData({
                title: '',
                icon: 'FileText',
                link: '',
                isActive: true,
                order: links.length
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingLink) {
                await axios.put(`${import.meta.env.VITE_API_URL}/quicklinks/${editingLink._id}`, formData);
                setMessage('Link updated successfully!');
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/quicklinks`, formData);
                setMessage('Link added successfully!');
            }
            fetchLinks();
            setIsModalOpen(false);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Error saving link', err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this quick link?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/quicklinks/${id}`);
            fetchLinks();
            setMessage('Link deleted.');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Delete failed', err);
        }
    };

    const toggleStatus = async (link) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/quicklinks/${link._id}`, {
                ...link,
                isActive: !link.isActive
            });
            fetchLinks();
        } catch (err) {
            console.error('Toggle failed', err);
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Quick Links Bar</h1>
                    <p className="text-text-muted mt-1">Manage the feature links displayed below the homepage slider.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all"
                >
                    <Plus size={20} />
                    Add New Link
                </button>
            </header>

            {message && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-success/10 text-success p-4 rounded-xl border border-success/20 flex items-center gap-2">
                    <CheckCircle size={18} /> {message}
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {links.map((link) => {
                    const Icon = ICON_OPTIONS[link.icon] || FileText;
                    return (
                        <motion.div 
                            layout
                            key={link._id}
                            className={`bg-[#0f172a] border ${link.isActive ? 'border-white/5' : 'border-danger/20 opacity-60'} rounded-3xl p-6 flex flex-col gap-4 shadow-xl group relative`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="p-4 bg-primary/10 text-primary rounded-2xl group-hover:scale-110 transition-transform">
                                    <Icon size={32} />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => toggleStatus(link)} className={`p-2 rounded-lg ${link.isActive ? 'text-success' : 'text-white/20'}`}>
                                        {link.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                    <button onClick={() => handleOpenModal(link)} className="p-2 text-white/40 hover:text-white"><Settings size={18} /></button>
                                    <button onClick={() => handleDelete(link._id)} className="p-2 text-danger/40 hover:text-danger"><Trash2 size={18} /></button>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">{link.title}</h3>
                                <p className="text-white/40 text-sm mt-1 flex items-center gap-1">
                                    <ExternalLink size={12} /> {link.link || 'No URL'}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md bg-[#1e293b] rounded-[2rem] p-10 border border-white/10 shadow-2xl">
                            <h2 className="text-2xl font-bold text-white mb-8">{editingLink ? 'Edit Quick Link' : 'New Quick Link'}</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Link Title</label>
                                    <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-primary" placeholder="e.g., Membership" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Select Icon</label>
                                    <div className="grid grid-cols-4 gap-3">
                                        {Object.keys(ICON_OPTIONS).map((key) => {
                                            const IconComp = ICON_OPTIONS[key];
                                            return (
                                                <button 
                                                    key={key}
                                                    type="button"
                                                    onClick={() => setFormData({...formData, icon: key})}
                                                    className={`p-4 rounded-xl flex items-center justify-center border-2 transition-all ${formData.icon === key ? 'border-primary bg-primary/10 text-white' : 'border-white/5 text-white/20 hover:border-white/10'}`}
                                                >
                                                    <IconComp size={24} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Destination URL</label>
                                    <input type="text" value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-primary" placeholder="/membership or https://..." />
                                </div>

                                <div className="flex items-center gap-4 pt-4">
                                    <button type="submit" disabled={saving} className="flex-1 bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                                        {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                        {saving ? 'Saving...' : 'Save Link'}
                                    </button>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-4 rounded-xl bg-white/5 text-white/60 font-bold hover:bg-white/10 transition-all">Cancel</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuickLinksSettings;
