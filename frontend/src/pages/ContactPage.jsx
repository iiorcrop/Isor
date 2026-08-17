import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Globe, Loader2 } from "lucide-react";

const ContactPage = () => {
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/contact/settings`).then((res) => setSettings(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/contact/inquiry`, formData);
      setStatus({ type: "success", msg: res.data.message });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus({ type: "error", msg: "Something went wrong. Please try again." });
    }
    setLoading(false);
  };

  if (!settings)
    return (
      <div className="min-h-screen bg-[#fff9f0] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#064e3b]" size={48} />
      </div>
    );

  return (
    <div className="bg-[#fff9f0] min-h-screen py-16 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Hero Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <span className="text-[#b47c1c] font-bold tracking-[0.25em] uppercase text-xs">
            Indian Society of Oilseeds Research
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#064e3b]">Contact & Support</h1>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            Have questions regarding ISOR membership, journal paper submissions, or upcoming events? Get in touch with
            our administrative office.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-8 rounded-[2.5rem] border border-[#064e3b]/10 shadow-xl shadow-[#064e3b]/5 flex gap-6 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#064e3b] flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                <MapPin size={28} />
              </div>
              <div className="space-y-1">
                <h4 className="text-[#064e3b] font-serif font-bold text-lg">Address</h4>
                <p className="text-gray-600 leading-relaxed text-xs">{settings.address}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-[2.5rem] border border-[#064e3b]/10 shadow-xl shadow-[#064e3b]/5 flex gap-6 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#b47c1c] flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                <Phone size={28} />
              </div>
              <div className="space-y-1">
                <h4 className="text-[#064e3b] font-serif font-bold text-lg">Telephone</h4>
                <p className="text-[#064e3b] font-mono font-bold text-base">{settings.phone}</p>
                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">{settings.workingHours}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-[2.5rem] border border-[#064e3b]/10 shadow-xl shadow-[#064e3b]/5 flex gap-6 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#064e3b] flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                <Mail size={28} />
              </div>
              <div className="space-y-1">
                <h4 className="text-[#064e3b] font-serif font-bold text-lg">Official Email</h4>
                <p className="text-[#b47c1c] font-bold text-sm">{settings.email}</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-[#064e3b]/5 border border-[#064e3b]/10"
          >
            <h3 className="text-2xl font-serif font-bold text-[#064e3b] mb-2">Send an Inquiry</h3>
            <p className="text-xs text-gray-500 mb-8">
              Fill out the form below and our secretariat will get back to you shortly.
            </p>

            {status.msg && (
              <div
                className={`mb-8 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold ${status.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"}`}
              >
                {status.type === "success" ? <CheckCircle size={18} /> : null}
                {status.msg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                    Full Name
                  </label>
                  <input
                    required
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#064e3b] rounded-2xl p-4 text-xs font-medium outline-none transition-all"
                    placeholder="e.g. Dr. John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                    Email Address
                  </label>
                  <input
                    required
                    type="email"
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#064e3b] rounded-2xl p-4 text-xs font-medium outline-none transition-all"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Subject</label>
                <input
                  required
                  className="w-full bg-gray-50 border border-gray-200 focus:border-[#064e3b] rounded-2xl p-4 text-xs font-medium outline-none transition-all"
                  placeholder="Membership / Paper Submission Query"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Message</label>
                <textarea
                  required
                  className="w-full bg-gray-50 border border-gray-200 focus:border-[#064e3b] rounded-2xl p-4 h-36 text-xs font-medium outline-none transition-all resize-none"
                  placeholder="Write your detailed inquiry here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button
                disabled={loading}
                className="w-full bg-[#064e3b] text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#04392b] transition-all shadow-xl disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                {loading ? "Sending Inquiry..." : "Submit Message"}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Map Section */}
        {settings.mapUrl && (
          <div className="rounded-[3rem] overflow-hidden border border-[#064e3b]/10 shadow-xl h-[400px]">
            <iframe
              title="Location Map"
              src={settings.mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactPage;
