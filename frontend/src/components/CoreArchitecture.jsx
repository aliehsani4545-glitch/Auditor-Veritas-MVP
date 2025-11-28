import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Database, Cpu, Activity, Lock, Hash, Server } from 'lucide-react';

// --- Shared Background Components (Inlined for simplicity) ---
const GlowingMesh = ({ variant = "default" }) => (
  <div className={`absolute inset-0 pointer-events-none z-0 ${variant === 'blue' ? 'opacity-30' : 'opacity-20'}`}>
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
    <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div>
  </div>
);

const NeuralBackground = ({ variant = "default" }) => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-900/20 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-900/20 blur-[120px]" />
    </div>
);

const CoreArchitecture = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const cards = [
    {
      id: "node-1",
      theme: "blue",
      bg: "bg-slate-900/80",
      accent: "text-blue-400",
      border: "border-blue-500/30",
      shadow: "shadow-blue-500/20",
      title: "CLIENT_HASH_MODULE",
      subtitle: "LOCAL PROCESSING",
      dataLabel: "Algorithm",
      dataValue: "SHA-256",
      status: "HASHING",
      icon: Shield
    },
    {
      id: "node-2",
      theme: "green",
      bg: "bg-slate-900/80",
      accent: "text-emerald-400",
      border: "border-emerald-500/30",
      shadow: "shadow-emerald-500/20",
      title: "INGEST_LOAD_BALANCER",
      subtitle: "THROUGHPUT",
      dataLabel: "Req/Sec",
      dataValue: "12,450",
      status: "ONLINE",
      icon: Zap
    },
    {
      id: "node-3",
      theme: "purple",
      bg: "bg-slate-900/80",
      accent: "text-purple-400",
      border: "border-purple-500/30",
      shadow: "shadow-purple-500/20",
      title: "MERKLE_STORE_V1",
      subtitle: "IMMUTABLE DB",
      dataLabel: "Root Hash",
      dataValue: "0x9f...a2",
      status: "APPENDING",
      icon: Database
    }
  ];

  // Updated content for clarity and honesty
  const content = [
    {
      icon: Hash, 
      title: "Client-Side Pseudonymization",
      text: "PII is hashed (SHA-256) locally on the client device before transmission. The raw identity never touches our servers."
    },
    {
      icon: Server,
      title: "Scalable Event Ingestion",
      text: "Stateless API nodes handle high-velocity log traffic behind standard load balancers, ensuring reliable data capture."
    },
    {
      icon: Lock,
      title: "Cryptographic Sealing",
      text: "Received logs are grouped into blocks and hashed. This creates a mathematical proof that historical data hasn't been altered."
    }
  ];

  return (
    <div className="relative py-32 overflow-hidden bg-slate-950 text-white">
      
      <GlowingMesh variant="default" />
      <NeuralBackground variant="blue" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          
          {/* LEFT: CONTENT CONTROLS */}
          <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold uppercase tracking-wider text-blue-400 backdrop-blur-md">
                <Cpu size={14} /> System Architecture
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                The bedrock of <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 animate-text-gradient">verifiable truth.</span>
              </h2>
              <p className="text-lg text-slate-300 max-w-lg leading-relaxed">
                 We prioritize cryptographic proof over trust. Here is how the data flows through our system.
              </p>

              <div className="flex flex-col gap-4 pt-4">
                {content.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                   <div 
                     key={idx}
                     onClick={() => setActiveFeature(idx)}
                     className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border backdrop-blur-md ${
                       activeFeature === idx 
                         ? 'bg-white/5 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.1)]' 
                         : 'bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10'
                     }`}
                   >
                       <h3 className={`text-lg font-bold mb-2 flex items-center gap-3 ${activeFeature === idx ? 'text-white' : 'text-slate-200'}`}>
                         <Icon size={20} className={activeFeature === idx ? 'text-blue-400' : 'text-slate-400'} />
                         {item.title}
                       </h3>
                       <p className={`text-sm leading-relaxed ${activeFeature === idx ? 'text-slate-300' : 'text-slate-400'}`}>
                         {item.text}
                       </p>
                   </div>
                  )
                })}
              </div>
          </div>

          {/* RIGHT: THE 3D CARD STACK */}
          <div className="relative h-[600px] flex items-center justify-center perspective-[1200px] pointer-events-none lg:pointer-events-auto">
              {cards.map((card, index) => {
                // Calculate position relative to active card
                const offset = (index - activeFeature + cards.length) % cards.length;
                const isFront = offset === 0;
                const isMiddle = offset === 1;
                const CardIcon = card.icon;

                return (
                  <motion.div
                    key={card.id}
                    className={`absolute w-[380px] h-[250px] rounded-[28px] p-6 flex flex-col justify-between backdrop-blur-xl border overflow-hidden ${card.bg} ${card.border} ${card.shadow}`}
                    animate={{
                      y: isFront ? 0 : isMiddle ? -55 : -110,
                      z: isFront ? 0 : isMiddle ? -60 : -120,
                      scale: isFront ? 1 : isMiddle ? 0.95 : 0.9,
                      opacity: isFront ? 1 : isMiddle ? 0.5 : 0.2,
                      rotateX: isFront ? 0 : isMiddle ? 5 : 10,
                    }}
                    transition={{ type: "spring", stiffness: 100, damping: 20, mass: 1 }}
                    style={{
                      zIndex: cards.length - offset,
                      transformStyle: "preserve-3d",
                      boxShadow: isFront ? `0 25px 50px -12px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.05)` : 'none'
                    }}
                  >
                     {/* Tech texture background */}
                     <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none" />
                     
                     {/* Top section */}
                     <div className="relative z-10 flex justify-between items-start">
                        <div>
                          <div className={`text-[10px] font-extrabold tracking-widest uppercase mb-1 ${card.accent} opacity-80`}>
                             {card.subtitle}
                          </div>
                          <div className="text-lg font-bold text-white tracking-tight">{card.title}</div>
                        </div>
                        <div className={`p-2 rounded-full bg-white/5 border border-white/10 ${card.accent}`}>
                          <CardIcon size={20} />
                        </div>
                     </div>

                     {/* Middle section (Technical Data) */}
                     <div className="relative z-10 font-mono">
                        <div className="text-[9px] text-slate-400 uppercase tracking-wider mb-1">{card.dataLabel}</div>
                        <div className="flex items-center gap-2">
                           <Activity size={14} className={card.accent + (isFront ? " animate-pulse" : "")} />
                           <div className="text-base text-white font-bold tracking-wider">{card.dataValue}</div>
                        </div>
                     </div>

                     {/* Bottom section */}
                     <div className="relative z-10 flex justify-between items-center pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${card.accent.replace('text', 'bg') + (isFront ? " animate-pulse" : "")}`}></div>
                           <span className={`text-xs font-bold tracking-wider ${card.accent}`}>{card.status}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">ID: {card.id.toUpperCase()}</div>
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