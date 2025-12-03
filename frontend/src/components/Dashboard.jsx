// ============================================================
// AUDITOR VERITAS - DASHBOARD COMPONENT
// Version: 2.2.0 - Fixed Modules (Search, Merkle, GDPR, Injection)
// ============================================================

import React, { useState, useEffect, useMemo, memo } from 'react';
import {
  Activity, Search, CheckCircle2, RefreshCw, Zap, Lock, LogOut, LayoutGrid,
  Trash2, ShieldAlert, Layers, Filter, HelpCircle, X, FileDown, FileCheck, AlertTriangle,
  ArrowRight, Shield, Database, Network
} from 'lucide-react';

// --- API HELPER (Local scope to ensure availability) ---
const API_BASE_URL = 'https://auditor-veritas-mvp.onrender.com';

const apiCall = async (endpoint, options = {}, token = null, apiKey = null) => {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (apiKey) headers['x-api-key'] = apiKey;
  
  const config = { headers, ...options };
  if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
  }

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
    throw new Error(text || `Server Error: ${response.status}`);
  }
};

// ============================================================
// MERKLE PROOF VIEWER (FIXED)
// ============================================================
const MerkleProofViewer = ({ token }) => {
    const [eventId, setEventId] = useState('');
    const [proofData, setProofData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!eventId) return;
        setLoading(true); setError(null); setProofData(null);

        try {
            const data = await apiCall(`/api/merkle/proof/${eventId}`, { method: 'GET' }, token);
            setProofData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-900">
                <Network className="text-blue-600" size={20}/> Cryptographic Verification
            </h3>
            
            <form onSubmit={handleVerify} className="flex gap-2 mb-6">
                <input 
                    type="text" 
                    placeholder="Paste Event ID (UUID)" 
                    className="flex-1 p-2 border rounded-lg text-sm font-mono text-slate-900"
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                />
                <button disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50">
                    {loading ? <RefreshCw className="animate-spin" size={16}/> : 'Verify Integrity'}
                </button>
            </form>

            {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs mb-4">{error}</div>}

            {proofData && (
                <div className="space-y-4 animate-fade-in">
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                        <div className="flex items-center gap-2 text-emerald-700 font-bold mb-2">
                            <CheckCircle2 size={18}/> Merkle Proof Valid
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                                <span className="block text-emerald-600 uppercase font-bold text-[10px]">Leaf Hash</span>
                                <span className="font-mono text-slate-700 break-all">{proofData.data_hash}</span>
                            </div>
                            <div>
                                <span className="block text-emerald-600 uppercase font-bold text-[10px]">Merkle Root</span>
                                <span className="font-mono text-slate-700 break-all">{proofData.merkle_root}</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative pl-6 border-l-2 border-slate-200 space-y-2">
                        {proofData.proof.map((node, i) => (
                            <div key={i} className="relative">
                                <div className="absolute -left-[31px] top-3 w-6 h-0.5 bg-slate-200"></div>
                                <div className="bg-slate-50 p-2 rounded border border-slate-200 text-xs font-mono text-slate-600 flex justify-between">
                                    <span className="truncate w-3/4">{node.hash.substring(0, 30)}...</span>
                                    <span className="uppercase text-[10px] font-bold text-slate-400">{node.position} Sibling</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================================
// EVENT SEARCH COMPONENT (FIXED)
// ============================================================
const EventSearch = ({ token }) => {
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch latest 100 events on mount
    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                // Backend supports limit query
                const data = await apiCall('/api/events/search?limit=100', { method: 'GET' }, token);
                setLogs(data.events || []);
                setFilteredLogs(data.events || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [token]);

    // Client-side filtering (since backend search is basic)
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredLogs(logs);
            return;
        }
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = logs.filter(log => 
            log.event_type.toLowerCase().includes(lowerTerm) ||
            log.id.toLowerCase().includes(lowerTerm) ||
            log.user_identifier?.toLowerCase().includes(lowerTerm)
        );
        setFilteredLogs(filtered);
    }, [searchTerm, logs]);

    return (
        <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex gap-2">
                <Search className="text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search by Event ID, Type or User Identifier..." 
                    className="flex-1 outline-none text-slate-900 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            {loading ? (
                <div className="text-center py-10"><RefreshCw className="animate-spin mx-auto text-blue-500"/></div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 border-b">
                            <tr>
                                <th className="p-3">Event Type</th>
                                <th className="p-3">User ID (Hash)</th>
                                <th className="p-3">Event ID</th>
                                <th className="p-3 text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredLogs.length > 0 ? filteredLogs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50">
                                    <td className="p-3 font-bold text-slate-700">{log.event_type}</td>
                                    <td className="p-3 font-mono text-slate-500">{log.user_identifier.substring(0,8)}...</td>
                                    <td className="p-3 font-mono text-blue-600 select-all">{log.id}</td>
                                    <td className="p-3 text-right text-slate-400">{new Date(log.event_timestamp).toLocaleTimeString()}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" className="p-4 text-center text-slate-400">No events found matching search.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// ============================================================
// GDPR ERASURE FORM (FIXED)
// ============================================================
const ErasureForm = () => {
  const [userIdentifier, setUserIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Get API key from storage (Required for GDPR routes)
  const apiKey = localStorage.getItem('av_active_key') || localStorage.getItem('av_sim_key');

  const handleErasure = async (e) => {
    e.preventDefault();
    if (!userIdentifier.trim()) return;
    
    if (!apiKey) {
        setError("Missing API Key. Only Owners/Machines can execute crypto-shredding.");
        return;
    }

    const confirmed = window.confirm(
      `⚠️ CRYPTO SHREDDING WARNING\n\nThis will permanently destroy all encryption keys for:\n${userIdentifier}\n\nAll encrypted data will become PERMANENTLY unreadable.\n\nProceed?`
    );

    if (!confirmed) return;

    setLoading(true); setError(null); setResult(null);

    try {
      // Note: Passing null as token, but passing apiKey explicitly
      const data = await apiCall('/api/privacy/forget', {
        method: 'DELETE',
        body: { user_identifier: userIdentifier }
      }, null, apiKey);

      setResult(data);
      setUserIdentifier('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleErasure} className="space-y-3">
        <input
            type="text"
            value={userIdentifier}
            onChange={(e) => setUserIdentifier(e.target.value)}
            placeholder="User Email or ID to Shred"
            className="w-full p-2 border rounded-lg text-sm text-slate-900"
            required
        />
        <button disabled={loading || !userIdentifier} className="w-full bg-red-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <RefreshCw className="animate-spin" size={16}/> : <><Trash2 size={16}/> Execute Crypto Shredding</>}
        </button>
      </form>
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs">{error}</div>}
      {result && <div className="p-3 bg-green-50 text-green-700 rounded-lg text-xs"><CheckCircle2 size={14} className="inline mr-1"/> {result.message}</div>}
    </div>
  );
};

// ============================================================
// CHART & TABLE (Optimized)
// ============================================================
const LiveActivityChart = memo(({ dataPoints = [] }) => {
  const displayPoints = dataPoints.length < 10 ? [...Array(10 - dataPoints.length).fill(0), ...dataPoints] : dataPoints;
  const maxVal = Math.max(...displayPoints, 10);
  const pathData = displayPoints.map((p, i) => {
    const x = (i / (displayPoints.length - 1)) * 100;
    const y = 100 - (p / maxVal) * 80;
    return `${x},${y}`;
  }).join(' L ');

  return (
    <div className="relative h-40 w-full overflow-hidden rounded-lg mt-4 bg-blue-50/20 border border-blue-100/50">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute bottom-0 left-0 right-0 h-full w-full">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`M 0,100 L ${pathData} L 100,100 Z`} fill="url(#chartGrad)" />
        <path d={`M 0,100 L ${pathData}`} fill="none" stroke="#2563eb" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
});

const RecentLogsTable = memo(({ logs = [] }) => {
  if (logs.length === 0) return <div className="p-12 text-center text-slate-500 text-xs font-mono">No integrity events found.</div>;
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase tracking-wider">
          <tr><th className="py-3 px-4">Event</th><th className="py-3 px-4">Integrity Hash</th><th className="py-3 px-4 text-right">Timestamp</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-slate-50/50">
              <td className="py-3 px-4 font-bold text-slate-700">{log.event_type}</td>
              <td className="py-3 px-4 font-mono text-blue-600 text-[10px] break-all max-w-[120px]">{log.data_hash?.substring(0, 16)}...</td>
              <td className="py-3 px-4 text-right text-slate-400 font-mono">{new Date(log.event_timestamp).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

const KeyRotationTimer = ({ lastRotationDate }) => {
  const daysLeft = useMemo(() => {
    if (!lastRotationDate) return -1;
    const diffTime = Math.abs(new Date() - new Date(lastRotationDate));
    return 90 - Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [lastRotationDate]);

  let config = { color: 'blue', bg: 'bg-blue-50', border: 'border-blue-100', text: 'Secure', icon: CheckCircle2 };
  if (daysLeft < 15) config = { color: 'amber', bg: 'bg-amber-50', border: 'border-amber-100', text: 'Rotation Soon', icon: AlertTriangle };
  if (daysLeft < 0) config = { color: 'red', bg: 'bg-red-50', border: 'border-red-100', text: 'Action Required', icon: ShieldAlert };
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-xl shadow-sm border ${config.bg} ${config.border} flex items-center justify-between`}>
      <div className="flex items-center gap-3">
        <Icon size={20} className={`text-${config.color}-600`} />
        <div>
          <h4 className={`font-bold text-sm text-${config.color}-900`}>Security Key Status</h4>
          <p className={`text-xs text-${config.color}-700`}>{daysLeft < 0 ? 'No rotation recorded.' : `${daysLeft} days until mandatory rotation.`}</p>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN DASHBOARD COMPONENT
// ============================================================
const Dashboard = ({ processor, stats, token, eventData, setEventData, onLogEvent, KeyRotation, recentLogs, chartData, onLogout, session }) => {
  const [activeTab, setActiveTab] = useState('logs');
  const usagePercent = Math.min(((stats?.monthlyEvents || 0) / (processor?.monthly_events_limit || 100)) * 100, 100);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 pb-12 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> EU-Frankfurt
            </div>
            <span className="text-xs text-slate-400 font-mono">ID: {processor?.id?.substring(0, 8)}...</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{processor?.company_name || session?.user?.email || 'Unauthorized Node'}</h1>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold shadow-sm hover:bg-red-50 hover:text-red-600 transition-all">
          <LogOut size={16} /> Secure Logout
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <div><div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total Immutable Events</div><div className="text-4xl font-bold text-slate-900">{stats?.totalEvents?.toLocaleString() || 0}</div></div>
            <div className="text-right"><div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Monthly Quota</div><div className="text-sm font-mono font-bold text-blue-600">{stats?.monthlyEvents || 0} / {processor?.monthly_events_limit || 100}</div></div>
          </div>
          <LiveActivityChart dataPoints={chartData} />
        </div>
        <div className="space-y-4">
          <KeyRotationTimer lastRotationDate={processor?.last_rotation_date} />
          {KeyRotation}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-full md:w-fit overflow-x-auto">
        {['logs', 'search', 'verify', 'compliance'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'logs' && <RecentLogsTable logs={recentLogs} />}
          {activeTab === 'search' && <EventSearch token={token} />}
          {activeTab === 'verify' && <MerkleProofViewer token={token} />}
          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-slate-900"><Trash2 size={20} className="text-red-500" /> Right to Erasure (Art. 17)</h3>
                <p className="text-sm text-slate-500 mb-4">Execute Crypto-Shredding. Destroys user key, rendering data unreadable.</p>
                <ErasureForm />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Event Injector (Fixed) */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
              <Zap size={16} className="text-amber-500" />
              <h3 className="font-bold text-slate-800 text-sm">Event Injector</h3>
            </div>
            <form onSubmit={(e) => onLogEvent(e, eventData)} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Event Type</label>
                <input type="text" className="w-full text-xs p-2 border rounded bg-slate-50 text-slate-900" value={eventData.event_type} onChange={e => setEventData({ ...eventData, event_type: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">User ID</label>
                <input type="text" className="w-full text-xs p-2 border rounded bg-slate-50 text-slate-900" value={eventData.user_identifier} onChange={e => setEventData({ ...eventData, user_identifier: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Event Data (JSON)</label>
                <textarea className="w-full text-xs p-2 border rounded bg-slate-50 font-mono h-20 text-slate-900" value={eventData.event_data} onChange={e => setEventData({ ...eventData, event_data: e.target.value })} />
              </div>
              <button className="w-full bg-slate-900 text-white text-xs font-bold py-2 rounded hover:bg-slate-800 transition-colors">Log Event</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;