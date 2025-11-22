import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import CryptoJS from 'crypto-js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// --- NYA IMPORTER (Se till att filerna finns i /components) ---
import AnimatedBackground from './components/AnimatedBackground'; 
import PhoneDraw from './components/PhoneDraw';
import CreateProcessor from './components/CreateProcessor'; 

import { 
  ShieldCheck, BarChart3, FileText, Check, 
  Lock, RotateCw, Menu, X,
  KeyRound, FileLock2, Database, TreePine,
  ArrowRight, Sparkles, RefreshCw
} from 'lucide-react';

// Registrera GSAP
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// --- 1. CUSTOM HOOKS (Från din gamla kod) ---

const useMousePosition = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const updatePosition = (e) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', updatePosition);
    return () => window.removeEventListener('mousemove', updatePosition);
  }, []);
  return position;
};

const useInactivityTimer = (timeoutMs = 300000, isActive) => {
  const [isLocked, setIsLocked] = useState(false);
  const timerRef = useRef(null);
  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsLocked(false);
    if (isActive) timerRef.current = setTimeout(() => setIsLocked(true), timeoutMs);
  };
  useEffect(() => {
    if (!isActive) return;
    const events = ['mousemove', 'keydown', 'scroll', 'click'];
    const handleActivity = () => { if (!isLocked) resetTimer(); };
    events.forEach(event => window.addEventListener(event, handleActivity));
    resetTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [isLocked, isActive]);
  return { isLocked, setIsLocked };
};

// --- 2. KOMPONENTER (Sammanslagna) ---

// Vattenstämpel
const SecurityWatermark = ({ identifier }) => {
  const mousePosition = useMousePosition();
  const text = `CONFIDENTIAL • ${identifier} • ${new Date().toLocaleDateString()}`;
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} className="absolute text-center py-8 transform -rotate-12 whitespace-nowrap"
          style={{
            top: `${(i * 20) % 100}%`, left: `${(i * 15) % 100}%`,
            filter: `blur(${Math.abs(mousePosition.x - window.innerWidth / 2) / 100}px)`,
            opacity: 0.05
          }}>
          <span className="text-xl font-black text-slate-900 uppercase tracking-widest">{text}</span>
        </div>
      ))}
     </div>
  );
};

// Låsskärm (Design från nya koden, logik från gamla)
const LockScreen = ({ onUnlock }) => (
  <div className="fixed inset-0 z-[10000] bg-stripe-bg flex flex-col items-center justify-center text-white animate-in fade-in">
    <div className="bg-white/10 p-8 rounded-full mb-8 backdrop-blur-md border border-white/10 animate-pulse">
      <Lock className="w-16 h-16 text-stripe-cyan" />
    </div>
    <h2 className="text-3xl font-bold mb-4">Session Secured</h2>
    <p className="text-slate-300 mb-8">Dashboard locked due to inactivity.</p>
    <button onClick={onUnlock} className="bg-stripe-accent px-8 py-3 rounded-full font-bold hover:bg-[#5449e3] transition-colors shadow-[0_0_20px_rgba(99,91,255,0.4)]">
      Unlock Dashboard
    </button>
  </div>
);

// Navbar (Stripe-design men med din gamla logik för menyer)
const Navbar = ({ activeTab, setActiveTab, privacyAccepted }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleTabClick = (tab) => {
    if (!privacyAccepted && tab !== 'privacy') {
      setActiveTab('privacy'); 
      alert('Please read and accept the Privacy Policy first'); 
      return;
    }
    setActiveTab(tab); 
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed w-full top-0 z-50 transition-all duration-300 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('pricing')}>
          <div className="w-8 h-8 bg-stripe-accent rounded-lg flex items-center justify-center">
            <ShieldCheck className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-stripe-bg tracking-tight">Auditor Veritas</span>
        </div>
        
        <nav className="hidden md:flex space-x-6">
           {/* Menyval anpassade efter dina gamla tabs */}
           <button onClick={() => handleTabClick('pricing')} className={`text-sm font-medium transition-colors ${activeTab === 'pricing' ? 'text-stripe-accent' : 'text-slate-600 hover:text-slate-900'}`}>Product</button>
           <button onClick={() => handleTabClick('pricing')} className="text-sm font-medium text-slate-600 hover:text-slate-900">Solutions</button>
           <button onClick={() => handleTabClick('create')} className={`text-sm font-medium transition-colors ${activeTab === 'create' ? 'text-stripe-accent' : 'text-slate-600 hover:text-slate-900'}`}>Developers</button>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
            <button onClick={() => handleTabClick('dashboard')} className="bg-stripe-dark text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-slate-800 transition-colors">
              Sign In
            </button>
        </div>

        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
};

// --- 3. DASHBOARD KOMPONENTER (Återställda från Block 1) ---

const StatsCards = ({ stats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-fade-in-up">
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg hover:shadow-xl transition duration-300">
      <div className="flex items-center mb-4">
        <div className="p-3 bg-blue-50 rounded-xl"><FileText className="w-6 h-6 text-blue-600" /></div>
        <h3 className="ml-3 text-sm font-bold text-slate-600 uppercase">Monthly Usage</h3>
      </div>
      <div className="flex justify-between items-end mb-3">
        <div className="text-3xl font-bold text-slate-900">{stats.monthlyEvents}</div>
        <div className="text-sm text-slate-500">of {stats.eventsLimit}</div>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: stats.utilization }}></div>
      </div>
    </div>
    
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg hover:shadow-xl transition duration-300">
      <div className="flex items-center mb-4">
        <div className="p-3 bg-purple-50 rounded-xl"><BarChart3 className="w-6 h-6 text-purple-600" /></div>
        <h3 className="ml-3 text-sm font-bold text-slate-600 uppercase">Total Events</h3>
      </div>
      <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalEvents}</div>
      <div className="text-sm text-slate-500">All time record</div>
    </div>
  </div>
);

const KeyRotation = ({ processor, apiKey, onKeyRotate }) => {
  const [isRotating, setIsRotating] = useState(false);

  const handleKeyRotation = async () => {
    if (!processor || !apiKey) return;
    setIsRotating(true);
    setTimeout(() => {
      const newKey = `av_${Math.random().toString(36).substring(2, 15)}`;
      onKeyRotate(newKey);
      setIsRotating(false);
      alert('🔑 API Key rotated successfully!');
    }, 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="p-3 bg-amber-50 rounded-xl mr-4"><RotateCw className="w-6 h-6 text-amber-600" /></div>
          <div><h3 className="text-lg font-bold text-slate-900">Key Rotation</h3><p className="text-slate-500 text-sm">Automated security</p></div>
        </div>
        <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">ACTIVE</div>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
          <span className="text-slate-500 text-sm">Current Key:</span>
          <code className="font-mono text-slate-800 text-sm">{apiKey ? `${apiKey.substring(0, 12)}...` : 'N/A'}</code>
        </div>
        <button onClick={handleKeyRotation} disabled={isRotating} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 flex items-center justify-center gap-2 transition-all">
          {isRotating ? <RefreshCw className="animate-spin w-4 h-4"/> : <RotateCw className="w-4 h-4"/>}
          {isRotating ? 'Rotating...' : 'Rotate API Key'}
        </button>
      </div>
    </div>
  );
};

// --- 4. STRIPE HERO & LANDING (Den nya designen) ---

const StripeHeroSection = ({ setActiveTab }) => {
  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-stripe-bg text-white pt-20">
      <AnimatedBackground /> {/* Extern komponent */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-stripe-cyan text-sm font-medium border border-white/10 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" /><span>Nu med Merkle Tree verifiering</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
            Financial compliance <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-stripe-cyan to-stripe-accent">rewritten for speed.</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Auditor Veritas hanterar revisionsloggar, kryptografisk signering och GDPR-efterlevnad i realtid.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
            <button onClick={() => setActiveTab('create')} className="px-8 py-4 rounded-full bg-stripe-accent hover:bg-[#5449e3] text-white font-bold shadow-[0_0_20px_rgba(99,91,255,0.4)] transition-all hover:scale-105">
              Start integration <ArrowRight className="inline ml-2 w-5 h-5" />
            </button>
            <button onClick={() => setActiveTab('pricing')} className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold backdrop-blur-sm transition-all">
              View Plans
            </button>
          </div>
        </div>
        <div className="flex justify-center lg:justify-end perspective-[1000px]">
          <PhoneDraw /> {/* Extern komponent */}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-b from-transparent to-white pointer-events-none" />
    </div>
  );
};

// Feature Grid (Stripe Style)
const FeatureGrid = () => (
  <div className="py-24 bg-white relative z-20">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { icon: ShieldCheck, title: "Bank-grade Security", desc: "SHA-256 hashing på varje event." },
          { icon: TreePine, title: "Merkle Proofs", desc: "Verifiera integritet kryptografiskt." },
          { icon: KeyRound, title: "Auto Key Rotation", desc: "Keys roteras automatiskt var 90:e dag." },
          { icon: FileLock2, title: "GDPR Ready", desc: "Lagring i Frankfurt (AWS eu-central-1)." }
        ].map((f, i) => (
          <div key={i} className="group p-8 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 border border-transparent hover:border-slate-100">
            <div className="w-12 h-12 bg-stripe-accent/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <f.icon className="w-6 h-6 text-stripe-accent" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{f.title}</h3>
            <p className="text-slate-600 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Modern Pricing (Återställd från Block 1)
const ModernPricingSection = ({ setActiveTab }) => {
  const plans = [
    { name: 'Starter', price: 0, events: '100', features: ['Basic Audit Trail', 'GDPR Compliance'], popular: false },
    { name: 'Professional', price: 49, events: '50,000', features: ['Advanced Analytics', 'Bulk Import', 'Merkle Trees'], popular: true },
    { name: 'Enterprise', price: 199, events: '500,000', features: ['Everything in Pro', 'SLA Guarantee', 'Custom Integrations'], popular: false }
  ];

  return (
    <div className="py-24 bg-slate-50 relative overflow-hidden border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-slate-900 mb-4">Simple, transparent pricing</h2>
          <p className="text-slate-500">No hidden fees.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className={`relative rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 ${plan.popular ? 'bg-white border-2 border-stripe-accent shadow-2xl' : 'bg-white border border-slate-200 shadow-lg'}`}>
              {plan.popular && (<div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-stripe-accent text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide">MOST POPULAR</div>)}
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
              <div className="mb-6 flex items-baseline"><span className="text-4xl font-black text-slate-900">${plan.price}</span><span className="text-slate-500 ml-2">/month</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feat, i) => (<li key={i} className="flex items-start text-slate-600 text-sm"><Check className="w-4 h-4 text-emerald-500 mr-3 mt-0.5" />{feat}</li>))}
              </ul>
              <button onClick={() => setActiveTab('create')} className={`w-full py-4 rounded-xl font-bold transition-all ${plan.popular ? 'bg-stripe-accent text-white hover:bg-[#5449e3]' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>
      </div>
     </div>
  );
};

// --- 5. MAIN APP LOGIC ---

function App() {
  const [activeTab, setActiveTab] = useState('pricing');
  const [processor, setProcessor] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [stats, setStats] = useState({ totalEvents: 1247, monthlyEvents: 234, eventsLimit: 50000, utilization: '25%' });
  
  const { isLocked, setIsLocked } = useInactivityTimer(300000, !!processor);

  useEffect(() => {
    const saved = localStorage.getItem('privacyAccepted');
    if (saved === 'true') setPrivacyAccepted(true);
  }, []);

  const handlePrivacyAccept = () => {
    localStorage.setItem('privacyAccepted', 'true');
    setPrivacyAccepted(true);
    setActiveTab('pricing');
  };

  if (isLocked && processor) return <LockScreen onUnlock={() => setIsLocked(false)} />;

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-stripe-accent selection:text-white">
      
      {processor && <SecurityWatermark identifier={processor.email || processor.companyName} />}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} privacyAccepted={privacyAccepted} />

      <main className="flex-1">
        {/* Privacy Gate */}
        {!privacyAccepted && activeTab === 'privacy' && (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-2xl bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Privacy & Compliance</h2>
              <p className="text-slate-600 mb-8">Auditor Veritas stores immutable audit logs. Data is encrypted (AES-256) and stored in EU.</p>
              <button onClick={handlePrivacyAccept} className="w-full bg-stripe-accent text-white py-4 rounded-xl font-bold hover:bg-[#5449e3]">Accept & Continue</button>
            </div>
          </div>
        )}

        {/* LANDING PAGE */}
        {activeTab === 'pricing' && (
          <>
            <StripeHeroSection setActiveTab={setActiveTab} />
            <FeatureGrid />
            <ModernPricingSection setActiveTab={setActiveTab} />
          </>
        )}

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="pt-32 px-6 max-w-7xl mx-auto min-h-screen">
             {!processor ? (
                <div className="max-w-md mx-auto mt-10 bg-white p-10 rounded-2xl shadow-2xl border border-slate-100 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                    <Lock className="w-8 h-8 text-slate-400" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-slate-900">Sign in to Dashboard</h2>
                  <p className="text-slate-500 mb-8">Enter your API key to access the ledger.</p>
                  <input type="text" placeholder="sk_live_..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-stripe-accent font-mono"
                    value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                  <button onClick={() => setProcessor({ companyName: 'Demo Corp' })} className="w-full bg-stripe-dark text-white p-4 rounded-xl font-bold hover:bg-slate-800 transition-colors">
                    Access Dashboard
                  </button>
                </div>
             ) : (
               <div className="animate-fade-in-up">
                 <div className="flex justify-between items-center mb-12">
                   <div>
                      <h1 className="text-4xl font-bold text-slate-900">{processor.companyName}</h1>
                      <p className="text-slate-500 mt-2">Environment: Production (EU-West)</p>
                   </div>
                   <button onClick={() => setProcessor(null)} className="text-red-500 font-medium hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">Sign Out</button>
                 </div>
                 
                 <StatsCards stats={stats} />
                 
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <KeyRotation processor={processor} apiKey={apiKey || 'sk_live_7823...'} onKeyRotate={setApiKey} />
                    {/* Mer dashboard content kan läggas här */}
                 </div>
               </div>
             )}
          </div>
        )}

        {activeTab === 'create' && (
           <div className="pt-32 px-6 flex justify-center bg-slate-50 min-h-screen">
             <CreateProcessor />
           </div>
        )}
      </main>
    </div>
  );
}

export default App;