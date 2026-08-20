import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FileText, 
    Upload, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    AlertCircle, 
    FileCheck, 
    Send, 
    Loader2, 
    History, 
    RefreshCw, 
    Eye, 
    ArrowLeft,
    BookOpen,
    UserCheck,
    MessageSquare,
    ChevronRight,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { getServerUrl } from '../utils/urlHelper';
import { uploadFileToStorage } from '../utils/fileUploader';

const SubmitManuscript = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [manuscripts, setManuscripts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Submission form state
    const [formData, setFormData] = useState({
        title: '',
        description: ''
    });
    const [pdfFile, setPdfFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState('');
    const [errMsg, setErrMsg] = useState('');

    // Resubmission / Revision modal state
    const [resubmitTarget, setResubmitTarget] = useState(null);
    const [revisionNotes, setRevisionNotes] = useState('');
    const [revisionPdf, setRevisionPdf] = useState(null);

    // Audit History Modal state
    const [historyModalTarget, setHistoryModalTarget] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('userToken') || localStorage.getItem('memberToken');
        const storedUser = localStorage.getItem('userData') || localStorage.getItem('memberData');

        if (!storedToken || !storedUser) {
            // Unauthenticated user -> redirect to auth page
            navigate('/user/login?redirect=/submit-manuscript');
            return;
        }

        try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setToken(storedToken);
            fetchMyManuscripts(storedToken);
        } catch (e) {
            navigate('/user/login');
        }
    }, [navigate]);

    const fetchMyManuscripts = async (authToken) => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/manuscript/my`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setManuscripts(res.data || []);
        } catch (err) {
            console.error('Failed to load manuscripts', err);
        } finally {
            setLoading(false);
        }
    };

    const handleNewSubmission = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMsg('');
        setErrMsg('');

        if (!pdfFile) {
            setErrMsg('Please select a PDF file for your manuscript.');
            setSubmitting(false);
            return;
        }

        try {
            // Step 1: Upload file directly to remote file storage API
            const pdfKey = await uploadFileToStorage(pdfFile);

            // Step 2: Send manuscript metadata & file key to backend
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/manuscript/submit`, {
                title: formData.title,
                description: formData.description,
                pdfUrl: pdfKey
            }, {
                headers: { 
                    Authorization: `Bearer ${token}`
                }
            });

            setMsg(res.data.message || 'Manuscript submitted successfully!');
            setFormData({ title: '', description: '' });
            setPdfFile(null);
            fetchMyManuscripts(token);
        } catch (err) {
            setErrMsg(err.response?.data?.message || err.message || 'Failed to submit manuscript. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleResubmit = async (e) => {
        e.preventDefault();
        if (!resubmitTarget) return;

        setSubmitting(true);
        setErrMsg('');

        try {
            let pdfKey = resubmitTarget.pdfUrl;
            if (revisionPdf) {
                pdfKey = await uploadFileToStorage(revisionPdf);
            }

            await axios.put(`${import.meta.env.VITE_API_URL}/manuscript/resubmit/${resubmitTarget._id}`, {
                title: resubmitTarget.title,
                description: resubmitTarget.description,
                resubmissionNotes: revisionNotes,
                pdfUrl: pdfKey
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Revised manuscript resubmitted successfully!');
            setResubmitTarget(null);
            setRevisionNotes('');
            setRevisionPdf(null);
            fetchMyManuscripts(token);
        } catch (err) {
            alert(err.response?.data?.message || err.message || 'Failed to resubmit manuscript.');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Pending Editor Review':
            case 'Resubmitted':
                return { label: status, color: 'bg-amber-100 text-amber-800 border-amber-300', icon: Clock };
            case 'Approved by Editor':
                return { label: 'Passed Editor Screening (In Peer Review)', color: 'bg-[#064e3b]/10 text-[#064e3b] border-[#064e3b]/20', icon: FileCheck };
            case 'Approved by Reviewer':
                return { label: 'Approved & Accepted for Publication', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle2 };
            case 'Rejected by Editor':
                return { label: 'Revision Required (Editor Feedback)', color: 'bg-rose-100 text-rose-800 border-rose-300', icon: XCircle };
            case 'Rejected by Reviewer':
                return { label: 'Revision Required (Peer Review Feedback)', color: 'bg-rose-100 text-rose-800 border-rose-300', icon: AlertCircle };
            default:
                return { label: status, color: 'bg-gray-100 text-gray-800 border-gray-300', icon: Clock };
        }
    };

    return (
        <div className="min-h-screen bg-[#fff9f0] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-10">

                {/* Hero Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-[#064e3b] via-[#04392b] to-[#1e703c] rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8"
                >
                    <div className="space-y-3 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#b47c1c]/20 border border-[#b47c1c]/30 text-[#fbbf24] text-xs font-bold uppercase tracking-widest">
                            <BookOpen size={14} /> Journal of Oilseeds Research
                        </div>
                        <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight">
                            Submit Manuscript
                        </h1>
                        <p className="text-white/80 text-xs md:text-sm font-light leading-relaxed">
                            Submit original research papers, short communications, and reviews. Track editor evaluations, peer review status, and resubmit revised manuscripts.
                        </p>
                    </div>

                    <div className="w-24 h-24 rounded-3xl bg-[#fbbf24] text-[#064e3b] flex items-center justify-center shadow-xl border-4 border-white/20 shrink-0 rotate-2">
                        <FileText size={44} />
                    </div>
                </motion.div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left 2 Columns: Submission Form */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-[#064e3b]/5 space-y-6">
                            <div className="border-b border-gray-100 pb-4">
                                <h2 className="text-2xl font-serif font-bold text-[#064e3b] flex items-center gap-3">
                                    <Send size={24} className="text-[#b47c1c]" /> Submit New Manuscript
                                </h2>
                                <p className="text-gray-500 text-xs mt-1">Please fill in your manuscript title, abstract, and upload the complete PDF.</p>
                            </div>

                            {msg && (
                                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl text-xs font-bold border border-emerald-200 flex items-center gap-2">
                                    <CheckCircle2 size={18} className="text-emerald-600" /> {msg}
                                </div>
                            )}

                            {errMsg && (
                                <div className="bg-rose-50 text-rose-700 p-4 rounded-2xl text-xs font-bold border border-rose-200 flex items-center gap-2">
                                    <AlertCircle size={18} className="text-rose-600" /> {errMsg}
                                </div>
                            )}

                            <form onSubmit={handleNewSubmission} className="space-y-6">
                                {/* Title */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block">
                                        Manuscript Title <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="e.g. Assessment of Genetic Diversity in Indian Mustard (Brassica juncea L.)"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs font-medium focus:outline-none focus:border-[#064e3b] focus:bg-white transition-all"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                {/* Abstract / Description */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block">
                                        Abstract / Detailed Summary <span className="text-red-500">*</span>
                                    </label>
                                    <textarea 
                                        required
                                        rows={6}
                                        placeholder="Provide the abstract including background, methodology, results, and conclusion..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs font-medium focus:outline-none focus:border-[#064e3b] focus:bg-white transition-all"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                {/* PDF File Upload */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block">
                                        Upload Complete Manuscript (PDF Only) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-[#064e3b] transition-colors bg-gray-50/50">
                                        <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                                        <input 
                                            required
                                            type="file" 
                                            accept=".pdf"
                                            id="pdf-upload-input"
                                            className="hidden"
                                            onChange={e => setPdfFile(e.target.files[0])}
                                        />
                                        <label 
                                            htmlFor="pdf-upload-input"
                                            className="px-5 py-2.5 bg-[#064e3b] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[#04392b] inline-block transition-all shadow-md"
                                        >
                                            {pdfFile ? 'Change Selected PDF' : 'Browse Manuscript PDF File'}
                                        </label>
                                        {pdfFile && (
                                            <p className="text-xs text-emerald-700 font-bold mt-3 flex items-center justify-center gap-1">
                                                <FileCheck size={14} /> {pdfFile.name} ({(pdfFile.size / (1024 * 1024)).toFixed(2)} MB)
                                            </p>
                                        )}
                                        <p className="text-[11px] text-gray-400 mt-2">Maximum file size limit: 100MB</p>
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-[#064e3b] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#04392b] transition-all shadow-xl text-sm group"
                                >
                                    {submitting ? <Loader2 className="animate-spin" /> : <Send size={18} className="group-hover:translate-x-1 transition-transform" />}
                                    {submitting ? 'Submitting Manuscript...' : 'Submit Manuscript for Review'}
                                </button>
                            </form>
                        </div>

                    </div>

                    {/* Right Column: User Profile Summary & Quick Stats */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-[#064e3b]/5 space-y-4">
                            <h3 className="text-base font-serif font-bold text-[#064e3b] border-b border-gray-100 pb-3 flex items-center gap-2">
                                <UserCheck size={18} className="text-[#b47c1c]" /> Author Profile
                            </h3>
                            {user && (
                                <div className="space-y-2 text-xs">
                                    <p><span className="text-gray-400 font-bold uppercase text-[10px]">Author:</span> <strong className="text-gray-800">{user.name}</strong></p>
                                    <p><span className="text-gray-400 font-bold uppercase text-[10px]">Email:</span> <span className="text-gray-700">{user.email}</span></p>
                                    <p><span className="text-gray-400 font-bold uppercase text-[10px]">Role:</span> <span className="uppercase font-bold text-[#064e3b]">{user.role || 'Author'}</span></p>
                                </div>
                            )}
                        </div>

                        {/* Submission Guidelines */}
                        <div className="bg-gradient-to-br from-[#fff9f0] to-[#fef3c7] p-6 rounded-[2rem] border border-[#b47c1c]/20 space-y-3">
                            <h4 className="font-serif font-bold text-[#064e3b] text-sm flex items-center gap-2">
                                <FileText size={16} className="text-[#b47c1c]" /> Submission Workflow
                            </h4>
                            <ol className="text-gray-600 text-[11px] space-y-2 leading-relaxed list-decimal pl-4">
                                <li><strong>Editor Screening:</strong> Editor verifies format and relevance.</li>
                                <li><strong>Peer Review:</strong> Approved manuscripts undergo double-blind peer review.</li>
                                <li><strong>Final Decision:</strong> Reviewer accepts paper or requests author revisions.</li>
                            </ol>
                        </div>
                    </div>

                </div>

                {/* Section 2: My Submitted Manuscripts List */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-[#064e3b]/5 space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-[#064e3b] flex items-center gap-3">
                                <History size={24} className="text-[#b47c1c]" /> My Submitted Manuscripts
                            </h2>
                            <p className="text-gray-500 text-xs mt-1">Track the live progress of your paper across Editor screening and Peer Review.</p>
                        </div>
                        <span className="text-xs font-bold text-[#064e3b] bg-[#064e3b]/10 px-3 py-1 rounded-full">
                            Total Papers: {manuscripts.length}
                        </span>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center">
                            <Loader2 className="animate-spin text-[#064e3b] mb-3" size={28} />
                            <span className="text-xs font-bold uppercase">Loading your manuscripts...</span>
                        </div>
                    ) : manuscripts.length === 0 ? (
                        <div className="p-12 text-center text-gray-400 space-y-2">
                            <FileText size={40} className="mx-auto text-gray-300" />
                            <p className="text-sm font-bold text-gray-600">No Manuscripts Submitted Yet</p>
                            <p className="text-xs">Fill in the form above to submit your first research paper.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {manuscripts.map((item) => {
                                const badge = getStatusBadge(item.status);
                                const BadgeIcon = badge.icon;
                                const isRejected = item.status?.includes('Rejected');

                                return (
                                    <div 
                                        key={item._id} 
                                        className="p-6 rounded-3xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-[#064e3b]/20 hover:shadow-lg transition-all space-y-4"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="space-y-1 max-w-3xl">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${badge.color}`}>
                                                        <BadgeIcon size={12} /> {badge.label}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-mono">
                                                        Submitted: {new Date(item.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-base text-[#064e3b] mt-1">{item.title}</h3>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                {item.pdfUrl && (
                                                    <a 
                                                        href={getServerUrl(item.pdfUrl)} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="px-4 py-2 rounded-xl bg-[#064e3b]/10 hover:bg-[#064e3b] text-[#064e3b] hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                                                    >
                                                        <Eye size={14} /> View PDF
                                                    </a>
                                                )}

                                                <button 
                                                    onClick={() => setHistoryModalTarget(item)}
                                                    className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold transition-all flex items-center gap-1.5"
                                                >
                                                    <History size={14} /> Timeline
                                                </button>

                                                {isRejected && (
                                                    <button 
                                                        onClick={() => setResubmitTarget(item)}
                                                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                                                    >
                                                        <RefreshCw size={14} /> Resubmit Revision
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed">
                                            {item.description}
                                        </p>

                                        {/* Feedback comments if rejected */}
                                        {isRejected && (item.editorReview?.comments || item.reviewerReview?.comments) && (
                                            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl space-y-1">
                                                <div className="text-[10px] font-bold text-rose-700 uppercase tracking-widest flex items-center gap-1">
                                                    <MessageSquare size={12} /> Feedback Comments for Revision
                                                </div>
                                                <p className="text-xs text-rose-900 font-medium">
                                                    {item.reviewerReview?.comments || item.editorReview?.comments}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>

            {/* Resubmit Revision Modal */}
            <AnimatePresence>
                {resubmitTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl p-8 space-y-6"
                        >
                            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                <div className="flex items-center gap-3">
                                    <RefreshCw className="text-rose-600" size={24} />
                                    <h3 className="text-lg font-serif font-bold text-[#064e3b]">
                                        Resubmit Manuscript Revision
                                    </h3>
                                </div>
                                <button onClick={() => setResubmitTarget(null)} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleResubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Title</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium"
                                        value={resubmitTarget.title}
                                        onChange={e => setResubmitTarget({ ...resubmitTarget, title: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Abstract / Summary</label>
                                    <textarea 
                                        rows={4}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium"
                                        value={resubmitTarget.description}
                                        onChange={e => setResubmitTarget({ ...resubmitTarget, description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Revision Notes (Author Comments to Editor/Reviewer)</label>
                                    <textarea 
                                        rows={3}
                                        placeholder="Explain the changes made based on the reviewer feedback..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium"
                                        value={revisionNotes}
                                        onChange={e => setRevisionNotes(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Upload Revised PDF (Optional if replacing file)</label>
                                    <input 
                                        type="file" 
                                        accept=".pdf"
                                        className="w-full text-xs p-3 bg-gray-50 rounded-xl border border-dashed border-gray-300"
                                        onChange={e => setRevisionPdf(e.target.files[0])}
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button 
                                        type="button" 
                                        onClick={() => setResubmitTarget(null)}
                                        className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={submitting}
                                        className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                                        {submitting ? 'Resubmitting...' : 'Submit Revision'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* History / Audit Timeline Modal */}
            <AnimatePresence>
                {historyModalTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl p-8 space-y-6"
                        >
                            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                <div className="flex items-center gap-3">
                                    <History className="text-[#064e3b]" size={24} />
                                    <h3 className="text-lg font-serif font-bold text-[#064e3b]">
                                        Manuscript Audit Timeline
                                    </h3>
                                </div>
                                <button onClick={() => setHistoryModalTarget(null)} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                {(historyModalTarget.history || []).map((h, i) => (
                                    <div key={i} className="flex gap-4 items-start border-l-2 border-[#064e3b] pl-4 py-1 relative">
                                        <div className="w-3 h-3 rounded-full bg-[#064e3b] absolute -left-[7px] top-2" />
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-xs text-[#064e3b]">{h.action}</span>
                                                <span className="text-[10px] text-gray-400 font-mono">
                                                    {new Date(h.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-700">
                                                By <strong>{h.performedBy}</strong> ({h.role})
                                            </p>
                                            {h.comments && (
                                                <p className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded-lg">
                                                    "{h.comments}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-100">
                                <button 
                                    onClick={() => setHistoryModalTarget(null)}
                                    className="px-6 py-2.5 rounded-xl bg-[#064e3b] text-white text-xs font-bold hover:bg-[#04392b]"
                                >
                                    Close Timeline
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SubmitManuscript;
