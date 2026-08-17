import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, User, Download, FileText, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { getServerUrl } from '../utils/urlHelper';

const BrainStormingSessions = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/brainstorm`);
                setSessions(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch brainstorm sessions:', err);
                setLoading(false);
            }
        };
        fetchSessions();
    }, []);

    const getFileUrl = (path) => getServerUrl(path);

    const getFileName = (path, defaultTitle) => {
        if (defaultTitle && defaultTitle.toLowerCase().endsWith('.pdf')) {
            return defaultTitle;
        }
        if (!path) return `${defaultTitle || 'document'}.pdf`;
        const parts = path.split('/');
        const name = parts[parts.length - 1];
        return name.includes('.pdf') ? name : `${defaultTitle || name}.pdf`;
    };

    return (
        <div className="min-h-screen bg-[#fff9f0] py-10 px-4 md:px-12">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Header Card */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100/80 space-y-6">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#b47c1c]">
                        <Link to="/" className="hover:underline">Home</Link>
                        <span>/</span>
                        <span className="text-gray-600">Brain Stroming Sessions</span>
                    </div>

                    {/* Main Title */}
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#064e3b]">
                        Brain Stroming Sessions
                    </h1>

                    {/* Metadata bar */}
                    <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-gray-100 text-xs font-semibold text-gray-500">
                        <div className="flex items-center gap-2">
                            <Calendar size={15} className="text-[#b47c1c]" />
                            <span>Last Updated: 07/07/2026</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <User size={15} className="text-[#b47c1c]" />
                            <span>By: Admin</span>
                        </div>
                    </div>
                </div>

                {/* Content & Downloads Card */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100/80 space-y-8">
                    
                    {/* Subheading / Description */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-gray-700">
                            Brain Stroming Sessions
                        </h2>
                        <hr className="border-gray-800/80 my-4" />
                    </div>

                    {/* Downloads Section Title */}
                    <div className="space-y-6">
                        <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#064e3b] flex items-center gap-3">
                            <span className="text-2xl">📄</span> Downloads
                        </h3>

                        {loading ? (
                            <div className="flex items-center justify-center py-12 space-y-2">
                                <Loader2 className="animate-spin text-[#064e3b]" size={32} />
                                <span className="ml-3 text-sm font-semibold text-gray-600">Loading documents...</span>
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-gray-500 text-sm font-medium">No brainstorm session PDFs uploaded yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {sessions.map((session) => {
                                    const fileUrl = getFileUrl(session.pdfUrl);
                                    const fileName = getFileName(session.pdfUrl, session.title);

                                    return (
                                        <a
                                            key={session._id}
                                            href={fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group bg-[#eefcf4] hover:bg-[#e2f9ec] border border-[#d2f4e2] transition-all duration-200 rounded-3xl p-5 flex items-center gap-4 shadow-sm"
                                        >
                                            {/* PDF Badge Icon */}
                                            <div className="w-14 h-14 rounded-2xl bg-[#064e3b] text-white font-bold text-xs flex flex-col items-center justify-center shrink-0 shadow-md">
                                                <span>PDF</span>
                                            </div>

                                            {/* File Details */}
                                            <div className="overflow-hidden">
                                                <h4 className="font-bold text-[#064e3b] text-sm md:text-base truncate group-hover:text-[#b47c1c] transition-colors">
                                                    {fileName}
                                                </h4>
                                                <p className="text-xs text-gray-400 font-semibold mt-0.5">
                                                    Click to download
                                                </p>
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
};

export default BrainStormingSessions;
