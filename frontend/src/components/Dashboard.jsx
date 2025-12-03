// ============================================================
// AUDITOR VERITAS - DASHBOARD FRONTEND
// Version: 2.4.0 - Trimmed Inputs & Fixed UI
// ============================================================

import React, { useState, useEffect, useMemo, memo } from 'react';
import {
  Search, CheckCircle2, RefreshCw, Zap, LogOut,
  Trash2, ShieldAlert, AlertTriangle, Network, Shield
} from 'lucide-react';

// API Configuration
const API_BASE_URL = 'https://auditor-veritas-mvp.onrender.com';

const apiCall = async (endpoint, options = {}, token = null, apiKey = null) => {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (apiKey) headers['x-api-key'] = apiKey;
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options, headers, body: options.body ? JSON.stringify(options.body) : null
  });

  if (response.status === 204) return null;
  const text = await response.text();
  try {
    const data = JSON.parse(text);
    if (!response.ok) throw new Error(data.error || `Error ${response.status}`);
    return data;
  } catch (e) { throw new Error(text || `Server Error: ${response.status}`); }
};

// --- MERKLE COMPONENT (Fix för 404) ---
const MerkleProofViewer = ({ token }) => {
    const [eventId, setEventId] = useState('');
    const [proofData, setProofData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleVerify = async (e) => {
        e.preventDefault();
        const trimmedId = eventId.trim(); // VIKTIGT: Tar bort mellanslag
        if (!trimmedId) return;
        
        setLoading(true); setError(null); setProofData(null);
        try {
            const data = await apiCall(`/api/merkle/proof/${trimmedId}`, { method: 'GET' }, token);
            setProofData(data);
        } catch (err) { setError(err.message); } 
        finally { setLoading(false); }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-900"><Network className="text-blue-600" size={20}/> Cryptographic Verification</h3>
            <form onSubmit={handleVerify} className="flex gap-2 mb-6">
                <input type="text" placeholder="Paste Event ID (UUID)" className="flex-1 p-2 border rounded-lg text-sm font-mono text-slate-900 bg-slate-50" value={eventId} onChange={(e) => setEventId(e.target.value)} />
                <button disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50">{loading ? <RefreshCw className="animate-spin" size={16}/> : 'Verify'}</button>
            </form>
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs mb-4">{error}</div>}
            {proofData && (
                <div className="space-y-4 animate-fade-in">
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                        <div className="flex items-center gap-2 text-emerald-700 font-bold mb-2"><CheckCircle2 size={18}/> Valid Proof</div>
                        <div className="text-xs space-y-2">
                             <div><span className="font-bold text-emerald-600">HASH:</span> <span className="font-mono break-all text-slate-700">{proofData.data_hash}</span></div>
                             <div><span className="font-bold text-emerald-600">ROOT:</span> <span className="font-mono break-all text-slate-700">{proofData.merkle_root}</span></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- SEARCH COMPONENT ---
const EventSearch = ({ token }) => {
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const data = await apiCall('/api/events/search?limit=100', { method: 'GET' }, token);
                setLogs(data.events || []); setFilteredLogs(data.events || []);
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        fetchLogs();
    }, [token]);

    useEffect(() => {
        const lower = searchTerm.toLowerCase();
        setFilteredLogs(logs.filter(l => l.event_type.toLowerCase().includes(lower) || l.id.toLowerCase().includes(lower) || l.user_identifier?.toLowerCase().includes(lower)));
    }, [searchTerm, logs]);

    return (
        <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex gap-2"><Search className="text-slate-400"/><input type="text" placeholder="Search events..." className="flex-1 outline-none text-slate-900 text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/></div>
            {loading ? <div className="text-center py-10"><RefreshCw className="animate-spin mx-auto text-blue-500"/></div> : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 border-b"><tr><th className="p-3">Type</th><th className="p-3">ID</th><th className="p-3 text-right">Time</th></tr></thead>
                        <tbody className="divide-y divide-slate-100">{filteredLogs.map(log => (<tr key={log.id} className="hover:bg-slate-50"><td className="p-3 font-bold text-slate-700">{log.event_type}</td><td className="p-3 font-mono text-blue-600 cursor-pointer select-all" onClick={() => navigator.clipboard.writeText(log.id)}>{log.id.substring(0,8)}...</td><td className="p-3 text-right text-slate-400">{new Date(log.event_timestamp).toLocaleTimeString()}</td></tr>))}</tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// --- ERASURE COMPONENT ---
const ErasureForm = () => {
  const [uid, setUid] = useState('');
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState(null);
  const apiKey = localStorage.getItem('av_active_key') || localStorage.getItem('av_sim_key');

  const handle = async (e) => {
    e.preventDefault();
    if (!apiKey) return alert("Missing API Key");
    if (!window.confirm(`Destroy keys for ${uid}?`)) return;
    setLoading(true);
    try {
        const data = await apiCall('/api/privacy/forget', { method: 'DELETE', body: { user_identifier: uid } }, null, apiKey);
        setRes(data); setUid('');
    } catch (e) { alert(e.message); } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handle} className="space-y-3">
        <input type="text" value={uid} onChange={e => setUid(e.target.value)} placeholder="User ID" className="w-full p-2 border rounded text-sm text-slate-900" required />
        <button disabled={loading} className="w-full bg-red-600 text-white py-2 rounded text-sm font-bold">{loading ? 'Shredding...' : 'Crypto Shredding'}</button>
        {res && <div className="p-2 bg-green-50 text-green-700 text-xs rounded">{res.message}</div>}
    </form>
  );
};

// --- HELPERS ---
const RecentLogsTable = memo(({ logs = [] }) => (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 text-slate-500 border-b"><tr><th className="p-3">Event</th><th className="p-3">Hash</th><th className="p-3 text-right">Time</th></tr></thead>
        <tbody className="divide-y divide-slate-50">{logs.map(log => (<tr key={log.id}><td className="p-3 font-bold text-slate-700">{log.event_type}</td><td className="p-3 font-mono text-blue-600">{log.data_hash?.substring(0,16)}...</td><td className="p-3 text-right text-slate-400">{new Date(log.event_timestamp).toLocaleTimeString()}</td></tr>))}</tbody>
      </table>
    </div>
));

// --- MAIN DASHBOARD ---
const Dashboard = ({ processor, stats, token, eventData, setEventData, onLogEvent, KeyRotation, recentLogs, chartData, onLogout, session }) => {
  const [activeTab, setActiveTab] = useState('logs');

  return (
    <div className="max-w-7xl mx-auto px-4 pt-8 pb-12 animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <div>
            <div className="flex items-center gap-2 mb-1"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">EU-Frankfurt</span><span className="text-xs text-slate-400 font-mono">ID: {processor?.id?.substring(0,8)}</span></div>
            <h1 className="text-3xl font-bold text-slate-900">{processor?.company_name}</h1>
        </div>
        <button onClick={onLogout} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-red-50 hover:text-red-600"><LogOut size={16} /> Logout</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between">
             <div><div className="text-xs text-slate-400 font-bold uppercase">Total Events</div><div className="text-4xl font-bold text-slate-900">{stats?.totalEvents || 0}</div></div>
        </div>
        <div className="space-y-4">{KeyRotation}</div>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
        {['logs', 'search', 'verify', 'compliance'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-bold capitalize ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>{tab}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'logs' && <RecentLogsTable logs={recentLogs} />}
          {activeTab === 'search' && <EventSearch token={token} />}
          {activeTab === 'verify' && <MerkleProofViewer token={token} />}
          {activeTab === 'compliance' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-slate-900"><Trash2 size={20} className="text-red-500"/> Right to Erasure</h3>
                <ErasureForm />
            </div>
          )}
        </div>
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b pb-2"><Zap size={16} className="text-amber-500"/><h3 className="font-bold text-slate-800 text-sm">Event Injector</h3></div>
            <form onSubmit={(e) => onLogEvent(e, eventData)} className="space-y-3">
              <input type="text" className="w-full text-xs p-2 border rounded bg-slate-50 text-slate-900" value={eventData.event_type} onChange={e => setEventData({...eventData, event_type: e.target.value})} placeholder="Event Type" />
              <input type="text" className="w-full text-xs p-2 border rounded bg-slate-50 text-slate-900" value={eventData.user_identifier} onChange={e => setEventData({...eventData, user_identifier: e.target.value})} placeholder="User ID" />
              <textarea className="w-full text-xs p-2 border rounded bg-slate-50 font-mono h-20 text-slate-900" value={eventData.event_data} onChange={e => setEventData({...eventData, event_data: e.target.value})} placeholder='{"data": "value"}' />
              <button className="w-full bg-slate-900 text-white text-xs font-bold py-2 rounded hover:bg-slate-800">Log Event</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;