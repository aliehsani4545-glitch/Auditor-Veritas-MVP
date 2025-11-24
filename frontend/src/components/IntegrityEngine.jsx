import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, GitMerge, Fingerprint, History, CheckCircle2, Binary } from 'lucide-react';

const IntegrityEngine = () => {
  const [activeHash, setActiveHash] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHash(prev => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const hashStates = [
    { label: "Validating...", color: "text-slate-400", bg: "bg-slate-500", val: "..." },
    { label: "Hashing SHA-256", color: "text-blue-400", bg: "bg-blue-500", val: "e3b0c442" },
    { label: "Salting", color: "text-purple-400", bg: "bg-purple-500", val: "88d92a11" },
    { label: "Merkle Root Sealed", color: "text-emerald-400", bg: "bg-emerald-500", val: "0x9f8a2b" },
  ];

  return (
    <div className="relative py-24 md:py-32 bg-white overflow-hidden border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* TEXT SECTION */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="order-2 lg:order-1"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider mb-6">
            <ShieldCheck size={14} /> Cryptographic Core
          </div>
          <h3 className="text-3xl md:text-6xl font-bold text-[#0a2540] mb-6 tracking-tight leading-[1.1]">
            Trust, mathematically <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">guaranteed.</span>
          </h3>
          <p className="text-base md:text-lg text-slate-600 mb-8 leading-relaxed">
            Every event is sealed using <span className="font-semibold text-slate-900">SHA-256</span> and anchored to a Merkle Tree. This ensures records are tamper-evident by design.
          </p>
          
          <div className="space-y-4 md:space-y-6">
             <FeatureItem title="Tamper-Evident" desc="Modifying a single bit invalidates the entire chain." icon={History} />
             <FeatureItem title="Privacy-Preserving" desc="Verify integrity without exposing raw PII payload." icon={Fingerprint} />
             <FeatureItem title="Real-Time Sync" desc="Ledger updates propagate instantly across nodes." icon={GitMerge} />
          </div>
        </motion.div>

        {/* VISUALIZATION */}
        <div className="relative h-[500px] md:h-[600px] bg-[#020617] rounded-[30px] md:rounded-[40px] p-4 md:p-8 shadow-2xl border border-slate-800 flex flex-col items-center justify-center overflow-hidden perspective-[1000px] group order-1 lg:order-2 w-full">
           
           <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
           
           {/* Scale container for mobile to prevent overflow */}
           <div className="relative z-10 w-full max-w-sm flex flex-col gap-8 md:gap-12 items-center transform scale-90 md:scale-100">
              
              {/* ROOT NODE */}
              <div className="w-full relative">
                 <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
                 <div className="bg-slate-900 border border-slate-700 p-4 md:p-6 rounded-2xl relative z-10 shadow-xl flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                       <GitMerge size={20} className="text-emerald-500" />
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Merkle Root</div>
                    <div className="font-mono text-xs md:text-sm text-emerald-300 bg-black/50 px-3 py-1.5 rounded border border-emerald-500/20 shadow-inner w-full text-center overflow-hidden">
                       <motion.span 
                         key={activeHash}
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         className="block"
                       >
                         {hashStates[activeHash].val}...
                       </motion.span>
                    </div>
                 </div>
              </div>

              {/* SVG Lines */}
              <div className="relative w-full h-20 md:h-24">
                 <svg className="absolute inset-0 w-full h-full overflow-visible">
                    <path d="M 190 0 C 190 50, 100 50, 100 100" fill="none" stroke="#1e293b" strokeWidth="2" />
                    <path d="M 190 0 C 190 50, 280 50, 280 100" fill="none" stroke="#1e293b" strokeWidth="2" />
                    <motion.circle r="3" fill="#10b981">
                       <animateMotion dur="2s" repeatCount="indefinite" path="M 190 0 C 190 50, 100 50, 100 100" />
                    </motion.circle>
                    <motion.circle r="3" fill="#10b981">
                       <animateMotion dur="2s" repeatCount="indefinite" begin="1s" path="M 190 0 C 190 50, 280 50, 280 100" />
                    </motion.circle>
                 </svg>
              </div>

              {/* Leaf Nodes */}
              <div className="flex gap-2 md:gap-4 w-full">
                 <LeafNode id="TX_91" status="Valid" delay={0} />
                 <LeafNode id="TX_92" status="Valid" delay={0.5} />
              </div>

           </div>
           
           <div className="absolute bottom-4 md:bottom-6 flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-slate-900 rounded-full border border-slate-800">
              <div className={`w-2 h-2 rounded-full ${hashStates[activeHash].bg} transition-colors duration-500`}></div>
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
  <div className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors duration-300">
    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
      <Icon size={20} className="text-blue-600" />
    </div>
    <div>
      <h4 className="font-bold text-slate-900 text-sm md:text-base">{title}</h4>
      <p className="text-slate-500 text-xs md:text-sm leading-snug mt-1">{desc}</p>
    </div>
  </div>
);

const LeafNode = ({ id, status, delay }) => (
  <motion.div 
    initial={{ y: 20, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    transition={{ delay }}
    className="flex-1 bg-slate-900 border border-slate-700 p-3 md:p-4 rounded-xl flex flex-col items-center hover:border-emerald-500/50 transition-colors"
  >
     <Binary size={16} className="text-slate-500 mb-2" />
     <span className="text-[9px] md:text-[10px] font-bold text-slate-300">{id}</span>
     <div className="mt-2 flex items-center gap-1">
        <CheckCircle2 size={10} className="text-emerald-500" />
        <span className="text-[8px] md:text-[9px] text-emerald-500 uppercase">{status}</span>
     </div>
  </motion.div>
);

export default IntegrityEngine;