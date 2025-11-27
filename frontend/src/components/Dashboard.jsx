import React, { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import { Activity, Search, CheckCircle2, RefreshCw, Zap, Lock, LogOut, LayoutGrid, Trash2, ShieldAlert, Layers, Filter, HelpCircle, X, ChevronRight, ChevronLeft } from 'lucide-react';
import MerkleProofViewer from './MerkleProofViewer'; 

// --- API HELPER ---
const API_BASE_URL = 'https://auditor-veritas-mvp.onrender.com';
const apiCall = async (endpoint, options = {}, apiKey = '') => {
    const config = { headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, ...options.headers }, ...options };
    if (options.body) config.body = JSON.stringify(options.body);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (response.status === 204) return null;
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `HTTP error! status: ${response.status}`);
    return data;
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

// ... [Keep LiveActivityChart Component as is] ...
const LiveActivityChart = ({ dataPoints = [] }) => {
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
        <defs><linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0" /></linearGradient></defs>
        {displayPoints.length > 1 && <><path d={`M 0,100 L ${pathData} L 100,100 Z`} fill="url(#chartGrad)" /><path d={`M 0,100 L ${pathData}`} fill="none" stroke="#3b82f6" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" /></>}
      </svg>
    </div>
  );
};

// ... [Keep ErasureForm Component as is] ...
const ErasureForm = ({ apiKey }) => {
    const [userId, setUserId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const handleErase = async (e) => {
        e.preventDefault();
        if(!confirm("Are you absolutely sure? This will pseudonymize all immutable logs for this user. This is irreversible.")) return;
        setIsLoading(true);
        setResult(null);
        try {
            const hashedId = CryptoJS.SHA256(userId).toString();
            const data = await apiCall('/api/gdpr/erase', { method: 'POST', body: { user_identifier_hash: hashedId } }, apiKey);
            setResult({ success: true, ...data });
        } catch (err) { setResult({ success: false, message: err.message }); } finally { setIsLoading(false); }
    };
    return (
        <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-red-50 bg-red-50/30 flex items-center gap-2"><ShieldAlert className="text-red-500" size={16} /><h3 className="font-bold text-red-900 text-sm">GDPR Right to Erasure (Article 17)</h3></div>
            <div className="p-5">
                <p className="text-xs text-slate-500 mb-4">Permanently pseudonymize a user's data in the immutable log without breaking the audit chain.</p>
                <form onSubmit={handleErase} className="space-y-4">
                    <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">User Identifier (Cleartext)</label><input type="text" placeholder="e.g. user@example.com" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-red-500 outline-none transition-all placeholder:text-slate-300" value={userId} onChange={e => setUserId(e.target.value)} required /></div>
                    <button type="submit" disabled={isLoading} className="w-full bg-red-600 hover:bg-700 text-white py-2.5 rounded-lg font-bold text-xs uppercase transition-all flex justify-center items-center gap-2">{isLoading ? <RefreshCw className="animate-spin w-3.5 h-3.5"/> : <><Trash2 size={14}/> Execute Erasure</>}</button>
                </form>
                {result && <div className={`mt-4 p-3 rounded-lg text-xs border ${result.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>{result.success ? `Success! ${result.records_anonymized} records pseudonymized. Token: ${result.erasure_token.substring(0,10)}...` : result.message}</div>}
            </div>
        </div>
    );
};

// ... [Keep EventSearchAndFilter Component as is] ...
const EventSearchAndFilter = ({ apiKey }) => {
    const [query, setQuery] = useState('');
    const [eventType, setEventType] = useState('');
    const [startDate, setStartDate] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    const handleSearch = async (e, page = 1) => {
        e?.preventDefault();
        setIsLoading(true);
        setError(null);
        const params = new URLSearchParams({ limit: 20, page: page, query: query, event_type: eventType, start_date: startDate }).toString();
        try {
            const data = await apiCall(`/api/events/search?${params}`, { method: 'GET' }, apiKey);
            setSearchResults(data.events);
            setPagination(data.pagination);
        } catch (err) { setError(err.message || 'Search failed.'); setSearchResults([]); } finally { setIsLoading(false); }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2"><Search className="text-blue-600" size={20} /><h3 className="font-bold text-slate-800 text-lg">Advanced Event Search</h3></div>
            <form onSubmit={handleSearch} className="p-5 border-b border-slate-100 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1"><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Full Text Search</label><input type="text" placeholder="e.g. user ID" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={query} onChange={e => setQuery(e.target.value)} /></div>
                    <div className="md:col-span-1"><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Event Type</label><input type="text" placeholder="e.g. payment.success" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={eventType} onChange={e => setEventType(e.target.value)} /></div>
                    <div className="md:col-span-1"><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Start Date</label><input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold text-sm uppercase transition-all flex justify-center items-center gap-2">{isLoading ? <RefreshCw className="animate-spin w-4 h-4"/> : <><Filter size={18}/> Search Events ({pagination.total})</>}</button>
                {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">{error}</div>}
            </form>
            <div className="p-5"><h4 className="font-bold text-slate-800 text-sm mb-3">Search Results ({searchResults.length})</h4><RecentLogsTable logs={searchResults} /></div>
        </div>
    );
};

// ... [Keep RecentLogsTable Component as is] ...
const RecentLogsTable = ({ logs = [] }) => {
  if (logs.length === 0) return (<div className="bg-white rounded-xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center h-64"><div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3"><LayoutGrid size={20} className="text-slate-300" /></div><h3 className="text-slate-900 font-semibold text-sm">No events found.</h3><p className="text-slate-500 text-xs mt-1">Try injecting a test event.</p></div>);
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"><div className="w-full overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50/50 text-slate-500 font-semibold border-b border-slate-100"><tr><th className="py-3 pl-5 w-10"></th><th className="py-3 px-3">Event</th><th className="py-3 px-3 w-1/4">Event ID (UUID)</th><th className="py-3 px-3">User ID Hash</th><th className="py-3 px-3 w-1/4">Data Payload</th><th className="py-3 px-3 text-right pr-5">Timestamp</th></tr></thead><tbody className="divide-y divide-slate-50">{logs.map((log, index) => (<tr key={index} className="hover:bg-slate-50/80 transition-colors group"><td className="py-3 pl-5"><div className={`w-5 h-5 rounded-full flex items-center justify-center ${log.event_type.includes('erasure') ? 'bg-red-100' : 'bg-emerald-100'}`}>{log.event_type.includes('erasure') ? <Trash2 size={12} className="text-red-600"/> : <CheckCircle2 size={12} className="text-emerald-600" />}</div></td><td className="py-3 px-3"><span className={`font-mono font-medium px-1.5 py-0.5 rounded text-[10px] border ${log.event_type.includes('erasure') ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>{log.event_type}</span></td><td className="py-3 px-3 text-blue-600 font-mono text-[10px] max-w-[150px] break-all group-hover:underline">{log.id}</td><td className="py-3 px-3 text-slate-500 font-mono text-[10px]">{log.user_identifier ? log.user_identifier.substring(0, 16) + '...' : 'N/A'}</td><td className="py-3 px-3 max-w-xs overflow-hidden"><pre className="text-[10px] font-mono text-slate-700 bg-slate-50 p-1 rounded-md overflow-x-auto whitespace-pre-wrap max-h-16">{JSON.stringify(log.event_data, null, 2)}</pre></td><td className="py-3 px-3 text-right pr-5 text-slate-400 font-mono text-[10px]">{new Date(log.event_timestamp || log.timestamp).toLocaleTimeString()}</td></tr>))}</tbody></table></div></div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---
const Dashboard = ({ processor, stats, apiKey, onLogEvent, eventData, setEventData, isLoading, KeyRotation, recentLogs, chartData, onLogout }) => {
  const eventsLimit = stats.eventsLimit || 100;
  const [activeTab, setActiveTab] = useState('logs');
  const [currentLogs, setCurrentLogs] = useState(recentLogs); 
  const [showGuide, setShowGuide] = useState(false);

  // Check LocalStorage for guide status
  useEffect(() => {
      const hasSeenGuide = localStorage.getItem('av_dashboard_guide_seen');
      if (!hasSeenGuide) {
          setShowGuide(true);
      }
  }, []);

  const closeGuide = () => {
      localStorage.setItem('av_dashboard_guide_seen', 'true');
      setShowGuide(false);
  };

  React.useEffect(() => {
      if (activeTab === 'logs') setCurrentLogs(recentLogs);
      else setCurrentLogs([]);
  }, [activeTab, recentLogs]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-32 pb-24 animate-fade-in-up">
      
      {/* ONBOARDING GUIDE */}
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
            <div className="hidden md:flex flex-col items-end mr-2"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">API Key</span><span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
    {apiKey ? apiKey.slice(0, 16) : '••••••••••••••••'}...
</span></div>
            <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"><LogOut size={16} /> Sign Out</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2"><div className="bg-white rounded-xl border border-slate-200 shadow-sm p-1 h-full"><LiveActivityChart dataPoints={chartData} /><div className="grid grid-cols-3 gap-4 p-4"><div><div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Events</div><div className="text-2xl font-bold text-slate-900">{stats.totalEvents}</div></div><div><div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Success Rate</div><div className="text-2xl font-bold text-emerald-600">100%</div></div><div><div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Avg Latency</div><div className="text-2xl font-bold text-slate-900">12ms</div></div></div></div></div>
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-4"><h3 className="text-slate-800 text-xs font-bold uppercase tracking-wider">Usage Quota</h3><span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{stats.monthlyEvents} / {eventsLimit}</span></div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2"><div className={`h-full transition-all duration-1000 ${stats.monthlyEvents / eventsLimit * 100 > 90 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min((stats.monthlyEvents / eventsLimit * 100), 100)}%` }}></div></div>
                <p className="text-xs text-slate-400">Resets in 28 days</p>
            </div>
            {KeyRotation}
        </div>
      </div>

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
           {activeTab === 'logs' && <RecentLogsTable logs={currentLogs} />}
           {activeTab === 'search' && <EventSearchAndFilter apiKey={apiKey} />}
           {activeTab === 'verify' && <MerkleProofViewer apiKey={apiKey} />}
           {activeTab === 'compliance' && <ErasureForm apiKey={apiKey} />}
        </div>
        <div className="space-y-6">
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2"><Zap className="text-amber-500" size={16} /><h3 className="font-bold text-slate-700 text-sm">API Simulator</h3></div>
              <div className="p-5">
                <p className="text-xs text-slate-500 mb-4">Manually inject an event to test your webhook configuration.</p>
                <form onSubmit={onLogEvent} className="space-y-4">
                    <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Event Type</label><input type="text" placeholder="e.g. payment.success" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 text-slate-700 font-medium" value={eventData.event_type} onChange={e => setEventData({...eventData, event_type: e.target.value})} required /></div>
                    <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">User Identifier (Cleartext)</label><input type="text" placeholder="e.g. user@gmail.com" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 text-slate-700 font-medium" value={eventData.user_identifier} onChange={e => setEventData({...eventData, user_identifier: e.target.value})} required /></div>
                    <div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">JSON Payload</label><textarea placeholder='{"amount": 500}' className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono text-xs h-24 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-slate-300 text-slate-600" value={eventData.event_data} onChange={e => setEventData({...eventData, event_data: e.target.value})} required /></div>
                    <button type="submit" disabled={isLoading} className="w-full bg-[#0a2540] hover:bg-[#1e293b] text-white py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2">{isLoading ? <RefreshCw className="animate-spin w-3.5 h-3.5"/> : 'Inject Test Event'}</button>
                </form>
              </div>
           </div>
           <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3"><div className="p-1.5 bg-blue-100 rounded-full shrink-0 text-blue-600"><Lock size={14} /></div><div><h4 className="text-xs font-bold text-blue-800 mb-1">Security Note</h4><p className="text-[10px] text-blue-600/80 leading-relaxed">Events logged here are signed with your active API key and stored immutably.</p></div></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;