// src/components/IntegrityFocusPage.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, GitCommit, Database, Zap, HardHat, FileText, CheckCircle, RotateCw, Fingerprint } from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 10 } }
};

const FeatureCard = ({ icon: Icon, title, description, color }) => (
    <motion.div 
        className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 h-full flex flex-col transition-all duration-300 hover:shadow-2xl hover:border-blue-200"
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
    >
        <div className={`p-4 rounded-xl ${color === 'blue' ? 'bg-blue-50 text-blue-600' : color === 'purple' ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'} mb-5 inline-flex shadow-md`}>
            <Icon size={28} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-base text-slate-500 flex-1">{description}</p>
    </motion.div>
);

const IntegrityFocusPage = ({ setActiveTab }) => {
    return (
        <motion.div 
            className="min-h-screen bg-slate-50 text-slate-900 pt-32 pb-24"
            initial="hidden"
            animate="show"
            variants={containerVariants}
        >
            
            {/* --- HERO SECTION --- */}
            <div className="max-w-5xl mx-auto px-4 text-center mb-16 md:mb-24">
                <motion.p 
                    className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-3"
                    variants={itemVariants}
                >
                    The Foundation of Trust
                </motion.p>
                <motion.h1 
                    className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6"
                    variants={itemVariants}
                >
                    Your Logs are Proof. <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-[length:200%_auto] animate-shine">
                       We Make Them Immutable.
                    </span>
                </motion.h1>
                <motion.p 
                    className="text-xl text-slate-600 max-w-3xl mx-auto"
                    variants={itemVariants}
                >
                    Auditor Veritas is the only solution that provides a **cryptographically-verified, external chain of evidence** against regulatory scrutiny and internal manipulation.
                </motion.p>
            </div>

            {/* --- CORE PRINCIPLES --- */}
            <motion.div 
                className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
                variants={containerVariants}
            >
                <FeatureCard
                    icon={Fingerprint}
                    title="Immutable Audit Trail"
                    description="Every event is permanently hashed and chained using a Merkle Tree. Once a record exists, it cannot be altered, retroactively edited, or deleted."
                    color="blue"
                />
                <FeatureCard
                    icon={Shield}
                    title="External Trust Anchor"
                    description="Our logs are hosted outside your infrastructure. In an audit, this external, neutral source proves impartiality and enhances regulatory compliance."
                    color="purple"
                />
                <FeatureCard
                    icon={GitCommit}
                    title="Cryptographic Verification"
                    description="The integrity of your entire log history can be mathematically verified at any time using cryptographic proofs. True, verifiable trust."
                    color="emerald"
                />
            </motion.div>

            {/* --- COMPARISON SECTION (Why Not My Database?) --- */}
            <div className="bg-white py-16 md:py-24 border-t border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4">
                    <motion.h2 
                        className="text-4xl font-bold text-center mb-16 text-slate-900"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        Why Your Internal Database Isn't Enough
                    </motion.h2>
                    
                    <motion.div 
                        className="flex justify-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ delay: 0.2 }}
                    >
                        <table className="w-full max-w-5xl text-left border-collapse rounded-xl overflow-hidden shadow-lg">
                            <thead>
                                <tr className="bg-slate-900/90 text-white backdrop-blur-sm">
                                    <th className="p-5 text-base font-bold">Audit Criterion</th>
                                    <th className="p-5 text-base font-bold w-1/4">Internal Logs (MySQL/S3)</th>
                                    <th className="p-5 text-base font-bold w-1/4">Auditor Veritas (Immutable Audit)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                                    <td className="p-5 font-semibold text-slate-800 flex items-center gap-3"><RotateCw size={18} className="text-blue-500"/> Data Immutability</td>
                                    <td className="p-5 text-red-500">❌ **Mutable**. Can be deleted or back-dated by insiders.</td>
                                    <td className="p-5 text-emerald-600 font-bold flex items-center gap-2"><CheckCircle size={18} /> **100% Guaranteed** by cryptographic hashing.</td>
                                </tr>
                                <tr className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                                    <td className="p-5 font-semibold text-slate-800 flex items-center gap-3"><FileText size={18} className="text-blue-500"/> Trust Model</td>
                                    <td className="p-5 text-slate-500">Requires trust in the audited party's internal controls.</td>
                                    <td className="p-5 text-emerald-600 font-bold flex items-center gap-2"><CheckCircle size={18} /> **Zero-Trust**: Verification is external and mathematical.</td>
                                </tr>
                                <tr className="transition-colors hover:bg-slate-50">
                                    <td className="p-5 font-semibold text-slate-800 flex items-center gap-3"><Zap size={18} className="text-blue-500"/> Compliance Ready</td>
                                    <td className="p-5 text-slate-500">Manual evidence compilation. Time-consuming and costly.</td>
                                    <td className="p-5 text-emerald-600 font-bold flex items-center gap-2"><CheckCircle size={18} /> **Instant Proof:** Regulatory evidence is generated on demand.</td>
                                </tr>
                            </tbody>
                        </table>
                    </motion.div>
                </div>
            </div>

            {/* --- CTA SECTION --- */}
            <div className="max-w-7xl mx-auto px-4 pt-16 text-center">
                 <motion.h2 
                    className="text-4xl font-bold mb-4 text-slate-900"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                 >
                   Ready for Verifiable Compliance?
                 </motion.h2>
                 <motion.p 
                    className="text-slate-600 mb-8 text-lg"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ delay: 0.1 }}
                 >
                   Launch your Trusted Audit Engine and secure your logs in seconds.
                 </motion.p>
                 <motion.button 
                    onClick={() => setActiveTab('create')} 
                    className="px-10 py-4 rounded-full bg-blue-600 hover:bg-blue-700 font-bold shadow-2xl text-white transition-all text-lg hover:scale-[1.05]"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                 >
                    Get Started Now
                 </motion.button>
            </div>
        </motion.div>
    );
};

export default IntegrityFocusPage;