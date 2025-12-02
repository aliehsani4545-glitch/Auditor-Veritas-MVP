import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Activity, CheckCircle2, LayoutGrid, Lock, Zap, Shield, 
  LogOut, Trash2, Search, Layers, ShieldAlert, ShieldCheck, 
  Building2, ArrowRight, RefreshCw, Check, Menu, X, HelpCircle
} from 'lucide-react';

// --- VISUAL COMPONENTS ---

// 1. Chart
const SimpleChart = ({ dataPoints = [] }) => {
  const displayPoints = dataPoints.length < 10 ? [...Array(10 - dataPoints.length).fill(0), ...dataPoints] : dataPoints;
  const maxVal = Math.max(...displayPoints, 10); 
  const pathData = displayPoints.map((p, i) => {
    const x = (i / (displayPoints.length - 1)) * 100;
    const y = 100 - (p / maxVal) * 80; 
    return `${x},${y}`;
  }).join(' L ');

  return (
    <div className="relative h-56 w-full overflow-hidden rounded-xl bg-white border border-slate-100">
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center border-b border-slate-50 z-10 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-50 border border-blue-100"><Activity size={14} className="text-blue-600" /></div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ingestion Volume</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Live</span>
        </div>
      </div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute bottom-0 left-0 right-0 h-[calc(100%-3rem)] w-full px-2 pb-2">
        <defs><linearGradient id="gradPreview" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0" /></linearGradient></defs>
        {displayPoints.length > 1 && <><path d={`M 0,100 L ${pathData} L 100,100 Z`} fill="url(#gradPreview)" /><path d={`M 0,100 L ${pathData}`} fill="none" stroke="#3b82f6" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" /></>}
      </svg>
    </div>
  );
};

// 2. Narrator
const Narrator = ({ text, step, total }) => (
  <motion.div 
    initial={{ y: 100, opacity: 0 }} 
    animate={{ y: 0, opacity: 1 }} 
    exit={{ y: 100, opacity: 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
    className="fixed bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 z-[999] bg-slate-900/95 backdrop-blur-md text-white p-5 rounded-xl shadow-2xl flex items-start md:items-center gap-5 border border-slate-700 max-w-2xl w-auto mx-auto"
  >
    <div className="hidden md:flex flex-col items-center justify-center w-10 h-10 rounded-full bg-blue-600 font-bold text-xs shrink-0 border border-blue-400/30">
       <span>{step}</span>
    </div>
    <div className="flex-1">
        <span className="text-[10px] uppercase font-bold text-blue-400 mb-1 block md:inline md:mr-2">Product Tour:</span>
        <p className="text-sm font-light text-slate-100 leading-relaxed">{text}</p>
    </div>
  </motion.div>
);

// --- MAIN DASHBOARD PREVIEW ---
const DashboardPreview = () => {
  const { ref, inView } = useInView({
    threshold: 0.2, 
    triggerOnce: false 
  });

  const [tick, setTick] = useState(0);
  const [view, setView] = useState('login'); 
  
  // Input States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  
  // Dashboard Data
  const [activeTab, setActiveTab] = useState('logs'); 
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, monthly: 0 });
  const [chartData, setChartData] = useState([0,0,0,0,0,0,0,0,0,0]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Simulators
  const [simLoading, setSimLoading] = useState(false);
  const [merkleHash, setMerkleHash] = useState("");
  const [merkleStatus, setMerkleStatus] = useState(null); 
  const [gdprUser, setGdprUser] = useState("");
  const [gdprStatus, setGdprStatus] = useState(null);

  const [narrator, setNarrator] = useState({ text: "Initializing secure environment...", step: 0 });

  useEffect(() => {
    if (!inView) return; 

    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, [inView]); 

  useEffect(() => {
    const t = tick;

    // Logic for steps...
    if (t === 1) {
        setView('login');
        setNarrator({ text: "We begin with secure login. The admin enters credentials to access the encrypted console.", step: 1 });
    }
    if (t >= 3 && t <= 7) {
        const txt = "admin@hazarnode.com";
        setEmail(txt.substring(0, Math.ceil((t - 2) * 5)));
        if(t > 5) setPassword("********");
    }
    if (t === 13) {
        setView('setup');
        setNarrator({ text: "Organization Setup. A dedicated 'Immutable Ledger' is initialized for the company, ensuring logs can never be manipulated.", step: 2 });
    }
    if (t >= 15 && t <= 19) {
        const txt = "HazarNode";
        setCompanyName(txt.substring(0, Math.ceil((t - 14) * 3)));
    }
    if (t === 25) {
        setView('dashboard');
        setActiveTab('logs');
        setNarrator({ text: "Welcome to the Dashboard. On the right is the API Simulator. We will now inject an event to demonstrate how the system instantly signs and locks data.", step: 3 });
    }
    if (t === 32) setSimLoading(true);
    if (t === 35) {
        setSimLoading(false);
        setStats({ total: 1, monthly: 1 });
        setChartData(prev => [...prev.slice(1), 70]);
        setLogs([{
            id: '15ce9ec1-0a2f-42c0-a411-9b8cdc0d7625', 
            event: 'user_login', 
            user: 'user123',
            time: 'Just now', type: 'success', payload: '{}'
        }]);
        setNarrator({ text: "Done! The event was captured in real-time, timestamped, and cryptographically signed. See the log on the left.", step: 3 });
    }
    if (t === 46) {
        setActiveTab('merkle');
        setNarrator({ text: "Verification. How do we know the data is authentic? By pasting the Event ID, we mathematically prove the log is unaltered using the Merkle Tree structure.", step: 4 });
    }
    if (t >= 50 && t <= 54) {
        const hash = "15ce9ec1-0a2f-42c0-a411-9b8cdc0d7625";
        setMerkleHash(hash.substring(0, Math.ceil((t - 49) * 10)));
    }
    if (t === 56) setMerkleStatus('verifying');
    if (t === 59) setMerkleStatus('success');
    if (t === 66) {
        setActiveTab('gdpr');
        setNarrator({ text: "GDPR Article 17. The 'Right to be Forgotten' is challenging in immutable logs. We solve this via 'Crypto-Shredding'—deleting the specific encryption key for that user.", step: 5 });
    }
    if (t >= 72 && t <= 75) {
        const u = "user123";
        setGdprUser(u.substring(0, Math.ceil((t - 71) * 3)));
    }
    if (t === 77) setGdprStatus('erasing');
    if (t === 80) {
        setGdprStatus('success');
        setLogs(prev => prev.map(l => ({ ...l, type: 'gdpr', user: 'ERASED', event: 'erasure.executed' })));
        setNarrator({ text: "The user is now permanently anonymized, but the audit chain remains intact. Full GDPR compliance without compromising security.", step: 5 });
    }
    if (t === 92) {
        setTick(0);
        setLogs([]);
        setStats({ total: 0, monthly: 0 });
        setChartData([0,0,0,0,0,0,0,0,0,0]);
        setMerkleStatus(null);
        setMerkleHash("");
        setGdprStatus(null);
        setGdprUser("");
        setCompanyName("");
        setEmail("");
        setPassword("");
    }
  }, [tick]);

  // RENDER CONTENT
  const renderContent = () => {
    if (view === 'login') {
      return (
        <div className="min-h-[800px] bg-[#020617] text-slate-200 font-sans relative flex flex-col rounded-3xl overflow-hidden border border-slate-800 mx-auto max-w-7xl">
            <nav className="flex justify-between items-center px-6 py-5 md:px-12 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><Shield className="text-white" size={18}/></div>
                    <span className="text-white font-bold text-lg">Auditor Veritas</span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                    <span>Home</span><span>Enterprise</span><span className="text-white flex gap-2"><Lock size={14}/> Login</span>
                </div>
            </nav>
            <div className="flex-1 flex items-center justify-center p-4">
                <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] p-8 text-center text-slate-900">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30"><Lock className="text-white" size={24} /></div>
                    <h2 className="text-2xl font-bold mb-1">Sign In</h2>
                    <p className="text-xs text-slate-500 mb-8">Access the secure dashboard.</p>
                    <div className="space-y-4 text-left">
                        <div><label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Email</label><input type="text" value={email} readOnly className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm bg-slate-50 font-medium" /></div>
                        <div><label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Password</label><input type="password" value={password} readOnly className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm bg-slate-50 font-medium" /></div>
                        <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-lg mt-2">Sign In</button>
                        <p className="text-center text-xs text-blue-600 pt-2">Don't have an account? Sign Up</p>
                    </div>
                </motion.div>
            </div>
        </div>
      );
    } 
    
    if (view === 'setup') {
      return (
        <div className="min-h-[800px] bg-[#020617] flex items-center justify-center p-4 font-sans text-slate-900 rounded-3xl overflow-hidden border border-slate-800 mx-auto max-w-7xl">
             <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><Building2 size={20}/></div>
                    <div><h2 className="text-lg font-bold">Setup Organization</h2><p className="text-xs text-slate-500">Initialize immutable ledger.</p></div>
                </div>
                <div className="space-y-4">
                    <div><label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Company Name</label><div className="relative"><input type="text" value={companyName} readOnly className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm bg-slate-50 font-medium" />{companyName.length > 5 && <CheckCircle2 className="absolute right-3 top-3 text-emerald-500 animate-in zoom-in" size={18}/>}</div></div>
                    <button className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg shadow-lg flex justify-center gap-2">Initialize <ArrowRight size={16}/></button>
                </div>
             </motion.div>
        </div>
      );
    }

    return (
      <div className="min-h-[800px] bg-[#f8fafc] font-sans text-slate-900 pb-20 rounded-3xl overflow-hidden border border-slate-200 mx-auto max-w-7xl shadow-2xl">
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
                    <div>
                        <div className="flex items-center gap-2"><h1 className="text-sm md:text-lg font-bold text-slate-900 leading-none">{companyName || "HazarNode"}</h1><div className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200">LIVE</div></div>
                        <span className="hidden md:block text-[10px] text-slate-400 font-mono">proc_live_88x...</span>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-4">
                    <div className="flex flex-col items-end"><span className="text-[10px] font-bold text-slate-400 uppercase">API Key</span><code className="text-xs bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-600">sk_live_hz...</code></div>
                    <button className="p-2 text-slate-400 hover:text-slate-600 border rounded-lg hover:bg-slate-50"><LogOut size={16}/></button>
                </div>
                <button className="md:hidden p-2 text-slate-500" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>{isMobileMenuOpen ? <X/> : <Menu/>}</button>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2"><div className="bg-white rounded-xl border border-slate-200 shadow-sm p-1"><SimpleChart dataPoints={chartData} /></div></div>
                <div className="space-y-4 md:space-y-6">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"><div className="flex justify-between items-start mb-4"><h3 className="text-slate-800 text-xs font-bold uppercase tracking-wider">Quota</h3><span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{stats.monthly} / 1000</span></div><div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2"><div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${(stats.monthly/1000)*100}%` }}></div></div></div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between"><div><h3 className="text-sm font-bold">Key Rotation</h3><p className="text-xs text-slate-500">88 days left</p></div><RefreshCw size={16} className="text-slate-400"/></div>
                </div>
            </div>

            <div className="flex gap-4 md:gap-8 border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar">
                {['logs', 'search', 'merkle', 'gdpr'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-sm font-bold border-b-2 whitespace-nowrap capitalize transition-colors ${activeTab === tab ? (tab === 'merkle' ? 'border-purple-500 text-purple-600' : tab === 'gdpr' ? 'border-red-500 text-red-600' : 'border-blue-500 text-blue-600') : 'border-transparent text-slate-400'}`}>
                        {tab === 'logs' ? 'Live Logs' : tab === 'search' ? 'Search & Filters' : tab === 'merkle' ? 'Merkle Proofs' : 'GDPR Center'}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {activeTab === 'logs' && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px]">
                            <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                <div className="col-span-1 text-center"></div><div className="col-span-4">Event</div><div className="col-span-4">UUID</div><div className="col-span-3 text-right">Time</div>
                            </div>
                            <div className="divide-y divide-slate-50">
                                <AnimatePresence>
                                    {logs.map((log) => (
                                        <motion.div key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-12 gap-2 px-4 py-3 text-xs items-center">
                                            <div className="col-span-1 flex justify-center">{log.type === 'gdpr' ? <Trash2 size={14} className="text-red-500"/> : <CheckCircle2 size={14} className="text-emerald-500"/>}</div>
                                            <div className="col-span-4"><span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${log.type === 'gdpr' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>{log.event}</span></div>
                                            <div className="col-span-4 text-blue-600 font-mono text-[10px] truncate">{log.id}</div>
                                            <div className="col-span-3 text-right text-slate-400 font-mono text-[10px]">{log.time}</div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {logs.length === 0 && <div className="p-12 text-center text-slate-400 text-xs">Waiting for live events...</div>}
                            </div>
                        </div>
                    )}
                    {activeTab === 'merkle' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Event ID (UUID)</label>
                                <input type="text" value={merkleHash} readOnly placeholder="e.g. 15ce9ec1-..." className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm font-mono bg-slate-50 mb-4 focus:ring-2 focus:ring-purple-500/20 outline-none" />
                                <button className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white py-3 rounded-lg font-bold text-sm uppercase tracking-wide flex justify-center items-center gap-2 transition-colors">
                                    {merkleStatus === 'verifying' ? <RefreshCw className="animate-spin w-4 h-4"/> : <><ShieldCheck size={16}/> Verify Integrity</>}
                                </button>
                            </div>
                            {merkleStatus === 'success' && (
                                <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="bg-white rounded-xl border border-emerald-100 shadow-sm overflow-hidden">
                                    <div className="bg-emerald-50/50 border-b border-emerald-100 p-4 flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm"><CheckCircle2 size={18}/> Verification SUCCESS</div>
                                        <span className="text-[10px] bg-white px-2 py-1 rounded border border-emerald-100 text-emerald-600">Steps: 2</span>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                                            <span className="font-bold text-purple-600 uppercase text-[10px]">Merkle Root</span>
                                            <span className="font-mono text-slate-400 truncate max-w-[200px]">df2b5b7f70041f1184c6acf...</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                                            <span className="font-bold text-blue-600 uppercase text-[10px]">Event Leaf Hash</span>
                                            <span className="font-mono text-slate-400 truncate max-w-[200px]">87f3baf11b819698616e8fa...</span>
                                        </div>
                                        <div className="mt-4 space-y-3">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2"><Layers size={12}/> Proof Path</p>
                                            {[1,2].map(i => (
                                                <div key={i} className="flex gap-3 items-start">
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 text-blue-600 font-bold text-[10px] flex items-center justify-center border border-slate-200 shrink-0">{i}</div>
                                                    <div className="flex-1">
                                                        <div className="text-xs font-bold text-slate-700">Step {i}: Hashing with RIGHT Sibling</div>
                                                        <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate max-w-[250px]">{i===1 ? '4364f7670a432017adf4f93...' : '91ffdc5dea5fc3b4dd2f7c0...'}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}
                    {activeTab === 'gdpr' && (
                        <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-red-50 bg-red-50/30 flex items-center gap-2">
                                <ShieldAlert className="text-red-500" size={16} />
                                <h3 className="font-bold text-red-900 text-sm">GDPR Right to Erasure (Article 17)</h3>
                            </div>
                            <div className="p-6">
                                <p className="text-xs text-slate-500 mb-6 leading-relaxed">Permanently pseudonymize a user's data in the immutable log without breaking the audit chain.</p>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">User Identifier (Cleartext)</label>
                                <input type="text" value={gdprUser} readOnly placeholder="e.g. user123" className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm mb-6 focus:border-red-500 outline-none transition-colors" />
                                <button className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white py-3 rounded-lg font-bold text-xs uppercase tracking-wide flex justify-center items-center gap-2 mb-6 transition-colors shadow-sm">
                                    {gdprStatus === 'erasing' ? <RefreshCw className="animate-spin w-3.5 h-3.5"/> : <><Trash2 size={14}/> Execute Erasure</>}
                                </button>
                                {gdprStatus === 'success' && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800 flex items-center gap-2">
                                        <CheckCircle2 size={14} /> Success! 0 records pseudonymized. Token: verify_172...
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2"><Zap className="text-amber-500" size={16} /><h3 className="font-bold text-slate-700 text-sm">API Simulator</h3></div>
                        <div className="p-5 space-y-4">
                            <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Event Type</label><input type="text" value="user_login" readOnly className="w-full p-2 bg-white border border-slate-200 rounded text-xs text-slate-600" /></div>
                            <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">User Identifier</label><input type="text" value="user123" readOnly className="w-full p-2 bg-white border border-slate-200 rounded text-xs text-slate-600" /></div>
                            <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">JSON Payload</label><div className="w-full p-2 bg-white border border-slate-200 rounded text-xs text-slate-400 font-mono h-16">{`{}`}</div></div>
                            <button className={`w-full bg-[#0a2540] text-white py-3 rounded-lg font-bold text-xs uppercase tracking-wide flex justify-center items-center gap-2 ${simLoading ? 'opacity-80' : ''}`}>
                                {simLoading ? <RefreshCw className="animate-spin w-3.5 h-3.5"/> : 'Inject Test Event'}
                            </button>
                        </div>
                    </div>
                    <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                        <div className="p-1.5 bg-blue-100 rounded-full shrink-0 text-blue-600"><Lock size={14} /></div>
                        <div><h4 className="text-xs font-bold text-blue-800 mb-1">Security Note</h4><p className="text-[10px] text-blue-600/80 leading-relaxed">Events logged here are signed with your active API key and stored immutably.</p></div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative min-h-[800px] w-full py-10">
        {renderContent()}
        <AnimatePresence>
            {inView && <Narrator text={narrator.text} step={narrator.step} total={5} />}
        </AnimatePresence>
    </div>
  );
};

export default DashboardPreview;