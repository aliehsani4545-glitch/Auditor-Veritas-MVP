import React, { useRef } from 'react';
import { ShieldCheck, TreePine, KeyRound, FileLock2 } from 'lucide-react';

const ProductNetwork = ({ activeProduct, setActiveProduct }) => {
  const products = [
    { id: 'crypto', name: 'Hashing', icon: ShieldCheck, x: 20, y: 30, color: '#10b981' },
    { id: 'merkle', name: 'Merkle Tree', icon: TreePine, x: 70, y: 20, color: '#3b82f6' },
    { id: 'keys', name: 'Key Rotation', icon: KeyRound, x: 25, y: 75, color: '#8b5cf6' },
    { id: 'compliance', name: 'Compliance', icon: FileLock2, x: 75, y: 70, color: '#f59e0b' }
  ];

  const connections = [
    ['crypto', 'merkle'], ['crypto', 'keys'],
    ['merkle', 'compliance'], ['keys', 'compliance']
  ];

  const getPos = (id) => products.find(p => p.id === id);

  return (
    <div className="relative h-[500px] w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden select-none my-12">
      {/* Bakgrundsrutnät */}
      <div className="absolute inset-0 bg-slate-50" 
           style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      </div>
      
      {/* SVG Linjer */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {connections.map(([startId, endId], i) => {
          const start = getPos(startId);
          const end = getPos(endId);
          const isActive = activeProduct === startId || activeProduct === endId;
          const midX = (start.x + end.x) / 2;
          const midY = (start.y + end.y) / 2;
          const pathD = `M ${start.x}% ${start.y}% Q ${midX}% ${midY + (i % 2 === 0 ? 10 : -10)}% ${end.x}% ${end.y}%`;

          return (
            <g key={`${startId}-${endId}`}>
              {/* Bakgrundslinje */}
              <path d={pathD} stroke="#e2e8f0" strokeWidth="4" fill="none" />
              {/* Aktiv linje */}
              <path d={pathD} 
                    stroke={isActive ? (activeProduct === startId ? start.color : end.color) : 'transparent'} 
                    strokeWidth="2" fill="none" strokeDasharray="8 8" 
                    className={`transition-all duration-1000 ${isActive ? 'opacity-100 animate-[dash_1s_linear_infinite]' : 'opacity-0'}`} 
              />
            </g>
          );
        })}
      </svg>

      {/* Noder */}
      {products.map((product) => {
        const isActive = activeProduct === product.id;
        const ProductIcon = product.icon;
        return (
          <button 
            key={product.id} 
            onClick={() => setActiveProduct(product.id)} 
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 group focus:outline-none ${isActive ? 'scale-110 z-20' : 'scale-100 z-10 hover:scale-105'}`} 
            style={{ left: `${product.x}%`, top: `${product.y}%` }}
          >
            {/* Glow effekt */}
            <div className={`absolute inset-0 rounded-full blur-xl transition-opacity duration-500 ${isActive ? 'opacity-40' : 'opacity-0'}`} 
                 style={{ backgroundColor: product.color, transform: 'scale(1.5)' }}></div>
            
            {/* Ikon Kort */}
            <div className={`relative flex flex-col items-center bg-white p-4 rounded-2xl shadow-lg border-2 transition-colors duration-300 ${isActive ? 'border-slate-800' : 'border-transparent'}`}>
              <div className="p-3 rounded-xl mb-2 transition-colors duration-300" style={{ backgroundColor: isActive ? `${product.color}20` : '#f1f5f9' }}>
                <ProductIcon className={`w-6 h-6`} style={{ color: isActive ? product.color : '#64748b' }} />
              </div>
              <span className={`text-sm font-bold ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{product.name}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ProductNetwork;