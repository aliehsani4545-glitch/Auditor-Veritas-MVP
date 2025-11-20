import { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import CreateProcessor from './components/CreateProcessor';
import { 
  ShieldCheck, BarChart3, Users, FileText, Check, 
  Lock, Zap, LayoutDashboard, LogOut, PlusCircle 
} from 'lucide-react';

// VIKTIGT: Tom sträng för Netlify proxy
const API_BASE_URL = ''; 

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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

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
      alert('Failed to access dashboard. Check API Key.');
    } finally {
      setIsLoading(false);
    }
  };

  const logEvent = async (e) => {
    e.preventDefault();
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

  // --- KOMPONENTER ---

  const Navbar = () => (
    <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('pricing')}>
            <ShieldCheck className="w-8 h-8 text-accent" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">Auditor Veritas</h1>
              <p className="text-xs text-blue-200">GDPR Compliant Audit Trail</p>
            </div>
          </div>
          <nav className="hidden md:flex space-x-8 text-sm font-medium">
            {['Pricing', 'Dashboard', 'Create', 'Events'].map((item) => (
              <button
                key={item}
                onClick={() => setActiveTab(item.toLowerCase())}
                className={`hover:text-accent transition-colors ${activeTab === item.toLowerCase() ? 'text-accent border-b-2 border-accent pb-1' : 'text-blue-100'}`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );

  const StatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
        <div className="flex items-center mb-4">
          <FileText className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-700">Monthly Usage</h3>
        </div>
        <div className="flex justify-between items-end mb-2">
          <div className="text-3xl font-bold text-gray-900">{stats.monthlyEvents}</div>
          <div className="text-sm text-gray-500">of {stats.eventsLimit}</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: stats.utilization }}></div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
        <div className="flex items-center mb-4">
          <Zap className="w-6 h-6 text-accent mr-3" />
          <h3 className="text-lg font-semibold text-gray-700">Plan Status</h3>
        </div>
        <div className="text-3xl font-bold text-gray-900 capitalize">{processor?.plan || 'Inactive'}</div>
        <div className="text-sm text-green-600 mt-1 flex items-center">
          <Check className="w-4 h-4 mr-1" /> Active subscription
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
        <div className="flex items-center mb-4">
          <BarChart3 className="w-6 h-6 text-purple-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-700">Total Events</h3>
        </div>
        <div className="text-3xl font-bold text-gray-900">{stats.totalEvents}</div>
        <div className="text-sm text-gray-500">All time record</div>
      </div>
    </div>
  );

  const LockedFeature = ({ title, desc }) => (
    <div className="bg-gray-50 rounded-xl p-6 border border-dashed border-gray-300 flex flex-col items-center justify-center text-center h-full">
      <div className="bg-gray-200 p-3 rounded-full mb-4">
        <Lock className="w-6 h-6 text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{desc}</p>
      <button onClick={() => setActiveTab('pricing')} className="text-sm text-blue-600 font-medium hover:underline">
        Upgrade to Unlock
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-light font-sans">
      <Navbar />

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        
        {/* --- PRICING TAB --- */}
        {activeTab === 'pricing' && (
          <div className="space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Transparent Pricing</h2>
              <p className="text-lg text-gray-600">Start small and scale securely. All plans include full GDPR compliance features.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Object.entries(pricingPlans).map(([key, plan]) => (
                <div key={key} className={`relative rounded-2xl p-8 transition-all duration-300 hover:scale-105 flex flex-col ${plan.featured ? 'bg-white ring-4 ring-blue-100 shadow-xl' : 'bg-white shadow-lg border border-gray-100'}`}>
                  {plan.featured && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-accent text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start text-gray-600 text-sm">
                        <Check className="w-5 h-5 text-green-500 mr-2 shrink-0" /> {feat}
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => setActiveTab('create')}
                    className={`w-full py-3 rounded-lg font-semibold transition ${plan.featured ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
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
          <div>
            {!processor ? (
              <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <div className="text-center mb-6">
                  <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Access Dashboard</h2>
                  <p className="text-gray-500 text-sm">Enter your API key to manage events</p>
                </div>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="av_xxxxxxxx..."
                  className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <button 
                  onClick={fetchDashboard} 
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center"
                >
                  {isLoading ? 'Loading...' : 'Access Dashboard'}
                </button>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{processor.companyName}</h2>
                    <p className="text-gray-500">Dashboard Overview</p>
                  </div>
                  <div className="flex space-x-3">
                    <button onClick={fetchDashboard} className="p-2 bg-white border rounded-lg hover:bg-gray-50"><LayoutDashboard className="w-5 h-5 text-gray-600"/></button>
                    <button onClick={() => {setProcessor(null); setApiKey('');}} className="p-2 bg-white border rounded-lg hover:bg-red-50 text-red-600"><LogOut className="w-5 h-5"/></button>
                  </div>
                </div>

                <StatsCards />

                {/* Feature Gating Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 ${processor.plan === 'starter' ? 'opacity-75' : ''}`}>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-900">Advanced Analytics</h3>
                      {processor.plan !== 'starter' && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span>}
                    </div>
                    {processor.plan === 'starter' ? (
                      <LockedFeature title="Analytics Locked" desc="Upgrade to Professional to see detailed usage trends and insights." />
                    ) : (
                      <div className="h-40 bg-blue-50 rounded-lg flex items-center justify-center text-blue-400">
                        <BarChart3 className="w-12 h-12 opacity-50" />
                      </div>
                    )}
                  </div>

                  <div className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 ${processor.plan === 'starter' ? 'opacity-75' : ''}`}>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-900">Bulk Operations</h3>
                      {processor.plan !== 'starter' && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span>}
                    </div>
                    {processor.plan === 'starter' ? (
                      <LockedFeature title="Bulk Import Locked" desc="Process large datasets by uploading CSV files." />
                    ) : (
                      <div className="h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 cursor-pointer transition">
                        <PlusCircle className="w-8 h-8 mb-2" />
                        <span>Drop CSV file here</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- CREATE & EVENTS TABS (Simple wrapper styling) --- */}
        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto">
            <CreateProcessor />
          </div>
        )}

        {activeTab === 'events' && (
          <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 flex items-center"><FileText className="w-6 h-6 mr-2 text-blue-600"/> Log New Event</h2>
            <form onSubmit={logEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                <input type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. user_login" value={eventData.event_type} onChange={e => setEventData({...eventData, event_type: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Identifier</label>
                <input type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. email@test.com" value={eventData.user_identifier} onChange={e => setEventData({...eventData, user_identifier: e.target.value})} />
                <p className="text-xs text-gray-500 mt-1 flex items-center"><ShieldCheck className="w-3 h-3 mr-1"/> Automatically hashed for privacy</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">JSON Data</label>
                <textarea className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm" rows="4" value={eventData.event_data} onChange={e => setEventData({...eventData, event_data: e.target.value})} required />
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                {isLoading ? 'Processing...' : 'Log Event'}
              </button>
            </form>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-dark text-gray-400 py-12 mt-20">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4 text-white">
            <ShieldCheck className="w-6 h-6" />
            <span className="text-lg font-bold">Auditor Veritas</span>
          </div>
          <p className="text-sm mb-6">Enterprise-grade audit logging compliant with GDPR & SOC2.</p>
          <p className="text-xs">&copy; 2025 Auditor Veritas. All rights reserved.</p>
        </div>
      </footer>

      {/* Cookie Banner */}
      {showCookieBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600 mb-4 md:mb-0">
              🍪 We use essential cookies to ensure security and functionality.
            </p>
            <button 
              onClick={() => {setCookiesAccepted(true); setShowCookieBanner(false);}}
              className="bg-dark text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
            >
              Accept & Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;