'use client';

import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TermsPage() {
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
              <FileText className="h-10 w-10" />
            </div>
            <h1 className="text-4xl md:text-7xl font-black tracking-tight uppercase italic leading-tight px-4 py-2">Terms of Service</h1>
          </div>
          
          <div className="prose dark:prose-invert max-w-none space-y-10 text-muted-foreground text-lg">
            <section className="bg-muted/30 p-8 rounded-[2rem] border border-border">
              <h2 className="text-foreground text-3xl font-black uppercase tracking-tight mb-4 italic">1. Acceptance of Terms</h2>
              <p className="leading-relaxed">By accessing OmniTools AI, you agree to comply with these terms. Our tools are provided "as-is" for professional and personal use.</p>
            </section>

            <section className="bg-muted/30 p-8 rounded-[2rem] border border-border">
              <h2 className="text-foreground text-3xl font-black uppercase tracking-tight mb-4 italic">2. Proper Use</h2>
              <p className="leading-relaxed">You agree not to use the service for creating illegal, harmful, or copyright-infringing content. Any document generated (e.g., Dummy Tickets) is for personal reference or visa application proofs and holds no real-world monetary value.</p>
            </section>

            <section className="bg-muted/30 p-8 rounded-[2rem] border border-border">
              <h2 className="text-foreground text-3xl font-black uppercase tracking-tight mb-4 italic">3. No Warranty</h2>
              <p className="leading-relaxed">OmniTools AI does not guarantee 100% accuracy of AI outputs. Users should verify critical information, especially in legal documents.</p>
            </section>

            <section className="bg-muted/30 p-8 rounded-[2rem] border border-border">
              <h2 className="text-foreground text-3xl font-black uppercase tracking-tight mb-4 italic">4. Modifications</h2>
              <p className="leading-relaxed">We reserve the right to modify or discontinue any tool at any time without prior notice.</p>
            </section>
          </div>
        </div>
      </main>
      <LandingFooter onNavigate={path => router.push(path)} />
    </div>
  );
}