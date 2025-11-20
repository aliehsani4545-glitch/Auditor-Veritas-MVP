import { useState, useEffect } from 'react';
import './App.css';
import CryptoJS from 'crypto-js';
import CreateProcessor from './components/CreateProcessor';
import { 
  ShieldCheck, BarChart3, Users, FileText, Check, 
  Lock, Zap, LayoutDashboard, LogOut, PlusCircle 
} from 'lucide-react';

// VIKTIGT: Tom sträng för Netlify proxy
const API_BASE_URL = ''; 

// --- KOMPONENTER (Definierade utanför App för prestanda) ---

const Navbar = ({ activeTab, setActiveTab }) => (
  <header className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white sticky top-0 z-50 shadow-lg border-b border-blue-700/50">
    <div className="container mx-auto px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer hover:opacity-90 transition" onClick={() => setActiveTab('pricing')}>
          <div className="bg-white/10 p-2 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Auditor Veritas</h1>
            <p className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">GDPR Compliant Audit Trail</p>
          </div>
        </div>
        <nav className="hidden md:flex space-x-1">
          {['Pricing', 'Dashboard', 'Create', 'Events', 'Privacy'].map((item) => (
            <button
              key={item}
              onClick={() => setActiveTab(item.toLowerCase())}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === item.toLowerCase() 
                  ? 'bg-white/10 text-white shadow-sm backdrop-blur-sm' 
                  : 'text-blue-100 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>
    </div>
  </header>
);

const StatsCards = ({ stats, processor }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 hover:shadow-md transition duration-300 group">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="ml-3 text-sm font-semibold text-slate-600 uppercase tracking-wide">Monthly Usage</h3>
      </div>
      <div className="flex justify-between items-end mb-3">
        <div className="text-3xl font-bold text-slate-900">{stats.monthlyEvents}</div>
        <div className="text-sm text-slate-500 font-medium">of {stats.eventsLimit}</div>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: stats.utilization }}></div>
      </div>
    </div>
    
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 hover:shadow-md transition duration-300 group">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition">
          <Zap className="w-6 h-6 text-amber-500" />
        </div>
        <h3 className="ml-3 text-sm font-semibold text-slate-600 uppercase tracking-wide">Plan Status</h3>
      </div>
      <div className="text-3xl font-bold text-slate-900 capitalize mb-1">{processor?.plan || 'Inactive'}</div>
      <div className="text-sm text-emerald-600 font-medium flex items-center">
        <Check className="w-4 h-4 mr-1" /> Active subscription
      </div>
    </div>

    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 hover:shadow-md transition duration-300 group">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition">
          <BarChart3 className="w-6 h-6 text-purple-600" />
        </div>
        <h3 className="ml-3 text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Events</h3>
      </div>
      <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalEvents}</div>
      <div className="text-sm text-slate-500 font-medium">All time record</div>
    </div>
  </div>
);

const LockedFeature = ({ title, desc, setActiveTab }) => (
  <div className="bg-slate-50/50 rounded-xl p-8 border border-dashed border-slate-300 flex flex-col items-center justify-center text-center h-full hover:bg-slate-50 transition">
    <div className="bg-slate-200 p-4 rounded-full mb-4">
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

const PrivacyPolicy = ({ setActiveTab, cookiesAccepted, setShowCookieBanner }) => (
  <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
    
    {!cookiesAccepted && (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
        <div className="flex items-center justify-center mb-3">
          <Lock className="w-6 h-6 text-amber-600 mr-2" />
          <h3 className="text-lg font-bold text-amber-800">Privacy Policy Limited Access</h3>
        </div>
        <p className="text-amber-700 mb-4">
          Please accept cookies to view the complete Privacy Policy. Essential session cookies are required for security and GDPR compliance.
        </p>
        <button 
          onClick={() => {
            setShowCookieBanner(true);
          }}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-700 transition"
        >
          Accept Cookies to Continue
        </button>
      </div>
    )}
    
    <div className="text-center mb-12">
      <div className="bg-emerald-50 w-20 h-20 rounded-2xl rotate-3 flex items-center justify-center mx-auto mb-6 shadow-sm">
        <ShieldCheck className="w-10 h-10 text-emerald-600 -rotate-3" />
      </div>
      <h2 className="text-4xl font-extrabold text-slate-900 mb-3">Privacy & Compliance</h2>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto">We process data in strict accordance with GDPR Article 6(1)(b) and industry security standards.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Data Storage */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
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
          <li className="flex items-start group">
            <div className="mt-1 mr-3 p-1 bg-emerald-100 rounded-full"><Check className="w-3 h-3 text-emerald-700"/></div>
            <div>
              <strong className="block text-slate-900 text-sm">👤 PII Anonymization</strong>
              <span className="text-sm text-slate-500">User identifiers are SHA-256 hashed automatically.</span>
            </div>
          </li>
        </ul>
      </div>

      {/* Cookies */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
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

    {/* Your Rights */}
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 mt-8">
      <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Your Rights under GDPR</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
            <p className="text-xs text-slate-500 mt-1">For GDPR requests and data deletion</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <h5 className="font-semibold text-slate-700 mb-2">Technical Support</h5>
            <a href="mailto:hazarnodesweden@outlook.com" className="text-blue-600 hover:underline">
              hazarnodesweden@outlook.com
            </a>
            <p className="text-xs text-slate-500 mt-1">For technical issues and account help</p>
          </div>
        </div>
      </div>
    </div>

    <div className="text-center pt-8 pb-4">
      <button onClick={() => setActiveTab('dashboard')} className="text-blue-600 font-semibold hover:text-blue-700 transition flex items-center justify-center mx-auto">
        ← Back to Dashboard
      </button>
    </div>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState('pricing');
  const [processor, setProcessor] = useState(null);
  const [events, setEvents] = useState([]);
  const [apiKey, setApiKey] = useState('');
  const [eventData, setEventData] = useState({ event_type: '', event_data: '{}', user_identifier: '' });
  const [stats, setStats] = useState({ totalEvents: 0, monthlyEvents: 0, eventsLimit: 100, utilization: '0%' });
  const [pricingPlans, setPricingPlans] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(true);
  const [cookiesAccepted, setCookiesAccepted] = useState(false);

  useEffect(() => {
    const savedCookies = localStorage.getItem('cookiesAccepted');
    const savedApiKey = localStorage.getItem('auditorApiKey');
    
    if (savedCookies === 'true') {
      setCookiesAccepted(true);
      setShowCookieBanner(false);
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
    setIsLoading(true);
    try {
      const data = await apiCall('/api/dashboard');
      setProcessor(data.processor);
      setStats(data.stats);
      localStorage.setItem('auditorProcessor', JSON.stringify(data.processor));
      localStorage.setItem('auditorApiKey', apiKey);
    } catch (error) {
      alert('Failed to access dashboard. Please check your API Key.');
    } finally {
      setIsLoading(false);
    }
  };

  const logEvent = async (e) => {
    e.preventDefault();
    if (!cookiesAccepted) {
      alert('❌ Please accept cookies to log events');
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
        body: { ...eventData, event_data: JSON.parse(eventData.event_data || '{}'), user_identifier: hashedId }
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

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-6xl flex-grow">
        
        {/* --- PRICING TAB --- */}
        {activeTab === 'pricing' && (
          <div className="space-y-12 animate-in">
            <div className="text-center max-w-2xl mx-auto pt-8">
              <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Transparent Pricing</h2>
              <p className="text-lg text-slate-600">Start small and scale securely. All plans include full GDPR compliance features from day one.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Object.entries(pricingPlans).map(([key, plan]) => (
                <div key={key} className={`relative rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-xl flex flex-col ${plan.featured ? 'bg-white ring-4 ring-blue-500/20 shadow-xl scale-105' : 'bg-white shadow-lg border border-slate-100'}`}>
                  {plan.featured && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg tracking-wide">
                      MOST POPULAR
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <div className="mb-6 flex items-baseline">
                    <span className="text-4xl font-extrabold text-slate-900">${plan.price}</span>
                    <span className="text-slate-500 ml-2 font-medium">/month</span>
                  </div>
                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start text-slate-600 text-sm">
                        <div className="mt-0.5 mr-3 min-w-[20px]"><Check className="w-5 h-5 text-emerald-500" /></div>
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => setActiveTab('create')}
                    className={`w-full py-3.5 rounded-xl font-bold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${
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

        {/* --- DASHBOARD TAB --- */}
        {activeTab === 'dashboard' && (
          <div className="animate-in">
            {!processor ? (
              <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-slate-100 mt-10">
                <div className="text-center mb-8">
                  <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Lock className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Access Dashboard</h2>
                  <p className="text-slate-500 text-sm mt-2">Enter your API key to securely manage your audit events</p>
                </div>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="av_xxxxxxxx..."
                  className="w-full p-4 border border-slate-300 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-slate-50 focus:bg-white font-mono text-sm shadow-sm"
                />
                <button 
                  onClick={fetchDashboard} 
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center shadow-md hover:shadow-lg"
                >
                  {isLoading ? (
                    <span className="flex items-center"><div className="animate-spin mr-2 h-4 w-4 border-2 border-b-0 border-white rounded-full"></div> Connecting...</span>
                  ) : 'Access Dashboard'}
                </button>
              </div>
            ) : (
              <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">{processor.companyName}</h2>
                    <div className="flex items-center mt-1 text-slate-500">
                      <LayoutDashboard className="w-4 h-4 mr-1.5" />
                      <p className="text-sm font-medium">Dashboard Overview</p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button onClick={fetchDashboard} className="flex items-center px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-white hover:shadow-sm transition text-slate-700 font-medium text-sm">
                      <Zap className="w-4 h-4 mr-2 text-amber-500"/> Refresh
                    </button>
                    <button onClick={() => {setProcessor(null); setApiKey('');}} className="flex items-center px-4 py-2 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 hover:text-red-700 transition text-red-600 font-medium text-sm">
                      <LogOut className="w-4 h-4 mr-2"/> Sign Out
                    </button>
                  </div>
                </div>

                <StatsCards stats={stats} processor={processor} />

                {/* Feature Gating Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`bg-white rounded-xl shadow-sm p-6 border border-slate-100 ${processor.plan === 'starter' ? 'opacity-90' : ''}`}>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center"><BarChart3 className="w-5 h-5 mr-2 text-blue-600"/> Advanced Analytics</h3>
                      {processor.plan !== 'starter' && <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase font-bold px-2 py-1 rounded-md tracking-wide">Active</span>}
                    </div>
                    {processor.plan === 'starter' ? (
                      <LockedFeature title="Analytics Locked" desc="Upgrade to Professional to see detailed usage trends, geo-maps and interaction insights." setActiveTab={setActiveTab} />
                    ) : (
                      <div className="h-48 bg-blue-50/50 rounded-xl flex flex-col items-center justify-center text-blue-400 border border-blue-100">
                        <BarChart3 className="w-16 h-16 opacity-20 mb-2" />
                        <span className="text-sm font-medium text-blue-300">Interactive Charts Active</span>
                      </div>
                    )}
                  </div>

                  <div className={`bg-white rounded-xl shadow-sm p-6 border border-slate-100 ${processor.plan === 'starter' ? 'opacity-90' : ''}`}>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center"><PlusCircle className="w-5 h-5 mr-2 text-indigo-600"/> Bulk Operations</h3>
                      {processor.plan !== 'starter' && <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase font-bold px-2 py-1 rounded-md tracking-wide">Active</span>}
                    </div>
                    {processor.plan === 'starter' ? (
                      <LockedFeature title="Bulk Import Locked" desc="Process large historical datasets by uploading CSV or JSON files directly." setActiveTab={setActiveTab} />
                    ) : (
                      <div className="h-48 border-2 border-dashed border-indigo-200 rounded-xl flex flex-col items-center justify-center text-indigo-400 hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer transition bg-indigo-50/30">
                        <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                          <PlusCircle className="w-8 h-8 text-indigo-500" />
                        </div>
                        <span className="font-medium">Drop CSV file here</span>
                        <span className="text-xs mt-1 opacity-70">or click to browse</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- CREATE TAB --- */}
        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto pt-6 animate-in">
            <CreateProcessor />
          </div>
        )}

        {/* --- EVENTS TAB --- */}
        {activeTab === 'events' && (
          <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-slate-100 mt-6 animate-in">
            <div className="flex items-center mb-8 pb-4 border-b border-slate-100">
              <div className="p-3 bg-blue-50 rounded-xl mr-4">
                <FileText className="w-8 h-8 text-blue-600"/> 
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Log New Event</h2>
                <p className="text-slate-500 text-sm">Manually record an audit event</p>
              </div>
            </div>
            
            <form onSubmit={logEvent} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Event Type</label>
                <input 
                  type="text" 
                  className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                  placeholder="e.g. user_login" 
                  value={eventData.event_type} 
                  onChange={e => setEventData({...eventData, event_type: e.target.value})} 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">User Identifier</label>
                <input 
                  type="text" 
                  className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                  placeholder="e.g. email@test.com" 
                  value={eventData.user_identifier} 
                  onChange={e => setEventData({...eventData, user_identifier: e.target.value})} 
                />
                <p className="text-xs text-slate-500 mt-2 flex items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <ShieldCheck className="w-3 h-3 mr-1.5 text-emerald-500"/> 
                  Securely hashed with SHA-256 before storage
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">JSON Data</label>
                <textarea 
                  className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm h-32 bg-slate-50" 
                  value={eventData.event_data} 
                  onChange={e => setEventData({...eventData, event_data: e.target.value})} 
                  required 
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5 active:translate-y-0"
              >
                {isLoading ? 'Processing...' : 'Log Event'}
              </button>
            </form>
          </div>
        )}

        {/* --- PRIVACY TAB --- */}
        {activeTab === 'privacy' && (
          <PrivacyPolicy 
            setActiveTab={setActiveTab} 
            cookiesAccepted={cookiesAccepted}
            setShowCookieBanner={setShowCookieBanner}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 mt-20 border-t border-slate-800">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6 text-white opacity-90">
            <ShieldCheck className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold tracking-tight">Auditor Veritas</span>
          </div>
          <p className="text-sm mb-8 max-w-md mx-auto leading-relaxed text-slate-500">Enterprise-grade audit logging compliant with GDPR, CCPA & SOC2. Built for security-first engineering teams.</p>
          
          {/* Din mailadress synligt i footern */}
          <div className="mb-6">
            <a href="mailto:hazarnodesweden@outlook.com" className="text-blue-400 hover:text-white transition font-medium text-lg">
              hazarnodesweden@outlook.com
            </a>
          </div>
          
          <div className="flex justify-center space-x-6 text-sm font-medium mb-8">
            <a href="#" className="hover:text-white transition">Terms</a>
            <button onClick={() => setActiveTab('privacy')} className="hover:text-white transition">Privacy</button>
            <a href="#" className="hover:text-white transition">Security</a>
            <a href="mailto:hazarnodesweden@outlook.com" className="hover:text-white transition">Contact</a>
          </div>
          <p className="text-xs text-slate-600">&copy; 2025 Auditor Veritas. All rights reserved.</p>
        </div>
      </footer>

      {/* Cookie Consent Modal */}
      {showCookieBanner && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center transform transition-all scale-100 border border-slate-200">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Privacy & Security</h3>
            
            <p className="text-slate-600 mb-8 leading-relaxed text-sm">
              To ensure GDPR compliance and security, we need your consent to store essential session tokens. 
              <strong> No tracking cookies</strong> or third-party analytics are used.
              <br /><br />
              <span className="text-amber-600 font-medium">You must accept cookies to access the full Privacy Policy.</span>
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => {
                  setCookiesAccepted(true); 
                  setShowCookieBanner(false);
                  localStorage.setItem('cookiesAccepted', 'true');
                }}
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-blue-600/30"
              >
                Accept & Continue
              </button>
              
              <button 
                onClick={() => {
                  alert('Please accept cookies first to read the full Privacy Policy. Essential cookies are required for security and GDPR compliance.');
                }}
                className="text-sm text-slate-500 hover:text-blue-600 font-medium underline decoration-slate-300 underline-offset-4 hover:decoration-blue-600 transition"
              >
                Read Privacy Policy Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;