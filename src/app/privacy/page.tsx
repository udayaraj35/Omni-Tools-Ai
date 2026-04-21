'use client';

import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PrivacyPage() {
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
          <div className="flex items-center gap-6 mb-12">
            <div className="p-4 rounded-[1.5rem] bg-primary/10 text-primary border border-primary/20">
              <Shield className="h-10 w-10" />
            </div>
            <h1 className="text-4xl md:text-7xl font-black tracking-tight uppercase italic leading-tight px-4 py-2">Privacy Policy</h1>
          </div>
          
          <div className="prose dark:prose-invert max-w-none space-y-10 text-muted-foreground text-lg">
            <section className="bg-muted/30 p-8 rounded-[2rem] border border-border">
              <h2 className="text-foreground text-3xl font-black uppercase tracking-tight mb-4 italic">1. Introduction</h2>
              <p className="leading-relaxed">Welcome to OmniTools AI. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website.</p>
            </section>

            <section className="bg-muted/30 p-8 rounded-[2rem] border border-border">
              <h2 className="text-foreground text-3xl font-black uppercase tracking-tight mb-4 italic">2. Data We Collect</h2>
              <p className="mb-4">We collect minimal information required to provide our AI services:</p>
              <ul className="list-disc pl-8 space-y-3 font-medium">
                <li><strong>Profile Information:</strong> Name and email if you choose to create a profile.</li>
                <li><strong>Tool Data:</strong> Information you input into our builders (CV, Documents) to generate outputs.</li>
                <li><strong>Usage Data:</strong> Anonymous statistics via Google Analytics to improve our tools.</li>
              </ul>
            </section>

            <section className="bg-muted/30 p-8 rounded-[2rem] border border-border">
              <h2 className="text-foreground text-3xl font-black uppercase tracking-tight mb-4 italic">3. Data Retention</h2>
              <p className="leading-relaxed">Files uploaded for processing (images, PDFs) are <strong>automatically deleted</strong> from our servers within 24 hours. We do not store your private documents permanently.</p>
            </section>

            <section className="bg-muted/30 p-8 rounded-[2rem] border border-border">
              <h2 className="text-foreground text-3xl font-black uppercase tracking-tight mb-4 italic">4. Cookies</h2>
              <p className="leading-relaxed">We use essential cookies to maintain your session and preferences. We also use analytics cookies to understand site performance.</p>
            </section>

            <section className="bg-muted/30 p-8 rounded-[2rem] border border-border">
              <h2 className="text-foreground text-3xl font-black uppercase tracking-tight mb-4 italic">5. Contact</h2>
              <p className="leading-relaxed">For any privacy-related queries, please contact us at <span className="text-primary font-bold">omnitoolsai@gmail.com</span>.</p>
            </section>
          </div>
        </div>
      </main>
      <LandingFooter onNavigate={path => router.push(path)} />
    </div>
  );
}