import React from 'react';
// FIX: Lade till 'Key' i import-listan här
import { Activity, Search, MoreHorizontal, CheckCircle2, AlertCircle, RefreshCw, Zap, Lock, Clock, Key } from 'lucide-react';

// --- SUB-COMPONENT: ACTIVITY CHART (Custom SVG) ---
const LiveActivityChart = ({ dataPoints = [] }) => {
  // Om ingen data finns, visa en baslinje
  const points = dataPoints.length > 0 ? dataPoints : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const maxVal = Math.max(...points, 10); // Skala dynamiskt, minsta tak 10

  // Skapa SVG-banan baserat på riktig data
  const pathData = points.map((p, i) => {
    const x = (i / (points.length - 1)) * 100;
    const y = 100 - (p / maxVal) * 100;
    return `${x},${y}`;
  }).join(' L ');

  return (
    <div className="relative h-48 w-full overflow-hidden rounded-xl bg-gradient-to-b from-blue-500/5 to-transparent border border-blue-500/10">
      <div className="absolute top-4 right-4 flex gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        <span className="text-blue-400 animate-pulse">● Live Feed</span>
      </div>
      
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {points.length > 1 && (
          <>
            <path d={`M 0,100 L ${pathData} L 100,100 Z`} fill="url(#chartGrad)" />
            <path d={`M 0,100 L ${pathData}`} fill="none" stroke="#3b82f6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </>
        )}
      </svg>
    </div>
  );
};

// --- SUB-COMPONENT: RECENT LOGS TABLE ---
const RecentLogsTable = ({ logs = [] }) => {
  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
        No events logged in this session yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="font-bold text-slate-700 text-sm">Recent Events</h3>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
            <tr>
              <th className="p-3 pl-4">Status</th>
              <th className="p-3">Event Type</th>
              <th className="p-3">User ID</th>
              <th className="p-3 text-right pr-4">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {logs.map((log, index) => (
              <tr key={index} className="hover:bg-slate-50/80 transition-colors group">
                <td className="p-3 pl-4">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                </td>
                <td className="p-3 font-mono text-slate-700 font-medium group-hover:text-blue-600">{log.event_type}</td>
                <td className="p-3 text-slate-500 font-mono text-[10px]">{log.user_identifier || 'N/A'}</td>
                <td className="p-3 text-right pr-4 text-slate-400">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---
const Dashboard = ({ processor, stats, apiKey, onLogEvent, eventData, setEventData, isLoading, KeyRotation, recentLogs, chartData }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-32 pb-20 animate-fade-in-up">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Live Connection</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{processor.companyName}</h1>
          <p className="text-slate-500 text-sm flex items-center gap-2">
            <Key size={12} /> Secure Session Active
          </p>
        </div>
      </div>

      {/* Stats Grid - VISAR FAKTISKA VÄRDEN FRÅN API */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-2 bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
           <div className="p-5 h-full flex flex-col">
              <div className="flex justify-between items-start mb-4">
                 <div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Events</h3>
                    <div className="text-3xl font-bold text-slate-900 mt-1">{stats.totalEvents}</div>
                 </div>
                 <Activity className="text-blue-500 opacity-80" size={20} />
              </div>
              <div className="flex-1 w-full mt-auto">
                 <LiveActivityChart dataPoints={chartData} />
              </div>
           </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
           <div>
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Quota Usage</h3>
              <div className="text-3xl font-bold text-slate-900 mt-1">{stats.monthlyEvents} <span className="text-lg text-slate-400">/ 100</span></div>
           </div>
           <div className="space-y-2 mt-4">
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${stats.monthlyEvents > 90 ? 'bg-red-500' : 'bg-blue-600'}`}
                    style={{ width: `${Math.min((stats.monthlyEvents / 100 * 100), 100)}%` }}
                  ></div>
              </div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center items-center text-center">
           <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
             <Lock size={24} className="text-emerald-600" />
           </div>
           <div className="text-sm font-bold text-slate-900">Authenticated</div>
           <div className="text-xs text-slate-500 mt-1 break-all">{apiKey.slice(0, 12)}...</div>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Real Logs Table */}
        <div className="lg:col-span-2 space-y-8">
           <RecentLogsTable logs={recentLogs} />
        </div>

        {/* Right: Functional Tools */}
        <div className="space-y-6">
           
           {KeyRotation}

           {/* Functional Event Logger */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
                 <Zap className="text-amber-500" size={18} />
                 <h3 className="font-bold text-slate-800 text-sm">Log Live Event</h3>
              </div>
              <form onSubmit={onLogEvent} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Event Type</label>
                  <input 
                    type="text" 
                    placeholder="e.g. user.login" 
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                    value={eventData.event_type} 
                    onChange={e => setEventData({...eventData, event_type: e.target.value})} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">JSON Payload</label>
                  <textarea 
                    placeholder='{"ip": "1.1.1.1"}' 
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs h-20 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" 
                    value={eventData.event_data} 
                    onChange={e => setEventData({...eventData, event_data: e.target.value})} 
                    required 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex justify-center items-center gap-2"
                >
                  {isLoading ? <RefreshCw className="animate-spin w-4 h-4"/> : 'Log to Blockchain'}
                </button>
              </form>
           </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;