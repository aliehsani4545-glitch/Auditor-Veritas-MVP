import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import CryptoJS from 'crypto-js';
import CreateProcessor from './components/CreateProcessor'; // Se till att denna fil finns kvar
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  ShieldCheck, BarChart3, Users, FileText, Check, 
  Lock, Zap, LayoutDashboard, LogOut, PlusCircle,
  Key, Database, Search, Server, Settings,
  ArrowRight, Play, ArrowLeft, Menu, X,
  Smartphone, Globe, Cpu, Code, Eye, EyeOff,
  Mail, Fingerprint, Terminal, AlertTriangle,
  RefreshCw, Download, Cloud, Shield,
  Sparkles, Rocket, Network, GitBranch, Clock, Hash, Link2,
  Code2, ServerIcon, Workflow, Container,
  LockKeyhole, Binary, Cog, Scan,
  ChevronRight, ChevronLeft,
  RotateCw, TreePine, BrainCircuit, Bitcoin,
  FileLock2, KeyRound, ScanEye, CircuitBoard
} from 'lucide-react';

// Registrera GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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
        e.preventDefault(); return false;
      }
      if (e.key === 's' && e.shiftKey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault(); return false;
      }
      if (e.keyCode === 123) {
        e.preventDefault(); return false;
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

// --- KEY ROTATION COMPONENT ---
const KeyRotation = ({ processor, apiKey, onKeyRotate }) => {
  const [isRotating, setIsRotating] = useState(false);
  const [lastRotation, setLastRotation] = useState(null);

  const handleKeyRotation = async () => {
    if (!processor || !apiKey) return;
    setIsRotating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const newKey = `av_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      setLastRotation(new Date().toISOString());
      onKeyRotate(newKey);
      alert('🔑 API Key rotated successfully!');
    } catch (error) {
      alert('❌ Key rotation failed.');
    } finally {
      setIsRotating(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="p-3 bg-amber-50 rounded-xl mr-4">
            <RotateCw className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Key Rotation</h3>
            <p className="text-slate-600 text-sm">Automated security key management</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-100 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-emerald-700 text-xs font-semibold">ACTIVE</span>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600">Current Key:</span>
          <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono text-slate-800">
            {apiKey ? `${apiKey.substring(0, 10)}...` : 'Not available'}
          </code>
        </div>
        <button 
          onClick={handleKeyRotation}
          disabled={isRotating || !processor}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isRotating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RotateCw className="w-4 h-4" />}
          <span>{isRotating ? 'Rotating Keys...' : 'Rotate API Key Now'}</span>
        </button>
      </div>
    </div>
  );
};

// --- MODERN StatsCards ---
const StatsCards = ({ stats, processor }) => (
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
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500" style={{ width: stats.utilization }}></div>
      </div>
    </div>
    {/* Fler kort här vid behov... */}
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
);

// --- MODERN LockedFeature ---
const LockedFeature = ({ title, desc, setActiveTab }) => (
  <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl p-8 border border-dashed border-slate-300 flex flex-col items-center justify-center text-center h-full hover:bg-slate-50 transition backdrop-blur-sm">
    <div className="bg-slate-200 p-4 rounded-2xl mb-6">
      <Lock className="w-8 h-8 text-slate-500" />
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-4">{title}</h3>
    <p className="text-slate-600 mb-8 max-w-sm leading-relaxed">{desc}</p>
    <button 
      onClick={() => setActiveTab('pricing')} 
      className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
    >
      Upgrade to Unlock
    </button>
  </div>
);

// --- NY STRIPE-INSPIRERAD MOBILE ILLUSTRATION (SVG) ---
const MobilePaymentIllustration = ({ activeProduct }) => {
  const svgRef = useRef(null);

  const screens = {
    crypto: (
      <g id="screen-crypto" className="screen-content">
        <path d="M20 40 H280" stroke="currentColor" strokeWidth="2" className="draw-line" />
        <rect x="40" y="80" width="220" height="120" rx="8" stroke="currentColor" strokeWidth="2" fill="none" className="draw-line" />
        <path d="M60 110 H240" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />
        <path d="M60 140 H240" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />
        <path d="M60 170 H180" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />
        <circle cx="150" cy="140" r="20" stroke="currentColor" strokeWidth="2" fill="#0f172a" className="draw-pop" />
        <path d="M140 135 V130 A10 10 0 0 1 160 130 V135" stroke="white" strokeWidth="2" fill="none" />
        <rect x="140" y="135" width="20" height="16" rx="2" fill="white" />
        <text x="150" y="240" textAnchor="middle" fill="currentColor" fontSize="14" fontWeight="bold" className="fade-in">SHA-256 ENCRYPTED</text>
      </g>
    ),
    merkle: (
      <g id="screen-merkle" className="screen-content">
        <circle cx="150" cy="60" r="15" stroke="currentColor" strokeWidth="2" fill="none" className="draw-pop" />
        <path d="M150 75 V110" stroke="currentColor" strokeWidth="2" className="draw-line" />
        <path d="M150 110 L100 140" stroke="currentColor" strokeWidth="2" className="draw-line" />
        <path d="M150 110 L200 140" stroke="currentColor" strokeWidth="2" className="draw-line" />
        <circle cx="100" cy="140" r="12" stroke="currentColor" strokeWidth="2" fill="none" className="draw-pop" />
        <circle cx="200" cy="140" r="12" stroke="currentColor" strokeWidth="2" fill="none" className="draw-pop" />
        <path d="M100 152 L70 180" stroke="currentColor" strokeWidth="2" className="draw-line" />
        <path d="M100 152 L130 180" stroke="currentColor" strokeWidth="2" className="draw-line" />
        <rect x="80" y="220" width="140" height="40" rx="20" fill="currentColor" opacity="0.1" className="fade-in" />
        <text x="150" y="245" textAnchor="middle" fill="currentColor" fontSize="12" fontWeight="bold" className="fade-in">INTEGRITY VERIFIED</text>
      </g>
    ),
    keys: (
      <g id="screen-keys" className="screen-content">
        <circle cx="150" cy="120" r="50" stroke="currentColor" strokeWidth="2" strokeDasharray="10 5" fill="none" className="spin-slow" />
        <path d="M150 90 V70" stroke="currentColor" strokeWidth="2" />
        <path d="M135 135 L165 105" stroke="currentColor" strokeWidth="3" className="draw-line" />
        <circle cx="135" cy="135" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
        <rect x="50" y="200" width="200" height="6" rx="3" fill="currentColor" opacity="0.2" />
        <rect x="50" y="200" width="120" height="6" rx="3" fill="#10b981" className="draw-width" />
        <text x="50" y="225" fill="currentColor" fontSize="10" className="fade-in">Auto-rotation: 90 days</text>
      </g>
    ),
    compliance: (
      <g id="screen-compliance" className="screen-content">
        <rect x="40" y="60" width="220" height="40" rx="8" stroke="currentColor" strokeWidth="2" fill="none" className="draw-line" />
        <circle cx="60" cy="80" r="8" fill="#10b981" className="draw-pop" />
        <text x="80" y="85" fill="currentColor" fontSize="14">GDPR Art. 32</text>
        <rect x="40" y="115" width="220" height="40" rx="8" stroke="currentColor" strokeWidth="2" fill="none" className="draw-line" style={{animationDelay: '0.2s'}} />
        <circle cx="60" cy="135" r="8" fill="#10b981" className="draw-pop" style={{animationDelay: '0.2s'}} />
        <text x="80" y="140" fill="currentColor" fontSize="14">Data Residency (EU)</text>
      </g>
    )
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".draw-line", { strokeDasharray: 400, strokeDashoffset: 400 });
      gsap.set(".draw-pop", { scale: 0, transformOrigin: "center" });
      gsap.set(".fade-in", { opacity: 0, y: 10 });
      gsap.set(".draw-width", { width: 0 });

      const tl = gsap.timeline();
      tl.to(".draw-line", { strokeDashoffset: 0, duration: 1.2, ease: "power2.out", stagger: 0.1 })
        .to(".draw-pop", { scale: 1, duration: 0.4, ease: "back.out(1.7)", stagger: 0.05 }, "-=0.8")
        .to(".draw-width", { width: 120, duration: 1, ease: "power1.inOut" }, "-=1")
        .to(".fade-in", { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, "-=0.5");
    }, svgRef);
    return () => ctx.revert();
  }, [activeProduct]);

  return (
    <div className="relative w-full max-w-[320px] aspect-[9/19] mx-auto transform transition-transform duration-500 hover:scale-105">
      <svg ref={svgRef} viewBox="0 0 300 600" className="w-full h-full drop-shadow-2xl" style={{ color: '#334155' }}>
        <defs>
          <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
        </defs>
        <rect x="10" y="10" width="280" height="580" rx="40" fill="#1e293b" stroke="#475569" strokeWidth="8" />
        <rect x="25" y="25" width="250" height="550" rx="32" fill="url(#screenGrad)" />
        <g transform="translate(0, 50)">{screens[activeProduct] || screens.crypto}</g>
        <rect x="100" y="35" width="100" height="24" rx="12" fill="#0f172a" />
        <path d="M25 25 Q 275 25 275 50 V 200 L 25 400 Z" fill="white" opacity="0.05" pointerEvents="none" />
      </svg>
    </div>
  );
};

// --- NY STRIPE-INSPIRERAD PRODUCT NETWORK (Glowing Lines) ---
const ProductNetwork = ({ activeProduct, setActiveProduct }) => {
  const networkRef = useRef(null);

  const products = [
    { id: 'crypto', name: 'Hashing', icon: ShieldCheck, x: 20, y: 30, color: '#10b981' },
    { id: 'merkle', name: 'Merkle Tree', icon: TreePine, x: 70, y: 15, color: '#3b82f6' },
    { id: 'keys', name: 'Key Rotation', icon: KeyRound, x: 15, y: 75, color: '#8b5cf6' },
    { id: 'compliance', name: 'Compliance', icon: FileLock2, x: 65, y: 70, color: '#f59e0b' }
  ];

  const connections = [
    ['crypto', 'merkle'], ['crypto', 'keys'],
    ['merkle', 'compliance'], ['keys', 'compliance'],
    ['crypto', 'compliance']
  ];

  const getPos = (id) => products.find(p => p.id === id);

  return (
    <div ref={networkRef} className="relative h-[600px] w-full bg-slate-50 overflow-hidden select-none">
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '30px 30px', opacity: 0.5 }}></div>
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {connections.map(([startId, endId], i) => {
          const start = getPos(startId);
          const end = getPos(endId);
          const isActive = activeProduct === startId || activeProduct === endId;
          const midX = (start.x + end.x) / 2;
          const midY = (start.y + end.y) / 2;
          const pathD = `M ${start.x}% ${start.y}% Q ${midX}% ${midY + (i % 2 === 0 ? 10 : -10)}% ${end.x}% ${end.y}%`;

          return (
            <g key={`${startId}-${endId}`}>
              <path d={pathD} stroke="#cbd5e1" strokeWidth="1" fill="none" />
              <path d={pathD} stroke={isActive ? (activeProduct === startId ? start.color : end.color) : 'transparent'} strokeWidth="2" fill="none" strokeDasharray="10 10" className={`transition-all duration-1000 ${isActive ? 'opacity-100 animate-flow' : 'opacity-0'}`} />
            </g>
          );
        })}
      </svg>
      {products.map((product) => {
        const isActive = activeProduct === product.id;
        const ProductIcon = product.icon;
        return (
          <div key={product.id} onClick={() => setActiveProduct(product.id)} className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-500 ease-out ${isActive ? 'scale-110 z-20' : 'scale-100 z-10 grayscale opacity-70 hover:grayscale-0 hover:opacity-100'}`} style={{ left: `${product.x}%`, top: `${product.y}%` }}>
            <div className={`absolute inset-0 rounded-full blur-xl transition-opacity duration-500 ${isActive ? 'opacity-60' : 'opacity-0'}`} style={{ backgroundColor: product.color, transform: 'scale(1.5)' }}></div>
            <div className={`relative flex flex-col items-center bg-white p-4 rounded-2xl shadow-lg border transition-colors duration-300 ${isActive ? 'border-slate-300' : 'border-slate-100'}`}>
              <div className="p-3 rounded-xl mb-2 transition-colors duration-300" style={{ backgroundColor: isActive ? `${product.color}20` : '#f1f5f9' }}>
                <ProductIcon className={`w-6 h-6 transition-colors duration-300`} style={{ color: isActive ? product.color : '#64748b' }} />
              </div>
              <span className={`text-sm font-bold transition-colors ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{product.name}</span>
            </div>
            {isActive && (<><div className="absolute top-1/2 -right-1 w-2 h-2 bg-white border border-slate-300 rounded-full"></div><div className="absolute top-1/2 -left-1 w-2 h-2 bg-white border border-slate-300 rounded-full"></div></>)}
          </div>
        );
      })}
    </div>
  );
};

// --- STRIPE HERO SECTION MED SCROLL-DRIVEN CONTENT ---
const StripeHeroSection = ({ setActiveTab, activeProduct, setActiveProduct }) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  const products = {
    crypto: {
      title: "Cryptographic Hashing",
      description: "Every event secured with military-grade SHA-256 encryption. Ensure data integrity from the moment it's captured.",
      features: ["Real-time SHA-256 hashing", "Immutable data records", "Automated integrity checks"],
      code: `// Secure event hashing\nconst eventHash = CryptoJS.SHA256(\n  JSON.stringify(eventData)\n).toString();`
    },
    merkle: {
      title: "Merkle Tree Integrity", 
      description: "Blockchain-inspired verification with Merkle trees. Cryptographically prove data hasn't been altered.",
      features: ["Merkle tree construction", "Cryptographic proofs", "Tamper-evident design"],
      code: `// Merkle tree verification\nconst proof = merkleTree.getProof(eventHash);\nconst isValid = tree.verifyProof(proof);`
    },
    keys: {
      title: "Automated Key Rotation",
      description: "HD key management with automated 90-day rotation. Never worry about compromised credentials again.",
      features: ["90-day key rotation", "HD key derivation", "Zero-downtime updates"],
      code: `// Automated key rotation\nconst newKey = generateHDKey();\nawait rotateAPIKey(previousKey, newKey);`
    },
    compliance: {
      title: "GDPR Compliance",
      description: "Full compliance with GDPR Article 32 requirements. Built-in data protection by design and by default.",
      features: ["GDPR Article 32 compliant", "Right to erasure", "Data portability"],
      code: `// GDPR data export\nconst userData = await exportUserData(userId);\nawait fulfillGDPRRequest(userData);`
    }
  };

  const activeProductData = products[activeProduct] || products.crypto;

  // Scroll triggers för att byta aktiv produkt när man scrollar
  useEffect(() => {
    if (!contentRef.current) return;
    
    // Enkel fade-in för hela sektionen
    const section = contentRef.current;
    gsap.fromTo(section, { opacity: 0, y: 50 }, {
      opacity: 1, y: 0, duration: 1,
      scrollTrigger: { trigger: section, start: "top 80%", end: "bottom 20%", toggleActions: "play none none reverse" }
    });
    
    return () => ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }, []);

  return (
    <div ref={containerRef} className="relative bg-white overflow-hidden">
      {/* Header Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div ref={contentRef} className="text-center mb-16">
          <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold border border-blue-200 mb-8">
            <Sparkles className="w-4 h-4 mr-2" />
            Enterprise Cryptographic Security
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 mb-6 leading-tight">
            Immutable audit trails
            <span className="block text-slate-400">for modern compliance</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Cryptographic data integrity meets enterprise compliance. Everything operates seamlessly to ensure GDPR compliance without compromising performance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button onClick={() => setActiveTab('create')} className="group bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold transition-all hover:bg-slate-800 flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-1">
              Start integration <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button onClick={() => setActiveTab('pricing')} className="border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-2xl font-bold transition-all hover:border-slate-400 hover:bg-slate-50 flex items-center justify-center">
              View pricing
            </button>
          </div>
        </div>

        {/* Product Network */}
        <div className="content-section relative mb-20">
          <ProductNetwork activeProduct={activeProduct} setActiveProduct={setActiveProduct} />
        </div>

        {/* Kontextuellt Innehåll (Mobile Illu + Text + Kod) */}
        <div className="content-section max-w-6xl mx-auto mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* VÄNSTER: Mobile Payment Illustration (STICKY) */}
            <div className="order-1 lg:order-1 flex justify-center h-[600px] sticky top-20">
                <MobilePaymentIllustration activeProduct={activeProduct} />
            </div>

            {/* HÖGER: Text Content + Code Example Wrapper */}
            <div className="order-2 lg:order-2 space-y-6">
                <div className="space-y-6 animate-in fade-in duration-500" key={activeProduct}>
                  <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
                    {activeProductData.title}
                  </h2>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    {activeProductData.description}
                  </p>
                  <ul className="space-y-4">
                    {activeProductData.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-slate-700">
                        <Check className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => setActiveTab('create')} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors">
                    Start with {activeProductData.title}
                  </button>
                </div>

                {/* Code Example */}
                <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-slate-400 text-sm font-mono">implementation.js</span>
                  </div>
                  <pre className="text-slate-200 text-sm leading-relaxed font-mono overflow-x-auto">
                    <code>{activeProductData.code}</code>
                  </pre>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SCROLL-DRIVEN FEATURE REVEAL ---
const ScrollRevealSection = ({ children, className = "" }) => {
  const sectionRef = useRef(null);
  useEffect(() => {
    if (!sectionRef.current) return;
    gsap.fromTo(sectionRef.current, { opacity: 0, y: 60 }, {
      opacity: 1, y: 0, duration: 1,
      scrollTrigger: { trigger: sectionRef.current, start: "top 80%", end: "bottom 20%", toggleActions: "play none none reverse" }
    });
    return () => ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }, []);
  return <div ref={sectionRef} className={className}>{children}</div>;
};

// --- STRIPE FEATURE GRID ---
const StripeFeatureGrid = () => {
  const features = [
    { icon: ShieldCheck, title: "Cryptographic Integrity", description: "Every event secured with SHA-256 hashing and Merkle tree verification.", color: "emerald" },
    { icon: KeyRound, title: "Automated Key Rotation", description: "HD key management with automated 90-day rotation for maximum security.", color: "blue" },
    { icon: FileLock2, title: "GDPR Certified", description: "Full compliance with GDPR Article 32 requirements for data protection.", color: "orange" },
    { icon: Database, title: "EU Data Centers", description: "All data resides in Frankfurt AWS eu-central-1 for GDPR compliance.", color: "purple" }
  ];
  const colorClasses = {
    emerald: { text: 'text-emerald-600', bg: 'bg-emerald-100' },
    blue: { text: 'text-blue-600', bg: 'bg-blue-100' },
    orange: { text: 'text-orange-600', bg: 'bg-orange-100' },
    purple: { text: 'text-purple-600', bg: 'bg-purple-100' }
  };
  return (
    <div className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollRevealSection className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">Built for security teams <span className="block text-slate-400">Trusted by compliance officers</span></h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">Advanced cryptographic security meets enterprise compliance requirements in one seamless platform.</p>
        </ScrollRevealSection>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const FeatureIcon = feature.icon;
            const c = colorClasses[feature.color];
            return (
              <ScrollRevealSection key={index} className="group relative bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-500">
                <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <FeatureIcon className={`w-6 h-6 ${c.text}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </ScrollRevealSection>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- MODERN PRICING SECTION ---
const ModernPricingSection = ({ setActiveTab }) => {
  const plans = [
    { name: 'Starter', price: 0, events: '100', features: ['Basic Audit Trail', 'GDPR Compliance', 'Email Support', 'SHA-256 Hashing'], popular: false },
    { name: 'Professional', price: 49, events: '50,000', features: ['Advanced Analytics', 'Bulk Import', 'Priority Support', 'Custom Events', 'Merkle Trees'], popular: true },
    { name: 'Enterprise', price: 199, events: '500,000', features: ['Everything in Pro', 'Dedicated Support', 'SLA Guarantee', 'Custom Integrations'], popular: false }
  ];

  return (
    <div className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollRevealSection className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">Simple, transparent pricing <span className="block text-slate-400">No hidden fees</span></h2>
        </ScrollRevealSection>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <ScrollRevealSection key={index} className={`relative rounded-3xl p-8 transition-all duration-500 hover:scale-105 flex flex-col ${plan.popular ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-2xl scale-105' : 'bg-white border border-slate-200 shadow-xl'}`}>
              {plan.popular && (<div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">MOST POPULAR</div>)}
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{plan.name}</h3>
              <div className="mb-6 flex items-baseline justify-center"><span className="text-4xl font-black text-slate-900">${plan.price}</span><span className="text-slate-500 ml-2 font-medium">/month</span></div>
              <div className="text-center mb-6"><span className="text-slate-600 font-semibold">{plan.events} events/month</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feat, i) => (<li key={i} className="flex items-start text-slate-600"><Check className="w-5 h-5 text-emerald-500 mr-3 mt-0.5" />{feat}</li>))}
              </ul>
              <button onClick={() => setActiveTab('create')} className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}>{plan.price === 0 ? 'Start for Free' : `Choose ${plan.name}`}</button>
            </ScrollRevealSection>
          ))}
        </div>
      </div>
     </div>
  );
};

// --- PRIVACY POLICY ---
const PrivacyPolicy = ({ onAccept }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 w-20 h-20 rounded-2xl rotate-3 flex items-center justify-center mx-auto mb-6 shadow-lg"><ShieldCheck className="w-10 h-10 text-emerald-600 -rotate-3" /></div>
          <h2 className="text-4xl font-black text-slate-900 mb-4 bg-gradient-to-r from-slate-900 to-emerald-600 bg-clip-text text-transparent">Privacy & Compliance</h2>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20">
          <h3 className="font-bold text-2xl text-slate-900 mb-4">Data Storage & Encryption</h3>
          <p className="text-slate-600 mb-4">All data is AES-256 encrypted and stored in Frankfurt (AWS eu-central-1). PII is SHA-256 hashed.</p>
          <button onClick={onAccept} className="w-full bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-emerald-700 transition-all">I Accept Privacy Policy</button>
        </div>
      </div>
    </div>
  );
};

// --- NAVBAR ---
const Navbar = ({ activeTab, setActiveTab, privacyAccepted }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuItems = [
    { key: 'pricing', label: 'Pricing' }, { key: 'howitworks', label: 'How it works' },
    { key: 'dashboard', label: 'Dashboard' }, { key: 'create', label: 'Create' },
    { key: 'events', label: 'Events' }, { key: 'privacy', label: 'Privacy' }
  ];

  const handleTabClick = (tab) => {
    if (!privacyAccepted && tab !== 'privacy') {
      setActiveTab('privacy'); alert('Please read and accept the Privacy Policy first'); return;
    }
    setActiveTab(tab); setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white/80 backdrop-blur-xl text-slate-900 sticky top-0 z-50 shadow-sm border-b border-slate-200/50">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleTabClick('pricing')}>
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-emerald-600 bg-clip-text text-transparent">Auditor Veritas</h1>
        </div>
        <nav className="hidden lg:flex space-x-1 bg-white/50 backdrop-blur-sm rounded-2xl p-1 border border-slate-200/50">
          {menuItems.map((item) => (
            <button key={item.key} onClick={() => handleTabClick(item.key)} disabled={!privacyAccepted && item.key !== 'privacy'}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === item.key ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-900'}`}>
              {item.label}
            </button>
          ))}
        </nav>
        <button className="lg:hidden p-3" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
};

// --- MAIN APP ---
function App() {
  const [activeTab, setActiveTab] = useState('privacy');
  const [activeProduct, setActiveProduct] = useState('crypto');
  const [processor, setProcessor] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [eventData, setEventData] = useState({ event_type: '', event_data: '{}', user_identifier: '' });
  const [stats, setStats] = useState({ totalEvents: 1247, monthlyEvents: 234, eventsLimit: 50000, utilization: '25%' });
  const [isLoading, setIsLoading] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  
  const { isLocked, setIsLocked } = useInactivityTimer(300000, !!processor);
  useSecurityProtections();

  useEffect(() => {
    const savedPrivacyAccepted = localStorage.getItem('privacyAccepted');
    if (savedPrivacyAccepted === 'true') {
      setPrivacyAccepted(true); setActiveTab('pricing');
    }
  }, []);

  const handlePrivacyAccept = () => {
    localStorage.setItem('privacyAccepted', 'true');
    setPrivacyAccepted(true); setActiveTab('pricing');
  };

  if (isLocked && processor) return <LockScreen onUnlock={() => setIsLocked(false)} />;

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {processor && <SecurityWatermark identifier={processor.email || processor.companyName} />}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} privacyAccepted={privacyAccepted} />

      <main className="flex-1">
        {activeTab === 'pricing' && privacyAccepted && (
          <>
            <StripeHeroSection setActiveTab={setActiveTab} activeProduct={activeProduct} setActiveProduct={setActiveProduct} />
            <StripeFeatureGrid />
            <ModernPricingSection setActiveTab={setActiveTab} />
          </>
        )}

        {activeTab === 'dashboard' && privacyAccepted && (
          <div className="min-h-screen bg-slate-50 p-8">
            {!processor ? (
              <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl text-center">
                 <h2 className="text-2xl font-bold mb-4">Access Dashboard</h2>
                 <input type="text" placeholder="API Key" className="w-full p-3 border rounded mb-4" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                 <button onClick={() => setProcessor({companyName: 'Demo Corp', plan: 'professional'})} className="w-full bg-blue-600 text-white p-3 rounded font-bold">Enter Demo</button>
              </div>
            ) : (
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8"><h2 className="text-3xl font-bold">{processor.companyName}</h2><button onClick={() => setProcessor(null)} className="text-red-500">Sign Out</button></div>
                <StatsCards stats={stats} processor={processor} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <KeyRotation processor={processor} apiKey={apiKey} onKeyRotate={setApiKey} />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && privacyAccepted && <div className="flex justify-center p-8"><CreateProcessor /></div>}
        
        {activeTab === 'privacy' && <PrivacyPolicy onAccept={handlePrivacyAccept} />}
      </main>
    </div>
  );
}

export default App;