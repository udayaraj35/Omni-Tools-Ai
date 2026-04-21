'use client';

import { Facebook, Linkedin, MessageSquare, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const cvTypes = [
  {
    id: 'europass_cv_sample',
    title: 'Europass CV',
    description: 'International Standard Format for European markets.',
    href: '/cv-builder?type=europass',
    tag: 'Official',
    btnText: 'Start Europass'
  },
  {
    id: 'normal_cv_sample',
    title: 'Modern CV',
    description: 'Clean, Stylish & Creative layouts for professionals.',
    href: '/cv-builder?type=normal',
    tag: 'Premium',
    btnText: 'Build Modern CV'
  },
  {
    id: 'ats_cv_sample',
    title: 'ATS Sharp',
    description: 'Machine Readable Pro Design for HR filters.',
    href: '/cv-builder?type=ats',
    tag: 'HR Ready',
    btnText: 'Check ATS Format'
  },
];

export function CareerSection({ onStartCV }: { onStartCV: (path: string) => void; }) {
    const [shareUrl, setShareUrl] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setShareUrl(`${window.location.origin}/cv-builder`);
        }
    }, []);

    const shareText = "Create a professional CV for free with OmniTools AI!";

    const socialLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
    };

  return (
    <section id="career" className="w-full py-12 border-y border-border/50 bg-primary/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="glass-card p-8 md:p-12 rounded-[2.5rem] border-border/50">
            <div className="text-center mb-16">
                 <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-foreground flex items-center justify-center gap-4">
                      <FileText className="h-12 w-12 text-primary" /> AI CV Studio Hub
                    </h2>
                 <p className="mt-4 text-muted-foreground font-medium max-w-2xl mx-auto">Select your specialized standard and start building your professional future. Your data stays synced across all formats.</p>
            </div>
            
            <div className="grid gap-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cvTypes.map((cv) => {
                  const image = PlaceHolderImages.find(img => img.id === cv.id);
                  return (
                    <div
                      key={cv.id}
                      className="group relative animated-border-card cursor-pointer"
                      onClick={() => onStartCV(cv.href)}
                    >
                      <div className="relative overflow-hidden rounded-2xl flex flex-col bg-card h-full border border-border group-hover:border-primary/30 transition-all duration-500 shadow-lg">
                        <div className="relative aspect-[3/4] overflow-hidden">
                            {image && (
                              <Image
                                src={image.imageUrl}
                                alt={cv.title}
                                fill
                                data-ai-hint={image.imageHint}
                                className="object-cover group-hover:scale-110 transition-transform duration-1000"
                              />
                            )}
                            <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-colors duration-500"></div>
                            
                            <div className="absolute top-4 left-4">
                                <span className="bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-2xl">{cv.tag}</span>
                            </div>

                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-4 group-hover:translate-y-0">
                                <Button className="gradient-button-gold rounded-xl uppercase font-black text-xs tracking-[0.2em] px-8 h-14 shadow-2xl">
                                    {cv.btnText} <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                          </div>
                           <div className="p-8 text-center space-y-2 bg-background/50 backdrop-blur-3xl flex-1 flex flex-col justify-center border-t border-border">
                                <h3 className="text-foreground font-black uppercase text-xl tracking-tighter italic">{cv.title}</h3>
                                <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-widest leading-relaxed px-4">{cv.description}</p>
                           </div>
                        </div>
                    </div>
                  );
                })}
              </div>

               <div className="flex flex-wrap items-center justify-center gap-6 pt-12 border-t border-border/50">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Spread the Word</p>
                    <div className="flex gap-4">
                        <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-muted text-blue-500 hover:bg-blue-500/10 border border-border shadow-sm"><Facebook className="w-6 h-6"/></Button>
                        </a>
                        <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer">
                             <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-muted text-green-600 hover:bg-green-600/10 border border-border shadow-sm"><MessageSquare className="w-6 h-6"/></Button>
                        </a>
                        <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-muted text-blue-600 hover:bg-blue-600/10 border border-border shadow-sm"><Linkedin className="w-6 h-6"/></Button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
}
