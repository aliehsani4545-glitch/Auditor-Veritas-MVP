import React, { useState, useEffect } from 'react';

const HeroTypewriter = ({ text, delay = 50 }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);
  
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  return (
    <p className="text-lg text-slate-300 max-w-xl min-h-[3.5rem]">
      {currentText}
      <span className="inline-block w-0.5 h-5 ml-1 bg-[#00d4ff] align-middle animate-cursor-blink"></span>
    </p>
  );
};

export default HeroTypewriter;