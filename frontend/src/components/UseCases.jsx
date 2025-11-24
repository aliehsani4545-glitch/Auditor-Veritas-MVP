import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Activity, ShoppingCart, Lock, Server, FileCheck, Code2, Terminal, ArrowRight, ShieldAlert, Eye } from 'lucide-react';
import { DarkAuroraBackground } from './SharedBackgrounds';

const UseCases = () => {
  const [activeCase, setActiveCase] = useState('fintech');

  const cases = {
    fintech: {
      label: "Fintech",
      color: "#60a5fa", // Blue-400
      badge: "ISO 20022",
      desc: "Immutable audit trails for high-value transactions. We don't process payments; we prove they happened exactly as recorded.",
      pipeline: [
        { icon: CreditCard, title: "Transaction Event", subtitle: "Source System", code: `PAYMENT_GATEWAY: { "tx_id": "tx_902", "amt": 5000 }` },
        { icon: ShieldAlert, title: "Compliance Log", subtitle: "Veritas API", code: `veritas.log("tx_cleared", { hash: "sha256(tx_902)" })` },
        { icon: FileCheck, title: "Audit Proof", subtitle: "Ledger Anchor", code: `PROOF: { "block": 912, "merkle_root": "0x9f...a2" }` }
      ]
    },
    health: {
      label: "Healthcare",
      color: "#f472b6", // Pink-400
      badge: "HIPAA",
      desc: "Track access to sensitive records. We don't store patient data; we store the cryptographic proof of who accessed it and when.",
      pipeline: [
        { icon: Activity, title: "Access Request", subtitle: "EHR System", code: `USER: "Dr_Smith" REQUESTS "Patient_X_Record"` },
        { icon: Eye, title: "Access Log", subtitle: "Veritas API", code: `veritas.log("record_viewed", { actor: "dr_smith", ref: "pat_x" })` },
        { icon: Lock, title: "Tamper-Evident Seal", subtitle: "Security", code: `SEALED: "2023-11-24T14:00:00Z" (Cannot be deleted)` }
      ]
    },
    retail: {
      label: "Supply Chain",
      color: "#22d3ee", // Cyan-400
      badge: "Provenance",
      desc: "Verify chain of custody. Prove exactly when an item changed hands without relying on a central database administrator.",
      pipeline: [
        { icon: ShoppingCart, title: "Handover Scan", subtitle: "IoT Device", code: `SCANNER: { "sku": "X15", "location": "Warehouse_B" }` },
        { icon: Server, title: "Custody Sign", subtitle: "Smart Contract", code: `veritas.sign("custody_transfer", { from: "A", to: "B" })` },
        { icon: FileCheck, title: "Ownership Proof", subtitle: "Public Key", code: `VERIFIED: Signature matches Warehouse_B public key` }
      ]
    }
  };

  const activeData = cases[activeCase];

  return (
    <div className="bg-[#020617] py-24 md:py-32 relative overflow-hidden text-white border-t border-white/5">
      {/* DEN MÖRKA AURORAN (Interaktiv bakgrund) */}
      <DarkAuroraBackground />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <div className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-400 backdrop-blur-md">
                 Use Cases
               </div>
               <div className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md" style={{ color: activeData.color }}>
                 {activeData.badge} Compliant
               </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
              Truth for every <span className="border-b-2 border-dashed pb-1" style={{ borderColor: activeData.color, color: activeData.color }}>workflow</span>.
            </h2>
            <p className="text-slate-400 max-w-lg text-lg leading-relaxed">
              {activeData.desc}
            </p>
          </div>
          
          {/* Interaktiv Väljare */}
          <div className="bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-lg flex gap-1 z-20 shadow-2xl overflow-x-auto">
             {Object.keys(cases).map(key => (
               <button
                 key={key}
                 onClick={() => setActiveCase(key)}
                 className={`px-6 py-3 rounded-lg text-sm font-bold transition-all duration-300 relative whitespace-nowrap ${
                   activeCase === key 
                     ? 'text-white shadow-inner border border-white/10' 
                     : 'text-slate-500 hover:text-white hover:bg-white/5'
                 }`}
               >
                 {activeCase === key && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white/10 rounded-lg"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                 )}
                 <span className="relative z-10">{cases[key].label}</span>
               </button>
             ))}
          </div>
        </div>

        {/* PIPELINE VISUALIZATION */}
        <div className="relative min-h-[400px]">
           
           {/* Connection Line (Glödande Rör) */}
           <div className="absolute top-[80px] left-[10%] right-[10%] h-[2px] bg-white/5 rounded-full hidden md:block" />
           <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-white/5 -translate-x-1/2 rounded-full md:hidden" />

           <AnimatePresence mode="wait">
             <motion.div 
               key={activeCase}
               className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               transition={{ duration: 0.4 }}
             >
                {activeData.pipeline.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <motion.div 
                      key={i}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.15 }}
                      className="relative"
                    >
                       {/* Animated Beam (Data Packet) */}
                       {i < 2 && (
                         <div className="hidden md:block absolute top-[80px] left-[50%] w-full h-[2px] z-0 overflow-hidden">
                            <motion.div 
                              className="w-20 h-full bg-gradient-to-r from-transparent via-current to-transparent opacity-80 blur-[1px]"
                              style={{ color: activeData.color }}
                              animate={{ x: ["-100%", "250%"] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 0.5 + (i*0.5) }}
                            />
                         </div>
                       )}

                       {/* NODE CARD - Mörk & Glasig */}
                       <div className="bg-[#0f172a]/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/10 p-1 overflow-hidden group hover:shadow-[0_0_40px_rgba(0,0,0,0.5)] hover:border-white/20 hover:-translate-y-1 transition-all duration-300">
                          
                          {/* Visual Top */}
                          <div className="p-6 pb-4 border-b border-white/5 bg-white/[0.02]">
                             <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 border border-white/10 shadow-sm" style={{ backgroundColor: `${activeData.color}10` }}>
                                <Icon size={24} style={{ color: activeData.color }} />
                             </div>
                             <h3 className="font-bold text-white text-lg">{step.title}</h3>
                             <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">{step.subtitle}</p>
                          </div>

                          {/* Code Bottom (Terminal Look) */}
                          <div className="bg-[#020617] p-4 relative font-mono transition-colors duration-300 group-hover:bg-[#050a14]">
                             <div className="flex items-center gap-2 mb-2 opacity-50">
                                <Terminal size={12} className="text-slate-500"/>
                                <span className="text-[10px] text-slate-500">RAW_LOG</span>
                             </div>
                             <div className="text-xs text-slate-400 group-hover:text-slate-200 block break-all leading-relaxed transition-colors duration-300">
                               {step.code}
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