import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
	ShieldCheck, Lock, Users, FileText, ScrollText, AlertCircle, 
	Server, Ban, X, Fingerprint, Globe, Download, CreditCard, 
	ChevronDown, Activity 
} from 'lucide-react';
import { DarkAuroraBackground } from './SharedBackgrounds';

const PrivacyPage = ({ onAccept, isFooterView = false, onClose, initialTab = 'privacy' }) => {
	// Använder initialTab för att bestämma startflik
	const [activeTab, setActiveTab] = useState(initialTab);	
	const [canAccept, setCanAccept] = useState(false);
	
	const handleScroll = (e) => {
		const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 50;
		if (bottom) setCanAccept(true);
	};

	const downloadDPA = (e) => {
		e.preventDefault();
		alert("Standard DPA (PDF) downloaded.");
	};

	return (
		<div className="fixed inset-0 z-[9999] bg-gray-900/70 backdrop-blur-xl flex items-center justify-center sm:p-4">
			<motion.div	
				initial={{ scale: 0.95, opacity: 0 }}	
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0.95, opacity: 0 }}
				transition={{ type: "spring", damping: 25, stiffness: 300 }}
				className="w-full sm:max-w-4xl bg-slate-800 sm:rounded-3xl rounded-none shadow-2xl border border-white/10 overflow-hidden flex flex-col h-full sm:h-[85vh] relative"
			>
				<div className="absolute inset-0 pointer-events-none">
					<DarkAuroraBackground />
				</div>

				{isFooterView && (
					<button onClick={onClose} className="absolute top-6 right-6 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-md border border-white/10">
						<X size={20} />
					</button>
				)}

				<div className="p-8 pb-0 text-center shrink-0 relative z-10">
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wide mb-4 backdrop-blur-md">
						 <Globe size={12} /> Legal Center
					</div>
					<h1 className="text-3xl font-bold text-white tracking-tight mb-2">Compliance & Terms</h1>
					<p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">
						Transparent policies designed for enterprise security and GDPR compliance.
					</p>

					<div className="flex p-1 bg-black/20 rounded-xl mb-8 relative border border-white/5 backdrop-blur-xl max-w-md mx-auto">
						<button onClick={() => setActiveTab('privacy')} className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-lg transition-all relative z-10 flex items-center justify-center gap-2 ${activeTab === 'privacy' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}>
							<Lock size={14} /> Privacy Policy
						</button>
						<button onClick={() => setActiveTab('terms')} className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-lg transition-all relative z-10 flex items-center justify-center gap-2 ${activeTab === 'terms' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}>
							<ScrollText size={14} /> Terms of Service
						</button>
						<motion.div	
							className="absolute top-1 bottom-1 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20"
							initial={false}
							animate={{ left: activeTab === 'privacy' ? '4px' : '50%', width: 'calc(50% - 4px)' }}
							transition={{ type: "spring", stiffness: 300, damping: 30 }}
						/>
					</div>
				</div>

				<div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 relative z-10 scroll-smooth" onScroll={handleScroll}>
					<AnimatePresence mode='wait'>
						{activeTab === 'privacy' ? (
							<motion.div key="privacy" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6 pb-8">
								<p className="text-xs uppercase tracking-wider font-bold text-emerald-500 mb-4">Effective Date: November 24, 2025</p>
								
								<Section title="1. Payment Information" icon={CreditCard} color="emerald">
									<p className="text-sm mb-3 text-slate-300">
										Payments are processed by <strong>Stripe</strong>. Auditor Veritas does <strong>not</strong> store or process complete credit card numbers.
									</p>
									<ul className="list-disc pl-5 space-y-1 text-sm marker:text-emerald-500 text-slate-400">
										<li>Payment data is securely transmitted directly to Stripe (PCI-DSS Service Provider Level 1).</li>
										<li>We only retain limited billing information (e.g., billing address, last 4 digits) for invoicing.</li>
									</ul>
								</Section>

								<Section title="2. Data Processor Agreement (DPA)" icon={FileText} color="blue">
									<p className="text-sm mb-3 text-slate-300">By using Auditor Veritas, you designate us as a <strong>Data Processor</strong> under GDPR Article 28.</p>
									<button onClick={downloadDPA} className="inline-flex items-center gap-2 text-xs font-bold text-blue-300 bg-blue-500/10 px-4 py-2 rounded-lg hover:bg-blue-500/20 transition-colors border border-blue-500/30">
										<Download size={14}/> Download Standard DPA (PDF)
									</button>
								</Section>

								<Section title="3. Security Architecture" icon={Server} color="indigo">
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
										<FeatureBox title="Storage Location" desc="EU (Frankfurt)" verified />
										<FeatureBox title="Encryption at Rest" desc="AES-256-GCM" verified />
										<FeatureBox title="Transport Security" desc="TLS 1.3 Only" verified />
										<FeatureBox title="Key Management" desc="HSM Rotated" verified />
									</div>
								</Section>

								<Section title="4. Sub-processors" icon={Users} color="slate">
									<div className="mt-3 overflow-hidden rounded-lg border border-white/10">
										<table className="w-full text-xs text-left text-slate-300">
											<thead className="bg-white/5 text-slate-400">
												<tr><th className="p-3">Entity</th><th className="p-3">Role</th><th className="p-3">Location</th></tr>
											</thead>
											<tbody className="divide-y divide-white/5">
												<tr><td className="p-3 font-bold">Supabase</td><td className="p-3">Database</td><td className="p-3">EU (Ireland)</td></tr>
												<tr><td className="p-3 font-bold">Stripe</td><td className="p-3">Payments</td><td className="p-3">US (SCCs)</td></tr>
												<tr><td className="p-3 font-bold">Render</td><td className="p-3">Hosting</td><td className="p-3">EU (Germany)</td></tr>
											</tbody>
										</table>
									</div>
								</Section>
							</motion.div>
						) : (
							<motion.div key="terms" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6 pb-8">
								<Section title="1. Acceptable Use" icon={AlertCircle} color="orange">
									<p className="text-sm mb-3 text-slate-300">You agree to use the API lawfully. You strictly agree <strong>NOT</strong> to:</p>
									<ul className="space-y-2 bg-orange-500/10 p-4 rounded-xl border border-orange-500/20 text-sm text-orange-200">
										<li className="flex gap-2"><Ban size={16} className="shrink-0"/> Reverse engineer the cryptographic proof engine.</li>
										<li className="flex gap-2"><Ban size={16} className="shrink-0"/> Store illegal content or malware.</li>
										<li className="flex gap-2"><Ban size={16} className="shrink-0"/> Circumvent rate limits.</li>
									</ul>
								</Section>

								<Section title="2. Fees and Payments" icon={CreditCard} color="emerald">
									<p className="text-sm mb-3 text-slate-300">
										Subscription fees are billed in advance on a monthly or yearly basis.
									</p>
									<ul className="list-disc pl-5 space-y-1 text-sm marker:text-emerald-500 text-slate-400">
										<li><strong>Non-refundable:</strong> Fees paid are non-refundable except as required by law.</li>
										<li><strong>Downgrades:</strong> Downgrading your plan may cause loss of content.</li>
										<li><strong>Taxes:</strong> All fees are exclusive of taxes.</li>
									</ul>
								</Section>

								<Section title="3. Service Level Agreement" icon={Activity} color="blue">
									<p className="text-sm mb-3 text-slate-300">Enterprise plans guarantee <strong>99.9% Uptime</strong>.</p>
									<ul className="list-disc pl-5 space-y-1 text-sm marker:text-blue-500 text-slate-400">
										<li><strong>Maintenance:</strong> Communicated 48h in advance.</li>
										<li><strong>Compensation:</strong> 10% credit per 1% downtime below SLA.</li>
									</ul>
								</Section>

								<Section title="4. Liability" icon={ShieldCheck} color="slate">
									<p className="text-sm text-slate-400 text-justify">TO THE MAXIMUM EXTENT PERMITTED BY LAW, AUDITOR VERITAS SHALL NOT BE LIABLE FOR INDIRECT DAMAGES. AGGREGATE LIABILITY SHALL NOT EXCEED THE AMOUNT PAID IN THE PAST 12 MONTHS.</p>
								</Section>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{!isFooterView && (
					<div className="p-6 border-t border-white/10 bg-slate-800 shrink-0 z-20 relative">
						{!canAccept && (
							<div className="absolute -top-12 left-0 w-full flex justify-center pointer-events-none">
								<motion.div initial={{ y: 0 }} animate={{ y: 5 }} transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }} className="bg-blue-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full flex items-center shadow-lg gap-2">
									Please read to the end <ChevronDown size={12}/>
								</motion.div>
							</div>
						)}
						<button onClick={onAccept} disabled={!canAccept} className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${canAccept ? 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-blue-500/25' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'}`}>
							{canAccept ? <><ShieldCheck size={20} /> I Accept Terms & Privacy Policy</> : 'Scroll to Accept'}
						</button>
					</div>
				)}
			</motion.div>
		</div>
	);
};

// --- SUB-KOMPONENTER ---

const Section = ({ title, icon: Icon, color, children }) => (
	<div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
		<div className="flex items-center mb-4 pb-3 border-b border-white/5">
			<div className={`p-2 rounded-lg bg-${color}-500/10 mr-3`}><Icon className={`w-5 h-5 text-${color}-400`} /></div>
			<h3 className="font-bold text-white text-lg">{title}</h3>
		</div>
		{children}
	</div>
);


const FeatureBox = ({ title, desc, verified }) => (
	<div className="bg-black/20 p-3 rounded-lg border border-white/5 flex justify-between items-center">
		<div><p className="font-bold text-slate-300 text-xs">{title}</p><p className="text-[11px] text-slate-500">{desc}</p></div>
		{verified && <div className="text-emerald-400"><CheckCircleMini /></div>}
	</div>
);


const CheckCircleMini = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>);


export default PrivacyPage;