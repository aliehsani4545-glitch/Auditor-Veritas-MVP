import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  // Vi skapar slumpmässiga "blobbar" av energi
  const blobs = Array.from({ length: 6 }).map((_, i) => ({
    id: i,
    // Slumpmässig startposition och storlek
    initialX: Math.random() * 100,
    initialY: Math.random() * 100,
    scale: 1 + Math.random(),
    // Olika färger för djup: Djupblå, Lila, Cyan-accent
    color: [
        'rgba(10, 37, 64, 0.8)',  // Stripe dark blue base
        'rgba(99, 91, 255, 0.4)', // Blurple
        'rgba(0, 212, 255, 0.3)', // Cyan Security accent
        'rgba(30, 41, 59, 0.6)'   // Slate dark
    ][i % 4],
    // Slumpmässiga animationsparametrar
    duration: 15 + Math.random() * 15,
    delay: Math.random() * -20,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0a2540] pointer-events-none -z-10">
      {/* Ett subtilt rutnät för "tech"-känsla */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
      
      {/* En mörk vinjett i kanterna */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0a2540_90%)] z-10"></div>

      <div className="absolute inset-0 filter blur-[100px] opacity-70">
        {blobs.map((blob) => (
          <motion.div
            key={blob.id}
            className="absolute rounded-full mix-blend-screen"
            style={{
              backgroundColor: blob.color,
              left: `${blob.initialX}%`,
              top: `${blob.initialY}%`,
              width: `${blob.scale * 30}vw`,
              height: `${blob.scale * 30}vw`,
            }}
            animate={{
              x: ['-25%', '25%', '-25%'],
              y: ['-20%', '20%', '-20%'],
              scale: [1, 1.2, 0.8, 1],
              rotate: [0, 360],
            }}
            transition={{
              duration: blob.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: blob.delay,
              times: [0, 0.5, 1]
            }}
          />
        ))}
      </div>
      
      {/* En extra "brus"-hinna för att göra det mindre platt */}
      <div className="absolute inset-0 opacity-[0.15] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
    </div>
  );
};

export default AnimatedBackground;