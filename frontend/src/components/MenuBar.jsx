import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MenuBar = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [activeItem, setActiveItem] = useState('Home');
    const [openDropdown, setOpenDropdown] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/menu`);
                setMenuItems(res.data.items || []);
            } catch (err) {
                console.error('Failed to fetch menu', err);
            }
        };
        fetchMenu();
    }, []);

    return (
        <nav className="bg-[#064e3b] border-t-4 border-[#b47c1c] relative z-50">
            <div className="max-w-7xl mx-auto px-4 md:px-0 flex items-center justify-between md:justify-start h-[54px]">
                {/* Desktop Menu */}
                <div className="hidden md:flex items-center h-full">
                    {menuItems.map((item, index) => (
                        <div 
                            key={index} 
                            className="relative h-full"
                            onMouseEnter={() => item.isDropdown && setOpenDropdown(index)}
                            onMouseLeave={() => setOpenDropdown(null)}
                        >
                            <a
                                href={item.link}
                                onClick={(e) => {
                                    if (item.isDropdown) e.preventDefault();
                                    setActiveItem(item.label);
                                }}
                                className={`h-full flex items-center px-5 text-[15px] font-bold transition-all duration-200 group ${
                                    activeItem === item.label 
                                    ? 'bg-[#b47c1c] text-white' 
                                    : 'text-white hover:bg-[#b47c1c]/10'
                                }`}
                            >
                                {item.label}
                                {item.isDropdown && (
                                    <span className="ml-1 text-[10px] opacity-80 group-hover:rotate-180 transition-transform">▼</span>
                                )}
                            </a>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {item.isDropdown && openDropdown === index && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-0 w-64 bg-white shadow-2xl border-t-2 border-[#b47c1c] py-2 z-[100]"
                                    >
                                        {item.children.map((child, cIndex) => (
                                            <a
                                                key={cIndex}
                                                href={child.link}
                                                className="block px-6 py-3 text-[14px] text-gray-700 hover:bg-[#064e3b] hover:text-white transition-colors font-semibold"
                                            >
                                                {child.label}
                                            </a>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center">
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-white p-2"
                    >
                        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                    <span className="text-white font-bold ml-2 uppercase tracking-wider text-sm">Navigation</span>
                </div>
            </div>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
                        />
                        <motion.div 
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            className="fixed top-0 left-0 bottom-0 w-[80%] max-w-sm bg-[#064e3b] z-[70] md:hidden overflow-y-auto"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <span className="text-white font-bold text-xl uppercase tracking-tighter">ISOR Menu</span>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="text-white/60"><X size={24} /></button>
                            </div>
                            <div className="py-4">
                                {menuItems.map((item, index) => (
                                    <div key={index}>
                                        <div 
                                            className="px-6 py-4 flex items-center justify-between text-white font-bold border-b border-white/5"
                                            onClick={() => {
                                                if (!item.isDropdown) {
                                                    window.location.href = item.link;
                                                    setIsMobileMenuOpen(false);
                                                } else {
                                                    setOpenDropdown(openDropdown === index ? null : index);
                                                }
                                            }}
                                        >
                                            <span>{item.label}</span>
                                            {item.isDropdown && (
                                                <ChevronDown size={18} className={`transition-transform ${openDropdown === index ? 'rotate-180' : ''}`} />
                                            )}
                                        </div>
                                        {item.isDropdown && openDropdown === index && (
                                            <div className="bg-black/20 py-2">
                                                {item.children.map((child, cIndex) => (
                                                    <a
                                                        key={cIndex}
                                                        href={child.link}
                                                        className="block px-10 py-3 text-white/80 hover:text-white text-sm font-medium"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                    >
                                                        {child.label}
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
};


export default MenuBar;
