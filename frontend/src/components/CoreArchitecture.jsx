import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Database, Cpu, Activity, Lock, Hash, Server } from 'lucide-react';

// --- Styles för animationer ---
const style = document.createElement('style');
style.textContent = `
  @keyframes shine {
    from { background-position: 0% 0%; }
    to { background-position: 200% 0%; }
  }
  .animate-shine {
    background-size: 200% auto;
    animation: shine 3s linear infinite;
  }
`;
document.head.appendChild(style);

// --- Background Components ---
const CleanMesh = () => (
  <div className="absolute inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:40px_40px] opacity-60"></div>
    <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white"></div>
  </div>
);

const CoreArchitecture = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  // KORT-DATA: Uppdaterad med mer INTENSIVA färger
  const cards = [
    {
      id: "node-1",
      theme: "blue",
      // Intensivare Blå Gradient & Border
      bg: "bg-gradient-to-br from-white via-blue-50 to-blue-100",
      border: "border-blue-200",
      accent: "text-blue-700",
      iconBg: "bg-blue-100 border-blue-200",
      shadow: "shadow-xl shadow-blue-600/10 hover:shadow-blue-600/20",
      title: "CLIENT_HASH_MODULE",
      subtitle: "LOCAL PROCESSING",
      dataLabel: "Algorithm",
      dataValue: "SHA-256",
      status: "HASHING",
      icon: Shield
    },
    {
      id: "node-2",
      theme: "emerald",
      // Intensivare Emerald Gradient & Border
      bg: "bg-gradient-to-br from-white via-emerald-50 to-emerald-100",
      border: "border-emerald-200",
      accent: "text-emerald-700",
      iconBg: "bg-emerald-100 border-emerald-200",
      shadow: "shadow-xl shadow-emerald-600/10 hover:shadow-emerald-600/20",
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
      // Intensivare Lila Gradient & Border
      bg: "bg-gradient-to-br from-white via-purple-50 to-purple-100",
      border: "border-purple-200",
      accent: "text-purple-700",
      iconBg: "bg-purple-100 border-purple-200",
      shadow: "shadow-xl shadow-purple-600/10 hover:shadow-purple-600/20",
      title: "MERKLE_STORE_V1",
      subtitle: "IMMUTABLE DB",
      dataLabel: "Root Hash",
      dataValue: "0x9f...a2",
      status: "APPENDING",
      icon: Database
    }
  ];

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
    <div className="relative py-24 overflow-hidden bg-white text-slate-900">
      <CleanMesh />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* LEFT: CONTENT CONTROLS */}
          <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 shadow-sm">
                <Cpu size={14} /> System Architecture
              </div>
              
              {/* RUBRIK MED FLASH-EFFEKT */}
              <h2 className="text-4xl md:text-5xl font-extrabold leading-tight text-slate-900">
                The bedrock of <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-emerald-500 animate-shine">
                  verifiable truth.
                </span>
              </h2>
              <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
                 We prioritize cryptographic proof over trust. Here is how the data flows through our system.
              </p>

              <div className="flex flex-col gap-4 pt-4">
                {content.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = activeFeature === idx;
                  return (
                   <div 
                      key={idx}
                      onClick={() => setActiveFeature(idx)}
                      className={`group p-5 rounded-2xl cursor-pointer transition-all duration-300 border ${
                        isActive 
                          ? 'bg-white border-blue-200 shadow-lg shadow-blue-900/5 scale-[1.02]' 
                          : 'bg-transparent border-transparent hover:bg-slate-50'
                      }`}
                    >
                        <h3 className={`text-base font-bold mb-2 flex items-center gap-3 ${isActive ? 'text-blue-700' : 'text-slate-700 group-hover:text-slate-900'}`}>
                          <div className={`p-2 rounded-lg transition-colors duration-300 ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                            <Icon size={18} />
                          </div>
                          {item.title}
                        </h3>
                        <p className={`text-sm leading-relaxed pl-[52px] ${isActive ? 'text-slate-600' : 'text-slate-500'}`}>
                          {item.text}
                        </p>
                   </div>
                  )
                })}
              </div>
          </div>

          {/* RIGHT: THE 3D CARD STACK */}
          <div className="relative h-[400px] lg:h-[500px] flex items-center justify-center perspective-[1200px] pointer-events-none lg:pointer-events-auto">
              {cards.map((card, index) => {
                const offset = (index - activeFeature + cards.length) % cards.length;
                const isFront = offset === 0;
                const isMiddle = offset === 1;
                const CardIcon = card.icon;

                return (
                  <motion.div
                    key={card.id}
                    className={`absolute w-[340px] md:w-[380px] h-[220px] md:h-[250px] rounded-[24px] p-6 flex flex-col justify-between border backdrop-blur-md transition-all duration-500 ${card.bg} ${card.border} ${card.shadow}`}
                    animate={{
                      y: isFront ? 0 : isMiddle ? -40 : -80,
                      z: isFront ? 0 : isMiddle ? -50 : -100,
                      scale: isFront ? 1 : isMiddle ? 0.95 : 0.9,
                      opacity: isFront ? 1 : isMiddle ? 0.8 : 0.5,
                      rotateX: isFront ? 0 : isMiddle ? 5 : 10,
                    }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                    style={{
                      zIndex: cards.length - offset,
                      transformStyle: "preserve-3d",
                    }}
                  >
                      {/* Card Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className={`text-[10px] font-extrabold tracking-widest uppercase mb-1 opacity-70 ${card.accent}`}>
                             {card.subtitle}
                          </div>
                          <div className="text-lg font-bold text-slate-800 tracking-tight">{card.title}</div>
                        </div>
                        <div className={`p-2.5 rounded-xl border shadow-sm ${card.iconBg}`}>
                          <CardIcon size={20} className={card.accent} />
                        </div>
                      </div>

                      {/* Card Data (Mitten) */}
                      <div className="font-mono mt-4">
                         <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{card.dataLabel}</div>
                         <div className="flex items-center gap-2">
                            <Activity size={16} className={card.accent + (isFront ? " animate-pulse" : "")} />
                            <div className="text-xl text-slate-900 font-bold tracking-tight">{card.dataValue}</div>
                         </div>
                      </div>

                      {/* Card Footer */}
                      <div className="flex justify-between items-center pt-4 border-t border-slate-200/60 mt-auto">
                         <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/80 border border-slate-200/50 shadow-sm">
                            <div className={`w-2 h-2 rounded-full ${card.accent.replace('text', 'bg') + (isFront ? " animate-pulse" : "")}`}></div>
                            <span className={`text-[10px] font-bold tracking-wider ${card.accent}`}>{card.status}</span>
                         </div>
                         <div className="text-[10px] text-slate-400 font-mono font-medium">ID: {card.id.toUpperCase()}</div>
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