import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle2, Lock, Server, Database, Activity, Fingerprint, Hash, Zap } from 'lucide-react'; 

// --- SUB-COMPONENTS ---

// 1. Bakgrundspartiklar för atmosfär
const ParticleField = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute bg-blue-500/10 rounded-full blur-xl"
        style={{
          width: Math.random() * 150 + 50,
          height: Math.random() * 150 + 50,
          top: Math.random() * 100 + '%',
          left: Math.random() * 100 + '%',
        }}
        animate={{
          y: [0, -40, 0],
          x: [0, 20, 0],
          opacity: [0.2, 0.5, 0.2],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: Math.random() * 10 + 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

// 2. High-end Glass Node
const FloatingNode = ({ icon: Icon, title, subtitle, align = "left", active }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9, x: align === 'left' ? -20 : 20 }}
    animate={{ opacity: 1, scale: 1, x: 0 }}
    className={`absolute top-1/2 -translate-y-1/2 ${align === "left" ? "left-4 md:-left-16" : "right-4 md:-right-16"} 
      hidden md:flex flex-col items-center justify-center p-5 rounded-2xl 
      bg-[#0f172a]/60 backdrop-blur-xl border border-white/10 shadow-2xl z-10 w-40 h-44
      ${active ? 'shadow-[0_0_40px_-10px_rgba(59,130,246,0.4)] border-blue-500/30' : ''} transition-all duration-700`}
  >
    <div className={`relative w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-500 ${active ? 'bg-blue-500/20' : 'bg-slate-800/50'}`}>
        <Icon size={28} className={active ? "text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]" : "text-slate-500"} />
        {active && (
            <>
                <motion.div 
                    className="absolute inset-0 rounded-full border border-blue-400/50"
                    animate={{ scale: [1, 1.4], opacity: [1, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div 
                    className="absolute inset-0 rounded-full border border-cyan-400/30"
                    animate={{ scale: [1, 1.2], opacity: [0.5, 0] }}
                    transition={{ duration: 2, delay: 0.5, repeat: Infinity }}
                />
            </>
        )}
    </div>
    <div className="text-center">
      <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${active ? "text-white text-shadow-sm" : "text-slate-500"}`}>{title}</div>
      <div className="text-[10px] text-slate-400 font-mono">{subtitle}</div>
    </div>
  </motion.div>
);

// 3. Data Stream (Animerade paket istället för bara en linje)
const DataStream = ({ active, align = "left" }) => (
  <div className={`absolute top-1/2 -translate-y-1/2 ${align === "left" ? "left-[90px] w-[200px]" : "right-[90px] w-[200px]"} h-[2px] hidden md:block -z-10 overflow-visible`}>
    {/* Base Line - Svag */}
    <div className="absolute inset-0 bg-slate-800/30 rounded-full" />
    
    {/* Moving Data Packets */}
    <AnimatePresence>
        {active && (
            <>
                {/* Snabb stråle */}
                <motion.div 
                    className="absolute top-1/2 -translate-y-1/2 h-[3px] bg-gradient-to-r from-transparent via-blue-400 to-transparent blur-[1px]"
                    style={{ width: '40%' }}
                    initial={{ left: align === "left" ? "-40%" : "140%", opacity: 0 }}
                    animate={{ left: align === "left" ? "140%" : "-40%", opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                {/* Partikel */}
                <motion.div 
                    className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]"
                    initial={{ left: align === "left" ? "0%" : "100%" }}
                    animate={{ left: align === "left" ? "100%" : "0%" }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
            </>
        )}
    </AnimatePresence>
  </div>
);

// 4. Log Item with "Terminal" feel
const LogItem = ({ id, action, hash, status, delay }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, x: -10, scale: 0.95 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    transition={{ delay, type: "spring", stiffness: 400, damping: 25 }}
    className="group relative flex items-center justify-between p-3 mb-2 rounded-xl bg-[#0f172a]/80 border border-white/5 hover:border-white/20 transition-all overflow-hidden"
  >
    {/* Hover highlight */}
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    
    <div className="flex items-center gap-3 relative z-10">
      <div className={`p-2 rounded-lg ${status === 'secure' ? 'bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_-2px_rgba(16,185,129,0.3)]' : 'bg-blue-500/10 text-blue-400'}`}>
        {status === 'secure' ? <Lock size={14} /> : <Activity size={14} className="animate-pulse" />}
      </div>
      <div>
        <div className="text-[12px] font-semibold text-slate-200 tracking-tight">{action}</div>
        <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
            <Hash size={10} className="text-slate-600" /> {hash}
        </div>
      </div>
    </div>
    {status === 'secure' && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative z-10 p-1 bg-emerald-500/10 rounded-full">
            <CheckCircle2 size={14} className="text-emerald-500" />
        </motion.div>
    )}
  </motion.div>
);

// --- MAIN COMPONENT ---

const StripePhoneDemo = ({ activeStep = 0 }) => {
  const logRef = useRef(null);
  
  const [logs, setLogs] = useState([
    { id: 1, action: "auth.session_start", hash: "0x8a...f1", status: "secure" },
    { id: 2, action: "user.data_access", hash: "0x3c...b9", status: "secure" },
  ]);

  // Auto-scroll
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  // Demo Logic
  useEffect(() => {
    if (activeStep === 1) {
        if (!logs.find(l => l.id === 3)) {
            setLogs(prev => [
                { id: 3, action: "transaction.init", hash: "encrypting...", status: "processing" },
                ...prev
            ]);
        }
    } 
    
    if (activeStep === 2) {
        const processingLog = logs.find(l => l.id === 3 && l.status === 'processing');
        if (processingLog) {
            setTimeout(() => {
                setLogs(prev => prev.map(log => 
                    log.id === 3 ? { ...log, hash: "0x9d...e2", status: "secure" } : log
                ));
            }, 1200);
        }
    }
    
    if (activeStep === 0) {
        setLogs([
            { id: 1, action: "auth.session_start", hash: "0x8a...f1", status: "secure" },
            { id: 2, action: "user.data_access", hash: "0x3c...b9", status: "secure" },
        ]);
    }
  }, [activeStep]);

  return (
    <div className="relative w-full h-[600px] md:h-[700px] flex items-center justify-center overflow-visible">
      
      <ParticleField />

      {/* --- LEFT NODE (App) --- */}
      <FloatingNode 
        icon={Server} 
        title="Application" 
        subtitle="Source Origin" 
        align="left" 
        active={activeStep >= 1} 
      />
      <DataStream align="left" active={activeStep >= 1} />

      {/* --- CENTER: THE PHONE --- */}
      <motion.div
        className="relative z-20 w-[320px] h-[620px] bg-[#020617] rounded-[50px] border-[8px] border-[#1e293b] shadow-2xl overflow-hidden"
        style={{ boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.8)' }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Screen Reflection/Glare */}
        <div className="absolute top-0 right-0 w-full h-[60%] bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-40 rounded-t-[40px]"></div>

        {/* Dynamic Island / Notch */}
        <div className="absolute top-4 inset-x-0 z-50 flex justify-center">
            <motion.div 
                className="bg-black rounded-full h-8 flex items-center justify-center px-4 gap-3 shadow-lg border border-white/5"
                animate={{ width: activeStep === 1 ? 140 : 100 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                {activeStep === 1 && <Activity size={14} className="text-emerald-400 animate-pulse" />}
                <div className="w-16 h-1.5 bg-slate-800/50 rounded-full" />
                {activeStep === 1 && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />}
            </motion.div>
        </div>

        {/* --- SCREEN CONTENT --- */}
        <div className="h-full w-full bg-[#020617] flex flex-col font-sans text-white relative">
            
            {/* Header */}
            <div className="pt-16 px-6 pb-6 bg-gradient-to-b from-[#0f172a] to-[#020617] border-b border-white/5">
               <div className="flex justify-between items-center mb-8">
                   <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/30">
                           <Shield size={20} fill="currentColor" />
                       </div>
                       <div>
                           <div className="font-bold text-sm tracking-tight text-white">Veritas</div>
                           <div className="text-[10px] text-slate-400 font-medium">Enterprise Console</div>
                       </div>
                   </div>
                   <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor] transition-colors duration-500 ${activeStep === 1 ? 'bg-amber-400 text-amber-400 animate-pulse' : 'bg-emerald-500 text-emerald-500'}`}></div>
               </div>
               
               {/* Hero Card */}
               <div className="relative group perspective">
                   <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-1000 blur-md"></div>
                   <div className="relative bg-[#0f172a] p-5 rounded-2xl border border-white/10 overflow-hidden shadow-xl">
                       {/* Background Grid Pattern */}
                       <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                       
                       <div className="relative z-10 flex justify-between items-end">
                           <div>
                               <div className="text-[10px] text-blue-400 uppercase font-bold tracking-wider mb-2 flex items-center gap-1">
                                   <Lock size={10} /> Secured Events
                               </div>
                               <div className="text-4xl font-bold text-white tracking-tight flex items-baseline gap-1">
                                   <AnimatePresence mode="popLayout">
                                       <motion.span
                                         key={logs.filter(l => l.status === 'secure').length}
                                         initial={{ y: 10, opacity: 0 }}
                                         animate={{ y: 0, opacity: 1 }}
                                         className="inline-block bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400"
                                       >
                                         {logs.filter(l => l.status === 'secure').length + 842}
                                       </motion.span>
                                   </AnimatePresence>
                               </div>
                           </div>
                           <Fingerprint size={40} className="text-slate-700 opacity-50" />
                       </div>
                   </div>
               </div>
            </div>

            {/* Log Feed */}
            <div className="flex-1 px-4 py-4 relative overflow-hidden flex flex-col"> 
                <div className="flex items-center justify-between px-2 mb-3">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Live Ledger Feed</div>
                    <div className="text-[9px] font-mono text-slate-600 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        NET: ONLINE
                    </div>
                </div>
                
                <div className="relative flex-1">
                    {/* Scan Line Effect */}
                    <AnimatePresence>
                        {activeStep === 1 && (
                            <motion.div 
                                className="absolute inset-x-0 h-[2px] bg-cyan-400 shadow-[0_0_20px_2px_rgba(34,211,238,0.6)] z-20 pointer-events-none"
                                initial={{ top: 0, opacity: 0 }}
                                animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
                                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                            />
                        )}
                    </AnimatePresence>

                    {/* Scrollable List */}
                    <div ref={logRef} className="h-[300px] overflow-y-auto space-y-1 pr-1 pb-16 scroll-smooth no-scrollbar mask-image-bottom">
                        <AnimatePresence initial={false}>
                            {logs.map((log) => (
                                <LogItem key={log.id} {...log} delay={0.1} />
                            ))}
                        </AnimatePresence>
                    </div>
                    
                    {/* Bottom Fade Gradient */}
                    <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent pointer-events-none z-20"></div>
                </div>
            </div>

            {/* Bottom Processing Status */}
            <AnimatePresence>
                {activeStep === 1 && (
                    <motion.div 
                        initial={{ y: 40, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 40, opacity: 0, scale: 0.9 }}
                        className="absolute bottom-8 inset-x-6 bg-[#1e293b]/80 backdrop-blur-xl p-3.5 rounded-2xl border border-blue-500/20 shadow-2xl z-30 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3.5">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-30"></div>
                                <div className="relative p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full text-white shadow-lg">
                                    <Zap size={14} fill="currentColor"/>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-white tracking-wide">Encrypting Node</span>
                                <span className="text-[10px] text-blue-300 font-medium">Hashing Integrity...</span>
                            </div>
                        </div>
                        <div className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/30 px-2 py-1 rounded">
                            PROCESSING
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
      </motion.div>

      {/* --- RIGHT NODE (Ledger) --- */}
      <DataStream align="right" active={activeStep >= 2} />
      <FloatingNode 
        icon={Database} 
        title="Ledger" 
        subtitle="Immutable Proof" 
        align="right" 
        active={activeStep >= 2} 
      />

      {/* Background Glow behind the phone */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[700px] bg-blue-600/10 blur-[120px] -z-10 rounded-full pointer-events-none mix-blend-screen animate-pulse-slow"></div>

    </div>
  );
};

export default StripePhoneDemo;