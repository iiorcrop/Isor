import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getServerUrl } from '../utils/urlHelper';

import { Users, Plus, Trash2, Award, BookOpen, Shield, History, Pencil, Eye, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CommitteeSettings = () => {
    const [activeTab, setActiveTab] = useState('Executive');
    const [members, setMembers] = useState([]);
    const [filterPeriod, setFilterPeriod] = useState('ALL');
    const [editingMember, setEditingMember] = useState(null);
    const [viewingMember, setViewingMember] = useState(null);
    const [newMember, setNewMember] = useState({ 
        name: '', 
        designation: '', 
        organization: '', 
        period: '2024-2026', 
        subGroup: '',
        committeeType: 'Executive',
        order: 0
    });
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);

    const tabs = [
        { id: 'Executive', label: 'Executive Committee', icon: Shield },
        { id: 'Editorial', label: 'Editorial Committee', icon: BookOpen },
        { id: 'Advisory', label: 'Advisory Board', icon: Award },
        { id: 'PastPresidents', label: 'Past Presidents', icon: History }
    ];

    const defaultDesignations = [
        'PRESIDENT', 'VICE-PRESIDENT', 'GENERAL SECRETARY', 'JOINT SECRETARY', 
        'TREASURER', 'EDITOR-IN-CHIEF', 'ASSOCIATE EDITOR', 'EXECUTIVE MEMBER', 
        'ADVISORY MEMBER', 'COUNCILLOR', 'PAST PRESIDENT'
    ];

    const [designationOptions, setDesignationOptions] = useState(defaultDesignations);

    useEffect(() => {
        fetchMembers();
    }, [activeTab]);

    const periods = [...new Set(members.map(m => m.period))].sort().reverse();

    useEffect(() => {
        if (periods.length > 0 && filterPeriod === 'ALL') {
            setFilterPeriod(periods[0]); // Default to latest period on tab change
        }
    }, [members]);

    useEffect(() => {
        // Derive unique designations from current data
        const uniqueInDb = [...new Set(members.map(m => m.designation))].filter(Boolean);
        const combined = [...new Set([...defaultDesignations, ...uniqueInDb])];
        setDesignationOptions(combined);
    }, [members]);

    const fetchMembers = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/committees/${activeTab}`);
            setMembers(res.data);
        } catch (err) { console.error(err); }
    };

    const handleEdit = (member) => {
        setEditingMember(member);
        setNewMember({
            name: member.name,
            designation: member.designation,
            organization: member.organization || '',
            period: member.period || '',
            subGroup: member.subGroup || '',
            committeeType: member.committeeType,
            order: member.order || 0
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingMember(null);
        setNewMember({ name: '', designation: '', organization: '', period: '2024-2026', subGroup: '', committeeType: activeTab, order: 0 });
        setPhoto(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        Object.keys(newMember).forEach(key => formData.append(key, newMember[key]));
        formData.set('committeeType', activeTab);
        if (photo) formData.append('photo', photo);

        try {
            if (editingMember) {
                if (!editingMember._id) throw new Error('Member ID is missing');
                await axios.post(`${import.meta.env.VITE_API_URL}/committees/update-member/${editingMember._id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/committees`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            cancelEdit();
            fetchMembers();
            setLoading(false);
        } catch (err) {
            console.error('Submit error:', err);
            alert(err.response?.data?.message || err.message || 'Failed to process request');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this member?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/committees/${id}`);
            fetchMembers();
        } catch (err) { alert('Failed to delete'); }
    };

    const filteredMembers = filterPeriod === 'ALL' ? members : members.filter(m => m.period === filterPeriod);

    return (
        <div className="p-8 space-y-8 relative">
            <header>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Users className="text-primary" /> Committee Management
                </h1>
                <p className="text-text-muted mt-2">Manage members for all organizational boards and committees.</p>
            </header>

            {/* Tabs */}
            <div className="flex flex-wrap gap-4 bg-[#0f172a] p-2 rounded-2xl border border-white/5">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id);
                            setFilterPeriod('ALL');
                            cancelEdit();
                        }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                            activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:bg-white/5'
                        }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add/Edit Member Form */}
                <div className="bg-[#0f172a] border border-white/5 p-8 rounded-[2rem] h-fit sticky top-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            {editingMember ? <Pencil size={20} className="text-amber-500" /> : <Plus size={20} className="text-primary" />}
                            {editingMember ? 'Edit Member' : 'Add New Member'}
                        </h2>
                        {editingMember && (
                            <button onClick={cancelEdit} className="text-white/40 hover:text-white">
                                <X size={20} />
                            </button>
                        )}
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Photo (Optional)</label>
                            <input 
                                type="file" 
                                accept="image/*"
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white file:bg-primary file:border-none file:text-white file:px-3 file:py-1 file:rounded-lg file:mr-3 file:cursor-pointer"
                                onChange={e => setPhoto(e.target.files[0])}
                            />
                            {editingMember?.photoUrl && !photo && (
                                <p className="text-[10px] text-primary mt-1">Current photo will be kept if none selected</p>
                            )}
                        </div>
                        <div className="flex gap-4">
                            <div className="space-y-1 flex-1">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Full Name</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary"
                                    value={newMember.name}
                                    onChange={e => setNewMember({...newMember, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1 w-24">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Order</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary"
                                    value={newMember.order}
                                    onChange={e => setNewMember({...newMember, order: parseInt(e.target.value)})}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Designation</label>
                            <select 
                                required
                                className="w-full bg-[#1e293b] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary appearance-none cursor-pointer"
                                value={newMember.designation}
                                onChange={e => setNewMember({...newMember, designation: e.target.value})}
                            >
                                <option value="">Select Designation</option>
                                {designationOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                                <option value="CUSTOM">+ Add Custom...</option>
                            </select>
                            {newMember.designation === 'CUSTOM' && (
                                <input 
                                    autoFocus
                                    type="text"
                                    placeholder="Enter custom designation"
                                    className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary"
                                    onBlur={(e) => {
                                        if(e.target.value) {
                                            setNewMember({...newMember, designation: e.target.value.toUpperCase()});
                                            if(!designationOptions.includes(e.target.value.toUpperCase())) {
                                                setDesignationOptions([...designationOptions, e.target.value.toUpperCase()]);
                                            }
                                        } else {
                                            setNewMember({...newMember, designation: ''});
                                        }
                                    }}
                                />
                            )}
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Tenure Period</label>
                            <input 
                                type="text" 
                                placeholder="e.g. 2024-2026"
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary"
                                value={newMember.period}
                                onChange={e => setNewMember({...newMember, period: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Sub-Group / Section</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Associate Editors, Central Zone"
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary"
                                value={newMember.subGroup}
                                onChange={e => setNewMember({...newMember, subGroup: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Organization</label>
                            <textarea 
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary min-h-[100px]"
                                value={newMember.organization}
                                onChange={e => setNewMember({...newMember, organization: e.target.value})}
                            />
                        </div>
                        <button 
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                                editingMember ? 'bg-amber-500 text-white' : 'bg-primary text-white'
                            }`}
                        >
                            {loading ? (editingMember ? 'Updating...' : 'Adding...') : (
                                <>
                                    {editingMember ? <Check size={18} /> : <Plus size={18} />}
                                    {editingMember ? 'Update Member' : 'Add to Committee'}
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Member List */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Period Filter Bar */}
                    {periods.length > 0 && (
                        <div className="flex items-center gap-3 bg-[#0f172a] p-2 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-4">Tenure Groups:</span>
                            <button 
                                onClick={() => setFilterPeriod('ALL')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                    filterPeriod === 'ALL' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
                                }`}
                            >
                                All Data
                            </button>
                            {periods.map(p => (
                                <button 
                                    key={p}
                                    onClick={() => setFilterPeriod(p)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                        filterPeriod === p ? 'bg-primary/20 text-primary border border-primary/20' : 'text-white/40 hover:text-white/60'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    )}

                    <AnimatePresence mode='popLayout'>
                        {filteredMembers.map((member, index) => (
                            <motion.div
                                key={member._id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-[#0f172a] border border-white/5 p-6 rounded-[1.5rem] flex items-center justify-between group hover:border-primary/30 transition-all"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 overflow-hidden border border-white/5 shadow-lg">
                                        {member.photoUrl ? (
                                            <img src={getServerUrl(member.photoUrl)} alt={member.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-primary font-bold text-xl bg-primary/5">
                                                {member.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-white font-bold text-lg">{member.name}</h3>
                                            {member.period && (
                                                <span className="text-[10px] bg-white/5 text-white/40 px-2 py-0.5 rounded-full font-mono">{member.period}</span>
                                            )}
                                        </div>
                                        <p className="text-primary text-xs font-bold uppercase tracking-widest">{member.designation}</p>
                                        <p className="text-text-muted text-xs mt-1 line-clamp-1 max-w-[300px]">{member.organization}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                    <button 
                                        onClick={() => setViewingMember(member)}
                                        className="p-3 bg-white/5 text-white/60 rounded-xl hover:bg-white/10 hover:text-white transition-all"
                                        title="View Details"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleEdit(member)}
                                        className="p-3 bg-amber-500/10 text-amber-500 rounded-xl hover:bg-amber-500 hover:text-white transition-all"
                                        title="Edit Member"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(member._id)}
                                        className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                        title="Delete Member"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {members.length === 0 && (
                        <div className="p-20 text-center bg-[#0f172a] border border-white/5 rounded-[2rem]">
                            <Users size={48} className="mx-auto text-white/5 mb-4" />
                            <p className="text-text-muted font-medium">No members added to this committee yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* View Modal */}
            <AnimatePresence>
                {viewingMember && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setViewingMember(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-[#0f172a] border border-white/10 rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl relative z-10"
                        >
                            <div className="h-32 bg-gradient-to-r from-primary/20 to-amber-500/20 relative">
                                <button 
                                    onClick={() => setViewingMember(null)}
                                    className="absolute top-6 right-6 w-10 h-10 bg-black/20 text-white rounded-full flex items-center justify-center hover:bg-black/40 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="px-10 pb-10 relative">
                                <div className="absolute -top-16 left-10">
                                    <div className="w-32 h-32 rounded-[2rem] bg-[#0f172a] p-1 shadow-2xl">
                                        <div className="w-full h-full rounded-[1.8rem] bg-white/5 overflow-hidden border border-white/10">
                                            {viewingMember.photoUrl ? (
                                                <img src={getServerUrl(viewingMember.photoUrl)} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-4xl text-primary font-bold">
                                                    {viewingMember.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="pt-20">
                                    <h2 className="text-3xl font-bold text-white">{viewingMember.name}</h2>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-primary font-bold tracking-widest text-xs uppercase">{viewingMember.designation}</span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                                        <span className="text-white/40 font-mono text-xs">{viewingMember.period}</span>
                                    </div>
                                    
                                    <div className="mt-8 space-y-6">
                                        {viewingMember.subGroup && (
                                            <div>
                                                <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-1">Section / Sub-Group</label>
                                                <p className="text-amber-500/80 font-bold">{viewingMember.subGroup}</p>
                                            </div>
                                        )}
                                        <div>
                                            <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-1">Organization / Affiliation</label>
                                            <p className="text-white/80 leading-relaxed italic">{viewingMember.organization}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-1">Committee Type</label>
                                            <div className="inline-flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 mt-1">
                                                <Check size={14} className="text-primary" />
                                                <span className="text-white/60 text-xs font-bold uppercase">{viewingMember.committeeType}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CommitteeSettings;
