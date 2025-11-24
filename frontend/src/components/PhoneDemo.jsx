import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Lock, Database, Globe, Server, Shield, Cpu, Wifi, Activity, CheckCircle2, ArrowDown, FileJson, Hash, Link } from 'lucide-react';

const PhoneDemo = () => {
  const [bootState, setBootState] = useState('init'); 
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    setTimeout(() => setBootState('constructing'), 500);
    setTimeout(() => setBootState('booting'), 3500);
    setTimeout(() => setBootState('active'), 5500);
  }, []);

  useEffect(() => {
    if (bootState !== 'active') return;
    const interval = setInterval(() => { setActiveTab(prev => (prev + 1) % 3); }, 6000);
    return () => clearInterval(interval);
  }, [bootState]);

  // Stripe färger
  const stripeColors = {
    primary: '#635bff',
    primaryLight: '#7c73ff', 
    background: '#f6f9fc',
    surface: '#ffffff',
    text: '#1a1f36',
    textLight: '#6b7c93',
    border: '#e6ebf1',
    success: '#00d4aa',
    warning: '#ffb800',
    error: '#e25950'
  };

  return (
    <div className="relative w-[380px] h-[750px] mx-auto perspective-[1200px] flex items-center justify-center scale-[0.80] sm:scale-90 md:scale-100 origin-top md:origin-center">
      
      <AnimatePresence>
        {(bootState === 'init' || bootState === 'constructing') && (
          <>
            <FloatingConstructor icon={Globe} x={-140} y={-100} color={stripeColors.primary} label="Global API" delay={0} />
            <ConnectionLine x1={50} y1={250} x2={190} y2={375} color={stripeColors.primary} delay={0.5} />
            <FloatingConstructor icon={Server} x={140} y={-50} color={stripeColors.primary} label="Frankfurt" delay={0.2} />
            <ConnectionLine x1={330} y1={300} x2={190} y2={375} color={stripeColors.primary} delay={0.7} />
            <FloatingConstructor icon={Shield} x={0} y={160} color={stripeColors.primary} label="HSM Module" delay={0.4} />
            <ConnectionLine x1={190} y1={510} x2={190} y2={375} color={stripeColors.primary} delay={0.9} />
          </>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative z-20 w-[320px] h-[650px] transform-style-3d"
      >
        <svg className="absolute -inset-[2px] w-[101%] h-[101%] z-50 pointer-events-none overflow-visible">
           <motion.rect 
             width="100%" 
             height="100%" 
             rx="45" 
             fill="none" 
             stroke={`url(#stripe-gradient)`} 
             strokeWidth="4" 
             initial={{ pathLength: 0, opacity: 0 }} 
             animate={bootState === 'constructing' ? { pathLength: 1, opacity: 1 } : { pathLength: 1, opacity: 0 }} 
             transition={{ duration: 2.5, ease: "easeInOut" }} 
           />
           <defs>
             <linearGradient id="stripe-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
               <stop offset="0%" stopColor={stripeColors.primary} />
               <stop offset="100%" stopColor={stripeColors.primaryLight} />
             </linearGradient>
           </defs>
        </svg>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: bootState === 'constructing' ? 0.1 : 1 }} 
          className="absolute inset-0 rounded-[42px] border-[6px] shadow-2xl overflow-hidden flex flex-col"
          style={{ 
            backgroundColor: stripeColors.background,
            borderColor: stripeColors.border
          }}
        >
          <div 
            className="h-14 backdrop-blur border-b flex items-center justify-between px-6 pt-3 z-30"
            style={{
              backgroundColor: stripeColors.surface,
              borderColor: stripeColors.border
            }}
          >
            <div className="flex gap-2 items-center">
              <div 
                className={`w-2 h-2 rounded-full ${bootState === 'active' ? 'animate-pulse shadow-[0_0_8px]' : ''}`}
                style={{
                  backgroundColor: bootState === 'active' ? stripeColors.success : stripeColors.warning,
                  boxShadow: bootState === 'active' ? `0_0_8px_${stripeColors.success}` : 'none'
                }}
              ></div>
              <span 
                className="text-[10px] font-mono tracking-widest font-bold"
                style={{ color: stripeColors.textLight }}
              >
                KERNEL_V3
              </span>
            </div>
            <Wifi className="w-4 h-4" style={{ color: stripeColors.textLight }} />
          </div>

          <div 
            className="flex-1 relative p-5 flex flex-col"
            style={{ backgroundColor: stripeColors.background }}
          >
            {bootState === 'booting' && (
              <div className="h-full flex flex-col items-center justify-center font-mono text-xs space-y-2">
                 <Cpu className="w-12 h-12 mb-4 animate-pulse" style={{ color: stripeColors.primary }} />
                 <Typewriter text="> Initializing Auditor Core..." delay={0} color={stripeColors.primary} />
                 <Typewriter text="> Loading Encryption Modules..." delay={500} color={stripeColors.primary} />
                 <Typewriter text="> Connecting to Merkle Root..." delay={1000} color={stripeColors.primary} />
                 <Typewriter text="> SYSTEM READY." delay={1500} color={stripeColors.success} />
              </div>
            )}

            {bootState === 'active' && (
              <>
                <div 
                  className="flex p-1 rounded-xl mb-6 border"
                  style={{
                    backgroundColor: stripeColors.surface,
                    borderColor: stripeColors.border
                  }}
                >
                  {['Ingest', 'Encrypt', 'Ledger'].map((t, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 py-2 text-[10px] font-bold uppercase text-center rounded-lg transition-all ${
                        i === activeTab 
                          ? 'text-white shadow-lg' 
                          : 'text-gray-500'
                      }`}
                      style={{
                        backgroundColor: i === activeTab ? stripeColors.primary : 'transparent'
                      }}
                    >
                      {t}
                    </div>
                  ))}
                </div>

                <div className="flex-1 relative">
                   <AnimatePresence mode="wait">
                      {activeTab === 0 && (
                        <motion.div key="tab0" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-xs font-bold flex items-center gap-2" style={{ color: stripeColors.text }}>
                              <FileJson className="w-3 h-3" style={{ color: stripeColors.primary }} /> Payload Analysis
                            </h3>
                            <span 
                              className="text-[9px] px-2 py-0.5 rounded border"
                              style={{
                                backgroundColor: `${stripeColors.primary}10`,
                                color: stripeColors.primary,
                                borderColor: `${stripeColors.primary}20`
                              }}
                            >
                              Scanning
                            </span>
                          </div>
                          <div 
                            className="p-4 rounded-xl border font-mono text-[10px] leading-relaxed relative overflow-hidden group"
                            style={{
                              backgroundColor: stripeColors.surface,
                              borderColor: stripeColors.border,
                              color: stripeColors.textLight
                            }}
                          >
                            <motion.div 
                              className="absolute top-0 left-0 w-full h-[2px] shadow-[0_0_10px]"
                              style={{
                                backgroundColor: `${stripeColors.primary}50`,
                                boxShadow: `0_0_10px_${stripeColors.primary}`
                              }}
                              animate={{ top: ["0%", "100%"] }} 
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }} 
                            />
                            <span style={{ color: stripeColors.primary }}>POST</span> /v1/events/log <br/>
                            <div className="pl-2 border-l mt-1" style={{ borderColor: stripeColors.border }}>
                              <span style={{ color: stripeColors.textLight }}>"event":</span> <span style={{ color: stripeColors.success }}>"user_login"</span>,<br/>
                              <div className="relative inline-block my-1">
                                <span style={{ color: stripeColors.textLight }}>"user_id":</span> 
                                <span 
                                  className="px-1 rounded mx-1 border"
                                  style={{
                                    backgroundColor: `${stripeColors.error}20`,
                                    color: stripeColors.text,
                                    borderColor: `${stripeColors.error}30`
                                  }}
                                >
                                  "user_123"
                                </span>
                                <motion.div 
                                  initial={{opacity: 0}} 
                                  animate={{opacity: 1}} 
                                  transition={{delay: 1.5}} 
                                  className="absolute -right-16 top-0 text-[8px] font-bold px-1 border rounded"
                                  style={{
                                    color: stripeColors.error,
                                    backgroundColor: stripeColors.surface,
                                    borderColor: `${stripeColors.error}30`
                                  }}
                                >
                                  PII DETECTED
                                </motion.div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      {activeTab === 1 && (
                        <motion.div key="tab1" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0}} className="h-full flex flex-col items-center justify-center pb-10">
                           <div 
                             className="w-full rounded-xl border p-4 mb-6 relative overflow-hidden"
                             style={{
                               backgroundColor: stripeColors.surface,
                               borderColor: stripeColors.border
                             }}
                           >
                             <div className="flex items-center justify-between font-mono text-sm">
                               <div style={{ color: stripeColors.textLight }}>user_123</div>
                               <ArrowDown className="rotate-[-90deg]" size={16} style={{ color: stripeColors.primary }} />
                               <motion.div 
                                 initial={{ opacity: 0, filter: "blur(4px)" }} 
                                 animate={{ opacity: 1, filter: "blur(0px)" }} 
                                 transition={{ duration: 0.5, delay: 0.5 }} 
                                 className="px-2 py-1 rounded border"
                                 style={{
                                   color: stripeColors.success,
                                   backgroundColor: `${stripeColors.success}10`,
                                   borderColor: `${stripeColors.success}20`
                                 }}
                               >
                                 0x8F92...
                               </motion.div>
                             </div>
                           </div>
                           <div className="relative w-24 h-24 flex items-center justify-center">
                             <motion.div 
                               animate={{ scale: [1, 1.1, 1] }} 
                               transition={{ duration: 2, repeat: Infinity }} 
                               className="absolute inset-0 rounded-full blur-xl"
                               style={{ backgroundColor: `${stripeColors.primary}10` }}
                             />
                             <Shield className="w-12 h-12" style={{ color: stripeColors.primary }} />
                           </div>
                        </motion.div>
                      )}
                      {activeTab === 2 && (
                        <motion.div key="tab2" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="space-y-4">
                           <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center gap-2">
                               <Database className="w-4 h-4" style={{ color: stripeColors.success }} />
                               <h3 className="text-xs font-bold" style={{ color: stripeColors.text }}>Immutable Chain</h3>
                             </div>
                             <span 
                               className="text-[9px] font-mono px-2 py-0.5 rounded"
                               style={{
                                 color: stripeColors.success,
                                 backgroundColor: `${stripeColors.success}10`
                               }}
                             >
                               SYNCED
                             </span>
                           </div>
                           <div className="relative pl-4 border-l space-y-4" style={{ borderColor: stripeColors.border }}>
                             {[0,1,2].map(i => (
                               <motion.div key={i} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.15 }} className="relative">
                                 <div 
                                   className={`absolute -left-[21px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 ${
                                     i === 0 
                                       ? 'border-emerald-900' 
                                       : 'border-gray-300'
                                   }`}
                                   style={{
                                     backgroundColor: i === 0 ? stripeColors.success : stripeColors.border
                                   }}
                                 ></div>
                                 <div 
                                   className={`p-3 rounded-xl border flex items-center justify-between ${
                                     i === 0 
                                       ? 'shadow-[0_0_15px_rgba(0,212,170,0.1)]' 
                                       : 'opacity-60'
                                   }`}
                                   style={{
                                     backgroundColor: i === 0 ? `${stripeColors.success}05` : stripeColors.surface,
                                     borderColor: i === 0 ? `${stripeColors.success}30` : stripeColors.border
                                   }}
                                 >
                                   <div className="flex items-center gap-3">
                                     <div 
                                       className="p-1.5 rounded-lg"
                                       style={{ backgroundColor: stripeColors.border }}
                                     >
                                       <Hash size={14} style={{ color: i === 0 ? stripeColors.success : stripeColors.textLight }} />
                                     </div>
                                     <div className="flex flex-col">
                                       <span className="text-[9px] font-bold" style={{ color: stripeColors.text }}>
                                         Block #{9420-i}
                                       </span>
                                     </div>
                                   </div>
                                 </div>
                               </motion.div>
                             ))}
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

const FloatingConstructor = ({ icon: Icon, x, y, color, label, delay }) => (
  <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1, x, y }} exit={{ scale: 0, opacity: 0 }} transition={{ delay, duration: 0.5 }} className="absolute z-10 flex flex-col items-center">
    <div 
      className="w-12 h-12 rounded-2xl shadow-2xl flex items-center justify-center mb-2 border"
      style={{ 
        backgroundColor: '#ffffff',
        borderColor: '#e6ebf1',
        color 
      }}
    >
      <Icon size={24} />
    </div>
    <div 
      className="backdrop-blur text-[10px] px-2 py-1 rounded border font-bold"
      style={{
        backgroundColor: 'rgba(255,255,255,0.9)',
        color: '#1a1f36',
        borderColor: '#e6ebf1'
      }}
    >
      {label}
    </div>
  </motion.div>
);

const ConnectionLine = ({ x1, y1, x2, y2, color, delay }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
    <motion.path 
      d={`M ${x1} ${y1} L ${x2} ${y2}`} 
      stroke={color} 
      strokeWidth="2" 
      strokeDasharray="4 4" 
      fill="none" 
      initial={{ pathLength: 0, opacity: 0 }} 
      animate={{ pathLength: 1, opacity: 0.5 }} 
      exit={{ opacity: 0 }} 
      transition={{ delay, duration: 1 }} 
    />
  </svg>
);

const Typewriter = ({ text, delay, color = "#635bff" }) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => { 
    setTimeout(() => setDisplayed(text), delay); 
  }, [text, delay]);
  
  return (
    <div 
      className={`${displayed ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      style={{ color }}
    >
      {displayed}
    </div>
  );
};

export default PhoneDemo;