import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown } from 'lucide-react';

const MenuBar = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [activeItem, setActiveItem] = useState('Home');
    const [openDropdown, setOpenDropdown] = useState(null);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await axios.get('/api/menu');
                setMenuItems(res.data.items || []);
            } catch (err) {
                console.error('Failed to fetch menu', err);
            }
        };
        fetchMenu();
    }, []);

    return (
        <nav className="bg-[#064e3b] border-t-4 border-[#b47c1c] relative z-50">
            <div className="max-w-7xl mx-auto flex items-center h-[54px]">
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
                        {item.isDropdown && openDropdown === index && (
                            <div className="absolute top-full left-0 w-64 bg-white shadow-2xl border-t-2 border-[#b47c1c] py-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                {item.children.map((child, cIndex) => (
                                    <a
                                        key={cIndex}
                                        href={child.link}
                                        className="block px-6 py-3 text-[14px] text-gray-700 hover:bg-[#064e3b] hover:text-white transition-colors font-semibold"
                                    >
                                        {child.label}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </nav>
    );
};

export default MenuBar;
