import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Activity, ShoppingCart, Lock, Server, FileCheck, Terminal, ShieldAlert, Eye } from 'lucide-react';

// Flyttade stilen till en enkel blockkommentar (Bättre än att använda document.head i React)
/*
const style = document.createElement('style');
style.textContent = `
  @keyframes shine {
    from { background-position: 0% 0%; }
    to { background-position: 200% 0%; }
  }
  .animate-shine {
    background-size: 200% auto;
    animation: shine 3s linear infinite;
  }
`;
*/

const UseCases = () => {
  const [activeCase, setActiveCase] = useState('fintech');

  const cases = {
    fintech: {
      label: "Fintech",
      color: "#3b82f6", // Blue-500
      badge: "ISO 20022",
      desc: "Immutable audit trails for high-value transactions. We don't process payments; we prove they happened exactly as recorded.",
      pipeline: [
        { icon: CreditCard, title: "Transaction Event", subtitle: "Source System", code: `PAYMENT_GATEWAY: { "tx_id": "tx_902", "amt": 5000 }` },
        { icon: ShieldAlert, title: "Compliance Log", subtitle: "EuroLedger API", code: `euroledger.log("tx_cleared", { hash: "sha256(tx_902)" })` },
        { icon: FileCheck, title: "Audit Proof", subtitle: "Ledger Anchor", code: `PROOF: { "block": 912, "merkle_root": "0x9f...a2" }` }
      ]
    },
    health: {
      label: "Healthcare",
      color: "#ec4899", // Pink-500
      badge: "HIPAA",
      desc: "Track access to sensitive records. We don't store patient data; we store the cryptographic proof of who accessed it and when.",
      pipeline: [
        { icon: Activity, title: "Access Request", subtitle: "EHR System", code: `USER: "Dr_Smith" REQUESTS "Patient_X_Record"` },
        { icon: Eye, title: "Access Log", subtitle: "EuroLedger API", code: `euroledger.log("record_viewed", { actor: "dr_smith", ref: "pat_x" })` },
        { icon: Lock, title: "Tamper-Evident Seal", subtitle: "Security", code: `SEALED: "2023-11-24T14:00:00Z" (Cannot be deleted)` }
      ]
    },
    retail: {
      label: "Supply Chain",
      color: "#06b6d4", // Cyan-500
      badge: "Provenance",
      desc: "Verify chain of custody. Prove exactly when an item changed hands without relying on a central database administrator.",
      pipeline: [
        { icon: ShoppingCart, title: "Handover Scan", subtitle: "IoT Device", code: `SCANNER: { "sku": "X15", "location": "Warehouse_B" }` },
        { icon: Server, title: "Custody Sign", subtitle: "Smart Contract", code: `euroledger.sign("custody_transfer", { from: "A", to: "B" })` },
        { icon: FileCheck, title: "Ownership Proof", subtitle: "Public Key", code: `VERIFIED: Signature matches Warehouse_B public key` }
      ]
    }
  };

  const activeData = cases[activeCase];

  return (
    <div className="bg-slate-50 pt-16 pb-16 md:pt-24 md:pb-24 relative overflow-hidden text-slate-900 border-t border-slate-200">
      
      {/* Dekorativ bakgrundsgrafik */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-[80px] opacity-60 mix-blend-overlay pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <div className="px-3 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-500 shadow-sm">
                 Use Cases
               </div>
               <div className="px-3 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-bold uppercase tracking-widest shadow-sm transition-colors duration-300" style={{ color: activeData.color }}>
                 {activeData.badge} Compliant
               </div>
            </div>
            
            {/* HÄR ÄR FLASH-EFFEKTEN PÅ RUBRIKEN */}
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">
              Truth for every <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-shine pb-1">
                workflow.
              </span>
            </h2>
            
            <p className="text-slate-600 max-w-lg text-lg leading-relaxed">
              {activeData.desc}
            </p>
          </div>
          
          {/* Interaktiv Väljare */}
          <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex gap-1 z-20 overflow-x-auto">
             {Object.keys(cases).map(key => (
               <button
                 key={key}
                 onClick={() => setActiveCase(key)}
                 className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 relative whitespace-nowrap z-10 ${
                   activeCase === key 
                     ? 'text-slate-900' 
                     : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                 }`}
               >
                 {activeCase === key && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute inset-0 bg-slate-100 rounded-lg border border-slate-200 shadow-sm"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                 )}
                 <span className="relative z-10">{cases[key].label}</span>
               </button>
             ))}
          </div>
        </div>

        {/* PIPELINE VISUALIZATION */}
        <div className="relative min-h-[350px]">
           
           {/* Connection Line */}
           <div className="absolute top-[80px] left-[10%] right-[10%] h-[2px] bg-slate-200 rounded-full hidden md:block" />
           <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-slate-200 -translate-x-1/2 rounded-full md:hidden" />

           <AnimatePresence mode="wait">
             <motion.div 
               key={activeCase}
               className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.3 }}
             >
                {activeData.pipeline.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <motion.div 
                      key={i}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="relative"
                    >
                       {/* Animated Beam */}
                       {i < 2 && (
                         <div className="hidden md:block absolute top-[80px] left-[50%] w-full h-[2px] z-0 overflow-hidden">
                            <motion.div 
                              className="w-20 h-full bg-slate-400 blur-[2px]"
                              animate={{ x: ["-100%", "250%"] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.5 + (i*0.5) }}
                            />
                         </div>
                       )}

                       {/* NODE CARD - VIT med MÖRK kodterminal */}
                       <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                         
                         {/* Visual Top (White) */}
                         <div className="p-6 border-b border-slate-100">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 border border-slate-100 shadow-sm transition-colors duration-300" style={{ backgroundColor: `${activeData.color}15` }}>
                               <Icon size={24} style={{ color: activeData.color }} />
                            </div>
                            <h3 className="font-bold text-slate-900 text-lg">{step.title}</h3>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">{step.subtitle}</p>
                         </div>

                         {/* Code Bottom (Dark Terminal) */}
                         <div className="bg-[#1e293b] p-4 relative font-mono text-left">
                            <div className="flex items-center gap-1.5 mb-2 opacity-60">
                               <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
                               <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></div>
                               <div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div>
                               <span className="ml-2 text-[10px] text-slate-400">json</span>
                            </div>
                            <div className="text-xs text-slate-300 block break-all leading-relaxed font-medium">
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