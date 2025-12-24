import React, { memo } from 'react';

interface SlideshowProgressProps {
  progress: number;
}

export const SlideshowProgress = memo<SlideshowProgressProps>(({ progress }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-2 bg-foreground/20 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/20 to-transparent shimmer-effect" />
      <div
        className="h-full bg-gradient-to-r from-gold via-amber-400 to-gold shadow-[0_-4px_20px_rgba(251,191,36,0.6)] transition-all duration-200 ease-out relative overflow-hidden"
        style={{ width: `${progress}%` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent shimmer-effect" />
      </div>
    </div>
  );
});

SlideshowProgress.displayName = 'SlideshowProgress';