import React, { useState, useEffect, useRef } from 'react';
import StripePhoneDemo from './StripePhoneDemo';
import { motion, useInView } from 'framer-motion';

const FeatureBlock = ({ setStep, stepIndex, title, children }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-50% 0px -50% 0px" });

  useEffect(() => {
    if (isInView) setStep(stepIndex);
  }, [isInView, setStep, stepIndex]);

  return (
    <div ref={ref} className="min-h-[80vh] flex flex-col justify-center px-4 md:px-12 py-12">
      <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
        <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">{title}</h3>
        <div className="text-lg text-slate-600 leading-relaxed max-w-md">{children}</div>
      </motion.div>
    </div>
  );
};

const InteractiveFeatureSection = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="relative bg-white w-full border-t border-slate-100">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row">
        
        {/* LEFT SCROLL CONTENT - ORIGINAL */}
        <div className="w-full lg:w-1/2 relative z-10 pb-24">
          <FeatureBlock setStep={setActiveStep} stepIndex={0} title="Integrate in Minutes">
            <p className="mb-4">Get started with just a few lines of code. Our SDK is designed for developers who value speed and type safety.</p>
            <ul className="space-y-3 mt-4 text-slate-500 text-base">
              <li className="flex items-center gap-2">✅ <span className="font-medium text-slate-700">NPM Package available</span></li>
              <li className="flex items-center gap-2">✅ <span className="font-medium text-slate-700">Zero-config init</span></li>
            </ul>
          </FeatureBlock>

          <FeatureBlock setStep={setActiveStep} stepIndex={1} title="Real-time Verification">
            <p className="mb-4">When a sensitive event occurs, Auditor Veritas intercepts and verifies the request instantly.</p>
            <p>The UI adapts automatically to the risk level, prompting users for authentication only when necessary.</p>
          </FeatureBlock>

          <FeatureBlock setStep={setActiveStep} stepIndex={2} title="Immutable Audit Logs">
            <p>Every event is cryptographically hashed and anchored to our Merkle Tree. "Once written, it can never be altered."</p>
            <div className="mt-6 p-4 bg-slate-50 border-l-4 border-[#635bff] rounded-r-xl italic text-slate-600 text-sm">
               Cryptographically guaranteed integrity for every action.
            </div>
          </FeatureBlock>
        </div>

        {/* RIGHT STICKY DEMO - EXAKT SOM GAMMALT */}
        <div className="hidden lg:block w-1/2 h-screen sticky top-0 flex items-center justify-center bg-white overflow-hidden">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#635bff]/10 to-[#00d4ff]/10 rounded-full blur-3xl" />
           <StripePhoneDemo activeStep={activeStep} />
        </div>
        
        {/* MOBILE DEMO */}
        <div className="lg:hidden py-12 bg-slate-50">
           <StripePhoneDemo activeStep={activeStep} />
        </div>
      </div>
    </div>
  );
};

export default InteractiveFeatureSection;