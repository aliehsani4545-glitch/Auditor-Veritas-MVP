import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';
import { AnimatePresence, motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    ShieldCheck, RotateCw, RefreshCw, Eye, Copy, AlertTriangle,
    Menu, X, Sparkles, Server, Cookie, Lock, LogOut, User, LayoutGrid,
    CheckCircle2, Zap, ArrowRight, Download, UserPlus, Loader2, Mail, Shield, Trash2, XCircle, QrCode
} from 'lucide-react';

// --- COMPONENTS ---
// Importerade komponenter
import InteractiveFeatureSection from './components/InteractiveFeatureSection';
import DashboardPreview from './components/DashboardPreview';
import CoreArchitecture from './components/CoreArchitecture';
import IntegrityEngine from './components/IntegrityEngine';
import UseCases from './components/UseCases';
import InteractiveHeroBackground from './components/InteractiveHeroBackground';
import TypewriterEffect from './components/TypewriterEffect';
import PrivacyPage from './components/PrivacyPage';
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
import StripePhoneDemo from './components/StripePhoneDemo'; // <--- NY

// --- CONFIG ---
const API_BASE_URL = 'https://auditor-veritas-mvp.onrender.com';
const SUPABASE_URL = 'https://ridpgvikvjreljwypbpj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpZHBndmlrdmpyZWxqd3lwYnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MDU5MDksImV4cCI6MjA3ODk4MTkwOX0.qP9Okdx8uroKpkWjoUNLNC9WcRSPD6S6AV7RasCCPHg';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

// --- HELPERS ---
const isCorporateEmail = (email) => {
    const blockedDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com'];
    const domain = email.split('@').pop().toLowerCase();
    return domain && !blockedDomains.includes(domain);
};

// FIX: Robust API Call
export const apiCall = async (endpoint, options = {}, token = null, apiKey = null) => {
    const headers = { 'Content-Type': 'application/json; charset=utf-8', ...options.headers }; 
    const sanitize = (str) => str ? str.replace(/[^\x00-\x7F]/g, "") : str; 
    if (token) headers['Authorization'] = `Bearer ${sanitize(token)}`;
    if (apiKey) headers['x-api-key'] = sanitize(apiKey); 
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers, ...options, body: options.body ? JSON.stringify(options.body) : null });
        
        if (response.status === 204) return null;
        
        const text = await response.text();
        let data;
        
        // Försök parsa JSON, men hantera om servern returnerar HTML (t.ex. vid 502/504)
        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            console.warn("Non-JSON response:", text.substring(0, 100));
            throw new Error(`Server connection error (${response.status}). Please try again.`);
        }

        if (!response.ok) throw new Error(data.error || `Server Error: ${response.status}`);
        return data;
    } catch (e) {
        throw new Error(e.message || "Connection failed. Check backend.");
    }
};

// --- ENTERPRISE PRICING (NO PRICES) ---
const PricingPageSafe = ({ setActiveTab }) => (
    <div className="min-h-screen pt-24 px-4 bg-[#020617] text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-[128px] pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Enterprise Agreements</h1>
            <p className="text-slate-400 mb-12 text-lg">
                Auditor Veritas operates exclusively via Master Services Agreement (MSA). <br/>
                We offer bespoke infrastructure with strict EU sovereignty.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                {/* SME OPTION */}
                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors text-left flex flex-col">
                    <h3 className="text-2xl font-bold text-white mb-2">Standard Audit Node</h3>
                    <p className="text-slate-400 mb-6 text-sm">For SMEs requiring GDPR Article 30/32 compliance.</p>
                    <ul className="space-y-3 text-slate-300 mb-8 text-sm flex-1">
                        <li className="flex gap-2"><CheckCircle2 size={16} className="text-blue-500"/> EU-Hosted Infrastructure</li>
                        <li className="flex gap-2"><CheckCircle2 size={16} className="text-blue-500"/> 90-Day Retention</li>
                        <li className="flex gap-2"><CheckCircle2 size={16} className="text-blue-500"/> Standard Merkle Proofs</li>
                    </ul>
                    <button onClick={() => setActiveTab('contact')} className="w-full py-4 rounded-xl bg-white/10 text-white font-bold hover:bg-white hover:text-black transition-all">Request Quote</button>
                </div>

                {/* ENTERPRISE OPTION */}
                <div className="bg-gradient-to-b from-blue-900/40 to-slate-900 border border-blue-500/30 p-8 rounded-3xl relative overflow-hidden text-left flex flex-col">
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">Enterprise</div>
                    <h3 className="text-2xl font-bold text-white mb-2">Dedicated Processor</h3>
                    <p className="text-blue-200 mb-6 text-sm">For large-scale infrastructure & banking.</p>
                    <ul className="space-y-3 text-slate-300 mb-8 text-sm flex-1">
                        <li className="flex gap-2"><CheckCircle2 size={16} className="text-blue-400"/> Dedicated HSM Keys</li>
                        <li className="flex gap-2"><CheckCircle2 size={16} className="text-blue-400"/> 7-Year Legal Hold</li>
                        <li className="flex gap-2"><CheckCircle2 size={16} className="text-blue-400"/> 24/7 DPO Support</li>
                    </ul>
                    <button onClick={() => setActiveTab('contact')} className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 hover:shadow-lg transition-all">Contact Sales</button>
                </div>
            </div>
        </div>
    </div>
);

// --- AUTH COMPONENT ---
const AuthScreen = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('login');

    const handleAuth = async (e) => {
        e.preventDefault(); setLoading(true);
        const cleanEmail = email.trim();
        try {
            if (mode === 'signup') {
                if (!isCorporateEmail(cleanEmail)) throw new Error("Corporate email required.");
                const { error } = await supabase.auth.signUp({ email: cleanEmail, password });
                if (error) throw error;
                alert("Confirmation email sent. Please verify.");
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password }); 
                if (error) throw error;
                onLogin(data.session);
            }
        } catch (error) { alert(error.message); } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4 pt-20">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                <h2 className="text-2xl font-bold text-center mb-6 text-slate-900">{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
                <form onSubmit={handleAuth} className="space-y-4">
                    <input type="email" required className="w-full p-3 border rounded-lg text-slate-900" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                    <input type="password" required className="w-full p-3 border rounded-lg text-slate-900" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                    <button disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold">{loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Sign Up'}</button>
                </form>
                <div className="mt-4 text-center"><button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-sm text-blue-600">Switch to {mode === 'login' ? 'Sign Up' : 'Sign In'}</button></div>
            </div>
        </div>
    );
};

const CreateProcessor = ({ token, onProcessorCreated }) => {
    const [companyName, setCompanyName] = useState('');
    const [loading, setLoading] = useState(false);
    const [apiKey, setApiKey] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            const data = await apiCall('/api/processors', { method: 'POST', body: { companyName } }, token);
            setApiKey(data.apiKey);
        } catch (err) { alert(err.message); setLoading(false); }
    };

    if (apiKey) return (
        <div className="text-center p-10 bg-white shadow-xl rounded-2xl max-w-lg mx-auto mt-20">
            <h3 className="text-xl font-bold text-green-600 mb-4">Success!</h3>
            <div className="bg-slate-100 p-4 rounded break-all mb-4 text-slate-800 font-mono">{apiKey}</div>
            <button onClick={() => { setTimeout(onProcessorCreated, 1000); }} className="bg-blue-600 text-white py-2 px-4 rounded-full font-bold">Go to Dashboard</button>
        </div>
    );

    return (
        <div className="max-w-xl mx-auto p-8 bg-white rounded-3xl shadow-2xl mt-20">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">Create Processor Node</h2>
            <form onSubmit={handleSubmit}><input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="w-full p-3 border rounded-xl mb-4 text-slate-900" placeholder="Company Name" /><button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold">{loading ? 'Creating...' : 'Create'}</button></form>
        </div>
    );
};

// --- MAIN APP ---
function App() {
    const [privacyAccepted, setPrivacyAccepted] = useState(false); 
    const [session, setSession] = useState(null);
    const [processor, setProcessor] = useState(null);
    const [activeTab, setActiveTab] = useState('home');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showSecurity, setShowSecurity] = useState(false);
    const [showDocs, setShowDocs] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [legalTab, setLegalTab] = useState('privacy');
    
    // Dashboard Data
    const [stats, setStats] = useState({ totalEvents: 0, monthlyEvents: 0 });
    const [recentLogs, setRecentLogs] = useState([]);
    const [userRole, setUserRole] = useState(null);
    const [chartData, setChartData] = useState([]); 

    const isJoin = new URLSearchParams(window.location.search).has('token');

    useEffect(() => {
        const savedPrivacy = localStorage.getItem('av_privacy_v1');
        if (savedPrivacy === 'true') setPrivacyAccepted(true);
        supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
        return () => subscription.unsubscribe();
    }, []);

    const fetchDashboard = useCallback(async () => {
        if (!session?.access_token) return;
        try {
            const data = await apiCall('/api/dashboard', { method: 'GET' }, session.access_token);
            setProcessor(data.processor);
            setStats(data.stats);
            setUserRole(data.userRole);
            
            // Fetch logs for table
            const logsData = await apiCall('/api/events/search?limit=10', { method: 'GET' }, session.access_token);
            setRecentLogs(logsData.events || []);
            
            // Simple visualizer for chart (real data requires time-series endpoint)
            if (data.stats.totalEvents > 0) {
                 setChartData([...Array(10)].map(() => Math.floor(Math.random() * 20) + 1));
            } else {
                 setChartData([0,0,0,0,0]);
            }

            if (isJoin) setActiveTab('dashboard');
        } catch (e) { 
            console.error("Dashboard Load Error:", e);
            // Om 404, betyder det att användaren inte har en processor -> Visa Create UI
            if(e.message.includes('404')) {
                setProcessor(false); 
            }
        }
    }, [session, isJoin]);

    useEffect(() => { 
        if (activeTab === 'dashboard' || isJoin) fetchDashboard(); 
        if (isJoin && !session) setActiveTab('dashboard'); 
    }, [activeTab, session, isJoin]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setSession(null); setProcessor(null); setActiveTab('home');
    };
    
    // Simple event injector for the dashboard
    const handleLogEvent = async (e, eventData) => {
        e?.preventDefault();
        try {
            await apiCall('/api/events', { 
                method: 'POST', 
                headers: { 'x-api-key': processor.api_key_raw }, 
                body: { ...eventData, user_identifier: 'demo-user' }
            }, session.access_token);
            fetchDashboard(); // Refresh
        } catch (err) {
            console.error("Log failed", err);
        }
    };

    if (!privacyAccepted) return <PrivacyPage onAccept={() => { localStorage.setItem('av_privacy_v1', 'true'); setPrivacyAccepted(true); }} />;

    return (
        <div className="min-h-screen font-sans bg-[#020617] text-white">
             <AnimatePresence>
                {showSecurity && <SecurityPage onClose={() => setShowSecurity(false)} />}
                {showDocs && <DocsModal onClose={() => setShowDocs(false)} />}
                {showPrivacyModal && (<PrivacyPage isFooterView={true} onClose={() => setShowPrivacyModal(false)} initialTab={legalTab} />)}
            </AnimatePresence>

             {/* HEADER */}
             <header className="fixed w-full z-50 bg-[#020617]/90 border-b border-white/5 p-4 flex justify-between items-center backdrop-blur-md">
                <div className="font-bold text-lg flex gap-2 cursor-pointer items-center" onClick={()=>setActiveTab('home')}>
                    <ShieldCheck className="text-blue-500"/> Auditor Veritas
                </div>
                
                {/* Desktop Nav */}
                <nav className="hidden md:flex gap-6 text-sm items-center">
                    {['home', 'services', 'trust', 'pricing', 'about', 'contact'].map(tab => (
                        <button key={tab} onClick={()=>setActiveTab(tab)} className={`capitalize transition-colors ${activeTab===tab?'text-white font-bold':'text-slate-400 hover:text-white'}`}>
                            {tab}
                        </button>
                    ))}
                    {session ? 
                        <button onClick={()=>setActiveTab('dashboard')} className="bg-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-500 transition-colors">Dashboard</button> : 
                        <button onClick={()=>setActiveTab('dashboard')} className="text-slate-400 flex gap-2 hover:text-white"><Lock size={16}/> Login</button>
                    }
                </nav>
                
                <button className="md:hidden p-2 text-slate-400" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>
            
            {/* MOBILE MENU FULL OVERLAY */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -20 }} 
                        className="md:hidden fixed inset-0 top-[60px] bg-[#020617] z-40 overflow-y-auto pb-20"
                    >
                        <div className="p-6 flex flex-col gap-6">
                            {['home', 'services', 'trust', 'pricing', 'about', 'contact'].map(tab => (
                                <button key={tab} onClick={() => { setActiveTab(tab); setIsMobileMenuOpen(false); }} className="text-left text-xl font-medium text-slate-300 capitalize border-b border-white/5 pb-4">
                                    {tab}
                                </button>
                            ))}
                            <div className="mt-4">
                                {session ? (
                                    <button onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} className="bg-blue-600 w-full py-4 rounded-xl font-bold text-lg">Go to Dashboard</button>
                                ) : (
                                    <button onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} className="bg-white/10 w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"><Lock size={20}/> Login</button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="pt-0">
                {activeTab === 'home' && (
                    <div className="bg-[#020617] min-h-screen">
                        {/* HERO */}
                        <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden text-center z-10 pt-20">
                            <InteractiveHeroBackground />
                            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />
                            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none" />
                            <div className="relative z-10 max-w-5xl mx-auto px-4 mt-10">
                                <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-5xl md:text-8xl font-extrabold mb-8">Compliance <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400">Engineered for Truth.</span></motion.h1>
                                <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10"><TypewriterEffect text=" The interactive standard for data integrity. Cryptographically verifiable audit logs that scale with your enterprise infrastructure." speed={30}/></p>
                                <button onClick={()=>setActiveTab('dashboard')} className="bg-blue-600 px-8 py-4 rounded-full text-lg font-bold hover:scale-105 transition-transform">Get Started</button>
                            </div>
                        </div>
                        
                        {/* NY: STRIPE PHONE DEMO - Nu med sticky scroll */}
                        <StripePhoneDemo />

                        <DashboardPreview />
                        <UseCases />
                        <CoreArchitecture />
                    </div>
                )}

                {activeTab === 'about' && <AboutPage />} 
                {activeTab === 'services' && <ServicesPage setActiveTab={setActiveTab} />} 
                {activeTab === 'contact' && <ContactPage />} 
                {activeTab === 'trust' && <TrustCenter setActiveTab={setActiveTab} />} 
                {activeTab === 'pricing' && <PricingPageSafe setActiveTab={setActiveTab} />}

                {activeTab === 'dashboard' && (
                    <div className="min-h-screen bg-slate-50 text-slate-900 pt-24 px-4">
                        {!session ? <AuthScreen onLogin={fetchDashboard} /> :
                         // LÄGE 1: Laddar fortfarande data
                         !processor && processor !== false ? (
                            <div className="text-center py-40">
                                <RefreshCw className="animate-spin mx-auto w-8 h-8 text-blue-500" />
                                <p className="text-slate-500 mt-4">Connecting to secure node...</p>
                            </div>
                         ) :
                         // LÄGE 2: Ingen processor hittades -> Skapa ny (404 från backend)
                         processor === false ? (
                            <CreateProcessor token={session.access_token} onProcessorCreated={fetchDashboard} /> 
                         ) : (
                            // LÄGE 3: Visa Dashboard
                            <Dashboard 
                                processor={processor} 
                                stats={stats} 
                                token={session.access_token} 
                                recentLogs={recentLogs} 
                                onLogout={handleLogout}
                                KeyRotation={null} 
                                eventData={{}} setEventData={()=>{}} onLogEvent={handleLogEvent} chartData={chartData}
                            />
                        )}
                    </div>
                )}
            </main>
            <Footer onOpenPrivacy={()=>{setLegalTab('privacy'); setShowPrivacyModal(true);}} onOpenTerms={()=>{setLegalTab('terms'); setShowPrivacyModal(true);}} onOpenSecurity={() => setShowSecurity(true)} onOpenDocs={() => setShowDocs(true)} onNavigate={setActiveTab} />
        </div>
    );
}

export default App;