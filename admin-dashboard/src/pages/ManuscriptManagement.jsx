import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FileText, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Eye, 
    MessageSquare, 
    Search, 
    Loader2, 
    X,
    UserCheck,
    Filter,
    ShieldCheck,
    History,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const ManuscriptManagement = () => {
    const { user } = useAuth();
    const [manuscripts, setManuscripts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state
    const [selectedManuscript, setSelectedManuscript] = useState(null);
    const [reviewDecision, setReviewDecision] = useState('approve'); // 'approve' or 'reject'
    const [comments, setComments] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    const isEditor = user?.role === 'editor' || user?.role === 'admin';
    const isReviewer = user?.role === 'reviewer' || user?.role === 'admin';

    useEffect(() => {
        fetchManuscripts();
    }, [user]);

    const fetchManuscripts = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('isor_token');
            let endpoint = `${import.meta.env.VITE_API_URL}/manuscript/editor/all`;
            
            if (user?.role === 'reviewer') {
                endpoint = `${import.meta.env.VITE_API_URL}/manuscript/reviewer/all`;
            }

            const res = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setManuscripts(res.data || []);
        } catch (err) {
            console.error('Failed to load manuscripts:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenReviewModal = (manuscript, decision) => {
        setSelectedManuscript(manuscript);
        setReviewDecision(decision);
        setComments('');
        setMsg('');
        setErrMsg('');
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!selectedManuscript) return;

        if (reviewDecision === 'reject' && (!comments || !comments.trim())) {
            setErrMsg('Please enter feedback comments explaining the rejection reasons.');
            return;
        }

        setSubmitting(true);
        setMsg('');
        setErrMsg('');

        try {
            const token = localStorage.getItem('isor_token');
            let reviewEndpoint = `${import.meta.env.VITE_API_URL}/manuscript/editor/review/${selectedManuscript._id}`;
            if (user?.role === 'reviewer') {
                reviewEndpoint = `${import.meta.env.VITE_API_URL}/manuscript/reviewer/review/${selectedManuscript._id}`;
            }

            const res = await axios.post(reviewEndpoint, {
                decision: reviewDecision,
                comments
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMsg(res.data.message || 'Review submitted successfully!');
            setTimeout(() => {
                setSelectedManuscript(null);
                fetchManuscripts();
            }, 900);
        } catch (err) {
            setErrMsg(err.response?.data?.message || 'Failed to submit review decision.');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredManuscripts = manuscripts.filter(m => {
        if (statusFilter !== 'all' && m.status !== statusFilter) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return (
                m.title.toLowerCase().includes(q) ||
                m.authorName.toLowerCase().includes(q) ||
                m.authorEmail.toLowerCase().includes(q)
            );
        }
        return true;
    });

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Pending Editor Review':
            case 'Resubmitted':
                return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'Approved by Editor':
                return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'Approved by Reviewer':
                return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'Rejected by Editor':
            case 'Rejected by Reviewer':
                return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            default:
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-6 rounded-3xl border border-white/10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                        <FileText size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Manuscript Review Portal</h1>
                        <p className="text-text-muted text-xs mt-1">
                            Role: <strong className="text-indigo-400 uppercase">{user?.role}</strong> — Review, evaluate, approve or request revisions for submitted papers.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="px-4 py-2 rounded-xl bg-white/5 text-white/70 text-xs font-bold border border-white/10">
                        Total Papers: {manuscripts.length}
                    </span>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                    {['all', 'Pending Editor Review', 'Approved by Editor', 'Approved by Reviewer', 'Rejected by Editor', 'Rejected by Reviewer'].map((st) => (
                        <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider whitespace-nowrap ${
                                statusFilter === st 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            {st === 'all' ? 'All Status' : st}
                        </button>
                    ))}
                </div>

                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search by title or author..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-xs text-white placeholder-white/40 focus:outline-none focus:border-indigo-500"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Manuscripts List */}
            <div className="bg-white/[0.02] rounded-3xl border border-white/5 overflow-hidden p-6 space-y-4">
                {loading ? (
                    <div className="p-16 text-center text-white/40 flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin mb-3 text-indigo-400" size={32} />
                        <span className="text-xs font-semibold">Loading manuscripts...</span>
                    </div>
                ) : filteredManuscripts.length === 0 ? (
                    <div className="p-16 text-center text-white/40">
                        <FileText size={44} className="mx-auto mb-3 opacity-30 text-indigo-400" />
                        <p className="text-sm font-semibold text-white">No Manuscripts Found</p>
                        <p className="text-xs mt-1">Select another filter tab above.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredManuscripts.map((m) => {
                            const canReviewEditor = isEditor && (m.status === 'Pending Editor Review' || m.status === 'Resubmitted');
                            const canReviewPeer = isReviewer && (m.status === 'Approved by Editor');

                            return (
                                <div key={m._id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-indigo-500/30 transition-all space-y-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1.5 max-w-3xl">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusBadgeClass(m.status)}`}>
                                                    {m.status}
                                                </span>
                                                <span className="text-[10px] text-white/40 font-mono">
                                                    Author: <strong className="text-white">{m.authorName}</strong> ({m.authorEmail})
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-base text-white">{m.title}</h3>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            {m.pdfUrl && (
                                                <a 
                                                    href={m.pdfUrl} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="px-4 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-600 text-indigo-400 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-indigo-500/20"
                                                >
                                                    <Eye size={14} /> View PDF
                                                </a>
                                            )}

                                            <button 
                                                onClick={() => { setSelectedManuscript(m); setShowHistoryModal(true); }}
                                                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold transition-all flex items-center gap-1.5 border border-white/10"
                                            >
                                                <History size={14} /> History
                                            </button>

                                            {(canReviewEditor || canReviewPeer) && (
                                                <>
                                                    <button 
                                                        onClick={() => handleOpenReviewModal(m, 'approve')}
                                                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                                                    >
                                                        <CheckCircle2 size={14} /> Approve
                                                    </button>
                                                    <button 
                                                        onClick={() => handleOpenReviewModal(m, 'reject')}
                                                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                                                    >
                                                        <XCircle size={14} /> Reject
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-white/70 text-xs leading-relaxed line-clamp-3">
                                        {m.description}
                                    </p>

                                    {/* Review Comments Note */}
                                    {(m.editorReview?.comments || m.reviewerReview?.comments) && (
                                        <div className="bg-white/5 border border-white/10 p-3 rounded-xl space-y-1">
                                            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                                                <MessageSquare size={12} /> Recent Review Note
                                            </div>
                                            <p className="text-xs text-white/80 italic">
                                                "{m.reviewerReview?.comments || m.editorReview?.comments}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Review Decision Modal */}
            <AnimatePresence>
                {selectedManuscript && !showHistoryModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl p-6 space-y-6"
                        >
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className={reviewDecision === 'approve' ? 'text-emerald-400' : 'text-rose-400'} size={24} />
                                    <h3 className="text-base font-bold text-white">
                                        {reviewDecision === 'approve' ? 'Approve Manuscript' : 'Reject Manuscript & Provide Feedback'}
                                    </h3>
                                </div>
                                <button onClick={() => setSelectedManuscript(null)} className="text-white/40 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            {msg && (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
                                    <CheckCircle2 size={16} /> {msg}
                                </div>
                            )}

                            {errMsg && (
                                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
                                    <XCircle size={16} /> {errMsg}
                                </div>
                            )}

                            <form onSubmit={handleSubmitReview} className="space-y-4">
                                <div className="bg-white/5 p-4 rounded-2xl space-y-1">
                                    <p className="text-[10px] font-bold text-white/40 uppercase">Selected Paper</p>
                                    <h4 className="font-bold text-xs text-white">{selectedManuscript.title}</h4>
                                    <p className="text-[11px] text-white/60">Author: {selectedManuscript.authorName} ({selectedManuscript.authorEmail})</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest block">
                                        Feedback Comments {reviewDecision === 'reject' && <span className="text-rose-400">*</span>}
                                    </label>
                                    <textarea 
                                        required={reviewDecision === 'reject'}
                                        rows={4}
                                        placeholder="Enter review decision notes..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                                        value={comments}
                                        onChange={e => setComments(e.target.value)}
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                    <button 
                                        type="button" 
                                        onClick={() => setSelectedManuscript(null)}
                                        className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-white/60 hover:bg-white/5"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={submitting}
                                        className={`px-6 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 shadow-lg ${
                                            reviewDecision === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                                        }`}
                                    >
                                        {submitting ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                                        {submitting ? 'Saving Review...' : reviewDecision === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* History Modal */}
            <AnimatePresence>
                {showHistoryModal && selectedManuscript && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl p-6 space-y-6"
                        >
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div className="flex items-center gap-3">
                                    <History className="text-indigo-400" size={24} />
                                    <h3 className="text-base font-bold text-white">
                                        Audit History Timeline
                                    </h3>
                                </div>
                                <button onClick={() => setShowHistoryModal(false)} className="text-white/40 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                {(selectedManuscript.history || []).map((h, i) => (
                                    <div key={i} className="flex gap-4 items-start border-l-2 border-indigo-500 pl-4 py-1 relative">
                                        <div className="w-3 h-3 rounded-full bg-indigo-500 absolute -left-[7px] top-2" />
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-xs text-white">{h.action}</span>
                                                <span className="text-[10px] text-white/40 font-mono">
                                                    {new Date(h.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-white/70">
                                                By <strong>{h.performedBy}</strong> ({h.role})
                                            </p>
                                            {h.comments && (
                                                <p className="text-xs text-white/50 italic bg-white/5 p-2 rounded-lg">
                                                    "{h.comments}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end pt-4 border-t border-white/10">
                                <button 
                                    onClick={() => setShowHistoryModal(false)}
                                    className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
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

export default ManuscriptManagement;
