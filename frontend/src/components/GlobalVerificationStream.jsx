import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Globe, Activity, Hash } from 'lucide-react';

const GlobalVerificationStream = () => {
  const [events, setEvents] = useState([]);

  // Simulera inkommande globala events
  useEffect(() => {
    const interval = setInterval(() => {
      const newEvent = {
        id: Math.random().toString(36).substr(2, 9),
        region: ['EU-West', 'US-East', 'Asia-South', 'SA-East'][Math.floor(Math.random() * 4)],
        type: ['Login', 'Payment', 'Data_Access', 'Config_Change'][Math.floor(Math.random() * 4)],
        hash: '0x' + Math.random().toString(16).substr(2, 8) + '...',
        latency: Math.floor(Math.random() * 50) + 10 + 'ms'
      };

      setEvents(prev => [newEvent, ...prev].slice(0, 7)); // Behåll de senaste 7
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative py-24 bg-[#020617] border-t border-white/5 overflow-hidden">
      {/* Bakgrundseffekt */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)]"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          
          {/* Vänster: Text */}
          <div className="flex-1">
             <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                Live Network Status
             </div>
             <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
               Processing events across <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">global infrastructure.</span>
             </h2>
             <p className="text-slate-400 text-sm leading-relaxed max-w-md">
               Watch verification nodes reach consensus in real-time. Every event is cryptographically sealed instantly upon ingestion.
             </p>
             
             <div className="flex gap-6 mt-8">
                <div>
                   <div className="text-2xl font-bold text-white">99.99%</div>
                   <div className="text-xs text-slate-500 uppercase tracking-wider">Uptime</div>
                </div>
                <div>
                   <div className="text-2xl font-bold text-white">~12ms</div>
                   <div className="text-xs text-slate-500 uppercase tracking-wider">Global Latency</div>
                </div>
                <div>
                   <div className="text-2xl font-bold text-white">4.2B+</div>
                   <div className="text-xs text-slate-500 uppercase tracking-wider">Events Secured</div>
                </div>
             </div>
          </div>

          {/* Höger: Live Stream Visualizer */}
          <div className="flex-1 w-full">
             <div className="bg-[#0a0e17] rounded-2xl border border-white/10 p-1 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
                
                {/* Header */}
                <div className="px-4 py-3 bg-white/5 border-b border-white/5 flex justify-between items-center rounded-t-xl">
                   <div className="flex gap-2 items-center">
                      <Globe size={14} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Global Feed</span>
                   </div>
                   <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                   </div>
                </div>

                {/* Stream Area */}
                <div className="p-4 h-[300px] overflow-hidden flex flex-col justify-end space-y-2 relative">
                   <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e17] via-transparent to-transparent z-10 pointer-events-none h-20"></div>
                   
                   <AnimatePresence initial={false}>
                      {events.map((event) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.4 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 backdrop-blur-sm"
                        >
                           <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-blue-500/10 rounded-md border border-blue-500/20">
                                 <Hash size={12} className="text-blue-400" />
                              </div>
                              <div>
                                 <div className="text-xs font-bold text-white">{event.type}</div>
                                 <div className="text-[10px] text-slate-500 font-mono">{event.hash}</div>
                              </div>
                           </div>
                           <div className="text-right">
                              <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-400 font-bold uppercase">
                                 <ShieldCheck size={10} /> Verified
                              </div>
                              <div className="text-[10px] text-slate-500">{event.region} • {event.latency}</div>
                           </div>
                        </motion.div>
                      ))}
                   </AnimatePresence>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GlobalVerificationStream;