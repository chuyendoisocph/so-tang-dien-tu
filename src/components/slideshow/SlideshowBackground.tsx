import React, { memo } from 'react';

interface SlideshowBackgroundProps {
  currentIndex: number;
}

export const SlideshowBackground = memo<SlideshowBackgroundProps>(({ currentIndex }) => {
  return (
    <>
      {/* Dynamic Background with Gradient Shift */}
      <div 
        className="slideshow-background absolute inset-0 transition-all duration-1000 ease-in-out"
        style={{
          background: `radial-gradient(ellipse at ${50 + (currentIndex * 10) % 40}% ${30 + (currentIndex * 15) % 60}%, 
            rgba(15, 23, 42, 0.9) 0%, 
            rgba(30, 41, 59, 0.95) 40%, 
            rgba(15, 23, 42, 1) 100%)`
        }}
      />
      
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={`orb-${currentIndex}-${i}`}
            className="absolute rounded-full bg-gradient-to-br from-gold/10 to-amber-500/5 animate-pulse"
            style={{
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              left: `${(i * 20 + currentIndex * 5) % 90}%`,
              top: `${(i * 15 + currentIndex * 3) % 80}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i}s`
            }}
          />
        ))}
      </div>
    </>
  );
});

SlideshowBackground.displayName = 'SlideshowBackground';