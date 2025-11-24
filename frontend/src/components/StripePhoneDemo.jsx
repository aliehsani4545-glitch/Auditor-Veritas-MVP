import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle2, Terminal, Wifi, Lock, Cpu, Activity, Fingerprint } from 'lucide-react';

const StripePhoneDemo = ({ activeStep = 0 }) => {
  const [bootSequence, setBootSequence] = useState(0);

  // Boot sequence logic
  useEffect(() => {
    const s1 = setTimeout(() => setBootSequence(1), 500); // Wireframe
    const s2 = setTimeout(() => setBootSequence(2), 1500); // Nodes connecting
    const s3 = setTimeout(() => setBootSequence(3), 2500); // Full UI
    return () => { clearTimeout(s1); clearTimeout(s2); clearTimeout(s3); };
  }, []);

  return (
    // WRAPPER: Skalar ner telefonen på mobiler (0.8) och upp på desktop (1.0)
    <div className="relative w-full h-[600px] md:h-[700px] flex items-center justify-center perspective-[1200px] overflow-visible scale-[0.8] sm:scale-90 md:scale-100 origin-center">
      
      {/* 3D FLOATING DEVICE */}
      <motion.div
        initial={{ rotateX: 20, rotateY: -20, opacity: 0 }}
        animate={{ rotateX: 0, rotateY: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative z-20 bg-[#0f172a] rounded-[48px] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)] border-[8px] border-[#1e293b] overflow-hidden w-[340px] h-[660px]"
      >
        {/* Dynamic Notch */}
        <div className="absolute top-0 w-full h-8 bg-[#1e293b] z-40 flex justify-center items-end pb-1.5 rounded-b-3xl">
          <div className="w-24 h-5 bg-black rounded-full flex items-center justify-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-blue-900/50"></div>
             <div className="w-12 h-1.5 rounded-full bg-blue-900/30"></div>
          </div>
        </div>

        {/* --- PHASE 1 & 2: GENERATIVE WIREFRAME --- */}
        <AnimatePresence>
          {bootSequence < 3 && (
            <motion.div 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#020617] z-30 flex flex-col items-center justify-center"
            >
               {/* Grid */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>

               {/* Nodes */}
               <div className="relative w-64 h-96">
                  <motion.div className="absolute top-10 left-10 w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_20px_#3b82f6]" animate={{ scale: [0,1] }} />
                  <motion.div className="absolute bottom-20 right-10 w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_20px_#10b981]" animate={{ scale: [0,1] }} transition={{ delay: 0.3 }} />
                  <motion.div className="absolute top-1/2 left-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_30px_white]" animate={{ scale: [0,1] }} transition={{ delay: 0.6 }} />
                  
                  {/* Connecting Lines */}
                  <svg className="absolute inset-0 w-full h-full overflow-visible">
                     <motion.path d="M 50 50 L 128 192" stroke="#3b82f6" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
                     <motion.path d="M 206 324 L 128 192" stroke="#10b981" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3 }} />
                  </svg>
               </div>

               <div className="absolute bottom-20 text-center w-full">
                  <motion.div 
                    className="text-blue-400 font-mono text-[10px] tracking-widest uppercase"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    INITIALIZING CORE...
                  </motion.div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- PHASE 3: LIVE APP UI --- */}
        <div className="pt-14 px-6 h-full relative bg-slate-50">
          
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#0a2540] flex items-center justify-center shadow-lg text-white">
                   <Shield size={14} />
                </div>
                <span className="font-bold text-slate-800 text-sm">Veritas App</span>
             </div>
             <Activity size={16} className="text-emerald-500 animate-pulse"/>
          </div>

          <AnimatePresence mode="wait">
             
             {/* STEP 1: CONSOLE LOG */}
             {activeStep === 0 && (
               <motion.div 
                 key="step1"
                 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
                 className="space-y-4"
               >
                  <div className="bg-[#0f172a] rounded-xl p-4 shadow-xl border border-slate-700">
                     <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
                        <Terminal size={12} className="text-slate-400"/>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Live Debugger</span>
                     </div>
                     <div className="font-mono text-[10px] space-y-2">
                        <div className="flex gap-2"><span className="text-slate-500">12:01:42</span> <span className="text-blue-400">CONNECTING...</span></div>
                        <div className="flex gap-2"><span className="text-slate-500">12:01:43</span> <span className="text-emerald-400">TLS HANDSHAKE OK</span></div>
                        <div className="flex gap-2"><span className="text-slate-500">12:01:43</span> <span className="text-white">WAITING FOR EVENT</span></div>
                     </div>
                  </div>
                  
                  <div className="flex items-center justify-center py-8">
                     <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full relative z-10"></div>
                     </div>
                  </div>
               </motion.div>
             )}

             {/* STEP 2: BIOMETRIC SCAN */}
             {activeStep === 1 && (
               <motion.div 
                 key="step2"
                 initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.1, opacity: 0 }}
                 className="h-full flex flex-col items-center pt-10"
               >
                  <div className="relative w-40 h-40 mb-8">
                     <svg className="absolute inset-0 w-full h-full animate-spin-slow">
                        <circle cx="80" cy="80" r="78" stroke="#e2e8f0" strokeWidth="2" fill="none" />
                        <circle cx="80" cy="80" r="78" stroke="#3b82f6" strokeWidth="2" fill="none" strokeDasharray="100 400" strokeLinecap="round" />
                     </svg>
                     
                     <div className="absolute inset-0 flex items-center justify-center">
                        <Fingerprint size={64} className="text-slate-800" />
                     </div>

                     <motion.div 
                       className="absolute left-0 right-0 h-1 bg-blue-500/50 shadow-[0_0_15px_#3b82f6]"
                       animate={{ top: ["10%", "90%", "10%"] }}
                       transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                     />
                  </div>
                  
                  <h3 className="font-bold text-slate-900 text-xl mb-2">Face ID Required</h3>
                  <p className="text-slate-500 text-xs text-center px-8 mb-8">
                     Veritas requires biometric authentication to access the secure ledger for <strong className="text-slate-800">Project Alpha</strong>.
                  </p>
               </motion.div>
             )}

             {/* STEP 3: SUCCESS DASHBOARD */}
             {activeStep === 2 && (
               <motion.div 
                 key="step3"
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                 className="space-y-4"
               >
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 text-center">
                     <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 size={24} className="text-emerald-600" />
                     </div>
                     <h2 className="text-2xl font-bold text-slate-900">Hash Secured</h2>
                     <p className="text-slate-500 text-xs mt-1">Block #921 anchored to ledger</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                     <div className="p-4 border-b border-slate-50 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase">Transaction ID</span>
                        <span className="text-xs font-mono text-slate-800">TX_8921A</span>
                     </div>
                     <div className="p-4 bg-slate-50/50">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-xs text-slate-500">Status</span>
                           <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase">Confirmed</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-xs text-slate-500">Timestamp</span>
                           <span className="text-xs text-slate-800 font-mono">14:02:11 UTC</span>
                        </div>
                     </div>
                  </div>
               </motion.div>
             )}

          </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
};

export default StripePhoneDemo;