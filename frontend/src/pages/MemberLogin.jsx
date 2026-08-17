import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Lock, Loader2, ArrowRight, ShieldCheck, XCircle, Clock, Landmark, Send, Image, Award, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Link } from 'react-router-dom';

import { uploadToStorageServer } from '../utils/fileUploader';

const MemberLogin = () => {
    const [credentials, setCredentials] = useState({ identifier: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [statusData, setStatusData] = useState(null);
    const [resubmitFile, setResubmitFile] = useState(null);
    const [resubmitting, setResubmitting] = useState(false);

    // Repayment / Renewal modal state for expired subscriptions
    const [expiredMember, setExpiredMember] = useState(null);
    const [renewPlan, setRenewPlan] = useState('Yearly');
    const [renewProof, setRenewProof] = useState(null);
    const [bankSettings, setBankSettings] = useState(null);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/membership/payment-info`)
            .then(res => setBankSettings(res.data))
            .catch(err => console.error('Failed to load payment info', err));
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/membership/login`, {
                membershipId: credentials.identifier,
                email: credentials.identifier,
                password: credentials.password
            });
            const { member, token } = res.data;
            
            localStorage.setItem('memberToken', token);
            localStorage.setItem('memberData', JSON.stringify(member));

            if (member.subscriptionStatus === 'Expired') {
                setExpiredMember(member);
            } else if (member.approvalStatus === 'Approved') {
                window.location.href = '/member-dashboard';
            } else {
                setStatusData(member);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleResubmit = async () => {
        if (!resubmitFile) return alert('Please select a file');
        setResubmitting(true);

        try {
            const paymentProofUrl = await uploadToStorageServer(resubmitFile);
            const payload = {
                memberId: statusData._id || statusData.id,
                paymentProofUrl
            };
            await axios.post(`${import.meta.env.VITE_API_URL}/membership/resubmit-proof`, payload);
            alert('Proof resubmitted! Our admin team will review it.');
            setStatusData(null);
        } catch (err) {
            alert('Failed to resubmit proof: ' + (err.message || ''));
        } finally {
            setResubmitting(false);
        }
    };

    const handleRenewSubmit = async (e) => {
        e.preventDefault();
        if (!renewProof) return alert('Please upload payment screenshot proof');
        setResubmitting(true);

        try {
            const paymentProofUrl = await uploadToStorageServer(renewProof);
            const payload = {
                memberId: expiredMember._id,
                membershipType: renewPlan,
                paymentProofUrl
            };
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/membership/submit-subscription`, payload);
            alert('Renewal payment submitted! Admin will verify and activate your membership.');
            setExpiredMember(null);
            setStatusData(res.data.member || expiredMember);
        } catch (err) {
            alert(err.response?.data?.message || err.message || 'Failed to submit renewal payment');
        } finally {
            setResubmitting(false);
        }
    };

    // Render Expired Renewal Dialog
    if (expiredMember) {
        const fee = renewPlan === 'Lifetime' || renewPlan === 'Life' 
            ? (bankSettings?.lifetimeFee || 5000) 
            : (bankSettings?.yearlyFee || 1000);

        return (
            <div className="min-h-screen bg-[#fff9f0] flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl w-full bg-white rounded-[3rem] shadow-2xl p-8 md:p-10 border border-[#064e3b]/5 space-y-6">
                    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 text-center space-y-2">
                        <AlertTriangle size={36} className="text-amber-600 mx-auto" />
                        <h2 className="text-2xl font-serif font-bold text-amber-900">Yearly Subscription Expired</h2>
                        <p className="text-amber-700 text-xs">
                            Hello {expiredMember.firstName}, your yearly membership subscription has expired. Please select a plan and repay to continue your ISOR membership privileges.
                        </p>
                    </div>

                    <form onSubmit={handleRenewSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#064e3b] uppercase tracking-widest">Select Subscription Plan</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setRenewPlan('Yearly')}
                                    className={`p-4 rounded-2xl border-2 text-left transition-all ${renewPlan === 'Yearly' ? 'border-[#064e3b] bg-[#064e3b]/5 font-bold' : 'border-gray-200'}`}
                                >
                                    <div className="text-xs text-gray-500 uppercase">Yearly Plan</div>
                                    <div className="text-xl font-bold text-[#b47c1c]">₹{bankSettings?.yearlyFee || 1000}</div>
                                    <div className="text-[10px] text-gray-400">Valid for 1 Year</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRenewPlan('Lifetime')}
                                    className={`p-4 rounded-2xl border-2 text-left transition-all ${renewPlan === 'Lifetime' ? 'border-[#064e3b] bg-[#064e3b]/5 font-bold' : 'border-gray-200'}`}
                                >
                                    <div className="text-xs text-gray-500 uppercase">Lifetime Plan</div>
                                    <div className="text-xl font-bold text-[#b47c1c]">₹{bankSettings?.lifetimeFee || 5000}</div>
                                    <div className="text-[10px] text-gray-400">Permanent Membership</div>
                                </button>
                            </div>
                        </div>

                        {bankSettings && (
                            <div className="bg-[#064e3b] text-white p-6 rounded-2xl space-y-2 text-xs relative overflow-hidden">
                                <Landmark className="absolute -right-4 -bottom-4 text-white/5 w-28 h-28" />
                                <p className="text-[10px] font-bold text-[#fbbf24] uppercase">Admin Bank Transfer Details</p>
                                <p><span className="text-white/60">Bank:</span> {bankSettings.bankName}</p>
                                <p><span className="text-white/60">Account Number:</span> <strong className="text-[#fbbf24] font-mono text-sm">{bankSettings.accountNumber}</strong></p>
                                <p><span className="text-white/60">IFSC:</span> {bankSettings.ifscCode} | Branch: {bankSettings.branchName}</p>
                                {bankSettings.upiId && <p><span className="text-white/60">UPI ID:</span> <span className="text-[#fbbf24] font-bold">{bankSettings.upiId}</span></p>}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Upload Repayment Screenshot Proof</label>
                            <input 
                                required
                                type="file" 
                                accept=".jpg,.jpeg,.png,.pdf"
                                className="w-full text-xs bg-gray-50 p-3 rounded-xl border border-dashed border-gray-200"
                                onChange={e => setRenewProof(e.target.files[0])}
                            />
                        </div>

                        <div className="flex gap-4">
                            <button 
                                type="button" 
                                onClick={() => setExpiredMember(null)}
                                className="w-1/3 py-4 rounded-xl border border-gray-300 text-xs font-bold text-gray-600 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={resubmitting}
                                className="w-2/3 bg-[#b47c1c] text-white py-4 rounded-xl font-bold hover:bg-[#9a6a18] transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                {resubmitting ? <Loader2 className="animate-spin" /> : <Award size={18} />}
                                {resubmitting ? 'Submitting...' : `Submit Repayment (₹${fee})`}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        );
    }

    if (statusData) {
        return (
            <div className="min-h-screen bg-[#fff9f0] flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 border border-[#064e3b]/5 text-center">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${statusData.approvalStatus === 'Rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                        {statusData.approvalStatus === 'Rejected' ? <XCircle size={32} /> : <Clock size={32} />}
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-[#064e3b] mb-2">Membership Status</h2>
                    <p className="text-gray-500 text-sm mb-6">
                        {statusData.approvalStatus === 'Rejected' 
                            ? 'Your enrollment was rejected by the admin. Please upload proper payment proof.' 
                            : 'Your profile setup and subscription form are currently under review by the Admin.'}
                    </p>

                    <div className="bg-gray-50 p-6 rounded-2xl mb-6 text-left space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400 uppercase font-bold">Membership ID</span>
                            <span className="text-[#064e3b] font-bold">{statusData.membershipId || 'Provisional'}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400 uppercase font-bold">Subscription Plan</span>
                            <span className="text-[#b47c1c] font-bold">{statusData.membershipType}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400 uppercase font-bold">Approval Status</span>
                            <span className={`font-bold ${statusData.approvalStatus === 'Rejected' ? 'text-red-500' : 'text-amber-500'}`}>
                                {statusData.approvalStatus || 'Pending'}
                            </span>
                        </div>
                    </div>

                    {statusData.approvalStatus === 'Rejected' && (
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Upload Payment Screenshot Proof (JPG/PNG/PDF)</label>
                            <input 
                                type="file" 
                                className="w-full text-xs bg-gray-50 p-3 rounded-xl border border-dashed border-gray-200"
                                onChange={e => setResubmitFile(e.target.files[0])}
                            />
                            <button 
                                onClick={handleResubmit}
                                disabled={resubmitting}
                                className="w-full bg-[#064e3b] text-white py-4 rounded-xl font-bold hover:bg-[#04392b] transition-all shadow-lg"
                            >
                                {resubmitting ? 'Submitting...' : 'Resubmit Proof for Approval'}
                            </button>
                        </div>
                    )}

                    <button onClick={() => setStatusData(null)} className="mt-6 text-xs font-bold text-gray-400 hover:text-[#064e3b]">Back to Login</button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fff9f0] flex items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-[#064e3b]/5"
            >
                <div className="bg-[#064e3b] p-10 text-center space-y-2">
                    <div className="w-16 h-16 bg-[#fbbf24] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl rotate-3">
                        <ShieldCheck size={32} className="text-[#064e3b]" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-white uppercase tracking-tight">Member Portal Login</h2>
                    <p className="text-white/60 text-xs font-medium tracking-widest uppercase">Indian Society of Oilseeds Research</p>
                </div>

                <form onSubmit={handleLogin} className="p-10 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold text-center border border-red-100">
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email or Membership ID</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                required
                                type="text" 
                                placeholder="email@example.com or ISOR-2026-XXXX"
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-xs font-medium focus:outline-none focus:border-[#1e703c] transition-all"
                                value={credentials.identifier}
                                onChange={e => setCredentials({...credentials, identifier: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                required
                                type="password" 
                                placeholder="••••••••"
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-xs font-medium focus:outline-none focus:border-[#1e703c] transition-all"
                                value={credentials.password}
                                onChange={e => setCredentials({...credentials, password: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <Link to="/forgot-password" className="text-xs font-bold text-[#b47c1c] hover:underline">Forgot Password?</Link>
                        <Link to="/membership" className="text-xs font-bold text-[#064e3b] hover:underline">New Enrollment</Link>
                    </div>

                    <button 
                        disabled={loading}
                        className="w-full bg-[#064e3b] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#04392b] transition-all shadow-xl group"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                        {loading ? 'Verifying Credentials...' : 'Sign In to Portal'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default MemberLogin;
