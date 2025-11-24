import React, { useState, useEffect } from 'react';
import './App.css';
import CryptoJS from 'crypto-js';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// --- KOMPONENTER ---
import InteractiveFeatureSection from './components/InteractiveFeatureSection'; 
import DashboardPreview from './components/DashboardPreview'; 
import CoreArchitecture from './components/CoreArchitecture'; 
import IntegrityEngine from './components/IntegrityEngine';
import UseCases from './components/UseCases';
import { InteractiveNeuralNetwork } from './components/SharedBackgrounds'; 

import AnimatedBackground from './components/AnimatedBackground'; 
import PrivacyPage from './components/PrivacyPage'; 
import CreateProcessor from './components/CreateProcessor'; 
import Footer from './components/Footer';
import EnterpriseForm from './components/EnterpriseForm';
import CodeIntegration from './components/CodeIntegration'; 
import Dashboard from './components/Dashboard'; 

// ICONS
import { ShieldCheck, Lock, LogOut, Menu, X, Sparkles, RotateCw, RefreshCw, Copy, Eye, Cookie, Server } from 'lucide-react';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const API_BASE_URL = 'https://auditor-veritas-mvp.onrender.com';

// --- API HELPER ---
const apiCall = async (endpoint, options = {}, apiKey = '') => {
  const config = { headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, ...options.headers }, ...options };
  if (options.body) config.body = JSON.stringify(options.body);
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `HTTP error! status: ${response.status}`);
  return data;
};

// --- MICRO COMPONENTS ---
const HeroTypewriter = ({ text, delay = 30 }) => {
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
  return <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto min-h-[3rem] leading-relaxed">{currentText}<span className="inline-block w-0.5 h-4 ml-1 bg-[#00d4ff] align-middle animate-cursor-blink"></span></p>;
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

// --- NAVBAR ---
const Navbar = ({ activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHomePage = activeTab === 'home';
  const navBackgroundClass = isHomePage && !isScrolled 
    ? 'bg-transparent border-transparent' 
    : 'bg-[#020617]/90 backdrop-blur-xl border-white/5 shadow-lg';

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 border-b ${navBackgroundClass}`}>
      <div className="absolute inset-0 opacity-50 pointer-events-none overflow-hidden">
        <InteractiveNeuralNetwork />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]">
             <ShieldCheck size={20}/>
          </div>
          <span className="font-bold text-white text-lg md:text-xl tracking-tight">Auditor Veritas</span>
        </div>
        
        <nav className="hidden md:flex gap-1 items-center p-1 rounded-xl">
          {['home', 'create', 'pricing', 'dashboard'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                activeTab === tab 
                  ? 'bg-white/10 text-white shadow-sm border border-white/10' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'pricing' ? 'Enterprise' : tab}
            </button>
          ))}
        </nav>
        
        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-[#020617] border-b border-slate-800 p-6 flex flex-col gap-4 md:hidden shadow-xl h-screen z-50">
           {['home', 'create', 'pricing', 'dashboard'].map((tab) => (
             <button 
               key={tab} 
               onClick={() => {setActiveTab(tab); setMobileMenuOpen(false)}} 
               className="text-left font-bold text-white capitalize py-3 text-lg border-b border-slate-800"
             >
               {tab === 'pricing' ? 'Enterprise' : tab}
             </button>
           ))}
        </div>
      )}
    </header>
  );
};

// --- MAIN APP ---
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
  
  // DASHBOARD STATES
  const [recentLogs, setRecentLogs] = useState([]);
  const [chartData, setChartData] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    const savedPrivacy = localStorage.getItem('privacyAccepted_v11');
    if (savedPrivacy === 'true') setPrivacyAccepted(true);
    const savedKey = localStorage.getItem('auditorApiKey');
    if (savedKey) setApiKey(savedKey);
  }, []);

  // --- SCROLL THEME LOGIC ---
  useEffect(() => {
    window.scrollTo(0, 0);

    if (activeTab !== 'home') { setTheme('theme-light'); return; }
    
    const sections = [
      { id: 'hero-section', theme: 'theme-dark' },       
      { id: 'demo-section', theme: 'theme-light' },
      { id: 'dashboard-preview', theme: 'theme-dark' },
      { id: 'code-integration', theme: 'theme-light' },  
      { id: 'use-cases', theme: 'theme-dark' },
      { id: 'merkle', theme: 'theme-light' },            
      { id: 'architecture', theme: 'theme-dark' }        
    ];

    const triggers = sections.map(section => 
      ScrollTrigger.create({ 
        trigger: `#${section.id}`, 
        start: "top center", 
        end: "bottom center", 
        onEnter: () => setTheme(section.theme), 
        onEnterBack: () => setTheme(section.theme) 
      })
    );
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
    } catch (error) { 
      alert(`Connection Failed: ${error.message}`); 
    } finally { 
      setIsLoading(false); 
    } 
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
      
      setStats(prev => ({...prev, totalEvents: prev.totalEvents + 1, monthlyEvents: prev.monthlyEvents + 1}));
      
      const newLog = {
        ...eventData,
        user_identifier: hashedUser || 'Anonymous',
        timestamp: new Date().toISOString(),
        status: 'success'
      };
      setRecentLogs(prev => [newLog, ...prev].slice(0, 10));
      
      // Uppdatera grafen
      setChartData(prev => [...prev.slice(1), (prev[prev.length-1] || 10) + Math.floor(Math.random() * 20)]);

      setEventData({ event_type: '', event_data: '{}', user_identifier: '' }); 
    } catch (error) { 
      alert(`Error: ${error.message}`); 
    } finally { 
      setIsLoading(false); 
    } 
  };

  if (!privacyAccepted) return <PrivacyPage onAccept={handlePrivacyAccept} />;

  return (
    <div className={`min-h-screen font-sans selection:bg-[#635bff] selection:text-white flex flex-col transition-colors duration-700 ${theme}`}>
      <AnimatePresence>{showFooterPrivacy && <PrivacyPage isFooterView={true} onClose={() => setShowFooterPrivacy(false)} />}</AnimatePresence>
      
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 pt-0">
        {activeTab === 'home' && (
          <>
            <div id="hero-section" className="relative bg-[#020617] text-white pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden text-center z-10">
              <AnimatedBackground />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-blob mix-blend-screen pointer-events-none"></div>
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-[80px] animate-blob animation-delay-2000 mix-blend-screen pointer-events-none"></div>

              <div className="relative z-10 max-w-5xl mx-auto px-4">
                 <div className="inline-flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-full text-blue-400 text-xs md:text-sm font-bold border border-blue-500/20 backdrop-blur-md mb-8">
                     <Sparkles className="w-3 h-3" /><span>System Version 2.0 Live</span>
                 </div>
                 
                 <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
                   Compliance <br/>
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-white to-blue-600 bg-[length:200%_auto] animate-shine">
                     Engineered for Truth.
                   </span>
                 </h1>
                 
                 <HeroTypewriter text="The interactive standard for data integrity. Scroll down to see how our engine processes, verifies, and secures your data in real-time." delay={30} />
                 
                 <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                    <button onClick={() => setActiveTab('create')} className="px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 font-bold shadow-[0_0_30px_rgba(37,99,235,0.3)] text-white transition-all hover:scale-105">
                      Start Integration
                    </button>
                    <button onClick={() => setActiveTab('pricing')} className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 font-bold backdrop-blur-sm text-white border border-white/10">
                      Enterprise Access
                    </button>
                 </div>

                 <div className="pt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500 font-medium">
                    <div className="flex items-center gap-2"><Server size={14} className="text-emerald-500"/> EU Data Residency</div>
                    <div className="flex items-center gap-2"><Cookie size={14} className="text-emerald-500"/> No Trackers</div>
                    <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-500"/> GDPR Compliant</div>
                 </div>
              </div>
            </div>

            <div id="demo-section" className="relative z-20">
               <InteractiveFeatureSection />
            </div>

            <div id="dashboard-preview">
               <DashboardPreview />
            </div>
            
            <div id="code-integration" className="bg-white">
              <CodeIntegration setActiveTab={setActiveTab} />
            </div>
            
            <div id="use-cases">
               <UseCases />
            </div>
            
            <div id="merkle">
               <IntegrityEngine />
            </div>
            
            <div id="architecture">
               <CoreArchitecture />
            </div>
          </>
        )}
        
        {activeTab === 'pricing' && <div id="pricing" className="pt-24 md:pt-32 px-4 md:px-6 pb-20 bg-slate-50 min-h-screen text-slate-900"><EnterpriseForm /></div>}
        
        {activeTab === 'dashboard' && (
          <div className="min-h-screen bg-[#f7fafc] text-slate-900">
             {!processor ? (
               <div className="pt-32 pb-20 px-4 flex justify-center">
                 <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100 text-center animate-fade-in-up">
                   <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6"><Lock className="w-8 h-8 text-blue-500" /></div>
                   <h2 className="text-xl md:text-2xl font-bold mb-2 text-slate-900">Secure Console</h2>
                   <p className="text-slate-500 mb-6 text-sm">Enter your live API key to access real-time logs.</p>
                   <input type="text" placeholder="av_live_..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4 font-mono outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                   <button onClick={fetchDashboard} disabled={isLoading} className="w-full bg-[#0a2540] text-white p-4 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg">{isLoading ? <RefreshCw className="animate-spin mx-auto"/> : 'Connect'}</button>
                 </div>
               </div>
             ) : (
               <Dashboard 
                 processor={processor}
                 stats={stats}
                 apiKey={apiKey}
                 eventData={eventData}
                 setEventData={setEventData}
                 onLogEvent={handleLogEvent}
                 isLoading={isLoading}
                 recentLogs={recentLogs} 
                 chartData={chartData}
                 onLogout={() => setProcessor(null)}
                 KeyRotation={<KeyRotationComponent processor={processor} currentKey={apiKey} onKeyUpdate={k => {setApiKey(k); localStorage.setItem('auditorApiKey', k);}} />}
               />
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