import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Save, 
    Plus, 
    Trash2, 
    Loader2, 
    CheckCircle, 
    Info, 
    BarChart, 
    Bell,
    X,
    Calendar,
    Type,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HomeContentSettings = () => {
    const [activeTab, setActiveTab] = useState('about');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [saving, setSaving] = useState(false);

    // Data states
    const [about, setAbout] = useState({ title: '', content: [] });
    const [stats, setStats] = useState([]);
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [aboutRes, statsRes, annRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/home-content/about`),
                axios.get(`${import.meta.env.VITE_API_URL}/home-content/stats`),
                axios.get(`${import.meta.env.VITE_API_URL}/home-content/announcements`)
            ]);
            setAbout(aboutRes.data);
            setStats(statsRes.data);
            setAnnouncements(annRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch data', err);
            setLoading(false);
        }
    };

    const handleSaveAbout = async () => {
        setSaving(true);
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/home-content/about`, about);
            setMessage('About content saved!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) { console.error(err); }
        setSaving(false);
    };

    const addStat = async () => {
        const newStat = { label: 'New Stat', value: '0', order: stats.length };
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/home-content/stats`, newStat);
        setStats([...stats, res.data]);
    };

    const deleteStat = async (id) => {
        await axios.delete(`http://localhost:5000/api/home-content/stats/${id}`);
        setStats(stats.filter(s => s._id !== id));
    };

    const updateStat = async (id, data) => {
        await axios.put(`http://localhost:5000/api/home-content/stats/${id}`, data);
        fetchData();
    };

    const addAnnouncement = async () => {
        const newAnn = { title: 'New Announcement', date: new Date(), badge: 'New', badgeColor: 'success' };
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/home-content/announcements`, newAnn);
        setAnnouncements([res.data, ...announcements]);
    };

    const deleteAnnouncement = async (id) => {
        await axios.delete(`http://localhost:5000/api/home-content/announcements/${id}`);
        setAnnouncements(announcements.filter(a => a._id !== id));
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <header>
                <h1 className="text-3xl font-bold text-white">Homepage Content</h1>
                <p className="text-text-muted mt-1">Manage the core sections of your landing page.</p>
            </header>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/5 pb-px">
                {[
                    { id: 'about', label: 'About Section', icon: Info },
                    { id: 'stats', label: 'Statistics Cards', icon: BarChart },
                    { id: 'news', label: 'Announcements', icon: Bell }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 font-bold transition-all relative ${activeTab === tab.id ? 'text-primary' : 'text-white/40 hover:text-white'}`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                        {activeTab === tab.id && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
                    </button>
                ))}
            </div>

            {message && (
                <div className="bg-success/10 text-success p-4 rounded-xl border border-success/20 flex items-center gap-2">
                    <CheckCircle size={18} /> {message}
                </div>
            )}

            <div className="mt-8">
                {activeTab === 'about' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 bg-[#0f172a] p-8 rounded-3xl border border-white/5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Section Title</label>
                            <input 
                                type="text" 
                                value={about.title} 
                                onChange={(e) => setAbout({...about, title: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-primary text-xl font-bold"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Content Paragraphs</label>
                            {about.content.map((p, i) => (
                                <div key={i} className="relative group">
                                    <textarea 
                                        value={p}
                                        onChange={(e) => {
                                            const newContent = [...about.content];
                                            newContent[i] = e.target.value;
                                            setAbout({...about, content: newContent});
                                        }}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-primary min-h-[120px] pr-12"
                                    />
                                    <button 
                                        onClick={() => {
                                            const newContent = about.content.filter((_, index) => index !== i);
                                            setAbout({...about, content: newContent});
                                        }}
                                        className="absolute top-4 right-4 text-white/20 hover:text-danger"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            ))}
                            <button 
                                onClick={() => setAbout({...about, content: [...about.content, '']})}
                                className="w-full py-4 border-2 border-dashed border-white/5 rounded-xl text-white/20 hover:text-white hover:border-white/10 transition-all font-bold"
                            >
                                + Add Paragraph
                            </button>
                        </div>
                        <button onClick={handleSaveAbout} disabled={saving} className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 shadow-lg ml-auto">
                            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                            Save About Section
                        </button>
                    </motion.div>
                )}

                {activeTab === 'stats' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Impact Counters</h2>
                            <button onClick={addStat} className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm"><Plus size={16} /> Add Stat</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {stats.map((stat) => (
                                <div key={stat._id} className="bg-[#0f172a] p-6 rounded-3xl border border-white/5 space-y-4">
                                    <input 
                                        type="text" 
                                        value={stat.value} 
                                        onChange={(e) => updateStat(stat._id, { ...stat, value: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-2xl font-bold text-primary text-center outline-none"
                                        placeholder="Value (e.g. 42+)"
                                    />
                                    <input 
                                        type="text" 
                                        value={stat.label} 
                                        onChange={(e) => updateStat(stat._id, { ...stat, label: e.target.value })}
                                        className="w-full bg-transparent text-white/60 text-center outline-none uppercase text-xs font-bold tracking-widest"
                                        placeholder="Label"
                                    />
                                    <button onClick={() => deleteStat(stat._id)} className="w-full text-danger/40 hover:text-danger text-xs font-bold pt-2 border-t border-white/5">Remove</button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'news' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">News & Announcements Sidebar</h2>
                            <button onClick={addAnnouncement} className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm"><Plus size={16} /> New Entry</button>
                        </div>
                        <div className="bg-[#0f172a] rounded-3xl border border-white/5 overflow-hidden">
                            {announcements.map((ann, i) => (
                                <div key={ann._id} className={`p-6 flex items-center gap-6 border-b border-white/5 group hover:bg-white/5 transition-all ${!ann.isActive ? 'opacity-50' : ''}`}>
                                    <div className="flex-1 space-y-2">
                                        <input 
                                            type="text" 
                                            value={ann.title} 
                                            onChange={(e) => {
                                                const newAnn = [...announcements];
                                                newAnn[i].title = e.target.value;
                                                setAnnouncements(newAnn);
                                            }}
                                            onBlur={() => axios.put(`http://localhost:5000/api/home-content/announcements/${ann._id}`, ann)}
                                            className="w-full bg-transparent text-white font-bold outline-none group-hover:text-primary transition-colors"
                                        />
                                        <div className="flex items-center gap-4">
                                            <input 
                                                type="date" 
                                                value={ann.date ? new Date(ann.date).toISOString().split('T')[0] : ''} 
                                                onChange={(e) => {
                                                    const newAnn = [...announcements];
                                                    newAnn[i].date = e.target.value;
                                                    setAnnouncements(newAnn);
                                                    axios.put(`http://localhost:5000/api/home-content/announcements/${ann._id}`, { date: e.target.value });
                                                }}
                                                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/40 outline-none"
                                            />
                                            <select 
                                                value={ann.badge}
                                                onChange={(e) => {
                                                    const newAnn = [...announcements];
                                                    newAnn[i].badge = e.target.value;
                                                    setAnnouncements(newAnn);
                                                    axios.put(`http://localhost:5000/api/home-content/announcements/${ann._id}`, { badge: e.target.value });
                                                }}
                                                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/40 outline-none"
                                            >
                                                <option value="New">New</option>
                                                <option value="Important">Important</option>
                                                <option value="Urgent">Urgent</option>
                                                <option value="Update">Update</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button onClick={() => deleteAnnouncement(ann._id)} className="p-3 text-white/20 hover:text-danger hover:bg-danger/10 rounded-xl transition-all"><Trash2 size={18} /></button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default HomeContentSettings;
