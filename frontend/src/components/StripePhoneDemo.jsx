import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Shield, CheckCircle2, Lock, Server, Database, Activity, Fingerprint, 
    Hash, Zap, Cpu, ShieldCheck 
} from 'lucide-react'; 
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger safely
if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

// --- SUB-COMPONENTS ---

// 1. Background Particles
const ParticleField = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute bg-blue-500/10 rounded-full blur-xl"
                style={{
                    width: Math.random() * 150 + 50,
                    height: Math.random() * 150 + 50,
                    top: Math.random() * 100 + '%',
                    left: Math.random() * 100 + '%',
                }}
                animate={{
                    y: [0, -40, 0],
                    x: [0, 20, 0],
                    opacity: [0.2, 0.5, 0.2],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: Math.random() * 10 + 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
        ))}
    </div>
);

// 2. Glass Node (Left/Right Icons)
const FloatingNode = ({ icon: Icon, title, subtitle, align = "left", active }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9, x: align === 'left' ? -20 : 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        className={`absolute top-1/2 -translate-y-1/2 ${align === "left" ? "left-4 md:-left-16" : "right-4 md:-right-16"} 
          hidden md:flex flex-col items-center justify-center p-5 rounded-2xl 
          bg-[#0f172a]/60 backdrop-blur-xl border border-white/10 shadow-2xl z-10 w-40 h-44
          ${active ? 'shadow-[0_0_40px_-10px_rgba(59,130,246,0.4)] border-blue-500/30' : ''} transition-all duration-700`}
    >
        <div className={`relative w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-500 ${active ? 'bg-blue-500/20' : 'bg-slate-800/50'}`}>
            <Icon size={28} className={active ? "text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]" : "text-slate-500"} />
            {active && (
                <>
                    <motion.div 
                        className="absolute inset-0 rounded-full border border-blue-400/50"
                        animate={{ scale: [1, 1.4], opacity: [1, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div 
                        className="absolute inset-0 rounded-full border border-cyan-400/30"
                        animate={{ scale: [1, 1.2], opacity: [0.5, 0] }}
                        transition={{ duration: 2, delay: 0.5, repeat: Infinity }}
                    />
                </>
            )}
        </div>
        <div className="text-center">
            <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${active ? "text-white text-shadow-sm" : "text-slate-500"}`}>{title}</div>
            <div className="text-[10px] text-slate-400 font-mono">{subtitle}</div>
        </div>
    </motion.div>
);

// 3. Data Stream (Animated beams)
const DataStream = ({ active, align = "left" }) => (
    <div className={`absolute top-1/2 -translate-y-1/2 ${align === "left" ? "left-[90px] w-[200px]" : "right-[90px] w-[200px]"} h-[2px] hidden md:block -z-10 overflow-visible`}>
        <div className="absolute inset-0 bg-slate-800/30 rounded-full" />
        <AnimatePresence>
            {active && (
                <>
                    <motion.div 
                        className="absolute top-1/2 -translate-y-1/2 h-[3px] bg-gradient-to-r from-transparent via-blue-400 to-transparent blur-[1px]"
                        style={{ width: '40%' }}
                        initial={{ left: align === "left" ? "-40%" : "140%", opacity: 0 }}
                        animate={{ left: align === "left" ? "140%" : "-40%", opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div 
                        className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]"
                        initial={{ left: align === "left" ? "0%" : "100%" }}
                        animate={{ left: align === "left" ? "100%" : "0%" }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                </>
            )}
        </AnimatePresence>
    </div>
);

// 4. Log Item Component
const LogItem = ({ id, action, hash, status, delay }) => (
    <motion.div 
        layout
        initial={{ opacity: 0, x: -10, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay, type: "spring", stiffness: 400, damping: 25 }}
        className="group relative flex items-center justify-between p-3 mb-2 rounded-xl bg-[#0f172a]/80 border border-white/5 hover:border-white/20 transition-all overflow-hidden"
    >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center gap-3 relative z-10">
            <div className={`p-2 rounded-lg ${status === 'secure' ? 'bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_-2px_rgba(16,185,129,0.3)]' : 'bg-blue-500/10 text-blue-400'}`}>
                {status === 'secure' ? <Lock size={14} /> : <Activity size={14} className="animate-pulse" />}
            </div>
            <div>
                <div className="text-[12px] font-semibold text-slate-200 tracking-tight">{action}</div>
                <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                    <Hash size={10} className="text-slate-600" /> {hash}
                </div>
            </div>
        </div>
        {status === 'secure' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative z-10 p-1 bg-emerald-500/10 rounded-full">
                <CheckCircle2 size={14} className="text-emerald-500" />
            </motion.div>
        )}
    </motion.div>
);

// 5. Scroll Section Component
const ScrollSection = ({ title, description, children, id, isActive }) => (
    <div 
        id={id}
        className={`scroll-section min-h-screen flex flex-col justify-center px-4 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-20 blur-[1px]'}`}
    >
        <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-extrabold mb-4 text-white max-w-lg leading-tight"
        >
            {title}
        </motion.h2>
        <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-slate-400 max-w-xl mb-8"
        >
            {description}
        </motion.p>
        <div className="space-y-4 max-w-xl text-slate-300">
            {children}
        </div>
    </div>
);

// Helper for Text Features
const FeatureBox = ({ icon: Icon, title, text }) => (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
        <Icon size={20} className="text-blue-400 mt-1 flex-shrink-0" />
        <div>
            <h4 className="font-bold text-white text-sm mb-1">{title}</h4>
            <p className="text-slate-400 text-sm">{text}</p>
        </div>
    </div>
);


// --- MAIN COMPONENT ---
const StripePhoneDemo = () => {
    const componentRef = useRef(null);
    const [activeStep, setActiveStep] = useState(0); 

    const [logs, setLogs] = useState([
        { id: 1, action: "auth.session_start", hash: "0x8a...f1", status: "secure" },
        { id: 2, action: "user.data_access", hash: "0x3c...b9", status: "secure" },
    ]);
    const logRef = useRef(null);

    // --- GSAP LOGIC (STATE ONLY) ---
    // We use CSS 'sticky' for positioning, and GSAP only to detect which section is in view.
    useEffect(() => {
        let ctx = gsap.context(() => {
            const sections = gsap.utils.toArray('.scroll-section');
            sections.forEach((section, i) => {
                ScrollTrigger.create({
                    trigger: section,
                    start: "top center", // When top of section hits center of viewport
                    end: "bottom center", // When bottom of section hits center of viewport
                    onToggle: self => {
                        if (self.isActive) setActiveStep(i);
                    },
                });
            });
        }, componentRef); // Scope to this component

        return () => ctx.revert(); // Cleanup
    }, []); 

    // --- ANIMATION LOGIC ---
    useEffect(() => {
        const highestId = logs.length > 0 ? logs[logs.length - 1].id : 0;
        const safeSetLogs = (updater) => {
            setLogs(currentLogs => {
                 const newLogs = updater(currentLogs);
                 return JSON.stringify(newLogs) !== JSON.stringify(currentLogs) ? newLogs : currentLogs;
            });
        };

        if (activeStep === 0 && highestId > 2) {
            setLogs([
                { id: 1, action: "auth.session_start", hash: "0x8a...f1", status: "secure" },
                { id: 2, action: "user.data_access", hash: "0x3c...b9", status: "secure" },
            ]);
        }
        
        if (activeStep === 1 && highestId < 3) {
            safeSetLogs(prev => [...prev, { id: 3, action: "transaction.payment_create", hash: "pending...", status: "processing" }]);
        }
        
        if (activeStep === 2) {
            if (highestId >= 3 && logs.find(l => l.id === 3 && l.status === 'processing')) {
                 setTimeout(() => safeSetLogs(prev => prev.map(log => log.id === 3 ? { ...log, hash: "0x9d...e2", status: "secure" } : log)), 800);
            }
            if (highestId === 3 && logs.find(l => l.id === 3 && l.status === 'secure')) {
                 setTimeout(() => safeSetLogs(prev => [...prev, { id: 4, action: "user.data_shredding", hash: "0xaa...1a", status: "processing" }]), 200);
            }
        }
        
        if (activeStep === 3) {
            if (highestId >= 4 && logs.find(l => l.id === 4 && l.status === 'processing')) {
                 setTimeout(() => safeSetLogs(prev => prev.map(log => log.id === 4 ? { ...log, hash: "0xaa...1a", status: "secure" } : log)), 800);
            }
            if (highestId === 4 && logs.find(l => l.id === 4 && l.status === 'secure')) {
                 setTimeout(() => safeSetLogs(prev => [...prev, { id: 5, action: "system.merkle_append", hash: "ROOT-HASH-...", status: "processing" }]), 200);
            }
        }
        
        if (activeStep === 4) {
             if (highestId >= 5 && logs.find(l => l.id === 5 && l.status === 'processing')) {
                 setTimeout(() => safeSetLogs(prev => prev.map(log => log.id === 5 ? { ...log, hash: "0xf0...7b", status: "secure" } : log)), 800);
             }
             if (highestId === 5 && logs.find(l => l.id === 5 && l.status === 'secure')) {
                 setTimeout(() => safeSetLogs(prev => [...prev, { id: 6, action: "system.report_ready", hash: "0x11...c3", status: "secure" }]), 200);
            }
        }
    }, [activeStep, logs]); 

    // Auto-scroll logs
    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [logs]);


    return (
        <div className="relative pt-20 pb-20" ref={componentRef}>
            <ParticleField />
            
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-start relative">
                
                {/* --- LEFT COLUMN: SCROLLABLE TEXT --- */}
                {/* This column flows naturally and dictates the page height */}
                <div className="relative z-20 w-full md:w-1/2">
                    <ScrollSection 
                        id="step-0" 
                        isActive={activeStep === 0} 
                        title="1. Initialization & Secure Access"
                        description="Every interaction starts with an identified user. We log the session and authenticate access to the user's unique Crypto-Shredding Key."
                    >
                        <FeatureBox icon={Fingerprint} title="User Hashing" text="The identifier is immediately hashed client-side to comply with GDPR pseudonymization requirements." />
                        <FeatureBox icon={Lock} title="Key Distribution" text="The unique encryption key is retrieved from the Vault, securely encrypted with the Master Key." />
                    </ScrollSection>
                    
                    <ScrollSection 
                        id="step-1" 
                        isActive={activeStep === 1} 
                        title="2. Transaction & Preparation"
                        description="When a critical event occurs (e.g., a payment), the system immediately prepares the data for logging. This ensures the log remains intact even if the primary transaction fails."
                    >
                        <FeatureBox icon={Zap} title="Real-Time Capture" text="The event is captured by the system, initiating a new log entry." />
                        <FeatureBox icon={Activity} title="Incoming Data Stream" text="Raw data (e.g., transaction amount, timestamp) is streamed into the dedicated audit node." />
                    </ScrollSection>

                    <ScrollSection 
                        id="step-2" 
                        isActive={activeStep === 2} 
                        title="3. Encryption & Integrity Hash"
                        description="Before the data is stored, it is encrypted using the user's unique key. An integrity hash (SHA-256) is then calculated to cryptographically prove the log entry's authenticity."
                    >
                        <FeatureBox icon={Shield} title="End-to-End Logging" text="Log data is encrypted with AES-256. Only the user's key can decrypt the stored payload." />
                        <FeatureBox icon={Hash} title="Data Immutability" text="The integrity hash includes all metadata plus the encrypted payload. This renders any single log unalterable without detection." />
                    </ScrollSection>

                    <ScrollSection 
                        id="step-3" 
                        isActive={activeStep === 3} 
                        title="4. Merkle Tree Append"
                        description="The new integrity hash is added to the bottom of the Merkle Tree. The tree recursively updates hash values up to the Merkle Root, linking the new event to the entire history."
                    >
                        <FeatureBox icon={Database} title="Encrypted Merkle" text="The tree is built with hashes of the encrypted logs, ensuring data privacy at the root level." />
                        <FeatureBox icon={Cpu} title="Proof of Existence" text="The Merkle Root is the single proof. If any log is altered, the root changes—making tampering immediately detectable." />
                    </ScrollSection>
                    
                    <ScrollSection 
                        id="step-4" 
                        isActive={activeStep === 4} 
                        title="5. Completion & Compliance Report"
                        description="Once the Merkle Root is updated, the log entry is permanently secured. A complete report can now be generated proving GDPR compliance (Art. 30/32) and data integrity."
                    >
                        <FeatureBox icon={ShieldCheck} title="Real-Time Compliance" text="Every step is cryptographically verified and confirmed in the log in real-time." />
                        <FeatureBox icon={ShieldCheck} title="Legal Audit Trail" text="Full documentation, complete with tamper-proof evidence for auditors." />
                    </ScrollSection>
                </div>

                {/* --- RIGHT COLUMN: STICKY PHONE --- */}
                {/* CSS 'sticky' handles the pinning automatically. h-screen ensures it's always centered. top-0 makes it stick to the top. */}
                <div className="hidden md:flex w-1/2 h-screen sticky top-0 items-center justify-center pointer-events-none"> 
                    <div className="relative w-full max-w-lg h-[600px] flex items-center justify-center overflow-visible pointer-events-auto">
                        
                        {/* Nodes and Beams */}
                        <FloatingNode 
                            icon={Server} 
                            title="Application" 
                            subtitle="Source Origin" 
                            align="left" 
                            active={activeStep >= 1 && activeStep <= 4} 
                        />
                        <DataStream align="left" active={activeStep >= 1 && activeStep <= 4} />
                        
                        <FloatingNode 
                            icon={Database} 
                            title="Ledger" 
                            subtitle="Immutable Proof" 
                            align="right" 
                            active={activeStep >= 3 && activeStep <= 4} 
                        />
                        <DataStream align="right" active={activeStep >= 3 && activeStep <= 4} />

                        {/* --- THE PHONE --- */}
                        <motion.div
                            key="phone"
                            className="relative z-20 w-[320px] h-[620px] bg-[#020617] rounded-[50px] border-[8px] border-[#1e293b] shadow-2xl overflow-hidden transition-all duration-500"
                            style={{ boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.8)' }}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="absolute top-0 right-0 w-full h-[60%] bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-40 rounded-t-[40px]"></div>
                            
                            {/* Notch */}
                            <div className="absolute top-4 inset-x-0 z-50 flex justify-center">
                                <motion.div 
                                    className="bg-black rounded-full h-8 flex items-center justify-center px-4 gap-3 shadow-lg border border-white/5"
                                    animate={{ width: activeStep >= 1 && activeStep <= 3 ? 140 : 100 }}
                                >
                                    {(activeStep >= 1 && activeStep <= 3) && <Activity size={14} className="text-emerald-400 animate-pulse" />}
                                    <div className="w-16 h-1.5 bg-slate-800/50 rounded-full" />
                                    {(activeStep >= 1 && activeStep <= 3) && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />}
                                </motion.div>
                            </div>

                            {/* Screen Content */}
                            <div className="h-full w-full bg-[#020617] flex flex-col font-sans text-white relative">
                                <div className="pt-16 px-6 pb-6 bg-gradient-to-b from-[#0f172a] to-[#020617] border-b border-white/5">
                                    <div className="flex justify-between items-center mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/30">
                                                <Shield size={20} fill="currentColor" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm tracking-tight text-white">Veritas</div>
                                                <div className="text-[10px] text-slate-400 font-medium">Enterprise Console</div>
                                            </div>
                                        </div>
                                        <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor] transition-colors duration-500 ${activeStep >= 1 ? 'bg-amber-400 text-amber-400' : 'bg-emerald-500 text-emerald-500'}`}></div>
                                    </div>
                                    <div className="relative group perspective">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-1000 blur-md"></div>
                                        <div className="relative bg-[#0f172a] p-5 rounded-2xl border border-white/10 overflow-hidden shadow-xl">
                                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                                            <div className="relative z-10 flex justify-between items-end">
                                                <div>
                                                    <div className="text-[10px] text-blue-400 uppercase font-bold tracking-wider mb-2 flex items-center gap-1"><Lock size={10} /> Secured Events</div>
                                                    <div className="text-4xl font-bold text-white tracking-tight flex items-baseline gap-1">
                                                        <AnimatePresence mode="popLayout">
                                                            <motion.span
                                                                key={logs.filter(l => l.status === 'secure').length}
                                                                initial={{ y: 10, opacity: 0 }}
                                                                animate={{ y: 0, opacity: 1 }}
                                                                className="inline-block bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400"
                                                            >
                                                                {logs.filter(l => l.status === 'secure').length + 842}
                                                            </motion.span>
                                                        </AnimatePresence>
                                                    </div>
                                                </div>
                                                <Fingerprint size={40} className="text-slate-700 opacity-50" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 px-4 py-4 relative overflow-hidden flex flex-col"> 
                                    <div className="flex items-center justify-between px-2 mb-3">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Live Ledger Feed</div>
                                        <div className="text-[9px] font-mono text-slate-600 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">NET: ONLINE</div>
                                    </div>
                                    <div className="relative flex-1">
                                        <AnimatePresence>
                                            {(activeStep >= 1 && activeStep <= 3) && (
                                                <motion.div 
                                                    key="scanline"
                                                    className="absolute inset-x-0 h-[2px] bg-cyan-400 shadow-[0_0_20px_2px_rgba(34,211,238,0.6)] z-20 pointer-events-none"
                                                    initial={{ top: 0, opacity: 0 }}
                                                    animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
                                                    transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                                                />
                                            )}
                                        </AnimatePresence>
                                        <div ref={logRef} className="h-[300px] overflow-y-auto space-y-1 pr-1 pb-16 scroll-smooth no-scrollbar mask-image-bottom">
                                            <AnimatePresence initial={false}>
                                                {logs.map((log) => (
                                                    <LogItem key={log.id} {...log} delay={0.1} />
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent pointer-events-none z-20"></div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {(activeStep >= 1 && activeStep <= 3) && (
                                        <motion.div 
                                            key="status-box"
                                            initial={{ y: 40, opacity: 0, scale: 0.9 }}
                                            animate={{ y: 0, opacity: 1, scale: 1 }}
                                            exit={{ y: 40, opacity: 0, scale: 0.9 }}
                                            className="absolute bottom-8 inset-x-6 bg-[#1e293b]/80 backdrop-blur-xl p-3.5 rounded-2xl border border-blue-500/20 shadow-2xl z-30 flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-3.5">
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-30"></div>
                                                    <div className="relative p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full text-white shadow-lg">
                                                        <Zap size={14} fill="currentColor"/>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-white tracking-wide">
                                                        {activeStep === 1 ? 'Event Captured' : activeStep === 2 ? 'Encrypting & Hashing' : 'Merkle Commit'}
                                                    </span>
                                                    <span className="text-[10px] text-blue-300 font-medium">Processing Integrity...</span>
                                                </div>
                                            </div>
                                            <div className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/30 px-2 py-1 rounded">LIVE</div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>

                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[700px] bg-blue-600/10 blur-[120px] -z-10 rounded-full pointer-events-none mix-blend-screen animate-pulse-slow"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StripePhoneDemo;