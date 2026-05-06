import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, Save, Landmark, QrCode, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentSettings = () => {
    const [settings, setSettings] = useState({
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        branchName: '',
        upiId: '',
        activeGateway: 'BankTransfer'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/payment-settings`);
            setSettings(res.data);
        } catch (err) { 
            console.error('Fetch error:', err);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Strip internal fields to avoid MongoDB errors
            const { _id, __v, createdAt, updatedAt, ...payload } = settings;
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/admin/payment-settings`, payload);
            alert('Payment settings updated successfully!');
            setLoading(false);
        } catch (err) {
            console.error('Save error:', err);
            const msg = err.response?.data?.message || err.message || 'Network Error';
            alert(`Error: ${msg}`);
            setLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-8 max-w-4xl">
            <header>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <CreditCard className="text-primary" /> Payment & Gateway Settings
                </h1>
                <p className="text-text-muted mt-2">Configure how members pay for their enrollment.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Bank Details */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0f172a] border border-white/5 p-8 rounded-[2rem] space-y-6"
                >
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Landmark size={20} className="text-primary" /> Bank Transfer Details
                    </h2>
                    <div className="space-y-4">
                        <SettingInput 
                            label="Bank Name" 
                            value={settings.bankName} 
                            onChange={val => setSettings({...settings, bankName: val})} 
                        />
                        <SettingInput 
                            label="Account Number" 
                            value={settings.accountNumber} 
                            onChange={val => setSettings({...settings, accountNumber: val})} 
                        />
                        <SettingInput 
                            label="IFSC Code" 
                            value={settings.ifscCode} 
                            onChange={val => setSettings({...settings, ifscCode: val})} 
                        />
                        <SettingInput 
                            label="Branch Name" 
                            value={settings.branchName} 
                            onChange={val => setSettings({...settings, branchName: val})} 
                        />
                    </div>
                </motion.div>

                {/* Digital Payment / UPI */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#0f172a] border border-white/5 p-8 rounded-[2rem] space-y-6"
                >
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <QrCode size={20} className="text-primary" /> UPI & Digital Payments
                    </h2>
                    <div className="space-y-4">
                        <SettingInput 
                            label="UPI ID" 
                            placeholder="e.g. isor@sbi"
                            value={settings.upiId} 
                            onChange={val => setSettings({...settings, upiId: val})} 
                        />
                        <div className="pt-4 border-t border-white/5">
                            <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Active Gateway</label>
                            <select 
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none"
                                value={settings.activeGateway}
                                onChange={e => setSettings({...settings, activeGateway: e.target.value})}
                            >
                                <option value="BankTransfer" className="bg-[#0f172a]">Bank Transfer (Manual)</option>
                                <option value="Razorpay" className="bg-[#0f172a]">Razorpay (Digital)</option>
                                <option value="Stripe" className="bg-[#0f172a]">Stripe (International)</option>
                            </select>
                        </div>
                    </div>
                </motion.div>
            </div>

            <button 
                onClick={handleSave}
                disabled={loading}
                className="bg-primary text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
            >
                <Save size={20} />
                {loading ? 'Saving...' : 'Save Payment Configuration'}
            </button>
        </div>
    );
};

const SettingInput = ({ label, value, onChange, placeholder }) => (
    <div className="space-y-1.5">
        <label className="block text-xs font-bold text-white/40 uppercase tracking-widest">{label}</label>
        <input 
            type="text" 
            placeholder={placeholder}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary transition-all"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);

export default PaymentSettings;
