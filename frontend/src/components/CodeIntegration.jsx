import React, { useState } from 'react';
import { CheckCircle, Terminal, Copy, Check, ArrowRight, Code2 } from 'lucide-react';
import { motion } from 'framer-motion';

const CodeIntegration = ({ setActiveTab, onOpenDocs }) => { // <--- Vi tar emot onOpenDocs här
  const [copied, setCopied] = useState(false);

  const codeSnippet = `
import { Auditor } from '@auditor-veritas/sdk';

const auditor = new Auditor(process.env.AUDITOR_KEY);

// Log an immutable event
await auditor.log({
  action: "payment.processed",
  user: "user_123",
  meta: { amount: 500, currency: "USD" }
});
`;

  const copyCode = () => {
    navigator.clipboard.writeText(codeSnippet.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Text Content (Som din bild) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full text-blue-600 text-xs font-bold uppercase tracking-wider mb-6">
              <Terminal size={12} /> Developer Experience
            </div>
            
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
              Implement in <span className="text-blue-600">five minutes.</span>
            </h2>
            
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Drop our SDK into your stack. Whether it's a simple browser script or a complex Node.js backend, we handle the cryptography, hashing, and transmission automatically.
            </p>

            <div className="space-y-4 mb-10">
              {[
                "Zero-knowledge architecture (We never see raw PII)",
                "Instant Merkle Proof generation",
                "GDPR-compliant erasure ready"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle className="text-emerald-500 shrink-0" size={20} />
                  <span className="text-slate-700 font-medium">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setActiveTab('create')}
                className="px-8 py-4 bg-[#020617] hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                Get API Keys <ArrowRight size={18} />
              </button>
              
              {/* HÄR ÄR KNAPPEN KOPPLAD: */}
              <button 
                onClick={onOpenDocs} 
                className="px-8 py-4 bg-white border-2 border-slate-200 hover:border-blue-600 hover:text-blue-600 text-slate-700 font-bold rounded-xl transition-all flex items-center gap-2"
              >
                Read Docs <Code2 size={18} />
              </button>
            </div>
          </motion.div>

          {/* Right Column: Code Window */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden relative group">
              {/* Window Controls */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#020617]">
                 <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
                 </div>
                 <div className="text-xs font-mono text-slate-500">server.js</div>
              </div>
              
              {/* Code Area */}
              <div className="p-6 overflow-x-auto">
                <pre className="font-mono text-sm leading-relaxed">
                  <code className="text-slate-300">
                    <span className="text-purple-400">import</span> {"{ Auditor }"} <span className="text-purple-400">from</span> <span className="text-emerald-400">'@auditor-veritas/sdk'</span>;<br/><br/>
                    <span className="text-blue-400">const</span> auditor = <span className="text-purple-400">new</span> <span className="text-yellow-400">Auditor</span>(process.env.KEY);<br/><br/>
                    <span className="text-slate-500">// Immutable log</span><br/>
                    <span className="text-purple-400">await</span> auditor.<span className="text-blue-400">log</span>({"{"}<br/>
                    &nbsp;&nbsp;action: <span className="text-emerald-400">"payment.processed"</span>,<br/>
                    &nbsp;&nbsp;user: <span className="text-emerald-400">"usr_87x2"</span>,<br/>
                    &nbsp;&nbsp;meta: {"{ amount: 500 }"}<br/>
                    {"}"});
                  </code>
                </pre>
              </div>

              {/* Copy Button */}
              <button 
                onClick={copyCode}
                className="absolute top-14 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
              >
                {copied ? <Check size={16} className="text-emerald-400"/> : <Copy size={16}/>}
              </button>
            </div>
            
            {/* Background Decor behind code */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[20px] blur-lg -z-10 opacity-20"></div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default CodeIntegration;