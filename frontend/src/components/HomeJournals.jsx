import React, { useState, useEffect } from "react";
import axios from "axios";
import { getServerUrl } from "../utils/urlHelper";

import { motion } from "framer-motion";
import { Download, ChevronRight, BookOpen, Eye } from "lucide-react";

import { Link } from "react-router-dom";

const HomeJournals = () => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/journal`);
        setJournals(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch journals", err);
        setLoading(false);
      }
    };
    fetchJournals();
  }, []);

  if (loading || journals.length === 0) return null;

  const useMarquee = journals.length > 4;
  const displayJournals = useMarquee ? [...journals, ...journals, ...journals] : journals;
  const activeToken = localStorage.getItem("userToken") || localStorage.getItem("memberToken");
  const isLoggedIn = Boolean(activeToken);

  return (
    <section className="bg-[#fff9f0] pt-12 pb-10 overflow-hidden border-t border-[#064e3b]/5">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-[#b47c1c] rounded-full" />
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#064e3b]">
            Journal of Oilseeds Research — Latest Volumes
          </h2>
        </div>
        <p className="text-[#6b7280] font-medium text-sm mt-3 ml-4">
          Peer-reviewed bi-annual journal. UGC-CARE listed. Hover to pause scrolling.
        </p>
      </div>

      <div
        className="relative group w-full"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <motion.div
          className={`flex gap-8 ${useMarquee ? "" : "justify-center flex-wrap max-w-7xl mx-auto px-6"}`}
          animate={useMarquee ? { x: isPaused ? undefined : [0, -1 * (280 + 32) * journals.length] } : undefined}
          transition={
            useMarquee
              ? {
                  duration: journals.length * 10,
                  repeat: Infinity,
                  ease: "linear",
                }
              : undefined
          }
          style={{ width: useMarquee ? "fit-content" : "100%" }}
        >
          {displayJournals.map((journal, index) => (
            <div
              key={`${journal._id}-${index}`}
              className="w-[280px] bg-white rounded-[2.5rem] shadow-xl shadow-[#064e3b]/5 border border-black/5 p-6 flex flex-col hover:-translate-y-2 transition-all duration-500"
            >
              {/* Cover Image */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-6 bg-gray-50 group-hover:shadow-2xl transition-all">
                {journal.coverImageUrl ? (
                  <img
                    src={getServerUrl(journal.coverImageUrl)}
                    alt={journal.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-200">
                    <BookOpen size={64} />
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-[#064e3b] text-white text-[10px] font-bold px-3 py-1 rounded-full">
                  {journal.year}
                </div>
              </div>

              <div className="flex-1 text-center">
                <h3 className="text-lg font-bold text-[#064e3b] mb-1">{journal.title}</h3>
                <p className="text-[#b47c1c] text-[10px] font-bold uppercase tracking-widest mb-2">{journal.issues}</p>
                <p className="text-gray-400 text-[11px] font-medium mb-4">Complete • {journal.articleCount}</p>
              </div>

              <div className="text-[#064e3b] text-[10px] font-bold text-center mb-3">
                {isLoggedIn ? (
                  <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">Full Access Granted</span>
                ) : (
                  <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">Log In for Full Access</span>
                )}
              </div>

              {isLoggedIn ? (
                <a
                  href={
                    journal.pdfUrl
                      ? `${getServerUrl(journal.pdfUrl)}?token=${activeToken}`
                      : "#"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl border-2 border-[#1e703c]/20 text-[#1e703c] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#1e703c] hover:text-white transition-all shadow-sm"
                >
                  <Download size={14} /> Download Full PDF
                </a>
              ) : (
                <Link
                  to="/user/login"
                  className="w-full py-3 rounded-xl border-2 border-[#064e3b] text-[#064e3b] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#064e3b] hover:text-white transition-all shadow-sm"
                >
                  <Eye size={14} /> Log In for Full Access
                </Link>
              )}
            </div>
          ))}
        </motion.div>
      </div>

      <div className="mt-6 text-center">
        <Link
          to="/membership/login"
          className="inline-flex items-center gap-2 text-[#064e3b] font-bold text-sm hover:text-[#b47c1c] transition-colors group"
        >
          Explore Complete Journal
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
};

export default HomeJournals;
