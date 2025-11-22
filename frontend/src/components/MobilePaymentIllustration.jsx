import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

const MobilePaymentIllustration = ({ activeProduct }) => {
    const svgRef = useRef(null);
    
    // Illustrationen ska vara aktiv för de initiala betalningsrelaterade stegen
    const isVisible = activeProduct === 'crypto' || activeProduct === 'merkle';

    useEffect(() => {
        if (!svgRef.current) return;
        
        const paths = gsap.utils.toArray(svgRef.current.querySelectorAll('path'));

        paths.forEach(path => {
            const length = path.getTotalLength();
            
            // Sätt initialt tillstånd: Dold
            gsap.set(path, { 
                strokeDasharray: length, 
                strokeDashoffset: length,
                opacity: 1 
            });

            if (isVisible) {
                // Rita ut (offset till 0)
                gsap.to(path, {
                    strokeDashoffset: 0,
                    duration: 1.5,
                    ease: "power2.inOut",
                    delay: 0.2 // Liten fördröjning
                });
            } else {
                // Radera (återställ offset)
                gsap.to(path, {
                    strokeDashoffset: length,
                    duration: 0.5,
                    delay: 0.1
                });
            }
        });
    }, [isVisible]);

    // Denna SVG representerar en stiliserad mobiltelefon/kortterminal
    return (
        <div className="flex justify-center items-center w-full h-full relative">
            <svg ref={svgRef} width="300" height="550" viewBox="0 0 300 550" fill="none" className="will-change-opacity">
                {/* Yttre kontur (som ritas ut först) */}
                <path 
                    d="M 25 5 L 275 5 Q 295 5 295 25 L 295 525 Q 295 545 275 545 L 25 545 Q 5 545 5 525 L 5 25 Q 5 5 25 5 Z" 
                    stroke="url(#mobileGradient)" 
                    strokeWidth="4"
                />
                
                {/* Interna linjer (representerar formulär/transaktion) */}
                <path 
                    d="M 50 50 L 250 50 M 50 100 L 250 100 M 50 150 L 150 150 M 50 200 L 250 200 M 50 250 L 250 250 M 50 300 L 250 300 M 50 350 L 250 350 M 50 400 L 150 400" 
                    stroke="#CBD5E1" 
                    strokeWidth="2"
                />

                <defs>
                    <linearGradient id="mobileGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{stopColor: "#8b5cf6", stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: "#3b82f6", stopOpacity: 1}} />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};

export default MobilePaymentIllustration;