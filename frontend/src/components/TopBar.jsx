import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    MapPin, 
    Phone, 
    Globe,
    ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const TopBar = () => {
    const [dateTime, setDateTime] = useState(new Date());
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setDateTime(new Date());
        }, 1000);

        fetchSettings();

        return () => clearInterval(timer);
    }, []);

    const fetchSettings = async () => {
        console.log(`${import.meta.env.VITE_API_URL}/topbar`);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/topbar`);
            setSettings(res.data);
        } catch (err) {
            console.error('Failed to fetch topbar settings', err);
        }
    };

    const formatDateTime = (date) => {
        const options = { 
            weekday: 'short', 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit', 
            hour12: true 
        };
        return date.toLocaleString('en-US', options).replace(',', '') + ' IST';
    };

    return (
        <header className="h-auto md:h-10 bg-[#064e3b] flex flex-col md:flex-row items-center justify-between px-4 md:px-6 z-10 shrink-0 text-[10px] md:text-[11px] font-medium text-white/90 py-2 md:py-0 gap-2 md:gap-0">
            {/* Left Section: Time, Location, Phone */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 w-full md:w-auto">
                <div className="flex items-center gap-1.5">
                    <span className="text-[#fbbf24] font-bold">
                        {formatDateTime(dateTime)}
                    </span>
                </div>
                
                <span className="hidden md:inline text-white/20">|</span>
                
                <div className="hidden lg:flex items-center gap-1.5 group cursor-default">
                    <MapPin size={12} className="text-[#ec4899]" />
                    <span className="hover:text-white transition-colors">
                        {settings?.location || 'Hyderabad, Telangana, India'}
                    </span>
                </div>

                <span className="hidden lg:inline text-white/20">|</span>

                <div className="flex items-center gap-1.5 group cursor-default">
                    <Phone size={12} className="text-[#ec4899]" />
                    <span className="hover:text-white transition-colors">
                        {settings?.phone || '+91-40-2301-5291'}
                    </span>
                </div>
            </div>

            {/* Right Section: Social, Admin, Contact */}
            <div className="flex items-center justify-center md:justify-end gap-3 md:gap-4 w-full md:w-auto border-t border-white/10 md:border-t-0 pt-2 md:pt-0">
                <div className="hidden sm:flex items-center gap-2">
                    <SocialIcon icon={FacebookIcon} href={settings?.socialLinks?.facebook} color="#1877F2" />
                    <SocialIcon icon={XIcon} href={settings?.socialLinks?.twitter} color="#ffffff" />
                    <SocialIcon icon={LinkedinIcon} href={settings?.socialLinks?.linkedin} color="#0A66C2" />
                    <SocialIcon icon={PlayIcon} href={settings?.socialLinks?.youtube} color="#FF0000" />
                </div>

                <span className="hidden sm:inline text-white/20">|</span>

                <div className="flex items-center gap-3 md:gap-4">
                    <a href="/login" className="hover:text-[#fbbf24] transition-colors uppercase tracking-wider font-bold">Member Login</a>
                    <span className="text-white/20">|</span>
                    <a href="https://admin.isor.in/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors uppercase tracking-wider text-[9px] md:text-[11px]">Admin</a>
                    <span className="hidden xs:inline text-white/20">|</span>
                    <a href="#" className="hidden xs:inline hover:text-white transition-colors uppercase tracking-wider">Contact</a>
                </div>
            </div>
        </header>

    );
};

const SocialIcon = ({ icon: Icon, href, color }) => (
    <motion.a
        href={href || '#'}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.2, color: color }}
        className="text-white/60 transition-colors p-1"
    >
        <Icon size={14} />
    </motion.a>
);

const FacebookIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
);

const LinkedinIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
);

const XIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
);

const PlayIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z"/>
    </svg>
);

export default TopBar;
