import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, Tag, Upload, Loader2, CheckCircle2, ArrowLeft, Building2, CreditCard, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

import { uploadToStorageServer } from '../utils/fileUploader';

const EventRegister = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [paymentSettings, setPaymentSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submittedData, setSubmittedData] = useState(null);
    
    // Dynamic form responses & payment screenshot
    const [formData, setFormData] = useState({});
    const [screenshotFile, setScreenshotFile] = useState(null);
    const [copiedField, setCopiedField] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eventRes, paymentRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/national-events/${id}`),
                    axios.get(`${import.meta.env.VITE_API_URL}/admin/payment-settings`)
                ]);
                setEvent(eventRes.data);
                setPaymentSettings(paymentRes.data);

                // Initialize default responses from customFields
                const initial = {};
                (eventRes.data.customFields || []).forEach(field => {
                    initial[field.name || field.label] = '';
                });
                setFormData(initial);

                setLoading(false);
            } catch (err) {
                console.error('Failed to load registration data:', err);
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleInputChange = (fieldName, value) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
    };

    const copyToClipboard = (text, fieldName) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(''), 2000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!event.isFree && event.price > 0 && !screenshotFile) {
            alert('Please upload a screenshot of your payment receipt to complete registration.');
            return;
        }

        setSubmitting(true);

        try {
            let paymentScreenshot = '';
            if (screenshotFile) {
                paymentScreenshot = await uploadToStorageServer(screenshotFile);
            }

            const nameKey = Object.keys(formData).find(k => k.toLowerCase().includes('name')) || Object.keys(formData)[0];
            const emailKey = Object.keys(formData).find(k => k.toLowerCase().includes('email'));
            const phoneKey = Object.keys(formData).find(k => k.toLowerCase().includes('phone') || k.toLowerCase().includes('mobile'));

            const payload = {
                responses: formData,
                paymentScreenshot,
                applicantName: (nameKey && formData[nameKey]) ? formData[nameKey] : undefined,
                applicantEmail: (emailKey && formData[emailKey]) ? formData[emailKey] : undefined,
                applicantPhone: (phoneKey && formData[phoneKey]) ? formData[phoneKey] : undefined
            };

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/national-events/${id}/register`, payload);
            setSubmittedData(res.data);
        } catch (err) {
            console.error('Submission failed:', err);
            alert(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#fff9f0] flex items-center justify-center">
            <Loader2 className="animate-spin text-[#064e3b]" size={48} />
        </div>
    );

    if (!event) return (
        <div className="min-h-screen bg-[#fff9f0] flex items-center justify-center p-6">
            <div className="bg-white rounded-[3rem] p-12 text-center max-w-md space-y-4 shadow-xl">
                <h2 className="text-2xl font-serif font-bold text-[#064e3b]">Event Not Found</h2>
                <Link to="/events/national" className="inline-block bg-[#064e3b] text-white px-6 py-3 rounded-2xl font-bold text-xs">
                    Return to Events
                </Link>
            </div>
        </div>
    );

    if (submittedData) return (
        <div className="min-h-screen bg-[#fff9f0] py-16 px-6 flex items-center justify-center">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[3rem] p-10 md:p-14 border border-[#064e3b]/10 shadow-2xl max-w-2xl w-full text-center space-y-6"
            >
                <div className="w-20 h-20 bg-[#064e3b]/10 text-[#064e3b] rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={48} />
                </div>

                <div className="space-y-2">
                    <span className="text-[#b47c1c] text-xs font-bold uppercase tracking-widest">Registration Submitted</span>
                    <h2 className="text-3xl font-serif font-bold text-[#064e3b]">Thank You for Registering!</h2>
                    <p className="text-gray-600 text-sm">
                        Your registration for <strong className="text-[#064e3b]">{event.title}</strong> has been received successfully.
                    </p>
                </div>

                <div className="bg-[#fff9f0] p-6 rounded-2xl border border-[#064e3b]/10 space-y-2">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Registration Number</p>
                    <p className="text-2xl font-mono font-bold text-[#064e3b]">{submittedData.registrationNo}</p>
                    <p className="text-xs text-gray-500">Status: <span className="font-bold text-[#b47c1c]">{submittedData.paymentStatus}</span></p>
                </div>

                <div className="pt-4 flex justify-center gap-4">
                    <button 
                        onClick={() => navigate('/events/national')}
                        className="bg-[#064e3b] text-white px-8 py-3.5 rounded-2xl font-bold text-xs hover:bg-[#04392b] transition-all"
                    >
                        Back to Events
                    </button>
                </div>
            </motion.div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#fff9f0] py-16 px-6">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Back Button & Event Summary */}
                <div className="space-y-4">
                    <Link to="/events/national" className="inline-flex items-center gap-2 text-[#064e3b] font-bold text-xs hover:text-[#b47c1c] transition-colors">
                        <ArrowLeft size={16} /> Back to All Events
                    </Link>

                    <div className="bg-white rounded-[3rem] p-10 border border-[#064e3b]/10 shadow-xl space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <span className="text-[#b47c1c] text-xs font-bold uppercase tracking-widest">Online Registration</span>
                            <span className="bg-[#064e3b] text-white px-4 py-1.5 rounded-full text-xs font-bold">
                                {event.isFree ? 'FREE REGISTRATION' : `FEE: ₹${event.price}`}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#064e3b]">{event.title}</h1>

                        <div className="flex flex-wrap gap-6 text-xs text-gray-500 font-semibold pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-1.5">
                                <Calendar size={14} className="text-[#b47c1c]" />
                                {new Date(event.eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </div>
                            {event.location && (
                                <div className="flex items-center gap-1.5">
                                    <MapPin size={14} className="text-[#b47c1c]" />
                                    {event.location}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] p-10 md:p-14 border border-[#064e3b]/10 shadow-xl space-y-8">
                    <div className="space-y-2 border-b border-gray-100 pb-6">
                        <h2 className="text-2xl font-serif font-bold text-[#064e3b]">Participant Details</h2>
                        <p className="text-gray-500 text-xs">Please fill out all required information below.</p>
                    </div>

                    {/* Dynamic Fields Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(event.customFields || []).map((field, idx) => {
                            const fieldKey = field.name || field.label;
                            const isFullWidth = field.fieldType === 'textarea';

                            return (
                                <div key={idx} className={`space-y-2 ${isFullWidth ? 'md:col-span-2' : ''}`}>
                                    <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                                        <span>{field.label} {field.required && <span className="text-red-500">*</span>}</span>
                                    </label>

                                    {field.fieldType === 'select' ? (
                                        <select
                                            required={field.required}
                                            value={formData[fieldKey] || ''}
                                            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                                            className="w-full bg-[#fff9f0] border border-[#064e3b]/15 rounded-2xl p-4 text-sm text-gray-800 focus:outline-none focus:border-[#064e3b]"
                                        >
                                            <option value="">Select {field.label}</option>
                                            {(field.options || []).map((opt, oIdx) => (
                                                <option key={oIdx} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    ) : field.fieldType === 'textarea' ? (
                                        <textarea
                                            required={field.required}
                                            rows={3}
                                            value={formData[fieldKey] || ''}
                                            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                                            placeholder={`Enter ${field.label}`}
                                            className="w-full bg-[#fff9f0] border border-[#064e3b]/15 rounded-2xl p-4 text-sm text-gray-800 focus:outline-none focus:border-[#064e3b]"
                                        />
                                    ) : (
                                        <input
                                            type={field.fieldType === 'email' ? 'email' : field.fieldType === 'number' ? 'number' : field.fieldType === 'phone' ? 'tel' : 'text'}
                                            required={field.required}
                                            value={formData[fieldKey] || ''}
                                            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                                            placeholder={`Enter ${field.label}`}
                                            className="w-full bg-[#fff9f0] border border-[#064e3b]/15 rounded-2xl p-4 text-sm text-gray-800 focus:outline-none focus:border-[#064e3b]"
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Bank Details & Payment Section (If Paid Event) */}
                    {!event.isFree && event.price > 0 && paymentSettings && (
                        <div className="space-y-6 pt-6 border-t border-gray-100">
                            <div className="space-y-2">
                                <h3 className="text-xl font-serif font-bold text-[#064e3b] flex items-center gap-2">
                                    <CreditCard className="text-[#b47c1c]" size={22} /> Bank Transfer & Payment Receipt
                                </h3>
                                <p className="text-xs text-gray-500">Please transfer ₹{event.price} to the official ISOR bank account and upload your payment screenshot below.</p>
                            </div>

                            {/* Bank Details Card */}
                            <div className="bg-[#064e3b] text-white p-8 rounded-3xl space-y-4 shadow-xl border border-[#b47c1c]">
                                <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                                    <Building2 className="text-[#fbbf24]" size={20} />
                                    <span className="font-bold text-sm tracking-wider uppercase">Official ISOR Bank Account</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                    <div className="bg-black/20 p-4 rounded-2xl flex justify-between items-center">
                                        <div>
                                            <p className="text-white/60 text-[10px] uppercase font-bold">Bank Name</p>
                                            <p className="font-bold text-sm text-white">{paymentSettings.bankName || 'STATE BANK OF INDIA'}</p>
                                        </div>
                                    </div>
                                    <div className="bg-black/20 p-4 rounded-2xl flex justify-between items-center">
                                        <div>
                                            <p className="text-white/60 text-[10px] uppercase font-bold">Account Number</p>
                                            <p className="font-mono font-bold text-sm text-[#fbbf24]">{paymentSettings.accountNumber || '52032213529'}</p>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => copyToClipboard(paymentSettings.accountNumber || '52032213529', 'acc')}
                                            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                                        >
                                            {copiedField === 'acc' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                    <div className="bg-black/20 p-4 rounded-2xl flex justify-between items-center">
                                        <div>
                                            <p className="text-white/60 text-[10px] uppercase font-bold">IFSC Code</p>
                                            <p className="font-mono font-bold text-sm text-[#fbbf24]">{paymentSettings.ifscCode || 'SBIN0020074'}</p>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => copyToClipboard(paymentSettings.ifscCode || 'SBIN0020074', 'ifsc')}
                                            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                                        >
                                            {copiedField === 'ifsc' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                    <div className="bg-black/20 p-4 rounded-2xl flex justify-between items-center">
                                        <div>
                                            <p className="text-white/60 text-[10px] uppercase font-bold">Branch</p>
                                            <p className="font-bold text-sm text-white">{paymentSettings.branchName || 'RAJENDRANAGAR BRANCH'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Screenshot Upload Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700">Upload Payment Receipt Screenshot <span className="text-red-500">*</span></label>
                                <div className="border-2 border-dashed border-[#064e3b]/20 hover:border-[#064e3b] bg-[#fff9f0] rounded-3xl p-8 text-center cursor-pointer transition-all relative">
                                    <input 
                                        type="file"
                                        accept="image/*,.pdf"
                                        required
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => setScreenshotFile(e.target.files[0])}
                                    />
                                    <Upload size={36} className="mx-auto text-[#064e3b]/40 mb-2" />
                                    <p className="text-xs font-bold text-[#064e3b]">
                                        {screenshotFile ? screenshotFile.name : 'Click or Drag & Drop Payment Screenshot'}
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-1">Supports PNG, JPG, JPEG or PDF formats</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-[#064e3b] text-white px-10 py-4 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-[#b47c1c] transition-all shadow-xl disabled:opacity-50"
                        >
                            {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                            {submitting ? 'Submitting Registration...' : 'Complete & Submit Registration'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default EventRegister;
