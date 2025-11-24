import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle2, ChevronRight, LayoutGrid, Shield, Lock } from 'lucide-react';

// Återanvänder exakt samma graf-komponent som i riktiga Dashboard
const PreviewChart = ({ dataPoints }) => {
  const maxVal = Math.max(...dataPoints, 10);
  const pathData = dataPoints.map((p, i) => {
    const x = (i / (dataPoints.length - 1)) * 100;
    const y = 100 - (p / maxVal) * 80;
    return `${x},${y}`;
  }).join(' L ');

  return (
    <div className="relative h-56 w-full overflow-hidden rounded-xl bg-white border border-slate-100">
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center border-b border-slate-50 z-10 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-50 border border-blue-100">
                <Activity size={14} className="text-blue-600" />
            </div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ingestion Volume</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Live Demo</span>
        </div>
      </div>

      <div className="absolute inset-0 pt-14 px-4">
        <div className="w-full h-full border-t border-dashed border-slate-100 flex flex-col justify-between">
            <div className="w-full border-t border-dashed border-slate-100 h-1/4"></div>
            <div className="w-full border-t border-dashed border-slate-100 h-1/4"></div>
            <div className="w-full border-t border-dashed border-slate-100 h-1/4"></div>
        </div>
      </div>
      
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute bottom-0 left-0 right-0 h-[calc(100%-3rem)] w-full px-2 pb-2">
        <defs>
          <linearGradient id="previewChartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`M 0,100 L ${pathData} L 100,100 Z`} fill="url(#previewChartGrad)" />
        <path d={`M 0,100 L ${pathData}`} fill="none" stroke="#3b82f6" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

const DashboardPreview = () => {
  // Simulera data för preview-läget
  const [data, setData] = useState([20, 35, 45, 30, 55, 65, 50, 70, 60, 85]);
  const [logs, setLogs] = useState([
    { id: 1, event: 'user.login', user: 'usr_892...', time: 'Just now' },
    { id: 2, event: 'payment.charge', user: 'usr_441...', time: '2s ago' },
    { id: 3, event: 'data.sync', user: 'sys_admin', time: '5s ago' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Uppdatera grafen
      setData(prev => {
        const next = Math.floor(Math.random() * 40) + 40;
        return [...prev.slice(1), next];
      });
      
      // Lägg till nytt event då och då
      if (Math.random() > 0.6) {
        const events = ['user.login', 'file.upload', 'api.request', 'auth.check'];
        const newLog = {
          id: Date.now(),
          event: events[Math.floor(Math.random() * events.length)],
          user: `usr_${Math.floor(Math.random()*999)}...`,
          time: 'Just now'
        };
        setLogs(prev => [newLog, ...prev].slice(0, 4));
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-32 bg-[#020617] border-t border-white/5 overflow-hidden relative">
      {/* Bakgrundseffekt */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-blue-400 backdrop-blur-md mb-4">
             <Activity size={14} /> Product Interface
           </div>
           <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
             Real-time visibility. <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Zero latency.</span>
           </h2>
        </div>

        {/* THE PREVIEW WINDOW - EXAKT SOM DASHBOARD */}
        <motion.div 
          initial={{ y: 50, opacity: 0, rotateX: 10 }}
          whileInView={{ y: 0, opacity: 1, rotateX: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-800 max-w-5xl mx-auto transform perspective-[1000px]"
        >
          {/* Window Bar */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-4">
             <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400/30 border border-red-400/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400/30 border border-yellow-400/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-400/30 border border-green-400/50"></div>
             </div>
             <div className="flex-1 bg-white border border-slate-200 h-8 rounded-md flex items-center px-3 text-xs text-slate-400 font-mono">
                <Lock size={10} className="mr-2 text-emerald-500"/> dashboard.auditor-veritas.com
             </div>
          </div>

          {/* Dashboard Content (Kopia av din riktiga design) */}
          <div className="bg-[#f7fafc] p-6 md:p-8">
             
             <div className="flex justify-between items-end mb-8">
                <div>
                   {/* ÄNDRAT FRÅN KAVHOLM TILL NEXUS CORP */}
                   <h1 className="text-2xl font-bold text-slate-900">HazarNode</h1>
                   <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">System Operational</span>
                   </div>
                </div>
                <div className="hidden md:block">
                   <div className="text-right">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Ingestion</div>
                      <div className="text-2xl font-bold text-slate-900">1,249,821</div>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Chart */}
                <div className="md:col-span-2">
                   <PreviewChart dataPoints={data} />
                </div>

                {/* Stats Column */}
                <div className="space-y-6">
                   <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Active Nodes</h3>
                      <div className="text-3xl font-bold text-slate-900">14</div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                         <div className="bg-emerald-500 h-full w-[80%]"></div>
                      </div>
                   </div>
                   
                   {/* Recent Logs Preview */}
                   <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between">
                         <span className="text-xs font-bold text-slate-700">Live Events</span>
                         <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="p-2">
                         {logs.map((log, i) => (
                           <div key={log.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded transition-colors text-xs">
                              <div className="flex items-center gap-2">
                                 <CheckCircle2 size={12} className="text-emerald-500"/>
                                 <span className="font-mono text-slate-700 font-medium">{log.event}</span>
                              </div>
                              <span className="text-slate-400">{log.time}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>

             </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPreview;