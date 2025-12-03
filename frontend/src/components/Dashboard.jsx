// FILE: Dashboard.jsx
import React, { useState, useEffect, useMemo, memo } from 'react';
import CryptoJS from 'crypto-js';
import { 
    Activity, Search, CheckCircle2, RefreshCw, Zap, Lock, LogOut, LayoutGrid, 
    Trash2, ShieldAlert, Layers, Filter, HelpCircle, X, FileDown, FileCheck, AlertTriangle
} from 'lucide-react';
import MerkleProofViewer from './MerkleProofViewer'; 

// --- API HELPER (Kept consistent) ---
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
        throw new Error(`Server Error: ${text.substring(0, 100)}...`);
    }
};

// --- OPTIMIZED CHART (Use Memo to prevent lag) ---
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
                {displayPoints.length > 1 && (
                    <>
                        <path d={`M 0,100 L ${pathData} L 100,100 Z`} fill="url(#chartGrad)" />
                        <path d={`M 0,100 L ${pathData}`} fill="none" stroke="#2563eb" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" /> 
                    </>
                )}
            </svg>
        </div>
    );
});

// --- OPTIMIZED TABLE ---
const RecentLogsTable = memo(({ logs = [] }) => {
    if (logs.length === 0) return (<div className="p-12 text-center text-slate-500 text-xs font-mono">No integrity events found.</div>);
    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase tracking-wider">
                        <tr><th className="py-3 px-4">Event</th><th className="py-3 px-4">Integrity Hash</th><th className="py-3 px-4">Payload</th><th className="py-3 px-4 text-right">Timestamp</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-3 px-4 font-bold text-slate-700">{log.event_type}</td>
                                <td className="py-3 px-4 font-mono text-blue-600 text-[10px] break-all max-w-[120px]">{log.data_hash.substring(0,16)}...</td>
                                <td className="py-3 px-4 font-mono text-slate-400 text-[10px]"><Lock size={10} className="inline mr-1"/> AES-256</td>
                                <td className="py-3 px-4 text-right text-slate-400 font-mono">{new Date(log.event_timestamp).toLocaleTimeString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
});

// --- KEY ROTATION TIMER ---
const KeyRotationTimer = ({ lastRotationDate }) => {
    const daysLeft = useMemo(() => {
        if (!lastRotationDate) return -1;
        const diffTime = Math.abs(new Date() - new Date(lastRotationDate));
        return 90 - Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }, [lastRotationDate]);

    let config = { color: 'blue', text: 'Secure', icon: CheckCircle2 };
    if (daysLeft < 15) config = { color: 'amber', text: 'Rotation Soon', icon: AlertTriangle };
    if (daysLeft < 0) config = { color: 'red', text: 'Action Required', icon: ShieldAlert };

    return (
        <div className={`p-4 rounded-xl shadow-sm border bg-${config.color}-50 border-${config.color}-100 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
                <config.icon size={20} className={`text-${config.color}-600`} />
                <div>
                    <h4 className={`font-bold text-sm text-${config.color}-900`}>Security Key Status</h4>
                    <p className={`text-xs text-${config.color}-700`}>{daysLeft < 0 ? 'No rotation recorded.' : `${daysLeft} days until mandatory rotation.`}</p>
                </div>
            </div>
        </div>
    );
};

// --- MAIN DASHBOARD (Simplified) ---
const Dashboard = ({ processor, stats, token, eventData, setEventData, onLogEvent, KeyRotation, recentLogs, chartData, onLogout }) => {
    const [activeTab, setActiveTab] = useState('logs');

    // Stats Memoization
    const usagePercent = useMemo(() => {
        return Math.min((stats.monthlyEvents / (processor.monthly_events_limit || 100)) * 100, 100);
    }, [stats.monthlyEvents, processor.monthly_events_limit]);

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 pb-12 animate-fade-in-up"> 
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4"> 
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> EU-Frankfurt</div>
                        <span className="text-xs text-slate-400 font-mono">ID: {processor.id.substring(0,8)}...</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">{processor.company_name}</h1>
                </div>
                <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"><LogOut size={16} /> Secure Logout</button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"> 
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total Immutable Events</div>
                            <div className="text-4xl font-bold text-slate-900">{stats.totalEvents.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                             <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Monthly Quota</div>
                             <div className="text-sm font-mono font-bold text-blue-600">{stats.monthlyEvents} / {processor.monthly_events_limit || 100}</div>
                        </div>
                    </div>
                    <LiveActivityChart dataPoints={chartData} />
                </div>
                
                <div className="space-y-4">
                    <KeyRotationTimer lastRotationDate={processor.last_rotation_date} />
                    {KeyRotation} {/* This component is passed from App.jsx */}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-full md:w-fit"> 
                {['logs', 'search', 'verify', 'compliance'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"> 
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'logs' && <RecentLogsTable logs={recentLogs} />}
                    {activeTab === 'search' && <div className="p-6 bg-white rounded-xl border border-slate-200 text-center text-slate-500">Search Component Here</div>}
                    {activeTab === 'verify' && <MerkleProofViewer token={token} />}
                    {activeTab === 'compliance' && <div className="bg-white p-6 rounded-xl border border-slate-200">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Trash2 size={20} className="text-red-500"/> Right to Erasure</h3>
                        <p className="text-sm text-slate-500">Execute Crypto-Shredding (GDPR Art. 17). This destroys the key, rendering data unrecoverable while keeping the log integrity intact.</p>
                        {/* Add ErasureForm logic here */}
                    </div>}
                </div>

                {/* Sidebar Tools */}
                <div className="space-y-6">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                            <Zap size={16} className="text-amber-500"/>
                            <h3 className="font-bold text-slate-800 text-sm">Event Injector</h3>
                        </div>
                        <form onSubmit={onLogEvent} className="space-y-3">
                            <input type="text" placeholder="user.login" className="w-full text-xs p-2 border rounded bg-slate-50" value={eventData.event_type} onChange={e => setEventData({...eventData, event_type: e.target.value})} />
                            <textarea className="w-full text-xs p-2 border rounded bg-slate-50 font-mono h-20" value={eventData.event_data} onChange={e => setEventData({...eventData, event_data: e.target.value})} />
                            <button className="w-full bg-slate-900 text-white text-xs font-bold py-2 rounded hover:bg-slate-800">Log Event</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;