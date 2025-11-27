

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
        className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100 h-full flex flex-col transition-all duration-300 hover:shadow-2xl hover:border-blue-200"
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
    >
        <div className={`p-4 rounded-xl ${color === 'blue' ? 'bg-blue-50 text-blue-600' : color === 'purple' ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'} mb-5 inline-flex shadow-md w-fit`}>
            <Icon size={28} />
        </div>
        <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-sm md:text-base text-slate-500 flex-1 leading-relaxed">{description}</p>
    </motion.div>
);

const IntegrityFocusPage = ({ setActiveTab }) => {
    return (
        <motion.div 
            className="min-h-screen bg-slate-50 text-slate-900 pt-24 md:pt-32 pb-16 md:pb-24"
            initial="hidden"
            animate="show"
            variants={containerVariants}
        >
            
            {/* --- HERO SECTION --- */}
            <div className="max-w-5xl mx-auto px-4 text-center mb-12 md:mb-24">
                <motion.p 
                    className="text-xs md:text-sm font-bold uppercase tracking-widest text-blue-600 mb-3"
                    variants={itemVariants}
                >
                    The Foundation of Trust
                </motion.p>
                <motion.h1 
                    className="text-4xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6"
                    variants={itemVariants}
                >
                    Your Logs are Proof. <br className="hidden md:block"/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-[length:200%_auto] animate-shine">
                       We Make Them Immutable.
                    </span>
                </motion.h1>
                <motion.p 
                    className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto px-2"
                    variants={itemVariants}
                >
                    Auditor Veritas is the only solution that provides a **cryptographically-verified, external chain of evidence** against regulatory scrutiny and internal manipulation.
                </motion.p>
            </div>

            {/* --- CORE PRINCIPLES --- */}
            <motion.div 
                className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-20"
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
                        className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16 text-slate-900"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                    >
                        Why Your Internal Database Isn't Enough
                    </motion.h2>
                    
                    <motion.div 
                        className="flex justify-center overflow-x-auto pb-4" // Horizontal scroll on mobile
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="min-w-[600px] md:min-w-0 w-full max-w-5xl"> {/* Ensure table doesn't squish */}
                            <table className="w-full text-left border-collapse rounded-xl overflow-hidden shadow-lg">
                                <thead>
                                    <tr className="bg-slate-900/90 text-white backdrop-blur-sm text-sm md:text-base">
                                        <th className="p-4 md:p-5 font-bold">Audit Criterion</th>
                                        <th className="p-4 md:p-5 font-bold w-1/3">Internal Logs (MySQL/S3)</th>
                                        <th className="p-4 md:p-5 font-bold w-1/3">Auditor Veritas (Immutable)</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm md:text-base">
                                    <tr className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                                        <td className="p-4 md:p-5 font-semibold text-slate-800 flex items-center gap-2 md:gap-3"><RotateCw size={16} className="text-blue-500 shrink-0"/> Data Immutability</td>
                                        <td className="p-4 md:p-5 text-red-500 font-medium">❌ Mutable. Can be deleted or edited by admins.</td>
                                        <td className="p-4 md:p-5 text-emerald-600 font-bold flex items-center gap-2"><CheckCircle size={16} className="shrink-0"/> 100% Guaranteed by Merkle hashing.</td>
                                    </tr>
                                    <tr className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                                        <td className="p-4 md:p-5 font-semibold text-slate-800 flex items-center gap-2 md:gap-3"><FileText size={16} className="text-blue-500 shrink-0"/> Trust Model</td>
                                        <td className="p-4 md:p-5 text-slate-500">Requires trust in your internal controls.</td>
                                        <td className="p-4 md:p-5 text-emerald-600 font-bold flex items-center gap-2"><CheckCircle size={16} className="shrink-0"/> Zero-Trust: External & Mathematical.</td>
                                    </tr>
                                    <tr className="transition-colors hover:bg-slate-50">
                                        <td className="p-4 md:p-5 font-semibold text-slate-800 flex items-center gap-2 md:gap-3"><Zap size={16} className="text-blue-500 shrink-0"/> Compliance Ready</td>
                                        <td className="p-4 md:p-5 text-slate-500">Manual, costly evidence compilation.</td>
                                        <td className="p-4 md:p-5 text-emerald-600 font-bold flex items-center gap-2"><CheckCircle size={16} className="shrink-0"/> Instant Proof generation on demand.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* --- CTA SECTION --- */}
            <div className="max-w-7xl mx-auto px-4 pt-16 text-center pb-8">
                 <motion.h2 
                    className="text-3xl md:text-4xl font-bold mb-4 text-slate-900"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                 >
                    Ready for Verifiable Compliance?
                 </motion.h2>
                 <motion.p 
                    className="text-slate-600 mb-8 text-base md:text-lg px-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ delay: 0.1 }}
                 >
                    Launch your Trusted Audit Engine and secure your logs in seconds.
                 </motion.p>
                 <motion.button 
                    onClick={() => setActiveTab('create')} 
                    className="px-8 md:px-10 py-3 md:py-4 rounded-full bg-blue-600 hover:bg-blue-700 font-bold shadow-2xl text-white transition-all text-base md:text-lg hover:scale-[1.05] w-full md:w-auto"
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