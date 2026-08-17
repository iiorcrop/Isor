import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Save, Loader2, FileText, Globe, Search, Plus, Eye, Edit, Trash2, CheckCircle, Upload, Link2, X, FilePlus, Shield, Lock, FileUp, Link } from 'lucide-react';
import JoditEditor from 'jodit-react';
import { getServerUrl } from '../utils/urlHelper';
import { uploadToStorageServer } from '../utils/fileUploader';

const PageManagement = () => {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [editingPage, setEditingPage] = useState(null);
    const [formData, setFormData] = useState({ slug: '', title: '', content: '', pdfs: [] });
    const [previewMode, setPreviewMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const editorRef = useRef(null);
    // PDF states
    const [pdfs, setPdfs] = useState([]);
    const [uploadingPdf, setUploadingPdf] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragOver, setDragOver] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState('');
    const pdfInputRef = useRef(null);
    // Menu-linked missing pages
    const [menuItems, setMenuItems] = useState([]);
    // Menu placement for new page
    const [menuPlacement, setMenuPlacement] = useState('none'); // 'none' | 'top' | 'child-N'
    const [menuSaving, setMenuSaving] = useState(false);

    // Hyperlink / File Modal state
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [selectedText, setSelectedText] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [selectedPdfUrl, setSelectedPdfUrl] = useState('');
    const [isSecureToggle, setIsSecureToggle] = useState(false);
    const [modalFile, setModalFile] = useState(null);
    const [modalUploading, setModalUploading] = useState(false);
    const modalFileInputRef = useRef(null);
    const savedRangeRef = useRef(null);


    useEffect(() => {
        fetchPages();
        fetchPdfs();
        fetchMenu();
    }, []);

    const fetchPages = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/pages`);
            setPages(res.data || []);
            setLoading(false);
        } catch (err) { 
            console.error(err); 
            setLoading(false);
        }
    };

    const fetchMenu = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/menu`);
            setMenuItems(res.data.items || []);
        } catch (err) { console.error(err); }
    };

    const fetchPdfs = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/pages/list-pdfs`);
            setPdfs(res.data || []);
        } catch (err) { console.error(err); }
    };

    const uploadPdf = async (file) => {
        if (!file || file.type !== 'application/pdf') {
            alert('Please select a valid PDF file.');
            return;
        }
        setUploadingPdf(true);
        setUploadProgress(10);
        try {
            const key = await uploadToStorageServer(file);
            setUploadProgress(100);
            const storageUrl = (import.meta.env.VITE_FILE_STORAGE_URL || "https://file.iior-niger.in").replace(/\/+$/, "");
            const fileUrl = `${storageUrl}/uploads/${key}`;
            const newPdf = { url: fileUrl, filename: file.name };
            setFormData(prev => ({ ...prev, pdfs: [...(prev.pdfs || []), newPdf] }));
            await fetchPdfs();
        } catch (err) {
            alert(err.message || 'Upload failed');
        } finally {
            setUploadingPdf(false);
            setUploadProgress(0);
        }
    };

    const deletePdf = async (filename) => {
        if (!window.confirm('Delete this PDF?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/pages/delete-pdf/${encodeURIComponent(filename)}`);
            fetchPdfs();
        } catch (err) { console.error(err); }
    };

    const copyUrl = (url) => {
        const fullUrl = getServerUrl(url);
        navigator.clipboard.writeText(fullUrl);
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(''), 2000);
    };

    const insertPdfLink = (pdf) => {
        const fullUrl = getServerUrl(pdf.url);
        const displayName = pdf.filename.replace(/^\d+-/, '').replace(/_/g, ' ');
        const linkHtml = `<p><a href="${fullUrl}" target="_blank" rel="noreferrer" style="display:inline-flex;align-items:center;gap:8px;padding:10px 20px;background:#064e3b;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">📄 ${displayName}</a></p>`;
        setFormData(prev => ({ ...prev, content: prev.content + linkHtml }));
    };

    const handleEdit = async (page) => {
        setLoading(true);
        try {
            const cleanSlug = page.slug.replace(/^\/+/, '');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/pages/${cleanSlug}`);
            setEditingPage(res.data);
            setFormData({ ...res.data, pdfs: res.data.pdfs || [] });
            setLoading(false);
        } catch (err) { 
            console.error(err); 
            setLoading(false); 
        }
    };

    const deletePage = async (id) => {
        if (!window.confirm('Are you sure you want to delete this page?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/pages/${id}`);
            fetchPages();
        } catch (err) { console.error(err); }
    };

    const addExistingPageToMenu = async (page, placement) => {
        const cleanSlug = page.slug.replace(/^\/+/, '');
        const pageLink = `/page/${cleanSlug}`;
        const updatedItems = [...menuItems];
        if (placement === 'top') {
            updatedItems.push({ label: page.title, link: pageLink, isDropdown: false, children: [] });
        } else if (placement.startsWith('child-')) {
            const parentIdx = parseInt(placement.replace('child-', ''), 10);
            if (!updatedItems[parentIdx].children) updatedItems[parentIdx].children = [];
            updatedItems[parentIdx].children.push({ label: page.title, link: pageLink });
            updatedItems[parentIdx].isDropdown = true;
        }
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/menu`, { items: updatedItems });
            await fetchMenu();
            alert(`"${page.title}" added to menu successfully!`);
        } catch (err) { alert('Failed to update menu'); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/pages`, formData);
            await fetchPages();

            // Also update menu if placement selected
            if (menuPlacement !== 'none' && editingPage?.isNew) {
                setMenuSaving(true);
                const pageLink = `/page/${formData.slug}`;
                const pageLabel = formData.title;
                const updatedItems = [...menuItems];

                if (menuPlacement === 'top') {
                    updatedItems.push({ label: pageLabel, link: pageLink, isDropdown: false, children: [] });
                } else if (menuPlacement.startsWith('child-')) {
                    const parentIdx = parseInt(menuPlacement.replace('child-', ''), 10);
                    if (!updatedItems[parentIdx].children) updatedItems[parentIdx].children = [];
                    updatedItems[parentIdx].children.push({ label: pageLabel, link: pageLink });
                    updatedItems[parentIdx].isDropdown = true;
                }

                await axios.post(`${import.meta.env.VITE_API_URL}/menu`, { items: updatedItems });
                await fetchMenu();
                setMenuSaving(false);
            }

            setSuccess(true);
            setMenuPlacement('none');
            setTimeout(() => {
                setSuccess(false);
                setEditingPage(null);
            }, 1500);
        } catch (err) { 
            console.error(err); 
            const errorMsg = err.response?.data?.message || 'Failed to save page';
            alert(`Error: ${errorMsg}`);
        }
        finally { setSaving(false); }
    };

    const openLinkModal = () => {
        let selText = '';
        if (editorRef.current) {
            const ed = editorRef.current.editor || editorRef.current;
            if (ed && ed.selection) {
                try {
                    savedRangeRef.current = ed.selection.save ? ed.selection.save() : null;
                } catch (e) {}

                try {
                    selText = ed.selection.sel?.toString() || ed.selection.getHTML() || (ed.s && ed.s.sel ? ed.s.sel.toString() : '') || '';
                } catch (e) {}
            }
        }
        if (!selText) {
            try {
                selText = window.getSelection()?.toString() || '';
            } catch (e) {}
        }
        const cleanText = selText.replace(/<[^>]*>/g, '').trim();

        setSelectedText(cleanText || 'Attachment Link');
        setLinkUrl('');
        setSelectedPdfUrl('');
        setIsSecureToggle(false);
        setModalFile(null);
        setShowLinkModal(true);
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        setModalUploading(true);
        try {
            let finalUrl = '';

            if (modalFile) {
                const key = await uploadToStorageServer(modalFile);
                finalUrl = key;
            } else if (selectedPdfUrl) {
                finalUrl = selectedPdfUrl;
            } else if (linkUrl) {
                finalUrl = linkUrl.trim();
            }

            if (!finalUrl) {
                alert('Please choose an uploaded PDF, provide a URL, or upload a file');
                setModalUploading(false);
                return;
            }

            const isPdf = modalFile?.type === 'application/pdf' || 
                          modalFile?.name.toLowerCase().endsWith('.pdf') || 
                          finalUrl.toLowerCase().includes('.pdf');

            if (isPdf && isSecureToggle && !finalUrl.includes('secure=1')) {
                finalUrl += finalUrl.includes('?') ? '&secure=1' : '?secure=1';
            } else if (!isSecureToggle && finalUrl.includes('secure=1')) {
                finalUrl = finalUrl.replace(/[?&]secure=1/, '');
            }

            const resolvedUrl = getServerUrl(finalUrl);
            const textToInsert = selectedText.trim() || 'Download File';
            const htmlToInsert = `<a href="${resolvedUrl}" target="_blank" rel="noopener noreferrer">${textToInsert}</a>`;

            let inserted = false;
            if (editorRef.current) {
                const ed = editorRef.current.editor || editorRef.current;
                if (ed) {
                    if (savedRangeRef.current && ed.selection?.restore) {
                        try {
                            ed.selection.restore(savedRangeRef.current);
                        } catch (e) {}
                    }
                    if (ed.selection?.insertHTML) {
                        ed.selection.insertHTML(htmlToInsert);
                        inserted = true;
                    } else if (ed.s?.insertHTML) {
                        ed.s.insertHTML(htmlToInsert);
                        inserted = true;
                    } else if (ed.execCommand) {
                        ed.execCommand('insertHTML', false, htmlToInsert);
                        inserted = true;
                    }

                    const currentEditorHtml = ed.value || (ed.getEditorValue ? ed.getEditorValue() : null) || (ed.getHTML ? ed.getHTML() : null);
                    if (currentEditorHtml) {
                        setFormData(prev => ({ ...prev, content: currentEditorHtml }));
                    }
                }
            }
            if (!inserted) {
                setFormData(prev => ({ ...prev, content: (prev.content || '') + ' ' + htmlToInsert }));
            }

            setShowLinkModal(false);
            setModalFile(null);
            setLinkUrl('');
            setSelectedPdfUrl('');
            setSelectedText('');
            setIsSecureToggle(false);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || err.message || 'Failed to attach file link');
        } finally {
            setModalUploading(false);
        }
    };

    const editorConfig = React.useMemo(() => ({
        readonly: false,
        theme: 'dark',
        minHeight: 400,
        enableDragAndDropFileToEditor: true,
        toolbarInline: true,
        toolbarInlineForSelection: true,
        buttons: [
            'source', '|',
            'bold', 'strikethrough', 'underline', 'italic', '|',
            'ul', 'ol', '|',
            'outdent', 'indent', '|',
            'font', 'fontsize', 'brush', 'paragraph', '|',
            'image', 'table', 'link', 'attachFile', '|',
            'align', 'undo', 'redo', '|',
            'hr', 'eraser', 'copyformat', '|',
            'fullsize', 'selectall'
        ],
        popup: {
            selection: ['bold', 'italic', 'underline', 'link', 'attachFile', 'fontsize', 'brush', 'paragraph'],
            table: ['attachFile', 'link', 'align', 'valign', 'table'],
            text: ['bold', 'italic', 'underline', 'link', 'attachFile']
        },
        controls: {
            attachFile: {
                name: 'attachFile',
                iconURL: '',
                icon: 'file',
                tooltip: 'Attach File / Convert Text to Link',
                popup: (editor, current, self, close) => {
                    openLinkModal();
                    if (typeof close === 'function') close();
                },
                exec: () => {
                    openLinkModal();
                }
            }
        },
        uploader: {
            url: `${import.meta.env.VITE_API_URL}/pages/upload-image`,
            format: 'json',
            method: 'POST',
            prepareData: function (data) {
                const file = data.get('files[0]');
                if (file) {
                    data.append('image', file);
                    data.delete('files[0]');
                }
                return data;
            },
            isSuccess: function(resp) { return resp && (resp.url !== undefined || (typeof resp === 'object' && !resp.error)); },
            process: function (resp) {
                if (!resp || typeof resp !== 'object' || (!resp.url && !resp.isPdf)) {
                    return { error: 1, msg: (resp && resp.message) ? resp.message : 'Error uploading file (Server Error)' };
                }
                return {
                    files: resp.url ? [resp.url] : [],
                    isPdf: resp.isPdf,
                    path: import.meta.env.VITE_API_URL.replace('/api', '') + '/',
                    baseurl: import.meta.env.VITE_API_URL.replace('/api', '') + '/',
                    error: 0,
                    msg: 'Uploaded'
                };
            },
            defaultHandlerSuccess: function (data, resp) {
                if (data.error) {
                    this.events.fire('errorMessage', data.msg);
                    return;
                }
                if (data.files && data.files.length) {
                    const url = data.files[0];
                    if (data.isPdf) {
                        let linkText = 'View PDF';
                        if (this.s.sel && this.s.sel.toString().trim() !== '') {
                            linkText = this.s.sel.toString();
                        } else if (this.s.html && this.s.html.trim() !== '') {
                            linkText = this.s.html;
                        }
                        this.s.insertHTML(`<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`);
                    } else {
                        this.s.insertImage(url);
                    }
                }
            }
        }
    }), []);

    const filteredPages = pages.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Extract all /page/* links from menu that don't have content yet
    const allMenuPageLinks = [];
    menuItems.forEach(item => {
        const checkLink = (link, label) => {
            const match = link?.match(/^\/page\/(.+)/);
            if (match) allMenuPageLinks.push({ slug: match[1].replace(/^\/+/, ''), label });
        };
        checkLink(item.link, item.label);
        (item.children || []).forEach(child => checkLink(child.link, child.label));
    });
    const existingSlugs = new Set(pages.map(p => p.slug.replace(/^\/+/, '')));
    const missingPages = allMenuPageLinks.filter(mp => !existingSlugs.has(mp.slug));

    if (loading && !editingPage) return (
        <div className="flex items-center justify-center min-h-screen bg-[#0a0f1d]">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
    );

    return (
        <div className="p-8 space-y-8 bg-[#0a0f1d] min-h-screen text-white">
            <style>{`
                .jodit-container { border-radius: 1.5rem !important; overflow: hidden; border: 1px solid rgba(255,255,255,0.1) !important; }
                .jodit-workplace { min-height: 400px !important; }
            `}</style>

            <div className="flex justify-between items-center bg-[#1e293b] p-8 rounded-[2rem] border border-white/5 shadow-2xl">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-white">Page Content Manager</h2>
                    <p className="text-white/40 text-sm">Rich text editor for dynamic site pages.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                        <input 
                            className="bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary w-64"
                            placeholder="Search pages..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => { setEditingPage({ isNew: true }); setFormData({ slug: '', title: '', content: '' }); }}
                        className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all"
                    >
                        <Plus size={20} /> Create Page
                    </button>
                </div>
            </div>

            {/* Missing Pages Alert */}
            {!editingPage && missingPages.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
                            <FileText size={20} className="text-amber-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-amber-400 mb-1">Pages Linked in Menu but Not Created Yet</h3>
                            <p className="text-xs text-white/40 mb-4">The following menu items point to dynamic pages that have no content. Click "Create Now" to build them.</p>
                            <div className="flex flex-wrap gap-3">
                                {missingPages.map((mp, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-black/30 border border-amber-500/20 rounded-xl px-4 py-2">
                                        <div>
                                            <p className="text-sm font-bold text-white">{mp.label}</p>
                                            <p className="text-[10px] text-white/30 font-mono">/page/{mp.slug}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setEditingPage({ isNew: true });
                                                setFormData({ slug: mp.slug, title: mp.label, content: '' });
                                            }}
                                            className="ml-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                                        >
                                            Create Now
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {editingPage ? (

                <div className="bg-[#1e293b] p-8 rounded-[2rem] border border-white/10 shadow-2xl space-y-6">
                    <div className="flex justify-between items-center pb-6 border-b border-white/5">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setEditingPage(null)} className="text-white/40 hover:text-white transition-colors">
                                ← Back to List
                            </button>
                            <h3 className="text-xl font-bold">
                                {editingPage.isNew ? 'New Page' : `Editing: ${editingPage.title}`}
                            </h3>
                        </div>
                        {success && (
                            <div className="flex items-center gap-2 text-accent bg-accent/10 px-4 py-2 rounded-xl border border-accent/20 animate-in fade-in slide-in-from-right-4">
                                <CheckCircle size={18} />
                                <span className="font-bold text-sm">Saved Successfully!</span>
                            </div>
                        )}
                        <div className="flex bg-white/5 p-1 rounded-xl">
                            <button 
                                onClick={() => setPreviewMode(false)}
                                className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${!previewMode ? 'bg-primary text-white shadow-lg' : 'text-white/40'}`}
                            >
                                <Edit size={14} /> Editor
                            </button>
                            <button 
                                onClick={() => setPreviewMode(true)}
                                className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${previewMode ? 'bg-primary text-white shadow-lg' : 'text-white/40'}`}
                            >
                                <Eye size={14} /> Preview
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Page Title</label>
                                <input 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary"
                                    placeholder="e.g., About ISOR"
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Page URL (Slug)</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-white/20 text-xs">isor.org.in/page/</span>
                                    <input 
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary"
                                        placeholder="about-isor"
                                        value={formData.slug}
                                        onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-').replace(/^\/+/, '')})}
                                        disabled={!editingPage.isNew}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Menu Placement — only shown for new pages */}
                        {editingPage?.isNew && (
                            <div className="bg-white/3 border border-white/10 rounded-2xl p-5 space-y-3">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                    <Globe size={12} /> Add to Navigation Menu
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {/* None */}
                                    <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                                        menuPlacement === 'none' ? 'border-primary bg-primary/10 text-white' : 'border-white/10 text-white/40 hover:border-white/20'
                                    }`}>
                                        <input type="radio" name="menuPlacement" value="none" className="hidden"
                                            checked={menuPlacement === 'none'}
                                            onChange={() => setMenuPlacement('none')} />
                                        <span className="w-3 h-3 rounded-full border-2 flex-shrink-0" style={{ borderColor: menuPlacement === 'none' ? '#6366f1' : 'rgba(255,255,255,0.2)', background: menuPlacement === 'none' ? '#6366f1' : 'transparent' }} />
                                        <div>
                                            <p className="text-xs font-bold">Don&apos;t add to menu</p>
                                            <p className="text-[10px] text-white/30">Page content only</p>
                                        </div>
                                    </label>
                                    {/* Top-level */}
                                    <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                                        menuPlacement === 'top' ? 'border-primary bg-primary/10 text-white' : 'border-white/10 text-white/40 hover:border-white/20'
                                    }`}>
                                        <input type="radio" name="menuPlacement" value="top" className="hidden"
                                            checked={menuPlacement === 'top'}
                                            onChange={() => setMenuPlacement('top')} />
                                        <span className="w-3 h-3 rounded-full border-2 flex-shrink-0" style={{ borderColor: menuPlacement === 'top' ? '#6366f1' : 'rgba(255,255,255,0.2)', background: menuPlacement === 'top' ? '#6366f1' : 'transparent' }} />
                                        <div>
                                            <p className="text-xs font-bold">Top-level menu item</p>
                                            <p className="text-[10px] text-white/30">Appears in main navbar</p>
                                        </div>
                                    </label>
                                    {/* Under a dropdown */}
                                    {menuItems.filter(m => m.isDropdown).map((item) => {
                                        const idx = menuItems.indexOf(item);
                                        const val = `child-${idx}`;
                                        return (
                                            <label key={idx} className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                                                menuPlacement === val ? 'border-primary bg-primary/10 text-white' : 'border-white/10 text-white/40 hover:border-white/20'
                                            }`}>
                                                <input type="radio" name="menuPlacement" value={val} className="hidden"
                                                    checked={menuPlacement === val}
                                                    onChange={() => setMenuPlacement(val)} />
                                                <span className="w-3 h-3 rounded-full border-2 flex-shrink-0" style={{ borderColor: menuPlacement === val ? '#6366f1' : 'rgba(255,255,255,0.2)', background: menuPlacement === val ? '#6366f1' : 'transparent' }} />
                                                <div>
                                                    <p className="text-xs font-bold">Under &ldquo;{item.label}&rdquo;</p>
                                                    <p className="text-[10px] text-white/30">Added as a dropdown sub-item</p>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                                {menuPlacement !== 'none' && (
                                    <p className="text-[10px] text-primary/80 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
                                        ✓ This page will be added to the menu automatically when you save.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* PDF Upload Panel */}
                        <div className="border border-white/10 rounded-2xl overflow-hidden mb-6">
                            <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <FilePlus size={18} className="text-primary" />
                                    <span className="text-sm font-bold text-white/80">PDF Attachments</span>
                                    <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{pdfs.length} files</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => pdfInputRef.current?.click()}
                                    disabled={uploadingPdf}
                                    className="flex items-center gap-2 bg-primary/20 hover:bg-primary/30 text-primary px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                >
                                    {uploadingPdf ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                    {uploadingPdf ? `Uploading ${uploadProgress}%` : 'Upload PDF'}
                                </button>
                                <input
                                    ref={pdfInputRef}
                                    type="file"
                                    accept="application/pdf"
                                    className="hidden"
                                    onChange={e => e.target.files[0] && uploadPdf(e.target.files[0])}
                                />
                            </div>

                            {/* Drag & Drop Zone */}
                            <div
                                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) uploadPdf(f); }}
                                className={`mx-4 my-3 border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
                                    dragOver ? 'border-primary bg-primary/10 scale-[1.01]' : 'border-white/10 hover:border-primary/40 hover:bg-white/3'
                                }`}
                                onClick={() => pdfInputRef.current?.click()}
                            >
                                <Upload size={20} className={`mx-auto mb-2 ${dragOver ? 'text-primary' : 'text-white/20'}`} />
                                <p className="text-xs text-white/30">Drag & drop a PDF here or <span className="text-primary font-semibold">click to browse</span></p>
                                <p className="text-[10px] text-white/20 mt-1">Max 100 MB · PDF only</p>
                            </div>

                            {/* Upload Progress Bar */}
                            {uploadingPdf && (
                                <div className="mx-4 mb-3">
                                    <div className="w-full bg-white/10 rounded-full h-1.5">
                                        <div
                                            className="bg-primary h-1.5 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* PDF List */}
                            {pdfs.length > 0 && (
                                <div className="mx-4 mb-4 space-y-2 max-h-52 overflow-y-auto pr-1">
                                    {pdfs.map(pdf => (
                                        <div key={pdf.filename} className="flex items-center gap-3 bg-white/5 hover:bg-white/8 rounded-xl px-4 py-3 group transition-all">
                                            <FileText size={16} className="text-primary shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-white truncate">
                                                    {pdf.filename.replace(/^\d+-/, '')}
                                                </p>
                                                <p className="text-[10px] text-white/30">{(pdf.size / 1024).toFixed(0)} KB</p>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    type="button"
                                                    onClick={() => insertPdfLink(pdf)}
                                                    title="Insert link into content"
                                                    className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/30 text-primary transition-all text-[10px] font-bold"
                                                >
                                                    Insert
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => copyUrl(pdf.url)}
                                                    title="Copy URL"
                                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                                                >
                                                    {copiedUrl === pdf.url
                                                        ? <CheckCircle size={14} className="text-green-400" />
                                                        : <Link2 size={14} className="text-white/40" />}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => deletePdf(pdf.filename)}
                                                    title="Delete PDF"
                                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {!previewMode ? (
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Page Content</label>
                                    <button 
                                        type="button"
                                        onClick={openLinkModal}
                                        className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
                                    >
                                        <Link size={14} /> Attach File / Convert Text to Hyperlink
                                    </button>
                                </div>
                                <div className="rounded-xl overflow-hidden text-black">
                                    <JoditEditor
                                        ref={editorRef}
                                        value={formData.content}
                                        config={editorConfig}
                                        onBlur={newContent => setFormData({...formData, content: newContent})}
                                    />
                                </div>
                            </div>
                        ) : (

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Live Preview</label>
                                <div className="w-full bg-white p-12 rounded-[2.5rem] text-gray-800 min-h-[500px] overflow-y-auto">
                                    <h1 className="text-4xl font-serif font-bold text-[#1a4d2e] mb-8 pb-4 border-b border-gray-100">{formData.title}</h1>
                                    <div 
                                        className="prose prose-lg max-w-none prose-slate prose-headings:text-[#1a4d2e] prose-p:text-gray-700 prose-p:leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: formData.content }} 
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-4 pt-6">
                            <button 
                                type="button"
                                onClick={() => setEditingPage(null)}
                                className="px-8 py-4 rounded-xl font-bold text-white/40 hover:bg-white/5 transition-all"
                            >
                                Cancel
                            </button>
                            <button className="bg-primary text-white px-10 py-4 rounded-xl font-bold flex items-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-primary/20">
                                {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                Save Page Content
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPages.map(page => (
                        <div key={page._id} className="bg-[#1e293b] p-8 rounded-[2rem] border border-white/5 hover:border-primary/50 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                    <FileText size={24} />
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => { handleEdit(page); setPreviewMode(true); }}
                                        className="p-2 bg-white/5 hover:bg-accent rounded-lg transition-all text-white/70 hover:text-white"
                                        title="Preview Page"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button 

                                        onClick={() => handleEdit(page)}
                                        className="p-2 bg-white/5 hover:bg-primary rounded-lg transition-all text-white/70 hover:text-white"
                                        title="Edit Page"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button 
                                        onClick={() => deletePage(page._id)}
                                        className="p-2 bg-white/5 hover:bg-error rounded-lg transition-all text-white/70 hover:text-white"
                                        title="Delete Page"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <h4 className="text-xl font-bold mb-1">{page.title}</h4>
                            <p className="text-white/20 text-xs font-mono mb-4">/page/{page.slug.replace(/^\/+/, '')}</p>
                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <span className="text-[10px] text-white/20 uppercase tracking-widest">
                                    Updated: {new Date(page.updatedAt).toLocaleDateString()}
                                </span>
                                {/* Add to Menu quick dropdown */}
                                <div className="relative group/menu">
                                    <button className="flex items-center gap-1 text-white/30 hover:text-primary text-xs transition-all">
                                        <Plus size={12} /> Menu
                                    </button>
                                    <div className="absolute bottom-full right-0 mb-2 w-52 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl py-2 hidden group-hover/menu:block z-50">
                                        <p className="text-[10px] text-white/30 px-3 py-1 uppercase tracking-widest">Add to menu under:</p>
                                        <button
                                            onClick={() => addExistingPageToMenu(page, 'top')}
                                            className="w-full text-left px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-all"
                                        >📌 Top-level item</button>
                                        {menuItems.filter(m => m.isDropdown).map((item) => {
                                            const idx = menuItems.indexOf(item);
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => addExistingPageToMenu(page, `child-${idx}`)}
                                                    className="w-full text-left px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-all"
                                                >↳ Under &ldquo;{item.label}&rdquo;</button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredPages.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-[#1e293b] rounded-[3rem] border border-white/5">
                            <FileText size={48} className="mx-auto text-white/5 mb-4" />
                            <p className="text-white/20">No pages found matching your search.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Attach File / Convert to Hyperlink Modal */}
            {showLinkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#1e293b] border border-white/10 rounded-[2rem] p-8 max-w-lg w-full shadow-2xl space-y-6 text-white relative">
                        <div className="flex justify-between items-center pb-4 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-primary/20 text-primary rounded-xl">
                                    <Link size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Attach File / Add Hyperlink</h3>
                                    <p className="text-xs text-white/40">Attach a file URL or upload a PDF/file to selected text</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowLinkModal(false)}
                                className="p-2 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleModalSubmit} className="space-y-5">
                            {/* Selected Text / Display Text */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Display Text</label>
                                <input 
                                    type="text"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-primary"
                                    value={selectedText}
                                    onChange={(e) => setSelectedText(e.target.value)}
                                    placeholder="e.g. Read full proceedings PDF"
                                />
                            </div>

                            {/* Option A: Select from Uploaded PDFs */}
                            {pdfs.length > 0 && (
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Option A: Select from Uploaded PDFs</label>
                                    <select 
                                        className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-primary"
                                        value={selectedPdfUrl}
                                        onChange={(e) => {
                                            setSelectedPdfUrl(e.target.value);
                                            if (e.target.value) {
                                                setLinkUrl('');
                                                setModalFile(null);
                                            }
                                        }}
                                    >
                                        <option value="">-- Choose an uploaded PDF --</option>
                                        {pdfs.map((pdf, i) => (
                                            <option key={i} value={pdf.url}>
                                                📄 {pdf.filename.replace(/^\d+-/, '')}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Option B: URL input */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Option B: Link URL</label>
                                <input 
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-primary"
                                    value={linkUrl}
                                    onChange={(e) => { 
                                        setLinkUrl(e.target.value); 
                                        if (e.target.value) {
                                            setSelectedPdfUrl('');
                                            setModalFile(null);
                                        }
                                    }}
                                    placeholder="https://example.com/document.pdf or /uploads/..."
                                />
                            </div>

                            <div className="flex items-center gap-4 my-2">
                                <div className="h-px bg-white/10 flex-1"></div>
                                <span className="text-[10px] uppercase font-bold text-white/30">OR</span>
                                <div className="h-px bg-white/10 flex-1"></div>
                            </div>

                            {/* Option C: Upload File */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Option C: Upload New File</label>
                                <div 
                                    onClick={() => modalFileInputRef.current?.click()}
                                    className="border-2 border-dashed border-white/10 hover:border-primary/50 bg-white/5 rounded-2xl p-5 text-center cursor-pointer transition-all"
                                >
                                    <FileUp size={24} className="mx-auto text-primary mb-2" />
                                    <p className="text-xs text-white/70 font-semibold">
                                        {modalFile ? modalFile.name : 'Click to select file to upload'}
                                    </p>
                                    <p className="text-[10px] text-white/30 mt-1">PDFs, Documents, Images supported</p>
                                    <input 
                                        ref={modalFileInputRef}
                                        type="file"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files[0]) {
                                                setModalFile(e.target.files[0]);
                                                setLinkUrl('');
                                                setSelectedPdfUrl('');
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Secure Toggle Switch */}
                            <div className="bg-black/30 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <Lock size={14} className={isSecureToggle ? 'text-amber-400' : 'text-white/40'} />
                                        <span className="text-sm font-bold text-white">Secure PDF Access</span>
                                    </div>
                                    <p className="text-[11px] text-white/40">
                                        When turned ON, non-members can only view the first 2 pages of the PDF file.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsSecureToggle(!isSecureToggle)}
                                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                                        isSecureToggle ? 'bg-amber-500' : 'bg-white/10'
                                    }`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                                        isSecureToggle ? 'translate-x-6' : 'translate-x-0'
                                    }`} />
                                </button>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowLinkModal(false)}
                                    className="px-5 py-3 rounded-xl text-xs font-bold text-white/60 hover:bg-white/5 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={modalUploading}
                                    className="bg-primary text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                                >
                                    {modalUploading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                    {modalUploading ? 'Uploading & Attaching...' : 'Insert Hyperlink'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PageManagement;

