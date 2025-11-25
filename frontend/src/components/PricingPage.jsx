import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Zap, Shield, ArrowRight, X, Loader2, Check } from 'lucide-react';
import { LightGradientBackground } from './SharedBackgrounds';

// --- ENTERPRISE MODAL (LIGHT MODE) ---
const EnterpriseModal = ({ isOpen, onClose }) => {
  const [formStatus, setFormStatus] = useState('idle');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('submitting');
    
    // Simulera nätverksanrop eller använd Netlify form logic
    setTimeout(() => {
        setFormStatus('success');
    }, 1500);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onClose}></div>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl z-10 overflow-hidden ring-1 ring-slate-900/5"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors"><X /></button>
        
        {formStatus === 'success' ? (
          <div className="text-center py-12">
             <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
               <Check size={32} />
             </div>
             <h3 className="text-2xl font-bold text-slate-900 mb-2">Request Received!</h3>
             <p className="text-slate-500 mb-6">Our enterprise team will be in touch shortly.</p>
             <button onClick={onClose} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg">Close</button>
          </div>
        ) : (
          <>
            <div className="mb-6">
                <div className="text-blue-600 font-bold text-xs uppercase tracking-wider mb-2">Enterprise</div>
                <h3 className="text-3xl font-bold text-slate-900">Contact Sales</h3>
                <p className="text-slate-500 mt-2">Custom volume, SLA guarantees, and dedicated support.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">First Name</label>
                      <input required type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Last Name</label>
                      <input required type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                   </div>
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Work Email</label>
                  <input required type="email" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Company / Volume</label>
                  <input required type="text" placeholder="e.g. Acme Corp, >1M events" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Message</label>
                  <textarea required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 h-24 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"></textarea>
               </div>
               <button 
                 type="submit" 
                 disabled={formStatus === 'submitting'}
                 className="w-full bg-[#635bff] hover:bg-[#5449e3] text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-70 mt-2"
               >
                 {formStatus === 'submitting' ? <Loader2 className="animate-spin" /> : 'Send Request'}
               </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const PricingPage = ({ setActiveTab }) => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false);

  // Dina länkar
  const STRIPE_LINKS = {
    pro_monthly: "#", 
    pro_yearly: "#",
    business_monthly: "#",
    business_yearly: "#"
  };

  const plans = [
    {
      name: "Developer",
      price: "$0",
      desc: "For hobby projects and API testing.",
      features: ["100 Events / month", "1 Day Retention", "Community Support", "Public API Access"],
      cta: "Start Free",
      highlight: false,
      action: () => setActiveTab('create') 
    },
    {
      name: "Pro",
      price: billingCycle === 'monthly' ? "$49" : "$39",
      period: "/mo",
      desc: "For growing startups needing integrity.",
      features: ["100,000 Events / month", "30 Day Retention", "Email Support", "GDPR DPA", "Unlimited Projects"],
      cta: "Subscribe",
      highlight: true, // Highlighted
      action: () => window.open(billingCycle === 'monthly' ? STRIPE_LINKS.pro_monthly : STRIPE_LINKS.pro_yearly, '_blank')
    },
    {
      name: "Business",
      price: billingCycle === 'monthly' ? "$199" : "$169",
      period: "/mo",
      desc: "Scale and compliance for teams.",
      features: ["1 Million Events / month", "1 Year Retention", "Priority Support (1h)", "Audit Export API", "Custom Domain"],
      cta: "Contact Sales",
      highlight: false,
      action: () => setShowEnterpriseModal(true) 
    }
  ];

  return (
    // VIT BAKGRUND MED INTERAKTIV GRADIENT
    <div className="relative py-32 bg-white text-slate-900 min-h-screen overflow-hidden">
      <LightGradientBackground />
      <EnterpriseModal isOpen={showEnterpriseModal} onClose={() => setShowEnterpriseModal(false)} />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-20">
           <motion.div 
             initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
             className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-bold uppercase tracking-wider text-blue-600 mb-6"
           >
             <Zap size={14} /> Transparent Pricing
           </motion.div>
           <motion.h2 
             initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
             className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-slate-900"
           >
             Simple pricing, <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">infinite scale.</span>
           </motion.h2>
           <motion.p 
             initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
             className="text-slate-500 text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
           >
             Start building for free. Scale securely with predictable costs. No hidden fees.
           </motion.p>

           {/* Toggle Switch */}
           <motion.div 
             initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
             className="inline-flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200"
           >
              <button 
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${billingCycle === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Yearly <span className="text-[10px] text-emerald-600 ml-1.5 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">-20%</span>
              </button>
           </motion.div>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
           {plans.map((plan, i) => (
             <motion.div 
               key={i}
               initial={{ y: 40, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.2 + (i * 0.1) }}
               whileHover={{ y: -10 }}
               className={`relative p-8 rounded-[32px] border flex flex-col transition-all duration-300 ${
                 plan.highlight 
                   ? 'bg-white border-blue-200 shadow-[0_20px_60px_-15px_rgba(99,102,241,0.2)] z-10 scale-105 ring-1 ring-blue-100' 
                   : 'bg-white/60 border-slate-200 hover:bg-white hover:shadow-xl hover:border-slate-300'
               } backdrop-blur-sm`}
             >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#635bff] text-white text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-indigo-500/30">
                    Most Popular
                  </div>
                )}

                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-sm text-slate-500 mb-6 min-h-[40px]">{plan.desc}</p>
                
                <div className="flex items-baseline gap-1 mb-8">
                   <span className={`text-5xl font-bold tracking-tight ${plan.highlight ? 'text-slate-900' : 'text-slate-700'}`}>{plan.price}</span>
                   {plan.price !== "$0" && <span className="text-slate-400 font-medium">{plan.period}</span>}
                </div>

                <button 
                  onClick={plan.action}
                  className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                    plan.highlight 
                      ? 'bg-[#635bff] hover:bg-[#5449e3] text-white shadow-lg shadow-indigo-500/25' 
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md'
                  }`}
                >
                  {plan.cta} {plan.highlight && <ArrowRight size={16} />}
                </button>

                <div className="mt-10 space-y-4">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">What's included</p>
                   {plan.features.map((feat, j) => (
                     <div key={j} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                        <div className={`mt-0.5 p-0.5 rounded-full ${plan.highlight ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                           <Check size={12} strokeWidth={3} />
                        </div>
                        <span className="leading-snug">{feat}</span>
                     </div>
                   ))}
                </div>
             </motion.div>
           ))}
        </div>

        <div className="mt-24 text-center border-t border-slate-100 pt-12">
           <p className="text-slate-500 text-sm flex flex-col sm:flex-row items-center justify-center gap-2">
             Need on-premise deployment or custom SLA? 
             <button onClick={() => setShowEnterpriseModal(true)} className="text-blue-600 hover:text-blue-700 font-bold transition-colors flex items-center gap-1">
                Contact our Sales Team <ArrowRight size={14}/>
             </button>
           </p>
        </div>

      </div>
    </div>
  );
};

export default PricingPage;