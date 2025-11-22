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
  Mail, Fingerprint, Terminal, AlertTriangle,
  RefreshCw, Download, Cloud, Shield, Cpu as CpuIcon,
  Sparkles, Rocket, Fingerprint as FingerprintIcon,
  Network, GitBranch, Clock, Hash, Link2,
  Code2, ServerIcon, Workflow, Container,
  LockKeyhole, Binary, Cog, Scan,
  ChevronRight, ChevronLeft,
  RotateCw, TreePine, BrainCircuit, Bitcoin,
  FileLock2, KeyRound, ScanEye, CircuitBoard
} from 'lucide-react';

// VIKTIGT: Tom sträng för Netlify proxy
const API_BASE_URL = '';

// --- Modern Design Hooks ---
const useMousePosition = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const updatePosition = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updatePosition);
    return () => window.removeEventListener('mousemove', updatePosition);
  }, []);
  return position;
};

// --- SÄKERHETSHOOK ---
const useSecurityProtections = () => {
  useEffect(() => {
    const handleContextMenu = (e) => { e.preventDefault(); return false; };

    const handleKeyDown = (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        return false;
      }
      if (e.key === 's' && e.shiftKey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        return false;
      }
      if (e.keyCode === 123) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.userSelect = 'auto';
    };
  }, []);
};

// --- AUTO-LOCK TIMER ---
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

// --- Modern VATTENSTÄMPEL ---
const SecurityWatermark = ({ identifier }) => {
  const mousePosition = useMousePosition();
  const text = `CONFIDENTIAL • ${identifier} • ${new Date().toLocaleDateString()}`;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {Array.from({ length: 25 }).map((_, i) => (
        <div 
          key={i} 
          className="absolute text-center py-8 transform -rotate-12 whitespace-nowrap"
          style={{
            top: `${(i * 20) % 100}%`,
            left: `${(i * 15) % 100}%`,
            filter: `blur(${Math.abs(mousePosition.x - window.innerWidth / 2) / 100}px)`
          }}
        >
          <span className="text-xl font-black text-slate-900/10 uppercase tracking-widest">
            {text}
          </span>
        </div>
      ))}
    </div>
  );
};

const LockScreen = ({ onUnlock }) => (
  <div className="fixed inset-0 z-[10000] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 backdrop-blur-xl flex flex-col items-center justify-center text-white animate-in fade-in duration-500">
    <div className="relative">
      <div className="absolute inset-0 bg-white/10 rounded-full blur-xl animate-pulse"></div>
      <div className="relative bg-white/10 p-8 rounded-full mb-8 backdrop-blur-sm border border-white/20">
        <Lock className="w-20 h-20 text-emerald-400" />
      </div>
    </div>
    <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
      Session Secured
    </h2>
    <p className="text-slate-300 mb-8 text-center max-w-md text-lg">
      Dashboard locked due to inactivity. Re-authenticate to continue.
    </p>
    <button 
      onClick={onUnlock} 
      className="group relative bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-12 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/25 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
      <span className="relative">Unlock Dashboard</span>
    </button>
  </div>
);

// --- STRIPE-INSPIRERAD HERO SECTION ---
const StripeHeroSection = ({ setActiveTab }) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-white overflow-hidden">
      {/* Bakgrundseffekter */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50/50 skew-x-12 transform origin-top-right" />
      
      {/* Animerade gradient-cirklar */}
      <div className="absolute top-1/4 -left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Vänster: Textinnehåll */}
          <div className={`space-y-8 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="space-y-4">
              <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold border border-blue-200">
                <Sparkles className="w-4 h-4 mr-2" />
                Enterprise Security Platform
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 leading-tight">
                Immutable
                <span className="block text-slate-400">Audit Trails</span>
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                Cryptographic data integrity with automated compliance. 
                Everything operates seamlessly to ensure GDPR compliance 
                without compromising performance.
              </p>
            </div>

            {/* Funktionslista */}
            <div className="space-y-3">
              {[
                "Cryptographic Hashing (SHA-256)",
                "Automated Integrity Verification", 
                "GDPR Article 32 Compliant",
                "Real-time Monitoring"
              ].map((item, index) => (
                <div key={index} className="flex items-center text-slate-700 font-medium">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mr-3 text-emerald-600">
                    <Check size={14} strokeWidth={3} />
                  </div>
                  {item}
                </div>
              ))}
            </div>

            {/* CTA Knappar */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={() => setActiveTab('create')}
                className="group bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold transition-all hover:bg-slate-800 flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Start Integration
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button 
                onClick={() => setActiveTab('pricing')}
                className="border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-2xl font-bold transition-all hover:border-slate-400 hover:bg-slate-50 flex items-center justify-center"
              >
                View Pricing
              </button>
            </div>
          </div>

          {/* Höger: Telefon Mockup */}
          <div className={`relative transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="phone-container">
              <div className="phone-mockup w-[320px] mx-auto rounded-[40px] border-[12px] border-slate-100 overflow-hidden relative bg-white shadow-2xl">
                
                {/* Telefon Header */}
                <div className="bg-white p-6 border-b border-slate-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">Live Audit Feed</h3>
                      <p className="text-xs text-slate-500">System Status: Active</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-emerald-600 font-semibold">SECURE</span>
                    </div>
                  </div>
                </div>

                {/* Telefon Content */}
                <div className="p-4 bg-slate-50/50 min-h-[500px] space-y-3">
                  {[
                    { id: "LOG-921", user: "Admin User", action: "Policy Update", status: "Verified", time: "Just now", color: "bg-emerald-100 text-emerald-700" },
                    { id: "LOG-920", user: "System", action: "Key Rotation", status: "Processing", time: "2m ago", color: "bg-blue-100 text-blue-700" },
                    { id: "LOG-919", user: "Sarah J.", action: "Data Export", status: "Completed", time: "15m ago", color: "bg-slate-100 text-slate-700" },
                    { id: "LOG-918", user: "API Gateway", action: "Flagged IP", status: "Blocked", time: "1h ago", color: "bg-red-100 text-red-700" },
                    { id: "LOG-917", user: "System", action: "Backup", status: "Verified", time: "2h ago", color: "bg-emerald-100 text-emerald-700" }
                  ].map((log, index) => (
                    <div 
                      key={log.id}
                      className={`stripe-card bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between cursor-default hover:shadow-md transition-all duration-300 ${
                        isVisible ? 'visible' : ''
                      }`}
                      style={{ 
                        transitionDelay: `${index * 100}ms`,
                        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                        opacity: isVisible ? 1 : 0
                      }}
                    >
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                          index === 0 ? 'bg-emerald-100' : 'bg-slate-100'
                        }`}>
                          {index === 0 ? 
                            <ShieldCheck size={18} className="text-emerald-600"/> : 
                            <FileText size={18} className="text-slate-500"/>
                          }
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{log.action}</div>
                          <div className="text-xs text-slate-500">{log.user} • {log.id}</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full mb-1 ${log.color}`}>
                          {log.status}
                        </span>
                        <span className="text-[10px] text-slate-400">{log.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Telefon Footer */}
                <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-slate-100 p-4 flex justify-around items-center">
                  <LayoutDashboard size={20} className="text-emerald-600" />
                  <Search size={20} className="text-slate-300" />
                  <Settings size={20} className="text-slate-300" />
                </div>
              </div>
            </div>

            {/* Dekorativa element */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- STRIPE-INSPIRERAD FEATURE SECTION ---
const StripeFeatureSection = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const features = [
    {
      icon: ShieldCheck,
      title: "Cryptographic Integrity",
      description: "Every event is cryptographically sealed with SHA-256 hashing and Merkle tree verification.",
      color: "emerald"
    },
    {
      icon: KeyRound,
      title: "Automated Key Rotation",
      description: "HD key management with automated 90-day rotation for maximum security.",
      color: "blue"
    },
    {
      icon: BrainCircuit,
      title: "AI Compliance Monitoring",
      description: "Real-time GDPR compliance monitoring with intelligent threat detection.",
      color: "purple"
    },
    {
      icon: FileLock2,
      title: "GDPR Certified",
      description: "Full compliance with GDPR Article 32 requirements for data protection.",
      color: "orange"
    }
  ];

  // FIX: Create color mapping to avoid dynamic class names
  const colorClasses = {
    emerald: {
      text: 'text-emerald-600',
      bg: 'bg-emerald-100'
    },
    blue: {
      text: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    purple: {
      text: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    orange: {
      text: 'text-orange-600',
      bg: 'bg-orange-100'
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  // FIX: Get the active feature icon component
  const ActiveFeatureIcon = features[activeFeature].icon;
  const activeColor = features[activeFeature].color;
  const activeColorClass = colorClasses[activeColor];

  return (
    <div ref={sectionRef} className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">
            Enterprise Security
            <span className="block text-slate-400">Built for Compliance</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Advanced cryptographic security meets enterprise compliance requirements 
            in one seamless platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const FeatureIcon = feature.icon;
            const featureColorClass = colorClasses[feature.color];
            
            return (
              <div
                key={index}
                className={`group relative bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-500 cursor-pointer ${
                  activeFeature === index ? 'ring-2 ring-blue-500 scale-105' : ''
                } ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ 
                  transitionDelay: `${index * 150}ms`,
                  transform: isVisible ? 'translateY(0)' : 'translateY(20px)'
                }}
                onClick={() => setActiveFeature(index)}
                onMouseEnter={() => setActiveFeature(index)}
              >
                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl ${featureColorClass.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <FeatureIcon className={`w-6 h-6 ${featureColorClass.text}`} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Active indicator */}
                {activeFeature === index && (
                  <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                )}
              </div>
            );
          })}
        </div>

        {/* Feature Details */}
        <div className={`mt-16 bg-white rounded-3xl p-8 shadow-lg border border-slate-200 transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                {features[activeFeature].title}
              </h3>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                {features[activeFeature].description}
              </p>
              <ul className="space-y-3">
                {[
                  "Real-time cryptographic verification",
                  "Automated compliance reporting", 
                  "Military-grade encryption",
                  "Blockchain-inspired integrity"
                ].map((item, i) => (
                  <li key={i} className="flex items-center text-slate-700">
                    <Check className="w-5 h-5 text-emerald-500 mr-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 border border-slate-200">
                <div className="text-center">
                  {/* FIX: Use the component variable instead of bracket notation */}
                  <ActiveFeatureIcon className={`w-16 h-16 ${activeColorClass.text} mx-auto mb-4`} />
                  <div className="text-sm text-slate-500 uppercase font-semibold tracking-wide">
                    Active Security Layer
                  </div>
                  <div className="w-16 h-1 bg-emerald-500 rounded-full mx-auto mt-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MODERN PRICING SECTION ---
const ModernPricingSection = ({ setActiveTab }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  const plans = [
    {
      name: 'Starter',
      price: 0,
      events: '100',
      features: ['Basic Audit Trail', 'GDPR Compliance', 'Email Support', 'SHA-256 Hashing'],
      gradient: 'from-slate-500 to-slate-700',
      popular: false
    },
    {
      name: 'Professional',
      price: 49,
      events: '50,000',
      features: ['Advanced Analytics', 'Bulk Import', 'Priority Support', 'Custom Events', 'Merkle Trees'],
      gradient: 'from-blue-500 to-cyan-500',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 199,
      events: '500,000',
      features: ['Everything in Pro', 'Dedicated Support', 'SLA Guarantee', 'Custom Integrations', 'AI Monitoring'],
      gradient: 'from-purple-500 to-pink-500',
      popular: false
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  return (
    <div ref={sectionRef} className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">
            Simple, Transparent
            <span className="block text-slate-400">Pricing</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Start small, scale securely. All plans include enterprise-grade security from day one.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-3xl p-8 transition-all duration-500 hover:scale-105 flex flex-col ${
                plan.popular 
                  ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-2xl scale-105' 
                  : 'bg-white border border-slate-200 shadow-xl'
              } ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ 
                transitionDelay: `${index * 200}ms`,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)'
              }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  MOST POPULAR
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{plan.name}</h3>
              
              <div className="mb-6 flex items-baseline justify-center">
                <span className="text-4xl font-black text-slate-900">${plan.price}</span>
                <span className="text-slate-500 ml-2 font-medium">/month</span>
              </div>
              
              <div className="text-center mb-6">
                <span className="text-slate-600 font-semibold">{plan.events} events/month</span>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-start text-slate-600">
                    <Check className="w-5 h-5 text-emerald-500 mr-3 mt-0.5" />
                    {feat}
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => setActiveTab('create')}
                className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700' 
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
              >
                {plan.price === 0 ? 'Start for Free' : `Choose ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- MODERN NAVBAR ---
const Navbar = ({ activeTab, setActiveTab, privacyAccepted }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { key: 'pricing', label: 'Pricing' },
    { key: 'howitworks', label: 'How It Works' },
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'create', label: 'Create' },
    { key: 'events', label: 'Events' },
    { key: 'privacy', label: 'Privacy' }
  ];

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
    <header className="bg-white/80 backdrop-blur-xl text-slate-900 sticky top-0 z-50 shadow-lg border-b border-slate-200/50">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:opacity-90 transition group"
            onClick={() => handleTabClick('pricing')}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-white p-2 rounded-xl shadow-sm">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-emerald-600 bg-clip-text text-transparent">
                Auditor Veritas
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-1 bg-white/50 backdrop-blur-sm rounded-2xl p-1 border border-slate-200/50">
            {menuItems.map((item) => {
              const isDisabled = !privacyAccepted && item.key !== 'privacy';
              
              return (
                <button
                  key={item.key}
                  onClick={() => handleTabClick(item.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === item.key 
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg' 
                      : isDisabled
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                  }`}
                  disabled={isDisabled}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-slate-200/50 hover:bg-slate-100/50 transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-slate-200/50 pt-4 animate-in fade-in slide-in-from-top-2">
            <nav className="flex flex-col space-y-2 bg-white/50 backdrop-blur-sm rounded-2xl p-2 border border-slate-200/50">
              {menuItems.map((item) => {
                const isDisabled = !privacyAccepted && item.key !== 'privacy';
                
                return (
                  <button
                    key={item.key}
                    onClick={() => handleTabClick(item.key)}
                    className={`px-4 py-3 rounded-xl text-left font-medium transition-all duration-200 ${
                      activeTab === item.key 
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' 
                        : isDisabled
                        ? 'text-slate-400 cursor-not-allowed'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                    }`}
                    disabled={isDisabled}
                  >
                    {item.label}
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

// --- MAIN APP COMPONENT ---
function App() {
  const [activeTab, setActiveTab] = useState('pricing');
  const [processor, setProcessor] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [eventData, setEventData] = useState({ event_type: '', event_data: '{}', user_identifier: '' });
  const [stats, setStats] = useState({ totalEvents: 0, monthlyEvents: 0, eventsLimit: 100, utilization: '0%' });
  const [pricingPlans, setPricingPlans] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [cookiesAccepted, setCookiesAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const { isLocked, setIsLocked } = useInactivityTimer(300000, !!processor);
  useSecurityProtections();

  useEffect(() => {
    const savedCookies = localStorage.getItem('cookiesAccepted');
    const savedApiKey = localStorage.getItem('auditorApiKey');
    const savedPrivacyAccepted = localStorage.getItem('privacyAccepted');

    if (savedCookies === 'true') {
      setCookiesAccepted(true);
      setShowCookieBanner(false);
    }

    if (savedPrivacyAccepted === 'true') {
      setPrivacyAccepted(true);
    }

    if (savedApiKey) {
      setApiKey(savedApiKey);
    }

    setPricingPlans({
      starter: { 
        name: 'Starter', 
        events: 100, 
        price: 0, 
        features: ['Basic Audit Trail', 'GDPR Compliance', 'Email Support', '100 Events/Month'],
        gradient: 'from-slate-500 to-slate-700'
      },
      professional: { 
        name: 'Professional', 
        events: 50000, 
        price: 49, 
        features: ['Advanced Analytics', 'Bulk Import', 'Priority Support', 'Custom Events', '50K Events/Month'], 
        featured: true,
        gradient: 'from-blue-500 to-cyan-500'
      },
      enterprise: { 
        name: 'Enterprise', 
        events: 500000, 
        price: 199, 
        features: ['Everything in Professional', 'Dedicated Support', 'SLA Guarantee', 'Custom Integrations', '500K Events/Month'],
        gradient: 'from-purple-500 to-pink-500'
      }
    });
  }, []);

  const handlePrivacyAccept = () => {
    localStorage.setItem('privacyAccepted', 'true');
    setPrivacyAccepted(true);
    setActiveTab('pricing');
  };

  // Resten av funktionerna...

  if (isLocked && processor) {
    return <LockScreen onUnlock={() => setIsLocked(false)} />;
  }

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {processor && <SecurityWatermark identifier={processor.email || processor.companyName} />}
      
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} privacyAccepted={privacyAccepted} />

      <main className="flex-1">
        {/* Hero Section visas alltid först */}
        {activeTab === 'pricing' && (
          <>
            <StripeHeroSection setActiveTab={setActiveTab} />
            <StripeFeatureSection />
            <ModernPricingSection setActiveTab={setActiveTab} />
          </>
        )}

        {activeTab === 'howitworks' && (
          <StripeFeatureSection />
        )}

        {/* Övriga tabs kan behålla sina originalkomponenter */}
        {activeTab === 'dashboard' && (
          <div className="animate-in px-4 sm:px-0 py-8">
            {/* ... dashboard innehåll */}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto py-8 animate-in px-4">
            <CreateProcessor />
          </div>
        )}

        {activeTab === 'events' && (
          <div className="max-w-4xl mx-auto py-8 animate-in px-4">
            {/* ... events innehåll */}
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 px-4 sm:px-0 py-12">
            {/* ... privacy policy innehåll */}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;