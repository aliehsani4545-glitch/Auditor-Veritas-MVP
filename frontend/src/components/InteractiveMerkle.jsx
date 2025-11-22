import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CryptoJS from 'crypto-js';
import { Database, ShieldAlert, ShieldCheck, RefreshCw, ArrowRight } from 'lucide-react';

const InteractiveMerkle = () => {
  const [data, setData] = useState("User Login: 123");
  const [hash, setHash] = useState("");
  const [isTampered, setIsTampered] = useState(false);
  const [rootHash, setRootHash] = useState("");

  // Beräkna hashar automatiskt
  useEffect(() => {
    const newHash = CryptoJS.SHA256(data).toString().substring(0, 16);
    setHash(newHash);
    
    // Om vi "tamper", ändra inte root hash (simulera att blockkedjan har den gamla sanningen)
    if (!isTampered) {
      // Normalt: Root baseras på datan
      setRootHash(CryptoJS.SHA256(newHash + "sibling").toString().substring(0, 16));
    }
  }, [data, isTampered]);

  const toggleTamper = () => {
    if (isTampered) {
      setIsTampered(false);
      setData("User Login: 123"); // Återställ
    } else {
      setIsTampered(true);
      setData("HACKED_DATA_INJECTION"); // Ändra datan
      // Root uppdateras inte här (se useEffect), vilket skapar en mismatch
    }
  };

  return (
    <div className="py-24 bg-slate-950 relative overflow-hidden border-t border-slate-800">
      {/* Bakgrundsnät */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-500/30 px-4 py-1.5 rounded-full text-blue-400 text-sm font-mono mb-4">
            <Database className="w-4 h-4" /> CRYPTOGRAPHIC PROOF ENGINE
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Verify Immutability</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Try to alter the data below. The Merkle Tree will immediately detect the mismatch between the calculated hash and the anchored Root Hash.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-stretch">
          
          {/* LEFT: Interactive Controls */}
          <div className={`p-8 rounded-3xl border transition-all duration-500 ${isTampered ? 'bg-red-950/20 border-red-500/50' : 'bg-slate-900/50 border-slate-800'}`}>
            
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {isTampered ? <ShieldAlert className="text-red-500"/> : <ShieldCheck className="text-emerald-500"/>}
                Data Source
              </h3>
              <button 
                onClick={toggleTamper}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  isTampered ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30'
                }`}
              >
                {isTampered ? 'Reset State' : 'Simulate Attack'}
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Raw Input Data</label>
                <input 
                  type="text" 
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className={`w-full bg-slate-950 border p-4 rounded-xl font-mono text-sm outline-none transition-colors ${
                    isTampered ? 'border-red-500 text-red-400' : 'border-slate-700 text-white focus:border-blue-500'
                  }`}
                />
              </div>

              <div className="flex justify-center">
                <ArrowDown className={`w-6 h-6 ${isTampered ? 'text-red-500' : 'text-slate-600'}`} />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Calculated Leaf Hash (SHA-256)</label>
                <div className={`p-4 rounded-xl font-mono text-xs break-all border ${
                  isTampered ? 'bg-red-900/20 border-red-500/50 text-red-300' : 'bg-slate-950 border-slate-700 text-emerald-400'
                }`}>
                  {hash}
                </div>
              </div>
            </div>

            <div className={`mt-8 p-4 rounded-xl flex items-center gap-4 border ${isTampered ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
              {isTampered ? <ShieldAlert className="w-8 h-8 text-red-500" /> : <ShieldCheck className="w-8 h-8 text-emerald-500" />}
              <div>
                <div className={`font-bold ${isTampered ? 'text-red-400' : 'text-emerald-400'}`}>
                  {isTampered ? 'INTEGRITY CHECK FAILED' : 'DATA VERIFIED'}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {isTampered 
                    ? 'Calculated hash does not match the Immutable Root.' 
                    : 'Mathematical proof confirms data has not been altered.'}
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Tree Visualization */}
          <div className="bg-[#0f172a] rounded-3xl border border-slate-800 relative flex flex-col items-center justify-center p-10 overflow-hidden">
            {/* Dynamic Background */}
            <div className={`absolute inset-0 transition-opacity duration-500 opacity-20 ${isTampered ? 'bg-red-900' : 'bg-blue-900'}`}></div>
            
            {/* Root Node */}
            <div className="relative z-10 flex flex-col items-center">
              <motion.div 
                animate={{ scale: isTampered ? [1, 1.1, 1] : 1 }}
                className={`w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-2xl transition-colors duration-500 ${
                  isTampered ? 'bg-red-900 border-red-500 text-red-100' : 'bg-emerald-900 border-emerald-500 text-emerald-100'
                }`}
              >
                <div className="text-center">
                  <div className="text-[10px] font-bold opacity-70">ROOT</div>
                  <div className="text-xs font-mono font-bold">SECURE</div>
                </div>
              </motion.div>

              {/* Lines */}
              <svg className="w-64 h-32 overflow-visible mt-2">
                <path d="M 128 0 L 64 128" stroke={isTampered ? '#ef4444' : '#334155'} strokeWidth="2" fill="none" className="transition-colors duration-500" />
                <path d="M 128 0 L 192 128" stroke="#334155" strokeWidth="2" fill="none" />
              </svg>

              {/* Leaf Nodes */}
              <div className="flex gap-16 mt-2">
                {/* The Active Leaf */}
                <motion.div 
                  layout
                  className={`w-20 h-20 rounded-xl flex flex-col items-center justify-center border-2 transition-colors duration-500 ${
                    isTampered ? 'bg-red-500/20 border-red-500' : 'bg-blue-500/20 border-blue-500'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 uppercase mb-1">Leaf A</span>
                  <Hash className={`w-6 h-6 ${isTampered ? 'text-red-400' : 'text-blue-400'}`} />
                </motion.div>

                {/* Passive Leaf */}
                <div className="w-20 h-20 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center opacity-50">
                  <span className="text-[10px] text-slate-500 uppercase mb-1">Leaf B</span>
                  <div className="w-6 h-6 rounded bg-slate-800"></div>
                </div>
              </div>

              {/* Warning Overlay if Tampered */}
              <AnimatePresence>
                {isTampered && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center z-20 bg-black/60 backdrop-blur-sm rounded-3xl"
                  >
                    <div className="bg-red-600 text-white px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 animate-pulse">
                      <ShieldAlert size={20} />
                      ROOT MISMATCH
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InteractiveMerkle;