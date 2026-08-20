import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    User, Mail, Phone, MapPin, 
    Award, ShieldCheck, Download, Eye,
    LogOut, Calendar, Briefcase,
    ChevronRight, BookOpen, GraduationCap,
    Edit3, X, Check, Search, FileText, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MemberCertificate from '../components/MemberCertificate';
import { getServerUrl } from '../utils/urlHelper';
import { fetchLocationByPincode } from '../utils/pincodeService';

import { Link } from 'react-router-dom';

const MemberDashboard = () => {
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [showCert, setShowCert] = useState(false);
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'journals'
    const [journals, setJournals] = useState([]);
    const [journalSearch, setJournalSearch] = useState('');
    const [loadingJournals, setLoadingJournals] = useState(false);

    // Edit Profile Modal State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [stateOptions, setStateOptions] = useState([]);
    const [districtOptions, setDistrictOptions] = useState([]);
    const [mandalOptions, setMandalOptions] = useState([]);
    const [fetchingPincode, setFetchingPincode] = useState(false);
    const [pincodeError, setPincodeError] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);
    const [editMessage, setEditMessage] = useState('');

    useEffect(() => {
        const data = localStorage.getItem('memberData');
        const token = localStorage.getItem('memberToken');
        if (!data || !token) {
            navigate('/membership/login');
        } else {
            const parsedMember = JSON.parse(data);
            setMember(parsedMember);
            setEditForm({
                designation: parsedMember.designation || '',
                organization: parsedMember.organization || '',
                address: parsedMember.address || '',
                pincode: parsedMember.pincode || '',
                state: parsedMember.state || '',
                district: parsedMember.district || '',
                mandal: parsedMember.mandal || '',
                qualification: parsedMember.qualification || '',
                specialization: parsedMember.specialization || '',
                mobileNumber: parsedMember.mobileNumber || ''
            });
        }
    }, [navigate]);

    const handlePincodeChange = async (pinValue) => {
        const cleaned = pinValue.replace(/\D/g, '').slice(0, 6);
        setEditForm(prev => ({ ...prev, pincode: cleaned }));
        setPincodeError('');

        if (cleaned.length === 6) {
            setFetchingPincode(true);
            const res = await fetchLocationByPincode(cleaned);
            setFetchingPincode(false);

            if (res.success) {
                setStateOptions(res.states || []);
                setDistrictOptions(res.districts || []);
                setMandalOptions(res.mandals || []);
                setEditForm(prev => ({
                    ...prev,
                    state: (res.states && res.states.length > 0) ? res.states[0] : (res.state || prev.state),
                    district: (res.districts && res.districts.length > 0) ? res.districts[0] : (res.district || prev.district),
                    mandal: (res.mandals && res.mandals.length > 0) ? res.mandals[0] : prev.mandal
                }));
            } else {
                setPincodeError(res.message || 'Could not fetch location details.');
            }
        } else {
            setStateOptions([]);
            setDistrictOptions([]);
            setMandalOptions([]);
        }
    };

    const isMemberActive = member && member.approvalStatus === 'Approved' && (
        member.membershipType?.toLowerCase() === 'lifetime' || 
        member.membershipType === 'Life' ||
        (member.subscriptionEndDate && new Date() <= new Date(member.subscriptionEndDate)) ||
        member.subscriptionStatus === 'Active'
    );

    useEffect(() => {
        if (activeTab === 'journals') {
            fetchJournals();
        }
    }, [activeTab]);

    const fetchJournals = async () => {
        setLoadingJournals(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/journal`);
            setJournals(res.data || []);
        } catch (err) {
            console.error('Failed to fetch journals', err);
        } finally {
            setLoadingJournals(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('memberToken');
        localStorage.removeItem('memberData');
        navigate('/membership/login');
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        setEditMessage('');
        try {
            const res = await axios.put(`${import.meta.env.VITE_API_URL}/membership/profile`, {
                memberId: member._id,
                ...editForm
            });
            setMember(res.data.member);
            localStorage.setItem('memberData', JSON.stringify(res.data.member));
            setEditMessage('Profile updated successfully!');
            setTimeout(() => {
                setIsEditingProfile(false);
                setEditMessage('');
            }, 1500);
        } catch (err) {
            setEditMessage(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSavingProfile(false);
        }
    };

    if (!member) return null;

    const filteredJournals = journals.filter(j => 
        j.title?.toLowerCase().includes(journalSearch.toLowerCase()) ||
        j.year?.toString().includes(journalSearch) ||
        j.issues?.toLowerCase().includes(journalSearch.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#fff9f0] pb-20">
            {/* Header / Cover */}
            <div className="bg-[#064e3b] h-64 relative">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:32px_32px]" />
                <div className="max-w-6xl mx-auto px-6 h-full flex items-end pb-10">
                    <div className="flex flex-col md:flex-row md:items-end gap-6 w-full">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-white shadow-2xl border-4 border-white flex items-center justify-center text-[#064e3b] text-5xl font-bold -mb-16 relative z-10">
                            {member.firstName ? member.firstName.charAt(0) : 'M'}
                        </div>
                        <div className="flex-1 text-white space-y-1">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl md:text-4xl font-serif font-bold">
                                    {member.title} {member.firstName} {member.lastName}
                                </h1>
                                <span className="bg-[#fbbf24] text-[#064e3b] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                                    {member.membershipType || 'Yearly'} Member
                                </span>
                                <span className="bg-emerald-800 text-emerald-100 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-600">
                                    Status: {member.subscriptionStatus || member.approvalStatus || 'Active'}
                                </span>
                                {member.subscriptionEndDate && (
                                    <span className="bg-amber-900/60 text-amber-200 text-[10px] font-bold px-3 py-1 rounded-full border border-amber-500/30">
                                        Valid Until: {new Date(member.subscriptionEndDate).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                            <p className="text-white/70 font-mono text-sm tracking-widest">{member.membershipId}</p>
                        </div>
                        <div className="flex items-center gap-3 mb-4 md:mb-0">
                            <button 
                                onClick={() => setIsEditingProfile(true)}
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all text-sm"
                            >
                                <Edit3 size={16} /> Edit Profile
                            </button>
                            <button 
                                onClick={handleLogout}
                                className="bg-red-500/20 hover:bg-red-500/40 backdrop-blur-md text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all text-sm"
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="max-w-6xl mx-auto px-6 mt-20">
                <div className="flex gap-4 border-b border-gray-200 pb-4 mb-8">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
                            activeTab === 'profile'
                            ? 'bg-[#064e3b] text-white shadow-lg'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <User size={18} /> My Complete Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('journals')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
                            activeTab === 'journals'
                            ? 'bg-[#064e3b] text-white shadow-lg'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <BookOpen size={18} /> Journal Access & Publications
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Sidebar: Quick Actions & Certificate */}
                    <div className="space-y-6">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-[#064e3b]/5 border border-[#064e3b]/5 space-y-6"
                        >
                            <h3 className="text-[#064e3b] font-bold flex items-center gap-2">
                                <span className="w-8 h-px bg-[#b47c1c]" /> Member Privileges
                            </h3>
                            <div className="space-y-3">
                                <button 
                                    onClick={() => setShowCert(true)}
                                    className="w-full bg-[#064e3b] text-white p-5 rounded-2xl font-bold flex items-center justify-between group hover:bg-[#b47c1c] transition-all shadow-md"
                                >
                                    <div className="flex items-center gap-3">
                                        <Award size={22} className="text-[#fbbf24]" />
                                        <span>Membership Certificate</span>
                                    </div>
                                    <Download size={18} className="opacity-60 group-hover:opacity-100 transition-all" />
                                </button>

                                <button 
                                    onClick={() => setActiveTab('journals')}
                                    className={`w-full p-5 rounded-2xl font-bold flex items-center justify-between transition-all border ${
                                        activeTab === 'journals'
                                        ? 'bg-[#b47c1c] text-white border-[#b47c1c]'
                                        : 'bg-gray-50 text-[#064e3b] hover:bg-white hover:shadow-lg border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <BookOpen size={22} className={activeTab === 'journals' ? 'text-white' : 'text-[#b47c1c]'} />
                                        <span>Full Journal Access</span>
                                    </div>
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </motion.div>

                        <div className="bg-[#064e3b] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
                            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                <ShieldCheck className="text-[#fbbf24]" /> Support & Inquiries
                            </h4>
                            <p className="text-white/60 text-sm leading-relaxed mb-6">
                                Need assistance with journal submissions or membership verification? Reach out directly to ISOR headquarters.
                            </p>
                            <Link to="/contact" className="text-[#fbbf24] font-bold text-sm hover:underline">Contact ISOR Support &rarr;</Link>
                        </div>
                    </div>

                    {/* Main Section */}
                    <div className="lg:col-span-2 space-y-8">
                        {activeTab === 'profile' ? (
                            <>
                                {/* Profile Details Card */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white p-10 rounded-[3rem] shadow-xl shadow-[#064e3b]/5 border border-[#064e3b]/5"
                                >
                                    <div className="flex items-center justify-between mb-10 border-b border-gray-100 pb-6">
                                        <h2 className="text-2xl font-serif font-bold text-[#064e3b] flex items-center gap-3">
                                            <User className="text-[#b47c1c]" /> Complete Profile Information
                                        </h2>
                                        <button 
                                            onClick={() => setIsEditingProfile(true)}
                                            className="text-xs font-bold text-[#064e3b] hover:text-[#b47c1c] flex items-center gap-1 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200"
                                        >
                                            <Edit3 size={14} /> Edit Information
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <Briefcase size={14} /> Designation
                                            </label>
                                            <p className="text-[#064e3b] font-bold text-lg">{member.designation || 'Not specified'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <ShieldCheck size={14} /> Organization
                                            </label>
                                            <p className="text-[#064e3b] font-bold text-lg">{member.organization || 'Not specified'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <GraduationCap size={14} /> Educational Qualification
                                            </label>
                                            <p className="text-[#064e3b] font-bold text-lg">{member.qualification || 'Not specified'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <Award size={14} /> Field of Specialization
                                            </label>
                                            <p className="text-[#064e3b] font-bold text-lg">{member.specialization || 'Not specified'}</p>
                                        </div>
                                    </div>

                                    <div className="mt-12 pt-10 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                                            <Mail className="text-[#b47c1c]" size={20} />
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase">Email Address</p>
                                                <p className="text-[#064e3b] font-bold text-xs">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                                            <Phone className="text-[#b47c1c]" size={20} />
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase">Mobile Number</p>
                                                <p className="text-[#064e3b] font-bold text-xs">{member.mobileNumber}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                                            <Calendar className="text-[#b47c1c]" size={20} />
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase">Member Since</p>
                                                <p className="text-[#064e3b] font-bold text-xs">{new Date(member.createdAt).getFullYear()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Mailing & Location Address */}
                                <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-[#064e3b]/5 border border-[#064e3b]/5">
                                    <h2 className="text-xl font-serif font-bold text-[#064e3b] mb-6 flex items-center gap-3">
                                        <MapPin className="text-[#b47c1c]" /> Communication Address & Location
                                    </h2>
                                    <div className="bg-[#fff9f0] p-6 rounded-2xl border border-[#b47c1c]/10 space-y-4">
                                        <p className="text-[#064e3b] font-semibold leading-relaxed whitespace-pre-line text-sm">
                                            {member.address || 'No street address registered.'}
                                        </p>
                                        {(member.pincode || member.mandal || member.district || member.state) && (
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[#b47c1c]/20 text-xs">
                                                <div>
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase block">PIN Code</span>
                                                    <span className="font-bold text-[#064e3b]">{member.pincode || '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Mandal / Tehsil</span>
                                                    <span className="font-bold text-[#064e3b]">{member.mandal || '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase block">District</span>
                                                    <span className="font-bold text-[#064e3b]">{member.district || '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase block">State</span>
                                                    <span className="font-bold text-[#064e3b]">{member.state || '-'}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Journal Access Section */
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-10 rounded-[3rem] shadow-xl shadow-[#064e3b]/5 border border-[#064e3b]/5 space-y-8"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                                    <div>
                                        <h2 className="text-2xl font-serif font-bold text-[#064e3b] flex items-center gap-3">
                                            <BookOpen className="text-[#b47c1c]" /> Journal of Oilseeds Research
                                        </h2>
                                        <p className="text-gray-500 text-xs mt-1">Full text access reserved exclusively for active ISOR members.</p>
                                    </div>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input 
                                            type="text" 
                                            placeholder="Search year, title, volume..."
                                            value={journalSearch}
                                            onChange={e => setJournalSearch(e.target.value)}
                                            className="bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-[#064e3b] w-full sm:w-60"
                                        />
                                    </div>
                                </div>

                                {loadingJournals ? (
                                    <div className="py-16 text-center text-gray-400 font-bold text-sm">
                                        Loading Journal Library...
                                    </div>
                                ) : filteredJournals.length === 0 ? (
                                    <div className="py-16 text-center text-gray-400 space-y-2">
                                        <FileText size={40} className="mx-auto opacity-40" />
                                        <p className="font-bold">No journals matching your search.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {filteredJournals.map(journal => (
                                            <div key={journal._id} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4 flex flex-col justify-between hover:shadow-lg transition-all">
                                                <div className="flex gap-4">
                                                    {journal.coverImageUrl ? (
                                                        <img 
                                                            src={getServerUrl(journal.coverImageUrl)} 
                                                            alt={journal.title} 
                                                            className="w-20 h-28 object-cover rounded-xl shadow-md border border-gray-200"
                                                        />
                                                    ) : (
                                                        <div className="w-20 h-28 bg-[#064e3b]/10 rounded-xl flex items-center justify-center text-[#064e3b]">
                                                            <BookOpen size={32} />
                                                        </div>
                                                    )}
                                                    <div className="space-y-1 flex-1">
                                                        <span className="bg-[#064e3b] text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full">
                                                            {journal.year}
                                                        </span>
                                                        <h4 className="font-bold text-[#064e3b] text-sm leading-tight mt-1">{journal.title}</h4>
                                                        <p className="text-[11px] text-[#b47c1c] font-bold">{journal.issues}</p>
                                                        <p className="text-[10px] text-gray-400">{journal.articleCount}</p>
                                                    </div>
                                                </div>

                                                <a 
                                                    href={journal.pdfUrl ? `${getServerUrl(journal.pdfUrl)}?token=${localStorage.getItem('memberToken') || localStorage.getItem('userToken') || ''}` : '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full bg-[#064e3b] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#b47c1c] transition-all shadow-md"
                                                >
                                                    <Download size={14} /> Download Full PDF Journal
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Certificate Modal */}
            <AnimatePresence>
                {showCert && (
                    <MemberCertificate 
                        member={member} 
                        onClose={() => setShowCert(false)} 
                    />
                )}
            </AnimatePresence>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {isEditingProfile && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditingProfile(false)}
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-xl bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl z-10 border border-[#064e3b]/10 space-y-6"
                        >
                            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                                <h3 className="text-xl font-serif font-bold text-[#064e3b]">Edit Member Profile</h3>
                                <button onClick={() => setIsEditingProfile(false)} className="text-gray-400 hover:text-black">
                                    <X size={20} />
                                </button>
                            </div>

                            {editMessage && (
                                <div className={`p-4 rounded-xl text-xs font-bold text-center ${editMessage.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {editMessage}
                                </div>
                            )}

                            <form onSubmit={handleSaveProfile} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mobile Number</label>
                                        <input 
                                            type="text" 
                                            value={editForm.mobileNumber}
                                            onChange={e => setEditForm({...editForm, mobileNumber: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Designation</label>
                                        <input 
                                            type="text" 
                                            value={editForm.designation}
                                            onChange={e => setEditForm({...editForm, designation: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Organization</label>
                                        <input 
                                            type="text" 
                                            value={editForm.organization}
                                            onChange={e => setEditForm({...editForm, organization: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Qualification</label>
                                        <input 
                                            type="text" 
                                            value={editForm.qualification}
                                            onChange={e => setEditForm({...editForm, qualification: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Field of Specialization</label>
                                        <input 
                                            type="text" 
                                            value={editForm.specialization}
                                            onChange={e => setEditForm({...editForm, specialization: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Communication Address</label>
                                        <textarea 
                                            rows={2}
                                            value={editForm.address}
                                            onChange={e => setEditForm({...editForm, address: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                            placeholder="Street / House No"
                                        />
                                    </div>

                                    {/* Location fields */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                                            <span>PIN Code</span>
                                            {fetchingPincode && <span className="text-[10px] text-[#064e3b] font-normal animate-pulse flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Fetching...</span>}
                                        </label>
                                        <input 
                                            type="text" 
                                            maxLength={6}
                                            value={editForm.pincode || ''}
                                            onChange={e => handlePincodeChange(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                            placeholder="Enter 6-digit PIN"
                                        />
                                        {pincodeError && <p className="text-[10px] text-red-500 font-medium">{pincodeError}</p>}
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-gray-700">State</label>
                                        {stateOptions.length > 0 ? (
                                            <select 
                                                value={editForm.state || ''}
                                                onChange={e => setEditForm({...editForm, state: e.target.value})}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                            >
                                                {stateOptions.map((opt, idx) => (
                                                    <option key={idx} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input 
                                                type="text" 
                                                value={editForm.state || ''}
                                                onChange={e => setEditForm({...editForm, state: e.target.value})}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                                placeholder="State"
                                            />
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-gray-700">District</label>
                                        {districtOptions.length > 0 ? (
                                            <select 
                                                value={editForm.district || ''}
                                                onChange={e => setEditForm({...editForm, district: e.target.value})}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                            >
                                                {districtOptions.map((opt, idx) => (
                                                    <option key={idx} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input 
                                                type="text" 
                                                value={editForm.district || ''}
                                                onChange={e => setEditForm({...editForm, district: e.target.value})}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                                placeholder="District"
                                            />
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-gray-700">Mandal / Tehsil</label>
                                        {mandalOptions.length > 0 ? (
                                            <select 
                                                value={editForm.mandal || ''}
                                                onChange={e => setEditForm({...editForm, mandal: e.target.value})}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                            >
                                                {mandalOptions.map((opt, idx) => (
                                                    <option key={idx} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input 
                                                type="text" 
                                                value={editForm.mandal || ''}
                                                onChange={e => setEditForm({...editForm, mandal: e.target.value})}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                                placeholder="Mandal / Tehsil"
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsEditingProfile(false)}
                                        className="px-6 py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={savingProfile}
                                        className="px-6 py-3 rounded-xl bg-[#064e3b] text-white text-xs font-bold hover:bg-[#b47c1c] transition-all"
                                    >
                                        {savingProfile ? 'Saving...' : 'Save Profile Changes'}
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

export default MemberDashboard;
