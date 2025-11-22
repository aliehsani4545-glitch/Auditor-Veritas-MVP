import React, { useState, useRef } from 'react';
import { ShieldCheck, Lock, Users, FileText, Check, ChevronDown, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const PrivacyPage = ({ onAccept }) => {
  const [canAccept, setCanAccept] = useState(false);
  
  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 20;
    if (bottom) setCanAccept(true);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-[#0a2540] p-8 text-center shrink-0">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <ShieldCheck className="w-8 h-8 text-[#00d4ff]" />
          </div>
          <h1 className="text-3xl font-bold text-white">Privacy & Compliance</h1>
          <p className="text-slate-400 text-sm mt-2">GDPR Article 6(1)(b) • Data Processing Agreement</p>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar bg-slate-50 space-y-8" onScroll={handleScroll}>
          
          {/* Section 1: Data Storage */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-xl font-bold text-slate-900">Data Storage & Residency</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start text-sm text-slate-600"><Check className="w-4 h-4 text-emerald-500 mr-2 mt-0.5"/> <strong>EU Data Centers:</strong> All data resides in Frankfurt (AWS eu-central-1).</li>
              <li className="flex items-start text-sm text-slate-600"><Check className="w-4 h-4 text-emerald-500 mr-2 mt-0.5"/> <strong>Encryption:</strong> AES-256 at rest, TLS 1.3 in transit.</li>
              <li className="flex items-start text-sm text-slate-600"><Check className="w-4 h-4 text-emerald-500 mr-2 mt-0.5"/> <strong>PII Hashing:</strong> User identifiers are SHA-256 hashed before storage.</li>
            </ul>
          </div>

          {/* Section 2: Cookies */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center mb-4">
              <Lock className="w-6 h-6 text-purple-600 mr-3" />
              <h3 className="text-xl font-bold text-slate-900">Cookies & Tracking</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start text-sm text-slate-600"><Check className="w-4 h-4 text-emerald-500 mr-2 mt-0.5"/> <strong>Essential Only:</strong> We only store a session token for security functionality.</li>
              <li className="flex items-start text-sm text-slate-600"><Check className="w-4 h-4 text-emerald-500 mr-2 mt-0.5"/> <strong>Zero Tracking:</strong> No Google Analytics, Facebook Pixels, or ad trackers.</li>
              <li className="flex items-start text-sm text-slate-600"><Check className="w-4 h-4 text-emerald-500 mr-2 mt-0.5"/> <strong>Local Storage:</strong> API keys are stored locally on your device only.</li>
            </ul>
          </div>

          {/* Section 3: Your Rights */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-orange-500 mr-3" />
              <h3 className="text-xl font-bold text-slate-900">Your Rights (GDPR)</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl">
                <h4 className="font-bold text-sm text-slate-800">Right to Access</h4>
                <p className="text-xs text-slate-500 mt-1">Export raw event data as JSON anytime.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <h4 className="font-bold text-sm text-slate-800">Right to Erasure</h4>
                <p className="text-xs text-slate-500 mt-1">"Right to be forgotten" via DPO contact.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <h4 className="font-bold text-sm text-slate-800">Data Portability</h4>
                <p className="text-xs text-slate-500 mt-1">Move audit trails to other providers easily.</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-center pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-500">Data Protection Officer: <span className="font-mono text-blue-600">hazarnodesweden@outlook.com</span></p>
          </div>
          
          <div className="h-8"></div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-white shrink-0 flex flex-col items-center">
          {!canAccept && (
            <div className="text-xs text-slate-400 mb-3 flex items-center animate-bounce">
              Scroll to read <ChevronDown className="w-3 h-3 ml-1" />
            </div>
          )}
          <button 
            onClick={onAccept}
            disabled={!canAccept}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              canAccept 
                ? 'bg-[#635bff] text-white hover:bg-[#5449e3] shadow-lg transform hover:-translate-y-1' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            {canAccept ? 'I Accept Privacy Policy' : 'Please read the terms'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPage;