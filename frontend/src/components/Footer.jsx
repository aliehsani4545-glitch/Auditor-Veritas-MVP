import React from 'react';
import { ShieldCheck, Github, Twitter, Linkedin, ArrowUpRight } from 'lucide-react';

const Footer = ({ onOpenPrivacy, onOpenTerms, onNavigate }) => {
  
  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#020617] border-t border-white/10 pt-16 pb-8 text-slate-400">
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
           <div className="flex gap-6">
              <span>Stockholm, Sweden</span>
              <span className="hidden md:inline">•</span>
              <a href="mailto:support@auditorveritas.com" className="hover:text-white transition-colors">Contact Support</a>
           </div>
        </div>

      </div>
    </footer>
  );
};

const SocialLink = ({ icon: Icon }) => (
  <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
    <Icon size={18} />
  </a>
);

export default Footer;