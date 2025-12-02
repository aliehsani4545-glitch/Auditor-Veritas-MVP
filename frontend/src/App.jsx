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
    CheckCircle2, Zap, ArrowRight, Download, UserPlus, Loader2, Mail, Shield, Trash2, XCircle, QrCode
} from 'lucide-react';

// --- IMPORTS ---
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

export const apiCall = async (endpoint, options = {}, token = null, apiKey = null) => {
    const headers = { 'Content-Type': 'application/json; charset=utf-8', ...options.headers }; 
    const sanitize = (str) => str ? str.replace(/[^\x00-\x7F]/g, "") : str; 
    if (token) headers['Authorization'] = `Bearer ${sanitize(token)}`;
    if (apiKey) headers['x-api-key'] = sanitize(apiKey); 
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers, ...options, body: options.body ? JSON.stringify(options.body) : null });
    if (response.status === 204) return null;
    const text = await response.text();
    
    try { 
        const data = JSON.parse(text);
        if (!response.ok) throw new Error(data.error || data.message || `HTTP ${response.status}`);
        return data;
    } catch (e) {
        throw new Error(e.message || `Server Error: ${text.substring(0,50)}`);
    }
};

// --- COMPONENTS ---
const AuthScreen = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('login');

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        const cleanEmail = email.trim();
        try {
            if (mode === 'signup') {
                if (!isCorporateEmail(cleanEmail)) throw new Error("Corporate email required.");
                const { error } = await supabase.auth.signUp({ email: cleanEmail, password });
                if (error) throw error;
                alert("Success! Check email.");
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
                <h2 className="text-2xl font-bold text-center mb-6">{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
                <form onSubmit={handleAuth} className="space-y-4">
                    <input type="email" required className="w-full p-3 border rounded-lg" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                    <input type="password" required className="w-full p-3 border rounded-lg" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
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
            const data = await apiCall('/api/processors', { method: 'POST', body: { companyName, plan: 'starter' } }, token);
            setApiKey(data.apiKey);
        } catch (err) { alert(err.message); setLoading(false); }
    };

    if (apiKey) return (
        <div className="text-center p-10 bg-white shadow-xl rounded-2xl max-w-lg mx-auto mt-20">
            <h3 className="text-xl font-bold text-green-600 mb-4">Success!</h3>
            <div className="bg-slate-100 p-4 rounded break-all mb-4">{apiKey}</div>
            <button onClick={() => { setTimeout(onProcessorCreated, 1000); }} className="bg-blue-600 text-white py-2 px-4 rounded-full font-bold">Go to Dashboard</button>
        </div>
    );

    return (
        <div className="max-w-xl mx-auto p-8 bg-white rounded-3xl shadow-2xl mt-20">
            <h2 className="text-2xl font-bold mb-6">Create Processor Node</h2>
            <form onSubmit={handleSubmit}><input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="w-full p-3 border rounded-xl mb-4" placeholder="Company Name" /><button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold">{loading ? 'Creating...' : 'Create'}</button></form>
        </div>
    );
};

const TOTPSetup = ({ token, onSuccess }) => {
    const [qr, setQr] = useState(null);
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('init');

    useEffect(() => { if(step==='init') { 
        apiCall('/api/keys/totp/setup', {method:'POST'}, token).then(d => { setQr(d.qrCodeDataUrl); setStep('verify'); });
    }}, [step, token]);

    const handleEnable = async (e) => {
        e.preventDefault(); setLoading(true);
        try { await apiCall('/api/keys/totp/enable', { method: 'POST', body: { code } }, token); onSuccess(); } 
        catch (e) { alert(e.message); setLoading(false); }
    };

    if(step === 'init') return <div className="p-8 text-center">Loading Setup...</div>;

    return (
        <div className="bg-white p-6 rounded-xl shadow border">
            <h3 className="font-bold text-lg mb-2">Setup 2FA</h3>
            <p className="text-sm text-slate-500 mb-4">Scan with Google Authenticator</p>
            {qr && <img src={qr} alt="QR" className="mx-auto mb-4 w-48 border"/>}
            <form onSubmit={handleEnable}>
                <input type="text" value={code} onChange={e=>setCode(e.target.value)} maxLength={6} className="w-full p-2 border rounded text-center text-lg tracking-widest mb-4" placeholder="123456" />
                <button disabled={loading} className="w-full bg-green-600 text-white p-2 rounded font-bold">Verify & Enable</button>
            </form>
        </div>
    );
};

const KeyRotationComponent = ({ processor, token, onKeyUpdate, onRevoke, onRefreshDashboard }) => {
    const [mode, setMode] = useState('view'); // view, setup, verify, success
    const [keyData, setKeyData] = useState(null);
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const checkStatus = useCallback(async () => {
        try {
            const res = await apiCall('/api/keys/request-rotation', {method:'POST'}, token);
            if(res.totpEnabled) setMode('view');
        } catch(e) { if(e.message.includes('not enabled')) setMode('setup'); }
    }, [token]);

    useEffect(() => { checkStatus(); }, [checkStatus]);

    const handleRotate = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            const res = await apiCall('/api/keys/rotate', {method:'POST', body:{code}}, token);
            setKeyData(res.newApiKey);
            setMode('success');
            onKeyUpdate(res.newApiKey);
        } catch(e) { alert(e.message); } finally { setLoading(false); }
    };

    if(mode === 'setup') return <TOTPSetup token={token} onSuccess={() => setMode('view')} />;
    
    if(mode === 'success') return (
        <div className="bg-green-50 p-6 rounded-xl border border-green-200 text-center">
            <CheckCircle2 className="mx-auto text-green-600 mb-2" size={32}/>
            <h3 className="font-bold text-green-800">Key Rotated!</h3>
            <code className="block my-4 p-3 bg-white rounded border border-green-200 font-mono break-all">{keyData}</code>
            <button onClick={() => { setMode('view'); onRefreshDashboard(); }} className="text-sm text-green-700 underline">Close</button>
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold flex gap-2 text-slate-800"><RotateCw size={20} className="text-purple-600"/> API Key Management</h3>
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded font-bold">Active</span>
            </div>
            {mode === 'view' ? (
                <button onClick={() => setMode('verify')} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold w-full">Rotate Key (2FA)</button>
            ) : (
                <form onSubmit={handleRotate} className="space-y-3">
                    <input type="text" value={code} onChange={e=>setCode(e.target.value)} maxLength={6} placeholder="Enter 6-digit 2FA Code" className="w-full p-2 border rounded text-center" autoFocus/>
                    <div className="flex gap-2">
                        <button type="submit" disabled={loading} className="flex-1 bg-red-600 text-white p-2 rounded font-bold">{loading ? '...' : 'Confirm Rotation'}</button>
                        <button type="button" onClick={() => setMode('view')} className="px-3 text-slate-500">Cancel</button>
                    </div>
                </form>
            )}
        </div>
    );
};

const TeamManagement = ({ token, processor, userRole }) => {
    const [team, setTeam] = useState([]);
    const [pending, setPending] = useState([]);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('reader');
    const [msg, setMsg] = useState(null);
    
    const isManager = ['owner','admin','manager'].includes(userRole);

    const fetchData = async () => {
        const d = await apiCall('/api/team', {method:'GET'}, token);
        setTeam(d.team || []); setPending(d.pending || []);
    };
    useEffect(() => { fetchData(); }, [token]);

    const invite = async (e) => {
        e.preventDefault();
        try {
            const res = await apiCall('/api/team/invite', { method:'POST', body: { email, role } }, token);
            setMsg({ type: 'success', text: res.inviteLink, isLink: true });
            setEmail(''); fetchData();
        } catch(e) { setMsg({ type: 'error', text: e.message }); }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow border border-slate-100">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><User/> Team</h2>
            {isManager && (
                <div className="mb-8 p-4 bg-slate-50 rounded-xl">
                    <h4 className="text-xs font-bold uppercase text-slate-500 mb-3">Invite User</h4>
                    <form onSubmit={invite} className="flex gap-2">
                        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="flex-1 p-2 border rounded" required/>
                        <select value={role} onChange={e=>setRole(e.target.value)} className="p-2 border rounded bg-white">
                            <option value="reader">Reader</option>
                            <option value="editor">Editor</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Co-Admin</option>
                        </select>
                        <button className="bg-blue-600 text-white px-4 rounded font-bold">Create Link</button>
                    </form>
                    {msg && <div className={`mt-3 p-3 rounded text-sm ${msg.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-800'}`}>
                        {msg.isLink ? (
                            <div>
                                <strong>Invitation Link Created:</strong><br/>
                                <code className="block mt-1 p-1 bg-white border select-all break-all">{msg.text}</code>
                                <span className="text-xs opacity-75">Copy and send this manually.</span>
                            </div>
                        ) : msg.text}
                    </div>}
                </div>
            )}
            <div className="space-y-2">
                {team.map(m => (
                    <div key={m.email} className="flex justify-between items-center p-3 border-b">
                        <div><div className="font-medium">{m.email}</div><div className="text-xs text-slate-500 uppercase">{m.role}</div></div>
                        <div className="text-green-600 text-sm font-bold">Active</div>
                    </div>
                ))}
                {pending.map(p => (
                    <div key={p.email} className="flex justify-between items-center p-3 border-b bg-slate-50 opacity-75">
                        <div><div className="font-medium">{p.email}</div><div className="text-xs text-slate-500 uppercase">{p.role}</div></div>
                        <div className="text-orange-500 text-sm italic">Pending</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const JoinTeamPage = ({ session, fetchDashboard }) => {
    const [status, setStatus] = useState('loading');
    useEffect(() => {
        const token = new URLSearchParams(window.location.search).get('token');
        if(!token) return setStatus('error');
        apiCall('/api/team/accept', {method:'POST', body:{token}}, session.access_token)
            .then(() => { setStatus('success'); setTimeout(fetchDashboard, 1000); })
            .catch(() => setStatus('error'));
    }, []);

    if(status === 'loading') return <div className="text-center pt-20">Joining team...</div>;
    if(status === 'error') return <div className="text-center pt-20 text-red-600">Invalid Invite Link</div>;
    return <div className="text-center pt-20 text-green-600">Successfully Joined! Redirecting...</div>;
};

// --- MAIN APP SHELL ---
function App() {
    const [session, setSession] = useState(null);
    const [processor, setProcessor] = useState(null);
    const [activeTab, setActiveTab] = useState('home');
    const [subTab, setSubTab] = useState('overview');
    const [userRole, setUserRole] = useState(null);
    const isJoin = new URLSearchParams(window.location.search).has('token');

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
        supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    }, []);

    const fetchDashboard = useCallback(async () => {
        if (!session) return;
        try {
            const data = await apiCall('/api/dashboard', { method: 'GET' }, session.access_token);
            setProcessor(data.processor);
            setUserRole(data.userRole);
            if (isJoin) setActiveTab('dashboard');
        } catch (e) { if(e.message.includes('404')) setProcessor(false); }
    }, [session, isJoin]);

    useEffect(() => { 
        if (activeTab === 'dashboard' || isJoin) fetchDashboard(); 
        if (isJoin && !session) setActiveTab('dashboard'); // Force login screen for invite
    }, [activeTab, session, isJoin]);

    return (
        <div className="min-h-screen font-sans bg-[#020617] text-white">
             {/* HEADER SIMPLIFIED */}
             <header className="fixed w-full z-50 bg-[#020617]/90 border-b border-white/5 p-4 flex justify-between">
                <div className="font-bold text-lg flex gap-2"><ShieldCheck className="text-blue-500"/> Auditor Veritas</div>
                <nav className="flex gap-4 text-sm">
                    <button onClick={()=>setActiveTab('home')}>Home</button>
                    <button onClick={()=>setActiveTab('dashboard')} className="bg-blue-600 px-3 py-1 rounded">{session ? 'Dashboard' : 'Login'}</button>
                </nav>
            </header>

            <main className="pt-20">
                {activeTab === 'home' && (
                    <div className="text-center pt-20 px-4">
                        <h1 className="text-5xl font-bold mb-6">Compliance Engineered for Truth</h1>
                        <p className="text-xl text-slate-400 mb-8">Zero Trust. Immutable Logs. EU-Only Data.</p>
                        <button onClick={()=>setActiveTab('dashboard')} className="bg-blue-600 px-8 py-4 rounded-full text-lg font-bold">Get Started</button>
                        <div className="mt-20"><CoreArchitecture/></div>
                    </div>
                )}

                {activeTab === 'dashboard' && (
                    <div className="min-h-screen bg-slate-50 text-slate-900 p-4">
                        {isJoin && !session ? <AuthScreen onLogin={fetchDashboard} /> :
                         isJoin && session ? <JoinTeamPage session={session} fetchDashboard={fetchDashboard} /> :
                         !session ? <AuthScreen onLogin={(sess) => setSession(sess)} /> :
                         processor === false ? <CreateProcessor token={session.access_token} onProcessorCreated={fetchDashboard} /> :
                         !processor ? <div className="text-center pt-20">Loading...</div> : (
                            <div className="max-w-6xl mx-auto">
                                <div className="flex gap-4 mb-6 border-b pb-2">
                                    <button onClick={()=>setSubTab('overview')} className={`font-bold ${subTab==='overview'?'text-blue-600':''}`}>Overview</button>
                                    <button onClick={()=>setSubTab('team')} className={`font-bold ${subTab==='team'?'text-blue-600':''}`}>Team</button>
                                </div>
                                {subTab === 'overview' && (
                                    <div className="space-y-6">
                                        <Dashboard processor={processor} stats={{totalEvents:0}} token={session.access_token} />
                                        <KeyRotationComponent processor={processor} token={session.access_token} onKeyUpdate={()=>{}} onRevoke={()=>{}} onRefreshDashboard={fetchDashboard} />
                                    </div>
                                )}
                                {subTab === 'team' && <TeamManagement token={session.access_token} processor={processor} userRole={userRole} />}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;