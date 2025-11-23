import React from 'react';
import { Landmark, Stethoscope, Gavel, ArrowRight, Shield, Zap, Check, XCircle, Activity, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tilt } from 'react-tilt';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import SectionBackground from './SectionBackground'; // Ensure this exists or remove if not used

// Helper to scroll to code integration
const scrollToIntegration = () => {
  const el = document.getElementById('code-integration');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};

const FeatureCard = ({ title, problem, solution, icon: Icon, color, tag }) => {
  const colors = {
    blue: { icon: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    emerald: { icon: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    purple: { icon: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  };
  const c = colors[color];

  return (
    <Tilt options={{ max: 10, scale: 1.02, speed: 1000, glare: true, "max-glare": 0.1 }} className="h-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="group h-full bg-white/5 backdrop-blur-md rounded-[2rem] p-8 border border-white/10 shadow-2xl flex flex-col hover:bg-white/10 transition-all duration-500 relative overflow-hidden"
      >
        {/* Card Header */}
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className={`w-14 h-14 rounded-2xl ${c.bg} flex items-center justify-center border ${c.border} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-7 h-7 ${c.icon}`} strokeWidth={1.5} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/5 text-slate-400 border border-white/10">
            {tag}
          </span>
        </div>

        <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-[#635bff] transition-colors relative z-10">{title}</h3>

        {/* Problem / Solution Blocks */}
        <div className="space-y-3 mb-8 flex-1 relative z-10">
          <div className="bg-red-500/5 p-3 rounded-xl border border-red-500/10 transition-colors group-hover:bg-red-500/10">
            <div className="flex items-center gap-2 mb-1 text-[10px] font-bold text-red-400 uppercase tracking-wide">
              <XCircle size={12} /> Without Auditor
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{problem}</p>
          </div>
          
          <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 transition-colors group-hover:bg-emerald-500/10">
            <div className="flex items-center gap-2 mb-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
              <Check size={12} /> With Auditor
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">{solution}</p>
          </div>
        </div>

        {/* Footer Button */}
        <button 
          onClick={scrollToIntegration}
          className="flex items-center text-[#635bff] font-bold text-sm gap-2 cursor-pointer group/btn hover:text-white transition-colors relative z-10"
        >
          See Integration Details 
          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
        </button>
      </motion.div>
    </Tilt>
  );
};

const StatItem = ({ val, suffix, label, icon: Icon }) => {
  const { ref, inView } = useInView({ triggerOnce: true });
  return (
    <div ref={ref} className="text-center group">
      <div className="flex justify-center mb-3">
         <div className="p-2 bg-white/5 rounded-lg text-slate-400 group-hover:text-[#635bff] group-hover:scale-110 transition-all">
            <Icon size={20} />
         </div>
      </div>
      <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
        {inView ? <CountUp end={val} duration={2.5} /> : '0'}
        <span className="text-[#635bff]">{suffix}</span>
      </div>
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</div>
    </div>
  );
};

const UseCases = () => {
  return (
    <div className="relative py-32 w-full z-10">
      {/* Optional local background if SectionBackground is not used in parent */}
      {/* <div className="absolute inset-0 bg-gradient-to-b from-[#020617] to-[#0f172a] -z-20"></div> */}

      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-300 uppercase tracking-wide mb-6 backdrop-blur-md">
             <Shield size={14} className="text-[#635bff]" /> Use Cases
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Built for the <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#635bff] to-purple-500">Evidence Economy.</span>
          </h2>
          <p className="text-xl text-slate-400 leading-relaxed font-light">
            Replace fragile internal logs with an immutable chain of custody.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            title="FinTech"
            icon={Landmark}
            color="blue"
            tag="PCI-DSS Ready"
            problem="Mutable SQL logs hold no legal weight. Admins can edit history."
            solution="Cryptographic chaining makes history immutable. Every transaction is linked."
          />
          <FeatureCard 
            title="HealthTech"
            icon={Stethoscope}
            color="emerald"
            tag="HIPAA Compliant"
            problem="Storing plain-text patient IDs is a massive liability risk."
            solution="Client-side hashing ensures we verify identity without seeing raw data."
          />
          <FeatureCard 
            title="Governance"
            icon={Gavel}
            color="purple"
            tag="Non-Repudiation"
            problem="Rogue admins can wipe logs to cover their tracks."
            solution="Our write-only ledger ensures committed events cannot be erased."
          />
        </div>

        <div className="mt-32 pt-16 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-12">
           <StatItem val={4} suffix="%" label="Global Turnover (Fine)" icon={Activity} />
           <StatItem val={200} suffix="h+" label="Dev Time Saved" icon={Zap} />
           <StatItem val={90} suffix=" Days" label="Key Rotation Standard" icon={Shield} />
           <StatItem val={1} suffix="st" label="Privacy-First Design" icon={EyeOff} />
        </div>

      </div>
    </div>
  );
};

export default UseCases;