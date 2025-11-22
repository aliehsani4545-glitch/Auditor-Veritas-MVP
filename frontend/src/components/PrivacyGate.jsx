import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, FileText, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const PrivacyGate = ({ onAccept }) => {
  const [canAccept, setCanAccept] = useState(false);
  const contentRef = useRef(null);

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom || e.target.scrollTop > 200) { 
      setCanAccept(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Header */}
        <div className="bg-[#0a2540] p-8 text-center shrink-0">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <ShieldCheck className="w-8 h-8 text-[#00d4ff]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Compliance & Privacy</h1>
          <p className="text-slate-400 text-sm mt-2">Please review our terms to access the platform.</p>
        </div>

        {/* Scrollable Content */}
        <div 
          className="p-8 overflow-y-auto custom-scrollbar space-y-6 bg-slate-50"
          onScroll={handleScroll}
          ref={contentRef}
        >
          <section>
            <h3 className="flex items-center font-bold text-slate-900 mb-2">
              <Lock className="w-4 h-4 mr-2 text-[#635bff]" /> Data Encryption
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Auditor Veritas uses military-grade AES-256 encryption for all data at rest. 
              Data in transit is secured via TLS 1.3. By entering, you acknowledge that 
              all transaction logs are immutable and permanently stored in our EU-central-1 availability zone.
            </p>
          </section>

          <section>
            <h3 className="flex items-center font-bold text-slate-900 mb-2">
              <FileText className="w-4 h-4 mr-2 text-[#635bff]" /> GDPR Article 32
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              We act as a Data Processor under GDPR. You retain full ownership of your data 
              and the right to erasure ("right to be forgotten"), except for immutable 
              audit trails required by financial regulations.
            </p>
          </section>

          <section>
            <h3 className="flex items-center font-bold text-slate-900 mb-2">
              <ShieldCheck className="w-4 h-4 mr-2 text-[#635bff]" /> Merkle Tree Verification
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every event is hashed and added to a Merkle Tree structure. 
              This ensures that no single record can be altered without invalidating 
              the entire chain.
            </p>
          </section>
          
          <div className="h-10"></div> {/* Spacing for scroll detection */}
        </div>

        {/* Footer Action */}
        <div className="p-6 border-t border-slate-200 bg-white shrink-0">
          {!canAccept && (
            <div className="text-center text-xs text-slate-400 mb-2 flex items-center justify-center animate-bounce">
              Scroll to read <ChevronDown className="w-3 h-3 ml-1" />
            </div>
          )}
          <button 
            onClick={onAccept}
            disabled={!canAccept}
            className={`w-full py-4 rounded-xl font-bold transition-all duration-300 ${
              canAccept 
                ? 'bg-[#635bff] text-white hover:bg-[#5449e3] shadow-lg transform hover:-translate-y-1' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {canAccept ? 'I Accept & Enter' : 'Please read the terms'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyGate;