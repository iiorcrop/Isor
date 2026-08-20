import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Users, 
    UserPlus, 
    Search, 
    ShieldCheck, 
    CheckCircle, 
    XCircle, 
    Trash2, 
    Edit, 
    Loader2, 
    X,
    User,
    Mail,
    Lock,
    Building2,
    Briefcase,
    BadgeCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserRoleManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'editor', // 'editor', 'reviewer', 'user'
        organization: '',
        designation: '',
        mobileNumber: '',
        city: ''
    });

    useEffect(() => {
        fetchUsers();
    }, [selectedRoleFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users?role=${selectedRoleFilter}&search=${searchQuery}`);
            setUsers(res.data || []);
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchUsers();
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/admin/users`, formData);
            setSuccessMsg(`${formData.role.toUpperCase()} account created successfully!`);
            setTimeout(() => {
                setIsModalOpen(false);
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    role: 'editor',
                    organization: '',
                    designation: '',
                    mobileNumber: '',
                    city: ''
                });
                fetchUsers();
            }, 800);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Error creating user account.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (user) => {
        try {
            const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
            await axios.put(`${import.meta.env.VITE_API_URL}/admin/users/${user._id}/role`, { status: newStatus });
            fetchUsers();
        } catch (err) {
            alert('Failed to update status.');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user account?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/admin/users/${id}`);
            fetchUsers();
        } catch (err) {
            alert('Failed to delete user.');
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-6 rounded-3xl border border-white/10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Editor & Reviewer Management</h1>
                        <p className="text-text-muted text-xs mt-1">Create and manage accounts for Manuscript Editors, Peer Reviewers, and System Users.</p>
                    </div>
                </div>

                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                >
                    <UserPlus size={18} /> Create Editor / Reviewer Account
                </button>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                    {['all', 'editor', 'reviewer', 'user'].map((r) => (
                        <button
                            key={r}
                            onClick={() => setSelectedRoleFilter(r)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                                selectedRoleFilter === r 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            {r === 'all' ? 'All Roles' : `${r}s`}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search by name, email, or org..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-xs text-white placeholder-white/40 focus:outline-none focus:border-indigo-500"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </form>
            </div>

            {/* User List Table */}
            <div className="bg-white/[0.02] rounded-3xl border border-white/5 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-white/40 flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin mb-3 text-indigo-400" size={28} />
                        <span className="text-xs font-medium">Loading users...</span>
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-12 text-center text-white/40">
                        <Users size={36} className="mx-auto mb-3 opacity-30 text-indigo-400" />
                        <p className="text-sm font-semibold text-white">No accounts found</p>
                        <p className="text-xs mt-1">Click "Create Editor / Reviewer Account" to add user access.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-bold text-white/40 uppercase tracking-wider">
                                    <th className="p-4 pl-6">User Name</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Organization & Designation</th>
                                    <th className="p-4 text-center">Status</th>
                                    <th className="p-4 pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-xs">
                                {users.map(u => (
                                    <tr key={u._id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4 pl-6 font-bold text-white flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-indigo-400">
                                                {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                            <div>
                                                <div>{u.name}</div>
                                                <div className="text-[10px] text-white/40 font-normal">{u.city || ''}</div>
                                            </div>
                                        </td>

                                        <td className="p-4 text-white/70 font-mono text-[11px]">
                                            {u.email}
                                        </td>

                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                u.role === 'editor' 
                                                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                                                    : u.role === 'reviewer'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                                {u.role}
                                            </span>
                                        </td>

                                        <td className="p-4 text-white/70">
                                            <div className="font-semibold text-white/90">{u.designation || 'N/A'}</div>
                                            <div className="text-[10px] text-white/40">{u.organization || 'N/A'}</div>
                                        </td>

                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => handleToggleStatus(u)}
                                                className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                                                    u.status === 'Active' 
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                                                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                                                }`}
                                            >
                                                {u.status || 'Active'}
                                            </button>
                                        </td>

                                        <td className="p-4 pr-6 text-right">
                                            <button 
                                                onClick={() => handleDeleteUser(u._id)}
                                                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                                                title="Delete Account"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Account Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl my-8"
                        >
                            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <UserPlus className="text-indigo-400" size={24} />
                                    <h2 className="text-lg font-bold text-white">
                                        Create Editor / Reviewer Account
                                    </h2>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
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
                                    {/* Role Selector */}
                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                                            Assign Account Role <span className="text-rose-400">*</span>
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, role: 'editor' })}
                                                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                                                    formData.role === 'editor' 
                                                        ? 'bg-purple-600 text-white border-purple-500 shadow-md' 
                                                        : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                                                }`}
                                            >
                                                <BadgeCheck size={16} /> Editor Role
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, role: 'reviewer' })}
                                                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                                                    formData.role === 'reviewer' 
                                                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md' 
                                                        : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                                                }`}
                                            >
                                                <ShieldCheck size={16} /> Reviewer Role
                                            </button>
                                        </div>
                                    </div>

                                    {/* Name */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                                            Full Name <span className="text-rose-400">*</span>
                                        </label>
                                        <input 
                                            required
                                            type="text" 
                                            placeholder="Dr. Editor Name"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                                            Email Address <span className="text-rose-400">*</span>
                                        </label>
                                        <input 
                                            required
                                            type="email" 
                                            placeholder="editor@isor.in"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                                            Password <span className="text-rose-400">*</span>
                                        </label>
                                        <input 
                                            required
                                            type="password" 
                                            placeholder="••••••••"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>

                                    {/* Mobile */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                                            Mobile Number
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="+91 9876543210"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                                            value={formData.mobileNumber}
                                            onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })}
                                        />
                                    </div>

                                    {/* Organization */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                                            Organization / Institution
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="ICAR-IIOR Hyderabad"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                                            value={formData.organization}
                                            onChange={e => setFormData({ ...formData, organization: e.target.value })}
                                        />
                                    </div>

                                    {/* Designation */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                                            Designation
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="Senior Editor / Principal Scientist"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                                            value={formData.designation}
                                            onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-white/60 hover:bg-white/5"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={submitting}
                                        className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={16} />}
                                        {submitting ? 'Creating...' : `Create ${formData.role.toUpperCase()} Account`}
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

export default UserRoleManagement;
