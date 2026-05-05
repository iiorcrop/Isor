import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    User, Mail, Phone, MapPin, 
    Award, ShieldCheck, Download, 
    LogOut, Calendar, Briefcase,
    ChevronRight, BookOpen, GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MemberCertificate from '../components/MemberCertificate';

const MemberDashboard = () => {
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [showCert, setShowCert] = useState(false);

    useEffect(() => {
        const data = localStorage.getItem('memberData');
        const token = localStorage.getItem('memberToken');
        if (!data || !token) {
            navigate('/login');
        } else {
            setMember(JSON.parse(data));
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('memberToken');
        localStorage.removeItem('memberData');
        navigate('/login');
    };

    if (!member) return null;

    return (
        <div className="min-h-screen bg-[#fff9f0] pb-20">
            {/* Header / Cover */}
            <div className="bg-[#064e3b] h-60 relative">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:32px_32px]" />
                <div className="max-w-6xl mx-auto px-6 h-full flex items-end pb-12">
                    <div className="flex flex-col md:flex-row md:items-end gap-6 w-full">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-white shadow-2xl border-4 border-white flex items-center justify-center text-[#064e3b] text-5xl font-bold -mb-16 relative z-10">
                            {member.firstName.charAt(0)}
                        </div>
                        <div className="flex-1 text-white space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl md:text-4xl font-serif font-bold">{member.title} {member.firstName} {member.lastName}</h1>
                                <span className="bg-[#fbbf24] text-[#064e3b] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                                    {member.membershipType} Member
                                </span>
                            </div>
                            <p className="text-white/60 font-mono text-sm tracking-widest">{member.membershipId}</p>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all text-sm mb-4 md:mb-0"
                        >
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 mt-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left: Quick Actions */}
                    <div className="space-y-6">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-[#064e3b]/5 border border-[#064e3b]/5 space-y-6"
                        >
                            <h3 className="text-[#064e3b] font-bold flex items-center gap-2">
                                <span className="w-8 h-px bg-[#b47c1c]" /> Membership Portal
                            </h3>
                            <div className="space-y-3">
                                <button 
                                    onClick={() => setShowCert(true)}
                                    className="w-full bg-[#064e3b] text-white p-5 rounded-2xl font-bold flex items-center justify-between group hover:bg-[#b47c1c] transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <Award size={22} className="text-[#fbbf24]" />
                                        <span>Membership Certificate</span>
                                    </div>
                                    <Download size={18} className="opacity-40 group-hover:opacity-100 group-hover:translate-y-0.5 transition-all" />
                                </button>

                                <button className="w-full bg-gray-50 text-[#064e3b] p-5 rounded-2xl font-bold flex items-center justify-between group hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-[#064e3b]/10">
                                    <div className="flex items-center gap-3">
                                        <BookOpen size={22} className="text-[#b47c1c]" />
                                        <span>Journal Access</span>
                                    </div>
                                    <ChevronRight size={18} className="opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </button>
                            </div>
                        </motion.div>

                        <div className="bg-[#064e3b] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
                            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                <ShieldCheck className="text-[#fbbf24]" /> Support
                            </h4>
                            <p className="text-white/60 text-sm leading-relaxed mb-6">
                                Need help with your membership or certificate? Contact our support team.
                            </p>
                            <a href="/contact" className="text-[#fbbf24] font-bold text-sm hover:underline">Contact ISOR Support</a>
                        </div>
                    </div>

                    {/* Right: Detailed Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-10 rounded-[3rem] shadow-xl shadow-[#064e3b]/5 border border-[#064e3b]/5"
                        >
                            <h2 className="text-2xl font-serif font-bold text-[#064e3b] mb-10 flex items-center gap-3">
                                <User className="text-[#b47c1c]" /> Professional Information
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Briefcase size={14} /> Designation
                                    </label>
                                    <p className="text-[#064e3b] font-bold text-lg">{member.designation || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <ShieldCheck size={14} /> Organization
                                    </label>
                                    <p className="text-[#064e3b] font-bold text-lg">{member.organization || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <GraduationCap size={14} /> Qualification
                                    </label>
                                    <p className="text-[#064e3b] font-bold text-lg">{member.qualification || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Award size={14} /> Specialization
                                    </label>
                                    <p className="text-[#064e3b] font-bold text-lg">{member.specialization || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="mt-16 pt-10 border-t border-gray-50 grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                                    <Mail className="text-[#b47c1c]" size={20} />
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase">Email</p>
                                        <p className="text-[#064e3b] font-bold text-xs">{member.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                                    <Phone className="text-[#b47c1c]" size={20} />
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase">Mobile</p>
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

                        <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-[#064e3b]/5 border border-[#064e3b]/5">
                            <h2 className="text-xl font-serif font-bold text-[#064e3b] mb-6 flex items-center gap-3">
                                <MapPin className="text-[#b47c1c]" /> Mailing Address
                            </h2>
                            <p className="text-[#064e3b] font-medium leading-relaxed bg-[#fff9f0] p-6 rounded-2xl border border-[#b47c1c]/10">
                                {member.address || 'No address provided.'}
                            </p>
                        </div>
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
        </div>
    );
};

export default MemberDashboard;
