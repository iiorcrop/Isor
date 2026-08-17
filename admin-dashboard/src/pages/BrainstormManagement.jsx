import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getServerUrl } from '../utils/urlHelper';
import { uploadToStorageServer } from '../utils/fileUploader';
import { Plus, Trash2, Edit, FileText, Upload, Save, Loader2, Download, ExternalLink } from 'lucide-react';

const BrainstormManagement = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '', description: '', date: '', pdfUrl: '', isSecure: false
    });
    const [pdfFile, setPdfFile] = useState(null);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/brainstorm`);
            setSessions(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let pdfUrl = formData.pdfUrl || (editing ? editing.pdfUrl : '');
            if (pdfFile) {
                pdfUrl = await uploadToStorageServer(pdfFile);
            }
            if (!pdfUrl) {
                alert('Please upload a PDF file or enter a PDF URL');
                setLoading(false);
                return;
            }

            const payload = {
                title: formData.title,
                description: formData.description || '',
                date: formData.date || undefined,
                pdfUrl: pdfUrl,
                isSecure: formData.isSecure || false
            };

            if (editing) {
                await axios.patch(`${import.meta.env.VITE_API_URL}/brainstorm/${editing._id}`, payload);
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/brainstorm`, payload);
            }
            fetchSessions();
            setShowForm(false);
            setEditing(null);
            setFormData({ title: '', description: '', date: '', pdfUrl: '', isSecure: false });
            setPdfFile(null);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to save brainstorm session');
        } finally {
            setLoading(false);
        }
    };

    const deleteSession = async (id) => {
        if (!window.confirm('Delete this brainstorm session PDF resource?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/brainstorm/${id}`);
            fetchSessions();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-[#0a0f1d] min-h-screen text-white">
            <div className="flex justify-between items-center bg-[#1e293b] p-8 rounded-[2rem] border border-white/5 shadow-2xl">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-white">Brainstorm Sessions (Downloads)</h2>
                    <p className="text-white/40 text-sm">Upload and manage brainstorming session PDFs displayed on the public Downloads page.</p>
                </div>
                <button 
                    onClick={() => { setShowForm(!showForm); setEditing(null); setFormData({ title: '', description: '', date: '', pdfUrl: '' }); setPdfFile(null); }}
                    className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all"
                >
                    <Plus size={20} /> Add Brainstorm PDF
                </button>
            </div>

            {showForm && (
                <div className="bg-[#1e293b] p-8 rounded-[2rem] shadow-2xl border border-white/10 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-xl font-bold text-white mb-6">{editing ? 'Edit Brainstorm PDF Details' : 'New Brainstorm Session PDF'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Document Title</label>
                                <input 
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary"
                                    placeholder="e.g., Brainstorming Session on Oilseed Production 2025"
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Session Date</label>
                                <input 
                                    type="date"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary"
                                    value={formData.date ? formData.date.split('T')[0] : ''}
                                    onChange={e => setFormData({...formData, date: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Summary / Description</label>
                            <textarea 
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary h-28"
                                placeholder="Brief overview of key recommendations and proceedings..."
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Upload PDF File</label>
                            <div className="border-2 border-dashed border-white/10 rounded-[2rem] p-8 text-center hover:border-primary/50 transition-all cursor-pointer relative">
                                <input 
                                    type="file" 
                                    accept="application/pdf"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={e => setPdfFile(e.target.files[0])}
                                />
                                <Upload size={44} className="mx-auto text-white/20 mb-3" />
                                <p className="text-white/70 font-semibold">{pdfFile ? pdfFile.name : 'Click or Drag & Drop PDF file to upload'}</p>
                                <p className="text-white/30 text-xs mt-1">Supports .pdf files up to 1GB</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                            <input 
                                type="checkbox"
                                id="isSecureCheckbox"
                                checked={formData.isSecure || false}
                                onChange={e => setFormData({ ...formData, isSecure: e.target.checked })}
                                className="w-5 h-5 accent-primary rounded cursor-pointer"
                            />
                            <label htmlFor="isSecureCheckbox" className="text-sm font-semibold text-white cursor-pointer flex flex-col">
                                <span>Secure PDF (Restrict to first 2 pages preview)</span>
                                <span className="text-xs text-white/50 font-normal">When checked, non-members can only preview the first 2 pages. When unchecked, full PDF is displayed.</span>
                            </label>
                        </div>

                        <div className="flex justify-end gap-4">
                            <button 
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-8 py-4 rounded-xl font-bold text-white/60 hover:bg-white/5 transition-all"
                            >
                                Cancel
                            </button>
                            <button className="bg-primary text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                                {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                {editing ? 'Update PDF' : 'Save PDF Document'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.map(session => (
                    <div key={session._id} className="bg-[#1e293b] rounded-[2rem] p-6 shadow-2xl border border-white/5 flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all">
                        <div className="space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="bg-primary/10 text-primary p-3 rounded-2xl">
                                    <FileText size={24} />
                                </div>
                                {session.date && (
                                    <span className="text-xs text-white/40">{new Date(session.date).toLocaleDateString()}</span>
                                )}
                            </div>
                            <h4 className="text-lg font-bold text-white leading-snug">{session.title}</h4>
                            {session.description && (
                                <p className="text-white/60 text-xs line-clamp-3">{session.description}</p>
                            )}
                        </div>

                        <div className="pt-4 border-t border-white/5 flex items-center gap-2">
                            <a 
                                href={getServerUrl(session.pdfUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-white/5 text-white/80 hover:text-white py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                            >
                                <Download size={14} /> View / Download PDF
                            </a>
                            <button 
                                onClick={() => { setEditing(session); setFormData({ ...session, isSecure: session.isSecure || (session.pdfUrl && session.pdfUrl.includes('secure=1')) || false }); setShowForm(true); }}
                                className="bg-white/5 text-white p-2.5 rounded-xl hover:bg-primary transition-all"
                            >
                                <Edit size={14} />
                            </button>
                            <button 
                                onClick={() => deleteSession(session._id)}
                                className="bg-error/10 text-error p-2.5 rounded-xl hover:bg-error hover:text-white transition-all"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {sessions.length === 0 && !loading && (
                <div className="text-center py-20 bg-[#1e293b] rounded-[3rem] border border-white/5">
                    <FileText size={64} className="mx-auto text-white/5 mb-4" />
                    <p className="text-white/40 font-medium">No brainstorm PDFs uploaded yet. Click above to add one.</p>
                </div>
            )}
        </div>
    );
};

export default BrainstormManagement;
