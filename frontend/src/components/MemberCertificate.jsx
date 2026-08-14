import React from 'react';
import { motion } from 'framer-motion';
import { X, Printer } from 'lucide-react';

const MemberCertificate = ({ member, onClose }) => {
    const isLifetime = member?.membershipType?.toLowerCase() === 'lifetime' || member?.membershipType === 'Life' || member?.membershipType === 'Lifetime';

    const handlePrint = () => {
        window.print();
    };

    const formattedExpiry = isLifetime
        ? 'Lifetime Member (Permanent)'
        : member?.subscriptionEndDate
            ? new Date(member.subscriptionEndDate).toLocaleDateString('en-GB')
            : '1 Year from Issue';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-black/90 backdrop-blur-md">
            {/* Backdrop click */}
            <div onClick={onClose} className="fixed inset-0" />

            <div className="relative w-full max-w-3xl my-auto flex flex-col gap-4 items-center z-10">
                {/* Action Buttons */}
                <div className="flex gap-3 print:hidden">
                    <button 
                        onClick={handlePrint}
                        className="bg-[#064e3b] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#04392b] transition-all shadow-xl text-sm"
                    >
                        <Printer size={18} /> Print / Save as PDF
                    </button>
                    <button 
                        onClick={onClose}
                        className="bg-white/10 text-white p-3 rounded-xl hover:bg-white/20 transition-all"
                        title="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Printable Certificate Container */}
                <div 
                    className="w-full aspect-[1/1.414] bg-white shadow-2xl relative overflow-hidden p-6 sm:p-10 flex flex-col justify-between text-center box-border print:m-0 print:shadow-none print:w-full print:h-full"
                    id="certificate-print-area"
                >
                    {/* Outer & Inner Decorative Borders */}
                    <div className="absolute inset-4 border-[8px] border-[#064e3b] pointer-events-none" />
                    <div className="absolute inset-7 border border-[#b47c1c] pointer-events-none" />

                    {/* Corner Ornaments */}
                    <div className="absolute top-5 left-5 w-12 h-12 border-t-[6px] border-l-[6px] border-[#b47c1c] rounded-tl-lg pointer-events-none" />
                    <div className="absolute top-5 right-5 w-12 h-12 border-t-[6px] border-r-[6px] border-[#b47c1c] rounded-tr-lg pointer-events-none" />
                    <div className="absolute bottom-5 left-5 w-12 h-12 border-b-[6px] border-l-[6px] border-[#b47c1c] rounded-bl-lg pointer-events-none" />
                    <div className="absolute bottom-5 right-5 w-12 h-12 border-b-[6px] border-r-[6px] border-[#b47c1c] rounded-br-lg pointer-events-none" />

                    {/* Content Container */}
                    <div className="relative z-10 h-full flex flex-col justify-between items-center px-4 py-4 sm:py-6">

                        {/* Header: Logo & Organization */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center justify-center gap-4">
                                <img src="/logo.png" alt="ISOR Logo" className="w-16 h-16 object-contain" />
                                <div className="text-left">
                                    <h1 className="text-3xl font-serif font-black text-[#064e3b] tracking-tight leading-none">ISOR</h1>
                                    <p className="text-[11px] font-bold text-[#b47c1c] uppercase tracking-widest mt-1">Indian Society of Oilseeds Research</p>
                                </div>
                            </div>
                        </div>

                        {/* Title Section */}
                        <div className="space-y-2 my-2 sm:my-3">
                            <h2 className="text-3xl sm:text-4xl font-serif text-[#064e3b] font-bold italic tracking-wide">
                                Certificate of Membership
                            </h2>
                            <div className="flex items-center justify-center gap-3 pt-1">
                                <div className="h-px w-12 bg-[#b47c1c]" />
                                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.25em]">This is to certify that</p>
                                <div className="h-px w-12 bg-[#b47c1c]" />
                            </div>
                        </div>

                        {/* Member Name */}
                        <div className="my-2 max-w-full">
                            <h3 className="text-3xl sm:text-4xl font-serif font-bold text-[#064e3b] capitalize border-b-2 border-double border-[#b47c1c] pb-2 px-6 inline-block break-words leading-tight">
                                {member?.title || 'Dr.'} {member?.firstName} {member?.lastName}
                            </h3>
                        </div>

                        {/* Body Text */}
                        <p className="max-w-lg text-sm sm:text-base text-gray-700 leading-relaxed italic my-2 sm:my-3">
                            Has been duly admitted as a <span className="font-bold text-[#064e3b] uppercase not-italic">{isLifetime ? 'LIFETIME' : 'YEARLY'} MEMBER</span> of the{' '}
                            <span className="font-bold text-[#064e3b] not-italic">Indian Society of Oilseeds Research</span>, and is entitled to all the rights and privileges appertaining thereto.
                        </p>

                        {/* Signatures & Seal Section */}
                        <div className="grid grid-cols-3 items-end w-full my-3 px-2">
                            {/* President Signature */}
                            <div className="text-center">
                                <div className="h-12 flex items-end justify-center border-b border-[#064e3b]/30 mb-1">
                                    <span className="font-serif italic text-xs text-[#064e3b]/50">Electronic Signature</span>
                                </div>
                                <p className="text-[11px] font-bold text-[#064e3b] uppercase tracking-wider">President</p>
                            </div>

                            {/* Official Seal */}
                            <div className="flex flex-col items-center">
                                <div className="w-18 h-18 sm:w-20 sm:h-20 border-2 border-[#b47c1c] rounded-full flex items-center justify-center p-1 mb-1 rotate-6">
                                    <div className="w-full h-full border border-dashed border-[#b47c1c] rounded-full flex items-center justify-center bg-[#b47c1c]/5">
                                        <span className="text-[8px] font-black text-[#b47c1c] uppercase text-center leading-tight">
                                            ISOR<br />OFFICIAL<br />SEAL
                                        </span>
                                    </div>
                                </div>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Est. 1983</span>
                            </div>

                            {/* Secretary Signature */}
                            <div className="text-center">
                                <div className="h-12 flex items-end justify-center border-b border-[#064e3b]/30 mb-1">
                                    <span className="font-serif italic text-xs text-[#064e3b]/50">Electronic Signature</span>
                                </div>
                                <p className="text-[11px] font-bold text-[#064e3b] uppercase tracking-wider">Secretary</p>
                            </div>
                        </div>

                        {/* Bottom Metadata Bar */}
                        <div className="w-full pt-3 border-t border-[#b47c1c]/30 flex flex-wrap justify-between items-center text-[10px] font-bold text-[#b47c1c] uppercase tracking-wider gap-2">
                            <div>
                                Enrollment ID: <span className="text-[#064e3b] font-mono">{member?.enrollmentId || member?.membershipId}</span>
                            </div>
                            <div>
                                Membership ID: <span className="text-[#064e3b] font-mono">{member?.membershipId}</span>
                            </div>
                            <div>
                                Expiry: <span className="text-[#064e3b]">{formattedExpiry}</span>
                            </div>
                        </div>

                    </div>

                    {/* Background Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                        <img src="/logo.png" alt="" className="w-3/5 h-3/5 object-contain" />
                    </div>
                </div>
            </div>

            {/* Print Stylesheet */}
            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        height: 100vh !important;
                        overflow: hidden !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    body * {
                        visibility: hidden !important;
                    }
                    #certificate-print-area, #certificate-print-area * {
                        visibility: visible !important;
                    }
                    #certificate-print-area {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100vw !important;
                        height: 100vh !important;
                        max-width: 100vw !important;
                        max-height: 100vh !important;
                        margin: 0 !important;
                        padding: 2.5rem !important;
                        box-sizing: border-box !important;
                        overflow: hidden !important;
                        page-break-before: avoid !important;
                        page-break-after: avoid !important;
                        page-break-inside: avoid !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default MemberCertificate;
