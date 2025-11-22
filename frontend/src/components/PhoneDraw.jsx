import React from 'react';
import { motion } from 'framer-motion';

const PhoneDraw = () => {
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { duration: 2, ease: "easeInOut" }
    }
  };

  const fillVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { delay: 2, duration: 0.5 } 
    }
  };

  return (
    <div className="relative w-[280px] h-[580px] mx-auto">
      <svg viewBox="0 0 280 580" className="w-full h-full drop-shadow-2xl">
        {/* Telefonens ram - Ritas först */}
        <motion.rect
          x="2" y="2" width="276" height="576" rx="30"
          fill="#0a2540" // Mörk bakgrund inuti telefonen
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="4"
          variants={pathVariants}
          initial="hidden"
          animate="visible"
        />
        
        {/* Header Bar inuti telefonen */}
        <motion.path
          d="M20 60 H260"
          stroke="#635bff"
          strokeWidth="2"
          variants={pathVariants}
          initial="hidden"
          animate="visible"
        />

        {/* Simulerat UI-innehåll (Kort/Text) */}
        <motion.g initial="hidden" animate="visible" variants={fillVariants}>
          {/* Ett "Kort" inuti telefonen */}
          <rect x="30" y="100" width="220" height="120" rx="10" fill="rgba(255,255,255,0.05)" />
          <rect x="50" y="120" width="100" height="10" rx="5" fill="rgba(255,255,255,0.2)" />
          <rect x="50" y="145" width="180" height="8" rx="4" fill="rgba(255,255,255,0.1)" />
          
          {/* En "Graf" */}
          <path d="M30 350 Q 90 280 140 320 T 250 250" 
                fill="none" 
                stroke="#00d4ff" 
                strokeWidth="3" 
                className="drop-shadow-lg" 
          />
        </motion.g>
      </svg>
      
      {/* Glaseffekt ovanpå */}
      <div className="absolute inset-0 rounded-[30px] pointer-events-none bg-gradient-to-br from-white/10 to-transparent opacity-50" />
    </div>
  );
};

export default PhoneDraw;