import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Server, Shield, ArrowRight, ArrowLeft, Send, 
  CheckCircle2, Globe, Database, Zap, Cpu, Lock, AlertCircle
} from 'lucide-react';

const EnterpriseForm = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    volume: '', 
    region: 'eu-west-1',
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

  // Netlify Helper
  const encode = (data) => {
    return Object.keys(data)
      .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
      .join("&");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectVolume = (vol) => {
    setFormData(prev => ({ ...prev, volume: vol }));
  };

  const toggleCompliance = (tech) => {
    setFormData(prev => {
      const exists = prev.compliance.includes(tech);
      return {
        ...prev,
        compliance: exists 
          ? prev.compliance.filter(t => t !== tech)
          : [...prev.compliance, tech]
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    setIsSubmitting(true);
    
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encode({ "form-name": "enterprise-inquiry", ...formData })
    })
    .then(() => {
      setSubmitted(true);
      setIsSubmitting(false);
    })
    .catch(error => {
      console.error(error);
      setIsSubmitting(false);
    });
  };

  const nextStep = () => { if(isValid) setStep(prev => prev + 1); };
  const prevStep = () => setStep(prev => prev - 1);

  // Success View
  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto bg-white p-12 rounded-[2rem] shadow-2xl text-center border border-slate-100 mt-10"
      >
        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-50/50">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Request Initiated</h2>
        <p className="text-slate-600 mb-8 leading-relaxed text-lg">
          Your secure infrastructure profile for <strong>{formData.company}</strong> has been generated. <br/><br/>
          Our Solutions Architect will contact <strong>{formData.email}</strong> shortly to finalize the provisioning.
        </p>
        <button onClick={() => window.location.reload()} className="text-[#635bff] font-bold hover:underline text-sm">
          Return to Main Console
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in-up text-slate-900">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white border border-slate-700 text-xs font-bold uppercase tracking-wide mb-6 shadow-xl">
          <Zap size={14} className="text-[#00d4ff]" /> Enterprise Gateway
        </div>
        <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
          Scale without limits.
        </h2>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-light">
          Configure your dedicated cluster. High throughput, custom retention, and priority SLA.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar */}
        <div className="md:col-span-4 space-y-6 sticky top-24 hidden md:block">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <StepItem current={step} step={1} icon={Building2} label="Organization" />
            <div className="h-6 w-px bg-slate-100 ml-6 my-1"></div>
            <StepItem current={step} step={2} icon={Server} label="Infrastructure" />
            <div className="h-6 w-px bg-slate-100 ml-6 my-1"></div>
            <StepItem current={step} step={3} icon={Shield} label="Compliance" />
          </div>
          
          <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-20 bg-[#635bff] opacity-20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Cpu size={12}/> System Config
            </h4>
            <div className="space-y-4 relative z-10">
              <div>
                <p className="text-xs text-slate-400">Target Region</p>
                <p className="font-mono text-sm font-bold text-[#00d4ff]">{formData.region}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Throughput</p>
                <p className="font-mono text-sm font-bold">{formData.volume || 'Pending Selection...'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Wizard */}
        <div className="md:col-span-8">
          <motion.form 
            className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative min-h-[550px] flex flex-col"
            onSubmit={handleSubmit}
            name="enterprise-inquiry" 
            data-netlify="true"
          >
            <input type="hidden" name="form-name" value="enterprise-inquiry" />
            
            <div className="h-1.5 bg-slate-100 w-full md:hidden">
              <motion.div className="h-full bg-[#635bff]" initial={{ width: 0 }} animate={{ width: `${(step/3)*100}%` }} />
            </div>

            <div className="p-8 md:p-12 flex-1">
              <AnimatePresence mode="wait">
                
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Identity Verification</h3>
                    <p className="text-slate-500 mb-10">Please provide your business credentials.</p>
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <InputGroup label="Full Name" name="name" placeholder="e.g. Sarah Connor" value={formData.name} onChange={handleChange} required />
                        <InputGroup label="Work Email" name="email" type="email" placeholder="sarah@cyberdyne.com" value={formData.email} onChange={handleChange} required />
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <InputGroup label="Company / Entity" name="company" placeholder="e.g. Cyberdyne Systems" value={formData.company} onChange={handleChange} required />
                        <InputGroup label="Role (Optional)" name="role" placeholder="e.g. Lead Architect" value={formData.role} onChange={handleChange} />
                      </div>
                    </div>
                    {!isValid && <div className="mt-6 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-lg"><AlertCircle size={14}/> Please fill in all required fields.</div>}
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Capacity Planning</h3>
                    <p className="text-slate-500 mb-8">Define your expected throughput and residency.</p>
                    <div className="space-y-8">
                      <div>
                        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 block">Monthly Event Volume <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {['< 100k', '100k - 1M', '1M - 10M', '10M+'].map(opt => (
                            <div key={opt} onClick={() => selectVolume(opt)} className={`cursor-pointer rounded-xl p-5 border-2 transition-all relative overflow-hidden ${formData.volume === opt ? 'border-[#635bff] bg-[#635bff]/5 shadow-md' : 'border-slate-100 bg-white hover:border-slate-300'}`}>
                              <div className="flex justify-between items-center"><span className={`font-bold ${formData.volume === opt ? 'text-[#635bff]' : 'text-slate-700'}`}>{opt}</span>{formData.volume === opt && <div className="bg-[#635bff] rounded-full p-1"><CheckCircle2 size={12} className="text-white"/></div>}</div>
                              <p className="text-xs text-slate-400 mt-1">Events / Month</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-8">
                         <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">Data Residency</label>
                            <div className="relative">
                              <Globe className="absolute left-4 top-3.5 text-slate-400" size={18} />
                              <select name="region" value={formData.region} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-12 text-sm font-medium outline-none appearance-none cursor-pointer">
                                <option value="eu-west-1">EU (Ireland)</option>
                                <option value="eu-central-1">EU (Frankfurt)</option>
                                <option value="us-east-1">US (N. Virginia)</option>
                              </select>
                            </div>
                         </div>
                         <div className="space-y-2">
                            <div className="flex justify-between"><label className="text-xs font-bold text-slate-900 uppercase tracking-wider">Log Retention</label><span className="text-xs font-bold text-[#635bff] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{formData.retention} Days</span></div>
                            <input type="range" name="retention" min="30" max="3650" step="30" value={formData.retention} onChange={handleChange} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#635bff]" />
                         </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Compliance</h3>
                    <p className="text-slate-500 mb-10">Select standards to generate your SLA.</p>
                    <div className="flex flex-wrap gap-3 mb-10">
                       {['GDPR (EU)', 'CCPA (US)', 'SOC 2 Type II', 'HIPAA', 'ISO 27001', 'PCI DSS'].map(tech => (
                         <button key={tech} type="button" onClick={() => toggleCompliance(tech)} className={`px-5 py-3 rounded-xl text-sm font-bold border-2 transition-all duration-200 flex items-center gap-2 ${formData.compliance.includes(tech) ? 'bg-slate-900 text-white border-slate-900 shadow-lg transform scale-105' : 'bg-white text-slate-500 border-slate-100 hover:border-[#635bff]'}`}>
                           {formData.compliance.includes(tech) ? <CheckCircle2 size={16} className="text-emerald-400"/> : <div className="w-4"/>} {tech}
                         </button>
                       ))}
                       <input type="hidden" name="compliance_list" value={formData.compliance.join(', ')} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
               {step > 1 ? <button type="button" onClick={prevStep} className="text-slate-500 font-bold hover:text-slate-800 flex items-center gap-2 px-4 py-2"><ArrowLeft size={18} /> Back</button> : <div className="w-20"></div>}
               {step < 3 ? (
                 <button type="button" onClick={nextStep} disabled={!isValid} className={`px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all transform active:scale-95 ${isValid ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>Continue <ArrowRight size={18} /></button>
               ) : (
                 <button type="submit" disabled={isSubmitting} className="bg-[#635bff] text-white px-10 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#5449e3] shadow-lg transition-all transform active:scale-95 disabled:opacity-70">{isSubmitting ? 'Establishing Connection...' : <><Send size={18} /> Provision Access</>}</button>
               )}
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

const InputGroup = ({ label, name, required, ...props }) => (
  <div className="space-y-1.5 group">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-[#635bff] transition-colors">{label} {required && <span className="text-red-400">*</span>}</label>
    <input name={name} {...props} className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#635bff] rounded-xl p-3.5 text-sm transition-all outline-none font-medium text-slate-900 placeholder:text-slate-300 shadow-sm focus:shadow-md" />
  </div>
);

const StepItem = ({ current, step, icon: Icon, label }) => {
  const isActive = current === step;
  const isCompleted = current > step;
  return (
    <div className={`flex items-center gap-4 transition-all duration-300 ${isActive ? 'opacity-100 translate-x-1' : 'opacity-50'}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isActive ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-300'}`}>{isCompleted ? <CheckCircle2 size={20} /> : <Icon size={18} />}</div>
      <div><p className={`text-sm font-bold ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>{label}</p></div>
    </div>
  );
};

export default EnterpriseForm;