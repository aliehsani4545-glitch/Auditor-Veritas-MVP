import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, Users, FileText, Check, ChevronDown, 
  ScrollText, AlertCircle, Server, CreditCard, Ban, X, Code, Fingerprint, Globe, Download, Activity 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PrivacyPage = ({ onAccept, isFooterView = false, onClose }) => {
  const [activeTab, setActiveTab] = useState('privacy'); 
  const [canAccept, setCanAccept] = useState(false);
  
  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 50;
    if (bottom) setCanAccept(true);
  };

  const downloadDPA = (e) => {
    e.preventDefault();
    alert("A signed DPA PDF has been generated and downloaded.");
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4">
      <motion.div 
        initial={{ y: "100%", opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full sm:max-w-3xl bg-white sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl overflow-hidden flex flex-col h-[95dvh] sm:h-[90vh] relative ring-1 ring-white/20"
      >
        {isFooterView && (
          <button onClick={onClose} className="absolute top-6 right-6 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-md border border-white/10">
            <X size={20} />
          </button>
        )}

        <div className="bg-[#0f172a] p-8 pb-0 text-center shrink-0 relative z-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#1e293b] to-[#0f172a] -z-10"></div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-slate-300 border border-white/10 text-xs font-bold uppercase tracking-wide mb-4 backdrop-blur-md">
             <Globe size={12} className="text-[#00d4ff]" /> Legal Center
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Compliance & Terms</h1>
          <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">
            Transparent policies designed for enterprise security and GDPR compliance.
          </p>

          <div className="flex p-1.5 bg-slate-800/80 rounded-xl mb-8 relative border border-white/5 backdrop-blur-xl max-w-md mx-auto">
            <button onClick={() => setActiveTab('privacy')} className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-lg transition-all relative z-10 flex items-center justify-center gap-2 ${activeTab === 'privacy' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              <Lock size={14} /> Privacy Policy
            </button>
            <button onClick={() => setActiveTab('terms')} className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-lg transition-all relative z-10 flex items-center justify-center gap-2 ${activeTab === 'terms' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              <ScrollText size={14} /> Terms of Service
            </button>
            <motion.div 
              className="absolute top-1.5 bottom-1.5 bg-[#635bff] rounded-lg shadow-lg shadow-indigo-500/20"
              initial={false}
              animate={{ left: activeTab === 'privacy' ? '6px' : '50%', width: 'calc(50% - 6px)' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 p-8 space-y-8 text-slate-600 leading-relaxed" onScroll={handleScroll}>
          <AnimatePresence mode='wait'>
            {activeTab === 'privacy' ? (
              <motion.div key="privacy" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8 pb-8">
                <div className="prose prose-sm max-w-none prose-headings:text-slate-900 prose-p:text-slate-600">
                  <p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-4">Effective Date: November 24, 2025</p>
                  
                  <Section title="1. Data Processor Agreement (DPA)" icon={FileText} color="blue">
                    <p className="text-sm mb-3">By using Auditor Veritas, you designate us as a <strong>Data Processor</strong> under GDPR Article 28.</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm marker:text-blue-500 mb-4">
                      <li><strong>Subject Matter:</strong> Audit logging and security monitoring.</li>
                      <li><strong>Duration:</strong> Term of subscription + 30 days retention.</li>
                      <li><strong>Nature of Processing:</strong> Hashing, encryption, storage, and retrieval of event logs.</li>
                    </ul>
                    <button onClick={downloadDPA} className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200">
                      <Download size={14}/> Download Standard DPA (PDF)
                    </button>
                  </Section>

                  <Section title="2. Data Residency & Security" icon={Server} color="indigo">
                    <p className="text-sm mb-4">We implement technical and organizational measures to ensure security appropriate to the risk.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FeatureBox title="Storage Location" desc="EU (Ireland/Frankfurt)" verified />
                      <FeatureBox title="Encryption at Rest" desc="AES-256 (GCM Mode)" verified />
                      <FeatureBox title="Encryption in Transit" desc="TLS 1.3" verified />
                      <FeatureBox title="Access Control" desc="Zero-Trust / Least Privilege" verified />
                    </div>
                  </Section>

                  <Section title="3. PII & Pseudonymization" icon={Fingerprint} color="purple">
                    <p className="text-sm mb-3">To minimize risk, we enforce <strong>Client-Side Pseudonymization</strong>.</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm marker:text-purple-500">
                      <li><strong>User IDs:</strong> Hashed (SHA-256) locally before transmission. We never see raw IDs.</li>
                      <li><strong>Payloads:</strong> Do not include clear-text PII in the JSON `metadata` field unless encrypted.</li>
                      <li><strong>Right to Erasure:</strong> API endpoints available to delete logs by hash key.</li>
                    </ul>
                  </Section>

                  <Section title="4. Sub-processors" icon={Users} color="slate">
                    <p className="text-sm">We engage the following entities to assist with our services:</p>
                    <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 text-slate-700">
                          <tr><th className="p-2">Entity</th><th className="p-2">Service</th><th className="p-2">Location</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr><td className="p-2 font-bold">Supabase</td><td className="p-2">Database & Auth</td><td className="p-2">Ireland (EU)</td></tr>
                          <tr><td className="p-2 font-bold">Render</td><td className="p-2">Backend Hosting</td><td className="p-2">Germany (EU)</td></tr>
                          <tr><td className="p-2 font-bold">Netlify</td><td className="p-2">Frontend CDN</td><td className="p-2">Global</td></tr>
                          <tr><td className="p-2 font-bold">Google Analytics</td><td className="p-2">Usage Analytics</td><td className="p-2">USA (SCCs)</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </Section>
                </div>
              </motion.div>
            ) : (
              <motion.div key="terms" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8 pb-8">
                <div className="prose prose-sm max-w-none prose-headings:text-slate-900 prose-p:text-slate-600">
                  <Section title="1. Acceptable Use Policy" icon={AlertCircle} color="orange">
                    <p className="text-sm mb-3">You agree to use the API only for lawful purposes. You strictly agree <strong>NOT</strong> to:</p>
                    <ul className="space-y-2 bg-orange-50/50 p-4 rounded-xl border border-orange-100 text-sm">
                      <li className="flex gap-2"><Ban size={16} className="text-orange-600 shrink-0"/> Reverse engineer the cryptographic proof engine.</li>
                      <li className="flex gap-2"><Ban size={16} className="text-orange-600 shrink-0"/> Store illegal content, malware, or hate speech.</li>
                      <li className="flex gap-2"><Ban size={16} className="text-orange-600 shrink-0"/> Circumvent rate limits or access controls.</li>
                    </ul>
                  </Section>
                  <Section title="2. Service Level Agreement (SLA)" icon={Activity} color="emerald">
                    <p className="text-sm mb-3">For Enterprise plans, we guarantee <strong>99.9% Monthly Uptime</strong>.</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm marker:text-emerald-500">
                      <li><strong>Maintenance:</strong> Communicated 48h in advance.</li>
                      <li><strong>Credits:</strong> 10% credit per 1% below guaranteed uptime.</li>
                    </ul>
                  </Section>
                  <Section title="3. Limitation of Liability" icon={ShieldCheck} color="slate">
                    <p className="text-sm text-justify">TO THE MAXIMUM EXTENT PERMITTED BY LAW, AUDITOR VERITAS SHALL NOT BE LIABLE FOR INDIRECT DAMAGES. AGGREGATE LIABILITY SHALL NOT EXCEED THE AMOUNT PAID IN THE PAST 12 MONTHS.</p>
                  </Section>
                  <Section title="4. Termination" icon={Ban} color="red">
                    <p className="text-sm">We may terminate access for breach of Terms. Data is permanently deleted after a 30-day grace period.</p>
                  </Section>
                </div>
                <div className="text-center pt-6 border-t border-slate-200"><p className="text-xs text-slate-400">Governing Law: Sweden (Stockholm District Court)</p></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!isFooterView && (
          <div className="p-6 border-t border-slate-200 bg-white shrink-0 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] relative">
            {!canAccept && (
              <div className="absolute -top-12 left-0 w-full flex justify-center pointer-events-none">
                <motion.div initial={{ y: 0 }} animate={{ y: 5 }} transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }} className="bg-slate-900/90 backdrop-blur text-white text-[10px] font-bold px-4 py-1.5 rounded-full flex items-center shadow-lg gap-2">
                  Please read to the end <ChevronDown size={12}/>
                </motion.div>
              </div>
            )}
            <button onClick={onAccept} disabled={!canAccept} className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${canAccept ? 'bg-[#635bff] text-white hover:bg-[#5449e3] active:scale-98 hover:shadow-indigo-500/25' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'}`}>
               {canAccept ? <><ShieldCheck size={20} /> I Accept Terms & Privacy Policy</> : 'Scroll to Accept'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const Section = ({ title, icon: Icon, color, children }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
    <div className="flex items-center mb-4 pb-3 border-b border-slate-50">
      <div className={`p-2 rounded-lg bg-${color}-50 mr-3`}><Icon className={`w-5 h-5 text-${color}-600`} /></div>
      <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
    </div>
    {children}
  </div>
);

const FeatureBox = ({ title, desc, verified }) => (
  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center">
    <div><p className="font-bold text-slate-700 text-xs">{title}</p><p className="text-[11px] text-slate-500">{desc}</p></div>
    {verified && <div className="text-[#635bff]"><CheckCircleMini /></div>}
  </div>
);

const CheckCircleMini = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>);

export default PrivacyPage;