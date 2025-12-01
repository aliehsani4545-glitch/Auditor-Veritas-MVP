import React, { useEffect, useRef } from 'react';
import './CssImageCube.css';

export default function CssImageCube() {
  const containerRef = useRef(null);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = container.getBoundingClientRect();
      const x = (clientX - left) / width - 0.5;
      const y = (clientY - top) / height - 0.5;
      
      container.style.transform = `rotateY(${x * 20}deg) rotateX(${-y * 20}deg)`;
    };
    
    container.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="css-cube-wrapper">
      <div className="css-cube-container" ref={containerRef}>
        <div className="css-cube">
          <div className="face front">
            <img 
              src="/cube.png" 
              alt="Cube" 
              className="cube-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
              }}
            />
          </div>
          <div className="face back bg-blue-600/30"></div>
          <div className="face right bg-purple-600/30"></div>
          <div className="face left bg-green-600/30"></div>
          <div className="face top bg-yellow-600/30"></div>
          <div className="face bottom bg-red-600/30"></div>
        </div>
        
        {/* Roterande partiklar */}
        <div className="floating-particle p1"></div>
        <div className="floating-particle p2"></div>
        <div className="floating-particle p3"></div>
        <div className="floating-particle p4"></div>
      </div>
    </div>
  );
}