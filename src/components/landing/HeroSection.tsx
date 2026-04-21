'use client';

import { Button } from '@/components/ui/button';
import AiToolSuggester from '@/components/ui/ai-tool-suggester';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HeroSection({ onNavigate }: { onNavigate: (view: string) => void }) {
  return (
    <section id="home" className="relative w-full overflow-hidden">
       {/* Background decorative elements - adapt to light/dark */}
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full dark:opacity-50"></div>
          <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full dark:opacity-50"></div>
       </div>

       <div className="container relative z-10 px-4 md:px-6">
        <div className="mx-auto flex flex-col items-center text-center space-y-8">
          
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-center">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-lg">
                    <Star className="mr-2 h-3 w-3 fill-current" /> 100% Free Ecosystem
                </Badge>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-tight md:leading-[1.1]">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground uppercase italic px-4 py-2 block">
                    OmniTools AI
                </span>
            </h1>
            <p className="max-w-3xl mx-auto text-muted-foreground text-base md:text-xl font-medium leading-relaxed">
                Unlock 100+ professional AI utilities. From CV building to 8K image upscaling, everything you need in one powerful studio.
            </p>
          </div>
          
          <div className="w-full max-w-2xl mx-auto drop-shadow-2xl">
            <AiToolSuggester onNavigate={onNavigate} />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
              {[
                  { label: "No Credit Card", icon: Zap },
                  { label: "High Fidelity", icon: Sparkles },
                  { label: "Studio Standard", icon: Star }
              ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-muted-foreground font-black uppercase text-[10px] tracking-widest opacity-80 bg-muted/30 px-4 py-2 rounded-full border border-border">
                      <item.icon className="h-3 w-3 text-primary" /> {item.label}
                  </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}