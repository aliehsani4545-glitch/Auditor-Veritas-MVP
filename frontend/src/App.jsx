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

// --- MERKLE TREE VISUALIZATION COMPONENT ---
const MerkleTreeDemo = () => {
  const [events, setEvents] = useState([]);
  const [merkleTree, setMerkleTree] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [proof, setProof] = useState(null);
  const [isBuilding, setIsBuilding] = useState(false);

  class DemoMerkleTree {
    constructor(leaves = []) {
      this.leaves = leaves.map(leaf => this.hash(leaf));
      this.levels = this.buildTree(this.leaves);
      this.root = this.levels.length > 0 ? this.levels[0][0] : this.hash('');
    }

    hash(data) {
      if (typeof data === 'object') {
        data = JSON.stringify(data, Object.keys(data).sort());
      }
      return CryptoJS.SHA256(data).toString().substring(0, 16);
    }

    buildTree(leaves) {
      if (leaves.length === 0) return [['']];
      
      const levels = [leaves];
      let currentLevel = leaves;

      while (currentLevel.length > 1) {
        const nextLevel = [];
        
        for (let i = 0; i < currentLevel.length; i += 2) {
          const left = currentLevel[i];
          const right = (i + 1 < currentLevel.length) ? currentLevel[i + 1] : left;
          const combined = left + right;
          nextLevel.push(this.hash(combined));
        }
        
        levels.unshift(nextLevel);
        currentLevel = nextLevel;
      }

      return levels;
    }

    getProof(leafHash) {
      let index = this.leaves.indexOf(leafHash);
      if (index === -1) return null;

      const proof = [];
      let currentIndex = index;

      for (let i = this.levels.length - 1; i > 0; i--) {
        const level = this.levels[i];
        const isRightNode = currentIndex % 2 === 0;
        const siblingIndex = isRightNode ? currentIndex + 1 : currentIndex - 1;

        if (siblingIndex < level.length) {
          proof.push({
            hash: level[siblingIndex],
            position: isRightNode ? 'right' : 'left'
          });
        }

        currentIndex = Math.floor(currentIndex / 2);
      }

      return proof;
    }

    addLeaf(leafData) {
      const leafHash = this.hash(leafData);
      this.leaves.push(leafHash);
      this.levels = this.buildTree(this.leaves);
      this.root = this.levels[0][0];
      return leafHash;
    }
  }

  const addEvent = () => {
    const newEvent = {
      id: Date.now(),
      type: ['user_login', 'file_access', 'data_export', 'permission_change'][Math.floor(Math.random() * 4)],
      user: `user_${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date().toLocaleTimeString()
    };

    setEvents(prev => {
      const newEvents = [...prev, newEvent];
      buildMerkleTree(newEvents);
      return newEvents;
    });
  };

  const buildMerkleTree = (eventList) => {
    setIsBuilding(true);
    setTimeout(() => {
      const tree = new DemoMerkleTree(eventList);
      setMerkleTree(tree);
      setIsBuilding(false);
    }, 500);
  };

  const generateProof = (event) => {
    if (!merkleTree) return;
    
    const leafData = {
      id: event.id,
      type: event.type,
      user: event.user,
      timestamp: event.timestamp
    };

    const leafHash = merkleTree.hash(leafData);
    const proof = merkleTree.getProof(leafHash);
    
    setSelectedEvent(event);
    setProof(proof);
  };

  const verifyIntegrity = () => {
    if (!merkleTree || !selectedEvent) return;
    
    // Simulate tampering
    const tamperedEvents = [...events];
    if (tamperedEvents.length > 0) {
      tamperedEvents[0].user = 'HACKED_' + tamperedEvents[0].user;
      const tamperedTree = new DemoMerkleTree(tamperedEvents);
      
      alert(`🔴 Integrity Compromised!\nOriginal Root: ${merkleTree.root}\nTampered Root: ${tamperedTree.root}`);
    }
  };

  const renderTreeLevels = () => {
    if (!merkleTree || merkleTree.levels.length === 0) return null;

    return (
      <div className="space-y-6">
        {merkleTree.levels.map((level, levelIndex) => (
          <div key={levelIndex} className="flex flex-col items-center">
            <div className="text-xs text-slate-500 mb-2">
              Level {merkleTree.levels.length - levelIndex - 1} • {level.length} node{level.length !== 1 ? 's' : ''}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {level.map((hash, hashIndex) => (
                <div
                  key={hashIndex}
                  className={`px-3 py-2 rounded-lg border-2 font-mono text-xs transition-all duration-300 ${
                    levelIndex === 0 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-lg' 
                      : 'bg-blue-50 border-blue-200 text-blue-600'
                  } ${
                    proof && proof.some(p => p.hash === hash) 
                      ? 'ring-2 ring-purple-400 scale-110' 
                      : ''
                  }`}
                >
                  {hash}
                </div>
              ))}
            </div>
            {levelIndex < merkleTree.levels.length - 1 && (
              <div className="w-0.5 h-4 bg-slate-300 mx-auto"></div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 border border-slate-700/50 shadow-2xl h-96 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10"></div>
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-white font-bold text-lg flex items-center">
              <TreePine className="w-6 h-6 mr-2 text-emerald-400" />
              Live Merkle Tree Demo
            </h3>
            <p className="text-slate-400 text-sm">Cryptographic data integrity in action</p>
          </div>
          <div className="flex items-center space-x-2 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-emerald-400 text-sm font-semibold">ACTIVE</span>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-3 gap-6">
          {/* Left: Events & Controls */}
          <div className="space-y-4">
            <div className="flex space-x-2">
              <button 
                onClick={addEvent}
                disabled={isBuilding}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-cyan-700 transition disabled:opacity-50"
              >
                + Add Event
              </button>
              <button 
                onClick={verifyIntegrity}
                disabled={!merkleTree}
                className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-amber-700 hover:to-orange-700 transition disabled:opacity-50"
              >
                Test Integrity
              </button>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700 max-h-32 overflow-y-auto">
              <div className="text-slate-400 text-xs mb-2">Events ({events.length})</div>
              {events.map((event, index) => (
                <div 
                  key={event.id}
                  onClick={() => generateProof(event)}
                  className={`p-2 rounded-lg text-xs cursor-pointer transition-all mb-1 ${
                    selectedEvent?.id === event.id 
                      ? 'bg-purple-500/20 border border-purple-500/30' 
                      : 'bg-slate-700/50 hover:bg-slate-700/70'
                  }`}
                >
                  <div className="font-medium text-white">{event.type}</div>
                  <div className="text-slate-400">{event.user}</div>
                </div>
              ))}
            </div>

            {merkleTree && (
              <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
                <div className="text-slate-400 text-xs mb-1">Merkle Root</div>
                <div className="text-emerald-400 font-mono text-sm truncate" title={merkleTree.root}>
                  {merkleTree.root}
                </div>
                <div className="text-slate-500 text-xs mt-1">
                  {merkleTree.leaves.length} leaves • {merkleTree.levels.length} levels
                </div>
              </div>
            )}
          </div>

          {/* Middle: Tree Visualization */}
          <div className="col-span-2">
            <div className="h-64 overflow-y-auto bg-slate-800/30 rounded-xl border border-slate-700/50 p-4">
              {merkleTree ? (
                renderTreeLevels()
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <TreePine className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Add events to build the Merkle Tree</p>
                  </div>
                </div>
              )}
            </div>

            {/* Proof Display */}
            {proof && selectedEvent && (
              <div className="mt-4 bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-purple-400 text-sm font-semibold">
                    Inclusion Proof for: {selectedEvent.type}
                  </div>
                  <div className="text-green-400 text-xs flex items-center">
                    <Check className="w-3 h-3 mr-1" />
                    Valid
                  </div>
                </div>
                <div className="text-xs text-slate-300">
                  {proof.length} proof step{proof.length !== 1 ? 's' : ''} • 
                  Root: {merkleTree.root.substring(0, 12)}...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

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

// --- FUTURISTIC HOW IT WORKS ---
const HowItWorks = ({ setActiveTab }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const mousePosition = useMousePosition();

  const steps = [
    {
      title: "Quantum Identity Setup",
      icon: FingerprintIcon,
      description: "Establish your organization's digital identity with HD key derivation and automated quantum-resistant key rotation.",
      details: [
        "Hierarchical Deterministic (HD) API Keys",
        "Automated 90-day key rotation",
        "Quantum-resistant cryptography",
        "Multi-factor security layers"
      ],
      visual: "identity",
      action: "create",
      actionText: "Get Started",
      gradient: "from-purple-500 to-pink-500",
      security: "HD-Wallet Security"
    },
    {
      title: "Zero-Knowledge Event Processing",
      icon: BrainCircuit,
      description: "Advanced event ingestion with real-time encryption, Merkle tree construction, and compliance validation.",
      details: [
        "Real-time SHA-256 hashing",
        "Merkle tree data integrity",
        "Automated PII detection",
        "GDPR compliance engine"
      ],
      visual: "processing",
      action: "events",
      actionText: "Try API",
      gradient: "from-blue-500 to-cyan-500",
      security: "Cryptographic Integrity"
    },
    {
      title: "Blockchain Immutable Ledger",
      icon: Bitcoin,
      description: "Every event cryptographically sealed in a Bitcoin-inspired immutable audit trail with Merkle tree verification.",
      details: [
        "Merkle tree architecture",
        "Tamper-evident design",
        "Cryptographic proofs",
        "Historical integrity verification"
      ],
      visual: "blockchain",
      action: "privacy",
      actionText: "Learn Security",
      gradient: "from-emerald-500 to-green-500",
      security: "Blockchain Integrity"
    },
    {
      title: "AI Compliance Mining",
      icon: CircuitBoard,
      description: "Real-time compliance monitoring with intelligent analytics and proactive threat detection.",
      details: [
        "Real-time GDPR monitoring",
        "Automated compliance reporting",
        "AI-powered threat detection",
        "Behavioral analytics"
      ],
      visual: "intelligence",
      action: "dashboard",
      actionText: "View Dashboard",
      gradient: "from-orange-500 to-red-500",
      security: "AI Security"
    }
  ];

  const generateApiKey = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newKey = `av_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      setApiKey(newKey);
      setIsGenerating(false);
    }, 2000);
  };

  const rotateApiKey = () => {
    setTimeout(() => {
      const newKey = `av_rotated_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      setApiKey(newKey);
      alert('🔑 API Key rotated successfully!');
    }, 1500);
  };

  const simulateApiCall = async () => {
    setIsSimulating(true);
    setTerminalOutput([]);

    const steps = [
      { text: '🔐 Encrypting payload with AES-256-GCM...', delay: 600 },
      { text: '🌳 Adding to Merkle Tree...', delay: 800 },
      { text: '⚡ Calculating cryptographic hash...', delay: 600 },
      { text: '📦 Sealing in immutable ledger...', delay: 700 }
    ];

    for (let i = 0; i < steps.length; i++) {
      setTerminalOutput(prev => [...prev, 
        { type: 'process', text: steps[i].text, timestamp: new Date() }
      ]);
      await new Promise(resolve => setTimeout(resolve, steps[i].delay));
    }

    setTerminalOutput(prev => [...prev,
      { 
        type: 'success', 
        text: '✅ Event secured with Merkle Tree integrity!',
        hash: `tx_${Math.random().toString(36).substring(2, 12)}`,
        timestamp: new Date()
      }
    ]);
    setIsSimulating(false);
  };

  const renderVisualization = () => {
    const currentStep = steps[activeStep];

    switch(currentStep.visual) {
      case 'identity':
        return (
          <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 border border-slate-700/50 shadow-2xl h-96 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10"></div>
            <div className="relative z-10 h-full flex flex-col items-center justify-center">
              {!apiKey ? (
                <div className="text-center space-y-6">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <KeyRound className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                    <h4 className="text-white font-bold text-lg mb-2">Generate HD Identity</h4>
                    <p className="text-slate-300 text-sm">Create your quantum-resistant hierarchical identity</p>
                  </div>
                  <button 
                    onClick={generateApiKey}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 flex items-center space-x-3 shadow-lg hover:shadow-purple-500/25"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Generating HD Key...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5" />
                        <span>Generate HD API Key</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-6 w-full max-w-md">
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/20">
                    <Check className="w-12 h-12 text-green-400 mx-auto mb-3" />
                    <h4 className="text-white font-bold text-lg">HD Identity Created</h4>
                    <p className="text-slate-300 text-sm">Your quantum-resistant key is ready</p>
                  </div>
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                    <code className="text-green-400 font-mono text-sm break-all">{apiKey}</code>
                  </div>
                  <button 
                    onClick={rotateApiKey}
                    className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-700 hover:to-orange-700 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span>Rotate Key</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="bg-slate-900 rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden h-96 flex flex-col">
            <div className="bg-slate-800 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-slate-300 text-sm font-mono">secure-terminal</span>
              </div>
              <div className="text-slate-400 text-xs flex items-center">
                <BrainCircuit className="w-4 h-4 mr-2" />
                Quantum Processor
              </div>
            </div>

            <div className="flex-1 p-6 bg-gradient-to-br from-slate-900 to-slate-800 overflow-y-auto">
              <div className="space-y-4">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="text-cyan-400 font-mono text-sm space-y-2">
                    <div>$ curl -X POST https://api.auditorveritas.com/v1/events \</div>
                    <div className="ml-4">-H "Authorization: Bearer {apiKey || 'your_hd_api_key'}" \</div>
                    <div className="ml-4">-H "Content-Type: application/json" \</div>
                    <div className="ml-4">-H "X-Merkle-Proof: true" \</div>
                    <div className="ml-4">-d '{`{"event_type": "user_login", "user_id": "user_123", "ip_address": "192.168.1.1"}`}'</div>
                  </div>
                </div>

                {terminalOutput.slice(-4).map((output, i) => (
                  <div key={i} className={`rounded-xl p-4 border ${
                    output.type === 'process' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-green-500/10 border-green-500/20'
                  }`}>
                    <div className="text-sm font-mono flex items-center space-x-2">
                      <span>{output.text}</span>
                    </div>
                  </div>
                ))}
              </div>

              {!isSimulating && (
                <div className="mt-6 flex space-x-4">
                  <button 
                    onClick={simulateApiCall}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-blue-500/25"
                  >
                    <Play className="w-4 h-4" />
                    <span>Execute Secure Request</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'blockchain':
        return <MerkleTreeDemo />;

      case 'intelligence':
        return (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 border border-slate-700/50 shadow-2xl h-96 overflow-hidden">
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white font-bold text-lg">AI Security Dashboard</h3>
                  <p className="text-slate-400 text-sm">Real-time monitoring & threat detection</p>
                </div>
                <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-semibold">LIVE</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
                  <div className="text-2xl font-bold text-emerald-400">24/7</div>
                  <div className="text-slate-400 text-xs">Monitoring</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
                  <div className="text-2xl font-bold text-blue-400">0</div>
                  <div className="text-slate-400 text-xs">Threats</div>
                </div>
              </div>

              <div className="flex-1 bg-slate-800/30 rounded-xl border border-slate-700/50 p-4">
                <div className="text-center text-slate-500 h-full flex items-center justify-center">
                  <div>
                    <CircuitBoard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">AI Security System Active</p>
                    <p className="text-xs text-slate-600 mt-1">Real-time compliance monitoring enabled</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20 relative overflow-hidden">
      {/* Quantum Background Effects */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          background: `
            radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.15) 0%, transparent 80%),
            radial-gradient(400px at ${mousePosition.x * 0.7}px ${mousePosition.y * 1.3}px, rgba(236, 72, 153, 0.1) 0%, transparent 60%),
            radial-gradient(300px at ${mousePosition.x * 1.2}px ${mousePosition.y * 0.8}px, rgba(16, 185, 129, 0.1) 0%, transparent 50%)
          `
        }}
      />

      {/* Binary Rain Background */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-green-400 text-xs font-mono animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          >
            {Math.random() > 0.5 ? '1' : '0'}
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto space-y-16 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center pt-16 lg:pt-24">
          <div className="inline-flex items-center bg-white/80 backdrop-blur-sm text-slate-700 px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-slate-200/50 shadow-lg">
            <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
            Quantum-Secure Audit Trail Platform • GDPR Article 32 Compliant
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 mb-6 bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            How It Works
          </h1>
          <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Experience Bitcoin-inspired security with quantum-resistant cryptography, 
            Merkle tree data integrity, and AI-powered compliance monitoring.
          </p>
        </div>

        {/* Interactive Steps */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Steps Header */}
          <div className="grid grid-cols-2 lg:grid-cols-4 bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-200/50">
            {steps.map((step, index) => (
              <button
                key={index}
                onClick={() => setActiveStep(index)}
                className={`p-6 lg:p-8 text-sm font-bold transition-all duration-500 flex flex-col items-center justify-center group relative overflow-hidden ${
                  activeStep === index 
                    ? `bg-gradient-to-r ${step.gradient} text-white shadow-inner` 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                }`}
              >
                <step.icon className={`w-6 h-6 lg:w-8 lg:h-8 mb-3 transition-transform duration-300 ${
                  activeStep === index ? 'scale-110' : 'group-hover:scale-110'
                }`} />
                <span className="text-xs lg:text-sm text-center">{step.title}</span>
                <div className="absolute top-2 right-2">
                  <ShieldCheck className="w-4 h-4 opacity-60" />
                </div>
              </button>
            ))}
          </div>

          {/* Steps Content */}
          <div className="p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Left Content */}
              <div className="space-y-8">
                <div>
                  <div className="flex items-center mb-6">
                    <div className={`p-4 rounded-2xl mr-4 bg-gradient-to-r ${steps[activeStep].gradient} shadow-lg`}>
                      {React.createElement(steps[activeStep].icon, { className: "w-8 h-8 text-white" })}
                    </div>
                    <div>
                      <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
                        {steps[activeStep].title}
                      </h2>
                      <div className="flex items-center mt-2 space-x-2">
                        <div className="bg-slate-100 px-2 py-1 rounded-lg text-xs font-semibold text-slate-700">
                          {steps[activeStep].security}
                        </div>
                        <p className="text-slate-500">
                          Step {activeStep + 1} of {steps.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-lg lg:text-xl text-slate-600 leading-relaxed mb-8">
                    {steps[activeStep].description}
                  </p>

                  <ul className="space-y-4 mb-8">
                    {steps[activeStep].details.map((detail, i) => (
                      <li key={i} className="flex items-start text-slate-600">
                        <div className="mt-1 mr-4 min-w-[24px]">
                          <Check className="w-5 h-5 text-green-500" />
                        </div>
                        <span className="text-base leading-relaxed">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex space-x-4">
                  <button 
                    onClick={() => setActiveTab(steps[activeStep].action)}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <span>{steps[activeStep].actionText}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  {activeStep > 0 && (
                    <button 
                      onClick={() => setActiveStep(activeStep - 1)}
                      className="px-6 py-4 rounded-2xl font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all duration-300 border border-slate-200"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Right Visualization */}
              <div className="relative">
                <div className="transform hover:scale-[1.02] transition-transform duration-500">
                  {renderVisualization()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Features Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {[
            { icon: Bitcoin, label: "Merkle Trees", color: "emerald", desc: "Data integrity" },
            { icon: KeyRound, label: "HD Key Rotation", color: "blue", desc: "Automated security" },
            { icon: BrainCircuit, label: "AI Monitoring", color: "purple", desc: "Threat detection" },
            { icon: FileLock2, label: "GDPR Compliant", color: "orange", desc: "Legal compliance" }
          ].map((feature, index) => (
            <div 
              key={index}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition duration-300 transform hover:scale-105 group"
            >
              <feature.icon className={`w-8 h-8 lg:w-10 lg:h-10 ${
                feature.color === 'emerald' ? 'text-emerald-600' :
                feature.color === 'blue' ? 'text-blue-600' :
                feature.color === 'purple' ? 'text-purple-600' : 'text-orange-600'
              } mx-auto mb-3 group-hover:scale-110 transition-transform`} />
              <div className="font-bold text-slate-900 text-sm lg:text-base mb-1">{feature.label}</div>
              <div className="text-xs text-slate-500">{feature.desc}</div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center py-16">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-white rounded-full blur-lg opacity-30 animate-pulse"></div>
                  <Rocket className="w-16 h-16 relative z-10" />
                </div>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                Ready for Quantum-Secure Compliance?
              </h2>
              <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                Join forward-thinking enterprises using Merkle tree security 
                with automated key rotation and AI-powered monitoring.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => setActiveTab('create')}
                  className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
                >
                  <KeyRound className="w-5 h-5" />
                  <span>Start Free Trial</span>
                </button>
                <button 
                  onClick={() => setActiveTab('pricing')}
                  className="border-2 border-white text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3"
                >
                  <Bitcoin className="w-5 h-5" />
                  <span>Enterprise Security</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Modern StatsCards ---
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

// --- MERKLE TREE DASHBOARD COMPONENT ---
const MerkleTreeDashboard = ({ processor, apiKey }) => {
  const [treeData, setTreeData] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [proof, setProof] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadMerkleTree = async () => {
    if (!apiKey) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/merkle/tree`, {
        headers: { 'x-api-key': apiKey }
      });
      const data = await response.json();
      setTreeData(data);
    } catch (error) {
      console.error('Failed to load Merkle tree:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateProof = async () => {
    if (!selectedEvent || !apiKey) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/merkle/proof/${selectedEvent}`, {
        headers: { 'x-api-key': apiKey }
      });
      const data = await response.json();
      setProof(data);
    } catch (error) {
      console.error('Failed to generate proof:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (processor) {
      loadMerkleTree();
    }
  }, [processor]);

  const renderTreeLevels = () => {
    if (!treeData?.structure?.levels) return null;

    return (
      <div className="space-y-4">
        {treeData.structure.levels.map((level, index) => (
          <div key={index} className="text-center">
            <div className="text-sm text-slate-500 mb-2">Level {treeData.structure.levels.length - index - 1}</div>
            <div className="flex flex-wrap justify-center gap-2">
              {level.hashes.map((hash, hashIndex) => (
                <div 
                  key={hashIndex}
                  className="bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 font-mono text-xs"
                >
                  {hash}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center">
          <TreePine className="w-6 h-6 mr-3 text-emerald-600" />
          Merkle Tree Integrity
        </h3>
        <button 
          onClick={loadMerkleTree}
          disabled={isLoading}
          className="flex items-center px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl hover:bg-white transition text-slate-700 font-medium disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {treeData ? (
        <div className="space-y-6">
          {/* Tree Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-slate-900">{treeData.leafCount}</div>
              <div className="text-slate-600 text-sm">Events</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-slate-900">{treeData.levels}</div>
              <div className="text-slate-600 text-sm">Levels</div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <div className="text-lg font-bold text-emerald-700 font-mono truncate" title={treeData.root}>
                {treeData.root.substring(0, 16)}...
              </div>
              <div className="text-emerald-600 text-sm">Root Hash</div>
            </div>
          </div>

          {/* Proof Generation */}
          <div className="border-t border-slate-200 pt-6">
            <h4 className="font-bold text-slate-800 mb-4">Generate Integrity Proof</h4>
            <div className="flex space-x-3">
              <input
                type="text"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                placeholder="Enter Event ID"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
              />
              <button 
                onClick={generateProof}
                disabled={!selectedEvent || isLoading}
                className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-emerald-700 hover:to-green-700 transition disabled:opacity-50"
              >
                Generate Proof
              </button>
            </div>
          </div>

          {/* Proof Result */}
          {proof && (
            <div className={`p-4 rounded-xl border ${
              proof.isValid ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {proof.isValid ? (
                    <Check className="w-5 h-5 text-emerald-600 mr-2" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                  )}
                  <span className={`font-semibold ${proof.isValid ? 'text-emerald-700' : 'text-red-700'}`}>
                    Proof {proof.isValid ? 'Valid' : 'Invalid'}
                  </span>
                </div>
                <div className="text-sm text-slate-500">
                  {proof.treeInfo.totalLeaves} leaves in tree
                </div>
              </div>
              
              {proof.proof && proof.proof.length > 0 && (
                <div className="mt-3">
                  <div className="text-sm text-slate-600 mb-2">Proof Path ({proof.proof.length} steps):</div>
                  <div className="space-y-1">
                    {proof.proof.map((step, index) => (
                      <div key={index} className="flex items-center text-xs font-mono bg-white/50 p-2 rounded border">
                        <span className="text-slate-500 mr-2">[{index + 1}]</span>
                        <span className="text-slate-700">{step.hash.substring(0, 24)}...</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          step.position === 'left' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {step.position}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tree Visualization */}
          <div className="border-t border-slate-200 pt-6">
            <h4 className="font-bold text-slate-800 mb-4">Tree Structure</h4>
            {renderTreeLevels()}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="bg-slate-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TreePine className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500">No Merkle Tree data available</p>
          <button 
            onClick={loadMerkleTree}
            className="mt-4 bg-slate-600 text-white px-4 py-2 rounded-xl hover:bg-slate-700 transition"
          >
            Initialize Tree
          </button>
        </div>
      )}
    </div>
  );
};

// --- Modern LockedFeature ---
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

// --- Modern PrivacyPolicy ---
const PrivacyPolicy = ({ setActiveTab, cookiesAccepted, setShowCookieBanner, onAccept, privacyAccepted }) => (
  <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 px-4 sm:px-0 py-12">

    {!cookiesAccepted && (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8 text-center shadow-lg">
        <div className="flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-amber-600 mr-3" />
          <h3 className="text-xl font-bold text-amber-800">Privacy Policy Limited Access</h3>
        </div>
        <p className="text-amber-700 mb-6 text-lg">Please accept cookies to view the complete Privacy Policy context.</p>
        <button 
          onClick={() => setShowCookieBanner(true)} 
          className="bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-700 transition-all duration-300 shadow-lg"
        >
          Open Cookie Settings
        </button>
      </div>
    )}

    <div className="text-center mb-12">
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

    {/* Your Rights Section */}
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20 mt-8">
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

      {/* Contact Information Section */}
      <div className="mt-12 pt-8 border-t border-slate-200">
        <h4 className="font-bold text-slate-800 mb-6 text-xl">Contact Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h5 className="font-semibold text-slate-700 mb-3 text-lg">Data Protection Officer</h5>
            <a href="mailto:hazarnodesweden@outlook.com" className="text-blue-600 hover:text-blue-700 font-medium text-lg">
              hazarnodesweden@outlook.com
            </a>
          </div>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h5 className="font-semibold text-slate-700 mb-3 text-lg">Security Team</h5>
            <a href="mailto:hazarnodesweden@outlook.com" className="text-blue-600 hover:text-blue-700 font-medium text-lg">
              hazarnodesweden@outlook.com
            </a>
          </div>
        </div>
      </div>
    </div>

    {!privacyAccepted && (
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-8 text-center shadow-lg mt-8">
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
);







// --- NY STRIPE-DESIGN KOMPONENT ---
const StripeFeatureSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  // Data som ska visas i telefonen (rensat från AI/Bitcoin)
  const auditLogs = [
    { id: "LOG-921", user: "Admin User", action: "Policy Update", status: "Verified", time: "Just now", color: "bg-emerald-100 text-emerald-700" },
    { id: "LOG-920", user: "System", action: "Key Rotation", status: "Processing", time: "2m ago", color: "bg-blue-100 text-blue-700" },
    { id: "LOG-919", user: "Sarah J.", action: "Data Export", status: "Completed", time: "15m ago", color: "bg-slate-100 text-slate-700" },
    { id: "LOG-918", user: "API Gateway", action: "Flagged IP", status: "Blocked", time: "1h ago", color: "bg-red-100 text-red-700" },
    { id: "LOG-917", user: "System", action: "Backup", status: "Verified", time: "2h ago", color: "bg-emerald-100 text-emerald-700" }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 } // Trigga när 20% av sektionen syns
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="py-24 bg-white relative overflow-hidden">
      {/* Bakgrundsdekoration (Stripe-ish) */}
      <div className="absolute top-0 right-0 w-3/4 h-full bg-slate-50 skew-x-12 transform origin-top-right z-0" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center">
        
        {/* VÄNSTER SIDA: Text */}
        <div className="lg:w-1/2 mb-16 lg:mb-0 pr-0 lg:pr-16">
          <h2 className="text-emerald-600 font-bold tracking-wide uppercase text-sm mb-4">
            Enterprise Security
          </h2>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6 leading-tight">
            Immutable Audit Trails <br/>
            <span className="text-slate-400">for Modern Compliance.</span>
          </h1>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            Experience secure logging with cryptographic integrity. 
            Everything operates seamlessly to ensure GDPR compliance and data verification 
            without compromising performance.
          </p>
          
          {/* Funktionslista (Ersätter de gamla punkterna) */}
          <div className="space-y-4 mb-8">
            {[
              "Cryptographic Hashing (SHA-256)",
              "Automated Integrity Checks",
              "GDPR Article 32 Compliant"
            ].map((item, index) => (
              <div key={index} className="flex items-center text-slate-700 font-medium">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mr-3 text-emerald-600">
                  <Check size={14} strokeWidth={3} />
                </div>
                {item}
              </div>
            ))}
          </div>

          <button className="group bg-slate-900 text-white px-8 py-4 rounded-full font-bold transition-all hover:bg-slate-800 flex items-center shadow-lg hover:shadow-xl hover:-translate-y-1">
            Start Integration
            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* HÖGER SIDA: Telefon Mockup */}
        <div className="lg:w-1/2 w-full flex justify-center phone-container">
          <div className={`phone-mockup w-[360px] rounded-[40px] border-[8px] border-slate-100 overflow-hidden relative bg-white ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}>
            
            {/* Telefon Header */}
            <div className="bg-white p-6 border-b border-slate-100 sticky top-0 z-20">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Live Audit Feed</h3>
                  <p className="text-xs text-slate-500">System Status: Active</p>
                </div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Telefon Content (Lista) */}
            <div className="p-4 bg-slate-50/50 min-h-[450px]">
              {auditLogs.map((log, index) => (
                <div 
                  key={log.id}
                  className={`stripe-card bg-white p-4 rounded-xl mb-3 shadow-sm border border-slate-100 flex items-center justify-between cursor-default hover:shadow-md transition-shadow ${isVisible ? 'visible' : ''}`}
                  style={{ transitionDelay: `${index * 150}ms` }} // Vattenfallseffekt
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${index === 0 ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                      {index === 0 ? <ShieldCheck size={18} className="text-emerald-600"/> : <FileText size={18} className="text-slate-500"/>}
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
              
              {/* Fler element för att simulera scrollbar yta */}
              <div className="h-20 flex items-center justify-center opacity-30">
                <div className="w-1 h-1 bg-slate-400 rounded-full mx-1"></div>
                <div className="w-1 h-1 bg-slate-400 rounded-full mx-1"></div>
                <div className="w-1 h-1 bg-slate-400 rounded-full mx-1"></div>
              </div>
            </div>

            {/* Telefon Footer/Nav bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-slate-100 p-4 flex justify-around items-center z-20">
               <LayoutDashboard size={20} className="text-emerald-600" />
               <Search size={20} className="text-slate-300" />
               <Settings size={20} className="text-slate-300" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('privacy');
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
      setActiveTab('pricing');
    } else {
      setActiveTab('privacy');
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



  const handleKeyRotate = (newKey) => {

    setApiKey(newKey);

    localStorage.setItem('auditorApiKey', newKey);

  };



  const apiCall = async (endpoint, options = {}) => {

    const config = {

      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, ...options.headers },

      ...options,

    };

    if (options.body) config.body = JSON.stringify(options.body);



    try {

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      if (response.status === 204) return null;

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || `HTTP error! status: ${response.status}`);

      return data;

    } catch (error) {

      console.error('API call failed:', error);

      throw error;

    }

  };



  const fetchDashboard = async () => {

    if (!apiKey) return;

    if (!privacyAccepted) {

      setActiveTab('privacy');

      return;

    }



    setIsLoading(true);

    try {

      const data = await apiCall('/api/dashboard');

      setProcessor(data.processor);

      setStats(data.stats);

      localStorage.setItem('auditorProcessor', JSON.stringify(data.processor));

      localStorage.setItem('auditorApiKey', apiKey);

    } catch (error) {

      alert('Failed to access dashboard. Check API Key.');

    } finally {

      setIsLoading(false);

    }

  };



  const logEvent = async (e) => {

    e.preventDefault();

    if (!privacyAccepted) {

      setActiveTab('privacy');

      alert('❌ Please accept the Privacy Policy first');

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

        body: { ...eventData, event_data: JSON.parse(eventData.event_data || '{}'), user_identifier: hashedId }

      });

      alert('✅ Event logged!');

      fetchDashboard();

      setEventData({ event_type: '', event_data: '{}', user_identifier: '' });

    } catch (error) {

      alert(`Error: ${error.message}`);

    } finally {

      setIsLoading(false);

    }

  };



  // --- Modern UI COMPONENTS ---



  const Navbar = ({ activeTab, setActiveTab }) => {

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const menuItems = ['Pricing', 'HowItWorks', 'Dashboard', 'Create', 'Events', 'Privacy'];



    const handleTabClick = (tab) => {

      if (!privacyAccepted && tab !== 'privacy') {

        setActiveTab('privacy');

        alert('Please read and accept the Privacy Policy first');

        return;

      }

      setActiveTab(tab);

    };



    return (

      <header className="bg-slate-900/80 backdrop-blur-xl text-white sticky top-0 z-50 shadow-2xl border-b border-slate-700/50">

        <div className="container mx-auto px-4 sm:px-6 py-4">

          <div className="flex items-center justify-between">

            <div 

              className="flex items-center space-x-3 cursor-pointer hover:opacity-90 transition group"

              onClick={() => { 

                if (!privacyAccepted) {

                  setActiveTab('privacy');

                  alert('Please read and accept the Privacy Policy first');

                  return;

                }

                setActiveTab('pricing'); 

                setMobileMenuOpen(false); 

              }}

            >

              <div className="relative">

                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>

                <div className="relative bg-slate-800 p-2 rounded-xl">

                  <ShieldCheck className="w-6 h-6 text-emerald-400" />

                </div>

              </div>

              <div>

                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">

                  Auditor Veritas

                </h1>

                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold hidden sm:block">

                  Enterprise Audit Trail

                </p>

              </div>

            </div>



            <nav className="hidden lg:flex space-x-1 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-1 border border-slate-700/50">

              {menuItems.map((item) => {

                const tab = item.toLowerCase();

                const isDisabled = !privacyAccepted && tab !== 'privacy';



                return (

                  <button

                    key={item}

                    onClick={() => handleTabClick(tab)}

                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${

                      activeTab === tab 

                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg' 

                        : isDisabled

                        ? 'text-slate-500 cursor-not-allowed opacity-50'

                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'

                    }`}

                    disabled={isDisabled}

                  >

                    {item === 'HowItWorks' ? 'How It Works' : item}

                  </button>

                );

              })}

            </nav>



            <button 

              className="lg:hidden p-3 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-700/50 transition"

              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}

            >

              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}

            </button>

          </div>



          {mobileMenuOpen && (

            <div className="lg:hidden mt-4 pb-4 border-t border-slate-700/50 pt-4 animate-in fade-in slide-in-from-top-2">

              <nav className="flex flex-col space-y-2 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-2 border border-slate-700/50">

                {menuItems.map((item) => {

                  const tab = item.toLowerCase();

                  const isDisabled = !privacyAccepted && tab !== 'privacy';



                  return (

                    <button

                      key={item}

                      onClick={() => { 

                        handleTabClick(tab); 

                        setMobileMenuOpen(false); 

                      }}

                      className={`px-4 py-3 rounded-xl text-left font-medium transition-all duration-200 ${

                        activeTab === tab 

                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' 

                          : isDisabled

                          ? 'text-slate-500 cursor-not-allowed opacity-50'

                          : 'text-slate-300 hover:text-white hover:bg-slate-700/50'

                      }`}

                      disabled={isDisabled}

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



  if (isLocked && processor) {

    return <LockScreen onUnlock={() => setIsLocked(false)} />;

  }



  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20 font-sans flex flex-col">

      {processor && <SecurityWatermark identifier={processor.email || processor.companyName} />}

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />



      <main className="flex-1">

        {activeTab === 'pricing' && (

          <div className="space-y-16 py-12">

            <div className="text-center max-w-4xl mx-auto px-4">

              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6 bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">

                Transparent Pricing

              </h2>

              <p className="text-xl text-slate-600 max-w-2xl mx-auto">

                Start small, scale securely. All plans include enterprise-grade security from day one.

              </p>

            </div>



            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">

              {Object.entries(pricingPlans).map(([key, plan]) => (

                <div 

                  key={key}

                  className={`relative rounded-3xl p-8 transition-all duration-500 hover:scale-105 flex flex-col ${

                    plan.featured 

                      ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-2xl scale-105' 

                      : 'bg-white border border-slate-200 shadow-xl'

                  }`}

                >

                  {plan.featured && (

                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">

                      MOST POPULAR

                    </div>

                  )}

                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{plan.name}</h3>

                  <div className="mb-6 flex items-baseline justify-center">

                    <span className="text-4xl font-black text-slate-900">${plan.price}</span>

                    <span className="text-slate-500 ml-2 font-medium">/month</span>

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

                      plan.featured 

                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700' 

                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200'

                    }`}

                  >

                    {key === 'starter' ? 'Start for Free' : `Choose ${plan.name}`}

                  </button>

                </div>

              ))}

            </div>

          </div>

        )}



       
{/* Byt ut den gamla HowItWorks mot den nya */}
{activeTab === 'howitworks' && (
  // Vi kör inte gamla HowItWorks, utan den nya Stripe-designen
  <StripeFeatureSection />
)}


        {activeTab === 'dashboard' && (

          <div className="animate-in px-4 sm:px-0 py-8">

            {!processor ? (

              <div className="max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20 mt-8">

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

        )}



        {activeTab === 'create' && (

          <div className="max-w-2xl mx-auto py-8 animate-in px-4">

            <CreateProcessor />

          </div>

        )}



        {activeTab === 'events' && (

          <div className="max-w-4xl mx-auto py-8 animate-in px-4">

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

        )}



        {activeTab === 'privacy' && (

          <PrivacyPolicy 

            setActiveTab={setActiveTab} 

            cookiesAccepted={cookiesAccepted} 

            setShowCookieBanner={setShowCookieBanner}

            onAccept={handlePrivacyAccept}

            privacyAccepted={privacyAccepted}

          />

        )}

      </main>

    </div>

  );

}



export default App;