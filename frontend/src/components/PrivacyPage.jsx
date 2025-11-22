import React, { useState, useRef } from 'react';
import { ShieldCheck, Lock, Users, FileText, Check, ChevronDown, ScrollText, AlertCircle, Server, CreditCard, Ban } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PrivacyPage = ({ onAccept }) => {
  const [activeTab, setActiveTab] = useState('privacy'); // 'privacy' or 'terms'
  const [canAccept, setCanAccept] = useState(false);
  
  // Scroll detection to unlock the button
  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 50;
    if (bottom) setCanAccept(true);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/95 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4">
      <motion.div 
        initial={{ y: "100%", opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        className="w-full sm:max-w-2xl bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col h-[95dvh] sm:h-[85vh]"
      >
        
        {/* 1. HEADER & TABS */}
        <div className="bg-[#0a2540] p-6 pb-0 text-center shrink-0 relative z-10">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/10">
            <ShieldCheck className="w-6 h-6 text-[#00d4ff]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Compliance Center</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-2 mb-6">Please review our policies to access the platform.</p>

          {/* Tab Switcher */}
          <div className="flex p-1 bg-slate-800/50 rounded-xl mb-6 relative border border-slate-700/50">
            <button 
              onClick={() => setActiveTab('privacy')}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-lg transition-all relative z-10 flex items-center justify-center gap-2 ${activeTab === 'privacy' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Lock size={14} /> Privacy Policy
            </button>
            <button 
              onClick={() => setActiveTab('terms')}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-lg transition-all relative z-10 flex items-center justify-center gap-2 ${activeTab === 'terms' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <ScrollText size={14} /> Terms of Service
            </button>
            
            {/* Animated Slide Background */}
            <motion.div 
              className="absolute top-1 bottom-1 bg-[#635bff] rounded-lg shadow-md"
              initial={false}
              animate={{ 
                left: activeTab === 'privacy' ? '4px' : '50%', 
                width: 'calc(50% - 4px)' 
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>
        </div>

        {/* 2. SCROLLABLE CONTENT */}
        <div 
          className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 p-6 space-y-6 relative"
          onScroll={handleScroll}
        >
          <AnimatePresence mode='wait'>
            {activeTab === 'privacy' ? (
              <motion.div 
                key="privacy"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6 pb-10"
              >
                {/* Data Storage */}
                <Section title="Data Residency & Security" icon={Server} color="blue">
                  <p className="text-xs text-slate-500 mb-3 uppercase font-bold tracking-wider">Infrastructure</p>
                  <ul className="space-y-3">
                    <li className="flex items-start text-sm text-slate-700">
                      <Check className="w-4 h-4 text-emerald-600 mr-3 mt-0.5 flex-shrink-0"/> 
                      <span><strong>AWS Frankfurt (eu-central-1):</strong> All data persists strictly within the EU.</span>
                    </li>
                    <li className="flex items-start text-sm text-slate-700">
                      <Check className="w-4 h-4 text-emerald-600 mr-3 mt-0.5 flex-shrink-0"/> 
                      <span><strong>AES-256 Encryption:</strong> Applied to all data at rest. Keys are rotated every 90 days.</span>
                    </li>
                    <li className="flex items-start text-sm text-slate-700">
                      <Check className="w-4 h-4 text-emerald-600 mr-3 mt-0.5 flex-shrink-0"/> 
                      <span><strong>Zero-Knowledge Access:</strong> Auditor Veritas staff cannot decrypt your log payloads.</span>
                    </li>
                  </ul>
                </Section>

                {/* Tracking */}
                <Section title="No Tracking Policy" icon={Users} color="purple">
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    We respect your agency. We do not monetize your data or behavior.
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    <StatusRow label="Third-Party Ads" status="Blocked" color="red" />
                    <StatusRow label="Google Analytics" status="Blocked" color="red" />
                    <StatusRow label="Essential Session Cookie" status="Allowed" color="emerald" />
                  </div>
                </Section>

                {/* GDPR Rights */}
                <Section title="Your GDPR Rights" icon={FileText} color="emerald">
                  <p className="text-sm text-slate-600 mb-4">
                    As a Data Processor, we guarantee your rights under GDPR Article 28.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge>Right to Access</Badge>
                    <Badge>Right to Erasure</Badge>
                    <Badge>Data Portability</Badge>
                    <Badge>Rectification</Badge>
                  </div>
                </Section>
              </motion.div>
            ) : (
              <motion.div 
                key="terms"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 pb-10"
              >
                {/* Usage */}
                <Section title="Acceptable Use Policy" icon={AlertCircle} color="orange">
                  <p className="text-sm text-slate-600 leading-relaxed mb-3">
                    By using the API, you agree <strong>not</strong> to:
                  </p>
                  <ul className="space-y-2 ml-1">
                    <li className="flex items-start text-sm text-slate-700">
                      <Ban className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0"/>
                      <span>Reverse engineer the cryptographic proof engine.</span>
                    </li>
                    <li className="flex items-start text-sm text-slate-700">
                      <Ban className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0"/>
                      <span>Store illegal, infringing, or malicious data.</span>
                    </li>
                    <li className="flex items-start text-sm text-slate-700">
                      <Ban className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0"/>
                      <span>Circumvent rate limits (100 events/mo on Free Tier).</span>
                    </li>
                  </ul>
                </Section>

                {/* Payments */}
                <Section title="Subscription & Payments" icon={CreditCard} color="blue">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <strong>Professional ($49/mo)</strong> and <strong>Enterprise ($199/mo)</strong> plans are billed monthly via Stripe.
                  </p>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-800">
                    <strong>Cancellation Policy:</strong> You may cancel at any time. Access continues until the end of the billing cycle. No refunds for partial months.
                  </div>
                </Section>

                {/* Liability */}
                <Section title="Limitation of Liability" icon={ShieldCheck} color="slate">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    The service is provided "as is". Auditor Veritas is not liable for any indirect damages, data loss, or service interruptions exceeding the total amount paid by you in the last 12 months.
                  </p>
                </Section>
                
                <div className="text-center pt-6 pb-2">
                  <p className="text-xs text-slate-400">Last Updated: November 22, 2025</p>
                  <p className="text-xs text-slate-400">Jurisdiction: Sweden / EU</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. FOOTER ACTION */}
        <div className="p-4 sm:p-6 border-t border-slate-200 bg-white shrink-0 safe-area-bottom z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          {!canAccept && (
            <div className="flex justify-center mb-3 animate-bounce">
              <div className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full flex items-center border border-slate-200">
                Scroll to bottom to accept <ChevronDown size={12} className="ml-1"/>
              </div>
            </div>
          )}
          
          <button 
            onClick={onAccept}
            disabled={!canAccept}
            className={`w-full py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
              canAccept 
                ? 'bg-[#635bff] text-white hover:bg-[#5449e3] active:scale-95 hover:shadow-[#635bff]/25' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            <ShieldCheck size={20} />
            {canAccept ? 'I Accept & Continue' : 'Read to Accept'}
          </button>
        </div>

      </motion.div>
    </div>
  );
};

// --- Helper Components ---

const Section = ({ title, icon: Icon, color, children }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-slate-300 transition-colors">
    <div className="flex items-center mb-4 border-b border-slate-100 pb-3">
      <div className={`p-2 rounded-lg bg-${color}-50 mr-3`}>
        <Icon className={`w-5 h-5 text-${color}-600`} />
      </div>
      <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
    </div>
    {children}
  </div>
);

const StatusRow = ({ label, status, color }) => (
  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs flex justify-between items-center">
    <span className="font-medium text-slate-600">{label}</span>
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
      color === 'red' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
    }`}>
      {status}
    </span>
  </div>
);

const Badge = ({ children }) => (
  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
    {children}
  </span>
);

export default PrivacyPage;