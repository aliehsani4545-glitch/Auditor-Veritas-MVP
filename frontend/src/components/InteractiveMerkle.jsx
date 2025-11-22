import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hash, GitMerge, Database, Search, CheckCircle2 } from 'lucide-react';

const InteractiveMerkle = () => {
  const [activeNode, setActiveNode] = useState(null);
  const [verifyPath, setVerifyPath] = useState([]);

  // Enkel visualisering av ett träd med 4 löv
  const nodes = {
    root: { id: 'root', label: 'Root Hash', x: 50, y: 20, color: '#10b981' },
    h1: { id: 'h1', label: 'Hash 1-2', x: 30, y: 50, color: '#3b82f6' },
    h2: { id: 'h2', label: 'Hash 3-4', x: 70, y: 50, color: '#3b82f6' },
    l1: { id: 'l1', label: 'Data A', x: 20, y: 80, color: '#64748b', val: 'User Login' },
    l2: { id: 'l2', label: 'Data B', x: 40, y: 80, color: '#64748b', val: 'Payment' },
    l3: { id: 'l3', label: 'Data C', x: 60, y: 80, color: '#64748b', val: 'Settings' },
    l4: { id: 'l4', label: 'Data D', x: 80, y: 80, color: '#64748b', val: 'Export' },
  };

  // Logik för att visa "Proof Path" (vilka noder behövs för att bevisa en löv?)
  const handleNodeClick = (id) => {
    setActiveNode(id);
    // Hårdkodad logik för demo: Om man klickar L1, behöver man L2 och H2 för att nå Root.
    if (id === 'l1') setVerifyPath(['l1', 'l2', 'h1', 'h2', 'root']);
    else if (id === 'l2') setVerifyPath(['l2', 'l1', 'h1', 'h2', 'root']);
    else if (id === 'l3') setVerifyPath(['l3', 'l4', 'h2', 'h1', 'root']);
    else if (id === 'l4') setVerifyPath(['l4', 'l3', 'h2', 'h1', 'root']);
    else setVerifyPath([]);
  };

  return (
    <div className="py-24 bg-slate-950 relative overflow-hidden border-t border-slate-800">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-500/30 px-4 py-1.5 rounded-full text-blue-400 text-sm font-mono mb-4">
            <Database className="w-4 h-4" /> INTERACTIVE DEMO
          </div>
          <h2 className="text-4xl font-bold text-white">Merkle Integrity Proof</h2>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
            Click on any <span className="text-slate-200 font-bold">Data Leaf (bottom row)</span> to verify its integrity. 
            The system will highlight the cryptographic path required to reconstruct the Root Hash.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left: Technical Explainer */}
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Search className="text-emerald-500" /> Proof Logic
            </h3>
            
            {!activeNode ? (
              <div className="text-slate-500 text-sm text-center py-10">
                Select a data node to begin verification.
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="text-xs text-slate-500 uppercase font-bold mb-1">Selected Data</div>
                  <div className="text-white font-mono bg-slate-800 p-3 rounded-lg border border-slate-700">
                    {nodes[activeNode]?.val || activeNode}
                  </div>
                </div>
                
                <div className="relative pl-4 border-l-2 border-slate-700 space-y-6">
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                    <h4 className="text-sm font-bold text-blue-400">1. Fetch Sibling</h4>
                    <p className="text-xs text-slate-400 mt-1">Get hash of neighbor node.</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 bg-purple-500 rounded-full"></div>
                    <h4 className="text-sm font-bold text-purple-400">2. Hash Together</h4>
                    <p className="text-xs text-slate-400 mt-1">SHA-256(Left + Right)</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <h4 className="text-sm font-bold text-emerald-400">3. Verify Root</h4>
                    <p className="text-xs text-slate-400 mt-1">Matches public ledger root.</p>
                  </div>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  <div>
                    <div className="font-bold text-emerald-400 text-sm">Mathematically Proven</div>
                    <div className="text-xs text-emerald-200/70">Data has not been altered.</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: The Visual Tree */}
          <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-3xl relative h-[500px] flex items-center justify-center overflow-hidden">
            
            {/* Connectors (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M 50 25 L 30 55" stroke="#334155" strokeWidth="0.5" />
              <path d="M 50 25 L 70 55" stroke="#334155" strokeWidth="0.5" />
              
              <path d="M 30 55 L 20 85" stroke="#334155" strokeWidth="0.5" />
              <path d="M 30 55 L 40 85" stroke="#334155" strokeWidth="0.5" />
              
              <path d="M 70 55 L 60 85" stroke="#334155" strokeWidth="0.5" />
              <path d="M 70 55 L 80 85" stroke="#334155" strokeWidth="0.5" />

              {/* Active Path Animation */}
              {verifyPath.length > 0 && (
                <>
                  <motion.path d="M 50 25 L 30 55" stroke="#10b981" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} />
                  <motion.path d="M 30 55 L 20 85" stroke="#10b981" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2 }} />
                </>
              )}
            </svg>

            {/* Nodes */}
            {Object.values(nodes).map((node) => {
              const isActive = verifyPath.includes(node.id);
              const isRoot = node.id === 'root';
              
              return (
                <motion.div
                  key={node.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all duration-300 ${isActive ? 'z-20 scale-110' : 'z-10'}`}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  onClick={() => !isRoot && handleNodeClick(node.id)}
                  whileHover={{ scale: 1.1 }}
                >
                  <div 
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg border-2 transition-colors duration-500 ${
                      isActive 
                        ? `bg-[${node.color}] border-white shadow-[0_0_20px_${node.color}]` 
                        : 'bg-slate-800 border-slate-700'
                    }`}
                    style={{ backgroundColor: isActive ? node.color : undefined }}
                  >
                    {isRoot ? <Database size={20} className="text-white"/> : <Hash size={20} className={isActive ? 'text-white' : 'text-slate-500'} />}
                  </div>
                  <div className={`mt-2 text-[10px] font-bold px-2 py-1 rounded ${isActive ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-500'}`}>
                    {node.label}
                  </div>
                </motion.div>
              )
            })}

          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMerkle;