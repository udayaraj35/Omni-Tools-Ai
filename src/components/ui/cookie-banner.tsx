'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Shield, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:max-w-md z-[100]"
        >
          <div className="glass-card bg-zinc-900/90 backdrop-blur-2xl border-white/10 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-5">
                <Shield className="w-24 h-24" />
            </div>
            
            <div className="flex items-start gap-4 relative z-10">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <Shield className="h-6 w-6" />
              </div>
              <div className="flex-1 space-y-3">
                <h4 className="text-lg font-black uppercase tracking-tighter italic">Cookie Privacy</h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  We use cookies to enhance your AI studio experience. By using our tools, you agree to our 
                  <Link href="/privacy" className="text-primary hover:underline ml-1">Privacy Policy</Link>.
                </p>
                <div className="flex gap-3 pt-2">
                  <Button onClick={handleAccept} className="flex-1 gradient-button-gold rounded-xl h-10 text-[10px] uppercase font-black tracking-widest">
                    Accept All
                  </Button>
                  <Button variant="ghost" onClick={() => setIsVisible(false)} className="text-[10px] uppercase font-black tracking-widest h-10 hover:bg-white/5">
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
