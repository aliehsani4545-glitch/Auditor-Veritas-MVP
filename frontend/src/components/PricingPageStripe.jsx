import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, Shield, Globe, ArrowRight, CreditCard, Sparkles, X, CheckCircle2, Loader2 } from 'lucide-react';

// --- Configuration ---
// ⚠️ REPLACE THESE WITH YOUR ACTUAL STRIPE PAYMENT LINKS
const STRIPE_LINKS = {
  starter: null, // Vi hanterar denna manuellt för att gå till login/dashboard
  professional: "https://buy.stripe.com/eVq3cob6M0iN8oc7dH9EI00", // Replace with your actual Professional plan link
  // Enterprise usually goes to a contact form, handled by the modal
};

const DEDICATED_ENTERPRISE_PLAN = {
  name: "Dedicated Enterprise",
  price: "Custom",
  desc: "For Fortune 500 & high-volume regulated industries. Includes dedicated SLA and on-premise options.",
  features: ["Unlimited Events", "GDPR Erasure API", "Custom Data Retention", "Dedicated Support (24/7)", "On-Premise Deployment"],
  cta: "Contact Sales",
};

const BASE_FEATURES = [
  "GDPR Data Processing Agreement (DPA)",
  "GDPR Erasure API",
  "Merkle Tree Proofs (Data Integrity)",
  "API Key Rotation"
];

// --- Enterprise Modal Component ---
const EnterpriseModal = ({ isOpen, onClose }) => {
    const [formStatus, setFormStatus] = useState('idle');
  
    if (!isOpen) return null;
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setFormStatus('submitting');
      
      // Simulate form submission
      setTimeout(() => {
          setFormStatus('success');
      }, 1500);
    };
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="relative bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl z-10 overflow-hidden ring-1 ring-blue-600/20"
        >
          <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors"><X /></button>
          
          {formStatus === 'success' ? (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Request Received!</h3>
                <p className="text-slate-500 mb-6">Our enterprise team will be in touch shortly.</p>
                <button onClick={onClose} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-500 transition-colors shadow-lg">Close</button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                  <div className="text-blue-600 font-bold text-xs uppercase tracking-wider mb-2">Enterprise Inquiry</div>
                  <h3 className="text-3xl font-bold text-slate-900">Contact Sales</h3>
                  <p className="text-slate-500 mt-2">Custom volume, SLA guarantees, and dedicated support.</p>
              </div>
              
              <form name="enterprise-inquiry" onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input name="name" required type="text" placeholder="Name" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
                      <input name="email" required type="email" placeholder="Work Email" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
                  </div>
                  <input name="company" required type="text" placeholder="Company Name" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
                  <textarea name="compliance" required placeholder="What are your key compliance needs (GDPR, PCI, etc.)?" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 h-24 placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"></textarea>
                  
                  <button 
                    type="submit" 
                    disabled={formStatus === 'submitting'}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-70 mt-2"
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

// --- MAIN PRICING COMPONENT ---
const PricingPageStripe = ({ setActiveTab }) => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false);

  // --- LOGIC: Handle Plan Selection ---
  const handlePlanSelection = (planKey) => {
    // 1. Enterprise / Contact Sales -> Open Modal
    if (planKey === 'business_contact' || planKey === 'dedicated_enterprise') {
        return setShowEnterpriseModal(true); 
    }

    // 2. Free / Developer Plan -> Go to Login/Dashboard
    if (planKey === 'starter') {
        // Detta skickar användaren till "dashboard"-vyn i App.jsx.
        // I App.jsx: Om ingen session finns, visas AuthScreen (Login/Signup).
        setActiveTab('dashboard');
        return;
    }

    // 3. Paid Plans -> Redirect to Stripe Payment Link
    if (STRIPE_LINKS[planKey]) {
        // Open the Stripe Hosted Checkout page in a new tab
        window.open(STRIPE_LINKS[planKey], '_blank');
    } else {
         alert("Payment link not configured for this plan. (See src/components/PricingPageStripe.jsx)");
    }
  };

  const plans = [
    {
      name: "Developer",
      key: 'starter',
      price: "€0", 
      period: "",
      desc: "For hobby projects and API testing. Fully featured audit chain.",
      features: [
        "1,000 Events / month", 
        "7 Day Data Retention",
        "Community Support", 
        ...BASE_FEATURES, 
      ],
      cta: "Get Started Free",
      highlight: false,
      icon: <Zap size={20} />,
      color: 'bg-slate-900 hover:bg-slate-700',
      action: () => handlePlanSelection('starter')
    },
    {
      name: "Professional",
      key: 'professional', 
      price: billingCycle === 'monthly' ? "€49" : "€39", 
      period: "/mo",
      desc: "For growing startups needing real-time data integrity and core compliance tooling.",
      features: [
        "100,000 Events / month", 
        "30 Day Data Retention",
        "Unlimited Projects", 
        "Priority Email Support", 
        ...BASE_FEATURES, 
      ],
      cta: "Start Subscription",
      highlight: true,
      icon: <Shield size={20} />,
      color: 'bg-blue-600 hover:bg-blue-500',
      action: () => handlePlanSelection('professional')
    },
    {
      name: "Business",
      key: 'business_contact', 
      price: "Custom", 
      period: "",
      desc: "Scale and robust compliance for teams and pre-enterprise systems.",
      features: [
        "Unlimited Event Logs", 
        "Unlimited Projects",
        "1 Year Data Retention", 
        "Dedicated Slack Channel",
        ...BASE_FEATURES, 
        "And many more relevant features..."
      ],
      cta: "Contact Sales", 
      highlight: false,
      icon: <Shield size={20} />,
      color: 'bg-purple-600 hover:bg-purple-500',
      action: () => handlePlanSelection('business_contact')
    }
  ];
  
  return (
    <div className="relative py-24 md:py-32 bg-slate-50 text-slate-900 min-h-screen overflow-hidden">
      
      {/* Background Gradient Effect (Light Colors) */}
      <div className="absolute top-0 left-0 w-full h-full opacity-50 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-[150px] animate-pulse-slow"></div>
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-indigo-100/30 rounded-full blur-[100px] animate-pulse-slow animation-delay-2000"></div>
      </div>

      <AnimatePresence>
        {showEnterpriseModal && <EnterpriseModal isOpen={showEnterpriseModal} onClose={() => setShowEnterpriseModal(false)} />}
      </AnimatePresence>
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 md:mb-24">
            <motion.div 
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-xs font-bold uppercase tracking-wider text-blue-600 mb-6"
            >
              <Zap size={14} /> Transparent Compliance
            </motion.div>
            <motion.h2 
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 tracking-tight text-slate-900"
            >
              Compliance you can afford.
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
              className="text-slate-600 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Start building for free. Scale securely with predictable costs. No hidden fees.
            </motion.p>

            {/* Toggle Switch */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
              className="inline-flex bg-white p-1.5 rounded-xl border border-slate-200 shadow-lg"
            >
              <button 
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${billingCycle === 'monthly' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${billingCycle === 'yearly' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Annually <span className="text-[10px] text-emerald-600 ml-1.5 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">Save 20%</span>
              </button>
            </motion.div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div 
                key={i}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                whileHover={{ y: plan.key !== 'starter' ? -8 : 0 }}
                className={`relative p-6 sm:p-8 rounded-[24px] border flex flex-col transition-all duration-300 ${
                  plan.highlight 
                    ? 'bg-white border-blue-300 shadow-[0_20px_50px_-10px_rgba(37,99,235,0.2)] z-10' 
                    : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-blue-500/30">
                    Most Popular
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-full ${plan.highlight ? 'bg-blue-600 text-white' : 'bg-slate-100 text-blue-600'}`}>
                        {plan.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                </div>
                
                <p className="text-xs text-slate-500 mb-4 min-h-[30px]">{plan.desc}</p>
                
                <div className="flex items-baseline gap-1 mb-6">
                    <span className={`text-5xl font-extrabold tracking-tight ${plan.highlight ? 'text-blue-600' : 'text-slate-900'}`}>{plan.price}</span>
                    {plan.price !== "€0" && plan.price !== "Custom" && <span className="text-slate-500 font-medium">{plan.period}</span>}
                </div>

                {/* CTA Button */}
                <button 
                  onClick={plan.action}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                    plan.highlight 
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/20' 
                      : 'bg-slate-900 hover:bg-slate-700 text-white shadow-md'
                  }`}
                >
                  {plan.cta} {plan.key !== 'starter' && <ArrowRight size={16} />}
                </button>

                {/* Features (smaller font) */}
                <div className="mt-6 space-y-3 pt-4 border-t border-slate-200">
                    {plan.features.map((feat, j) => (
                        <div key={j} className="flex items-start gap-3 text-xs text-slate-700 font-medium">
                            <div className={`mt-0.5 p-0.5 rounded-full ${plan.highlight ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-blue-600'}`}>
                                <Check size={12} strokeWidth={3} />
                            </div>
                            <span className="leading-snug">{feat}</span>
                        </div>
                    ))}
                </div>
              </motion.div>
            ))}
            
            {/* Dedicated Enterprise Card (Separate box for Contact Sales) */}
            <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="relative p-6 sm:p-8 rounded-[24px] border flex flex-col bg-white border-slate-200 md:col-span-3 text-center shadow-lg"
            >
                <div className="md:flex md:justify-between md:items-center">
                    <div className="md:text-left mb-6 md:mb-0">
                        <h3 className="text-3xl font-bold text-slate-900 mb-2">{DEDICATED_ENTERPRISE_PLAN.name}</h3>
                        <p className="text-lg text-slate-600">{DEDICATED_ENTERPRISE_PLAN.desc}</p>
                    </div>
                    <button 
                        onClick={() => handlePlanSelection('dedicated_enterprise')} // Triggers the Contact Sales Modal
                        className={`py-3.5 px-8 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 bg-purple-600 hover:bg-purple-500 text-white shadow-xl shadow-purple-500/20 w-full md:w-auto`}
                    >
                        {DEDICATED_ENTERPRISE_PLAN.cta} <ArrowRight size={16} />
                    </button>
                </div>
            </motion.div>
        </div>

      </div>
    </div>
  );
};

export default PricingPageStripe;