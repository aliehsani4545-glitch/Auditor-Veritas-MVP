import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Shield, Terminal, ArrowRight, Check, Zap } from 'lucide-react';

const ServicesPage = ({ setActiveTab }) => {
  const services = [
    {
        title: "Immutable Audit Logs",
        icon: <FileText size={32} />,
        desc: "A plug-and-play API for storing critical events. We use Merkle Trees to ensure that once a log is written, it can never be altered without detection.",
        features: ["AES-256 Encryption", "Merkle Tree Integrity", "Tamper-Proof History"],
        color: "text-blue-400",
        bg: "bg-blue-500/20",
        border: "border-blue-500/20",
        action: "View Demo",
        target: "home",
        scrollId: "demo-section" // NYTT: Definierar vart vi ska scrolla
    },
    {
        title: "GDPR Compliance Suite",
        icon: <Shield size={32} />,
        desc: "Automated tools to handle 'Right to be Forgotten'. Our Crypto-Shredding technology destroys decryption keys, making personal data mathematically unrecoverable.",
        features: ["Article 17 Compliance", "Pseudonymization", "Audit Proof Reports"],
        color: "text-purple-400",
        bg: "bg-purple-500/20",
        border: "border-purple-500/20",
        action: "Contact Us",
        target: "contact" // Byter bara sida
    },
    {
        title: "Integrity Consulting",
        icon: <Terminal size={32} />,
        desc: "Expert advisory on system architecture. We help organizations design data flows that are secure by default and compliant with EU regulations.",
        features: ["System Architecture Review", "Security Audits", "Custom Implementation"],
        color: "text-cyan-400",
        bg: "bg-cyan-500/20",
        border: "border-cyan-500/20",
        action: "Book Consultation",
        target: "contact" // Byter bara sida
    }
  ];

  // NY FUNKTION: Hanterar både sidbyte och scrollning
  const handleServiceAction = (target, scrollId) => {
    setActiveTab(target);
    
    // Om ett scroll-ID finns (t.ex. 'demo-section'), scrolla efter en kort fördröjning
    if (scrollId) {
      setTimeout(() => {
        const element = document.getElementById(scrollId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] pt-32 pb-20 px-4 md:px-8 relative overflow-hidden">
      
      {/* Custom Styles for the 'Flash' Animation (Behålls) */}
      <style>{`
        @keyframes color-flash {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-flash-text {
          background: linear-gradient(
            -45deg, 
            #a855f7, 
            #3b82f6, 
            #22d3ee, 
            #ffffff, 
            #22d3ee, 
            #3b82f6
          );
          background-size: 300% 300%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: color-flash 4s ease-in-out infinite;
        }
      `}</style>

      {/* --- FLUID DIAGONAL WAVE BACKGROUND (Behålls) --- */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        
        <motion.div
          className="absolute top-[20%] left-[-20%] w-[150vw] h-[60vh] bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-400 opacity-30 blur-[80px]"
          style={{ 
            rotate: -15,
            transformOrigin: "center center"
          }}
          animate={{
            rotate: [-15, -12, -15],
            y: [0, -30, 0],
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.4, 0.3]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute bottom-[-10%] right-[-10%] w-[100vw] h-[50vh] bg-gradient-to-bl from-cyan-500/20 via-blue-700/20 to-transparent blur-[100px]"
          animate={{
            x: [0, -50, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Section */}
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
        >
             <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-sm font-bold uppercase tracking-wider mb-6 backdrop-blur-md shadow-lg"
             >
                <Zap size={14} className="fill-current" /> Our Expertise
             </motion.div>
             
             <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                Services designed for <br/>
                <span className="animate-flash-text inline-block cursor-pointer hover:scale-105 transition-transform duration-300 drop-shadow-2xl">
                    Zero-Trust Environments
                </span>
             </h1>
             <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
                We don't just store data; we prove its integrity. From automated compliance pipelines to bespoke security architecture.
             </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + (i * 0.1) }}
                    className={`relative bg-slate-900/40 border border-white/5 rounded-[2rem] p-8 flex flex-col group hover:border-white/10 transition-all duration-500 overflow-hidden backdrop-blur-md shadow-2xl hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.2)] hover:-translate-y-2`}
                >
                    {/* Hover Gradient Effect inside card */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${service.bg} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                    {/* Icon */}
                    <div className={`w-20 h-20 rounded-2xl ${service.bg} ${service.color} ${service.border} border flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                        {service.icon}
                    </div>

                    <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">{service.title}</h3>
                    
                    <p className="text-slate-400 leading-relaxed mb-8 flex-1 font-light text-lg">
                        {service.desc}
                    </p>
                    
                    <ul className="space-y-4 mb-10">
                        {service.features.map((feat, j) => (
                            <li key={j} className="flex items-center gap-3 text-sm font-medium text-slate-300">
                                <div className={`p-1 rounded-full ${service.bg} ${service.color}`}>
                                    <Check size={12} strokeWidth={3} />
                                </div>
                                {feat}
                            </li>
                        ))}
                    </ul>

                    <button 
                        onClick={() => handleServiceAction(service.target, service.scrollId)} // ANVÄNDER NY LOGIK
                        className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-white font-bold transition-all flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:border-blue-500 group-hover:shadow-lg"
                    >
                        {service.action} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;