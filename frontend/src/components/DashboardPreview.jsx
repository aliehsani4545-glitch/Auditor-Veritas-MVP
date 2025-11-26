import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, CheckCircle2, LayoutGrid, Lock, Zap, Shield, 
  RotateCw, AlertTriangle, LogOut, Trash2, Search, Layers, 
  ShieldAlert, ArrowRight, Copy, Sparkles, ChevronRight, 
  Building2, Mail, CreditCard, Loader2, Check, Info, Eye
} from 'lucide-react';

// --- 1. NARRATOR ---
const Narrator = ({ step, totalSteps, title, text }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}
    className="absolute bottom-8 left-0 right-0 mx-auto w-[95%] max-w-xl z-[60]"
  >
    <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 text-white p-6 rounded-2xl shadow-2xl ring-1 ring-white/10">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-blue-600 rounded-xl shrink-0 shadow-lg shadow-blue-900/30 animate-pulse">
          <Sparkles size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center w-full mb-2">
              <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider">{title}</h4>
              <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">STEG {step}/{totalSteps}</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-light">{text}</p>
        </div>
      </div>
      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mt-5">
          <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400" 
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.5 }}
          />
      </div>
    </div>
  </motion.div>
);

// --- 2. MAIN COMPONENT ---
const DashboardPreview = () => {
  // --- STATE ---
  const [tick, setTick] = useState(0); 

  // UI States
  const [view, setView] = useState('create'); 
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [loginKey, setLoginKey] = useState("");
  const [activeField, setActiveField] = useState(null); 
  
  // Dashboard Data
  const [activeTab, setActiveTab] = useState('logs');
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0 });
  
  // FIX: Båda variablerna behövs
  const [merkleData, setMerkleData] = useState(null); 
  const [merkleStatus, setMerkleStatus] = useState(null); 

  const [showToast, setShowToast] = useState(null);
  const [activeBtn, setActiveBtn] = useState(null); 

  // Narrator State
  const [narrator, setNarrator] = useState({ step: 1, total: 6, title: "Start", text: "Loading..." });

  // --- TIME LOOP ---
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000); 
    return () => clearInterval(timer);
  }, []);

  // --- SCRIPT LOGIC ---
  useEffect(() => {
    const t = tick;

    // === PHASE 1: CREATE (0-14s) ===
    if (t === 1) { 
        setView('create'); setCompanyName(""); setEmail(""); 
        setNarrator({ 
            step: 1, total: 6, title: "Cryptographic Initialization", 
            text: "We begin by initializing a secure Processor instance. This action creates a unique Merkle Tree root for your organization, ensuring your audit logs are cryptographically isolated from all other tenants." 
        });
    }
    if (t === 2) setActiveField('name');
    if (t >= 3 && t <= 6) {
        const fullName = "HazarNode";
        const progress = Math.ceil((t - 2) * 2.5); 
        setCompanyName(fullName.substring(0, progress));
    }
    if (t === 7) { setCompanyName("HazarNode"); setActiveField('email'); }
    
    if (t >= 8 && t <= 10) {
        const fullEmail = "admin@hazarnode.com";
        const progress = Math.ceil((t - 7) * 7);
        setEmail(fullEmail.substring(0, progress));
    }
    if (t === 11) { setEmail("admin@hazarnode.com"); setActiveField(null); }

    if (t === 12) setActiveBtn('create');
    if (t === 13) { setActiveBtn(null); setView('success'); }

    // === PHASE 2: KEY & LOGIN (14-24s) ===
    if (t === 14) {
        setNarrator({ 
            step: 2, total: 6, title: "API Security Handshake", 
            text: "The system generates a high-entropy API Key. This key is critical: it acts as the digital signature for every event you ingest, guaranteeing that no one else can inject data into your audit stream." 
        });
    }
    if (t === 18) {
        setView('login'); setLoginKey("");
        setNarrator({ 
            step: 3, total: 6, title: "Accessing the Console", 
            text: "Using the API key, we authenticate into the secure dashboard. This gives you a real-time, read-only view of your immutable ledger." 
        });
    }
    if (t === 19) setActiveField('key');
    if (t >= 20 && t <= 22) setLoginKey("av_live_8f92a...".substring(0, (t-19)*8));
    if (t === 23) { setActiveField(null); setActiveBtn('login'); }
    if (t === 24) { setActiveBtn(null); setView('dashboard'); }

    // === PHASE 3: DASHBOARD INJECTION (25-36s) ===
    if (t === 25) {
        setNarrator({ 
            step: 4, total: 6, title: "Immutable Event Injection", 
            text: "We simulate a backend API call (e.g., a payment). The system instantly captures the JSON payload, timestamps it, and generates a SHA-256 hash, locking it into the Merkle Tree forever." 
        });
    }
    if (t === 30) setActiveBtn('inject');
    if (t === 31) { 
        setActiveBtn(null);
        setLogs([{ 
            id: '15e408a3-1c54-432e-9639-5d83f9c61143', event: 'payment.success', 
            user: 'user_882...', time: 'Just now', type: 'success', payload: '{"amt": 500}' 
        }]);
        setStats({ total: 10 }); 
    }

    // === PHASE 4: MERKLE (37-50s) ===
    if (t === 37) {
        setNarrator({ 
            step: 5, total: 6, title: "Mathematical Verification", 
            text: "Trust math, not databases. By inputting the Event UUID, we reconstruct the hash path to the Root Hash. If a single bit had been altered, this verification would fail immediately." 
        });
        setActiveTab('merkle');
    }
    if (t === 42) setActiveBtn('verify');
    if (t === 43) { 
        setActiveBtn(null); 
        setMerkleStatus('success'); // FIX: Nu definierad
        setMerkleData({
            root: "39f8a5...e2b1",
            leaf: "a1b2c3...d4e5",
            valid: true
        });
    }

    // === PHASE 5: GDPR (51-65s) ===
    if (t === 51) {
        setNarrator({ 
            step: 6, total: 6, title: "GDPR Art. 17 Compliance", 
            text: "Deleting data in an immutable blockchain is impossible. Instead, we perform 'Crypto-Shredding'. We replace the User ID with a random token, making the data unidentifiable while keeping the audit trail unbroken." 
        });
        setActiveTab('gdpr');
        setMerkleStatus(null);
        setMerkleData(null);
    }
    if (t === 58) setActiveBtn('erase');
    if (t === 59) {
        setActiveBtn(null);
        setShowToast('erased');
        const erasedLog = { 
            id: '44870412-51f1-4005-8e1c-8ab90ca6e9db', event: 'gdpr.erasure_request', 
            user: 'SYSTEM_COMPLIANCE...', time: 'Just now', type: 'gdpr', payload: '{"action": "erase"}' 
        };
        setLogs(prev => [erasedLog, { ...prev[0], user: 'ERASED_e6de0266...', type: 'erased' }]);
        setStats({ total: 11 });
    }

    // === PHASE 6: FINISH (66-75s) ===
    if (t === 66) {
        setActiveTab('logs');
        setShowToast(null);
    }
    if (t === 75) { setTick(0); setLogs([]); setStats({ total: 0 }); setView('create'); }

  }, [tick]);

  return (
    <div className="py-24 md:py-32 bg-[#020617] border-t border-white/5 overflow-hidden relative font-sans selection:bg-blue-500/30">
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-12">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-blue-400 backdrop-blur-md mb-6">
             <LayoutGrid size={14} /> Product Tour
           </div>
           <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
             The Integrity Engine in Action.
           </h2>
           <p className="text-slate-400 max-w-lg mx-auto">
             A fully automated walkthrough of the Auditor Veritas workflow.
           </p>
        </div>

        {/* WINDOW CONTAINER */}
        <div className="bg-slate-900 p-2 rounded-3xl border border-slate-800 shadow-2xl max-w-[1200px] mx-auto ring-1 ring-white/10 relative min-h-[700px] flex flex-col transition-all duration-500">
            
            {/* NARRATOR OVERLAY */}
            <AnimatePresence mode='wait'>
                <Narrator key={narrator.title} {...narrator} />
            </AnimatePresence>

            {/* BROWSER BAR */}
            <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-4 shrink-0 rounded-t-2xl">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                </div>
                <div className="flex-1 bg-slate-50 border border-slate-200 h-7 rounded flex items-center justify-center text-[10px] text-slate-400 font-mono">
                    <Lock size={8} className="mr-1 text-emerald-500"/> dashboard.auditor-veritas.com
                </div>
            </div>

            {/* === VIEW 1: CREATE PROCESSOR === */}
            {view === 'create' && (
                <motion.div className="flex-1 bg-[#f8fafc] flex items-center justify-center p-6 rounded-b-2xl" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                    <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-100 max-w-md w-full">
                        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Zap className="text-blue-600" size={28} fill="currentColor" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 text-center mb-1">Create New Processor</h2>
                        <p className="text-xs text-slate-500 text-center mb-8">Start your GDPR-compliant audit trail in seconds.</p>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 mb-1.5">
                                    <Building2 size={14} className="text-slate-400"/> Company Name
                                </label>
                                <input 
                                    type="text" 
                                    className={`w-full p-3 border rounded-lg text-sm outline-none transition-colors text-slate-900 ${activeField === 'name' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'}`} 
                                    placeholder="Enter your company name" 
                                    value={companyName} 
                                    readOnly 
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 mb-1.5">
                                    <Mail size={14} className="text-slate-400"/> Business Email
                                </label>
                                <input 
                                    type="text" 
                                    className={`w-full p-3 border rounded-lg text-sm outline-none transition-colors text-slate-900 ${activeField === 'email' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'}`} 
                                    placeholder="Enter your business email" 
                                    value={email} 
                                    readOnly 
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 mb-1.5">
                                    <CreditCard size={14} className="text-slate-400"/> Select Plan
                                </label>
                                <div className="w-full p-3 border border-slate-200 rounded-lg text-sm text-slate-500 bg-white flex justify-between items-center">
                                    Starter - 100 events ($0/mo) <ChevronRight size={14} className="rotate-90"/>
                                </div>
                            </div>
                            <button className={`w-full py-3 rounded-lg text-sm font-bold text-white transition-all ${activeBtn === 'create' ? 'bg-blue-800 scale-95' : 'bg-blue-600'}`}>
                                Create Processor
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

             {/* === VIEW 2: SUCCESS === */}
             {view === 'success' && (
                <motion.div className="flex-1 bg-[#f8fafc] flex items-center justify-center p-6 rounded-b-2xl" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                     <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-100 max-w-md w-full text-center">
                        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="text-emerald-600" size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Success!</h2>
                        <p className="text-xs text-slate-500 mb-6">Save your API key immediately.</p>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-6 flex items-center justify-between relative">
                            <code className="text-xs font-mono text-slate-600">av_live_8f92a...</code>
                            <Copy size={16} className="text-slate-400"/>
                            <AnimatePresence>
                                {showToast === 'copied' && (
                                    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="absolute -top-10 right-0 bg-slate-800 text-white text-[10px] py-1 px-2 rounded">Copied!</motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                     </div>
                </motion.div>
            )}

            {/* === VIEW 3: LOGIN === */}
            {view === 'login' && (
                <motion.div className="flex-1 bg-[#f8fafc] flex items-center justify-center p-6 rounded-b-2xl" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                    <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-100 max-w-sm w-full text-center">
                        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lock className="text-blue-500" size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Secure Console</h2>
                        <p className="text-xs text-slate-500 mb-6">Enter your live API key to access real-time logs.</p>
                        
                        <div className={`relative mb-4 transition-all ${activeField === 'key' ? 'ring-2 ring-blue-100 rounded-lg' : ''}`}>
                            <input 
                                type="text" 
                                className={`w-full p-3 bg-slate-50 border rounded-lg text-sm font-mono outline-none text-slate-900 ${activeField === 'key' ? 'border-blue-500' : 'border-slate-200'}`} 
                                placeholder="av_live_..." 
                                value={loginKey}
                                readOnly
                            />
                        </div>

                        <button className={`w-full py-3 rounded-lg text-sm font-bold text-white transition-all ${activeBtn === 'login' ? 'bg-slate-900 scale-95' : 'bg-[#0a2540]'}`}>
                            Connect
                        </button>
                    </div>
                </motion.div>
            )}

            {/* === VIEW 4: DASHBOARD === */}
            {view === 'dashboard' && (
                <motion.div className="flex flex-col h-full bg-[#f7fafc] rounded-b-2xl overflow-hidden" initial={{opacity:0}} animate={{opacity:1}}>
                    {/* HEADER */}
                    <div className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold border border-emerald-200">LIVE</div>
                                <span className="text-xs text-slate-400 font-mono">88ed8fd6-267c...</span>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">HazarNode</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-100 px-3 py-1.5 rounded border border-slate-200 flex flex-col items-end">
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">API KEY</span>
                                <span className="text-[10px] font-mono text-slate-600">av_dfbaaa49...</span>
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold shadow-sm"><LogOut size={14} /> Sign Out</button>
                        </div>
                    </div>

                    <div className="p-8 flex-1 overflow-hidden flex flex-col gap-8">
                        
                        {/* TOP GRID */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* INGESTION CHART (Left) */}
                            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-1 relative h-64 flex flex-col">
                                <div className="p-6 flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded bg-blue-50 text-blue-600 border border-blue-100"><Activity size={16}/></div>
                                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ingestion Volume</span>
                                    </div>
                                    <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span><span className="text-[10px] font-bold text-blue-500 uppercase">LIVE</span></div>
                                </div>
                                <div className="flex-1 relative w-full overflow-hidden">
                                    <svg viewBox="0 0 100 40" className="w-full h-full absolute bottom-0 left-0 px-2" preserveAspectRatio="none">
                                        <defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1"/><stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/></linearGradient></defs>
                                        <path d={`M0,40 Q25,40 50,${stats.total > 0 ? 10 : 40} T100,40 V40 H0 Z`} fill="url(#grad)" className="transition-all duration-1000 ease-in-out"/>
                                        <path d={`M0,40 Q25,40 50,${stats.total > 0 ? 10 : 40} T100,40`} fill="none" stroke="#3b82f6" strokeWidth="0.5" className="transition-all duration-1000 ease-in-out"/>
                                    </svg>
                                </div>
                                <div className="border-t border-slate-50 p-4 flex justify-between items-center bg-white/50 backdrop-blur-sm">
                                    <div className="text-center"><div className="text-[10px] text-slate-400 font-bold uppercase">Total Events</div><div className="text-xl font-bold text-slate-900">{stats.total}</div></div>
                                    <div className="text-center"><div className="text-[10px] text-slate-400 font-bold uppercase">Success Rate</div><div className="text-xl font-bold text-emerald-600">100%</div></div>
                                    <div className="text-center"><div className="text-[10px] text-slate-400 font-bold uppercase">Avg Latency</div><div className="text-xl font-bold text-slate-900">12ms</div></div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: QUOTA & KEYS */}
                            <div className="space-y-6">
                                {/* Quota */}
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-slate-800 text-xs font-bold uppercase tracking-wider">Usage Quota</h3>
                                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{stats.total} / 100</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                                        <div className="bg-blue-500 h-full transition-all duration-500 ease-out" style={{ width: `${stats.total}%` }}></div>
                                    </div>
                                    <p className="text-xs text-slate-400">Resets in 28 days</p>
                                </div>

                                {/* Keys */}
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="flex justify-between mb-4">
                                        <h3 className="font-bold flex items-center gap-2 text-slate-800 text-sm"><RotateCw className="w-4 h-4 text-purple-600"/> API Key Management</h3>
                                        <span className="bg-emerald-50 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">ACTIVE</span>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg text-xs font-mono text-slate-400 mb-4 flex justify-between items-center border border-slate-100">
                                        <span>••••••••••••••••••••</span>
                                        <div className="flex gap-2 text-slate-400"><Eye size={14}/><Copy size={14}/></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button className="bg-[#0a2540] text-white py-2 rounded-lg text-xs font-bold">Rotate Key</button>
                                        <button className="bg-red-50 text-red-600 border border-red-100 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1"><AlertTriangle size={12}/> Revoke Key</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* TABS */}
                        <div className="border-b border-slate-200 flex gap-8 text-sm font-bold">
                            <button className={`pb-3 border-b-2 transition-colors ${activeTab === 'logs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>Live Logs</button>
                            <button className={`pb-3 border-b-2 transition-colors ${activeTab === 'search' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>Search & Filters</button>
                            <button className={`pb-3 border-b-2 transition-colors ${activeTab === 'merkle' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500'}`}>Merkle Proofs</button>
                            <button className={`pb-3 border-b-2 transition-colors ${activeTab === 'gdpr' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500'}`}>GDPR Center</button>
                        </div>

                        {/* BOTTOM ROW */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                            
                            {/* LOGS TABLE (2/3) */}
                            <div className="lg:col-span-2">
                                {activeTab === 'logs' && (
                                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[300px]">
                                        <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 grid grid-cols-12 gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                            <div className="col-span-1 text-center">Event</div>
                                            <div className="col-span-4">Event ID (UUID)</div>
                                            <div className="col-span-3">User ID Hash</div>
                                            <div className="col-span-2">Data Payload</div>
                                            <div className="col-span-2 text-right">Timestamp</div>
                                        </div>
                                        <div className="divide-y divide-slate-50">
                                            <AnimatePresence mode='popLayout'>
                                                {logs.map((log) => (
                                                    <motion.div key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-12 gap-4 px-4 py-3 text-xs items-center hover:bg-slate-50/50 transition-colors">
                                                        <div className="col-span-1 flex justify-center">
                                                            {log.type === 'gdpr' || log.type === 'erased' 
                                                                ? <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-red-600"><Trash2 size={12}/></div>
                                                                : <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600"><CheckCircle2 size={12}/></div>
                                                            }
                                                        </div>
                                                        <div className="col-span-4">
                                                            <span className={`px-1.5 py-0.5 rounded border text-[10px] font-mono ${log.type === 'gdpr' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>{log.event}</span>
                                                            <div className="text-blue-600 font-mono mt-1 truncate cursor-pointer hover:underline">{log.id}</div>
                                                        </div>
                                                        <div className={`col-span-3 font-mono truncate text-slate-500 ${log.type === 'erased' && 'line-through decoration-red-400'}`}>{log.user}</div>
                                                        <div className="col-span-2 font-mono text-slate-400 truncate bg-slate-50 p-1 rounded border border-slate-100">{log.payload}</div>
                                                        <div className="col-span-2 text-right text-slate-400 font-mono">{log.time}</div>
                                                    </motion.div>
                                                ))}
                                                {logs.length === 0 && <div className="p-12 text-center text-slate-400 text-xs">Waiting for live events...</div>}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'merkle' && (
                                    <div className="bg-white p-8 rounded-xl border border-purple-100 text-center h-full flex flex-col items-center justify-center shadow-sm">
                                        <Layers size={32} className="text-purple-600 mb-4"/>
                                        <h3 className="font-bold text-purple-900 text-lg mb-2">Merkle Proof Verifier</h3>
                                        <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">Cryptographically prove event integrity against the Root Hash.</p>
                                        
                                        <div className="w-full max-w-md bg-slate-50 p-1.5 rounded-lg border border-slate-200 flex gap-2 mb-6">
                                            <div className="flex-1 bg-white border border-slate-200 rounded px-3 py-2.5 text-xs text-slate-400 text-left truncate font-mono">15e408a3-1c54-432e-9639-5d83f9c61143</div>
                                            <button className={`bg-purple-600 text-white px-6 rounded-md text-xs font-bold transition-transform ${activeBtn === 'verify' ? 'scale-95' : ''}`}>VERIFY INTEGRITY</button>
                                        </div>

                                        {merkleStatus === 'success' && (
                                            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="w-full max-w-md bg-green-50 border border-green-200 text-green-800 rounded-xl overflow-hidden text-left shadow-sm">
                                                <div className="p-3 border-b border-green-200 flex items-center gap-2 bg-green-100/50">
                                                    <CheckCircle2 size={16} className="text-green-600"/>
                                                    <span className="font-bold text-xs uppercase">Verification SUCCESS</span>
                                                </div>
                                                <div className="p-4 space-y-3 text-[10px] font-mono">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-bold text-green-700 text-[9px]">MERKLE ROOT</span>
                                                        <span className="opacity-75 break-all">{merkleData?.root}</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-bold text-green-700 text-[9px]">EVENT LEAF HASH</span>
                                                        <span className="opacity-75 break-all">{merkleData?.leaf}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'gdpr' && (
                                    <div className="bg-white p-8 rounded-xl border border-red-100 h-full shadow-sm">
                                        <div className="flex items-center gap-3 mb-6 text-red-700 border-b border-red-50 pb-4">
                                            <div className="p-2 bg-red-50 rounded-lg"><ShieldAlert size={20} /></div>
                                            <h3 className="font-bold text-lg">GDPR Right to Erasure (Article 17)</h3>
                                        </div>
                                        <div className="space-y-6 max-w-lg">
                                            <p className="text-xs text-slate-500">Permanently pseudonymize a user's data in the immutable log without breaking the audit chain. Data is replaced with a unique, un-linkable token.</p>
                                            <div><label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">User Identifier (Cleartext)</label><input type="text" value="user_882..." readOnly className="w-full p-3 border border-slate-200 rounded-lg text-sm bg-slate-50 font-mono text-slate-600"/></div>
                                            <button className={`w-full bg-red-600 text-white py-3 rounded-lg text-sm font-bold shadow-md shadow-red-100 transition-transform ${activeBtn === 'erase' ? 'scale-95' : ''}`}>EXECUTE ERASURE</button>
                                            {showToast === 'erased' && <div className="bg-green-50 text-green-700 px-4 py-2 rounded text-xs font-bold border border-green-100 flex items-center gap-2"><Check size={12}/> Erasure Complete. Token Generated.</div>}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* SIMULATOR (1/3) */}
                            <div className="lg:col-span-1">
                                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden h-full">
                                    <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                                        <Zap className="text-amber-500" size={18} />
                                        <h3 className="font-bold text-slate-800 text-sm">API Simulator</h3>
                                    </div>
                                    <div className="p-6 space-y-5">
                                        <p className="text-xs text-slate-500 leading-relaxed">Manually inject an event to test your webhook configuration and audit stream.</p>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Event Type</label>
                                            <div className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-400">e.g. payment.success</div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">User Identifier</label>
                                            <div className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-400">e.g. user@gmail.com</div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">JSON Payload</label>
                                            <div className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs h-24 font-mono text-slate-400">{`{}`}</div>
                                        </div>
                                        <button className={`w-full bg-[#0a2540] text-white py-3 rounded-lg text-xs font-bold shadow-lg transition-transform ${activeBtn === 'inject' ? 'scale-95' : ''}`}>
                                            Inject Test Event
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </motion.div>
            )}

        </div>
      </div>
    </div>
  );
};

export default DashboardPreview;