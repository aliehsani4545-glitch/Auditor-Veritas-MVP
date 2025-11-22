// components/MobilePaymentIllustration.jsx
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const MobilePaymentIllustration = ({ activeProduct }) => {
  const svgRef = useRef(null);

  // Innehållsdefinitioner för de olika produkterna (SVG paths)
  const screens = {
    crypto: (
      <g id="screen-crypto" className="screen-content">
        {/* Header bar */}
        <path d="M20 40 H280" stroke="currentColor" strokeWidth="2" className="draw-line" />
        {/* Hashing Block Animation */}
        <rect x="40" y="80" width="220" height="120" rx="8" stroke="currentColor" strokeWidth="2" fill="none" className="draw-line" />
        <path d="M60 110 H240" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />
        <path d="M60 140 H240" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />
        <path d="M60 170 H180" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />
        
        {/* Lock Icon Center */}
        <circle cx="150" cy="140" r="20" stroke="currentColor" strokeWidth="2" fill="#0f172a" className="draw-pop" />
        <path d="M140 135 V130 A10 10 0 0 1 160 130 V135" stroke="white" strokeWidth="2" fill="none" />
        <rect x="140" y="135" width="20" height="16" rx="2" fill="white" />
        
        {/* Status Text */}
        <text x="150" y="240" textAnchor="middle" fill="currentColor" fontSize="14" fontWeight="bold" className="fade-in">
          SHA-256 ENCRYPTED
        </text>
      </g>
    ),
    merkle: (
      <g id="screen-merkle" className="screen-content">
        {/* Tree Structure */}
        <circle cx="150" cy="60" r="15" stroke="currentColor" strokeWidth="2" fill="none" className="draw-pop" />
        
        <path d="M150 75 V110" stroke="currentColor" strokeWidth="2" className="draw-line" />
        <path d="M150 110 L100 140" stroke="currentColor" strokeWidth="2" className="draw-line" />
        <path d="M150 110 L200 140" stroke="currentColor" strokeWidth="2" className="draw-line" />
        
        <circle cx="100" cy="140" r="12" stroke="currentColor" strokeWidth="2" fill="none" className="draw-pop" />
        <circle cx="200" cy="140" r="12" stroke="currentColor" strokeWidth="2" fill="none" className="draw-pop" />
        
        <path d="M100 152 L70 180" stroke="currentColor" strokeWidth="2" className="draw-line" />
        <path d="M100 152 L130 180" stroke="currentColor" strokeWidth="2" className="draw-line" />
        <path d="M200 152 L170 180" stroke="currentColor" strokeWidth="2" className="draw-line" />
        <path d="M200 152 L230 180" stroke="currentColor" strokeWidth="2" className="draw-line" />

        {/* Verified Badge */}
        <rect x="80" y="220" width="140" height="40" rx="20" fill="currentColor" opacity="0.1" className="fade-in" />
        <text x="150" y="245" textAnchor="middle" fill="currentColor" fontSize="12" fontWeight="bold" className="fade-in">
          INTEGRITY VERIFIED
        </text>
      </g>
    ),
    keys: (
      <g id="screen-keys" className="screen-content">
        {/* Key Rotation Animation */}
        <circle cx="150" cy="120" r="50" stroke="currentColor" strokeWidth="2" strokeDasharray="10 5" fill="none" className="spin-slow" />
        
        <path d="M150 90 V70" stroke="currentColor" strokeWidth="2" />
        <path d="M150 70 L160 70 L160 75" stroke="currentColor" strokeWidth="2" fill="none" />
        
        {/* Key Icon */}
        <path d="M135 135 L165 105" stroke="currentColor" strokeWidth="3" className="draw-line" />
        <circle cx="135" cy="135" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M160 110 L165 115" stroke="currentColor" strokeWidth="2" />
        <path d="M155 115 L160 120" stroke="currentColor" strokeWidth="2" />
        
        {/* Timer Bar */}
        <rect x="50" y="200" width="200" height="6" rx="3" fill="currentColor" opacity="0.2" />
        <rect x="50" y="200" width="120" height="6" rx="3" fill="#10b981" className="draw-width" />
        <text x="50" y="225" fill="currentColor" fontSize="10" className="fade-in">Auto-rotation: 90 days</text>
      </g>
    ),
    compliance: (
      <g id="screen-compliance" className="screen-content">
        {/* Checklist */}
        <rect x="40" y="60" width="220" height="40" rx="8" stroke="currentColor" strokeWidth="2" fill="none" className="draw-line" />
        <circle cx="60" cy="80" r="8" fill="#10b981" className="draw-pop" />
        <path d="M56 80 L59 83 L64 77" stroke="white" strokeWidth="2" fill="none" />
        <text x="80" y="85" fill="currentColor" fontSize="14">GDPR Art. 32</text>

        <rect x="40" y="115" width="220" height="40" rx="8" stroke="currentColor" strokeWidth="2" fill="none" className="draw-line" style={{animationDelay: '0.2s'}} />
        <circle cx="60" cy="135" r="8" fill="#10b981" className="draw-pop" style={{animationDelay: '0.2s'}} />
        <path d="M56 135 L59 138 L64 132" stroke="white" strokeWidth="2" fill="none" />
        <text x="80" y="140" fill="currentColor" fontSize="14">Data Residency (EU)</text>

        <rect x="40" y="170" width="220" height="40" rx="8" stroke="currentColor" strokeWidth="2" fill="none" className="draw-line" style={{animationDelay: '0.4s'}} />
        <circle cx="60" cy="190" r="8" fill="#10b981" className="draw-pop" style={{animationDelay: '0.4s'}} />
        <path d="M56 190 L59 193 L64 187" stroke="white" strokeWidth="2" fill="none" />
        <text x="80" y="195" fill="currentColor" fontSize="14">Right to Erasure</text>
      </g>
    )
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Återställ allt
      gsap.set(".draw-line", { strokeDasharray: 400, strokeDashoffset: 400 });
      gsap.set(".draw-pop", { scale: 0, transformOrigin: "center" });
      gsap.set(".fade-in", { opacity: 0, y: 10 });
      gsap.set(".draw-width", { width: 0 });

      // 2. Animera in det aktiva
      const tl = gsap.timeline();

      tl.to(".draw-line", {
        strokeDashoffset: 0,
        duration: 1.2,
        ease: "power2.out",
        stagger: 0.1
      })
      .to(".draw-pop", {
        scale: 1,
        duration: 0.4,
        ease: "back.out(1.7)",
        stagger: 0.05
      }, "-=0.8")
      .to(".draw-width", {
        width: 120, // Mål-bredd
        duration: 1,
        ease: "power1.inOut"
      }, "-=1")
      .to(".fade-in", {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1
      }, "-=0.5");

    }, svgRef);

    return () => ctx.revert();
  }, [activeProduct]);

  return (
    <div className="relative w-full max-w-[320px] aspect-[9/19] mx-auto transform transition-transform duration-500 hover:scale-105">
      {/* SVG Container */}
      <svg 
        ref={svgRef}
        viewBox="0 0 300 600" 
        className="w-full h-full drop-shadow-2xl"
        style={{ color: '#334155' }} // Slate-700 som basfärg för linjerna
      >
        <defs>
          <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* PHONE BEZEL (Alltid synlig) */}
        <rect x="10" y="10" width="280" height="580" rx="40" fill="#1e293b" stroke="#475569" strokeWidth="8" />
        
        {/* SCREEN AREA */}
        <rect x="25" y="25" width="250" height="550" rx="32" fill="url(#screenGrad)" />
        
        {/* Dynamic Content Area - Clip or mask could be used here, but simple layering works */}
        <g transform="translate(0, 50)">
           {/* Rendera innehåll baserat på activeProduct, fallback till crypto */}
           {screens[activeProduct] || screens.crypto}
        </g>

        {/* Dynamic Island / Notch */}
        <rect x="100" y="35" width="100" height="24" rx="12" fill="#0f172a" />

        {/* Home Indicator */}
        <rect x="100" y="555" width="100" height="4" rx="2" fill="#94a3b8" />
        
        {/* Reflection/Shine effect (Overlay) */}
        <path d="M25 25 Q 275 25 275 50 V 200 L 25 400 Z" fill="white" opacity="0.05" pointerEvents="none" />
      </svg>
    </div>
  );
};

export default MobilePaymentIllustration;