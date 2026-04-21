'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    ArrowLeft, Download, Image as ImageIcon, Loader2, 
    Sparkles, Upload, Link as LinkIcon, RefreshCw, 
    Palette, Layers, Scissors, Sun, Zap, Maximize,
    Settings, Lock, Unlock, MoveHorizontal, MoveVertical,
    Eye, Columns, FileImage
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { removeImageBackground } from '@/app/actions';
import { ProcessingOverlay } from '@/components/ui/processing-overlay';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BeforeAfterSlider } from '@/components/ui/before-after-slider';
import html2canvas from 'html2canvas';

interface RemoveBgApiInput {
  photoDataUri?: string;
  imageUrl?: string;
}

interface ImageDimensions {
    width: number;
    height: number;
}

export default function BackgroundRemoverPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<ImageDimensions | null>(null);
  const [lastInput, setLastInput] = useState<RemoveBgApiInput | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  
  // View Modes
  const [viewMode, setViewMode] = useState<'studio' | 'compare'>('studio');

  // Advanced Controls
  const [bgMode, setBgMode] = useState<'transparent' | 'color' | 'blur'>('transparent');
  const [solidColor, setSolidColor] = useState('#ffffff');
  const [blurAmount, setBlurAmount] = useState(15);
  const [edgeFeather, setEdgeFeather] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  // Export Settings
  const [customWidth, setCustomWidth] = useState<number>(0);
  const [customHeight, setCustomHeight] = useState<number>(0);
  const [isAspectRatioLocked, setIsAspectRatioLocked] = useState(true);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg'>('png');
  
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (originalDimensions) {
        setCustomWidth(originalDimensions.width);
        setCustomHeight(originalDimensions.height);
    }
  }, [originalDimensions]);

  const handleWidthChange = (val: number) => {
    setCustomWidth(val);
    if (isAspectRatioLocked && originalDimensions) {
        const ratio = originalDimensions.height / originalDimensions.width;
        setCustomHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setCustomHeight(val);
    if (isAspectRatioLocked && originalDimensions) {
        const ratio = originalDimensions.width / originalDimensions.height;
        setCustomWidth(Math.round(val * ratio));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload a valid image file.' });
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        const img = new window.Image();
        img.onload = () => {
            setOriginalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
            setOriginalImage(dataUri);
            setLastInput({ photoDataUri: dataUri });
            handleRemoveBackground({ photoDataUri: dataUri });
        };
        img.src = dataUri;
    };
    reader.readAsDataURL(file);
  };
  
  const handleUrlSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!imageUrl) {
        toast({ variant: 'destructive', title: 'No URL', description: 'Please enter an image URL.' });
        return;
      }
      
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
          setOriginalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
          setOriginalImage(imageUrl); 
          
          // Try converting to data URI first to be safe
          try {
              const canvas = document.createElement('canvas');
              canvas.width = img.naturalWidth;
              canvas.height = img.naturalHeight;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0);
              const dataUri = canvas.toDataURL('image/png');
              setLastInput({ photoDataUri: dataUri });
              handleRemoveBackground({ photoDataUri: dataUri });
          } catch (error) {
              // Fallback to URL if canvas is tainted (CORS)
              setLastInput({ imageUrl: imageUrl });
              handleRemoveBackground({ imageUrl: imageUrl });
          }
      };
      img.onerror = () => {
          toast({ variant: 'destructive', title: 'Invalid URL', description: 'Could not load image from the provided link.' });
      }
      img.src = imageUrl;
  };

  const handleRemoveBackground = async (input: RemoveBgApiInput) => {
    setIsLoading(true);
    toast({ title: 'AI Processing...', description: 'Removing background with studio precision.' });
    
    try {
        const result = await removeImageBackground(input);
        if (result.photoDataUri && !result.photoDataUri.startsWith('Error:')) {
            setProcessedImage(result.photoDataUri);
            toast({ title: 'Success!', description: 'Background removed successfully.' });
        } else {
            throw new Error((result as any).photoDataUri || 'Failed to process the image.');
        }
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Processing Failed',
            description: error.message,
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleReprocess = () => {
    if (lastInput) handleRemoveBackground(lastInput);
  };

  const handleDownload = async () => {
    if (!processedImage || !resultRef.current) return;
    
    toast({ title: "Optimizing export...", description: `Preparing ${exportFormat.toUpperCase()} file at ${customWidth}x${customHeight}px.` });
    
    try {
        const rect = resultRef.current.getBoundingClientRect();
        const scale = customWidth / rect.width;

        const canvas = await html2canvas(resultRef.current, {
            scale: scale, 
            useCORS: true,
            backgroundColor: null,
            logging: false,
        });
        
        const mimeType = exportFormat === 'png' ? 'image/png' : 'image/jpeg';
        const extension = exportFormat === 'png' ? 'png' : 'jpg';
        
        const link = document.createElement('a');
        link.download = `omnitools-studio-${customWidth}x${customHeight}.${extension}`;
        link.href = canvas.toDataURL(mimeType, 1.0);
        link.click();
        toast({ title: "Download started!", description: `${exportFormat.toUpperCase()} composite saved.` });
    } catch (e) {
        toast({ variant: 'destructive', title: 'Export failed', description: 'Could not generate high-resolution image.' });
    }
  };

  const handleNavigate = (path: string) => {
    if (path.startsWith('/')) router.push(path);
    else router.push(`/#${path}`);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Navbar onNavigate={handleNavigate} />
        <main className="flex-grow container mx-auto py-8 px-4">
             <button onClick={() => router.push('/')} className="animated-border-card inline-block mb-6">
                <span className={cn("inner-span flex items-center back-to-home-button")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </span>
            </button>
             <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter text-glow-primary font-headline uppercase italic">AI Background Remover Pro</h1>
                <p className="max-w-2xl mx-auto mt-4 text-muted-foreground font-bold uppercase tracking-[0.4em] text-[10px]">
                    Studio Quality • Full Resolution • Precise Dimensions • Compare Mode
                </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-4 space-y-6">
                    <Card className="glass-card border-border shadow-2xl">
                        <CardContent className="p-6">
                             <Tabs defaultValue="upload">
                                <TabsList className="grid w-full grid-cols-2 bg-muted h-12 p-1 rounded-xl">
                                    <TabsTrigger value="upload" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-black font-bold uppercase text-xs"><Upload className="mr-2 h-4 w-4"/> Upload</TabsTrigger>
                                    <TabsTrigger value="url" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-black font-bold uppercase text-xs"><LinkIcon className="mr-2 h-4 w-4"/> URL</TabsTrigger>
                                </TabsList>
                                <TabsContent value="upload" className="pt-6">
                                     <label htmlFor="image-upload" className={cn("flex flex-col items-center justify-center p-10 space-y-3 cursor-pointer border-2 border-dashed rounded-3xl text-center transition-all bg-muted/20", originalImage ? "border-primary bg-primary/5" : "border-border hover:border-zinc-600")}>
                                        <div className="p-4 bg-muted rounded-full text-muted-foreground">
                                            <ImageIcon className="w-8 h-8" />
                                        </div>
                                        <span className="font-black text-sm uppercase tracking-widest">{originalImage ? "Change Photo" : "Select Photo"}</span>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold">RAW Quality Input</p>
                                    </label>
                                    <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </TabsContent>
                                <TabsContent value="url" className="pt-6">
                                    <form onSubmit={handleUrlSubmit} className="space-y-4">
                                        <Input
                                            type="url"
                                            placeholder="Paste image URL here"
                                            value={imageUrl}
                                            onChange={e => setImageUrl(e.target.value)}
                                            className="h-12 text-base rounded-xl"
                                        />
                                        <Button type="submit" disabled={isLoading} className="w-full h-12 text-base gradient-button-gold rounded-xl uppercase font-black tracking-widest">
                                            {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2 h-4 w-4"/>}
                                            Process URL
                                        </Button>
                                    </form>
                                </TabsContent>
                             </Tabs>
                        </CardContent>
                    </Card>

                    {(processedImage || isLoading) && (
                        <div className="space-y-6">
                            <Card className="glass-card border-border shadow-2xl animate-in fade-in slide-in-from-left-4 duration-500">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs uppercase font-black tracking-widest text-primary flex items-center gap-2">
                                        <Zap className="h-4 w-4" /> Studio Refinement Tools
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-4 text-left">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] uppercase font-black text-muted-foreground">Output Background Mode</Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: 'transparent', label: 'None', icon: Scissors },
                                                { id: 'color', label: 'Color', icon: Palette },
                                                { id: 'blur', label: 'Blur', icon: Layers }
                                            ].map(mode => (
                                                <Button 
                                                    key={mode.id}
                                                    variant={bgMode === mode.id ? 'default' : 'outline'}
                                                    onClick={() => setBgMode(mode.id as any)}
                                                    className="h-10 text-[10px] font-black uppercase flex flex-col gap-1 p-1 transition-all"
                                                >
                                                    <mode.icon className="h-3 w-3" />
                                                    {mode.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    {bgMode === 'color' && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                            <Label className="text-[10px] uppercase font-black text-muted-foreground">Custom Color Picker</Label>
                                            <div className="flex gap-2 items-center">
                                                <Input type="color" value={solidColor} onChange={e => setSolidColor(e.target.value)} className="w-12 h-10 p-1 bg-muted border-border rounded-lg" />
                                                <Input type="text" value={solidColor} onChange={e => setSolidColor(e.target.value)} className="flex-1 h-10 text-xs font-mono uppercase bg-muted border-border" />
                                            </div>
                                        </div>
                                    )}

                                    {bgMode === 'blur' && (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                            <div className="flex justify-between">
                                                <Label className="text-[10px] uppercase font-black text-muted-foreground">Blur Intensity</Label>
                                                <span className="text-[10px] font-bold text-primary">{blurAmount}px</span>
                                            </div>
                                            <Slider value={[blurAmount]} onValueChange={v => setBlurAmount(v[0])} max={50} min={0} step={1} />
                                        </div>
                                    )}

                                    <div className="space-y-4 pt-4 border-t border-border">
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <Label className="text-[10px] uppercase font-black text-muted-foreground">Edge Smoothing</Label>
                                                <span className="text-[10px] font-bold text-primary">{edgeFeather}px</span>
                                            </div>
                                            <Slider value={[edgeFeather]} onValueChange={v => setEdgeFeather(v[0])} max={10} min={0} step={0.5} />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <Label className="text-[10px] uppercase font-black text-muted-foreground">Brightness Balance</Label>
                                                <span className="text-[10px] font-bold text-primary">{brightness}%</span>
                                            </div>
                                            <Slider value={[brightness]} onValueChange={v => setBrightness(v[0])} max={150} min={50} step={1} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="glass-card border-border shadow-2xl animate-in fade-in slide-in-from-left-4 duration-700">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs uppercase font-black tracking-widest text-primary flex items-center gap-2">
                                        <Settings className="h-4 w-4" /> Export Architecture
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-4 text-left">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] uppercase font-black text-muted-foreground flex items-center gap-2"><FileImage className="h-3 w-3" /> Output Format</Label>
                                        <Select value={exportFormat} onValueChange={(val: any) => setExportFormat(val)}>
                                            <SelectTrigger className="bg-muted border-border h-10 text-xs rounded-lg">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-popover border-border">
                                                <SelectItem value="png">PNG (Best for Transparency)</SelectItem>
                                                <SelectItem value="jpg">JPG (Smaller Size)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[9px] uppercase font-bold text-muted-foreground flex items-center gap-1"><MoveHorizontal className="h-3 w-3"/> Width (px)</Label>
                                            <Input 
                                                type="number" 
                                                value={customWidth} 
                                                onChange={e => handleWidthChange(parseInt(e.target.value))} 
                                                className="bg-muted border-border rounded-lg h-10 font-bold text-primary"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[9px] uppercase font-bold text-muted-foreground flex items-center gap-1"><MoveVertical className="h-3 w-3"/> Height (px)</Label>
                                            <Input 
                                                type="number" 
                                                value={customHeight} 
                                                onChange={e => handleHeightChange(parseInt(e.target.value))} 
                                                className="bg-muted border-border rounded-lg h-10 font-bold text-primary"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {isAspectRatioLocked ? <Lock className="h-3 w-3 text-primary"/> : <Unlock className="h-3 w-3 text-zinc-600"/>}
                                            <span className="text-[9px] font-black uppercase text-muted-foreground">Lock Aspect Ratio</span>
                                        </div>
                                        <Switch checked={isAspectRatioLocked} onCheckedChange={setIsAspectRatioLocked} />
                                    </div>

                                    {originalDimensions && (
                                        <div className="pt-2">
                                            <p className="text-[9px] text-muted-foreground font-bold uppercase flex items-center gap-2">
                                                <Maximize className="h-3 w-3" /> Original: {originalDimensions.width}x{originalDimensions.height}px
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-8">
                    {!originalImage ? (
                        <div className="flex flex-col items-center justify-center min-h-[500px] border-2 border-dashed border-border rounded-[3rem] text-center p-8 bg-muted/20">
                            <div className="p-8 bg-muted rounded-full mb-6 ring-1 ring-border shadow-2xl">
                                <ImageIcon className="h-20 w-20 text-muted-foreground" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-widest text-muted-foreground italic">Studio Canvas</h3>
                            <p className="text-muted-foreground mt-2 text-sm font-bold uppercase tracking-widest">Awaiting high-res input</p>
                        </div>
                    ) : (
                         <div className="space-y-6">
                            <div className="flex justify-center mb-4">
                                <div className="bg-muted/80 p-1.5 rounded-2xl border border-border flex gap-2 backdrop-blur-3xl shadow-2xl">
                                    <Button 
                                        variant={viewMode === 'studio' ? 'default' : 'ghost'} 
                                        onClick={() => setViewMode('studio')}
                                        className="h-10 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2"
                                    >
                                        <Eye className="h-3.5 w-3.5" /> Studio View
                                    </Button>
                                    <Button 
                                        variant={viewMode === 'compare' ? 'default' : 'ghost'} 
                                        onClick={() => setViewMode('compare')}
                                        disabled={!processedImage}
                                        className="h-10 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2"
                                    >
                                        <Columns className="h-3.5 w-3.5" /> Before/After
                                    </Button>
                                </div>
                            </div>

                            <div className="relative rounded-[3rem] overflow-hidden border-4 border-white shadow-[0_50px_100px_rgba(0,0,0,0.1)] dark:shadow-[0_50px_100px_rgba(0,0,0,0.8)] bg-muted min-h-[500px] flex items-center justify-center">
                                {isLoading ? (
                                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center space-y-6 bg-black/60 backdrop-blur-sm">
                                        <div className="relative">
                                            <Loader2 className="h-24 w-24 animate-spin text-primary" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <ImageIcon className="h-10 w-10 text-primary animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="text-center space-y-2">
                                            <p className="text-xl font-black uppercase tracking-[0.2em] italic text-primary">Neural Segmentation</p>
                                            <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-[0.3em]">Processing RAW Image Data...</p>
                                        </div>
                                    </div>
                                ) : null}

                                {processedImage && viewMode === 'compare' ? (
                                    <div className="w-full h-full min-h-[500px]">
                                        <BeforeAfterSlider 
                                            before={
                                                <div className="relative w-full h-full">
                                                    <img src={originalImage} alt="Original" className="w-full h-full object-contain" />
                                                </div>
                                            }
                                            after={
                                                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                                                    {/* Background Layer */}
                                                    <div 
                                                        className="absolute inset-0 z-0"
                                                        style={{ 
                                                            backgroundColor: bgMode === 'color' ? solidColor : 'transparent',
                                                            backgroundImage: bgMode === 'blur' ? `url(${originalImage})` : 'none',
                                                            backgroundSize: 'cover',
                                                            backgroundPosition: 'center',
                                                            filter: bgMode === 'blur' ? `blur(${blurAmount}px) brightness(0.8)` : 'none',
                                                            transform: bgMode === 'blur' ? 'scale(1.1)' : 'none'
                                                        }}
                                                    />
                                                    
                                                    {/* Subject Layer */}
                                                    <div 
                                                        className="relative z-10 w-full h-full flex items-center justify-center p-4"
                                                        style={{ 
                                                            filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                                                        }}
                                                    >
                                                        <img src={processedImage} alt="Subject" className="max-w-full max-h-[600px] object-contain drop-shadow-2xl" />
                                                    </div>
                                                </div>
                                            }
                                        />
                                    </div>
                                ) : processedImage ? (
                                    <div ref={resultRef} className="relative w-full h-full min-h-[500px] flex items-center justify-center overflow-hidden">
                                        {/* Background Layer */}
                                        <div 
                                            className="absolute inset-0 z-0 transition-all duration-500"
                                            style={{ 
                                                backgroundColor: bgMode === 'color' ? solidColor : 'transparent',
                                                backgroundImage: bgMode === 'blur' ? `url(${originalImage})` : 'none',
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                filter: bgMode === 'blur' ? `blur(${blurAmount}px) brightness(0.8)` : 'none',
                                                transform: bgMode === 'blur' ? 'scale(1.1)' : 'none'
                                            }}
                                        />
                                        
                                        {/* Subject Layer */}
                                        <div 
                                            className="relative z-10 w-full h-full flex items-center justify-center p-4 transition-all duration-300"
                                            style={{ 
                                                filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                                            }}
                                        >
                                            <img src={processedImage} alt="Subject" className="max-w-full max-h-[600px] object-contain drop-shadow-2xl" />
                                        </div>

                                        {bgMode === 'transparent' && (
                                            <div className="absolute inset-0 -z-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                                        )}
                                    </div>
                                ) : (
                                    <div className="relative w-full aspect-video p-4">
                                        {originalImage && <img src={originalImage} alt="Uploaded preview" className="w-full h-full object-contain opacity-50 blur-[2px]" />}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Badge className="bg-primary text-primary-foreground font-black uppercase px-6 py-2 rounded-full tracking-widest shadow-2xl">Preparing AI Studio...</Badge>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {processedImage && !isLoading && (
                                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in slide-in-from-bottom-4 duration-500">
                                    <Button onClick={handleDownload} size="lg" className="h-16 px-12 text-xl font-black uppercase tracking-[0.2em] gradient-button-gold rounded-2xl shadow-2xl shadow-primary/20 group">
                                        <Download className="mr-3 h-6 w-6 group-hover:translate-y-1 transition-transform" /> 
                                        Save as {exportFormat.toUpperCase()} ({customWidth}x{customHeight})
                                    </Button>
                                    <Button onClick={handleReprocess} variant="outline" className="h-16 px-8 text-sm font-black uppercase border-border hover:bg-accent rounded-2xl transition-all">
                                        <RefreshCw className="mr-2 h-4 w-4"/> Start New Edit
                                    </Button>
                                </div>
                            )}
                         </div>
                    )}
                </div>
            </div>

            <section className="mt-24 py-20 border-t border-border">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter mb-4">Studio Intelligence</h2>
                    <p className="text-muted-foreground font-bold uppercase tracking-[0.3em] text-xs">Dynamic Resolution Processing Engine</p>
                </div>
                <div className="grid md:grid-cols-3 gap-12 text-left">
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center ring-1 ring-primary/20">
                            <Scissors className="text-primary h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-black uppercase">Adaptive Resolution</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">Unlike basic tools, our studio calculates pixel-perfect composites at any resolution you specify, maintaining razor-sharp edges even at 4K and beyond.</p>
                    </div>
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center ring-1 ring-primary/20">
                            <Layers className="text-primary h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-black uppercase">Composite Rendering</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">When applying blur or custom colors, the system uses GPU-accelerated canvas rendering to ensure every filter is applied consistently at your target output size.</p>
                    </div>
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center ring-1 ring-primary/20">
                            <Palette className="text-primary h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-black uppercase">Aspect Protection</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">Maintain the structural integrity of your photos with our intelligent aspect ratio lock, preventing distortion while resizing for different platform requirements.</p>
                    </div>
                </div>
            </section>
        </main>
        <LandingFooter onNavigate={handleNavigate} />
        {isLoading && !originalImage && <ProcessingOverlay message="Neural Segmentation in Progress..." />}
    </div>
  );
}