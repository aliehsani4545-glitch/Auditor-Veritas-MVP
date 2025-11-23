import React, { useState } from 'react';
import { ShieldCheck, Github, Twitter, Linkedin, Cookie } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Footer = ({ onOpenPrivacy }) => {
  const [showCookies, setShowCookies] = useState(false);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#020617] border-t border-slate-800 pt-16 pb-8 text-slate-400 text-sm relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 text-white mb-4">
              <div className="w-8 h-8 bg-[#635bff] rounded-lg flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <span className="font-bold text-xl tracking-tight">Auditor Veritas</span>
            </div>
            <p className="mb-6 max-w-xs text-slate-500">
              Evidence-grade audit infrastructure for modern engineering teams. 
              Immutable, encrypted, and compliant by default.
            </p>
            <div className="flex gap-4">
              <SocialIcon icon={Github} href="#" />
              <SocialIcon icon={Twitter} href="#" />
              <SocialIcon icon={Linkedin} href="#" />
            </div>
          </div>

          {/* Product Column (Länkarna från din bild) */}
          <div>
            <h4 className="font-bold text-white mb-4">Product</h4>
            <ul className="space-y-3">
              <li><button onClick={() => scrollToSection('demo')} className="hover:text-[#635bff] transition-colors">Features & Demo</button></li>
              <li><button onClick={() => scrollToSection('merkle')} className="hover:text-[#635bff] transition-colors">Cryptography</button></li>
              <li><button onClick={() => scrollToSection('architecture')} className="hover:text-[#635bff] transition-colors">Infrastructure</button></li>
              <li><button onClick={() => scrollToSection('pricing')} className="hover:text-[#635bff] transition-colors">Enterprise</button></li>
            </ul>
          </div>

          {/* Developers Column */}
          <div>
            <h4 className="font-bold text-white mb-4">Developers</h4>
            <ul className="space-y-3">
              <li><button onClick={() => scrollToSection('code-integration')} className="hover:text-[#635bff] transition-colors">Quick Start</button></li>
              <li><a href="#" className="hover:text-[#635bff] transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-[#635bff] transition-colors">SDKs</a></li>
              <li><a href="#" className="hover:text-[#635bff] transition-colors">Status</a></li>
            </ul>
          </div>

          {/* Compliance Column */}
          <div>
            <h4 className="font-bold text-white mb-4">Compliance</h4>
            <ul className="space-y-3">
              <li><button onClick={onOpenPrivacy} className="hover:text-[#635bff] transition-colors">Privacy Policy</button></li>
              <li><button onClick={onOpenPrivacy} className="hover:text-[#635bff] transition-colors">Terms of Service</button></li>
              <li><a href="#" className="hover:text-[#635bff] transition-colors">DPA Agreement</a></li>
              <li><button onClick={() => setShowCookies(true)} className="hover:text-[#635bff] transition-colors">Cookie Settings</button></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Auditor Veritas AB. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            System Operational
          </div>
        </div>
      </div>

      {/* COOKIE SETTINGS MODAL */}
      <AnimatePresence>
        {showCookies && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <button onClick={() => setShowCookies(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">✕</button>
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-[#635bff] mb-4">
                <Cookie size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Cookie Preferences</h3>
              <p className="text-slate-600 text-sm mb-6">
                We only use essential cookies required for authentication and API security (CSRF protection). 
                We do <strong className="text-slate-800">not</strong> use third-party trackers or advertising cookies.
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div>
                    <p className="text-sm font-bold text-slate-700">Essential</p>
                    <p className="text-xs text-slate-500">Security & Session</p>
                  </div>
                  <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">ALWAYS ON</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 opacity-50">
                  <div>
                    <p className="text-sm font-bold text-slate-700">Marketing</p>
                    <p className="text-xs text-slate-500">Ad targeting</p>
                  </div>
                  <div className="text-xs font-bold text-slate-400">DISABLED</div>
                </div>
              </div>

              <button onClick={() => setShowCookies(false)} className="w-full bg-[#0a2540] text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors">
                Save Preferences
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
};

const SocialIcon = ({ icon: Icon, href }) => (
  <a href={href} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#635bff] hover:text-white transition-all">
    <Icon size={18} />
  </a>
);

export default Footer;