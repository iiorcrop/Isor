import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Loader2, FileText, Globe, Search, Plus, Eye, Edit, Trash2, CheckCircle } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const PageManagement = () => {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [editingPage, setEditingPage] = useState(null);
    const [formData, setFormData] = useState({ slug: '', title: '', content: '' });
    const [previewMode, setPreviewMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/pages`);
            setPages(res.data || []);
            setLoading(false);
        } catch (err) { 
            console.error(err); 
            setLoading(false);
        }
    };

    const handleEdit = async (page) => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/pages/${page.slug}`);
            setEditingPage(res.data);
            setFormData(res.data);
            setLoading(false);
        } catch (err) { 
            console.error(err); 
            setLoading(false); 
        }
    };

    const deletePage = async (id) => {
        if (!window.confirm('Are you sure you want to delete this page?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/pages/${id}`);
            fetchPages();
        } catch (err) { console.error(err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/pages`, formData);
            await fetchPages();
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setEditingPage(null);
            }, 1500);
        } catch (err) { 
            console.error(err); 
            const errorMsg = err.response?.data?.message || 'Failed to save page';
            alert(`Error: ${errorMsg}`);
        }
        finally { setSaving(false); }
    };

    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image', 'video'],
            ['clean'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }]
        ],
    };

    const quillFormats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image', 'video',
        'color', 'background', 'align'
    ];

    const filteredPages = pages.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && !editingPage) return (
        <div className="flex items-center justify-center min-h-screen bg-[#0a0f1d]">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
    );

    return (
        <div className="p-8 space-y-8 bg-[#0a0f1d] min-h-screen text-white">
            <style>{`
                .ql-container { font-size: 16px; min-height: 400px; border-bottom-left-radius: 1.5rem; border-bottom-right-radius: 1.5rem; background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1) !important; }
                .ql-toolbar { background: #1e293b; border-top-left-radius: 1.5rem; border-top-right-radius: 1.5rem; border: 1px solid rgba(255,255,255,0.1) !important; }
                .ql-editor { min-height: 400px; }
                .ql-snow.ql-toolbar button { color: #fff !important; }
                .ql-snow .ql-stroke { stroke: #fff !important; }
                .ql-snow .ql-fill { fill: #fff !important; }
                .ql-snow .ql-picker { color: #fff !important; }
                .ql-snow .ql-picker-options { background-color: #1e293b !important; color: #fff !important; }
            `}</style>

            <div className="flex justify-between items-center bg-[#1e293b] p-8 rounded-[2rem] border border-white/5 shadow-2xl">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-white">Page Content Manager</h2>
                    <p className="text-white/40 text-sm">Rich text editor for dynamic site pages.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                        <input 
                            className="bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary w-64"
                            placeholder="Search pages..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => { setEditingPage({ isNew: true }); setFormData({ slug: '', title: '', content: '' }); }}
                        className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all"
                    >
                        <Plus size={20} /> Create Page
                    </button>
                </div>
            </div>

            {editingPage ? (
                <div className="bg-[#1e293b] p-8 rounded-[2rem] border border-white/10 shadow-2xl space-y-6">
                    <div className="flex justify-between items-center pb-6 border-b border-white/5">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setEditingPage(null)} className="text-white/40 hover:text-white transition-colors">
                                ← Back to List
                            </button>
                            <h3 className="text-xl font-bold">
                                {editingPage.isNew ? 'New Page' : `Editing: ${editingPage.title}`}
                            </h3>
                        </div>
                        {success && (
                            <div className="flex items-center gap-2 text-accent bg-accent/10 px-4 py-2 rounded-xl border border-accent/20 animate-in fade-in slide-in-from-right-4">
                                <CheckCircle size={18} />
                                <span className="font-bold text-sm">Saved Successfully!</span>
                            </div>
                        )}
                        <div className="flex bg-white/5 p-1 rounded-xl">
                            <button 
                                onClick={() => setPreviewMode(false)}
                                className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${!previewMode ? 'bg-primary text-white shadow-lg' : 'text-white/40'}`}
                            >
                                <Edit size={14} /> Editor
                            </button>
                            <button 
                                onClick={() => setPreviewMode(true)}
                                className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${previewMode ? 'bg-primary text-white shadow-lg' : 'text-white/40'}`}
                            >
                                <Eye size={14} /> Preview
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Page Title</label>
                                <input 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary"
                                    placeholder="e.g., About ISOR"
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Page URL (Slug)</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-white/20 text-xs">isor.org.in/page/</span>
                                    <input 
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary"
                                        placeholder="about-isor"
                                        value={formData.slug}
                                        onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                                        disabled={!editingPage.isNew}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {!previewMode ? (
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Page Content</label>
                                <ReactQuill 
                                    theme="snow"
                                    value={formData.content}
                                    onChange={(content) => setFormData({...formData, content})}
                                    modules={quillModules}
                                    formats={quillFormats}
                                />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Live Preview</label>
                                <div className="w-full bg-white p-12 rounded-[2.5rem] text-gray-800 min-h-[500px] overflow-y-auto">
                                    <h1 className="text-4xl font-serif font-bold text-[#1a4d2e] mb-8 pb-4 border-b border-gray-100">{formData.title}</h1>
                                    <div 
                                        className="prose prose-lg max-w-none prose-slate prose-headings:text-[#1a4d2e] prose-p:text-gray-700 prose-p:leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: formData.content }} 
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-4 pt-6">
                            <button 
                                type="button"
                                onClick={() => setEditingPage(null)}
                                className="px-8 py-4 rounded-xl font-bold text-white/40 hover:bg-white/5 transition-all"
                            >
                                Cancel
                            </button>
                            <button className="bg-primary text-white px-10 py-4 rounded-xl font-bold flex items-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-primary/20">
                                {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                Save Page Content
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPages.map(page => (
                        <div key={page._id} className="bg-[#1e293b] p-8 rounded-[2rem] border border-white/5 hover:border-primary/50 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                    <FileText size={24} />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <a 
                                        href={`/page/${page.slug}`} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="p-2 bg-white/5 hover:bg-accent rounded-lg transition-all text-white"
                                    >
                                        <Eye size={16} />
                                    </a>
                                    <button 
                                        onClick={() => handleEdit(page)}
                                        className="p-2 bg-white/5 hover:bg-primary rounded-lg transition-all text-white"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button 
                                        onClick={() => deletePage(page._id)}
                                        className="p-2 bg-white/5 hover:bg-error rounded-lg transition-all text-white"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <h4 className="text-xl font-bold mb-1">{page.title}</h4>
                            <p className="text-white/20 text-xs font-mono mb-4">/page/{page.slug}</p>
                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <span className="text-[10px] text-white/20 uppercase tracking-widest">
                                    Updated: {new Date(page.updatedAt).toLocaleDateString()}
                                </span>
                                <div className="flex items-center gap-1 text-primary text-xs">
                                    Active <Globe size={12} />
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredPages.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-[#1e293b] rounded-[3rem] border border-white/5">
                            <FileText size={48} className="mx-auto text-white/5 mb-4" />
                            <p className="text-white/20">No pages found matching your search.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PageManagement;
