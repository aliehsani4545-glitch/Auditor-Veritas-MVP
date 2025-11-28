import React, { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import { 
  Activity, Search, CheckCircle2, RefreshCw, Zap, Lock, LogOut, LayoutGrid, 
  Trash2, ShieldAlert, Layers, Filter, HelpCircle, X, FileDown, FileCheck, 
  ChevronRight, ChevronLeft 
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
    
    // Hantera filnedladdning (ZIP)
    if (response.headers.get('content-type')?.includes('application/zip')) {
        return response.blob();
    }
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `HTTP error! status: ${response.status}`);
    return data;
};

// --- COMPONENT: AUDITOR EXPORT (REAL ZIP) ---
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
                    Ladda ner ett kryptografiskt bevispaket (ZIP). Innehåller hela den krypterade loggkedjan och verifieringsskript för externa revisorer.
                </p>
            </div>
            <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="bg-[#0a2540] hover:bg-[#1e293b] text-white px-6 py-3 rounded-lg font-bold text-sm shadow-lg flex items-center gap-2 transition-all whitespace-nowrap"
            >
                {isDownloading ? <RefreshCw className="animate-spin" size={18}/> : <FileDown size={18}/>}
                {isDownloading ? 'Genererar ZIP...' : 'Exportera Bevis'}
            </button>
        </div>
    );
};

// --- COMPONENT: ERASURE FORM (REAL CRYPTO-SHREDDING) ---
const ErasureForm = ({ token }) => {
    const [userId, setUserId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleErase = async (e) => {
        e.preventDefault();
        if(!confirm("VARNING: Detta raderar krypteringsnyckeln permanent. Datan kan aldrig återställas. Är du säker?")) return;
        
        setIsLoading(true);
        setResult(null);
        try {
            const hashedId = CryptoJS.SHA256(userId).toString();
            const data = await apiCall('/api/gdpr/erase', { method: 'POST', body: { user_identifier_hash: hashedId } }, token);
            setResult({ success: true, message: data.message });
            setUserId('');
        } catch (err) { setResult({ success: false, message: err.message }); } 
        finally { setIsLoading(false); }
    };

    return (
        <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-red-50 bg-red-50/30 flex items-center gap-2">
                <ShieldAlert className="text-red-500" size={16} />
                <h3 className="font-bold text-red-900 text-sm">GDPR Right to Erasure (Crypto-Shredding)</h3>
            </div>
            <div className="p-5">
                <p className="text-xs text-slate-500 mb-4">
                    Ange en användare för att radera deras unika krypteringsnyckel. Detta gör all historisk data matematiskt oåtkomlig (skräpdata) utan att bryta hash-kedjan.
                </p>
                <form onSubmit={handleErase} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">User Identifier (Cleartext)</label>
                        <input type="text" placeholder="e.g. user@example.com" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none" value={userId} onChange={e => setUserId(e.target.value)} required />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-bold text-xs uppercase flex justify-center items-center gap-2">
                        {isLoading ? <RefreshCw className="animate-spin w-3.5 h-3.5"/> : <><Trash2 size={14}/> Execute Shredding</>}
                    </button>
                </form>
                {result && <div className={`mt-4 p-3 rounded-lg text-xs border ${result.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>{result.message}</div>}
            </div>
        </div>
    );
};

// --- COMPONENT: SEARCH & FILTER ---
const EventSearchAndFilter = ({ token }) => {
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (e) => {
        e?.preventDefault();
        setIsLoading(true);
        try {
            const data = await apiCall(`/api/events/search?query=${query}`, { method: 'GET' }, token);
            setSearchResults(data.events);
        } catch (err) { console.error(err); } 
        finally { setIsLoading(false); }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden mb-6">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2"><Search className="text-blue-600" size={20} /><h3 className="font-bold text-slate-800 text-lg">Event Search</h3></div>
            <form onSubmit={handleSearch} className="p-5 border-b border-slate-100 space-y-4">
                <input type="text" placeholder="Search by User ID or Event Type..." className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={query} onChange={e => setQuery(e.target.value)} />
                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold text-sm">Search</button>
            </form>
            <div className="p-5"><RecentLogsTable logs={searchResults} /></div>
        </div>
    );
};

// --- SUB-COMPONENT: LOGS TABLE ---
const RecentLogsTable = ({ logs = [] }) => {
  if (logs.length === 0) return (<div className="p-12 text-center text-slate-500 text-xs">No events found.</div>);
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-slate-500 border-b border-slate-100"><tr><th className="py-3 px-3">Event</th><th className="py-3 px-3">Hash (Integrity)</th><th className="py-3 px-3">Encrypted Payload</th><th className="py-3 px-3 text-right">Time</th></tr></thead><tbody className="divide-y divide-slate-50">{logs.map((log, index) => (<tr key={index}><td className="py-3 px-3 font-medium text-slate-700">{log.event_type}</td><td className="py-3 px-3 font-mono text-blue-600 text-[10px] break-all max-w-[100px]">{log.data_hash.substring(0,20)}...</td><td className="py-3 px-3 font-mono text-slate-400 text-[10px]">AES-256 ENCRYPTED</td><td className="py-3 px-3 text-right text-slate-400">{new Date(log.event_timestamp).toLocaleTimeString()}</td></tr>))}</tbody></table></div></div>
  );
};

// --- MAIN DASHBOARD ---
const Dashboard = ({ processor, stats, apiKey, onLogEvent, eventData, setEventData, isLoading, KeyRotation, recentLogs, chartData, onLogout, token }) => {
  const [activeTab, setActiveTab] = useState('logs');
  
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-32 pb-24 animate-fade-in-up">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>Live</div>
             <span className="text-xs text-slate-400 font-mono">{processor.id}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{processor.companyName}</h1>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={onLogout} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-red-50 hover:text-red-600 transition-all"><LogOut size={16} /> Sign Out</button>
        </div>
      </div>

      {/* STATS (Keep existing layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
            <div className="text-xs text-slate-400 font-bold uppercase mb-2">Total Events</div>
            <div className="text-4xl font-bold text-slate-900">{stats.totalEvents}</div>
        </div>
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="flex justify-between items-start mb-4"><h3 className="text-slate-800 text-xs font-bold uppercase">Usage</h3><span className="text-xs font-bold text-blue-600">{stats.monthlyEvents} / {stats.eventsLimit}</span></div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${Math.min((stats.monthlyEvents / stats.eventsLimit * 100), 100)}%` }}></div></div>
            </div>
            {KeyRotation}
        </div>
      </div>

      {/* EVIDENCE PACKAGE EXPORT */}
      <AuditorExport token={token} />

      {/* TABS */}
      <div className="flex gap-4 border-b border-slate-200 mb-6 overflow-x-auto">
        <button onClick={() => setActiveTab('logs')} className={`pb-3 text-sm font-bold border-b-2 ${activeTab === 'logs' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400'}`}>Live Logs</button>
        <button onClick={() => setActiveTab('search')} className={`pb-3 text-sm font-bold border-b-2 ${activeTab === 'search' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400'}`}>Search</button>
        <button onClick={() => setActiveTab('verify')} className={`pb-3 text-sm font-bold border-b-2 ${activeTab === 'verify' ? 'border-purple-500 text-purple-600' : 'border-transparent text-slate-400'}`}>Verify</button>
        <button onClick={() => setActiveTab('compliance')} className={`pb-3 text-sm font-bold border-b-2 ${activeTab === 'compliance' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-400'}`}>GDPR</button>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
           {activeTab === 'logs' && <RecentLogsTable logs={recentLogs} />}
           {activeTab === 'search' && <EventSearchAndFilter token={token} />}
           {activeTab === 'verify' && <MerkleProofViewer token={token} />}
           {activeTab === 'compliance' && <ErasureForm token={token} />}
        </div>
        
        {/* SIMULATOR / INJECTOR */}
        <div className="space-y-6">
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2"><Zap className="text-amber-500" size={16} /><h3 className="font-bold text-slate-700 text-sm">Event Injector</h3></div>
              <div className="p-5">
                <form onSubmit={onLogEvent} className="space-y-4">
                    <input type="text" placeholder="Event Type" className="w-full px-3 py-2 border rounded-lg text-sm" value={eventData.event_type} onChange={e => setEventData({...eventData, event_type: e.target.value})} required />
                    <input type="text" placeholder="User ID" className="w-full px-3 py-2 border rounded-lg text-sm" value={eventData.user_identifier} onChange={e => setEventData({...eventData, user_identifier: e.target.value})} required />
                    <textarea placeholder='{"amount": 500}' className="w-full px-3 py-2 border rounded-lg font-mono text-xs h-24" value={eventData.event_data} onChange={e => setEventData({...eventData, event_data: e.target.value})} required />
                    <button type="submit" disabled={isLoading} className="w-full bg-[#0a2540] text-white py-2.5 rounded-lg font-bold text-xs uppercase flex justify-center items-center gap-2">{isLoading ? <RefreshCw className="animate-spin w-3.5 h-3.5"/> : 'Log Event'}</button>
                </form>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;