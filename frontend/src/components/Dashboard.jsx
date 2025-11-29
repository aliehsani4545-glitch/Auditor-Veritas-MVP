import React, { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import { 
  Activity, Search, CheckCircle2, RefreshCw, Zap, Lock, LogOut, LayoutGrid, 
  Trash2, ShieldAlert, Layers, Filter, HelpCircle, X, FileDown, FileCheck, RotateCw, Copy, Eye, Download, AlertTriangle
} from 'lucide-react';
import MerkleProofViewer from './MerkleProofViewer'; 

// --- API HELPER ---
const API_BASE_URL = 'https://auditor-veritas-mvp.onrender.com';

const apiCall = async (endpoint, options = {}, token = null, apiKey = null) => {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (apiKey) headers['x-api-key'] = apiKey;
    const config = { headers, ...options };
    if (options.body) config.body = JSON.stringify(options.body);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (response.status === 204) return null;
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/zip')) return response.blob(); 
    
    const text = await response.text();
    try {
        const data = JSON.parse(text);
        if (!response.ok) throw new Error(data.error || `HTTP error! status: ${response.status}`);
        return data;
    } catch (e) {
        throw new Error(`Server Error (${response.status}): ${text.substring(0, 100)}...`);
    }
};

// --- ONBOARDING GUIDE COMPONENT ---
const DashboardGuide = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(0);

    const steps = [
        {
            title: "Welcome to Auditor Veritas",
            desc: "This secure dashboard gives you full control over your immutable audit logs. Let's take a quick tour of your tools.",
            icon: <Activity size={32} className="text-blue-500"/>
        },
        {
            title: "1. Live Logs",
            desc: "View your audit trail in real-time. This feed shows all events as they are ingested securely into the system.",
            icon: <LayoutGrid size={32} className="text-blue-500"/>
        },
        {
            title: "2. Search & Filters",
            desc: "Need to verify a specific transaction? Use the Search tab to find events by Type, Date, or ID and get their unique UUIDs.",
            icon: <Search size={32} className="text-blue-500"/>
        },
        {
            title: "3. Merkle Proofs",
            desc: "The core of our integrity engine. Paste an Event UUID here to cryptographically prove it hasn't been tampered with.",
            icon: <Layers size={32} className="text-purple-500"/>
        },
        {
            title: "4. GDPR Center",
            desc: "Compliance made simple. Pseudonymize user data permanently (Article 17) without breaking the audit chain's integrity.",
            icon: <ShieldAlert size={32} className="text-red-500"/>
        }
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <X size={20} />
                </button>
                
                <div className="bg-slate-50 p-8 flex justify-center border-b border-slate-100">
                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center border border-slate-100">
                        {steps[step].icon}
                    </div>
                </div>

                <div className="p-8 text-center">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{steps[step].title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-8 min-h-[60px]">
                        {steps[step].desc}
                    </p>

                    <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                            {steps.map((_, i) => (
                                <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-blue-600 w-4' : 'bg-slate-200'}`} />
                            ))}
                        </div>
                        <div className="flex gap-2">
                            {step > 0 && (
                                <button onClick={() => setStep(step - 1)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-lg">Back</button>
                            )}
                            <button 
                                onClick={() => step < steps.length - 1 ? setStep(step + 1) : onClose()} 
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-lg hover:shadow-xl transition-all"
                            >
                                {step === steps.length - 1 ? "Get Started" : "Next"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT: LIVE ACTIVITY CHART ---
const LiveActivityChart = ({ dataPoints = [] }) => {
  const displayPoints = dataPoints.length < 10 ? [...Array(10 - dataPoints.length).fill(0), ...dataPoints] : dataPoints;
  const maxVal = Math.max(...displayPoints, 10); 
  
  const pathData = displayPoints.map((p, i) => {
    const x = (i / (displayPoints.length - 1)) * 100;
    const y = 100 - (p / maxVal) * 80; 
    return `${x},${y}`;
  }).join(' L ');

  return (
    <div className="relative h-40 w-full overflow-hidden rounded-lg mt-4 bg-blue-50/20">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute bottom-0 left-0 right-0 h-full w-full">
        <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
        </defs>
        <line x1="0" y1="50" x2="100" y2="50" stroke="#94a3b8" strokeOpacity="0.3" strokeWidth="0.5" />
        <line x1="0" y1="80" x2="100" y2="80" stroke="#94a3b8" strokeOpacity="0.3" strokeWidth="0.5" />
        {displayPoints.length > 1 && (
            <>
                <path d={`M 0,100 L ${pathData} L 100,100 Z`} fill="url(#chartGrad)" />
                <path d={`M 0,100 L ${pathData}`} fill="none" stroke="#3b82f6" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" /> 
            </>
        )}
      </svg>
    </div>
  );
};

// --- COMPONENT: KEY ROTATION WITH 2FA ---
const KeyRotationComponent = ({ processor, token, onKeyUpdate, onRevoke }) => {
  const [step, setStep] = useState('idle'); // 'idle', 'verify', 'complete'
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newKeyData, setNewKeyData] = useState(null); 
  const [copied, setCopied] = useState(false);
  const [keyToDisplay, setKeyToDisplay] = useState(null); 
  const [showKey, setShowKey] = useState(false);

  // Steg 1: Begär kod
  const requestRotation = async () => {
    setIsLoading(true);
    setError(null);
    try {
        await apiCall('/api/keys/request-rotation', { method: 'POST' }, token);
        setStep('verify');
    } catch (err) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };




  // Steg 2: Skicka kod och rotera
  const verifyAndRotate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
        const data = await apiCall('/api/keys/rotate', { 
            method: 'POST', 
            body: { code: verificationCode } 
        }, token);
        
        localStorage.setItem('av_sim_key', data.newApiKey);
        onKeyUpdate(data.newApiKey);
        setNewKeyData(data.newApiKey);
        setStep('complete');
        setVerificationCode('');
    } catch (err) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(newKeyData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([`AUDITOR_VERITAS_KEY=${newKeyData}\n# Keep this safe!`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "auditor-veritas-key.env";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2 text-slate-800 text-sm">
                <RotateCw className="w-4 h-4 text-purple-600"/> Credential Management
            </h3>
            <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-1 rounded font-bold uppercase">Active</span>
        </div>

        <div className="relative">
            <div className="bg-slate-50 p-3 rounded-lg text-xs font-mono text-slate-600 break-all border border-slate-100 pr-16 min-h-[40px] flex items-center">
                {keyToDisplay ? (showKey ? keyToDisplay : '••••••••••••••••••••••••••••••' + keyToDisplay.slice(-4)) : 'API Key is hidden. Rotate to see a new one.'}
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button onClick={() => setShowKey(!showKey)} disabled={!keyToDisplay} className="p-1.5 hover:bg-slate-200 rounded text-slate-500 disabled:opacity-50"><Eye size={14}/></button>
                <button onClick={() => navigator.clipboard.writeText(keyToDisplay)} disabled={!keyToDisplay} className="p-1.5 hover:bg-slate-200 rounded text-slate-500 disabled:opacity-50"><Copy size={14}/></button>
            </div>
        </div>

        {error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">{error}</div>}

        <div className="grid grid-cols-1 gap-3">
            {step === 'idle' || step === 'complete' ? (
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={requestRotation} disabled={isLoading} className="bg-slate-900 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex justify-center items-center">
                        {isLoading ? <RefreshCw className="animate-spin w-3 h-3"/> : 'Rotate Key'}
                    </button>
                    <button onClick={onRevoke} className="bg-white border border-red-100 text-red-600 py-2.5 rounded-xl text-xs font-bold hover:bg-red-50 flex justify-center items-center gap-2">
                        <AlertTriangle size={14}/> Revoke
                    </button>
                </div>
            ) : (
                <form onSubmit={verifyAndRotate} className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 animate-fade-in">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Check email for verification code</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="123456" 
                            className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-center text-sm tracking-widest font-bold"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            maxLength={6}
                            autoFocus
                        />
                        <button type="submit" disabled={isLoading || verificationCode.length < 6} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-xs disabled:opacity-50 disabled:bg-slate-400 transition-all">
                            {isLoading ? <RefreshCw className="animate-spin w-3 h-3"/> : 'Verify'}
                        </button>
                    </div>
                    <button type="button" onClick={() => {setStep('idle'); setError(null);}} className="text-[10px] text-slate-400 mt-2 hover:text-slate-600 underline">Cancel</button>
                </form>
            )}
        </div>
      </div>
      
      {newKeyData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3"><CheckCircle2 size={24} /></div>
                    <h3 className="text-xl font-bold text-slate-900">Success!</h3>
                    <p className="text-sm text-slate-500 mt-1">Old key invalidated. Update your .env files.</p>
                </div>
                <div className="bg-slate-900 rounded-xl p-4 mb-6 relative group">
                    <code className="text-emerald-400 font-mono text-sm break-all">{newKeyData}</code>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <button onClick={handleCopy} className="flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors">{copied ? <CheckCircle2 size={16}/> : <Copy size={16}/>}{copied ? 'Copied!' : 'Copy'}</button>
                    <button onClick={handleDownload} className="flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors"><Download size={16}/> Save File</button>
                </div>
                <button onClick={() => { setNewKeyData(null); setKeyToDisplay(newKeyData); setStep('idle'); }} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20">I have saved this key safely</button>
            </div>
        </div>
      )}
    </>
  );
};


// --- COMPONENT: REAL GDPR ERASURE (ENGLISH) ---
const ErasureForm = ({ token }) => {
    const [userId, setUserId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const handleErase = async (e) => {
        e.preventDefault();
        if(!confirm("WARNING: This will permanently destroy the encryption key. Data will be mathematically unrecoverable. Are you sure?")) return;
        setIsLoading(true);
        setResult(null);
        try {
            const hashedId = CryptoJS.SHA256(userId).toString();
            const data = await apiCall('/api/gdpr/erase', { method: 'POST', body: { user_identifier_hash: hashedId } }, token, null);
            setResult({ success: true, message: data.message });
            setUserId('');
        } catch (err) { setResult({ success: false, message: err.message }); } finally { setIsLoading(false); }
    };
    return (
        <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-red-50 bg-red-50/30 flex items-center gap-2"><ShieldAlert className="text-red-500" size={16} /><h3 className="font-bold text-red-900 text-sm">GDPR Right to Erasure (Crypto-Shredding)</h3></div>
            <div className="p-5">
                <p className="text-xs text-slate-500 mb-4">Permanently pseudonymize a user's data by destroying the encryption key without breaking the audit chain's integrity.</p>
                <form onSubmit={handleErase} className="space-y-4">
                    <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">User Identifier (Cleartext)</label><input type="text" placeholder="e.g. user@example.com" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-red-500 outline-none transition-all placeholder:text-slate-300" value={userId} onChange={e => setUserId(e.target.value)} required /></div>
                    <button type="submit" disabled={isLoading} className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-bold text-xs uppercase transition-all flex justify-center items-center gap-2">{isLoading ? <RefreshCw className="animate-spin w-3.5 h-3.5"/> : <><Trash2 size={14}/> Execute Shredding</>}</button>
                </form>
                {result && <div className={`mt-4 p-3 rounded-lg text-xs border ${result.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>{result.message}</div>}
            </div>
        </div>
    );
};

// --- COMPONENT: EVENT SEARCH AND FILTER (ENGLISH) ---
const EventSearchAndFilter = ({ token }) => {
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e, page = 1) => {
        e?.preventDefault();
        setIsLoading(true);
        setError(null);
        const params = new URLSearchParams({ limit: 20, page: page, query: query }).toString();
        try {
            const data = await apiCall(`/api/events/search?${params}`, { method: 'GET' }, token, null);
            setSearchResults(data.events);
        } catch (err) { setError(err.message || 'Search failed.'); setSearchResults([]); } finally { setIsLoading(false); }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2"><Search className="text-blue-600" size={20} /><h3 className="font-bold text-slate-800 text-lg">Advanced Event Search</h3></div>
            <form onSubmit={handleSearch} className="p-5 border-b border-slate-100 space-y-4">
                <input type="text" placeholder="Search by event type or user identifier..." className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={query} onChange={e => setQuery(e.target.value)} />
                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold text-sm uppercase transition-all flex justify-center items-center gap-2">{isLoading ? <RefreshCw className="animate-spin w-4 h-4"/> : <><Filter size={18}/> Search Events</>}</button>
                {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">{error}</div>}
            </form>
            <div className="p-5"><h4 className="font-bold text-slate-800 text-sm mb-3">Search Results ({searchResults.length})</h4><RecentLogsTable logs={searchResults} /></div>
        </div>
    );
};

// --- SUB-COMPONENT: LOGS TABLE (ENGLISH) ---
const RecentLogsTable = ({ logs = [] }) => {
  if (logs.length === 0) return (<div className="p-12 text-center text-slate-500 text-xs">No events found.</div>);
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-slate-500 border-b border-slate-100"><tr><th className="py-3 px-3">Event</th><th className="py-3 px-3">Hash (Integrity)</th><th className="py-3 px-3">Encrypted Payload</th><th className="py-3 px-3 text-right">Time</th></tr></thead><tbody className="divide-y divide-slate-50">{logs.map((log, index) => (<tr key={index}><td className="py-3 px-3 font-medium text-slate-700">{log.event_type}</td><td className="py-3 px-3 font-mono text-blue-600 text-[10px] break-all max-w-[100px]">{log.data_hash.substring(0,20)}...</td><td className="py-3 px-3 font-mono text-slate-400 text-[10px]">AES-256 ENCRYPTED</td><td className="py-3 px-3 text-right text-slate-400">{new Date(log.event_timestamp).toLocaleTimeString()}</td></tr>))}</tbody></table></div></div>
  );
};

// --- COMPONENT: AUDITOR EXPORT (ENGLISH) ---
const AuditorExport = ({ token }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const blob = await apiCall('/api/export/evidence', { method: 'GET' }, token);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `auditor_evidence_${new Date().toISOString().split('T')[0]}.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert("Export failed: " + err.message);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden flex flex-col md:flex-row items-center p-6 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-full text-blue-600 shrink-0">
                <FileCheck size={32} />
            </div>
            <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">Auditor Evidence Package</h3>
                <p className="text-sm text-slate-500 mt-1">
                    Download a comprehensive cryptographic proof package (ZIP). Contains the entire encrypted log chain and verification scripts for external auditors.
                </p>
            </div>
            <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="bg-[#0a2540] hover:bg-[#1e293b] text-white px-6 py-3 rounded-lg font-bold text-sm shadow-lg flex items-center gap-2 transition-all whitespace-nowrap"
            >
                {isDownloading ? <RefreshCw className="animate-spin" size={18}/> : <FileDown size={18}/>}
                {isDownloading ? 'Generating ZIP...' : 'Export Evidence'}
            </button>
        </div>
    );
};

// --- COMPONENT: EVENT INJECTOR FORM (ENGLISH + MASKED KEY) ---
const EventInjectorForm = ({ onLogEvent, eventData, setEventData }) => {
    const [localApiKey, setLocalApiKey] = useState(() => localStorage.getItem('av_sim_key') || '');
    
    const handleKeyChange = (e) => {
        const key = e.target.value;
        setLocalApiKey(key);
        localStorage.setItem('av_sim_key', key); 
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2"><Zap className="text-amber-500" size={16} /><h3 className="font-bold text-slate-700 text-sm">Event Injector</h3></div>
            <div className="p-5">
                <p className="text-xs text-slate-500 mb-4">Test your infrastructure by logging a real, encrypted event.</p>
                <form onSubmit={onLogEvent} className="space-y-4">
                    
                    {/* KEY FIELD (MASKED) */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Active API Key (Saved locally)</label>
                        <input 
                            type="password" 
                            placeholder="Paste rotated key here..." 
                            className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-mono focus:ring-1 focus:ring-blue-500/50 outline-none transition-all text-slate-700" 
                            value={localApiKey}
                            onChange={handleKeyChange}
                            required 
                        />
                    </div>
                    
                    {/* OTHER FIELDS */}
                    <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Event Type</label><input type="text" placeholder="user.login" className="w-full px-3 py-2 border rounded-lg text-sm" value={eventData.event_type} onChange={e => setEventData({...eventData, event_type: e.target.value})} required /></div>
                    <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">User ID</label><input type="text" placeholder="user@email.com" className="w-full px-3 py-2 border rounded-lg text-sm" value={eventData.user_identifier} onChange={e => setEventData({...eventData, user_identifier: e.target.value})} required /></div>
                    <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">JSON Payload</label><textarea placeholder='{"status": "success"}' className="w-full px-3 py-2 border rounded-lg font-mono text-xs h-24" value={eventData.event_data} onChange={e => setEventData({...eventData, event_data: e.target.value})} required /></div>
                    
                    <button type="submit" className="w-full bg-[#0a2540] text-white py-2.5 rounded-lg font-bold text-xs uppercase flex justify-center items-center gap-2">Log Event</button>
                </form>
            </div>
        </div>
    );
};

// --- MAIN DASHBOARD COMPONENT ---
const Dashboard = ({ processor, stats, token, eventData, setEventData, onLogEvent, KeyRotation, recentLogs, chartData, onLogout }) => {
  const eventsLimit = stats.eventsLimit || 100;
  const [activeTab, setActiveTab] = useState('logs');
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
      const hasSeenGuide = localStorage.getItem('av_dashboard_guide_seen');
      if (!hasSeenGuide) setShowGuide(true);
  }, []);

  const closeGuide = () => {
      localStorage.setItem('av_dashboard_guide_seen', 'true');
      setShowGuide(false);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-32 pb-24 animate-fade-in-up">
      
      <DashboardGuide isOpen={showGuide} onClose={closeGuide} />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>Live</div>
             <span className="text-xs text-slate-400 font-mono">{processor.id}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{processor.companyName}</h1>
        </div>
        <div className="flex items-center gap-3">
             <button onClick={() => setShowGuide(true)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Show Guide"><HelpCircle size={20}/></button>
            <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"><LogOut size={16} /> Sign Out</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between">
            <div>
                <div className="text-xs text-slate-400 font-bold uppercase mb-1">Total Events</div>
                <div className="text-4xl font-bold text-slate-900">{stats.totalEvents}</div>
            </div>
            <LiveActivityChart dataPoints={chartData} />
        </div>
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="flex justify-between items-start mb-4"><h3 className="text-slate-800 text-xs font-bold uppercase tracking-wider">Usage Quota</h3><span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{stats.monthlyEvents} / {eventsLimit}</span></div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2"><div className={`h-full transition-all duration-1000 ${stats.monthlyEvents / eventsLimit * 100 > 90 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min((stats.monthlyEvents / eventsLimit * 100), 100)}%` }}></div></div>
                <p className="text-xs text-slate-400">Resets in 28 days</p>
            </div>
            {KeyRotation}
        </div>
      </div>
      
      <AuditorExport token={token} />

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 mb-6 overflow-x-auto">
        <button onClick={() => setActiveTab('logs')} className={`pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'logs' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Live Logs</button>
        <button onClick={() => setActiveTab('search')} className={`pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'search' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Search & Filters</button>
        <button onClick={() => setActiveTab('verify')} className={`pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'verify' ? 'border-purple-500 text-purple-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Merkle Proofs</button>
        <button onClick={() => setActiveTab('compliance')} className={`pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'compliance' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>GDPR Center</button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
           {activeTab === 'logs' && <RecentLogsTable logs={recentLogs} />}
           {activeTab === 'search' && <EventSearchAndFilter token={token} />}
           {activeTab === 'verify' && <MerkleProofViewer token={token} />}
           {activeTab === 'compliance' && <ErasureForm token={token} />}
        </div>
        <div className="space-y-6">
           <EventInjectorForm onLogEvent={onLogEvent} eventData={eventData} setEventData={setEventData} />
           
           <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3"><div className="p-1.5 bg-blue-100 rounded-full shrink-0 text-blue-600"><Lock size={14} /></div><div><h4 className="text-xs font-bold text-blue-800 mb-1">Security Note</h4><p className="text-[10px] text-blue-600/80 leading-relaxed">Events logged here are signed with your API key and stored immutably. The system uses Crypto-Shredding for GDPR compliance.</p></div></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;