import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle2, Terminal, Wifi, Activity, Copy, CreditCard, Globe, Lock, Server, Cpu, Database, Key } from 'lucide-react';

const StripePhoneDemo = ({ activeStep = 0 }) => {
  const [bootPhase, setBootPhase] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    setTimeout(() => setBootPhase(1), 800);
    setTimeout(() => setBootPhase(2), 2500);
  }, []);

  // Scan animation for step 1
  useEffect(() => {
    if (activeStep === 1) {
      const interval = setInterval(() => {
        setScanProgress(prev => (prev >= 100 ? 0 : prev + 25));
      }, 600);
      return () => clearInterval(interval);
    }
  }, [activeStep]);

  return (
    <div className="relative w-full h-[600px] md:h-[750px] flex items-center justify-center perspective-[1200px] overflow-visible scale-[0.85] sm:scale-100 origin-center">
      
      {/* Ultra Soft Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-purple-500/5 to-emerald-500/8 blur-[140px] rounded-full pointer-events-none"></div>
      
      {/* Subtle Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 0.6, 0],
              scale: [0, 1, 0],
              x: [0, (Math.random() - 0.5) * 100],
              y: [0, (Math.random() - 0.5) * 100]
            }}
            transition={{ 
              duration: 3 + Math.random() * 2,
              delay: Math.random() * 2,
              repeat: Infinity,
              repeatType: "loop"
            }}
          />
        ))}
      </div>

      {/* PHONE FRAME - Ultra Soft & Premium */}
      <motion.div
        initial={{ rotateX: 12, rotateY: -8, y: 60, opacity: 0, scale: 0.92 }}
        animate={{ rotateX: 3, rotateY: -2, y: 0, opacity: 1, scale: 1 }}
        transition={{ 
          duration: 1.6, 
          ease: [0.23, 1, 0.32, 1],
          rotateX: { duration: 1.8, ease: "easeOut" },
          rotateY: { duration: 1.8, ease: "easeOut" }
        }}
        className="relative z-20 bg-gradient-to-b from-slate-900 to-slate-950 rounded-[48px] shadow-[0_40px_80px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_0_40px_rgba(0,0,0,0.3)] overflow-hidden w-[350px] h-[700px] border border-white/10 backdrop-blur-sm"
      >
        
        {/* Ultra Subtle Glass Reflection */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] via-transparent to-white/[0.04] pointer-events-none z-50 rounded-[48px]"></div>

        {/* Minimal Status Bar */}
        <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-slate-900/90 to-transparent z-40 flex justify-between items-center px-8 pt-3 backdrop-blur-md">
          <div className="text-white text-[13px] font-medium">9:41</div>
          <div className="flex items-center gap-[3px]">
            <div className="w-[4px] h-[4px] rounded-full bg-white/60"></div>
            <div className="w-[4px] h-[4px] rounded-full bg-white/60"></div>
            <div className="w-[4px] h-[4px] rounded-full bg-white/60"></div>
          </div>
        </div>

        <div className="h-full w-full bg-gradient-to-b from-slate-950 to-slate-900 relative overflow-hidden flex flex-col pt-10">
           
           {/* PHASE 1: ORGANIC BOOT ANIMATION */}
           <AnimatePresence>
             {bootPhase < 2 && (
               <motion.div 
                 exit={{ opacity: 0, filter: 'blur(20px)', scale: 1.02 }}
                 transition={{ duration: 0.8, ease: "easeOut" }}
                 className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900"
               >
                  {/* Organic Loading Animation */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 100 }}
                    className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mb-8 backdrop-blur-xl"
                  >
                    <Shield size={32} className="text-blue-400" />
                  </motion.div>
                  
                  {/* Progressive Loading Bar */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: 160 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6 shadow-lg shadow-blue-500/25"
                  />
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-slate-400 text-sm font-medium tracking-wide"
                  >
                    Initializing Secure Protocol
                  </motion.p>
               </motion.div>
             )}
           </AnimatePresence>

           {/* PHASE 2: SMOOTH UI INTERFACE */}
           {bootPhase >= 2 && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, ease: "easeOut" }}
               className="flex-1 px-6 pb-8 relative z-10 flex flex-col"
             >
                {/* App Header - Glass Morphism */}
                <motion.div 
                  initial={{ y: -15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex justify-between items-center mb-6 pt-2"
                >
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl shadow-sm">
                         <Shield size={20} className="text-white" />
                      </div>
                      <div>
                         <h3 className="text-white font-semibold text-[15px] tracking-tight">Veritas Enclave</h3>
                         <p className="text-slate-400 text-[11px] font-medium">Secure Audit Protocol</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#10b981] animate-pulse"></div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                         Live
                      </span>
                   </div>
                </motion.div>

                {/* Dynamic Content Area */}
                <div className="flex-1 relative overflow-hidden">
                   <AnimatePresence mode="wait">
                      
                      {/* STEP 1: GLOBAL NETWORK VISUALIZATION */}
                      {activeStep === 0 && (
                        <motion.div 
                          key="network"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className="h-full flex flex-col"
                        >
                           {/* Network Globe */}
                           <motion.div 
                             initial={{ scale: 0.9, opacity: 0 }}
                             animate={{ scale: 1, opacity: 1 }}
                             transition={{ delay: 0.1 }}
                             className="h-48 rounded-3xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/5 mb-6 relative overflow-hidden flex items-center justify-center backdrop-blur-sm"
                           >
                              {/* Animated Network Lines */}
                              <div className="absolute inset-0 opacity-30">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-blue-400/30 rounded-full animate-ping"></div>
                              </div>
                              
                              <Globe size={56} className="text-slate-600" strokeWidth={1.5} />
                              
                              {/* Floating Nodes */}
                              <motion.div 
                                className="absolute w-3 h-3 bg-blue-400 rounded-full shadow-lg shadow-blue-400/25"
                                animate={{ x: [0, 30, -20, 0], y: [0, -25, 15, 0], opacity: [0, 1, 0.8, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                              />
                              <motion.div 
                                className="absolute w-2 h-2 bg-purple-400 rounded-full shadow-lg shadow-purple-400/25"
                                animate={{ x: [0, -25, 20, 0], y: [0, 30, -15, 0], opacity: [0, 0.8, 1, 0] }}
                                transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
                              />

                              <div className="absolute bottom-4 left-0 right-0 text-center">
                                <div className="text-[10px] text-slate-400 font-mono tracking-wider bg-black/30 rounded-full px-3 py-1 inline-block border border-white/5">
                                   SCANNING 12 NODES...
                                </div>
                              </div>
                           </motion.div>
                           
                           {/* Connection Logs */}
                           <div className="space-y-3">
                              {[
                                { id: 8921, protocol: "TLS 1.3", status: "verified", location: "Frankfurt" },
                                { id: 8922, protocol: "TLS 1.3", status: "verified", location: "Singapore" },
                                { id: 8923, protocol: "TLS 1.3", status: "encrypted", location: "Virginia" }
                              ].map((item, i) => (
                                <motion.div 
                                  key={item.id}
                                  initial={{ x: -10, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: 0.2 + i * 0.1 }}
                                  className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                                >
                                   <div className="flex items-center gap-4">
                                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                         <Server size={14} className="text-blue-400" />
                                      </div>
                                      <div className="flex flex-col">
                                         <span className="text-[12px] font-semibold text-white">Node #{item.id}</span>
                                         <span className="text-[10px] text-slate-400">{item.protocol} • {item.location}</span>
                                      </div>
                                   </div>
                                   <div className={`w-2 h-2 rounded-full ${item.status === 'verified' ? 'bg-emerald-400' : 'bg-blue-400'} shadow-lg ${item.status === 'verified' ? 'shadow-emerald-400/25' : 'shadow-blue-400/25'}`}></div>
                                </motion.div>
                              ))}
                           </div>
                        </motion.div>
                      )}

                      {/* STEP 2: BIOMETRIC AUTHENTICATION */}
                      {activeStep === 1 && (
                        <motion.div 
                          key="auth"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.05 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className="h-full flex flex-col justify-center items-center"
                        >
                           {/* Animated Auth Ring */}
                           <div className="relative w-40 h-40 flex items-center justify-center mb-8">
                              <motion.div
                                className="absolute inset-0 rounded-full border-2 border-blue-500/30 border-t-blue-500"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                              />
                              <motion.div
                                className="absolute inset-4 rounded-full border-2 border-purple-500/30 border-t-purple-500"
                                animate={{ rotate: -360 }}
                                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                              />
                              
                              <div className="w-24 h-24 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/10">
                                 <Key size={40} className="text-white" />
                              </div>

                              {/* Scanning Beam */}
                              <motion.div
                                className="absolute w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent top-1/2 left-0"
                                style={{ y: '-50%' }}
                                animate={{ y: ['-50%', '100%', '-50%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                              />
                           </div>

                           <motion.h3 
                             initial={{ y: 10, opacity: 0 }}
                             animate={{ y: 0, opacity: 1 }}
                             transition={{ delay: 0.2 }}
                             className="text-xl font-bold text-white mb-3 text-center"
                           >
                             Identity Verification
                           </motion.h3>

                           <motion.p
                             initial={{ y: 10, opacity: 0 }}
                             animate={{ y: 0, opacity: 1 }}
                             transition={{ delay: 0.3 }}
                             className="text-slate-400 text-sm text-center max-w-[260px] leading-relaxed mb-8"
                           >
                             Biometric signature required to authorize cryptographic operation
                           </motion.p>

                           {/* Progress Indicator */}
                           <div className="w-full max-w-[200px] bg-black/30 rounded-full h-1.5 mb-6 overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                initial={{ width: '0%' }}
                                animate={{ width: `${scanProgress}%` }}
                                transition={{ duration: 0.5 }}
                              />
                           </div>

                           <motion.button 
                             whileHover={{ scale: 1.02 }}
                             whileTap={{ scale: 0.98 }}
                             className="w-full max-w-[240px] py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 backdrop-blur-sm"
                           >
                              <Lock size={16} />
                              Authorize Access
                              <Activity size={16} />
                           </motion.button>
                        </motion.div>
                      )}

                      {/* STEP 3: SUCCESS CONFIRMATION */}
                      {activeStep === 2 && (
                        <motion.div 
                          key="success"
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          className="h-full flex flex-col pt-4"
                        >
                           {/* Success Card */}
                           <div className="flex-1 bg-gradient-to-b from-emerald-500/10 via-slate-800/20 to-transparent rounded-[32px] p-1 border border-emerald-500/20 relative overflow-hidden shadow-2xl">
                              
                              <div className="bg-slate-900/80 h-full rounded-[28px] p-6 flex flex-col items-center relative z-10 backdrop-blur-sm">
                                 
                                 {/* Success Icon */}
                                 <motion.div
                                   initial={{ scale: 0, rotate: -180 }}
                                   animate={{ scale: 1, rotate: 0 }}
                                   transition={{ type: "spring", damping: 15, stiffness: 100 }}
                                   className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 backdrop-blur-sm"
                                 >
                                    <CheckCircle2 size={36} className="text-emerald-400" />
                                 </motion.div>

                                 <motion.h2 
                                   initial={{ y: 10, opacity: 0 }}
                                   animate={{ y: 0, opacity: 1 }}
                                   transition={{ delay: 0.1 }}
                                   className="text-2xl font-bold text-white mb-2"
                                 >
                                    Secured
                                 </motion.h2>

                                 <motion.p
                                   initial={{ y: 10, opacity: 0 }}
                                   animate={{ y: 0, opacity: 1 }}
                                   transition={{ delay: 0.2 }}
                                   className="text-slate-400 text-xs uppercase tracking-widest mb-8"
                                 >
                                    Block #921 Anchored
                                 </motion.p>

                                 {/* Hash Proof */}
                                 <motion.div
                                   initial={{ y: 20, opacity: 0 }}
                                   animate={{ y: 0, opacity: 1 }}
                                   transition={{ delay: 0.3 }}
                                   className="w-full bg-white/5 rounded-xl p-4 border border-white/5 mb-4 backdrop-blur-sm"
                                 >
                                    <div className="flex justify-between items-center text-[10px] text-slate-400 mb-2 uppercase font-bold tracking-wider">
                                       <span>Merkle Root</span>
                                       <button className="hover:bg-white/5 p-1 rounded">
                                          <Copy size={12} />
                                       </button>
                                    </div>
                                    <div className="font-mono text-xs text-emerald-300 break-all leading-relaxed">
                                       0x9f8a2b7c1d3e5f6a9b8c7d2e1f4a3b6c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3c9d
                                    </div>
                                 </motion.div>

                                 {/* Transaction Info */}
                                 <motion.div
                                   initial={{ y: 20, opacity: 0 }}
                                   animate={{ y: 0, opacity: 1 }}
                                   transition={{ delay: 0.4 }}
                                   className="w-full flex items-center gap-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/10 backdrop-blur-sm"
                                 >
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/20">
                                       <Database size={20} className="text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                       <div className="text-sm font-semibold text-white">Immutable Record</div>
                                       <div className="text-[11px] text-blue-300">Verified & Distributed</div>
                                    </div>
                                 </motion.div>
                              </div>
                           </div>

                           {/* Celebration Particles */}
                           <div className="absolute inset-0 pointer-events-none">
                              {[...Array(6)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  className="absolute w-1 h-1 bg-emerald-400 rounded-full"
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ 
                                    scale: [0, 1, 0],
                                    opacity: [0, 1, 0],
                                    x: [0, (Math.random() - 0.5) * 80],
                                    y: [0, (Math.random() - 0.5) * 80]
                                  }}
                                  transition={{ 
                                    duration: 1.5,
                                    delay: i * 0.2,
                                    repeat: Infinity,
                                    repeatDelay: 2
                                  }}
                                />
                              ))}
                           </div>
                        </motion.div>
                      )}

                   </AnimatePresence>
                </div>
             </motion.div>
           )}
        </div>
      </motion.div>
    </div>
  );
};

export default StripePhoneDemo;