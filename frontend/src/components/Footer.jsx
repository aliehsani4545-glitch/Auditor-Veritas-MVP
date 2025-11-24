import React from 'react';
import { ShieldCheck, Github, Twitter, Linkedin, Cookie } from 'lucide-react';

const Footer = ({ onOpenPrivacy }) => {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#020617] border-t border-slate-800 pt-16 pb-8 text-slate-400 text-sm relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
          
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 text-white mb-4">
              <div className="w-8 h-8 bg-[#635bff] rounded-lg flex items-center justify-center"><ShieldCheck size={20} /></div>
              <span className="font-bold text-xl tracking-tight">Auditor Veritas</span>
            </div>
            <p className="mb-6 max-w-xs text-slate-500">Evidence-grade audit infrastructure. Immutable, encrypted, and compliant by default.</p>
            <div className="flex gap-4"><SocialIcon icon={Github} /><SocialIcon icon={Twitter} /><SocialIcon icon={Linkedin} /></div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Product</h4>
            <ul className="space-y-3">
              <li><button onClick={() => scrollToSection('demo')} className="hover:text-[#635bff]">Features</button></li>
              <li><button onClick={() => scrollToSection('merkle')} className="hover:text-[#635bff]">Cryptography</button></li>
              <li><button onClick={() => scrollToSection('architecture')} className="hover:text-[#635bff]">Infrastructure</button></li>
              <li><button onClick={() => scrollToSection('pricing')} className="hover:text-[#635bff]">Enterprise</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Developers</h4>
            <ul className="space-y-3">
              <li><button onClick={() => scrollToSection('code-integration')} className="hover:text-[#635bff]">Quick Start</button></li>
              <li><a href="#" className="hover:text-[#635bff]">API Reference</a></li>
              <li><a href="#" className="hover:text-[#635bff]">SDKs</a></li>
              <li><a href="#" className="hover:text-[#635bff]">Status</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Compliance</h4>
            <ul className="space-y-3">
              <li><button onClick={onOpenPrivacy} className="hover:text-[#635bff]">Privacy Policy</button></li>
              <li><button onClick={onOpenPrivacy} className="hover:text-[#635bff]">Terms of Service</button></li>
              {/* HÄR ÄR ÄNDRINGEN: */}
              <li className="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase pt-2"><Cookie size={12}/> No Trackers</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Auditor Veritas AB. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>System Operational</div>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon = ({ icon: Icon }) => (
  <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#635bff] hover:text-white transition-all"><Icon size={18} /></a>
);

export default Footer;