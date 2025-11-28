// src/components/InteractiveHeroBackground.jsx
import React, { useRef, useEffect } from 'react';

const InteractiveHeroBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let mouse = { x: -1000, y: -1000 };

    // Konfiguration för "Sjalen"
    const config = {
      particleDistance: 40, // Avstånd mellan punkter
      rows: 0,
      cols: 0,
      waveSpeed: 0.002,
      waveAmplitude: 30,
      mouseRadius: 200,
      color: '99, 102, 241' // Indigo-500 RGB
    };

    const init = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      
      particles = [];
      config.cols = Math.ceil(width / config.particleDistance) + 1;
      config.rows = Math.ceil(height / config.particleDistance) + 1;

      for (let y = 0; y < config.rows; y++) {
        for (let x = 0; x < config.cols; x++) {
          particles.push({
            x: x * config.particleDistance,
            y: y * config.particleDistance,
            originX: x * config.particleDistance,
            originY: y * config.particleDistance,
            vx: 0,
            vy: 0
          });
        }
      }
    };

    const draw = (time) => {
      ctx.clearRect(0, 0, width, height);
      
      // Rita linjer (nätet)
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${config.color}, 0.15)`;
      ctx.lineWidth = 1;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Vågrörelse (Sjal-effekt)
        // Vi använder sinusvågor baserat på position och tid
        const waveX = Math.sin(p.originY * 0.01 + time * config.waveSpeed) * config.waveAmplitude;
        const waveY = Math.cos(p.originX * 0.01 + time * config.waveSpeed) * config.waveAmplitude;

        // Musinteraktion (Repellera punkter mjukt)
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = 0;
        let forceDirectionY = 0;

        if (distance < config.mouseRadius) {
          const force = (config.mouseRadius - distance) / config.mouseRadius;
          forceDirectionX = (dx / distance) * force * 40; // Kraften av putten
          forceDirectionY = (dy / distance) * force * 40;
        }

        // Applicera position med "ease" tillbaka till ursprung + våg
        const targetX = p.originX + waveX - forceDirectionX;
        const targetY = p.originY + waveY - forceDirectionY;

        p.x += (targetX - p.x) * 0.05; // Smoothness
        p.y += (targetY - p.y) * 0.05;

        // Rita anslutningar till grannar (höger och ner) för att skapa nätet
        const row = Math.floor(i / config.cols);
        const col = i % config.cols;

        if (col < config.cols - 1) {
          const right = particles[i + 1];
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(right.x, right.y);
        }
        if (row < config.rows - 1) {
          const bottom = particles[i + config.cols];
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(bottom.x, bottom.y);
        }
      }
      ctx.stroke();

      // Rita punkter (gör det mer "techy")
      ctx.fillStyle = `rgba(${config.color}, 0.6)`;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(() => draw(Date.now()));
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleResize = () => {
      init();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    
    init();
    draw(Date.now());

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60"
      style={{ background: 'radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 100%)' }}
    />
  );
};

export default InteractiveHeroBackground;