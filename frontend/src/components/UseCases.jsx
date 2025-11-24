import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Activity, ShoppingCart, Lock, Server, FileCheck, Code2, Terminal, ArrowRight } from 'lucide-react';
import { DarkAuroraBackground } from './SharedBackgrounds';

const UseCases = () => {
  const [activeCase, setActiveCase] = useState('fintech');

  const cases = {
    fintech: {
      label: "Fintech",
      color: "#60a5fa", // Ljusare blå för dark mode
      badge: "ISO 20022",
      desc: "Secure transaction ledgering with real-time fraud detection.",
      pipeline: [
        { icon: CreditCard, title: "Transaction", subtitle: "JSON Payload", code: `{ "amt": 5000, "iso": "USD" }` },
        { icon: Lock, title: "Encryption", subtitle: "AES-256-GCM", code: `{ "enc": "8f9a2...", "iv": "a1" }` },
        { icon: FileCheck, title: "Settlement", subtitle: "Ledger Commit", code: `{ "hash": "0x992", "state": "OK" }` }
      ]
    },
    health: {
      label: "Healthcare",
      color: "#f472b6", // Ljusare rosa
      badge: "HIPAA",
      desc: "HIPAA-compliant logs with automatic PII redaction.",
      pipeline: [
        { icon: Activity, title: "Patient Data", subtitle: "Raw Input", code: `{ "id": "p_91", "type": "diag" }` },
        { icon: Server, title: "Anonymizer", subtitle: "PII Scrubbing", code: `{ "id": "anon_x", "risk": 0 }` },
        { icon: Lock, title: "Audit Log", subtitle: "Secure Store", code: `{ "actor": "dr_s", "ts": 123 }` }
      ]
    },
    retail: {
      label: "Retail",
      color: "#22d3ee", // Ljusare cyan
      badge: "PCI-DSS",
      desc: "High-volume inventory tracking with immutable receipts.",
      pipeline: [
        { icon: ShoppingCart, title: "Order Event", subtitle: "Cart Action", code: `{ "sku": "xyz", "qty": 1 }` },
        { icon: Server, title: "Inventory", subtitle: "Stock Check", code: `{ "stock": -1, "ok": true }` },
        { icon: FileCheck, title: "Receipt", subtitle: "Immutable", code: `{ "tx": "ord_8", "sign": "valid" }` }
      ]
    }
  };

  return (
    <div className="bg-[#020617] py-24 md:py-32 relative overflow-hidden text-white border-t border-white/5">
      {/* DEN NYA MÖRKA FÄRGSJALEN */}
      <DarkAuroraBackground />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <div className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-400 backdrop-blur-md">
                 Industry Solutions
               </div>
               <div className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md" style={{ color: cases[activeCase].color }}>
                 {cases[activeCase].badge} Compliant
               </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
              Logic for every <span className="border-b-2 border-dashed pb-1" style={{ borderColor: cases[activeCase].color, color: cases[activeCase].color }}>workflow</span>.
            </h2>
            <p className="text-slate-400 max-w-lg text-lg leading-relaxed">
              {cases[activeCase].desc}
            </p>
          </div>
          
          {/* Interaktiv Väljare */}
          <div className="bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-lg flex gap-1 z-20 shadow-2xl">
             {Object.keys(cases).map(key => (
               <button
                 key={key}
                 onClick={() => setActiveCase(key)}
                 className={`px-6 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${
                   activeCase === key 
                     ? 'bg-white/10 text-white shadow-inner border border-white/10' 
                     : 'text-slate-500 hover:text-white hover:bg-white/5'
                 }`}
               >
                 {cases[key].label}
               </button>
             ))}
          </div>
        </div>

        {/* PIPELINE VISUALIZATION */}
        <div className="relative min-h-[400px]">
           {/* Connection Line (Horizontal/Vertical) */}
           <div className="absolute top-[80px] left-[10%] right-[10%] h-[2px] bg-white/10 rounded-full hidden md:block" />
           <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-white/10 -translate-x-1/2 rounded-full md:hidden" />

           <AnimatePresence mode="wait">
             <motion.div 
               key={activeCase}
               className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               transition={{ duration: 0.4 }}
             >
                {cases[activeCase].pipeline.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <motion.div 
                      key={i}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.15 }}
                      className="relative"
                    >
                       {/* Animated Beam (Desktop) */}
                       {i < 2 && (
                         <div className="hidden md:block absolute top-[80px] left-[50%] w-full h-[2px] z-0 overflow-hidden">
                            <motion.div 
                              className="w-20 h-full bg-gradient-to-r from-transparent via-current to-transparent opacity-50"
                              style={{ color: cases[activeCase].color }}
                              animate={{ x: ["-100%", "250%"] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.5 + (i*0.5) }}
                            />
                         </div>
                       )}

                       {/* NODE CARD - DARK MODE GLASS */}
                       <div className="bg-[#0f172a]/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/10 p-1 overflow-hidden group hover:shadow-[0_0_40px_rgba(0,0,0,0.5)] hover:border-white/20 hover:-translate-y-1 transition-all duration-300">
                          
                          {/* Visual Top */}
                          <div className="p-6 pb-4 border-b border-white/5 bg-white/5">
                             <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 border border-white/10 shadow-sm" style={{ backgroundColor: `${cases[activeCase].color}10` }}>
                                <Icon size={24} style={{ color: cases[activeCase].color }} />
                             </div>
                             <h3 className="font-bold text-white text-lg">{step.title}</h3>
                             <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">{step.subtitle}</p>
                          </div>

                          {/* Code Bottom (Terminal Look) */}
                          <div className="bg-[#020617] p-4 relative font-mono transition-colors duration-300">
                             <div className="flex items-center gap-2 mb-2 opacity-50">
                                <Terminal size={12} className="text-slate-500"/>
                                <span className="text-[10px] text-slate-500">PROCESS_OUTPUT</span>
                             </div>
                             <div className="text-xs text-slate-400 group-hover:text-emerald-400 block break-all leading-relaxed transition-colors duration-300">
                               <span className="text-purple-400">const</span> data = {step.code}
                             </div>
                          </div>

                       </div>
                    </motion.div>
                  );
                })}
             </motion.div>
           </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default UseCases;