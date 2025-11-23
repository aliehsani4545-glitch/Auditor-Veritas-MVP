import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Server, Shield, ArrowRight, ArrowLeft, Send, 
  CheckCircle2, Globe, Zap, Cpu, Lock, AlertCircle, Briefcase, Info
} from 'lucide-react';

const EnterpriseForm = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', company: '', role: '', 
    industry: 'fintech',
    volume: '', 
    region: 'eu-west-1', 
    timeline: 'asap',
    retention: '90', 
    compliance: []
  });

  // Validation Logic
  useEffect(() => {
    let valid = false;
    if (step === 1) {
      valid = formData.name.length > 2 && formData.email.includes('@') && formData.company.length > 2;
    } else if (step === 2) {
      valid = formData.volume !== '';
    } else if (step === 3) {
      valid = true;
    }
    setIsValid(valid);
  }, [formData, step]);

  const encode = (data) => Object.keys(data).map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key])).join("&");
  
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const selectVolume = (vol) => setFormData(prev => ({ ...prev, volume: vol }));
  const selectTimeline = (time) => setFormData(prev => ({ ...prev, timeline: time }));
  
  const toggleCompliance = (tech) => {
    setFormData(prev => ({
      ...prev,
      compliance: prev.compliance.includes(tech) 
        ? prev.compliance.filter(t => t !== tech) 
        : [...prev.compliance, tech]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    setIsSubmitting(true);
    fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: encode({ "form-name": "enterprise-inquiry", ...formData }) })
    .then(() => { setSubmitted(true); setIsSubmitting(false); })
    .catch(error => { console.error(error); setIsSubmitting(false); });
  };

  const nextStep = () => { if(isValid) setStep(prev => prev + 1); };
  const prevStep = () => setStep(prev => prev - 1);

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl text-center border border-slate-100 mt-10 mx-4">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-50/50"><CheckCircle2 className="w-10 h-10 text-emerald-500" /></div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Request Received</h2>
        <p className="text-slate-600 mb-8 leading-relaxed text-base">
          We are provisioning a dedicated environment for <strong>{formData.company}</strong> in the <strong>{formData.region}</strong> region. <br/><br/>
          An onboarding specialist will contact <strong>{formData.email}</strong> shortly.
        </p>
        <button onClick={() => window.location.reload()} className="text-[#635bff] font-bold hover:underline text-sm">Return to Main Console</button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in-up text-slate-900 px-4 md:px-6">
      <div className="text-center mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white border border-slate-700 text-xs font-bold uppercase tracking-wide mb-4 shadow-xl"><Zap size={14} className="text-[#00d4ff]" /> Enterprise Gateway</div>
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">Global Scale. Local Compliance.</h2>
        <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto font-light">Configure your multi-region cluster with custom retention.</p>
      </div>

      <div className="grid md:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar (Desktop) */}
        <div className="md:col-span-4 space-y-6 sticky top-24 hidden md:block">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <StepItem current={step} step={1} icon={Building2} label="Organization" />
            <div className="h-6 w-px bg-slate-100 ml-6 my-1"></div>
            <StepItem current={step} step={2} icon={Server} label="Infrastructure" />
            <div className="h-6 w-px bg-slate-100 ml-6 my-1"></div>
            <StepItem current={step} step={3} icon={Shield} label="Compliance" />
          </div>
          
          {/* HÄR ÄR TEXTEN OM GRATIS-VERSIONEN (DESKTOP) */}
          <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-blue-900 mb-1">Free Tier Limit</p>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Your current plan is limited to <strong>100 events/mo</strong>. This configuration allows for unlimited scaling.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Wizard */}
        <div className="md:col-span-8">
          <motion.form className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden relative min-h-[500px] flex flex-col" onSubmit={handleSubmit} name="enterprise-inquiry" data-netlify="true">
            <input type="hidden" name="form-name" value="enterprise-inquiry" />
            
            {/* HÄR ÄR TEXTEN OM GRATIS-VERSIONEN (MOBIL - VISAS HÖGST UPP) */}
            <div className="bg-blue-50 p-4 border-b border-blue-100 md:hidden flex items-center gap-3">
               <Info className="w-4 h-4 text-blue-600 shrink-0" />
               <p className="text-xs text-blue-800"><strong>Note:</strong> Free tier is capped at 100 events/mo.</p>
            </div>

            <div className="h-1.5 bg-slate-100 w-full md:hidden"><motion.div className="h-full bg-[#635bff]" initial={{ width: 0 }} animate={{ width: `${(step/3)*100}%` }} /></div>

            <div className="p-6 md:p-10 flex-1">
              <AnimatePresence mode="wait">
                
                {/* STEP 1: ORGANIZATION */}
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Organization Profile</h3>
                    <div className="space-y-5 mt-6">
                      <div className="grid md:grid-cols-2 gap-5">
                        <InputGroup label="Full Name" name="name" placeholder="Jane Doe" value={formData.name} onChange={handleChange} required />
                        <InputGroup label="Work Email" name="email" type="email" placeholder="jane@corp.com" value={formData.email} onChange={handleChange} required />
                      </div>
                      <div className="grid md:grid-cols-2 gap-5">
                        <InputGroup label="Company" name="company" placeholder="Acme Corp" value={formData.company} onChange={handleChange} required />
                        <div className="space-y-1">
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Industry</label>
                           <div className="relative">
                             <Briefcase className="absolute left-3 top-3 text-slate-400" size={16} />
                             <select name="industry" value={formData.industry} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl p-3 pl-10 text-sm font-medium outline-none focus:border-[#635bff] cursor-pointer">
                               <option value="fintech">FinTech / Banking</option>
                               <option value="health">HealthTech (HIPAA)</option>
                               <option value="saas">B2B SaaS</option>
                               <option value="ecommerce">E-commerce</option>
                               <option value="gov">Government / Public</option>
                             </select>
                           </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: INFRASTRUCTURE */}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Global Infrastructure</h3>
                    <div className="space-y-6 mt-6">
                        
                        <div className="space-y-1">
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Primary Data Region</label>
                           <div className="relative">
                             <Globe className="absolute left-3 top-3 text-slate-400" size={16} />
                             <select name="region" value={formData.region} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl p-3 pl-10 text-sm font-medium outline-none focus:border-[#635bff] cursor-pointer appearance-none">
                               <optgroup label="Europe (GDPR)">
                                 <option value="eu-west-1">Ireland (eu-west-1)</option>
                                 <option value="eu-central-1">Frankfurt (eu-central-1)</option>
                                 <option value="eu-north-1">Stockholm (eu-north-1)</option>
                               </optgroup>
                               <optgroup label="United States">
                                 <option value="us-east-1">N. Virginia (us-east-1)</option>
                                 <option value="us-west-2">Oregon (us-west-2)</option>
                               </optgroup>
                               <optgroup label="Asia Pacific">
                                 <option value="ap-southeast-1">Singapore (ap-southeast-1)</option>
                                 <option value="ap-northeast-1">Tokyo (ap-northeast-1)</option>
                                 <option value="ap-southeast-2">Sydney (ap-southeast-2)</option>
                               </optgroup>
                               <optgroup label="South America">
                                 <option value="sa-east-1">São Paulo (sa-east-1)</option>
                               </optgroup>
                             </select>
                             <div className="absolute right-4 top-3.5 pointer-events-none text-[10px] text-slate-400">▼</div>
                           </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Monthly Event Volume</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {['< 1M', '1M - 50M', '50M - 500M', '500M+'].map(opt => (
                              <div key={opt} onClick={() => selectVolume(opt)} className={`cursor-pointer rounded-xl p-3 border transition-all flex justify-between items-center ${formData.volume === opt ? 'border-[#635bff] bg-[#635bff]/5 ring-1 ring-[#635bff]' : 'border-slate-200 hover:border-slate-300'}`}>
                                <span className={`text-sm font-bold ${formData.volume === opt ? 'text-[#635bff]' : 'text-slate-600'}`}>{opt}</span>
                                {formData.volume === opt && <CheckCircle2 size={16} className="text-[#635bff]"/>}
                              </div>
                            ))}
                          </div>
                        </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: COMPLIANCE & TIMELINE */}
                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Compliance & Deployment</h3>
                    
                    <div className="mb-6">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Required Frameworks</label>
                       <div className="flex flex-wrap gap-2">
                          {['GDPR', 'CCPA', 'SOC 2', 'HIPAA', 'ISO 27001', 'PCI DSS'].map(tech => (
                            <button key={tech} type="button" onClick={() => toggleCompliance(tech)} className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${formData.compliance.includes(tech) ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-[#635bff]'}`}>
                              {formData.compliance.includes(tech) ? <CheckCircle2 size={12} className="text-emerald-400"/> : null} {tech}
                            </button>
                          ))}
                       </div>
                    </div>

                    <div>
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Implementation Timeline</label>
                       <div className="grid grid-cols-2 gap-3">
                          {['Immediately', '< 1 Month', '1-3 Months', 'Budgeting'].map(time => (
                             <div key={time} onClick={() => selectTimeline(time)} className={`cursor-pointer p-3 rounded-lg border text-xs font-bold text-center transition-all ${formData.timeline === time ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                                {time}
                             </div>
                          ))}
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
               {step > 1 ? <button type="button" onClick={prevStep} className="text-slate-500 font-bold hover:text-slate-800 flex items-center gap-2 px-2 py-2 text-xs md:text-sm"><ArrowLeft size={16} /> Back</button> : <div className="w-10"></div>}
               {step < 3 ? (
                 <button type="button" onClick={nextStep} disabled={!isValid} className={`px-6 py-3 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 shadow-lg transition-all ${isValid ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>Continue <ArrowRight size={16} /></button>
               ) : (
                 <button type="submit" disabled={isSubmitting} className="bg-[#635bff] text-white px-6 py-3 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 hover:bg-[#5449e3] shadow-lg disabled:opacity-70">{isSubmitting ? 'Sending...' : <><Send size={16} /> Request Access</>}</button>
               )}
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

const InputGroup = ({ label, name, required, ...props }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label} {required && <span className="text-red-400">*</span>}</label>
    <input name={name} {...props} className="w-full bg-white border border-slate-200 focus:border-[#635bff] focus:ring-4 focus:ring-[#635bff]/10 rounded-xl p-3 text-sm transition-all outline-none font-medium text-slate-900" />
  </div>
);

const StepItem = ({ current, step, icon: Icon, label }) => {
  const isActive = current === step;
  const isCompleted = current > step;
  return (
    <div className={`flex items-center gap-3 transition-all duration-300 ${isActive ? 'opacity-100 translate-x-1' : 'opacity-50'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${isActive ? 'bg-slate-900 border-slate-900 text-white' : isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-300'}`}>{isCompleted ? <CheckCircle2 size={14} /> : <Icon size={14} />}</div>
      <p className={`text-xs font-bold ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{label}</p>
    </div>
  );
};

export default EnterpriseForm;