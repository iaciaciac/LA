import React, { useState, useEffect } from "react";

const Typewriter = ({ text, delay = 50 }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  return (
    <span>
      {currentText}
      <span className="animate-pulse text-gray-500">|</span>
    </span>
  );
};

function Mylife({ headline }) {
  const displayHeadline = headline || "Work out to look good naked.";
  return (
    <div className="flex items-center justify-center h-full">
      <div className="block md:py-16 lg:px-16 xl:px-40 2xl:px-48" style={{ marginLeft: '24px', marginRight: '24px' }}>
        <div
          className="page-title font-light text-3xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl tracking-tight min-h-[1.2em]"
          style={{ marginBottom: '200px', marginTop: '150px', color: 'rgb(var(--foreground-rgb))' }}
        >
          <Typewriter text={displayHeadline} delay={60} />
        </div>
      </div>
    </div>
  );
}

export default Mylife;
