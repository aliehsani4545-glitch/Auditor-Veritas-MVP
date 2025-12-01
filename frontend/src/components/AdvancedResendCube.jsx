import React, { useEffect, useRef } from 'react';

export default function AdvancedResendCube() {
  const cubeRef = useRef(null);
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const rotation = useRef({ x: 0, y: 0 });
  const animationRef = useRef(null);
  const isInteracting = useRef(false);

  useEffect(() => {
    const cube = cubeRef.current;
    if (!cube) return;

    const onMouseMove = (e) => {
      if (!isInteracting.current) return;
      
      mouseX.current = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY.current = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const onMouseDown = () => {
      isInteracting.current = true;
    };

    const onMouseUp = () => {
      isInteracting.current = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    const animate = () => {
      // Apply mouse rotation with inertia
      if (isInteracting.current) {
        rotation.current.y += (mouseX.current * 0.5 - rotation.current.y) * 0.1;
        rotation.current.x += (mouseY.current * 0.5 - rotation.current.x) * 0.1;
      } else {
        // Auto-rotate slowly
        rotation.current.y += 0.002;
        rotation.current.x += 0.001;
        
        // Dampen the auto-rotation
        rotation.current.y *= 0.999;
        rotation.current.x *= 0.999;
      }

      cube.style.transform = `
        rotateX(${rotation.current.x}rad)
        rotateY(${rotation.current.y}rad)
        rotateZ(${rotation.current.y * 0.2}rad)
      `;

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // CSS för cube faces med gradient borders
  const faceStyle = "absolute w-full h-full rounded-xl border-2 opacity-90";
  const gradientBorders = {
    front: "border-gradient-to-r from-blue-500 to-cyan-500",
    back: "border-gradient-to-r from-purple-500 to-pink-500",
    top: "border-gradient-to-r from-emerald-500 to-teal-500",
    bottom: "border-gradient-to-r from-amber-500 to-orange-500",
    right: "border-gradient-to-r from-indigo-500 to-violet-500",
    left: "border-gradient-to-r from-rose-500 to-red-500"
  };

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] perspective-[1500px]">
        <div 
          ref={cubeRef}
          className="relative w-full h-full transform-style-3d transition-transform duration-300 ease-out"
        >
          {/* Cube faces */}
          {[
            { id: 'front', transform: 'translateZ(200px)', gradient: gradientBorders.front },
            { id: 'back', transform: 'translateZ(-200px) rotateY(180deg)', gradient: gradientBorders.back },
            { id: 'top', transform: 'translateY(-200px) rotateX(90deg)', gradient: gradientBorders.top },
            { id: 'bottom', transform: 'translateY(200px) rotateX(-90deg)', gradient: gradientBorders.bottom },
            { id: 'right', transform: 'translateX(200px) rotateY(90deg)', gradient: gradientBorders.right },
            { id: 'left', transform: 'translateX(-200px) rotateY(-90deg)', gradient: gradientBorders.left }
          ].map((face) => (
            <div
              key={face.id}
              className={`${faceStyle} ${face.gradient} glass-effect`}
              style={{ 
                transform: face.transform,
                background: `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))`
              }}
            >
              <div className="absolute inset-2 rounded-lg border border-white/10"></div>
              <div className="absolute inset-4 rounded border border-white/5"></div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 rounded-full blur-[120px] animate-glow-pulse"></div>
    </div>
  );
}