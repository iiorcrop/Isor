import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Calendar, User } from 'lucide-react';
import ReadMore from '../components/ReadMore';

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
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-12 h-12 text-[#1e703c] animate-spin" />
        </div>
    );

    if (!page || !page.content) return (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
            <h1 className="text-3xl font-bold text-gray-400">Page Not Found</h1>
            <p className="text-gray-500 mt-2">The content for this page hasn't been created yet.</p>
        </div>
    );

    return (
        <div className="bg-white min-h-screen">
            {/* Page Header */}
            <div className="bg-[#064e3b] text-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">{page.title}</h1>
                    <div className="flex items-center gap-6 text-white/60 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} /> 
                            Last Updated: {new Date(page.updatedAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                            <User size={16} /> 
                            By: {page.lastUpdatedBy || 'ISOR Admin'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Breadcrumbs */}
            <div className="bg-gray-50 py-4 border-b">
                <div className="max-w-7xl mx-auto px-4 text-xs font-medium text-gray-500">
                    <a href="/" className="hover:text-[#1e703c]">Home</a>
                    <span className="mx-2">/</span>
                    <span className="text-[#1e703c] uppercase">{page.slug.replace(/-/g, ' ')}</span>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div 
                    className="prose prose-lg max-w-none prose-slate prose-headings:text-[#064e3b] prose-headings:font-serif prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-justify prose-img:rounded-2xl prose-img:shadow-xl"
                    <ReadMore limit={800}>{page.content}</ReadMore>

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
    );
};

export default DynamicPage;
