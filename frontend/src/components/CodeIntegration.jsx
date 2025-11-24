import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Play, Terminal, Copy, Check, ArrowRight } from 'lucide-react';
import { AuroraBackground } from './SharedBackgrounds';

const CodeIntegration = ({ setActiveTab }) => {
  const [activeTabState, setActiveTabState] = useState('node');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [copied, setCopied] = useState(false);

  // Kod-exempel
  const codeSnippets = {
    node: `const auditor = require('@auditor/client');

// Initialize Secure Enclave
const client = await auditor.init({
  apiKey: process.env.AUDITOR_KEY_V1
});

// Log Event (Auto-Hashed)
await client.log({
  actor: "user_492",
  action: "payment_processed",
  meta: { amount: 4500, currency: "USD" }
});`,
    python: `import auditor

# Initialize Secure Enclave
client = auditor.init(
    api_key=os.environ["AUDITOR_KEY_V1"]
)

# Log Event (Auto-Hashed)
client.log(
    actor="user_492",
    action="payment_processed",
    meta={ "amount": 4500, "currency": "USD" }
)`
  };

  const handleRun = () => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs([]);

    const sequence = [
      { text: "> node main.js", delay: 0 },
      { text: "✔ Verifying API Key...", delay: 600, color: "text-slate-400" },
      { text: "✔ Connecting to Veritas Mesh...", delay: 1400, color: "text-blue-400" },
      { text: "✔ Handshake Secure (TLS 1.3)", delay: 2000, color: "text-emerald-400" },
      { text: "✔ Event Anchored: 0x9f8a...b2c1", delay: 2800, color: "text-emerald-300 font-bold" },
    ];

    sequence.forEach(({ text, delay, color }) => {
      setTimeout(() => {
        setLogs(prev => [...prev, { text, color }]);
      }, delay);
    });

    setTimeout(() => setIsRunning(false), 3500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeTabState]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative py-16 md:py-32 bg-white overflow-hidden text-slate-900 border-t border-slate-100">
      {/* Ljus Aurora Bakgrund */}
      <AuroraBackground />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        
          {/* LEFT: TEXT CONTENT */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6">
              <Terminal size={14} /> Developer Experience
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold !text-slate-900 mb-6 tracking-tight leading-[1.1]">
              Ready in <span className="text-blue-700">minutes.</span>
            </h2>
            
            <p className="text-base md:text-lg !text-slate-700 mb-8 leading-relaxed font-medium max-w-lg mx-auto lg:mx-0">
              Stop building your own audit logs. Our SDK handles the heavy lifting: 
              <span className="font-bold !text-slate-900"> local hashing</span>, 
              <span className="font-bold !text-slate-900"> batching</span>, and 
              <span className="font-bold !text-slate-900"> encryption</span>.
            </p>
            
            <div className="space-y-3 mb-8 inline-block text-left">
              {['Type-safe SDKs', 'Automatic retry logic', '< 10ms overhead'].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <CheckCircle2 size={14} strokeWidth={3} />
                  </div>
                  <span className="font-semibold !text-slate-800 text-sm md:text-base">{item}</span>
                </div>
              ))}
            </div>

            {/* ACTION BUTTONS - Stacked on mobile */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start w-full">
               <button 
                 onClick={() => scrollToSection('architecture')}
                 className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#0a2540] text-white font-bold text-sm hover:bg-[#1e293b] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
               >
                  View Documentation <ArrowRight size={16} />
               </button>
               <button 
                 onClick={() => setActiveTab('create')}
                 className="w-full sm:w-auto px-6 py-3.5 rounded-xl border-2 border-slate-200 font-bold text-sm hover:border-slate-400 hover:bg-slate-50 transition-all !text-slate-700"
               >
                  Get API Keys
               </button>
            </div>
          </motion.div>

          {/* RIGHT: INTERACTIVE CODE WINDOW */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full"
          >
             {/* Glow behind window */}
             <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl rounded-[30px] -z-10"></div>

             <div className="bg-[#0f172a] rounded-2xl shadow-2xl overflow-hidden border border-slate-800">
                
                {/* Window Header */}
                <div className="bg-[#1e293b] px-4 py-3 flex items-center justify-between border-b border-slate-700">
                   <div className="flex gap-1.5 md:gap-2">
                      <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/80"></div>
                      <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500/80"></div>
                      <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500/80"></div>
                   </div>
                   <div className="flex gap-3 text-[10px] md:text-xs font-bold tracking-wider uppercase text-slate-400">
                      <button 
                        onClick={() => setActiveTabState('node')}
                        className={`transition-colors px-2 py-1 rounded hover:bg-white/5 ${activeTabState === 'node' ? 'text-white bg-white/10' : ''}`}
                      >
                        main.js
                      </button>
                      <button 
                        onClick={() => setActiveTabState('python')}
                        className={`transition-colors px-2 py-1 rounded hover:bg-white/5 ${activeTabState === 'python' ? 'text-white bg-white/10' : ''}`}
                      >
                        app.py
                      </button>
                   </div>
                   <button onClick={handleCopy} className="text-slate-400 hover:text-white transition-colors p-1">
                      {copied ? <Check size={14} className="text-emerald-400"/> : <Copy size={14}/>}
                   </button>
                </div>

                {/* Code Area - Scrollable on mobile */}
                <div className="p-4 md:p-6 font-mono text-xs md:text-sm leading-relaxed overflow-x-auto bg-[#0f172a] min-h-[200px]">
                   <pre>
                     <code className="language-javascript">
                       {codeSnippets[activeTabState].split('\n').map((line, i) => (
                         <div key={i} className="table-row">
                            <span className="table-cell text-slate-600 select-none pr-4 text-right w-6 md:w-8">{i + 1}</span>
                            <span className="table-cell whitespace-pre">
                              {line
                                .replace(/const|await|import|require/g, match => `<span class="text-purple-400">${match}</span>`)
                                .replace(/'[^']*'|"[^"]*"/g, match => `<span class="text-emerald-400">${match}</span>`)
                                .replace(/\/\/.*/g, match => `<span class="text-slate-500 italic">${match}</span>`)
                                .split(/(<span.*?>.*?<\/span>)/g)
                                .map((part, index) => 
                                  part.startsWith('<span') ? 
                                  <span key={index} dangerouslySetInnerHTML={{__html: part}} /> : 
                                  <span key={index} className="text-slate-200">{part}</span>
                                )
                              }
                            </span>
                         </div>
                       ))}
                     </code>
                   </pre>
                </div>

                {/* Terminal & Run Button */}
                <div className="bg-[#020617] p-3 md:p-4 border-t border-slate-800">
                   <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2 text-[10px] md:text-xs text-slate-400">
                         <Terminal size={12} />
                         <span className="font-bold uppercase tracking-wider">Terminal</span>
                      </div>
                      <button 
                        onClick={handleRun}
                        disabled={isRunning}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider transition-all ${isRunning ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`}
                      >
                         {isRunning ? <span className="animate-spin">⟳</span> : <Play size={10} fill="currentColor" />}
                         {isRunning ? 'Running...' : 'Run'}
                      </button>
                   </div>
                   
                   <div className="h-20 md:h-24 font-mono text-[10px] md:text-xs overflow-y-auto font-medium scrollbar-hide">
                      <AnimatePresence>
                         {logs.length === 0 && !isRunning && (
                           <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-slate-600">
                              $ Ready to simulate...
                           </motion.div>
                         )}
                         {logs.map((log, i) => (
                           <motion.div 
                             key={i}
                             initial={{ opacity: 0, x: -10 }}
                             animate={{ opacity: 1, x: 0 }}
                             className={`mb-1 ${log.color || 'text-slate-300'}`}
                           >
                              {log.text}
                           </motion.div>
                         ))}
                      </AnimatePresence>
                   </div>
                </div>

             </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default CodeIntegration;