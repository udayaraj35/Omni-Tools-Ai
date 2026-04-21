'use client';

import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '@/components/ui/logo';

export default function AboutPage() {
  const router = useRouter();
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar onNavigate={path => router.push(path)} />
      <main className="flex-1 container mx-auto py-12 px-4 lg:px-8">
        <button onClick={() => router.back()} className="animated-border-card inline-block mb-8">
          <span className={cn("inner-span flex items-center back-to-home-button")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </span>
        </button>
        
        <div className="glass-card p-8 md:p-16 rounded-[3rem] border-border/50 w-full">
          <div className="flex flex-col items-center text-center gap-6 mb-16">
            <Logo className="h-24 w-24" />
            <h1 className="text-4xl md:text-7xl font-black tracking-tight uppercase italic leading-tight px-4 py-2">About OmniTools AI</h1>
            <p className="text-primary font-bold uppercase tracking-[0.4em] text-sm">One Platform • Infinite Possibilities</p>
          </div>
          
          <div className="prose dark:prose-invert max-w-none space-y-12 text-muted-foreground leading-relaxed text-xl">
            <p className="text-center max-w-5xl mx-auto">
              <strong className="text-foreground text-2xl">OmniTools AI</strong> is a comprehensive digital hub designed to empower individuals and businesses with advanced AI utilities. Our mission is to bridge the gap between complex technology and everyday productivity.
            </p>
            
            <div className="grid md:grid-cols-2 gap-12 py-12 border-y border-border">
                <div className="space-y-4">
                    <h3 className="text-foreground font-bold text-3xl uppercase tracking-tight italic">Our Vision</h3>
                    <p className="text-lg">To provide a 100% free, high-end AI toolkit that helps users globally to create, optimize, and organize their professional lives without barriers.</p>
                </div>
                <div className="space-y-4">
                    <h3 className="text-foreground font-bold text-3xl uppercase tracking-tight italic">Why Choose Us?</h3>
                    <p className="text-lg">Unlike other platforms, we focus on high-resolution rendering, data privacy (auto-delete within 24h), and a seamless user experience across 100+ tools.</p>
                </div>
            </div>

            <div className="text-center pt-8">
                <p className="text-muted-foreground">
                  Founded and engineered by <strong className="text-foreground">Udaya Raj Khanal</strong>, OmniTools AI continues to evolve with cultural utilities for Nepal and professional tools for the global audience.
                </p>
            </div>
          </div>
        </div>
      </main>
      <LandingFooter onNavigate={path => router.push(path)} />
    </div>
  );
}