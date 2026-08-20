import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    ShieldCheck, 
    FileText, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Eye, 
    MessageSquare, 
    Loader2, 
    X,
    LogOut,
    Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getServerUrl } from '../utils/urlHelper';

const ReviewerDashboard = () => {
    const navigate = useNavigate();
    const [reviewerUser, setReviewerUser] = useState(null);
    const [token, setToken] = useState(null);
    const [manuscripts, setManuscripts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('Approved by Editor');

    // Review Modal State
    const [activeManuscript, setActiveManuscript] = useState(null);
    const [reviewDecision, setReviewDecision] = useState('approve'); // 'approve' or 'reject'
    const [comments, setComments] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState('');
    const [errMsg, setErrMsg] = useState('');

    useEffect(() => {
        const storedToken = localStorage.getItem('userToken') || localStorage.getItem('memberToken');
        const storedUser = localStorage.getItem('userData') || localStorage.getItem('memberData');

        if (!storedToken || !storedUser) {
            navigate('/user/login?redirect=/reviewer/dashboard');
            return;
        }

        try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.role !== 'reviewer' && parsedUser.role !== 'admin') {
                alert('Access denied - Peer Reviewer account required.');
                navigate('/user/login');
                return;
            }

            setReviewerUser(parsedUser);
            setToken(storedToken);
            fetchReviewerManuscripts(storedToken);
        } catch (e) {
            navigate('/user/login');
        }
    }, [navigate]);

    const fetchReviewerManuscripts = async (authToken) => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/manuscript/reviewer/all`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setManuscripts(res.data || []);
        } catch (err) {
            console.error('Failed to load reviewer manuscripts', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        window.dispatchEvent(new Event('storage'));
        navigate('/user/login');
    };

    const handleOpenReviewModal = (m, decision) => {
        setActiveManuscript(m);
        setReviewDecision(decision);
        setComments('');
        setMsg('');
        setErrMsg('');
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!activeManuscript) return;

        if (reviewDecision === 'reject' && (!comments || !comments.trim())) {
            setErrMsg('Please enter peer review comments explaining the rejection reasons to the author.');
            return;
        }

        setSubmitting(true);
        setMsg('');
        setErrMsg('');

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/manuscript/reviewer/review/${activeManuscript._id}`, {
                decision: reviewDecision,
                comments
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMsg(res.data.message || 'Peer review submitted successfully!');
            setTimeout(() => {
                setActiveManuscript(null);
                fetchReviewerManuscripts(token);
            }, 900);
        } catch (err) {
            setErrMsg(err.response?.data?.message || 'Failed to submit reviewer decision.');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredManuscripts = manuscripts.filter(m => {
        if (selectedStatusFilter === 'all') return true;
        return m.status === selectedStatusFilter;
    });

    return (
        <div className="min-h-screen bg-[#fff9f0] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Top Header Banner */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-emerald-900 via-[#064e3b] to-teal-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
                >
                    <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left z-10">
                        <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center font-bold text-3xl shadow-xl shrink-0">
                            <ShieldCheck size={40} />
                        </div>

                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] uppercase font-bold rounded-full">
                                    Peer Reviewer Portal Workspace
                                </span>
                            </div>
                            <h1 className="text-3xl font-serif font-bold tracking-tight">Reviewer Dashboard</h1>
                            <p className="text-white/70 text-xs mt-1">
                                Welcome, {reviewerUser?.name} — Perform peer reviews on papers approved by Editors, provide feedback, and make final publication decisions.
                            </p>
                        </div>
                    </div>

                    <button 
                        onClick={handleLogout}
                        className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-2 transition-all shrink-0 z-10"
                    >
                        <LogOut size={16} /> Logout Portal
                    </button>
                </motion.div>

                {/* Filter & Count Bar */}
                <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                        <button
                            onClick={() => setSelectedStatusFilter('Approved by Editor')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                selectedStatusFilter === 'Approved by Editor'
                                    ? 'bg-emerald-900 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Awaiting Peer Review ({manuscripts.filter(m => m.status === 'Approved by Editor').length})
                        </button>

                        <button
                            onClick={() => setSelectedStatusFilter('Approved by Reviewer')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                selectedStatusFilter === 'Approved by Reviewer'
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Accepted for Publication ({manuscripts.filter(m => m.status === 'Approved by Reviewer').length})
                        </button>

                        <button
                            onClick={() => setSelectedStatusFilter('Rejected by Reviewer')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                selectedStatusFilter === 'Rejected by Reviewer'
                                    ? 'bg-rose-700 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Rejected ({manuscripts.filter(m => m.status === 'Rejected by Reviewer').length})
                        </button>

                        <button
                            onClick={() => setSelectedStatusFilter('all')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                selectedStatusFilter === 'all'
                                    ? 'bg-gray-900 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            All ({manuscripts.length})
                        </button>
                    </div>

                    <div className="text-xs font-bold text-gray-500">
                        Total Manuscripts: <strong className="text-gray-900">{filteredManuscripts.length}</strong>
                    </div>
                </div>

                {/* Manuscripts List */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-gray-100 space-y-6">
                    {loading ? (
                        <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center">
                            <Loader2 className="animate-spin text-emerald-900 mb-3" size={32} />
                            <span className="text-xs font-bold uppercase tracking-wider">Loading manuscripts for Peer review...</span>
                        </div>
                    ) : filteredManuscripts.length === 0 ? (
                        <div className="p-16 text-center text-gray-400 space-y-2">
                            <FileText size={44} className="mx-auto text-gray-300" />
                            <h3 className="text-lg font-serif font-bold text-gray-700">No Manuscripts in this category</h3>
                            <p className="text-xs">Select another status tab above to view other assigned papers.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredManuscripts.map((item) => {
                                const isPending = item.status === 'Approved by Editor';

                                return (
                                    <div 
                                        key={item._id}
                                        className="p-6 rounded-3xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-emerald-900/20 hover:shadow-lg transition-all space-y-4"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="space-y-1 max-w-3xl">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                                                        item.status === 'Approved by Reviewer' 
                                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                                            : item.status === 'Rejected by Reviewer'
                                                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                                                            : 'bg-amber-100 text-amber-800 border-amber-300'
                                                    }`}>
                                                        {item.status === 'Approved by Reviewer' ? 'Accepted for Publication' : item.status}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400">
                                                        Author: <strong className="text-gray-700">{item.authorName}</strong>
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
                                                        className="px-4 py-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-900 text-emerald-900 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                                                    >
                                                        <Eye size={14} /> Open Manuscript PDF
                                                    </a>
                                                )}

                                                {isPending && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleOpenReviewModal(item, 'approve')}
                                                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                                                        >
                                                            <CheckCircle2 size={14} /> Accept & Approve
                                                        </button>

                                                        <button 
                                                            onClick={() => handleOpenReviewModal(item, 'reject')}
                                                            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                                                        >
                                                            <XCircle size={14} /> Reject Paper
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-gray-600 text-xs leading-relaxed">
                                            {item.description}
                                        </p>

                                        {/* Editor Review Comments summary */}
                                        {item.editorReview?.comments && (
                                            <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl space-y-1">
                                                <div className="text-[10px] font-bold text-purple-800 uppercase tracking-widest flex items-center gap-1">
                                                    <MessageSquare size={12} /> Passed Editor Screening Note
                                                </div>
                                                <p className="text-xs text-purple-950 font-medium">
                                                    "{item.editorReview.comments}"
                                                </p>
                                            </div>
                                        )}

                                        {/* Peer Reviewer Comments summary if review completed */}
                                        {item.reviewerReview?.comments && (
                                            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-1">
                                                <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-1">
                                                    <Award size={12} /> Peer Reviewer Decision Note
                                                </div>
                                                <p className="text-xs text-emerald-950 font-medium">
                                                    "{item.reviewerReview.comments}"
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

            {/* Peer Review Decision Modal */}
            <AnimatePresence>
                {activeManuscript && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl p-8 space-y-6"
                        >
                            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className={reviewDecision === 'approve' ? 'text-emerald-600' : 'text-rose-600'} size={24} />
                                    <h3 className="text-lg font-serif font-bold text-[#064e3b]">
                                        {reviewDecision === 'approve' ? 'Accept Manuscript for Publication' : 'Reject Manuscript & Provide Peer Feedback'}
                                    </h3>
                                </div>
                                <button onClick={() => setActiveManuscript(null)} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>

                            {msg && (
                                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl text-xs font-bold border border-emerald-200 flex items-center gap-2">
                                    <CheckCircle2 size={18} className="text-emerald-600" /> {msg}
                                </div>
                            )}

                            {errMsg && (
                                <div className="bg-rose-50 text-rose-700 p-4 rounded-2xl text-xs font-bold border border-rose-200 flex items-center gap-2">
                                    <XCircle size={18} className="text-rose-600" /> {errMsg}
                                </div>
                            )}

                            <form onSubmit={handleSubmitReview} className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-2xl space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Peer Review Target</p>
                                    <h4 className="font-bold text-sm text-[#064e3b]">{activeManuscript.title}</h4>
                                    <p className="text-xs text-gray-500">Author: {activeManuscript.authorName}</p>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                        Peer Reviewer Comments {reviewDecision === 'reject' && <span className="text-rose-500">*</span>}
                                    </label>
                                    <textarea 
                                        required={reviewDecision === 'reject'}
                                        rows={4}
                                        placeholder={reviewDecision === 'approve' 
                                            ? 'Optional acceptance comments and praise...'
                                            : 'Explain peer review critique and required revisions for author...'
                                        }
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-emerald-600"
                                        value={comments}
                                        onChange={e => setComments(e.target.value)}
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button 
                                        type="button" 
                                        onClick={() => setActiveManuscript(null)}
                                        className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
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
                                        {submitting ? 'Saving Peer Review...' : reviewDecision === 'approve' ? 'Accept & Publish' : 'Confirm Rejection'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ReviewerDashboard;
