import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ShieldCheck, Database, Lock, ArrowDown, Activity, CheckCircle } from 'lucide-react';

const PhoneDemo = () => {
  const [step, setStep] = useState(0); // 0: Code, 1: Hashing, 2: Ledger

  // Auto-loop för demonstrationen
  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 3);
    }, 5000); // Byter vy var 5:e sekund
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-[320px] h-[640px] mx-auto perspective-[1000px]">
      <motion.div 
        initial={{ rotateY: -12, rotateX: 5 }}
        whileHover={{ rotateY: 0, rotateX: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full h-full transform-style-3d drop-shadow-2xl"
      >
        {/* 1. STRIPE-EFFEKTEN: Den ritande ramen */}
        <svg className="absolute -inset-1 w-[102%] h-[101%] z-50 pointer-events-none overflow-visible">
           <motion.rect 
             width="100%" height="100%" rx="45" 
             fill="none" stroke="#00d4ff" strokeWidth="3"
             initial={{ pathLength: 0, opacity: 0 }}
             animate={{ pathLength: 1, opacity: 1 }}
             transition={{ duration: 2.5, ease: "easeInOut" }}
           />
           {/* Glödande effekt runt ramen */}
           <motion.rect 
             width="100%" height="100%" rx="45" 
             fill="none" stroke="#635bff" strokeWidth="6" strokeOpacity="0.2"
             className="blur-md"
           />
        </svg>

        {/* 2. TELEFONENS KROPP */}
        <div className="absolute inset-0 bg-[#0f172a] rounded-[40px] shadow-2xl overflow-hidden border-[6px] border-slate-900">
          
          {/* Status Bar */}
          <div className="h-12 flex justify-between items-center px-6 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md">
            <div className="flex gap-2">
               <div className="w-2 h-2 rounded-full bg-red-500"></div>
               <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
               <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
            <div className="text-[10px] font-mono text-slate-500">AUDITOR_V1</div>
          </div>

          {/* 3. INTERAKTIVT INNEHÅLL */}
          <div className="p-6 h-full flex flex-col font-sans text-white relative">
            
            {/* Progress Bar */}
            <div className="flex gap-1 mb-8">
              {[0, 1, 2].map(i => (
                <motion.div 
                  key={i}
                  className={`h-1 flex-1 rounded-full ${step === i ? 'bg-[#00d4ff]' : 'bg-slate-700'}`}
                  layoutId="progressBar"
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              
              {/* SCEN 1: API ANROP (Developer View) */}
              {step === 0 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg"><Terminal className="w-5 h-5 text-blue-400" /></div>
                    <h3 className="font-bold text-lg">1. Ingest Event</h3>
                  </div>
                  
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 font-mono text-[10px] leading-relaxed text-slate-300 shadow-inner relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
                    <span className="text-purple-400">await</span> auditor.log(&#123;<br/>
                    &nbsp;&nbsp;user: <span className="text-green-400">"usr_829"</span>,<br/>
                    &nbsp;&nbsp;action: <span className="text-green-400">"payment_processed"</span>,<br/>
                    &nbsp;&nbsp;amount: <span className="text-yellow-400">4500.00</span><br/>
                    &#125;);
                  </div>

                  <div className="flex justify-center py-4">
                    <ArrowDown className="w-6 h-6 text-slate-600 animate-bounce" />
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg flex items-center gap-3">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-emerald-200">API Handshake Established</span>
                  </div>
                </motion.div>
              )}

              {/* SCEN 2: HASHING & SECURITY (Process View) */}
              {step === 1 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                  className="flex flex-col items-center justify-center h-[400px]"
                >
                  <div className="relative w-32 h-32 mb-8">
                    {/* Roterande ringar för att simulera processing */}
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-[3px] border-dashed border-slate-600 rounded-full" />
                    <motion.div animate={{ rotate: -360 }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} className="absolute inset-4 border-[3px] border-slate-500 rounded-full" />
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="w-10 h-10 text-[#00d4ff] drop-shadow-[0_0_15px_rgba(0,212,255,0.5)]" />
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-xl mb-2">Securing Data</h3>
                  <div className="bg-slate-800 px-4 py-2 rounded-full border border-slate-700 font-mono text-[10px] text-slate-400">
                    AES-256 • SHA-256
                  </div>

                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 4 }}
                    className="h-1 bg-gradient-to-r from-[#00d4ff] to-[#635bff] mt-8 rounded-full"
                  />
                </motion.div>
              )}

              {/* SCEN 3: IMMUTABLE LEDGER (Result View) */}
              {step === 2 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-500/20 rounded-lg"><Database className="w-5 h-5 text-purple-400" /></div>
                    <h3 className="font-bold text-lg">3. Merkle Root</h3>
                  </div>

                  {/* Animerad lista som liknar din screenshot på order-listan men för block */}
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <motion.div 
                        key={i} 
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.2 }}
                        className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex items-center justify-between backdrop-blur-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                            #{9200 + i}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-200">Block Hash</div>
                            <div className="text-[10px] text-[#635bff] font-mono">0x8f...2a9c</div>
                          </div>
                        </div>
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-8 text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Verification Status</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                      <ShieldCheck className="w-3 h-3 mr-2" /> IMMUTABLE
                    </span>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PhoneDemo;