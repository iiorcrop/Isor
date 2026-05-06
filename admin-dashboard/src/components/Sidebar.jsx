import React, { useEffect, useState } from 'react';
import { 
    LayoutDashboard, 
    Users, 
    Settings, 
    LogOut, 
    ChevronLeft, 
    ChevronRight,
    FileText,
    Bell,
    Globe,
    Layout,
    Image,
    BookOpen,
    CreditCard,
    Shield,
    Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import axios from 'axios';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { user, logout } = useAuth();
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        // Poll for pending approvals every 30s
        const fetchPending = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/members`);
                const pending = res.data.filter(m =>
                    (!m.approvalStatus || m.approvalStatus === 'Pending') &&
                    m.paymentStatus === 'Completed'
                ).length;
                setPendingCount(pending);
            } catch {}
        };
        fetchPending();
        const interval = setInterval(fetchPending, 30000);
        return () => clearInterval(interval);
    }, []);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Globe, label: 'Top Bar', path: '/topbar' },
        { icon: FileText, label: 'Header', path: '/header' },
        { icon: Layout, label: 'Menu Bar', path: '/menu' },
        { icon: Bell, label: 'Flash News', path: '/news' },
        { icon: Image, label: 'Banners', path: '/banners' },
        { icon: Layout, label: 'Quick Links', path: '/quicklinks' },
        { icon: BookOpen, label: 'Home Content', path: '/home-content' },
        { icon: Users, label: 'Member List', path: '/members', badge: pendingCount || null },
        { icon: Shield, label: 'Committees', path: '/committees' },
        { icon: BookOpen, label: 'Journal Volumes', path: '/journals' },
        { icon: Mail, label: 'Contact Inbox', path: '/contact' },
        { icon: CreditCard, label: 'Payment Settings', path: '/payment-settings' },
    ];

    return (
        <motion.aside 
            animate={{ width: isOpen ? 260 : 80 }}
            className="h-screen bg-[#0f172a] border-r border-white/5 flex flex-col relative z-20"
        >
            {/* Toggle Button */}
            <button 
                onClick={toggleSidebar}
                className="absolute -right-3 top-10 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shadow-lg border border-white/10 hover:scale-110 transition-transform"
            >
                {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>

            {/* Logo Area */}
            <div className={`p-6 mb-8 flex items-center ${isOpen ? 'justify-start' : 'justify-center'}`}>
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shrink-0">
                    <span className="font-bold text-xl">I</span>
                </div>
                {isOpen && (
                    <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="ml-3 font-bold text-xl tracking-tight text-white"
                    >
                        ISOR <span className="text-primary">CORE</span>
                    </motion.span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item, index) => (
                    <NavLink 
                        key={index}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center p-3 rounded-xl cursor-pointer transition-all hover:bg-white/5 group 
                            ${!isOpen ? 'justify-center' : ''}
                            ${isActive ? 'bg-primary/10 text-primary' : 'text-text-muted'}
                        `}
                    >
                        <item.icon className={`w-5 h-5 transition-colors group-hover:text-primary ${isOpen ? '' : ''}`} />
                        {isOpen && (
                            <motion.span 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="ml-3 font-medium group-hover:text-white"
                            >
                                {item.label}
                            </motion.span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User Profile & Logout */}
            <div className="p-4 border-t border-white/5">
                <div className={`flex items-center p-2 rounded-xl bg-white/5 ${!isOpen && 'justify-center'}`}>
                    <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent shrink-0">
                        {user?.username?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    {isOpen && (
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{user?.username || 'Admin'}</p>
                            <p className="text-xs text-text-muted truncate">{user?.email || 'admin@isor.com'}</p>
                        </div>
                    )}
                </div>
                
                <button 
                    onClick={logout}
                    className={`w-full mt-4 flex items-center p-3 rounded-xl text-error/80 hover:bg-error/10 hover:text-error transition-all ${!isOpen && 'justify-center'}`}
                >
                    <LogOut className="w-5 h-5" />
                    {isOpen && <span className="ml-3 font-medium">Sign Out</span>}
                </button>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
