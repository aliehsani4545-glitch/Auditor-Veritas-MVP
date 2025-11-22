// components/MobilePaymentIllustration.jsx
import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

const MobilePaymentIllustration = ({ activeProduct }) => {
    const svgRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        if (!svgRef.current) return;

        // Stoppa tidigare animationer
        if (animationRef.current) {
            animationRef.current.kill();
        }

        const paths = svgRef.current.querySelectorAll('path');
        
        // Återställ till initialt tillstånd
        gsap.set(paths, {
            strokeDasharray: "1000",
            strokeDashoffset: "1000",
            opacity: 1
        });

        // Animera in när komponenten mountas eller activeProduct ändras
        animationRef.current = gsap.to(paths, {
            strokeDashoffset: 0,
            duration: 2,
            ease: "power2.inOut",
            stagger: 0.1
        });

    }, [activeProduct]);

    return (
        <div className="flex justify-center items-center w-full h-full relative">
            <div className="relative">
                {/* Mobile Device Frame */}
                <div className="w-64 h-96 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[40px] p-4 shadow-2xl border-4 border-slate-700 relative">
                    {/* Screen Content */}
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-cyan-50 rounded-[32px] overflow-hidden relative">
                        
                        {/* Header */}
                        <div className="bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-semibold text-slate-900">
                                    {activeProduct === 'crypto' && 'Secure Hash'}
                                    {activeProduct === 'merkle' && 'Data Integrity'}  
                                    {activeProduct === 'keys' && 'Key Rotation'}
                                    {activeProduct === 'compliance' && 'GDPR Check'}
                                </div>
                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            </div>
                        </div>

                        {/* Dynamic Content Based on Active Product */}
                        <div className="p-4 space-y-4">
                            {/* Crypto Hashing */}
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

                            {/* Merkle Tree */}
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

                            {/* Key Rotation */}
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

                            {/* GDPR Compliance */}
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

                            {/* Common Elements */}
                            <div className="bg-white rounded-lg p-3 shadow-sm">
                                <div className="text-slate-900 text-sm font-medium mb-2">
                                    Audit Event
                                </div>
                                <div className="text-slate-600 text-xs">
                                    {new Date().toLocaleTimeString()}
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="absolute bottom-4 left-4 right-4">
                            <div className="bg-white rounded-2xl p-2 shadow-lg">
                                <div className="flex justify-around">
                                    {['crypto', 'merkle', 'keys', 'compliance'].map((product) => (
                                        <div 
                                            key={product}
                                            className={`w-2 h-2 rounded-full ${
                                                activeProduct === product 
                                                    ? 'bg-blue-500' 
                                                    : 'bg-slate-300'
                                            }`}
                                        ></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Physical Buttons */}
                    <div className="absolute -left-2 top-1/3 w-1 h-12 bg-slate-600 rounded-l"></div>
                    <div className="absolute -left-2 top-1/2 w-1 h-12 bg-slate-600 rounded-l"></div>
                    <div className="absolute -right-2 top-1/3 w-1 h-12 bg-slate-600 rounded-r"></div>
                </div>
            </div>
        </div>
    );
};

export default MobilePaymentIllustration;