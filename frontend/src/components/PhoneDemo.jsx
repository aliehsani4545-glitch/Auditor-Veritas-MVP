import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Cpu, Database, Shield, Activity, Wifi, Lock, GitCommit } from 'lucide-react';

const PhoneDemo = () => {
  const [step, setStep] = useState(0); // 0: Ingest, 1: Encrypt, 2: Immutable
  const [terminalLines, setTerminalLines] = useState([]);

  // Loopa stegen och uppdatera "terminalen"
  useEffect(() => {
    const cycle = [
      { s: 0, logs: ["> Initializing Secure Handshake...", "> TLS 1.3 Connected", "> Receiving Payload (2kb)..."] },
      { s: 1, logs: ["> Parsing JSON...", "> Salting Data (256-bit)...", "> SHA-256 Hashing...", "> AES-256 Encryption..."] },
      { s: 2, logs: ["> Merkle Tree Insertion...", "> Calculating Root Hash...", "> Block #9201 Finalized", "> Syncing to Node Cluster..."] }
    ];

    let index = 0;
    const timer = setInterval(() => {
      index = (index + 1) % 3;
      setStep(index);
      setTerminalLines(cycle[index].logs);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-[320px] h-[640px] mx-auto perspective-[1200px] group">
      <motion.div 
        initial={{ rotateY: -10, rotateX: 5 }}
        whileHover={{ rotateY: 0, rotateX: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full h-full transform-style-3d drop-shadow-2xl"
      >
        {/* Glowing Border Effect */}
        <div className="absolute -inset-1 bg-gradient-to-b from-blue-500 via-purple-500 to-emerald-500 rounded-[45px] opacity-20 blur-md"></div>

        {/* Phone Chassis */}
        <div className="absolute inset-0 bg-[#020617] rounded-[40px] shadow-2xl overflow-hidden border-[6px] border-slate-800 flex flex-col">
          
          {/* High-Tech Header */}
          <div className="h-14 bg-slate-900/90 backdrop-blur-md border-b border-slate-700 flex items-center justify-between px-5 pt-2">
            <div className="flex gap-2 items-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
              <span className="text-[10px] font-mono text-emerald-500 font-bold tracking-widest">AUDITOR_KERNEL_V2</span>
            </div>
            <Wifi className="w-4 h-4 text-slate-500" />
          </div>

          {/* Main Display Area */}
          <div className="flex-1 relative p-5 font-mono text-white overflow-hidden">
            
            {/* Background Grid Animation */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, #22d3ee 25%, #22d3ee 26%, transparent 27%, transparent 74%, #22d3ee 75%, #22d3ee 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, #22d3ee 25%, #22d3ee 26%, transparent 27%, transparent 74%, #22d3ee 75%, #22d3ee 76%, transparent 77%, transparent)', backgroundSize: '30px 30px' }}></div>

            <AnimatePresence mode="wait">
              {/* VIEW 1: RAW DATA INGESTION */}
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Incoming Stream</div>
                  <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-3 text-[10px] text-blue-300 font-mono relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <span className="text-purple-400">POST</span> /api/v1/events <br/>
                    Headers: &#123; <span className="text-yellow-400">x-api-key: ***</span> &#125; <br/>
                    Payload: &#123; <br/>
                    &nbsp;&nbsp;"user": "u_9281",<br/>
                    &nbsp;&nbsp;"action": "auth_login",<br/>
                    &nbsp;&nbsp;"ip": "192.168.1.1"<br/>
                    &#125;
                  </div>
                  <div className="flex justify-center items-center py-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse"></div>
                      <Activity className="w-16 h-16 text-blue-500 animate-bounce" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* VIEW 2: ENCRYPTION ENGINE */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="flex flex-col items-center justify-center h-full pb-12">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full animate-[spin_10s_linear_infinite]" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="48" stroke="#334155" strokeWidth="1" fill="none" strokeDasharray="4 2" />
                    </svg>
                    <svg className="absolute inset-0 w-full h-full animate-[spin_3s_linear_infinite_reverse]" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="#635bff" strokeWidth="2" fill="none" strokeDasharray="20 10" />
                    </svg>
                    <Lock className="w-10 h-10 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                  </div>
                  <div className="text-center space-y-2 mt-4">
                    <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Encrypting...</h3>
                    <div className="bg-black/50 px-3 py-1 rounded-full border border-slate-800">
                      <code className="text-[10px] text-emerald-400">0x7f...3a91</code>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* VIEW 3: BLOCKCHAIN LINKING */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-2">
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-4">Appending to Ledger</div>
                  {[0, 1, 2, 3].map(i => (
                    <motion.div 
                      key={i}
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${i === 0 ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-slate-900 border-slate-800'} backdrop-blur-sm`}
                    >
                      <div className={`p-2 rounded-md ${i === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                        <GitCommit size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Block #{10294 - i}</span>
                          <span>{i === 0 ? 'Just now' : `${i * 2}s ago`}</span>
                        </div>
                        <div className="text-xs font-mono truncate text-slate-300">
                          {i === 0 ? 'Verified & Sealed' : '0x8a...9f21'}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Live Terminal Footer */}
          <div className="h-32 bg-[#0a0a0a] border-t border-slate-800 p-4 font-mono text-[10px] overflow-hidden flex flex-col justify-end">
            <div className="text-slate-500 mb-1 border-b border-slate-800 pb-1 flex justify-between">
              <span>SYSTEM LOGS</span>
              <span className="animate-pulse text-green-500">● REC</span>
            </div>
            <div className="space-y-1">
              {terminalLines.map((line, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-slate-300">
                  <span className="text-blue-500 mr-2">{new Date().toLocaleTimeString().split(' ')[0]}</span>
                  {line}
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default PhoneDemo;