import { useState, useEffect } from 'react';
import './App.css';
import CryptoJS from 'crypto-js';
import CreateProcessor from './components/CreateProcessor';
import { 
  ShieldCheck, BarChart3, Users, FileText, Check, 
  Lock, Zap, LayoutDashboard, LogOut, PlusCircle,
  Key, Database, Search, Server,
  ArrowRight, Play, ArrowLeft, Menu, X,
  Smartphone, Globe, Cpu, Code, Eye, EyeOff,
  Settings
} from 'lucide-react';

const API_BASE_URL = '';

// Enhanced Security protections hook
const useSecurityProtections = () => {
  useEffect(() => {
    // Prevent right-click context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      alert('🔒 Right-click is disabled for security reasons.');
      return false;
    };

    // Prevent drag and drop
    const handleDragStart = (e) => {
      e.preventDefault();
      return false;
    };

    // Prevent copy
    const handleCopy = (e) => {
      e.preventDefault();
      alert('🔒 Copying content is disabled for security reasons.');
      return false;
    };

    // Prevent cut
    const handleCut = (e) => {
      e.preventDefault();
      return false;
    };

    // Enhanced keyboard shortcuts protection
    const handleKeyDown = (e) => {
      // Detect Print Screen key
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        alert('🔒 Screenshots are disabled for security reasons.');
        return false;
      }
      
      // Detect Windows + Shift + S
      if (e.key === 's' && e.shiftKey && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        alert('🔒 Screenshots are disabled for security reasons.');
        return false;
      }
      
      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.keyCode === 123 || // F12
        (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
        (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
        (e.ctrlKey && e.keyCode === 85) // Ctrl+U
      ) {
        e.preventDefault();
        alert('🔒 Developer tools are disabled for security reasons.');
        return false;
      }

      // Mobile device detection and prevention
      if (e.key === 'Power' || e.key === 'VolumeDown' || e.key === 'VolumeUp') {
        // These keys are often used for mobile screenshots
        console.warn('Mobile screenshot keys detected');
      }
    };

    // Mobile-specific: Prevent gesture-based screenshots
    const handleTouchStart = (e) => {
      // Detect multi-finger touches that might be screenshots
      if (e.touches.length > 2) {
        console.warn('Multi-touch gesture detected - possible screenshot attempt');
        // You could show a warning or take other action
      }
    };

    // Detect iframe embedding
    if (window.location !== window.parent.location) {
      window.top.location = window.location;
    }

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('touchstart', handleTouchStart);

    // Mobile: Prevent zoom and pinch
    const preventZoom = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    document.addEventListener('touchmove', preventZoom, { passive: false });

    return () => {
      // Cleanup
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', preventZoom);
    };
  }, []);
};

// --- KOMPONENTER ---

const Navbar = ({ activeTab, setActiveTab, cookiesAccepted }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuItems = ['Pricing', 'HowItWorks', 'Dashboard', 'Create', 'Events', 'Privacy'];

  // Blockera navigation om cookies inte är accepterade
  const handleTabChange = (tab) => {
    if (!cookiesAccepted && tab !== 'privacy') {
      setActiveTab('privacy');
      return;
    }
    setActiveTab(tab);
  };

  return (
    <header className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white sticky top-0 z-50 shadow-lg border-b border-blue-700/50">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer hover:opacity-90 transition" onClick={() => { handleTabChange('pricing'); setMobileMenuOpen(false); }}>
            <div className="bg-white/10 p-2 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Auditor Veritas</h1>
              <p className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold hidden sm:block">GDPR Compliant Audit Trail</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-1">
            {menuItems.map((item) => (
              <button
                key={item}
                onClick={() => handleTabChange(item.toLowerCase())}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === item.toLowerCase() 
                    ? 'bg-white/10 text-white shadow-sm backdrop-blur-sm' 
                    : 'text-blue-100 hover:bg-white/5 hover:text-white'
                } ${!cookiesAccepted && item.toLowerCase() !== 'privacy' ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!cookiesAccepted && item.toLowerCase() !== 'privacy'}
              >
                {item === 'HowItWorks' ? 'How It Works' : item}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-blue-700/50 pt-4 animate-in fade-in slide-in-from-top-2">
            <nav className="flex flex-col space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item}
                  onClick={() => { handleTabChange(item.toLowerCase()); setMobileMenuOpen(false); }}
                  className={`px-4 py-3 rounded-lg text-left font-medium transition-all duration-200 ${
                    activeTab === item.toLowerCase() 
                      ? 'bg-white/10 text-white' 
                      : 'text-blue-100 hover:bg-white/5'
                  } ${!cookiesAccepted && item.toLowerCase() !== 'privacy' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!cookiesAccepted && item.toLowerCase() !== 'privacy'}
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

const LockedFeature = ({ title, desc, setActiveTab }) => (
  <div className="bg-slate-50/50 rounded-xl p-6 border border-dashed border-slate-300 flex flex-col items-center justify-center text-center h-full hover:bg-slate-50 transition">
    <div className="bg-slate-200 p-3 rounded-full mb-4">
      <Lock className="w-6 h-6 text-slate-500" />
    </div>
    <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-sm text-slate-500 mb-6 max-w-xs leading-relaxed">{desc}</p>
    <button 
      onClick={() => setActiveTab('pricing')} 
      className="text-sm bg-white border border-slate-200 px-4 py-2 rounded-lg font-semibold text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition shadow-sm"
    >
      Upgrade to Unlock
    </button>
  </div>
);

const PrivacyPolicy = ({ setActiveTab, cookiesAccepted, setCookiesAccepted }) => (
  <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 px-4 sm:px-0">
    
    {!cookiesAccepted && (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8 text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-amber-600 mr-3" />
          <h3 className="text-2xl font-bold text-amber-800">Required: Accept Privacy Policy</h3>
        </div>
        <p className="text-amber-700 mb-6 text-lg">
          To use Auditor Veritas and ensure GDPR compliance, you must read and accept our Privacy Policy.
        </p>
        <button 
          onClick={() => {
            setCookiesAccepted(true);
            localStorage.setItem('cookiesAccepted', 'true');
          }}
          className="bg-amber-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-amber-700 transition shadow-lg hover:shadow-amber-600/30"
        >
          ✅ I Accept - Continue to Auditor Veritas
        </button>
        <p className="text-amber-600 text-sm mt-4">
          By accepting, you agree to our data processing practices in compliance with GDPR Article 6(1)(b)
        </p>
      </div>
    )}
    
    <div className="text-center mb-12">
      <div className="bg-emerald-50 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl rotate-3 flex items-center justify-center mx-auto mb-6 shadow-sm">
        <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600 -rotate-3" />
      </div>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">Privacy & Compliance</h2>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto">We process data in strict accordance with GDPR Article 6(1)(b) and industry security standards.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-blue-50 rounded-xl mr-4"><Users className="w-6 h-6 text-blue-600" /></div>
          <h3 className="font-bold text-xl text-slate-900">Data Storage</h3>
        </div>
        <ul className="space-y-4">
          <li className="flex items-start group">
            <div className="mt-1 mr-3 p-1 bg-emerald-100 rounded-full"><Check className="w-3 h-3 text-emerald-700"/></div>
            <div>
              <strong className="block text-slate-900 text-sm">🇪🇺 EU Data Centers</strong>
              <span className="text-sm text-slate-500">All data resides in Frankfurt (AWS eu-central-1).</span>
            </div>
          </li>
          <li className="flex items-start group">
            <div className="mt-1 mr-3 p-1 bg-emerald-100 rounded-full"><Check className="w-3 h-3 text-emerald-700"/></div>
            <div>
              <strong className="block text-slate-900 text-sm">🔒 Military-grade Encryption</strong>
              <span className="text-sm text-slate-500">AES-256 at rest and TLS 1.3 in transit.</span>
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
        </ul>
      </div>
    </div>

    {/* Your Rights */}
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-100 mt-8">
      <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Your Rights under GDPR</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <div>
          <h4 className="font-bold text-slate-800 mb-2 flex items-center"><div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>Right to Access</h4>
          <p className="text-sm text-slate-500 leading-relaxed">You can export all your raw event data as JSON anytime directly from the dashboard.</p>
        </div>
        <div>
          <h4 className="font-bold text-slate-800 mb-2 flex items-center"><div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>Right to Erasure</h4>
          <p className="text-sm text-slate-500 leading-relaxed">
            "Right to be forgotten". To permanently delete your data, please contact our Data Protection Officer at: 
            <a href="mailto:hazarnodesweden@outlook.com" className="block mt-1 text-blue-600 font-medium hover:underline">
              hazarnodesweden@outlook.com
            </a>
          </p>
        </div>
        <div>
          <h4 className="font-bold text-slate-800 mb-2 flex items-center"><div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>Data Portability</h4>
          <p className="text-sm text-slate-500 leading-relaxed">Move your audit trail to another provider easily using our standard export format.</p>
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
        </div>
      </div>
    </div>

    {cookiesAccepted && (
      <div className="text-center pt-8 pb-4">
        <button onClick={() => setActiveTab('dashboard')} className="text-blue-600 font-semibold hover:text-blue-700 transition flex items-center justify-center mx-auto">
          ← Back to Dashboard
        </button>
      </div>
    )}
  </div>
);

const HowItWorks = ({ setActiveTab }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [showCodeExample, setShowCodeExample] = useState(false);

  const steps = [
    {
      title: "Registration & API Key",
      icon: Key,
      description: "Companies register through our web portal and receive a unique API key that serves as their digital ID.",
      details: ["Unique API key", "Secure container in database", "Immediate activation"],
      action: "create",
      actionText: "Create API Key",
      visual: "key"
    },
    {
      title: "Automatic Logging",
      icon: Settings,
      description: "Integrate the API key into your systems. During critical events, data is automatically sent to Auditor Veritas.",
      details: ["Integrate into systems", "Automatic signaling", "Tracks: Who, What, When"],
      action: "events",
      actionText: "Test Logging",
      visual: "code"
    },
    {
      title: "Secure Storage & Chains",
      icon: Lock,
      description: "Each event is encrypted and linked to the previous event to create an immutable chain.",
      details: ["SHA-256 hash", "Chain linking", "GDPR-secured storage"],
      action: "privacy",
      actionText: "Learn About Security",
      visual: "chain"
    },
    {
      title: "Dashboard & Analysis",
      icon: BarChart3,
      description: "Monitor and analyze all activity through our secure dashboard with searchable logs and reports.",
      details: ["Searchable history", "Export reports", "Advanced analysis (Premium)"],
      action: "dashboard",
      actionText: "Explore Dashboard",
      visual: "dashboard"
    }
  ];

  const renderVisualization = () => {
    switch(steps[activeStep].visual) {
      case 'key':
        return (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white p-4 rounded-xl shadow-lg border">
                <Key className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            <p className="text-center text-blue-800 font-medium text-sm">
              Your unique API key: <code className="bg-blue-100 px-2 py-1 rounded">av_123456789abc</code>
            </p>
          </div>
        );
      case 'code':
        return (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-300 text-sm font-mono">API Integration</span>
              <button onClick={() => setShowCodeExample(!showCodeExample)} className="text-slate-400 hover:text-white transition">
                {showCodeExample ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {showCodeExample ? (
              <pre className="text-slate-200 text-xs font-mono overflow-x-auto">
{`fetch('https://api.auditorveritas.com/events', {
  method: 'POST',
  headers: { 'x-api-key': 'av_123...' },
  body: JSON.stringify({ event_type: 'login' })
});`}
              </pre>
            ) : (
              <div className="text-center py-8">
                <Code className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400 text-sm">Click to show code</p>
              </div>
            )}
          </div>
        );
      case 'chain':
        return (
          <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-6 border border-purple-200">
            <div className="flex justify-center space-x-2 mb-4">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center">
                  <div className="bg-white w-10 h-10 rounded-lg border-2 border-purple-300 flex items-center justify-center shadow-sm">
                    <span className="text-purple-600 font-bold text-sm">H{num}</span>
                  </div>
                  {num < 3 && <div className="w-6 h-0.5 bg-purple-300 mx-1"></div>}
                </div>
              ))}
            </div>
            <p className="text-center text-purple-800 text-sm">Immutable hash chains</p>
          </div>
        );
      case 'dashboard':
        return (
          <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl p-6 border border-amber-200">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white rounded-lg p-3 shadow-sm border">
                <div className="text-amber-600 text-lg font-bold">1,247</div>
                <div className="text-amber-800 text-xs">Events</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm border">
                <div className="text-amber-600 text-lg font-bold">100%</div>
                <div className="text-amber-800 text-xs">Secure</div>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16 animate-in fade-in duration-500 px-4 sm:px-0">
      <div className="text-center pt-4 sm:pt-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-xl">
          <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">🛡️ How It Works</h1>
        <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Auditor Veritas is a secure, cloud-based service that helps companies create immutable audit trails.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 sm:px-8 py-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center justify-center sm:justify-start">
            <Play className="w-6 h-6 sm:w-8 sm:h-8 mr-3 sm:mr-4 text-emerald-400" />
            🚀 4 Simple Steps
          </h2>
        </div>
        
        <div className="p-4 sm:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-8 sm:mb-12">
            {steps.map((step, index) => (
              <button
                key={index}
                onClick={() => setActiveStep(index)}
                className={`p-3 sm:p-4 rounded-xl text-center transition-all duration-300 ${
                  activeStep === index ? 'bg-blue-600 text-white shadow-lg transform scale-105' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <step.icon className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 ${activeStep === index ? 'text-white' : 'text-blue-600'}`} />
                <span className="font-semibold text-xs sm:text-sm">Step {index + 1}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
            <div className="w-full lg:w-2/3">
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">{steps[activeStep].title}</h3>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">{steps[activeStep].description}</p>
              <div className="space-y-3 mb-6 sm:mb-8">
                {steps[activeStep].details.map((detail, index) => (
                  <div key={index} className="flex items-start">
                    <div className="bg-emerald-100 p-2 rounded-lg mr-3 mt-1"><Check className="w-4 h-4 text-emerald-600" /></div>
                    <span className="text-slate-700 text-sm sm:text-base">{detail}</span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setActiveTab(steps[activeStep].action)}
                className="bg-blue-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg hover:scale-105 w-full sm:w-auto"
              >
                {steps[activeStep].actionText} →
              </button>
            </div>
            <div className="w-full lg:w-1/3 mt-6 lg:mt-0">{renderVisualization()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Blocked Access Component för icke-accepterade användare
const BlockedAccess = ({ setActiveTab, setCookiesAccepted }) => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center border border-slate-200">
      <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
        <Lock className="w-8 h-8 text-red-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-slate-900 mb-4">Access Restricted</h2>
      
      <p className="text-slate-600 mb-6 leading-relaxed">
        To ensure GDPR compliance and data protection, you must first read and accept our Privacy Policy before accessing Auditor Veritas.
      </p>
      
      <div className="space-y-4">
        <button 
          onClick={() => {
            setActiveTab('privacy');
          }}
          className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-blue-600/30"
        >
          📖 Read Privacy Policy
        </button>
        
        <p className="text-xs text-slate-500">
          Required for GDPR Article 6(1)(b) compliance
        </p>
      </div>
    </div>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState('privacy'); // Starta alltid med privacy
  const [processor, setProcessor] = useState(null);
  const [events, setEvents] = useState([]);
  const [apiKey, setApiKey] = useState('');
  const [eventData, setEventData] = useState({ event_type: '', event_data: '{}', user_identifier: '' });
  const [stats, setStats] = useState({ totalEvents: 0, monthlyEvents: 0, eventsLimit: 100, utilization: '0%' });
  const [pricingPlans, setPricingPlans] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [cookiesAccepted, setCookiesAccepted] = useState(false);

  // Använd säkerhetsskydden
  useSecurityProtections();

  // Enhanced mobile protection
  useEffect(() => {
    // Prevent mobile screenshot by blurring content when app goes to background
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // App is in background - could be taking screenshot
        document.body.style.filter = 'blur(5px)';
        document.body.style.transition = 'filter 0.3s ease';
      } else {
        // App is in foreground
        document.body.style.filter = 'none';
      }
    };

    // Prevent mobile zoom
    const disableZoom = () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    disableZoom();

    // Disable text selection on mobile
    document.addEventListener('selectstart', (e) => {
      e.preventDefault();
      return false;
    });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('selectstart', (e) => e.preventDefault());
    };
  }, []);

  useEffect(() => {
    const savedCookies = localStorage.getItem('cookiesAccepted');
    const savedApiKey = localStorage.getItem('auditorApiKey');
    
    if (savedCookies === 'true') {
      setCookiesAccepted(true);
      setActiveTab('pricing'); // Byt till pricing om redan accepterat
    } else {
      setActiveTab('privacy'); // Tvinga till privacy om inte accepterat
    }

    if (savedApiKey) {
      setApiKey(savedApiKey);
    }

    setPricingPlans({
      starter: { name: 'Starter', events: 100, price: 0, features: ['Basic Audit Trail', 'GDPR Compliance', 'Email Support'] },
      professional: { name: 'Professional', events: 50000, price: 49, features: ['Advanced Analytics', 'Bulk Import', 'Priority Support', 'Custom Events'], featured: true },
      enterprise: { name: 'Enterprise', events: 500000, price: 199, features: ['Everything in Professional', 'Dedicated Support', 'SLA Guarantee', 'Custom Integrations'] }
    });
  }, []);

  // Blockera tab-ändringar om cookies inte är accepterade
  const handleTabChange = (tab) => {
    if (!cookiesAccepted && tab !== 'privacy') {
      setActiveTab('privacy');
      return;
    }
    setActiveTab(tab);
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
    if (!cookiesAccepted) {
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
    if (!cookiesAccepted) {
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

  // Om cookies inte är accepterade, visa endast Privacy Policy eller blocked access
  if (!cookiesAccepted && activeTab !== 'privacy') {
    return <BlockedAccess setActiveTab={setActiveTab} setCookiesAccepted={setCookiesAccepted} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col prevent-select">
      <Navbar activeTab={activeTab} setActiveTab={handleTabChange} cookiesAccepted={cookiesAccepted} />

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl flex-grow">
        {activeTab === 'pricing' && cookiesAccepted && (
          <div className="space-y-12 animate-in">
            <div className="text-center max-w-2xl mx-auto pt-4 sm:pt-8 px-4">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Transparent Pricing</h2>
              <p className="text-lg text-slate-600">Start small and scale securely. All plans include full GDPR compliance features from day one.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-0">
              {Object.entries(pricingPlans).map(([key, plan]) => (
                <div key={key} className={`relative rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:scale-105 hover:shadow-xl flex flex-col ${plan.featured ? 'bg-white ring-4 ring-blue-500/20 shadow-xl scale-105' : 'bg-white shadow-lg border border-slate-100'}`}>
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
                        <div className="mt-0.5 mr-3 min-w-[20px]"><Check className="w-5 h-5 text-emerald-500" /></div>
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => handleTabChange('create')}
                    className={`w-full py-3 sm:py-3.5 rounded-xl font-bold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${
                      plan.featured 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700' 
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

        {activeTab === 'howitworks' && cookiesAccepted && <HowItWorks setActiveTab={handleTabChange} />}

        {activeTab === 'dashboard' && cookiesAccepted && (
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
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 sm:py-4 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center shadow-md hover:shadow-lg"
                >
                  {isLoading ? (
                    <span className="flex items-center"><div className="animate-spin mr-2 h-4 w-4 border-2 border-b-0 border-white rounded-full"></div> Connecting...</span>
                  ) : 'Access Dashboard'}
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

                <StatsCards stats={stats} processor={processor} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className={`bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-100 ${processor.plan === 'starter' ? 'opacity-90' : ''}`}>
                    <div className="flex justify-between items-center mb-4 sm:mb-6">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center"><BarChart3 className="w-5 h-5 mr-2 text-blue-600"/> Advanced Analytics</h3>
                      {processor.plan !== 'starter' && <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase font-bold px-2 py-1 rounded-md tracking-wide">Active</span>}
                    </div>
                    {processor.plan === 'starter' ? (
                      <LockedFeature title="Analytics Locked" desc="Upgrade to Professional to see detailed usage trends, geo-maps and interaction insights." setActiveTab={handleTabChange} />
                    ) : (
                      <div className="h-32 sm:h-48 bg-blue-50/50 rounded-xl flex flex-col items-center justify-center text-blue-400 border border-blue-100">
                        <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 opacity-20 mb-2" />
                        <span className="text-sm font-medium text-blue-300">Interactive Charts Active</span>
                      </div>
                    )}
                  </div>

                  <div className={`bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-100 ${processor.plan === 'starter' ? 'opacity-90' : ''}`}>
                    <div className="flex justify-between items-center mb-4 sm:mb-6">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center"><PlusCircle className="w-5 h-5 mr-2 text-indigo-600"/> Bulk Operations</h3>
                      {processor.plan !== 'starter' && <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase font-bold px-2 py-1 rounded-md tracking-wide">Active</span>}
                    </div>
                    {processor.plan === 'starter' ? (
                      <LockedFeature title="Bulk Import Locked" desc="Process large historical datasets by uploading CSV or JSON files directly." setActiveTab={handleTabChange} />
                    ) : (
                      <div className="h-32 sm:h-48 border-2 border-dashed border-indigo-200 rounded-xl flex flex-col items-center justify-center text-indigo-400 hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer transition bg-indigo-50/30">
                        <div className="bg-white p-2 sm:p-3 rounded-full shadow-sm mb-2 sm:mb-3">
                          <PlusCircle className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-500" />
                        </div>
                        <span className="font-medium text-sm sm:text-base">Drop CSV file here</span>
                        <span className="text-xs mt-1 opacity-70">or click to browse</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && cookiesAccepted && (
          <div className="max-w-2xl mx-auto pt-4 sm:pt-6 animate-in px-4 sm:px-0">
            <CreateProcessor />
          </div>
        )}

        {activeTab === 'events' && cookiesAccepted && (
          <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-100 mt-8 mb-8 animate-in px-4 sm:px-0">
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
          </div>
        )}

        {activeTab === 'privacy' && (
          <PrivacyPolicy 
            setActiveTab={handleTabChange} 
            cookiesAccepted={cookiesAccepted}
            setCookiesAccepted={setCookiesAccepted}
          />
        )}

      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 sm:py-16 mt-12 sm:mt-20 border-t border-slate-800">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6 text-white opacity-90">
            <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
            <span className="text-xl sm:text-2xl font-bold tracking-tight">Auditor Veritas</span>
          </div>
          <p className="text-sm mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed text-slate-500">Enterprise-grade audit logging compliant with GDPR, CCPA & SOC2.</p>
          
          <div className="mb-4 sm:mb-6">
            <a href="mailto:hazarnodesweden@outlook.com" className="text-blue-400 hover:text-white transition font-medium text-base sm:text-lg">
              hazarnodesweden@outlook.com
            </a>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-6 text-sm font-medium mb-6 sm:mb-8">
            <a href="#" className="hover:text-white transition">Terms</a>
            <button onClick={() => handleTabChange('privacy')} className="hover:text-white transition">Privacy</button>
            <a href="#" className="hover:text-white transition">Security</a>
            <a href="mailto:hazarnodesweden@outlook.com" className="hover:text-white transition">Contact</a>
          </div>
          <p className="text-xs text-slate-600">&copy; 2025 Auditor Veritas. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;