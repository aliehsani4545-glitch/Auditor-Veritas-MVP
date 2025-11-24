import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// HÄR ÄR FIXEN: Fingerprint är nu med i listan
import { ShieldCheck, GitMerge, History, FileKey, CheckCircle2, Binary, Fingerprint } from 'lucide-react';
import { AuroraBackground } from './SharedBackgrounds';

const IntegrityEngine = () => {
  const [activeHash, setActiveHash] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHash(prev => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const hashStates = [
    { label: "Validating Input...", color: "text-slate-500", bg: "bg-slate-200", val: "..." },
    { label: "Computing SHA-256", color: "text-indigo-600", bg: "bg-indigo-100", val: "e3b0c442" },
    { label: "Appending Salt", color: "text-purple-600", bg: "bg-purple-100", val: "88d92a11" },
    { label: "Merkle Root Updated", color: "text-emerald-600", bg: "bg-emerald-100", val: "0x9f8a2b" },
  ];

  return (
    <div className="relative py-24 md:py-32 bg-white overflow-hidden border-t border-slate-100">
      
      <AuroraBackground />

      {/* Hissande färgflagga */}
      <motion.div 
        className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-blue-500/20 blur-[100px] pointer-events-none mix-blend-multiply"
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0],
          x: [0, 50, 0],
          y: [0, -50, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* TEXT SECTION */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="order-2 lg:order-1"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6">
            <ShieldCheck size={14} /> Cryptographic Core
          </div>
          
          <h3 className="text-3xl md:text-5xl font-bold text-[#0a2540] mb-6 tracking-tight leading-[1.1]">
            <span className="text-[#635bff]">Mathematically</span> <br/>
            <span className="text-[#0a2540]">guaranteed integrity.</span>
          </h3>
          
          <p className="text-base md:text-lg text-slate-600 mb-8 leading-relaxed">
            Every event is sealed using standard <span className="font-bold text-[#0a2540] font-mono">SHA-256</span> hashing and anchored to a Merkle Tree. This ensures records are tamper-evident by design.
          </p>
          
          <div className="space-y-4">
             <FeatureItem 
               title="Tamper-Evident Chains" 
               desc="Logs are linked via cryptographic hashes. Modifying an old entry invalidates the entire subsequent chain." 
               icon={History} 
             />
             <FeatureItem 
               title="Local Hashing" 
               desc="Sensitive fields are hashed on the client device before transmission. We store the proof, not the raw identity." 
               icon={FileKey} 
             />
             <FeatureItem 
               title="Privacy-Preserving" 
               desc="Verify integrity without exposing raw PII payload using cryptographic proofs." 
               icon={Fingerprint} 
             />
          </div>
        </motion.div>

        {/* VISUALIZATION: THE MERKLE TREE */}
        <div className="relative h-[500px] md:h-[600px] bg-[#0f172a] rounded-[30px] md:rounded-[40px] p-4 md:p-8 shadow-2xl shadow-indigo-900/20 border border-slate-800 flex flex-col items-center justify-center overflow-hidden perspective-[1000px] group order-1 lg:order-2 w-full">
           <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#6366f1_1px,transparent_1px)] bg-[size:30px_30px]"></div>
           
           <div className="relative z-10 w-full max-w-sm flex flex-col gap-8 md:gap-12 items-center transform scale-90 md:scale-100">
              <div className="w-full relative">
                 <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse-slow"></div>
                 <div className="bg-[#020617] border border-indigo-500/30 p-4 md:p-6 rounded-2xl relative z-10 shadow-[0_0_40px_-10px_rgba(99,102,241,0.3)] flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center mb-3 border border-indigo-500/20">
                       <GitMerge size={20} className="text-indigo-400" />
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Merkle Root</div>
                    <div className="font-mono text-xs md:text-sm text-indigo-300 bg-black/60 px-3 py-2 rounded border border-white/5 shadow-inner w-full text-center overflow-hidden">
                       <motion.span key={activeHash} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="block">
                         {hashStates[activeHash].val}...
                       </motion.span>
                    </div>
                 </div>
              </div>

              <div className="relative w-full h-20 md:h-24">
                 <svg className="absolute inset-0 w-full h-full overflow-visible">
                    <path d="M 190 0 C 190 50, 100 50, 100 100" fill="none" stroke="#334155" strokeWidth="2" />
                    <path d="M 190 0 C 190 50, 280 50, 280 100" fill="none" stroke="#334155" strokeWidth="2" />
                    <motion.circle r="3" fill="#818cf8"><animateMotion dur="2s" repeatCount="indefinite" path="M 190 0 C 190 50, 100 50, 100 100" /></motion.circle>
                    <motion.circle r="3" fill="#818cf8"><animateMotion dur="2s" repeatCount="indefinite" begin="1s" path="M 190 0 C 190 50, 280 50, 280 100" /></motion.circle>
                 </svg>
              </div>

              <div className="flex gap-2 md:gap-4 w-full">
                 <LeafNode id="HASH_91" status="Verified" delay={0} />
                 <LeafNode id="HASH_92" status="Verified" delay={0.5} />
              </div>
           </div>
           
           <div className="absolute bottom-4 md:bottom-6 flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-[#020617] rounded-full border border-white/10 shadow-lg">
              <div className={`w-2 h-2 rounded-full ${hashStates[activeHash].bg} transition-colors duration-500 shadow-[0_0_10px_currentColor]`}></div>
              <span className={`text-[10px] md:text-xs font-bold ${hashStates[activeHash].color} transition-colors duration-500`}>
                {hashStates[activeHash].label}
              </span>
           </div>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ title, desc, icon: Icon }) => (
  <div className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors duration-300 border border-transparent hover:border-indigo-100">
    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
      <Icon size={20} className="text-indigo-600" />
    </div>
    <div>
      <h4 className="font-bold text-slate-900 text-sm md:text-base mb-1">{title}</h4>
      <p className="text-slate-600 text-xs md:text-sm leading-snug">{desc}</p>
    </div>
  </div>
);

const LeafNode = ({ id, status, delay }) => (
  <motion.div 
    initial={{ y: 20, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    transition={{ delay }}
    className="flex-1 bg-[#020617] border border-white/10 p-3 md:p-4 rounded-xl flex flex-col items-center hover:border-indigo-500/50 transition-all duration-300 hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.2)]"
  >
     <Binary size={16} className="text-slate-500 mb-2" />
     <span className="text-[9px] md:text-[10px] font-bold text-slate-300 tracking-wider">{id}</span>
     <div className="mt-2 flex items-center gap-1">
        <CheckCircle2 size={10} className="text-indigo-400" />
        <span className="text-[8px] md:text-[9px] text-indigo-400 uppercase font-bold">{status}</span>
     </div>
  </motion.div>
);

export default IntegrityEngine;