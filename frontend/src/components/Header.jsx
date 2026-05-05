import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Header = () => {
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/header`);
                setSettings(res.data);
            } catch (err) {
                console.error('Failed to fetch header settings', err);
            }
        };
        fetchSettings();
    }, []);

    // Default values if settings not loaded yet
    const data = settings || {
        title: 'Indian Society of Oilseeds Research',
        subTitle: 'ICAR-Directorate of Oilseeds Research, Rajendranagar, Hyderabad – 500 030',
        tagline: 'ISOR — Promoting Oilseeds Research & Development Since 1984',
        affiliationText: 'An ICAR Affiliated Society',
        estdText: 'Estd. 1984 | Regd. No. 823/84',
        journalTitle: 'Journal of Oilseeds Research',
        journalScore: 'UGC-CARE Listed | NAAS Score: 7.16'
    };

    return (
        <div className="bg-white py-6 px-8 border-b border-gray-100">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-12 text-center md:text-left">
                {/* Logo */}
                <div className="relative shrink-0">
                    <div className="w-28 h-28 rounded-full border-4 border-[#b47c1c] overflow-hidden shadow-md bg-white">
                        <img 
                            src={data.logoUrl || '/logo.png'} 
                            alt="ISOR Logo" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Titles - Centered Text */}
                <div className="flex flex-col items-center md:items-start max-w-2xl">
                    <h1 className="text-[32px] font-bold text-[#1e703c] leading-tight font-serif tracking-tight">
                        {data.title}
                    </h1>
                    <p className="text-[14px] text-gray-500 font-medium leading-relaxed mt-1">
                        {data.subTitle}
                    </p>
                    <p className="text-[15px] text-[#b47c1c] font-bold mt-2 uppercase tracking-tight italic">
                        {data.tagline}
                    </p>
                </div>

                {/* Right Side: Society Details - Also Centered in Mobile/Row */}
                <div className="flex flex-col items-center md:items-end text-center md:text-right gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-12">
                    <div>
                        <p className="text-[#1e703c] font-bold text-[15px]">
                            {data.affiliationText}
                        </p>
                        <p className="text-gray-500 text-[13px] font-medium">
                            {data.estdText}
                        </p>
                    </div>

                    <div>
                        <p className="text-[#1e703c] font-bold text-[15px]">
                            {data.journalTitle}
                        </p>
                        <p className="text-[#b47c1c] text-[13px] font-bold italic">
                            {data.journalScore}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
