// src/components/TypewriterEffect.jsx
import React, { useState, useEffect } from 'react';

const TypewriterEffect = ({ text, speed = 30, delay = 1000 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    // Starta efter en liten fördröjning
    const startTimeout = setTimeout(() => {
      setStarted(true);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, started]);

  return (
    <span className="font-mono text-slate-300">
      {displayedText}
      <span className="animate-cursor-blink border-r-2 border-blue-500 ml-1"></span>
    </span>
  );
};

export default TypewriterEffect;