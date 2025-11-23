import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Server, Shield, ArrowRight, ArrowLeft, Send, 
  CheckCircle2, Globe, Zap, Cpu, Lock, AlertCircle
} from 'lucide-react';

const EnterpriseForm = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', company: '', role: '', volume: '', region: 'eu-west-1', retention: '90', compliance: []
  });

  useEffect(() => {
    let valid = false;
    if (step === 1) valid = formData.name.length > 2 && formData.email.includes('@') && formData.company.length > 2;
    else if (step === 2) valid = formData.volume !== '';
    else if (step === 3) valid = true;
    setIsValid(valid);
  }, [formData, step]);

  const encode = (data) => Object.keys(data).map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key])).join("&");
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const selectVolume = (vol) => setFormData(prev => ({ ...prev, volume: vol }));
  const toggleCompliance = (tech) => setFormData(prev => ({ ...prev, compliance: prev.compliance.includes(tech) ? prev.compliance.filter(t => t !== tech) : [...prev.compliance, tech] }));

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
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Protocol Initiated</h2>
        {/* HÄR ÄR DEN NYA TEXTEN */}
        <p className="text-slate-600 mb-8 leading-relaxed text-base">
          Secure infrastructure profile generated for <strong>{formData.company}</strong>. <br/>
          Access credentials and SLA details have been queued for delivery to your provided email.
        </p>
        <button onClick={() => window.location.reload()} className="text-[#635bff] font-bold hover:underline text-sm">Return to Main Console</button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in-up text-slate-900 px-4">
      <div className="text-center mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white border border-slate-700 text-xs font-bold uppercase tracking-wide mb-4 shadow-xl"><Zap size={14} className="text-[#00d4ff]" /> Enterprise Gateway</div>
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">Scale without limits.</h2>
        <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto font-light">Configure throughput, retention, and SLA.</p>
      </div>

      <div className="grid md:grid-cols-12 gap-8 items-start">
        {/* Sidebar Hidden on Mobile */}
        <div className="md:col-span-4 space-y-6 sticky top-24 hidden md:block">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <StepItem current={step} step={1} icon={Building2} label="Organization" />
            <div className="h-6 w-px bg-slate-100 ml-6 my-1"></div>
            <StepItem current={step} step={2} icon={Server} label="Infrastructure" />
            <div className="h-6 w-px bg-slate-100 ml-6 my-1"></div>
            <StepItem current={step} step={3} icon={Shield} label="Compliance" />
          </div>
        </div>

        <div className="md:col-span-8">
          <motion.form className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden relative min-h-[450px] flex flex-col" onSubmit={handleSubmit} name="enterprise-inquiry" data-netlify="true">
            <input type="hidden" name="form-name" value="enterprise-inquiry" />
            <div className="h-1.5 bg-slate-100 w-full md:hidden"><motion.div className="h-full bg-[#635bff]" initial={{ width: 0 }} animate={{ width: `${(step/3)*100}%` }} /></div>

            <div className="p-6 md:p-10 flex-1">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Identity Verification</h3>
                    <div className="space-y-4 mt-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <InputGroup label="Full Name" name="name" placeholder="Jane Doe" value={formData.name} onChange={handleChange} required />
                        <InputGroup label="Work Email" name="email" type="email" placeholder="jane@corp.com" value={formData.email} onChange={handleChange} required />
                      </div>
                      <InputGroup label="Company Entity" name="company" placeholder="Acme Corp" value={formData.company} onChange={handleChange} required />
                    </div>
                  </motion.div>
                )}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Capacity & Region</h3>
                    <div className="space-y-6 mt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {['< 1M Events', '1M - 10M', '10M - 100M', '100M+'].map(opt => (
                            <div key={opt} onClick={() => selectVolume(opt)} className={`cursor-pointer rounded-xl p-4 border transition-all flex justify-between items-center ${formData.volume === opt ? 'border-[#635bff] bg-[#635bff]/5' : 'border-slate-200 hover:border-slate-300'}`}>
                              <span className={`text-sm font-bold ${formData.volume === opt ? 'text-[#635bff]' : 'text-slate-600'}`}>{opt}</span>
                              {formData.volume === opt && <CheckCircle2 size={16} className="text-[#635bff]"/>}
                            </div>
                          ))}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Region</label>
                              <select name="region" value={formData.region} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium outline-none">
                                <option value="eu-west-1">EU (Ireland)</option>
                                <option value="us-east-1">US (N. Virginia)</option>
                              </select>
                           </div>
                           <div className="space-y-1">
                              <div className="flex justify-between"><label className="text-[10px] font-bold text-slate-500 uppercase">Retention</label><span className="text-xs font-bold text-[#635bff]">{formData.retention} Days</span></div>
                              <input type="range" name="retention" min="30" max="3650" step="30" value={formData.retention} onChange={handleChange} className="w-full h-2 bg-slate-200 rounded-lg accent-[#635bff]" />
                           </div>
                        </div>
                    </div>
                  </motion.div>
                )}
                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Compliance Requirements</h3>
                    <div className="flex flex-wrap gap-2 mt-4">
                       {['GDPR', 'CCPA', 'SOC 2', 'HIPAA', 'ISO 27001'].map(tech => (
                         <button key={tech} type="button" onClick={() => toggleCompliance(tech)} className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${formData.compliance.includes(tech) ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200'}`}>
                           {formData.compliance.includes(tech) && <CheckCircle2 size={12} className="text-emerald-400"/>} {tech}
                         </button>
                       ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
               {step > 1 ? <button type="button" onClick={prevStep} className="text-slate-500 font-bold hover:text-slate-800 flex items-center gap-2 px-2 py-2 text-sm"><ArrowLeft size={16} /> Back</button> : <div className="w-10"></div>}
               {step < 3 ? (
                 <button type="button" onClick={nextStep} disabled={!isValid} className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all ${isValid ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>Continue <ArrowRight size={16} /></button>
               ) : (
                 <button type="submit" disabled={isSubmitting} className="bg-[#635bff] text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#5449e3] shadow-lg disabled:opacity-70">{isSubmitting ? 'Sending...' : <><Send size={16} /> Send Request</>}</button>
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
    <input name={name} {...props} className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#635bff] rounded-xl p-3 text-sm transition-all outline-none font-medium text-slate-900" />
  </div>
);

const StepItem = ({ current, step, icon: Icon, label }) => {
  const isActive = current === step;
  const isCompleted = current > step;
  return (
    <div className={`flex items-center gap-3 transition-all ${isActive ? 'opacity-100' : 'opacity-50'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${isActive ? 'bg-slate-900 border-slate-900 text-white' : isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-300'}`}>{isCompleted ? <CheckCircle2 size={14} /> : <Icon size={14} />}</div>
      <p className="text-xs font-bold text-slate-700">{label}</p>
    </div>
  );
};

export default EnterpriseForm;