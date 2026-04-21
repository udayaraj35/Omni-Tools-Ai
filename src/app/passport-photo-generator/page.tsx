'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    Loader2, ArrowLeft, Download, Upload, Sparkles, 
    Printer, Image as ImageIcon, CheckCircle2, 
    ShieldCheck, RefreshCw, Scan, Shirt, Globe, 
    Eraser as EraserIcon, X, Baby
} from 'lucide-react';
import Image from 'next/image';
import { removeImageBackground, changePhotoDress } from '@/app/actions';
import { ProcessingOverlay } from '@/components/ui/processing-overlay';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const countryPresets = [
  { id: 'usa_dv', name: 'USA DV Lottery (EDV)', width: 51, height: 51, pxWidth: 600, pxHeight: 600, note: 'Strict 600x600px, White BG, No Glasses.' },
  { id: 'nepal', name: 'Nepal Passport', width: 35, height: 45, pxWidth: 413, pxHeight: 531, note: 'White BG, 70-80% Head Size' },
  { id: 'usa', name: 'USA Visa/Passport', width: 51, height: 51, pxWidth: 600, pxHeight: 600, note: '2x2 inch, White BG' },
  { id: 'uk', name: 'UK Passport', width: 35, height: 45, pxWidth: 413, pxHeight: 531, note: 'Cream or Light Gray BG allowed' },
  { id: 'schengen', name: 'Schengen Visa', width: 35, height: 45, pxWidth: 413, pxHeight: 531, note: 'Strict biometric standards' },
];

const bgOptions = [
  { name: 'Original', value: 'original' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Light Blue', value: '#ADD8E6' },
  { name: 'Royal Blue', value: '#003366' },
  { name: 'Light Gray', value: '#D3D3D3' },
  { name: 'Red', value: '#DC143C' },
  { name: 'Custom', value: 'custom' },
];

const layoutOptions = [
    { id: 'single', name: 'Single Digital Photo' },
    { id: '4x6_4', name: '4x6 Inch Sheet (4 Photos)' },
    { id: 'a4_8', name: 'A4 Paper (8 Photos)' },
    { id: 'a4_16', name: 'A4 Paper (16 Photos)' },
];

const expressions = [
    { name: 'Neutral / Normal', value: 'Neutral, closed mouth, natural gaze' },
    { name: 'Natural Smile', value: 'Friendly natural smile, showing teeth slightly' },
    { name: 'Slight Smile', value: 'Very subtle smile, professional and warm' },
    { name: 'Serious / Focused', value: 'Serious, focused, professional look' },
];

const filters = [
    { name: 'None', value: 'none' },
    { name: 'B&W', value: 'grayscale(100%)' },
    { name: 'Warm', value: 'sepia(30%) saturate(140%)' },
    { name: 'Cool', value: 'hue-rotate(180deg) saturate(120%)' },
    { name: 'Vivid', value: 'saturate(180%)' },
];

const maleOutfits = [
    { name: 'Professional Black Suit', value: 'Professional Male Black Suit with White Shirt and Black Tie' },
    { name: 'Navy Blue Business Suit', value: 'Formal Male Navy Blue Business Suit with Light Blue Shirt' },
    { name: 'Charcoal Grey Formal Suit', value: 'Formal Charcoal Grey Suit with White Shirt' },
    { name: 'Classic White Dress Shirt', value: 'Clean Formal Male White Dress Shirt' },
    { name: 'Light Blue Oxford Shirt', value: 'Professional Light Blue Oxford Shirt' },
    { name: 'Nepali Daura Suruwal (Black)', value: 'Nepali National Daura Suruwal Top with Black Coat and Dhaka Topi' },
    { name: 'Arabic White Kandura', value: 'Traditional Arabic White Kandura Top' },
    { name: 'Doctor Lab Coat', value: 'Professional Male Doctor White Lab Coat over formal shirt' },
];

const femaleOutfits = [
    { name: 'Black Business Suit', value: 'Professional Female Black Business Suit with White Shirt' },
    { name: 'Navy Blue Executive Suit', value: 'Formal Female Navy Blue Suit with Blouse' },
    { name: 'Classic White Silk Blouse', value: 'Clean White Silk Professional Blouse' },
    { name: 'Traditional Nepali Red Saree', value: 'Traditional Nepali Red Silk Saree with Gold Jewelry' },
    { name: 'Black Arabic Abaya', value: 'Elegant Black Arabic Abaya with subtle embroidery' },
    { name: 'Doctor Lab Coat', value: 'Professional Female White Lab Coat' },
];

const kidsOutfits = [
    { name: 'White Shirt & Bowtie', value: 'Toddler White Button-down Shirt with Cute Bowtie' },
    { name: 'Blue Suit & Red Tie', value: 'Little Boy Formal Blue Suit with Small Red Tie' },
    { name: 'Red Party Dress (Lace)', value: 'Little Girl Elegant Red Lace Party Dress' },
    { name: 'Kids Daura Suruwal', value: 'Kids Traditional Nepali Daura Suruwal' },
];

const useDraggable = (elRef: React.RefObject<HTMLElement>, onDrag: (pos: { x: number, y: number }) => void, isLocked: boolean, zoom: number) => {
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const elStartRef = useRef({ x: 0, y: 0 });

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (isLocked) return;
        e.preventDefault();
        e.stopPropagation();
        if (!elRef.current) return;
        isDraggingRef.current = true;
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        elStartRef.current = { x: elRef.current.offsetLeft, y: elRef.current.offsetTop };
        
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDraggingRef.current || !elRef.current?.parentElement) return;
            const dx = (e.clientX - dragStartRef.current.x) / zoom;
            const dy = (e.clientY - dragStartRef.current.y) / zoom;
            onDrag({ x: elStartRef.current.x + dx, y: elStartRef.current.y + dy });
        };

        const handleMouseUp = () => {
            isDraggingRef.current = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [elRef, onDrag, isLocked, zoom]);

    return { onMouseDown: handleMouseDown };
};

export default function PassportPhotoGeneratorPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [photoSource, setPhotoSource] = useState<string | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("AI Processing...");
  const [selectedCountry, setSelectedCountry] = useState(countryPresets[0]);
  const [selectedExpression, setSelectedExpression] = useState(expressions[0].value);
  const [customInstructions, setCustomInstructions] = useState('');
  const [bgColor, setBgColor] = useState('original');
  const [customBgColor, setCustomBgColor] = useState('#FFFFFF');
  const [layout, setLayout] = useState('single');
  
  const [showBorder, setShowBorder] = useState(true);
  const [borderType, setBorderStyle] = useState<'full' | 'corners'>('full');
  const [borderWidth, setBorderWidth] = useState(0.5);
  const [borderColor, setBorderColor] = useState('#E5E7EB');
  const [cornerLength, setCornerLength] = useState(15);

  const [activeFilter, setActiveFilter] = useState('none');
  const [showShadow, setShowShadow] = useState(false);
  const [vignette, setVignette] = useState(0);
  const [sharpness, setSharpness] = useState(0);

  const [zoom, setZoom] = useState(1);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  const previewContentRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoSource(ev.target?.result as string);
      resetAdjustments();
      toast({ title: 'Photo Uploaded!' });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBackground = async () => {
    if (!photoSource) return;
    setProcessingMessage("Erasing Background...");
    setIsAiProcessing(true);
    try {
      const result = await removeImageBackground({ photoDataUri: photoSource });
      if (!result.photoDataUri || result.photoDataUri.startsWith('Error:')) throw new Error('AI failed.');
      setPhotoSource(result.photoDataUri);
      if (bgColor === 'original') setBgColor('#FFFFFF'); 
      toast({ title: 'Background Removed!' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'AI Failed', description: error.message });
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleApplyAiChanges = async (dressStyle?: string) => {
      if (!photoSource) return;
      setProcessingMessage("Applying AI Magic...");
      setIsAiProcessing(true);
      const style = dressStyle || "Maintain current outfit";
      try {
          const result = await changePhotoDress({
              photoDataUri: photoSource,
              dressStyle: style,
              expression: selectedExpression,
              customInstructions: customInstructions
          });
          if ('error' in result) throw new Error(result.error);
          setPhotoSource(result.photoDataUri);
          toast({ title: 'Success!', description: 'Changes applied successfully.' });
      } catch (error: any) {
          toast({ variant: 'destructive', title: 'Processing Failed', description: error.message });
      } finally {
          setIsAiProcessing(false);
      }
  };

  const handleDownload = async () => {
    if (!photoSource || !previewContentRef.current) return;
    setProcessingMessage("Generating Final Copy...");
    setIsAiProcessing(true);
    try {
        const { default: html2canvas } = await import('html2canvas');
        const { default: jsPDF } = await import('jspdf');

        const currentBg = bgColor === 'original' ? '#FFFFFF' : (bgColor === 'custom' ? customBgColor : bgColor);
        const canvas = await html2canvas(previewContentRef.current, { 
            scale: 4, 
            useCORS: true, 
            backgroundColor: currentBg,
            removeContainer: true
        });
        let finalDataUri = canvas.toDataURL('image/jpeg', 0.95);

        if (layout === 'single') {
            const link = document.createElement('a');
            link.download = `passport-photo-${Date.now()}.jpg`;
            link.href = finalDataUri;
            link.click();
        } else {
            const isA4 = layout.includes('a4');
            const pdf = new jsPDF({ orientation: isA4 ? 'portrait' : 'landscape', unit: 'mm', format: isA4 ? 'a4' : [101.6, 152.4] });
            const pw = selectedCountry.width;
            const ph = selectedCountry.height;
            const numPhotos = parseInt(layout.split('_')[1] || '1');
            let cols = layout === 'a4_16' ? 4 : 2;
            for (let i = 0; i < numPhotos; i++) {
                const r = Math.floor(i / cols);
                const c = i % cols;
                pdf.addImage(finalDataUri, 'JPEG', 15 + c * (pw + 5), 15 + r * (ph + 5), pw, ph);
            }
            pdf.save(`passport-sheet.pdf`);
        }
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to save photo.' });
    } finally {
      setIsAiProcessing(false);
    }
  };

  const resetAdjustments = () => {
      setZoom(1); setPosX(0); setPosY(0); setRotation(0); setBrightness(100); setContrast(100);
      setActiveFilter('none'); setShowShadow(false); setVignette(0); setSharpness(0);
  };

  const onDrag = useCallback((pos: {x: number, y: number}) => {
    setPosX(pos.x);
    setPosY(pos.y);
  }, []);

  const { onMouseDown: onPhotoMouseDown } = useDraggable(photoRef, onDrag, false, zoom);

  const currentBgColorValue = bgColor === 'original' ? '#f0f0f0' : (bgColor === 'custom' ? customBgColor : bgColor);

  const renderPhotoContent = (sizeScale: number = 1) => (
    <div 
        ref={sizeScale === 1 ? previewContentRef : null}
        className={cn("relative overflow-hidden bg-white", showShadow && "shadow-2xl")}
        style={{ 
            width: `${selectedCountry.pxWidth * sizeScale}px`, 
            height: `${selectedCountry.pxHeight * sizeScale}px`,
            backgroundColor: currentBgColorValue,
            border: (showBorder && borderType === 'full') ? `${borderWidth * sizeScale}px solid ${borderColor}` : 'none',
            boxSizing: 'content-box'
        }}
    >
        <div className="absolute inset-0 flex items-center justify-center">
            {photoSource && (
                <div 
                    ref={sizeScale === 1 ? photoRef : null}
                    onMouseDown={sizeScale === 1 ? onPhotoMouseDown : undefined}
                    style={{
                        transform: `translate(${posX * sizeScale}px, ${posY * sizeScale}px) rotate(${rotation}deg) scale(${zoom})`,
                        filter: `brightness(${brightness}%) contrast(${contrast}%) ${activeFilter !== 'none' ? activeFilter : ''} contrast(${1 + sharpness/100})`,
                        position: 'relative', width: '100%', height: '100%',
                        cursor: sizeScale === 1 ? 'move' : 'default'
                    }}
                >
                    <Image src={photoSource} alt="Passport source" fill className="object-contain pointer-none" unoptimized />
                </div>
            )}
        </div>
        {vignette > 0 && <div className="absolute inset-0 pointer-none z-[15]" style={{ background: `radial-gradient(circle, transparent 40%, rgba(0,0,0,${vignette/100}) 100%)` }} />}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar onNavigate={(p) => router.push(p)} />
      <main className="flex-1 w-full container mx-auto py-8 px-4 md:px-10 text-center">
        <button onClick={() => router.push('/')} className="animated-border-card inline-block mb-6">
          <span className={cn("inner-span flex items-center back-to-home-button")}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</span>
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-glow-primary font-headline uppercase italic">Advanced AI Passport Suite</h1>
          <p className="text-muted-foreground font-bold uppercase tracking-[0.4em] text-[10px]">Studio Precision • Magic Refiner • Official Standards</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-6 text-left">
            <Accordion type="multiple" defaultValue={['upload', 'standards', 'dress']} className="space-y-4">
                <AccordionItem value="upload" className="glass-card border-border rounded-3xl overflow-hidden px-5 shadow-2xl">
                    <AccordionTrigger className="hover:no-underline py-5"><span className="flex items-center gap-3 text-primary font-black uppercase text-xs tracking-widest"><Scan className="h-5 w-5" /> 1. Photo Intake</span></AccordionTrigger>
                    <AccordionContent className="space-y-4 pb-6">
                        {!photoSource ? (
                            <label htmlFor="photo-upload" className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-3xl cursor-pointer hover:border-primary bg-muted/20">
                            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                            <span className="font-black text-sm uppercase tracking-wider text-muted-foreground">Drop Original Image</span>
                            <input id="photo-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                        ) : (
                            <div className="space-y-4">
                                <Button onClick={handleRemoveBackground} disabled={isAiProcessing} className="w-full h-14 gap-3 font-black uppercase tracking-[0.2em] gradient-button-gold rounded-2xl">
                                    {isAiProcessing ? <Loader2 className="animate-spin h-5 w-5" /> : <EraserIcon className="h-5 w-5" />} Remove Background
                                </Button>
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="standards" className="glass-card border-border rounded-3xl overflow-hidden px-5 shadow-2xl">
                    <AccordionTrigger className="hover:no-underline py-5"><span className="flex items-center gap-3 text-primary font-black uppercase text-xs tracking-widest"><Globe className="h-5 w-5" /> 2. Standards</span></AccordionTrigger>
                    <AccordionContent className="space-y-4 pb-6">
                        <div>
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-2 block">Photo Requirement</Label>
                            <Select value={selectedCountry.id} onValueChange={(val) => { const preset = countryPresets.find(p => p.id === val); if (preset) setSelectedCountry(preset); }}>
                                <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-popover border-border"><ScrollArea className="h-64">{countryPresets.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</ScrollArea></SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Background Color</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {bgOptions.map(opt => (
                                    <Button key={opt.name} variant={bgColor === opt.value ? 'default' : 'outline'} onClick={() => setBgColor(opt.value)} className="h-9 p-0 text-[8px] uppercase font-black overflow-hidden flex flex-col">
                                        <div className="flex-1 w-full" style={{ backgroundColor: opt.value === 'original' ? '#333' : (opt.value === 'custom' ? customBgColor : opt.value) }} />
                                        <span className="py-1 px-1 bg-muted w-full truncate">{opt.name}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="dress" className="glass-card border-border rounded-3xl overflow-hidden px-5 shadow-2xl">
                    <AccordionTrigger className="hover:no-underline py-5"><span className="flex items-center gap-3 text-primary font-black uppercase text-xs tracking-widest"><Shirt className="h-5 w-5" /> 3. AI Wardrobe</span></AccordionTrigger>
                    <AccordionContent className="space-y-4 pb-6">
                        <Tabs defaultValue="male" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 bg-muted h-auto p-1 rounded-xl gap-1">
                                <TabsTrigger value="male" className="text-[9px] uppercase font-black py-2">Male</TabsTrigger>
                                <TabsTrigger value="female" className="text-[9px] uppercase font-black py-2">Female</TabsTrigger>
                                <TabsTrigger value="kids" className="text-[9px] uppercase font-black py-2 gap-1"><Baby className="h-3 w-3"/> Kids</TabsTrigger>
                            </TabsList>
                            <TabsContent value="male" className="pt-4">
                                <ScrollArea className="h-[200px] pr-3">
                                    <div className="grid grid-cols-1 gap-2">
                                        {maleOutfits.map(style => (
                                            <Button key={style.name} onClick={() => handleApplyAiChanges(style.value)} disabled={!photoSource || isAiProcessing} variant="outline" className="h-12 text-[10px] uppercase font-black justify-start px-4">
                                                {style.name}
                                            </Button>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </TabsContent>
                            <TabsContent value="female" className="pt-4">
                                <ScrollArea className="h-[200px] pr-3">
                                    <div className="grid grid-cols-1 gap-2">
                                        {femaleOutfits.map(style => (
                                            <Button key={style.name} onClick={() => handleApplyAiChanges(style.value)} disabled={!photoSource || isAiProcessing} variant="outline" className="h-12 text-[10px] uppercase font-black justify-start px-4">
                                                {style.name}
                                            </Button>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </TabsContent>
                            <TabsContent value="kids" className="pt-4">
                                <ScrollArea className="h-[200px] pr-3">
                                    <div className="grid grid-cols-1 gap-2">
                                        {kidsOutfits.map(style => (
                                            <Button key={style.name} onClick={() => handleApplyAiChanges(style.value)} disabled={!photoSource || isAiProcessing} variant="outline" className="h-12 text-[10px] uppercase font-black justify-start px-4">
                                                {style.name}
                                            </Button>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </TabsContent>
                        </Tabs>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
          </div>

          <div className="lg:col-span-8 space-y-8 flex flex-col items-center">
            <Card className="glass-card w-full flex-1 min-h-[600px] flex flex-col items-center justify-center p-8 relative overflow-hidden bg-card/40 border-border shadow-2xl">
              {!photoSource ? (
                <div className="text-center space-y-6 opacity-20">
                  <ImageIcon className="w-32 h-32 mx-auto text-muted-foreground" />
                  <h3 className="text-2xl font-black uppercase tracking-widest text-foreground italic">Studio View</h3>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center space-y-10 animate-fade-in">
                  <div className="flex-grow flex items-center justify-center w-full">
                    {layout === 'single' ? (
                        <div className="relative shadow-2xl border-[10px] border-white overflow-hidden" style={{ width: `${selectedCountry.pxWidth}px`, height: `${selectedCountry.pxHeight}px` }}>{renderPhotoContent(1)}</div>
                    ) : (
                        <div className="bg-white p-10 shadow-2xl rounded-sm border overflow-auto" style={{ width: layout.includes('a4') ? '400px' : '420px', aspectRatio: layout.includes('a4') ? '210/297' : '152/101' }}>
                            <div className={cn("grid gap-6 h-full content-start justify-center", layout === '4x6_4' && "grid-cols-2", layout === 'a4_8' && "grid-cols-2", layout === 'a4_16' && "grid-cols-4")}>
                                {Array.from({ length: parseInt(layout.split('_')[1] || '1') }).map((_, i) => (<div key={i} className="border border-zinc-100 shadow-sm overflow-hidden">{renderPhotoContent(layout.includes('a4') ? 0.15 : 0.20)}</div>))}
                            </div>
                        </div>
                    )}
                  </div>

                  <div className="w-full max-w-xl space-y-4 bg-muted/50 p-6 rounded-3xl border border-border text-left">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Magic Instruction Refiner</Label>
                    </div>
                    <Textarea 
                        value={customInstructions}
                        onChange={(e) => setCustomInstructions(e.target.value)}
                        placeholder="e.g. 'Remove glasses', 'Make the shirt white', 'No beard'..."
                        className="rounded-2xl min-h-[100px] text-sm resize-none focus:ring-primary"
                    />
                    <Button onClick={() => handleApplyAiChanges()} disabled={!photoSource || isAiProcessing} className="w-full h-12 gap-3 font-black uppercase tracking-[0.2em] gradient-button-gold rounded-2xl shadow-lg">
                        {isAiProcessing ? <Loader2 className="animate-spin h-5 w-5" /> : <RefreshCw className="h-5 w-5" />} Apply AI Magic
                    </Button>
                  </div>
                  
                  <div className="w-full max-w-2xl bg-muted/40 p-6 rounded-[30px] border border-border backdrop-blur-2xl text-left">
                    <Tabs defaultValue="fine-tune" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 bg-muted h-auto p-1 rounded-2xl gap-1 mb-6">
                            <TabsTrigger value="fine-tune" className="py-2.5 uppercase font-black text-[9px] tracking-widest gap-2">Edit</TabsTrigger>
                            <TabsTrigger value="effects" className="py-2.5 uppercase font-black text-[9px] tracking-widest gap-2">Filters</TabsTrigger>
                            <TabsTrigger value="border" className="py-2.5 uppercase font-black text-[9px] tracking-widest gap-2">Borders</TabsTrigger>
                            <TabsTrigger value="export" className="py-2.5 uppercase font-black text-[9px] tracking-widest gap-2">Save</TabsTrigger>
                        </TabsList>

                        <TabsContent value="fine-tune" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                                <div className="space-y-3"><div className="flex justify-between text-[9px] font-black uppercase text-muted-foreground"><span>Brightness</span><span>{brightness}%</span></div><Slider value={[brightness]} onValueChange={(v) => setBrightness(v[0])} min={50} max={150} step={1} /></div>
                                <div className="space-y-3"><div className="flex justify-between text-[9px] font-black uppercase text-muted-foreground"><span>Zoom</span><span>{Math.round(zoom * 100)}%</span></div><Slider value={[zoom]} onValueChange={(v) => setZoom(v[0])} min={0.5} max={4} step={0.01} /></div>
                            </div>
                        </TabsContent>

                        <TabsContent value="export" className="space-y-6">
                            <div className="grid grid-cols-2 gap-6 items-end">
                                <div className="space-y-2"><Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Output Layout</Label><Select value={layout} onValueChange={setLayout}><SelectTrigger className="h-12 text-xs"><SelectValue /></SelectTrigger><SelectContent className="bg-popover border-border">{layoutOptions.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent></Select></div>
                                <Button onClick={handleDownload} disabled={isAiProcessing} className="flex-1 h-12 font-black text-xs uppercase gradient-button-gold rounded-xl shadow-xl">
                                    <Download className="mr-2 h-4 w-4" /> Save Photo
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                  </div>
                </div>
              )}
              
              {isAiProcessing && <ProcessingOverlay message={processingMessage} />}
            </Card>
          </div>
        </div>
      </main>
      <LandingFooter onNavigate={(p) => router.push(p)} />
    </div>
  );
}