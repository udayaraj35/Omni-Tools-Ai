'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { useRouter } from 'next/navigation';
import { 
    ArrowLeft, Download, QrCode as QrIcon, Palette, 
    Sparkles, Globe, Link as LinkIcon, Instagram, 
    Facebook, Phone, Mail, Youtube, Twitter, 
    Plus, Trash2, Layout, Image as ImageIcon, 
    Loader2, CheckCircle2, ShieldCheck, Zap, 
    Settings2, RefreshCw, Layers, Coffee, Share2, X, Heart, User, Contact,
    Wifi, Lock, Unlock, Shield, Atom, Star, Grid, Send, Bot, MessageSquare, Flower2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ContactDialog } from '@/components/ui/contact-dialog';
import { Switch } from '@/components/ui/switch';
import { editQrWithAiAction } from '@/app/actions';
import { ProcessingOverlay } from '@/components/ui/processing-overlay';

const patterns = [
    { id: 'square', name: 'Standard Square', icon: Layout },
    { id: 'dots', name: 'Digital Dots', icon: Sparkles },
    { id: 'rounded', name: 'Modern Rounded', icon: RefreshCw },
    { id: 'lotus', name: 'Lotus (कमल)', icon: Flower2, isFloral: true },
    { id: 'rhododendron', name: 'Laligurans (गुराँस)', icon: Flower2, isFloral: true },
    { id: 'blossom', name: 'Blossom (फूल)', icon: Flower2, isFloral: true },
    { id: 'arc-reactor', name: 'Iron Man (Arc)', icon: Atom },
    { id: 'spider-man', name: 'Spider-Man', icon: Grid },
    { id: 'galaxy', name: 'Cosmic Galaxy', icon: Star },
    { id: 'mandala', name: 'Sacred Mandala', icon: Heart },
    { id: 'matrix', name: 'Digital Matrix', icon: Layers },
];

const socialPlatforms = [
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2', prefix: 'https://facebook.com/' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F', prefix: 'https://instagram.com/' },
    { id: 'whatsapp', name: 'WhatsApp', icon: Phone, color: '#25D366', prefix: 'https://wa.me/' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000', prefix: 'https://youtube.com/' },
    { id: 'twitter', name: 'Twitter (X)', icon: Twitter, color: '#000000', prefix: 'https://twitter.com/' },
    { id: 'website', name: 'Website', icon: Globe, color: '#00e5ff', prefix: 'https://' },
    { id: 'email', name: 'Email', icon: Mail, color: '#EA4335', prefix: 'mailto:' },
];

export default function QrStudioPage() {
    const router = useRouter();
    const { toast } = useToast();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    // Content State
    const [qrType, setQrType] = useState<'url' | 'multilink' | 'wifi'>('url');
    const [url, setUrl] = useState('https://omnitoolsai.fun');
    const [multiLinks, setMultiLinks] = useState<{ id: string, platformId: string, url: string }[]>([
        { id: '1', platformId: 'facebook', url: '' }
    ]);

    // WiFi State
    const [wifiSsid, setWifiSsid] = useState('');
    const [wifiPassword, setWifiPassword] = useState('');
    const [wifiEncryption, setWifiEncryption] = useState('WPA');
    const [showWifiPassword, setShowWifiPassword] = useState(false);

    // Branding State
    const [enableBranding, setEnableBranding] = useState(false);
    const [brandName, setBrandName] = useState('');
    const [brandPhone, setBrandPhone] = useState('');
    const [brandPhoto, setBrandPhoto] = useState<string | null>(null);

    const [isGenerating, setIsGenerating] = useState(false);
    const [showContactDialog, setShowContactDialog] = useState(false);
    
    // Design State
    const [fgColor, setFgColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#FFFFFF');
    const [pattern, setPattern] = useState('square');
    const [qrSize, setQrSize] = useState(1000);
    const [logo, setLogo] = useState<string | null>(null);
    const [logoSize, setLogoSize] = useState(20);

    // AI Assistant State
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [isAiProcessing, setIsAiProcessing] = useState(false);

    const generateQR = useCallback(async () => {
        const { default: QRCode } = await import('qrcode');
        if (!canvasRef.current) return;

        setIsGenerating(true);
        try {
            let data = url;
            if (qrType === 'multilink') {
                data = `BEGIN:VCARD\nVERSION:3.0\nFN:${brandName || 'Omni User'}\nTEL:${brandPhone}\n`;
                multiLinks.forEach(link => {
                    const platform = socialPlatforms.find(p => p.id === link.platformId);
                    if (link.url) {
                        const finalUrl = link.url.startsWith('http') ? link.url : `${platform?.prefix || ''}${link.url}`;
                        data += `URL;type=${platform?.name || 'Link'}:${finalUrl}\n`;
                    }
                });
                data += `END:VCARD`;
            } else if (qrType === 'wifi') {
                data = `WIFI:S:${wifiSsid};T:${wifiEncryption};P:${wifiPassword};;`;
            }

            const qr = QRCode.create(data, { errorCorrectionLevel: 'H' });
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const modules = qr.modules;
            const count = modules.size;
            const cellSize = qrSize / count;
            
            const footerHeight = enableBranding ? 250 : 0;
            canvas.width = qrSize;
            canvas.height = qrSize + footerHeight;

            // 1. Draw Background
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 2. Draw Modules
            ctx.fillStyle = fgColor;
            for (let row = 0; row < count; row++) {
                for (let col = 0; col < count; col++) {
                    const isDark = modules.get(row, col);
                    if (!isDark) continue;

                    const x = col * cellSize;
                    const y = row * cellSize;
                    const w = cellSize;
                    const h = cellSize;

                    // Eyes (Control Squares) protection
                    const isEye = (row < 7 && col < 7) || (row < 7 && col > count - 8) || (row > count - 8 && col < 7);
                    
                    let isProtected = false;
                    if (logo) {
                        const logoPercent = (logoSize + 5) / 100;
                        const centerStart = (count * (1 - logoPercent)) / 2;
                        const centerEnd = centerStart + count * logoPercent;
                        if (row > centerStart && row < centerEnd && col > centerStart && col < centerEnd) isProtected = true;
                    }

                    if (isEye) {
                        ctx.fillStyle = fgColor;
                        ctx.fillRect(x, y, w - 0.5, h - 0.5);
                        continue;
                    }

                    if (isProtected) continue;

                    ctx.beginPath();
                    
                    // PROCEDURAL DRAWING ENGINE
                    if (pattern === 'dots') {
                        ctx.arc(x + w / 2, y + h / 2, w / 2.2, 0, Math.PI * 2);
                        ctx.fill();
                    } else if (pattern === 'rounded') {
                        const r = w * 0.4;
                        ctx.roundRect(x, y, w - 0.5, h - 0.5, r);
                        ctx.fill();
                    } else if (pattern === 'lotus') {
                        // Procedural Lotus
                        const cx = x + w/2;
                        const cy = y + h/2;
                        const r = w/2.2;
                        for(let i=0; i<6; i++) {
                            const angle = (i * Math.PI * 2) / 6;
                            ctx.moveTo(cx, cy);
                            ctx.ellipse(cx + Math.cos(angle)*r/2, cy + Math.sin(angle)*r/2, r/2, r/4, angle, 0, Math.PI*2);
                        }
                        ctx.fill();
                    } else if (pattern === 'rhododendron') {
                        // Procedural Laligurans
                        const cx = x + w/2;
                        const cy = y + h/2;
                        const r = w/4;
                        ctx.arc(cx, cy, r, 0, Math.PI*2);
                        ctx.arc(cx - r, cy - r, r*0.8, 0, Math.PI*2);
                        ctx.arc(cx + r, cy - r, r*0.8, 0, Math.PI*2);
                        ctx.arc(cx - r, cy + r, r*0.8, 0, Math.PI*2);
                        ctx.arc(cx + r, cy + r, r*0.8, 0, Math.PI*2);
                        ctx.fill();
                    } else if (pattern === 'blossom') {
                        // Modern cherry blossom
                        const cx = x + w/2;
                        const cy = y + h/2;
                        const r = w/2.2;
                        for(let i=0; i<5; i++) {
                            const angle = (i * Math.PI * 2) / 5;
                            ctx.moveTo(cx, cy);
                            ctx.bezierCurveTo(cx, cy, cx + Math.cos(angle - 0.5)*r, cy + Math.sin(angle - 0.5)*r, cx + Math.cos(angle)*r, cy + Math.sin(angle)*r);
                            ctx.bezierCurveTo(cx + Math.cos(angle)*r, cy + Math.sin(angle)*r, cx + Math.cos(angle + 0.5)*r, cy + Math.sin(angle + 0.5)*r, cx, cy);
                        }
                        ctx.fill();
                    } else if (pattern === 'arc-reactor') {
                        ctx.arc(x + w / 2, y + h / 2, w / 2.2, 0, Math.PI * 2);
                        ctx.lineWidth = w/5;
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.arc(x + w / 2, y + h / 2, w / 5, 0, Math.PI * 2);
                        ctx.fill();
                    } else if (pattern === 'spider-man') {
                        ctx.moveTo(x + w/2, y);
                        ctx.lineTo(x + w, y + h/2);
                        ctx.lineTo(x + w/2, y + h);
                        ctx.lineTo(x, y + h/2);
                        ctx.closePath();
                        ctx.fill();
                        ctx.fillRect(x + w/2.5, y + h/2.5, w/5, h/5);
                    } else if (pattern === 'mandala') {
                        ctx.arc(x + w / 2, y + h / 2, w / 2.5, 0, Math.PI * 2);
                        ctx.arc(x + w / 2, y + h / 2, w / 4, 0, Math.PI * 2);
                        ctx.fill('evenodd');
                    } else if (pattern === 'matrix') {
                        ctx.roundRect(x + w*0.2, y, w*0.6, h, w*0.3);
                        ctx.fill();
                    } else if (pattern === 'galaxy') {
                        const cx = x + w/2;
                        const cy = y + h/2;
                        ctx.moveTo(cx, y);
                        ctx.lineTo(cx + w/6, cy - h/6);
                        ctx.lineTo(x + w, cy);
                        ctx.lineTo(cx + w/6, cy + h/6);
                        ctx.lineTo(cx, y + h);
                        ctx.lineTo(cx - w/6, cy + h/6);
                        ctx.lineTo(x, cy);
                        ctx.lineTo(cx - w/6, cy - h/6);
                        ctx.closePath();
                        ctx.fill();
                    } else {
                        ctx.fillRect(x, y, w - 0.5, h - 0.5);
                    }
                }
            }

            // 3. Draw Center Logo
            if (logo) {
                const img = new window.Image();
                img.crossOrigin = "anonymous";
                img.onload = () => {
                    const size = (qrSize * logoSize) / 100;
                    const lx = (qrSize - size) / 2;
                    const ly = (qrSize - size) / 2;
                    ctx.fillStyle = bgColor;
                    ctx.beginPath();
                    const padding = 15;
                    ctx.roundRect(lx - padding, ly - padding, size + padding * 2, size + padding * 2, 20);
                    ctx.fill();
                    ctx.drawImage(img, lx, ly, size, size);
                };
                img.src = logo;
            }

            // 4. Draw Branding Footer
            if (enableBranding) {
                ctx.fillStyle = fgColor;
                ctx.textAlign = 'center';
                ctx.globalAlpha = 0.1;
                ctx.fillRect(100, qrSize, qrSize - 200, 2);
                ctx.globalAlpha = 1.0;
                ctx.font = `bold 48px Arial`;
                ctx.fillText(brandName.toUpperCase() || 'YOUR NAME', qrSize / 2, qrSize + 100);
                ctx.font = `32px Arial`;
                ctx.fillStyle = fgColor + 'CC';
                ctx.fillText(brandPhone || 'PHONE NUMBER', qrSize / 2, qrSize + 160);

                if (brandPhoto) {
                    const pImg = new window.Image();
                    pImg.crossOrigin = "anonymous";
                    pImg.onload = () => {
                        const pSize = 140;
                        const px = 80;
                        const py = qrSize + 50;
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(px + pSize/2, py + pSize/2, pSize/2, 0, Math.PI * 2);
                        ctx.clip();
                        ctx.drawImage(pImg, px, py, pSize, pSize);
                        ctx.restore();
                    };
                    pImg.src = brandPhoto;
                }
            }

        } catch (err) {
            console.error(err);
            toast({ variant: 'destructive', title: 'Generation Failed' });
        } finally {
            setIsGenerating(false);
        }
    }, [fgColor, bgColor, qrSize, logo, logoSize, pattern, qrType, url, multiLinks, wifiSsid, wifiPassword, wifiEncryption, brandName, brandPhone, brandPhoto, enableBranding, toast]);

    useEffect(() => {
        const timer = setTimeout(generateQR, 500);
        return () => clearTimeout(timer);
    }, [generateQR]);

    const handleNavigate = (path: string) => {
        if (path.startsWith('/')) router.push(path);
        else router.push(`/#${path}`);
    };

    const applyAiMagic = async (instruction?: string) => {
        setIsAiProcessing(true);
        const finalInstruction = instruction || "Suggest a random premium professional and creative style for this QR code. Pick a cool pattern and high-contrast colors.";
        
        if (instruction) {
            setChatHistory(prev => [...prev, { role: 'user', content: instruction }]);
        }

        try {
            const result = await editQrWithAiAction({
                instruction: finalInstruction,
                currentState: {
                    pattern,
                    fgColor,
                    bgColor,
                    logoSize,
                    enableBranding
                }
            });

            if ('error' in result) throw new Error(result.error);

            if (result.updatedSettings) {
                if (result.updatedSettings.pattern) setPattern(result.updatedSettings.pattern);
                if (result.updatedSettings.fgColor) setFgColor(result.updatedSettings.fgColor);
                if (result.updatedSettings.bgColor) setBgColor(result.updatedSettings.bgColor);
                if (result.updatedSettings.logoSize) setLogoSize(result.updatedSettings.logoSize);
                if (typeof result.updatedSettings.enableBranding === 'boolean') setEnableBranding(result.updatedSettings.enableBranding);
            }

            if (result.aiResponse) {
                setChatHistory(prev => [...prev, { role: 'assistant', content: result.aiResponse }]);
            }
            
            toast({ title: "AI Design Applied!" });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "AI Assistant Failed", description: error.message });
        } finally {
            setIsAiProcessing(false);
            setChatInput('');
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setLogo(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleBrandPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setBrandPhoto(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const addLink = () => {
        setMultiLinks([...multiLinks, { id: Date.now().toString(), platformId: 'website', url: '' }]);
    };

    const updateLink = (id: string, field: 'platformId' | 'url', value: string) => {
        setMultiLinks(multiLinks.map(l => l.id === id ? { ...l, [field]: value } : l));
    };

    const deleteLink = (id: string) => {
        setMultiLinks(multiLinks.filter(l => l.id !== id));
    };

    const downloadQR = () => {
        if (!canvasRef.current) return;
        const link = document.createElement('a');
        link.download = `OmniTools-QR-Studio-${Date.now()}.png`;
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
        toast({ title: "QR Code Exported!" });
    };

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Navbar onNavigate={handleNavigate} />
            <main className="flex-1 container mx-auto py-8 px-4 md:px-10">
                <button onClick={() => router.push('/')} className="animated-border-card inline-block mb-6">
                    <span className={cn("inner-span flex items-center back-to-home-button")}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                    </span>
                </button>

                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-7xl font-black tracking-tight text-glow-primary font-headline uppercase italic leading-none px-4 py-2">QR Studio Pro</h1>
                    <p className="text-muted-foreground font-bold uppercase tracking-[0.4em] text-[10px] mt-4">Floral Patterns • Superhero Designs • Multi-Link Hub</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* CONTROL PANEL */}
                    <div className="lg:col-span-5 space-y-6">
                        <Card className="glass-card border-border rounded-[2.5rem] overflow-hidden shadow-2xl p-1">
                            <CardHeader className="bg-muted/30 border-b border-border p-8 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-3">
                                    <Settings2 className="w-4 h-4" /> Studio Designer
                                </CardTitle>
                                <Button onClick={() => applyAiMagic()} disabled={isAiProcessing} variant="outline" className="h-10 rounded-xl border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 gap-2 font-black uppercase text-[10px] tracking-widest">
                                    {isAiProcessing ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3" />} AI Magic
                                </Button>
                            </CardHeader>
                            <CardContent className="p-8">
                                <Tabs defaultValue="content" className="w-full">
                                    <TabsList className="grid w-full grid-cols-4 bg-zinc-900 h-14 p-1 rounded-2xl mb-8">
                                        <TabsTrigger value="content" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black font-black uppercase text-[10px] gap-2"><LinkIcon className="w-3.5 h-3.5" /> Data</TabsTrigger>
                                        <TabsTrigger value="design" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black font-black uppercase text-[10px] gap-2"><Palette className="w-3.5 h-3.5" /> Style</TabsTrigger>
                                        <TabsTrigger value="branding" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black font-black uppercase text-[10px] gap-2"><User className="w-3.5 h-3.5" /> Brand</TabsTrigger>
                                        <TabsTrigger value="logo" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black font-black uppercase text-[10px] gap-2"><ImageIcon className="w-3.5 h-3.5" /> Logo</TabsTrigger>
                                    </TabsList>

                                    <ScrollArea className="h-[50vh] pr-4 text-left">
                                        <TabsContent value="content" className="space-y-8 mt-0">
                                            <div className="space-y-4">
                                                <Label className="text-[10px] font-black uppercase text-zinc-500">QR Content Type</Label>
                                                <div className="grid grid-cols-3 gap-2 bg-muted p-1 rounded-xl">
                                                    <Button variant={qrType === 'url' ? 'secondary' : 'ghost'} onClick={() => setQrType('url')} className="h-10 text-[9px] uppercase font-black px-1">URL</Button>
                                                    <Button variant={qrType === 'multilink' ? 'secondary' : 'ghost'} onClick={() => setQrType('multilink')} className="h-10 text-[9px] uppercase font-black px-1">Social Hub</Button>
                                                    <Button variant={qrType === 'wifi' ? 'secondary' : 'ghost'} onClick={() => setQrType('wifi')} className="h-10 text-[9px] uppercase font-black px-1 gap-1"><Wifi className="w-3 h-3"/> WiFi</Button>
                                                </div>
                                            </div>

                                            {qrType === 'url' && (
                                                <div className="space-y-4 animate-in fade-in">
                                                    <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Target URL (लिङ्क राख्नुहोस्)</Label>
                                                    <div className="relative">
                                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                                        <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" className="h-14 bg-background border-border rounded-xl pl-12 font-bold" />
                                                    </div>
                                                </div>
                                            )}

                                            {qrType === 'multilink' && (
                                                <div className="space-y-6 animate-in fade-in">
                                                    <Label className="text-[10px] font-black uppercase text-zinc-500">Social Media & Links Hub</Label>
                                                    {multiLinks.map((link) => (
                                                        <div key={link.id} className="p-4 bg-muted/30 rounded-2xl border border-border space-y-3 relative group">
                                                            <div className="grid grid-cols-1 gap-3">
                                                                <Select value={link.platformId} onValueChange={v => updateLink(link.id, 'platformId', v)}>
                                                                    <SelectTrigger className="h-10 bg-background border-border rounded-lg text-xs font-bold">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="bg-popover border-border">
                                                                        {socialPlatforms.map(p => (
                                                                            <SelectItem key={p.id} value={p.id}>
                                                                                <div className="flex items-center gap-2">
                                                                                    <p.icon className="w-3.5 h-3.5" style={{ color: p.color }} />
                                                                                    <span>{p.name}</span>
                                                                                </div>
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <Input 
                                                                    value={link.url} 
                                                                    onChange={e => updateLink(link.id, 'url', e.target.value)} 
                                                                    placeholder={`Enter ${socialPlatforms.find(p => p.id === link.platformId)?.name} link or ID`} 
                                                                    className="h-10 bg-background text-xs" 
                                                                />
                                                            </div>
                                                            <Button size="icon" variant="ghost" className="absolute -top-2 -right-2 h-6 w-6 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteLink(link.id)}><Trash2 className="w-3 h-3"/></Button>
                                                        </div>
                                                    ))}
                                                    <Button variant="outline" className="w-full h-12 border-dashed rounded-xl font-black uppercase text-[10px]" onClick={addLink}>
                                                        <Plus className="w-4 h-4 mr-2" /> Add Platform Node
                                                    </Button>
                                                </div>
                                            )}

                                            {qrType === 'wifi' && (
                                                <div className="space-y-6 animate-in fade-in">
                                                    <div className="space-y-4">
                                                        <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2"><Wifi className="w-3 h-3 text-primary"/> Network SSID</Label>
                                                        <Input value={wifiSsid} onChange={e => setWifiSsid(e.target.value)} placeholder="e.g. MyHomeNetwork" className="h-14 bg-background border-border rounded-xl font-bold" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2"><Lock className="w-3 h-3 text-primary"/> Password</Label>
                                                        <div className="relative">
                                                            <Input type={showWifiPassword ? "text" : "password"} value={wifiPassword} onChange={e => setWifiPassword(e.target.value)} placeholder="Enter network password" className="h-14 bg-background border-border rounded-xl font-bold pr-12" />
                                                            <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setShowWifiPassword(!showWifiPassword)}>
                                                                {showWifiPassword ? <Unlock className="w-4 h-4"/> : <Lock className="w-4 h-4"/>}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2"><Shield className="w-3 h-3 text-primary"/> Encryption Type</Label>
                                                        <Select value={wifiEncryption} onValueChange={setWifiEncryption}>
                                                            <SelectTrigger className="h-12 bg-background border-border rounded-xl">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-popover border-border">
                                                                <SelectItem value="WPA">WPA / WPA2 (Default)</SelectItem>
                                                                <SelectItem value="WEP">WEP</SelectItem>
                                                                <SelectItem value="nopass">None (Open Network)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            )}
                                        </TabsContent>

                                        <TabsContent value="design" className="space-y-8 mt-0">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black uppercase text-zinc-500">Pattern Color</Label>
                                                    <div className="flex gap-2 items-center">
                                                        <Input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} className="w-12 h-12 p-1 rounded-xl cursor-pointer" />
                                                        <Input value={fgColor} onChange={e => setFgColor(e.target.value)} className="flex-1 h-12 font-mono text-xs uppercase" />
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black uppercase text-zinc-500">Background</Label>
                                                    <div className="flex gap-2 items-center">
                                                        <Input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-12 h-12 p-1 rounded-xl cursor-pointer" />
                                                        <Input value={bgColor} onChange={e => setBgColor(e.target.value)} className="flex-1 h-12 font-mono text-xs uppercase" />
                                                    </div>
                                                </div>
                                            </div>
                                            <Separator className="bg-border" />
                                            <div className="space-y-4">
                                                <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Buta Pattern (बुट्टाको प्रकार)</Label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {patterns.map(p => (
                                                        <Button 
                                                            key={p.id} 
                                                            variant={pattern === p.id ? 'default' : 'outline'} 
                                                            onClick={() => setPattern(p.id)} 
                                                            className={cn(
                                                                "h-16 text-[9px] uppercase font-black border-border rounded-xl flex flex-col gap-1 items-center justify-center py-2 transition-all",
                                                                pattern === p.id ? "bg-primary text-black ring-2 ring-primary/20" : "hover:border-primary/50"
                                                            )}
                                                        >
                                                            <p.icon className={cn("w-4 h-4 mb-0.5", p.isFloral && "text-pink-500")} />
                                                            <span className="leading-none text-center px-1">{p.name}</span>
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="branding" className="space-y-8 mt-0">
                                            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/20">
                                                <div className="flex items-center gap-3">
                                                    <Layout className="w-5 h-5 text-primary" />
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-foreground">Add Branding Footer</p>
                                                        <p className="text-[8px] font-bold text-muted-foreground uppercase">Embed name & photo on image</p>
                                                    </div>
                                                </div>
                                                <Switch checked={enableBranding} onCheckedChange={setEnableBranding} />
                                            </div>
                                            <div className={cn("space-y-6 transition-all", !enableBranding && "opacity-30 pointer-events-none")}>
                                                <div className="space-y-4"><Label className="text-[10px] font-black uppercase text-zinc-500">Display Name</Label><Input value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="Full Name or Business Name" className="h-12 rounded-xl font-bold" /></div>
                                                <div className="space-y-4"><Label className="text-[10px] font-black uppercase text-zinc-500">Phone Number</Label><Input value={brandPhone} onChange={e => setBrandPhone(e.target.value)} placeholder="+977 9864353535" className="h-12 rounded-xl font-bold" /></div>
                                                <div className="space-y-4"><Label className="text-[10px] font-black uppercase text-zinc-500">Profile Photo</Label><div className="p-6 border-2 border-dashed border-border rounded-2xl text-center">{!brandPhoto ? (<label className="cursor-pointer"><ImageIcon className="w-8 h-8 mx-auto text-zinc-500 mb-2" /><p className="text-[9px] font-black uppercase text-zinc-500">Upload Photo</p><input type="file" accept="image/*" onChange={handleBrandPhotoUpload} className="hidden" /></label>) : (<div className="relative w-16 h-16 mx-auto"><img src={brandPhoto} alt="Profile" className="w-full h-full object-cover rounded-full border-2 border-primary" /><Button size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-3 h-3 rounded-full" onClick={() => setBrandPhoto(null)}><X className="w-3 h-3"/></Button></div>)}</div></div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="logo" className="space-y-8 mt-0">
                                            <div className="p-8 border-2 border-dashed border-border rounded-[2rem] bg-muted/20 text-center space-y-4 group hover:border-primary transition-all">
                                                {!logo ? (
                                                    <label className="cursor-pointer block">
                                                        <ImageIcon className="w-12 h-12 mx-auto text-zinc-500 mb-4 group-hover:scale-110 transition-transform" />
                                                        <p className="text-xs font-black uppercase text-zinc-500">Center Brand Logo</p>
                                                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                                    </label>
                                                ) : (
                                                    <div className="relative w-24 h-24 mx-auto bg-white p-2 rounded-2xl shadow-xl">
                                                        <img src={logo} alt="Logo Preview" className="w-full h-full object-contain" />
                                                        <Button size="icon" variant="destructive" className="absolute -top-3 -right-3 h-8 w-8 rounded-full" onClick={() => setLogo(null)}><X className="w-4 h-4"/></Button>
                                                    </div>
                                                )}
                                            </div>
                                            {logo && (
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-zinc-500"><span>Logo Size</span><span className="text-primary">{logoSize}%</span></div>
                                                    <Slider value={[logoSize]} onValueChange={v => setLogoSize(v[0])} max={30} min={10} step={1} />
                                                </div>
                                            )}
                                        </TabsContent>
                                    </ScrollArea>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    {/* PREVIEW STAGE & AI CHAT */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="w-full bg-muted/30 p-1.5 rounded-[3.5rem] border border-white/10 shadow-2xl backdrop-blur-xl relative">
                            <div className="absolute -top-4 -right-4 z-50">
                                <Badge className="bg-primary text-primary-foreground font-black uppercase px-6 py-2 rounded-full tracking-widest shadow-2xl">STUDIO HD ENGINE</Badge>
                            </div>
                            
                            <div className="flex flex-col items-center justify-center min-h-[500px] py-12 px-6">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-primary/20 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="p-8 bg-white rounded-[2.5rem] shadow-[0_80px_150px_rgba(0,0,0,0.1)] dark:shadow-[0_80px_150px_rgba(0,0,0,0.8)] relative z-10">
                                        <canvas ref={canvasRef} className="max-w-full h-auto w-[320px] md:w-[380px] rounded-sm" />
                                        {isGenerating && (
                                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 rounded-[2.5rem]">
                                                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                                                <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Rendering Pattern...</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                                    <Button onClick={downloadQR} size="lg" className="flex-1 h-12 text-xs font-black uppercase tracking-widest gradient-button-gold rounded-2xl shadow-xl group transition-all hover:scale-[1.02]">
                                        <Download className="mr-2 h-4 w-4 group-hover:translate-y-1 transition-transform" /> SAVE STUDIO PNG
                                    </Button>
                                    <Button variant="outline" className="flex-1 h-12 text-[9px] font-black uppercase tracking-widest border-border bg-card hover:bg-accent rounded-2xl gap-2 shadow-lg">
                                        <ShieldCheck className="w-4 h-4 text-primary" /> SCANNABLE 100%
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* AI STUDIO CHAT */}
                        <Card className="glass-card border-white/5 bg-zinc-900/40 rounded-[2.5rem] p-6 shadow-2xl flex flex-col h-[350px]">
                            <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                                <Bot className="w-4 h-4" /> AI Studio Assistant
                            </h3>
                            <ScrollArea className="flex-1 pr-4 mb-4 border border-white/5 rounded-2xl p-4 bg-black/20">
                                <div className="space-y-4 text-left">
                                    {chatHistory.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full opacity-30 py-10">
                                            <MessageSquare className="w-10 h-10 mb-4" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-center">डिजाइनर एआईसँग कुरा गर्नुहोस्...<br/>(e.g., "मलाई कमलको फूलको बुट्टामा बनाइदेऊ")</p>
                                        </div>
                                    ) : (
                                        chatHistory.map((msg, i) => (
                                            <div key={i} className={cn("flex flex-col max-w-[85%]", msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start')}>
                                                <div className={cn("px-4 py-2 rounded-2xl text-[11px] font-medium", msg.role === 'user' ? 'bg-primary text-black' : 'bg-zinc-800 text-white border border-white/5')}>{msg.content}</div>
                                            </div>
                                        ))
                                    )}
                                    {isAiProcessing && <div className="flex items-center gap-2 text-primary text-[9px] font-black uppercase tracking-widest"><Loader2 className="w-3 h-3 animate-spin"/> Redesigning...</div>}
                                </div>
                            </ScrollArea>
                            <form onSubmit={(e) => { e.preventDefault(); applyAiMagic(chatInput); }} className="flex gap-2">
                                <Input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Tell AI: 'Use lotus flower pattern', 'Make it Laligurans style'..." className="bg-zinc-950 border-white/10 h-12 rounded-xl text-xs" />
                                <Button type="submit" disabled={isAiProcessing || !chatInput.trim()} className="h-12 w-12 rounded-xl bg-primary text-black"><Send className="w-4 h-4"/></Button>
                            </form>
                        </Card>

                        <div className="w-full mt-10">
                            <Card className="glass-card border-primary/20 bg-primary/5 p-8 rounded-[3rem] text-center space-y-6">
                                <div className="flex justify-center"><div className="p-4 rounded-3xl bg-primary/10 text-primary border border-primary/20"><Coffee className="h-10 w-10 animate-float" /></div></div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black uppercase italic tracking-tight">Support Our Mission</h2>
                                    <p className="text-sm text-muted-foreground font-medium max-w-lg mx-auto">Help us keep these professional tools free for everyone. Your support powers our high-resolution AI nodes.</p>
                                </div>
                                <div className="flex flex-wrap justify-center gap-4">
                                    <Button onClick={() => setShowContactDialog(true)} className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest gradient-button-gold shadow-xl"><Heart className="mr-2 h-5 w-5 fill-current" /> Support OmniTools</Button>
                                    <Button variant="outline" className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest border-border hover:bg-muted"><Share2 className="mr-2 h-5 w-5" /> Share Studio</Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            <LandingFooter onNavigate={handleNavigate} />
            <ContactDialog open={showContactDialog} onOpenChange={setShowContactDialog} />
            {isAiProcessing && <ProcessingOverlay message="AI Designer is at Work..." />}
        </div>
    );
}
