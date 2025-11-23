import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Database, KeyRound, FileLock2, Layers, Terminal, Activity, Server, Lock } from 'lucide-react';
import SectionBackground from './SectionBackground';

const CoreArchitecture = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const features = [
    { id: "privacy", title: "Client-Side Hashing", subtitle: "Pseudonymization", desc: "User Identifiers are hashed (SHA-256) locally on the client before transmission. We verify identity without storing raw emails.", icon: FileLock2, bgColor: "bg-[#1e293b]", textColor: "text-white", accentColor: "text-slate-400", tech: "SHA-256 (Local)", status: "Active" },
    { id: "encryption", title: "Transmission Security", subtitle: "TLS 1.3 Encryption", desc: "All event payloads are encrypted in transit using industry-standard protocols. Sensitive fields are processed in isolated environments.", icon: Lock, bgColor: "bg-[#f8fafc]", textColor: "text-slate-900", accentColor: "text-blue-600", tech: "AES-GCM", status: "Secure" },
    { id: "ledger", title: "Tamper-Evident Logs", subtitle: "Integrity Chain", desc: "Every event is assigned a cryptographic signature linked to the previous entry. Any attempt to alter past logs breaks the verification chain.", icon: Database, bgColor: "bg-[#00d4ff]", textColor: "text-slate-900", accentColor: "text-slate-800", tech: "Immutable Row", status: "Synced" },
    { id: "keys", title: "Key Management", subtitle: "Rotation API", desc: "Supports programmatic key rotation. If a credential is compromised, you can revoke and generate new API keys instantly without downtime.", icon: KeyRound, bgColor: "bg-[#635bff]", textColor: "text-white", accentColor: "text-indigo-200", tech: "API-Key Auth", status: "Rotatable" }
  ];

  useEffect(() => {
    if (isHovering) return;
    const interval = setInterval(() => { setActiveIndex((prev) => (prev + 1) % features.length); }, 4000); 
    return () => clearInterval(interval);
  }, [isHovering, features.length]);

  return (
    <div className="relative py-24 md:py-32 overflow-hidden">
      <SectionBackground variant="dark" />
      <div className="w-full max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 md:gap-24 items-center">
          
          <div className="space-y-8 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold uppercase tracking-wide backdrop-blur-sm"><Layers size={14} /> Core Infrastructure</div>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-[1.1]">Transparent Security. <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#635bff] to-[#00d4ff]">Verifiable Trust.</span></h2>
            <div className="min-h-[220px] relative">
              <AnimatePresence mode="wait">
                <motion.div key={activeIndex} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.3 }}>
                  <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">{features[activeIndex].title}</h3>
                  <p className="text-lg text-slate-300 leading-relaxed max-w-md">{features[activeIndex].desc}</p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-2"><Terminal size={12} /> {features[activeIndex].tech}</div>
                    <div className="px-3 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-xs font-bold text-emerald-400 flex items-center gap-2"><Activity size={12} /> {features[activeIndex].status}</div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex gap-2 pt-4">
              {features.map((_, i) => <button key={i} onClick={() => setActiveIndex(i)} className={`h-1.5 rounded-full transition-all duration-500 ${i === activeIndex ? 'w-12 bg-[#635bff]' : 'w-3 bg-white/20 hover:bg-white/40'}`} />)}
            </div>
          </div>

          <div className="relative h-[400px] w-full flex items-center justify-center lg:justify-end perspective-[1000px] order-1 lg:order-2" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
            <div className="relative w-[300px] md:w-[340px] h-[220px]">
              <AnimatePresence initial={false}>
                {features.map((card, index) => {
                  const offset = (index - activeIndex + features.length) % features.length;
                  if (offset > 2) return null;
                  const isFront = offset === 0;
                  const isSecond = offset === 1;
                  return (
                    <motion.div
                      key={card.id}
                      className={`absolute inset-0 rounded-2xl p-6 flex flex-col justify-between overflow-hidden shadow-2xl border border-white/10 ${card.bgColor} ${card.textColor}`}
                      style={{ zIndex: 30 - offset, transformOrigin: "top center" }}
                      initial={{ scale: 0.9, y: -40, opacity: 0 }}
                      animate={{ y: isFront ? 0 : isSecond ? -35 : -70, scale: isFront ? 1 : isSecond ? 0.95 : 0.9, opacity: isFront ? 1 : isSecond ? 1 : 0.5, filter: isFront ? 'brightness(1)' : 'brightness(0.5)' }}
                      exit={{ y: 150, opacity: 0, scale: 0.95, zIndex: 0, rotateX: -10 }}
                      transition={{ type: "spring", stiffness: 120, damping: 15 }}
                      onClick={() => setActiveIndex(index)}
                    >
                      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                      <div className="flex justify-between items-start relative z-10">
                        <div className="flex items-center gap-2"><card.icon size={20} className={card.textColor} /><span className={`font-bold tracking-wider ${card.textColor} opacity-90`}>AUDITOR</span></div>
                        <Server size={14} className="opacity-50"/>
                      </div>
                      <div className="relative z-10 mt-4"><h4 className="text-xl font-bold tracking-tight">{card.title}</h4><p className={`text-xs font-mono mt-1 ${card.accentColor} opacity-80 uppercase tracking-widest`}>{card.subtitle}</p></div>
                      <div className="flex justify-between items-end relative z-10 mt-auto pt-6"><div className="w-10 h-7 rounded bg-white/20 border border-white/10 flex items-center justify-center"><div className="w-8 h-[1px] bg-white/30"></div></div><div className={`text-[10px] font-bold ${card.accentColor}`}>VERIFIED</div></div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoreArchitecture;