import React from 'react';
import { Activity, Search, MoreHorizontal, CheckCircle2, AlertCircle, RefreshCw, Zap, Lock, Clock, Key, LogOut, ChevronRight, LayoutGrid } from 'lucide-react';

// --- SUB-COMPONENT: PREMIER ACTIVITY CHART ---
const LiveActivityChart = ({ dataPoints = [] }) => {
  // Fyll ut med nollor om det är tomt för att hålla grafen snygg
  const displayPoints = dataPoints.length < 10 
    ? [...Array(10 - dataPoints.length).fill(0), ...dataPoints] 
    : dataPoints;
    
  const maxVal = Math.max(...displayPoints, 10); 

  const pathData = displayPoints.map((p, i) => {
    const x = (i / (displayPoints.length - 1)) * 100;
    const y = 100 - (p / maxVal) * 80; // Använd 80% av höjden för att inte slå i taket
    return `${x},${y}`;
  }).join(' L ');

  return (
    <div className="relative h-56 w-full overflow-hidden rounded-xl bg-white border border-slate-100">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center border-b border-slate-50 z-10 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-50 border border-blue-100">
                <Activity size={14} className="text-blue-600" />
            </div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ingestion Volume</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Live</span>
        </div>
      </div>

      {/* Grid Lines (Background) */}
      <div className="absolute inset-0 pt-14 px-4">
        <div className="w-full h-full border-t border-dashed border-slate-100 flex flex-col justify-between">
            <div className="w-full border-t border-dashed border-slate-100 h-1/4"></div>
            <div className="w-full border-t border-dashed border-slate-100 h-1/4"></div>
            <div className="w-full border-t border-dashed border-slate-100 h-1/4"></div>
        </div>
      </div>
      
      {/* The Chart */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute bottom-0 left-0 right-0 h-[calc(100%-3rem)] w-full px-2 pb-2">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {displayPoints.length > 1 && (
          <>
            <path d={`M 0,100 L ${pathData} L 100,100 Z`} fill="url(#chartGrad)" />
            <path d={`M 0,100 L ${pathData}`} fill="none" stroke="#3b82f6" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
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
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center h-64">
        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
            <LayoutGrid size={20} className="text-slate-300" />
        </div>
        <h3 className="text-slate-900 font-semibold text-sm">No events yet</h3>
        <p className="text-slate-500 text-xs mt-1">Logs will appear here in real-time.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
        <h3 className="font-bold text-slate-800 text-sm">Recent Events</h3>
        <button className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View all <ChevronRight size={12} />
        </button>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/50 text-slate-500 font-semibold border-b border-slate-100">
            <tr>
              <th className="py-3 pl-5 w-10"></th>
              <th className="py-3 px-3">Event</th>
              <th className="py-3 px-3">User ID</th>
              <th className="py-3 px-3 w-1/3">Data Payload (NY)</th> {/* <-- NY KOLUMN */}
              <th className="py-3 px-3 text-right pr-5">Timestamp</th>
            </tr>
            </thead>
          <tbody className="divide-y divide-slate-50">
            {logs.map((log, index) => (
              <tr key={index} className="hover:bg-slate-50/80 transition-colors group">
                <td className="py-3 pl-5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 size={12} className="text-emerald-600" />
                  </div>
                </td>
                <td className="py-3 px-3">
                    <span className="font-mono text-slate-700 font-medium group-hover:text-blue-600 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] border border-slate-200">
                        {log.event_type}
                    </span>
                </td>
                <td className="py-3 px-3 text-slate-500 font-mono text-[10px]">{log.user_identifier ? log.user_identifier.substring(0, 16) + '...' : 'N/A'}</td>
                
                {/* <-- IMPLEMENTERING AV DETALJERAD DATA --> */}
                <td className="py-3 px-3 max-w-xs overflow-hidden">
                  {log.event_data && typeof log.event_data === 'object' ? (
                    <pre className="text-[10px] font-mono text-slate-700 bg-slate-50 p-1 rounded-md overflow-x-auto whitespace-pre-wrap max-h-16">
                      {JSON.stringify(log.event_data, null, 2)}
                    </pre>
                  ) : (
                    <span className="text-[10px] text-slate-400">N/A</span>
                  )}
                </td>
                {/* <-- SLUT IMPLEMENTERING AV DETALJERAD DATA --> */}

                <td className="py-3 px-3 text-right pr-5 text-slate-400 font-mono text-[10px]">
                  {new Date(log.event_timestamp).toLocaleTimeString()}
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
const Dashboard = ({ 
    processor, 
    stats, 
    apiKey, 
    onLogEvent, 
    eventData, 
    setEventData, 
    isLoading, 
    KeyRotation, 
    recentLogs, 
    chartData, 
    onLogout, 
    MerkleViewerComponent,
    GdprErasureComponent 
}) => {
  const eventsLimit = stats.eventsLimit || 100;
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-32 pb-24 animate-fade-in-up">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live
             </div>
             <span className="text-xs text-slate-400 font-mono">{processor.id}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{processor.companyName}</h1>
        </div>

        <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">API Key</span>
                <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">{apiKey.slice(0, 16)}...</span>
            </div>
            <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
            >
            <LogOut size={16} />
            Sign Out
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left Column (Chart) */}
        <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-1 h-full">
                <LiveActivityChart dataPoints={chartData} />
                <div className="grid grid-cols-3 gap-4 p-4">
                    <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Events</div>
                        <div className="text-2xl font-bold text-slate-900">{stats.totalEvents}</div>
                    </div>
                    <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Success Rate</div>
                        <div className="text-2xl font-bold text-emerald-600">100%</div>
                    </div>
                    <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Avg Latency</div>
                        <div className="text-2xl font-bold text-slate-900">12ms</div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Right Column (Quota & Key) */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-slate-800 text-xs font-bold uppercase tracking-wider">Usage Quota</h3>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{stats.monthlyEvents} / {eventsLimit}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                    <div 
                        className={`h-full transition-all duration-1000 ${stats.monthlyEvents / eventsLimit * 100 > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min((stats.monthlyEvents / eventsLimit * 100), 100)}%` }}
                    ></div>
                </div>
                <p className="text-xs text-slate-400">Resets in 28 days</p>
              </div>

            {KeyRotation}
        </div>
      </div>

      {/* Main Content Split (Logs & Tools) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Logs (2/3) */}
        <div className="lg:col-span-2">
           <RecentLogsTable logs={recentLogs} />
        </div>

        {/* Right: Event Tester & Utilities (1/3) */}
        <div className="space-y-6">
           {/* Event Tester */}
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                 <Zap className="text-amber-500" size={16} />
                 <h3 className="font-bold text-slate-700 text-sm">API Simulator</h3>
              </div>
              
              <div className="p-5">
                <p className="text-xs text-slate-500 mb-4">
                    Manually inject an event to test your webhook configuration and audit stream.
                </p>
                <form onSubmit={onLogEvent} className="space-y-4">
                    <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Event Type</label>
                    <input 
                        type="text" 
                        placeholder="e.g. payment.success" 
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 text-slate-700 font-medium" 
                        value={eventData.event_type} 
                        onChange={e => setEventData({...eventData, event_type: e.target.value})} 
                        required 
                    />
                    </div>
                    <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">JSON Payload</label>
                    <textarea 
                        placeholder='{"amount": 500, "currency": "SEK"}' 
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono text-xs h-24 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-slate-300 text-slate-600" 
                        value={eventData.event_data} 
                        onChange={e => setEventData({...eventData, event_data: e.target.value})} 
                        required 
                    />
                    </div>
                    <button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full bg-[#0a2540] hover:bg-[#1e293b] text-white py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2"
                    >
                    {isLoading ? <RefreshCw className="animate-spin w-3.5 h-3.5"/> : 'Inject Test Event'}
                    </button>
                </form>
              </div>
           </div>
            
            {/* Merkle Proof Viewer Component */}
            {MerkleViewerComponent}

            {/* GDPR Erasure Control */}
            {GdprErasureComponent}
            
        </div>

      </div>
    </div>
  );
};

export default Dashboard;