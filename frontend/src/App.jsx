import React, { useState, useEffect } from 'react';
import './App.css';
import CryptoJS from 'crypto-js';
import { AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ShieldCheck, RotateCw, RefreshCw, Eye, Copy, AlertTriangle, Menu, X, Sparkles, Server, Cookie, Lock } from 'lucide-react';

// --- COMPONENTS ---
import InteractiveFeatureSection from './components/InteractiveFeatureSection'; 
import DashboardPreview from './components/DashboardPreview'; 
import CoreArchitecture from './components/CoreArchitecture'; 
import IntegrityEngine from './components/IntegrityEngine';
import UseCases from './components/UseCases';
import AnimatedBackground from './components/AnimatedBackground'; 
import PrivacyPage from './components/PrivacyPage'; 
import CreateProcessor from './components/CreateProcessor'; 
import Footer from './components/Footer';
import PricingPageStripe from './components/PricingPageStripe'; 
import CodeIntegration from './components/CodeIntegration'; 
import Dashboard from './components/Dashboard'; 
import IntegrityFocusPage from './components/IntegrityFocusPage';

// --- NEW MODALS ---
import SecurityPage from './components/SecurityPage'; 
import DocsModal from './components/DocsModal'; 

// --- CONFIG ---
const API_BASE_URL = 'https://auditor-veritas-mvp.onrender.com';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

// --- API HELPER ---
export const apiCall = async (endpoint, options = {}, apiKey = '') => {
  const config = { headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, ...options.headers }, ...options };
  if (options.body) config.body = JSON.stringify(options.body);
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || data.message || `Error ${response.status}`);
  return data;
};

// --- SUB-COMPONENTS ---

// Key Rotation Component (Passed to Dashboard)
const KeyRotationComponent = ({ processor, currentKey, onKeyUpdate, onRevoke }) => {
  const [isRotating, setIsRotating] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const rotate = async () => {
    if(!confirm("Rotate API Key? Your old key will stop working immediately. Update your .env variables.")) return;
    setIsRotating(true);
    try {
      const data = await apiCall('/api/keys/rotate', { method: 'POST' }, currentKey);
      onKeyUpdate(data.newApiKey);
      alert('Success: Key Rotated. Please update your environment variables immediately.');
    } catch (err) { alert(err.message); } 
    finally { setIsRotating(false); }
  };
  
  const revoke = async () => {
      try {
          await apiCall('/api/keys/revoke', { method: 'POST' }, currentKey);
          onRevoke(); 
      } catch (err) { alert(err.message); }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
      <div className="flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2 text-slate-800 text-sm"><RotateCw className="w-4 h-4 text-purple-600"/> Credential Management</h3>
          <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-1 rounded font-bold uppercase">Active</span>
      </div>
      <div className="relative">
        <div className="bg-slate-50 p-3 rounded-lg text-xs font-mono text-slate-600 break-all border border-slate-100 pr-16 min-h-[40px] flex items-center">
            {showKey ? currentKey : '••••••••••••••••••••••••••••••'}
        </div>
        <div className="absolute right-2 top-1/2 -translate-x-1/2 flex gap-1">
            <button onClick={() => setShowKey(!showKey)} className="p-1.5 hover:bg-slate-200 rounded text-slate-500"><Eye size={14}/></button>
            <button onClick={() => navigator.clipboard.writeText(currentKey)} className="p-1.5 hover:bg-slate-200 rounded text-slate-500"><Copy size={14}/></button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
          <button onClick={rotate} disabled={isRotating} className="bg-slate-900 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 flex justify-center items-center gap-2">
              {isRotating ? <RefreshCw className="animate-spin w-3 h-3"/> : 'Rotate Key'}
          </button>
          {!confirmRevoke ? (
              <button onClick={() => setConfirmRevoke(true)} className="bg-red-50 text-red-600 border border-red-100 py-2.5 rounded-xl text-xs font-bold hover:bg-red-100 flex justify-center items-center gap-2">
                  <AlertTriangle size={14}/> Revoke Access
              </button>
          ) : (
              <button onClick={revoke} className="bg-red-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-red-700 animate-pulse">
                  Confirm Revoke
              </button>
          )}
      </div>
    </div>
  );
};

// Navbar Component
const Navbar = ({ activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = activeTab === 'home';
  const navClass = isHome && !isScrolled ? 'bg-transparent border-transparent' : 'bg-[#020617]/90 backdrop-blur-xl border-white/5 shadow-lg';
  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'create', label: 'Get Started' },
    { id: 'integrity', label: 'Integrity' },
    { id: 'pricing', label: 'Enterprise' },
    { id: 'dashboard', label: 'Console' }
  ];

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 border-b ${navClass}`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
             <ShieldCheck size={20}/>
          </div>
          <span className="font-bold text-white text-lg tracking-tight">Auditor Veritas</span>
        </div>
        
        <nav className="hidden md:flex gap-1 items-center bg-white/5 p-1 rounded-xl border border-white/5 backdrop-blur-md">
          {tabs.map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        
        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-20 left-0 w-full bg-[#020617] border-b border-slate-800 p-6 flex flex-col gap-4 md:hidden shadow-2xl h-screen z-40">
           {tabs.map((tab) => (
             <button key={tab.id} onClick={() => {setActiveTab(tab.id); setMobileMenuOpen(false)}} className="text-left font-bold text-white py-4 text-xl border-b border-slate-800">
               {tab.label}
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
  
  // Modal States
  const [showSecurity, setShowSecurity] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [legalTab, setLegalTab] = useState('privacy'); 
  
  // Dashboard State
  const [processor, setProcessor] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ totalEvents: 0, monthlyEvents: 0 });
  const [recentLogs, setRecentLogs] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [eventData, setEventData] = useState({ event_type: '', event_data: '{}', user_identifier: '' });

  // Init
  useEffect(() => {
    const savedPrivacy = localStorage.getItem('av_privacy_v1');
    if (savedPrivacy === 'true') setPrivacyAccepted(true);
    const savedKey = localStorage.getItem('av_api_key');
    if (savedKey) setApiKey(savedKey);
  }, []);

  // GSAP SCROLL TRIGGER MANAGEMENT
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Kill old triggers to prevent memory leaks or ghost elements
    ScrollTrigger.getAll().forEach(t => t.kill());

    if (activeTab === 'home') { 
        // Small delay to ensure DOM is fully rendered before GSAP calculates positions
        const timer = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 100);
        return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // --- DASHBOARD ACTIONS ---
  const fetchDashboard = async () => { 
    if (!apiKey) return alert("Please enter API Key"); 
    setIsLoading(true); 
    try { 
      const data = await apiCall('/api/dashboard', { method: 'GET' }, apiKey); 
      setProcessor(data.processor); 
      setStats(data.stats);
      localStorage.setItem('av_api_key', apiKey); 
      
      // Load logs for preview
      const logs = await apiCall('/api/events/search?limit=15', { method: 'GET' }, apiKey);
      setRecentLogs(logs.events || []);
      
      // Mock chart data for MVP (Real implementation would aggregate logs)
      setChartData([...Array(10)].map(() => Math.floor(Math.random() * 50))); 
    } catch (error) { 
      alert(`Connection Failed: ${error.message}`); 
      setProcessor(null); 
    } finally { setIsLoading(false); } 
  };

  const handleLogEvent = async (e) => { 
    e.preventDefault(); 
    setIsLoading(true); 
    try { 
        // Hash PII before sending (Simulating client-side privacy)
        const hashedID = eventData.user_identifier ? CryptoJS.SHA256(eventData.user_identifier).toString() : "anonymous";
        
        const payload = {
            event_type: eventData.event_type,
            user_identifier: hashedID, 
            event_data: JSON.parse(eventData.event_data)
        };

        await apiCall('/api/events', { method: 'POST', body: payload }, apiKey); 
        alert('Event Logged securely.'); 
        
        // Refresh data
        fetchDashboard(); 
        setEventData({ event_type: '', event_data: '{}', user_identifier: '' }); 
    } catch (error) { 
      alert(`Error: ${error.message}`); 
    } finally { setIsLoading(false); } 
  };
  
  const handleLogout = () => {
      setProcessor(null); 
      localStorage.removeItem('av_api_key'); 
      setApiKey(''); 
      setRecentLogs([]);
  };

  // --- RENDER ---
  if (!privacyAccepted) return <PrivacyPage onAccept={() => { localStorage.setItem('av_privacy_v1', 'true'); setPrivacyAccepted(true); }} />;

  return (
    <div className={`min-h-screen font-sans bg-[#020617] text-white selection:bg-blue-600 selection:text-white`}>
      
      {/* GLOBAL MODALS */}
      <AnimatePresence>
        {showSecurity && <SecurityPage onClose={() => setShowSecurity(false)} />}
        {showDocs && <DocsModal onClose={() => setShowDocs(false)} />}
        {showPrivacyModal && (
            <PrivacyPage 
                isFooterView={true} 
                onClose={() => setShowPrivacyModal(false)} 
                initialTab={legalTab} 
            />
        )}
      </AnimatePresence>
      
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="pt-0">
        {activeTab === 'home' && (
          <div className="bg-[#020617]">
            {/* HERO */}
            <div className="relative pt-40 pb-32 overflow-hidden text-center z-10">
              <AnimatedBackground />
              <div className="relative z-10 max-w-5xl mx-auto px-4">
                 <div className="inline-flex items-center gap-2 bg-blue-500/10 px-4 py-1.5 rounded-full text-blue-400 text-sm font-bold border border-blue-500/20 backdrop-blur-md mb-8 animate-fade-in">
                     <Sparkles className="w-3 h-3" /><span>Version 2.0: Enterprise Ready</span>
                 </div>
                 <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
                   Compliance <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500 animate-shine bg-[length:200%_auto]">Engineered for Truth.</span>
                 </h1>
                 <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                   The interactive standard for data integrity. Cryptographically verifiable audit logs that scale with your enterprise infrastructure.
                 </p>
                 <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={() => setActiveTab('create')} className="px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 font-bold shadow-lg shadow-blue-900/40 text-white transition-all hover:scale-105">Start Integration</button>
                    <button onClick={() => setActiveTab('pricing')} className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 font-bold backdrop-blur-sm text-white border border-white/10 transition-all">Enterprise Access</button>
                 </div>
                 <div className="pt-12 flex justify-center gap-8 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-2"><Server size={14} className="text-emerald-500"/> EU Residency</span>
                    <span className="flex items-center gap-2"><Cookie size={14} className="text-emerald-500"/> Zero-Tracker</span>
                    <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-500"/> SOC2 Compliant Infra</span>
                 </div>
              </div>
            </div>

            {/* SECTIONS */}
            <div id="demo-section" className="relative z-20"><InteractiveFeatureSection /></div>
            <DashboardPreview />
            {/* Hitta denna del i App.jsx under activeTab === 'home' */}

<div className="bg-white">
  <CodeIntegration 
    setActiveTab={setActiveTab} 
    onOpenDocs={() => setShowDocs(true)}  // <--- LÄGG TILL DENNA RAD
  />
</div>

            <UseCases />
            <IntegrityEngine />
            <CoreArchitecture />
          </div>
        )}
        
        {/* OTHER TABS */}
        {activeTab === 'integrity' && <IntegrityFocusPage setActiveTab={setActiveTab} />}
        
        {activeTab === 'pricing' && <PricingPageStripe setActiveTab={setActiveTab} />}
        
        {activeTab === 'create' && (
            <div className="pt-32 pb-20 bg-slate-50 min-h-screen text-slate-900">
                <CreateProcessor />
            </div>
        )}
        
        {activeTab === 'dashboard' && (
          <div className="min-h-screen bg-slate-50 text-slate-900 pt-20">
             {!processor ? (
               <div className="pt-20 px-4 flex justify-center">
                 <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-slate-100 text-center animate-fade-in-up">
                   <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6"><Lock className="w-8 h-8 text-blue-500" /></div>
                   <h2 className="text-2xl font-bold mb-2">Secure Console</h2>
                   <p className="text-slate-500 mb-6 text-sm">Enter your live API key to access the immutable ledger.</p>
                   <input type="text" placeholder="av_live_..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4 font-mono outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                   <button onClick={fetchDashboard} disabled={isLoading} className="w-full bg-[#0a2540] text-white p-4 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg flex justify-center gap-2 items-center">
                      {isLoading ? <RefreshCw className="animate-spin"/> : 'Connect to Node'}
                   </button>
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
                 onLogout={handleLogout} 
                 KeyRotation={
                    <KeyRotationComponent 
                        processor={processor} 
                        currentKey={apiKey} 
                        onKeyUpdate={k => {setApiKey(k); localStorage.setItem('av_api_key', k);}} 
                        onRevoke={handleLogout} 
                    />
                 } 
               />
             )}
          </div>
        )}
      </main>

      <Footer 
        onOpenPrivacy={() => { setLegalTab('privacy'); setShowPrivacyModal(true); }}
        onOpenTerms={() => { setLegalTab('terms'); setShowPrivacyModal(true); }}
        onOpenSecurity={() => setShowSecurity(true)}
        onOpenDocs={() => setShowDocs(true)}
        onNavigate={setActiveTab} 
      />
    </div>
  );
}

export default App;