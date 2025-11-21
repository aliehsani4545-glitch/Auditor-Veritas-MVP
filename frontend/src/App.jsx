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
  RotateCw 
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
      if (e.key === 'PrintScreen' || e.keyCode === 44) return false;
    };
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
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
    const events = ['mousemove', 'keydown', 'click'];
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

const LockScreen = ({ onUnlock }) => (
  <div className="fixed inset-0 z-[10000] bg-slate-900 flex flex-col items-center justify-center text-white">
    <Lock className="w-20 h-20 text-emerald-400 mb-4" />
    <h2 className="text-3xl font-bold mb-4">Dashboard Locked</h2>
    <button onClick={onUnlock} className="bg-emerald-500 px-8 py-3 rounded-xl font-bold">Unlock</button>
  </div>
);

// --- KEY ROTATION COMPONENT ---
const KeyRotation = ({ processor, apiKey, onKeyRotate, apiCall, fetchDashboard }) => {
  const [isRotating, setIsRotating] = useState(false);
  const [lastRotation, setLastRotation] = useState(processor?.last_key_rotation);

  const handleKeyRotation = async () => {
    if (!processor || !apiKey) return;
    
    setIsRotating(true);
    try {
      // ANROPAR VERKLIG BACKEND-ENDPOINT
      const data = await apiCall('/api/keys/rotate', {
        method: 'POST',
        headers: { 'x-api-key': apiKey }
      });
      
      const newKey = data.newApiKey;
      
      setLastRotation(data.rotationTimestamp);
      onKeyRotate(newKey); // Uppdatera lokalt tillstånd och localStorage
      fetchDashboard(); // Hämta dashboard data igen
      
      alert('🔑 API Key rotated successfully! Update your integrations with the new key.');
    } catch (error) {
      alert(`❌ Key rotation failed: ${error.message}`);
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
            <p className="text-slate-600 text-sm">On-demand API key management</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-100 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-emerald-700 text-xs font-semibold">ENABLED</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600">Current Key:</span>
          <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono text-slate-800">
            {apiKey ? `${apiKey.substring(0, 8)}...` : 'Not available'}
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
          Key rotation protects against data breaches from stolen keys.
        </p>
      </div>
    </div>
  );
};


// --- AVANCERAD HowItWorks MED INTERAKTIVA DEMOS ---
const HowItWorks = ({ setActiveTab }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [terminalOutput, setTerminalOutput] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [securityScore, setSecurityScore] = useState(100);
  const [liveEvents, setLiveEvents] = useState([]);
  const [hashInput, setHashInput] = useState('');
  const [hashOutput, setHashOutput] = useState('');
  const [isHashing, setIsHashing] = useState(false);
  const [isRotatingKey, setIsRotatingKey] = useState(false);
  const mousePosition = useMousePosition();

  // FIX: ÄRLIGA PÅSTÅENDEN
  const steps = [
    {
      title: "Secure Identity Setup",
      icon: FingerprintIcon,
      description: "Establish your organization's digital identity with secure cryptographic keys and on-demand rotation capability.",
      details: [
        "256-bit API key generation",
        "Secure Hashed Authentication", // FIX: Inte ZK
        "On-demand Key Rotation",       // FIX: Inte Automated
        "Multi-factor readiness"
      ],
      visual: "identity",
      action: "create",
      actionText: "Get Started",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Smart Event Processing",
      icon: Workflow,
      description: "Intelligent event ingestion with real-time validation and cryptographic linking.",
      details: [
        "Schema Validation & Filtering", // FIX: Inte AI
        "Real-time SHA-256 hashing",
        "Automatic PII detection",
        "Compliance Rule Enforcement"
      ],
      visual: "processing",
      action: "events",
      actionText: "Try API",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Cryptographically Linked Ledger",
      icon: GitBranch,
      description: "Every event is cryptographically sealed using Merkle-chain principles for tamper-evident auditing.",
      details: [
        "Merkle Tree Architecture",       // FIX: Sannat av kod
        "Tamper-evident Hashing",
        "Chain Integrity Verification",
        "Historical integrity proofs"
      ],
      visual: "blockchain",
      action: "privacy",
      actionText: "Learn Security",
      gradient: "from-emerald-500 to-green-500"
    },
    {
      title: "Real-time Intelligence Dashboard",
      icon: BarChart3,
      description: "Comprehensive monitoring with advanced insights and proactive analytics.",
      details: [
        "Advanced threat detection",
        "Behavioral analytics",
        "Proactive compliance",
        "Automated reporting"
      ],
      visual: "intelligence",
      action: "dashboard",
      actionText: "View Demo",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const [blockchain, setBlockchain] = useState([
    { 
      id: 1, 
      hash: '0000a1b2c3d4', 
      prevHash: '000000000000', 
      status: 'valid', 
      timestamp: Date.now() - 3000,
      data: 'Genesis Block'
    },
    { 
      id: 2, 
      hash: 'e5f6g7h8i9j0', 
      prevHash: '0000a1b2c3d4', 
      status: 'valid', 
      timestamp: Date.now() - 2000,
      data: 'User Login Event'
    },
    { 
      id: 3, 
      hash: 'k1l2m3n4o5p6', 
      prevHash: 'e5f6g7h8i9j0', 
      status: 'valid', 
      timestamp: Date.now() - 1000,
      data: 'Data Access Event'
    }
  ]);

  const [isTampering, setIsTampering] = useState(false);

  // Live events simulation
  useEffect(() => {
    if (activeStep === 3) {
      const interval = setInterval(() => {
        const events = [
          { type: 'user_login', user: 'admin@company.com', ip: '192.168.1.100', status: 'success' },
          { type: 'file_access', user: 'user123', file: 'document.pdf', status: 'success' },
          { type: 'permission_change', user: 'admin@company.com', action: 'grant', status: 'success' },
          { type: 'data_export', user: 'analyst@company.com', records: 1500, status: 'success' }
        ];
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        setLiveEvents(prev => [
          {
            id: Date.now(),
            ...randomEvent,
            timestamp: new Date().toLocaleTimeString()
          },
          ...prev.slice(0, 4)
        ]);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [activeStep]);

  const generateApiKey = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newKey = `av_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      setApiKey(newKey);
      setIsGenerating(false);
    }, 2000);
  };

  const rotateApiKey = () => {
    setIsRotatingKey(true);
    setTimeout(() => {
      const newKey = `av_rotated_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      setApiKey(newKey);
      setIsRotatingKey(false);
      alert('🔑 API Key rotated successfully!');
    }, 1500);
  };

  const simulateApiCall = () => {
    setIsSimulating(true);
    setTerminalOutput(null);

    const procSteps = [
      { text: '🔐 Encrypting payload with AES-256...', delay: 500 },
      { text: '🔍 Validating JSON schema...', delay: 500 },
      { text: '⚡ Hashing PII data with SHA-256...', delay: 500 },
      { text: '📦 Adding to cryptographically linked ledger...', delay: 500 }
    ];

    let currentStep = 0;
    const executeStep = () => {
      if (currentStep < procSteps.length) {
        setTerminalOutput({ type: 'process', text: procSteps[currentStep].text });
        currentStep++;
        setTimeout(executeStep, procSteps[currentStep - 1].delay);
      } else {
        setTerminalOutput({ 
          type: 'success', 
          text: '✅ Event logged successfully!',
          hash: `tx_${Math.random().toString(36).substring(2, 12)}`
        });
        setIsSimulating(false);
      }
    };

    executeStep();
  };

  const simulateTamper = () => {
    if (isTampering) return;

    setIsTampering(true);
    setSecurityScore(45);

    setTimeout(() => {
      setBlockchain(prev => prev.map((block, i) => 
        i === 1 ? { ...block, status: 'invalid', hash: 'HACKED_' + Math.random().toString(36).substring(2, 8) } : block
      ));
    }, 500);

    setTimeout(() => {
      setBlockchain(prev => prev.map(block => 
        ({ ...block, status: 'invalid', hash: 'HACKED_' + Math.random().toString(36).substring(2, 8) })
      ));
    }, 1500);

    setTimeout(() => {
      setBlockchain([
        { 
          id: 1, 
          hash: '0000a1b2c3d4', 
          prevHash: '000000000000', 
          status: 'valid', 
          timestamp: Date.now() - 3000,
          data: 'Genesis Block'
        },
        { 
          id: 2, 
          hash: 'e5f6g7h8i9j0', 
          prevHash: '0000a1b2c3d4', 
          status: 'valid', 
          timestamp: Date.now() - 2000,
          data: 'User Login Event'
        },
        { 
          id: 3, 
          hash: 'k1l2m3n4o5p6', 
          prevHash: 'e5f6g7h8i9j0', 
          status: 'valid', 
          timestamp: Date.now() - 1000,
          data: 'Data Access Event'
        }
      ]);
      setSecurityScore(100);
      setIsTampering(false);
    }, 4000);
  };

  const calculateHash = () => {
    if (!hashInput.trim()) return;
    setIsHashing(true);
    setTimeout(() => {
      const hash = CryptoJS.SHA256(hashInput).toString();
      setHashOutput(hash);
      setIsHashing(false);
    }, 1000);
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
                    <FingerprintIcon className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                    <h4 className="text-white font-bold text-lg mb-2">Generate Secure Identity</h4>
                    <p className="text-slate-300 text-sm">Create your organization's unique cryptographic identity</p>
                  </div>
                  <button 
                    onClick={generateApiKey}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 flex items-center space-x-3 shadow-lg hover:shadow-purple-500/25"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Generating Secure Key...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5" />
                        <span>Generate API Key</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-6 w-full max-w-md">
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/20">
                    <Check className="w-12 h-12 text-green-400 mx-auto mb-3" />
                    <h4 className="text-white font-bold text-lg">Identity Created</h4>
                    <p className="text-slate-300 text-sm">Your secure API key is ready</p>
                  </div>
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                    <code className="text-green-400 font-mono text-sm break-all">{apiKey}</code>
                  </div>
                  <button 
                    onClick={rotateApiKey}
                    disabled={isRotatingKey}
                    className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-700 hover:to-orange-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {isRotatingKey ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <RotateCw className="w-4 h-4" />
                    )}
                    <span>{isRotatingKey ? 'Rotating...' : 'Rotate Key'}</span>
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
                <Server className="w-4 h-4 mr-2" />
                api.auditorveritas.com
              </div>
            </div>

            <div className="flex-1 p-6 bg-gradient-to-br from-slate-900 to-slate-800 overflow-y-auto">
              <div className="space-y-4">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="text-cyan-400 font-mono text-sm space-y-2">
                    <div>$ curl -X POST https://api.auditorveritas.com/v1/events \</div>
                    <div className="ml-4">-H "Authorization: Bearer {apiKey || 'your_api_key_here'}" \</div>
                    <div className="ml-4">-H "Content-Type: application/json" \</div>
                    <div className="ml-4">-d '{`{"event_type": "user_login", "user_id": "user_123", "ip_address": "192.168.1.1"}`}'</div>
                  </div>
                </div>

                {isSimulating && terminalOutput && (
                  <div className={`rounded-xl p-4 border ${
                    terminalOutput.type === 'process' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-green-500/10 border-green-500/20'
                  }`}>
                    <div className="text-sm font-mono flex items-center space-x-2">
                      <span>{terminalOutput.text}</span>
                    </div>
                  </div>
                )}

                {terminalOutput?.type === 'success' && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <div className="text-green-400 font-mono text-sm">
                      {`{ "status": "success", "hash": "${terminalOutput.hash}", "timestamp": "${new Date().toISOString()}" }`}
                    </div>
                  </div>
                )}
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

                  <div className="flex-1 flex space-x-2">
                    <input
                      type="text"
                      value={hashInput}
                      onChange={(e) => setHashInput(e.target.value)}
                      placeholder="Enter data to hash..."
                      className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <button 
                      onClick={calculateHash}
                      disabled={isHashing}
                      className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-slate-300 hover:bg-slate-600 transition disabled:opacity-50"
                    >
                      {isHashing ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Hash'}
                    </button>
                  </div>
                </div>
              )}

              {hashOutput && (
                <div className="mt-4 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="text-slate-400 text-xs mb-2">SHA-256 Hash:</div>
                  <code className="text-cyan-400 font-mono text-sm break-all">{hashOutput}</code>
                </div>
              )}
            </div>
          </div>
        );

      case 'blockchain':
        return (
          <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 border border-slate-700/50 shadow-2xl h-96 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10"></div>
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex-1 flex items-center justify-center">
                <div className="space-y-6 w-full max-w-2xl">
                  {/* Blockchain Visualization */}
                  <div className="flex justify-center items-center space-x-4">
                    {blockchain.map((block, index) => (
                      <div key={block.id} className="flex items-center">
                        <div className={`relative p-4 rounded-2xl border-2 transition-all duration-500 transform ${
                          block.status === 'valid' 
                            ? 'bg-slate-800/50 border-emerald-500/50 shadow-lg hover:scale-105' 
                            : 'bg-red-500/10 border-red-500 shadow-2xl scale-105'
                        } ${isTampering ? 'animate-pulse' : ''}`}>
                          <div className="text-center">
                            <div className="text-xs text-slate-400 mb-1">Block #{block.id}</div>
                            <div className="text-sm font-mono text-emerald-400 mb-2 truncate w-24">
                              {block.hash.substring(0, 8)}...
                            </div>
                            <div className="text-xs text-slate-500">{block.data}</div>
                          </div>
                          {block.status === 'invalid' && (
                            <AlertTriangle className="w-6 h-6 text-red-500 absolute -top-2 -right-2" />
                          )}
                        </div>
                        {index < blockchain.length - 1 && (
                          <div className={`w-8 h-0.5 mx-2 transition-all duration-500 ${
                            block.status === 'invalid' && blockchain[index + 1].status === 'invalid' 
                              ? 'bg-red-500' 
                              : 'bg-slate-600'
                          }`}></div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Security Status */}
                  <div className={`p-4 rounded-2xl backdrop-blur-sm border transition-all duration-500 ${
                    isTampering 
                      ? 'bg-red-500/10 border-red-500/20' 
                      : 'bg-emerald-500/10 border-emerald-500/20'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {isTampering ? (
                          <AlertTriangle className="w-6 h-6 text-red-500" />
                        ) : (
                          <ShieldCheck className="w-6 h-6 text-emerald-500" />
                        )}
                        <div>
                          <div className="text-white font-semibold">
                            {isTampering ? 'SECURITY BREACH DETECTED' : 'CHAIN INTEGRITY VERIFIED'}
                          </div>
                          <div className="text-slate-300 text-sm">
                            {isTampering ? 'Tampering detected across network' : 'All blocks cryptographically linked'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold text-xl">{securityScore}%</div>
                        <div className="text-slate-300 text-sm">Security Score</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button 
                  onClick={simulateTamper}
                  disabled={isTampering}
                  className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 flex items-center space-x-2 shadow-lg hover:shadow-red-500/25"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Simulate Attack</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 'intelligence':
        return (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 border border-slate-700/50 shadow-2xl h-96 overflow-hidden">
            <div className="relative z-10 h-full flex flex-col">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white font-bold text-lg">Live Security Dashboard</h3>
                  <p className="text-slate-400 text-sm">Real-time monitoring & threat detection</p>
                </div>
                <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-semibold">LIVE</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
                  <div className="text-2xl font-bold text-white">{liveEvents.length}</div>
                  <div className="text-slate-400 text-xs">Active Events</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
                  <div className="text-2xl font-bold text-green-400">100%</div>
                  <div className="text-slate-400 text-xs">Compliance</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
                  <div className="text-2xl font-bold text-blue-400">0ms</div>
                  <div className="text-slate-400 text-xs">Latency</div>
                </div>
              </div>

              {/* Live Events Feed */}
              <div className="flex-1 bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="h-full overflow-y-auto">
                  {liveEvents.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-500">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">Waiting for live events...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-700/50">
                      {liveEvents.map((event) => (
                        <div key={event.id} className="p-4 hover:bg-slate-700/20 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-white font-medium text-sm">{event.type}</span>
                            </div>
                            <span className="text-slate-400 text-xs bg-slate-700/50 px-2 py-1 rounded">
                              {event.timestamp}
                            </span>
                          </div>
                          <div className="text-slate-400 text-xs mt-2">
                            User: {event.user} • IP: {event.ip || 'N/A'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20">
      {/* Animated Background */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.15) 0%, transparent 80%)`
        }}
      />

      <div className="max-w-7xl mx-auto space-y-16 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center pt-16 lg:pt-24">
          <div className="inline-flex items-center bg-white/80 backdrop-blur-sm text-slate-700 px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-slate-200/50 shadow-lg">
            <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
            Enterprise-Grade Audit Trail Platform
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 mb-6 bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            How It Works
          </h1>
          <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Experience military-grade security with advanced audit trails, real-time monitoring, and cryptographically verified integrity.
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
                  activeTab === index 
                    ? `bg-gradient-to-r ${step.gradient} text-white shadow-inner` 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                }`}
              >
                <step.icon className={`w-6 h-6 lg:w-8 lg:h-8 mb-3 transition-transform duration-300 ${
                  activeTab === index ? 'scale-110' : 'group-hover:scale-110'
                }`} />
                <span className="text-xs lg:text-sm text-center">{step.title}</span>
                {activeTab === index && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30"></div>
                )}
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
                      <p className="text-slate-500 mt-2">
                        Step {activeStep + 1} of {steps.length}
                      </p>
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

        {/* Features Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {[
            { icon: ShieldCheck, label: "GDPR Compliant", color: "emerald" },
            { icon: Lock, label: "AES-256 Encryption", color: "blue" },
            { icon: CpuIcon, label: "Real-time Processing", color: "purple" },
            { icon: Cloud, label: "Global Infrastructure", color: "cyan" }
          ].map((feature, index) => (
            <div 
              key={index}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition duration-300 transform hover:scale-105"
            >
              <feature.icon className={`w-8 h-8 lg:w-10 lg:h-10 ${
                feature.color === 'emerald' ? 'text-emerald-600' :
                feature.color === 'blue' ? 'text-blue-600' :
                feature.color === 'purple' ? 'text-purple-600' : 'text-cyan-600'
              } mx-auto mb-3`} />
              <div className="font-bold text-slate-900 text-sm lg:text-base">{feature.label}</div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center py-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              <Rocket className="w-16 h-16 mx-auto mb-6" />
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to Secure Your Future?</h2>
              <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                Join industry leaders who trust Auditor Veritas for bullet-proof audit trails and compliance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => setActiveTab('create')}
                  className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Start Free Trial
                </button>
                <button 
                  onClick={() => setActiveTab('pricing')}
                  className="border-2 border-white text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
                >
                  View Enterprise Plans
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
              <strong className="block text-slate-900 text-base">👤 PII Hashing</strong>
              <span className="text-slate-600">User identifiers are SHA-256 hashed before storage.</span>
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

        {activeTab === 'howitworks' && <HowItWorks setActiveTab={setActiveTab} />}

        {activeTab === 'dashboard' && (
          <div className="animate-in px-4 sm:px-0 py-8">
            {!processor ? (
              <div className="max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 mt-8">
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
                    apiCall={apiCall}
                    fetchDashboard={fetchDashboard}
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