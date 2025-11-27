import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Server, FileText, CheckCircle, Download, X, Key } from 'lucide-react';

const SecurityPage = ({ onClose }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-[#020617] overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="flex justify-between items-start mb-16">
          <div>
            <div className="flex items-center gap-2 mb-4 text-emerald-400"><Shield size={24} /><span className="font-bold text-sm tracking-widest uppercase">Security Center</span></div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Enterprise-Grade Security</h1>
            <p className="text-slate-400 text-lg">How Auditor Veritas protects data integrity, privacy, and availability.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"><X size={24}/></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <SecurityCard icon={Lock} color="text-emerald-400" title="Encryption at Rest & Transit" desc="All data transmitted using TLS 1.3. Database storage encrypted with AES-256 GCM." items={["SSL/TLS Encryption (HTTPS)", "AES-256 Database Encryption", "Key Management Service (KMS)"]} />
            <SecurityCard icon={Key} color="text-blue-400" title="PII & Hashing Strategy" desc="We practice 'Privacy by Architecture'. We do not store cleartext user identifiers." items={["One-way SHA-256 Hashing", "Cryptographic Salting", "GDPR Article 17 Erasure Capable"]} />
            <SecurityCard icon={Server} color="text-purple-400" title="Infrastructure" desc="Hosted on Render (EU-Frankfurt) with redundancy." items={["99.99% Uptime SLA", "Hourly Backups", "DDoS Protection via Cloudflare"]} />
            <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
                <FileText className="text-amber-400 mb-6" size={32} />
                <h3 className="text-xl font-bold text-white mb-3">Compliance Docs</h3>
                <div className="space-y-3 mt-6">
                    <button className="w-full flex justify-between px-4 py-3 bg-slate-700 rounded-lg text-slate-200 text-sm font-bold"><span>🇪🇺 EU Data Processing Agreement</span><Download size={16} /></button>
                    <button className="w-full flex justify-between px-4 py-3 bg-slate-700 rounded-lg text-slate-200 text-sm font-bold"><span>🛡️ SOC2 Type II Report</span><Download size={16} /></button>
                </div>
            </div>
        </div>
      </div>
    </motion.div>
);

const SecurityCard = ({ icon: Icon, color, title, desc, items }) => (
    <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
        <Icon className={`${color} mb-6`} size={32} />
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 mb-6 text-sm leading-relaxed">{desc}</p>
        <ul className="space-y-2 text-sm text-slate-500">{items.map((i,x) => <li key={x} className="flex gap-2"><CheckCircle size={14} className={color.replace('text','text')}/> {i}</li>)}</ul>
    </div>
);

export default SecurityPage;