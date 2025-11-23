import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CryptoJS from 'crypto-js';
import { Database, ArrowRight, Cpu, Lock, FileJson } from 'lucide-react';

const InteractiveMerkle = () => {
  const [inputValue, setInputValue] = useState('Login Event #1024');
  const [processingStep, setProcessingStep] = useState(0); // 0: Input, 1: Salt, 2: Hash, 3: Done
  const [finalHash, setFinalHash] = useState('');

  useEffect(() => {
    // Reset animation when input changes
    setProcessingStep(0);
    const h = CryptoJS.SHA256(inputValue).toString();
    
    const t1 = setTimeout(() => setProcessingStep(1), 500);
    const t2 = setTimeout(() => setProcessingStep(2), 1500);
    const t3 = setTimeout(() => {
      setProcessingStep(3);
      setFinalHash(h);
    }, 2500);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [inputValue]);

  return (
    <div className="py-24 bg-slate-50 border-t border-slate-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">The Integrity Pipeline</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            See how raw data travels through our cryptographic engine to become immutable.
          </p>
        </div>

        {/* THE PIPELINE VISUALIZATION */}
        <div className="bg-[#0f172a] rounded-[2rem] p-8 lg:p-12 shadow-2xl overflow-hidden relative">
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            
            {/* 1. INPUT */}
            <div className="w-full lg:w-1/4 relative group">
              <div className="absolute -top-10 left-0 text-xs font-bold text-slate-500 uppercase tracking-wider">1. Raw Data</div>
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg group-hover:border-blue-500 transition-colors">
                <FileJson className="w-8 h-8 text-blue-500 mb-4" />
                <label className="text-xs text-slate-400">Enter Event Data:</label>
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 mt-2 text-sm text-white font-mono focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              {/* Flow Line */}
              <div className="hidden lg:block absolute top-1/2 -right-12 w-12 h-0.5 bg-slate-700">
                <motion.div 
                  animate={{ x: [0, 48], opacity: [0, 1, 0] }} 
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-4 h-1 bg-blue-500 absolute top-[-1px]"
                />
              </div>
            </div>

            {/* 2. PROCESSING ENGINE */}
            <div className="w-full lg:w-1/4 relative">
              <div className="absolute -top-10 left-0 text-xs font-bold text-slate-500 uppercase tracking-wider">2. Encryption Engine</div>
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex flex-col items-center justify-center h-48 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/5"></div>
                <Cpu className={`w-12 h-12 mb-4 transition-colors duration-300 ${processingStep >= 1 ? 'text-purple-500 animate-pulse' : 'text-slate-600'}`} />
                <div className="text-center">
                  <div className={`text-xs font-bold mb-1 ${processingStep >= 1 ? 'text-white' : 'text-slate-500'}`}>
                    {processingStep === 0 ? 'Waiting...' : processingStep === 1 ? 'Salting...' : 'Hashing...'}
                  </div>
                  <div className="w-32 h-1 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ width: processingStep >= 2 ? '100%' : processingStep === 1 ? '50%' : '0%' }}
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                  </div>
                </div>
              </div>
              <div className="hidden lg:block absolute top-1/2 -right-12 w-12 h-0.5 bg-slate-700">
                 <motion.div 
                  animate={{ x: [0, 48], opacity: [0, 1, 0] }} 
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                  className="w-4 h-1 bg-purple-500 absolute top-[-1px]"
                />
              </div>
            </div>

            {/* 3. OUTPUT HASH */}
            <div className="w-full lg:w-1/4 relative">
              <div className="absolute -top-10 left-0 text-xs font-bold text-slate-500 uppercase tracking-wider">3. Immutable Hash</div>
              <div className={`bg-slate-900 p-6 rounded-2xl border transition-all duration-500 ${processingStep === 3 ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'border-slate-700'}`}>
                <Lock className={`w-8 h-8 mb-4 ${processingStep === 3 ? 'text-emerald-500' : 'text-slate-600'}`} />
                <div className="font-mono text-[10px] text-slate-400 break-all leading-relaxed">
                  {processingStep === 3 ? finalHash : 'Calculating...'}
                </div>
                {processingStep === 3 && (
                  <div className="mt-4 flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    Ready for Ledger
                  </div>
                )}
              </div>
              <div className="hidden lg:block absolute top-1/2 -right-12 w-12 h-0.5 bg-slate-700">
                 <motion.div 
                  animate={{ x: [0, 48], opacity: [0, 1, 0] }} 
                  transition={{ duration: 1.5, repeat: Infinity, delay: 1.0 }}
                  className="w-4 h-1 bg-emerald-500 absolute top-[-1px]"
                />
              </div>
            </div>

             {/* 4. STORAGE */}
             <div className="w-full lg:w-1/4">
              <div className="absolute -top-10 left-0 text-xs font-bold text-slate-500 uppercase tracking-wider">4. Storage</div>
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col items-center justify-center h-48">
                <Database className={`w-12 h-12 mb-2 transition-colors ${processingStep === 3 ? 'text-emerald-500' : 'text-slate-600'}`} />
                <div className="text-xs text-slate-400">Merkle Tree Node</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default InteractiveMerkle;