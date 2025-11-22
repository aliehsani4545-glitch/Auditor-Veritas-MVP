import React, { useState, useEffect } from 'react';
import './App.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Components
import AnimatedBackground from './components/AnimatedBackground'; 
import PhoneDemo from './components/PhoneDemo'; // NYA TELEFONEN
import Carousel3D from './components/Carousel3D'; // NYA KARUSELLEN
import PrivacyGate from './components/PrivacyGate'; // NYA GRINDEN
import CreateProcessor from './components/CreateProcessor'; 

import { ShieldCheck, Sparkles, Menu, X } from 'lucide-react';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

// --- HERO SECTION ---
const HeroSection = ({ setActiveTab }) => {
  return (
    <div className="relative bg-white">
      <div className="relative min-h-[90vh] flex items-center bg-[#0a2540] text-white pt-24 overflow-hidden">
        <AnimatedBackground /> 
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-[#00d4ff] text-sm font-medium border border-white/10 backdrop-blur-sm">
              <Sparkles className="w-4 h-4" /><span>Interactive Demo Live</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.1]">
              Compliance <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#635bff]">rewritten for speed.</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-xl leading-relaxed">
              The immutable ledger for modern platforms. Click on the orders in the phone demo to trace the payment flow through our Merkle Tree verification.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setActiveTab('create')} className="px-8 py-4 rounded-full bg-[#635bff] hover:bg-[#5449e3] font-bold shadow-lg transition-transform hover:scale-105">Start Integration</button>
              <button className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 font-bold backdrop-blur-sm">Documentation</button>
            </div>
          </div>

          {/* Right: Phone Demo (Screenshots Replica) */}
          <div className="flex justify-center">
            <PhoneDemo /> 
          </div>
        </div>

        {/* Separator */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-b from-transparent to-white pointer-events-none" />
      </div>

      {/* 3D Carousel Section */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
           <h2 className="text-4xl font-bold text-slate-900">Decentralized Integrity</h2>
           <p className="text-slate-500 mt-4 text-lg">Swipe to explore our core security nodes.</p>
        </div>
        <Carousel3D /> 
      </div>
    </div>
  );
};

// --- MAIN APP ---
function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('privacyAccepted_v4');
    if (saved === 'true') setPrivacyAccepted(true);
  }, []);

  const handlePrivacyAccept = () => {
    localStorage.setItem('privacyAccepted_v4', 'true');
    setPrivacyAccepted(true);
  };

  const openPrivacy = () => {
    setPrivacyAccepted(false);
    setMobileMenuOpen(false);
  };

  // Navbar
  const Navbar = () => (
    <header className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-8 h-8 bg-[#635bff] rounded-lg flex items-center justify-center"><ShieldCheck className="text-white w-5 h-5" /></div>
          <span className="text-xl font-bold text-[#0a2540]">Auditor Veritas</span>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-8 items-center">
           <button onClick={() => setActiveTab('home')} className="text-sm font-medium text-slate-600 hover:text-[#635bff]">Product</button>
           <button onClick={() => setActiveTab('create')} className="text-sm font-medium text-slate-600 hover:text-[#635bff]">Developers</button>
           <button onClick={openPrivacy} className="text-sm font-medium text-slate-600 hover:text-[#635bff]">Privacy & Terms</button>
           <button onClick={() => setActiveTab('dashboard')} className="bg-[#0a2540] text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-slate-800">Sign In</button>
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
           {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-0 w-full bg-white border-b border-slate-200 p-6 flex flex-col gap-4 md:hidden shadow-xl">
           <button onClick={() => {setActiveTab('home'); setMobileMenuOpen(false)}} className="text-left font-bold text-slate-700">Product</button>
           <button onClick={openPrivacy} className="text-left font-bold text-slate-700">Privacy & Terms</button>
           <button onClick={() => {setActiveTab('dashboard'); setMobileMenuOpen(false)}} className="w-full bg-[#0a2540] text-white py-3 rounded-xl">Sign In</button>
        </div>
      )}
    </header>
  );

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#635bff] selection:text-white flex flex-col">
      
      {/* PRIVACY GATE (Overlay) */}
      {!privacyAccepted && <PrivacyGate onAccept={handlePrivacyAccept} />}

      {/* MAIN CONTENT */}
      <div className={!privacyAccepted ? "blur-sm pointer-events-none h-screen overflow-hidden" : ""}>
        <Navbar />
        <main className="flex-1">
          {activeTab === 'home' && <HeroSection setActiveTab={setActiveTab} />}
          {activeTab === 'create' && <div className="pt-24 p-6 flex justify-center bg-slate-50"><CreateProcessor /></div>}
          {activeTab === 'dashboard' && <div className="pt-32 text-center text-slate-500">Dashboard placeholder...</div>}
        </main>
      </div>
    </div>
  );
}

export default App;