import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Calendar, User } from 'lucide-react';

const DynamicPage = () => {
    const { slug } = useParams();
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
                    dangerouslySetInnerHTML={{ __html: page.content }} 
                />
            </div>
        </div>
    );
};

export default DynamicPage;
