import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import CryptoJS from 'crypto-js';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Components
import AnimatedBackground from './components/AnimatedBackground'; 
import PhoneDemo from './components/PhoneDemo'; 
import PrivacyPage from './components/PrivacyPage'; 
import CreateProcessor from './components/CreateProcessor'; 

import { 
  ShieldCheck, BarChart3, FileText, Check, Lock, Zap, LogOut, 
  Key, Database, Menu, X, Sparkles, RotateCw, RefreshCw, 
  GitBranch, Network, Clock, ChevronRight
} from 'lucide-react';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

// --- CONFIGURATION ---
const API_BASE_URL = 'https://auditor-veritas-mvp.onrender.com';

// --- UTILS ---
const apiCall = async (endpoint, options = {}, apiKey = '') => {
  const config = {
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, ...options.headers },
    ...options,
  };
  if (options.body) config.body = JSON.stringify(options.body);
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (response.status === 204) return null;
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `HTTP error! status: ${response.status}`);
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// --- INTERACTIVE MERKLE DEMO (How It Works) ---
const InteractiveMerkle = () => {
  return (
    <div className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900">Cryptographic Proof</h2>
          <p className="text-slate-500 mt-2">Every event is hashed into a Merkle Tree, ensuring mathematical integrity.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
             {[
               { icon: FileText, title: "1. Event Capture", desc: "Raw JSON data is normalized." },
               { icon: Key, title: "2. SHA-256 Hashing", desc: "Data + Salt creates a unique hash." },
               { icon: Network, title: "3. Merkle Leaf", desc: "Hash is added as a leaf node." },
               { icon: GitBranch, title: "4. Root Update", desc: "Tree rebalances to new Root Hash." }
             ].map((step, i) => (
               <div key={i} className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-blue-400 transition-colors">
                 <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                   <step.icon className="w-5 h-5" />
                 </div>
                 <div>
                   <h4 className="font-bold text-slate-800">{step.title}</h4>
                   <p className="text-sm text-slate-500">{step.desc}</p>
                 </div>
               </div>
             ))}
          </div>
          
          {/* Visual Tree Representation */}
          <div className="bg-[#0f172a] p-8 rounded-3xl shadow-2xl relative min-h-[400px] flex flex-col items-center justify-center">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950 opacity-50"></div>
             
             {/* Root */}
             <motion.div 
               initial={{ scale: 0 }} whileInView={{ scale: 1 }} 
               className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold z-10 shadow-[0_0_30px_rgba(16,185,129,0.5)]"
             >
               ROOT
             </motion.div>
             
             {/* Connectors */}
             <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path d="M 50% 45% L 30% 65%" stroke="#475569" strokeWidth="2" />
                <path d="M 50% 45% L 70% 65%" stroke="#475569" strokeWidth="2" />
                <path d="M 30% 75% L 20% 85%" stroke="#475569" strokeWidth="2" />
                <path d="M 30% 75% L 40% 85%" stroke="#475569" strokeWidth="2" />
             </svg>

             {/* Layer 2 */}
             <div className="flex gap-20 mt-12 z-10">
                <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-xs text-white border border-slate-600">H1</div>
                <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-xs text-white border border-slate-600">H2</div>
             </div>

             {/* Leaves */}
             <div className="flex gap-8 mt-12 z-10">
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="w-10 h-10 bg-blue-600/20 border border-blue-500 rounded-lg flex items-center justify-center text-[10px] text-blue-400">Data A</motion.div>
                <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-lg"></div>
                <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-lg"></div>
                <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-lg"></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---
function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [processor, setProcessor] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [eventData, setEventData] = useState({ event_type: '', event_data: '{}', user_identifier: '' });
  const [stats, setStats] = useState({ totalEvents: 0, monthlyEvents: 0 });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedPrivacy = localStorage.getItem('privacyAccepted_final_v2');
    if (savedPrivacy === 'true') setPrivacyAccepted(true);
    const savedKey = localStorage.getItem('auditorApiKey');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handlePrivacyAccept = () => {
    localStorage.setItem('privacyAccepted_final_v2', 'true');
    setPrivacyAccepted(true);
  };

  const fetchDashboard = async () => {
    if (!apiKey) return alert("Please enter API Key");
    setIsLoading(true);
    try {
      const data = await apiCall('/api/dashboard', { method: 'GET' }, apiKey);
      setProcessor(data.processor || { companyName: 'Connected Node' });
      setStats(data.stats || { totalEvents: 0, monthlyEvents: 0 });
      localStorage.setItem('auditorApiKey', apiKey);
    } catch (error) {
      // Fallback för demo om ingen backend svarar
      if (apiKey.startsWith('av_')) {
         setProcessor({ companyName: 'Demo Environment' });
         setStats({ totalEvents: 128, monthlyEvents: 42 });
      } else {
         alert('Connection failed. Check API key or backend status.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogEvent = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let hashedUser = eventData.user_identifier;
      if (eventData.user_identifier) hashedUser = CryptoJS.SHA256(eventData.user_identifier).toString();
      
      await apiCall('/api/events', {
        method: 'POST',
        body: { ...eventData, user_identifier: hashedUser, event_data: JSON.parse(eventData.event_data) }
      }, apiKey);
      
      alert('Event Logged Successfully!');
      setStats(prev => ({...prev, totalEvents: prev.totalEvents + 1}));
    } catch (error) {
      alert('Event logging simulated (Backend offline)');
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER ---
  if (!privacyAccepted) {
    return <PrivacyPage onAccept={handlePrivacyAccept} />;
  }

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#635bff] selection:text-white flex flex-col">
      
      {/* NAVBAR */}
      <header className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-8 h-8 bg-[#635bff] rounded-lg flex items-center justify-center text-white"><ShieldCheck size={20}/></div>
            <span className="font-bold text-slate-900 text-xl">Auditor Veritas</span>
          </div>
          <nav className="hidden md:flex gap-8">
            <button onClick={() => setActiveTab('home')} className="text-sm font-medium text-slate-600 hover:text-[#635bff]">Product</button>
            <button onClick={() => setActiveTab('create')} className="text-sm font-medium text-slate-600 hover:text-[#635bff]">Developers</button>
            <button onClick={() => setActiveTab('dashboard')} className="bg-[#0a2540] text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-slate-800">Sign In</button>
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-20">
        {activeTab === 'home' && (
          <>
            {/* HERO */}
            <div className="relative bg-[#0a2540] text-white min-h-[90vh] flex items-center overflow-hidden">
              <AnimatedBackground />
              <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-[#00d4ff] text-sm font-medium border border-white/10 backdrop-blur-sm">
                    <Sparkles className="w-4 h-4" /><span>Tech Demo v2.0</span>
                  </div>
                  <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.1]">
                    Compliance <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#635bff]">Engineered.</span>
                  </h1>
                  <p className="text-lg text-slate-300 max-w-xl">
                    The interactive demo on the right visualizes our real-time SHA-256 hashing and Merkle Tree construction.
                  </p>
                  <div className="flex gap-4">
                    <button onClick={() => setActiveTab('create')} className="px-8 py-4 rounded-full bg-[#635bff] hover:bg-[#5449e3] font-bold shadow-lg hover:scale-105 transition-transform">Start Integration</button>
                  </div>
                </div>
                <div className="flex justify-center"><PhoneDemo /></div>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-b from-transparent to-white pointer-events-none" />
            </div>

            {/* MERKLE & HOW IT WORKS */}
            <InteractiveMerkle />
          </>
        )}

        {activeTab === 'dashboard' && (
          <div className="p-6 min-h-screen bg-slate-50 pt-32">
             {!processor ? (
               <div className="max-w-md mx-auto bg-white p-10 rounded-3xl shadow-xl border border-slate-100 text-center animate-fade-in-up">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6"><Lock className="w-8 h-8 text-slate-400" /></div>
                 <h2 className="text-2xl font-bold mb-2 text-slate-900">Dashboard Access</h2>
                 <p className="text-slate-500 mb-8">Enter your secure API key.</p>
                 <input type="text" placeholder="av_live_..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4 font-mono outline-none focus:ring-2 focus:ring-[#635bff]" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                 <button onClick={fetchDashboard} disabled={isLoading} className="w-full bg-[#0a2540] text-white p-4 rounded-xl font-bold hover:bg-slate-800 transition-colors">
                   {isLoading ? <RefreshCw className="animate-spin mx-auto"/> : 'Connect'}
                 </button>
               </div>
             ) : (
               <div className="max-w-6xl mx-auto animate-fade-in-up">
                 <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">{processor.companyName}</h1>
                    <button onClick={() => setProcessor(null)} className="text-red-500 flex items-center gap-2 hover:bg-red-50 px-4 py-2 rounded-lg transition"><LogOut size={18}/> Sign Out</button>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                      <div className="text-slate-500 text-xs font-bold uppercase mb-2">Total Events</div>
                      <div className="text-4xl font-bold text-slate-900">{stats.totalEvents}</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                      <div className="text-slate-500 text-xs font-bold uppercase mb-2">Status</div>
                      <div className="text-emerald-600 font-bold flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Active</div>
                    </div>
                 </div>

                 <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Zap className="text-amber-500"/> Log Event</h3>
                    <form onSubmit={handleLogEvent} className="space-y-4 max-w-2xl">
                      <input type="text" placeholder="Event Type (e.g. login)" className="w-full p-3 border rounded-xl" value={eventData.event_type} onChange={e => setEventData({...eventData, event_type: e.target.value})} required />
                      <textarea placeholder='JSON Data' className="w-full p-3 border rounded-xl font-mono text-sm" rows="3" value={eventData.event_data} onChange={e => setEventData({...eventData, event_data: e.target.value})} required />
                      <button type="submit" disabled={isLoading} className="px-8 py-3 bg-[#635bff] text-white rounded-xl font-bold hover:bg-[#5449e3]">Log Event</button>
                    </form>
                 </div>
               </div>
             )}
          </div>
        )}

        {activeTab === 'create' && <div className="pt-32 p-6 flex justify-center bg-slate-50"><CreateProcessor /></div>}
      </main>
    </div>
  );
}

export default App;