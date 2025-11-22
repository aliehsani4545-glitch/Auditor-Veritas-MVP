import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import CryptoJS from 'crypto-js';
import CreateProcessor from './components/CreateProcessor';
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
gsap.registerPlugin(ScrollTrigger);

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
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            }`}
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

        {/* Contextual Content */}
        <div className="content-section max-w-6xl mx-auto mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
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
            <StripeHeroSection 
              setActiveTab={setActiveTab} 
              activeProduct={activeProduct}
              setActiveProduct={setActiveProduct}
            />
            <StripeFeatureGrid />
            <ModernPricingSection setActiveTab={setActiveTab} />
          </>
        )}

        {activeTab === 'howitworks' && privacyAccepted && (
          <StripeHeroSection 
            setActiveTab={setActiveTab} 
            activeProduct={activeProduct}
            setActiveProduct={setActiveProduct}
          />
        )}

        {/* Other tabs remain the same */}
        {activeTab === 'dashboard' && privacyAccepted && (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 px-4 py-8">
            {/* Dashboard content */}
          </div>
        )}

        {activeTab === 'create' && privacyAccepted && (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center px-4 py-8">
            <CreateProcessor />
          </div>
        )}

        {activeTab === 'events' && privacyAccepted && (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 px-4 py-8">
            {/* Events content */}
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 px-4 py-8">
            {/* Privacy content */}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;