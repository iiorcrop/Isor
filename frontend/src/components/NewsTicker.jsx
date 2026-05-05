import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NewsTicker = () => {
    const [news, setNews] = useState([]);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/news/active`);
                setNews(res.data);
            } catch (err) {
                console.error('Failed to fetch news', err);
            }
        };
        fetchNews();
    }, []);

    if (news.length === 0) return null;

    return (
        <div className="bg-[#fffbeb] border-b border-[#fef3c7] h-12 flex items-center overflow-hidden group">
            {/* Latest Badge */}
            <div className="bg-[#b47c1c] text-white h-full px-6 flex items-center font-bold text-xs tracking-wider z-10 shadow-lg shrink-0">
                LATEST
            </div>

            {/* Scrolling Container */}
            <div className="flex-1 overflow-hidden relative h-full">
                <div className="flex items-center gap-12 whitespace-nowrap animate-ticker group-hover:pause py-2 h-full">
                    {/* Double the news for infinite loop effect if few items */}
                    {[...news, ...news].map((item, index) => (
                        <div key={index} className="flex items-center gap-4">
                            {/* Year/Prefix */}
                            <span className="text-[#6b7280] font-medium text-[13px]">
                                {new Date(item.createdAt).getFullYear()}
                            </span>
                            
                            {/* Separator Icon (Diamond/Star) */}
                            <svg className="w-3 h-3 text-[#1e703c]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" />
                            </svg>

                            {/* News Text with Link */}
                            <a 
                                href={item.isPdf ? `http://localhost:5000${item.pdfUrl}` : item.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[#374151] hover:text-[#1e703c] transition-colors text-[14px] font-medium"
                            >
                                {item.text}
                            </a>

                            {/* New Badge */}
                            {item.isNewItem && (
                                <span className="text-[#1e703c] font-bold text-[10px] animate-pulse">
                                    [NEW]
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NewsTicker;
