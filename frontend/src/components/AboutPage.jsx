import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Users, Database, Globe } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-[#020617] pt-32 pb-12 px-4 md:px-8 relative overflow-hidden">
      
      {/* --- FLUID WAVE BACKGROUND (Matching the image) --- */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        
        {/* 1. Deep Blue/Purple Base (Bottom Left Wave) */}
        <motion.div
          className="absolute bottom-[-10%] left-[-10%] w-[120vw] h-[80vh] bg-gradient-to-tr from-blue-900 via-indigo-800 to-transparent blur-[100px] opacity-70"
          style={{ transformOrigin: "bottom left" }}
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 2, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* 2. The Golden Flow (Center Diagonal) - The "Shawl" */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-[150vw] h-[50vh] bg-gradient-to-r from-transparent via-yellow-500 to-transparent blur-[80px] opacity-40 mix-blend-screen"
          style={{ 
            x: '-50%', 
            y: '-50%', 
            rotate: -25 
          }}
          animate={{
            x: ['-50%', '-48%', '-50%'],
            rotate: [-25, -22, -25],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* 3. Cyan/Teal Highlight (Top Right Wave) */}
        <motion.div
          className="absolute top-[-10%] right-[-10%] w-[100vw] h-[80vh] bg-gradient-to-bl from-cyan-500 via-blue-600 to-transparent blur-[100px] opacity-50 mix-blend-screen"
          style={{ transformOrigin: "top right" }}
          animate={{
            scale: [1, 1.1, 1],
            x: [0, -20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* 4. Subtle Texture Overlay for "Fabric" feel */}
        <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/noise.png')] mix-blend-overlay"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
        >
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
                Bridging Tech & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-yellow-400">Human Integrity</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
                Auditor Veritas combines rigorous system engineering with a deep understanding of compliance ethics to build the new standard for digital trust.
            </p>
        </motion.div>

        {/* Founder Story */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/40 border border-white/10 rounded-3xl p-8 md:p-12 mb-12 relative overflow-hidden backdrop-blur-md shadow-2xl"
        >
             {/* Subtle Inner Glow */}
             <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-blue-500/5 to-transparent pointer-events-none" />
             
             <div className="relative z-10">
                 <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 border-b border-white/5 pb-4">
                    <Code2 className="text-blue-500"/> The Founder's Background
                 </h2>
                 <div className="space-y-6 text-slate-300 leading-relaxed text-lg font-light">
                    <p>
                        I am a System Developer and Social Specialist with over 4 years of specialized experience at the intersection of complex technology and human behavior.
                    </p>
                    <p>
                        My background is unique in the industry. While standard development often focuses solely on functionality, my dual expertise allows me to construct systems that are technically robust while adhering to the highest ethical standards of data handling.
                    </p>
                    <p>
                        Auditor Veritas was born from a critical need: standard databases are too mutable for high-stakes compliance. 
                        By leveraging Merkle Trees and Immutable Ledgers, I built a system that offers mathematical proof of integrity, removing blind trust from the equation and replacing it with verifiable truth.
                    </p>
                 </div>
             </div>
        </motion.div>

        {/* Stats / Values Grid */}
        <div className="grid md:grid-cols-3 gap-6">
            {[
                { icon: <Database size={24}/>, title: "Data Integrity", desc: "Cryptographically secured audit trails that cannot be tampered with." },
                { icon: <Users size={24}/>, title: "Human Centric", desc: "Built with a deep understanding of privacy rights and GDPR ethics." },
                { icon: <Globe size={24}/>, title: "Swedish Quality", desc: "Developed in Sweden, adhering to the strictest EU regulations." }
            ].map((item, i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + (i * 0.1) }}
                    className="bg-white/5 border border-white/5 p-6 rounded-2xl hover:bg-white/10 transition-colors backdrop-blur-sm group"
                >
                    <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                        {item.icon}
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
            ))}
        </div>

      </div>
    </div>
  );
};

export default AboutPage;