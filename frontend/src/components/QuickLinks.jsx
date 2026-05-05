import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FileText, 
    Users, 
    Calendar, 
    PenTool, 
    BookOpen, 
    Info, 
    Layout,
    ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const ICON_MAP = {
    FileText: FileText,
    Users: Users,
    Calendar: Calendar,
    PenTool: PenTool,
    BookOpen: BookOpen,
    Info: Info,
    Layout: Layout,
};

const QuickLinks = () => {
    const [links, setLinks] = useState([]);

    useEffect(() => {
        const fetchLinks = async () => {
            try {
                const res = await axios.get('/api/quicklinks/active');
                setLinks(res.data);
            } catch (err) {
                console.error('Failed to fetch quick links', err);
            }
        };
        fetchLinks();
    }, []);

    if (links.length === 0) return null;

    return (
        <section className="bg-gradient-to-r from-[#14532d] via-[#166534] to-[#14532d] py-6 shadow-xl relative overflow-hidden border-b border-white/5">
            {/* Subtle Texture/Pattern Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-0">
                    {links.map((item, index) => {
                        const IconComp = ICON_MAP[item.icon] || FileText;
                        return (
                            <motion.a
                                key={item._id}
                                href={item.link}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                viewport={{ once: true }}
                                className="group flex flex-col items-center justify-center py-4 px-2 text-center hover:bg-white/5 transition-all duration-300 relative border-r border-white/5 last:border-r-0"
                            >
                                <div className="mb-3 p-3 rounded-xl bg-white/5 text-white/70 group-hover:bg-[#fbbf24] group-hover:text-[#14532d] group-hover:scale-110 transition-all duration-500 shadow-md">
                                    <IconComp size={24} strokeWidth={2} />
                                </div>
                                <h3 className="text-white/90 font-bold text-xs md:text-sm tracking-wider uppercase transition-all group-hover:text-white">
                                    {item.title}
                                </h3>
                                
                                {/* Active Underline */}
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#fbbf24] group-hover:w-1/2 transition-all duration-500" />
                            </motion.a>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default QuickLinks;
