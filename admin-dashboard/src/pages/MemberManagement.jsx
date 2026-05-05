import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Users, 
    Search, 
    Filter, 
    Download, 
    CheckCircle, 
    XCircle, 
    Eye,
    Clock,
    UserCheck,
    Mail,
    X,
    MapPin,
    Briefcase,
    GraduationCap,
    Award,
    Phone,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MemberManagement = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ type: 'All', status: 'All', search: '' });
    const [selectedMember, setSelectedMember] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetchMembers();
    }, [filter]);

    const fetchMembers = async () => {
        try {
            const res = await axios.get('/api/admin/members', {
                params: filter
            });
            setMembers(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch members', err);
            setLoading(false);
        }
    };

    const updateStatus = async (id, updates) => {
        setUpdatingId(id);
        try {
            const res = await axios.patch(`/api/admin/members/${id}/status`, updates);
            // Immediately update local state from API response for instant UI feedback
            setMembers(prev => prev.map(m => m._id === id ? { ...m, ...res.data } : m));
        } catch (err) {
            console.error('Update failed:', err.response?.data || err.message);
            alert('Failed to update: ' + (err.response?.data?.message || err.message));
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="space-y-8 p-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Member Management</h1>
                    <p className="text-text-muted mt-1">Manage enrollments, verify payments, and approve members.</p>
                </div>
                <button className="bg-[#b47c1c] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#9a6a18] transition-all">
                    <Download size={18} />
                    Export Report
                </button>
            </header>

            {/* Filters Bar */}
            <div className="bg-[#0f172a] border border-white/5 p-4 rounded-2xl flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[300px] relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name, email, or ID..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-all"
                        value={filter.search}
                        onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-white/30" />
                    <select 
                        className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none"
                        value={filter.type}
                        onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                    >
                        <option value="All" className="bg-[#0f172a]">All Types</option>
                        <option value="Annual" className="bg-[#0f172a]">Annual</option>
                        <option value="Life" className="bg-[#0f172a]">Life</option>
                        <option value="Student" className="bg-[#0f172a]">Student</option>
                    </select>
                    <select 
                        className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none"
                        value={filter.status}
                        onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                    >
                        <option value="All" className="bg-[#0f172a]">All Status</option>
                        <option value="Pending" className="bg-[#0f172a]">Pending Approval</option>
                        <option value="Approved" className="bg-[#0f172a]">Approved</option>
                        <option value="Rejected" className="bg-[#0f172a]">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Members Table */}
            <div className="bg-[#0f172a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="p-6 text-xs uppercase font-bold text-white/40 tracking-widest">Member Info</th>
                                <th className="p-6 text-xs uppercase font-bold text-white/40 tracking-widest">Type</th>
                                <th className="p-6 text-xs uppercase font-bold text-white/40 tracking-widest text-center">Payment</th>
                                <th className="p-6 text-xs uppercase font-bold text-white/40 tracking-widest text-center">Membership</th>
                                <th className="p-6 text-xs uppercase font-bold text-white/40 tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {members.map((member) => (
                                <tr key={member._id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {member.firstName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-white font-bold">{member.title} {member.firstName} {member.lastName}</div>
                                                <div className="text-xs text-text-muted flex flex-col gap-0.5">
                                                    <span className="flex items-center gap-1"><Mail size={12} /> {member.email}</span>
                                                    <span className="flex items-center gap-1 font-mono text-[10px] text-primary/80"><Phone size={12} /> {member.mobileNumber}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                                            member.membershipType === 'Life' ? 'bg-amber-500/10 text-amber-500' :
                                            member.membershipType === 'Annual' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'
                                        }`}>
                                            {member.membershipType}
                                        </span>
                                    </td>
                                    <td className="p-6 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                                member.paymentStatus === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' :
                                                member.paymentStatus === 'Rejected' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                                            }`}>
                                                {member.paymentStatus}
                                            </span>
                                            {member.paymentStatus === 'Pending' && (
                                                <div className="flex gap-1 mt-1">
                                                    <button onClick={() => updateStatus(member._id, { paymentStatus: 'Completed', isVerified: true })} className="p-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-all"><CheckCircle size={10} /></button>
                                                    <button onClick={() => updateStatus(member._id, { paymentStatus: 'Rejected' })} className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-all"><XCircle size={10} /></button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-6 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                            member.approvalStatus === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                            member.approvalStatus === 'Rejected' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                        }`}>
                                            {member.approvalStatus || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {(!member.approvalStatus || member.approvalStatus === 'Pending') && member.paymentStatus === 'Completed' && (
                                                <button 
                                                    disabled={updatingId === member._id}
                                                    onClick={() => updateStatus(member._id, { approvalStatus: 'Approved' })}
                                                    className={`px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:scale-105 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 ${updatingId === member._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    {updatingId === member._id ? (
                                                        <>
                                                            <Loader2 size={14} className="animate-spin" />
                                                            Processing...
                                                        </>
                                                    ) : 'Approve Member'}
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => setSelectedMember(member)}
                                                className="p-2 bg-white/5 text-white/60 rounded-lg hover:bg-white/10 hover:text-white transition-all"
                                                title="View Full Profile"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {members.length === 0 && !loading && (
                    <div className="p-20 text-center space-y-4">
                        <Users size={48} className="mx-auto text-white/10" />
                        <p className="text-text-muted">No members found matching your criteria.</p>
                    </div>
                )}
            </div>

            {/* Full Details Modal */}
            <AnimatePresence>
                {selectedMember && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedMember(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-4xl bg-[#0f172a] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <button 
                                onClick={() => setSelectedMember(null)}
                                className="absolute right-6 top-6 p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition-all z-10"
                            >
                                <X size={24} />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 h-[85vh]">
                                {/* Info Panel */}
                                <div className="p-10 overflow-y-auto space-y-10 border-r border-white/5 custom-scrollbar">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 bg-primary/20 rounded-[2rem] flex items-center justify-center text-primary text-3xl font-bold">
                                            {selectedMember.firstName.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white leading-tight">
                                                {selectedMember.title} {selectedMember.firstName} {selectedMember.lastName}
                                            </h2>
                                            <p className="text-primary font-mono text-xs uppercase tracking-[0.2em] mt-1">{selectedMember.membershipId}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-8">
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Briefcase size={14} className="text-primary" /> Professional Profile
                                            </h4>
                                            <div className="space-y-3 pl-6">
                                                <div>
                                                    <p className="text-xs text-text-muted">Designation</p>
                                                    <p className="text-white font-medium">{selectedMember.designation || 'Not specified'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-text-muted">Organization</p>
                                                    <p className="text-white font-medium">{selectedMember.organization || 'Not specified'}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs text-text-muted">Qualification</p>
                                                        <p className="text-white font-medium">{selectedMember.qualification || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-text-muted">Specialization</p>
                                                        <p className="text-white font-medium">{selectedMember.specialization || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Mail size={14} className="text-primary" /> Contact Details
                                            </h4>
                                            <div className="space-y-3 pl-6">
                                                <div>
                                                    <p className="text-xs text-text-muted">Email Address</p>
                                                    <p className="text-white font-medium">{selectedMember.email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-text-muted">Mobile Number</p>
                                                    <p className="text-white font-medium font-mono">{selectedMember.mobileNumber || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-text-muted">Mailing Address</p>
                                                    <p className="text-white font-medium leading-relaxed">{selectedMember.address || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Award size={14} className="text-primary" /> Membership Info
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4 pl-6">
                                                <div>
                                                    <p className="text-xs text-text-muted">Category</p>
                                                    <p className="text-white font-bold">{selectedMember.membershipType}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-text-muted">Payment Status</p>
                                                    <p className={`font-bold ${selectedMember.paymentStatus === 'Completed' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                        {selectedMember.paymentStatus}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Proof Panel */}
                                <div className="bg-[#0b1222] p-10 flex flex-col items-center justify-center space-y-6">
                                    <div className="text-center space-y-2">
                                        <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Payment Evidence</h4>
                                        <p className="text-xs text-text-muted">Proof uploaded during enrollment</p>
                                    </div>
                                    <div className="flex-1 w-full rounded-2xl overflow-hidden border border-white/5 bg-black/20 flex items-center justify-center">
                                        {selectedMember.paymentProofUrl ? (
                                            selectedMember.paymentProofUrl.toLowerCase().endsWith('.pdf') ? (
                                                <div className="text-center space-y-4">
                                                    <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
                                                        <CheckCircle size={40} />
                                                    </div>
                                                    <p className="text-white font-bold">PDF Document Uploaded</p>
                                                    <a 
                                                        href={`/${selectedMember.paymentProofUrl}`}
                                                        target="_blank"
                                                        className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all"
                                                    >
                                                        Download PDF
                                                    </a>
                                                </div>
                                            ) : (
                                                    <img 
                                                        src={`/${selectedMember.paymentProofUrl}`} 
                                                    alt="Payment Proof" 
                                                    className="max-w-full max-h-full object-contain"
                                                />
                                            )
                                        ) : (
                                            <div className="text-center text-white/20">
                                                <Image size={64} className="mx-auto mb-4 opacity-10" />
                                                <p>No proof uploaded</p>
                                            </div>
                                        )}
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

export default MemberManagement;
