import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import CryptoJS from 'crypto-js';
import { motion, AnimatePresence } from 'framer-motion'; // FIX: Lade till AnimatePresence
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Components
import AnimatedBackground from './components/AnimatedBackground'; 
import PhoneDemo from './components/PhoneDemo'; 
import Carousel3D from './components/Carousel3D'; 
import PrivacyPage from './components/PrivacyPage'; 
import InteractiveMerkle from './components/InteractiveMerkle';
import CreateProcessor from './components/CreateProcessor'; 
import Footer from './components/Footer';

import { 
  ShieldCheck, BarChart3, FileText, Check, Lock, Zap, LogOut, 
  Key, Database, Menu, X, Sparkles, RotateCw, RefreshCw, Copy, Eye, EyeOff
} from 'lucide-react';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const API_BASE_URL = 'https://auditor-veritas-mvp.onrender.com';

// ... (apiCall och KeyRotationComponent är oförändrade, behåll dem som de var) ...
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
      alert('Success: Key rotated securely.');
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
          <button onClick={() => setShowKey(!showKey)} className="p-1.5 hover:bg-slate-200 rounded text-slate-500"><Eye size={14}/></button>
          <button onClick={() => {navigator.clipboard.writeText(currentKey); alert("Copied!");}} className="p-1.5 hover:bg-slate-200 rounded text-slate-500"><Copy size={14}/></button>
        </div>
      </div>
      <button onClick={rotate} disabled={isRotating} className="w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-slate-800 flex justify-center items-center gap-2">
        {isRotating ? <RefreshCw className="animate-spin w-4 h-4"/> : 'Rotate Key Now'}
      </button>
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  // NYTT: State för att visa privacy från footer
  const [showFooterPrivacy, setShowFooterPrivacy] = useState(false);
  
  const [processor, setProcessor] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [eventData, setEventData] = useState({ event_type: '', event_data: '{}', user_identifier: '' });
  const [stats, setStats] = useState({ totalEvents: 0, monthlyEvents: 0 });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedPrivacy = localStorage.getItem('privacyAccepted_final_v9');
    if (savedPrivacy === 'true') setPrivacyAccepted(true);
    const savedKey = localStorage.getItem('auditorApiKey');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handlePrivacyAccept = () => {
    localStorage.setItem('privacyAccepted_final_v9', 'true');
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
      alert(`Connection Failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogEvent = async (e) => {
    e.preventDefault();
    if (stats.totalEvents >= 100) {
      alert("⚠️ Usage Limit Reached (100 Events).\nPlease upgrade to Professional Plan.");
      return;
    }
    setIsLoading(true);
    try {
      let hashedUser = eventData.user_identifier;
      if (eventData.user_identifier) hashedUser = CryptoJS.SHA256(eventData.user_identifier).toString();
      await apiCall('/api/events', { method: 'POST', body: { ...eventData, user_identifier: hashedUser, event_data: JSON.parse(eventData.event_data) } }, apiKey);
      alert('Event Logged Successfully!');
      setStats(prev => ({...prev, totalEvents: prev.totalEvents + 1}));
    } catch (error) {
      alert(`Error: ${error.message}`);
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
            <button onClick={() => setActiveTab('pricing')} className={`text-sm font-medium ${activeTab === 'pricing' ? 'text-[#635bff]' : 'text-slate-600'} hover:text-[#635bff]`}>Pricing</button>
            <button onClick={() => setActiveTab('create')} className={`text-sm font-medium ${activeTab === 'create' ? 'text-[#635bff]' : 'text-slate-600'} hover:text-[#635bff]`}>Developers</button>
            <button onClick={() => setActiveTab('dashboard')} className="bg-[#0a2540] text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-slate-800">Sign In</button>
          </nav>
          <button className="md:hidden text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X /> : <Menu />}</button>
        </div>
        {mobileMenuOpen && (
          <div className="absolute top-20 left-0 w-full bg-white border-b border-slate-200 p-6 flex flex-col gap-4 md:hidden shadow-xl">
             <button onClick={() => {setActiveTab('home'); setMobileMenuOpen(false)}} className="text-left font-bold text-slate-700">Product</button>
             <button onClick={() => {setActiveTab('pricing'); setMobileMenuOpen(false)}} className="text-left font-bold text-slate-700">Pricing</button>
             <button onClick={() => {setActiveTab('dashboard'); setMobileMenuOpen(false)}} className="w-full bg-[#0a2540] text-white py-3 rounded-xl">Sign In</button>
          </div>
        )}
      </header>
    );
  };

  // --- RENDER ---
  // 1. Visa Gate om inte accepterat
  if (!privacyAccepted) return <PrivacyPage onAccept={handlePrivacyAccept} />;

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#635bff] selection:text-white flex flex-col">
      
      {/* 2. Visa "Read Only" Privacy Modal om man klickar i footern */}
      <AnimatePresence>
        {showFooterPrivacy && (
          <PrivacyPage 
            isFooterView={true} 
            onClose={() => setShowFooterPrivacy(false)} 
          />
        )}
      </AnimatePresence>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 pt-20">
        {activeTab === 'home' && (
          <>
            <div className="relative bg-[#0a2540] text-white min-h-[90vh] flex items-center overflow-hidden">
              <AnimatedBackground />
              <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-[#00d4ff] text-sm font-medium border border-white/10 backdrop-blur-sm"><Sparkles className="w-4 h-4" /><span>System Version 1.2 Live</span></div>
                  <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.1]">Compliance <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#635bff]">Engineered.</span></h1>
                  <p className="text-lg text-slate-300 max-w-xl">The interactive demo on the right visualizes our real-time SHA-256 hashing and Merkle Tree construction.</p>
                  <div className="flex gap-4">
                    <button onClick={() => setActiveTab('create')} className="px-8 py-4 rounded-full bg-[#635bff] hover:bg-[#5449e3] font-bold shadow-lg transition-transform hover:scale-105">Start Integration</button>
                    <button onClick={() => setActiveTab('pricing')} className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 font-bold backdrop-blur-sm">View Pricing</button>
                  </div>
                </div>
                {/* Lade till ID för scroll-länk */}
                <div id="demo" className="flex justify-center"><PhoneDemo /></div>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-b from-transparent to-white pointer-events-none" />
            </div>
            
            {/* Lade till ID för scroll-länk */}
            <div id="merkle"><InteractiveMerkle /></div>
            
            <div id="architecture" className="max-w-7xl mx-auto px-6 py-24">
              <div className="text-center mb-16"><h2 className="text-4xl font-bold text-slate-900">Core Architecture</h2><p className="text-slate-500 mt-4 text-lg">Swipe to explore our core security nodes.</p></div>
              <Carousel3D /> 
            </div>
          </>
        )}

        {activeTab === 'pricing' && (
           <div id="pricing" className="pt-32 px-6 max-w-7xl mx-auto pb-20">
             <div className="text-center mb-16"><h2 className="text-4xl font-bold text-slate-900">Transparent Pricing</h2><p className="text-slate-500">Enterprise security at every scale.</p></div>
             <div className="grid md:grid-cols-3 gap-8">
               <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg flex flex-col">
                 <h3 className="text-2xl font-bold mb-2">Free</h3><p className="text-4xl font-black mb-6">$0<span className="text-base text-slate-400 font-normal">/mo</span></p>
                 <ul className="space-y-3 mb-8 flex-1">{['100 Events / Month', 'Audit Logs', 'GDPR Compliance'].map(f=><li key={f} className="flex gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-green-500"/>{f}</li>)}</ul>
                 <button onClick={()=>setActiveTab('create')} className="w-full py-3 rounded-xl font-bold bg-slate-100 text-slate-900 hover:bg-slate-200">Get Started</button>
               </div>
               <div className="bg-white p-8 rounded-3xl border-2 border-[#635bff] shadow-2xl transform scale-105 flex flex-col relative">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#635bff] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Most Popular</div>
                 <h3 className="text-2xl font-bold mb-2">Professional</h3><p className="text-4xl font-black mb-6">$49<span className="text-base text-slate-400 font-normal">/mo</span></p>
                 <ul className="space-y-3 mb-8 flex-1">{['50,000 Events / Month', 'Advanced Analytics', 'Priority Support', 'Key Rotation API'].map(f=><li key={f} className="flex gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-[#635bff]"/>{f}</li>)}</ul>
                 <button className="w-full py-3 rounded-xl font-bold bg-[#635bff] text-white hover:bg-[#5449e3] cursor-not-allowed opacity-80">Select Plan</button>
               </div>
               <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg flex flex-col">
                 <h3 className="text-2xl font-bold mb-2">Enterprise</h3><p className="text-4xl font-black mb-6">$199<span className="text-base text-slate-400 font-normal">/mo</span></p>
                 <ul className="space-y-3 mb-8 flex-1">{['Custom Events Limit', 'Dedicated Support', 'SLA Guarantee', 'Custom Integrations'].map(f=><li key={f} className="flex gap-2 text-sm text-slate-600"><Check className="w-4 h-4 text-green-500"/>{f}</li>)}</ul>
                 <button className="w-full py-3 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 cursor-not-allowed opacity-80">Contact Sales</button>
               </div>
             </div>
           </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="p-6 min-h-screen bg-slate-50 pt-32">
             {!processor ? (
               <div className="max-w-md mx-auto bg-white p-10 rounded-3xl shadow-xl border border-slate-100 text-center animate-fade-in-up">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6"><Lock className="w-8 h-8 text-slate-400" /></div>
                 <h2 className="text-2xl font-bold mb-2 text-slate-900">Secure Login</h2>
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
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"><h3 className="font-bold text-slate-700">Usage</h3><p className="text-3xl font-bold text-slate-900">{stats.monthlyEvents} / 100</p></div>
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

      <Footer onOpenPrivacy={() => setShowFooterPrivacy(true)} />
    </div>
  );
}

export default App;