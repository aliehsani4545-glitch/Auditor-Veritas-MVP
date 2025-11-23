import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, ShieldCheck, Link as LinkIcon, Hash, Check, Activity, Server } from 'lucide-react';

const Block = ({ index, hash, prevHash, active }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    className={`relative flex-shrink-0 w-full md:w-64 p-4 rounded-xl border-2 transition-all duration-500 ${active ? 'bg-[#0a2540] border-[#00d4ff] shadow-[0_0_30px_rgba(0,212,255,0.15)]' : 'bg-white border-slate-200 opacity-60'}`}
  >
    <div className="flex justify-between items-center mb-3">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg ${active ? 'bg-[#00d4ff]/20 text-[#00d4ff]' : 'bg-slate-100 text-slate-400'}`}>
          <Database size={14} />
        </div>
        <span className={`text-xs font-bold ${active ? 'text-white' : 'text-slate-600'}`}>Block #{index}</span>
      </div>
      {active && <div className="w-2 h-2 bg-[#00d4ff] rounded-full animate-pulse"></div>}
    </div>
    
    <div className="space-y-2 font-mono text-[10px]">
      <div>
        <span className="text-slate-500 block mb-0.5">Hash</span>
        <div className={`truncate p-1.5 rounded ${active ? 'bg-slate-900 text-[#00d4ff]' : 'bg-slate-50 text-slate-400'}`}>{hash}</div>
      </div>
      <div>
        <span className="text-slate-500 block mb-0.5 flex items-center gap-1"><LinkIcon size={8}/> Prev</span>
        <div className={`truncate p-1.5 rounded ${active ? 'bg-slate-900 text-slate-400' : 'bg-slate-50 text-slate-300'}`}>{prevHash}</div>
      </div>
    </div>

    {/* Connecting Line (Mobile: Bottom, Desktop: Right) */}
    <div className="absolute left-1/2 -bottom-6 w-0.5 h-6 bg-slate-300 md:hidden transform -translate-x-1/2"></div>
    <div className="absolute top-1/2 -right-6 w-6 h-0.5 bg-slate-300 hidden md:block transform -translate-y-1/2"></div>
  </motion.div>
);

const IntegrityEngine = () => {
  const [blocks, setBlocks] = useState([
    { hash: "0x8f92...a1", prevHash: "0x0000...00" },
    { hash: "0x7b21...c4", prevHash: "0x8f92...a1" }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlocks(prev => {
        const lastBlock = prev[prev.length - 1];
        const newHash = "0x" + Math.random().toString(16).substr(2, 8) + "...";
        const newBlock = { hash: newHash, prevHash: lastBlock.hash };
        // Håll max 3 block synliga för snygghet
        const newChain = [...prev, newBlock];
        if (newChain.length > 3) newChain.shift();
        return newChain;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-16 md:py-24 bg-slate-50 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wide mb-4">
             <ShieldCheck size={14} className="text-[#00d4ff]" /> Integrity Engine
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Mathematically Proven History.
          </h2>
          <p className="text-slate-500 text-sm md:text-base">
            We use a Merkle Tree structure to link every event. 
            Validating the chain takes milliseconds; forging it is impossible.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* LEFT: Visualizer */}
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center md:items-stretch relative z-10">
             <AnimatePresence mode='popLayout'>
               {blocks.map((block, i) => (
                 <Block 
                   key={block.hash} 
                   index={9420 + i} 
                   {...block} 
                   active={i === blocks.length - 1} 
                 />
               ))}
             </AnimatePresence>
          </div>

          {/* RIGHT: Status Panel */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
             <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Activity size={18} className="text-emerald-500" /> Live Verification
                </h3>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Active
                </span>
             </div>
             
             <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500">Consistency Check</span>
                   <span className="text-slate-900 font-mono font-bold flex items-center gap-2">
                     12ms <Check size={14} className="text-emerald-500"/>
                   </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500">Root Hash Anchor</span>
                   <span className="text-slate-900 font-mono font-bold flex items-center gap-2">
                     Eth Mainnet <Server size={14} className="text-slate-400"/>
                   </span>
                </div>
                
                {/* Terminal Look */}
                <div className="mt-4 bg-slate-900 rounded-lg p-3 font-mono text-[10px] text-slate-300 leading-relaxed">
                   <p>> verifying_chain(0x8f...)</p>
                   <p className="text-emerald-400">> integrity_ok: true</p>
                   <p>> next_block_candidate: ready</p>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default IntegrityEngine;