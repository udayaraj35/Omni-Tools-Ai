'use client';

import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, MessageSquare, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ContactPage() {
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
        
        <div className="glass-card p-8 md:p-16 rounded-[3rem] border-border/50 text-center w-full">
          <h1 className="text-4xl md:text-8xl font-black tracking-tight uppercase italic mb-6 leading-tight px-4 py-2">Get In Touch</h1>
          <p className="text-muted-foreground font-bold uppercase tracking-[0.4em] mb-16 text-sm">We're here to help you build better.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            <div className="bg-muted/30 p-10 rounded-[2.5rem] border border-border space-y-6 hover:bg-muted/50 transition-all group">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Mail className="h-7 w-7" />
                </div>
                <div>
                    <h3 className="text-primary font-black uppercase text-xs tracking-widest mb-2">Email Support</h3>
                    <a href="mailto:omnitoolsai@gmail.com" className="text-2xl font-black text-foreground hover:text-primary transition-colors break-words">omnitoolsai@gmail.com</a>
                </div>
            </div>

            <div className="bg-muted/30 p-10 rounded-[2.5rem] border border-border space-y-6 hover:bg-muted/50 transition-all group">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <MessageSquare className="h-7 w-7" />
                </div>
                <div>
                    <h3 className="text-primary font-black uppercase text-xs tracking-widest mb-2">WhatsApp Hub</h3>
                    <a href="https://wa.me/971567067618" target="_blank" className="text-2xl font-black text-foreground hover:text-primary transition-colors">+971 56 706 7618</a>
                </div>
            </div>

            <div className="bg-muted/30 p-10 rounded-[2.5rem] border border-border space-y-6 hover:bg-muted/50 transition-all group md:col-span-2 lg:col-span-1">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Phone className="h-7 w-7" />
                </div>
                <div>
                    <h3 className="text-primary font-black uppercase text-xs tracking-widest mb-2">Nepal Hotline</h3>
                    <a href="tel:+9779864353535" className="text-2xl font-black text-foreground hover:text-primary transition-colors">+977 986 435 3535</a>
                </div>
            </div>
          </div>

          <div className="mt-16 p-10 bg-primary/5 rounded-[2.5rem] border border-primary/10 max-w-5xl mx-auto">
            <p className="text-lg md:text-xl font-bold text-muted-foreground leading-relaxed">
                Our support team is available from <strong className="text-foreground">10:00 AM to 6:00 PM (NPT)</strong>. 
                For emergency help regarding Dummy Tickets, please reach out via <span className="text-primary">WhatsApp</span> for faster response.
            </p>
          </div>
        </div>
      </main>
      <LandingFooter onNavigate={path => router.push(path)} />
    </div>
  );
}