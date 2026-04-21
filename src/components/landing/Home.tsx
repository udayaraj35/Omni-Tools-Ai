
'use client';
import { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { CareerSection } from '@/components/landing/CareerSection';
import { LandingFooter } from '@/components/landing/Footer';
import { ContactDialog } from '@/components/ui/contact-dialog';
import { ToolsGrid } from '@/components/landing/ToolsGrid';
import { 
  ArrowUp, Star, Shield, Zap, Globe, User, 
  Sparkles, CheckCircle2, MessageSquare, FileText, 
  LayoutGrid, Cpu, Smartphone, ShieldCheck, ArrowRight, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';

const AdPlaceholder = ({ id, className }: { id: string; className?: string }) => {
    const pushed = useRef(false);
    useEffect(() => {
        if (pushed.current) return;
        try {
            if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
                ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
                pushed.current = true;
            }
        } catch (e) {}
    }, []);

    return (
        <div className={cn("w-full flex items-center justify-center my-4 overflow-hidden px-4 md:px-12 lg:px-20", className)}>
            <ins className="adsbygoogle"
                 style={{ display: 'block', textAlign: 'center', width: '100%' }}
                 data-ad-layout="in-article"
                 data-ad-format="fluid"
                 data-ad-client="ca-pub-5316090866649021"
                 data-ad-slot={id}></ins>
        </div>
    );
};

const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        const toggleVisibility = () => setIsVisible(window.pageYOffset > 300);
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);
    return (
        <button type="button" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
            className={cn('fixed bottom-8 right-8 z-50 h-12 w-12 rounded-full gradient-button-gold flex items-center justify-center transition-all duration-300 shadow-2xl', isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none')}>
            <ArrowUp className="h-6 w-6" />
        </button>
    );
};

const StatsSection = () => {
    const firestore = useFirestore();
    // Fetch all user documents to count them
    const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
    const { data: users } = useCollection(usersQuery);
    
    // Fallback to real count if available
    const totalUsers = users ? users.length : 0;
    const displayCount = totalUsers === 0 ? "Initial Node" : `${totalUsers.toLocaleString()}`;

    return (
        <div className="w-full px-4 md:px-12 lg:px-20 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {[
                    { label: 'AI Tools', val: '100+', icon: Zap, color: 'text-primary', bg: 'bg-primary/10' },
                    { label: 'Documents', val: '2.5M+', icon: FileText, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
                    { label: 'Total Users', val: displayCount, icon: User, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                    { label: 'Global Reach', val: '50+', icon: Globe, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                ].map((stat, i) => (
                    <div key={i} className="glass-card relative p-6 md:p-8 rounded-[2.5rem] border-border flex flex-col items-center text-center group transition-all duration-500 hover:translate-y-[-10px] hover:shadow-[0_30px_60px_rgba(0,0,0,0.1)]">
                        <div className={cn("p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-500 shadow-lg", stat.bg, stat.color)}>
                            <stat.icon className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <span className="text-2xl md:text-3xl font-black tracking-tighter text-foreground">{stat.val}</span>
                        <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-2">{stat.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const NewsTicker = () => {
    const firestore = useFirestore();
    
    const newsQuery = useMemoFirebase(() => {
        return query(
            collection(firestore, 'newsItems'),
            where('status', '==', 'active'),
            orderBy('priority', 'desc')
        );
    }, [firestore]);

    const { data: newsItems, isLoading, error } = useCollection(newsQuery);

    if (isLoading || error || !newsItems || newsItems.length === 0) {
        return null;
    }

    return (
        <div className="w-full bg-primary/10 border-b border-primary/20 overflow-hidden py-2 whitespace-nowrap">
            <div className="animate-marquee inline-block">
                {newsItems.map((item) => (
                    <span key={item.id} className="mx-12 text-[10px] font-black uppercase tracking-widest text-primary flex-inline items-center gap-2">
                        {item.type === 'urgent' ? '🚨' : item.type === 'update' ? '✨' : '📢'} {item.text}
                    </span>
                ))}
                {newsItems.map((item) => (
                    <span key={`dup-${item.id}`} className="mx-12 text-[10px] font-black uppercase tracking-widest text-primary">
                        {item.type === 'urgent' ? '🚨' : item.type === 'update' ? '✨' : '📢'} {item.text}
                    </span>
                ))}
            </div>
        </div>
    );
};

export function Home({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [showContactDialog, setShowContactDialog] = useState(false);
  
  const handleNavigation = (path: string) => {
    if (path === 'contact') setShowContactDialog(true);
    else onNavigate(path);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background w-full overflow-x-hidden transition-colors duration-300">
      <NewsTicker />
      <Navbar handleNavigate={handleNavigation} onNavigate={handleNavigation} />
      <main className="flex-1 w-full space-y-12">
        <div className="w-full px-4 md:px-12 lg:px-20 pt-12 pb-6">
            <HeroSection onNavigate={onNavigate} />
        </div>
        
        <StatsSection />
        
        <div className="w-full px-4 md:px-12 lg:px-20">
            <ToolsGrid onNavigate={onNavigate} />
        </div>
        
        <CareerSection onStartCV={(path) => onNavigate(path)} />
        
        <AdPlaceholder id="home_top" />
        
        <section className="w-full px-4 md:px-12 lg:px-20 py-16 text-center space-y-10">
            <div className="w-full space-y-3">
                <Badge variant="outline" className="border-primary/30 text-primary uppercase font-black px-4 py-1.5 tracking-widest text-xs rounded-full">
                    Studio Intelligence Engine
                </Badge>
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-foreground">The Ultimate AI Powerhouse</h2>
                <p className="max-w-2xl mx-auto text-muted-foreground font-medium">Built for speed, privacy, and creative excellence.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                <div className="p-10 rounded-[3rem] glass-card hover:border-primary/30 transition-all text-left space-y-5 border-border/50">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
                        <Cpu className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black uppercase italic text-foreground">Neural Processing</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">Text, code, and images generated in milliseconds using the latest Gemini models and neural clusters.</p>
                </div>
                <div className="p-10 rounded-[3rem] glass-card hover:border-primary/30 transition-all text-left space-y-5 border-border/50">
                    <div className="h-16 w-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 border border-cyan-500/20 shadow-sm">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black uppercase italic text-foreground">Privacy Shield</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">Your data remains yours. Files are processed locally or wiped from our secure nodes within 24 hours.</p>
                </div>
                <div className="p-10 rounded-[3rem] glass-card hover:border-primary/30 transition-all text-left space-y-5 border-border/50">
                    <div className="h-16 w-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20 shadow-sm">
                        <Globe className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black uppercase italic text-foreground">Global Reach</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">A borderless platform designed for global professionals, with specialized utilities for the Nepali community.</p>
                </div>
            </div>
        </section>
        
        <AdPlaceholder id="home_footer" className="mb-0 mt-8" />
      </main>
      <LandingFooter onNavigate={handleNavigation} />
      <ContactDialog open={showContactDialog} onOpenChange={setShowContactDialog} />
      <ScrollToTopButton />
    </div>
  );
}
