'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface GoldenGateSpinnerProps {
  onFinished: () => void;
}

export function GoldenGateSpinner({ onFinished }: GoldenGateSpinnerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Start opening animation after 1 second
    const openTimer = setTimeout(() => {
        setIsOpen(true);
    }, 1000);

    // Show main content after 5 seconds (door animation is 4s, plus 1s delay)
    const contentTimer = setTimeout(() => {
        setShowContent(true);
    }, 5000);

    // Signal that the animation is completely finished
    const finishTimer = setTimeout(() => {
      onFinished();
    }, 8000); // Total duration increased to allow content to fade in

    return () => {
      clearTimeout(openTimer);
      clearTimeout(contentTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinished]);

  return (
    <>
      <div id="background" className={cn(isOpen && 'open')}></div>

      <div id="main-content" className={cn(showContent && 'open')}>
          <div style={{maxWidth: '1200px', margin: '0 auto', padding: '40px'}}>
              <h1>ॐ नमः शिवाय</h1>
              <p>तपाईंहरूलाई हार्दिक स्वागत छ !</p>
          </div>
      </div>
      
      <div id="doors" className={cn(isOpen && 'open')}>
        <div className="door left-door">
            <Image src="https://i.etsystatic.com/28457585/r/il/2db4de/5321841202/il_fullxfull.5321841202_507x.jpg" alt="भगवान गणेश" width={500} height={800} className="deity"/>
        </div>
        <div className="door right-door">
            <Image src="https://static.wixstatic.com/media/d30fb8_94a44fb6f27148988fb9c610141278c9~mv2.webp/v1/fill/w_980,h_653,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/d30fb8_94a44fb6f27148988fb9c610141278c9~mv2.webp" alt="भगवान कुमार" width={500} height={800} className="deity"/>
        </div>
      </div>
    </>
  );
}
