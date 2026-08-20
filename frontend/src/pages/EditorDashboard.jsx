import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    BadgeCheck, 
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
    LogOut,
    Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getServerUrl } from '../utils/urlHelper';

const EditorDashboard = () => {
    const navigate = useNavigate();
    const [editorUser, setEditorUser] = useState(null);
    const [token, setToken] = useState(null);
    const [manuscripts, setManuscripts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('Pending Editor Review');

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
            navigate('/user/login?redirect=/editor/dashboard');
            return;
        }

        try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.role !== 'editor' && parsedUser.role !== 'admin') {
                alert('Access denied - Editor account required.');
                navigate('/user/login');
                return;
            }

            setEditorUser(parsedUser);
            setToken(storedToken);
            fetchEditorManuscripts(storedToken);
        } catch (e) {
            navigate('/user/login');
        }
    }, [navigate]);

    const fetchEditorManuscripts = async (authToken) => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/manuscript/editor/all`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setManuscripts(res.data || []);
        } catch (err) {
            console.error('Failed to load editor manuscripts', err);
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
            setErrMsg('Please enter feedback comments explaining the rejection reasons to the author.');
            return;
        }

        setSubmitting(true);
        setMsg('');
        setErrMsg('');

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/manuscript/editor/review/${activeManuscript._id}`, {
                decision: reviewDecision,
                comments
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMsg(res.data.message || 'Review submitted successfully!');
            setTimeout(() => {
                setActiveManuscript(null);
                fetchEditorManuscripts(token);
            }, 900);
        } catch (err) {
            setErrMsg(err.response?.data?.message || 'Failed to submit editor decision.');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredManuscripts = manuscripts.filter(m => {
        if (selectedStatusFilter === 'all') return true;
        if (selectedStatusFilter === 'Pending Editor Review') {
            return m.status === 'Pending Editor Review' || m.status === 'Resubmitted';
        }
        return m.status === selectedStatusFilter;
    });

    return (
        <div className="min-h-screen bg-[#fff9f0] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Top Header Banner */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-purple-900 via-indigo-900 to-[#064e3b] rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
                >
                    <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left z-10">
                        <div className="w-20 h-20 rounded-3xl bg-purple-500/20 border-2 border-purple-400 text-purple-300 flex items-center justify-center font-bold text-3xl shadow-xl shrink-0">
                            <BadgeCheck size={40} />
                        </div>

                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] uppercase font-bold rounded-full">
                                    Editor Portal Workspace
                                </span>
                            </div>
                            <h1 className="text-3xl font-serif font-bold tracking-tight">Editor Dashboard</h1>
                            <p className="text-white/70 text-xs mt-1">
                                Welcome, {editorUser?.name} — Review submitted manuscripts, evaluate abstracts, and pass approved papers to peer reviewers.
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
                            onClick={() => setSelectedStatusFilter('Pending Editor Review')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                selectedStatusFilter === 'Pending Editor Review'
                                    ? 'bg-purple-900 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Awaiting Review ({manuscripts.filter(m => m.status === 'Pending Editor Review' || m.status === 'Resubmitted').length})
                        </button>

                        <button
                            onClick={() => setSelectedStatusFilter('Approved by Editor')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                selectedStatusFilter === 'Approved by Editor'
                                    ? 'bg-[#064e3b] text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Approved by Editor ({manuscripts.filter(m => m.status === 'Approved by Editor').length})
                        </button>

                        <button
                            onClick={() => setSelectedStatusFilter('Rejected by Editor')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                selectedStatusFilter === 'Rejected by Editor'
                                    ? 'bg-rose-700 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Rejected ({manuscripts.filter(m => m.status === 'Rejected by Editor').length})
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
                            <Loader2 className="animate-spin text-purple-900 mb-3" size={32} />
                            <span className="text-xs font-bold uppercase tracking-wider">Loading manuscripts for Editor review...</span>
                        </div>
                    ) : filteredManuscripts.length === 0 ? (
                        <div className="p-16 text-center text-gray-400 space-y-2">
                            <FileText size={44} className="mx-auto text-gray-300" />
                            <h3 className="text-lg font-serif font-bold text-gray-700">No Manuscripts in this category</h3>
                            <p className="text-xs">Select another status tab above to view other papers.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredManuscripts.map((item) => {
                                const isPending = item.status === 'Pending Editor Review' || item.status === 'Resubmitted';

                                return (
                                    <div 
                                        key={item._id}
                                        className="p-6 rounded-3xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-purple-900/20 hover:shadow-lg transition-all space-y-4"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="space-y-1 max-w-3xl">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                                                        item.status === 'Approved by Editor' 
                                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                                            : item.status === 'Rejected by Editor'
                                                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                                                            : 'bg-amber-100 text-amber-800 border-amber-300'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400">
                                                        Author: <strong className="text-gray-700">{item.authorName}</strong> ({item.authorEmail})
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
                                                        className="px-4 py-2.5 rounded-xl bg-purple-100 hover:bg-purple-900 text-purple-900 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                                                    >
                                                        <Eye size={14} /> Open Manuscript PDF
                                                    </a>
                                                )}

                                                {isPending && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleOpenReviewModal(item, 'approve')}
                                                            className="px-4 py-2.5 rounded-xl bg-[#064e3b] hover:bg-[#04392b] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                                                        >
                                                            <CheckCircle2 size={14} /> Approve & Forward
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

                                        {/* History / Previous Review Comments */}
                                        {item.editorReview?.comments && (
                                            <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl space-y-1">
                                                <div className="text-[10px] font-bold text-purple-800 uppercase tracking-widest flex items-center gap-1">
                                                    <MessageSquare size={12} /> Editor Review Comments ({new Date(item.editorReview.reviewedAt).toLocaleDateString()})
                                                </div>
                                                <p className="text-xs text-purple-950 font-medium">
                                                    "{item.editorReview.comments}"
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

            {/* Review Decision Modal */}
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
                                    <BadgeCheck className={reviewDecision === 'approve' ? 'text-[#064e3b]' : 'text-rose-600'} size={24} />
                                    <h3 className="text-lg font-serif font-bold text-[#064e3b]">
                                        {reviewDecision === 'approve' ? 'Approve Manuscript for Peer Review' : 'Reject Manuscript & Provide Feedback'}
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
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Target Manuscript</p>
                                    <h4 className="font-bold text-sm text-[#064e3b]">{activeManuscript.title}</h4>
                                    <p className="text-xs text-gray-500">Author: {activeManuscript.authorName} ({activeManuscript.authorEmail})</p>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                        Editor Feedback / Decision Comments {reviewDecision === 'reject' && <span className="text-rose-500">*</span>}
                                    </label>
                                    <textarea 
                                        required={reviewDecision === 'reject'}
                                        rows={4}
                                        placeholder={reviewDecision === 'approve' 
                                            ? 'Optional notes regarding approval and forwarding to peer reviewers...'
                                            : 'Explain the reasons for rejection to guide author revisions...'
                                        }
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
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
                                            reviewDecision === 'approve' ? 'bg-[#064e3b] hover:bg-[#04392b]' : 'bg-rose-600 hover:bg-rose-700'
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
        </div>
    );
};

export default EditorDashboard;
