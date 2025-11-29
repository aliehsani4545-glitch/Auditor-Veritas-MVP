import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, ShieldCheck, Send, CheckCircle, Loader2, Zap } from 'lucide-react';

const ContactPage = () => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error

  const encode = (data) => {
    return Object.keys(data)
        .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
        .join("&");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode({ "form-name": "contact", ...formState })
      });
      setStatus('success');
      setFormState({ name: '', email: '', message: '' });
    } catch (error) {
      console.error("Form Error:", error);
      setStatus('error');
    }
  };

  const handleChange = (e) => setFormState({ ...formState, [e.target.name]: e.target.value });

  return (
    <div className="min-h-screen bg-[#020617] pt-32 pb-20 px-4 md:px-8 relative overflow-hidden flex items-center justify-center">
      
      {/* --- FLUID BACKGROUND (Futuristic Flow) --- */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Main Flow - Diagonal from Top Left */}
        <motion.div
          className="absolute top-[-20%] left-[-10%] w-[120vw] h-[100vh] bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-transparent blur-[120px]"
          animate={{
            rotate: [-5, 0, -5],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Accent Flow - Bottom Right */}
        <motion.div
          className="absolute bottom-[-10%] right-[-20%] w-[80vw] h-[80vh] bg-gradient-to-tl from-emerald-900/30 via-cyan-900/30 to-transparent blur-[100px]"
          animate={{
            x: [0, -30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Subtle Grid Texture */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="max-w-6xl w-full mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Left Column: Contact Info & Value Prop */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold uppercase tracking-wider mb-8 backdrop-blur-sm"
          >
            <Zap size={14} className="fill-current" /> Priority Support
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Let's Secure Your <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 animate-pulse-slow">
                Digital Integrity.
            </span>
          </h1>
          
          <p className="text-xl text-slate-400 mb-12 leading-relaxed font-light">
            Have questions about GDPR compliance, audit logs, or custom integrations? 
            We operate with strict confidentiality and provide expert guidance for high-stakes environments.
          </p>

          <div className="space-y-8">
            <ContactItem 
                icon={Mail} 
                title="Direct Email" 
                value="auditorveritassweden@outlook.com" 
                sub="24h response time for enterprise queries."
                color="text-blue-400"
                bg="bg-blue-500/10"
            />
            <ContactItem 
                icon={ShieldCheck} 
                title="Corporate Identity" 
                value="Auditor Veritas Sweden" 
                sub="Org. Number available upon validated request."
                color="text-purple-400"
                bg="bg-purple-500/10"
            />
            <ContactItem 
                icon={MapPin} 
                title="Headquarters" 
                value="Gothenburg, Sweden (EU)" 
                sub="Operating under strict GDPR jurisdiction."
                color="text-emerald-400"
                bg="bg-emerald-500/10"
            />
          </div>
        </motion.div>

        {/* Right Column: Glassmorphism Form */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
            {/* Glow Effect behind form */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-[2.5rem] blur-2xl -z-10 transform scale-95 translate-y-4"></div>

            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                
                {/* Form Header */}
                <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">Send us a Message</h3>
                    <p className="text-slate-400 text-sm">Secure channel. End-to-end encrypted transmission.</p>
                </div>

                {status === 'success' ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12 flex flex-col items-center"
                    >
                        <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6 ring-4 ring-emerald-500/10">
                            <CheckCircle size={48} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-4">Received.</h3>
                        <p className="text-slate-400 mb-8 max-w-xs mx-auto">
                            Thank you for reaching out. We will get back to you at <span className="text-white font-medium">{formState.email}</span> shortly.
                        </p>
                        <button 
                            onClick={() => setStatus('idle')} 
                            className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors border-b border-transparent hover:border-blue-300 pb-0.5"
                        >
                            Send another message
                        </button>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6" name="contact" data-netlify="true">
                        <input type="hidden" name="form-name" value="contact" />
                        
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                            <input 
                                type="text" 
                                name="name"
                                value={formState.name}
                                onChange={handleChange}
                                required 
                                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Work Email</label>
                            <input 
                                type="email" 
                                name="email"
                                value={formState.email}
                                onChange={handleChange}
                                required 
                                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                placeholder="john@company.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Message</label>
                            <textarea 
                                name="message"
                                value={formState.message}
                                onChange={handleChange}
                                required 
                                rows="4"
                                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none"
                                placeholder="Tell us about your compliance needs..."
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={status === 'submitting'}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-3 group relative overflow-hidden"
                        >
                            {/* Shiny effect overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            
                            {status === 'submitting' ? (
                                <>
                                    <Loader2 className="animate-spin" size={20}/>
                                    <span>Encrypting & Sending...</span>
                                </>
                            ) : (
                                <>
                                    <span>Send Secure Message</span>
                                    <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </motion.div>
      </div>
    </div>
  );
};

// Helper Component for List Items
const ContactItem = ({ icon: Icon, title, value, sub, color, bg }) => (
    <div className="flex items-start gap-5 group">
        <div className={`p-4 rounded-2xl ${bg} ${color} border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={24} />
        </div>
        <div>
            <h3 className="text-white font-bold text-lg">{title}</h3>
            <p className="text-slate-200 font-medium">{value}</p>
            <p className="text-slate-500 text-xs mt-1">{sub}</p>
        </div>
    </div>
);

export default ContactPage;