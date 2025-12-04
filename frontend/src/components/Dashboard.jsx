// ============================================================
// AUDITOR VERITAS - DASHBOARD COMPONENT
// Version: 4.6.0 - PRODUCTION (Debug & Export Fixed)
// ============================================================

import React, { useState, useEffect, useMemo, memo } from 'react';
import {
  Search, CheckCircle2, RefreshCw, Zap, LogOut,
  Trash2, ShieldAlert, AlertTriangle, Network, Shield,
  Copy, Loader2, QrCode, ShieldCheck, BookOpen, Download
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://auditor-veritas-mvp.onrender.com';

// Hjälpfunktion för API-anrop
export const apiCall = async (endpoint, options = {}, token = null, apiKey = null) => {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (apiKey) headers['x-api-key'] = apiKey;
  
  const config = { headers, ...options };
  if (options.body && typeof options.body === 'object') config.body = JSON.stringify(options.body);
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (response.status === 204) return null;
    
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      if (!response.ok) throw new Error(data.error || `Error ${response.status}`);
      return data;
    } catch (e) { 
      throw new Error(text || `Server Error: ${response.status}`); 
    }
  } catch (err) {
    console.error("API Call Failed:", err);
    throw err;
  }
};

// --- HASH DISPLAY ---
const HashDisplay = ({ hash }) => {
    const [copied, setCopied] = useState(false);
    if (!hash) return <span className="text-slate-300">-</span>;
    const copy = () => { navigator.clipboard.writeText(hash); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    return (
        <div className="flex items-center gap-2 group relative">
            <code className="bg-slate-50 px-2 py-1 rounded text-[10px] font-mono text-blue-600 border border-slate-100" title={hash}>
                {hash.substring(0, 6)}...{hash.substring(hash.length - 6)}
            </code>
            <button onClick={copy} className="text-slate-300 hover:text-blue-500 transition-colors" title="Copy Full Hash">
                {copied ? <CheckCircle2 size={12} className="text-green-500"/> : <Copy size={12}/>}
            </button>
            <div className="absolute bottom-full left-0 mb-2 w-64 p-2 bg-slate-800 text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none break-all z-10">{hash}</div>
        </div>
    );
};

// --- KEY ROTATION ---
const KeyRotationTimer = ({ lastRotationDate }) => {
  const daysLeft = useMemo(() => {
    const rotation = lastRotationDate ? new Date(lastRotationDate) : new Date();
    const diffTime = Math.abs(new Date() - rotation);
    const daysPassed = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return 90 - daysPassed;
  }, [lastRotationDate]);

  let config = { color: 'blue', bg: 'bg-blue-50', text: 'Secure', icon: CheckCircle2 };
  if (daysLeft < 15) config = { color: 'amber', bg: 'bg-amber-50', text: 'Rotation Soon', icon: AlertTriangle };
  if (daysLeft < 0) config = { color: 'red', bg: 'bg-red-50', text: 'Expired - Rotate Now', icon: ShieldAlert };
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-xl shadow-sm border border-${config.color}-100 ${config.bg} flex items-center justify-between`}>
      <div className="flex items-center gap-3">
        <Icon size={20} className={`text-${config.color}-600`} />
        <div>
          <h4 className={`font-bold text-sm text-${config.color}-900`}>Security Key Status</h4>
          <p className={`text-xs text-${config.color}-700`}>{daysLeft < 0 ? 'Mandatory Rotation Required' : `${daysLeft} days until rotation.`}</p>
        </div>
      </div>
    </div>
  );
};

const KeyRotationAction = ({ token, onKeyUpdate, userRole }) => {
    const [step, setStep] = useState('idle');
    const [has2FA, setHas2FA] = useState(false);
    const [qrData, setQrData] = useState(null);
    const [code, setCode] = useState('');
    const [newKey, setNewKey] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const isOwner = userRole === 'owner';

    useEffect(() => {
        if (token && isOwner) apiCall('/api/keys/request-rotation', { method: 'POST' }, token).then(data => setHas2FA(data.totpConfigured)).catch(console.error);
    }, [token, isOwner]);

    const startRotation = async () => {
        if (!has2FA) {
            setLoading(true);
            try { const data = await apiCall('/api/keys/setup-2fa', { method: 'POST' }, token); setQrData(data); setStep('setup'); } 
            catch (e) { setError(e.message); } finally { setLoading(false); }
        } else setStep('verify');
    };

    const confirm = async (e) => {
        e.preventDefault(); setLoading(true); setError(null);
        try {
            const data = await apiCall('/api/keys/rotate', { method: 'POST', body: { code } }, token);
            setNewKey(data.newApiKey); if (onKeyUpdate) onKeyUpdate(data.newApiKey); setHas2FA(true); setStep('complete');
        } catch (e) { setError(e.message); } finally { setLoading(false); }
    };

    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
             <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold flex items-center gap-2 text-slate-800 text-sm"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Key Management</h3>
                <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${has2FA ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{has2FA ? '2FA Active' : 'No 2FA'}</span>
            </div>
            {error && <div className="p-2 bg-red-50 text-red-600 text-xs rounded border border-red-100">{error}</div>}
            {step === 'idle' && (
                <div className="text-center space-y-3">
                    <p className="text-xs text-slate-500">Rotate API keys every 90 days.</p>
                    <button onClick={startRotation} disabled={!isOwner} className="w-full bg-slate-900 text-white py-2 rounded-lg text-xs font-bold hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2">
                        {has2FA ? <RefreshCw size={14}/> : <QrCode size={14}/>} {has2FA ? 'Rotate API Key' : 'Setup 2FA & Rotate'}
                    </button>
                    {!isOwner && <p className="text-[10px] text-red-400">Only Owner can rotate keys.</p>}
                </div>
            )}
            {step === 'setup' && qrData && (
                <div className="space-y-3 text-center animate-fade-in">
                    <p className="text-xs text-slate-600 font-bold">Scan with Authenticator App</p>
                    <div className="bg-slate-100 p-2 rounded-lg inline-block"><img src={qrData.otpAuthUrl} alt="QR" className="w-32 h-32" /></div>
                    <div className="text-[10px] font-mono bg-slate-50 p-1 rounded break-all">{qrData.secret}</div>
                    <button onClick={() => setStep('verify')} className="w-full bg-blue-600 text-white py-2 rounded-lg text-xs font-bold">I have scanned it</button>
                </div>
            )}
            {step === 'verify' && (
                 <form onSubmit={confirm} className="space-y-3 animate-fade-in">
                    <p className="text-xs text-slate-600">Enter code:</p>
                    <input autoFocus type="text" maxLength={6} className="w-full text-center text-xl tracking-widest p-2 border rounded font-mono" placeholder="000000" value={code} onChange={e => setCode(e.target.value.replace(/\D/g,''))} />
                    <div className="flex gap-2">
                        <button type="button" onClick={() => {setStep('idle'); setCode('');}} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg text-xs font-bold">Cancel</button>
                        <button disabled={loading || code.length !== 6} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold">{loading ? <Loader2 className="animate-spin mx-auto w-4 h-4"/> : 'Verify'}</button>
                    </div>
                 </form>
            )}
            {step === 'complete' && newKey && (
                <div className="space-y-3 animate-fade-in">
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded text-center"><CheckCircle2 className="mx-auto text-emerald-500 mb-2" size={24}/><h4 className="text-sm font-bold text-emerald-800">Key Rotated</h4></div>
                    <div className="bg-slate-900 p-3 rounded group relative"><code className="text-emerald-400 font-mono text-xs break-all">{newKey}</code><button onClick={() => navigator.clipboard.writeText(newKey)} className="absolute top-2 right-2 text-slate-400 hover:text-white"><Copy size={14}/></button></div>
                    <button onClick={() => {setStep('idle'); setNewKey(null); setCode('');}} className="w-full bg-slate-200 text-slate-700 py-2 rounded-lg text-xs font-bold">Done</button>
                </div>
            )}
        </div>
    );
};

// --- MERKLE PROOF ---
const MerkleProofViewer = ({ token }) => {
    const [id, setId] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const verify = async (e) => {
        e.preventDefault(); if(!id.trim()) return; setLoading(true); setData(null);
        try { const res = await apiCall(`/api/merkle/proof/${id.trim()}`, {method:'GET'}, token); setData(res); } catch(e) { alert(e.message); } finally { setLoading(false); }
    };
    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200">
             <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-900"><Network className="text-blue-600" size={20}/> Cryptographic Verification</h3>
             <form onSubmit={verify} className="flex gap-2 mb-4">
                <input value={id} onChange={e=>setId(e.target.value)} placeholder="Event ID" className="flex-1 p-2 border rounded text-sm font-mono"/>
                <button disabled={loading} className="bg-blue-600 text-white px-4 rounded text-sm font-bold">{loading ? '...' : 'Verify'}</button>
             </form>
             {data && (
                 <div className="p-3 bg-emerald-50 border border-emerald-100 rounded text-xs space-y-1">
                     <div className="font-bold text-emerald-700 flex items-center gap-2"><CheckCircle2 size={14}/> Proof Valid</div>
                     <div><span className="font-bold">Root:</span> <span className="font-mono">{data.merkle_root.substring(0,20)}...</span></div>
                     <div><span className="font-bold">Leaf Index:</span> {data.leaf_index}</div>
                     <div><span className="font-bold">Proof Depth:</span> {data.proof.length} nodes</div>
                 </div>
             )}
        </div>
    );
};

// --- EVENT SEARCH ---
const EventSearch = ({ token }) => {
    const [logs, setLogs] = useState([]);
    const [term, setTerm] = useState('');
    useEffect(() => { 
        if(token) apiCall('/api/events/search?limit=50', {method:'GET'}, token).then(d => setLogs(d.events || [])).catch(console.error); 
    }, [token]);
    
    const filtered = logs.filter(l => JSON.stringify(l).toLowerCase().includes(term.toLowerCase()));
    
    return (
        <div className="space-y-4">
             <div className="bg-white p-3 rounded-xl border flex gap-2"><Search className="text-slate-400"/><input value={term} onChange={e=>setTerm(e.target.value)} placeholder="Search..." className="flex-1 outline-none text-sm"/></div>
             <div className="bg-white rounded-xl border overflow-hidden">
                 {filtered.map(l => (
                     <div key={l.id} className="p-3 border-b flex justify-between text-xs hover:bg-slate-50 items-center">
                         <span className="font-bold w-1/3">{l.event_type}</span>
                         <span className="w-1/3"><HashDisplay hash={l.data_hash} /></span>
                         <span className="font-mono text-slate-500 w-1/3 text-right">{l.id.substring(0,8)}...</span>
                     </div>
                 ))}
                 {filtered.length === 0 && <div className="p-4 text-center text-xs text-slate-400">No events found.</div>}
             </div>
        </div>
    );
};

// --- GDPR ERASURE FORM (Debugged) ---
const ErasureForm = () => {
    const [uid, setUid] = useState('');
    const [msg, setMsg] = useState(null);
    const apiKey = localStorage.getItem('av_active_key') || localStorage.getItem('av_sim_key');
    
    const handle = async (e) => {
        e.preventDefault();
        
        console.log("[Erasure] Initiating request for:", uid);
        console.log("[Erasure] Using API Key:", apiKey ? `${apiKey.substring(0,5)}...` : 'MISSING');

        if(!apiKey) return alert("Missing API Key. Please verify you are logged in correctly.");
        if(!confirm(`Destroy keys for ${uid}? This cannot be undone.`)) return;
        
        try {
            const payload = { user_identifier: uid.trim().toLowerCase() };
            const res = await apiCall('/api/privacy/forget', { method: 'DELETE', body: payload }, null, apiKey);
            
            console.log("[Erasure] Success response:", res);
            setMsg(res.message); 
            setUid('');
        } catch(e) { 
            console.error("[Erasure] Error:", e);
            alert(`Erasure Failed: ${e.message}`); 
        }
    };
    
    return (
        <div className="space-y-3">
            <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded">
                <strong>Instruction:</strong> System auto-converts to lowercase. e.g. "User123" becomes "user123".
            </p>
            <form onSubmit={handle} className="flex gap-2">
                <input 
                    value={uid} 
                    onChange={e=>setUid(e.target.value)} 
                    placeholder="e.g. test_user_gdpr" 
                    className="flex-1 p-2 border rounded text-sm"
                />
                <button className="bg-red-600 text-white px-4 rounded text-sm font-bold hover:bg-red-700 transition-colors">Shred Keys</button>
            </form>
            {msg && <div className="text-xs text-emerald-600 font-bold flex items-center gap-2 animate-fade-in"><CheckCircle2 size={12}/> {msg}</div>}
        </div>
    );
};

// --- GDPR EXPORT TOOL (Debugged) ---
const DataAccessSection = ({ token }) => {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        console.log("[Export] Starting export...");
        if (!token) {
            console.error("[Export] No token provided to component.");
            alert("Auth error: No token found. Try reloading.");
            return;
        }

        setLoading(true);
        try {
            // Hämta data
            const data = await apiCall('/api/events/search?limit=100', { method: 'GET' }, token);
            console.log("[Export] Fetched data:", data);

            if (!data || !data.events || data.events.length === 0) {
                alert("No data found to export. Try creating some events first.");
                setLoading(false);
                return;
            }

            // Skapa fil
            const jsonString = JSON.stringify(data.events, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            
            // Ladda ner
            const link = document.createElement('a');
            link.href = url;
            link.download = `gdpr_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log("[Export] Download trigger sent.");

        } catch (e) {
            console.error("[Export] Failed:", e);
            alert(`Export failed: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl space-y-3">
            <h4 className="font-bold text-sm text-blue-800 flex items-center gap-2"><BookOpen size={16}/> Right to Access (Art. 15)</h4>
            <p className="text-xs text-blue-700">
                Download a machine-readable copy (JSON) of the latest audit logs.
            </p>
            <button 
                onClick={handleExport}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded text-xs font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                {loading ? 'Generating Export...' : 'Export Data (JSON)'}
            </button>
        </div>
    );
};

// --- CHART COMPONENT ---
const LiveActivityChart = memo(({ dataPoints = [] }) => {
    const points = dataPoints.length === 24 ? dataPoints : new Array(24).fill(0);
    const max = Math.max(...points, 5); 
    const path = points.map((p,i) => { const x = (i / (points.length - 1)) * 100; const y = 100 - (p / max) * 80; return `${x},${y}`; }).join(' L ');
    return (
        <div className="h-40 w-full bg-slate-50/50 rounded-lg relative border border-slate-100 overflow-hidden mt-4">
             <div className="absolute top-2 left-2 text-[10px] text-slate-400 font-bold tracking-wider">24H TRAFFIC</div>
             <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
                 <defs><linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0" /></linearGradient></defs>
                 <path d={`M 0,100 L ${path} L 100,100 Z`} fill="url(#chartGradient)"/>
                 <path d={`M 0,100 L ${path}`} fill="none" stroke="#3b82f6" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
        </div>
    );
});

// --- UPDATED LOGS TABLE (With Scroll & Sticky Header) ---
const RecentLogsTable = ({ logs }) => (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col max-h-[500px]">
        <div className="overflow-y-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b text-slate-500 sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th className="p-3 bg-slate-50">Event</th>
                        <th className="p-3 bg-slate-50">User Hash (GDPR Key)</th>
                        <th className="p-3 bg-slate-50">Data Hash (Merkle Leaf)</th>
                        <th className="p-3 text-right bg-slate-50">Time</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {logs.map(l => (
                        <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-bold">{l.event_type}</td>
                            <td className="p-3"><HashDisplay hash={l.user_identifier} /></td>
                            <td className="p-3"><HashDisplay hash={l.data_hash} /></td>
                            <td className="p-3 text-right text-slate-400">{new Date(l.event_timestamp).toLocaleTimeString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {logs.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400">
                    No events logged yet. Use the Injector to start.
                </div>
            )}
        </div>
    </div>
);

// --- MAIN DASHBOARD ---
const Dashboard = ({ processor, stats, token, eventData, setEventData, onLogEvent, recentLogs, chartData, onLogout, session, onKeyUpdate }) => {
  const [activeTab, setActiveTab] = useState('logs');
  const lastRotation = processor?.last_rotation_date;

  return (
    <div className="max-w-7xl mx-auto px-4 pt-8 pb-12 animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> EU-Frankfurt</span>
                <span className="text-xs text-slate-400 font-mono">Node ID: {processor?.id?.substring(0,8)}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{processor?.company_name || session?.user?.email}</h1>
        </div>
        <button onClick={onLogout} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:text-red-600 transition-colors flex items-center gap-2"><LogOut size={14}/> Logout</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
             <div className="flex justify-between items-start">
                 <div><div className="text-xs text-slate-400 font-bold uppercase mb-1">Total Immutable Events</div><div className="text-4xl font-bold text-slate-900">{stats?.totalEvents?.toLocaleString() || 0}</div></div>
                 <div className="text-right"><div className="text-xs text-slate-400 font-bold uppercase mb-1">Monthly Quota</div><div className="text-sm font-mono font-bold text-blue-600">{stats?.monthlyEvents || 0} / {processor?.monthly_events_limit || 1000}</div></div>
             </div>
             <LiveActivityChart dataPoints={chartData} />
        </div>
        <div className="space-y-4">
            <KeyRotationTimer lastRotationDate={lastRotation} />
            <KeyRotationAction token={token} userRole={processor?.owner_id === session?.user?.id ? 'owner' : 'member'} onKeyUpdate={(k) => {if (onKeyUpdate) onKeyUpdate(k); alert("Key Rotated! Update your .env file.");}} />
        </div>
      </div>
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
        {['logs', 'search', 'verify', 'compliance'].map(t => (
          <button key={t} onClick={()=>setActiveTab(t)} className={`px-4 py-2 rounded-lg text-xs font-bold capitalize ${activeTab===t?'bg-white shadow-sm text-slate-900':'text-slate-500 hover:text-slate-700'}`}>{t}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
              {activeTab === 'logs' && <RecentLogsTable logs={recentLogs} />}
              {activeTab === 'search' && <EventSearch token={token} />}
              {activeTab === 'verify' && <MerkleProofViewer token={token} />}
              {activeTab === 'compliance' && (
                  <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-6">
                      <div className="space-y-4">
                          <h3 className="font-bold text-lg flex items-center gap-2 text-slate-900"><Trash2 size={20} className="text-red-500"/> Right to Erasure (Art. 17)</h3>
                          <p className="text-sm text-slate-500">Execute Crypto-Shredding by destroying the encryption key. This is irreversible.</p>
                          <ErasureForm />
                      </div>
                      <DataAccessSection token={token} />
                  </div>
              )}
          </div>
          <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 border-b pb-2"><Zap size={16} className="text-amber-500"/><h3 className="font-bold text-slate-800 text-sm">Event Injector</h3></div>
                  <form onSubmit={(e) => onLogEvent(e, eventData)} className="space-y-3">
                      <div><label className="text-[10px] font-bold text-slate-500 uppercase">Event Type</label><input className="w-full text-xs p-2 border rounded" value={eventData.event_type} onChange={e=>setEventData({...eventData, event_type:e.target.value})} placeholder="e.g. user.login"/></div>
                      <div><label className="text-[10px] font-bold text-slate-500 uppercase">User ID</label><input className="w-full text-xs p-2 border rounded" value={eventData.user_identifier} onChange={e=>setEventData({...eventData, user_identifier:e.target.value})} placeholder="e.g. user_123"/></div>
                      <div><label className="text-[10px] font-bold text-slate-500 uppercase">Payload (JSON)</label><textarea className="w-full text-xs p-2 border rounded font-mono h-20" value={eventData.event_data} onChange={e=>setEventData({...eventData, event_data:e.target.value})} placeholder='{"status": "success"}'/></div>
                      <button className="w-full bg-slate-900 text-white text-xs font-bold py-2 rounded hover:bg-slate-700">Log Event</button>
                  </form>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;