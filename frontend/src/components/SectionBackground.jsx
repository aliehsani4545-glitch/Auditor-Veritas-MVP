import React from 'react';

const SectionBackground = ({ variant = 'light' }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      
      {/* VARIANT: LIGHT (Används för Use Cases / Business) */}
      {variant === 'light' && (
        <>
          <div className="absolute inset-0 bg-white"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px] animate-float-slow"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-purple-100/50 rounded-full blur-[100px] animate-float-delayed"></div>
          {/* Subtle Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        </>
      )}

      {/* VARIANT: DARK (Används för Architecture / Tech) */}
      {variant === 'dark' && (
        <>
          <div className="absolute inset-0 bg-[#0f172a]"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-500/20 blur-[120px] rounded-full mix-blend-screen"></div>
          {/* Technical Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        </>
      )}

      {/* VARIANT: MESH (Används för Hero / Integration) */}
      {variant === 'mesh' && (
        <>
           <div className="absolute inset-0 bg-slate-50"></div>
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15),transparent_50%)]"></div>
        </>
      )}
    </div>
  );
};

export default SectionBackground;