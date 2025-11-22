import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Database, KeyRound, FileLock2, ChevronLeft, ChevronRight } from 'lucide-react';

const cards = [
  { id: 1, title: "GDPR Ready", desc: "Full compliance with Article 32.", icon: FileLock2, color: "bg-orange-500" },
  { id: 2, title: "Merkle Proofs", desc: "Cryptographic chain integrity.", icon: Database, color: "bg-blue-600" },
  { id: 3, title: "Key Rotation", desc: "Auto-rotation every 90 days.", icon: KeyRound, color: "bg-purple-600" },
  { id: 4, title: "SHA-256", desc: "Military-grade hashing.", icon: ShieldCheck, color: "bg-emerald-500" },
];

const Carousel3D = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => setCurrentIndex((prev) => (prev + 1) % cards.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);

  return (
    <div className="relative w-full max-w-4xl mx-auto h-[400px] flex items-center justify-center perspective-[1000px]">
      
      {/* Controls */}
      <button onClick={prev} className="absolute left-4 z-50 p-3 bg-white rounded-full shadow-lg hover:bg-slate-50"><ChevronLeft /></button>
      <button onClick={next} className="absolute right-4 z-50 p-3 bg-white rounded-full shadow-lg hover:bg-slate-50"><ChevronRight /></button>

      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence mode='popLayout'>
          {cards.map((card, index) => {
            // Calculate position relative to current index
            let offset = (index - currentIndex + cards.length) % cards.length;
            if (offset > cards.length / 2) offset -= cards.length;

            // Only show 3 cards at a time for performance/visuals
            if (Math.abs(offset) > 1) return null;

            return (
              <motion.div
                key={card.id}
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: offset === 0 ? 1 : 0.85,
                  x: offset * 220, // Distance between cards
                  zIndex: offset === 0 ? 10 : 5,
                  opacity: Math.abs(offset) > 1 ? 0 : offset === 0 ? 1 : 0.6,
                  rotateY: offset * -15 // 3D rotation effect
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute w-[300px] h-[380px] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center justify-center p-8 text-center cursor-grab active:cursor-grabbing"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(e, { offset, velocity }) => {
                  if (offset.x > 100) prev();
                  else if (offset.x < -100) next();
                }}
              >
                <div className={`w-20 h-20 rounded-2xl ${card.color} flex items-center justify-center mb-6 shadow-lg text-white`}>
                  <card.icon className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{card.title}</h3>
                <p className="text-slate-500 leading-relaxed">{card.desc}</p>
                
                {offset === 0 && (
                   <motion.div layoutId="activeIndicator" className="mt-6 px-4 py-2 bg-slate-100 rounded-full text-xs font-bold uppercase text-slate-500">
                      Active Node
                   </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Carousel3D;