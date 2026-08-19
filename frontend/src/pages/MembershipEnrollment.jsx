import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
    User, 
    Mail, 
    MapPin, 
    Briefcase, 
    GraduationCap, 
    CreditCard,
    CheckCircle,
    Loader2,
    Send,
    Image,
    Landmark,
    Phone,
    Award,
    ArrowRight,
    Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Link } from 'react-router-dom';

import { uploadToStorageServer } from '../utils/fileUploader';
import { fetchLocationByPincode, INDIAN_STATES, normalizeState } from '../utils/pincodeService';

// Sentinel option value for "my District / Mandal is not in the list".
const MANUAL_ENTRY = '__manual__';

const MembershipEnrollment = () => {
    const [step, setStep] = useState(1); // 1: Profile Setup, 2: Subscription & Payment, 3: Pending Approval
    const [formData, setFormData] = useState({
        title: 'Dr.',
        firstName: '',
        lastName: '',
        email: '',
        mobileNumber: '',
        address: '',
        pincode: '',
        state: '',
        district: '',
        mandal: '',
        designation: '',
        organization: '',
        qualification: '',
        specialization: '',
        membershipYear: new Date().getFullYear().toString(),
        password: '',
        membershipType: 'yearly',
        transactionId: ''
    });

    // Locations the PIN lookup returned, merged into the dropdowns so a PIN can
    // always be honoured even when its spelling differs from the bundled data.
    const [apiLocation, setApiLocation] = useState({ states: [], districts: [], mandals: [] });
    const [locationData, setLocationData] = useState(null);
    const [manualDistrict, setManualDistrict] = useState(false);
    const [manualMandal, setManualMandal] = useState(false);
    const [fetchingPincode, setFetchingPincode] = useState(false);
    const [pincodeError, setPincodeError] = useState('');

    useEffect(() => {
        // Loaded on demand so the State/District/Mandal data stays out of the main bundle.
        import('../data/indiaLocations.json')
            .then(module => setLocationData(module.default))
            .catch(err => console.error('Failed to load location data', err));
    }, []);

    const sortedUnique = (values) => Array.from(new Set(values.filter(Boolean)))
        .sort((a, b) => a.localeCompare(b));

    const stateOptions = useMemo(() => sortedUnique([
        ...(locationData ? Object.keys(locationData) : INDIAN_STATES),
        ...apiLocation.states.map(normalizeState)
    ]), [locationData, apiLocation.states]);

    const districtOptions = useMemo(() => {
        const states = locationData || {};
        const fromData = states[formData.state] ? Object.keys(states[formData.state]) : [];
        return sortedUnique([...fromData, ...apiLocation.districts]);
    }, [locationData, formData.state, apiLocation.districts]);

    const mandalOptions = useMemo(() => {
        const districts = (locationData || {})[formData.state] || {};
        return sortedUnique([...(districts[formData.district] || []), ...apiLocation.mandals]);
    }, [locationData, formData.state, formData.district, apiLocation.mandals]);

    const handleStateChange = (value) => {
        setFormData(prev => ({ ...prev, state: value, district: '', mandal: '' }));
        setApiLocation(prev => ({ ...prev, districts: [], mandals: [] }));
        setManualDistrict(false);
        setManualMandal(false);
    };

    const handleDistrictChange = (value) => {
        if (value === MANUAL_ENTRY) {
            setManualDistrict(true);
            value = '';
        }
        setFormData(prev => ({ ...prev, district: value, mandal: '' }));
        setApiLocation(prev => ({ ...prev, mandals: [] }));
        setManualMandal(false);
    };

    const handleMandalChange = (value) => {
        if (value === MANUAL_ENTRY) {
            setManualMandal(true);
            value = '';
        }
        setFormData(prev => ({ ...prev, mandal: value }));
    };

    const handlePincodeChange = async (pinValue) => {
        const cleaned = pinValue.replace(/\D/g, '').slice(0, 6);
        setFormData(prev => ({ ...prev, pincode: cleaned }));
        setPincodeError('');

        if (cleaned.length === 6) {
            setFetchingPincode(true);
            const res = await fetchLocationByPincode(cleaned);
            setFetchingPincode(false);

            if (res.success) {
                const districts = res.districts || [];
                const mandals = res.mandals || [];
                setApiLocation({ states: res.states || [], districts, mandals });
                setManualDistrict(false);
                setManualMandal(false);
                setFormData(prev => ({
                    ...prev,
                    state: normalizeState((res.states && res.states[0]) || res.state) || prev.state,
                    // A PIN code can span several districts or mandals, so only
                    // pre-select one when the lookup is unambiguous.
                    district: districts.length === 1 ? districts[0] : '',
                    mandal: mandals.length === 1 ? mandals[0] : ''
                }));
            } else {
                setPincodeError(res.message || 'Could not fetch pincode details.');
            }
        } else {
            setApiLocation({ states: [], districts: [], mandals: [] });
        }
    };
    
    const [paymentProof, setPaymentProof] = useState(null);
    const [paymentSettings, setPaymentSettings] = useState({
        bankName: 'STATE BANK OF INDIA',
        accountNumber: '52032213529',
        ifscCode: 'SBIN0020074',
        branchName: 'RAJENDRANAGAR BRANCH',
        upiId: 'isor@sbi',
        yearlyFee: 1000,
        lifetimeFee: 5000
    });
    
    const [loading, setLoading] = useState(false);
    const [registeredMember, setRegisteredMember] = useState(null);

    useEffect(() => {
        fetchPaymentSettings();
    }, []);

    const fetchPaymentSettings = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/membership/payment-info`);
            if (res.data) {
                setPaymentSettings(prev => ({
                    ...prev,
                    ...res.data
                }));
            }
        } catch (err) {
            console.error('Failed to fetch payment settings', err);
        }
    };

    // Step 1: Profile Setup Submit
    const handleProfileSubmit = (e) => {
        e.preventDefault();
        const { firstName, lastName, email, mobileNumber, address, pincode, state, district, mandal } = formData;
        if (!firstName || !lastName || !email || !mobileNumber || !address) {
            return alert('Please fill all mandatory fields: First Name, Last Name, Email, Mobile Number, and Communication Address.');
        }
        if (!pincode || !state || !district || !mandal) {
            return alert('Please enter your PIN code and select your State, District and Mandal / Tehsil / Area.');
        }
        // Move to Step 2: Select Subscription & Payment
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Step 2: Final Enrollment & Payment Submission
    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        if (!paymentProof) {
            return alert('Please upload a screenshot or document proof of your payment.');
        }

        setLoading(true);

        try {
            const paymentProofUrl = await uploadToStorageServer(paymentProof);
            const payload = {
                ...formData,
                paymentProofUrl
            };

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/membership/enroll`, payload);
            setRegisteredMember(res.data.member || res.data);
            if (res.data.token) {
                localStorage.setItem('memberToken', res.data.token);
                localStorage.setItem('memberData', JSON.stringify(res.data.member));
            }
            setStep(3);
            setLoading(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Enrollment submission failed.');
            setLoading(false);
        }
    };

    const currentFee = formData.membershipType?.toLowerCase() === 'lifetime'
        ? (paymentSettings.lifetimeFee || 5000)
        : (paymentSettings.yearlyFee || 1000);

    return (
        <div className="min-h-screen bg-[#fff9f0] py-12 px-6">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-10 space-y-3">
                    <motion.h1 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-serif font-bold text-[#064e3b]"
                    >
                        ISOR Member Registration & Profile Setup
                    </motion.h1>
                    <p className="text-[#b47c1c] font-bold tracking-[0.2em] uppercase text-xs">Indian Society of Oilseeds Research</p>
                    
                    {/* Stepper Header */}
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ${step >= 1 ? 'bg-[#064e3b] text-white' : 'bg-gray-200 text-gray-500'}`}>
                            <span>1. Profile Setup</span>
                        </div>
                        <div className="w-8 h-0.5 bg-gray-300" />
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ${step >= 2 ? 'bg-[#064e3b] text-white' : 'bg-gray-200 text-gray-500'}`}>
                            <span>2. Subscription & Payment</span>
                        </div>
                        <div className="w-8 h-0.5 bg-gray-300" />
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ${step === 3 ? 'bg-[#064e3b] text-white' : 'bg-gray-200 text-gray-500'}`}>
                            <span>3. Admin Approval</span>
                        </div>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.form 
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleProfileSubmit} 
                            className="bg-white rounded-[3rem] shadow-2xl p-8 md:p-12 space-y-10 border border-[#064e3b]/5"
                        >
                            <div className="border-b border-gray-100 pb-4">
                                <h2 className="text-2xl font-serif font-bold text-[#064e3b] flex items-center gap-3">
                                    <User className="text-[#b47c1c]" /> Step 1: Profile Information Setup
                                </h2>
                                <p className="text-gray-500 text-xs mt-1">Please enter your profile details. Fields marked with <span className="text-red-500 font-bold">*</span> are mandatory.</p>
                            </div>

                            {/* Mandatory Fields */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-bold text-[#064e3b] uppercase tracking-widest bg-[#fff9f0] p-3 rounded-xl border border-[#b47c1c]/10">
                                    Mandatory Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                                    <div className="md:col-span-1 space-y-1">
                                        <label className="text-xs font-semibold text-gray-700">Title</label>
                                        <select 
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                            value={formData.title}
                                            onChange={e => setFormData({...formData, title: e.target.value})}
                                        >
                                            <option>Dr.</option>
                                            <option>Mr.</option>
                                            <option>Ms.</option>
                                            <option>Prof.</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2 space-y-1">
                                        <label className="text-xs font-semibold text-gray-700">First Name <span className="text-red-500">*</span></label>
                                        <input 
                                            required
                                            type="text" 
                                            value={formData.firstName}
                                            onChange={e => setFormData({...formData, firstName: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                            placeholder="First Name"
                                        />
                                    </div>
                                    <div className="md:col-span-3 space-y-1">
                                        <label className="text-xs font-semibold text-gray-700">Last Name <span className="text-red-500">*</span></label>
                                        <input 
                                            required
                                            type="text" 
                                            value={formData.lastName}
                                            onChange={e => setFormData({...formData, lastName: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                            placeholder="Last Name"
                                        />
                                    </div>
                                    <div className="md:col-span-3 space-y-1">
                                        <label className="text-xs font-semibold text-gray-700">Email Address <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input 
                                                required
                                                type="email" 
                                                value={formData.email}
                                                onChange={e => setFormData({...formData, email: e.target.value})}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 pl-12 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                                placeholder="email@domain.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-3 space-y-1">
                                        <label className="text-xs font-semibold text-gray-700">Mobile Number <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input 
                                                required
                                                type="tel" 
                                                value={formData.mobileNumber}
                                                onChange={e => setFormData({...formData, mobileNumber: e.target.value})}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 pl-12 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                                placeholder="+91 XXXXX XXXXX"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-6 space-y-1">
                                        <label className="text-xs font-semibold text-gray-700">Communication Address <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <MapPin size={16} className="absolute left-4 top-4 text-gray-400" />
                                            <textarea 
                                                required
                                                rows={2}
                                                value={formData.address}
                                                onChange={e => setFormData({...formData, address: e.target.value})}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 pl-12 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                                placeholder="Street Address, House/Flat No, Landmark"
                                            />
                                        </div>
                                    </div>

                                    {/* Location Details (PIN Code, State, District, Mandal) */}
                                    <div className="md:col-span-3 space-y-1">
                                        <label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                                            <span>PIN Code <span className="text-red-500">*</span></span>
                                            {fetchingPincode && <span className="text-xs text-[#064e3b] font-normal animate-pulse flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Fetching location...</span>}
                                        </label>
                                        <input 
                                            required
                                            type="text" 
                                            maxLength={6}
                                            value={formData.pincode}
                                            onChange={e => handlePincodeChange(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                            placeholder="Enter 6-digit PIN code (e.g. 500030)"
                                        />
                                        {pincodeError
                                            ? <p className="text-[11px] text-red-500 font-medium">{pincodeError} You can still pick your location from the lists below.</p>
                                            : <p className="text-[11px] text-gray-400 font-medium">Fills the lists below automatically, or pick your location yourself.</p>}
                                    </div>

                                    <div className="md:col-span-3 space-y-1">
                                        <label className="text-xs font-semibold text-gray-700">State <span className="text-red-500">*</span></label>
                                        <select
                                            required
                                            value={formData.state}
                                            onChange={e => handleStateChange(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                        >
                                            <option value="">Select State</option>
                                            {stateOptions.map((opt, idx) => (
                                                <option key={idx} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="md:col-span-3 space-y-1">
                                        <label className="text-xs font-semibold text-gray-700">District <span className="text-red-500">*</span></label>
                                        {manualDistrict ? (
                                            <>
                                                <input
                                                    required
                                                    type="text"
                                                    value={formData.district}
                                                    onChange={e => setFormData({...formData, district: e.target.value})}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                                    placeholder="Type your District"
                                                />
                                                <button type="button" onClick={() => setManualDistrict(false)} className="text-[11px] font-semibold text-[#064e3b] hover:underline">
                                                    Choose from list instead
                                                </button>
                                            </>
                                        ) : (
                                            <select
                                                required
                                                value={formData.district}
                                                onChange={e => handleDistrictChange(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                            >
                                                <option value="">{formData.state ? 'Select District' : 'Select your State first'}</option>
                                                {districtOptions.map((opt, idx) => (
                                                    <option key={idx} value={opt}>{opt}</option>
                                                ))}
                                                <option value={MANUAL_ENTRY}>Other / Not listed</option>
                                            </select>
                                        )}
                                    </div>

                                    <div className="md:col-span-3 space-y-1">
                                        <label className="text-xs font-semibold text-gray-700">Mandal / Tehsil / Area <span className="text-red-500">*</span></label>
                                        {manualMandal ? (
                                            <>
                                                <input
                                                    required
                                                    type="text"
                                                    value={formData.mandal}
                                                    onChange={e => setFormData({...formData, mandal: e.target.value})}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                                    placeholder="Type your Mandal / Tehsil / Area"
                                                />
                                                <button type="button" onClick={() => setManualMandal(false)} className="text-[11px] font-semibold text-[#064e3b] hover:underline">
                                                    Choose from list instead
                                                </button>
                                            </>
                                        ) : (
                                            <select
                                                required
                                                value={formData.mandal}
                                                onChange={e => handleMandalChange(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                            >
                                                <option value="">{formData.district ? 'Select Mandal / Tehsil / Area' : 'Select your District first'}</option>
                                                {mandalOptions.map((opt, idx) => (
                                                    <option key={idx} value={opt}>{opt}</option>
                                                ))}
                                                <option value={MANUAL_ENTRY}>Other / Not listed</option>
                                            </select>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Additional Profile Details */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-bold text-[#064e3b] uppercase tracking-widest bg-gray-50 p-3 rounded-xl">
                                    Position & Professional Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-700">Position / Role (Designation)</label>
                                        <input 
                                            type="text" 
                                            value={formData.designation}
                                            onChange={e => setFormData({...formData, designation: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                            placeholder="e.g. Senior Scientist, Professor"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-700">Organization / University</label>
                                        <input 
                                            type="text" 
                                            value={formData.organization}
                                            onChange={e => setFormData({...formData, organization: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                            placeholder="Organization Name"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-700">Educational Qualification</label>
                                        <input 
                                            type="text" 
                                            value={formData.qualification}
                                            onChange={e => setFormData({...formData, qualification: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                            placeholder="e.g. Ph.D. in Agronomy"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-700">Field of Specialization</label>
                                        <input 
                                            type="text" 
                                            value={formData.specialization}
                                            onChange={e => setFormData({...formData, specialization: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                            placeholder="e.g. Oilseeds Physiology"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-700">Membership Year</label>
                                        <input 
                                            type="text" 
                                            value={formData.membershipYear}
                                            onChange={e => setFormData({...formData, membershipYear: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-700">Password</label>
                                        <div className="relative">
                                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input 
                                                required
                                                type="password" 
                                                value={formData.password}
                                                onChange={e => setFormData({...formData, password: e.target.value})}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 pl-12 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                                placeholder="Create portal password"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                className="w-full bg-[#064e3b] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#04392b] transition-all shadow-xl text-lg"
                            >
                                Continue to Member Subscription <ArrowRight size={20} />
                            </button>
                        </motion.form>
                    )}

                    {step === 2 && (
                        <motion.form 
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleFinalSubmit} 
                            className="bg-white rounded-[3rem] shadow-2xl p-8 md:p-12 space-y-10 border border-[#064e3b]/5"
                        >
                            <div className="border-b border-gray-100 pb-4 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-serif font-bold text-[#064e3b] flex items-center gap-3">
                                        <Award className="text-[#b47c1c]" /> Step 2: Select Subscription Plan & Payment
                                    </h2>
                                    <p className="text-gray-500 text-xs mt-1">Select your preferred subscription and upload your payment proof screenshot.</p>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => setStep(1)}
                                    className="text-xs font-bold text-gray-400 hover:text-[#064e3b] underline"
                                >
                                    &larr; Back to Profile
                                </button>
                            </div>

                            {/* Plan Selection */}
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-[#064e3b] uppercase tracking-widest">Choose Subscription Plan</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div 
                                        onClick={() => setFormData({...formData, membershipType: 'yearly'})}
                                        className={`p-6 rounded-3xl border-2 cursor-pointer transition-all space-y-3 ${
                                            formData.membershipType?.toLowerCase() === 'yearly'
                                            ? 'border-[#064e3b] bg-[#064e3b]/5 shadow-lg'
                                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-serif font-bold text-[#064e3b] text-lg">Yearly Subscription</span>
                                            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase">1 Year Validity</span>
                                        </div>
                                        <div className="text-3xl font-serif font-bold text-[#b47c1c]">
                                            ₹{paymentSettings.yearlyFee || 1000}
                                        </div>
                                        <p className="text-gray-500 text-xs leading-relaxed">
                                            Expires after 1 year. Requires annual repayment to renew access.
                                        </p>
                                    </div>

                                    <div 
                                        onClick={() => setFormData({...formData, membershipType: 'lifetime'})}
                                        className={`p-6 rounded-3xl border-2 cursor-pointer transition-all space-y-3 ${
                                            formData.membershipType?.toLowerCase() === 'lifetime'
                                            ? 'border-[#064e3b] bg-[#064e3b]/5 shadow-lg'
                                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-serif font-bold text-[#064e3b] text-lg">Lifetime Subscription</span>
                                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase">Permanent</span>
                                        </div>
                                        <div className="text-3xl font-serif font-bold text-[#b47c1c]">
                                            ₹{paymentSettings.lifetimeFee || 5000}
                                        </div>
                                        <p className="text-gray-500 text-xs leading-relaxed">
                                            One-time fee for life long permanent membership. Never expires.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Render Admin Bank Details */}
                            <div className="bg-[#064e3b] p-8 rounded-[2.5rem] text-white space-y-4 shadow-2xl relative overflow-hidden">
                                <Landmark className="absolute -right-4 -bottom-4 text-white/5 w-40 h-40" />
                                <div className="relative z-10 space-y-4">
                                    <p className="text-[10px] font-bold text-[#fbbf24] uppercase tracking-widest">Admin Configured Bank Transfer Details</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-white/40">Bank Name</p>
                                            <p className="font-serif font-bold">{paymentSettings.bankName}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-white/40">Account Number</p>
                                            <p className="font-mono text-xl font-bold text-[#fbbf24]">{paymentSettings.accountNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-white/40">IFSC Code</p>
                                            <p className="font-mono font-bold">{paymentSettings.ifscCode}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-white/40">Branch Name</p>
                                            <p className="font-medium text-xs text-white/80">{paymentSettings.branchName}</p>
                                        </div>
                                        {paymentSettings.upiId && (
                                            <div className="md:col-span-2 pt-3 border-t border-white/10 flex justify-between items-center">
                                                <span className="text-[10px] uppercase font-bold text-white/40">UPI ID for Direct Scan/Pay</span>
                                                <span className="font-bold text-[#fbbf24] font-mono">{paymentSettings.upiId}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Transaction ID & Screenshot Proof Upload */}
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bank Transaction Reference / UTR Number (Optional)</label>
                                    <input 
                                        type="text" 
                                        value={formData.transactionId}
                                        onChange={e => setFormData({...formData, transactionId: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs font-medium focus:outline-none focus:border-[#064e3b]"
                                        placeholder="e.g. UTR / Ref No. 4239871239"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Upload Payment Screenshot Status Proof <span className="text-red-500">*</span></label>
                                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem] p-8 text-center space-y-4">
                                        <Image className="mx-auto text-gray-400" size={32} />
                                        <p className="text-xs text-gray-500">Attach screenshot (JPG, PNG, PDF) confirming payment of ₹{currentFee}.</p>
                                        <input 
                                            required
                                            type="file" 
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            id="payment-proof-file"
                                            className="hidden"
                                            onChange={e => setPaymentProof(e.target.files[0])}
                                        />
                                        <label 
                                            htmlFor="payment-proof-file"
                                            className="inline-flex items-center gap-2 bg-[#064e3b] text-white px-6 py-3 rounded-xl font-bold text-xs cursor-pointer hover:bg-[#04392b] transition-all"
                                        >
                                            <Send size={14} /> {paymentProof ? 'Change Screenshot' : 'Choose Screenshot File'}
                                        </label>
                                        {paymentProof && (
                                            <p className="text-xs font-bold text-[#064e3b] flex items-center justify-center gap-1">
                                                <CheckCircle size={14} className="text-green-600" /> {paymentProof.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-[#b47c1c] text-white py-6 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 shadow-2xl hover:bg-[#9a6a18] transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Award size={24} />}
                                {loading ? 'Submitting Application...' : `Submit Form & Payment Proof (₹${currentFee})`}
                            </button>
                        </motion.form>
                    )}

                    {step === 3 && (
                        <motion.div 
                            key="step3"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl text-center space-y-6 border border-[#064e3b]/10"
                        >
                            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle size={48} />
                            </div>
                            <h2 className="text-3xl font-serif font-bold text-[#064e3b]">Membership Form & Payment Submitted!</h2>
                            <p className="text-gray-600 text-sm max-w-md mx-auto">
                                Your profile setup and subscription payment proof are currently in <strong className="text-amber-600">Pending Review</strong>. The admin will verify your payment details from the Admin Dashboard and approve your membership.
                            </p>

                            {registeredMember && (
                                <div className="bg-gray-50 p-6 rounded-2xl max-w-md mx-auto space-y-2 text-left">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400 uppercase font-bold">Member Name</span>
                                        <span className="text-[#064e3b] font-bold">{formData.firstName} {formData.lastName}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400 uppercase font-bold">Email</span>
                                        <span className="text-[#064e3b] font-bold">{formData.email}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400 uppercase font-bold">Subscription Plan</span>
                                        <span className="text-[#b47c1c] font-bold capitalize">{formData.membershipType} (₹{currentFee})</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400 uppercase font-bold">Status</span>
                                        <span className="text-amber-600 font-bold">Pending Admin Approval</span>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                                <Link 
                                    to="/membership/login"
                                    className="bg-[#064e3b] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#04392b] transition-all text-sm inline-block text-center"
                                >
                                    Proceed to Member Login
                                </Link>
                                <Link 
                                    to="/"
                                    className="border border-gray-300 text-gray-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all text-sm inline-block text-center"
                                >
                                    Return Home
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MembershipEnrollment;
