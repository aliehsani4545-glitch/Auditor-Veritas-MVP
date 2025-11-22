import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Lock, Database, Fingerprint, ArrowRight, Activity } from 'lucide-react';

const PhoneDemo = () => {
  const [activeTab, setActiveTab] = useState('api'); // api, crypto, ledger
  const [progress, setProgress] = useState(0);

  // Auto-cycle logic för demonstration
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => (p + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-[320px] h-[640px] mx-auto perspective-[1000px] group">
      <motion.div 
        initial={{ rotateY: -5, rotateX: 5 }}
        whileHover={{ rotateY: 0, rotateX: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full transform-style-3d drop-shadow-2xl"
      >
        {/* Phone Body */}
        <div className="absolute inset-0 bg-[#0f172a] rounded-[45px] border-[8px] border-[#1e293b] overflow-hidden shadow-2xl">
          
          {/* Dynamic Island / Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-20"></div>

          {/* App Content */}
          <div className="h-full pt-12 pb-6 px-5 flex flex-col bg-slate-900 text-white font-mono">
            
            {/* App Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-emerald-500 font-bold">SYSTEM LIVE</span>
              </div>
              <Activity className="w-4 h-4 text-slate-500" />
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-slate-800 rounded-xl mb-6">
              {['api', 'crypto', 'ledger'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${
                    activeTab === tab ? 'bg-[#635bff] text-white shadow-lg' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Main Screen Area */}
            <div className="flex-1 relative overflow-hidden">
              <AnimatePresence mode='wait'>
                
                {/* VIEW 1: API INTEGRATION */}
                {activeTab === 'api' && (
                  <motion.div 
                    key="api"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="bg-[#1e1e1e] p-4 rounded-xl border border-slate-700 text-[10px] leading-relaxed relative">
                      <div className="absolute top-2 right-2"><Terminal className="w-3 h-3 text-slate-500"/></div>
                      <span className="text-purple-400">const</span> log = <span className="text-yellow-300">await</span> client.log(&#123;<br/>
                      &nbsp;&nbsp;action: <span className="text-green-400">"user_login"</span>,<br/>
                      &nbsp;&nbsp;user_id: <span className="text-green-400">"usr_829"</span>,<br/>
                      &nbsp;&nbsp;meta: &#123; ip: <span className="text-green-400">"10.0.0.1"</span> &#125;<br/>
                      &#125;);
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                      <div className="text-[10px] text-slate-400 mb-1">STATUS</div>
                      <div className="flex items-center text-emerald-400 text-xs font-bold">
                        <Check className="w-3 h-3 mr-1" /> 200 OK (14ms)
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* VIEW 2: CRYPTO PROCESS */}
                {activeTab === 'crypto' && (
                  <motion.div 
                    key="crypto"
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col items-center justify-center h-full"
                  >
                    <div className="relative w-40 h-40 mb-6">
                      {/* Animated Rings */}
                      <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" stroke="#635bff" strokeWidth="1" fill="none" strokeDasharray="4 4" />
                      </svg>
                      <svg className="absolute inset-0 w-full h-full animate-reverse-spin" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="35" stroke="#00d4ff" strokeWidth="1" fill="none" strokeDasharray="8 8" />
                      </svg>
                      
                      {/* Central Icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Fingerprint className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mb-2">
                      <motion.div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="font-mono text-xs text-slate-400">Hashing PII... {Math.round(progress)}%</div>
                  </motion.div>
                )}

                {/* VIEW 3: LEDGER / MERKLE */}
                {activeTab === 'ledger' && (
                  <motion.div 
                    key="ledger"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="space-y-3 h-full overflow-hidden"
                  >
                    <div className="text-center mb-4">
                      <Database className="w-8 h-8 text-[#00d4ff] mx-auto mb-2" />
                      <h4 className="font-bold text-sm">Immutable Ledger</h4>
                    </div>
                    
                    {/* Blocks */}
                    <div className="space-y-2 relative">
                      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-700"></div>
                      {[1, 2, 3, 4].map((i) => (
                        <motion.div 
                          key={i}
                          initial={{ x: -50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="ml-6 p-3 bg-slate-800 rounded-lg border border-slate-700 text-[10px] flex justify-between items-center"
                        >
                          <div>
                            <span className="text-slate-400">Hash: </span>
                            <span className="text-[#00d4ff]">{Math.random().toString(16).substr(2, 8)}...</span>
                          </div>
                          <Lock className="w-3 h-3 text-emerald-500" />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Footer Actions */}
            <button 
              onClick={() => setActiveTab(curr => curr === 'api' ? 'crypto' : curr === 'crypto' ? 'ledger' : 'api')}
              className="mt-4 w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              Next Step <ArrowRight className="w-3 h-3" />
            </button>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PhoneDemo;