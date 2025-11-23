import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Lock, Database, Globe, Server, Shield, Cpu, Wifi, Activity, CheckCircle2, ArrowDown, FileJson, Hash, Link } from 'lucide-react';

const PhoneDemo = () => {
  const [bootState, setBootState] = useState('init'); // init, constructing, booting, active
  const [activeTab, setActiveTab] = useState(0);

  // Den stora start-sekvensen
  useEffect(() => {
    // 1. Noder dyker upp
    setTimeout(() => setBootState('constructing'), 500);
    // 2. Ramen ritas klart, systemet bootar
    setTimeout(() => setBootState('booting'), 3500);
    // 3. UI är redo
    setTimeout(() => setBootState('active'), 5500);
  }, []);

  // Loopa flikarna när systemet är aktivt
  useEffect(() => {
    if (bootState !== 'active') return;
    const interval = setInterval(() => {
      setActiveTab(prev => (prev + 1) % 3);
    }, 6000); // 6 sekunder per flik
    return () => clearInterval(interval);
  }, [bootState]);

  return (
    <div className="relative w-[380px] h-[750px] mx-auto perspective-[1200px] flex items-center justify-center">
      
      {/* --- 1. THE CONSTRUCTORS (Nodes) --- */}
      <AnimatePresence>
        {(bootState === 'init' || bootState === 'constructing') && (
          <>
            {/* Left Node: Network */}
            <FloatingConstructor icon={Globe} x={-140} y={-100} color="#3b82f6" label="Global API" delay={0} />
            <ConnectionLine x1={50} y1={250} x2={190} y2={375} color="#3b82f6" delay={0.5} />

            {/* Right Node: Server */}
            <FloatingConstructor icon={Server} x={140} y={-50} color="#8b5cf6" label="Ireland EU" delay={0.2} />
            <ConnectionLine x1={330} y1={300} x2={190} y2={375} color="#8b5cf6" delay={0.7} />

            {/* Bottom Node: Security */}
            <FloatingConstructor icon={Shield} x={0} y={160} color="#10b981" label="HSM Module" delay={0.4} />
            <ConnectionLine x1={190} y1={510} x2={190} y2={375} color="#10b981" delay={0.9} />
          </>
        )}
      </AnimatePresence>

      {/* --- 2. THE DEVICE --- */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative z-20 w-[320px] h-[650px] transform-style-3d"
      >
        {/* Wireframe Drawing Effect */}
        <svg className="absolute -inset-[2px] w-[101%] h-[101%] z-50 pointer-events-none overflow-visible">
           <motion.rect 
             width="100%" height="100%" rx="45" 
             fill="none" stroke="url(#gradient)" strokeWidth="4"
             initial={{ pathLength: 0, opacity: 0 }}
             animate={bootState === 'constructing' ? { pathLength: 1, opacity: 1 } : { pathLength: 1, opacity: 0 }}
             transition={{ duration: 2.5, ease: "easeInOut" }}
           />
           <defs>
             <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
               <stop offset="0%" stopColor="#3b82f6" />
               <stop offset="100%" stopColor="#10b981" />
             </linearGradient>
           </defs>
        </svg>

        {/* Physical Body */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: bootState === 'constructing' ? 0.1 : 1 }}
          className="absolute inset-0 bg-[#020617] rounded-[42px] border-[6px] border-slate-800 shadow-2xl overflow-hidden flex flex-col"
        >
          
          {/* Dynamic Island Header */}
          <div className="h-14 bg-slate-950/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6 pt-3 z-30">
            <div className="flex gap-2 items-center">
               <div className={`w-2 h-2 rounded-full ${bootState === 'active' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-yellow-500'}`}></div>
               <span className="text-[10px] font-mono text-slate-400 tracking-widest font-bold">KERNEL_V3</span>
            </div>
            <Wifi className="w-4 h-4 text-slate-600" />
          </div>

          {/* SCREEN CONTENT */}
          <div className="flex-1 relative bg-slate-950 p-5 flex flex-col">
            
            {/* BOOT SEQUENCE */}
            {bootState === 'booting' && (
              <div className="h-full flex flex-col items-center justify-center font-mono text-xs space-y-2">
                 <Cpu className="w-12 h-12 text-blue-500 animate-pulse mb-4" />
                 <Typewriter text="> Initializing Auditor Core..." delay={0} />
                 <Typewriter text="> Loading Encryption Modules..." delay={500} />
                 <Typewriter text="> Connecting to Merkle Root..." delay={1000} />
                 <Typewriter text="> SYSTEM READY." delay={1500} color="text-emerald-400" />
              </div>
            )}

            {/* ACTIVE DASHBOARD */}
            {bootState === 'active' && (
              <>
                {/* Tab Navigation */}
                <div className="flex p-1 bg-slate-900 rounded-xl mb-6 border border-slate-800">
                  {['Ingest', 'Encrypt', 'Ledger'].map((t, i) => (
                    <div key={i} className={`flex-1 py-2 text-[10px] font-bold uppercase text-center rounded-lg transition-all ${i === activeTab ? 'bg-[#635bff] text-white shadow-lg' : 'text-slate-500'}`}>
                      {t}
                    </div>
                  ))}
                </div>

                <div className="flex-1 relative">
                   <AnimatePresence mode="wait">
                      
                      {/* 1. INGESTION (Code View with PII Detection) */}
                      {activeTab === 0 && (
                        <motion.div key="tab0" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-4">
                          <div className="flex justify-between items-center">
                             <h3 className="text-xs font-bold text-white flex items-center gap-2">
                               <FileJson className="w-3 h-3 text-blue-400"/> Payload Analysis
                             </h3>
                             <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">Scanning</span>
                          </div>
                          
                          <div className="bg-[#0d1117] p-4 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-300 leading-relaxed relative overflow-hidden group">
                            {/* Scanning Line Animation */}
                            <motion.div 
                              className="absolute top-0 left-0 w-full h-[2px] bg-blue-500/50 shadow-[0_0_10px_#3b82f6]"
                              animate={{ top: ["0%", "100%"] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                            
                            <span className="text-purple-400">POST</span> /v1/events/log <br/>
                            <div className="pl-2 border-l border-slate-700 mt-1">
                              <span className="text-slate-500">"event":</span> <span className="text-emerald-300">"user_login"</span>,<br/>
                              <span className="text-slate-500">"timestamp":</span> 1715629...,<br/>
                              
                              {/* Highlighted PII Data */}
                              <div className="relative inline-block my-1">
                                <span className="text-slate-500">"user_id":</span> 
                                <span className="text-white bg-red-500/20 px-1 rounded mx-1 border border-red-500/30">"user_123"</span>
                                <motion.div 
                                  initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 1.5}}
                                  className="absolute -right-16 top-0 text-[8px] text-red-400 font-bold bg-slate-900 px-1 border border-red-900 rounded"
                                >
                                  PII DETECTED
                                </motion.div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 p-3 bg-slate-900 rounded-lg border border-slate-800">
                            <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
                            <span className="text-[10px] text-slate-400">Identifying sensitive fields...</span>
                          </div>
                        </motion.div>
                      )}

                      {/* 2. ENCRYPTION (Data Transformation) */}
                      {activeTab === 1 && (
                        <motion.div key="tab1" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0}} className="h-full flex flex-col items-center justify-center pb-10">
                           
                           {/* Transformation Container */}
                           <div className="w-full bg-slate-900 rounded-xl border border-slate-800 p-4 mb-6 relative overflow-hidden">
                             <div className="flex justify-between text-[10px] text-slate-500 mb-2 font-mono uppercase">
                               <span>Input</span>
                               <span>Output</span>
                             </div>
                             <div className="flex items-center justify-between font-mono text-sm">
                               <div className="text-slate-300">user_123</div>
                               <ArrowDown className="rotate-[-90deg] text-[#635bff]" size={16}/>
                               <motion.div 
                                 initial={{ opacity: 0, filter: "blur(4px)" }}
                                 animate={{ opacity: 1, filter: "blur(0px)" }}
                                 transition={{ duration: 0.5, delay: 0.5 }}
                                 className="text-emerald-400 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-500/30"
                               >
                                 0x8F92...
                               </motion.div>
                             </div>
                             
                             {/* Processing Bar */}
                             <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                               <motion.div 
                                 initial={{ width: "0%" }} 
                                 animate={{ width: "100%" }} 
                                 transition={{ duration: 1.5, repeat: Infinity }} 
                                 className="h-full bg-[#635bff]" 
                               />
                             </div>
                           </div>

                           <div className="relative w-24 h-24 flex items-center justify-center">
                             {/* Pulsing Shield */}
                             <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-[#635bff]/10 rounded-full blur-xl" />
                             <Shield className="w-12 h-12 text-[#635bff]" />
                             <div className="absolute -bottom-1 -right-1 bg-slate-900 p-1 rounded-full border border-slate-700">
                               <Lock size={12} className="text-emerald-500" />
                             </div>
                           </div>

                           <div className="mt-6 text-center">
                             <h4 className="text-xs font-bold text-white mb-1">Zero-Knowledge Hashing</h4>
                             <p className="text-[10px] text-slate-500 px-6">Converting PII to irreversible hash using Salted SHA-256 before storage.</p>
                           </div>
                        </motion.div>
                      )}

                      {/* 3. LEDGER (Chained Blocks) */}
                      {activeTab === 2 && (
                        <motion.div key="tab2" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="space-y-4">
                           <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center gap-2">
                               <Database className="w-4 h-4 text-emerald-500" />
                               <h3 className="text-xs font-bold text-white">Immutable Chain</h3>
                             </div>
                             <span className="text-[9px] font-mono text-emerald-500 bg-emerald-950/30 px-2 py-0.5 rounded">SYNCED</span>
                           </div>

                           <div className="relative pl-4 border-l border-slate-800 space-y-4">
                             {[0,1,2].map(i => (
                               <motion.div 
                                 key={i}
                                 initial={{ x: 20, opacity: 0 }}
                                 animate={{ x: 0, opacity: 1 }}
                                 transition={{ delay: i * 0.15 }}
                                 className="relative"
                               >
                                 {/* Connection Node */}
                                 <div className={`absolute -left-[21px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 ${i === 0 ? 'bg-emerald-500 border-emerald-900' : 'bg-slate-800 border-slate-600'}`}></div>
                                 
                                 {/* Block Card */}
                                 <div className={`p-3 rounded-xl border flex items-center justify-between ${i === 0 ? 'bg-[#0f1f18] border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-900 border-slate-800 opacity-60'}`}>
                                   <div className="flex items-center gap-3">
                                      <div className="p-1.5 bg-slate-800 rounded-lg">
                                        <Hash size={14} className={i === 0 ? "text-emerald-400" : "text-slate-500"} />
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-slate-300">Block #{9420-i}</span>
                                        <span className="text-[8px] font-mono text-slate-500 flex items-center gap-1">
                                          <Link size={8} /> Prev: 0x3a...9f
                                        </span>
                                      </div>
                                   </div>
                                   {i === 0 && <div className="text-[9px] font-bold text-emerald-400">Just Now</div>}
                                 </div>
                               </motion.div>
                             ))}
                           </div>

                           <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center gap-3">
                             <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                             <p className="text-[10px] text-slate-400">
                               Data integrity verified via Merkle Proof. <br/>
                               <span className="text-slate-500">Record is now tamper-evident.</span>
                             </p>
                           </div>
                        </motion.div>
                      )}
                   </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

// Helper Components (Inga ändringar här, bara för att koden ska fungera)
const FloatingConstructor = ({ icon: Icon, x, y, color, label, delay }) => (
  <motion.div 
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1, x, y }}
    exit={{ scale: 0, opacity: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="absolute z-10 flex flex-col items-center"
  >
    <div className="w-12 h-12 bg-white rounded-2xl shadow-2xl flex items-center justify-center mb-2" style={{ color }}>
      <Icon size={24} />
    </div>
    <div className="bg-slate-900/80 backdrop-blur text-white text-[10px] px-2 py-1 rounded border border-slate-700 font-bold">
      {label}
    </div>
  </motion.div>
);

const ConnectionLine = ({ x1, y1, x2, y2, color, delay }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
    <motion.path 
      d={`M ${x1} ${y1} L ${x2} ${y2}`}
      stroke={color} strokeWidth="2" strokeDasharray="4 4" fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.5 }}
      exit={{ opacity: 0 }}
      transition={{ delay, duration: 1 }}
    />
  </svg>
);

const Typewriter = ({ text, delay, color = "text-blue-400" }) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setTimeout(() => setDisplayed(text), delay);
  }, [text, delay]);
  return <div className={`${color} ${displayed ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>{displayed}</div>;
};

export default PhoneDemo;