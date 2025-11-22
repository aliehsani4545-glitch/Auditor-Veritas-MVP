import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import CryptoJS from 'crypto-js';
import CreateProcessor from './components/CreateProcessor';
import MobilePaymentIllustration from './components/MobilePaymentIllustration';
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
  Sparkles, Rocket, Fingerprint as FingerprintIcon,
  Network, GitBranch, Clock, Hash, Link2,
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

// --- KEY ROTATION COMPONENT ---
const KeyRotation = ({ processor, apiKey, onKeyRotate }) => {
  const [isRotating, setIsRotating] = useState(false);
  const [lastRotation, setLastRotation] = useState(null);

  const handleKeyRotation = async () => {
    if (!processor || !apiKey) return;
    
    setIsRotating(true);
    try {
      // Simulate API call for key rotation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would call your backend
      const newKey = `av_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      setLastRotation(new Date().toISOString());
      onKeyRotate(newKey);
      
      alert('🔑 API Key rotated successfully! Update your integrations with the new key.');
    } catch (error) {
      alert('❌ Key rotation failed. Please try again.');
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

        {lastRotation && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">Last Rotation:</span>
            <span className="text-slate-800 font-medium">
              {new Date(lastRotation).toLocaleDateString()}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600">Rotation Policy:</span>
          <span className="text-slate-800 font-medium">Every 90 days</span>
        </div>

        <button 
          onClick={handleKeyRotation}
          disabled={isRotating || !processor}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isRotating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RotateCw className="w-4 h-4" />
          )}
          <span>{isRotating ? 'Rotating Keys...' : 'Rotate API Key Now'}</span>
        </button>

        <p className="text-xs text-slate-500 text-center">
          Recommended to rotate keys every 90 days for maximum security
        </p>
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

// --- STRIPE-INSPIRERAD PRODUCT NETWORK MED SCROLL-DRIVEN ACTIVE PRODUCT ---
const ProductNetwork = ({ activeProduct, setActiveProduct }) => {
  const networkRef = useRef(null);
  const nodesRef = useRef([]);
  const pathsRef = useRef([]);
  const [isVisible, setIsVisible] = useState(false);

  const products = [
    {
      id: 'crypto',
      name: 'Cryptographic Hashing',
      icon: ShieldCheck,
      position: { x: 20, y: 30 },
      connections: ['merkle', 'keys'],
      color: '#10b981',
      scrollTrigger: {
        start: "top 70%",
        end: "top 40%"
      }
    },
    {
      id: 'merkle',
      name: 'Merkle Tree Integrity',
      icon: TreePine,
      position: { x: 70, y: 15 },
      connections: ['crypto', 'compliance'],
      color: '#3b82f6',
      scrollTrigger: {
        start: "top 60%", 
        end: "top 30%"
      }
    },
    {
      id: 'keys',
      name: 'Key Rotation',
      icon: KeyRound,
      position: { x: 10, y: 70 },
      connections: ['crypto', 'compliance'],
      color: '#8b5cf6',
      scrollTrigger: {
        start: "top 50%",
        end: "top 20%"
      }
    },
    {
      id: 'compliance',
      name: 'GDPR Compliance',
      icon: FileLock2,
      position: { x: 65, y: 75 },
      connections: ['merkle', 'keys'],
      color: '#f59e0b',
      scrollTrigger: {
        start: "top 40%",
        end: "top 10%"
      }
    }
  ];

  // SVG paths for connections
  const getConnectionPath = (start, end) => {
    const startX = start.x;
    const startY = start.y;
    const endX = end.x;
    const endY = end.y;
    
    // Create curved paths
    const midX = (startX + endX) / 2;
    return `M ${startX} ${startY} C ${midX} ${startY} ${midX} ${endY} ${endX} ${endY}`;
  };

  const allConnections = new Set();
  products.forEach(product => {
    product.connections.forEach(connection => {
      const sortedIds = [product.id, connection].sort();
      allConnections.add(`${sortedIds[0]}-${sortedIds[1]}`);
    });
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (networkRef.current) {
      observer.observe(networkRef.current);
    }

    return () => {
      if (networkRef.current) observer.unobserve(networkRef.current);
    };
  }, []);

  // GSAP ScrollTrigger Animation with Active Product Updates
  useEffect(() => {
    if (!networkRef.current) return;

    // Reset initial states
    gsap.set(nodesRef.current, {
      opacity: 0,
      scale: 0.8,
      y: 20
    });

    gsap.set(pathsRef.current, {
      strokeDasharray: "8 4",
      strokeDashoffset: 100,
      opacity: 0
    });

    // Create individual ScrollTriggers for each product
    const productTriggers = products.map((product, index) => {
      return ScrollTrigger.create({
        trigger: networkRef.current,
        start: product.scrollTrigger.start,
        end: product.scrollTrigger.end,
        onEnter: () => setActiveProduct(product.id),
        onEnterBack: () => setActiveProduct(product.id),
        onLeave: () => {
          // Only update if we're moving to the next product
          if (index < products.length - 1) {
            setActiveProduct(products[index + 1].id);
          }
        },
        onLeaveBack: () => {
          // Only update if we're moving to the previous product
          if (index > 0) {
            setActiveProduct(products[index - 1].id);
          }
        }
      });
    });

    // Create the main animation timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: networkRef.current,
        start: "top 70%",
        end: "bottom 30%",
        scrub: 1,
        markers: false,
      }
    });

    // Animate nodes in sequence
    nodesRef.current.forEach((node, index) => {
      tl.to(node, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.8,
        ease: "back.out(1.7)"
      }, `node-${index * 0.3}`);
    });

    // Animate paths in sequence after nodes
    pathsRef.current.forEach((path, index) => {
      tl.to(path, {
        strokeDashoffset: 0,
        opacity: 1,
        duration: 1.5,
        ease: "power2.inOut"
      }, `path-${1 + index * 0.4}`);
    });

    // Add continuous flow animation to active paths
    tl.to(pathsRef.current, {
      strokeDashoffset: -16,
      duration: 2,
      ease: "none",
      repeat: -1
    }, "path-flow");

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      productTriggers.forEach(trigger => trigger.kill());
    };
  }, [setActiveProduct]);

  return (
    <div ref={networkRef} className="relative h-[600px] w-full bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
      </div>

      {/* SVG Connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {Array.from(allConnections).map((connection, index) => {
          const [id1, id2] = connection.split('-');
          const product1 = products.find(p => p.id === id1);
          const product2 = products.find(p => p.id === id2);
          
          if (!product1 || !product2) return null;

          const path = getConnectionPath(product1.position, product2.position);
          const isActive = activeProduct === product1.id || activeProduct === product2.id;

          return (
            <path
              key={connection}
              ref={el => pathsRef.current[index] = el}
              d={path}
              stroke={isActive ? product1.color : '#cbd5e1'}
              strokeWidth={isActive ? 3 : 2}
              fill="none"
              className={`transition-all duration-1000 ${
                isActive ? 'opacity-100' : 'opacity-40'
              }`}
            />
          );
        })}
      </svg>

      {/* Product Nodes - REMOVED onClick and onMouseEnter */}
      {products.map((product, index) => {
        const ProductIcon = product.icon;
        const isActive = activeProduct === product.id;
        
        return (
          <div
            key={product.id}
            ref={el => nodesRef.current[index] = el}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2`}
            style={{
              left: `${product.position.x}%`,
              top: `${product.position.y}%`,
            }}
          >
            <div
              className={`group relative p-6 rounded-2xl backdrop-blur-sm border-2 transition-all duration-300 ${
                isActive
                  ? 'bg-white shadow-2xl scale-110 border-slate-200'
                  : 'bg-white/80 shadow-lg border-slate-100'
              }`}
            >
              {/* Active glow effect */}
              {isActive && (
                <div 
                  className="absolute inset-0 rounded-2xl blur-xl opacity-50 transition-opacity duration-300"
                  style={{ backgroundColor: product.color }}
                />
              )}
              
              <div className="relative z-10 text-center">
                <div 
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors duration-300 ${
                    isActive ? 'bg-white' : 'bg-slate-50'
                  }`}
                >
                  <ProductIcon 
                    className={`w-8 h-8 transition-colors duration-300 ${
                      isActive ? 'text-slate-900' : 'text-slate-600'
                    }`}
                  />
                </div>
                <h3 className={`font-semibold transition-colors duration-300 ${
                  isActive ? 'text-slate-900' : 'text-slate-700'
                }`}>
                  {product.name}
                </h3>
              </div>

              {/* Connection points */}
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-white rounded-full border-2 border-slate-300" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full border-2 border-slate-300" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white rounded-full border-2 border-slate-300" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white rounded-full border-2 border-slate-300" />
            </div>
          </div>
        );
      })}

      {/* Floating elements */}
      <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-400 rounded-full opacity-20 animate-float" />
      <div className="absolute top-1/3 right-1/3 w-6 h-6 bg-emerald-400 rounded-full opacity-20 animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-purple-400 rounded-full opacity-20 animate-float" style={{ animationDelay: '2s' }} />
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
      code: `// Secure event hashing
const eventHash = CryptoJS.SHA256(
  JSON.stringify(eventData)
).toString();`
    },
    merkle: {
      title: "Merkle Tree Integrity", 
      description: "Blockchain-inspired verification with Merkle trees. Cryptographically prove data hasn't been altered.",
      features: ["Merkle tree construction", "Cryptographic proofs", "Tamper-evident design"],
      code: `// Merkle tree verification
const proof = merkleTree.getProof(eventHash);
const isValid = tree.verifyProof(proof);`
    },
    keys: {
      title: "Automated Key Rotation",
      description: "HD key management with automated 90-day rotation. Never worry about compromised credentials again.",
      features: ["90-day key rotation", "HD key derivation", "Zero-downtime updates"],
      code: `// Automated key rotation
const newKey = generateHDKey();
await rotateAPIKey(previousKey, newKey);`
    },
    compliance: {
      title: "GDPR Compliance",
      description: "Full compliance with GDPR Article 32 requirements. Built-in data protection by design and by default.",
      features: ["GDPR Article 32 compliant", "Right to erasure", "Data portability"],
      code: `// GDPR data export
const userData = await exportUserData(userId);
await fulfillGDPRRequest(userData);`
    }
  };

  const activeProductData = products[activeProduct] || products.crypto;

  // GSAP ScrollTrigger for content animation
  useEffect(() => {
    if (!contentRef.current) return;

    const sections = gsap.utils.toArray('.content-section');
    
    sections.forEach((section, index) => {
      gsap.fromTo(section, {
        opacity: 0,
        y: 50
      }, {
        opacity: 1,
        y: 0,
        duration: 1,
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

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
    <div ref={containerRef} className="relative bg-white overflow-hidden">
      {/* Header Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div ref={contentRef} className={`content-section text-center mb-16 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold border border-blue-200 mb-8">
            <Sparkles className="w-4 h-4 mr-2" />
            Enterprise Cryptographic Security
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 mb-6 leading-tight">
            Immutable audit trails
            <span className="block text-slate-400">for modern compliance</span>
          </h1>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Cryptographic data integrity meets enterprise compliance. 
            Everything operates seamlessly to ensure GDPR compliance 
            without compromising performance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button 
              onClick={() => setActiveTab('create')}
              className="group bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold transition-all hover:bg-slate-800 flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Start integration
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button 
              onClick={() => setActiveTab('pricing')}
              className="border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-2xl font-bold transition-all hover:border-slate-400 hover:bg-slate-50 flex items-center justify-center"
            >
              View pricing
            </button>
          </div>
        </div>

        {/* Product Network */}
        <div className="content-section relative">
          <ProductNetwork activeProduct={activeProduct} setActiveProduct={setActiveProduct} />
        </div>

        {/* Kontextuellt Innehåll (Mobile Illu + Text + Kod) */}
        <div className="content-section max-w-6xl mx-auto mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* VÄNSTER: Mobile Payment Illustration (STICKY) */}
              {/* Håller sig synlig medan användaren skrollar igenom produkterna */}
              <div className="order-1 lg:order-1 flex justify-center h-[550px] sticky top-20">
                  <MobilePaymentIllustration activeProduct={activeProduct} />
              </div>

              {/* HÖGER: Text Content + Code Example Wrapper */}
              <div className="order-2 lg:order-2 space-y-6">
                  
                  {/* Text Content */}
                  <div className="space-y-6">
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

                    <button 
                      onClick={() => setActiveTab('create')}
                      className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
                    >
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

    gsap.fromTo(sectionRef.current, {
      opacity: 0,
      y: 60
    }, {
      opacity: 1,
      y: 0,
      duration: 1,
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div ref={sectionRef} className={className}>
      {children}
    </div>
  );
};

// --- STRIPE FEATURE GRID MED SCROLL ANIMATION ---
const StripeFeatureGrid = () => {
  const features = [
    {
      icon: ShieldCheck,
      title: "Cryptographic Integrity",
      description: "Every event secured with SHA-256 hashing and Merkle tree verification.",
      color: "emerald"
    },
    {
      icon: KeyRound,
      title: "Automated Key Rotation",
      description: "HD key management with automated 90-day rotation for maximum security.",
      color: "blue"
    },
    {
      icon: FileLock2,
      title: "GDPR Certified",
      description: "Full compliance with GDPR Article 32 requirements for data protection.",
      color: "orange"
    },
    {
      icon: Database,
      title: "EU Data Centers",
      description: "All data resides in Frankfurt AWS eu-central-1 for GDPR compliance.",
      color: "purple"
    }
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
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">
            Built for security teams
            <span className="block text-slate-400">Trusted by compliance officers</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Advanced cryptographic security meets enterprise compliance requirements 
            in one seamless platform.
          </p>
        </ScrollRevealSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const FeatureIcon = feature.icon;
            const featureColorClass = colorClasses[feature.color];
            
            return (
              <ScrollRevealSection
                key={index}
                className="group relative bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-500"
                style={{ transitionDelay: `${index * 150}ms` }}
              >
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
              </ScrollRevealSection>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- MODERN PRICING SECTION MED SCROLL ANIMATION ---
const ModernPricingSection = ({ setActiveTab }) => {
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
      features: ['Everything in Pro', 'Dedicated Support', 'SLA Guarantee', 'Custom Integrations'],
      popular: false
    }
  ];

  return (
    <div className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollRevealSection className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">
            Simple, transparent pricing
            <span className="block text-slate-400">No hidden fees</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Start small, scale securely. All plans include enterprise-grade security from day one.
          </p>
        </ScrollRevealSection>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <ScrollRevealSection
              key={index}
              className={`relative rounded-3xl p-8 transition-all duration-500 hover:scale-105 flex flex-col ${
                plan.popular 
                  ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-2xl scale-105' 
                  : 'bg-white border border-slate-200 shadow-xl'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
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
            </ScrollRevealSection>
          ))}
        </div>
      </div>
     </div>
  );
};

// --- MODERN PRIVACY POLICY ---
const PrivacyPolicy = ({ onAccept }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20">
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
                  <strong className="block text-slate-900 text-base">👤 PII Hashing</strong>
                  <span className="text-slate-600">User identifiers are SHA-256 hashed before storage.</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20">
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

        {/* Acceptance Section */}
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-8 text-center shadow-lg">
          <div className="flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mr-3" />
            <h3 className="text-xl font-bold text-emerald-800">Privacy Policy Acceptance Required</h3>
          </div>
          <p className="text-emerald-700 mb-6 text-lg">
            To continue using Auditor Veritas, please read and accept our Privacy Policy.
          </p>
          <button 
            onClick={onAccept}
            className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-emerald-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 mx-auto"
          >
            <Check className="w-5 h-5" />
            <span>I Accept Privacy Policy</span>
          </button>
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
    { key: 'howitworks', label: 'How it works' },
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
    <header className="bg-white/80 backdrop-blur-xl text-slate-900 sticky top-0 z-50 shadow-sm border-b border-slate-200/50">
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
  const [activeProduct, setActiveProduct] = useState('crypto');
  const [processor, setProcessor] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [eventData, setEventData] = useState({ 
    event_type: '', 
    event_data: '{}', 
    user_identifier: '' 
  });
  const [stats, setStats] = useState({ 
    totalEvents: 1247, 
    monthlyEvents: 234, 
    eventsLimit: 50000, 
    utilization: '25%' 
  });
  const [isLoading, setIsLoading] = useState(false);
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

  const handleKeyRotate = (newKey) => {
    setApiKey(newKey);
    localStorage.setItem('auditorApiKey', newKey);
  };

  const apiCall = async (endpoint, options = {}) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboard = async () => {
    if (!apiKey) {
      alert('Please enter an API key first');
      return;
    }
    
    try {
      await apiCall('/api/dashboard');
      // Simulate processor data
      setProcessor({
        companyName: 'Demo Company',
        email: 'demo@company.com',
        plan: 'professional'
      });
    } catch (error) {
      alert('Failed to access dashboard. Check API Key.');
    }
  };

  const logEvent = async (e) => {
    e.preventDefault();
    if (!privacyAccepted) {
      setActiveTab('privacy');
      alert('❌ Please accept the Privacy Policy first');
      return;
    }

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
      setEventData({ event_type: '', event_data: '{}', user_identifier: '' });
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLocked && processor) {
    return <LockScreen onUnlock={() => setIsLocked(false)} />;
  }

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {processor && <SecurityWatermark identifier={processor.email || processor.companyName} />}
      
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} privacyAccepted={privacyAccepted} />

      <main className="flex-1">
        {/* Pricing/Home Tab - Stripe Design */}
        {activeTab === 'pricing' && privacyAccepted && (
          <>
            <StripeHeroSection 
              setActiveTab={setActiveTab} 
              activeProduct={activeProduct}
              setActiveProduct={setActiveProduct}
            />
            <StripeFeatureGrid />
            <ModernPricingSection setActiveTab={setActiveTab} />
          </>
        )}

        {activeTab === 'pricing' && !privacyAccepted && (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Please accept our Privacy Policy first
              </h2>
              <button 
                onClick={() => setActiveTab('privacy')}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold"
              >
                Go to Privacy Policy
              </button>
            </div>
          </div>
        )}

        {/* How It Works Tab */}
        {activeTab === 'howitworks' && privacyAccepted && (
          <StripeHeroSection 
            setActiveTab={setActiveTab} 
            activeProduct={activeProduct}
            setActiveProduct={setActiveProduct}
          />
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && privacyAccepted && (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 px-4 py-8">
            <div className="max-w-7xl mx-auto">
              {!processor ? (
                <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl p-8 border border-white/20 mt-8">
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
                    onClick={fetchDashboard} 
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
              ) : (
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

                  <StatsCards stats={stats} processor={processor} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg ${processor.plan === 'starter' ? 'opacity-90' : ''}`}>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center">
                          <BarChart3 className="w-6 h-6 mr-3 text-blue-600"/> 
                          Advanced Analytics
                        </h3>
                        {processor.plan !== 'starter' && (
                          <span className="bg-emerald-100 text-emerald-700 text-xs uppercase font-bold px-3 py-1 rounded-lg tracking-wide">
                            Active
                          </span>
                        )}
                      </div>
                      {processor.plan === 'starter' ? (
                        <LockedFeature 
                          title="Analytics Locked" 
                          desc="Upgrade to Professional to see detailed usage trends, geo-maps and interaction insights." 
                          setActiveTab={setActiveTab} 
                        />
                      ) : (
                        <div className="h-64 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl flex flex-col items-center justify-center text-blue-400 border border-blue-200">
                          <BarChart3 className="w-16 h-16 opacity-30 mb-4" />
                          <span className="font-medium text-blue-500">Interactive Charts Active</span>
                        </div>
                      )}
                    </div>

                    <KeyRotation 
                      processor={processor} 
                      apiKey={apiKey} 
                      onKeyRotate={handleKeyRotate}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg ${processor.plan === 'starter' ? 'opacity-90' : ''}`}>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center">
                          <PlusCircle className="w-6 h-6 mr-3 text-indigo-600"/> 
                          Bulk Operations
                        </h3>
                        {processor.plan !== 'starter' && (
                          <span className="bg-emerald-100 text-emerald-700 text-xs uppercase font-bold px-3 py-1 rounded-lg tracking-wide">
                            Active
                          </span>
                        )}
                      </div>
                      {processor.plan === 'starter' ? (
                        <LockedFeature 
                          title="Bulk Import Locked" 
                          desc="Process large historical datasets by uploading CSV or JSON files directly." 
                          setActiveTab={setActiveTab} 
                        />
                      ) : (
                        <div className="h-64 border-2 border-dashed border-indigo-300 rounded-xl flex flex-col items-center justify-center text-indigo-400 hover:bg-indigo-50 hover:border-indigo-400 cursor-pointer transition bg-indigo-50/50">
                          <div className="bg-white p-3 rounded-full shadow-sm mb-4">
                            <PlusCircle className="w-8 h-8 text-indigo-500" />
                          </div>
                          <span className="font-medium text-indigo-600">Drop CSV file here</span>
                          <span className="text-sm mt-2 opacity-70">or click to browse</span>
                        </div>
                      )}
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center">
                          <ShieldCheck className="w-6 h-6 mr-3 text-emerald-600"/> 
                          Security Status
                        </h3>
                        <span className="bg-emerald-100 text-emerald-700 text-xs uppercase font-bold px-3 py-1 rounded-lg tracking-wide">
                          Secure
                        </span>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Encryption</span>
                          <span className="text-emerald-600 font-semibold flex items-center">
                            <Check className="w-4 h-4 mr-1" /> Active
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Key Rotation</span>
                          <span className="text-emerald-600 font-semibold flex items-center">
                            <Check className="w-4 h-4 mr-1" /> Enabled
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">GDPR Compliance</span>
                          <span className="text-emerald-600 font-semibold flex items-center">
                            <Check className="w-4 h-4 mr-1" /> Certified
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Processor Tab */}
        {activeTab === 'create' && privacyAccepted && (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center px-4 py-8">
            <CreateProcessor />
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && privacyAccepted && (
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
                      placeholder="e.g., user_login, data_access"
                      className="w-full p-4 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white shadow-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Event Data (JSON)</label>
                    <textarea
                      value={eventData.event_data}
                      onChange={(e) => setEventData({...eventData, event_data: e.target.value})}
                      placeholder='{"key": "value"}'
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
              </div>
            </div>
          </div>
        )}

        {/* Privacy Policy Tab */}
        {activeTab === 'privacy' && (
          <PrivacyPolicy onAccept={handlePrivacyAccept} />
        )}
      </main>
    </div>
  );
}

export default App;