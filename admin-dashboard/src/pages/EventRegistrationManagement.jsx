import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getServerUrl } from '../utils/urlHelper';
import { CheckCircle, XCircle, Trash2, Eye, FileText, Image, Search, Filter, Loader2, CreditCard } from 'lucide-react';

const EventRegistrationManagement = () => {
    const [registrations, setRegistrations] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    // Modal view state
    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const [viewScreenshotUrl, setViewScreenshotUrl] = useState(null);

    useEffect(() => {
        fetchData();
    }, [selectedEventId, selectedStatus]);

    const fetchData = async () => {
        try {
            const queryParams = new URLSearchParams();
            if (selectedEventId) queryParams.append('eventId', selectedEventId);
            if (selectedStatus) queryParams.append('status', selectedStatus);

            const [regRes, eventRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/admin/event-registrations?${queryParams.toString()}`),
                axios.get(`${import.meta.env.VITE_API_URL}/national-events`)
            ]);

            setRegistrations(regRes.data);
            setEvents(eventRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch event registrations:', err);
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        let rejectionReason = '';
        if (status === 'Rejected') {
            rejectionReason = window.prompt('Enter reason for rejecting this registration (optional):') || '';
        }

        try {
            await axios.patch(`${import.meta.env.VITE_API_URL}/admin/event-registrations/${id}/status`, {
                paymentStatus: status,
                rejectionReason
            });
            fetchData();
            if (selectedRegistration && selectedRegistration._id === id) {
                setSelectedRegistration(prev => ({ ...prev, paymentStatus: status, rejectionReason }));
            }
        } catch (err) {
            console.error('Failed to update registration status:', err);
            alert('Failed to update registration status');
        }
    };

    const deleteRegistration = async (id) => {
        if (!window.confirm('Delete this registration submission?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/admin/event-registrations/${id}`);
            fetchData();
            if (selectedRegistration && selectedRegistration._id === id) {
                setSelectedRegistration(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-[#0a0f1d] min-h-screen text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#1e293b] p-8 rounded-[2rem] border border-white/5 shadow-2xl gap-4">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-white">Event Registrations</h2>
                    <p className="text-white/40 text-sm">Review incoming registrations, inspect payment screenshots, and approve applications.</p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4">
                    <select 
                        className="bg-[#0a0f1d] border border-white/10 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-primary"
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                    >
                        <option value="">All National Events</option>
                        {events.map(e => (
                            <option key={e._id} value={e._id}>{e.title}</option>
                        ))}
                    </select>

                    <select 
                        className="bg-[#0a0f1d] border border-white/10 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-primary"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="Pending">Pending Approval</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Registrations List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
            ) : registrations.length === 0 ? (
                <div className="text-center py-24 bg-[#1e293b] rounded-[3rem] border border-white/5">
                    <FileText size={64} className="mx-auto text-white/5 mb-4" />
                    <p className="text-white/40 font-medium">No event registrations found matching filters.</p>
                </div>
            ) : (
                <div className="bg-[#1e293b] rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-black/20 text-white/40 text-[10px] uppercase tracking-widest font-bold">
                                    <th className="p-5">Reg No.</th>
                                    <th className="p-5">Applicant</th>
                                    <th className="p-5">Event Title</th>
                                    <th className="p-5">Payment Screenshot</th>
                                    <th className="p-5">Status</th>
                                    <th className="p-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {registrations.map((reg) => (
                                    <tr key={reg._id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-5 font-mono text-primary font-bold">{reg.registrationNo}</td>
                                        <td className="p-5">
                                            <p className="font-bold text-white">{reg.applicantName}</p>
                                            <p className="text-xs text-white/40">{reg.applicantEmail}</p>
                                        </td>
                                        <td className="p-5 text-white/80 font-medium max-w-xs truncate">{reg.eventTitle}</td>
                                        <td className="p-5">
                                            {reg.paymentScreenshot ? (
                                                <button 
                                                    onClick={() => setViewScreenshotUrl(getServerUrl(reg.paymentScreenshot))}
                                                    className="bg-white/5 hover:bg-primary/20 text-primary border border-primary/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                                                >
                                                    <Image size={14} /> View Receipt
                                                </button>
                                            ) : (
                                                <span className="text-white/30 text-xs italic">Free Event / No File</span>
                                            )}
                                        </td>
                                        <td className="p-5">
                                            <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                                                reg.paymentStatus === 'Approved' ? 'bg-green-500/20 text-green-400' :
                                                reg.paymentStatus === 'Rejected' ? 'bg-red-500/20 text-red-400' :
                                                'bg-amber-500/20 text-amber-400'
                                            }`}>
                                                {reg.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right space-x-2">
                                            <button 
                                                onClick={() => setSelectedRegistration(reg)}
                                                className="bg-white/5 hover:bg-white/10 text-white p-2.5 rounded-xl transition-all"
                                                title="View All Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            {reg.paymentStatus !== 'Approved' && (
                                                <button 
                                                    onClick={() => updateStatus(reg._id, 'Approved')}
                                                    className="bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-white p-2.5 rounded-xl transition-all"
                                                    title="Approve"
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                            )}
                                            {reg.paymentStatus !== 'Rejected' && (
                                                <button 
                                                    onClick={() => updateStatus(reg._id, 'Rejected')}
                                                    className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white p-2.5 rounded-xl transition-all"
                                                    title="Reject"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => deleteRegistration(reg._id)}
                                                className="bg-error/10 text-error p-2.5 rounded-xl hover:bg-error hover:text-white transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Registration Details Modal */}
            {selectedRegistration && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#1e293b] border border-white/10 rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl space-y-6 text-white max-h-[90vh] overflow-y-auto relative">
                        <div className="flex justify-between items-center pb-4 border-b border-white/10">
                            <div>
                                <span className="text-xs text-primary font-mono font-bold">{selectedRegistration.registrationNo}</span>
                                <h3 className="text-2xl font-serif font-bold text-white">{selectedRegistration.applicantName}</h3>
                            </div>
                            <button 
                                onClick={() => setSelectedRegistration(null)}
                                className="p-2 rounded-xl bg-white/5 text-white/60 hover:text-white"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-black/20 p-4 rounded-xl space-y-1">
                                <p className="text-xs text-white/40 uppercase font-bold">Event</p>
                                <p className="text-base font-bold text-white">{selectedRegistration.eventTitle}</p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest">Custom Form Responses</h4>
                                <div className="bg-white/5 rounded-xl p-4 space-y-3">
                                    {selectedRegistration.responses && Object.entries(selectedRegistration.responses).map(([k, v]) => (
                                        <div key={k} className="flex justify-between items-start border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                            <span className="text-xs font-semibold text-white/60">{k}:</span>
                                            <span className="text-xs font-bold text-white text-right">{v || 'N/A'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedRegistration.paymentScreenshot && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest">Payment Receipt Screenshot</h4>
                                    <div className="rounded-xl overflow-hidden border border-white/10 max-h-64 bg-black/40 flex items-center justify-center cursor-pointer"
                                         onClick={() => setViewScreenshotUrl(getServerUrl(selectedRegistration.paymentScreenshot))}>
                                        <img src={getServerUrl(selectedRegistration.paymentScreenshot)} alt="Payment receipt" className="max-h-64 object-contain" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                            <button 
                                onClick={() => updateStatus(selectedRegistration._id, 'Approved')}
                                className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-green-600 transition-all flex items-center gap-2"
                            >
                                <CheckCircle size={16} /> Approve Registration
                            </button>
                            <button 
                                onClick={() => updateStatus(selectedRegistration._id, 'Rejected')}
                                className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-red-600 transition-all flex items-center gap-2"
                            >
                                <XCircle size={16} /> Reject Registration
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Full Screenshot Modal */}
            {viewScreenshotUrl && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                    <div className="relative max-w-4xl w-full bg-[#1e293b] p-6 rounded-[2rem] border border-white/10 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-white/10">
                            <h4 className="font-bold text-white">Payment Receipt Image</h4>
                            <button onClick={() => setViewScreenshotUrl(null)} className="text-white/60 hover:text-white">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <div className="max-h-[75vh] overflow-y-auto flex justify-center">
                            <img src={viewScreenshotUrl} alt="Full payment receipt" className="max-h-[70vh] object-contain rounded-xl" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventRegistrationManagement;
