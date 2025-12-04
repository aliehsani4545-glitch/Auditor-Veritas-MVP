// ============================================================
// AUDITOR VERITAS - ZERO TRUST FRONTEND APPLICATION
// Version: 2.1.1 - Privacy by Default (Production Optimized)
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';
import CryptoJS from 'crypto-js';
import { AnimatePresence, motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ShieldCheck, RotateCw, RefreshCw, Eye, Copy, AlertTriangle,
  Menu, X, Sparkles, Server, Cookie, Lock, LogOut, User, LayoutGrid,
  CheckCircle2, Zap, ArrowRight, Download, UserPlus, Loader2, Mail,
  Shield, Trash2, XCircle, QrCode, Users, Link as LinkIcon, BadgeCheck, BookOpen
} from 'lucide-react';

import InteractiveFeatureSection from './components/InteractiveFeatureSection';
import DashboardPreview from './components/DashboardPreview';
import CoreArchitecture from './components/CoreArchitecture';
import IntegrityEngine from './components/IntegrityEngine';
import UseCases from './components/UseCases';
import InteractiveHeroBackground from './components/InteractiveHeroBackground';
import TypewriterEffect from './components/TypewriterEffect';
import PrivacyPage from './components/PrivacyPage';
import CookieConsent from './components/CookieConsent';
import CodeIntegration from './components/CodeIntegration';
import Dashboard from './components/Dashboard';
import IntegrityFocusPage from './components/IntegrityFocusPage';
import SecurityPage from './components/SecurityPage';
import DocsModal from './components/DocsModal';
import TrustCenter from './components/TrustCenter';
import Footer from './components/Footer';
import ContactPage from './components/ContactPage';
import AboutPage from './components/AboutPage';
import ServicesPage from './components/ServicesPage';
import EuroLedgerDemo from './components/EuroLedgerDemo';
import EnterpriseForm from './components/EnterpriseForm';

const API_BASE_URL = 'https://auditor-veritas-mvp.onrender.com';
const SUPABASE_URL = 'https://ridpgvikvjreljwypbpj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpZHBndmlrdmpyZWxqd3lwYnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MDU5MDksImV4cCI6MjA3ODk4MTkwOX0.qP9Okdx8uroKpkWjoUNLNC9WcRSPD6S6AV7RasCCPHg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const UNIFIED_CONSENT_KEY = 'unified_cookie_consent_v2';

export const apiCall = async (endpoint, options = {}, token = null, apiKey = null) => {
  const sanitize = (str) => str ? str.replace(/[^\x00-\x7F]/g, "") : str;
  const headers = { 'Content-Type': 'application/json; charset=utf-8', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${sanitize(token)}`;
  if (apiKey) headers['x-api-key'] = sanitize(apiKey);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers, ...options, body: options.body ? JSON.stringify(options.body) : null
    });
    if (response.status === 204) return null;
    const text = await response.text();
    let data;
    try { data = text ? JSON.parse(text) : {}; }
    catch (e) { throw new Error(`Server connection error (${response.status}).`); }
    if (!response.ok) throw new Error(data.error || `Server Error: ${response.status}`);
    return data;
  } catch (e) { throw new Error(e.message || "Connection failed."); }
};

const isCorporateEmail = (email) => {
  const blockedDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'protonmail.com', 'live.com', 'msn.com'];
  const domain = email.split('@').pop()?.toLowerCase();
  return domain && !blockedDomains.includes(domain);
};

const DashboardCookieConsent = ({ onAccept, onReadPolicy }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="absolute inset-0 flex items-center justify-center bg-slate-50/95 backdrop-blur-sm p-6 rounded-lg z-50"
  >
    <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-200 max-w-md text-center text-slate-900">
      <Lock size={32} className="text-red-500 mx-auto mb-3" />
      <h4 className="text-2xl font-bold mb-2">Access Restricted</h4>
      <p className="text-sm text-slate-600 mb-6">Dashboard requires consent for data processing.</p>
      <div className="flex flex-col gap-3">
        <button onClick={() => onAccept('accepted')} className="bg-blue-600 text-white px-4 py-3 rounded-lg font-bold text-sm hover:bg-blue-700">
          Accept & Access Dashboard
        </button>
        <button onClick={onReadPolicy} className="bg-slate-100 text-slate-800 px-4 py-3 rounded-lg font-bold text-sm hover:bg-slate-200">
          Read Privacy Policy
        </button>
      </div>
    </div>
  </motion.div>
);

const JoinTeamPage = ({ session, fetchDashboard }) => {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Validating invitation...');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (!session) { setStatus('login_required'); setMessage('Please sign in with the invited email.'); }
    else if (tokenFromUrl) { handleAcceptInvite(session.access_token, tokenFromUrl); }
    else { setStatus('error'); setMessage('No invitation token found.'); }
  }, [session]);

  const handleAcceptInvite = async (accessToken, currentToken) => {
    setStatus('loading');
    try {
      await apiCall('/api/team/accept', { method: 'POST', body: { token: currentToken } }, accessToken);
      window.history.replaceState({}, document.title, window.location.pathname);
      setStatus('success');
      setMessage('Invitation accepted! Redirecting...');
      setTimeout(() => fetchDashboard(), 1500);
    } catch (err) { setStatus('error'); setMessage(err.message); }
  };

  if (status === 'login_required' && !session) return <AuthScreen onLogin={fetchDashboard} />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md border border-slate-200">
        {status === 'loading' && <Loader2 className="animate-spin mx-auto text-blue-600 mb-4" size={40} />}
        {status === 'success' && <CheckCircle2 className="mx-auto text-green-500 mb-4" size={40} />}
        {status === 'error' && <AlertTriangle className="mx-auto text-red-500 mb-4" size={40} />}
        <h3 className="text-xl font-bold text-slate-900 mb-2">{status === 'error' ? 'Error' : 'Team Invitation'}</h3>
        <p className="text-slate-600">{message}</p>
      </div>
    </div>
  );
};

const TeamManagement = ({ token, processor, userRole }) => {
  const [team, setTeam] = useState([]);
  const [pending, setPending] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('reader');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);

  const isOwner = userRole === 'owner';
  const isAdmin = userRole === 'admin' || isOwner;

  const fetchTeamData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiCall('/api/team', { method: 'GET' }, token);
      setTeam(data.team || []);
      setPending(data.pending || []);
    } catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  }, [token]);

  useEffect(() => { fetchTeamData(); }, [fetchTeamData]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!isCorporateEmail(inviteEmail)) { setError("Corporate email required."); return; }

    setInviteLoading(true); setError(null); setSuccess(null); setGeneratedLink(null);
    try {
      const data = await apiCall('/api/team/invite', { method: 'POST', body: { email: inviteEmail, role: inviteRole } }, token);
      setSuccess(`Invite created for ${inviteEmail}`);
      setGeneratedLink(data.link);
      setInviteEmail('');
      fetchTeamData();
    } catch (err) { setError(err.message); }
    finally { setInviteLoading(false); }
  };

  const handleRemove = async (userId, email, role) => {
    if (!isAdmin || role === 'owner') return;
    if (!confirm(`Remove ${email}?`)) return;
    try {
      await apiCall(`/api/team/member/${userId}`, { method: 'DELETE' }, token);
      setSuccess(`Removed ${email}`);
      fetchTeamData();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Users className="text-blue-600" /> Organization & Roles</h3>
        <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">Role: <strong className="uppercase">{userRole}</strong></span>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center gap-2"><XCircle size={16} />{error}</div>}
      {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm flex items-center gap-2"><CheckCircle2 size={16} />{success}</div>}

      {isAdmin && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8">
          <form onSubmit={handleInvite} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Corporate Email</label>
              <input type="email" placeholder="colleague@company.com" className="w-full p-2 border rounded-lg text-slate-900 text-sm" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Role</label>
              <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="p-2 border rounded-lg text-sm bg-white text-slate-900 w-32">
                <option value="reader">Reader</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex items-end">
              <button disabled={inviteLoading} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 disabled:opacity-50 h-[38px]">
                {inviteLoading ? 'Creating...' : 'Generate Invite'}
              </button>
            </div>
          </form>

          {generatedLink && (
            <div className="mt-4 p-3 bg-blue-100 border border-blue-200 rounded-lg">
              <p className="text-xs font-bold text-blue-800 mb-1">Invite Link:</p>
              <div className="flex gap-2">
                <input readOnly value={generatedLink} className="flex-1 p-1 text-xs bg-white border rounded" />
                <button onClick={() => navigator.clipboard.writeText(generatedLink)} className="px-3 py-1 bg-blue-600 text-white text-xs rounded font-bold">Copy</button>
              </div>
            </div>
          )}
        </div>
      )}

      {isLoading ? <Loader2 className="animate-spin mx-auto text-slate-400" /> : (
        <div className="border rounded-xl overflow-hidden">
          {team.map((m, i) => (
            <div key={m.user_id || `${m.email}-${i}`} className={`flex justify-between items-center p-4 bg-white ${i !== team.length - 1 ? 'border-b' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">{m.email[0].toUpperCase()}</div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{m.email}</div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{m.role}</span>
                </div>
              </div>
              {isAdmin && m.role !== 'owner' ? (
                <button onClick={() => handleRemove(m.user_id, m.email, m.role)} className="text-slate-400 hover:text-red-500 p-2"><Trash2 size={16} /></button>
              ) : m.role === 'owner' && <Shield size={16} className="text-purple-400 mr-2" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AuthScreen = ({ onLogin }) => {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Konto registrerat! Du kan nu logga in med dina uppgifter.');
        setMode('login'); 
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data?.session) onLogin(data.session);
        else throw new Error("Session missing.");
      }
    } catch (error) { alert(error.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4 pt-20">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6 text-slate-900">{mode === 'login' ? 'Secure Login' : 'Register Node / User'}</h2>
        <form onSubmit={handleAuth} className="space-y-4">
          <input type="email" required className="w-full p-3 border rounded-lg text-slate-900" placeholder="email@company.com" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" required className="w-full p-3 border rounded-lg text-slate-900" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold">{loading ? <Loader2 className="animate-spin mx-auto" /> : (mode === 'login' ? 'Access' : 'Register')}</button>
        </form>
        <div className="mt-6 text-center">
          <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-sm text-slate-500 hover:text-blue-600">
            {mode === 'login' ? "Register New Node" : "Back to Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

const CreateProcessor = ({ token, onProcessorCreated }) => {
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError(null);
    try {
      const data = await apiCall('/api/processors', { method: 'POST', body: { companyName } }, token);
      setApiKey(data.apiKey);
      localStorage.setItem('av_active_key', data.apiKey);
      localStorage.setItem('av_sim_key', data.apiKey);
      setTimeout(() => {
        onProcessorCreated({
          id: data.processorId || 'new-id', api_key_raw: data.apiKey, company_name: companyName,
          monthly_events_limit: 1000, monthly_events_used: 0, region: 'eu-west', tier: 'standard', status: 'active'
        });
      }, 2000);
    } catch (err) { setError(err.message); setLoading(false); }
  };

  if (apiKey) return (
    <div className="text-center p-10 bg-white shadow-xl rounded-2xl max-w-lg mx-auto mt-20">
      <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-slate-900 mb-2">Node Initialized</h3>
      <p className="text-sm text-slate-500 mb-6">Redirecting...</p>
      <div className="bg-slate-100 p-4 rounded text-xs font-mono break-all">{apiKey}</div>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-3xl shadow-2xl mt-20">
      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center gap-2"><AlertTriangle size={18} />{error}</div>}
      <h2 className="text-2xl font-bold text-center text-slate-900 mb-6">Initialize Node</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="w-full p-3 border rounded-xl mb-6 text-slate-900" placeholder="Company Legal Name" />
        <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold">{loading ? <Loader2 className="animate-spin mx-auto" /> : 'Create Node'}</button>
      </form>
    </div>
  );
};

function App() {
  const [privacyAccepted, setPrivacyAccepted] = useState(localStorage.getItem('el_privacy_v1') === 'true');
  const [unifiedCookieStatus, setUnifiedCookieStatus] = useState(localStorage.getItem(UNIFIED_CONSENT_KEY) || null);
  const [session, setSession] = useState(null);
  const [processor, setProcessor] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [dashboardSubTab, setDashboardSubTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [legalTab, setLegalTab] = useState('privacy');
  const [showSecurity, setShowSecurity] = useState(false);
  const [stats, setStats] = useState({ totalEvents: 0, monthlyEvents: 0 });
  const [recentLogs, setRecentLogs] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [activeApiKey, setActiveApiKey] = useState(localStorage.getItem('av_sim_key') || localStorage.getItem('av_active_key'));
  const [systemAuditLogs, setSystemAuditLogs] = useState([]);
  const [eventData, setEventData] = useState({ event_type: 'user.login', event_data: '{"action": "login"}', user_identifier: 'user_123' });

  const hasJoinToken = new URLSearchParams(window.location.search).has('token');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const handleProcessorCreated = (newProcessorData) => {
    setProcessor(newProcessorData);
    setActiveTab('dashboard');
    if (newProcessorData.api_key_raw) {
      setActiveApiKey(newProcessorData.api_key_raw);
      localStorage.setItem('av_active_key', newProcessorData.api_key_raw);
      localStorage.setItem('av_sim_key', newProcessorData.api_key_raw);
    }
  };

  const handleKeyUpdate = (newKey) => {
    setActiveApiKey(newKey);
    localStorage.setItem('av_active_key', newKey);
    localStorage.setItem('av_sim_key', newKey);
  };

  const fetchSystemAuditLogs = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const data = await apiCall('/api/system/audit', { method: 'GET' }, session.access_token);
      setSystemAuditLogs(data.logs || []);
    } catch (e) { setSystemAuditLogs([]); }
  }, [session]);

  const fetchDashboard = useCallback(async (newSession = null) => {
    const token = newSession?.access_token || session?.access_token;
    if (!token) return;

    try {
      const data = await apiCall('/api/dashboard', { method: 'GET' }, token);
      setProcessor(data.processor);
      setStats(data.stats);
      setUserRole(data.userRole);
      const logsData = await apiCall('/api/events/search?limit=10', { method: 'GET' }, token);
      setRecentLogs(logsData.events || []);
      setChartData([]);
      if (hasJoinToken) setActiveTab('dashboard');
    } catch (e) {
      console.error("Dashboard API Error:", e.message);
      if (e.message.includes('404') || e.message.includes('NO_PROCESSOR')) {
        setProcessor(false);
      } else {
        setProcessor(null);
        alert(`Connection Error: ${e.message}`);
      }
      setStats({ totalEvents: 0, monthlyEvents: 0 });
      setRecentLogs([]);
    }
  }, [session, hasJoinToken]);

  useEffect(() => {
    if (hasJoinToken) { setActiveTab('dashboard'); }
    else if (activeTab === 'dashboard' && session) {
      if (unifiedCookieStatus === 'accepted' || unifiedCookieStatus === 'denied') {
        if (processor === null) fetchDashboard();
      }
    }
    if (activeTab === 'dashboard' && dashboardSubTab === 'system_audit' && session) {
      fetchSystemAuditLogs();
    }
  }, [activeTab, session, hasJoinToken, processor, dashboardSubTab, fetchDashboard, fetchSystemAuditLogs, unifiedCookieStatus]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null); setProcessor(null); setActiveTab('home');
    localStorage.removeItem('av_active_key');
    localStorage.removeItem('av_sim_key');
  };

  const handleLogEvent = async (e, dataFromForm) => {
    if (e) e.preventDefault();
    if (userRole === 'reader') return alert("Readers cannot log events.");

    try {
      const payloadData = dataFromForm || eventData;
      const keyToUse = activeApiKey || localStorage.getItem('av_sim_key');
      if (!keyToUse) throw new Error("No Active API Key.");

      const realUserIdentifier = session?.user?.email || 'authenticated-user';
      let finalEventData = payloadData.event_data;
      if (typeof finalEventData === 'string') {
        try { finalEventData = JSON.parse(finalEventData); }
        catch { finalEventData = { raw: payloadData.event_data }; }
      }

      await apiCall('/api/events', {
        method: 'POST',
        body: { event_type: payloadData.event_type, event_data: finalEventData, user_identifier: realUserIdentifier }
      }, null, keyToUse);

      fetchDashboard();
      alert("Event Logged!");
    } catch (err) { alert(`Log Failed: ${err.message}`); }
  };

  const handleUnifiedConsent = (status) => {
    localStorage.setItem(UNIFIED_CONSENT_KEY, status);
    setUnifiedCookieStatus(status);
    localStorage.removeItem('cookie_consent');
    localStorage.removeItem('enterprise_cookie_consent');
    localStorage.removeItem('contact_cookie_consent');
    localStorage.removeItem('dashboard_cookie_consent');
    if (status === 'accepted' && session) fetchDashboard();
  };

  const handleInitialPrivacyAccept = () => {
    localStorage.setItem('el_privacy_v1', 'true');
    setPrivacyAccepted(true);
    handleUnifiedConsent('accepted');
  };

  if (!privacyAccepted) return <PrivacyPage onAccept={handleInitialPrivacyAccept} onClose={() => {}} />;

  const showDashboardConsent = activeTab === 'dashboard' && session && unifiedCookieStatus === null;

  return (
    <div className="min-h-screen font-sans bg-[#020617] text-white">
      <AnimatePresence>
        {showDocs && <DocsModal onClose={() => setShowDocs(false)} />}
        {showPrivacyModal && <PrivacyPage isFooterView={true} onClose={() => setShowPrivacyModal(false)} initialTab={legalTab} />}
        {showSecurity && <SecurityPage onClose={() => setShowSecurity(false)} />}
      </AnimatePresence>

      <header className="fixed w-full z-50 bg-[#020617]/90 border-b border-white/10 py-2 px-6 flex justify-between items-center backdrop-blur-md">
        <div className="font-bold text-lg flex gap-2 cursor-pointer items-center hover:text-blue-400" onClick={() => setActiveTab('home')}>
          <ShieldCheck className="text-blue-500" /> AuditorVeritas
        </div>
        <nav className="hidden md:flex gap-8 text-sm items-center font-medium">
          {['home', 'services', 'trust', 'pricing', 'about', 'contact'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`capitalize transition-all relative hover:text-white ${activeTab === tab ? 'text-white after:content-[""] after:absolute after:-bottom-4 after:left-0 after:w-full after:h-0.5 after:bg-blue-500' : 'text-slate-400'}`}>{tab}</button>
          ))}
          {session ? (
            <button onClick={() => setActiveTab('dashboard')} className="bg-blue-600 px-4 py-1.5 rounded-full font-bold hover:bg-blue-500 shadow-lg text-sm flex items-center gap-2">Dashboard <ArrowRight size={14} /></button>
          ) : (
            <button onClick={() => setActiveTab('dashboard')} className="text-slate-400 flex gap-2 hover:text-white items-center"><Lock size={16} /> Login</button>
          )}
        </nav>
        <button className="md:hidden p-2 text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="md:hidden fixed inset-0 top-[60px] bg-[#020617] z-40 overflow-y-auto pb-20 border-t border-white/10">
            <div className="p-6 flex flex-col gap-4">
              {['home', 'services', 'trust', 'pricing', 'about', 'contact'].map(tab => (
                <button key={tab} onClick={() => { setActiveTab(tab); setIsMobileMenuOpen(false); }} className="text-left text-lg font-medium text-slate-300 capitalize border-b border-white/5 pb-2">{tab}</button>
              ))}
              <div className="mt-4">
                {session ? (
                  <button onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} className="bg-blue-600 w-full py-3 rounded-xl font-bold text-white">Dashboard</button>
                ) : (
                  <button onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} className="bg-white/10 w-full py-3 rounded-xl font-bold text-white">Login</button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-0">
        {activeTab === 'home' && (
          <div className="bg-[#020617] min-h-screen">
            <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden text-center z-10 pt-20">
              <InteractiveHeroBackground />
              <div className="relative z-10 max-w-5xl mx-auto px-4 mt-10">
                <h1 className="text-5xl md:text-8xl font-extrabold mb-8 tracking-tight">Compliance <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Engineered for Truth.</span></h1>
                <div className="text-lg text-slate-300 max-w-2xl mx-auto mb-12 h-auto min-h-[60px]">
                  <TypewriterEffect text=" The interactive standard for data integrity. Cryptographically verifiable audit logs that scale with your enterprise." speed={30} />
                </div>
                <button onClick={() => setActiveTab('dashboard')} className="group bg-blue-600 px-8 py-4 rounded-full text-lg font-bold hover:bg-blue-500 shadow-xl flex items-center gap-3 mx-auto">
                  Get Started <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
            <EuroLedgerDemo />
            <DashboardPreview />
            <UseCases />
            <CoreArchitecture />
          </div>
        )}

        {activeTab === 'about' && <AboutPage />}
        {activeTab === 'services' && <ServicesPage setActiveTab={setActiveTab} />}
        {activeTab === 'contact' && <ContactPage unifiedCookieStatus={unifiedCookieStatus} onUnifiedConsent={handleUnifiedConsent} onOpenPrivacy={() => { setLegalTab('privacy'); setShowPrivacyModal(true); }} />}
        {activeTab === 'trust' && <TrustCenter setActiveTab={setActiveTab} />}
        {activeTab === 'pricing' && <div className="pt-20"><EnterpriseForm unifiedCookieStatus={unifiedCookieStatus} onUnifiedConsent={handleUnifiedConsent} onOpenPrivacy={() => { setLegalTab('privacy'); setShowPrivacyModal(true); }} /></div>}

        {activeTab === 'dashboard' && (
          <div className="min-h-screen bg-slate-50 text-slate-900 pt-24 px-4 pb-20 relative">
            <AnimatePresence>
              {showDashboardConsent && <DashboardCookieConsent onAccept={handleUnifiedConsent} onReadPolicy={() => { setLegalTab('privacy'); setShowPrivacyModal(true); }} />}
            </AnimatePresence>

            {hasJoinToken && <JoinTeamPage session={session} fetchDashboard={fetchDashboard} />}

            {!hasJoinToken && !session && !showDashboardConsent && (
              <AuthScreen onLogin={(newSession) => { setSession(newSession); fetchDashboard(newSession); }} />
            )}

            {!hasJoinToken && session && !showDashboardConsent && processor === null && (
              <div className="text-center pt-20">
                <Loader2 className="animate-spin mx-auto text-blue-600" size={40} />
                <p className="mt-4 text-slate-500">Loading dashboard...</p>
              </div>
            )}

            {!hasJoinToken && session && !showDashboardConsent && processor === false && (
              <CreateProcessor token={session.access_token} onProcessorCreated={handleProcessorCreated} />
            )}

            {!hasJoinToken && session && !showDashboardConsent && processor && processor.id && (
              <div className="max-w-7xl mx-auto">
                <div className="flex gap-2 mb-6 flex-wrap">
                  {['overview', 'team', 'system_audit'].map(tab => (
                    <button key={tab} onClick={() => setDashboardSubTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-bold capitalize ${dashboardSubTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                      {tab.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                {dashboardSubTab === 'overview' && (
                  <Dashboard
                    processor={processor} 
                    stats={stats} 
                    token={session.access_token}
                    eventData={eventData} 
                    setEventData={setEventData} 
                    onLogEvent={handleLogEvent}
                    onKeyUpdate={handleKeyUpdate}
                    recentLogs={recentLogs} 
                    chartData={chartData} 
                    onLogout={handleLogout} 
                    session={session}
                  />
                )}

                {dashboardSubTab === 'team' && <TeamManagement token={session.access_token} processor={processor} userRole={userRole} />}

                {dashboardSubTab === 'system_audit' && (
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"><Shield className="text-purple-600" /> System Audit Logs</h3>
                    {systemAuditLogs.length === 0 ? (
                      <p className="text-slate-500 text-sm">No audit logs available.</p>
                    ) : (
                      <div className="space-y-2">
                        {systemAuditLogs.map((log, i) => (
                          <div key={i} className="p-3 bg-slate-50 rounded-lg text-sm flex justify-between">
                            <span className="text-slate-600">{log.action}</span>
                            <span className="text-slate-400 text-xs font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <CookieConsent unifiedCookieStatus={unifiedCookieStatus} onUnifiedConsent={handleUnifiedConsent} onOpenPrivacy={() => { setLegalTab('privacy'); setShowPrivacyModal(true); }} />
      <Footer setActiveTab={setActiveTab} setShowDocs={setShowDocs} setShowPrivacyModal={setShowPrivacyModal} setLegalTab={setLegalTab} setShowSecurity={setShowSecurity} />
    </div>
  );
}

export default App;