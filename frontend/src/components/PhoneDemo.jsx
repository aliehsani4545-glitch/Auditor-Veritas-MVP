import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, ArrowDown, ChevronRight } from 'lucide-react';

const PhoneDemo = () => {
  const [view, setView] = useState('list'); // 'list' or 'flow'
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Data mocking your screenshot but in English
  const orders = [
    { id: '#9125', name: 'Hanako Yamada', status: 'Processing', amount: '150.00 USD', color: 'bg-emerald-100 text-emerald-700' },
    { id: '#9124', name: 'Jacques Muller', status: 'Processing', amount: '200.00 USD', color: 'bg-emerald-100 text-emerald-700' },
    { id: '#9123', name: 'Lars Andersson', status: 'Paused', amount: '178.00 USD', color: 'bg-purple-100 text-purple-700' },
    { id: '#9122', name: 'Eva Svensson', status: 'Completed', amount: '200.00 USD', color: 'bg-slate-100 text-slate-700' },
  ];

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setView('flow');
  };

  return (
    <div className="relative w-[320px] h-[640px] mx-auto perspective-[1000px]">
      <motion.div 
        initial={{ rotateY: -10, rotateX: 5 }}
        whileHover={{ rotateY: 0, rotateX: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full h-full transform-style-3d"
      >
        {/* SVG Drawing Border (Stripe Effect) */}
        <svg className="absolute -inset-1 w-[102%] h-[101%] z-50 pointer-events-none">
           <motion.rect 
             width="100%" height="100%" rx="45" 
             fill="none" stroke="#00d4ff" strokeWidth="2"
             initial={{ pathLength: 0, opacity: 0 }}
             animate={{ pathLength: 1, opacity: 1 }}
             transition={{ duration: 2, ease: "easeInOut" }}
           />
        </svg>

        {/* Phone Body */}
        <div className="absolute inset-0 bg-white rounded-[40px] shadow-2xl overflow-hidden border-[6px] border-slate-900">
          
          {/* Header */}
          <div className="pt-10 pb-4 px-6 border-b border-slate-100 flex justify-between items-center bg-white z-10 relative">
             <div>
               <h2 className="text-xl font-bold text-slate-900">Orders</h2>
             </div>
             <div className="p-2 bg-blue-50 rounded-full text-blue-600">
               <List className="w-5 h-5" />
             </div>
          </div>

          {/* Screen Content */}
          <div className="relative h-full bg-slate-50/50">
            <AnimatePresence mode="wait">
              
              {/* VIEW 1: LIST (Your first screenshot) */}
              {view === 'list' && (
                <motion.div 
                  key="list"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4 space-y-3"
                >
                  <div className="text-xs font-bold text-slate-400 uppercase mb-2">Today</div>
                  {orders.slice(0,2).map(order => (
                    <OrderCard key={order.id} order={order} onClick={() => handleOrderClick(order)} />
                  ))}
                  
                  <div className="text-xs font-bold text-slate-400 uppercase mt-6 mb-2">Yesterday</div>
                  {orders.slice(2).map(order => (
                    <OrderCard key={order.id} order={order} onClick={() => handleOrderClick(order)} />
                  ))}
                </motion.div>
              )}

              {/* VIEW 2: FLOW (Your second screenshot - interactive) */}
              {view === 'flow' && selectedOrder && (
                <motion.div 
                  key="flow"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="h-full p-4 flex flex-col items-center"
                >
                  {/* Top Card */}
                  <div className="w-full bg-white p-4 rounded-2xl shadow-lg mb-8 border border-slate-100" onClick={() => setView('list')}>
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-slate-500 font-mono text-xs">{selectedOrder.id}</span>
                       <span className="font-bold text-slate-900">{selectedOrder.amount}</span>
                    </div>
                    <div className="font-bold text-slate-800">{selectedOrder.name}</div>
                    <div className={`inline-block px-2 py-1 rounded text-xs font-bold mt-2 ${selectedOrder.color}`}>
                      {selectedOrder.status}
                    </div>
                  </div>

                  {/* FLOW DIAGRAM */}
                  <div className="relative w-full flex flex-col items-center gap-2">
                    
                    {/* Buyer Node */}
                    <Node label="Buyer" color="bg-blue-600" />

                    {/* Animated Arrows 1 */}
                    <FlowArrows />

                    {/* Platform Node */}
                    <Node label="Platform" color="bg-[#00d4ff]" textColor="text-slate-900" />

                    {/* Animated Arrows 2 */}
                    <FlowArrows />

                    {/* Seller Node */}
                    <Node label="Seller / Service Provider" color="bg-[#00d4ff]" textColor="text-slate-900" width="w-full" />

                  </div>
                  
                  <button onClick={() => setView('list')} className="mt-12 text-sm text-slate-400 hover:text-slate-600">
                    ← Back to Orders
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Sub-components for the Phone
const OrderCard = ({ order, onClick }) => (
  <div onClick={onClick} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all active:scale-95">
    <div className="flex justify-between items-start mb-1">
      <span className="text-slate-400 font-mono text-xs">{order.id} <span className="text-slate-600 font-sans ml-1 font-semibold">{order.name}</span></span>
      <ChevronRight className="w-4 h-4 text-slate-300" />
    </div>
    <div className="flex justify-between items-center mt-2">
      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${order.color}`}>{order.status}</span>
      <span className="font-bold text-slate-900">{order.amount}</span>
    </div>
  </div>
);

const Node = ({ label, color, textColor = "text-white", width = "w-32" }) => (
  <motion.div 
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className={`${width} py-3 rounded-full shadow-lg text-center font-bold text-sm ${color} ${textColor} z-10`}
  >
    {label}
  </motion.div>
);

const FlowArrows = () => (
  <div className="h-12 flex flex-col items-center justify-center gap-1 opacity-50">
    {[1,2,3].map(i => (
       <motion.div 
         key={i}
         animate={{ opacity: [0.2, 1, 0.2], y: [0, 5, 0] }}
         transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
       >
         <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-[#00d4ff]"></div>
       </motion.div>
    ))}
  </div>
);

export default PhoneDemo;