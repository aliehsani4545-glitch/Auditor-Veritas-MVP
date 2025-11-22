import React from 'react';
import { ShieldCheck, Lock, Users, FileText, Check } from 'lucide-react';

const PrivacyPage = ({ onAccept }) => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full space-y-8 bg-white p-10 rounded-3xl shadow-2xl border border-slate-100 animate-fade-in-up">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg mb-6">
            <ShieldCheck className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Privacy & Compliance</h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            To access Auditor Veritas, you must acknowledge our data processing agreement required by GDPR Article 28.
          </p>
        </div>

        {/* Grid Content (Från din gamla kod) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          
          {/* Data Storage */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-xl font-bold text-slate-900">Data Storage</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start text-sm text-slate-600"><Check className="w-4 h-4 text-emerald-500 mr-2 mt-0.5"/> <strong>EU Data Centers:</strong> AWS Frankfurt (eu-central-1).</li>
              <li className="flex items-start text-sm text-slate-600"><Check className="w-4 h-4 text-emerald-500 mr-2 mt-0.5"/> <strong>Encryption:</strong> AES-256 at rest, TLS 1.3 in transit.</li>
              <li className="flex items-start text-sm text-slate-600"><Check className="w-4 h-4 text-emerald-500 mr-2 mt-0.5"/> <strong>PII Hashing:</strong> Identifiers are SHA-256 hashed.</li>
            </ul>
          </div>

          {/* Cookies */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div className="flex items-center mb-4">
              <Lock className="w-6 h-6 text-purple-600 mr-3" />
              <h3 className="text-xl font-bold text-slate-900">Tracking Policy</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start text-sm text-slate-600"><Check className="w-4 h-4 text-emerald-500 mr-2 mt-0.5"/> <strong>Essential Only:</strong> Only session tokens are stored.</li>
              <li className="flex items-start text-sm text-slate-600"><Check className="w-4 h-4 text-emerald-500 mr-2 mt-0.5"/> <strong>No Trackers:</strong> No Google Analytics or Facebook Pixels.</li>
              <li className="flex items-start text-sm text-slate-600"><Check className="w-4 h-4 text-emerald-500 mr-2 mt-0.5"/> <strong>Local Keys:</strong> API keys stay on your device.</li>
            </ul>
          </div>
        </div>

        {/* Action Area */}
        <div className="border-t border-slate-200 pt-8 mt-8">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-lg font-bold text-emerald-900">Acceptance Required</h4>
              <p className="text-emerald-700 text-sm">By continuing, you agree to the Terms of Service and Privacy Policy.</p>
            </div>
            <button 
              onClick={onAccept}
              className="w-full md:w-auto bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center"
            >
              I Accept & Enter Platform
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPage;