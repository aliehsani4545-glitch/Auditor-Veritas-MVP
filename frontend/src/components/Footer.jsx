import React from 'react';
import { ShieldCheck, Mail, Github, Twitter } from 'lucide-react';

const Footer = ({ onOpenPrivacy }) => {
  return (
    <footer className="bg-[#020617] border-t border-slate-800 text-slate-400 py-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-[#635bff] rounded-lg flex items-center justify-center text-white"><ShieldCheck size={20}/></div>
            <span className="font-bold text-white text-xl">Auditor Veritas</span>
          </div>
          <p className="text-sm leading-relaxed max-w-sm mb-6">
            The enterprise standard for immutable audit trails. We secure the world's most sensitive data using cryptographic proofs and distributed ledger technology.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition"><Github size={20}/></a>
            <a href="#" className="hover:text-white transition"><Twitter size={20}/></a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4">Product</h4>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-[#635bff] transition">Features</a></li>
            <li><a href="#" className="hover:text-[#635bff] transition">Integrations</a></li>
            <li><a href="#" className="hover:text-[#635bff] transition">Enterprise</a></li>
            <li><a href="#" className="hover:text-[#635bff] transition">Security</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4">Legal & Contact</h4>
          <ul className="space-y-3 text-sm">
            <li><button onClick={onOpenPrivacy} className="hover:text-[#635bff] transition text-left">Privacy Policy</button></li>
            <li><button onClick={onOpenPrivacy} className="hover:text-[#635bff] transition text-left">Terms of Service</button></li>
            <li><button onClick={onOpenPrivacy} className="hover:text-[#635bff] transition text-left">Cookie Settings</button></li>
            <li className="pt-4 flex items-center gap-2">
              <Mail size={14}/> 
              <a href="mailto:hazarnodesweden@outlook.com" className="text-white hover:text-[#635bff]">hazarnodesweden@outlook.com</a>
            </li>
          </ul>
        </div>

      </div>
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-800 text-xs text-center">
        © 2025 Auditor Veritas. All rights reserved. hosted on Render & Netlify.
      </div>
    </footer>
  );
};

export default Footer;