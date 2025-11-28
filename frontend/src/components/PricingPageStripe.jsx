import React, { useState, useCallback, useEffect } from 'react'; // Importera useEffect också om du använder det
import { loadStripe } from '@stripe/stripe-js';
import { RefreshCw, CheckCircle2, AlertTriangle, X, Loader2, Check, ArrowRight, Zap, Shield, Globe, CreditCard, Sparkles } from 'lucide-react'; // Lägg till saknade ikoner
import { motion, AnimatePresence } from 'framer-motion';
import { apiCall } from '../App.jsx';

// --- Configuration ---
// ⚠️ REPLACE WITH YOUR PUBLISHABLE STRIPE KEY
const stripePromise = loadStripe('pk_live_51SX7O148POA4USE9AVuM0jqgZrC2aMUGt3MaVvWmgBAF8OibgzGeVefsjTHpQCXH2RRRhUIwH1jx2tvfMAF8JQiY00bD4dj0xf');

const DEDICATED_ENTERPRISE_PLAN = {
  name: "Dedicated Enterprise",
  price: "Custom",
  desc: "For Fortune 500 & high-volume regulated industries. Includes dedicated SLA and on-premise options.",
  features: ["Unlimited Events", "GDPR Erasure API", "Custom Data Retention", "Dedicated Support (24/7)", "On-Premise Deployment"],
  cta: "Contact Sales",
};

// Basfunktioner som nu är gemensamma för alla betalda/utvecklar-planer
const BASE_FEATURES = [
  "GDPR Data Processing Agreement (DPA)",
  "GDPR Erasure API",
  "Merkle Tree Proofs (Data Integrity)",
  "API Key Rotation"
];


// --- Sub-Components ---

const CheckoutForm = ({ plan, onBack }) => {
  // Vi behöver inte clientSecret i state längre när vi använder fetchClientSecret direkt i initEmbeddedCheckout
  const [isError, setIsError] = useState(false);

  // Denna funktion anropas av Stripe när checkouten ska laddas
  const fetchClientSecret = useCallback(async () => {
    try {
      const response = await apiCall("/api/stripe/create-checkout-session", {
        method: "POST",
        body: { plan }
      });
      return response.clientSecret;
    } catch (error) {
      console.error("Failed to fetch client secret:", error);
      setIsError(true);
      throw error; // Viktigt att kasta felet vidare så Stripe vet att det misslyckades
    }
  }, [plan]);

  useEffect(() => {
    // Vi initierar Stripe Embedded Checkout direkt när komponenten mountas
    const initializeStripe = async () => {
      const stripe = await stripePromise;
      
      // HÄR ÄR FIXEN: Vi skickar BARA fetchClientSecret, inte clientSecret
      const checkout = await stripe.initEmbeddedCheckout({
        fetchClientSecret, 
      });

      // Mounta checkouten
      checkout.mount('#checkout-container');
    };

    initializeStripe();
    
    // Cleanup (valfritt men bra praxis om komponenten unmountas)
    return () => {
        // Om du hade sparat checkout-instansen kunde du gjort checkout.destroy() här
    };
  }, [fetchClientSecret]);

  if (isError) {
    return (
      <div className="text-center p-8 bg-red-100 rounded-xl border border-red-400">
          <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-3" />
          <p className="text-sm text-red-700 font-medium">Could not connect to the payment processor. Please try again later.</p>
          <button onClick={onBack} className="mt-4 text-xs font-medium text-slate-600 hover:text-slate-800">← Select another plan</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 md:p-8 bg-white rounded-3xl shadow-2xl border border-slate-200">
      <h2 className="text-2xl font-bold text-center mb-6 text-slate-900">
        Secure Payment for <span className="text-blue-600 capitalize">{plan}</span>
      </h2>
      <div id="checkout-container" className="min-h-[400px]">
        {/* Stripe Embedded Checkout form mounts here. Vi kan lägga en loader här som försvinner när Stripe tar över */}
         <div className="flex justify-center items-center h-64 bg-slate-50 rounded-xl">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-3" />
            <p className="text-slate-600">Loading secure checkout...</p>
         </div>
      </div>
      <button onClick={onBack} className="w-full mt-6 text-sm py-3 font-medium text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
          ← Back to Pricing
      </button>
    </div>
  );
};


const ReturnPage = ({ sessionId, onNewPlan }) => {
    const [status, setStatus] = useState(null);
    const [customerEmail, setCustomerEmail] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            if (!sessionId) {
                setStatus('error');
                setIsLoading(false);
                return;
            }
            try {
                const session = await apiCall(`/api/stripe/session-status?session_id=${sessionId}`);
                setStatus(session.payment_status === 'paid' || session.status === 'complete' ? 'complete' : 'failed');
                setCustomerEmail(session.customer_email);
            } catch (error) {
                console.error("Error fetching session status:", error);
                setStatus('error');
            } finally {
                setIsLoading(false);
            }
        };
        checkStatus();
    }, [sessionId]);

    if (isLoading) {
        return (
             <div className="flex flex-col justify-center items-center h-full min-h-[400px] bg-white rounded-3xl p-12 shadow-xl border border-slate-200">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                <p className="text-lg text-slate-600">Verifying payment status...</p>
            </div>
        );
    }
    
    if (status === 'complete') {
        return (
            <div className="text-center p-12 bg-emerald-50 rounded-3xl shadow-lg border border-emerald-200 max-w-lg mx-auto">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
                <p className="text-lg text-emerald-700 mb-6">Your subscription is now active.</p>
                {customerEmail && <p className="text-sm text-emerald-700 mb-8">A receipt has been sent to <span className="font-mono bg-emerald-100 px-2 py-1 rounded">{customerEmail}</span>.</p>}
                <button 
                    onClick={() => onNewPlan('dashboard')} 
                    className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors shadow-md"
                >
                    Go to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="text-center p-12 bg-red-50 rounded-3xl shadow-lg border border-red-200 max-w-lg mx-auto">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Payment Failed</h2>
            <p className="text-lg text-red-700 mb-6">There was an issue processing your payment. Please try again.</p>
             <button 
                onClick={() => onNewPlan('pricing')} 
                className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 transition-colors shadow-md"
            >
                Try Again
            </button>
        </div>
    );
};


const EnterpriseModal = ({ isOpen, onClose }) => {
    const [formStatus, setFormStatus] = useState('idle');
  
    if (!isOpen) return null;
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setFormStatus('submitting');
      
      const form = e.target;
      const data = new FormData(form);
      
      try {
        await fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(data).toString()
        });
        setFormStatus('success');
      } catch (error) {
        console.error('Form submission failed:', error);
        setFormStatus('error');
      }
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
                  <Check size={32} />
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
                  <input type="hidden" name="form-name" value="enterprise-inquiry" /> 
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input name="name" required type="text" placeholder="Name" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
                      <input name="email" required type="email" placeholder="Work Email" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
                  </div>
                  <input name="company" required type="text" placeholder="Company Name" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
                  <input name="volume" required type="text" placeholder="Required Monthly Event Volume (e.g., >1M)" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
                  <textarea name="compliance" required placeholder="What are your key compliance needs (GDPR, PCI, etc.)?" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 h-24 placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"></textarea>
                  
                  <button 
                    type="submit" 
                    disabled={formStatus === 'submitting'}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-70 mt-2"
                  >
                    {formStatus === 'submitting' ? <Loader2 className="animate-spin" /> : 'Send Request'}
                  </button>
                  {formStatus === 'error' && <p className="text-red-600 text-sm text-center">Submission failed. Please try again.</p>}
              </form>
            </>
          )}
        </motion.div>
      </div>
    );
};


// --- MAIN PRICING COMPONENT (Displays Cards) ---
const PricingPageStripe = ({ setActiveTab }) => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isReturnPage, setIsReturnPage] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // --- LOGIC: Handle Return URL / Session ID (Oändrad) ---
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('session_id');
    
    if (window.location.pathname.endsWith('/checkout/return')) {
         if (id) {
            setSessionId(id);
            setIsReturnPage(true);
            window.history.replaceState({}, document.title, '/pricing'); 
        } else {
            window.history.replaceState({}, document.title, '/pricing');
            setActiveTab('pricing');
        }
        return;
    }
    
    if (id) {
         window.history.replaceState({}, document.title, window.location.pathname.replace('/checkout/return', '/pricing'));
    }
    
  }, [setActiveTab]);


  // --- LOGIC: Handle Plan Selection (Oändrad) ---
  const handlePlanSelection = (planKey) => {
    if (planKey === 'starter') {
        return setActiveTab('create'); 
    }
    if (planKey === 'business_contact' || planKey === 'dedicated_enterprise') {
        return setShowEnterpriseModal(true); 
    }
    
    setSelectedPlan(planKey);
  };
  
  const handleBack = () => setSelectedPlan(null);

  // --- Plan Data Structure (FINAL ADJUSTMENTS) ---
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
        "Unlimited Projects", // <--- NY: Obegränsade projekt
        "1 Year Data Retention", 
        "Dedicated Slack Channel", // Unique to Business
        ...BASE_FEATURES, 
        "And many more relevant features..." // <--- NY: Generisk tilläggsfras
      ],
      cta: "Contact Sales", 
      highlight: false,
      icon: <Shield size={20} />,
      color: 'bg-purple-600 hover:bg-purple-500',
      action: () => handlePlanSelection('business_contact')
    }
  ];
  
  // --- RENDERING LOGIC (Light Design) ---

  // 1. Show Return Page
  if (isReturnPage) {
      return (
        <div className="min-h-screen pt-32 p-4 md:p-6 flex justify-center bg-slate-50 text-slate-900">
            <ReturnPage sessionId={sessionId} onNewPlan={setActiveTab} />
        </div>
      );
  }

  // 2. Show Embedded Checkout
  if (selectedPlan && selectedPlan !== 'business_contact' && selectedPlan !== 'dedicated_enterprise') {
    return (
      <div className="min-h-screen pt-32 p-4 md:p-6 flex justify-center bg-slate-50 text-slate-900">
          <CheckoutForm plan={selectedPlan} onBack={handleBack} />
      </div>
    );
  }
  
  // 3. Show Main Pricing Page (Default view)
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