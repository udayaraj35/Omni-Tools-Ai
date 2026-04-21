'use client';

import React from 'react';
import Logo from './logo';
import { Loader2 } from 'lucide-react';

interface ProcessingOverlayProps {
  message?: string;
}

/**
 * A reusable overlay that displays during AI or general processing.
 * Shows the OmniTools AI logo with an animated spinner.
 */
export function ProcessingOverlay({ message = "AI Processing..." }: ProcessingOverlayProps) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative">
        {/* Animated outer ring */}
        <Loader2 className="h-32 w-32 animate-spin text-primary opacity-30" />
        
        {/* Pulsing Logo in the center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Logo className="h-20 w-20 animate-pulse-slow" />
        </div>
      </div>
      
      {/* Dynamic processing message */}
      <p className="mt-10 font-black text-2xl text-primary animate-pulse uppercase tracking-[0.3em] italic px-4 text-center">
        {message}
      </p>
      <p className="text-zinc-500 font-bold uppercase tracking-widest mt-4 text-[10px]">
        Studio Intelligence Active
      </p>
    </div>
  );
}
