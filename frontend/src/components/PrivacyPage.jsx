import React from 'react';
import { ShieldCheck, Lock, Eye, FileText, CheckCircle } from 'lucide-react';

const PrivacyPage = ({ onAccept }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-50" />
      
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative z-10 animate-fade-in-up">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 mb-4 ring-1 ring-emerald-500/50">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Security & Privacy</h1>
          <p className="text-slate-400">Please review our compliance terms to continue.</p>
        </div>

        {/* Content */}
        <div className="p-8 md:p-12 space-y-8">
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="mt-1"><Lock className="w-6 h-6 text-slate-400" /></div>
              <div>
                <h3 className="font-bold text-slate-900">Encryption Standards</h3>
                <p className="text-slate-600 text-sm leading-relaxed">All data is encrypted using AES-256 (at rest) and TLS 1.3 (in transit). Cryptographic keys are automatically rotated every 90 days.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="mt-1"><Eye className="w-6 h-6 text-slate-400" /></div>
              <div>
                <h3 className="font-bold text-slate-900">No Tracking</h3>
                <p className="text-slate-600 text-sm leading-relaxed">We do not use third-party cookies for tracking purposes. Only essential functional cookies are required for the session.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-1"><FileText className="w-6 h-6 text-slate-400" /></div>
              <div>
                <h3 className="font-bold text-slate-900">GDPR & Data Residency</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Data is stored exclusively within the EU (AWS Frankfurt/eu-central-1). You retain full rights to data portability and erasure.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="checkbox" className="peer sr-only" onChange={(e) => document.getElementById('accept-btn').disabled = !e.target.checked} />
                <div className="w-6 h-6 border-2 border-slate-300 rounded-md peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100" />
                </div>
              </div>
              <span className="text-slate-700 font-medium group-hover:text-slate-900">I have read and accept the Privacy Policy</span>
            </label>
          </div>

          <button 
            id="accept-btn"
            disabled
            onClick={onAccept}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Accept & Continue
          </button>
        </div>
      </div>
      
      <div className="mt-8 text-slate-400 text-sm">Session ID: {Math.random().toString(36).substring(7)} • Secure Connection</div>
    </div>
  );
};

export default PrivacyPage;