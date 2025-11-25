// App.jsx

import React, { useState, useEffect } from 'react';
import './App.css';
import CryptoJS from 'crypto-js';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// --- COMPONENTS ---
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
import PricingPage from './components/PricingPage'; 
import CodeIntegration from './components/CodeIntegration'; 
import Dashboard from './components/Dashboard'; 
import IntegrityFocusPage from './components/IntegrityFocusPage'; 
import MerkleProofViewer from './components/MerkleProofViewer'; 
import IntegrationDocs from './components/IntegrationDocs'; // NY IMPORT FÖR DEN PROFESSIONELLA DOKUMENTATIONEN

// ICONS
import { ShieldCheck, Lock, LogOut, Menu, X, Sparkles, RotateCw, RefreshCw, Copy, Eye, Cookie, Server } from 'lucide-react';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const API_BASE_URL = 'https://auditor-veritas-mvp.onrender.com';

// --- API HELPER (Exporteras för MerkleProofViewer) ---
export const apiCall = async (endpoint, options = {}, apiKey = '') => {
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

// Uppdaterad KeyRotationComponent med Revoke-funktion
const KeyRotationComponent = ({ processor, currentKey, onKeyUpdate, onRevoke }) => {
  const [isRotating, setIsRotating] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const copyToClipboard = () => { navigator.clipboard.writeText(currentKey); alert("Key copied!"); };
  
  const rotate = async () => {
    setIsRotating(true);
    try {
      const data = await apiCall('/api/keys/rotate', { method: 'POST' }, currentKey);
      onKeyUpdate(data.newApiKey); 
      alert('Key rotated successfully. The old key is now invalid.');
    } catch (err) { alert(`Rotation Failed: ${err.message}`); } 
    finally { setIsRotating(false); }
  };
  
  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex justify-between mb-4"><h3 className="font-bold flex items-center gap-2 text-slate-800 text-sm"><RotateCw className="w-4 h-4 text-purple-600"/> Key Rotation</h3><span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-1 rounded font-bold uppercase">Active</span></div>
      
      <div className="relative mb-4">
        <div className="bg-slate-50 p-3 rounded-lg text-xs font-mono text-slate-600 break-all border border-slate-100 pr-16 min-h-[40px] flex items-center">{showKey ? currentKey : '••••••••••••••••••'}</div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <button onClick={() => setShowKey(!showKey)} className="p-1.5 hover:bg-slate-200 rounded text-slate-500"><Eye size={14}/></button>
          <button onClick={copyToClipboard} className="p-1.5 hover:bg-slate-200 rounded text-slate-500"><Copy size={14}/></button>
        </div>
      </div>
      
      <div className='flex gap-2'>
        <button onClick={rotate} disabled={isRotating} className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 flex justify-center items-center gap-2 disabled:bg-slate-300 disabled:text-slate-500">
          {isRotating ? <RefreshCw className="animate-spin w-3 h-3"/> : 'Rotate Key Now'}
        </button>
        <button onClick={onRevoke} className="px-4 py-2.5 rounded-xl text-xs font-bold bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
          <Lock size={14} /> Revoke
        </button>
      </div>
    </div>
  );
};


// --- NAVBAR (Oförändrad) ---
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
    
  // NEW TABS: 'integrity' added
  const navTabs = ['home', 'create', 'integrity', 'pricing', 'dashboard']; 

  const getTabLabel = (tab) => {
    switch(tab) {
      case 'pricing': return 'Enterprise';
      case 'integrity': return 'Integrity';
      case 'create': return 'Get Started';
      default: return tab.charAt(0).toUpperCase() + tab.slice(1);
    }
  };

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
          {navTabs.map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab 
                  ? 'bg-white/10 text-white shadow-sm border border-white/10' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {getTabLabel(tab)}
            </button>
          ))}
        </nav>
        
        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-[#020617] border-b border-slate-800 p-6 flex flex-col gap-4 md:hidden shadow-xl h-screen z-50">
           {navTabs.map((tab) => (
             <button 
               key={tab} 
               onClick={() => {setActiveTab(tab); setMobileMenuOpen(false)}} 
               className="text-left font-bold text-white capitalize py-3 text-lg border-b border-slate-800"
             >
               {getTabLabel(tab)}
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
  const [legalInitialTab, setLegalInitialTab] = useState('privacy'); 
  const [theme, setTheme] = useState('theme-dark'); 
  const [processor, setProcessor] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [eventData, setEventData] = useState({ event_type: '', event_data: '{}', user_identifier: '' });
  const [stats, setStats] = useState({ totalEvents: 0, monthlyEvents: 0, eventsLimit: 100 });
  const [isLoading, setIsLoading] = useState(false);
  
  // DASHBOARD STATES
  const [recentLogs, setRecentLogs] = useState([]);
  const [chartData, setChartData] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

  // GDPR State
  const [gdprIdToErase, setGdprIdToErase] = useState('');
  const [isGdprLoading, setIsGdprLoading] = useState(false);

  useEffect(() => {
    const savedPrivacy = localStorage.getItem('privacyAccepted_v11');
    if (savedPrivacy === 'true') setPrivacyAccepted(true);
    const savedKey = localStorage.getItem('auditorApiKey');
    if (savedKey) setApiKey(savedKey);
  }, []);

  // --- HELPER FUNCTIONS FOR MODALS AND THEME SWITCHING (Oförändrad) ---
  const openPrivacyModal = () => {
    setLegalInitialTab('privacy');
    setShowFooterPrivacy(true);
  };

  const openTermsModal = () => {
    setLegalInitialTab('terms');
    setShowFooterPrivacy(true);
  };

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
  
  const fetchRecentLogs = async (currentApiKey) => {
    try {
      const logData = await apiCall('/api/events/search?limit=10', { method: 'GET' }, currentApiKey);
      setRecentLogs(logData.events);
      
      const activityData = Array(10).fill(0).map((_, i) => {
        const logIndex = 9 - i;
        return logData.events[logIndex] ? Math.floor(Math.random() * 50) + 10 : 0;
      });
      setChartData(activityData);
      
    } catch (error) {
       console.error("Failed to fetch recent logs:", error);
       setRecentLogs([]);
    }
  }

  const fetchDashboard = async () => { 
    if (!apiKey) return alert("Please enter API Key"); 
    setIsLoading(true); 
    try { 
      const data = await apiCall('/api/dashboard', { method: 'GET' }, apiKey); 
      setProcessor(data.processor || { companyName: 'Connected Node' }); 
      setStats({
          totalEvents: data.stats.totalEvents,
          monthlyEvents: data.stats.monthlyEvents,
          eventsLimit: data.processor.eventsLimit
      }); 
      localStorage.setItem('auditorApiKey', apiKey); 
      
      await fetchRecentLogs(apiKey); 
      
    } catch (error) { 
      alert(`Connection Failed: ${error.message}`); 
      setProcessor(null); 
      localStorage.removeItem('auditorApiKey');
    } finally { 
      setIsLoading(false); 
    } 
  };

  const handleLogEvent = async (e) => { 
    e.preventDefault(); 
    if (stats.monthlyEvents >= stats.eventsLimit) return alert(`⚠️ Monthly Event Limit Reached (${stats.monthlyEvents}/${stats.eventsLimit}). Please upgrade plan.`); 
    setIsLoading(true); 
    try { 
      let hashedUser = eventData.user_identifier; 
      if (eventData.user_identifier) hashedUser = CryptoJS.SHA256(eventData.user_identifier).toString(); 
      
      const eventDataParsed = JSON.parse(eventData.event_data); 
      
      await apiCall('/api/events', { 
        method: 'POST', 
        body: { 
          event_type: eventData.event_type, 
          user_identifier: hashedUser, 
          event_data: eventDataParsed
        } 
      }, apiKey); 
      
      alert('Event Logged! Audit trail established.'); 
      
      await fetchDashboard(); 

      setEventData({ event_type: '', event_data: '{}', user_identifier: '' }); 
    } catch (error) { 
      alert(`Error: ${error.message}`); 
    } finally { 
      setIsLoading(false); 
    } 
  };
  
  const handleRevokeKey = async () => {
    if (!confirm('VARNING: Är du säker på att du vill ÅTERKALLA denna API-nyckel? Den kommer omedelbart att sluta fungera och du måste generera en ny nyckel för att återfå åtkomst.')) return;
    try {
      await apiCall('/api/keys/revoke', { method: 'POST' }, apiKey);
      alert('Nyckeln har återkallats. Logga in igen med en ny nyckel.');
      setProcessor(null);
      localStorage.removeItem('auditorApiKey');
      setApiKey('');
      setRecentLogs([]);
    } catch (error) {
      alert(`Återkallning misslyckades: ${error.message}`);
    }
  };
  
  const handleGdprErasure = async (e) => {
    e.preventDefault();
    if (!gdprIdToErase.trim()) return alert("Ange en användaridentifierare (som skickats till API:et) att radera.");
    
    // Hasha ID:t precis som det görs i handleLogEvent för att matcha backendens lagrade hash
    let hashedIdToErase = CryptoJS.SHA256(gdprIdToErase.trim()).toString();

    if (!confirm(`VARNING: Detta kommer att pseudonymisera alla händelser för användar-hash: ${hashedIdToErase.substring(0, 16)}... Fortsätt?`)) return;

    setIsGdprLoading(true);
    try {
      const data = await apiCall('/api/gdpr/erase', { 
        method: 'POST', 
        body: { user_identifier: hashedIdToErase } // Skickar den hashade versionen
      }, apiKey);

      alert(`GDPR Radering utförd: ${data.records_updated} poster uppdaterades. Merkle Tree måste byggas om.`);
      setGdprIdToErase('');
      await fetchDashboard(); // Ladda om loggar/statistik
    } catch (error) {
      alert(`GDPR Radering misslyckades: ${error.message}`);
    } finally {
      setIsGdprLoading(false);
    }
  };


  if (!privacyAccepted) return <PrivacyPage onAccept={handlePrivacyAccept} />;

  return (
    <div className={`min-h-screen font-sans selection:bg-[#635bff] selection:text-white flex flex-col transition-colors duration-700 ${theme}`}>
      <AnimatePresence>
        {showFooterPrivacy && (
          <PrivacyPage 
            isFooterView={true} 
            onClose={() => setShowFooterPrivacy(false)} 
            initialTab={legalInitialTab} 
          />
        )}
      </AnimatePresence>
      
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
            
            <div id="code-integration">
              {/* Använder den nya IntegrationDocs komponenten som är mer professionell */}
              <IntegrationDocs setActiveTab={setActiveTab} />
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
        
        {activeTab === 'integrity' && (
          <div id="integrity-focus">
             <IntegrityFocusPage setActiveTab={setActiveTab} />
          </div>
        )}

        {activeTab === 'pricing' && (
          <div id="pricing">
             <PricingPage setActiveTab={setActiveTab} />
          </div>
        )}
        
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
                 onLogout={() => { setProcessor(null); localStorage.removeItem('auditorApiKey'); setApiKey(''); setRecentLogs([]);}}
                 KeyRotation={<KeyRotationComponent 
                     processor={processor} 
                     currentKey={apiKey} 
                     onKeyUpdate={k => {setApiKey(k); localStorage.setItem('auditorApiKey', k);}} 
                     onRevoke={handleRevokeKey}
                 />}
                 MerkleViewerComponent={<MerkleProofViewer apiKey={apiKey} />}
                 GdprErasureComponent={
                     <form onSubmit={handleGdprErasure} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
                         <div className='flex items-center gap-2 mb-2'>
                             <Lock size={16} className='text-red-500'/>
                             <h3 className='font-bold text-slate-800 text-sm'>GDPR Radering (Pseudonymisering)</h3>
                         </div>
                         <input 
                             type="text" 
                             placeholder="Ange användar ID (klartext)" 
                             value={gdprIdToErase}
                             onChange={(e) => setGdprIdToErase(e.target.value)}
                             className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all placeholder:text-slate-400 text-slate-700"
                         />
                         <button 
                             type="submit" 
                             disabled={isGdprLoading || !gdprIdToErase.trim()}
                             className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide transition-all flex justify-center items-center gap-2 disabled:bg-red-300"
                         >
                             {isGdprLoading ? <RefreshCw className="animate-spin w-3.5 h-3.5"/> : 'Starta Radering (Art. 17)'}
                         </button>
                         <p className='text-[10px] text-slate-500 mt-2'>Observera: ID:t du anger hashades innan lagring. Detta pseudonymiserar `user_identifier` och `event_data` fälten, men behåller den oföränderliga audit-kedjan.</p>
                     </form>
                 }
               />
             )}
          </div>
        )}

        {activeTab === 'create' && <div className="pt-24 md:pt-32 p-4 md:p-6 flex justify-center bg-slate-50 min-h-screen text-slate-900"><CreateProcessor /></div>}
      </main>

      <Footer 
        onOpenPrivacy={openPrivacyModal} 
        onOpenTerms={openTermsModal}
        onNavigate={setActiveTab} 
      />
    </div>
  );
}

export default App;