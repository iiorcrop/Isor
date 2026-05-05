import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Plus, 
    Trash2, 
    Image as ImageIcon, 
    Save, 
    X, 
    Loader2, 
    CheckCircle,
    Eye,
    EyeOff,
    ArrowUp,
    ArrowDown,
    Upload,
    ToggleLeft,
    ToggleRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BannerManagement = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        link: '',
        isActive: true,
        image: null,
        preview: ''
    });

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const res = await axios.get('/api/banner');
            setBanners(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch banners', err);
            setLoading(false);
        }
    };

    const handleOpenModal = (banner = null) => {
        if (banner) {
            setEditingBanner(banner);
            setFormData({
                title: banner.title || '',
                subtitle: banner.subtitle || '',
                link: banner.link || '',
                isActive: banner.isActive,
                image: null,
                preview: banner.imageUrl.startsWith('http') ? banner.imageUrl : `/${banner.imageUrl}`
            });
        } else {
            setEditingBanner(null);
            setFormData({
                title: '',
                subtitle: '',
                link: '',
                isActive: true,
                image: null,
                preview: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                image: file,
                preview: URL.createObjectURL(file)
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const data = new FormData();
        data.append('title', formData.title);
        data.append('subtitle', formData.subtitle);
        data.append('link', formData.link);
        data.append('isActive', formData.isActive);
        if (formData.image) data.append('image', formData.image);

        try {
            if (editingBanner) {
                await axios.put(`/api/banner/${editingBanner._id}`, data);
                setMessage('Banner updated successfully!');
            } else {
                await axios.post('/api/banner', data);
                setMessage('Banner added successfully!');
            }
            fetchBanners();
            setIsModalOpen(false);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Error saving banner', err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this banner?')) return;
        try {
            await axios.delete(`/api/banner/${id}`);
            fetchBanners();
            setMessage('Banner deleted.');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Delete failed', err);
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Homepage Banners</h1>
                    <p className="text-text-muted mt-1">Manage the high-impact visual slider on your homepage.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
                >
                    <Plus size={20} />
                    Add Banner
                </button>
            </header>

            {message && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-success/10 text-success p-4 rounded-xl border border-success/20 flex items-center gap-2">
                    <CheckCircle size={18} /> {message}
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banners.map((banner) => (
                    <motion.div 
                        layout
                        key={banner._id}
                        className="bg-[#0f172a] rounded-3xl overflow-hidden border border-white/5 shadow-2xl flex flex-col group"
                    >
                        <div className="relative aspect-video overflow-hidden">
                            <img src={banner.imageUrl.startsWith('http') ? banner.imageUrl : `/${banner.imageUrl}`} alt={banner.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                <div className="flex gap-2 w-full">
                                    <button onClick={() => handleOpenModal(banner)} className="flex-1 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white py-2 rounded-lg font-bold transition-all">Edit</button>
                                    <button onClick={() => handleDelete(banner._id)} className="p-2 bg-danger/20 hover:bg-danger/40 text-danger rounded-lg transition-all"><Trash2 size={20} /></button>
                                </div>
                            </div>
                            {!banner.isActive && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                                    <span className="bg-danger text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase">Inactive</span>
                                </div>
                            )}
                        </div>
                        <div className="p-5 flex-1 space-y-2">
                            <h3 className="text-white font-bold text-lg line-clamp-1">{banner.title || 'No Title'}</h3>
                            <p className="text-white/40 text-sm line-clamp-2">{banner.subtitle || 'No subtitle provided.'}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-2xl bg-[#1e293b] rounded-[2.5rem] p-10 border border-white/10 shadow-2xl overflow-y-auto max-h-[90vh]">
                            <h2 className="text-3xl font-bold text-white mb-8">{editingBanner ? 'Edit Banner' : 'New Banner'}</h2>
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Banner Title</label>
                                            <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-primary outline-none" placeholder="Main headline" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Subtitle / Description</label>
                                            <textarea value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-primary outline-none min-h-[100px]" placeholder="Brief description text" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Button Link (URL)</label>
                                            <input type="text" value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-primary outline-none" placeholder="https://..." />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Banner Image</label>
                                            <div className="relative group aspect-video rounded-3xl overflow-hidden bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-all">
                                                {formData.preview ? (
                                                    <img src={formData.preview} className="w-full h-full object-cover" alt="Preview" />
                                                ) : (
                                                    <div className="flex flex-col items-center text-white/20">
                                                        <Upload size={40} />
                                                        <span className="mt-2 font-bold">Upload Image</span>
                                                    </div>
                                                )}
                                                <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                            </div>
                                            <p className="text-[10px] text-white/20 text-center uppercase tracking-tighter">Recommended: 1920x800 px (JPEG/PNG)</p>
                                        </div>

                                        <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
                                            <span className="text-white font-bold">Active Status</span>
                                            <button type="button" onClick={() => setFormData({...formData, isActive: !formData.isActive})} className={`p-1 rounded-full transition-colors ${formData.isActive ? 'text-success' : 'text-white/20'}`}>
                                                {formData.isActive ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" disabled={saving} className="w-full bg-primary hover:bg-primary-dark text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/20 transition-all disabled:opacity-50">
                                    {saving ? <Loader2 className="animate-spin" /> : <Save />}
                                    {saving ? 'Saving...' : (editingBanner ? 'Update Banner' : 'Publish Banner')}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BannerManagement;
