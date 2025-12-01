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
    CheckCircle2, Zap, ArrowRight, Download, UserPlus, Loader2, Mail, Shield, Trash2, XCircle
} from 'lucide-react';

// --- IMPORTS (Antar att dessa filer finns) ---
import InteractiveFeatureSection from './components/InteractiveFeatureSection';
import DashboardPreview from './components/DashboardPreview';
import CoreArchitecture from './components/CoreArchitecture';
import IntegrityEngine from './components/IntegrityEngine';
import UseCases from './components/UseCases';
import InteractiveHeroBackground from './components/InteractiveHeroBackground';
import TypewriterEffect from './components/TypewriterEffect';
import PrivacyPage from './components/PrivacyPage';
import PricingPageStripe from './components/PricingPageStripe';
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

// --- CONFIG & UTILS ---
const API_BASE_URL = 'https://auditor-veritas-mvp.onrender.com';
const SUPABASE_URL = 'https://ridpgvikvjreljwypbpj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpZHBndmlrdmpyZWxqd3lwYnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MDU5MDksImV4cCI6MjA3ODk4MTkwOX0.qP9Ok огромный!qP9Okdx8uroKpkWjoUNLNC9WcRSPD6S6AV7RasCCPHg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

// --- DOMÄN-HJÄLPFUNKTION ---
const isCorporateEmail = (email) => {
    const blockedDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com'];
    const domain = email.split('@').pop().toLowerCase();
    return domain && !blockedDomains.includes(domain);
};

// Robust apiCall (Exporteras för att användas i andra komponenter, som TeamManagement)
export const apiCall = async (endpoint, options = {}, token = null, apiKey = null) => {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (apiKey) headers['x-api-key'] = apiKey;
    const config = { headers, ...options };
    if (options.body) config.body = JSON.stringify(options.body);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 204) return null;

    const text = await response.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        if (!response.ok) throw new Error(`Server Error ${response.status}: ${text.substring(0, 50)}`);
        return text;
    }

    if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP Error ${response.status}`);
    }

    return data;
};

// --- AUTH COMPONENT ---
const AuthScreen = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('login');

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (mode === 'signup') {
                if (!isCorporateEmail(email)) {
                    throw new Error("Registration is restricted to corporate email addresses to create a Processor Node.");
                }
                
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert("Success! Check your email for confirmation link.");
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                onLogin(data.session);
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4 pt-20">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 text-white"><User size={24} /></div>
                    <h2 className="text-2xl font-bold text-slate-900">{mode === 'login' ? 'Sign In' : 'Create User Account'}</h2>
                    <p className="text-slate-500 text-sm">Access the secure dashboard.</p>
                </div>
                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                        <input type="email" required className="w-full p-3 border border-slate-300 rounded-lg text-slate-900" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                        <input type="password" required className="w-full p-3 border border-slate-300 rounded-lg text-slate-900" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <button disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                        {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
                    </button>
                    {mode === 'signup' && (
                        <p className="text-xs text-slate-500 text-center pt-2">
                            *Requires a corporate email address to create a Processor Node.
                        </p>
                    )}
                </form>
                <div className="mt-4 text-center">
                    <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-sm text-blue-600 hover:underline">
                        {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- KEY ROTATION COMPONENT ---
const KeyRotationComponent = ({ processor, token, onKeyUpdate, onRevoke }) => {
    const [step, setStep] = useState('idle');
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newKeyData, setNewKeyData] = useState(null);
    const [copied, setCopied] = useState(false);
    const [keyToDisplay, setKeyToDisplay] = useState(null);
    const [showKey, setShowKey] = useState(false);

    const requestRotation = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await apiCall('/api/keys/request-rotation', { method: 'POST' }, token);
            setStep('verify');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const verifyAndRotate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiCall('/api/keys/rotate', {
                method: 'POST',
                body: { code: verificationCode }
            }, token);

            localStorage.setItem('av_sim_key', data.newApiKey);
            onKeyUpdate(data.newApiKey);
            setNewKeyData(data.newApiKey);
            setStep('complete');
            setVerificationCode('');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(newKeyData);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([`AUDITOR_VERITAS_KEY=${newKeyData}\n# Keep this safe!`], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = "auditor-veritas-key.env";
        document.body.appendChild(element);
        element.click();
    };

    return (
        <>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2 text-slate-800 text-sm">
                        <RotateCw className="w-4 h-4 text-purple-600" /> Credential Management
                    </h3>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-1 rounded font-bold uppercase">Active</span>
                </div>

                <div className="relative">
                    <div className="bg-slate-50 p-3 rounded-lg text-xs font-mono text-slate-600 break-all border border-slate-100 pr-16 min-h-[40px] flex items-center">
                        {keyToDisplay ? (showKey ? keyToDisplay : '••••••••••••••••••••••••••••••' + keyToDisplay.slice(-4)) : 'API Key is hidden. Rotate to see a new one.'}
                    </div>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                        <button onClick={() => setShowKey(!showKey)} disabled={!keyToDisplay} className="p-1.5 hover:bg-slate-200 rounded text-slate-500 disabled:opacity-50"><Eye size={14} /></button>
                        <button onClick={() => navigator.clipboard.writeText(keyToDisplay)} disabled={!keyToDisplay} className="p-1.5 hover:bg-slate-200 rounded text-slate-500 disabled:opacity-50"><Copy size={14} /></button>
                    </div>
                </div>

                {error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">{error}</div>}

                <div className="grid grid-cols-1 gap-3">
                    {step === 'idle' || step === 'complete' ? (
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={requestRotation} disabled={isLoading} className="bg-slate-900 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex justify-center items-center">
                                {isLoading ? <RefreshCw className="animate-spin w-3 h-3" /> : 'Rotate Key'}
                            </button>
                            <button onClick={onRevoke} className="bg-white border border-red-100 text-red-600 py-2.5 rounded-xl text-xs font-bold hover:bg-red-50 flex justify-center items-center gap-2">
                                <AlertTriangle size={14} /> Revoke
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={verifyAndRotate} className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 animate-fade-in">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Check email for verification code</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="123456"
                                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-center text-sm tracking-widest font-bold"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    maxLength={6}
                                    autoFocus
                                />
                                <button type="submit" disabled={isLoading || verificationCode.length < 6} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-xs disabled:opacity-50 disabled:bg-slate-400 transition-all">
                                    {isLoading ? <RefreshCw className="animate-spin w-3 h-3" /> : 'Verify'}
                                </button>
                            </div>
                            <button type="button" onClick={() => { setStep('idle'); setError(null); }} className="text-[10px] text-slate-400 mt-2 hover:text-slate-600 underline">Cancel</button>
                        </form>
                    )}
                </div>
            </div>

            {newKeyData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3"><CheckCircle2 size={24} /></div>
                            <h3 className="text-xl font-bold text-slate-900">Success!</h3>
                            <p className="text-sm text-slate-500 mt-1">Old key invalidated. Update your .env files.</p>
                        </div>
                        <div className="bg-slate-900 rounded-xl p-4 mb-6 relative group">
                            <code className="text-emerald-400 font-mono text-sm break-all">{newKeyData}</code>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <button onClick={handleCopy} className="flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors">{copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}{copied ? 'Copied!' : 'Copy'}</button>
                            <button onClick={handleDownload} className="flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors"><Download size={16} /> Save File</button>
                        </div>
                        <button onClick={() => { setNewKeyData(null); setKeyToDisplay(newKeyData); setStep('idle'); }} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20">I have saved this key safely</button>
                    </div>
                </div>
            )}
        </>
    );
};

// --- CREATE PROCESSOR ---
const CreateProcessor = ({ token, onProcessorCreated, email }) => {
    const [companyName, setCompanyName] = useState('');
    const [plan, setPlan] = useState('starter');
    const [loading, setLoading] = useState(false);
    const [apiKey, setApiKey] = useState(null);
    const [error, setError] = useState(null); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await apiCall('/api/processors', { method: 'POST', body: { companyName, plan } }, token);
            setApiKey(data.apiKey);
        } catch (err) {
            setError(err.message || "Failed to create processor node.");
            setLoading(false);
        }
    };

    const handleGoToDashboard = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        onProcessorCreated();
    };

    if (apiKey) {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-10 bg-white shadow-xl rounded-2xl max-w-lg mx-auto border border-green-100">
                <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-4">Processor Node Created!</h3>
                <p className="text-slate-600 mb-4">Save your API Key before continuing.</p>

                <div className="font-mono bg-slate-100 p-4 rounded-lg break-all mb-6 text-sm text-slate-700 border border-slate-200">{apiKey}</div>

                <button onClick={handleGoToDashboard} disabled={loading} className="bg-blue-600 text-white py-3 px-6 rounded-full font-bold hover:bg-blue-700 shadow-lg flex items-center justify-center gap-2 w-full">
                    {loading ? <RefreshCw className="animate-spin" /> : 'Go to Dashboard'}
                </button>
            </motion.div>
        );
    }
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto p-8 bg-white rounded-3xl shadow-2xl border border-slate-100 mt-20">
            <h2 className="text-3xl font-bold mb-6 text-slate-900">Create New Processor Node</h2>
            
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm font-medium flex items-center gap-2">
                    <AlertTriangle size={16} /> <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Project Name</label><input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="w-full p-3 border border-slate-300 rounded-xl" placeholder="My Enterprise Platform" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Plan</label><div className="flex space-x-4">{['starter', 'professional', 'enterprise'].map((p) => (<button key={p} type="button" onClick={() => setPlan(p)} className={`flex-1 p-4 rounded-xl border-2 font-bold transition-all ${plan === p ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400'}`}>{p.charAt(0).toUpperCase() + p.slice(1)}</button>))}</div></div>
                <button type="submit" disabled={loading || !companyName} className="w-full bg-[#0a2540] text-white p-4 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-50 flex justify-center items-center gap-2">{loading ? <RefreshCw className="animate-spin w-5 h-5" /> : 'Create Secure Ledger'}</button>
            </form>
        </motion.div>
    );
};

// --- JOIN TEAM PAGE (NY KOMPONENT FÖR INBJUDNINGSTOKEN) ---
const JoinTeamPage = ({ session, fetchDashboard }) => {
    const [status, setStatus] = useState('loading'); // loading, success, error, login_required
    const [message, setMessage] = useState('Validating invitation...');
    const [token, setToken] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');
        setToken(tokenFromUrl);

        if (!session) {
            // Om användaren inte är inloggad, måste de logga in först
            setStatus('login_required');
            setMessage('Please sign in with the email address that received the invitation to proceed.');
        } else if (tokenFromUrl) {
            handleAcceptInvite(session.access_token, tokenFromUrl);
        } else {
            setStatus('error');
            setMessage('No invitation token found in the URL.');
        }
    }, [session]);

    const handleAcceptInvite = async (accessToken, currentToken) => {
        setStatus('loading');
        try {
            const data = await apiCall('/api/team/accept', {
                method: 'POST',
                body: { token: currentToken }
            }, accessToken);

            // Rensa token från URL:en för att undvika omladdning
            window.history.replaceState({}, document.title, window.location.pathname);
            
            setStatus('success');
            setMessage(data.message || 'Invitation accepted successfully!');
            
            // Ladda om dashboard-data efter en kort fördröjning
            setTimeout(() => {
                fetchDashboard(); 
            }, 1000);

        } catch (err) {
            setStatus('error');
            setMessage(err.message || 'Failed to accept invitation. The token might be expired or already used.');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    };

    const getIcon = () => {
        switch (status) {
            case 'success': return <CheckCircle2 size={36} className="text-green-500" />;
            case 'error': return <AlertTriangle size={36} className="text-red-500" />;
            case 'loading': return <Loader2 size={36} className="animate-spin text-blue-500" />;
            case 'login_required': return <Lock size={36} className="text-yellow-500" />;
            default: return null;
        }
    };
    
    // Använd AuthScreen för att hantera inloggning/registrering
    if (status === 'login_required' && !session) {
        return <AuthScreen onLogin={fetchDashboard} />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 pt-20">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-10 bg-white shadow-xl rounded-2xl max-w-lg mx-auto border border-slate-100">
                <div className="mx-auto mb-4">{getIcon()}</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Team Invitation Status</h3>
                <p className="text-slate-600 mb-6">{message}</p>
                {status === 'success' && (
                    <button onClick={() => window.location.href = '/dashboard'} className="bg-blue-600 text-white py-2 px-4 rounded-full font-bold hover:bg-blue-700">
                        Go to Dashboard
                    </button>
                )}
            </motion.div>
        </div>
    );
};

// --- TEAM MANAGEMENT COMPONENT ---
const TeamManagement = ({ token, processor, userRole }) => {
    const [team, setTeam] = useState([]);
    const [pending, setPending] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('reader');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [inviteLoading, setInviteLoading] = useState(false);
    const isOwner = userRole === 'owner';

    const fetchTeamData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiCall('/api/team', { method: 'GET' }, token);
            setTeam(data.team || []);
            setPending(data.pending || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTeamData();
    }, [token]);

    const handleInvite = async (e) => {
        e.preventDefault();
        setInviteLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (!inviteEmail) {
            setError("Email is required.");
            setInviteLoading(false);
            return;
        }

        try {
            const result = await apiCall('/api/team/invite', { 
                method: 'POST', 
                body: { email: inviteEmail, role: inviteRole } 
            }, token);
            
            setSuccessMessage(result.message || `Invitation successfully sent to ${inviteEmail} as a ${inviteRole}.`);
            setInviteEmail('');
            await fetchTeamData(); 
        } catch (err) {
            setError(err.message || "Failed to send invitation.");
        } finally {
            setInviteLoading(false);
        }
    };

    const handleRemoveMember = async (userId, email) => {
        if (!window.confirm(`Are you sure you want to remove ${email}? This action cannot be undone and will be permanently logged in the audit ledger.`)) return;
        setError(null);
        setSuccessMessage(null);
        
        try {
            await apiCall(`/api/team/member/${userId}`, { method: 'DELETE' }, token);
            setSuccessMessage(`${email} has been successfully removed and the event was logged.`);
            fetchTeamData();
        } catch (err) {
            setError(err.message || "Failed to remove member.");
        }
    };

    const getRoleColor = (role) => {
        if (role === 'owner') return 'bg-red-700';
        if (role === 'admin') return 'bg-red-500';
        if (role === 'editor') return 'bg-yellow-500';
        return 'bg-blue-500';
    };

    if (isLoading) {
        return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto w-8 h-8 text-blue-500" /></div>;
    }
    
    const TeamList = ({ team, pending }) => (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
            <h3 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2"><User size={20} className="text-slate-500" /> Active Team Members ({team.length})</h3>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead>
                        <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            <th className="px-6 py-3">User/Email</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Status</th>
                            {isOwner && <th className="px-6 py-3">Action</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {team.map((member) => (
                            <tr key={member.email} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 flex items-center gap-2">
                                    {member.email}
                                    {member.role === 'owner' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold uppercase">Owner</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`text-white text-xs font-bold px-2 py-1 rounded-full ${getRoleColor(member.role)}`}>
                                        {member.role.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-medium">
                                    {member.status}
                                </td>
                                {isOwner && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {member.role !== 'owner' ? (
                                            <button 
                                                onClick={() => handleRemoveMember(member.user_id, member.email)} 
                                                className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        ) : (
                                            <Shield size={16} className="text-slate-400" title="Cannot remove owner" />
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                        {pending.map((invite) => (
                            <tr key={invite.invited_email} className="opacity-60 italic">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 flex items-center gap-2">
                                    {invite.invited_email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`text-white text-xs font-bold px-2 py-1 rounded-full ${getRoleColor(invite.role)}`}>
                                        {invite.role.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">
                                    {invite.status} (Expires: {new Date(invite.expires_at).toLocaleDateString()})
                                </td>
                                {isOwner && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button 
                                            // Här skulle en "Avbryt inbjudan"-funktion vara
                                            className="text-slate-400 p-2"
                                            disabled
                                        >
                                            <XCircle size={16} title="Revoke Invitation (Not Implemented)" />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {team.length === 0 && pending.length === 0 && (
                <div className="text-center py-8 text-slate-500">No active members or pending invitations.</div>
            )}
        </div>
    );

    return (
        <div className="p-6 md:p-10 bg-slate-50 min-h-full">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2 flex items-center gap-3">
                <UserPlus size={28} className="text-blue-600" /> Team Management
            </h1>
            <p className="text-slate-500 mb-8">Manage users who have access to the secure audit ledger for **{processor.companyName}**.</p>
            
            {error && <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-xl mb-4 flex items-center gap-2"><AlertTriangle size={18} /> {error}</div>}
            {successMessage && <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-xl mb-4 flex items-center gap-2"><CheckCircle2 size={18} /> {successMessage}</div>}

            {/* --- Inbjudningsformulär (Endast för ägare/admin) --- */}
            {isOwner && (
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 mb-10">
                    <h3 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2"><Mail size={20} className="text-blue-500" /> Invite New Member</h3>
                    <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="user@corporate.com"
                                required
                                className="w-full p-3 border border-slate-300 rounded-xl"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                            <select
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value)}
                                className="w-full p-3 border border-slate-300 rounded-xl bg-white"
                            >
                                <option value="reader">Reader (View only)</option>
                                <option value="editor">Editor (View + Log events)</option>
                                <option value="admin">Admin (Editor + Manage team/keys)</option>
                            </select>
                        </div>
                        <button type="submit" disabled={inviteLoading || !inviteEmail} className="md:col-span-1 bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                            {inviteLoading ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />} Send Invite
                        </button>
                    </form>
                </div>
            )}
            
            {/* Teamlista */}
            <TeamList team={team} pending={pending} />

            {!isOwner && userRole && ( 
                 <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 flex items-start gap-3">
                    <AlertTriangle size={20} className="flex-shrink-0 mt-0.5"/>
                    <p className="text-sm">You are logged in as a **{userRole.toUpperCase()}**. You do not have permission to invite or remove team members.</p>
                 </div>
            )}
        </div>
    );
};

// --- MAIN APP ---
function App() {
    const [activeTab, setActiveTab] = useState('home');
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [session, setSession] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [processor, setProcessor] = useState(null);
    const [stats, setStats] = useState({ totalEvents: 0, monthlyEvents: 0 });
    const [recentLogs, setRecentLogs] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [simulationApiKey, setSimulationApiKey] = useState(localStorage.getItem('av_sim_key') || '');
    const [eventData, setEventData] = useState({ event_type: 'user_login', event_data: '{}', user_identifier: 'user123' });
    const [showSecurity, setShowSecurity] = useState(false);
    const [showDocs, setShowDocs] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [legalTab, setLegalTab] = useState('privacy');
    const [userRole, setUserRole] = useState(null); 
    const [dashboardSubTab, setDashboardSubTab] = useState('overview'); 

    // Kontrollerar URL:en för inbjudningstoken
    const hasJoinToken = new URLSearchParams(window.location.search).has('token');

    useEffect(() => {
        const savedPrivacy = localStorage.getItem('av_privacy_v1');
        if (savedPrivacy === 'true') setPrivacyAccepted(true);
        supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setSession(session); });
        return () => subscription.unsubscribe();
    }, []);

    const openPrivacyModal = useCallback(() => { setLegalTab('privacy'); setShowPrivacyModal(true); }, []);
    const openTermsModal = useCallback(() => { setLegalTab('terms'); setShowPrivacyModal(true); }, []);

    const fetchDashboard = useCallback(async () => {
        if (!session?.access_token) return;

        try {
            const data = await apiCall('/api/dashboard', { method: 'GET' }, session.access_token);
            setProcessor(data.processor);
            setStats(data.stats);
            setUserRole(data.userRole); 
            const logs = await apiCall('/api/events/search?limit=15', { method: 'GET' }, session.access_token);
            setRecentLogs(logs.events || []);
            if (data.stats.totalEvents > 0) {
                setChartData([...Array(10)].map(() => Math.floor(Math.random() * 50) + 30));
            } else {
                setChartData([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            }
            // Om inbjudan lyckades och vi är på startsidan, skicka till dashboard
            if (hasJoinToken) setActiveTab('dashboard');

        } catch (error) {
            if (error.message.includes('404') || error.message.includes('Processor not found')) {
                setProcessor(false);
                setUserRole(null);
            } else {
                console.error("Fetch Error:", error);
            }
        }
    }, [session, hasJoinToken]);

    useEffect(() => {
        // Om vi har en token i URL:en, skicka användaren till Dashboard-vyn för att trigga inloggning/acceptans
        if (hasJoinToken) {
            setActiveTab('dashboard');
        } else if (activeTab === 'dashboard' && session) { 
            fetchDashboard(); 
        }
    }, [activeTab, session, hasJoinToken]);

    const handleLogEvent = async (e) => {
        e.preventDefault();
        const activeApiKey = localStorage.getItem('av_sim_key');
        if (!activeApiKey) return alert("API Key missing.");
        try {
            const hashedID = eventData.user_identifier ? CryptoJS.SHA256(eventData.user_identifier).toString() : "anonymous";
            const payload = { event_type: eventData.event_type, user_identifier: hashedID, event_data: JSON.parse(eventData.event_data) };
            await apiCall('/api/events', { method: 'POST', body: payload }, null, activeApiKey);
            alert('Event logged successfully.');
            fetchDashboard();
            setEventData({ event_type: 'user_login', event_data: '{}', user_identifier: 'user123' });
        } catch (error) { alert(`Logging Error: ${error.message}`); }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setSession(null); setProcessor(null); setRecentLogs([]); setActiveTab('home'); setUserRole(null);
    };

    if (!privacyAccepted) return <PrivacyPage onAccept={() => { localStorage.setItem('av_privacy_v1', 'true'); setPrivacyAccepted(true); }} />;

    return (
        <div className={`min-h-screen font-sans bg-[#020617] text-white selection:bg-blue-600 selection:text-white`}>
            <AnimatePresence>
                {showSecurity && <SecurityPage onClose={() => setShowSecurity(false)} />}
                {showDocs && <DocsModal onClose={() => setShowDocs(false)} />}
                {showPrivacyModal && (<PrivacyPage isFooterView={true} onClose={() => setShowPrivacyModal(false)} initialTab={legalTab} />)}
            </AnimatePresence>

            {/* Header / Navigation */}
            <header className="fixed w-full top-0 z-50 bg-[#020617]/90 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
                        <ShieldCheck className="text-blue-500" /> <span className="font-bold text-lg">Auditor Veritas</span>
                    </div>

                    <nav className="hidden md:flex gap-6 items-center">
                        <button onClick={() => setActiveTab('home')} className={`text-sm font-medium transition-colors ${activeTab === 'home' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>Home</button>
                        <button onClick={() => setActiveTab('services')} className={`text-sm font-medium transition-colors ${activeTab === 'services' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>Services</button>
                        <button onClick={() => setActiveTab('trust')} className={`text-sm font-medium transition-colors ${activeTab === 'trust' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>Trust Center</button>
                        <button onClick={() => setActiveTab('pricing')} className={`text-sm font-medium transition-colors ${activeTab === 'pricing' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>Pricing</button>
                        <button onClick={() => setActiveTab('about')} className={`text-sm font-medium transition-colors ${activeTab === 'about' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>About</button>
                        <button onClick={() => setActiveTab('contact')} className={`text-sm font-medium transition-colors ${activeTab === 'contact' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>Contact</button>
                        <div className="h-4 w-px bg-white/10 mx-2"></div>
                        {session ? (
                            <button onClick={() => setActiveTab('dashboard')} className="bg-blue-600 px-4 py-2 rounded-lg font-bold text-white text-sm flex items-center gap-2 hover:bg-blue-500 transition-colors"><LayoutGrid size={16} /> Dashboard</button>
                        ) : (
                            <button onClick={() => setActiveTab('dashboard')} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-medium"><Lock size={16} /> Login</button>
                        )}
                    </nav>

                    <button className="md:hidden p-2 text-slate-400 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden bg-[#020617] border-b border-white/10 overflow-hidden">
                            <div className="px-6 py-6 flex flex-col gap-4">
                                <button onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }} className="text-left text-lg font-medium text-slate-300">Home</button>
                                <button onClick={() => { setActiveTab('services'); setIsMobileMenuOpen(false); }} className="text-left text-lg font-medium text-slate-300">Services</button>
                                <button onClick={() => { setActiveTab('trust'); setIsMobileMenuOpen(false); }} className="text-left text-lg font-medium text-slate-300">Trust Center</button>
                                <button onClick={() => { setActiveTab('pricing'); setIsMobileMenuOpen(false); }} className="text-left text-lg font-medium text-slate-300">Pricing</button>
                                <button onClick={() => { setActiveTab('about'); setIsMobileMenuOpen(false); }} className="text-left text-lg font-medium text-slate-300">About</button>
                                <button onClick={() => { setActiveTab('contact'); setIsMobileMenuOpen(false); }} className="text-left text-lg font-medium text-slate-300">Contact</button>
                                <div className="h-px bg-white/10 my-2"></div>
                                {session ? (
                                    <button onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} className="bg-blue-600 w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2">Go to Dashboard</button>
                                ) : (
                                    <button onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} className="bg-white/10 w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2">Login</button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <main className="pt-0">
                {/* Huvudsidor (Oförändrad) */}
                {activeTab === 'home' && (
                    <div className="bg-[#020617] min-h-screen">
                        <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden text-center z-10 pt-20">
                            <InteractiveHeroBackground />
                            {/* Blur-effekter */}
                            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] animate-pulse-glow pointer-events-none" />
                            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] animate-pulse-glow pointer-events-none" style={{ animationDelay: '2s' }} />

                            <div className="relative z-10 max-w-5xl mx-auto px-4 mt-10">
                                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="inline-flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full text-blue-400 text-sm font-bold border border-white/10 backdrop-blur-md mb-8 shadow-lg shadow-blue-900/20 hover:scale-105 transition-transform cursor-default">
                                    <Sparkles className="w-3 h-3 animate-pulse" /><span>Version 2.0: Enterprise Ready</span>
                                </motion.div>

                                <motion.h1 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-5xl md:text-8xl font-extrabold tracking-tight leading-[1.1] mb-8 drop-shadow-2xl">
                                    Compliance <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 animate-text-shine bg-[length:200%_auto]">Engineered for Truth.</span>
                                </motion.h1>

                                <div className="h-24 md:h-20 mb-10 flex items-start justify-center">
                                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed bg-black/30 backdrop-blur-sm p-4 rounded-xl border border-white/5 shadow-xl">
                                        <span className="text-blue-500 font-mono mr-2">{'>'}</span>
                                        <TypewriterEffect text=" The interactive standard for data integrity. Cryptographically verifiable audit logs that scale with your enterprise infrastructure." speed={30} delay={800} />
                                    </p>
                                </div>

                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 2.5 }} className="flex flex-col sm:flex-row gap-5 justify-center">
                                    <button onClick={() => setActiveTab('dashboard')} className="group relative px-8 py-4 rounded-full bg-blue-600 font-bold text-white shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_60px_-15px_rgba(37,99,235,0.6)]">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-beam" />
                                        <span className="relative flex items-center gap-2">Start Integration <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></span>
                                    </button>
                                    <button onClick={() => setActiveTab('pricing')} className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 font-bold backdrop-blur-sm text-white border border-white/10 transition-all hover:scale-105">Enterprise Access</button>
                                </motion.div>
                            </div>
                        </div>

                        <div id="demo-section" className="relative z-20"><InteractiveFeatureSection /></div>
                        <DashboardPreview />
                        <div className="bg-white"><CodeIntegration setActiveTab={setActiveTab} onOpenDocs={() => setShowDocs(true)} /></div>
                        <UseCases />
                        <IntegrityEngine />
                        <CoreArchitecture />
                    </div>
                )}

                {activeTab === 'about' && <AboutPage />}
                {activeTab === 'services' && <ServicesPage setActiveTab={setActiveTab} />}
                {activeTab === 'contact' && <ContactPage />}
                {activeTab === 'trust' && <TrustCenter setActiveTab={setActiveTab} />}
                {activeTab === 'integrity' && <IntegrityFocusPage setActiveTab={setActiveTab} />}
                {activeTab === 'pricing' && <PricingPageStripe setActiveTab={setActiveTab} />}

                {activeTab === 'dashboard' && (
                    <div className="min-h-screen bg-slate-50 text-slate-900 pt-20">
                        {hasJoinToken && !session ? (
                             <AuthScreen onLogin={fetchDashboard} />
                        ) : hasJoinToken && session ? (
                            <JoinTeamPage session={session} fetchDashboard={fetchDashboard} />
                        ) : !session ? (
                            <AuthScreen onLogin={(sess) => setSession(sess)} />
                        ) : (processor === false) ? (
                            <div className="pt-20 px-4"><CreateProcessor token={session.access_token} email={session.user.email} onProcessorCreated={() => { setProcessor(null); fetchDashboard(); }} /></div>
                        ) : (!processor || userRole === null) ? ( 
                            <div className="text-center py-40"><RefreshCw className="animate-spin mx-auto w-8 h-8 text-blue-500" /><p className="text-slate-500 mt-4">Loading secure ledger data...</p></div>
                        ) : (
                            // Dashboard med flikhantering
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                <div className="flex border-b border-slate-200 mb-6">
                                    <button 
                                        onClick={() => setDashboardSubTab('overview')}
                                        className={`px-4 py-3 text-sm font-semibold transition-colors ${dashboardSubTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <LayoutGrid size={18} className="inline-block mr-2 align-text-bottom" /> Overview
                                    </button>
                                    <button 
                                        onClick={() => setDashboardSubTab('team')}
                                        className={`px-4 py-3 text-sm font-semibold transition-colors ${dashboardSubTab === 'team' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <UserPlus size={18} className="inline-block mr-2 align-text-bottom" /> Team
                                    </button>
                                </div>

                                {dashboardSubTab === 'overview' && (
                                    <Dashboard
                                        processor={processor}
                                        stats={stats}
                                        token={session.access_token}
                                        eventData={eventData}
                                        setEventData={setEventData}
                                        onLogEvent={handleLogEvent}
                                        recentLogs={recentLogs}
                                        chartData={chartData}
                                        onLogout={handleLogout}
                                        simulationApiKey={simulationApiKey}
                                        KeyRotation={<KeyRotationComponent
                                            processor={processor}
                                            token={session.access_token}
                                            onKeyUpdate={setSimulationApiKey}
                                            onRevoke={handleLogout}
                                        />}
                                    />
                                )}

                                {dashboardSubTab === 'team' && (
                                    <TeamManagement 
                                        token={session.access_token}
                                        processor={processor}
                                        userRole={userRole} 
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>

            <Footer onOpenPrivacy={openPrivacyModal} onOpenTerms={openTermsModal} onOpenSecurity={() => setShowSecurity(true)} onOpenDocs={() => setShowDocs(true)} onNavigate={setActiveTab} />
        </div>
    );
}

export default App;