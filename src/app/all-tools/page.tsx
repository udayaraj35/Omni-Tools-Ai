'use client';

import React, { useEffect, useRef } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, BookUser, Image as ImageIcon, LayoutGrid, Pencil, Bot, Wrench, Landmark, Plane, CaseUpper } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toolCategories, categoryTheme } from '@/lib/tools';
import Image from 'next/image';

const AdPlaceholder = ({ id }: { id: string }) => {
    const pushed = useRef(false);
    useEffect(() => {
        if (pushed.current) return;
        try {
            if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
                ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
                pushed.current = true;
            }
        } catch (e) {
            console.error("AdSense push error:", e);
        }
    }, []);

    return (
        <div className="w-full flex items-center justify-center my-6 overflow-hidden">
            <ins className="adsbygoogle"
                 style={{ display: 'block', textAlign: 'center', width: '100%' }}
                 data-ad-layout="in-article"
                 data-ad-format="fluid"
                 data-ad-client="ca-pub-5316090866649021"
                 data-ad-slot={id}></ins>
        </div>
    );
};

const categoryIcons: { [key: string]: React.ElementType } = {
  "नेपाली युटिलिटी हब": Landmark,
  "Career & Professional": BookUser,
  "Visa & Travel Hub": Plane,
  "AI Content & Writing": Pencil,
  "AI Image & Design": ImageIcon,
  "PDF & Media Utils": Wrench,
  "Smart AI Assistants": Bot,
  "Text & Font Stylist": CaseUpper,
};

export default function AllToolsPage() {
    const router = useRouter();

    const handleNavigate = (path: string) => {
        router.push(path.startsWith('/') ? path : `/#${path}`);
    };
    
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden">
            <Navbar onNavigate={handleNavigate} />
            <main className="flex-1 w-full py-8 px-4 md:px-12 lg:px-20">
                <button onClick={() => router.push('/')} className="animated-border-card inline-block mb-8">
                    <span className={cn("inner-span flex items-center back-to-home-button")}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                    </span>
                </button>
                
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-glow-primary font-headline uppercase italic leading-tight px-4 py-2">OmniTools Ecosystem</h1>
                    <p className="mt-4 max-w-4xl mx-auto text-muted-foreground font-bold uppercase tracking-[0.4em] text-[10px]">
                        Access 100+ professional AI utilities in one place.
                    </p>
                </div>

                <AdPlaceholder id="tools_top" />
                
                 <div className="space-y-24">
                    {Object.entries(toolCategories).map(([category, tools], catIdx) => {
                        if ((tools as any[]).length === 0) return null;
                        const CategoryIcon = categoryIcons[category] || LayoutGrid;
                        const theme = categoryTheme[category] || { color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" };
                        
                        return (
                            <div key={category} className="space-y-8">
                                <div className="flex items-center gap-4 px-4">
                                    <div className={cn("p-3 rounded-2xl border transition-transform hover:scale-110", theme.bg, theme.border)}>
                                        <CategoryIcon className={cn("h-6 w-6", theme.color)} />
                                    </div>
                                    <h2 className={cn("text-3xl font-black tracking-tight uppercase italic leading-tight", theme.color)}>{category}</h2>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                    {(tools as any[]).map(tool => (
                                        <Link key={tool.name} href={tool.href}>
                                            <div className="glass-card group h-full cursor-pointer p-6 hover:bg-accent/50 transition-all border-border flex flex-col gap-4 rounded-[2rem]">
                                                <div className="flex justify-between items-start w-full">
                                                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center transition-colors shadow-inner border", theme.bg, theme.border)}>
                                                        {tool.icon ? <tool.icon className={cn("h-6 w-6 group-hover:scale-110 transition-transform", tool.color)} /> : <LayoutGrid className="h-6 w-6" />}
                                                    </div>
                                                    {tool.flag === 'nepal' && (
                                                        <Image src="https://i.imgur.com/dS8Bj8T.png" alt="Nepal" width={20} height={20} className="object-contain" />
                                                    )}
                                                </div>
                                                <div className="space-y-1 text-left">
                                                    <h3 className="font-black text-lg group-hover:text-primary transition-colors leading-tight uppercase italic tracking-tight">{tool.name}</h3>
                                                    <p className="text-muted-foreground text-[9px] leading-relaxed font-bold uppercase tracking-widest">{tool.description}</p>
                                                </div>
                                                <div className="mt-auto pt-2 flex items-center text-[9px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                                                    Open <ArrowRight className="ml-1 h-3 w-3" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                {catIdx === 1 && <AdPlaceholder id="tools_mid" />}
                            </div>
                        )
                    })}
                </div>
                <AdPlaceholder id="tools_bottom" />
            </main>
            <LandingFooter onNavigate={handleNavigate} />
        </div>
    );
}
