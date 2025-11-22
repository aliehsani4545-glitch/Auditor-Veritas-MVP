import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import CryptoJS from 'crypto-js';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Components
import AnimatedBackground from './components/AnimatedBackground'; 
import PhoneDemo from './components/PhoneDemo'; 
import Carousel3D from './components/Carousel3D'; 
// HÄR ÄR RÄTTELSE: Vi använder PrivacyPage konsekvent
import PrivacyPage from './components/PrivacyPage'; 
import CreateProcessor from './components/CreateProcessor'; 
import InteractiveMerkle from './components/InteractiveMerkle'; // Om du har denna separat, annars ligger den i App.jsx nedan

import { 
  ShieldCheck, BarChart3, FileText, Check, Lock, Zap, LogOut, 
  Key, Database, Menu, X, Sparkles, RotateCw, RefreshCw, Copy, Eye, EyeOff,
  GitBranch, Network
} from 'lucide-react';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const API_BASE_URL = 'https://auditor-veritas-mvp.onrender.com';

// --- UTILS ---
const apiCall = async (endpoint, options = {}, apiKey = '') => {
  const config = {
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, ...options.headers },
    ...options,
  };
  if (options.body) config.body = JSON.stringify(options.body);
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `HTTP error! status: ${response.status}`);
  return data;
};

// --- INTERACTIVE MERKLE DEMO (Ligger kvar i App.jsx för enkelhetens skull) ---
const InteractiveMerkleSection = () => {
  const [step, setStep] = useState(0);
  const nextStep = () => setStep(s => (s + 1) % 4);

  return (
    <div className="py-24 bg-slate-50 border-t border-slate-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Cryptographic Process Visualization</h2>
          <p className="text-slate-500 mt-4">Trace how data becomes immutable.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Controls */}
          <div className="space-y-6">
            {[
              { id: 0, icon: FileText, title: "Raw Data Capture", desc: "Event data is captured and normalized." },
              { id: 1, icon: Lock, title: "SHA-256 Hashing", desc: "Data is salted and hashed (256-bit)." },
              { id: 2, icon: Network, title: "Merkle Tree Leaf", desc: "Hash is added as a leaf node." },
              { id: 3, icon: GitBranch, title: "Root Hash Update", desc: "Tree rebalances to a new Root Hash." }
            ].map((s, i) => (
              <div 
                key={i} 
                className={`p-6 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 ${
                  step === i 
                    ? 'border-blue-500 bg-blue-50 shadow-md scale-105' 
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${step === i ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <s.icon size={20} />
                </div>
                <div>
                  <h4 className={`font-bold ${step === i ? 'text-blue-900' : 'text-slate-700'}`}>{s.title}</h4>
                  <p className="text-sm text-slate-500">{s.desc}</p>
                </div>
              </div>
            ))}
            <button onClick={nextStep} className="w-full py-3 bg-[#0a2540] text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg mt-4">
               {step === 3 ? 'Reset Process' : 'Next Step ->'}
            </button>
          </div>

          {/* Visualization */}
          <div className="bg-[#0f172a] rounded-[3rem] p-10 shadow-2xl min-h-[500px] relative flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950 opacity-50"></div>
            
            {/* Tree Structure */}
            <div className="relative z-10 flex flex-col items-center gap-12 w-full">
              
              {/* Root */}
              <motion.div 
                animate={{ 
                  scale: step === 3 ? 1.2 : 1, 
                  borderColor: step === 3 ? '#10b981' : '#334155',
                  boxShadow: step === 3 ? '0 0 30px rgba(16,185,129,0.5)' : 'none'
                }}
                className="w-24 h-24 rounded-full bg-slate-800 border-4 flex items-center justify-center text-white font-bold z-20 transition-colors"
              >
                ROOT
              </motion.div>

              {/* Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 400 400">
                <motion.path d="M 200 50 L 100 150" stroke={step >= 2 ? "#3b82f6" : "#334155"} strokeWidth="3" />
                <motion.path d="M 200 50 L 300 150" stroke={step >= 3 ? "#10b981" : "#334155"} strokeWidth="3" />
                <motion.path d="M 100 150 L 50 250" stroke={step >= 1 ? "#3b82f6" : "#334155"} strokeWidth="3" />
                <motion.path d="M 100 150 L 150 250" stroke="#334155" strokeWidth="3" />
              </svg>

              {/* Leaves */}
              <div className="flex justify-between w-full px-8">
                <motion.div 
                  animate={{ y: step === 0 ? [0, -10, 0] : 0, backgroundColor: step >= 1 ? '#3b82f6' : '#1e293b' }}
                  className="w-16 h-16 rounded-2xl border border-slate-700 flex items-center justify-center text-xs text-white font-mono transition-colors"
                >
                  {step >= 1 ? '0x9A' : 'DATA'}
                </motion.div>
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- KEY ROTATION COMPONENT ---
const KeyRotationComponent = ({ processor, currentKey, onKeyUpdate }) => {
  const [isRotating, setIsRotating] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentKey);
    alert("Key copied to clipboard!");
  };

  const rotate = async () => {
    setIsRotating(true);
    try {
      const data = await apiCall('/api/rotate-key', { method: 'POST', body: { processorId: processor.id } }, currentKey);
      const newKey = data.newKey || `av_${Math.random().toString(36).substring(2, 15)}`;
      onKeyUpdate(newKey);
      alert('Success: Key rotated securely. Please update your environment variables.');
    } catch (err) {
      alert(`Rotation Failed: ${err.message}`);
    } finally {
      setIsRotating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2 text-slate-800"><RotateCw className="w-5 h-5 text-purple-600"/> Key Rotation</h3>
        <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded font-bold">Active</span>
      </div>
      
      <div className="relative mb-4">
        <div className="bg-slate-50 p-3 rounded-lg text-xs font-mono text-slate-600 break-all border border-slate-100 pr-20 min-h-[40px] flex items-center">
          {showKey ? currentKey : '••••••••••••••••••••••••••••••'}
        </div>
        <div className="absolute right-2 top-1/2 -translate-x-1/2 flex gap-1">
          <button onClick={() => setShowKey(!showKey)} className="p-1.5 hover:bg-slate-200 rounded text-slate-500">
            {showKey ? <EyeOff size={14}/> : <Eye size={14}/>}
          </button>
          <button onClick={copyToClipboard} className="p-1.5 hover:bg-slate-200 rounded text-slate-500" title="Copy Key">
            <Copy size={14}/>
          </button>
        </div>
      </div>

      <button onClick={rotate} disabled={isRotating} className="w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-slate-800 flex justify-center items-center gap-2">
        {isRotating ? <RefreshCw className="animate-spin w-4 h-4"/> : 'Rotate Key Now'}
      </button>
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
    const savedPrivacy = localStorage.getItem('privacyAccepted_v7');
    if (savedPrivacy === 'true') setPrivacyAccepted(true);
    const savedKey = localStorage.getItem('auditorApiKey');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handlePrivacyAccept = () => {
    localStorage.setItem('privacyAccepted_v7', 'true');
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
      console.error("Dashboard Fetch Error:", error);
      alert(`Connection Failed: ${error.message}. Ensure backend is running and key is valid.`);
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
      
      alert('Event Logged Successfully to Render!');
      setStats(prev => ({...prev, totalEvents: prev.totalEvents + 1}));
    } catch (error) {
      console.error("Log Event Error:", error);
      alert(`Error Logging Event: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const Navbar = ({ activeTab, setActiveTab }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    return (
      <header className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-8 h-8 bg-[#635bff] rounded-lg flex items-center justify-center text-white"><ShieldCheck size={20}/></div>
            <span className="font-bold text-slate-900 text-xl">Auditor Veritas</span>
          </div>
          <nav className="hidden md:flex gap-8 items-center">
            <button onClick={() => setActiveTab('home')} className={`text-sm font-medium ${activeTab === 'home' ? 'text-[#635bff]' : 'text-slate-600'} hover:text-[#635bff]`}>Product</button>
            <button onClick={() => setActiveTab('create')} className={`text-sm font-medium ${activeTab === 'create' ? 'text-[#635bff]' : 'text-slate-600'} hover:text-[#635bff]`}>Developers</button>
            <button onClick={() => setActiveTab('dashboard')} className="bg-[#0a2540] text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-slate-800">Sign In</button>
          </nav>
          <button className="md:hidden text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X /> : <Menu />}</button>
        </div>
        {mobileMenuOpen && (
          <div className="absolute top-20 left-0 w-full bg-white border-b border-slate-200 p-6 flex flex-col gap-4 md:hidden shadow-xl">
             <button onClick={() => {setActiveTab('home'); setMobileMenuOpen(false)}} className="text-left font-bold text-slate-700">Product</button>
             <button onClick={() => {setActiveTab('dashboard'); setMobileMenuOpen(false)}} className="w-full bg-[#0a2540] text-white py-3 rounded-xl">Sign In</button>
          </div>
        )}
      </header>
    );
  };

  // --- RENDER ---
  if (!privacyAccepted) {
    return <PrivacyPage onAccept={handlePrivacyAccept} />;
  }

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#635bff] selection:text-white flex flex-col">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 pt-20">
        {activeTab === 'home' && (
          <>
            <div className="relative bg-[#0a2540] text-white min-h-[90vh] flex items-center overflow-hidden">
              <AnimatedBackground />
              <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-[#00d4ff] text-sm font-medium border border-white/10 backdrop-blur-sm">
                    <Sparkles className="w-4 h-4" /><span>System Version 1.2 Live</span>
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

            <InteractiveMerkleSection />
            
            <div className="max-w-7xl mx-auto px-6 py-24">
              <div className="text-center mb-16"><h2 className="text-4xl font-bold text-slate-900">Core Architecture</h2><p className="text-slate-500 mt-4 text-lg">Swipe to explore our core security nodes.</p></div>
              <Carousel3D /> 
            </div>
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
                 <button onClick={fetchDashboard} disabled={isLoading} className="w-full bg-[#0a2540] text-white p-4 rounded-xl font-bold hover:bg-slate-800 transition-colors">{isLoading ? <RefreshCw className="animate-spin mx-auto"/> : 'Connect'}</button>
               </div>
             ) : (
               <div className="max-w-6xl mx-auto animate-fade-in-up">
                 <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">{processor.companyName}</h1>
                    <button onClick={() => setProcessor(null)} className="text-red-500 flex items-center gap-2 hover:bg-red-50 px-4 py-2 rounded-lg transition"><LogOut size={18}/> Sign Out</button>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"><h3 className="font-bold text-slate-700">Total Events</h3><p className="text-3xl font-bold text-slate-900">{stats.totalEvents}</p></div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"><h3 className="font-bold text-slate-700">Usage</h3><p className="text-3xl font-bold text-slate-900">{stats.monthlyEvents}</p></div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"><h3 className="font-bold text-slate-700">Status</h3><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-sm font-bold">Active</span></div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Zap className="text-amber-500"/> Log Event</h3>
                      <form onSubmit={handleLogEvent} className="space-y-4">
                        <input type="text" placeholder="Event Type (e.g. login)" className="w-full p-3 border rounded-xl" value={eventData.event_type} onChange={e => setEventData({...eventData, event_type: e.target.value})} required />
                        <textarea placeholder='JSON Data' className="w-full p-3 border rounded-xl font-mono text-sm" rows="3" value={eventData.event_data} onChange={e => setEventData({...eventData, event_data: e.target.value})} required />
                        <input type="text" placeholder="User ID (Auto-Hashed)" className="w-full p-3 border rounded-xl" value={eventData.user_identifier} onChange={e => setEventData({...eventData, user_identifier: e.target.value})} />
                        <button type="submit" disabled={isLoading} className="px-8 py-3 bg-[#635bff] text-white rounded-xl font-bold hover:bg-[#5449e3]">Log Event</button>
                      </form>
                    </div>
                    <KeyRotationComponent processor={processor} currentKey={apiKey} onKeyUpdate={k => {setApiKey(k); localStorage.setItem('auditorApiKey', k);}} />
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