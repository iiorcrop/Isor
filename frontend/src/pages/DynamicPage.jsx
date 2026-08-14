import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Calendar, User } from 'lucide-react';
import ReadMore from '../components/ReadMore';

import { Link } from 'react-router-dom';

const DynamicPage = () => {
    const params = useParams();
    const slug = (params['*'] || '').replace(/^\/+/, '');
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPage = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/pages/${slug}`);
                setPage(res.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchPage();
    }, [slug]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-[#fff9f0]">
            <Loader2 className="w-12 h-12 text-[#064e3b] animate-spin" />
        </div>
    );

    if (!page || !page.content) return (
        <div className="min-h-screen bg-[#fff9f0] flex items-center justify-center p-6">
            <div className="max-w-xl mx-auto bg-white p-12 rounded-[3rem] border border-[#064e3b]/10 text-center shadow-xl space-y-4">
                <h1 className="text-3xl font-serif font-bold text-[#064e3b]">Page Not Found</h1>
                <p className="text-gray-500 text-xs">The requested content page is currently unavailable or has not been published yet.</p>
                <Link to="/" className="inline-block bg-[#064e3b] text-white px-8 py-3.5 rounded-2xl font-bold text-xs hover:bg-[#04392b] transition-all">
                    Return to Homepage
                </Link>
            </div>
        </div>
    );

    return (
        <div className="bg-[#fff9f0] min-h-screen py-16 px-6">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Page Header Card */}
                <div className="bg-white p-10 md:p-14 rounded-[3rem] border border-[#064e3b]/10 shadow-2xl shadow-[#064e3b]/5 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#b47c1c] uppercase tracking-widest">
                        <Link to="/" className="hover:underline">Home</Link>
                        <span>/</span>
                        <span className="text-[#064e3b]">{page.slug.replace(/-/g, ' ')}</span>
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#064e3b] leading-tight">{page.title}</h1>
                    
                    <div className="flex flex-wrap items-center gap-6 text-gray-400 text-xs font-medium pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-[#b47c1c]" /> 
                            Last Updated: {new Date(page.updatedAt).toLocaleDateString('en-GB')}
                        </div>
                        <div className="flex items-center gap-2">
                            <User size={14} className="text-[#b47c1c]" /> 
                            By: {page.lastUpdatedBy || 'ISOR Secretariat'}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-white p-10 md:p-16 rounded-[3rem] border border-[#064e3b]/10 shadow-2xl shadow-[#064e3b]/5">
                <div 
                    className="prose prose-lg max-w-none prose-slate prose-headings:text-[#064e3b] prose-headings:font-serif prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-justify prose-img:rounded-2xl prose-img:shadow-xl"
                >
                    <ReadMore limit={800}>{page.content}</ReadMore>
                </div>

                {/* PDF Downloads */}
                {page.pdfs && page.pdfs.length > 0 && (
                    <div className="mt-12 border-t pt-8">
                        <h3 className="text-2xl font-serif font-bold text-[#064e3b] mb-6">📄 Downloads</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {page.pdfs.map((pdf, idx) => {
                                const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
                                const pdfUrl = `${baseUrl}/${pdf.url}`;
                                const displayName = (pdf.filename || pdf.url.split('/').pop()).replace(/^\d+-/, '').replace(/_/g, ' ');
                                return (
                                    <a
                                        key={idx}
                                        href={pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 p-4 bg-[#f0fdf4] border border-[#064e3b]/10 rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                                    >
                                        <div className="w-12 h-12 bg-[#064e3b] rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0">
                                            PDF
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-[#064e3b] truncate group-hover:text-[#1e703c]">{displayName}</p>
                                            <p className="text-xs text-gray-400">Click to download</p>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
);
};

export default DynamicPage;
