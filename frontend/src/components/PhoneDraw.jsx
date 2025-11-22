import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Check, Lock, RefreshCw, ArrowRight } from 'lucide-react';

const PhoneDraw = () => {
  const [step, setStep] = useState(0); // 0: Start, 1: API Key, 2: Logging, 3: Merkle, 4: Done

  const steps = [
    { title: "Get Started", btn: "Create API Key", color: "#6366f1" },
    { title: "Generating...", btn: "Waiting...", color: "#8b5cf6" }, // Auto-step
    { title: "Log Event", btn: "Send Event", color: "#10b981" },
    { title: "Verifying", btn: "Merkle Proof", color: "#3b82f6" },
    { title: "Secured", btn: "Restart Demo", color: "#0f172a" }
  ];

  const handleStep = () => {
    if (step === 4) { setStep(0); return; }
    setStep(prev => prev + 1);
    // Auto-advance step 1 (loading API key)
    if (step === 0) {
      setTimeout(() => setStep(2), 1500);
    }
  };

  return (
    <div className="relative w-[320px] h-[640px] mx-auto perspective-[1000px] group">
      <motion.div 
        initial={{ rotateY: -12, rotateX: 5 }}
        whileHover={{ rotateY: 0, rotateX: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full h-full transform-style-3d drop-shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]"
      >
        {/* Phone Frame */}
        <div className="absolute inset-0 bg-[#0f172a] rounded-[40px] border-[8px] border-[#1e293b] shadow-xl overflow-hidden">
          
          {/* Status Bar */}
          <div className="absolute top-0 w-full h-8 bg-black/20 backdrop-blur-md z-20 flex justify-between px-6 items-center text-[10px] text-white/70">
            <span>9:41</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-white/20"></div>
            </div>
          </div>

          {/* Screen Content */}
          <div className="relative h-full bg-slate-900 flex flex-col p-6 pt-12 font-sans text-white">
            
            {/* Header */}
            <div className="mb-8">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                <Terminal className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold">Auditor Veritas</h2>
              <p className="text-slate-400 text-sm">Dev Console</p>
            </div>

            {/* Interactive Area */}
            <div className="flex-1 relative">
              <AnimatePresence mode='wait'>
                {step === 0 && (
                  <motion.div key="s0" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, x:-20}} className="space-y-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-sm text-slate-300">Welcome. Generate a secure key to start logging events to the immutable ledger.</p>
                    </div>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="s1" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col items-center justify-center h-40">
                    <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mb-2" />
                    <p className="text-xs text-purple-300 font-mono">Generating RSA-4096 Key...</p>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="s2" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono text-emerald-400 mb-2">
                      <span>API_KEY_ACTIVE</span>
                      <Check className="w-3 h-3" />
                    </div>
                    <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 font-mono text-[10px] text-slate-300">
                      {`{
  "event": "LOGIN_ATTEMPT",
  "user": "usr_82m_xe9",
  "timestamp": ${Date.now()}
}`}
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="s3" initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} exit={{opacity:0}} className="flex flex-col items-center py-8">
                    <div className="relative w-24 h-24">
                       <svg className="animate-spin-slow w-full h-full text-blue-500" viewBox="0 0 100 100">
                         <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="10 10" />
                       </svg>
                       <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-400" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-blue-300">Hashing & Merkle Tree...</p>
                  </motion.div>
                )}
                
                {step === 4 && (
                   <motion.div key="s4" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="text-center py-8">
                     <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                       <Check className="w-8 h-8 text-white" />
                     </div>
                     <h3 className="text-xl font-bold text-white">Secured!</h3>
                     <p className="text-slate-400 text-sm mt-2">Event is cryptographically locked and synced.</p>
                   </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Button */}
            <button 
              onClick={handleStep}
              disabled={step === 1}
              className="mt-auto w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
              style={{ backgroundColor: steps[step].color, color: 'white', opacity: step === 1 ? 0.7 : 1 }}
            >
              {steps[step].btn} {step !== 1 && step !== 4 && <ArrowRight className="w-4 h-4" />}
            </button>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PhoneDraw;