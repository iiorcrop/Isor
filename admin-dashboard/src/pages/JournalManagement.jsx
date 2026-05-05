import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit, FileText, ImageIcon, CheckCircle, XCircle, Save, Loader2 } from 'lucide-react';

const JournalManagement = () => {
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '', year: '', volume: '', issues: 'Issues 1 & 2', articleCount: '', isActive: true
    });
    const [files, setFiles] = useState({ cover: null, pdf: null });

    useEffect(() => {
        fetchJournals();
    }, []);

    const fetchJournals = async () => {
        try {
            const res = await axios.get('/api/journal/admin');
            setJournals(res.data);
            setLoading(false);
        } catch (err) { console.error(err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (files.cover) data.append('cover', files.cover);
        if (files.pdf) data.append('pdf', files.pdf);

        try {
            if (editing) {
                await axios.patch(`/api/journal/${editing._id}`, data);
            } else {
                await axios.post('/api/journal', data);
            }
            fetchJournals();
            setShowForm(false);
            setEditing(null);
            setFormData({ title: '', year: '', volume: '', issues: 'Issues 1 & 2', articleCount: '', isActive: true });
            setFiles({ cover: null, pdf: null });
        } catch (err) { console.error(err); }
    };

    const deleteJournal = async (id) => {
        if (!window.confirm('Delete this volume?')) return;
        try {
            await axios.delete(`/api/journal/${id}`);
            fetchJournals();
        } catch (err) { console.error(err); }
    };

    return (
        <div className="p-8 space-y-8 bg-[#0a0f1d] min-h-screen text-white">
            <div className="flex justify-between items-center bg-[#1e293b] p-8 rounded-[2rem] border border-white/5 shadow-2xl">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-white">Journal Management</h2>
                    <p className="text-white/40 text-sm">Manage JOR volumes, issues, and PDF archives.</p>
                </div>
                <button 
                    onClick={() => { setShowForm(!showForm); setEditing(null); }}
                    className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all"
                >
                    <Plus size={20} /> Add New Volume
                </button>
            </div>

            {showForm && (
                <div className="bg-[#1e293b] p-8 rounded-[2rem] shadow-2xl border border-white/10 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-xl font-bold text-white mb-6">{editing ? 'Edit Volume' : 'New Volume Details'}</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Display Title</label>
                            <input 
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary"
                                placeholder="Vol. 40 (2023)"
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Year</label>
                            <input 
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary"
                                placeholder="2023"
                                value={formData.year}
                                onChange={e => setFormData({...formData, year: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Article Count</label>
                            <input 
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary"
                                placeholder="46 Articles"
                                value={formData.articleCount}
                                onChange={e => setFormData({...formData, articleCount: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Cover Image</label>
                            <input 
                                type="file" 
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs"
                                onChange={e => setFiles({...files, cover: e.target.files[0]})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">PDF Full Text</label>
                            <input 
                                type="file" 
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs"
                                onChange={e => setFiles({...files, pdf: e.target.files[0]})}
                            />
                        </div>
                        <div className="flex items-end">
                            <button className="w-full bg-primary text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                                <Save size={20} /> {editing ? 'Update Volume' : 'Save Volume'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {journals.map(journal => (
                    <div key={journal._id} className="bg-[#1e293b] rounded-[2rem] p-6 shadow-2xl border border-white/5 group hover:border-primary/50 transition-all relative overflow-hidden">
                        <div className={`absolute top-4 right-4 ${journal.isActive ? 'text-accent' : 'text-white/20'}`}>
                            {journal.isActive ? <CheckCircle size={20} /> : <XCircle size={20} />}
                        </div>
                        <div className="w-full aspect-[3/4] bg-black/20 rounded-2xl mb-6 flex items-center justify-center overflow-hidden border border-white/5">
                            {journal.coverImageUrl ? (
                                <img src={`/${journal.coverImageUrl}`} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon size={48} className="text-white/10" />
                            )}
                        </div>
                        <h4 className="text-xl font-bold text-white mb-1">{journal.title}</h4>
                        <p className="text-white/40 text-xs uppercase font-bold mb-4">{journal.articleCount} • {journal.issues}</p>
                        
                        <div className="flex gap-2 pt-4 border-t border-white/5">
                            <button 
                                onClick={() => { setEditing(journal); setFormData(journal); setShowForm(true); }}
                                className="flex-1 bg-white/5 text-white py-3 rounded-xl font-bold hover:bg-primary transition-all flex items-center justify-center gap-2"
                            >
                                <Edit size={16} /> Edit
                            </button>
                            <button 
                                onClick={() => deleteJournal(journal._id)}
                                className="bg-error/10 text-error p-3 rounded-xl hover:bg-error hover:text-white transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {journals.length === 0 && !loading && (
                <div className="text-center py-20 bg-[#1e293b] rounded-[3rem] border border-white/5">
                    <FileText size={64} className="mx-auto text-white/5 mb-4" />
                    <p className="text-white/40 font-medium">No journal volumes found. Start by adding one.</p>
                </div>
            )}
        </div>
    );
};

export default JournalManagement;
