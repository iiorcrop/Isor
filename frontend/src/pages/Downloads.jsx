import React from 'react';
import { Link } from 'react-router-dom';

const Downloads = () => {
    return (
        <div className="min-h-screen bg-[#fff9f0] flex items-center justify-center p-6">
            <div className="max-w-xl mx-auto bg-white p-12 rounded-[3rem] border border-[#064e3b]/10 text-center shadow-xl space-y-4">
                <h1 className="text-6xl font-serif font-bold text-[#064e3b]">404</h1>
                <h2 className="text-2xl font-serif font-bold text-[#064e3b]">Page Not Found</h2>
                <p className="text-gray-500 text-xs leading-relaxed">
                    The requested page is unavailable or has been moved.
                </p>
                <Link to="/" className="inline-block bg-[#064e3b] text-white px-8 py-3.5 rounded-2xl font-bold text-xs hover:bg-[#04392b] transition-all shadow-md">
                    Return to Homepage
                </Link>
            </div>
        </div>
    );
};

export default Downloads;
