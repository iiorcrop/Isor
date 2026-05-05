import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Printer } from 'lucide-react';

const MemberCertificate = ({ member, onClose }) => {
    const certRef = useRef();

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            
            <div className="relative w-full max-w-5xl flex flex-col gap-6 items-center">
                <div className="flex gap-4 print:hidden">
                    <button 
                        onClick={handlePrint}
                        className="bg-white text-[#064e3b] px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-all shadow-2xl"
                    >
                        <Printer size={20} /> Print / Save as PDF
                    </button>
                    <button 
                        onClick={onClose}
                        className="bg-white/10 text-white p-4 rounded-2xl hover:bg-white/20 transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Certificate Container */}
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="w-full aspect-[1.414/1] bg-white shadow-2xl relative overflow-hidden p-1 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] print:m-0 print:shadow-none"
                    id="certificate-print-area"
                >
                    {/* Decorative Border */}
                    <div className="absolute inset-8 border-[12px] border-[#064e3b] pointer-events-none" />
                    <div className="absolute inset-12 border-2 border-[#b47c1c] pointer-events-none" />
                    
                    {/* Corner Ornaments */}
                    <div className="absolute top-10 left-10 w-24 h-24 border-t-[16px] border-l-[16px] border-[#b47c1c] rounded-tl-xl pointer-events-none" />
                    <div className="absolute top-10 right-10 w-24 h-24 border-t-[16px] border-r-[16px] border-[#b47c1c] rounded-tr-xl pointer-events-none" />
                    <div className="absolute bottom-10 left-10 w-24 h-24 border-b-[16px] border-l-[16px] border-[#b47c1c] rounded-bl-xl pointer-events-none" />
                    <div className="absolute bottom-10 right-10 w-24 h-24 border-b-[16px] border-r-[16px] border-[#b47c1c] rounded-br-xl pointer-events-none" />

                    {/* Content Area */}
                    <div className="relative h-full flex flex-col items-center justify-center p-20 text-center">
                        <div className="mb-10 flex items-center gap-6">
                            <img src="/logo.png" alt="ISOR Logo" className="w-24 h-24 object-contain" />
                            <div className="text-left">
                                <h1 className="text-4xl font-serif font-black text-[#064e3b] tracking-tight">ISOR</h1>
                                <p className="text-sm font-bold text-[#b47c1c] uppercase tracking-widest">Indian Society of Oilseeds Research</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-12">
                            <h2 className="text-5xl font-serif text-[#064e3b] font-bold italic">Certificate of Membership</h2>
                            <div className="flex items-center justify-center gap-4">
                                <div className="h-px w-20 bg-[#b47c1c]" />
                                <p className="text-lg font-medium text-gray-500 uppercase tracking-[0.3em]">This is to certify that</p>
                                <div className="h-px w-20 bg-[#b47c1c]" />
                            </div>
                        </div>

                        <h3 className="text-6xl font-serif font-bold text-[#064e3b] mb-12 border-b-4 border-double border-[#b47c1c] pb-4 px-12 inline-block">
                            {member.title} {member.firstName} {member.lastName}
                        </h3>

                        <div className="max-w-2xl text-xl text-gray-700 leading-relaxed mb-16 italic">
                            Has been duly admitted as a <span className="font-bold text-[#064e3b] uppercase not-italic">{member.membershipType} MEMBER</span> of the 
                            <span className="font-bold text-[#064e3b] not-italic"> Indian Society of Oilseeds Research</span>, 
                            and is entitled to all the rights and privileges appertaining thereto.
                        </div>

                        <div className="grid grid-cols-3 gap-20 w-full mt-auto">
                            <div className="text-center">
                                <div className="h-20 flex items-end justify-center border-b border-[#064e3b]/30 mb-2">
                                    <p className="font-serif italic text-[#064e3b]/40">Electronic Signature</p>
                                </div>
                                <p className="text-sm font-bold text-[#064e3b] uppercase">President</p>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="w-28 h-28 border-4 border-[#b47c1c] rounded-full flex items-center justify-center p-2 mb-2 rotate-12">
                                    <div className="w-full h-full border-2 border-dashed border-[#b47c1c] rounded-full flex items-center justify-center bg-[#b47c1c]/5">
                                        <span className="text-[10px] font-black text-[#b47c1c] uppercase text-center leading-tight">ISOR<br/>OFFICIAL<br/>SEAL</span>
                                    </div>
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Est. 1978</p>
                            </div>

                            <div className="text-center">
                                <div className="h-20 flex items-end justify-center border-b border-[#064e3b]/30 mb-2">
                                    <p className="font-serif italic text-[#064e3b]/40">Electronic Signature</p>
                                </div>
                                <p className="text-sm font-bold text-[#064e3b] uppercase">Secretary</p>
                            </div>
                        </div>

                        <div className="absolute bottom-20 flex justify-between w-[calc(100%-160px)] text-[10px] font-bold text-[#b47c1c] uppercase tracking-widest">
                            <p>Membership ID: {member.membershipId}</p>
                            <p>Issued Date: {new Date().toLocaleDateString('en-GB')}</p>
                        </div>
                    </div>

                    {/* Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                        <img src="/logo.png" alt="" className="w-[60%] h-[60%] object-contain" />
                    </div>
                </motion.div>
            </div>

            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #certificate-print-area, #certificate-print-area * {
                        visibility: visible;
                    }
                    #certificate-print-area {
                        position: fixed;
                        left: 0;
                        top: 0;
                        width: 100vw;
                        height: 100vh;
                        margin: 0;
                        padding: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default MemberCertificate;
