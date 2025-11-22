import React, { useState } from 'react';
import { ShieldCheck, Database, KeyRound, FileLock2 } from 'lucide-react';

const NetworkGrid = () => {
  const [activeId, setActiveId] = useState(null);

  const nodes = [
    { id: 1, title: "GDPR Ready", icon: FileLock2, x: "10%", y: "20%", color: "#f59e0b" },
    { id: 2, title: "Merkle Proofs", icon: Database, x: "80%", y: "20%", color: "#3b82f6" },
    { id: 3, title: "Key Rotation", icon: KeyRound, x: "20%", y: "80%", color: "#8b5cf6" },
    { id: 4, title: "SHA-256", icon: ShieldCheck, x: "85%", y: "75%", color: "#10b981" },
  ];

  return (
    <div className="relative w-full h-[500px] bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden my-20">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Lines (SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.2"/>
            <stop offset="50%" stopColor="#64748b" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.2"/>
          </linearGradient>
        </defs>
        <path d="M 10% 20% L 85% 75%" stroke="url(#lineGradient)" strokeWidth="2" />
        <path d="M 80% 20% L 20% 80%" stroke="url(#lineGradient)" strokeWidth="2" />
        <path d="M 10% 20% L 20% 80%" stroke="url(#lineGradient)" strokeWidth="1" strokeDasharray="4 4" />
        <path d="M 80% 20% L 85% 75%" stroke="url(#lineGradient)" strokeWidth="1" strokeDasharray="4 4" />
      </svg>

      {/* Center Label */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-0 pointer-events-none">
         <h3 className="text-2xl font-black text-slate-200 uppercase tracking-widest">Core Architecture</h3>
      </div>

      {/* Interactive Nodes */}
      {nodes.map((node) => (
        <div 
          key={node.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          style={{ left: node.x, top: node.y }}
          onMouseEnter={() => setActiveId(node.id)}
          onMouseLeave={() => setActiveId(null)}
        >
          {/* Pulsing Glow */}
          <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20" style={{ backgroundColor: node.color }}></div>
          
          {/* Node Circle */}
          <div className={`relative w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center border-2 transition-all duration-300 z-10 ${activeId === node.id ? 'scale-110 border-slate-900' : 'border-transparent'}`}>
            <node.icon className={`w-8 h-8 transition-colors ${activeId === node.id ? 'text-slate-900' : 'text-slate-400'}`} style={{ color: activeId === node.id ? node.color : undefined }} />
          </div>

          {/* Label & Info (Hover) */}
          <div className={`absolute top-20 left-1/2 -translate-x-1/2 w-48 bg-white p-4 rounded-xl shadow-xl border border-slate-100 text-center transition-all duration-300 pointer-events-none z-20 ${activeId === node.id ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <h4 className="font-bold text-slate-900 mb-1">{node.title}</h4>
            <p className="text-xs text-slate-500">Click to view technical specification.</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NetworkGrid;