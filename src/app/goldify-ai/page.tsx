'use client';

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { generateContent } from './ai';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Scissors, Download, Sparkles, Upload, Lock, Unlock, Trash2, Wand2, RefreshCw, Bot, Image as ImageIcon, Loader2, ArrowLeft, Eraser } from "lucide-react";
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from '@/components/ui/scroll-area';
import { themes } from './themes';
import { createAiCardContent, generateBackgroundImage, removeImageBackground } from '@/app/actions';
import { ProcessingOverlay } from '@/components/ui/processing-overlay';

export default function GoldifyAiPage() {
  const router = useRouter();
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);
  
  const [photo, setPhoto] = useState<string | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [eventType, setEventType] = useState('Happy Dashain');

  const downloadCard = async () => {
    if (!previewRef.current) return;
    setIsAiProcessing(true);
    toast({title: 'Generating high-quality image...'});

    try {
        const { default: html2canvas } = await import('html2canvas');
        const canvas = await html2canvas(previewRef.current, { scale: 3, useCORS: true });
        const link = document.createElement('a');
        link.download = `Studio-Card-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast({title: 'Download started!'});
    } catch (e) {
        toast({variant: 'destructive', title: 'Export failed'});
    } finally {
        setIsAiProcessing(false);
    }
  };

  return (
    <div className="bg-zinc-950 text-white min-h-screen">
      <Navbar onNavigate={p => router.push(p)} />
      <main className="max-w-7xl mx-auto p-6">
        <button onClick={() => router.push('/')} className="animated-border-card inline-block mb-6">
            <span className="inner-span flex items-center back-to-home-button"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</span>
        </button>
        <div className="grid lg:grid-cols-2 gap-10">
            <Card className="glass-card p-10 bg-zinc-900 border-zinc-800">
                <h2 className="text-2xl font-bold mb-6">Card Content</h2>
                <div className="space-y-4">
                    <Input placeholder="Enter Name" value={name} onChange={e => setName(e.target.value)} className="h-14 bg-zinc-800 border-zinc-700" />
                    <Textarea placeholder="Enter Message" value={message} onChange={e => setMessage(e.target.value)} rows={5} className="bg-zinc-800 border-zinc-700" />
                </div>
            </Card>
            <div className="flex flex-col items-center">
                <div ref={previewRef} className="w-full aspect-[4/5] bg-gradient-to-br from-red-900 to-amber-900 rounded-3xl p-10 flex flex-col justify-between text-center shadow-2xl border-4 border-amber-500/30">
                    <h1 className="text-4xl font-black text-amber-400 uppercase italic">{eventType}</h1>
                    <div className="space-y-4">
                        <p className="text-3xl font-bold text-white">{name}</p>
                        <p className="text-lg text-amber-100 italic">{message || 'Your magic message will appear here...'}</p>
                    </div>
                </div>
                <Button onClick={downloadCard} size="lg" className="mt-10 h-16 px-16 text-xl font-black gradient-button-gold rounded-3xl">
                    <Download className="mr-3"/> DOWNLOAD CARD
                </Button>
            </div>
        </div>
      </main>
      {isAiProcessing && <ProcessingOverlay />}
      <LandingFooter onNavigate={p => router.push(p)} />
    </div>
  );
}