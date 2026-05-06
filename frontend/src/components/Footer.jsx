import React from 'react';
import { Mail, Phone, Globe, Facebook, Linkedin, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#154728] text-white pt-12 pb-6 mt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-10">
          
          {/* Column 1: Brand & Contact */}
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold tracking-tight font-serif mb-1">ISOR</h2>
              <p className="text-xs font-medium text-gray-200">Indian Society of Oilseeds Research</p>
            </div>
            
            <div className="space-y-3 text-gray-300 text-[13px] leading-relaxed">
              <div className="flex gap-3">
                <div className="mt-1 shrink-0">
                  <div className="w-1 h-full bg-[#4ade80]/30 rounded-full"></div>
                </div>
                <p>
                  ICAR-Directorate of Oilseeds Research,<br />
                  Rajendranagar, Hyderabad – 500 030<br />
                  Telangana, India
                </p>
              </div>
              
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-3 group">
                  <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#4ade80]/20 transition-colors">
                    <Mail size={13} className="text-[#4ade80]" />
                  </div>
                  <a href="mailto:isor.hyderabad@gmail.com" className="hover:text-white transition-colors">isor.hyderabad@gmail.com</a>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#4ade80]/20 transition-colors">
                    <Phone size={13} className="text-[#4ade80]" />
                  </div>
                  <a href="tel:+914023015291" className="hover:text-white transition-colors">+91-40-2301-5291</a>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#4ade80]/20 transition-colors">
                    <Globe size={13} className="text-[#4ade80]" />
                  </div>
                  <a href="https://www.isor.org.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">www.isor.org.in</a>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <SocialIcon icon={<Facebook size={16} fill="currentColor" />} />
              <SocialIcon icon={<XIcon />} />
              <SocialIcon icon={<Linkedin size={16} fill="currentColor" />} />
              <SocialIcon icon={<Youtube size={16} fill="currentColor" />} />
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-base font-bold mb-6 pb-2 border-b border-white/10 relative">
              Quick Links
              <span className="absolute bottom-0 left-0 w-10 h-[2px] bg-[#4ade80]"></span>
            </h3>
            <ul className="space-y-2 text-gray-300 text-[13px]">
              <li><FooterLink to="/">Home</FooterLink></li>
              <li><FooterLink to="/about">About ISOR</FooterLink></li>
              <li><FooterLink to="/journal">Journal (JOR)</FooterLink></li>
              <li><FooterLink to="/membership">Membership</FooterLink></li>
              <li><FooterLink to="/events">Events</FooterLink></li>
              <li><FooterLink to="/downloads">Downloads</FooterLink></li>
              <li><FooterLink to="/contact">Contact Us</FooterLink></li>
            </ul>
          </div>

          {/* Column 3: Journal (JOR) */}
          <div>
            <h3 className="text-base font-bold mb-6 pb-2 border-b border-white/10 relative">
              Journal (JOR)
              <span className="absolute bottom-0 left-0 w-10 h-[2px] bg-[#4ade80]"></span>
            </h3>
            <ul className="space-y-2 text-gray-300 text-[13px]">
              <li><FooterLink to="/current-issue">Current Issue</FooterLink></li>
              <li><FooterLink to="/archives">Past Volumes</FooterLink></li>
              <li><FooterLink to="/submit">Submit Paper</FooterLink></li>
              <li><FooterLink to="/editorial-board">Editorial Board</FooterLink></li>
              <li><FooterLink to="/author-guidelines">Author Guidelines</FooterLink></li>
              <li><FooterLink to="/review-policy">Review Policy</FooterLink></li>
              <li><FooterLink to="/naas-listing">NAAS Listing</FooterLink></li>
            </ul>
          </div>

          {/* Column 4: Society */}
          <div>
            <h3 className="text-base font-bold mb-6 pb-2 border-b border-white/10 relative">
              Society
              <span className="absolute bottom-0 left-0 w-10 h-[2px] bg-[#4ade80]"></span>
            </h3>
            <ul className="space-y-2 text-gray-300 text-[13px]">
              <li><FooterLink to="/committee/Executive">Executive Committee</FooterLink></li>
              <li><FooterLink to="/committee/Advisory">Advisory Board</FooterLink></li>
              <li><FooterLink to="/committee/PastPresidents">Past Presidents</FooterLink></li>
              <li><FooterLink to="/awards">Awards & Honours</FooterLink></li>
              <li><FooterLink to="/annual-reports">Annual Reports</FooterLink></li>
              <li><FooterLink to="/constitution">Constitution & Bylaws</FooterLink></li>
              <li><a href="https://admin.isor.in/" className="hover:text-[#4ade80] transition-colors font-semibold mt-2 block">Admin Login</a></li>
            </ul>
          </div>

        </div>

      </div>

      {/* Copyright Bar */}
      <div className="mt-12 bg-black/20 py-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-300 text-[10px] tracking-widest uppercase">
            © {new Date().getFullYear()} Indian Society of Oilseeds Research. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ to, children }) => (
  <Link to={to} className="hover:text-white transition-colors block py-0.5">
    {children}
  </Link>
);

const SocialIcon = ({ icon }) => (
  <a href="#" className="w-9 h-9 bg-white/10 rounded flex items-center justify-center hover:bg-[#4ade80] hover:text-[#1a4d2e] transition-all duration-300">
    {icon}
  </a>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default Footer;
