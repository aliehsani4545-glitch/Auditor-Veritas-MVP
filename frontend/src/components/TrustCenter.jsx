import React, { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import { 
  ShieldCheck, Lock, Fingerprint, Database, ArrowRight, 
  RefreshCw, Trash2, Link as LinkIcon, AlertTriangle, BookOpen, 
  CheckCircle2, Terminal, Key, FileText
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- SHARED UTILS ---
const SectionHeading = ({ children, id }) => (
    <h2 id={id} className="text-2xl md:text-3xl font-bold text-slate-900 mt-16 mb-6 scroll-mt-28 flex items-center gap-3 group">
        {children}
        <a href={`#${id}`} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-opacity">#</a>
    </h2>
);

const SubHeading = ({ children }) => (
    <h3 className="text-xl font-bold text-slate-800 mt-10 mb-4">{children}</h3>
);

const Paragraph = ({ children }) => (
    <p className="text-slate-600 leading-8 mb-6 text-lg font-light">{children}</p>
);

const CodeBlock = ({ label, children }) => (
    <div className="my-6 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
        <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest">
            {label}
        </div>
        <div className="p-4 font-mono text-sm text-slate-700 bg-white overflow-x-auto">
            {children}
        </div>
    </div>
);

const Citation = ({ num }) => (
    <a href="#references" className="align-top text-[10px] font-bold text-blue-600 bg-blue-50 px-1 rounded mx-0.5 hover:bg-blue-100 transition-colors cursor-pointer">
        [{num}]
    </a>
);

// --- LAB 1: IMMUTABILITY & MERKLE CHAINS ---
const ChainLab = () => {
    const [data1, setData1] = useState("Transaction: $5,000.00 USD");
    const [data2, setData2] = useState("Authorized by: Admin_01");
    
    const hash1 = CryptoJS.SHA256(data1).toString().substring(0, 24);
    const hash2 = CryptoJS.SHA256(data2 + hash1).toString().substring(0, 24); 
    const [genesisHash, setGenesisHash] = useState("");
    
    useEffect(() => { if (!genesisHash) setGenesisHash(hash1); }, [hash1, genesisHash]);
    const isTampered = hash1 !== genesisHash;

    return (
        <div className="my-12 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden ring-1 ring-slate-900/5">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Fingerprint size={14} className="text-blue-500"/> 
                    Figure 1.1: The Avalanche Effect in Hash Chains
                </span>
                {isTampered ? (
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold animate-pulse">
                        <AlertTriangle size={12}/> Integrity Violation
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                        <CheckCircle2 size={12}/> Valid Chain
                    </span>
                )}
            </div>
            
            <div className="p-6 md:p-8 space-y-8">
                <div className="flex flex-col md:flex-row gap-6 items-stretch relative">
                    
                    {/* BLOCK T-0 */}
                    <div className={`flex-1 relative p-6 rounded-xl border-2 transition-all duration-300 ${isTampered ? 'bg-red-50/50 border-red-200' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                        <div className="absolute -top-3 left-4 bg-white px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border border-slate-200 rounded">Block N (History)</div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Payload Data</label>
                                <input type="text" value={data1} onChange={(e) => setData1(e.target.value)} className={`w-full bg-slate-50 border ${isTampered ? 'border-red-300 text-red-700' : 'border-slate-200 text-slate-700'} rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`} />
                            </div>
                            
                            <div className="pt-2 border-t border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Block Hash (Hₙ)</span>
                                <code className={`block text-xs break-all font-bold ${isTampered ? 'text-red-600' : 'text-blue-600'}`}>
                                    {hash1}...
                                </code>
                            </div>
                        </div>
                    </div>

                    {/* CONNECTOR */}
                    <div className="hidden md:flex flex-col justify-center items-center text-slate-300 z-10">
                        <div className={`h-0.5 w-8 ${isTampered ? 'bg-red-300' : 'bg-slate-300'}`} />
                        <LinkIcon size={16} className={isTampered ? "text-red-400" : "text-slate-400"}/>
                        <div className={`h-0.5 w-8 ${isTampered ? 'bg-red-300' : 'bg-slate-300'}`} />
                    </div>

                    {/* BLOCK T-1 */}
                    <div className="flex-1 relative p-6 rounded-xl border-2 border-slate-200 bg-slate-50/50">
                        <div className="absolute -top-3 left-4 bg-slate-50 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border border-slate-200 rounded">Block N+1 (Current)</div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Payload Data</label>
                                <input type="text" value={data2} readOnly className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-500 cursor-not-allowed"/>
                            </div>
                            <div className="p-3 bg-white border border-slate-200 rounded-lg">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Dependency (Hₙ)</label>
                                <code className={`text-xs break-all ${isTampered ? 'text-red-600 font-bold bg-red-50 px-1 rounded' : 'text-slate-600'}`}>{hash1}...</code>
                            </div>
                            <div className="pt-2 border-t border-slate-200">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Resulting Hash (Hₙ₊₁)</span>
                                <code className="block text-xs text-slate-500 break-all mt-1">{hash2}...</code>
                            </div>
                        </div>
                    </div>
                </div>
                {isTampered && (
                    <div className="flex justify-center mt-8">
                        <button onClick={() => { setData1("Transaction: $5,000.00 USD"); setGenesisHash(""); }} className="flex items-center gap-2 px-6 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg hover:bg-slate-700 transition-all shadow-lg">
                            <RefreshCw size={16}/> Restore Database Integrity
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- LAB 2: CRYPTO-SHREDDING (GDPR) ---
const CryptoLab = () => {
    const [keyStatus, setKeyStatus] = useState('active'); 
    const [data] = useState("PII: User_ID_88392_Passport_Scan");
    const activeKey = "AES_KEY_V1_83829";
    const encryptedData = CryptoJS.AES.encrypt(data, activeKey).toString();
    
    let readableData = "ENCRYPTED_BLOB_XY92...";
    let isReadable = false;

    if (keyStatus === 'active') {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedData, activeKey);
            const str = bytes.toString(CryptoJS.enc.Utf8);
            if(str) { readableData = str; isReadable = true; }
        } catch(e) {}
    }

    return (
        <div className="my-12 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden ring-1 ring-slate-900/5">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Trash2 size={14} className="text-purple-500"/> 
                    Figure 2.1: Cryptographic Erasure (NIST SP 800-88)
                </span>
            </div>
            
            <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2"><Database size={16} className="text-slate-400"/> Database Layer</h4>
                            <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">Immutable Storage</span>
                        </div>
                        <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                            <code className="text-xs font-mono text-slate-400 break-all leading-relaxed"><span className="text-blue-400">0x</span>{encryptedData.substring(0, 180)}...</code>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">The log entry persists forever to maintain the Merkle chain's integrity. However, it is mathematically indistinguishable from random noise without the key.</p>
                    </div>
                    <div className="flex flex-col justify-between space-y-6">
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4"><Key size={16} className="text-slate-400"/> Key Management System (KMS)</h4>
                            <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${keyStatus === 'active' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/50 border-red-100'}`}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">Decryption Key Status</span>
                                    {keyStatus === 'active' ? <Lock size={14} className="text-emerald-500"/> : <Trash2 size={14} className="text-red-500"/>}
                                </div>
                                <div className={`text-sm font-mono font-bold ${keyStatus === 'active' ? 'text-emerald-700' : 'text-red-600 line-through'}`}>{keyStatus === 'active' ? activeKey : '0x00000000000000'}</div>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 mb-2">Read Attempt Result</h4>
                            <div className={`p-4 rounded-xl border flex items-center justify-center min-h-[60px] ${isReadable ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-100 border-slate-200'}`}>
                                {isReadable ? <span className="text-sm font-mono text-slate-700">{readableData}</span> : <span className="text-sm font-mono text-slate-400 italic flex items-center gap-2"><Lock size={14}/> Access Denied: Missing Key</span>}
                            </div>
                        </div>
                        <button onClick={() => setKeyStatus(keyStatus === 'active' ? 'destroyed' : 'active')} className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${keyStatus === 'active' ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-500/20' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
                            {keyStatus === 'active' ? 'Execute Article 17 Erasure (Shred Key)' : 'Reset Simulation'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TOCLink = ({ id, label, activeId }) => (
    <a 
        href={`#${id}`} 
        className={`block text-sm py-2 pl-4 border-l-2 transition-colors ${activeId === id ? 'border-blue-600 text-blue-600 font-bold' : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-400'}`}
    >
        {label}
    </a>
);

const Reference = ({ id, text, link }) => (
    <li className="text-sm text-slate-600 mb-3 pl-2 leading-relaxed" id={`ref-${id}`}>
        <span className="font-bold text-slate-900 mr-2 select-none">[{id}]</span>
        {text}
        {link && (
            <a href={link} target="_blank" rel="noreferrer" className="ml-2 text-blue-600 hover:text-blue-800 hover:underline text-xs inline-flex items-center gap-0.5">
                View Standard <ArrowRight size={10}/>
            </a>
        )}
    </li>
);


// --- MAIN PAGE ---
const TrustCenter = ({ setActiveTab }) => { // <-- TAR EMOT activeTab SOM PROP
  const [activeSection, setActiveSection] = useState('intro');

  useEffect(() => {
    const handleScroll = () => {
        const sections = ['intro', 'threat-model', 'architecture', 'privacy', 'verification', 'references'];
        for (const section of sections) {
            const el = document.getElementById(section);
            if (el && window.scrollY >= (el.offsetTop - 200)) {
                setActiveSection(section);
            }
        }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-32 animate-fade-in">
      
      {/* HEADER / ABSTRACT */}
      <header className="pt-32 pb-20 px-6 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-slate-600 text-xs font-bold uppercase mb-8 tracking-wide border border-slate-200 shadow-sm">
                <BookOpen size={14} /> Technical Whitepaper v2.1
            </motion.div>
            
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-serif font-bold text-slate-900 mb-8 leading-tight">
                The Cryptographic Architecture of <br/><span className="text-blue-700 underline decoration-blue-200 decoration-4 underline-offset-4">Verifiable</span> Audit Trails
            </motion.h1>
            
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-xl text-slate-600 leading-relaxed font-light max-w-3xl">
                <strong>Abstract.</strong> Modern compliance standards (GDPR, SOC2, HIPAA) fundamentally clash with traditional database architectures. 
                This document details how Auditor Veritas solves the "Immutable vs. Deletable" paradox using Merkle Directed Acyclic Graphs (DAGs) <Citation num="1"/> and AES-256-GCM authenticated encryption <Citation num="2"/>.
            </motion.p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-16">
        
        {/* SIDEBAR NAVIGATION (Sticky) */}
        <aside className="lg:w-64 flex-shrink-0 hidden lg:block">
            <div className="sticky top-32">
                <h4 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-widest">Table of Contents</h4>
                <nav className="space-y-1">
                    <TOCLink id="intro" label="1. Introduction" activeId={activeSection}/>
                    <TOCLink id="threat-model" label="2. Threat Model" activeId={activeSection}/>
                    <TOCLink id="architecture" label="3. Chain Architecture" activeId={activeSection}/>
                    <TOCLink id="privacy" label="4. Privacy & GDPR" activeId={activeSection}/>
                    <TOCLink id="verification" label="5. Verification" activeId={activeSection}/>
                    <TOCLink id="references" label="References" activeId={activeSection}/>
                </nav>
                <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-800 mb-3 font-medium">Ready to implement?</p>
                    <button 
                        onClick={() => setActiveTab('dashboard')} // <-- ACTION TILLAGD HÄR
                        className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Get API Access
                    </button>
                </div>
            </div>
        </aside>

        {/* MAIN CONTENT */}
        <article className="lg:flex-1 max-w-3xl">
            
            {/* 1. INTRODUCTION */}
            <SectionHeading id="intro">1. Introduction</SectionHeading>
            <Paragraph>
                In the era of zero-trust architecture, the statement "the logs show X" is insufficient proof. 
                Traditional relational databases (PostgreSQL, MySQL) and NoSQL stores (MongoDB) are mutable by design. 
                An administrator with sufficient privileges (`root` or `admin`) can execute an `UPDATE` or `DELETE` command to alter historical records silently.
            </Paragraph>
            <Paragraph>
                This vulnerability, known as <strong>Silent Corruption</strong>, renders standard databases unsuitable for high-stakes evidence storage.
                Auditor Veritas addresses this by implementing a "Write-Once, Read-Many" (WORM) architecture enforced by cryptography, not just access controls.
            </Paragraph>

            {/* 2. THREAT MODEL */}
            <SectionHeading id="threat-model">2. Threat Model</SectionHeading>
            <Paragraph>
                We design our system to assume that the database layer itself is compromised. Our security guarantees hold true even under the following conditions:
            </Paragraph>
            <ul className="list-disc pl-6 space-y-4 text-slate-600 mb-8 font-light">
                <li><strong>Internal Actor:</strong> A rogue database administrator attempts to retroactively modify a transaction log to cover up embezzlement.</li>
                <li><strong>External Breach:</strong> An attacker gains SQL injection access and attempts to truncate logs.</li>
                <li><strong>Cloud Provider Risk:</strong> The underlying storage provider suffers a data integrity failure.</li>
            </ul>
            <div className="bg-slate-50 p-6 rounded-xl border-l-4 border-slate-900 italic text-slate-700">
                "Security must depend on the secrecy of the key, not the secrecy of the system." — <strong>Kerckhoffs's Principle</strong>
            </div>

            {/* 3. ARCHITECTURE */}
            <SectionHeading id="architecture">3. The Chain Architecture</SectionHeading>
            <Paragraph>
                To guarantee immutability, we utilize a sequential hash chain. Each log entry L(n) is not stored in isolation. 
                Instead, it contains a cryptographic hash of the immediately preceding entry H(n-1).
            </Paragraph>
            <CodeBlock label="Mathematical Definition">
                H(n) = SHA256( Data(n) || H(n-1) )
            </CodeBlock>
            <Paragraph>
                This creates a recursive dependency. It is computationally impossible to find a different input Data' that produces the same hash H(n) (Preimage Resistance). 
                Consequently, any modification to a historical record L(n-k) would change its hash, which would propagate forward, invalidating the entire subsequent chain.
            </Paragraph>
            
            <ChainLab />

            {/* 4. PRIVACY */}
            <SectionHeading id="privacy">4. Privacy & The Erasure Paradox</SectionHeading>
            <Paragraph>
                A strictly immutable blockchain is incompatible with privacy laws like GDPR Article 17 ("Right to be Forgotten") <Citation num="3"/>. 
                If personal data is written to an immutable ledger, it cannot be legally deleted.
            </Paragraph>
            <SubHeading>The Solution: Crypto-Shredding</SubHeading>
            <Paragraph>
                Auditor Veritas implements <strong>Cryptographic Erasure</strong> (NIST SP 800-88). 
                We separate the data from the keys required to read it.
            </Paragraph>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 mb-6 font-light">
                <li>Every user/subject is assigned a unique **Data Encryption Key (DEK)**.</li>
                <li>All sensitive payloads are encrypted with this DEK using **AES-256-GCM**.</li>
                <li>To "delete" a user, we do not touch the immutable log. Instead, we permanently destroy their DEK.</li>
            </ul>
            <Paragraph>
                The encrypted data remains in the chain (preserving integrity), but it becomes high-entropy noise that is mathematically impossible to decrypt.
            </Paragraph>

            <CryptoLab />

            {/* 5. VERIFICATION */}
            <SectionHeading id="verification">5. Verification Protocols</SectionHeading>
            <Paragraph>
                Trust is established through verification, not assertion. Auditors can perform offline verification of the entire log chain.
                For large datasets, we construct a <strong>Merkle Tree</strong> where the root hash represents the state of millions of logs.
            </Paragraph>
            <Paragraph>
                This allows for $O(\log n)$ verification proofs (Merkle Proofs), enabling a lightweight client to verify a single transaction's inclusion without downloading the entire terabyte-scale ledger.
            </Paragraph>
            <CodeBlock label="Verification Algorithm (Pseudo-code)">
{`function verify(proof, targetHash, merkleRoot) {
  let currentHash = targetHash;
  
  for (const sibling of proof) {
    if (sibling.position === 'left') {
      currentHash = hash(sibling.hash + currentHash);
    } else {
      currentHash = hash(currentHash + sibling.hash);
    }
  }
  
  return currentHash === merkleRoot; // Boolean
}`}
            </CodeBlock>

            {/* 6. REFERENCES */}
            <SectionHeading id="references">References & Standards</SectionHeading>
            <ul className="space-y-4">
                <li className="text-sm text-slate-600 pl-2 border-l-2 border-transparent hover:border-blue-500 transition-colors">
                    <span className="font-bold text-slate-900 mr-2">[1]</span>
                    Merkle, R. C. (1980). "Protocols for public key cryptosystems". IEEE Symposium on Security and Privacy.
                </li>
                <li className="text-sm text-slate-600 pl-2 border-l-2 border-transparent hover:border-blue-500 transition-colors">
                    <span className="font-bold text-slate-900 mr-2">[2]</span>
                    NIST (2001). FIPS 197: Advanced Encryption Standard (AES). <a href="#" className="text-blue-600 hover:underline">View Standard</a>
                </li>
                <li className="text-sm text-slate-600 pl-2 border-l-2 border-transparent hover:border-blue-500 transition-colors">
                    <span className="font-bold text-slate-900 mr-2">[3]</span>
                    Regulation (EU) 2016/679 (GDPR). Article 17: Right to Erasure ('Right to be Forgotten').
                </li>
                <li className="text-sm text-slate-600 pl-2 border-l-2 border-transparent hover:border-blue-500 transition-colors">
                    <span className="font-bold text-slate-900 mr-2">[4]</span>
                    NIST (2014). SP 800-88 Rev. 1: Guidelines for Media Sanitization.
                </li>
            </ul>

        </article>
      </div>
    </div>
  );
};

export default TrustCenter;