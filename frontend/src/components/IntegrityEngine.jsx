import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, FileJson, Lock, GitMerge, Server, ShieldCheck, Cpu, Globe, ArrowRight, Zap } from 'lucide-react';

const IntegrityEngine = () => {
  const [step, setStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    let timer;
    if (isAutoPlaying) {
      timer = setTimeout(() => {
        setStep(1); 
        setTimeout(() => setStep(2), 1500); 
        setTimeout(() => setStep(3), 3000); 
        setTimeout(() => setStep(4), 4500); 
        setTimeout(() => { setStep(5); setIsAutoPlaying(false); }, 6000); 
      }, 100);
    }
    return () => clearTimeout(timer);
  }, [isAutoPlaying]);

  useEffect(() => { setIsAutoPlaying(true); }, []);

  const restart = () => { setStep(0); setTimeout(() => setIsAutoPlaying(true), 100); };

  // Kompaktare layout för mobil
  const nodes = isMobile ? [
    { id: 1, label: "Source", icon: Globe, x: 50, y: 10, color: "#3b82f6" }, 
    { id: 2, label: "Ingest", icon: Server, x: 50, y: 28, color: "#8b5cf6" }, 
    { id: 3, label: "Hash", icon: Cpu, x: 50, y: 46, color: "#ec4899" },    
    { id: 4, label: "Merkle", icon: GitMerge, x: 50, y: 64, color: "#10b981" }, 
    { id: 5, label: "Ledger", icon: Database, x: 50, y: 82, color: "#00d4ff" }, 
  ] : [
    { id: 1, label: "Event Source", icon: Globe, x: 10, y: 50, color: "#3b82f6" }, 
    { id: 2, label: "Ingestion API", icon: Server, x: 30, y: 20, color: "#8b5cf6" }, 
    { id: 3, label: "SHA-256 Engine", icon: Cpu, x: 50, y: 50, color: "#ec4899" },    
    { id: 4, label: "Merkle Tree", icon: GitMerge, x: 70, y: 20, color: "#10b981" }, 
    { id: 5, label: "Immutable Ledger", icon: Database, x: 90, y: 50, color: "#00d4ff" }, 
  ];

  return (
    <div className="py-16 md:py-24 bg-[#020617] relative overflow-hidden border-t border-slate-800/50">
      {/* Subtil bakgrunds-glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 md:mb-4 tracking-tight">
            The Integrity Engine
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Visualizing the lifecycle of a single audit event. <br className="hidden md:block"/> From raw JSON to immutable proof.
          </p>
        </div>

        {/* Container: Mycket mer kompakt höjd på mobil (450px vs 600px) */}
        <div className={`relative ${isMobile ? 'h-[480px]' : 'h-[550px]'} bg-slate-900/40 rounded-[2rem] border border-slate-800/60 shadow-2xl overflow-hidden backdrop-blur-sm`}>
          
          {/* SVG Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#3b82f6"/><stop offset="100%" stopColor="#00d4ff"/></linearGradient>
            </defs>
            {nodes.slice(0, -1).map((node, i) => (
              <ConnectionPath 
                key={i}
                start={{x: node.x, y: node.y}} 
                end={{x: nodes[i+1].x, y: nodes[i+1].y}} 
                active={step >= i + 1} 
                color="url(#lineGrad)" 
              />
            ))}
          </svg>

          {/* Nodes */}
          {nodes.map((node, i) => (
            <FloatingNode key={node.id} data={node} isActive={step >= i + 1} isCurrent={step === i + 1} isMobile={isMobile} />
          ))}

          {/* Info Panel (Bottom) */}
          <div className="absolute bottom-0 left-0 right-0 bg-[#020617]/95 border-t border-slate-800 p-4 md:p-6 backdrop-blur-xl z-30 h-[120px] md:h-[140px] flex items-center justify-between">
            <AnimatePresence mode='wait'>
              <InfoCard 
                key={step} 
                step={step} 
                isMobile={isMobile}
              />
            </AnimatePresence>

            {/* Replay Button (Desktop) */}
            <div className="hidden md:block">
               <button onClick={restart} disabled={isAutoPlaying} className={`px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center gap-2 ${isAutoPlaying ? 'bg-slate-800 text-slate-500 cursor-wait' : 'bg-white text-slate-900 hover:bg-blue-50 hover:shadow-lg'}`}>
                 {isAutoPlaying ? 'Running...' : 'Replay'} {!isAutoPlaying && <ArrowRight size={14} />}
               </button>
            </div>
          </div>
          
          {/* Mobile Replay Button (Floating Top Right) */}
          {!isAutoPlaying && (
            <motion.button 
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              onClick={restart}
              className="absolute top-4 right-4 md:hidden z-40 p-2.5 rounded-full bg-white text-slate-900 shadow-lg"
            >
              <ArrowRight size={16} />
            </motion.button>
          )}

        </div>
      </div>
    </div>
  );
};

// --- SUB COMPONENTS ---

const ConnectionPath = ({ start, end, active, color }) => (
  <motion.path
    d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
    fill="none"
    stroke={active ? color : "#1e293b"}
    strokeWidth={active ? "0.4" : "0.15"}
    strokeDasharray={active ? "none" : "1 1"}
    initial={{ pathLength: 0, opacity: 0.2 }}
    animate={{ pathLength: 1, opacity: 1 }}
    transition={{ duration: active ? 0.8 : 0, ease: "easeInOut" }}
  />
);

const FloatingNode = ({ data, isActive, isCurrent, isMobile }) => (
  <motion.div
    className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
    style={{ left: `${data.x}%`, top: `${data.y}%` }}
    animate={{ y: [0, -4, 0] }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: data.id * 0.5 }}
  >
    {isCurrent && (
      <motion.div className="absolute inset-0 rounded-full opacity-40 blur-lg" style={{ backgroundColor: data.color }} animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }} transition={{ duration: 1.5, repeat: Infinity }} />
    )}
    <motion.div 
      className={`relative flex flex-col items-center justify-center shadow-xl transition-all duration-500 bg-[#0f172a] border border-slate-800 ${isMobile ? 'w-10 h-10 rounded-xl' : 'w-16 h-16 rounded-2xl'}`}
      animate={{ scale: isActive ? 1 : 0.9, borderColor: isActive ? data.color : '#1e293b', opacity: isActive ? 1 : 0.4, filter: isActive ? 'grayscale(0%)' : 'grayscale(100%)' }}
    >
      <data.icon className={`transition-colors duration-300 ${isMobile ? 'w-4 h-4' : 'w-7 h-7'}`} style={{ color: isActive ? data.color : '#64748b' }} />
    </motion.div>
    {/* Label outside */}
    <span className={`absolute top-full mt-2 text-[9px] font-bold uppercase tracking-wider whitespace-nowrap ${isActive ? 'text-white' : 'text-slate-700'} ${isMobile ? 'hidden' : 'block'}`}>
      {data.label}
    </span>
  </motion.div>
);

const InfoCard = ({ step, isMobile }) => {
  const content = [
    { title: "System Ready", text: "Waiting for trigger...", icon: Zap, color: "text-slate-500" },
    { title: "Data Ingestion", text: "Receiving JSON via secure API gateway.", icon: FileJson, color: "text-blue-400" },
    { title: "Hashing", text: "SHA-256 algorithm with unique salt.", icon: Lock, color: "text-pink-400" },
    { title: "Merkle Tree", text: "Hash added as leaf node.", icon: GitMerge, color: "text-emerald-400" },
    { title: "Ledger Anchor", text: "Root hash written to distributed ledger.", icon: Database, color: "text-cyan-400" },
    { title: "Audit Secured", text: "Event is now immutable and verifiable.", icon: ShieldCheck, color: "text-green-400" }
  ][step];

  const Icon = content.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
      className="flex items-center gap-4 md:gap-6 w-full"
    >
      <div className={`p-2.5 md:p-3 rounded-xl bg-slate-900 border border-slate-800 shrink-0 ${content.color}`}>
        <Icon size={isMobile ? 20 : 28} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`font-bold text-white mb-0.5 truncate ${isMobile ? 'text-sm' : 'text-xl'}`}>{content.title}</h3>
        <p className={`text-slate-400 leading-snug truncate md:whitespace-normal ${isMobile ? 'text-[10px]' : 'text-sm'}`}>{content.text}</p>
      </div>
    </motion.div>
  );
};

export default IntegrityEngine;