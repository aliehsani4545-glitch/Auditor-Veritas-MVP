import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, ShieldCheck, Check } from 'lucide-react';

// Lägg till 'onOpenPrivacy' i props här nere 👇
const CookieConsent = ({ onOpenPrivacy }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    } else if (consent === 'granted') {
      loadGoogleAnalytics();
    }
  }, []);

  const loadGoogleAnalytics = () => {
    // Byt ut G-XXXXXXXXXX mot ditt ID
    const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; 

    if (window.gtag) return; 

    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    
    gtag('config', GA_MEASUREMENT_ID, { 
      'anonymize_ip': true,
      'allow_google_signals': false,
      'allow_ad_personalization_signals': false
    });
  };

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'granted');
    loadGoogleAnalytics();
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'denied');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[100] max-w-sm w-[calc(100%-2rem)]"
        >
          <div className="bg-[#0f172a]/95 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-slate-700 relative overflow-hidden">
            {/* Top border shine */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-800 rounded-xl text-[#635bff] shrink-0 border border-slate-700">
                <Cookie size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
                  Privacy Settings <ShieldCheck size={12} className="text-emerald-500"/>
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  We use essential cookies for security. Optional analytics help us improve, but are never sold. 
                  {/* HÄR ÄR FIXEN: En knapp som ser ut som en länk */}
                  <button 
                    onClick={onOpenPrivacy}
                    className="text-slate-300 underline ml-1 hover:text-white bg-transparent border-none p-0 cursor-pointer"
                  >
                    Read Policy
                  </button>.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={handleAccept}
                    className="flex-1 bg-[#635bff] hover:bg-[#5449e3] text-white text-xs font-bold py-2.5 rounded-lg transition-colors shadow-lg shadow-indigo-500/20 flex justify-center items-center gap-1"
                  >
                    <Check size={14} /> Accept
                  </button>
                  <button 
                    onClick={handleDecline}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2.5 rounded-lg transition-colors border border-slate-700"
                  >
                    Decline
                  </button>
                </div>
              </div>
              <button onClick={handleDecline} className="absolute top-3 right-3 text-slate-600 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;