import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  // Skapa ett rutnät
  return (
    <div className="absolute inset-0 overflow-hidden bg-stripe-bg -z-10">
      {/* Gradient Mesh Bakgrund */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-stripe-accent via-stripe-bg to-transparent" />

      {/* Rutnätet */}
      <div className="absolute inset-0" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', 
             backgroundSize: '60px 60px' 
           }}>
      </div>

      {/* Animerad Ljusstråle (Beam) */}
      <motion.div
        initial={{ top: '-10%', left: '-10%' }}
        animate={{ top: '120%', left: '120%' }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute w-[300px] h-[2px] bg-gradient-to-r from-transparent via-stripe-cyan to-transparent rotate-45 blur-sm"
      />
      
      {/* Lysande Noder (Punkter där linjer möts) */}
      <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-stripe-cyan rounded-full shadow-[0_0_15px_rgba(0,212,255,0.8)] animate-pulse-glow" />
      <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-stripe-accent rounded-full shadow-[0_0_15px_rgba(99,91,255,0.8)] animate-pulse-glow delay-75" />
    </div>
  );
};

export default AnimatedBackground;