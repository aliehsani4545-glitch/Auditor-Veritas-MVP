import React, { useState } from 'react';
import { ShieldCheck, Github, Twitter, Linkedin, ArrowUpRight, X, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Footer = ({ onOpenPrivacy, onOpenTerms, onNavigate }) => {
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
      
      const myForm = e.target;
      const formData = new FormData(myForm);
      
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString(),
      })
      .then(() => {
          setSubmitted(true);
          setIsSubmitting(false);
          setTimeout(() => {
              setShowContact(false);
              setSubmitted(false);
          }, 3000);
      })
      .catch((error) => {
          alert(error);
          setIsSubmitting(false);
      });
  };

  return (
    <>
    <footer className="bg-[#020617] border-t border-white/10 pt-16 pb-8 text-slate-400 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4 text-white">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
                 <ShieldCheck size={20}/>
              </div>
              <span className="font-bold text-xl tracking-tight">Auditor Veritas</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs mb-6 text-slate-500">
              The standard for cryptographic audit logging. Securing the world's data integrity, one block at a time.
            </p>
            <div className="flex gap-4">
               <SocialLink icon={Github} />
               <SocialLink icon={Twitter} />
               <SocialLink icon={Linkedin} />
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-3 text-sm">
               <li>
                 <button onClick={() => handleScrollTo('architecture')} className="hover:text-blue-400 transition-colors flex items-center gap-1">
                   Documentation <ArrowUpRight size={12} className="opacity-50"/>
                 </button>
               </li>
               <li>
                 <button onClick={() => handleScrollTo('code-integration')} className="hover:text-blue-400 transition-colors">
                   API Reference
                 </button>
               </li>
               <li>
                 <button onClick={() => alert("All systems operational. 99.99% Uptime.")} className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                   System Status
                 </button>
               </li>
               <li>
                 <button onClick={() => onNavigate('pricing')} className="hover:text-blue-400 transition-colors text-white font-medium">
                   Pricing
                 </button>
               </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3 text-sm">
               <li>
                 <button onClick={onOpenPrivacy} className="hover:text-blue-400 transition-colors text-left">
                   Privacy Policy
                 </button>
               </li>
               <li>
                 <button onClick={onOpenTerms} className="hover:text-blue-400 transition-colors text-left">
                   Terms of Service
                 </button>
               </li>
               <li>
                  <button onClick={onOpenPrivacy} className="hover:text-blue-400 transition-colors">GDPR & Compliance</button>
               </li>
               <li>
                  <button onClick={() => handleScrollTo('merkle')} className="hover:text-blue-400 transition-colors">Security Architecture</button>
               </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
           <span>© 2025 Auditor Veritas Inc. All rights reserved.</span>
           <div className="flex gap-6 items-center">
              <span>Stockholm, Sweden</span>
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
                    initial={{ scale: 0.9, y: 20 }} 
                    animate={{ scale: 1, y: 0 }} 
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-slate-900 border border-slate-700 p-8 rounded-2xl w-full max-w-md shadow-2xl relative"
                >
                    <button 
                        onClick={() => setShowContact(false)} 
                        className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-white mb-2">Contact Support</h3>
                        <p className="text-slate-400 text-sm">We usually respond within 24 hours.</p>
                    </div>

                    {submitted ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-8 text-center text-emerald-400">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckIcon size={24} />
                            </div>
                            <h4 className="font-bold text-lg mb-1">Message Sent!</h4>
                            <p className="text-sm opacity-80">Thank you for reaching out.</p>
                        </div>
                    ) : (
                        <form 
                            name="contact" 
                            method="POST" 
                            data-netlify="true" 
                            onSubmit={handleSubmit}
                            className="space-y-4"
                        >
                            {/* Hidden input for Netlify */}
                            <input type="hidden" name="form-name" value="contact" />

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Name</label>
                                <input required type="text" name="name" placeholder="Jane Doe" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email</label>
                                <input required type="email" name="email" placeholder="jane@company.com" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Message</label>
                                <textarea required name="message" rows="4" placeholder="How can we help you?" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" />
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
  <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
    <Icon size={18} />
  </a>
);

// Helper Icon
const CheckIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

export default Footer;