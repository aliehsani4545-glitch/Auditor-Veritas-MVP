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
    CheckCircle2, Zap, ArrowRight, Download, UserPlus, Loader2, Mail, Shield, Trash2, XCircle, QrCode, Users, Link as LinkIcon, BadgeCheck, BookOpen
} from 'lucide-react';

// --- COMPONENTS (Importer antas vara korrekta) ---
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

// --- CONFIGURATION ---
const API_BASE_URL = 'https://auditor-veritas-mvp.onrender.com';
const SUPABASE_URL = 'https://ridpgvikvjreljwypbpj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpZHBndmlrdmpyZWxqd3lwYnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MDU5MDksImV4cCI6MjA3ODk4MTkwOX0.qP9Okdx8uroKpkWjoUNLNC9WcRSPD6S6AV7RasCCPHg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

// --- UNIFIED CONSENT KEY ---
const UNIFIED_CONSENT_KEY = 'unified_cookie_consent_v2'; 

// --- API HELPER ---
export const apiCall = async (endpoint, options = {}, token = null, apiKey = null) => {
    const sanitize = (str) => str ? str.replace(/[^\x00-\x7F]/g, "") : str;
    const headers = { 'Content-Type': 'application/json; charset=utf-8', ...options.headers }; 
    if (token) headers['Authorization'] = `Bearer ${sanitize(token)}`;
    if (apiKey) headers['x-api-key'] = sanitize(apiKey); 
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers, ...options, body: options.body ? JSON.stringify(options.body) : null });
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
    const domain = email.split('@').pop().toLowerCase();
    return domain && !blockedDomains.includes(domain);
};

// --- Dashboard Cookie Consent Component (Dashboard Blockade) ---
const DashboardCookieConsent = ({ onAccept, onReadPolicy }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.9 }} 
            transition={{ type: "spring", stiffness: 100 }}
            className="absolute inset-0 flex items-center justify-center bg-slate-50/95 backdrop-blur-sm p-6 rounded-lg z-50" 
        >
            <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-200 max-w-md text-center text-slate-900">
                <Lock size={32} className="text-red-500 mx-auto mb-3" />
                <h4 className="text-2xl font-bold mb-2">Access Restricted</h4>
                <p className="text-sm text-slate-600 mb-6">
                    The Dashboard requires specific consent for data processing and event logging related to your node administration.
                </p>
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => onAccept('accepted')} 
                        className="bg-blue-600 text-white px-4 py-3 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors shadow-md"
                    >
                        Accept & Access Dashboard
                    </button>
                    <button 
                        onClick={onReadPolicy} 
                        className="bg-slate-100 text-slate-800 px-4 py-3 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors"
                    >
                        Read Privacy Policy
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// --- INTERNAL COMPONENTS (Platsinnehavare) ---

const JoinTeamPage = ({ session, fetchDashboard }) => {
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('Validating invitation...');
    
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');
        if (!session) {
            setStatus('login_required');
            setMessage('Please sign in with the email address that received the invitation.');
        } else if (tokenFromUrl) {
             // Platsinnehavare för handleAcceptInvite
        } else {
            setStatus('error');
            setMessage('No invitation token found.');
        }
    }, [session]);

    // Antar att AuthScreen är definierad/importerad
    // if (status === 'login_required' && !session) return <AuthScreen onLogin={fetchDashboard} />;

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

const TeamManagement = ({ token, processor, userRole }) => { return <div className="text-center p-10 bg-white rounded-xl shadow">Team Management Component (Placeholder)</div>;};
const KeyRotationComponent = ({ token, onKeyUpdate, userRole, onRevoke }) => { return <div className="text-center p-6 bg-white rounded-xl shadow">Key Rotation Component (Placeholder)</div>;};

const AuthScreen = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('login');

    const handleAuth = async (e) => {
        e.preventDefault(); setLoading(true);
        // Logik för autentisering utelämnad
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4 pt-20">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                <h2 className="text-2xl font-bold text-center mb-6 text-slate-900">{mode === 'login' ? 'Secure Login' : 'Register Node'}</h2>
                <form onSubmit={handleAuth} className="space-y-4">
                    <input type="email" required className="w-full p-3 border rounded-lg text-slate-900" placeholder="email@company.com" value={email} onChange={e => setEmail(e.target.value)} />
                    <input type="password" required className="w-full p-3 border rounded-lg text-slate-900" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                    <button disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold">{loading ? <Loader2 className="animate-spin mx-auto"/> : (mode === 'login' ? 'Access' : 'Register')}</button>
                </form>
                <div className="mt-6 text-center"><button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-sm text-slate-500 hover:text-blue-600">{mode === 'login' ? "Register New Node" : "Back to Login"}</button></div>
            </div>
        </div>
    );
};
const CreateProcessor = ({ token, onProcessorCreated }) => { return <div className="text-center p-8 bg-white rounded-xl shadow mt-20">Create Processor Component (Placeholder)</div>;};


// --- MAIN APP ---
function App() {
    // Initial Privacy Blocker (blocks whole app)
    const [privacyAccepted, setPrivacyAccepted] = useState(localStorage.getItem('el_privacy_v1') === 'true'); 
    
    // NYCKEL: Globalt samtyckesstatus för alla interaktiva element/cookies
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
            const key = newProcessorData.api_key_raw;
            setActiveApiKey(key);
            localStorage.setItem('av_active_key', key);
            localStorage.setItem('av_sim_key', key);
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
            // Placeholder för API-anrop
        } catch (e) { setSystemAuditLogs([]); }
    }, [session]);

    const fetchDashboard = useCallback(async () => {
        if (!session?.access_token) return;
        try {
            // Placeholder för API-anrop
            if (hasJoinToken) setActiveTab('dashboard');
        } catch (e) { 
            // setProcessor(false); // Simulera fel
        }
    }, [session, hasJoinToken]);

    useEffect(() => { 
        if (hasJoinToken) {
            setActiveTab('dashboard');
        } else if (activeTab === 'dashboard' && session) {
            // Kontrollera att samtycke finns innan hämtning av data
            if (unifiedCookieStatus === 'accepted' || unifiedCookieStatus === 'declined') {
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
        if(e) e.preventDefault();
        if (userRole === 'reader') return alert("Access Denied: Readers cannot log events.");
        try {
            const payloadData = dataFromForm || eventData;
            const keyToUse = activeApiKey || processor?.api_key_raw || localStorage.getItem('av_sim_key');
            if (!keyToUse) throw new Error("No Active API Key found.");
            
            // Logik för API-anropet...
            
            fetchDashboard();
            alert("Event Logged Successfully!");
        } catch (err) { alert(`Log Failed: ${err.message}`); }
    };
    
    // --- UNIFIED CONSENT HANDLER ---
    const handleUnifiedConsent = (status) => {
        // 1. Sätt den enhetliga nyckeln
        localStorage.setItem(UNIFIED_CONSENT_KEY, status);
        setUnifiedCookieStatus(status);
        
        // 2. Tvinga bort alla gamla/separata nycklar (för att säkerställa att banners försvinner)
        // Detta säkerställer att banners i Pricing/Contact/Dashboard döljs oavsett var samtycket gavs.
        localStorage.setItem('cookie_consent', status === 'accepted' ? 'granted' : 'denied');
        localStorage.removeItem('enterprise_cookie_consent');
        localStorage.removeItem('contact_cookie_consent');
        localStorage.removeItem('dashboard_cookie_consent');

        if (status === 'accepted') {
            fetchDashboard();
        }
    };
    
    // Kontrollera om PrivacyPage (initial blockering) visas
    if (!privacyAccepted) return <PrivacyPage onAccept={() => { localStorage.setItem('el_privacy_v1', 'true'); setPrivacyAccepted(true); }} onClose={() => {}} />; 

    // Status för att visa/dölja Dashboard-blockeraren
    const showDashboardConsent = activeTab === 'dashboard' && session && unifiedCookieStatus === null;
    
    // Status för att blockera innehållet (Dashboard, Pricing, Contact)
    const contentBlocked = unifiedCookieStatus !== 'accepted';

    return (
        <div className="min-h-screen font-sans bg-[#020617] text-white">
             <AnimatePresence>
                {showDocs && <DocsModal onClose={() => setShowDocs(false)} />}
                {/* PrivacyPage som Modal när länkar klickas */}
                {showPrivacyModal && (<PrivacyPage isFooterView={true} onClose={() => setShowPrivacyModal(false)} initialTab={legalTab} />)}
                {showSecurity && <SecurityPage onClose={() => setShowSecurity(false)} />}
            </AnimatePresence>

             {/* HEADER */}
             <header className="fixed w-full z-50 bg-[#020617]/90 border-b border-white/10 py-2 px-6 flex justify-between items-center backdrop-blur-md">
                <div className="font-bold text-lg flex gap-2 cursor-pointer items-center hover:text-blue-400 transition-colors" onClick={()=>setActiveTab('home')}>
                    <ShieldCheck className="text-blue-500"/> EuroLedger
                </div>
                <nav className="hidden md:flex gap-8 text-sm items-center font-medium">
                    {['home', 'services', 'trust', 'pricing', 'about', 'contact'].map(tab => (
                        <button key={tab} onClick={()=>setActiveTab(tab)} className={`capitalize transition-all relative hover:text-white ${activeTab===tab ? 'text-white after:content-[""] after:absolute after:-bottom-4 after:left-0 after:w-full after:h-0.5 after:bg-blue-500' : 'text-slate-400'}`}>{tab}</button>
                    ))}
                    {session ? <button onClick={()=>setActiveTab('dashboard')} className="bg-blue-600 px-4 py-1.5 rounded-full font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 text-sm flex items-center gap-2">Dashboard <ArrowRight size={14}/></button> : <button onClick={()=>setActiveTab('dashboard')} className="text-slate-400 flex gap-2 hover:text-white items-center transition-colors"><Lock size={16}/> Login</button>}
                </nav>
                <button className="md:hidden p-2 text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
            </header>
            
            {/* MOBILE MENU */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="md:hidden fixed inset-0 top-[60px] bg-[#020617] z-40 overflow-y-auto pb-20 border-t border-white/10">
                        <div className="p-6 flex flex-col gap-4">
                            {['home', 'services', 'trust', 'pricing', 'about', 'contact'].map(tab => (
                                <button key={tab} onClick={() => { setActiveTab(tab); setIsMobileMenuOpen(false); setIsMobileMenuOpen(false);}} className="text-left text-lg font-medium text-slate-300 capitalize border-b border-white/5 pb-2">{tab}</button>
                            ))}
                            <div className="mt-4">
                                {session ? <button onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} className="bg-blue-600 w-full py-3 rounded-xl font-bold text-white">Go to Dashboard</button> : <button onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} className="bg-white/10 w-full py-3 rounded-xl font-bold text-white">Login</button>}
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
                                <h1 className="text-5xl md:text-8xl font-extrabold mb-8 tracking-tight">Compliance <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Engineered for Truth.</span></h1>
                                <div className="text-lg text-slate-300 max-w-2xl mx-auto mb-12 h-auto min-h-[60px]"> 
                                    <TypewriterEffect text=" The interactive standard for data integrity. Cryptographically verifiable audit logs that scale with your enterprise infrastructure." speed={30}/>
                                </div>
                                <button onClick={()=>setActiveTab('dashboard')} className="group bg-blue-600 px-8 py-4 rounded-full text-lg font-bold hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/30 flex items-center gap-3 mx-auto">Get Started <ArrowRight className="group-hover:translate-x-1 transition-transform"/></button>
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
                {activeTab === 'contact' && <ContactPage unifiedCookieStatus={unifiedCookieStatus} onUnifiedConsent={handleUnifiedConsent} onOpenPrivacy={()=>{setLegalTab('privacy'); setShowPrivacyModal(true);}} />} 
                {activeTab === 'trust' && <TrustCenter setActiveTab={setActiveTab} />} 
                
                {activeTab === 'pricing' && (<div className="pt-20"><EnterpriseForm unifiedCookieStatus={unifiedCookieStatus} onUnifiedConsent={handleUnifiedConsent} onOpenPrivacy={()=>{setLegalTab('privacy'); setShowPrivacyModal(true);}} /></div>)} 

                {activeTab === 'dashboard' && (
                    <div className="min-h-screen bg-slate-50 text-slate-900 pt-24 px-4 pb-20 relative">
                        
                        {/* 1. Dashboard Cookie Consent Blockade */}
                        <AnimatePresence>
                            {showDashboardConsent && (
                                <DashboardCookieConsent 
                                    onAccept={handleUnifiedConsent} // Använd Unified Handler
                                    onReadPolicy={() => {
                                        setLegalTab('privacy');
                                        setShowPrivacyModal(true);
                                    }}
                                />
                            )}
                        </AnimatePresence>
                        
                        {/* 2. Content Rendering - Blurred or Blocked */}
                        <motion.div
                            initial={{ filter: 'none' }}
                            animate={{ filter: contentBlocked && session ? 'blur(5px) grayscale(100%)' : 'none' }} // Använd unified status
                            transition={{ duration: 0.3 }}
                            className="h-full"
                            // Förhindra klick när blockerad
                            style={{ pointerEvents: contentBlocked && session ? 'none' : 'auto' }}
                        >

                            {hasJoinToken && session ? (
                                <JoinTeamPage session={session} fetchDashboard={fetchDashboard} />
                            ) : !session ? (
                                <AuthScreen onLogin={fetchDashboard} /> 
                            ) : !processor && processor !== false ? (
                                <div className="text-center py-40"><RefreshCw className="animate-spin mx-auto w-8 h-8 text-blue-500" /><p className="text-slate-500 mt-4">Connecting to secure node...</p></div>
                            ) : processor === false ? (
                                <CreateProcessor token={session?.access_token} onProcessorCreated={handleProcessorCreated} /> 
                            ) : (
                                <div className="max-w-7xl mx-auto">
                                    <div className="flex gap-6 mb-8 border-b border-slate-200 pb-1">
                                        <button onClick={() => setDashboardSubTab('overview')} className={`pb-3 font-bold text-sm flex items-center gap-2 transition-colors ${dashboardSubTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}><LayoutGrid size={18}/> Overview</button>
                                        <button onClick={() => setDashboardSubTab('team')} className={`pb-3 font-bold text-sm flex items-center gap-2 transition-colors ${dashboardSubTab === 'team' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}><Users size={18}/> Team & Roles</button>
                                        <button onClick={() => setDashboardSubTab('system_audit')} className={`pb-3 font-bold text-sm flex items-center gap-2 transition-colors ${dashboardSubTab === 'system_audit' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}><BookOpen size={18}/> System Audit</button>
                                    </div>

                                    {dashboardSubTab === 'overview' && (
                                        <Dashboard 
                                            processor={processor} stats={stats} token={session?.access_token} recentLogs={recentLogs} onLogout={handleLogout}
                                            KeyRotation={
                                                <KeyRotationComponent 
                                                    token={session?.access_token} 
                                                    onKeyUpdate={handleKeyUpdate} 
                                                    userRole={userRole} 
                                                    onRevoke={handleLogout} 
                                                />
                                            } 
                                            eventData={eventData} setEventData={setEventData} onLogEvent={handleLogEvent} chartData={chartData}
                                        />
                                    )}

                                    {dashboardSubTab === 'team' && (
                                        <TeamManagement token={session?.access_token} processor={processor} userRole={userRole} />
                                    )}
                                    
                                    {dashboardSubTab === 'system_audit' && (
                                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"><BookOpen className="text-blue-600"/> Access & System Logs</h3>
                                            <p className="text-sm text-slate-500 mb-6">Audit of the Audit: Trace all access to this node.</p>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-xs">
                                                    <thead className="bg-slate-50 text-slate-500 border-b"><tr><th className="py-2 px-3">Timestamp</th><th className="py-2 px-3">User</th><th className="py-2 px-3">Action</th></tr></thead>
                                                    <tbody>
                                                        {systemAuditLogs.length > 0 ? systemAuditLogs.map((log, i) => (
                                                            <tr key={i} className="border-b border-slate-50">
                                                                <td className="py-2 px-3 font-mono text-[10px]">{log.timestamp?.substring(11, 19)}</td>
                                                                <td className="py-2 px-3 font-medium">{log.user}</td>
                                                                <td className="py-2 px-3 text-slate-700">{log.action}</td>
                                                            </tr>
                                                        )) : <tr><td colSpan="3" className="text-center py-6 text-slate-400 italic">No logs.</td></tr>}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                        
                        {/* Visa "Decline" varning om Dashboard är blockerat */}
                        {activeTab === 'dashboard' && session && unifiedCookieStatus === 'declined' && (
                             <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute bottom-5 left-1/2 -translate-x-1/2 p-3 bg-red-500/90 text-white rounded-lg shadow-xl text-center z-40 text-sm">
                                <AlertTriangle size={16} className="inline mr-2"/> Access to the Dashboard is blocked because data processing consent was declined.
                             </motion.div>
                        )}
                        
                    </div>
                )}
            </main>
            <Footer onOpenPrivacy={()=>{setLegalTab('privacy'); setShowPrivacyModal(true);}} onOpenTerms={()=>{setLegalTab('terms'); setShowPrivacyModal(true);}} onOpenSecurity={() => setShowSecurity(true)} onOpenDocs={() => setShowDocs(true)} onNavigate={setActiveTab} />
            {/* Skickar med unified handler till den globala bannern */}
            <CookieConsent unifiedCookieStatus={unifiedCookieStatus} onUnifiedConsent={handleUnifiedConsent} onOpenPrivacy={()=>{setLegalTab('privacy'); setShowPrivacyModal(true);}} />
        </div>
    );
}

export default App;