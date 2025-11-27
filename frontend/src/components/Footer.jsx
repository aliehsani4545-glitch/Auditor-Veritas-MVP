import React, { useState } from 'react';
import { ShieldCheck, Github, Twitter, Linkedin, ArrowUpRight, X, Send, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Footer = ({ onOpenPrivacy, onOpenTerms, onOpenSecurity, onOpenDocs, onNavigate }) => {
  const [showContact, setShowContact] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      
      // Simulerar ett API-anrop för kontaktformuläret
      setTimeout(() => {
          setSubmitted(true);
          setIsSubmitting(false);
          setTimeout(() => {
              setShowContact(false);
              setSubmitted(false);
          }, 3000);
      }, 1500);
  };

  return (
    <>
    <footer className="bg-[#020617] border-t border-white/10 pt-16 pb-8 text-slate-400 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {/* LOGO & BRAND */}
          <div className="col-span-2 pr-8">
            <div className="flex items-center gap-2 mb-4 text-white">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
                 <ShieldCheck size={20}/>
              </div>
              <span className="font-bold text-xl tracking-tight">Auditor Veritas</span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm mb-6 text-slate-500">
              The standard for cryptographic audit logging. Securing data integrity with immutable verification chains built on top of transparent infrastructure.
            </p>
            <div className="flex gap-4">
               <SocialLink icon={Github} />
               <SocialLink icon={Twitter} />
               <SocialLink icon={Linkedin} />
            </div>
          </div>
          
          {/* PLATFORM LINKS */}
          <div>
            <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-widest">Platform</h4>
            <ul className="space-y-3 text-sm font-medium">
               <li>
                 <button onClick={onOpenDocs} className="hover:text-white transition-colors flex items-center gap-1">
                   Documentation <ArrowUpRight size={12} className="opacity-50"/>
                 </button>
               </li>
               <li>
                 <button onClick={() => handleScrollTo('code-integration')} className="hover:text-white transition-colors">
                   API Reference
                 </button>
               </li>
               <li>
                 <button onClick={() => alert("All systems operational.")} className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                   System Status
                 </button>
               </li>
               <li>
                 <button onClick={() => onNavigate('pricing')} className="hover:text-white transition-colors text-white">
                   Enterprise Pricing
                 </button>
               </li>
            </ul>
          </div>
          
          {/* COMPLIANCE LINKS */}
          <div>
            <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-widest">Compliance</h4>
            <ul className="space-y-3 text-sm font-medium">
               <li>
                 <button onClick={onOpenPrivacy} className="hover:text-white transition-colors text-left">
                   Privacy Policy
                 </button>
               </li>
               <li>
                 <button onClick={onOpenTerms} className="hover:text-white transition-colors text-left">
                   Terms of Service
                 </button>
               </li>
               <li>
                  <button onClick={onOpenSecurity} className="hover:text-blue-400 transition-colors flex items-center gap-2">
                    <ShieldCheck size={14}/> Security Architecture
                  </button>
               </li>
               <li>
                  <button onClick={() => handleScrollTo('merkle')} className="hover:text-white transition-colors">GDPR & Logs</button>
               </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
           <span>© 2025 Auditor Veritas Inc. All rights reserved.</span>
           <div className="flex gap-6 items-center">
              <span>Made in Sweden 🇸🇪</span>
              <span className="hidden md:inline">•</span>
              <button onClick={() => setShowContact(true)} className="hover:text-white transition-colors text-blue-500 font-bold">Contact Support</button>
           </div>
        </div>

      </div>
    </footer>

    {/* --- CONTACT FORM MODAL --- */}
    <AnimatePresence>
        {showContact && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            >
                <motion.div 
                    initial={{ scale: 0.95, y: 20 }} 
                    animate={{ scale: 1, y: 0 }} 
                    exit={{ scale: 0.95, y: 20 }}
                    className="bg-[#0f172a] border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl relative"
                >
                    <button 
                        onClick={() => setShowContact(false)} 
                        className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-white mb-2">Contact Support</h3>
                        <p className="text-slate-400 text-sm">Technical questions? We typically respond within 24 hours.</p>
                    </div>

                    {submitted ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-8 text-center text-emerald-400">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check size={24} />
                            </div>
                            <h4 className="font-bold text-lg mb-1">Message Sent!</h4>
                            <p className="text-sm opacity-80">Check your email for a confirmation receipt.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Name</label>
                                <input required type="text" placeholder="Jane Doe" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-blue-500 outline-none transition-all focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email</label>
                                <input required type="email" placeholder="jane@company.com" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-blue-500 outline-none transition-all focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Message</label>
                                <textarea required rows="4" placeholder="How can we help with your integration?" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-blue-500 outline-none transition-all resize-none focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <button 
                                type="submit" 
                                disabled={isSubmitting} 
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : <Send size={18}/>}
                                {isSubmitting ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    )}
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
    </>
  );
};

const SocialLink = ({ icon: Icon }) => (
  <a href="#" className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
    <Icon size={18} />
  </a>
);

export default Footer;