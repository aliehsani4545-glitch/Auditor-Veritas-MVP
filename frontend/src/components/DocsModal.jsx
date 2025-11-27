import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Book, Code, Terminal, Zap, ChevronRight, Copy, Check } from 'lucide-react';

const DocsModal = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState('quickstart');

  const sections = [
    { id: 'quickstart', label: 'Quick Start', icon: Zap },
    { id: 'auth', label: 'Authentication', icon: Key },
    { id: 'endpoints', label: 'Log Events', icon: Terminal },
    { id: 'errors', label: 'Error Codes', icon: Code },
  ];

  return (
    <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="fixed inset-0 z-[100] bg-[#020617]/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
    >
      <div className="bg-[#0f172a] w-full max-w-6xl h-[85vh] rounded-2xl border border-slate-800 shadow-2xl flex overflow-hidden relative">
        
        {/* Sidebar */}
        <div className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col hidden md:flex">
          <div className="flex items-center gap-2 mb-8 text-blue-400">
            <Book size={20} />
            <span className="font-bold tracking-wide">Developer Docs</span>
          </div>
          <nav className="space-y-2">
            {sections.map(section => (
              <button 
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeSection === section.id ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <section.icon size={16} />
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-800 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors z-10">
            <X size={20} />
          </button>

          {activeSection === 'quickstart' && (
             <div className="space-y-6 animate-fade-in">
                <h2 className="text-3xl font-bold text-white">Quick Start Guide</h2>
                <p className="text-slate-400 text-lg leading-relaxed">
                   Integrate immutable audit logging into your Node.js application in under 5 minutes.
                </p>
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span> Get your API Key</h3>
                    <p className="text-slate-400 text-sm mb-4">Sign up for an account to receive your `x-api-key`. Store this securely in your `.env` file.</p>
                </div>
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">2</span> Send an Event</h3>
                    <CodeBlock code={`
const response = await fetch('https://auditor-veritas-mvp.onrender.com/api/events', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.AUDITOR_API_KEY
  },
  body: JSON.stringify({
    event_type: "payment.success",
    user_identifier: "user_123", // Will be hashed automatically
    event_data: { amount: 500, currency: "USD" }
  })
});
                    `} />
                </div>
             </div>
          )}

          {activeSection === 'auth' && (
             <div className="space-y-6 animate-fade-in">
                <h2 className="text-3xl font-bold text-white">Authentication</h2>
                <p className="text-slate-400">All API requests must include your unique API key in the header.</p>
                
                <div className="bg-amber-900/20 border border-amber-900/50 p-4 rounded-lg text-amber-200 text-sm">
                   ⚠️ <strong>Warning:</strong> Never expose your API key in client-side code (browsers). Only use it in server-side environments.
                </div>

                <h3 className="text-xl font-bold text-white mt-4">Headers</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-800 text-slate-200">
                            <tr><th className="p-3">Key</th><th className="p-3">Value</th><th className="p-3">Required</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            <tr><td className="p-3 font-mono text-blue-400">x-api-key</td><td className="p-3">av_live_...</td><td className="p-3 text-emerald-400">Yes</td></tr>
                            <tr><td className="p-3 font-mono text-blue-400">Content-Type</td><td className="p-3">application/json</td><td className="p-3 text-emerald-400">Yes</td></tr>
                        </tbody>
                    </table>
                </div>
             </div>
          )}

          {activeSection === 'endpoints' && (
             <div className="space-y-6 animate-fade-in">
                <h2 className="text-3xl font-bold text-white">Log Event</h2>
                <div className="flex items-center gap-3">
                    <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-md font-mono text-sm font-bold border border-emerald-500/20">POST</span>
                    <span className="text-slate-300 font-mono">/api/events</span>
                </div>
                
                <h3 className="text-xl font-bold text-white mt-4">Body Parameters</h3>
                <ul className="space-y-4">
                    <ParamRow name="event_type" type="string" desc="Category of the event (e.g., 'login.failed'). Max 64 chars." req />
                    <ParamRow name="user_identifier" type="string" desc="Email or User ID. We hash this automatically before storage." req />
                    <ParamRow name="event_data" type="object" desc="JSON object containing metadata about the event. Max 500KB." req />
                </ul>

                <h3 className="text-xl font-bold text-white mt-8">Success Response</h3>
                <CodeBlock code={`
{
  "success": true,
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "hash": "a1b2c3d4..."
}
                `} />
             </div>
          )}

           {activeSection === 'errors' && (
             <div className="space-y-6 animate-fade-in">
                <h2 className="text-3xl font-bold text-white">Error Handling</h2>
                <p className="text-slate-400">The API uses standard HTTP status codes to indicate success or failure.</p>
                
                <div className="grid gap-4">
                    <ErrorRow code="400" title="Bad Request" desc="Invalid JSON or validation error (e.g. missing fields)." />
                    <ErrorRow code="401" title="Unauthorized" desc="Missing or invalid API Key." />
                    <ErrorRow code="403" title="Forbidden" desc="API Key has been revoked or quota exceeded." />
                    <ErrorRow code="429" title="Too Many Requests" desc="Rate limit exceeded. Slow down." />
                    <ErrorRow code="500" title="Server Error" desc="Something went wrong on our end." />
                </div>
             </div>
          )}

        </div>
      </div>
    </motion.div>
  );
};

// Micro-components for Docs
const CodeBlock = ({ code }) => {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(code.trim());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="relative group">
            <pre className="bg-[#0b101b] p-4 rounded-lg border border-slate-800 text-sm font-mono text-slate-300 overflow-x-auto">
                {code.trim()}
            </pre>
            <button onClick={copy} className="absolute top-2 right-2 p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 transition-all opacity-0 group-hover:opacity-100">
                {copied ? <Check size={14} className="text-emerald-400"/> : <Copy size={14}/>}
            </button>
        </div>
    )
};

const ParamRow = ({ name, type, desc, req }) => (
    <li className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-blue-400 font-bold">{name}</span>
            <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400">{type}</span>
            {req && <span className="text-[10px] uppercase text-emerald-500 font-bold tracking-wider">Required</span>}
        </div>
        <p className="text-sm text-slate-500">{desc}</p>
    </li>
);

const ErrorRow = ({ code, title, desc }) => (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-900 border border-slate-800">
        <span className={`font-mono font-bold ${code.startsWith('5') ? 'text-red-500' : 'text-amber-500'}`}>{code}</span>
        <div>
            <h4 className="text-white font-bold text-sm">{title}</h4>
            <p className="text-slate-400 text-sm">{desc}</p>
        </div>
    </div>
);

// Little helper icon import
import { Key } from 'lucide-react';

export default DocsModal;