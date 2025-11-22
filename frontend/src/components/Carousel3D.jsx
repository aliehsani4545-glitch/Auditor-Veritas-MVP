import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Database, KeyRound, FileLock2, ChevronLeft, ChevronRight, Cpu } from 'lucide-react';

const cards = [
  { 
    id: 1, 
    title: "GDPR Compliant", 
    subtitle: "Article 32 Ready",
    icon: FileLock2, 
    color: "bg-orange-500",
    tech: "Data Residency: AWS Frankfurt",
    desc: "We implement Privacy by Design. All personal identifiers are salted and hashed locally before transmission." 
  },
  { 
    id: 2, 
    title: "Merkle Tree", 
    subtitle: "Chain Integrity",
    icon: Database, 
    color: "bg-blue-600",
    tech: "Algo: SHA-256 Binary Tree",
    desc: "Every event is a leaf in a cryptographic tree. The Root Hash is published to a public ledger for undeniable proof." 
  },
  { 
    id: 3, 
    title: "Key Rotation", 
    subtitle: "Auto-Security",
    icon: KeyRound, 
    color: "bg-purple-600",
    tech: "Standard: NIST SP 800-57",
    desc: "Automated 90-day rotation of all access keys. Immediate revocation capabilities ensuring zero trust architecture." 
  },
  { 
    id: 4, 
    title: "SHA-256", 
    subtitle: "Hashing Layer",
    icon: ShieldCheck, 
    color: "bg-emerald-500",
    tech: "256-bit digest size",
    desc: "Military-grade encryption for all data at rest and in transit. TLS 1.3 enforced on all endpoints." 
  },
];

const Carousel3D = () => {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((i) => (i + 1) % cards.length);
  const prev = () => setIndex((i) => (i - 1 + cards.length) % cards.length);

  return (
    <div className="w-full max-w-6xl mx-auto">
      
      {/* 3D Cards */}
      <div className="relative h-[400px] flex items-center justify-center perspective-[1200px] mb-8">
        <button onClick={prev} className="absolute left-0 z-50 p-4 bg-white rounded-full shadow-xl hover:scale-110 transition text-slate-600"><ChevronLeft /></button>
        <button onClick={next} className="absolute right-0 z-50 p-4 bg-white rounded-full shadow-xl hover:scale-110 transition text-slate-600"><ChevronRight /></button>

        <div className="relative w-full h-full flex items-center justify-center">
          <AnimatePresence mode='popLayout'>
            {cards.map((card, i) => {
              let offset = (i - index + cards.length) % cards.length;
              if (offset > cards.length / 2) offset -= cards.length;
              if (Math.abs(offset) > 1) return null;

              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    scale: offset === 0 ? 1 : 0.8,
                    x: offset * 300, 
                    zIndex: offset === 0 ? 20 : 10,
                    opacity: offset === 0 ? 1 : 0.5,
                    rotateY: offset * -25
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="absolute w-[300px] h-[380px] bg-white rounded-[30px] shadow-2xl border border-slate-100 flex flex-col items-center justify-center p-8 text-center cursor-pointer"
                  onClick={offset === 0 ? null : offset > 0 ? next : prev}
                >
                  <div className={`w-20 h-20 rounded-2xl ${card.color} flex items-center justify-center mb-6 text-white shadow-lg shadow-${card.color}/40`}>
                    <card.icon className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">{card.title}</h3>
                  <p className="text-slate-500 text-sm mt-2 uppercase tracking-wider font-bold">{card.subtitle}</p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Detail Panel */}
      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode='wait'>
          <motion.div 
            key={cards[index].id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden"
          >
            <div className={`absolute top-0 left-0 w-1 h-full ${cards[index].color}`}></div>
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-5 h-5 text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Technical Specification</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{cards[index].title} Architecture</h3>
            <div className="inline-block bg-slate-100 px-3 py-1 rounded-lg text-xs font-mono text-slate-600 mb-6 border border-slate-200">
              {cards[index].tech}
            </div>
            <p className="text-slate-600 text-lg leading-relaxed">{cards[index].desc}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Carousel3D;