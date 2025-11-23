import React, { useState, useEffect } from 'react';
import './App.css';
import CryptoJS from 'crypto-js';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Components
import AnimatedBackground from './components/AnimatedBackground'; 
import PhoneDemo from './components/PhoneDemo'; 
import CoreArchitecture from './components/CoreArchitecture'; 
import PrivacyPage from './components/PrivacyPage'; 
import IntegrityEngine from './components/IntegrityEngine';
import CreateProcessor from './components/CreateProcessor'; 
import Footer from './components/Footer';
import EnterpriseForm from './components/EnterpriseForm';
import CodeIntegration from './components/CodeIntegration'; 
import UseCases from './components/UseCases'; 

import { ShieldCheck, Lock, Zap, LogOut, Menu, X, Sparkles, RotateCw, RefreshCw, Copy, Eye, EyeOff } from 'lucide-react';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const API_BASE_URL = 'https://auditor-veritas-mvp.onrender.com';

const apiCall = async (endpoint, options = {}, apiKey = '') => {
  const config = { headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, ...options.headers }, ...options };
  if (options.body) config.body = JSON.stringify(options.body);
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `HTTP error! status: ${response.status}`);
  return data;
};

const HeroTypewriter = ({ text, delay = 50 }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);
  return <p className="text-base md:text-lg text-slate-300 max-w-xl min-h-[3rem] md:min-h-[3.5rem] leading-relaxed">{currentText}<span className="inline-block w-0.5 h-4 md:h-5 ml-1 bg-[#00d4ff] align-middle animate-cursor-blink"></span></p>;
};

const KeyRotationComponent = ({ processor, currentKey, onKeyUpdate }) => {
  const [isRotating, setIsRotating] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const copyToClipboard = () => { navigator.clipboard.writeText(currentKey); alert("Key copied!"); };
  const rotate = async () => {
    setIsRotating(true);
    try {
      const data = await apiCall('/api/rotate-key', { method: 'POST', body: { processorId: processor.id } }, currentKey);
      onKeyUpdate(data.newKey);
      alert('Key rotated successfully.');
    } catch (err) { alert(`Failed: ${err.message}`); } 
    finally { setIsRotating(false); }
  };
  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex justify-between mb-4"><h3 className="font-bold flex items-center gap-2 text-slate-800 text-sm"><RotateCw className="w-4 h-4 text-purple-600"/> Key Rotation</h3><span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-1 rounded font-bold uppercase">Active</span></div>
      <div className="relative mb-4">
        <div className="bg-slate-50 p-3 rounded-lg text-xs font-mono text-slate-600 break-all border border-slate-100 pr-16 min-h-[40px] flex items-center">{showKey ? currentKey : '••••••••••••••••••'}</div>
        <div className="absolute right-2 top-1/2 -translate-x-1/2 flex gap-1"><button onClick={() => setShowKey(!showKey)} className="p-1.5 hover:bg-slate-200 rounded text-slate-500"><Eye size={14}/></button><button onClick={copyToClipboard} className="p-1.5 hover:bg-slate-200 rounded text-slate-500"><Copy size={14}/></button></div>
      </div>
      <button onClick={rotate} disabled={isRotating} className="w-full bg-slate-900 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 flex justify-center items-center gap-2">{isRotating ? <RefreshCw className="animate-spin w-3 h-3"/> : 'Rotate Key Now'}</button>
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showFooterPrivacy, setShowFooterPrivacy] = useState(false);
  const [theme, setTheme] = useState('theme-dark'); 
  const [processor, setProcessor] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [eventData, setEventData] = useState({ event_type: '', event_data: '{}', user_identifier: '' });
  const [stats, setStats] = useState({ totalEvents: 0, monthlyEvents: 0 });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedPrivacy = localStorage.getItem('privacyAccepted_v11');
    if (savedPrivacy === 'true') setPrivacyAccepted(true);
    const savedKey = localStorage.getItem('auditorApiKey');
    if (savedKey) setApiKey(savedKey);
  }, []);

  useEffect(() => {
    if (activeTab !== 'home') { setTheme('theme-light'); return; }
    const sections = [
      { id: 'hero-section', theme: 'theme-dark' },
      { id: 'code-integration', theme: 'theme-light' },
      { id: 'use-cases', theme: 'theme-dark' }, 
      { id: 'merkle', theme: 'theme-light' }, 
      { id: 'architecture', theme: 'theme-dark' } 
    ];
    const triggers = sections.map(section => ScrollTrigger.create({ trigger: `#${section.id}`, start: "top center", end: "bottom center", onEnter: () => setTheme(section.theme), onEnterBack: () => setTheme(section.theme) }));
    return () => triggers.forEach(t => t.kill());
  }, [activeTab]);

  const handlePrivacyAccept = () => { localStorage.setItem('privacyAccepted_v11', 'true'); setPrivacyAccepted(true); };
  const openPrivacy = () => setShowFooterPrivacy(true);
  
  const fetchDashboard = async () => {
    if (!apiKey) return alert("Please enter API Key");
    setIsLoading(true);
    try {
      const data = await apiCall('/api/dashboard', { method: 'GET' }, apiKey);
      setProcessor(data.processor || { companyName: 'Connected Node' });
      setStats(data.stats || { totalEvents: 0, monthlyEvents: 0 });
      localStorage.setItem('auditorApiKey', apiKey);
    } catch (error) { alert(`Connection Failed: ${error.message}`); } 
    finally { setIsLoading(false); }
  };

  const handleLogEvent = async (e) => {
    e.preventDefault();
    if (stats.totalEvents >= 100) return alert("⚠️ Usage Limit Reached (100 Events).\nPlease upgrade to Enterprise.");
    setIsLoading(true);
    try {
      let hashedUser = eventData.user_identifier;
      if (eventData.user_identifier) hashedUser = CryptoJS.SHA256(eventData.user_identifier).toString();
      await apiCall('/api/events', { method: 'POST', body: { ...eventData, user_identifier: hashedUser, event_data: JSON.parse(eventData.event_data) } }, apiKey);
      alert('Event Logged!');
      setStats(prev => ({...prev, totalEvents: prev.totalEvents + 1}));
      setEventData({ event_type: '', event_data: '{}', user_identifier: '' });
    } catch (error) { alert(`Error: ${error.message}`); } 
    finally { setIsLoading(false); }
  };

  const Navbar = ({ activeTab, setActiveTab }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    return (
      <header className="fixed w-full top-0 z-50 bg-white/5 backdrop-blur-md border-b border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-8 h-8 bg-[#635bff] rounded-lg flex items-center justify-center text-white"><ShieldCheck size={20}/></div>
            <span className="font-bold adaptive-text text-lg md:text-xl">Auditor Veritas</span>
          </div>
          <nav className="hidden md:flex gap-1 items-center p-1 rounded-xl">
            {['home', 'create', 'pricing', 'dashboard'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'adaptive-text hover:bg-white/10'}`}>{tab === 'pricing' ? 'Enterprise' : tab}</button>
            ))}
          </nav>
          <button className="md:hidden adaptive-text" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X /> : <Menu />}</button>
        </div>
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-slate-900 border-b border-slate-800 p-6 flex flex-col gap-4 md:hidden shadow-xl h-screen">
             {['home', 'create', 'pricing', 'dashboard'].map((tab) => (
               <button key={tab} onClick={() => {setActiveTab(tab); setMobileMenuOpen(false)}} className="text-left font-bold text-white capitalize py-3 text-lg border-b border-slate-800">{tab === 'pricing' ? 'Enterprise' : tab}</button>
             ))}
          </div>
        )}
      </header>
    );
  };

  if (!privacyAccepted) return <PrivacyPage onAccept={handlePrivacyAccept} />;

  return (
    <div className={`min-h-screen font-sans selection:bg-[#635bff] selection:text-white flex flex-col transition-colors duration-700 ${theme}`}>
      <AnimatePresence>{showFooterPrivacy && <PrivacyPage isFooterView={true} onClose={() => setShowFooterPrivacy(false)} />}</AnimatePresence>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 pt-0">
        {activeTab === 'home' && (
          <>
            <div id="hero-section" className="relative bg-[#0a2540] text-white min-h-[100vh] flex items-center pt-24 pb-12 md:pt-20 md:pb-20 overflow-hidden">
              <AnimatedBackground />
              <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                 <div className="space-y-6 md:space-y-8 animate-fade-in-up pt-8 md:pt-0 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 bg-[#ffffff15] px-3 py-1 rounded-full text-[#00d4ff] text-xs md:text-sm font-medium border border-white/5 backdrop-blur-md justify-center lg:justify-start">
                        <Sparkles className="w-3 h-3 md:w-4 md:h-4" /><span>System Version 1.2 Live</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]">Compliance <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] via-[#635bff] to-[#00d4ff] animate-text-gradient bg-[length:200%_auto]">Engineered.</span></h1>
                    <div className="flex justify-center lg:justify-start"><HeroTypewriter text="The interactive demo on the right visualizes our real-time SHA-256 hashing and Merkle Tree construction." delay={30} /></div>
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
                        <button onClick={() => setActiveTab('create')} className="px-6 py-3 md:px-8 md:py-4 rounded-full bg-[#635bff] hover:bg-[#5449e3] font-bold shadow-lg text-white transition-transform hover:scale-105 text-sm md:text-base">Start Integration</button>
                        <button onClick={() => setActiveTab('pricing')} className="px-6 py-3 md:px-8 md:py-4 rounded-full bg-white/10 hover:bg-white/20 font-bold backdrop-blur-sm text-white border border-white/10 text-sm md:text-base">Enterprise Access</button>
                    </div>
                 </div>
                 <div id="demo" className="flex justify-center w-full mt-4 lg:mt-0"><PhoneDemo /></div>
              </div>
            </div>
            <div id="code-integration" className="bg-white"><CodeIntegration /></div>
            <div id="use-cases" className="bg-[#0a2540]"><UseCases /></div>
            <div id="merkle" className="bg-slate-50 py-12 md:py-20"><IntegrityEngine /></div>
            <div id="architecture" className="bg-[#0f172a]"><CoreArchitecture /></div>
          </>
        )}
        
        {activeTab === 'pricing' && <div id="pricing" className="pt-24 md:pt-32 px-4 md:px-6 pb-20 bg-slate-50 min-h-screen text-slate-900"><EnterpriseForm /></div>}
        
        {activeTab === 'dashboard' && (
          <div className="p-4 md:p-6 min-h-screen bg-slate-50 pt-24 md:pt-32 text-slate-900">
             {!processor ? (
               <div className="max-w-md mx-auto bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100 text-center animate-fade-in-up">
                 <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6"><Lock className="w-6 h-6 md:w-8 md:h-8 text-slate-400" /></div>
                 <h2 className="text-xl md:text-2xl font-bold mb-2 text-slate-900">Secure Login</h2>
                 <input type="text" placeholder="av_live_..." className="w-full p-3 md:p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4 font-mono outline-none focus:ring-2 focus:ring-[#635bff]" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                 <button onClick={fetchDashboard} disabled={isLoading} className="w-full bg-[#0a2540] text-white p-3 md:p-4 rounded-xl font-bold hover:bg-slate-800 transition-colors">{isLoading ? <RefreshCw className="animate-spin mx-auto"/> : 'Connect'}</button>
               </div>
             ) : (
               <div className="max-w-6xl mx-auto animate-fade-in-up">
                 {/* Dashboard Content (Same as before, but adjusted padding) */}
                 <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{processor.companyName}</h1>
                    <button onClick={() => setProcessor(null)} className="text-red-500 flex items-center gap-2 hover:bg-red-50 px-4 py-2 rounded-lg transition w-full md:w-auto justify-center"><LogOut size={18}/> Sign Out</button>
                 </div>
                 {/* ... Stats & Forms ... */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                    <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100"><h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Total Events</h3><p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalEvents}</p></div>
                    <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100"><h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Usage</h3><p className="text-3xl font-bold text-slate-900 mt-2">{stats.monthlyEvents} / 100</p></div>
                    <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100"><h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Status</h3><span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold mt-2 inline-block">System Active</span></div>
                 </div>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-100">
                      <h3 className="text-lg md:text-xl font-bold mb-6 flex items-center gap-2"><Zap className="text-amber-500"/> Log New Event</h3>
                      <form onSubmit={handleLogEvent} className="space-y-4">
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Event Type</label><input type="text" placeholder="e.g. user.login" className="w-full p-3 border border-slate-200 rounded-xl text-sm" value={eventData.event_type} onChange={e => setEventData({...eventData, event_type: e.target.value})} required /></div>
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">JSON Payload</label><textarea placeholder='{"ip": "1.1.1.1"}' className="w-full p-3 border border-slate-200 rounded-xl font-mono text-sm h-24" value={eventData.event_data} onChange={e => setEventData({...eventData, event_data: e.target.value})} required /></div>
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">User ID (Auto-Hashed)</label><input type="text" placeholder="user@example.com" className="w-full p-3 border border-slate-200 rounded-xl text-sm" value={eventData.user_identifier} onChange={e => setEventData({...eventData, user_identifier: e.target.value})} /></div>
                        <button type="submit" disabled={isLoading} className="w-full bg-[#635bff] text-white py-3 rounded-xl font-bold hover:bg-[#5449e3] transition-all shadow-lg">{isLoading ? 'Processing...' : 'Log Secure Event'}</button>
                      </form>
                    </div>
                    <KeyRotationComponent processor={processor} currentKey={apiKey} onKeyUpdate={k => {setApiKey(k); localStorage.setItem('auditorApiKey', k);}} />
                 </div>
               </div>
             )}
          </div>
        )}

        {activeTab === 'create' && <div className="pt-24 md:pt-32 p-4 md:p-6 flex justify-center bg-slate-50 min-h-screen text-slate-900"><CreateProcessor /></div>}
      </main>

      <Footer onOpenPrivacy={openPrivacy} />
    </div>
  );
}

export default App;