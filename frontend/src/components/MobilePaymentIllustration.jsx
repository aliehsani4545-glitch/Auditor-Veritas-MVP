import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const MobilePaymentIllustration = ({ activeProduct }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    // Mobile device entrance animation
    gsap.from(containerRef.current, {
      scale: 0.8,
      opacity: 0,
      rotation: 10,
      duration: 1,
      ease: "back.out(1.7)",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
        toggleActions: "play none none none"
      }
    });

    // Subtle floating animation
    gsap.to(containerRef.current, {
      y: -10,
      duration: 3,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1
    });

    // Content animation based on active product
    const screenContent = containerRef.current.querySelector('.screen-content');
    if (screenContent) {
      gsap.fromTo(screenContent, {
        opacity: 0,
        x: 20
      }, {
        opacity: 1,
        x: 0,
        duration: 0.5,
        ease: "power2.out"
      });
    }

  }, [activeProduct]);

  return (
    <div ref={containerRef} className="performance-optimized flex justify-center items-center w-full h-full relative">
      <div className="relative">
        <div className="w-64 h-96 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[40px] p-4 shadow-2xl border-4 border-slate-700 relative">
          <div className="screen-content w-full h-full bg-gradient-to-br from-blue-50 to-cyan-50 rounded-[32px] overflow-hidden relative">
            <div className="bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">
                  {activeProduct === 'crypto' && 'Secure Hash'}
                  {activeProduct === 'merkle' && 'Data Integrity'}  
                  {activeProduct === 'keys' && 'Key Rotation'}
                  {activeProduct === 'compliance' && 'GDPR Check'}
                </div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {activeProduct === 'crypto' && (
                <div className="space-y-3">
                  <div className="bg-slate-800 rounded-lg p-3">
                    <div className="text-white text-xs font-mono truncate">
                      SHA-256: a1b2c3d4e5f6...
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="flex-1 bg-emerald-500 rounded-lg h-2"></div>
                    <div className="flex-1 bg-emerald-400 rounded-lg h-2"></div>
                    <div className="flex-1 bg-emerald-300 rounded-lg h-2"></div>
                  </div>
                </div>
              )}

              {activeProduct === 'merkle' && (
                <div className="space-y-3">
                  <div className="flex justify-center space-x-4">
                    <div className="text-center">
                      <div className="w-4 h-4 bg-blue-500 rounded-full mx-auto mb-1"></div>
                      <div className="text-xs text-slate-600">Root</div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  </div>
                </div>
              )}

              {activeProduct === 'keys' && (
                <div className="space-y-3">
                  <div className="bg-amber-100 rounded-lg p-3 text-center">
                    <div className="text-amber-800 text-sm font-semibold">
                      Key Rotation
                    </div>
                    <div className="text-amber-600 text-xs">
                      Next: 89 days
                    </div>
                  </div>
                </div>
              )}

              {activeProduct === 'compliance' && (
                <div className="space-y-3">
                  <div className="bg-green-100 rounded-lg p-3 text-center">
                    <div className="text-green-800 text-sm font-semibold">
                      ✅ GDPR Compliant
                    </div>
                    <div className="text-green-600 text-xs">
                      Article 32
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-slate-900 text-sm font-medium mb-2">
                  Audit Event
                </div>
                <div className="text-slate-600 text-xs">
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-white rounded-2xl p-2 shadow-lg">
                <div className="flex justify-around">
                  {['crypto', 'merkle', 'keys', 'compliance'].map((product) => (
                    <div 
                      key={product}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        activeProduct === product 
                          ? 'bg-blue-500 scale-125' 
                          : 'bg-slate-300'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -left-2 top-1/3 w-1 h-12 bg-slate-600 rounded-l"></div>
          <div className="absolute -left-2 top-1/2 w-1 h-12 bg-slate-600 rounded-l"></div>
          <div className="absolute -right-2 top-1/3 w-1 h-12 bg-slate-600 rounded-r"></div>
        </div>
      </div>
    </div>
  );
};

export default MobilePaymentIllustration;