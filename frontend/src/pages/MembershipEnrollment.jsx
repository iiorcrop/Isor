import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    User, 
    Mail, 
    MapPin, 
    Briefcase, 
    GraduationCap, 
    Book, 
    CreditCard,
    CheckCircle,
    Loader2,
    Send,
    Image,
    Landmark,
    Phone,
    UserCircle,
    Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MembershipEnrollment = () => {
    const [formData, setFormData] = useState({
        title: 'Dr.',
        firstName: '',
        lastName: '',
        email: '',
        mobileNumber: '',
        designation: '',
        organization: '',
        address: '',
        qualification: '',
        specialization: '',
        membershipType: 'Annual',
        membershipYear: new Date().getFullYear().toString(),
        password: Math.random().toString(36).slice(-8), 
        paymentMethod: 'BankTransfer'
    });
    
    const [paymentProof, setPaymentProof] = useState(null);
    const [paymentSettings, setPaymentSettings] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);

    const membershipPrices = {
        'Annual': 1000,
        'Life': 5000,
        'Student': 550
    };

    const adminFee = 50;
    const totalPrice = (membershipPrices[formData.membershipType] || 0) + adminFee;

    useEffect(() => {
        fetchPaymentSettings();
    }, []);

    const fetchPaymentSettings = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/payment-settings`);
            setPaymentSettings(res.data);
        } catch (err) {
            console.error('Failed to fetch payment settings', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!paymentProof) return alert('Please upload proof of payment');

        setLoading(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        data.append('paymentProof', paymentProof);

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/membership/enroll`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess(res.data);
            setLoading(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Enrollment failed');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#fff9f0] flex items-center justify-center p-6">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl text-center space-y-6 border border-[#1e703c]/10"
                >
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle size={48} />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-[#064e3b]">Enrollment Successful!</h2>
                    <p className="text-gray-600">Your Membership ID is:</p>
                    <div className="bg-[#064e3b] text-white py-4 px-6 rounded-2xl text-2xl font-mono font-bold tracking-widest">
                        {success.membershipId}
                    </div>
                    <p className="text-sm text-gray-500">A confirmation email with your login credentials has been sent to {formData.email}.</p>
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="w-full bg-[#b47c1c] text-white py-4 rounded-2xl font-bold hover:bg-[#9a6a18] transition-all"
                    >
                        Return Home
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fff9f0] py-16 px-6">
            <div className="max-w-5xl mx-auto">
                <header className="text-center mb-16 space-y-4">
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-serif font-bold text-[#064e3b]"
                    >
                        Membership Enrollment
                    </motion.h1>
                    <p className="text-[#b47c1c] font-bold tracking-[0.2em] uppercase text-sm">Indian Society of Oilseeds Research</p>
                    <div className="w-32 h-1.5 bg-gradient-to-r from-transparent via-[#b47c1c] to-transparent mx-auto rounded-full" />
                </header>

                <form onSubmit={handleSubmit} className="bg-white rounded-[4rem] shadow-2xl overflow-hidden border border-[#064e3b]/5">
                    <div className="p-8 md:p-16 space-y-16">
                        
                        {/* Section 1: Personal Details */}
                        <div className="space-y-8">
                            <h3 className="text-xl font-bold text-[#064e3b] flex items-center gap-3 pb-4 border-b border-gray-100">
                                <span className="w-8 h-8 bg-[#064e3b] text-white rounded-lg flex items-center justify-center text-sm">01</span>
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                                <div className="md:col-span-1 space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Title</label>
                                    <select 
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:outline-none focus:border-[#1e703c]"
                                        value={formData.title}
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                    >
                                        <option>Dr.</option>
                                        <option>Mr.</option>
                                        <option>Ms.</option>
                                        <option>Prof.</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                                    <input 
                                        required
                                        type="text" 
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:outline-none focus:border-[#1e703c]"
                                        placeholder="Enter first name"
                                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                                    />
                                </div>
                                <div className="md:col-span-3 space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                                    <input 
                                        required
                                        type="text" 
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:outline-none focus:border-[#1e703c]"
                                        placeholder="Enter last name"
                                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                                    />
                                </div>
                                <div className="md:col-span-3 space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <input 
                                        required
                                        type="email" 
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:outline-none focus:border-[#1e703c]"
                                        placeholder="email@example.com"
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                                <div className="md:col-span-3 space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Mobile Number</label>
                                    <div className="relative">
                                        <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input 
                                            required
                                            type="tel" 
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 pl-12 focus:outline-none focus:border-[#1e703c]"
                                            placeholder="+91 XXXXX XXXXX"
                                            onChange={e => setFormData({...formData, mobileNumber: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Professional Details */}
                        <div className="space-y-8">
                            <h3 className="text-xl font-bold text-[#064e3b] flex items-center gap-3 pb-4 border-b border-gray-100">
                                <span className="w-8 h-8 bg-[#064e3b] text-white rounded-lg flex items-center justify-center text-sm">02</span>
                                Professional Background
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Designation</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:outline-none focus:border-[#1e703c]"
                                        placeholder="e.g. Scientist, Professor"
                                        onChange={e => setFormData({...formData, designation: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Organization</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:outline-none focus:border-[#1e703c]"
                                        placeholder="ICAR, University, etc."
                                        onChange={e => setFormData({...formData, organization: e.target.value})}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Mailing Address</label>
                                    <textarea 
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:outline-none focus:border-[#1e703c] min-h-[100px]"
                                        placeholder="Complete postal address for official communication"
                                        onChange={e => setFormData({...formData, address: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Educational Qualification</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:outline-none focus:border-[#1e703c]"
                                        onChange={e => setFormData({...formData, qualification: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Field of Specialization</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:outline-none focus:border-[#1e703c]"
                                        onChange={e => setFormData({...formData, specialization: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Membership & Payment */}
                        <div className="space-y-8">
                            <h3 className="text-xl font-bold text-[#064e3b] flex items-center gap-3 pb-4 border-b border-gray-100">
                                <span className="w-8 h-8 bg-[#064e3b] text-white rounded-lg flex items-center justify-center text-sm">03</span>
                                Membership & Payment
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Select Membership Type</label>
                                        <select 
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:outline-none focus:border-[#1e703c] font-bold text-[#064e3b]"
                                            value={formData.membershipType}
                                            onChange={e => setFormData({...formData, membershipType: e.target.value})}
                                        >
                                            <option value="Annual">Annual Membership (Rs. 1000)</option>
                                            <option value="Life">Life Membership (Rs. 5000)</option>
                                            <option value="Student">Student Membership (Rs. 550)</option>
                                        </select>
                                    </div>

                                    <div className="bg-gray-50 rounded-3xl p-6 space-y-3 border border-gray-100">
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Base Membership Fee</span>
                                            <span className="font-bold">₹{membershipPrices[formData.membershipType]}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Admission Fee (Once)</span>
                                            <span className="font-bold">₹{adminFee}</span>
                                        </div>
                                        <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                                            <span className="font-bold text-[#064e3b]">Total Amount Payable</span>
                                            <span className="text-2xl font-serif font-bold text-[#b47c1c]">₹{totalPrice}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Payment Mode</label>
                                        <div className="flex gap-3">
                                            {['BankTransfer', 'Online'].map(mode => (
                                                <button
                                                    key={mode}
                                                    type="button"
                                                    onClick={() => setFormData({...formData, paymentMethod: mode})}
                                                    className={`flex-1 py-4 rounded-2xl font-bold text-sm transition-all ${
                                                        formData.paymentMethod === mode 
                                                        ? 'bg-[#1e703c] text-white shadow-lg' 
                                                        : 'bg-gray-100 text-gray-400'
                                                    }`}
                                                >
                                                    {mode === 'BankTransfer' ? 'Bank Transfer' : 'Online Gateway'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <AnimatePresence mode="wait">
                                        {formData.paymentMethod === 'BankTransfer' && paymentSettings ? (
                                            <motion.div 
                                                key="bank"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="bg-[#064e3b] p-8 rounded-[2.5rem] text-white space-y-4 shadow-2xl relative overflow-hidden group"
                                            >
                                                <Landmark className="absolute -right-4 -bottom-4 text-white/5 w-40 h-40" />
                                                <div className="relative z-10">
                                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Official Payment Details</p>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <p className="text-[10px] uppercase font-bold text-white/40">Account Name</p>
                                                            <p className="font-serif">Indian Society of Oilseeds Research</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] uppercase font-bold text-white/40">Bank & IFSC</p>
                                                            <p className="font-mono text-sm">{paymentSettings.bankName} - {paymentSettings.ifscCode}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] uppercase font-bold text-white/40">Account Number</p>
                                                            <p className="font-mono text-xl font-bold text-[#fbbf24]">{paymentSettings.accountNumber}</p>
                                                        </div>
                                                        {paymentSettings.upiId && (
                                                            <div className="pt-4 border-t border-white/10">
                                                                <p className="text-[10px] uppercase font-bold text-white/40">UPI ID</p>
                                                                <p className="font-bold text-[#fbbf24]">{paymentSettings.upiId}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div 
                                                key="online"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-200 text-center space-y-4 flex flex-col justify-center min-h-[300px]"
                                            >
                                                <CreditCard className="mx-auto text-amber-500 w-12 h-12" />
                                                <p className="font-bold text-amber-900">Secure Online Checkout</p>
                                                <p className="text-sm text-amber-700">Digital gateway is currently in maintenance. Please use Bank Transfer for immediate activation.</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Document Upload */}
                        <div className="space-y-8">
                            <h3 className="text-xl font-bold text-[#064e3b] flex items-center gap-3 pb-4 border-b border-gray-100">
                                <span className="w-8 h-8 bg-[#064e3b] text-white rounded-lg flex items-center justify-center text-sm">04</span>
                                Final Verification
                            </h3>
                            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[3rem] p-10 md:p-16 text-center space-y-6 group hover:border-[#1e703c]/30 transition-all">
                                <div className="w-20 h-20 bg-white shadow-xl rounded-3xl flex items-center justify-center mx-auto text-[#b47c1c] group-hover:scale-110 transition-transform">
                                    <Image size={32} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-lg font-bold text-[#064e3b]">Upload Payment Receipt</h4>
                                    <p className="text-sm text-gray-500 max-w-sm mx-auto">Please attach a clear screenshot or PDF of your transaction for manual verification by the admin.</p>
                                </div>
                                <input 
                                    required
                                    type="file" 
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    className="hidden"
                                    id="payment-upload"
                                    onChange={e => setPaymentProof(e.target.files[0])}
                                />
                                <label 
                                    htmlFor="payment-upload"
                                    className="inline-flex items-center gap-2 bg-[#064e3b] text-white px-8 py-4 rounded-2xl font-bold cursor-pointer hover:bg-[#04392b] transition-all"
                                >
                                    <Send size={18} />
                                    {paymentProof ? 'Change File' : 'Choose Receipt File'}
                                </label>
                                {paymentProof && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-sm font-bold text-[#1e703c] flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={16} /> {paymentProof.name}
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-[#b47c1c] text-white py-8 rounded-[2.5rem] font-bold text-2xl flex items-center justify-center gap-4 shadow-2xl hover:bg-[#9a6a18] hover:scale-[1.01] transition-all disabled:opacity-70 disabled:hover:scale-100"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Award size={28} />}
                            {loading ? 'Processing Application...' : `Complete Enrollment (₹${totalPrice})`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MembershipEnrollment;
