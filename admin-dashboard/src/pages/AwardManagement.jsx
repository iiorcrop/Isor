import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Award, 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    CheckCircle, 
    XCircle, 
    Upload, 
    FileText, 
    Loader2, 
    X,
    Calendar,
    Image,
    DollarSign,
    UserCheck,
    Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getServerUrl } from '../utils/urlHelper';
import { uploadFileToStorage } from '../utils/fileUploader';

const AwardManagement = () => {
    const [awards, setAwards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAward, setEditingAward] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Form fields
    const [formData, setFormData] = useState({
        title: '',
        awardBy: 'Indian Society of Oilseeds Research (ICAR)',
        category: 'Research Excellence',
        cashPrize: '₹25,000 & Citation',
        frequency: 'Annual',
        eligibility: '',
        description: '',
        applicationDeadline: '',
        order: 0,
        isActive: true
    });

    const [mainPhotoFile, setMainPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState('');
    const [documentFile, setDocumentFile] = useState(null);

    useEffect(() => {
        fetchAwards();
    }, []);

    const fetchAwards = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/awards`);
            setAwards(res.data || []);
        } catch (err) {
            console.error('Failed to fetch awards', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (award = null) => {
        setErrorMsg('');
        setSuccessMsg('');
        if (award) {
            setEditingAward(award);
            setFormData({
                title: award.title || '',
                awardBy: award.awardBy || 'Indian Society of Oilseeds Research (ICAR)',
                category: award.category || 'General',
                cashPrize: award.cashPrize || '',
                frequency: award.frequency || 'Annual',
                eligibility: award.eligibility || '',
                description: award.description || '',
                applicationDeadline: award.applicationDeadline || '',
                order: award.order || 0,
                isActive: award.isActive !== false
            });
            setPhotoPreview(award.mainPhoto || '');
        } else {
            setEditingAward(null);
            setFormData({
                title: '',
                awardBy: 'Indian Society of Oilseeds Research (ICAR)',
                category: 'Research Excellence',
                cashPrize: '₹25,000 & Citation',
                frequency: 'Annual',
                eligibility: 'Open to ISOR Members',
                description: '',
                applicationDeadline: '',
                order: awards.length + 1,
                isActive: true
            });
            setPhotoPreview('');
        }
        setMainPhotoFile(null);
        setDocumentFile(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAward(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMainPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            let mainPhotoKey = editingAward ? editingAward.mainPhoto : '';
            let documentKey = editingAward ? editingAward.documentUrl : '';

            if (mainPhotoFile) {
                mainPhotoKey = await uploadFileToStorage(mainPhotoFile);
            }

            if (documentFile) {
                documentKey = await uploadFileToStorage(documentFile);
            }

            const payload = {
                ...formData,
                mainPhoto: mainPhotoKey,
                documentUrl: documentKey
            };

            if (editingAward) {
                await axios.put(`${import.meta.env.VITE_API_URL}/awards/${editingAward._id}`, payload);
                setSuccessMsg('Award updated successfully!');
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/awards`, payload);
                setSuccessMsg('Award created successfully!');
            }

            setTimeout(() => {
                handleCloseModal();
                fetchAwards();
            }, 800);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || err.message || 'Error saving award. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (award) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/awards/${award._id}`, {
                isActive: !award.isActive
            });
            fetchAwards();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this award?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/awards/${id}`);
            fetchAwards();
        } catch (err) {
            alert('Failed to delete award');
        }
    };

    const filteredAwards = awards.filter(a => 
        a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.awardBy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-6 rounded-3xl border border-white/10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                        <Award size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Awards Management</h1>
                        <p className="text-text-muted text-xs mt-1">Manage ISOR society awards, prize metadata, eligibility criteria, and documents.</p>
                    </div>
                </div>

                <button 
                    onClick={() => handleOpenModal()}
                    className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                >
                    <Plus size={18} /> Add New Award
                </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex items-center justify-between gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search awards by title, category, or awarding body..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="text-xs text-white/40 font-medium">
                    Total Awards: <strong className="text-white">{filteredAwards.length}</strong>
                </div>
            </div>

            {/* Awards Table */}
            <div className="bg-white/[0.02] rounded-3xl border border-white/5 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-white/40 flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin mb-3 text-amber-500" size={28} />
                        <span className="text-xs font-medium">Loading awards...</span>
                    </div>
                ) : filteredAwards.length === 0 ? (
                    <div className="p-12 text-center text-white/40">
                        <Award size={36} className="mx-auto mb-3 opacity-30 text-amber-400" />
                        <p className="text-sm font-semibold text-white">No awards found</p>
                        <p className="text-xs mt-1">Click "Add New Award" to create your first society award.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-bold text-white/40 uppercase tracking-wider">
                                    <th className="p-4 pl-6">Award / Photo</th>
                                    <th className="p-4">Awarded By</th>
                                    <th className="p-4">Category & Prize</th>
                                    <th className="p-4">Deadline</th>
                                    <th className="p-4 text-center">Status</th>
                                    <th className="p-4 pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-xs">
                                {filteredAwards.map(award => (
                                    <tr key={award._id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center text-white/30">
                                                    {award.mainPhoto ? (
                                                        <img src={award.mainPhoto} alt={award.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Award size={20} className="text-amber-400/50" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white text-sm">{award.title}</h3>
                                                    <span className="text-[10px] text-white/40">{award.frequency || 'Annual'}</span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-4 text-white/80 font-medium">
                                            {award.awardBy}
                                        </td>

                                        <td className="p-4 space-y-1">
                                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                                                {award.category || 'General'}
                                            </span>
                                            {award.cashPrize && (
                                                <div className="text-[11px] text-emerald-400 font-medium">
                                                    {award.cashPrize}
                                                </div>
                                            )}
                                        </td>

                                        <td className="p-4 text-white/60">
                                            {award.applicationDeadline || 'N/A'}
                                        </td>

                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => handleToggleStatus(award)}
                                                className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                                                    award.isActive 
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                                                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                                                }`}
                                            >
                                                {award.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>

                                        <td className="p-4 pr-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleOpenModal(award)}
                                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                                                    title="Edit Award"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(award._id)}
                                                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                                                    title="Delete Award"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add / Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <Award className="text-amber-400" size={24} />
                                    <h2 className="text-lg font-bold text-white">
                                        {editingAward ? 'Edit Award' : 'Create New Award'}
                                    </h2>
                                </div>
                                <button onClick={handleCloseModal} className="text-white/40 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                                {errorMsg && (
                                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-2xl">
                                        {errorMsg}
                                    </div>
                                )}

                                {successMsg && (
                                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-2xl">
                                        {successMsg}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Title */}
                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                                            Award Title <span className="text-rose-400">*</span>
                                        </label>
                                        <input 
                                            required
                                            type="text" 
                                            placeholder="e.g. ISOR Best Research Scientist Award"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500/50"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>

                                    {/* Awarded By */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                                            Awarded By <span className="text-rose-400">*</span>
                                        </label>
                                        <input 
                                            required
                                            type="text" 
                                            placeholder="Indian Society of Oilseeds Research (ICAR)"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500/50"
                                            value={formData.awardBy}
                                            onChange={e => setFormData({ ...formData, awardBy: e.target.value })}
                                        />
                                    </div>

                                    {/* Category */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                                            Category
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="Research Excellence / Young Scientist"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500/50"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        />
                                    </div>

                                    {/* Cash Prize / Rewards */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                                            Cash Prize / Reward Details
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="₹25,000 & Gold Medal"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500/50"
                                            value={formData.cashPrize}
                                            onChange={e => setFormData({ ...formData, cashPrize: e.target.value })}
                                        />
                                    </div>

                                    {/* Frequency */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                                            Frequency
                                        </label>
                                        <select 
                                            className="w-full bg-[#1e293b] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500/50"
                                            value={formData.frequency}
                                            onChange={e => setFormData({ ...formData, frequency: e.target.value })}
                                        >
                                            <option value="Annual">Annual</option>
                                            <option value="Biennial">Biennial (Every 2 Years)</option>
                                            <option value="Special">Special Recognition</option>
                                            <option value="Lifetime">Lifetime Achievement</option>
                                        </select>
                                    </div>

                                    {/* Application Deadline */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                                            Application Deadline
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="31st December 2026"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500/50"
                                            value={formData.applicationDeadline}
                                            onChange={e => setFormData({ ...formData, applicationDeadline: e.target.value })}
                                        />
                                    </div>

                                    {/* Order */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                                            Display Order
                                        </label>
                                        <input 
                                            type="number" 
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500/50"
                                            value={formData.order}
                                            onChange={e => setFormData({ ...formData, order: e.target.value })}
                                        />
                                    </div>

                                    {/* Eligibility */}
                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                                            Eligibility Criteria
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Open to all ISOR Life Members under 40 years of age"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500/50"
                                            value={formData.eligibility}
                                            onChange={e => setFormData({ ...formData, eligibility: e.target.value })}
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                                            Full Award Description & Rules
                                        </label>
                                        <textarea 
                                            rows={4}
                                            placeholder="Detailed information about award background, terms, selection process..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500/50"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>

                                    {/* Main Photo Upload */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider block">
                                            Main Photo / Emblem
                                        </label>
                                        <div className="flex items-center gap-3">
                                            {photoPreview && (
                                                <div className="w-12 h-12 rounded-xl border border-white/10 overflow-hidden bg-white/5 shrink-0">
                                                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                className="text-xs text-white/60 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20"
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                    </div>

                                    {/* Document File Upload */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider block">
                                            Application Form / Guidelines (PDF)
                                        </label>
                                        <input 
                                            type="file" 
                                            accept=".pdf,.doc,.docx"
                                            className="text-xs text-white/60 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20"
                                            onChange={e => setDocumentFile(e.target.files[0])}
                                        />
                                    </div>
                                </div>

                                {/* Active Switch */}
                                <div className="flex items-center gap-3 pt-2">
                                    <input 
                                        type="checkbox"
                                        id="isActiveToggle"
                                        className="w-4 h-4 rounded bg-white/5 border-white/10 text-amber-500 focus:ring-0"
                                        checked={formData.isActive}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    <label htmlFor="isActiveToggle" className="text-xs font-bold text-white cursor-pointer">
                                        Publish & Display on Public Website
                                    </label>
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                    <button 
                                        type="button" 
                                        onClick={handleCloseModal}
                                        className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-white/60 hover:bg-white/5"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={submitting}
                                        className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" size={16} /> : <Award size={16} />}
                                        {submitting ? 'Saving...' : editingAward ? 'Update Award' : 'Create Award'}
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

export default AwardManagement;
