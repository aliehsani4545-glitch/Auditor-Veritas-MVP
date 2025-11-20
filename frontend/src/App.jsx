import { useState, useEffect, useRef } from 'react';
import './App.css';
import CryptoJS from 'crypto-js';
import CreateProcessor from './components/CreateProcessor';
import { 
  ShieldCheck, BarChart3, Users, FileText, Check, 
  Lock, Zap, LayoutDashboard, LogOut, PlusCircle,
  Key, Database, Search, Server, Settings,
  ArrowRight, Play, ArrowLeft, Menu, X,
  Smartphone, Globe, Cpu, Code, Eye, EyeOff,
  Mail, Fingerprint, Terminal, AlertTriangle, Clock
} from 'lucide-react';

// VIKTIGT: Tom sträng för Netlify proxy
const API_BASE_URL = ''; 

// --- SÄKERHETSHOOK ---
const useSecurityProtections = () => {
  useEffect(() => {
    const handleContextMenu = (e) => { e.preventDefault(); return false; };
    
    const handleKeyDown = (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        alert('🔒 Security Alert: Screenshots are monitored.');
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

// --- AUTO-LOCK TIMER (5 minuter) ---
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

// --- VATTENSTÄMPEL ---
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

// --- COOKIE WALL COMPONENT ---
const CookieWall = ({ onAccept }) => (
  <div className="fixed inset-0 z-[10000] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 text-center animate-in zoom-in duration-500">
      <div className="bg-blue-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <ShieldCheck className="w-10 h-10 text-blue-600" />
      </div>
      
      <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Privacy & Security Required</h1>
      
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 text-left">
        <h3 className="font-bold text-amber-800 mb-3 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Mandatory Cookie Acceptance
        </h3>
        <p className="text-amber-700 text-sm mb-4">
          To ensure GDPR compliance and the security of your audit data, you must accept our essential cookies before accessing any features.
        </p>
        <ul className="text-amber-600 text-sm space-y-2">
          <li className="flex items-start">
            <Check className="w-4 h-4 mr-2 mt-0.5 text-amber-600" />
            <span>Session security tokens for encrypted communications</span>
          </li>
          <li className="flex items-start">
            <Check className="w-4 h-4 mr-2 mt-0.5 text-amber-600" />
            <span>Local storage of API keys for your convenience</span>
          </li>
          <li className="flex items-start">
            <Check className="w-4 h-4 mr-2 mt-0.5 text-amber-600" />
            <span>No tracking cookies or third-party analytics</span>
          </li>
        </ul>
      </div>

      <p className="text-slate-600 mb-6 leading-relaxed">
        Auditor Veritas processes sensitive audit data that requires strict security measures. 
        Essential cookies are mandatory to maintain the integrity and confidentiality of your information.
      </p>

      <div className="space-y-4">
        <button 
          onClick={onAccept}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-blue-600/30 transform hover:-translate-y-0.5"
        >
          Accept & Continue Securely
        </button>
        
        <p className="text-xs text-slate-500">
          By continuing, you agree to our <span className="font-semibold">Privacy Policy</span> and the use of essential security cookies.
        </p>
      </div>
    </div>
  </div>
);

// --- LOCKED FEATURE COMPONENT ---
const LockedFeature = ({ title, message }) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
    <div className="bg-slate-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
      <Lock className="w-8 h-8 text-slate-400" />
    </div>
    <h3 className="text-xl font-bold text-slate-700 mb-2">{title}</h3>
    <p className="text-slate-500 max-w-md">{message}</p>
  </div>
);

// --- UI KOMPONENTER ---

const Navbar = ({ activeTab, setActiveTab, cookiesAccepted }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuItems = ['Pricing', 'HowItWorks', 'Dashboard', 'Create', 'Events', 'Privacy'];

  const handleTabClick = (tab) => {
    if (!cookiesAccepted && tab !== 'privacy') {
      return; // Block all tabs except privacy if cookies not accepted
    }
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white sticky top-0 z-50 shadow-lg border-b border-blue-700/50">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer hover:opacity-90 transition" onClick={() => handleTabClick('pricing')}>
            <div className="bg-white/10 p-2 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Auditor Veritas</h1>
              <p className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold hidden sm:block">GDPR Compliant Audit Trail</p>
            </div>
          </div>
          <nav className="hidden lg:flex space-x-1">
            {menuItems.map((item) => {
              const tab = item.toLowerCase();
              const isDisabled = !cookiesAccepted && tab !== 'privacy';
              return (
                <button
                  key={item}
                  onClick={() => handleTabClick(tab)}
                  disabled={isDisabled}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab 
                      ? 'bg-white/10 text-white shadow-sm backdrop-blur-sm' 
                      : isDisabled
                      ? 'text-blue-300 opacity-50 cursor-not-allowed'
                      : 'text-blue-100 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item === 'HowItWorks' ? 'How It Works' : item}
                </button>
              );
            })}
          </nav>
          <button 
            className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-blue-700/50 pt-4 animate-in fade-in slide-in-from-top-2">
            <nav className="flex flex-col space-y-2">
              {menuItems.map((item) => {
                const tab = item.toLowerCase();
                const isDisabled = !cookiesAccepted && tab !== 'privacy';
                return (
                  <button
                    key={item}
                    onClick={() => handleTabClick(tab)}
                    disabled={isDisabled}
                    className={`px-4 py-3 rounded-lg text-left font-medium transition-all duration-200 ${
                      activeTab === tab 
                        ? 'bg-white/10 text-white' 
                        : isDisabled
                        ? 'text-blue-300 opacity-50 cursor-not-allowed'
                        : 'text-blue-100 hover:bg-white/5'
                    }`}
                  >
                    {item === 'HowItWorks' ? 'How It Works' : item}
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

// --- INTERACTIVE HOW IT WORKS ---
const HowItWorks = ({ setActiveTab, cookiesAccepted }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [terminalOutput, setTerminalOutput] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  
  const [chain, setChain] = useState([
    { id: 1, hash: 'a1b2', status: 'valid' },
    { id: 2, hash: 'c3d4', status: 'valid' },
    { id: 3, hash: 'e5f6', status: 'valid' }
  ]);

  const [isTampering, setIsTampering] = useState(false);

  const simulateApiCall = () => {
    if (!cookiesAccepted) return;
    setIsSimulating(true);
    setTerminalOutput(null);
    setTimeout(() => {
      setTerminalOutput({ status: 201, message: "Event Logged Successfully", hash: "8f9a3b2c" });
      setIsSimulating(false);
    }, 1500);
  };

  const simulateTamper = () => {
    if (!cookiesAccepted || isTampering) return;
    
    setIsTampering(true);
    
    // Första fas: Visa varning på mitten av kedjan
    const newChain = [...chain];
    newChain[1].status = 'invalid';
    setChain(newChain);
    
    // Andra fas: Sprid varningen till hela kedjan med fördröjning
    setTimeout(() => {
      const spreadChain = newChain.map(block => ({
        ...block,
        status: 'invalid'
      }));
      setChain(spreadChain);
    }, 600);
    
    // Tredje fas: Återställ efter 3 sekunder
    setTimeout(() => {
      setChain([
        { id: 1, hash: 'a1b2', status: 'valid' },
        { id: 2, hash: 'c3d4', status: 'valid' },
        { id: 3, hash: 'e5f6', status: 'valid' }
      ]);
      setIsTampering(false);
    }, 3000);
  };

  const steps = [
    {
      title: "Registration & API Key",
      icon: Key,
      description: "Get your secure API key that serves as digital identity for your organization.",
      details: [
        "Unique API key generation",
        "Secure container in database", 
        "Immediate activation",
        "GDPR compliant setup"
      ],
      visual: "key",
      action: "create",
      actionText: "Get Key"
    },
    {
      title: "Secure Event Logging",
      icon: Terminal,
      description: "Integrate with simple API calls. All data is encrypted and hashed automatically.",
      details: [
        "Simple REST API integration",
        "Automatic SHA-256 hashing",
        "Real-time event processing",
        "JSON payload support"
      ],
      visual: "code",
      action: "events",
      actionText: "Try Logging"
    },
    {
      title: "Immutable Audit Trail",
      icon: ShieldCheck,
      description: "Every event is cryptographically chained to prevent tampering and ensure integrity.",
      details: [
        "Cryptographic chain linking",
        "Tamper-evident design",
        "Automatic integrity checks",
        "Historical data protection"
      ],
      visual: "chain",
      action: "privacy",
      actionText: "Learn More"
    },
    {
      title: "Real-time Dashboard",
      icon: BarChart3,
      description: "Monitor all activity with comprehensive analytics and compliance reporting.",
      details: [
        "Live activity monitoring",
        "Compliance reporting",
        "Advanced analytics",
        "Export capabilities"
      ],
      visual: "dashboard",
      action: "dashboard",
      actionText: "View Dashboard"
    }
  ];

  const renderVisualization = () => {
    if (!cookiesAccepted) {
      return (
        <LockedFeature 
          title="Feature Locked" 
          message="Accept cookies to unlock interactive demonstrations and explore how our security features work."
        />
      );
    }

    switch(steps[activeStep].visual) {
      case 'key':
        return (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200 text-center">
            <div className="bg-white p-4 rounded-xl shadow-lg border inline-block mb-4">
              <Key className="w-12 h-12 text-blue-600" />
            </div>
            <p className="text-blue-800 font-medium text-sm">
              Your unique API Key: <code className="bg-blue-100 px-2 py-1 rounded">av_123456789abc</code>
            </p>
          </div>
        );
      case 'code':
        return (
          <div className="bg-slate-900 rounded-xl border border-slate-700 font-mono text-sm overflow-hidden">
            <div className="bg-slate-800 px-4 py-2 flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="p-4 text-slate-300">
              <p><span className="text-emerald-400">$</span> curl -X POST /api/events</p>
              {isSimulating && <p className="text-yellow-400 mt-2">Encrypting payload...</p>}
              {terminalOutput && (
                <div className="mt-4 bg-slate-800 rounded p-3 animate-in fade-in">
                  <p className="text-green-400">{`{ "status": 201, "hash": "${terminalOutput.hash}" }`}</p>
                </div>
              )}
              {!isSimulating && !terminalOutput && (
                 <button onClick={simulateApiCall} className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-xs flex items-center">
                   <Play className="w-3 h-3 mr-2" /> Run Request
                 </button>
              )}
            </div>
          </div>
        );
      case 'chain':
        return (
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center">
            <div className="flex justify-center space-x-2 mb-4">
              {chain.map((block, i) => (
                <div key={block.id} className="flex items-center">
                  <div className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                    block.status === 'valid' 
                      ? 'bg-white border-emerald-400 shadow-sm' 
                      : 'bg-red-50 border-red-500 shadow-lg scale-110'
                  } ${isTampering ? 'animate-pulse' : ''}`}>
                    {block.status === 'valid' ? 
                      <Check className="w-6 h-6 text-emerald-500"/> : 
                      <AlertTriangle className="w-6 h-6 text-red-500"/>
                    }
                  </div>
                  {i < 2 && (
                    <div className={`w-4 h-0.5 mx-1 transition-all duration-300 ${
                      block.status === 'invalid' && chain[i + 1]?.status === 'invalid'
                        ? 'bg-red-300'
                        : 'bg-slate-300'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Förbättrad statusmeddelande */}
            <div className={`mb-4 p-3 rounded-lg transition-all duration-300 ${
              isTampering 
                ? 'bg-red-100 border border-red-200 text-red-700' 
                : 'bg-emerald-100 border border-emerald-200 text-emerald-700'
            }`}>
              <p className="text-sm font-medium flex items-center justify-center">
                {isTampering ? (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2 animate-bounce" />
                    Security Breach Detected! Chain integrity compromised
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Chain integrity verified - All blocks secure
                  </>
                )}
              </p>
            </div>
            
            <button 
              onClick={simulateTamper} 
              disabled={isTampering}
              className={`text-sm border px-4 py-2 rounded-lg font-medium transition-all ${
                isTampering
                  ? 'border-red-300 bg-red-50 text-red-400 cursor-not-allowed'
                  : 'border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 hover:shadow-md'
              }`}
            >
              {isTampering ? (
                <span className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-red-500 border-b-0 rounded-full"></div>
                  Simulating Attack...
                </span>
              ) : (
                <span className="flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Simulate Hack Attack
                </span>
              )}
            </button>
            
            {/* Förklaringstext */}
            <p className="text-xs text-slate-500 mt-3 max-w-md mx-auto">
              {isTampering 
                ? "The hack attempt has been detected! The system automatically prevents tampering by invalidating the entire chain."
                : "Click to simulate a blockchain tampering attempt and see how our system detects and prevents it."
              }
            </p>
          </div>
        );
      case 'dashboard':
        return (
          <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl p-6 border border-amber-200">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 shadow-sm border text-center">
                <div className="text-amber-600 text-lg font-bold">1,247</div>
                <div className="text-amber-800 text-xs">Events</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm border text-center">
                <div className="text-green-600 text-lg font-bold">100%</div>
                <div className="text-green-800 text-xs">Secure</div>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 px-4 sm:px-0 animate-in fade-in">
      <div className="text-center pt-8">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">How It Works</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">Secure, compliant audit logging in four simple steps.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 bg-slate-50 border-b border-slate-200">
          {steps.map((step, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`p-4 text-sm font-bold transition-all flex flex-col items-center justify-center ${
                activeStep === index ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <step.icon className="w-5 h-5 mb-1" />
              {step.title}
            </button>
          ))}
        </div>
        
        <div className="p-8 flex flex-col lg:flex-row gap-8 items-center">
          <div className="w-full lg:w-1/2">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">{steps[activeStep].title}</h3>
            <p className="text-lg text-slate-600 mb-6">{steps[activeStep].description}</p>
            <ul className="space-y-2 mb-6">
              {steps[activeStep].details?.map((detail, i) => (
                <li key={i} className="flex items-start text-sm text-slate-600">
                  <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5" /> {detail}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => setActiveTab(steps[activeStep].action)} 
              disabled={!cookiesAccepted}
              className={`px-6 py-2 rounded-lg font-bold transition ${
                cookiesAccepted 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              {steps[activeStep].actionText} →
            </button>
          </div>
          <div className="w-full lg:w-1/2">{renderVisualization()}</div>
        </div>
      </div>
    </div>
  );
};

const StatsCards = ({ stats, processor, cookiesAccepted }) => {
  if (!cookiesAccepted) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-100 text-center">
        <LockedFeature 
          title="Dashboard Locked" 
          message="Accept cookies to access your dashboard statistics and usage analytics."
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-100 hover:shadow-md transition duration-300 group">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <h3 className="ml-3 text-sm font-semibold text-slate-600 uppercase tracking-wide">Monthly Usage</h3>
        </div>
        <div className="flex justify-between items-end mb-3">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.monthlyEvents}</div>
          <div className="text-sm text-slate-500 font-medium">of {stats.eventsLimit}</div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: stats.utilization }}></div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-100 hover:shadow-md transition duration-300 group">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
          </div>
          <h3 className="ml-3 text-sm font-semibold text-slate-600 uppercase tracking-wide">Plan Status</h3>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-slate-900 capitalize mb-1">{processor?.plan || 'Inactive'}</div>
        <div className="text-sm text-emerald-600 font-medium flex items-center">
          <Check className="w-4 h-4 mr-1" /> Active subscription
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-100 hover:shadow-md transition duration-300 group">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
          </div>
          <h3 className="ml-3 text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Events</h3>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">{stats.totalEvents}</div>
        <div className="text-sm text-slate-500 font-medium">All time record</div>
      </div>
    </div>
  );
};

const FeatureCard = ({ title, desc, setActiveTab, cookiesAccepted, children }) => (
  <div className={`bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-100 ${!cookiesAccepted ? 'opacity-90' : ''}`}>
    <div className="flex justify-between items-center mb-4 sm:mb-6">
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      {cookiesAccepted && <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase font-bold px-2 py-1 rounded-md tracking-wide">Active</span>}
    </div>
    {!cookiesAccepted ? (
      <LockedFeature title={`${title} Locked`} desc={desc} />
    ) : (
      children
    )}
  </div>
);

// --- COMPLETE PRIVACY POLICY ---
const PrivacyPolicy = ({ setActiveTab, cookiesAccepted, setShowCookieBanner }) => (
  <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 px-4 sm:px-0">
    
    {!cookiesAccepted && (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center shadow-sm">
        <div className="flex items-center justify-center mb-3">
          <Lock className="w-6 h-6 text-amber-600 mr-2" />
          <h3 className="text-lg font-bold text-amber-800">Accept Cookies to Continue</h3>
        </div>
        <p className="text-amber-700 mb-4">You must accept our essential security cookies to access all features of Auditor Veritas.</p>
        <button onClick={() => setShowCookieBanner(true)} className="bg-amber-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-700 transition shadow-sm">
          Accept Cookies Now
        </button>
      </div>
    )}
    
    <div className="text-center mb-12">
      <div className="bg-emerald-50 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl rotate-3 flex items-center justify-center mx-auto mb-6 shadow-sm">
        <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600 -rotate-3" />
      </div>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">Privacy & Compliance</h2>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto">
        We process data in strict accordance with GDPR Article 6(1)(b) and industry security standards.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-blue-50 rounded-xl mr-4">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-bold text-xl text-slate-900">Data Storage</h3>
        </div>
        <ul className="space-y-4">
          <li className="flex items-start group">
            <div className="mt-1 mr-3 p-1 bg-emerald-100 rounded-full">
              <Check className="w-3 h-3 text-emerald-700"/>
            </div>
            <div>
              <strong className="block text-slate-900 text-sm">🇪🇺 EU Data Centers</strong>
              <span className="text-sm text-slate-500">All data resides in Frankfurt (AWS eu-central-1).</span>
            </div>
          </li>
          <li className="flex items-start group">
            <div className="mt-1 mr-3 p-1 bg-emerald-100 rounded-full">
              <Check className="w-3 h-3 text-emerald-700"/>
            </div>
            <div>
              <strong className="block text-slate-900 text-sm">🔒 Military-grade Encryption</strong>
              <span className="text-sm text-slate-500">AES-256 at rest and TLS 1.3 in transit.</span>
            </div>
          </li>
          <li className="flex items-start group">
            <div className="mt-1 mr-3 p-1 bg-emerald-100 rounded-full">
              <Check className="w-3 h-3 text-emerald-700"/>
            </div>
            <div>
              <strong className="block text-slate-900 text-sm">👤 PII Hashing</strong>
              <span className="text-sm text-slate-500">User identifiers are SHA-256 hashed before storage.</span>
            </div>
          </li>
        </ul>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
        <div className="flex items-center mb-6">
           <div className="p-3 bg-purple-50 rounded-xl mr-4"><Lock className="w-6 h-6 text-purple-600" /></div>
          <h3 className="font-bold text-xl text-slate-900">Cookies & Tracking</h3>
        </div>
        <ul className="space-y-4">
          <li className="flex items-start group">
            <div className="mt-1 mr-3 p-1 bg-emerald-100 rounded-full"><Check className="w-3 h-3 text-emerald-700"/></div>
            <div>
              <strong className="block text-slate-900 text-sm">🍪 Essential Only</strong>
              <span className="text-sm text-slate-500">We only store a session token for security functionality.</span>
            </div>
          </li>
          <li className="flex items-start group">
            <div className="mt-1 mr-3 p-1 bg-emerald-100 rounded-full"><Check className="w-3 h-3 text-emerald-700"/></div>
            <div>
              <strong className="block text-slate-900 text-sm">🚫 Zero Tracking</strong>
              <span className="text-sm text-slate-500">No Google Analytics, Facebook Pixels, or ad trackers.</span>
            </div>
          </li>
          <li className="flex items-start group">
            <div className="mt-1 mr-3 p-1 bg-emerald-100 rounded-full"><Check className="w-3 h-3 text-emerald-700"/></div>
            <div>
              <strong className="block text-slate-900 text-sm">🛡️ Local Storage</strong>
              <span className="text-sm text-slate-500">API keys are stored locally on your device only.</span>
            </div>
          </li>
        </ul>
      </div>
    </div>

    {/* Your Rights Section */}
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-100 mt-8">
      <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Your Rights under GDPR</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <div>
          <h4 className="font-bold text-slate-800 mb-2 flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            Right to Access
          </h4>
          <p className="text-sm text-slate-500 leading-relaxed">
            You can export all your raw event data as JSON anytime directly from the dashboard.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-slate-800 mb-2 flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            Right to Erasure
          </h4>
          <p className="text-sm text-slate-500 leading-relaxed">
            "Right to be forgotten". To permanently delete your data, please contact our Data Protection Officer.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-slate-800 mb-2 flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            Data Portability
          </h4>
          <p className="text-sm text-slate-500 leading-relaxed">
            Move your audit trail to another provider easily using our standard export format.
          </p>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <h4 className="font-bold text-slate-800 mb-4">Contact Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-lg">
            <h5 className="font-semibold text-slate-700 mb-2">Data Protection Officer</h5>
            <a href="mailto:hazarnodesweden@outlook.com" className="text-blue-600 hover:underline">
              hazarnodesweden@outlook.com
            </a>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <h5 className="font-semibold text-slate-700 mb-2">Security Team</h5>
            <a href="mailto:hazarnodesweden@outlook.com" className="text-blue-600 hover:underline">
              hazarnodesweden@outlook.com
            </a>
          </div>
        </div>
      </div>
    </div>

    {!cookiesAccepted && (
      <div className="text-center pt-8">
        <button onClick={() => setShowCookieBanner(true)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
          Accept Cookies to Unlock All Features
        </button>
      </div>
    )}
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState('privacy'); // Start with privacy tab
  const [processor, setProcessor] = useState(null);
  const [events, setEvents] = useState([]);
  const [apiKey, setApiKey] = useState('');
  const [eventData, setEventData] = useState({ event_type: '', event_data: '{}', user_identifier: '' });
  const [stats, setStats] = useState({ totalEvents: 0, monthlyEvents: 0, eventsLimit: 100, utilization: '0%' });
  const [pricingPlans, setPricingPlans] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [cookiesAccepted, setCookiesAccepted] = useState(false);
  
  const { isLocked, setIsLocked } = useInactivityTimer(300000, !!processor && cookiesAccepted);
  useSecurityProtections();

  useEffect(() => {
    const savedCookies = localStorage.getItem('cookiesAccepted');
    const savedApiKey = localStorage.getItem('auditorApiKey');
    
    if (savedCookies === 'true') {
      setCookiesAccepted(true);
      setShowCookieBanner(false);
      setActiveTab('pricing'); // Switch to pricing after accepting
    } else {
      // Show cookie wall immediately if not accepted
      setShowCookieBanner(true);
    }

    if (savedApiKey) {
      setApiKey(savedApiKey);
    }

    setPricingPlans({
      starter: { 
        name: 'Starter', 
        events: 100, 
        price: 0, 
        features: ['Basic Audit Trail', 'GDPR Compliance', 'Email Support', '100 Events/Month'] 
      },
      professional: { 
        name: 'Professional', 
        events: 50000, 
        price: 49, 
        features: ['Advanced Analytics', 'Bulk Import', 'Priority Support', 'Custom Events', '50K Events/Month'], 
        featured: true 
      },
      enterprise: { 
        name: 'Enterprise', 
        events: 500000, 
        price: 199, 
        features: ['Everything in Professional', 'Dedicated Support', 'SLA Guarantee', 'Custom Integrations', '500K Events/Month'] 
      }
    });
  }, []);

  const handleAcceptCookies = () => {
    setCookiesAccepted(true);
    setShowCookieBanner(false);
    localStorage.setItem('cookiesAccepted', 'true');
    setActiveTab('pricing'); // Redirect to pricing after acceptance
  };

  // --- SÄKER API-HANTERING ---
  const apiCall = async (endpoint, options = {}) => {
    if (!cookiesAccepted) {
      throw new Error('Cookies must be accepted to use API features');
    }

    const config = { 
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, ...options.headers }, 
      ...options 
    };
    if (options.body) config.body = JSON.stringify(options.body);
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      if (response.status === 204) return null;
      const text = await response.text();
      let data;
      try { 
        data = text ? JSON.parse(text) : {}; 
      } catch (e) { 
        throw new Error(`Server Error (${response.status}). Try again.`); 
      }
      if (!response.ok) throw new Error(data.error || `HTTP error! status: ${response.status}`);
      return data;
    } catch (error) { 
      console.error('API call failed:', error); 
      throw error; 
    }
  };

  const fetchDashboard = async () => {
    if (!apiKey || !cookiesAccepted) return;
    setIsLoading(true);
    try {
      const data = await apiCall('/api/dashboard');
      setProcessor(data.processor);
      setStats(data.stats);
      localStorage.setItem('auditorProcessor', JSON.stringify(data.processor));
      localStorage.setItem('auditorApiKey', apiKey);
    } catch (error) { 
      alert(`Failed to access dashboard: ${error.message}`); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const logEvent = async (e) => {
    e.preventDefault();
    if (!cookiesAccepted) { 
      alert('❌ You must accept cookies before logging events'); 
      setShowCookieBanner(true);
      return; 
    }
    if (!apiKey) return alert('❌ API Key required');
    setIsLoading(true);
    try {
      let hashedId = null;
      if (eventData.user_identifier) {
        hashedId = CryptoJS.SHA256(eventData.user_identifier.trim().toLowerCase()).toString();
      }
      await apiCall('/api/events', { 
        method: 'POST', 
        body: { 
          ...eventData, 
          event_data: JSON.parse(eventData.event_data || '{}'), 
          user_identifier: hashedId 
        } 
      });
      alert('✅ Event logged successfully!');
      fetchDashboard();
      setEventData({ event_type: '', event_data: '{}', user_identifier: '' });
    } catch (error) { 
      alert(`Error: ${error.message}`); 
    } finally { 
      setIsLoading(false); 
    }
  };

  // Show cookie wall if not accepted
  if (!cookiesAccepted && showCookieBanner) {
    return <CookieWall onAccept={handleAcceptCookies} />;
  }

  if (isLocked && processor) {
    return <LockScreen onUnlock={() => setIsLocked(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {processor && <SecurityWatermark identifier={processor.email || processor.companyName} />}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} cookiesAccepted={cookiesAccepted} />

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl flex-grow z-10">
        {activeTab === 'pricing' && (
          <div className="space-y-12 animate-in">
            <div className="text-center max-w-2xl mx-auto pt-4 sm:pt-8 px-4">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Transparent Pricing</h2>
              <p className="text-lg text-slate-600">Start small and scale securely. All plans include full GDPR compliance features.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-0">
              {Object.entries(pricingPlans).map(([key, plan]) => (
                <div key={key} className={`relative rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:scale-105 hover:shadow-xl flex flex-col ${
                  plan.featured ? 'bg-white ring-4 ring-blue-500/20 shadow-xl scale-105' : 'bg-white shadow-lg border border-slate-100'
                }`}>
                  {plan.featured && (
                    <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg tracking-wide">
                      MOST POPULAR
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <div className="mb-6 flex items-baseline justify-center">
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">${plan.price}</span>
                    <span className="text-slate-500 ml-2 font-medium">/month</span>
                  </div>
                  <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-1">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start text-slate-600 text-sm">
                        <Check className="w-4 h-4 text-emerald-500 mr-2 mt-0.5" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => cookiesAccepted && setActiveTab('create')}
                    disabled={!cookiesAccepted}
                    className={`w-full py-3 sm:py-3.5 rounded-xl font-bold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${
                      cookiesAccepted
                        ? plan.featured 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700' 
                          : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {key === 'starter' ? 'Start for Free' : `Choose ${plan.name}`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'howitworks' && <HowItWorks setActiveTab={setActiveTab} cookiesAccepted={cookiesAccepted} />}

        {activeTab === 'dashboard' && (
          <div className="animate-in px-4 sm:px-0">
            {!processor ? (
              <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-100 mt-6 sm:mt-10">
                <div className="text-center mb-6 sm:mb-8">
                  <div className="bg-blue-50 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-sm">
                    <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Access Dashboard</h2>
                  <p className="text-slate-500 text-sm mt-2">Enter your API key to securely manage your audit events</p>
                </div>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="av_xxxxxxxx..."
                  className="w-full p-3 sm:p-4 border border-slate-300 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-slate-50 focus:bg-white font-mono text-sm shadow-sm"
                />
                <button 
                  onClick={fetchDashboard} 
                  disabled={isLoading || !cookiesAccepted}
                  className={`w-full py-3 sm:py-4 rounded-xl font-bold transition flex items-center justify-center shadow-md hover:shadow-lg ${
                    cookiesAccepted
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-0 border-white rounded-full"></div>
                      Connecting...
                    </span>
                  ) : cookiesAccepted ? (
                    'Access Dashboard'
                  ) : (
                    'Accept Cookies to Access'
                  )}
                </button>
              </div>
            ) : (
              <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{processor.companyName}</h2>
                    <div className="flex items-center mt-1 text-slate-500">
                      <LayoutDashboard className="w-4 h-4 mr-1.5" />
                      <p className="text-sm font-medium">Dashboard Overview</p>
                    </div>
                  </div>
                  <div className="flex space-x-2 sm:space-x-3">
                    <button onClick={fetchDashboard} className="flex items-center px-3 sm:px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-white hover:shadow-sm transition text-slate-700 font-medium text-sm">
                      <Zap className="w-4 h-4 mr-2 text-amber-500"/> Refresh
                    </button>
                    <button onClick={() => {setProcessor(null); setApiKey('');}} className="flex items-center px-3 sm:px-4 py-2 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 hover:text-red-700 transition text-red-600 font-medium text-sm">
                      <LogOut className="w-4 h-4 mr-2"/> Sign Out
                    </button>
                  </div>
                </div>

                <StatsCards stats={stats} processor={processor} cookiesAccepted={cookiesAccepted} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <FeatureCard 
                    title="Advanced Analytics" 
                    desc="Upgrade to Professional to see detailed usage trends, geo-maps and interaction insights."
                    setActiveTab={setActiveTab}
                    cookiesAccepted={cookiesAccepted}
                  >
                    <div className="h-32 sm:h-48 bg-blue-50/50 rounded-xl flex flex-col items-center justify-center text-blue-400 border border-blue-100">
                      <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 opacity-20 mb-2" />
                      <span className="text-sm font-medium text-blue-300">Interactive Charts Active</span>
                    </div>
                  </FeatureCard>

                  <FeatureCard 
                    title="Bulk Operations" 
                    desc="Process large historical datasets by uploading CSV or JSON files directly."
                    setActiveTab={setActiveTab}
                    cookiesAccepted={cookiesAccepted}
                  >
                    <div className="h-32 sm:h-48 border-2 border-dashed border-indigo-200 rounded-xl flex flex-col items-center justify-center text-indigo-400 hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer transition bg-indigo-50/30">
                      <div className="bg-white p-2 sm:p-3 rounded-full shadow-sm mb-2 sm:mb-3">
                        <PlusCircle className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-500" />
                      </div>
                      <span className="font-medium text-sm sm:text-base">Drop CSV file here</span>
                      <span className="text-xs mt-1 opacity-70">or click to browse</span>
                    </div>
                  </FeatureCard>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto pt-4 sm:pt-6 animate-in px-4 sm:px-0">
            {cookiesAccepted ? (
              <CreateProcessor />
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100 text-center">
                <LockedFeature 
                  title="Registration Locked" 
                  message="You must accept cookies to create an account and get your API key."
                />
                <button 
                  onClick={() => setShowCookieBanner(true)}
                  className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
                >
                  Accept Cookies to Continue
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-100 mt-8 mb-8 animate-in px-4 sm:px-0">
            {cookiesAccepted ? (
              <>
                <div className="flex items-center mb-8 pb-6 border-b border-slate-100">
                  <div className="p-3 bg-blue-50 rounded-xl mr-4">
                    <FileText className="w-7 h-7 text-blue-600"/> 
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Log New Event</h2>
                    <p className="text-slate-500 text-sm mt-1">Manually record an audit event in your secure trail</p>
                  </div>
                </div>
                
                <form onSubmit={logEvent} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Event Type</label>
                    <input 
                      type="text" 
                      className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white hover:border-slate-400" 
                      placeholder="e.g. user_login, data_access, file_download" 
                      value={eventData.event_type} 
                      onChange={e => setEventData({...eventData, event_type: e.target.value})} 
                      required 
                    />
                    <p className="text-xs text-slate-500 mt-2">Enter a descriptive event type for easy categorization</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">User Identifier</label>
                    <input 
                      type="text" 
                      className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white hover:border-slate-400" 
                      placeholder="e.g. email@company.com, user123, employee_id" 
                      value={eventData.user_identifier} 
                      onChange={e => setEventData({...eventData, user_identifier: e.target.value})} 
                    />
                    <p className="text-xs text-slate-500 mt-2 flex items-center bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <ShieldCheck className="w-4 h-4 mr-2 text-blue-500"/> 
                      User identifiers are automatically hashed with SHA-256 for privacy protection before storage
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Event Data (JSON)</label>
                    <textarea 
                      className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm h-40 bg-white hover:border-slate-400 resize-vertical" 
                      placeholder='{"action": "login", "ip_address": "192.168.1.1", "user_agent": "Mozilla/5.0..."}'
                      value={eventData.event_data} 
                      onChange={e => setEventData({...eventData, event_data: e.target.value})} 
                      required 
                    />
                    <p className="text-xs text-slate-500 mt-2">Enter valid JSON with additional event details and metadata</p>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin mr-3 h-5 w-5 border-2 border-b-0 border-white rounded-full"></div>
                        Processing Event...
                      </span>
                    ) : (
                      'Log Secure Event'
                    )}
                  </button>
                </form>
                
                <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-semibold text-slate-700 mb-2 flex items-center">
                    <Check className="w-4 h-4 mr-2 text-emerald-500" />
                    Event Successfully Logged When:
                  </h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Event is encrypted and added to the immutable audit trail</li>
                    <li>• Hash chain is updated to maintain data integrity</li>
                    <li>• Real-time dashboard statistics are refreshed</li>
                  </ul>
                </div>
              </>
            ) : (
              <LockedFeature 
                title="Event Logging Locked" 
                message="Accept cookies to unlock event logging functionality and start creating secure audit trails."
              />
            )}
          </div>
        )}

        {activeTab === 'privacy' && (
          <PrivacyPolicy 
            setActiveTab={setActiveTab} 
            cookiesAccepted={cookiesAccepted}
            setShowCookieBanner={setShowCookieBanner}
          />
        )}

      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 sm:py-16 mt-12 sm:mt-20 border-t border-slate-800">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6 text-white opacity-90">
            <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
            <span className="text-xl sm:text-2xl font-bold tracking-tight">Auditor Veritas</span>
          </div>
          <p className="text-sm mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed text-slate-500">
            Enterprise-grade audit logging compliant with GDPR, CCPA & SOC2.
          </p>
          
          <div className="mb-4 sm:mb-6">
            <a href="mailto:hazarnodesweden@outlook.com" className="text-blue-400 hover:text-white transition font-medium text-base sm:text-lg">
              hazarnodesweden@outlook.com
            </a>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-6 text-sm font-medium mb-6 sm:mb-8">
            <a href="#" className="hover:text-white transition">Terms</a>
            <button onClick={() => setActiveTab('privacy')} className="hover:text-white transition">Privacy</button>
            <a href="#" className="hover:text-white transition">Security</a>
            <a href="mailto:hazarnodesweden@outlook.com" className="hover:text-white transition">Contact</a>
          </div>
          <p className="text-xs text-slate-600">&copy; 2025 Auditor Veritas. All rights reserved.</p>
        </div>
      </footer>

      {/* Cookie Banner for already accepted users who might want to review */}
      {showCookieBanner && cookiesAccepted && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-center transform transition-all scale-100 border border-slate-200 mx-4">
            <div className="bg-blue-50 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">Cookie Settings</h3>
            
            <p className="text-slate-600 mb-6 sm:mb-8 leading-relaxed text-sm">
              You have already accepted our essential security cookies. These are required for the application to function securely.
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => setShowCookieBanner(false)}
                className="w-full bg-blue-600 text-white py-3 sm:py-3.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-blue-600/30"
              >
                Continue Using App
              </button>
              
              <button 
                onClick={() => setActiveTab('privacy')}
                className="text-sm text-slate-500 hover:text-blue-600 font-medium underline decoration-slate-300 underline-offset-4 hover:decoration-blue-600 transition"
              >
                Review Privacy Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;