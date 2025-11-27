import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// FIX: Lade till Activity i importen
import { Shield, CheckCircle2, Lock, Server, Database, ArrowRight, Fingerprint, FileJson, Hash, Activity } from 'lucide-react'; 

// --- SUB-COMPONENTS ---

// Ett "Flytande Kort" som representerar externa system (likt Stripes diagram)
const FloatingNode = ({ icon: Icon, title, subtitle, align = "left", active }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`absolute top-1/2 -translate-y-1/2 ${align === "left" ? "left-0 md:-left-12" : "right-0 md:-right-12"} 
      hidden md:flex items-center gap-3 p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl z-10 w-48`}
  >
    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${active ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-slate-800 text-slate-500'} transition-all duration-500`}>
      <Icon size={20} />
    </div>
    <div>
      <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">{title}</div>
      <div className="text-[10px] text-slate-500 font-mono">{subtitle}</div>
    </div>
  </motion.div>
);

// Animerad anslutningslinje
const ConnectionLine = ({ active, align = "left" }) => (
  <div className={`absolute top-1/2 -translate-y-1/2 ${align === "left" ? "left-[140px] w-[120px]" : "right-[140px] w-[120px]"} h-[2px] bg-slate-800 hidden md:block -z-10 overflow-hidden`}>
    <motion.div 
      className="w-full h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"
      initial={{ x: align === "left" ? "-100%" : "100%" }}
      animate={{ x: active ? "0%" : (align === "left" ? "-100%" : "100%") }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    />
  </div>
);

const LogItem = ({ id, action, hash, status, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="flex items-center justify-between p-3 mb-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
  >
    <div className="flex items-center gap-3">
      <div className={`p-1.5 rounded-lg ${status === 'secure' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
        {status === 'secure' ? <Lock size={12} /> : <Activity size={12} className="animate-pulse" />}
      </div>
      <div>
        <div className="text-[11px] font-medium text-white">{action}</div>
        <div className="text-[9px] text-slate-500 font-mono">{hash}</div>
      </div>
    </div>
    {status === 'secure' && <CheckCircle2 size={14} className="text-emerald-500" />}
  </motion.div>
);

// --- MAIN COMPONENT ---

const StripePhoneDemo = ({ activeStep = 0 }) => {
  const logRef = useRef(null);
  
  const [logs, setLogs] = useState([
    { id: 1, action: "auth.login_success", hash: "0x8a...f1", status: "secure" },
    { id: 2, action: "data.export_req", hash: "0x3c...b9", status: "secure" },
  ]);

  // Scroll to bottom when a new log arrives
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  // Simulate incoming new log when step 1 is active
  useEffect(() => {
    if (activeStep === 1) {
        // Add a "Processing" log (if it doesn't exist)
        if (!logs.find(l => l.id === 3)) {
            setLogs(prev => [
                { id: 3, action: "payment.authorized", hash: "hashing...", status: "processing" },
                ...prev
            ]);
        }
    } 
    
    if (activeStep === 2) {
        // Change to "Secure" after a delay
        const processingLog = logs.find(l => l.id === 3 && l.status === 'processing');
        if (processingLog) {
            setTimeout(() => {
                setLogs(prev => prev.map(log => 
                    log.id === 3 ? { ...log, hash: "0x9d...e2", status: "secure" } : log
                ));
            }, 800);
        }
    }
    
    // Reset logic for demo loops (when returning to intro step)
    if (activeStep === 0) {
        setLogs([
            { id: 1, action: "auth.login_success", hash: "0x8a...f1", status: "secure" },
            { id: 2, action: "data.export_req", hash: "0x3c...b9", status: "secure" },
        ]);
    }
  }, [activeStep]);

  return (
    <div className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center">
      
      {/* --- LEFT NODE: SOURCE (Server/App) --- */}
      <FloatingNode 
        icon={Server} 
        title="Your App" 
        subtitle="sending event..." 
        align="left" 
        active={activeStep >= 1} 
      />
      <ConnectionLine align="left" active={activeStep >= 1} />

      {/* --- CENTER: THE PHONE --- */}
      <motion.div
        className="relative z-20 w-[280px] h-[540px] md:w-[300px] md:h-[580px] bg-[#0b0e14] rounded-[40px] border-[6px] border-[#1e293b] shadow-2xl overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Notch & Status Bar */}
        <div className="absolute top-0 inset-x-0 h-7 bg-black z-30 rounded-t-[32px] flex justify-center">
            <div className="w-24 h-5 bg-[#1e293b] rounded-b-xl"></div>
        </div>

        {/* App Header */}
        <div className="pt-10 px-5 pb-4 bg-gradient-to-b from-slate-900 to-[#0b0e14]">
           <div className="flex justify-between items-center mb-4">
               <div className="flex items-center gap-2">
                   <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                       <Shield size={16} fill="currentColor" />
                   </div>
                   <span className="font-bold text-white text-sm tracking-tight">Auditor</span>
               </div>
               <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"></div>
           </div>
           
           {/* Dashboard Summary Card */}
           <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-2xl border border-white/5 mb-2 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-3 opacity-20">
                   <Fingerprint size={64} className="text-white" />
               </div>
               <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Secured Events</div>
               <div className="text-2xl font-bold text-white mb-1">
                   <AnimatePresence mode="wait">
                       <motion.span
                         key={logs.filter(l => l.status === 'secure').length} // Track secure logs
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                       >
                         {logs.filter(l => l.status === 'secure').length + 12840} {/* Base event count */}
                       </motion.span>
                   </AnimatePresence>
               </div>
               <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                   <CheckCircle2 size={10} /> Immutable Ledger
               </div>
           </div>
        </div>

        {/* Main Content: Activity Feed (STOPPAR SCROLL PÅ HELA SIDAN) */}
        <div className="px-4 pb-4 relative h-[300px] overflow-hidden"> 
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 pl-1">Real-time Audit Trail</div>
            
            {/* Log List Container med intern scroll */}
            <div ref={logRef} className="space-y-2 h-[260px] overflow-y-auto pr-1">
                <AnimatePresence>
                    {/* Loggar visas i omvänd ordning (senaste överst) */}
                    {logs.map((log, i) => (
                        <LogItem key={log.id} {...log} delay={0.05} />
                    )).reverse()}
                </AnimatePresence>
            </div>

            {/* Processing Overlay (Visual effect when hashing) */}
            <AnimatePresence>
                {activeStep === 1 && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-x-4 bottom-4 bg-blue-600/90 backdrop-blur-md rounded-xl p-3 flex items-center justify-between shadow-lg z-20 border border-white/10"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg animate-spin">
                                <Hash size={14} className="text-white" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-white">Encrypting...</div>
                                <div className="text-[9px] text-blue-100">Generating Merkle Leaf</div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Scroll Fade Bottom */}
            <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-[#0b0e14] to-transparent pointer-events-none"></div>
        </div>

        {/* Bottom Nav */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-[#0b0e14]/90 backdrop-blur-md border-t border-white/5 flex justify-around items-center px-6 z-30">
            <div className="flex flex-col items-center gap-1 opacity-100">
                <Activity size={18} className="text-blue-500" />
                <div className="w-1 h-1 bg-blue-500 rounded-full mt-1"></div>
            </div>
            <div className="flex flex-col items-center gap-1 opacity-40">
                <Database size={18} className="text-slate-400" />
            </div>
            <div className="flex flex-col items-center gap-1 opacity-40">
                <FileJson size={18} className="text-slate-400" />
            </div>
        </div>

      </motion.div>

      {/* --- RIGHT NODE: DESTINATION (Ledger) --- */}
      <ConnectionLine align="right" active={activeStep >= 2} />
      <FloatingNode 
        icon={Database} 
        title="Ledger" 
        subtitle="Immutable Proof" 
        align="right" 
        active={activeStep >= 2} 
      />

      {/* Glow Effect behind phone */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[600px] bg-blue-500/10 blur-[80px] -z-10 rounded-full pointer-events-none"></div>

    </div>
  );
};

export default StripePhoneDemo;