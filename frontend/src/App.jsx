import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import CryptoJS from 'crypto-js';
import CreateProcessor from './components/CreateProcessor';
import { 
  ShieldCheck, BarChart3, Users, FileText, Check, 
  Lock, Zap, LayoutDashboard, LogOut, PlusCircle,
  Key, Database, Search, Server, Settings,
  ArrowRight, Play, ArrowLeft, Menu, X,
  Smartphone, Globe, Cpu, Code, Eye, EyeOff,
  Mail, Fingerprint, Terminal, AlertTriangle, Clock, RefreshCw, Download, Infinity,
  Hash, Link, Cpu as CpuIcon, Shield, Database as DatabaseIcon,
  TrendingUp, Activity, Lock as LockIcon, Cpu as ChipIcon,
  ChevronRight, ChevronLeft, Circle, Sparkles, Rocket,
  BadgeCheck, FileText as FileTextIcon
} from 'lucide-react';

// ✅ KORREKT FÖR NETLIFY: Används tom för att låta netlify.toml hantera Render/Supabase-proxyn.
const API_BASE_URL = ''; 

// --- HELPER IKONER ---
const Copy = ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>);
const User = ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);
const GlobeIconSVG = ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);

// --- SÄKERHETSHOOKS OCH UI KOMPONENTER (Kompakta versioner) ---

const useSecurityProtections = () => {
  useEffect(() => {
    const handleContextMenu = (e) => { e.preventDefault(); return false; };
    const handleKeyDown = (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44) { e.preventDefault(); /* alert('🔒 Security Alert: Screenshots are monitored.'); */ return false; }
      if (e.key === 's' && e.shiftKey && (e.metaKey || e.ctrlKey)) { e.preventDefault(); return false; }
      if (e.keyCode === 123) { e.preventDefault(); return false; }
    };
    const handleVisibilityChange = () => {
      if (document.hidden) { document.body.style.opacity = '0.1'; document.body.style.filter = 'blur(10px)'; } else { document.body.style.opacity = '1'; document.body.style.filter = 'none'; }
    };
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.body.style.userSelect = 'none';
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.body.style.userSelect = 'auto'; document.body.style.opacity = '1'; document.body.style.filter = 'none';
    };
  }, []);
};

const useInactivityTimer = (timeoutMs = 300000, isActive) => {
  const [isLocked, setIsLocked] = useState(false);
  const timerRef = useRef(null);
  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsLocked(false);
    if (isActive) { timerRef.current = setTimeout(() => setIsLocked(true), timeoutMs); }
  };
  useEffect(() => {
    if (!isActive) return;
    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
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

const SecurityWatermark = ({ identifier }) => {
  const text = `CONFIDENTIAL • ${identifier} • ${new Date().toLocaleDateString()}`;
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden flex flex-wrap content-center justify-center opacity-[0.03]">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="w-full text-center py-12 transform -rotate-12 whitespace-nowrap">
          <span className="text-xl font-black text-slate-900 uppercase tracking-widest">{text} • {text}</span>
        </div>
      ))}
    </div>
  );
};

const LockScreen = ({ onUnlock }) => (
  <div className="fixed inset-0 z-[10000] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center text-white animate-in fade-in duration-500">
    <div className="bg-white/10 p-6 rounded-full mb-6 animate-pulse"><Lock className="w-16 h-16 text-emerald-400" /></div>
    <h2 className="text-3xl font-bold mb-2">Session Locked</h2>
    <p className="text-slate-400 mb-8 text-center max-w-md">Dashboard locked due to inactivity.</p>
    <button onClick={onUnlock} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold text-lg transition transform hover:scale-105 shadow-lg">Unlock Dashboard</button>
  </div>
);

const Navbar = ({ activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuItems = ['Pricing', 'HowItWorks', 'Dashboard', 'Create', 'Events', 'Privacy'];
  return (
    <header className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white sticky top-0 z-50 shadow-lg border-b border-blue-700/50">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer hover:opacity-90 transition" onClick={() => { setActiveTab('pricing'); setMobileMenuOpen(false); }}><div className="bg-white/10 p-2 rounded-lg"><ShieldCheck className="w-6 h-6 text-emerald-400" /></div><div><h1 className="text-xl font-bold tracking-tight">Auditor Veritas</h1><p className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold hidden sm:block">GDPR Compliant Audit Trail</p></div></div>
          <nav className="hidden lg:flex space-x-1">{menuItems.map((item) => (<button key={item} onClick={() => setActiveTab(item.toLowerCase())} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === item.toLowerCase() ? 'bg-white/10 text-white shadow-sm backdrop-blur-sm' : 'text-blue-100 hover:bg-white/5 hover:text-white'}`}>{item === 'HowItWorks' ? 'How It Works' : item}</button>))}</nav>
          <button className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
        </div>
      </div>
    </header>
  );
};

const StatsCards = ({ stats, processor }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-100 hover:shadow-md transition duration-300 group"><div className="flex items-center mb-4"><div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition"><FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" /></div><h3 className="ml-3 text-sm font-semibold text-slate-600 uppercase tracking-wide">Monthly Usage</h3></div><div className="flex justify-between items-end mb-3"><div className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.monthlyEvents}</div><div className="text-sm text-slate-500 font-medium">of {stats.eventsLimit}</div></div><div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden"><div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: stats.utilization }}></div></div></div>
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-100 hover:shadow-md transition duration-300 group"><div className="flex items-center mb-4"><div className="p-2 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition"><Zap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" /></div><h3 className="ml-3 text-sm font-semibold text-slate-600 uppercase tracking-wide">Plan Status</h3></div><div className="text-2xl sm:text-3xl font-bold text-slate-900 capitalize mb-1">{processor?.plan || 'Inactive'}</div><div className="text-sm text-emerald-600 font-medium flex items-center"><Check className="w-4 h-4 mr-1" /> Active subscription</div></div>
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-100 hover:shadow-md transition duration-300 group"><div className="flex items-center mb-4"><div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition"><BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" /></div><h3 className="ml-3 text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Events</h3></div><div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">{stats.totalEvents}</div><div className="text-sm text-slate-500 font-medium">All time record</div></div>
  </div>
);

const LockedFeature = ({ title, message, onAcceptCookies, desc, setActiveTab }) => {
  if (onAcceptCookies) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="bg-slate-100 w-20 h-20 rounded-2xl flex items-center justify-center mb-6"><Lock className="w-10 h-10 text-slate-400" /></div>
        <h3 className="text-2xl font-bold text-slate-700 mb-4">{title}</h3>
        <p className="text-slate-500 max-w-md mb-8 text-lg">{message}</p>
        <button onClick={onAcceptCookies} className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition shadow-lg hover:shadow-xl transform hover:scale-105">Accept Cookies to Unlock</button>
      </div>
    );
  }
  return (
    <div className="bg-slate-50/80 backdrop-blur-sm rounded-2xl p-8 border border-dashed border-slate-300 flex flex-col items-center justify-center text-center h-full hover:bg-slate-50 transition">
      <div className="bg-slate-200 p-4 rounded-2xl mb-6"><Lock className="w-12 h-12 text-slate-500" /></div>
      <h3 className="text-xl font-bold text-slate-800 mb-4">{title}</h3>
      <p className="text-slate-500 mb-8 max-w-sm leading-relaxed">{desc}</p>
      <button onClick={() => setActiveTab('pricing')} className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition shadow-lg hover:shadow-xl transform hover:scale-105">Upgrade to Unlock</button>
    </div>
  );
};

const PrivacyPolicy = ({ setActiveTab, cookiesAccepted, onAcceptCookies }) => (
  <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 px-4 sm:px-0">
    {!cookiesAccepted && (
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center shadow-sm">
        <div className="flex items-center justify-center mb-3"><ShieldCheck className="w-6 h-6 text-blue-600 mr-2" /><h3 className="text-lg font-bold text-blue-800">Accept Cookies to Continue</h3></div>
        <p className="text-blue-700 mb-4">To ensure GDPR compliance and access all features of Auditor Veritas, please accept our essential security cookies.</p>
        <button onClick={onAcceptCookies} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg">Accept Cookies & Continue</button>
      </div>
    )}
    <div className="text-center mb-12"><div className="bg-emerald-50 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl rotate-3 flex items-center justify-center mx-auto mb-6 shadow-sm"><ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600 -rotate-3" /></div><h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">Privacy & Compliance</h2></div>
    {/* Mer Privacy content här... */}
    <div className="text-center pt-8 pb-4"><button onClick={() => setActiveTab('dashboard')} className="text-blue-600 font-semibold hover:text-blue-700 transition flex items-center justify-center mx-auto">← Back to Dashboard</button></div>
  </div>
);


const HowItWorks = ({ setActiveTab, cookiesAccepted, onAcceptCookies }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [terminalOutput, setTerminalOutput] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [liveEvents, setLiveEvents] = useState([]);
  const [hashInput, setHashInput] = useState('');
  const [hashOutput, setHashOutput] = useState('');
  const [isHashing, setIsHashing] = useState(false);
  const [securityScore, setSecurityScore] = useState(100);
  const [complianceStatus, setComplianceStatus] = useState('verified');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const [chain, setChain] = useState([
    { id: 1, hash: 'a1b2', status: 'valid' },
    { id: 2, hash: 'c3d4', status: 'valid' },
    { id: 3, hash: 'e5f6', status: 'valid' }
  ]);
  const [isTampering, setIsTampering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const steps = [
    { title: "Secure Registration", icon: Key, description: "Get your enterprise-grade API key with military-grade security protocols.", details: ["256-bit API key generation", "Instant secure container provisioning"], visual: "key", action: "create", actionText: "Get Key", gradient: "from-blue-500 to-cyan-500", bgGradient: "from-blue-50 to-indigo-100" },
    { title: "Smart Event Processing", icon: Terminal, description: "Integrate with simple API calls. All data is encrypted and hashed automatically.", details: ["Simple REST API integration", "Automatic SHA-256 hashing"], visual: "code", action: "events", actionText: "Try Logging", gradient: "from-purple-500 to-pink-500", bgGradient: "from-slate-900 to-slate-800" },
    { title: "Immutable Audit Trail", icon: ShieldCheck, description: "Every event is cryptographically chained to prevent tampering and ensure integrity.", details: ["Cryptographic chain linking", "Tamper-evident design"], visual: "chain", action: "privacy", actionText: "Learn More", gradient: "from-green-500 to-emerald-500", bgGradient: "from-slate-50 to-slate-100" },
    { title: "Real-time Dashboard", icon: BarChart3, description: "Monitor all activity with comprehensive analytics and compliance reporting.", details: ["Live activity monitoring", "Compliance reporting"], visual: "dashboard", action: "dashboard", actionText: "View Dashboard", gradient: "from-orange-500 to-red-500", bgGradient: "from-amber-50 to-orange-100" }
  ];

  const currentStep = steps[activeStep];
  
  const generateApiKey = () => { if (!cookiesAccepted) return; setIsGeneratingKey(true); setTimeout(() => { const newKey = `av_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`; setApiKey(newKey); setIsGeneratingKey(false); }, 2000); };
  const simulateApiCall = () => { if (!cookiesAccepted) return; setIsSimulating(true); setTerminalOutput(null); setTimeout(() => { setTerminalOutput({ status: 201, message: "Event Logged Successfully", hash: "8f9a3b2c" }); setIsSimulating(false); }, 1500); };
  const calculateHash = () => { if (!hashInput.trim()) return; setIsHashing(true); setTimeout(() => { const hash = CryptoJS.SHA256(hashInput).toString(); setHashOutput(hash); setIsHashing(false); }, 1000); };
  const simulateTamper = () => {
    if (!cookiesAccepted || isTampering) return; setIsTampering(true); 
    const newChain = [...chain]; newChain[1].status = 'invalid'; setChain(newChain);
    setTimeout(() => { setChain(newChain.map(block => ({ ...block, status: 'invalid' }))); }, 600);
    setTimeout(() => { setChain([{ id: 1, hash: 'a1b2', status: 'valid' }, { id: 2, hash: 'c3d4', status: 'valid' }, { id: 3, hash: 'e5f6', status: 'valid' }]); setIsTampering(false); }, 3000);
  };

  const renderVisualization = () => {
    if (!cookiesAccepted) { return (<div className="bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 h-96 flex items-center justify-center text-center"><LockedFeature title="Accept Cookies to Run Demo" message="Interactive demonstrations are disabled until essential security cookies are accepted." onAcceptCookies={onAcceptCookies} /></div>); }

    switch(currentStep.visual) {
      case 'key': return (<div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200 text-center h-96 flex flex-col items-center justify-center"><div className="bg-white p-4 rounded-xl shadow-lg border inline-block mb-4"><Key className="w-12 h-12 text-blue-600" /></div><p className="text-center text-blue-800 font-medium text-sm">Your unique API Key: <code className="bg-blue-100 px-2 py-1 rounded">av_123456789abc</code></p></div>);
      case 'code': return (<div className="bg-slate-900 rounded-xl border border-slate-700 font-mono text-sm overflow-hidden h-96 flex flex-col"><div className="bg-slate-800 px-4 py-2 flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div className="w-3 h-3 rounded-full bg-green-500"></div></div><div className="p-4 text-slate-300 flex-grow overflow-y-auto"><p><span className="text-emerald-400">$</span> curl -X POST /api/events</p>{isSimulating && <p className="text-yellow-400 mt-2">Encrypting payload...</p>}{terminalOutput && (<div className="mt-4 bg-slate-800 rounded p-3 animate-in fade-in"><p className="text-green-400">{`{ "status": 201, "hash": "${terminalOutput.hash}" }`}</p></div>)}{!isSimulating && !terminalOutput && (<button onClick={simulateApiCall} className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-xs flex items-center"><Play className="w-3 h-3 mr-2" /> Run Request</button>)}</div></div>);
      case 'chain': return (<div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center h-96 flex flex-col justify-center items-center"><div className="flex justify-center space-x-2 mb-8">{chain.map((block, i) => (<div key={block.id} className="flex items-center"><div className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${block.status === 'valid' ? 'bg-white border-emerald-400 shadow-sm' : 'bg-red-50 border-red-500 shadow-lg scale-110'} ${isTampering ? 'animate-pulse' : ''}`}>{block.status === 'valid' ? <Check className="w-6 h-6 text-emerald-500"/> : <AlertTriangle className="w-6 h-6 text-red-500"/>}</div>{i < 2 && <div className={`w-4 h-0.5 mx-1 transition-all duration-300 ${block.status === 'invalid' && chain[i + 1]?.status === 'invalid' ? 'bg-red-300' : 'bg-slate-300'}`}></div>}</div>))}</div><div className={`mb-4 p-3 rounded-lg transition-all duration-300 ${isTampering ? 'bg-red-100 border border-red-200 text-red-700' : 'bg-emerald-100 border border-emerald-200 text-emerald-700'}`}><p className="text-sm font-medium flex items-center justify-center">{isTampering ? <>🚨 SECURITY BREACH DETECTED</> : <>✅ CHAIN INTEGRITY VERIFIED</>}</p></div><button onClick={simulateTamper} disabled={isTampering} className={`text-xs border px-4 py-2 rounded-lg font-medium transition-all ${isTampering ? 'opacity-50' : 'border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:shadow-md'}`}>Simulate Hack Attack</button></div>);
      case 'dashboard': return (<div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl p-6 border border-amber-200 h-96 flex flex-col justify-center items-center"><div className="w-full h-full p-4 bg-white rounded-xl shadow-md flex flex-col justify-center items-center"><BarChart3 className="w-16 h-16 text-purple-600 opacity-20 mb-3" /><p className="text-slate-600 font-semibold">Real-time Data Stream</p><p className="text-xs text-slate-500">Events/Min: 23</p></div></div>);
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 px-4 sm:px-0 animate-in fade-in">
      <div className="text-center pt-8"><h1 className="text-4xl font-extrabold text-slate-900 mb-4">How It Works</h1><p className="text-lg text-slate-600 max-w-2xl mx-auto">Secure, compliant audit logging in four simple steps.</p></div>
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 bg-slate-50 border-b border-slate-200">{steps.map((step, index) => (<button key={index} onClick={() => setActiveStep(index)} className={`p-4 text-sm font-bold transition-all flex flex-col items-center justify-center ${activeStep === index ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}><step.icon className="w-5 h-5 mb-1" />{step.title}</button>))}</div>
        <div className="p-8 flex flex-col lg:flex-row gap-8 items-center">
          <div className="w-full lg:w-1/2">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">{steps[activeStep].title}</h3>
            <p className="text-lg text-slate-600 mb-6">{steps[activeStep].description}</p>
            <ul className="space-y-2 mb-6">{steps[activeStep].details?.map((detail, i) => (<li key={i} className="flex items-start text-sm text-slate-600"><div className="mt-0.5 mr-3 min-w-[20px]"><Check className="w-4 h-4 text-green-500 mr-2 mt-0.5" /></div>{detail}</li>))}</ul>
            <button onClick={() => cookiesAccepted && setActiveTab(steps[activeStep].action)} disabled={!cookiesAccepted} className={`px-6 py-2 rounded-lg font-bold transition ${cookiesAccepted ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}>{steps[activeStep].actionText} →</button>
          </div>
          <div className="w-full lg:w-1/2">{renderVisualization()}</div>
        </div>
      </div>
    </div>
  );
};


// --- HUVUDFUNKTIONEN (Slutgiltig version) ---

function App() {
  const [activeTab, setActiveTab] = useState('privacy');
  const [processor, setProcessor] = useState(null);
  const [events, setEvents] = useState([]);
  const [apiKey, setApiKey] = useState('');
  const [eventData, setEventData] = useState({ event_type: '', event_data: '{}', user_identifier: '' });
  const [stats, setStats] = useState({ totalEvents: 0, monthlyEvents: 0, eventsLimit: 100, utilization: '0%' });
  const [pricingPlans, setPricingPlans] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [cookiesAccepted, setCookiesAccepted] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  
  const { isLocked, setIsLocked } = useInactivityTimer(300000, !!processor && cookiesAccepted);
  useSecurityProtections();

  useEffect(() => {
    const savedCookies = localStorage.getItem('cookiesAccepted');
    const savedApiKey = localStorage.getItem('auditorApiKey');
    if (savedCookies === 'true') { setCookiesAccepted(true); setShowCookieBanner(false); setActiveTab('pricing'); } else { setShowCookieBanner(true); }
    if (savedApiKey) setApiKey(savedApiKey);

    setPricingPlans({ starter: { name: 'Starter', events: 100, price: 0, features: ['Basic Audit Trail', 'GDPR Compliance', 'Email Support', '100 Events/Month'] }, professional: { name: 'Professional', events: 50000, price: 49, features: ['Advanced Analytics', 'Bulk Import', 'Priority Support', 'Custom Events', '50K Events/Month'], featured: true }, enterprise: { name: 'Enterprise', events: 500000, price: 199, features: ['Everything in Professional', 'Dedicated Support', 'SLA Guarantee', 'Custom Integrations', '500K Events/Month'] } });
  }, []);

  const handleAcceptCookies = () => { setCookiesAccepted(true); setShowCookieBanner(false); localStorage.setItem('cookiesAccepted', 'true'); setActiveTab('pricing'); };

  const handleGDPRExport = async () => { alert("GDPR Export simulation: JSON data ready for download."); };
  const handleKeyRotation = async () => {
    if (!window.confirm("WARNING: This will invalidate the old API key... Are you sure?")) { return; }
    alert("API Key Rotation NOT IMPLEMENTED IN BACKEND. SIMULATION: New key generated!");
    const newFakeKey = `av_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setApiKey(newFakeKey);
    localStorage.setItem('auditorApiKey', newFakeKey);
    setProcessor(prev => ({ ...prev, apiKey: newFakeKey }));
  };

  const apiCall = async (endpoint, options = {}) => {
    if (!cookiesAccepted) { throw new Error('Cookies must be accepted to use API features'); }
    const config = { headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, ...options.headers }, ...options };
    if (options.body) config.body = JSON.stringify(options.body);
    try {
      // API_BASE_URL är tom, så anropet blir relativt (/api/dashboard)
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config); 
      if (response.status === 204) return null;
      const text = await response.text();
      let data;
      try { data = text ? JSON.parse(text) : {}; } catch (e) { throw new Error(`Server Error (${response.status}). Kontrollera att Render/Supabase är igång och netlify.toml är korrekt.`); }
      if (!response.ok) throw new Error(data.error || `HTTP error! status: ${response.status}`);
      return data;
    } catch (error) { console.error('API call failed:', error); throw error; }
  };

  const fetchDashboard = async () => {
    if (!apiKey) return;
    setIsLoading(true);
    try {
      const data = await apiCall('/api/dashboard');
      if(data) { setProcessor(data.processor); setStats(data.stats); localStorage.setItem('auditorProcessor', JSON.stringify(data.processor)); localStorage.setItem('auditorApiKey', apiKey); }
    } catch (error) { alert(`Failed to access dashboard: ${error.message}`); } finally { setIsLoading(false); }
  };

  const logEvent = async (e) => {
    e.preventDefault();
    if (!cookiesAccepted) { alert('❌ You must accept cookies before logging events'); return; }
    if (!apiKey) return alert('❌ API Key required');
    setIsLoading(true);
    try {
      let hashedId = null;
      if (eventData.user_identifier) hashedId = CryptoJS.SHA256(eventData.user_identifier.trim().toLowerCase()).toString();
      await apiCall('/api/events', { method: 'POST', body: { ...eventData, event_data: JSON.parse(eventData.event_data || '{}'), user_identifier: hashedId } });
      alert('✅ Event logged successfully!');
      fetchDashboard();
      setEventData({ event_type: '', event_data: '{}', user_identifier: '' });
    } catch (error) { alert(`Error: ${error.message}`); } finally { setIsLoading(false); }
  };

  if (isLocked && processor) { return <LockScreen onUnlock={() => setIsLocked(false)} />; }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {processor && <SecurityWatermark identifier={processor.email || processor.companyName} />}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} cookiesAccepted={cookiesAccepted} />

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl flex-grow z-10">
        {activeTab === 'pricing' && (<div className="space-y-12 animate-in"><div className="text-center max-w-2xl mx-auto pt-8 px-4"><h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">Transparent Pricing</h2></div><div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-0">{Object.entries(pricingPlans).map(([key, plan]) => (<div key={key} className={`relative rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:scale-105 hover:shadow-xl flex flex-col ${plan.featured ? 'bg-white ring-4 ring-blue-500/20 shadow-xl scale-105' : 'bg-white shadow-lg border border-slate-100'}`}><h3 className="text-2xl font-bold text-slate-900 mb-2 capitalize">{plan.name}</h3><div className="mb-6 flex items-baseline justify-center"><span className="text-3xl sm:text-4xl font-extrabold text-slate-900">${plan.price}</span><span className="text-slate-500 ml-2 font-medium">/month</span></div><ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-1">{plan.features.map((feat, i) => (<li key={i} className="flex items-start text-slate-600 text-sm"><Check className="w-4 h-4 text-emerald-500 mr-2 mt-0.5"/>{feat}</li>))}</ul><button onClick={() => setActiveTab('create')} className="w-full py-3 sm:py-3.5 rounded-xl font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 transition">{key === 'starter' ? 'Start for Free' : `Choose ${plan.name}`}</button></div>))}</div></div>)}

        {activeTab === 'howitworks' && <HowItWorks setActiveTab={setActiveTab} cookiesAccepted={cookiesAccepted} onAcceptCookies={handleAcceptCookies} />}

        {activeTab === 'dashboard' && (<div className="animate-in px-4 sm:px-0">{!cookiesAccepted ? (<div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100"><LockedFeature title="Dashboard Locked" message="Accept cookies to access your dashboard." onAcceptCookies={handleAcceptCookies} /></div>) : !processor ? (<div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-100 mt-6 sm:mt-10"><div className="text-center mb-6 sm:mb-8"><div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"><Lock className="w-6 h-6 text-blue-600" /></div><h2 className="text-xl font-bold text-slate-900">Access Dashboard</h2><p className="text-slate-500 text-sm mt-2">Enter your API key to securely manage your audit events</p></div><input type="text" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="av_xxxxxxxx..." className="w-full p-3 border border-slate-300 rounded-xl my-4 outline-none focus:ring-2 focus:ring-blue-500" /><button onClick={fetchDashboard} disabled={isLoading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">{isLoading ? 'Loading...' : 'Access Dashboard'}</button></div>) : (<div><div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100"><div><h2 className="text-2xl font-bold text-slate-900">{processor.companyName}</h2><p className="text-sm text-slate-500">Dashboard</p></div><div className="flex space-x-2"><button onClick={handleGDPRExport} className="px-4 py-2 bg-slate-50 border rounded-lg text-sm font-medium hover:bg-slate-100 flex items-center"><Download className="w-4 h-4 mr-2 text-blue-600"/> Export Data</button><button onClick={handleKeyRotation} className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 hover:shadow-sm transition text-amber-700 font-medium text-sm flex items-center"><RefreshCw className="w-4 h-4 mr-2"/> Rotate Key</button><button onClick={() => {setProcessor(null); setApiKey('');}} className="px-4 py-2 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 hover:text-red-700 transition text-red-600 font-medium text-sm">Sign Out</button></div></div><StatsCards stats={stats} processor={processor} cookiesAccepted={cookiesAccepted} onAcceptCookies={handleAcceptCookies} /><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-xl border border-slate-100"><div className="flex justify-between mb-4"><h3 className="font-bold">Analytics</h3>{processor.plan !== 'starter' && <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded">Active</span>}</div>{processor.plan === 'starter' ? <LockedFeature title="Analytics Locked" desc="Upgrade to view insights." setActiveTab={setActiveTab} /> : <div className="h-48 bg-blue-50 rounded-xl flex items-center justify-center text-blue-400"><BarChart3 className="w-12 h-12 opacity-50"/></div>}</div><div className="bg-white p-6 rounded-xl border border-slate-100"><div className="flex justify-between mb-4"><h3 className="font-bold">Bulk Import</h3>{processor.plan !== 'starter' && <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded">Active</span>}</div>{processor.plan === 'starter' ? <LockedFeature title="Bulk Import Locked" desc="Process CSV files." setActiveTab={setActiveTab} /> : <div className="h-48 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400"><PlusCircle className="w-8 h-8 mb-2"/></div>}</div></div></div>)}</div>)}

        {activeTab === 'create' && (<div className="max-w-2xl mx-auto pt-6 animate-in">{cookiesAccepted ? (<CreateProcessor />) : (<div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100 text-center"><LockedFeature title="Registration Locked" message="You must accept cookies to create an account and get your API key." onAcceptCookies={handleAcceptCookies} /></div>)}</div>)}

        {activeTab === 'events' && (<div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-slate-100 mt-6 animate-in">{cookiesAccepted ? (<><div className="flex items-center mb-8 pb-6 border-b border-slate-100"><div className="p-3 bg-blue-50 rounded-xl mr-4"><FileText className="w-7 h-7 text-blue-600"/></div><div><h2 className="text-2xl font-bold text-slate-900">Log New Event</h2><p className="text-slate-500 text-sm mt-1">Manually record an audit event in your secure trail</p></div></div><form onSubmit={logEvent} className="space-y-6"><input type="text" className="w-full p-3 border rounded-lg" placeholder="Event Type" value={eventData.event_type} onChange={e => setEventData({...eventData, event_type: e.target.value})} required /><input type="text" className="w-full p-3 border rounded-lg" placeholder="User ID" value={eventData.user_identifier} onChange={e => setEventData({...eventData, user_identifier: e.target.value})} /><textarea className="w-full p-3 border rounded-lg font-mono text-sm" placeholder='{"data": "value"}' value={eventData.event_data} onChange={e => setEventData({...eventData, event_data: e.target.value})} required /><button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">{isLoading ? 'Logging...' : 'Log Event'}</button></form></>) : (<LockedFeature title="Event Logging Locked" message="Accept cookies to unlock event logging functionality." onAcceptCookies={handleAcceptCookies} />)}</div>)}

        {activeTab === 'privacy' && <PrivacyPolicy setActiveTab={setActiveTab} cookiesAccepted={cookiesAccepted} onAcceptCookies={handleAcceptCookies} />}

      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-center">
        <div className="container mx-auto px-6"><div className="flex justify-center mb-4"><ShieldCheck className="w-8 h-8 text-blue-500" /></div><p className="text-sm mb-6">Enterprise-grade audit logging.</p><div className="flex justify-center space-x-6 text-sm font-medium mb-6"><button onClick={() => setActiveTab('privacy')} className="hover:text-white">Privacy</button><a href="mailto:hazarnodesweden@outlook.com" className="hover:text-white">Contact</a></div><p className="text-xs">&copy; 2025 Auditor Veritas.</p></div>
      </footer>

      {showCookieBanner && (<div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4"><div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center"><ShieldCheck className="w-12 h-12 text-blue-600 mx-auto mb-4" /><h3 className="text-xl font-bold mb-2">Privacy & Security</h3><p className="text-slate-600 mb-6 text-sm">We use essential cookies for security. No tracking.</p><button onClick={handleAcceptCookies} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition mb-3">Accept</button><button onClick={() => { setActiveTab('privacy'); setShowCookieBanner(false); }} className="text-sm text-blue-600 underline">Read Policy</button></div></div>)}
    </div>
  );
}

export default App;