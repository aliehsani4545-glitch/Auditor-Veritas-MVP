import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, FileJson, Lock, GitMerge, Server, ShieldCheck, Cpu, Globe, ArrowRight, Zap } from 'lucide-react';

const IntegrityEngine = () => {
  const [step, setStep] = useState(0); // 0: Idle, 1: Ingest, 2: Hash, 3: Merkle, 4: Ledger, 5: Complete
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Automatisk sekvens-loop
  useEffect(() => {
    let timer;
    if (isAutoPlaying) {
      timer = setTimeout(() => {
        setStep(1); 
        setTimeout(() => setStep(2), 2000); 
        setTimeout(() => setStep(3), 4000); 
        setTimeout(() => setStep(4), 6000); 
        setTimeout(() => { setStep(5); setIsAutoPlaying(false); }, 8000); 
      }, 100);
    }
    return () => clearTimeout(timer);
  }, [isAutoPlaying]);

  useEffect(() => {
    setIsAutoPlaying(true);
  }, []);

  const restart = () => {
    setStep(0);
    setTimeout(() => setIsAutoPlaying(true), 100);
  };

  // Nodernas positioner (0-100 koordinater)
  const nodes = [
    { id: 1, label: "Event Source", icon: Globe, x: 10, y: 50, color: "#3b82f6" }, 
    { id: 2, label: "Ingestion API", icon: Server, x: 30, y: 20, color: "#8b5cf6" }, 
    { id: 3, label: "SHA-256 Engine", icon: Cpu, x: 50, y: 50, color: "#ec4899" },   
    { id: 4, label: "Merkle Tree", icon: GitMerge, x: 70, y: 20, color: "#10b981" }, 
    { id: 5, label: "Immutable Ledger", icon: Database, x: 90, y: 50, color: "#00d4ff" }, 
  ];

  return (
    <div className="py-24 bg-[#020617] relative overflow-hidden border-t border-slate-800">
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }}>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            The Integrity Engine
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Visualizing the lifecycle of a single audit event. From raw JSON to immutable proof.
          </p>
        </div>

        <div className="relative h-[600px] bg-slate-900/50 rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-sm">
          
          {/* FIXAT: viewBox="0 0 100 100" gör att vi kan använda 0-100 koordinater utan % */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#3b82f6"/><stop offset="100%" stopColor="#8b5cf6"/></linearGradient>
              <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#ec4899"/></linearGradient>
              <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#ec4899"/><stop offset="100%" stopColor="#10b981"/></linearGradient>
              <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#10b981"/><stop offset="100%" stopColor="#00d4ff"/></linearGradient>
            </defs>

            <ConnectionPath start={{x: 10, y: 50}} end={{x: 30, y: 20}} active={step >= 1} color="url(#grad1)" />
            <ConnectionPath start={{x: 30, y: 20}} end={{x: 50, y: 50}} active={step >= 2} color="url(#grad2)" />
            <ConnectionPath start={{x: 50, y: 50}} end={{x: 70, y: 20}} active={step >= 3} color="url(#grad3)" />
            <ConnectionPath start={{x: 70, y: 20}} end={{x: 90, y: 50}} active={step >= 4} color="url(#grad4)" />
          </svg>

          {nodes.map((node, i) => (
            <FloatingNode 
              key={node.id} 
              data={node} 
              isActive={step >= i + 1} 
              isCurrent={step === i + 1}
            />
          ))}

          <div className="absolute bottom-0 left-0 right-0 bg-slate-950/90 border-t border-slate-800 p-6 md:p-8 backdrop-blur-md transition-all duration-500 z-20">
            <AnimatePresence mode='wait'>
              {step === 0 && <InfoCard key="0" title="System Ready" text="Waiting for event trigger..." sub="Idle" icon={Zap} color="text-slate-500" />}
              {step === 1 && <InfoCard key="1" title="Data Ingestion" text="Receiving raw JSON payload via secure API gateway." sub="Latency: 12ms" icon={FileJson} color="text-blue-400" />}
              {step === 2 && <InfoCard key="2" title="Cryptographic Hashing" text="Applying SHA-256 algorithm with unique salt." sub="Entropy: High" icon={Lock} color="text-pink-400" />}
              {step === 3 && <InfoCard key="3" title="Merkle Tree Construction" text="Hash added as leaf node. Root hash recalculated." sub="Tree Depth: 4" icon={GitMerge} color="text-emerald-400" />}
              {step === 4 && <InfoCard key="4" title="Ledger Anchor" text="Root hash permanently written to distributed ledger." sub="Finality: Instant" icon={Database} color="text-cyan-400" />}
              {step === 5 && <InfoCard key="5" title="Audit Complete" text="Event is now immutable and verifiable forever." sub="Status: Secured" icon={ShieldCheck} color="text-green-400" />}
            </AnimatePresence>

            <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:block">
               <button 
                 onClick={restart}
                 disabled={isAutoPlaying}
                 className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                   isAutoPlaying 
                     ? 'bg-slate-800 text-slate-500 cursor-wait' 
                     : 'bg-white text-slate-900 hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-500/20'
                 }`}
               >
                 {isAutoPlaying ? 'Processing...' : 'Replay Simulation'}
                 {!isAutoPlaying && <ArrowRight size={16} />}
               </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- SUB COMPONENTS ---

const ConnectionPath = ({ start, end, active, color }) => {
  // FIXAT: Inga %-tecken här, vi använder rena koordinater mot viewBox
  return (
    <motion.path
      d={`M ${start.x} ${start.y} Q ${(start.x+end.x)/2} ${(start.y+end.y)/2 + (start.y > end.y ? 20 : -20)} ${end.x} ${end.y}`}
      fill="none"
      stroke={active ? color : "#1e293b"}
      strokeWidth={active ? "0.5" : "0.2"} // Tunna snygga linjer (relativt till viewBox)
      vectorEffect="non-scaling-stroke" // Håller linjen skarp oavsett skalning
      strokeDasharray={active ? "none" : "2 2"}
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0.2 }}
      animate={{ 
        pathLength: 1, 
        opacity: 1,
      }}
      transition={{ 
        duration: active ? 1.5 : 0, 
        ease: "easeInOut" 
      }}
    />
  );
};

const FloatingNode = ({ data, isActive, isCurrent }) => {
  return (
    <motion.div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
      style={{ left: `${data.x}%`, top: `${data.y}%` }}
      animate={{ 
        y: [0, -10, 0],
      }}
      transition={{ 
        duration: 4, 
        repeat: Infinity, 
        ease: "easeInOut",
        delay: data.id * 0.5 
      }}
    >
      {isCurrent && (
        <motion.div 
          className="absolute inset-0 rounded-2xl opacity-50 blur-xl"
          style={{ backgroundColor: data.color }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      <motion.div 
        className={`relative w-16 h-16 md:w-24 md:h-24 bg-[#0f172a] rounded-2xl border-2 flex flex-col items-center justify-center shadow-2xl transition-all duration-500`}
        animate={{
            scale: isActive ? 1 : 0.9,
            borderColor: isActive ? data.color : '#1e293b',
            opacity: isActive ? 1 : 0.5,
            filter: isActive ? 'grayscale(0%)' : 'grayscale(100%)'
        }}
      >
        <data.icon className={`w-6 h-6 md:w-10 md:h-10 mb-2 transition-colors duration-300`} style={{ color: isActive ? data.color : '#64748b' }} />
        <span className={`text-[8px] md:text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-white' : 'text-slate-600'}`}>
          {data.label}
        </span>
      </motion.div>
    </motion.div>
  );
};

const InfoCard = ({ title, text, sub, icon: Icon, color }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="flex items-center gap-6 max-w-2xl"
  >
    <div className={`p-4 rounded-2xl bg-slate-900 border border-slate-800 ${color}`}>
      <Icon size={32} />
    </div>
    <div>
      <div className={`text-xs font-bold mb-1 uppercase tracking-widest ${color}`}>{sub}</div>
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm md:text-base leading-relaxed">{text}</p>
    </div>
  </motion.div>
);

export default IntegrityEngine;