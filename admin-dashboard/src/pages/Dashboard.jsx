import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Users, BookOpen, Mail, Clock,
    CheckCircle, XCircle, TrendingUp,
    FileText, Newspaper, Image,
    ArrowUpRight, RefreshCw, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, subtitle, icon: Icon, color, delay = 0, loading }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-[#0f172a] border border-white/5 rounded-3xl p-6 flex flex-col gap-4 hover:border-white/10 transition-all group"
    >
        <div className="flex justify-between items-start">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                <Icon size={22} />
            </div>
            <ArrowUpRight size={16} className="text-white/10 group-hover:text-white/40 transition-colors" />
        </div>
        <div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
            {loading ? (
                <div className="h-8 w-16 bg-white/5 rounded-lg animate-pulse" />
            ) : (
                <h3 className="text-3xl font-bold text-white">{value}</h3>
            )}
            {subtitle && <p className="text-white/30 text-xs mt-1">{subtitle}</p>}
        </div>
    </motion.div>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentMembers, setRecentMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            const [membersRes, journalsRes, contactRes, newsRes] = await Promise.allSettled([
                axios.get('/api/admin/members'),
                axios.get('/api/journal/admin'),
                axios.get('/api/contact'),
                axios.get('/api/news/admin'),
            ]);

            const members = membersRes.status === 'fulfilled' ? membersRes.value.data : [];
            const journals = journalsRes.status === 'fulfilled' ? journalsRes.value.data : [];
            const contacts = contactRes.status === 'fulfilled' ? contactRes.value.data : [];
            const news = newsRes.status === 'fulfilled' ? newsRes.value.data : [];

            setStats({
                totalMembers: members.length,
                approvedMembers: members.filter(m => m.approvalStatus === 'Approved').length,
                pendingMembers: members.filter(m => (!m.approvalStatus || m.approvalStatus === 'Pending') && m.paymentStatus === 'Completed').length,
                totalJournals: journals.length,
                totalContacts: contacts.length,
                unreadContacts: contacts.filter(c => c.status === 'Pending' || !c.status).length,
                totalNews: news.length,
                activeNews: news.filter(n => n.isActive).length,
            });

            setRecentMembers(members.slice(0, 5));
        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchStats();
    };

    return (
        <div className="p-8 space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
                    <p className="text-white/40 mt-1 text-sm">Welcome back — here's what's happening with ISOR.</p>
                </div>
                <button 
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all border border-white/5 disabled:opacity-50"
                >
                    <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                    title="Total Members"
                    value={stats?.totalMembers ?? '—'}
                    subtitle={`${stats?.approvedMembers ?? 0} approved`}
                    icon={Users}
                    color="text-blue-400"
                    delay={0}
                    loading={loading}
                />
                <StatCard
                    title="Pending Approval"
                    value={stats?.pendingMembers ?? '—'}
                    subtitle="Payment verified, awaiting approval"
                    icon={Clock}
                    color="text-amber-400"
                    delay={0.1}
                    loading={loading}
                />
                <StatCard
                    title="Journal Volumes"
                    value={stats?.totalJournals ?? '—'}
                    subtitle="Published archives"
                    icon={BookOpen}
                    color="text-emerald-400"
                    delay={0.2}
                    loading={loading}
                />
                <StatCard
                    title="Contact Inquiries"
                    value={stats?.totalContacts ?? '—'}
                    subtitle={`${stats?.unreadContacts ?? 0} unread`}
                    icon={Mail}
                    color="text-purple-400"
                    delay={0.3}
                    loading={loading}
                />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <StatCard
                    title="News Items"
                    value={stats?.totalNews ?? '—'}
                    subtitle={`${stats?.activeNews ?? 0} active`}
                    icon={Newspaper}
                    color="text-pink-400"
                    delay={0.4}
                    loading={loading}
                />
                <StatCard
                    title="Approved Members"
                    value={stats?.approvedMembers ?? '—'}
                    subtitle="Full member access"
                    icon={CheckCircle}
                    color="text-emerald-400"
                    delay={0.5}
                    loading={loading}
                />
                <StatCard
                    title="System Status"
                    value="Online"
                    subtitle="All services running"
                    icon={TrendingUp}
                    color="text-green-400"
                    delay={0.6}
                    loading={false}
                />
            </div>

            {/* Recent Members Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-[#0f172a] border border-white/5 rounded-3xl overflow-hidden"
            >
                <div className="p-6 flex items-center justify-between border-b border-white/5">
                    <h2 className="text-lg font-bold text-white">Recent Enrollments</h2>
                    <a href="#members" className="text-xs font-bold text-primary hover:underline">View all →</a>
                </div>

                {loading ? (
                    <div className="flex justify-center p-16">
                        <Loader2 size={32} className="animate-spin text-white/20" />
                    </div>
                ) : recentMembers.length === 0 ? (
                    <div className="p-16 text-center">
                        <Users size={40} className="mx-auto text-white/10 mb-3" />
                        <p className="text-white/30 text-sm">No members yet</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02] text-[10px] text-white/30 font-bold uppercase tracking-widest">
                                <th className="px-6 py-4">Member</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Payment</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Enrolled</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {recentMembers.map((m) => (
                                <tr key={m._id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                                                {m.firstName?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-white font-semibold text-sm">{m.title} {m.firstName} {m.lastName}</p>
                                                <p className="text-white/30 text-xs">{m.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                            m.membershipType === 'Life' ? 'bg-amber-500/10 text-amber-500' :
                                            m.membershipType === 'Annual' ? 'bg-blue-500/10 text-blue-500' :
                                            'bg-emerald-500/10 text-emerald-500'
                                        }`}>{m.membershipType}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold ${
                                            m.paymentStatus === 'Completed' ? 'text-emerald-400' :
                                            m.paymentStatus === 'Rejected' ? 'text-red-400' : 'text-amber-400'
                                        }`}>{m.paymentStatus}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                            m.approvalStatus === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' :
                                            m.approvalStatus === 'Rejected' ? 'bg-red-500/10 text-red-500' :
                                            'bg-amber-500/10 text-amber-500'
                                        }`}>{m.approvalStatus || 'Pending'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-white/30 text-xs">
                                        {new Date(m.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </motion.div>
        </div>
    );
};

export default Dashboard;
