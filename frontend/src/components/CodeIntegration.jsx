import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Play, Terminal, Copy, Check, ArrowRight, Globe } from 'lucide-react';
// The import of AuroraBackground is commented out/removed as it is defined internally below.

// Internal Component: AuroraBackground (Moved here to guarantee resolution)
const AuroraBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="relative w-full h-full"
      >
        {/* Blue/Cyan Circle (Light version) */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] animate-pulse-slow"></div>
        
        {/* Purple/Magenta Circle (Light version) */}
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse-slow animation-delay-3000"></div>
        
      </motion.div>
      {/* CSS for the animation */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.1; }
          50% { transform: scale(1.1); opacity: 0.25; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 15s infinite ease-in-out;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
      `}</style>
    </div>
  );
};


const CodeIntegration = ({ setActiveTab }) => {
  const [activeTabState, setActiveTabState] = useState('browser'); // Default to Browser JS
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [copied, setCopied] = useState(false);

  // API KEY from acme-tracking.js for demo
  const DEMO_API_KEY = 'YOUR_API_KEY_HERE';
  const API_ENDPOINT = 'https://auditor-veritas-mvp.onrender.com/api/events';


  // Code examples (updated and more advanced)
  const codeSnippets = {
    browser: `// File: acme-tracking.js (Client-side)
// Used for GDPR consent logging directly from the browser

const VERITAS_API_URL = '${API_ENDPOINT}';
const API_KEY = '${DEMO_API_KEY}';

function logConsent(status) {
  // 1. Get/Create pseudonymous user ID (no PII)
  let sessionId = sessionStorage.getItem('v_session') || crypto.randomUUID();
  sessionStorage.setItem('v_session', sessionId);

  // 2. Send POST request to Veritas API
  fetch(VERITAS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY, // API key for the client
    },
    body: JSON.stringify({
      event_type: 'compliance.consent_update',
      user_identifier: sessionId,
      event_data: { 
        consent_type: "analytics", 
        status: status, 
        browser: navigator.userAgent.substring(0, 50) 
      }
    })
  })
  .then(res => {
    if (res.ok) console.log('Veritas: Consent logged. Done!');
    else console.error('Veritas: Failed to log event. Check API.');
  })
  .catch(err => console.error('Veritas: Network error during sending.'));
}

// CLIENT CODE: Executed on "Accept" click
document.getElementById('accept-btn').addEventListener('click', () => {
  logConsent('GRANTED_ALL');
});`,
    node: `// File: server.js (Backend Node.js)
// Logs sensitive data with Merkle Tree integration

const auditor = require('@auditor/client');
const client = auditor.init({
  apiKey: process.env.AUDITOR_SECRET_KEY, 
  MerkleHash: true // Activates Merkle Tree integration
});

// Function executed during a payment
async function handlePayment(userId, transaction) {
  
  // 1. Hash sensitive data before logging (PII)
  const hashedUserId = crypto.createHash('sha256').update(userId).digest('hex');

  // 2. Log the event to the Veritas API
  const logResult = await client.logEvent({
    actor: hashedUserId,
    action: "transaction_commit",
    timestamp: new Date().toISOString(),
    meta: { 
      amount: transaction.amount,
      internal_ref: transaction.ref_id,
      payment_provider: 'Stripe'
    }
  });

  console.log(\`Logged Event ID: \${logResult.eventId}\`);
  console.log(\`NEW Merkle Root: \${logResult.merkleRoot.substring(0, 16)}...\`);
}

// Execute: Log an event
handlePayment("user-email@domain.com", { amount: 199.99, ref_id: "TX-94821" });`,
    python: `import requests
import json
import os
import hashlib

// File: app.py (Backend Python)
// Generic logging function without SDK
def log_event(event_type, user_id, event_data):
    headers = {
        'Content-Type': 'application/json',
        'x-api-key': os.environ.get("AUDITOR_API_KEY") 
    }
    
    payload = {
        'event_type': event_type,
        'user_identifier': hashlib.sha256(user_id.encode()).hexdigest(),
        'event_data': event_data
    }
    
    try:
        response = requests.post(
            "${API_ENDPOINT}", 
            headers=headers, 
            data=json.dumps(payload)
        )
        response.raise_for_status()
        print(f"Event logged: {response.json().get('eventId')}")
    except requests.exceptions.RequestException as e:
        print(f"Logging failed: {e}")

// Execute: Log a user action
log_event(
    "user.profile_view", 
    "john.doe@example.com", 
    { "page": "dashboard", "ip": "192.168.1.1" }
)`
  };

  const handleRun = () => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs([]);

    let sequence;

    if (activeTabState === 'browser') {
      sequence = [
        { text: "$ document.getElementById('accept-btn').click()", delay: 0, color: "text-slate-300" },
        { text: "INFO: Executing fetch request to Veritas API...", delay: 600, color: "text-slate-400" },
        { text: `-> POST /api/events HTTP/1.1 (Client-Auth)`, delay: 1000, color: "text-slate-500" },
        { text: "INFO: Server responded 201 Created", delay: 1800, color: "text-blue-400" },
        { text: "✔ Consent Logged: compliance.consent_update", delay: 2500, color: "text-emerald-400 font-bold" },
      ];
    } else if (activeTabState === 'node') {
      sequence = [
        { text: `$ node server.js`, delay: 0 },
        { text: "INFO: Logging sensitive event (Backend)", delay: 600, color: "text-slate-400" },
        { text: "✔ UserId Hashed: 77a0...54c1 (PII protected)", delay: 1200, color: "text-yellow-400" },
        { text: "✔ Event Hashed Locally: c14d...", delay: 1800, color: "text-emerald-500" },
        { text: "✔ Merkle Tree Updated: 0x9f8a...b2c1", delay: 2500, color: "text-emerald-300 font-bold" },
      ];
    } else if (activeTabState === 'python') {
      sequence = [
        { text: `$ python app.py`, delay: 0 },
        { text: "INFO: Using Requests library for logging.", delay: 600, color: "text-slate-400" },
        { text: "-> POST /api/events HTTP/1.1 (Auth OK)", delay: 1200, color: "text-slate-500" },
        { text: "✔ Event logged: evt_d8e9...", delay: 2000, color: "text-emerald-400 font-bold" },
      ];
    }


    sequence.forEach(({ text, delay, color }) => {
      setTimeout(() => {
        setLogs(prev => [...prev, { text, color }]);
      }, delay);
    });

    setTimeout(() => setIsRunning(false), 3000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeTabState]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Helper function for scroll
  const scrollToArchitecture = () => {
    const element = document.getElementById('architecture');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };
  

  return (
    <div className="relative py-16 md:py-32 bg-white overflow-hidden text-slate-900 border-t border-slate-100" id="code-integration">
      {/* Ljus Aurora Bakgrund */}
      <AuroraBackground />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        
          {/* LEFT: TEXT CONTENT (med uppdaterade CTA:er) */}
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
              Implement in <span className="text-blue-700">five minutes.</span>
            </h2>
            
            <p className="text-base md:text-lg !text-slate-700 mb-8 leading-relaxed font-medium max-w-lg mx-auto lg:mx-0">
              Whether you use Node.js, Python, or plain JS in the browser, our API simplifies logging. See how to log consent in compliance with GDPR.
            </p>
            
            <div className="space-y-3 mb-8 inline-block text-left">
              {['Minimal overhead (Client JS)', 'End-to-end data integrity (Server)', 'Fast verification via Merkle Root'].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <CheckCircle2 size={14} strokeWidth={3} />
                  </div>
                  <span className="font-semibold !text-slate-800 text-sm md:text-base">{item}</span>
                </div>
              ))}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start w-full">
               <button 
                 onClick={scrollToArchitecture}
                 className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#0a2540] text-white font-bold text-sm hover:bg-[#1e293b] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
               >
                  View Technical Architecture <ArrowRight size={16} />
               </button>
               <button 
                 onClick={() => setActiveTab('create')}
                 className="w-full sm:w-auto px-6 py-3.5 rounded-xl border-2 border-slate-200 font-bold text-sm hover:border-slate-400 hover:bg-slate-50 transition-all !text-slate-700"
               >
                  Get your API Key
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
                        onClick={() => setActiveTabState('browser')}
                        className={`transition-colors px-2 py-1 rounded hover:bg-white/5 ${activeTabState === 'browser' ? 'text-white bg-white/10 flex items-center gap-1' : ''}`}
                      >
                        <Globe size={12}/> Browser JS
                      </button>
                      <button 
                        onClick={() => setActiveTabState('node')}
                        className={`transition-colors px-2 py-1 rounded hover:bg-white/5 ${activeTabState === 'node' ? 'text-white bg-white/10' : ''}`}
                      >
                        Node.js (Server)
                      </button>
                      <button 
                        onClick={() => setActiveTabState('python')}
                        className={`transition-colors px-2 py-1 rounded hover:bg-white/5 ${activeTabState === 'python' ? 'text-white bg-white/10' : ''}`}
                      >
                        Python (Generic)
                      </button>
                   </div>
                   <button onClick={handleCopy} className="text-slate-400 hover:text-white transition-colors p-1">
                      {copied ? <Check size={14} className="text-emerald-400"/> : <Copy size={14}/>}
                   </button>
                </div>

                {/* Code Area - Scrollable on mobile */}
                <div className="p-4 md:p-6 font-mono text-xs md:text-sm leading-relaxed overflow-x-auto bg-[#0f172a] min-h-[350px]">
                   <pre>
                     <code className="language-javascript">
                       {codeSnippets[activeTabState].split('\n').map((line, i) => (
                         <div key={i} className="table-row">
                            <span className="table-cell text-slate-600 select-none pr-4 text-right w-6 md:w-8">{i + 1}</span>
                            <span className="table-cell whitespace-pre">
                              {line
                                .replace(/const|await|import|require|function|let|if|else|return|new|class|try|catch|for|while|await|export|default|from|else/g, match => `<span class="text-purple-400">${match}</span>`)
                                .replace(/'[^']*'|"[^"]*"/g, match => `<span class="text-emerald-400">${match}</span>`)
                                .replace(/\/\/.*/g, match => `<span class="text-slate-500 italic">${match}</span>`)
                                 .replace(/this\.|client\./g, match => `<span class="text-blue-400">${match}</span>`)
                                 .replace(/fetch|logCompliance|logConsent/g, match => `<span class="text-cyan-400">${match}</span>`)
                                 .replace(/(process\.env\.AUDITOR_KEY_V1|API_KEY|DEMO_API_KEY)/g, match => `<span class="text-yellow-300">${match}</span>`)
                                 .replace(/crypto|requests|json|hashlib|os/g, match => `<span class="text-pink-400">${match}</span>`)
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
                              $ Ready to simulate... (Active Tab: {activeTabState})
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
        {/* This hidden element is needed to simulate 'document.getElementById('accept-btn').click()' in the Browser JS demo code */}
        {activeTabState === 'browser' && (
            <button 
                id="accept-btn" 
                className="hidden" 
                onClick={handleRun}
                disabled={isRunning}
            ></button>
        )}
      </div>
    </div>
  );
};

export default CodeIntegration;