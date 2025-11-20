import { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import './App.css';
import CreateProcessor from './components/CreateProcessor';

// --- VIKTIG ÄNDRING HÄR ---
// Vi sätter denna till tom sträng. 
// Detta gör att anropen blir relativa (t.ex. "/api/pricing").
// Då fångar Netlify upp dem och skickar dem till Render via din netlify.toml.
const API_BASE_URL = ''; 

function App() {
  const [activeTab, setActiveTab] = useState('pricing');
  const [processor, setProcessor] = useState(null);
  const [events, setEvents] = useState([]);
  const [apiKey, setApiKey] = useState('');
  const [eventData, setEventData] = useState({
    event_type: '',
    event_data: '{}',
    user_identifier: ''
  });
  const [stats, setStats] = useState({
    totalEvents: 0,
    monthlyEvents: 0,
    eventsLimit: 10000,
    utilization: '0%'
  });
  const [pricingPlans, setPricingPlans] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(true);
  const [cookiesAccepted, setCookiesAccepted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Load initial data
  useEffect(() => {
    const savedCookies = localStorage.getItem('cookiesAccepted');
    const savedApiKey = localStorage.getItem('auditorApiKey');
    const savedProcessor = localStorage.getItem('auditorProcessor');
    
    if (savedCookies === 'true') {
      setCookiesAccepted(true);
      setShowCookieBanner(false);
    }

    if (savedApiKey) {
      setApiKey(savedApiKey);
      if (savedProcessor) {
        setProcessor(JSON.parse(savedProcessor));
        // Vi kan inte anropa fetchDashboard här direkt pga beroenden, 
        // men vi kan sätta statet om vi vill, eller låta användaren klicka "Access"
      }
    }

    fetchPricing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Enhanced API call with error handling
  const apiCall = async (endpoint, options = {}) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        ...options.headers,
      },
      ...options,
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      // Här blir det nu "/api/..." vilket är korrekt för Netlify proxy
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      // Hantera 204 No Content (kan hända vid preflight eller vissa svar)
      if (response.status === 204) {
        return null;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  // Fetch Pricing Plans
  const fetchPricing = async () => {
    try {
      const data = await apiCall('/api/pricing');
      setPricingPlans(data.plans);
    } catch (error) {
      // Fallback pricing
      setPricingPlans({
        starter: { events: 10000, price: 0, features: ['Basic Audit Trail', 'GDPR Compliance', 'Email Support'] },
        professional: { events: 100000, price: 49, features: ['Advanced Analytics', 'Bulk Import', 'Priority Support'] },
        enterprise: { events: 1000000, price: 199, features: ['Custom Features', 'Dedicated Support', 'SLA Guarantee'] }
      });
    }
  };

  // Fetch Dashboard Data
  const fetchDashboard = async () => {
    if (!apiKey) return;

    setIsLoading(true);
    try {
      const data = await apiCall('/api/dashboard');
      setProcessor(data.processor);
      setStats(data.stats);
      
      localStorage.setItem('auditorProcessor', JSON.stringify(data.processor));
      localStorage.setItem('auditorApiKey', apiKey); // Spara nyckeln också om inloggningen lyckas
      
    } catch (error) {
      console.error('Dashboard fetch failed:', error);
      alert('Failed to access dashboard. Please check your API Key.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Events
  const fetchEvents = async () => {
    if (!apiKey) return;

    setIsLoading(true);
    try {
      const data = await apiCall('/api/events');
      setEvents(data.events || []); // Ensure it's an array
    } catch (error) {
      console.error('Events fetch failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced Event Logging with PII Hashing
  const logEvent = async (e) => {
    e.preventDefault();
    
    if (!cookiesAccepted) {
      alert('❌ Please accept cookies to log events');
      return;
    }

    if (!apiKey) {
      alert('❌ API Key is required to log events');
      return;
    }

    if (!eventData.event_type) {
      alert('❌ Event type is required');
      return;
    }

    setIsLoading(true);
    try {
      // Auto-hash PII data
      let hashedUserIdentifier = null;
      if (eventData.user_identifier) {
        hashedUserIdentifier = CryptoJS.SHA256(eventData.user_identifier.trim().toLowerCase()).toString();
      }

      const eventToSend = {
        event_type: eventData.event_type,
        event_data: JSON.parse(eventData.event_data || '{}'),
        user_identifier: hashedUserIdentifier
      };

      const data = await apiCall('/api/events', {
        method: 'POST',
        body: eventToSend
      });

      alert(`✅ Event logged successfully! Usage: ${data.usage.monthlyUsed}/${data.usage.remaining} remaining`);
      setEventData({ event_type: '', event_data: '{}', user_identifier: '' });
      
      fetchDashboard();
      fetchEvents();

    } catch (error) {
      console.error('Event logging failed:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Event Verification
  const verifyEvent = async (eventId) => {
    try {
      const data = await apiCall(`/api/events/${eventId}/verify`);
      
      if (data.is_valid) {
        alert(`✅ Event verified - Cryptographic integrity maintained`);
      } else {
        alert(`❌ Event verification failed - Data may have been tampered with`);
      }
    } catch (error) {
      console.error('Event verification failed:', error);
    }
  };

  // Event Search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('❌ Please enter search query');
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiCall(`/api/events/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(data.events);
      alert(`🔍 Found ${data.events.length} events matching "${searchQuery}"`);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // GDPR Data Export
  const handleGDPRExport = async () => {
    if (!apiKey) {
      alert('❌ API Key required for export');
      return;
    }

    try {
      const data = await apiCall(`/api/gdpr/export/${processor.id}`);
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gdpr-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('✅ GDPR data exported successfully');
    } catch (error) {
      console.error('GDPR export failed:', error);
    }
  };

  // Cookie Acceptance
  const handleCookieAccept = () => {
    setCookiesAccepted(true);
    setShowCookieBanner(false);
    localStorage.setItem('cookiesAccepted', 'true');
    
    // Set essential cookies
    document.cookie = "essential_cookies=true; path=/; max-age=2592000"; // 30 days
  };

  // Helper functions
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Pricing Component
  const PricingSection = () => (
    <div className="pricing-section">
      <h2>💰 Choose Your Plan</h2>
      <p className="section-description">Start free, upgrade as you grow. All plans include GDPR compliance.</p>
      
      <div className="pricing-cards">
        {Object.entries(pricingPlans).map(([planName, planData]) => (
          <div key={planName} className={`pricing-card ${planName}`}>
            <div className="plan-header">
              <h3>{planName.charAt(0).toUpperCase() + planName.slice(1)}</h3>
              <div className="price">
                ${planData.price}<span>/month</span>
              </div>
            </div>
            <div className="plan-features">
              <div className="feature-main">{planData.events.toLocaleString()} events/month</div>
              {planData.features.map((feature, index) => (
                <div key={index} className="feature">✓ {feature}</div>
              ))}
            </div>
            <button 
              className={`btn-plan ${planName === 'starter' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                setActiveTab('create');
              }}
            >
              {planName === 'starter' ? 'Get Started Free' : `Choose ${planName}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  // API Key Setup
  const ApiKeySetup = () => (
    <div className="card">
      <h2>🔑 Access Your Dashboard</h2>
      <p>Enter your API key to manage your audit events</p>
      
      <div className="form-group">
        <label>API Key:</label>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your API key (starts with av_)"
          className="api-key-input"
        />
      </div>

      <div className="button-group">
        <button onClick={fetchDashboard} className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Access Dashboard'}
        </button>
        <button onClick={() => setActiveTab('pricing')} className="btn-secondary">
          View Pricing Plans
        </button>
      </div>
    </div>
  );

  // Cookie Banner Component
  const CookieBanner = () => (
    <div className="cookie-banner">
      <div className="cookie-content">
        <h3>🍪 Cookie Consent & GDPR Compliance</h3>
        <p>
          We use <strong>essential cookies</strong> for application functionality and security. 
          All data is processed in <strong>EU data centers</strong> with automatic PII hashing. 
          No tracking cookies are used.
        </p>
        <div className="cookie-buttons">
          <button className="btn-primary" onClick={handleCookieAccept}>
            Accept Essential Cookies
          </button>
          <a href="#privacy" className="btn-link" onClick={() => setActiveTab('privacy')}>
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );

  // Privacy Policy Component
  const PrivacyPolicy = () => (
    <div className="privacy-policy">
      <div className="card">
        <h2>🔒 Privacy Policy & GDPR Compliance</h2>
        
        <div className="policy-section">
          <h3>Data Protection</h3>
          <p>We process all data in compliance with GDPR Article 6(1)(b) - necessary for contract performance.</p>
        </div>

        <div className="policy-section">
          <h3>Cookies Used</h3>
          <ul>
            <li><strong>Essential Cookies:</strong> Session management and security</li>
            <li><strong>No Tracking:</strong> We don't use analytics or advertising cookies</li>
          </ul>
        </div>

        <div className="policy-section">
          <h3>Data Storage</h3>
          <ul>
            <li>🇪🇺 <strong>EU Data Centers:</strong> All data stored in EU (Frankrike)</li>
            <li>🔒 <strong>Encryption:</strong> Data encrypted at rest and in transit</li>
            <li>👤 <strong>PII Hashing:</strong> User identifiers automatically hashed with SHA-256</li>
          </ul>
        </div>

        <div className="policy-section">
          <h3>Your Rights (GDPR)</h3>
          <div className="rights-grid">
            <div className="right-card">
              <h4>Right to Access</h4>
              <p>Export all your data anytime using the GDPR export feature</p>
            </div>
            <div className="right-card">
              <h4>Right to Erasure</h4>
              <p>Request complete data deletion by contacting support</p>
            </div>
            <div className="right-card">
              <h4>Data Portability</h4>
              <p>Download your data in standard JSON format</p>
            </div>
          </div>
        </div>

        <button className="btn-secondary" onClick={() => setActiveTab('dashboard')}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div className="app">
      {/* Cookie Banner */}
      {showCookieBanner && <CookieBanner />}

      {/* Main Navigation */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <h1>Auditor Veritas</h1>
            <span>GDPR Compliant Audit Trail</span>
          </div>
          <nav className="nav">
            <button 
              className={activeTab === 'pricing' ? 'nav-active' : ''}
              onClick={() => setActiveTab('pricing')}
            >
              Pricing
            </button>
            <button 
              className={activeTab === 'dashboard' ? 'nav-active' : ''}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={activeTab === 'create' ? 'nav-active' : ''}
              onClick={() => setActiveTab('create')}
            >
              Create Processor
            </button>
            <button 
              className={activeTab === 'events' ? 'nav-active' : ''}
              onClick={() => setActiveTab('events')}
            >
              Log Events
            </button>
            <button 
              className={activeTab === 'privacy' ? 'nav-active' : ''}
              onClick={() => setActiveTab('privacy')}
            >
              Privacy
            </button>
          </nav>
        </div>
      </header>

      <main className="main">
        {/* Pricing Page */}
        {activeTab === 'pricing' && <PricingSection />}

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="dashboard">
            {!processor ? (
              <ApiKeySetup />
            ) : (
              <div className="card">
                <div className="dashboard-header">
                  <h2>📊 Dashboard - {processor.companyName}</h2>
                  <div className="dashboard-actions">
                    <button onClick={handleGDPRExport} className="btn-secondary">
                      📥 GDPR Export
                    </button>
                    <button onClick={fetchDashboard} className="btn-refresh" disabled={isLoading}>
                      🔄 Refresh
                    </button>
                  </div>
                </div>

                {/* Stats Overview */}
                <div className="stats-overview">
                  <div className="stat-card">
                    <h3>Monthly Usage</h3>
                    <div className="stat-value">{stats.monthlyEvents} / {stats.eventsLimit}</div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{width: stats.utilization}}
                      ></div>
                    </div>
                    <div className="stat-label">{stats.utilization} utilized</div>
                  </div>
                  <div className="stat-card">
                    <h3>Plan</h3>
                    <div className="stat-value">{processor.plan}</div>
                    <div className="stat-label">
                      ${pricingPlans[processor.plan]?.price || 0}/month
                    </div>
                  </div>
                  <div className="stat-card">
                    <h3>Total Events</h3>
                    <div className="stat-value">{stats.totalEvents}</div>
                    <div className="stat-label">All time</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                  <button onClick={() => setActiveTab('events')} className="btn-primary">
                    📝 Log New Event
                  </button>
                  <button onClick={fetchEvents} className="btn-secondary" disabled={isLoading}>
                    📋 View Events
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create Processor - NY KOMPONENT */}
        {activeTab === 'create' && <CreateProcessor />}

        {/* Log Events */}
        {activeTab === 'events' && (
          <div className="card">
            <h2>📝 Log Audit Events</h2>
            
            {!processor ? (
              <div className="warning-banner">
                <p>You need to create a processor first</p>
                <button onClick={() => setActiveTab('create')} className="btn-primary">
                  Create Processor
                </button>
              </div>
            ) : (
              <>
                <form onSubmit={logEvent} className="form">
                  <div className="form-group">
                    <label>Event Type:</label>
                    <input
                      type="text"
                      value={eventData.event_type}
                      onChange={(e) => setEventData({...eventData, event_type: e.target.value})}
                      placeholder="e.g., user_login, data_access, consent_update"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>User Identifier (optional):</label>
                    <input
                      type="text"
                      value={eventData.user_identifier}
                      onChange={(e) => setEventData({...eventData, user_identifier: e.target.value})}
                      placeholder="e.g., user_123, admin@company.com"
                    />
                    <small className="help-text">💡 This will be automatically hashed for GDPR compliance</small>
                  </div>

                  <div className="form-group">
                    <label>Event Data (JSON):</label>
                    <textarea
                      value={eventData.event_data}
                      onChange={(e) => setEventData({...eventData, event_data: e.target.value})}
                      placeholder='{"action": "login", "ip": "192.168.1.1", "status": "success"}'
                      rows="4"
                      required
                    />
                  </div>

                  <button type="submit" className="btn-submit" disabled={isLoading}>
                    {isLoading ? 'Logging...' : 'Log Event'}
                  </button>
                </form>

                {/* Event Search */}
                <div className="search-section">
                  <h3>🔍 Search Events</h3>
                  <div className="search-input-group">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by event type or data..."
                    />
                    <button onClick={handleSearch} className="btn-primary" disabled={isLoading}>
                      Search
                    </button>
                  </div>
                </div>

                {/* Events List */}
                {(events.length > 0 || searchResults.length > 0) && (
                  <div className="events-section">
                    <h3>📋 Recent Events</h3>
                    <div className="events-list">
                      {(searchResults.length > 0 ? searchResults : events).map(event => (
                        <div key={event.id} className="event-card">
                          <div className="event-header">
                            <strong>{event.event_type}</strong>
                            <span>{new Date(event.event_timestamp).toLocaleString()}</span>
                          </div>
                          <pre className="event-data">
                            {JSON.stringify(event.event_data, null, 2)}
                          </pre>
                          <button 
                            onClick={() => verifyEvent(event.id)}
                            className="btn-verify"
                          >
                            ✅ Verify Integrity
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Privacy Policy */}
        {activeTab === 'privacy' && <PrivacyPolicy />}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Auditor Veritas</h4>
            <p>GDPR Compliant Audit Trail Solution</p>
          </div>
          <div className="footer-section">
            <h4>Compliance</h4>
            <span>🇪🇺 EU Data Centers</span>
            <span>🔒 GDPR Compliant</span>
            <span>📜 Data Processing Agreement</span>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <span>📧 support@auditorveritas.com</span>
            <span>🕒 24/7 Priority Support</span>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Auditor Veritas. Ready for production.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;