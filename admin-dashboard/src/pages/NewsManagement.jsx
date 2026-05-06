import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Plus, 
    Trash2, 
    Save, 
    FileText, 
    Link as LinkIcon, 
    ToggleLeft, 
    ToggleRight, 
    Loader2,
    CheckCircle,
    X,
    Eye,
    EyeOff,
    Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NewsManagement = () => {
    const [newsItems, setNewsItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        text: '',
        link: '',
        isPdf: false,
        isActive: true,
        isNewItem: false,
        pdf: null
    });

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/news/admin`);
            setNewsItems(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch news', err);
            setLoading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                text: item.text,
                link: item.link || '',
                isPdf: item.isPdf || false,
                isActive: item.isActive,
                isNewItem: item.isNewItem || false,
                pdf: null
            });
        } else {
            setEditingItem(null);
            setFormData({
                text: '',
                link: '',
                isPdf: false,
                isActive: true,
                isNewItem: false,
                pdf: null
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, pdf: e.target.files[0], isPdf: true });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const data = new FormData();
        data.append('text', formData.text);
        data.append('link', formData.link);
        data.append('isPdf', formData.isPdf);
        data.append('isActive', formData.isActive);
        data.append('isNewItem', formData.isNewItem);
        if (formData.pdf) data.append('pdf', formData.pdf);

        try {
            if (editingItem) {
                await axios.put(`${import.meta.env.VITE_API_URL}/news/${editingItem._id}`, data);
                setMessage('News updated successfully!');
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/news`, data);
                setMessage('News added successfully!');
            }
            fetchNews();
            handleCloseModal();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Failed to save news', err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this news item?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/news/${id}`);
            fetchNews();
            setMessage('News deleted!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Failed to delete', err);
        }
    };

    const toggleStatus = async (item) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/news/${item._id}`, {
                ...item,
                isActive: !item.isActive
            });
            fetchNews();
        } catch (err) {
            console.error('Failed to toggle status', err);
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Flash News Management</h1>
                    <p className="text-text-muted mt-1">Create and manage scrolling news items with PDF support.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
                >
                    <Plus size={20} />
                    Add New News
                </button>
            </header>

            {message && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-success/10 text-success p-4 rounded-xl flex items-center gap-2 border border-success/20"
                >
                    <CheckCircle size={18} />
                    {message}
                </motion.div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {newsItems.map((item) => (
                    <motion.div 
                        layout
                        key={item._id}
                        className={`bg-[#0f172a] border ${item.isActive ? 'border-white/5' : 'border-danger/20 opacity-60'} rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl transition-all`}
                    >
                        <div className="flex items-center gap-4 flex-1">
                            <div className={`p-3 rounded-xl ${item.isPdf ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'}`}>
                                {item.isPdf ? <FileText size={24} /> : <LinkIcon size={24} />}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white line-clamp-1">{item.text}</h3>
                                <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                                    <span className="flex items-center gap-1">
                                        {item.isActive ? <Eye size={12} className="text-success" /> : <EyeOff size={12} className="text-danger" />}
                                        {item.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    {item.isPdf && <span className="bg-white/5 px-2 py-0.5 rounded italic">PDF Attached</span>}
                                    {item.isNewItem && <span className="text-accent font-bold">LATEST</span>}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-white/5">
                            <button 
                                onClick={() => toggleStatus(item)}
                                className={`p-2.5 rounded-xl transition-colors ${item.isActive ? 'bg-danger/10 text-danger hover:bg-danger/20' : 'bg-success/10 text-success hover:bg-success/20'}`}
                                title={item.isActive ? 'Deactivate' : 'Activate'}
                            >
                                {item.isActive ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                            <button 
                                onClick={() => handleOpenModal(item)}
                                className="p-2.5 bg-white/5 text-white hover:bg-white/10 rounded-xl transition-colors"
                            >
                                <Save size={20} className="text-white/40" />
                            </button>
                            <button 
                                onClick={() => handleDelete(item._id)}
                                className="p-2.5 bg-danger/10 text-danger hover:bg-danger/20 rounded-xl transition-colors"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCloseModal}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-lg bg-[#1e293b] rounded-3xl p-8 shadow-2xl border border-white/10"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">{editingItem ? 'Edit News' : 'New News Item'}</h2>
                                <button onClick={handleCloseModal} className="text-white/40 hover:text-white"><X size={24} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-white/60">News Text</label>
                                    <textarea 
                                        required
                                        value={formData.text}
                                        onChange={(e) => setFormData({...formData, text: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-primary focus:outline-none min-h-[100px]"
                                        placeholder="Enter scrolling news text..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                                        <input 
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                            className="w-5 h-5 accent-primary"
                                        />
                                        <span className="text-white font-medium">Active</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                                        <input 
                                            type="checkbox"
                                            checked={formData.isNewItem}
                                            onChange={(e) => setFormData({...formData, isNewItem: e.target.checked})}
                                            className="w-5 h-5 accent-accent"
                                        />
                                        <span className="text-white font-medium">LATEST Badge</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-white/60">Attachment Type</label>
                                    <div className="flex gap-4">
                                        <button 
                                            type="button"
                                            onClick={() => setFormData({...formData, isPdf: false})}
                                            className={`flex-1 py-3 rounded-xl border-2 transition-all ${!formData.isPdf ? 'border-primary bg-primary/10 text-white' : 'border-white/5 text-white/40'}`}
                                        >
                                            Link / URL
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setFormData({...formData, isPdf: true})}
                                            className={`flex-1 py-3 rounded-xl border-2 transition-all ${formData.isPdf ? 'border-accent bg-accent/10 text-white' : 'border-white/5 text-white/40'}`}
                                        >
                                            PDF File
                                        </button>
                                    </div>

                                    {formData.isPdf ? (
                                        <div className="relative">
                                            <input 
                                                type="file"
                                                accept=".pdf"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                id="pdf-upload"
                                            />
                                            <label 
                                                htmlFor="pdf-upload"
                                                className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/10 rounded-2xl hover:border-accent/50 hover:bg-accent/5 cursor-pointer transition-all group"
                                            >
                                                <Upload size={32} className="text-white/20 group-hover:text-accent mb-2" />
                                                <span className="text-white font-medium">
                                                    {formData.pdf ? formData.pdf.name : 'Click to upload PDF'}
                                                </span>
                                                <span className="text-xs text-white/40 mt-1">Maximum size 10MB</span>
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <LinkIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                            <input 
                                                type="text"
                                                value={formData.link}
                                                onChange={(e) => setFormData({...formData, link: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-primary focus:outline-none"
                                                placeholder="https://example.com/news-page"
                                            />
                                        </div>
                                    )}
                                </div>

                                <button 
                                    type="submit"
                                    disabled={saving}
                                    className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                >
                                    {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                    {saving ? 'Saving...' : (editingItem ? 'Update News' : 'Add News')}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NewsManagement;
