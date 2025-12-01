import React, { useEffect, useRef } from 'react';

export default function ResendStyleCube() {
  const containerRef = useRef(null);
  const cubeRef = useRef(null);
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const rotationX = useRef(0);
  const rotationY = useRef(0);
  const targetRotationX = useRef(0);
  const targetRotationY = useRef(0);
  const animationRef = useRef(null);
  const hoverRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || !cubeRef.current) return;

    const handleMouseMove = (e) => {
      if (!hoverRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      mouseX.current = (e.clientX - centerX) / (rect.width / 2);
      mouseY.current = (e.clientY - centerY) / (rect.height / 2);
      
      targetRotationY.current = mouseX.current * 0.3;
      targetRotationX.current = -mouseY.current * 0.3;
    };

    const handleMouseEnter = () => {
      hoverRef.current = true;
    };

    const handleMouseLeave = () => {
      hoverRef.current = false;
      targetRotationX.current = 0;
      targetRotationY.current = 0;
    };

    window.addEventListener('mousemove', handleMouseMove);
    containerRef.current.addEventListener('mouseenter', handleMouseEnter);
    containerRef.current.addEventListener('mouseleave', handleMouseLeave);

    const animate = () => {
      // Smooth interpolation for fluid rotation
      rotationX.current += (targetRotationX.current - rotationX.current) * 0.05;
      rotationY.current += (targetRotationY.current - rotationY.current) * 0.05;
      
      // Add slight continuous rotation when not hovering
      if (!hoverRef.current) {
        rotationY.current += 0.001;
      }

      if (cubeRef.current) {
        cubeRef.current.style.transform = `
          translate(-50%, -50%)
          rotateX(${rotationX.current}rad)
          rotateY(${rotationY.current}rad)
          translateZ(0)
        `;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (containerRef.current) {
        containerRef.current.removeEventListener('mouseenter', handleMouseEnter);
        containerRef.current.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] md:w-[500px] md:h-[500px] perspective-[1200px]">
        <div 
          ref={cubeRef}
          className="absolute top-1/2 left-1/2 w-[200px] h-[200px] transform-style-3d transition-transform duration-75"
        >
          {/* Front face */}
          <div className="absolute w-[200px] h-[200px] bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg backdrop-blur-sm transform-[translateZ(100px)]">
            <div className="absolute inset-2 border border-blue-400/20 rounded"></div>
          </div>
          
          {/* Back face */}
          <div className="absolute w-[200px] h-[200px] bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-lg backdrop-blur-sm transform-[translateZ(-100px)_rotateY(180deg)]">
            <div className="absolute inset-2 border border-purple-400/20 rounded"></div>
          </div>
          
          {/* Top face */}
          <div className="absolute w-[200px] h-[200px] bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 rounded-lg backdrop-blur-sm transform-[translateY(-100px)_rotateX(90deg)]">
            <div className="absolute inset-2 border border-cyan-400/20 rounded"></div>
          </div>
          
          {/* Bottom face */}
          <div className="absolute w-[200px] h-[200px] bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-lg backdrop-blur-sm transform-[translateY(100px)_rotateX(-90deg)]">
            <div className="absolute inset-2 border border-emerald-400/20 rounded"></div>
          </div>
          
          {/* Right face */}
          <div className="absolute w-[200px] h-[200px] bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border border-indigo-500/30 rounded-lg backdrop-blur-sm transform-[translateX(100px)_rotateY(90deg)]">
            <div className="absolute inset-2 border border-indigo-400/20 rounded"></div>
          </div>
          
          {/* Left face */}
          <div className="absolute w-[200px] h-[200px] bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/30 rounded-lg backdrop-blur-sm transform-[translateX(-100px)_rotateY(-90deg)]">
            <div className="absolute inset-2 border border-violet-400/20 rounded"></div>
          </div>
        </div>
      </div>

      {/* Glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-full blur-[80px] opacity-30 animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-[40px] opacity-20"></div>
    </div>
  );
}