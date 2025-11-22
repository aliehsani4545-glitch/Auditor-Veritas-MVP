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
  const [currentStep, setCurrentStep] = useState(0);
  const containerRef = useRef(null);

  const steps = [
    {
      title: "Cryptographic Hashing",
      description: "Every event secured with SHA-256 encryption",
      icon: ShieldCheck,
      color: "emerald"
    },
    {
      title: "Merkle Tree Integrity", 
      description: "Blockchain-inspired data verification",
      icon: TreePine,
      color: "blue"
    },
    {
      title: "GDPR Compliant",
      description: "Full compliance with Article 32 requirements",
      icon: FileLock2,
      color: "purple"
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Start step-by-step animation
          const interval = setInterval(() => {
            setCurrentStep(prev => (prev + 1) % steps.length);
          }, 3000);
          return () => clearInterval(interval);
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

            {/* Animerade funktionssteg */}
            <div className="space-y-4">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div 
                    key={index}
                    className={`flex items-center space-x-4 p-4 rounded-2xl border-2 transition-all duration-500 ${
                      currentStep === index 
                        ? 'border-blue-500 bg-blue-50 scale-105' 
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      currentStep === index ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
                    } transition-all duration-500`}>
                      <StepIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{step.title}</h3>
                      <p className="text-slate-600 text-sm">{step.description}</p>
                    </div>
                  </div>
                );
              })}
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
      popular: false
    },
    {
      name: 'Professional',
      price: 49,
      events: '50,000',
      features: ['Advanced Analytics', 'Bulk Import', 'Priority Support', 'Custom Events', 'Merkle Trees'],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 199,
      events: '500,000',
      features: ['Everything in Pro', 'Dedicated Support', 'SLA Guarantee', 'Custom Integrations', 'AI Monitoring'],
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

// --- MODERN DASHBOARD ---
const ModernDashboard = ({ processor, apiKey, setApiKey, setProcessor, setActiveTab }) => {
  const [stats, setStats] = useState({ 
    totalEvents: 1247, 
    monthlyEvents: 89, 
    eventsLimit: 100, 
    utilization: '89%' 
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchDashboard = async () => {
    if (!apiKey) return;
    setIsLoading(true);
    // Simulerad API-anrop
    setTimeout(() => {
      setStats({
        totalEvents: 1247 + Math.floor(Math.random() * 100),
        monthlyEvents: 89 + Math.floor(Math.random() * 10),
        eventsLimit: 100,
        utilization: `${Math.min(89 + Math.floor(Math.random() * 10), 100)}%`
      });
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    if (processor) {
      fetchDashboard();
    }
  }, [processor]);

  if (!processor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Access Dashboard</h2>
            <p className="text-slate-600 mt-2">Enter your API key to securely manage your audit events</p>
          </div>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="av_xxxxxxxx..."
            className="w-full p-4 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white font-mono shadow-sm"
          />
          <button 
            onClick={() => setProcessor({ companyName: "Demo Company", plan: "professional" })} 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-2xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 mt-6 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                Connecting...
              </span>
            ) : 'Access Dashboard'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white/20">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">{processor.companyName}</h2>
            <div className="flex items-center mt-2 text-slate-600">
              <LayoutDashboard className="w-5 h-5 mr-2" />
              <p className="font-medium">Dashboard Overview</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button onClick={fetchDashboard} className="flex items-center px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl hover:bg-white hover:shadow-sm transition text-slate-700 font-medium">
              <RefreshCw className="w-4 h-4 mr-2 text-amber-500"/> Refresh
            </button>
            <button onClick={() => {setProcessor(null); setApiKey('');}} className="flex items-center px-4 py-2 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 hover:text-red-700 transition text-red-600 font-medium">
              <LogOut className="w-4 h-4 mr-2"/> Sign Out
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition duration-300 group">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="ml-3 text-sm font-semibold text-slate-600 uppercase tracking-wide">Monthly Usage</h3>
            </div>
            <div className="flex justify-between items-end mb-3">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.monthlyEvents}</div>
              <div className="text-sm text-slate-500 font-medium">of {stats.eventsLimit}</div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: stats.utilization }}
              ></div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition duration-300 group">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition">
                <Zap className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="ml-3 text-sm font-semibold text-slate-600 uppercase tracking-wide">Plan Status</h3>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 capitalize mb-1">
              {processor?.plan || 'Inactive'}
            </div>
            <div className="text-sm text-emerald-600 font-medium flex items-center">
              <Check className="w-4 h-4 mr-1" /> Active subscription
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition duration-300 group">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="ml-3 text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Events</h3>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">{stats.totalEvents}</div>
            <div className="text-sm text-slate-500 font-medium">All time record</div>
          </div>
        </div>

        {/* Additional Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { action: "User Login", user: "admin@company.com", time: "2 minutes ago", status: "success" },
                { action: "Data Export", user: "analytics@company.com", time: "15 minutes ago", status: "success" },
                { action: "Failed Login Attempt", user: "unknown@external.com", time: "1 hour ago", status: "warning" },
                { action: "Policy Update", user: "security@company.com", time: "2 hours ago", status: "success" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-900">{activity.action}</div>
                    <div className="text-sm text-slate-500">{activity.user}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      activity.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {activity.status}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Security Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">API Key Rotation</span>
                <span className="text-emerald-600 font-semibold flex items-center">
                  <Check className="w-4 h-4 mr-1" /> Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Encryption</span>
                <span className="text-emerald-600 font-semibold">AES-256</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">GDPR Compliance</span>
                <span className="text-emerald-600 font-semibold flex items-center">
                  <Check className="w-4 h-4 mr-1" /> Certified
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Last Security Scan</span>
                <span className="text-slate-600">Today, 08:42</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MODERN EVENTS PAGE ---
const ModernEventsPage = ({ setActiveTab }) => {
  const [eventData, setEventData] = useState({ 
    event_type: '', 
    event_data: '{}', 
    user_identifier: '' 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [recentEvents, setRecentEvents] = useState([]);

  const logEvent = async (e) => {
    e.preventDefault();
    if (!eventData.event_type.trim()) {
      alert('Please enter an event type');
      return;
    }

    setIsLoading(true);
    
    // Simulerad API-anrop
    setTimeout(() => {
      const newEvent = {
        id: `evt_${Date.now()}`,
        type: eventData.event_type,
        user: eventData.user_identifier || 'Anonymous',
        timestamp: new Date().toLocaleTimeString(),
        status: 'Processed'
      };
      
      setRecentEvents(prev => [newEvent, ...prev.slice(0, 4)]);
      setEventData({ event_type: '', event_data: '{}', user_identifier: '' });
      setIsLoading(false);
      
      alert('✅ Event logged successfully!');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Log Audit Event</h2>
            <p className="text-slate-600 mt-2">Securely record events with automatic PII protection</p>
          </div>

          <form onSubmit={logEvent} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Event Type</label>
              <input
                type="text"
                value={eventData.event_type}
                onChange={(e) => setEventData({...eventData, event_type: e.target.value})}
                placeholder="e.g., user_login, data_access, policy_update"
                className="w-full p-4 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Event Data (JSON)</label>
              <textarea
                value={eventData.event_data}
                onChange={(e) => setEventData({...eventData, event_data: e.target.value})}
                placeholder='{"key": "value", "action": "description"}'
                rows="4"
                className="w-full p-4 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white shadow-sm font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">User Identifier (Optional)</label>
              <input
                type="text"
                value={eventData.user_identifier}
                onChange={(e) => setEventData({...eventData, user_identifier: e.target.value})}
                placeholder="email or user ID - will be automatically hashed"
                className="w-full p-4 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white shadow-sm"
              />
              <p className="text-sm text-slate-500 mt-2">This will be automatically hashed with SHA-256 before storage</p>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-2xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                  Logging Event...
                </span>
              ) : 'Log Secure Event'}
            </button>
          </form>

          {/* Recent Events */}
          {recentEvents.length > 0 && (
            <div className="mt-12">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Recent Events</h3>
              <div className="space-y-3">
                {recentEvents.map((event, index) => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{event.type}</div>
                        <div className="text-sm text-slate-500">{event.user}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-700">{event.timestamp}</div>
                      <div className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        {event.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- MODERN PRIVACY POLICY ---
const ModernPrivacyPolicy = ({ onAccept, privacyAccepted }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

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
    <div ref={sectionRef} className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 w-20 h-20 rounded-2xl rotate-3 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <ShieldCheck className="w-10 h-10 text-emerald-600 -rotate-3" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4 bg-gradient-to-r from-slate-900 to-emerald-600 bg-clip-text text-transparent">
            Privacy & Compliance
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            We process data in strict accordance with GDPR Article 6(1)(b) and industry security standards.
          </p>
        </div>

        {/* Privacy Content */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 transition-all duration-700 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-blue-50 rounded-xl mr-4">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-bold text-2xl text-slate-900">Data Storage</h3>
            </div>
            <ul className="space-y-5">
              <li className="flex items-start group">
                <div className="mt-1 mr-4 p-2 bg-emerald-100 rounded-full">
                  <Check className="w-4 h-4 text-emerald-700"/>
                </div>
                <div>
                  <strong className="block text-slate-900 text-base">🇪🇺 EU Data Centers</strong>
                  <span className="text-slate-600">All data resides in Frankfurt (AWS eu-central-1).</span>
                </div>
              </li>
              <li className="flex items-start group">
                <div className="mt-1 mr-4 p-2 bg-emerald-100 rounded-full">
                  <Check className="w-4 h-4 text-emerald-700"/>
                </div>
                <div>
                  <strong className="block text-slate-900 text-base">🔒 Military-grade Encryption</strong>
                  <span className="text-slate-600">AES-256 at rest and TLS 1.3 in transit.</span>
                </div>
              </li>
              <li className="flex items-start group">
                <div className="mt-1 mr-4 p-2 bg-emerald-100 rounded-full">
                  <Check className="w-4 h-4 text-emerald-700"/>
                </div>
                <div>
                  <strong className="block text-slate-900 text-base">🌳 Merkle Tree Integrity</strong>
                  <span className="text-slate-600">Cryptographic data integrity verification.</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-purple-50 rounded-xl mr-4">
                <Lock className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="font-bold text-2xl text-slate-900">Cookies & Tracking</h3>
            </div>
            <ul className="space-y-5">
              <li className="flex items-start group">
                <div className="mt-1 mr-4 p-2 bg-emerald-100 rounded-full">
                  <Check className="w-4 h-4 text-emerald-700"/>
                </div>
                <div>
                  <strong className="block text-slate-900 text-base">🍪 Essential Only</strong>
                  <span className="text-slate-600">We only store a session token for security functionality.</span>
                </div>
              </li>
              <li className="flex items-start group">
                <div className="mt-1 mr-4 p-2 bg-emerald-100 rounded-full">
                  <Check className="w-4 h-4 text-emerald-700"/>
                </div>
                <div>
                  <strong className="block text-slate-900 text-base">🚫 Zero Tracking</strong>
                  <span className="text-slate-600">No Google Analytics, Facebook Pixels, or ad trackers.</span>
                </div>
              </li>
              <li className="flex items-start group">
                <div className="mt-1 mr-4 p-2 bg-emerald-100 rounded-full">
                  <Check className="w-4 h-4 text-emerald-700"/>
                </div>
                <div>
                  <strong className="block text-slate-900 text-base">🛡️ Local Storage</strong>
                  <span className="text-slate-600">API keys are stored locally on your device only.</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* GDPR Rights Section */}
        <div className={`bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20 mt-8 transition-all duration-700 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h3 className="text-2xl font-bold text-slate-900 mb-8 border-b border-slate-200 pb-6">Your Rights under GDPR</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold text-slate-800 mb-3 flex items-center text-lg">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                Right to Access
              </h4>
              <p className="text-slate-600 leading-relaxed">
                You can export all your raw event data as JSON anytime directly from the dashboard.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-800 mb-3 flex items-center text-lg">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                Right to Erasure
              </h4>
              <p className="text-slate-600 leading-relaxed">
                "Right to be forgotten". To permanently delete your data, please contact our Data Protection Officer.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-800 mb-3 flex items-center text-lg">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                Data Portability
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Move your audit trail to another provider easily using our standard export format.
              </p>
            </div>
          </div>
        </div>

        {/* Acceptance Section */}
        {!privacyAccepted && (
          <div className={`bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-8 text-center shadow-lg mt-8 transition-all duration-700 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-emerald-600 mr-3" />
              <h3 className="text-xl font-bold text-emerald-800">Privacy Policy Acceptance Required</h3>
            </div>
            <p className="text-emerald-700 mb-6 text-lg">
              To continue using Auditor Veritas, please read and accept our Privacy Policy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={onAccept}
                className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-emerald-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
              >
                <Check className="w-5 h-5" />
                <span>I Accept Privacy Policy</span>
              </button>
              <button 
                onClick={() => window.print()} 
                className="border-2 border-emerald-600 text-emerald-600 px-8 py-4 rounded-2xl font-bold hover:bg-emerald-50 transition-all duration-300"
              >
                Print Policy
              </button>
            </div>
          </div>
        )}
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
  const [activeTab, setActiveTab] = useState('privacy');
  const [processor, setProcessor] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const { isLocked, setIsLocked } = useInactivityTimer(300000, !!processor);
  useSecurityProtections();

  useEffect(() => {
    const savedPrivacyAccepted = localStorage.getItem('privacyAccepted');
    const savedApiKey = localStorage.getItem('auditorApiKey');

    if (savedPrivacyAccepted === 'true') {
      setPrivacyAccepted(true);
      setActiveTab('pricing');
    } else {
      setActiveTab('privacy');
    }

    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handlePrivacyAccept = () => {
    localStorage.setItem('privacyAccepted', 'true');
    setPrivacyAccepted(true);
    setActiveTab('pricing');
  };

  if (isLocked && processor) {
    return <LockScreen onUnlock={() => setIsLocked(false)} />;
  }

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {processor && <SecurityWatermark identifier={processor.email || processor.companyName} />}
      
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} privacyAccepted={privacyAccepted} />

      <main className="flex-1">
        {activeTab === 'pricing' && privacyAccepted && (
          <>
            <StripeHeroSection setActiveTab={setActiveTab} />
            <StripeFeatureSection />
            <ModernPricingSection setActiveTab={setActiveTab} />
          </>
        )}

        {activeTab === 'howitworks' && privacyAccepted && (
          <StripeFeatureSection />
        )}

        {activeTab === 'dashboard' && privacyAccepted && (
          <ModernDashboard 
            processor={processor} 
            apiKey={apiKey} 
            setApiKey={setApiKey}
            setProcessor={setProcessor}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'create' && privacyAccepted && (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center px-4 py-8">
            <CreateProcessor />
          </div>
        )}

        {activeTab === 'events' && privacyAccepted && (
          <ModernEventsPage setActiveTab={setActiveTab} />
        )}

        {activeTab === 'privacy' && (
          <ModernPrivacyPolicy 
            onAccept={handlePrivacyAccept}
            privacyAccepted={privacyAccepted}
          />
        )}
      </main>
    </div>
  );
}

export default App;