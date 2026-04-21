'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { TextCaseConverter as TextCaseConverterTool } from '@/components/text-converter/TextCaseConverter';
import { ContactDialog } from '@/components/ui/contact-dialog';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { cn } from '@/lib/utils';
import { trackToolUsage } from '@/lib/tools';

export default function TextConverterPage() {
  const router = useRouter();
  const [showContactDialog, setShowContactDialog] = useState(false);

  useEffect(() => {
    trackToolUsage('/text-converter');
  }, []);

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
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-glow-primary font-headline">Text Case Converter</h1>
                <p className="max-w-2xl mx-auto mt-4 text-muted-foreground md:text-xl">
                    Convert text to different case formats like sentence case, UPPERCASE, lowercase, and more.
                </p>
            </div>
            
            <TextCaseConverterTool onTaskComplete={handleTaskComplete} />

        </main>
        <ContactDialog open={showContactDialog} onOpenChange={setShowContactDialog} />
        <LandingFooter onNavigate={handleNavigate} />
    </div>
  );
}
