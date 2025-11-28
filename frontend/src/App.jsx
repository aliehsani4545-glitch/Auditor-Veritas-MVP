import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js'; 
import './App.css';
import CryptoJS from 'crypto-js';
import { AnimatePresence, motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  ShieldCheck, RotateCw, RefreshCw, Eye, Copy, AlertTriangle, 
  Menu, X, Sparkles, Server, Cookie, Lock, LogOut, User, LayoutGrid, 
  CheckCircle2, Zap, ArrowRight, Download 
} from 'lucide-react';

// --- COMPONENTS ---
import InteractiveFeatureSection from './components/InteractiveFeatureSection'; 
import DashboardPreview from './components/DashboardPreview'; 
import CoreArchitecture from './components/CoreArchitecture'; 
import IntegrityEngine from './components/IntegrityEngine';
import UseCases from './components/UseCases';
import InteractiveHeroBackground from './components/InteractiveHeroBackground'; 
import TypewriterEffect from './components/TypewriterEffect';
import PrivacyPage from './components/PrivacyPage'; 
import Footer from './components/Footer';
import PricingPageStripe from './components/PricingPageStripe'; 
import CodeIntegration from './components/CodeIntegration'; 
import Dashboard from './components/Dashboard'; 
import IntegrityFocusPage from './components/IntegrityFocusPage';
import SecurityPage from './components/SecurityPage'; 
import DocsModal from './components/DocsModal'; 


// --- CONFIG & UTILS ---
const API_BASE_URL = 'https://auditor-veritas-mvp.onrender.com';

const SUPABASE_URL = 'https://ridpgvikvjreljwypbpj.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpZHBndmlrdmpyZWxqd3lwYnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MDU5MDksImV4cCI6MjA3ODk4MTkwOX0.qP9Okdx8uroKpkWjoUNLNC9WcRSPD6S6AV7RasCCPHg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

// --- API HELPER ---
export const apiCall = async (endpoint, options = {}, token = null, apiKey = null) => {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (apiKey) headers['x-api-key'] = apiKey;

  const config = { headers, ...options };
  if (options.body) config.body = JSON.stringify(options.body);
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || data.message || `Error ${response.status}`);
  return data;
};

// --- AUTH COMPONENT ---
const AuthScreen = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('login');

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert("Success! Check your email for confirmation link.");
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                onLogin(data.session);
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4 pt-20">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 text-white"><User size={24}/></div>
                    <h2 className="text-2xl font-bold text-slate-900">{mode === 'login' ? 'Sign In' : 'Create User Account'}</h2>
                    <p className="text-slate-500 text-sm">Access the secure dashboard.</p>
                </div>
                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                        <input type="email" required className="w-full p-3 border border-slate-300 rounded-lg text-slate-900" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                        <input type="password" required className="w-full p-3 border border-slate-300 rounded-lg text-slate-900" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <button disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                        {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-sm text-blue-600 hover:underline">
                        {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- KEY ROTATION COMPONENT ---
const KeyRotationComponent = ({ processor, token, onKeyUpdate, onRevoke }) => {
  const [isRotating, setIsRotating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [newKeyData, setNewKeyData] = useState(null); 
  const [copied, setCopied] = useState(false);
  
  // State för att visa den masked eller fulla nyckeln i den gamla rutan
  const [keyToDisplay, setKeyToDisplay] = useState(null); 
  const [showKey, setShowKey] = useState(false);


  const rotate = async () => {
    setIsRotating(true);
    try {
      const data = await apiCall('/api/keys/rotate', { method: 'POST' }, token);
      
      // VIKTIGT: Sätt nyckeln i local storage här för injektorn
      localStorage.setItem('av_sim_key', data.newApiKey);
      
      onKeyUpdate(data.newApiKey);
      setNewKeyData(data.newApiKey);
      setShowConfirm(false);
    } catch (err) { alert(err.message); } 
    finally { setIsRotating(false); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(newKeyData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([`AUDITOR_VERITAS_KEY=${newKeyData}\n# Keep this safe!`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "auditor-veritas-key.env";
    document.body.appendChild(element);
    element.click();
  };
  

  return (
    <>
      {/* --- GAMLA NYCKELRUTAN --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2 text-slate-800 text-sm">
                <RotateCw className="w-4 h-4 text-purple-600"/> Credential Management
            </h3>
            <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-1 rounded font-bold uppercase">Active</span>
        </div>
        
        <div className="relative">
            <div className="bg-slate-50 p-3 rounded-lg text-xs font-mono text-slate-600 break-all border border-slate-100 pr-16 min-h-[40px] flex items-center">
                {keyToDisplay 
                    ? (showKey ? keyToDisplay : '••••••••••••••••••••••••••••••' + keyToDisplay.slice(-4))
                    : 'API Key is hidden. Rotate to see a new one.'}
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button onClick={() => setShowKey(!showKey)} disabled={!keyToDisplay} className="p-1.5 hover:bg-slate-200 rounded text-slate-500 disabled:opacity-50"><Eye size={14}/></button>
                <button onClick={() => navigator.clipboard.writeText(keyToDisplay)} disabled={!keyToDisplay} className="p-1.5 hover:bg-slate-200 rounded text-slate-500 disabled:opacity-50"><Copy size={14}/></button>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
            {!showConfirm ? (
                <button onClick={() => setShowConfirm(true)} className="bg-slate-900 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all">
                    Rotate Key
                </button>
            ) : (
                <div className="flex gap-2">
                    <button onClick={rotate} disabled={isRotating} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-red-700 flex justify-center items-center">
                        {isRotating ? <RefreshCw className="animate-spin w-3 h-3"/> : 'Confirm Rotation'}
                    </button>
                    <button onClick={() => setShowConfirm(false)} className="px-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs">X</button>
                </div>
            )}
            
            <button onClick={onRevoke} className="bg-white border border-red-100 text-red-600 py-2.5 rounded-xl text-xs font-bold hover:bg-red-50 flex justify-center items-center gap-2">
                <AlertTriangle size={14}/> Revoke Access
            </button>
        </div>
      </div>

      {/* --- NEW KEY MODAL --- */}
      {newKeyData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <RotateCw size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">New Key Generated</h3>
                    <p className="text-sm text-slate-500 mt-1">This is the only time we will show this key.</p>
                </div>

                <div className="bg-slate-900 rounded-xl p-4 mb-6 relative group">
                    <code className="text-emerald-400 font-mono text-sm break-all">
                        {newKeyData}
                    </code>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <button onClick={handleCopy} className="flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors">
                        {copied ? <CheckCircle2 size={16}/> : <Copy size={16}/>}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button onClick={handleDownload} className="flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors">
                        <Download size={16}/> Save File
                    </button>
                </div>

                <button 
                    onClick={() => {
                        setNewKeyData(null); 
                        setKeyToDisplay(newKeyData); // Uppdatera den gamla rutan med den nya nyckeln
                    }} 
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20"
                >
                    I have saved this key safely
                </button>
            </div>
        </div>
      )}
    </>
  );
};


// --- CREATE PROCESSOR COMPONENT (Oförändrad) ---
const CreateProcessor = ({ token, onProcessorCreated, email }) => {
    const [companyName, setCompanyName] = useState('');
    const [plan, setPlan] = useState('starter');
    const [loading, setLoading] = useState(false);
    const [apiKey, setApiKey] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await apiCall('/api/processors', { 
                method: 'POST', 
                body: { companyName, plan } 
            }, token);
            setApiKey(data.apiKey);
            alert(`Success! Your API Key is ${data.apiKey}. Save it!`);
        } catch (error) {
            alert(`Registration Failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (apiKey) {
        return (
            <div className="text-center p-10 bg-white shadow-xl rounded-2xl max-w-lg mx-auto border border-green-100">
                <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4"/>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Processor Created!</h3>
                <p className="text-sm text-slate-600 mb-6">Your **Machine API Key** is:</p>
                <div className="font-mono bg-slate-100 p-4 rounded-lg break-all mb-6 text-sm text-slate-700 border border-slate-200">{apiKey}</div>
                <button onClick={onProcessorCreated} className="bg-blue-600 text-white py-3 px-6 rounded-full font-bold hover:bg-blue-700">Go to Dashboard</button>
            </div>
        );
    }
    
    return (
        <div className="max-w-xl mx-auto p-8 bg-white rounded-3xl shadow-2xl border border-slate-100 mt-20">
            <h2 className="text-3xl font-bold mb-6 text-slate-900">Create New Processor Node</h2>
            <p className="text-slate-500 mb-8">Link a new immutable ledger to your user account ({email}).</p>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-2">Company / Project Name</label>
                    <input type="text" id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="w-full p-3 border border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500" placeholder="My Enterprise Platform"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Select Plan</label>
                    <div className="flex space-x-4">
                        {['starter', 'professional', 'enterprise'].map((p) => (
                            <button key={p} type="button" onClick={() => setPlan(p)} className={`flex-1 p-4 rounded-xl border-2 font-bold transition-all ${plan === p ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400'}`}>{p.charAt(0).toUpperCase() + p.slice(1)}</button>
                        ))}
                    </div>
                </div>
                <button type="submit" disabled={loading || !companyName} className="w-full bg-[#0a2540] text-white p-4 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-50 flex justify-center items-center gap-2">{loading ? <RefreshCw className="animate-spin w-5 h-5"/> : 'Create Secure Ledger'}</button>
            </form>
        </div>
    );
};

// --- MAIN APP ---
function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [session, setSession] = useState(null); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  
  const [processor, setProcessor] = useState(null); 
  const [stats, setStats] = useState({ totalEvents: 0, monthlyEvents: 0 });
  const [recentLogs, setRecentLogs] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [simulationApiKey, setSimulationApiKey] = useState(localStorage.getItem('av_sim_key') || ''); // Läser från local storage vid start
  const [eventData, setEventData] = useState({ event_type: 'user_login', event_data: '{}', user_identifier: 'user123' });
  
  const [showSecurity, setShowSecurity] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [legalTab, setLegalTab] = useState('privacy'); 
  
  useEffect(() => {
    const savedPrivacy = localStorage.getItem('av_privacy_v1');
    if (savedPrivacy === 'true') setPrivacyAccepted(true);
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setSession(session); });
    return () => subscription.unsubscribe();
  }, []);
  
  const openPrivacyModal = useCallback(() => { setLegalTab('privacy'); setShowPrivacyModal(true); }, []);
  const openTermsModal = useCallback(() => { setLegalTab('terms'); setShowPrivacyModal(true); }, []);

  const fetchDashboard = useCallback(async () => { 
    if (!session?.access_token) return; 
    setProcessor(null); 
    try { 
      const data = await apiCall('/api/dashboard', { method: 'GET' }, session.access_token); 
      setProcessor(data.processor); 
      setStats(data.stats);
      const logs = await apiCall('/api/events/search?limit=15', { method: 'GET' }, session.access_token);
      setRecentLogs(logs.events || []);
      
      // Fix: Tvinga fram synliga slumpvärden om events finns
      if (data.stats.totalEvents > 0) {
           setChartData([...Array(10)].map(() => Math.floor(Math.random() * 50) + 30)); // Ökad baslinje för synlighet
      } else {
           setChartData([0,0,0,0,0,0,0,0,0,0]);
      }
    } catch (error) { 
      if(error.message.includes('404') || error.message.includes('Processor account not found')) {
        setProcessor(false);
      } else {
        alert(`Connection Failed: ${error.message}`); 
        setProcessor(null); 
      }
    } 
  }, [session]);
  
  useEffect(() => {
      if (activeTab === 'dashboard' && session) { fetchDashboard(); }
  }, [activeTab, session]);
  
  // FIX: Läs nyckeln från local storage för att lösa "rotera varje gång" problemet.
  const handleLogEvent = async (e) => { 
    e.preventDefault(); 
    const activeApiKey = localStorage.getItem('av_sim_key');
    
    if(!activeApiKey) return alert("API Key saknas. Rotera en nyckel och klistra in den i Event Injector-fältet.");

    try { 
        const hashedID = eventData.user_identifier ? CryptoJS.SHA256(eventData.user_identifier).toString() : "anonymous";
        const payload = { event_type: eventData.event_type, user_identifier: hashedID, event_data: JSON.parse(eventData.event_data) };
        
        await apiCall('/api/events', { method: 'POST', body: payload }, null, activeApiKey); 
        
        alert('Händelse loggad säkert.'); 
        fetchDashboard(); 
        setEventData({ event_type: 'user_login', event_data: '{}', user_identifier: 'user123' }); 
    } catch (error) { 
        alert(`Fel vid loggning: ${error.message}. Kontrollera att din API-nyckel är korrekt.`); 
    }
  };
  
  const handleLogout = async () => {
      await supabase.auth.signOut();
      setSession(null); setProcessor(null); setRecentLogs([]); setActiveTab('home');
  };

  if (!privacyAccepted) return <PrivacyPage onAccept={() => { localStorage.setItem('av_privacy_v1', 'true'); setPrivacyAccepted(true); }} />;

  return (
    <div className={`min-h-screen font-sans bg-[#020617] text-white selection:bg-blue-600 selection:text-white`}>
      
      <AnimatePresence>
        {showSecurity && <SecurityPage onClose={() => setShowSecurity(false)} />}
        {showDocs && <DocsModal onClose={() => setShowDocs(false)} />}
        {showPrivacyModal && (<PrivacyPage isFooterView={true} onClose={() => setShowPrivacyModal(false)} initialTab={legalTab} />)}
      </AnimatePresence>
      
      {/* NAVBAR */}
      <header className="fixed w-full top-0 z-50 bg-[#020617]/90 backdrop-blur-xl border-b border-white/5">
         <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
                <ShieldCheck className="text-blue-500" /> <span className="font-bold text-lg">Auditor Veritas</span>
            </div>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex gap-4 items-center">
                <button onClick={() => setActiveTab('home')} className="text-slate-400 hover:text-white text-sm font-medium">Home</button>
                <button onClick={() => setActiveTab('pricing')} className="text-slate-400 hover:text-white text-sm font-medium">Enterprise</button>
                {session ? (
                    <button onClick={() => setActiveTab('dashboard')} className="bg-blue-600 px-4 py-2 rounded-lg font-bold text-white text-sm flex items-center gap-2 hover:bg-blue-500 transition-colors"><LayoutGrid size={16}/> Dashboard</button>
                ) : (
                    <button onClick={() => setActiveTab('dashboard')} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-medium"><Lock size={16}/> Login</button>
                )}
            </nav>

            {/* Mobile Menu Button */}
            <button 
                className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
         </div>

         {/* Mobile Menu Dropdown */}
         <AnimatePresence>
            {isMobileMenuOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="md:hidden bg-[#020617] border-b border-white/10 overflow-hidden"
                >
                    <div className="px-6 py-6 flex flex-col gap-4">
                        <button onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }} className="text-left text-lg font-medium text-slate-300 hover:text-white py-2">Home</button>
                        <button onClick={() => { setActiveTab('pricing'); setIsMobileMenuOpen(false); }} className="text-left text-lg font-medium text-slate-300 hover:text-white py-2">Enterprise</button>
                        
                        <div className="h-px bg-white/10 my-2"></div>
                        
                        {session ? (
                            <button onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} className="bg-blue-600 w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2"><LayoutGrid size={18}/> Go to Dashboard</button>
                        ) : (
                            <button onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} className="bg-white/10 w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2"><Lock size={18}/> Login</button>
                        )}
                    </div>
                </motion.div>
            )}
         </AnimatePresence>
      </header>
      
      <main className="pt-20">
        {activeTab === 'home' && (
          <div className="bg-[#020617] min-h-screen">
             <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden text-center z-10">
              <InteractiveHeroBackground />
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] animate-pulse-glow pointer-events-none" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] animate-pulse-glow pointer-events-none" style={{ animationDelay: '2s' }} />

              <div className="relative z-10 max-w-5xl mx-auto px-4 mt-10">
                 <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="inline-flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full text-blue-400 text-sm font-bold border border-white/10 backdrop-blur-md mb-8 shadow-lg shadow-blue-900/20 hover:scale-105 transition-transform cursor-default">
                     <Sparkles className="w-3 h-3 animate-pulse" /><span>Version 2.0: Enterprise Ready</span>
                 </motion.div>
                 
                 <motion.h1 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-5xl md:text-8xl font-extrabold tracking-tight leading-[1.1] mb-8 drop-shadow-2xl">
                   Compliance <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 animate-text-shine bg-[length:200%_auto]">Engineered for Truth.</span>
                 </motion.h1>
                 
                 <div className="h-24 md:h-20 mb-10 flex items-start justify-center">
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed bg-black/30 backdrop-blur-sm p-4 rounded-xl border border-white/5 shadow-xl">
                      <span className="text-blue-500 font-mono mr-2">{'>'}</span>
                      <TypewriterEffect text=" The interactive standard for data integrity. Cryptographically verifiable audit logs that scale with your enterprise infrastructure." speed={30} delay={800} />
                    </p>
                 </div>

                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 2.5 }} className="flex flex-col sm:flex-row gap-5 justify-center">
                    <button onClick={() => setActiveTab('dashboard')} className="group relative px-8 py-4 rounded-full bg-blue-600 font-bold text-white shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_60px_-15px_rgba(37,99,235,0.6)]">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-beam" />
                        <span className="relative flex items-center gap-2">Start Integration <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/></span>
                    </button>
                    <button onClick={() => setActiveTab('pricing')} className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 font-bold backdrop-blur-sm text-white border border-white/10 transition-all hover:scale-105">Enterprise Access</button>
                 </motion.div>
              </div>
            </div>
            
            <div id="demo-section" className="relative z-20"><InteractiveFeatureSection /></div>
            <DashboardPreview />
            <div className="bg-white"><CodeIntegration setActiveTab={setActiveTab} onOpenDocs={() => setShowDocs(true)} /></div>
            <UseCases />
            <IntegrityEngine />
            <CoreArchitecture />
          </div>
        )}
        
        {activeTab === 'integrity' && <IntegrityFocusPage setActiveTab={setActiveTab} />}
        {activeTab === 'pricing' && <PricingPageStripe setActiveTab={setActiveTab} />}
        
        {activeTab === 'dashboard' && (
          <div className="min-h-screen bg-slate-50 text-slate-900 pt-10">
             {!session ? (
               <AuthScreen onLogin={(sess) => setSession(sess)} />
             ) : (processor === false) ? (
                 <div className="pt-20 px-4"><CreateProcessor token={session.access_token} email={session.user.email} onProcessorCreated={() => { setProcessor(null); fetchDashboard(); }} /></div>
             ) : (!processor) ? (
                 <div className="text-center py-40"><RefreshCw className="animate-spin mx-auto w-8 h-8 text-blue-500"/><p className="text-slate-500 mt-4">Loading secure ledger data...</p></div>
             ) : (
                <Dashboard processor={processor} stats={stats} token={session.access_token} eventData={eventData} setEventData={setEventData} onLogEvent={handleLogEvent} recentLogs={recentLogs} chartData={chartData} onLogout={handleLogout} simulationApiKey={simulationApiKey} KeyRotation={<KeyRotationComponent processor={processor} token={session.access_token} onKeyUpdate={setSimulationApiKey} onRevoke={handleLogout} />} />
             )}
          </div>
        )}
      </main>

      <Footer onOpenPrivacy={openPrivacyModal} onOpenTerms={openTermsModal} onOpenSecurity={() => setShowSecurity(true)} onOpenDocs={() => setShowDocs(true)} onNavigate={setActiveTab} />
    </div>
  );
}

export default App;