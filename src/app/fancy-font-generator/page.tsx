'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { FancyFontGenerator as FancyFontGeneratorTool } from '@/components/text-converter/FancyFontGenerator';
import { ContactDialog } from '@/components/ui/contact-dialog';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function FancyFontGeneratorPage() {
  const router = useRouter();
  const [showContactDialog, setShowContactDialog] = useState(false);

  const handleTaskComplete = () => {
    setShowContactDialog(true);
  };
  
  const handleNavigate = (path: string) => {
    router.push(path.startsWith('/') ? path : `/#${path}`);
  }

  return (
    <div className="flex flex-col min-h-screen">
        <Navbar onNavigate={handleNavigate} />
        <main className="flex-grow container mx-auto py-8">
            <button onClick={() => router.push('/')} className="animated-border-card inline-block mb-6">
                <span className={cn("inner-span flex items-center back-to-home-button")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </span>
            </button>
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-glow-primary font-headline">Fancy Font Generator</h1>
                <p className="max-w-2xl mx-auto mt-4 text-muted-foreground md:text-xl">
                    Generate stylish and cool text fonts for your social media bios, posts, and messages.
                </p>
            </div>
            <FancyFontGeneratorTool onTaskComplete={handleTaskComplete} />
        </main>
        <ContactDialog open={showContactDialog} onOpenChange={setShowContactDialog} />
        <LandingFooter onNavigate={handleNavigate} />
    </div>
  );
}
