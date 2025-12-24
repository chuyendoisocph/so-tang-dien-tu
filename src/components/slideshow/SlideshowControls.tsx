import React, { memo } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SlideshowControlsProps {
  showControls: boolean;
  isPaused: boolean;
  isTransitioning: boolean;
  currentIndex: number;
  totalProfiles: number;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onTogglePause: () => void;
  onExit: () => void;
}

export const SlideshowControls = memo<SlideshowControlsProps>(({
  showControls,
  isPaused,
  isTransitioning,
  currentIndex,
  totalProfiles,
  onPrevSlide,
  onNextSlide,
  onTogglePause,
  onExit
}) => {
  return (
    <>
      {/* Slide Counter */}
      <div className={`fixed top-5 left-5 bg-foreground/80 backdrop-blur-sm text-card px-6 py-3 rounded-xl z-50 transition-all duration-500 border border-gold/20 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
        <span className="text-lg font-medium">{currentIndex + 1}</span>
        <span className="text-gold mx-2">/</span>
        <span className="text-lg font-medium">{totalProfiles}</span>
      </div>

      {/* Control Buttons */}
      <div className={`fixed top-5 right-5 flex gap-3 z-50 transition-all duration-500 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
        <Button 
          variant="secondary" 
          onClick={onPrevSlide} 
          disabled={isTransitioning}
          className="bg-foreground/80 backdrop-blur-sm hover:bg-foreground/90 text-card border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:scale-105 disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Trước
        </Button>
        <Button 
          variant="secondary" 
          onClick={onTogglePause} 
          className="bg-foreground/80 backdrop-blur-sm hover:bg-foreground/90 text-card border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:scale-105"
        >
          {isPaused ? <Play className="h-4 w-4 mr-1" /> : <Pause className="h-4 w-4 mr-1" />}
          {isPaused ? "Tiếp tục" : "Tạm dừng"}
        </Button>
        <Button 
          variant="secondary" 
          onClick={onNextSlide} 
          disabled={isTransitioning}
          className="bg-foreground/80 backdrop-blur-sm hover:bg-foreground/90 text-card border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:scale-105 disabled:opacity-50"
        >
          Sau <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
        <Button 
          variant="secondary" 
          onClick={onExit} 
          className="bg-red-900/80 backdrop-blur-sm hover:bg-red-800/90 text-card border border-red-500/20 hover:border-red-500/40 transition-all duration-300 hover:scale-105"
        >
          <X className="h-4 w-4 mr-1" /> Thoát
        </Button>
      </div>
    </>
  );
});

SlideshowControls.displayName = 'SlideshowControls';