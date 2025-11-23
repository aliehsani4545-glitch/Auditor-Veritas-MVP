import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Hash, FileJson, ShieldCheck, ArrowRight, Cpu } from 'lucide-react';

const InteractiveMerkle = () => {
  const [step, setStep] = useState(0); // 0-3

  const steps = [
    { 
      title: "1. Raw Event Data", 
      desc: "The system captures the raw JSON payload from your API request.",
      icon: FileJson,
      viz: (
        <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl font-mono text-xs text-blue-300 w-48">
          {"{"}<br/>&nbsp;"user": "id_123",<br/>&nbsp;"amount": 500<br/>{"}"}
        </div>
      )
    },
    { 
      title: "2. Cryptographic Hashing", 
      desc: "Data is salted and passed through SHA-256 to create a fixed-length signature.",
      icon: Cpu,
      viz: (
        <div className="flex flex-col items-center">
           <div className="w-16 h-16 rounded-full border-4 border-[#635bff] border-t-transparent animate-spin mb-4"></div>
           <div className="bg-slate-800 px-3 py-1 rounded text-[10px] font-mono text-white">SHA-256 Processing</div>
        </div>
      )
    },
    { 
      title: "3. Leaf Node Creation", 
      desc: "The hash becomes a 'leaf' in the current Merkle Tree block.",
      icon: Hash,
      viz: (
        <div className="flex gap-2">
          <div className="w-12 h-12 bg-slate-800 rounded flex items-center justify-center text-slate-600 text-xs">H1</div>
          <div className="w-12 h-12 bg-emerald-600 rounded flex items-center justify-center text-white font-bold text-xs shadow-[0_0_15px_#10b981]">H2</div>
          <div className="w-12 h-12 bg-slate-800 rounded flex items-center justify-center text-slate-600 text-xs">H3</div>
        </div>
      )
    },
    { 
      title: "4. Root Integrity Proof", 
      desc: "The tree balances to a single Root Hash, which is anchored for immutability.",
      icon: ShieldCheck,
      viz: (
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg mb-2">ROOT</div>
          <div className="w-32 h-1 bg-slate-700 relative">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-slate-700"></div>
          </div>
          <div className="flex gap-8 mt-8">
             <div className="w-10 h-10 bg-slate-800 rounded"></div>
             <div className="w-10 h-10 bg-slate-800 rounded"></div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="py-24 bg-slate-950 border-t border-slate-800 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">How it Works</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Understanding the <span className="text-[#635bff]">Proof Engine</span> process.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Controls (Left) */}
          <div className="space-y-4">
            {steps.map((s, i) => (
              <div 
                key={i} 
                onClick={() => setStep(i)}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center gap-6 ${
                  step === i 
                    ? 'border-[#635bff] bg-[#635bff]/10 shadow-lg scale-105' 
                    : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${step === i ? 'bg-[#635bff] text-white' : 'bg-slate-800 text-slate-500'}`}>
                  <s.icon size={24} />
                </div>
                <div>
                  <h4 className={`font-bold text-lg ${step === i ? 'text-white' : 'text-slate-400'}`}>{s.title}</h4>
                  <p className={`text-sm mt-1 ${step === i ? 'text-blue-200' : 'text-slate-600'}`}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Visualization (Right) */}
          <div className="bg-[#020617] rounded-[3rem] p-12 shadow-2xl border border-slate-800 h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950 opacity-50"></div>
            
            <div className="relative z-10">
              <motion.div
                key={step}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                {steps[step].viz}
              </motion.div>
            </div>

            {/* Progress Dots */}
            <div className="absolute bottom-8 flex gap-3">
              {steps.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${step === i ? 'bg-[#635bff] w-8' : 'bg-slate-700'}`} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InteractiveMerkle;