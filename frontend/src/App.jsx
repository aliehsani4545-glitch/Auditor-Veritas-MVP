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
  BadgeCheck, Copy as CopyIcon
} from 'lucide-react';

// ✅ VIKTIGT: Fixad URL för att appen ska fungera lokalt
const API_BASE_URL = 'http://localhost:5000'; 

// --- HELPER ICONS (För den snygga designen) ---
const Copy = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
);
const User = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);
const GlobeIconSVG = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

// --- SÄKERHETSHOOKS (Från din funktionella kod) ---
const useSecurityProtections = () => {
  useEffect(() => {
    const handleContextMenu = (e) => { e.preventDefault(); return false; };
    
    const handleKeyDown = (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        // alert('🔒 Security Alert: Screenshots are monitored.'); // Avkommentera för strikt läge
        return false;
      }
      if (e.key === 's' && e.shiftKey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        return false;
      }
      if (e.keyCode === 123) { // F12
        e.preventDefault();
        return false;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.body.style.opacity = '0.1';
        document.body.style.filter = 'blur(10px)';
      } else {
        document.body.style.opacity = '1';
        document.body.style.filter = 'none';
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.body.style.userSelect = 'none';
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.body.style.userSelect = 'auto';
      document.body.style.opacity = '1';
      document.body.style.filter = 'none';
    };
  }, []);
};

const useInactivityTimer = (timeoutMs = 300000, isActive) => {
  const [isLocked, setIsLocked] = useState(false);
  const timerRef = useRef(null);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsLocked(false);
    if (isActive) {
      timerRef.current = setTimeout(() => setIsLocked(true), timeoutMs);
    }
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

// --- UI KOMPONENTER ---

const SecurityWatermark = ({ identifier }) => {
  const text = `CONFIDENTIAL • ${identifier} • ${new Date().toLocaleDateString()}`;
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden flex flex-wrap content-center justify-center opacity-[0.03]">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="w-full text-center py-12 transform -rotate-12 whitespace-nowrap">
          <span className="text-xl font-black text-slate-900 uppercase tracking-widest">
            {text} • {text}
          </span>
        </div>
      ))}
    </div>
  );
};

const LockScreen = ({ onUnlock }) => (
  <div className="fixed inset-0 z-[10000] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center text-white animate-in fade-in duration-500">
    <div className="bg-white/10 p-6 rounded-full mb-6 animate-pulse">
      <Lock className="w-16 h-16 text-emerald-400" />
    </div>
    <h2 className="text-3xl font-bold mb-2">Session Locked</h2>
    <p className="text-slate-400 mb-8 text-center max-w-md">Dashboard locked due to inactivity.</p>
    <button onClick={onUnlock} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold text-lg transition transform hover:scale-105 shadow-lg">Unlock Dashboard</button>
  </div>
);

const Navbar = ({ activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuItems = ['Pricing', 'HowItWorks', 'Dashboard', 'Create', 'Events', 'Privacy'];

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-md border-b border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer hover:opacity-90 transition" onClick={() => { setActiveTab('pricing'); setMobileMenuOpen(false); }}>
            <div className="bg-blue-600 p-2 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Auditor Veritas</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold hidden sm:block">GDPR Compliant Audit Trail</p>
            </div>
          </div>
          <nav className="hidden lg:flex space-x-1">
            {menuItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveTab(item.toLowerCase())}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === item.toLowerCase() 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item === 'HowItWorks' ? 'How It Works' : item}
              </button>
            ))}
          </nav>
          <button className="lg:hidden p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-slate-800 pt-4 animate-in fade-in slide-in-from-top-2">
            <nav className="flex flex-col space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item}
                  onClick={() => { setActiveTab(item.toLowerCase()); setMobileMenuOpen(false); }}
                  className={`px-4 py-3 rounded-lg text-left font-medium transition-all duration-200 ${
                    activeTab === item.toLowerCase() ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {item === 'HowItWorks' ? 'How It Works' : item}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

const StatsCards = ({ stats, processor }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition">
      <div className="flex items-center mb-4"><div className="p-2 bg-blue-50 rounded-lg"><FileText className="w-6 h-6 text-blue-600" /></div><h3 className="ml-3 text-sm font-semibold text-slate-600 uppercase">Monthly Usage</h3></div>
      <div className="text-3xl font-bold text-slate-900 mb-2">{stats.monthlyEvents}</div>
      <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: stats.utilization }}></div></div>
    </div>
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition">
      <div className="flex items-center mb-4"><div className="p-2 bg-amber-50 rounded-lg"><Zap className="w-6 h-6 text-amber-500" /></div><h3 className="ml-3 text-sm font-semibold text-slate-600 uppercase">Plan Status</h3></div>
      <div className="text-3xl font-bold text-slate-900 capitalize">{processor?.plan || 'Inactive'}</div>
    </div>
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition">
      <div className="flex items-center mb-4"><div className="p-2 bg-purple-50 rounded-lg"><BarChart3 className="w-6 h-6 text-purple-600" /></div><h3 className="ml-3 text-sm font-semibold text-slate-600 uppercase">Total Events</h3></div>
      <div className="text-3xl font-bold text-slate-900">{stats.totalEvents}</div>
    </div>
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
  <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 px-4 sm:px-0 pb-12">
    {!cookiesAccepted && (
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center shadow-sm">
        <div className="flex items-center justify-center mb-3">
          <ShieldCheck className="w-6 h-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-bold text-blue-800">Accept Cookies to Continue</h3>
        </div>
        <p className="text-blue-700 mb-4">To ensure GDPR compliance, please accept our essential security cookies.</p>
        <button onClick={onAcceptCookies} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg">Accept & Continue</button>
      </div>
    )}
    <div className="text-center mb-8">
      <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Privacy & Compliance</h2>
      <p className="text-lg text-slate-600">We process data in strict accordance with GDPR Article 6(1)(b).</p>
    </div>
    {/* Content from previous snippets... */}
    <div className="text-center">
      <button onClick={() => setActiveTab('dashboard')} className="text-blue-600 font-semibold hover:underline">← Back to Dashboard</button>
    </div>
  </div>
);

// --- DEN SNYGGA & AVANCERADE HOW IT WORKS (Med Fixar) ---
const HowItWorks = ({ setActiveTab, cookiesAccepted, onAcceptCookies }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [terminalOutput, setTerminalOutput] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [events, setEvents] = useState([]);
  const [liveEvents, setLiveEvents] = useState([]);
  const [hashInput, setHashInput] = useState('');
  const [hashOutput, setHashOutput] = useState('');
  const [isHashing, setIsHashing] = useState(false);
  const [securityScore, setSecurityScore] = useState(100);
  const [complianceStatus, setComplianceStatus] = useState('verified');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const [chain, setChain] = useState([
    { id: 1, hash: 'a1b2c3d4', prevHash: '0000', status: 'valid', timestamp: Date.now() - 3000 },
    { id: 2, hash: 'e5f6g7h8', prevHash: 'a1b2c3d4', status: 'valid', timestamp: Date.now() - 2000 },
    { id: 3, hash: 'i9j0k1l2', prevHash: 'e5f6g7h8', status: 'valid', timestamp: Date.now() - 1000 }
  ]);

  const [isTampering, setIsTampering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const steps = [
    {
      title: "Secure Registration", icon: Shield, description: "Get your enterprise-grade API key with military-grade security protocols.",
      details: ["256-bit API key generation", "Instant secure container provisioning", "Multi-factor authentication ready", "GDPR Article 30 compliant setup"],
      visual: "key", action: "create", actionText: "Get Started", gradient: "from-blue-500 to-cyan-500", bgGradient: "from-blue-50 to-cyan-50"
    },
    {
      title: "Smart Event Processing", icon: CpuIcon, description: "Real-time event processing with automatic PII detection and cryptographic hashing.",
      details: ["Smart PII detection & auto-hashing", "Real-time event validation", "JSON schema enforcement", "Rate limiting & throttling"],
      visual: "code", action: "events", actionText: "Try Live Demo", gradient: "from-purple-500 to-pink-500", bgGradient: "from-purple-50 to-pink-50"
    },
    {
      title: "Immutable Audit Chain", icon: Link, description: "Cryptographically chained events with tamper-evident architecture and real-time integrity verification.",
      details: ["Merkle tree architecture", "Real-time integrity checks", "Tamper-evident design", "Automated compliance scoring"],
      visual: "chain", action: "privacy", actionText: "View Security", gradient: "from-green-500 to-emerald-500", bgGradient: "from-green-50 to-emerald-50"
    },
    {
      title: "Enterprise Dashboard", icon: Activity, description: "Comprehensive real-time monitoring with advanced analytics and compliance reporting.",
      details: ["Live event streaming", "Advanced analytics engine", "Compliance reporting", "Automated audit trails"],
      visual: "dashboard", action: "dashboard", actionText: "Access Dashboard", gradient: "from-orange-500 to-red-500", bgGradient: "from-orange-50 to-red-50"
    }
  ];

  const currentStep = steps[activeStep];

  const generateApiKey = () => {
    if (!cookiesAccepted) return;
    setIsGeneratingKey(true);
    setTimeout(() => {
      const newKey = `av_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      setApiKey(newKey);
      setIsGeneratingKey(false);
    }, 2000);
  };

  const simulateApiCall = () => {
    if (!cookiesAccepted) return;
    setIsSimulating(true); setTerminalOutput(null);
    const newEvent = { id: Date.now(), type: 'user_login', user: 'user_' + Math.random().toString(36).substring(7), timestamp: new Date().toISOString(), hash: Math.random().toString(36).substring(2, 10) };
    setTimeout(() => {
      setTerminalOutput({ status: 201, message: "Event Logged Successfully", hash: newEvent.hash, event: newEvent });
      setEvents(prev => [...prev, newEvent]); setIsSimulating(false);
    }, 1500);
  };

  const calculateHash = () => {
    if (!hashInput.trim()) return;
    setIsHashing(true);
    setTimeout(() => {
      const hash = CryptoJS.SHA256(hashInput).toString();
      setHashOutput(hash); setIsHashing(false);
    }, 1000);
  };

  useEffect(() => {
    if (activeStep === 3 && cookiesAccepted) {
      const interval = setInterval(() => {
        const eventTypes = ['user_login', 'data_access', 'file_upload', 'permission_change'];
        const newEvent = { id: Date.now(), type: eventTypes[Math.floor(Math.random() * eventTypes.length)], user: 'user_' + Math.random().toString(36).substring(7), timestamp: new Date().toLocaleTimeString(), status: Math.random() > 0.1 ? 'success' : 'warning' };
        setLiveEvents(prev => [newEvent, ...prev.slice(0, 9)]);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [activeStep, cookiesAccepted]);

  const simulateTamper = () => {
    if (!cookiesAccepted || isTampering) return;
    setIsTampering(true); setSecurityScore(45); setComplianceStatus('compromised');
    const newChain = [...chain]; newChain[1].status = 'invalid'; newChain[1].hash = 'HACKED_' + Math.random().toString(36).substring(2, 8); setChain(newChain);
    setTimeout(() => {
      const spreadChain = newChain.map(block => ({ ...block, status: 'invalid', hash: 'HACKED_' + Math.random().toString(36).substring(2, 8) }));
      setChain(spreadChain);
    }, 600);
    setTimeout(() => {
      setChain([{ id: 1, hash: 'a1b2c3d4', prevHash: '0000', status: 'valid', timestamp: Date.now() - 3000 }, { id: 2, hash: 'e5f6g7h8', prevHash: 'a1b2c3d4', status: 'valid', timestamp: Date.now() - 2000 }, { id: 3, hash: 'i9j0k1l2', prevHash: 'e5f6g7h8', status: 'valid', timestamp: Date.now() - 1000 }]);
      setSecurityScore(100); setComplianceStatus('verified'); setIsTampering(false);
    }, 4000);
  };

  const handleExportLogs = () => { alert('📥 Export functionality would download all audit logs as JSON/CSV'); };
  const handleGenerateReport = () => { alert('📊 Report generation would create a compliance PDF report'); };
  const handleViewAnalytics = () => { alert('📈 Analytics dashboard would show detailed metrics and charts'); };

  const renderVisualization = () => {
    if (!cookiesAccepted) {
      return (
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 h-96 flex items-center justify-center text-center">
          <LockedFeature title="Accept Cookies to Run Demo" message="Interactive demonstrations are disabled until essential security cookies are accepted." onAcceptCookies={onAcceptCookies} />
        </div>
      );
    }

    switch(currentStep.visual) {
      case 'key':
        return (
          <div className={`bg-gradient-to-br ${currentStep.bgGradient} rounded-3xl p-8 border border-slate-200 h-96 flex flex-col items-center justify-center relative overflow-hidden`}>
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-10 left-10 w-20 h-20 bg-current rounded-full animate-pulse"></div>
              <div className="absolute bottom-10 right-10 w-16 h-16 bg-current rounded-full animate-pulse delay-1000"></div>
            </div>
            <div className="relative z-10 text-center">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 inline-block mb-6 transform hover:scale-105 transition duration-300"><Key className="w-16 h-16 text-blue-600" /></div>
              {!apiKey ? (
                <div className="text-center">
                  <p className="text-slate-700 font-medium mb-6 text-lg">Generate your secure API key</p>
                  <button onClick={generateApiKey} disabled={isGeneratingKey} className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 flex items-center mx-auto shadow-lg hover:shadow-xl transform hover:scale-105">
                    {isGeneratingKey ? (<><RefreshCw className="w-5 h-5 mr-3 animate-spin" />Generating Secure Key...</>) : (<><ShieldCheck className="w-5 h-5 mr-3" />Generate API Key</>)}
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-slate-700 font-medium mb-4 text-lg">Your Secure API Key:</p>
                  <div className="bg-white/90 backdrop-blur-sm border border-slate-300 rounded-xl p-4 mb-6 font-mono text-sm shadow-inner">
                    <div className="flex items-center justify-between"><span className="text-slate-800">{apiKey}</span><button className="text-blue-600 hover:text-blue-800"><Copy className="w-4 h-4" /></button></div>
                  </div>
                  <div className="flex space-x-3 justify-center">
                    <button className="text-xs bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-md">Copy Key</button>
                    <button className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md">Test Endpoint</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'code':
        return (
          <div className="bg-slate-900 rounded-3xl border border-slate-700 font-mono text-sm overflow-hidden h-96 flex flex-col shadow-2xl">
            <div className="bg-slate-800 px-6 py-4 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div className="w-3 h-3 rounded-full bg-green-500"></div></div>
                <span className="text-slate-300 text-sm">terminal</span>
              </div>
              <div className="text-slate-400 text-xs flex items-center"><GlobeIconSVG className="w-4 h-4 mr-2" />api.auditorveritas.com</div>
            </div>
            <div className="p-6 text-slate-300 flex-grow overflow-y-auto space-y-4 bg-gradient-to-br from-slate-900 to-slate-800">
              <div className="space-y-2">
                <p className="flex items-center"><span className="text-emerald-400 mr-2">$</span><span>curl -X POST https://api.auditorveritas.com/v1/events \</span></p>
                <p className="ml-6">-H "Authorization: Bearer {apiKey || 'your_api_key'}" \</p>
                <p className="ml-6">-H "Content-Type: application/json" \</p>
                <p className="ml-6">-d '{`{"event_type": "user_login", "user_id": "user_123", "timestamp": "${new Date().toISOString()}"}`}'</p>
              </div>
              {isSimulating && (<div className="text-cyan-400 animate-pulse space-y-1"><p>🔒 Encrypting payload with AES-256...</p><p>⚡ Hashing PII data with SHA-256...</p><p>📦 Validating JSON schema...</p></div>)}
              {terminalOutput && (<div className="mt-4 bg-slate-800/50 rounded-xl p-4 animate-in fade-in border-l-4 border-emerald-500 backdrop-blur-sm"><p className="text-emerald-400 font-bold flex items-center"><BadgeCheck className="w-5 h-5 mr-2" />SUCCESS: Event processed</p></div>)}
              {!isSimulating && !terminalOutput && (<button onClick={simulateApiCall} className="mt-6 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:from-emerald-700 hover:to-cyan-700 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"><Play className="w-4 h-4 mr-2" /> Execute Secure Request</button>)}
            </div>
          </div>
        );
      case 'chain':
        return (
          <div className={`bg-gradient-to-br ${currentStep.bgGradient} rounded-3xl p-8 border border-slate-200 h-96 flex flex-col relative overflow-hidden`}>
            <div className="absolute inset-0 opacity-10"><div className="absolute top-1/4 left-1/4 w-32 h-32 bg-current rounded-full animate-pulse"></div></div>
            <div className="flex-1 flex flex-col justify-center items-center relative z-10">
              <div className="flex justify-center space-x-6 mb-8">
                {chain.map((block, i) => (<div key={block.id} className="flex flex-col items-center"><div className={`w-20 h-20 rounded-2xl border-3 flex flex-col items-center justify-center transition-all duration-500 transform ${block.status === 'valid' ? 'bg-white border-emerald-400 shadow-lg hover:scale-110' : 'bg-red-50 border-red-500 shadow-2xl scale-110'} ${isTampering ? 'animate-pulse' : ''} cursor-pointer hover:shadow-xl`}>{block.status === 'valid' ? <Check className="w-8 h-8 text-emerald-500"/> : <AlertTriangle className="w-8 h-8 text-red-500"/>}<span className="text-xs mt-2 font-mono font-bold">#{block.id}</span></div>{i < chain.length - 1 && <div className={`w-12 h-1 mx-1 transition-all duration-500 ${block.status === 'invalid' && chain[i + 1]?.status === 'invalid' ? 'bg-red-300' : 'bg-slate-300'}`}></div>}</div>))}
              </div>
              <div className={`mb-6 p-5 rounded-2xl transition-all duration-500 w-full max-w-md text-center backdrop-blur-sm ${isTampering ? 'bg-red-100/80 border border-red-200 text-red-800' : 'bg-emerald-100/80 border border-emerald-200 text-emerald-800'}`}>
                <p className="text-sm font-semibold flex items-center justify-center">{isTampering ? <>🚨 SECURITY BREACH DETECTED</> : <>✅ CHAIN INTEGRITY VERIFIED</>}</p>
                <div className="mt-3 flex justify-between text-sm"><span className="font-bold">Score: {securityScore}%</span><span className="font-bold">Status: {complianceStatus.toUpperCase()}</span></div>
              </div>
            </div>
            <div className="flex justify-center space-x-6 items-end relative z-10">
              <button onClick={simulateTamper} disabled={isTampering} className={`text-sm border-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${isTampering ? 'opacity-50 cursor-not-allowed' : 'border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 hover:shadow-lg'}`}>🚨 Simulate Attack</button>
              <div className="flex-1 max-w-md">
                <div className="flex space-x-3">
                  <input type="text" value={hashInput} onChange={(e) => setHashInput(e.target.value)} placeholder="Enter data to hash..." className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                  <button onClick={calculateHash} disabled={isHashing} className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 transform hover:scale-105 shadow-lg">{isHashing ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Hash'}</button>
                </div>
                {hashOutput && <div className="mt-3 p-3 bg-white/80 backdrop-blur-sm rounded-lg text-xs font-mono break-all border border-slate-200">{hashOutput}</div>}
              </div>
            </div>
          </div>
        );
      case 'dashboard':
        return (
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl p-8 border border-slate-200 h-96 flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] bg-gradient-to-br from-blue-400 to-purple-400"></div>
            <div className="flex justify-between items-center mb-6 relative z-10">
              <div><h3 className="font-bold text-slate-800 text-lg">Live Event Stream</h3><p className="text-sm text-slate-500">Real-time GDPR compliance monitoring</p></div>
              <div className="flex items-center space-x-3"><div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div><span className="text-sm text-green-600 font-semibold bg-green-100 px-3 py-1 rounded-full">LIVE</span></div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6 relative z-10">
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-white/20 text-center transform hover:scale-105 transition duration-300"><div className="text-2xl font-bold text-blue-600">{liveEvents.length}</div><div className="text-xs text-slate-500 font-medium">Active Events</div></div>
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-white/20 text-center transform hover:scale-105 transition duration-300"><div className="text-2xl font-bold text-green-600">100%</div><div className="text-xs text-slate-500 font-medium">Compliance</div></div>
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-white/20 text-center transform hover:scale-105 transition duration-300"><div className="text-2xl font-bold text-purple-600">0ms</div><div className="text-xs text-slate-500 font-medium">Latency</div></div>
            </div>
            <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden relative z-10">
              <div className="h-full overflow-y-auto">
                {liveEvents.length === 0 ? (<div className="h-full flex items-center justify-center text-slate-400"><div className="text-center"><Activity className="w-12 h-12 mx-auto mb-3 opacity-50" /><p className="text-sm font-medium">Waiting for live events...</p></div></div>) : (
                  <div className="divide-y divide-slate-100/50">{liveEvents.map((event) => (<div key={event.id} className="p-4 hover:bg-white/50 transition-all duration-300 group"><div className="flex justify-between items-center"><div className="flex items-center space-x-3"><div className={`w-3 h-3 rounded-full ${event.status === 'success' ? 'bg-green-500' : 'bg-yellow-500'}`}></div><span className="font-semibold text-sm text-slate-800 group-hover:text-blue-600 transition-colors">{event.type}</span></div><span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{event.timestamp}</span></div><div className="text-xs text-slate-600 mt-2 flex items-center"><User className="w-3 h-3 mr-1" />User: {event.user}</div></div>))}</div>
                )}
              </div>
            </div>
            <div className="flex justify-between mt-6 relative z-10">
              <button onClick={handleExportLogs} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center"><Download className="w-4 h-4 mr-2" />Export</button>
              <button onClick={handleGenerateReport} className="text-sm bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center"><FileText className="w-4 h-4 mr-2" />Report</button>
              <button onClick={handleViewAnalytics} className="text-sm bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center"><BarChart3 className="w-4 h-4 mr-2" />Analytics</button>
            </div>
          </div>
        );
      default: return null;
    }
  };

  const ProgressDots = () => (
    <div className="flex justify-center space-x-3 mb-8 lg:hidden">
      {steps.map((_, index) => (
        <button key={index} onClick={() => setActiveStep(index)} className={`w-3 h-3 rounded-full transition-all duration-300 ${activeStep === index ? 'bg-blue-600 scale-125' : 'bg-slate-300 hover:bg-slate-400'}`} />
      ))}
    </div>
  );

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(600px at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.05) 0%, transparent 80%)` }} />
      
      <div className="max-w-7xl mx-auto space-y-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center pt-12 lg:pt-20">
          <div className="inline-flex items-center bg-white/80 backdrop-blur-sm text-slate-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-slate-200/50 shadow-sm"><Sparkles className="w-4 h-4 mr-2 text-blue-500" />Enterprise-Grade Audit Trail Platform</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">How It Works</h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">Experience the future of compliant audit logging with our military-grade security architecture and real-time monitoring.</p>
        </div>

        <ProgressDots />

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="hidden lg:grid grid-cols-4 bg-slate-50/50 border-b border-slate-200/50">
            {steps.map((step, index) => (
              <button key={index} onClick={() => setActiveStep(index)} className={`p-6 text-sm font-semibold transition-all duration-500 flex flex-col items-center justify-center group relative overflow-hidden ${activeStep === index ? `bg-gradient-to-r ${step.gradient} text-white shadow-lg` : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'}`}>
                <step.icon className={`w-6 h-6 mb-3 transition-transform duration-300 ${activeStep === index ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="text-xs lg:text-sm">{step.title}</span>
                {activeStep === index && <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30"></div>}
              </button>
            ))}
          </div>
          
          <div className="p-6 lg:p-12 flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch">
            <div className="w-full lg:w-2/5">
              <div className="lg:sticky lg:top-12 space-y-6">
                <div className="flex items-center mb-2">
                  <div className={`p-3 rounded-2xl mr-4 bg-gradient-to-r ${currentStep.gradient} shadow-lg`}>{React.createElement(currentStep.icon, { className: "w-7 h-7 text-white" })}</div>
                  <div><h3 className="text-2xl lg:text-3xl font-bold text-slate-900">{currentStep.title}</h3><p className="text-slate-500 mt-1 text-sm lg:text-base">Step {activeStep + 1} of {steps.length}</p></div>
                </div>
                <p className="text-lg text-slate-600 leading-relaxed lg:text-xl lg:leading-loose">{currentStep.description}</p>
                <ul className="space-y-4">{currentStep.details?.map((detail, i) => (<li key={i} className="flex items-start text-sm lg:text-base text-slate-600"><div className="mt-1 mr-4 min-w-[24px]"><Check className="w-5 h-5 text-green-500" /></div><span className="leading-relaxed">{detail}</span></li>))}</ul>
                <div className="flex space-x-4 pt-4">
                  <button onClick={() => cookiesAccepted && setActiveTab(currentStep.action)} disabled={!cookiesAccepted} className={`px-6 py-3 lg:px-8 lg:py-4 rounded-xl font-bold transition-all duration-300 flex items-center space-x-3 ${cookiesAccepted ? `bg-gradient-to-r ${currentStep.gradient} text-white hover:shadow-xl transform hover:scale-105 shadow-lg` : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}><span className="text-sm lg:text-base">{currentStep.actionText}</span><ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" /></button>
                  {activeStep > 0 && (<button onClick={() => setActiveStep(activeStep - 1)} className="px-6 py-3 lg:px-8 lg:py-4 rounded-xl font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all duration-300 border border-slate-200 transform hover:scale-105"><ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" /></button>)}
                </div>
              </div>
            </div>
            <div className="w-full lg:w-3/5">
              <div className="rounded-3xl p-1 h-full transform hover:scale-[1.02] transition duration-500">{renderVisualization()}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 text-center">
          {[
            { icon: ShieldCheck, label: "GDPR Compliant", sublabel: "Article 30 Ready", color: "green" },
            { icon: LockIcon, label: "AES-256 Encryption", sublabel: "Military Grade", color: "blue" },
            { icon: ChipIcon, label: "Real-time Processing", sublabel: "Zero Latency", color: "purple" },
            { icon: DatabaseIcon, label: "EU Data Centers", sublabel: "Frankfurt AWS", color: "amber" }
          ].map((badge, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm p-4 lg:p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition duration-300 transform hover:scale-105">
              <badge.icon className={`w-8 h-8 lg:w-10 lg:h-10 ${badge.color === 'green' ? 'text-green-600' : badge.color === 'blue' ? 'text-blue-600' : badge.color === 'purple' ? 'text-purple-600' : 'text-amber-600'} mx-auto mb-3`} />
              <div className="font-bold text-slate-900 text-sm lg:text-base">{badge.label}</div>
              <div className="text-xs lg:text-sm text-slate-500 mt-1">{badge.sublabel}</div>
            </div>
          ))}
        </div>

        <div className="text-center py-12 lg:py-20">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 lg:p-12 text-white shadow-2xl">
            <Rocket className="w-12 h-12 mx-auto mb-6" />
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">Ready to Secure Your Audit Trail?</h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">Join thousands of companies trusting Auditor Veritas for GDPR-compliant, military-grade audit logging.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => setActiveTab('create')} className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg">Start Free Trial</button>
              <button onClick={() => setActiveTab('pricing')} className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all duration-300 transform hover:scale-105">View Pricing</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- HUVUDFUNKTIONEN ---

function App() {
  const [activeTab, setActiveTab] = useState('pricing');
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
  useSecurityProtections(); // NOTE: This disables right-click. Comment out to debug.

  useEffect(() => {
    const savedCookies = localStorage.getItem('cookiesAccepted');
    const savedApiKey = localStorage.getItem('auditorApiKey');
    
    if (savedCookies === 'true') { 
      setCookiesAccepted(true); 
      setShowCookieBanner(false);
    } else {
      setShowCookieBanner(true);
    }
    if (savedApiKey) setApiKey(savedApiKey);

    setPricingPlans({
      starter: { name: 'Starter', events: 100, price: 0, features: ['Basic Audit Trail', 'GDPR Compliance', 'Email Support', '100 Events/Month'] },
      professional: { name: 'Professional', events: 50000, price: 49, features: ['Advanced Analytics', 'Bulk Import', 'Priority Support', 'Custom Events', '50K Events/Month'], featured: true },
      enterprise: { name: 'Enterprise', events: 500000, price: 199, features: ['Everything in Professional', 'Dedicated Support', 'SLA Guarantee', 'Custom Integrations', '500K Events/Month'] }
    });
  }, []);

  const handleAcceptCookies = () => {
    setCookiesAccepted(true);
    setShowCookieBanner(false);
    localStorage.setItem('cookiesAccepted', 'true');
    setActiveTab('pricing');
  };

  const handleGDPRExport = async () => {
    alert("GDPR Export simulation: JSON data ready for download.");
  };

  const handleKeyRotation = async () => {
    if (!window.confirm("WARNING: This will invalidate the old API key and generate a new one. All connected systems must be updated immediately. Are you sure?")) {
        return;
    }
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
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      if (response.status === 204) return null;
      const text = await response.text();
      let data;
      try { data = text ? JSON.parse(text) : {}; } catch (e) { throw new Error(`Server Error (${response.status}). Try again.`); }
      if (!response.ok) throw new Error(data.error || `HTTP error! status: ${response.status}`);
      return data;
    } catch (error) { console.error('API call failed:', error); throw error; }
  };

  const fetchDashboard = async () => {
    if (!apiKey) return;
    setIsLoading(true);
    try {
      const data = await apiCall('/api/dashboard');
      if(data) {
        setProcessor(data.processor);
        setStats(data.stats);
        localStorage.setItem('auditorProcessor', JSON.stringify(data.processor));
        localStorage.setItem('auditorApiKey', apiKey);
      }
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

  if (isLocked && processor) {
    return <LockScreen onUnlock={() => setIsLocked(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {processor && <SecurityWatermark identifier={processor.email || processor.companyName} />}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-grow">
        {activeTab === 'pricing' && (
          <div className="space-y-12 animate-in">
            <div className="text-center max-w-2xl mx-auto pt-8 px-4">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Transparent Pricing</h2>
              <p className="text-lg text-slate-600">Start small and scale securely. All plans include full GDPR compliance features.</p>
            </div>
            <div className="container mx-auto px-4 sm:px-6 pb-12 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {Object.entries(pricingPlans).map(([key, plan]) => (
                    <div key={key} className={`relative rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:scale-105 hover:shadow-xl flex flex-col ${plan.featured ? 'bg-white ring-4 ring-blue-500/20 shadow-xl scale-105' : 'bg-white shadow-lg border border-slate-100'}`}>
                    {plan.featured && <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg tracking-wide">MOST POPULAR</div>}
                    <h3 className="text-2xl font-bold text-slate-900 mb-2 capitalize">{plan.name}</h3>
                    <div className="mb-6 flex items-baseline justify-center"><span className="text-3xl sm:text-4xl font-extrabold text-slate-900">${plan.price}</span><span className="text-slate-500 ml-2 font-medium">/month</span></div>
                    <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-1">{plan.features.map((feat, i) => (<li key={i} className="flex items-start text-slate-600 text-sm"><Check className="w-4 h-4 text-emerald-500 mr-2 mt-0.5"/>{feat}</li>))}</ul>
                    <button onClick={() => setActiveTab('create')} className="w-full py-3 sm:py-3.5 rounded-xl font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 transition">{key === 'starter' ? 'Start for Free' : `Choose ${plan.name}`}</button>
                    </div>
                ))}
                </div>
            </div>
          </div>
        )}

        {activeTab === 'howitworks' && <HowItWorks setActiveTab={setActiveTab} cookiesAccepted={cookiesAccepted} onAcceptCookies={handleAcceptCookies} />}

        {activeTab === 'dashboard' && (
          <div className="container mx-auto px-4 sm:px-6 py-6 max-w-6xl animate-in">
            {!cookiesAccepted ? (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                <LockedFeature title="Dashboard Locked" message="Accept cookies to access your dashboard." onAcceptCookies={handleAcceptCookies} />
              </div>
            ) : !processor ? (
              <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-100 mt-6 sm:mt-10">
                <div className="text-center mb-6 sm:mb-8">
                  <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"><Lock className="w-6 h-6 text-blue-600" /></div>
                  <h2 className="text-xl font-bold text-slate-900">Access Dashboard</h2>
                  <p className="text-slate-500 text-sm mt-2">Enter your API key to securely manage your audit events</p>
                </div>
                <input type="text" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="av_xxxxxxxx..." className="w-full p-3 border border-slate-300 rounded-xl my-4 outline-none focus:ring-2 focus:ring-blue-500" />
                <button onClick={fetchDashboard} disabled={isLoading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">{isLoading ? 'Loading...' : 'Access Dashboard'}</button>
              </div>
            ) : (
              <div>
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div><h2 className="text-2xl font-bold text-slate-900">{processor.companyName}</h2><p className="text-sm text-slate-500">Dashboard</p></div>
                  <div className="flex space-x-2">
                    <button onClick={handleGDPRExport} className="px-4 py-2 bg-slate-50 border rounded-lg text-sm font-medium hover:bg-slate-100 flex items-center"><Download className="w-4 h-4 mr-2 text-blue-600"/> Export Data</button>
                    <button onClick={handleKeyRotation} className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 hover:shadow-sm transition text-amber-700 font-medium text-sm flex items-center"><RefreshCw className="w-4 h-4 mr-2"/> Rotate Key</button>
                    <button onClick={() => {setProcessor(null); setApiKey('');}} className="px-4 py-2 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 hover:text-red-700 transition text-red-600 font-medium text-sm">Sign Out</button>
                  </div>
                </div>
                <StatsCards stats={stats} processor={processor} cookiesAccepted={cookiesAccepted} onAcceptCookies={handleAcceptCookies} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-100"><div className="flex justify-between mb-4"><h3 className="font-bold">Analytics</h3>{processor.plan !== 'starter' && <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded">Active</span>}</div>{processor.plan === 'starter' ? <LockedFeature title="Analytics Locked" desc="Upgrade to view insights." setActiveTab={setActiveTab} /> : <div className="h-48 bg-blue-50 rounded-xl flex items-center justify-center text-blue-400"><BarChart3 className="w-12 h-12 opacity-50"/></div>}</div>
                  <div className="bg-white p-6 rounded-xl border border-slate-100"><div className="flex justify-between mb-4"><h3 className="font-bold">Bulk Import</h3>{processor.plan !== 'starter' && <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded">Active</span>}</div>{processor.plan === 'starter' ? <LockedFeature title="Bulk Import Locked" desc="Process CSV files." setActiveTab={setActiveTab} /> : <div className="h-48 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400"><PlusCircle className="w-8 h-8 mb-2"/></div>}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto pt-6 animate-in">
            {cookiesAccepted ? (
              <CreateProcessor />
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100 text-center">
                <LockedFeature title="Registration Locked" message="You must accept cookies to create an account." onAcceptCookies={handleAcceptCookies} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-slate-100 mt-6 animate-in">
            {cookiesAccepted ? (
              <>
                <div className="flex items-center mb-8 pb-6 border-b border-slate-100">
                  <div className="p-3 bg-blue-50 rounded-xl mr-4"><FileText className="w-7 h-7 text-blue-600"/></div>
                  <div><h2 className="text-2xl font-bold text-slate-900">Log New Event</h2><p className="text-slate-500 text-sm mt-1">Manually record an audit event in your secure trail</p></div>
                </div>
                <form onSubmit={logEvent} className="space-y-6">
                  <input type="text" className="w-full p-3 border rounded-lg" placeholder="Event Type" value={eventData.event_type} onChange={e => setEventData({...eventData, event_type: e.target.value})} required />
                  <input type="text" className="w-full p-3 border rounded-lg" placeholder="User ID" value={eventData.user_identifier} onChange={e => setEventData({...eventData, user_identifier: e.target.value})} />
                  <textarea className="w-full p-3 border rounded-lg font-mono text-sm" placeholder='{"data": "value"}' value={eventData.event_data} onChange={e => setEventData({...eventData, event_data: e.target.value})} required />
                  <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">{isLoading ? 'Logging...' : 'Log Event'}</button>
                </form>
              </>
            ) : (
              <LockedFeature title="Event Logging Locked" message="Accept cookies to unlock event logging." onAcceptCookies={handleAcceptCookies} />
            )}
          </div>
        )}

        {activeTab === 'privacy' && <PrivacyPolicy setActiveTab={setActiveTab} cookiesAccepted={cookiesAccepted} onAcceptCookies={handleAcceptCookies} />}

      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-center">
        <div className="container mx-auto px-6">
          <div className="flex justify-center mb-4"><ShieldCheck className="w-8 h-8 text-blue-500" /></div>
          <p className="text-sm mb-6">Enterprise-grade audit logging.</p>
          <div className="flex justify-center space-x-6 text-sm font-medium mb-6">
            <button onClick={() => setActiveTab('privacy')} className="hover:text-white">Privacy</button>
            <a href="mailto:hazarnodesweden@outlook.com" className="hover:text-white">Contact</a>
          </div>
          <p className="text-xs">&copy; 2025 Auditor Veritas.</p>
        </div>
      </footer>

      {showCookieBanner && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
            <ShieldCheck className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Privacy & Security</h3>
            <p className="text-slate-600 mb-6 text-sm">We use essential cookies for security. No tracking.</p>
            <button onClick={handleAcceptCookies} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition mb-3">Accept</button>
            <button onClick={() => { setActiveTab('privacy'); setShowCookieBanner(false); }} className="text-sm text-blue-600 underline">Read Policy</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;