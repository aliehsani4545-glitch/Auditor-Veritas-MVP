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
  CheckCircle2, Zap 
} from 'lucide-react';

// --- COMPONENTS (Använd dina befintliga komponenter här) ---
import InteractiveFeatureSection from './components/InteractiveFeatureSection'; 
import DashboardPreview from './components/DashboardPreview'; 
import CoreArchitecture from './components/CoreArchitecture'; 
import IntegrityEngine from './components/IntegrityEngine';
import UseCases from './components/UseCases';
import AnimatedBackground from './components/AnimatedBackground'; 
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

// VIKTIGT: Ersätt med dina Supabase publika nycklar!
const SUPABASE_URL = 'https://ridpgvikvjreljwypbpj.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpZHBndmlrdmpyZWxqd3lwYnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MDU5MDksImV4cCI6MjA3ODk4MTkwOX0.qP9Okdx8uroKpkWjoUNLNC9WcRSPD6S6AV7RasCCPHg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

// --- API HELPER (AUTH AWARE) ---
// Nu flexibel för Människa (JWT Token) eller Maskin (API Key) anrop
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
    const [mode, setMode] = useState('login'); // login | signup

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (mode === 'signup') {
                // Notera: Supabase skickar ett bekräftelsemail. Man måste bekräfta för att logga in.
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
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [keyToDisplay, setKeyToDisplay] = useState(null); 
  
  const rotate = async () => {
    if(!confirm("Rotate API Key? Your old key will stop working immediately. Update your .env variables.")) return;
    setIsRotating(true);
    try {
      // Använder JWT token för att bevisa att människan har behörighet
      const data = await apiCall('/api/keys/rotate', { method: 'POST' }, token);
      onKeyUpdate(data.newApiKey);
      setKeyToDisplay(data.newApiKey); 
      alert('Success: Key Rotated. Save the new key immediately.');
    } catch (err) { alert(err.message); } 
    finally { setIsRotating(false); }
  };
  
  const revoke = async () => {
      try {
          // Använder JWT token för att bevisa att människan har behörighet
          await apiCall('/api/keys/revoke', { method: 'POST' }, token);
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
          <button onClick={rotate} disabled={isRotating} className="bg-slate-900 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 flex justify-center items-center gap-2">
              {isRotating ? <RefreshCw className="animate-spin w-3.5 h-3.5"/> : 'Rotate Key'}
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


// --- IN-APP PROCESSOR REGISTRATION COMPONENT ---
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
            // onProcessorCreated(); // Trigger dashboard refresh

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
                    <input 
                        type="text" 
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                        placeholder="My Enterprise Platform"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Select Plan</label>
                    <div className="flex space-x-4">
                        {['starter', 'professional', 'enterprise'].map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setPlan(p)}
                                className={`flex-1 p-4 rounded-xl border-2 font-bold transition-all ${
                                    plan === p ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400'
                                }`}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                
                <button 
                    type="submit" 
                    disabled={loading || !companyName} 
                    className="w-full bg-[#0a2540] text-white p-4 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-50 flex justify-center items-center gap-2"
                >
                    {loading ? <RefreshCw className="animate-spin w-5 h-5"/> : 'Create Secure Ledger'}
                </button>
            </form>
        </div>
    );
};


// --- MAIN APP ---
function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [session, setSession] = useState(null); 
  
  // processor state: null (loading), false (not found/needs registration), object (ready)
  const [processor, setProcessor] = useState(null); 
  const [stats, setStats] = useState({ totalEvents: 0, monthlyEvents: 0 });
  const [recentLogs, setRecentLogs] = useState([]);
  const [chartData, setChartData] = useState([]);
  // Vi behåller en API-nyckel här för att simulera maskin-till-maskin anropet i dashboarden
  const [simulationApiKey, setSimulationApiKey] = useState(''); 
  const [eventData, setEventData] = useState({ event_type: 'user_login', event_data: '{}', user_identifier: 'user123' });
  
  // Modals
  const [showSecurity, setShowSecurity] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [legalTab, setLegalTab] = useState('privacy'); 
  
  // Init - Check Privacy and Session
  useEffect(() => {
    const savedPrivacy = localStorage.getItem('av_privacy_v1');
    if (savedPrivacy === 'true') setPrivacyAccepted(true);
    
    // Check Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  // Handlers for Modals/Pages
  const openPrivacyModal = useCallback(() => { setLegalTab('privacy'); setShowPrivacyModal(true); }, []);
  const openTermsModal = useCallback(() => { setLegalTab('terms'); setShowPrivacyModal(true); }, []);


  // --- DASHBOARD ACTIONS (Uses JWT token) ---
  const fetchDashboard = useCallback(async () => { 
    if (!session?.access_token) return; 
    setProcessor(null); // Sätter till loading
    
    try { 
      // 1. Fetch Processor/Stats (Använder JWT Token)
      const data = await apiCall('/api/dashboard', { method: 'GET' }, session.access_token); 
      setProcessor(data.processor); 
      setStats(data.stats);

      // 2. Fetch Logs (Använder JWT Token)
      const logs = await apiCall('/api/events/search?limit=15', { method: 'GET' }, session.access_token);
      setRecentLogs(logs.events || []);
      
      if (data.stats.totalEvents > 0) {
           setChartData([...Array(10)].map(() => Math.floor(Math.random() * 50) + 10)); 
      } else {
           setChartData([0,0,0,0,0,0,0,0,0,0]);
      }

    } catch (error) { 
      // Om 404 returneras, betyder det att användaren är inloggad men saknar processor
      // Vi kollar efter "404" ELLER serverns specifika felmeddelande
if(error.message.includes('404') || error.message.includes('Processor account not found')) {
    setProcessor(false); // Detta visar "Create Processor" formuläret
} else {
        alert(`Connection Failed: ${error.message}`); 
        setProcessor(null); 
      }
    } 
  }, [session]);
  
  // Trigger fetch when tab changes to dashboard or session changes
  useEffect(() => {
      if (activeTab === 'dashboard' && session) {
          fetchDashboard();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, session]);
  
  // Logga Event (Simulerar maskinanrop, kräver API Key)
  const handleLogEvent = async (e) => { 
    e.preventDefault(); 
    if(!simulationApiKey) return alert("API Key is required for the simulation. Rotate a key and copy it first.");
    
    try { 
        const hashedID = eventData.user_identifier ? CryptoJS.SHA256(eventData.user_identifier).toString() : "anonymous";
        
        const payload = {
            event_type: eventData.event_type,
            user_identifier: hashedID, 
            event_data: JSON.parse(eventData.event_data)
        };

        // Detta anrop MÅSTE använda MASKINENS API KEY
        await apiCall('/api/events', { method: 'POST', body: payload }, null, simulationApiKey); 
        alert('Event Logged securely.'); 
        
        // Uppdatera dashboarddata (använder mänsklig token)
        fetchDashboard(); 
        setEventData({ event_type: 'user_login', event_data: '{}', user_identifier: 'user123' }); 
    } catch (error) { 
      alert(`Error: ${error.message}`); 
    }
  };
  
  const handleLogout = async () => {
      await supabase.auth.signOut();
      setSession(null);
      setProcessor(null); 
      setRecentLogs([]);
      setActiveTab('home');
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
      
      {/* NAVBAR */}
      <header className="fixed w-full top-0 z-50 bg-[#020617]/90 backdrop-blur-xl border-b border-white/5">
         <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
                <ShieldCheck className="text-blue-500" /> <span className="font-bold text-lg">Auditor Veritas</span>
            </div>
            <nav className="flex gap-4 items-center">
                <button onClick={() => setActiveTab('home')} className="text-slate-400 hover:text-white">Home</button>
                <button onClick={() => setActiveTab('pricing')} className="text-slate-400 hover:text-white">Enterprise</button>
                {session ? (
                    <button onClick={() => setActiveTab('dashboard')} className="bg-blue-600 px-4 py-2 rounded-lg font-bold text-white flex items-center gap-2"><LayoutGrid size={16}/> Dashboard</button>
                ) : (
                    <button onClick={() => setActiveTab('dashboard')} className="text-slate-400 hover:text-white flex items-center gap-2"><Lock size={16}/> Login</button>
                )}
            </nav>
         </div>
      </header>
      
      <main className="pt-20">
        {activeTab === 'home' && (
          <div className="bg-[#020617] pt-20">
            {/* HERO & SECTIONS */}
             <div className="relative pt-20 pb-32 overflow-hidden text-center z-10">
              <AnimatedBackground />
              <div className="relative z-10 max-w-5xl mx-auto px-4">
                 <div className="inline-flex items-center gap-2 bg-blue-500/10 px-4 py-1.5 rounded-full text-blue-400 text-sm font-bold border border-blue-500/20 backdrop-blur-md mb-8">
                     <Sparkles className="w-3 h-3" /><span>Version 2.0: Enterprise Ready</span>
                 </div>
                 <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
                   Compliance <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">Engineered for Truth.</span>
                 </h1>
                 <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                   The interactive standard for data integrity. Cryptographically verifiable audit logs that scale with your enterprise infrastructure.
                 </p>
                 <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={() => setActiveTab('dashboard')} className="px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 font-bold shadow-lg shadow-blue-900/40 text-white transition-all">Start Integration</button>
                    <button onClick={() => setActiveTab('pricing')} className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 font-bold backdrop-blur-sm text-white border border-white/10 transition-all">Enterprise Access</button>
                 </div>
              </div>
            </div>
            <div id="demo-section" className="relative z-20"><InteractiveFeatureSection /></div>
            <DashboardPreview />
            <div className="bg-white">
                <CodeIntegration 
                    setActiveTab={setActiveTab} 
                    onOpenDocs={() => setShowDocs(true)} 
                />
            </div>
            <UseCases />
            <IntegrityEngine />
            <CoreArchitecture />
          </div>
        )}
        
        {activeTab === 'integrity' && <IntegrityFocusPage setActiveTab={setActiveTab} />}
        {activeTab === 'pricing' && <PricingPageStripe setActiveTab={setActiveTab} />}
        
        {/* DASHBOARD SECTION */}
        {activeTab === 'dashboard' && (
          <div className="min-h-screen bg-slate-50 text-slate-900 pt-10">
             
             {/* 1. EJ INLOGGAD */}
             {!session ? (
               <AuthScreen onLogin={(sess) => setSession(sess)} />
             ) : 
             
             /* 2. INLOGGAD, MEN INGEN PROCESSOR LÄNKAD (processor === false) */
             (processor === false) ? (
                 <div className="pt-20 px-4">
                    <CreateProcessor 
                        token={session.access_token} 
                        email={session.user.email} 
                        onProcessorCreated={() => { setProcessor(null); fetchDashboard(); }} 
                    />
                 </div>
             ) : 
             
             /* 3. INLOGGAD, PROCESSOR ÄR UNDER LADDNING ELLER REDO */
             (!processor) ? (
                 <div className="text-center py-40">
                     <RefreshCw className="animate-spin mx-auto w-8 h-8 text-blue-500"/>
                     <p className="text-slate-500 mt-4">Loading secure ledger data...</p>
                 </div>
             ) : (
                <Dashboard 
                    processor={processor}
                    stats={stats}
                    // JWT token för interna dashboard-anrop
                    token={session.access_token} 
                    
                    // Tillståndet för simulering av loggning
                    eventData={eventData}
                    setEventData={setEventData}
                    onLogEvent={handleLogEvent}
                    
                    recentLogs={recentLogs} 
                    chartData={chartData}
                    onLogout={handleLogout} 
                    simulationApiKey={simulationApiKey} // Skicka med nyckeln till Dashboard
                    
                    KeyRotation={
                        <KeyRotationComponent 
                            processor={processor} 
                            token={session.access_token} 
                            onKeyUpdate={setSimulationApiKey} // Uppdatera nyckeln för simulering
                            onRevoke={handleLogout} 
                        />
                    } 
                />
             )}
          </div>
        )}
      </main>

      <Footer 
        onOpenPrivacy={openPrivacyModal} 
        onOpenTerms={openTermsModal}
        onOpenSecurity={() => setShowSecurity(true)}
        onOpenDocs={() => setShowDocs(true)}
        onNavigate={setActiveTab} 
      />
    </div>
  );
}

export default App;