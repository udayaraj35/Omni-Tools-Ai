'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Video, Film, Music, Captions, Hash, Image as ImageIcon, Share2, Wrench } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    name: 'Smart Video Compressor',
    description: 'Auto-detects settings to reduce file size with optimal quality.',
    icon: Video,
  },
  {
    name: 'Reel / Shorts Auto Cutter',
    description: 'AI-powered highlight detection to create vertical short-form content.',
    icon: Film,
  },
  {
    name: 'Audio Extractor From Video',
    description: 'Extract audio tracks into MP3, WAV, or AAC formats.',
    icon: Music,
  },
  {
    name: 'Smart Subtitle Generator',
    description: 'Auto speech-to-text with multi-language support and SRT/VTT export.',
    icon: Captions,
  },
  {
    name: 'AI Title & Hashtag Generator',
    description: 'Generate SEO-friendly titles, captions, and hashtags for social media.',
    icon: Hash,
  },
  {
    name: 'Thumbnail Creator',
    description: 'Capture the best frames and add text or image overlays.',
    icon: ImageIcon,
  },
  {
    name: 'Social Platform Presets',
    description: 'One-click export settings for YouTube, TikTok, Instagram, and more.',
    icon: Share2,
  },
   {
    name: 'System Intelligence',
    description: 'Auto-detection, background jobs, and a modular architecture.',
    icon: Wrench,
  },
];

export default function MediaProcessorPage() {
    const router = useRouter();

    const handleNavigate = (path: string) => {
        router.push(path.startsWith('/') ? path : `/#${path}`);
    };
    
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar onNavigate={handleNavigate} />
            <main className="flex-1 container mx-auto py-10 md:py-16">
                <button onClick={() => router.back()} className="animated-border-card inline-block mb-6">
                    <span className={cn("inner-span flex items-center back-to-home-button")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </span>
                </button>
                <div className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-glow-primary font-headline">Smart Media Processing Suite</h1>
                    <p className="mt-4 max-w-3xl mx-auto text-muted-foreground md:text-lg">
                        An advanced, AI-powered toolkit to compress, cut, subtitle, and optimize your videos and audio for any platform.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map(feature => (
                        <Card key={feature.name} className="glass-card flex flex-col">
                            <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <feature.icon className="h-6 w-6" />
                                </div>
                                <CardTitle>{feature.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow flex flex-col justify-between">
                                <p className="text-muted-foreground text-sm">{feature.description}</p>
                                <div className="mt-4">
                                     <Badge variant="outline">Coming Soon</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>
            <LandingFooter onNavigate={handleNavigate} />
        </div>
    );
}
