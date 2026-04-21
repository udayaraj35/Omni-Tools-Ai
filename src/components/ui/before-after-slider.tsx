'use client';

import React, { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronsLeftRight } from 'lucide-react';

interface BeforeAfterSliderProps {
  before: React.ReactNode;
  after: React.ReactNode;
  className?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ before, after, className }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => handleMove(e.clientX), [handleMove]);
  const handleTouchMove = useCallback((e: TouchEvent) => handleMove(e.touches[0].clientX), [handleMove]);

  const handleMouseUp = useCallback(() => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleTouchEnd = useCallback(() => {
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);
  }, [handleTouchMove]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    handleMove(e.clientX);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove, handleMouseUp, handleMove]);
  
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  }, [handleTouchMove, handleTouchEnd, handleMove]);

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full h-full min-h-[500px] overflow-hidden rounded-lg select-none cursor-ew-resize group shadow-2xl', className)}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Before Layer (Underneath) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {before}
      </div>

      {/* After Layer (Clipped) */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden z-10 pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        {after}
      </div>

      {/* Slider Bar */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize -translate-x-1/2 z-20 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white flex items-center justify-center border-4 border-primary shadow-2xl transition-transform group-hover:scale-110">
          <ChevronsLeftRight className="h-6 w-6 text-primary" />
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-black/60 text-white text-[10px] font-black uppercase tracking-[0.2em] z-30 border border-white/10 backdrop-blur-md shadow-lg">
        ORIGINAL
      </div>
      <div 
        className="absolute top-6 right-6 px-4 py-1.5 rounded-full bg-primary text-black text-[10px] font-black uppercase tracking-[0.2em] z-30 border border-white/10 shadow-lg transition-opacity duration-300"
        style={{ opacity: sliderPosition > 40 ? 1 : 0 }}
      >
        PROCESSED
      </div>
    </div>
  );
};
