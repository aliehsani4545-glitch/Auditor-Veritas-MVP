import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Shield, Zap, Database, Cpu, Activity } from 'lucide-react';
import { NeuralBackground, GlowingMesh } from './SharedBackgrounds';

const CoreArchitecture = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const cards = [
    {
      id: "edge",
      theme: "dark", 
      bg: "bg-[#0f172a]", 
      accent: "text-blue-400",
      border: "border-blue-500/30",
      title: "EDGE_ENCRYPT_V1",
      subtitle: "CLIENT SIDE",
      hash: "SHA-256: 8f92...a1b2",
      status: "SECURE",
      icon: Shield
    },
    {
      id: "ingest",
      theme: "green", 
      bg: "bg-[#064e3b]", 
      accent: "text-emerald-300",
      border: "border-emerald-500/30",
      title: "STREAM_NODE_01",
      subtitle: "INGESTION",
      hash: "TLS-1.3: HANDSHAKE",
      status: "ACTIVE",
      icon: Zap
    },
    {
      id: "ledger",
      theme: "light",
      bg: "bg-[#1e293b]", 
      accent: "text-purple-300",
      border: "border-purple-500/30",
      title: "LEDGER_ANCHOR",
      subtitle: "IMMUTABLE",
      hash: "ROOT: 0x9f8a...b2c1",
      status: "LOCKED",
      icon: Database
    }
  ];

  const content = [
    {
      title: "Zero-Trust Encryption",
      text: "Data is hashed on the client device. We never see raw PII, only the cryptographic proof of its existence."
    },
    {
      title: "High-Velocity Ingestion",
      text: "Distributed node network handles millions of events per second with automatic load balancing and failover."
    },
    {
      title: "Immutable Anchoring",
      text: "Logs are sealed in sequential Merkle blocks. Rewriting history is mathematically impossible."
    }
  ];

  return (
    <div className="relative py-20 md:py-32 overflow-hidden bg-[#020617] text-white">
      <NeuralBackground variant="blue" />
      <GlowingMesh />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* LEFT: CONTENT CONTROLS */}
          <div className="space-y-8 order-2 lg:order-1">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md text-blue-400">
               <Cpu size={14} /> System Architecture
             </div>
             
             <h2 className="text-3xl md:text-5xl font-bold leading-tight">
               Engineered for <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 animate-text-gradient">absolute truth.</span>
             </h2>

             <div className="flex flex-col gap-4">
               {content.map((item, idx) => (
                 <div 
                   key={idx}
                   onClick={() => setActiveFeature(idx)}
                   className={`p-5 md:p-6 rounded-2xl cursor-pointer transition-all duration-300 border relative overflow-hidden group ${
                     activeFeature === idx 
                       ? 'bg-white/5 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.1)]' 
                       : 'bg-transparent border-transparent hover:bg-white/5'
                   }`}
                 >
                    <div className="relative z-10">
                      <h3 className={`text-base md:text-lg font-bold mb-1 flex items-center gap-3 ${activeFeature === idx ? 'text-white' : 'text-slate-400'}`}>
                        {idx === 0 && <Shield size={18} className={activeFeature === idx ? 'text-blue-400' : ''}/>}
                        {idx === 1 && <Zap size={18} className={activeFeature === idx ? 'text-emerald-400' : ''}/>}
                        {idx === 2 && <Database size={18} className={activeFeature === idx ? 'text-purple-400' : ''}/>}
                        {item.title}
                      </h3>
                      <p className={`text-sm leading-relaxed ${activeFeature === idx ? 'text-slate-300' : 'text-slate-500'}`}>
                        {item.text}
                      </p>
                    </div>
                 </div>
               ))}
             </div>
          </div>

          {/* RIGHT: 3D CARD STACK (RESPONSIVE) */}
          <div className="relative h-[450px] md:h-[600px] flex items-center justify-center perspective-[1200px] order-1 lg:order-2 mt-8 lg:mt-0">
             {cards.map((card, index) => {
               const offset = (index - activeFeature + cards.length) % cards.length;
               const isFront = offset === 0;
               const isMiddle = offset === 1;

               // Justera vertikal stapling för mobil (mindre avstånd) vs desktop
               const yOffset = window.innerWidth < 768 ? 30 : 45; 

               return (
                 <motion.div
                   key={card.id}
                   className={`absolute w-[280px] h-[180px] sm:w-[360px] sm:h-[240px] rounded-[20px] sm:rounded-[24px] p-5 sm:p-6 flex flex-col justify-between shadow-2xl backdrop-blur-xl border overflow-hidden ${card.bg} ${card.border}`}
                   animate={{
                     y: isFront ? 0 : isMiddle ? -yOffset : -(yOffset * 2),
                     z: isFront ? 0 : isMiddle ? -50 : -100,
                     scale: isFront ? 1 : isMiddle ? 0.95 : 0.9,
                     opacity: isFront ? 1 : isMiddle ? 0.6 : 0.3,
                     rotateX: isFront ? 0 : 10,
                   }}
                   transition={{ type: "spring", stiffness: 120, damping: 20 }}
                   style={{
                     zIndex: cards.length - offset,
                     transformStyle: "preserve-3d",
                     boxShadow: isFront ? "0 25px 50px -12px rgba(0,0,0,0.5)" : "none"
                   }}
                 >
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent" />
                    
                    <div className="relative z-10 flex justify-between items-start">
                       <div className={`font-bold tracking-widest text-[9px] sm:text-[10px] uppercase border border-white/10 px-2 py-1 rounded bg-black/20 ${card.accent}`}>
                          {card.subtitle}
                       </div>
                       <Activity size={18} className={`${card.accent} animate-pulse`} />
                    </div>

                    <div className="relative z-10 mt-2">
                       <label className="text-[8px] sm:text-[9px] text-slate-400 uppercase tracking-wider block mb-1">Session Protocol ID</label>
                       <div className={`font-mono text-xs sm:text-base tracking-wide ${card.accent} opacity-90 break-all`}>
                          {card.hash}
                       </div>
                    </div>

                    <div className="relative z-10 flex justify-between items-end border-t border-white/10 pt-3 sm:pt-4">
                       <div className="flex flex-col">
                          <span className={`text-[8px] sm:text-[9px] uppercase font-bold opacity-60 ${card.accent}`}>Node ID</span>
                          <span className={`text-xs sm:text-sm font-bold text-white`}>{card.title}</span>
                       </div>
                       <div className={`text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded bg-white/5 border border-white/10 ${card.accent}`}>
                          {card.status}
                       </div>
                    </div>
                 </motion.div>
               );
             })}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CoreArchitecture;