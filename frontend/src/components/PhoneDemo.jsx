import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Database, Wifi, Activity, CheckCircle, Server, Globe, Zap } from 'lucide-react';

const PhoneDemo = () => {
  const [step, setStep] = useState(0);
  const [booted, setBooted] = useState(false);

  // Boot sequence - Noder visas i 2.5 sekunder innan "booted" blir true
  useEffect(() => {
    const timer = setTimeout(() => setBooted(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Loop steps
  useEffect(() => {
    if (!booted) return;
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(interval);
  }, [booted]);

  const steps = [
    {
      id: 0,
      label: "Data Ingestion",
      icon: Zap,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      desc: "Receiving API Payload via TLS 1.3"
    },
    {
      id: 1,
      label: "Encryption Layer",
      icon: Lock,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
      desc: "Salting & Hashing (SHA-256)"
    },
    {
      id: 2,
      label: "Ledger Sync",
      icon: Database,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      desc: "Merkle Root Anchored on Chain"
    }
  ];

  return (
    <div className="relative w-[350px] h-[700px] mx-auto perspective-[1200px] flex items-center justify-center">
      
      {/* Floating Context Nodes (Svävande noder i början) */}
      <AnimatePresence>
        {!booted && (
          <>
            <FloatingNode icon={Globe} x={-140} y={-80} delay={0} color="#3b82f6" />
            <FloatingNode icon={Server} x={140} y={-20} delay={0.2} color="#8b5cf6" />
            <FloatingNode icon={Database} x={-120} y={120} delay={0.4} color="#10b981" />
          </>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ rotateY: -15, rotateX: 5 }}
        whileHover={{ rotateY: 0, rotateX: 0 }}
        transition={{ duration: 0.8 }}
        className="w-[320px] h-[640px] transform-style-3d drop-shadow-2xl relative z-10"
      >
        {/* Border Glow */}
        <div className="absolute -inset-1 bg-gradient-to-b from-blue-500 via-purple-500 to-emerald-500 rounded-[45px] opacity-30 blur-md"></div>

        {/* Phone Chassis */}
        <div className="absolute inset-0 bg-[#020617] rounded-[40px] overflow-hidden border-[6px] border-slate-800 flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="h-14 bg-slate-900/90 backdrop-blur border-b border-slate-700 flex items-center justify-between px-6 pt-3">
            <div className="flex gap-2 items-center">
              <div className={`w-2 h-2 rounded-full ${booted ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]' : 'bg-slate-600'}`}></div>
              <span className="text-[10px] font-mono text-slate-400 font-bold tracking-widest">AUDITOR_OS</span>
            </div>
            <Wifi className="w-4 h-4 text-slate-500" />
          </div>

          {/* Main Screen */}
          <div className="flex-1 relative p-6 flex flex-col bg-slate-950 font-sans">
            
            {!booted ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <Activity className="w-16 h-16 text-blue-500 animate-pulse" />
                <p className="text-xs text-blue-400 font-mono tracking-widest">SYSTEM INITIALIZING...</p>
              </div>
            ) : (
              <>
                {/* Active Process Card */}
                <div className="mb-8">
                  <div className="flex justify-between items-end mb-2">
                    <h3 className="text-slate-400 text-xs uppercase font-bold tracking-wider">Live Process</h3>
                    <span className="text-emerald-500 text-[10px] font-mono animate-pulse">● PROCESSING</span>
                  </div>
                  
                  <AnimatePresence mode='wait'>
                    <motion.div 
                      key={step}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`p-5 rounded-2xl border ${steps[step].border} ${steps[step].bg} relative overflow-hidden`}
                    >
                      <div className="absolute top-0 right-0 p-3 opacity-20">
                        {React.createElement(steps[step].icon, { size: 40 })}
                      </div>
                      
                      <div className={`inline-flex p-2 rounded-lg bg-black/20 mb-3 ${steps[step].color}`}>
                        {React.createElement(steps[step].icon, { size: 20 })}
                      </div>
                      <h2 className="text-white font-bold text-lg mb-1">{steps[step].label}</h2>
                      <p className="text-slate-400 text-xs leading-relaxed">{steps[step].desc}</p>

                      {/* Progress Bar inside card */}
                      <div className="mt-4 h-1 w-full bg-black/20 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: "100%" }} 
                          transition={{ duration: 6, ease: "linear" }}
                          className={`h-full ${step === 0 ? 'bg-blue-500' : step === 1 ? 'bg-purple-500' : 'bg-emerald-500'}`} 
                        />
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Visualizer (Middle) */}
                <div className="flex-1 flex items-center justify-center relative">
                  {/* Background Rings */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <div className="w-48 h-48 border border-slate-600 rounded-full animate-[spin_10s_linear_infinite]"></div>
                    <div className="w-32 h-32 border border-slate-600 rounded-full absolute animate-[spin_5s_linear_infinite_reverse]"></div>
                  </div>

                  {/* Central Shield Animation */}
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="relative z-10"
                  >
                    <Shield className={`w-20 h-20 transition-colors duration-500 ${
                      step === 0 ? 'text-slate-700' : 
                      step === 1 ? 'text-purple-500' : 
                      'text-emerald-500'
                    }`} />
                    {step === 2 && (
                      <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="absolute -bottom-2 -right-2 bg-emerald-500 text-[#020617] p-1 rounded-full"
                      >
                        <CheckCircle size={16} strokeWidth={3} />
                      </motion.div>
                    )}
                  </motion.div>
                </div>

                {/* Activity Log (Bottom) */}
                <div className="mt-auto space-y-2">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Recent Activity</div>
                  <div className="space-y-2">
                    {[1, 2].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800/50">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-200 font-medium">Event Secured</span>
                            <span className="text-[9px] text-slate-500 font-mono">ID: 0x8f...2a</span>
                          </div>
                        </div>
                        <span className="text-[9px] text-slate-500">{i * 2 + 1}s ago</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// HÄR ÄR KOMPONENTEN SOM BEHÖVS FÖR ATT NODERNA SKA SYNAS!
const FloatingNode = ({ icon: Icon, x, y, delay, color }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
    animate={{ opacity: [0, 1, 0], scale: 1, x, y }}
    transition={{ delay, duration: 2.5, ease: "easeInOut" }}
    className="absolute z-0 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center"
    style={{ color }}
  >
    <Icon size={24} />
  </motion.div>
);

export default PhoneDemo;