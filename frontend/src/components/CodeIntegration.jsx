import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, Terminal, Code2, Play, Loader2 } from 'lucide-react';

const CodeIntegration = () => {
  const [activeLang, setActiveLang] = useState('node');
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState(null);

  const codeSnippets = {
    node: `const auditor = require('@auditor/client');

// Initialize Secure Enclave
const client = auditor.init({
  apiKey: process.env.AUDITOR_KEY_V1
});

// Log Event (Auto-Hashed)
await client.log({
  actor: "user_492", 
  action: "payment_processed",
  meta: { amount: 4500, currency: "USD" }
});`,
    python: `from auditor_veritas import Auditor

# Initialize Secure Enclave
client = Auditor(api_key="av_live_...")

# Log Event (Auto-Hashed)
client.log(
    actor="user_492",
    action="payment_processed",
    meta={"amount": 4500, "currency": "USD"}
)`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
    setIsRunning(true);
    setOutput(null);
    setTimeout(() => {
      setIsRunning(false);
      setOutput({
        status: 201,
        id: "evt_" + Math.random().toString(36).substr(2, 9),
        hash: "0x" + Math.random().toString(16).substr(2, 40),
        latency: "12ms"
      });
    }, 1200);
  };

  return (
    <div className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Pitch */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-xs font-bold uppercase tracking-wide">
              <Code2 size={14} /> Developer Experience
            </div>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">
              Drop-in compliance. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#635bff] to-[#00d4ff]">
                Ready in minutes.
              </span>
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Stop building your own audit logs. Our SDK handles the heavy lifting: 
              <strong> local hashing</strong>, <strong>batching</strong>, and <strong>encryption</strong>. 
              Just import and log.
            </p>
            
            <div className="space-y-4">
              {["Type-safe SDKs", "Automatic retry logic", "< 10ms overhead"].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <span className="text-slate-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: IDE Simulator */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-xl bg-[#1e1e1e] shadow-2xl border border-slate-800 overflow-hidden font-mono text-sm"
          >
            {/* IDE Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-[#333]">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
              </div>
              <div className="text-slate-400 text-xs">main.{activeLang === 'node' ? 'js' : 'py'}</div>
              <div className="w-10"></div>
            </div>

            {/* Code Editor Area */}
            <div className="p-6 relative bg-[#1e1e1e] group">
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                <button onClick={() => setActiveLang('node')} className={`px-2 py-1 rounded text-xs transition-colors ${activeLang === 'node' ? 'bg-[#635bff] text-white' : 'bg-white/10 text-slate-400 hover:text-white'}`}>NODE</button>
                <button onClick={() => setActiveLang('python')} className={`px-2 py-1 rounded text-xs transition-colors ${activeLang === 'python' ? 'bg-[#635bff] text-white' : 'bg-white/10 text-slate-400 hover:text-white'}`}>PYTHON</button>
              </div>

              <div className="overflow-x-auto">
                <pre className="text-[#d4d4d4] leading-relaxed">
                  {codeSnippets[activeLang].split('\n').map((line, i) => (
                    <div key={i} className="table-row">
                      <span className="table-cell text-right pr-4 text-[#858585] select-none">{i + 1}</span>
                      <span className="table-cell">
                        {line
                          .replace(/const|var|let|await|require|import|from/g, '<span class="text-[#c586c0]">$&</span>')
                          .replace(/'[^']*'|"[^"]*"/g, '<span class="text-[#ce9178]">$&</span>')
                          .replace(/\/\/.*/g, '<span class="text-[#6a9955]">$&</span>')
                          .split(/(\<span.*?\>.*?<\/span\>)/g)
                          .map((part, j) => 
                            part.startsWith('<span') 
                            ? <span key={j} dangerouslySetInnerHTML={{__html: part}} /> 
                            : part
                          )
                        }
                      </span>
                    </div>
                  ))}
                </pre>
              </div>
            </div>

            {/* Action Bar & Terminal */}
            <div className="border-t border-[#333] bg-[#1e1e1e]">
              <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d]">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Terminal size={12} /> TERMINAL
                </div>
                <div className="flex gap-2">
                   <button onClick={handleCopy} className="p-1.5 rounded hover:bg-white/10 text-slate-400 transition-colors" title="Copy Code">
                      {copied ? <Check size={14} className="text-emerald-400"/> : <Copy size={14}/>}
                   </button>
                   <button 
                      onClick={handleRun} 
                      disabled={isRunning}
                      className="flex items-center gap-1.5 px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded transition-colors disabled:opacity-50"
                   >
                      {isRunning ? <Loader2 size={12} className="animate-spin"/> : <Play size={12} fill="currentColor"/>}
                      RUN
                   </button>
                </div>
              </div>
              
              {/* Output Window - FIXED LINE BELOW */}
              <div className="h-32 bg-[#1e1e1e] p-4 font-mono text-xs overflow-y-auto">
                {!output && !isRunning && <span className="text-slate-500">$ Ready to simulate...</span>}
                {isRunning && <span className="text-yellow-400">Running script...<br/>&gt; Connecting to eu-west-1...</span>}
                {output && (
                  <div className="space-y-1">
                    <span className="text-slate-500">$ node main.js</span><br/>
                    <span className="text-emerald-400">✔ Event Logged Successfully (201 Created)</span><br/>
                    <div className="pl-2 border-l-2 border-slate-700 mt-2 text-slate-300">
                      ID: <span className="text-blue-400">{output.id}</span><br/>
                      Hash: <span className="text-purple-400 truncate block w-full">{output.hash}</span>
                      Latency: <span className="text-yellow-400">{output.latency}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default CodeIntegration;