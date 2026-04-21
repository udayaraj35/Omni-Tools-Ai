
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
    ArrowLeft, Search, Building2, Globe, ShieldCheck, 
    Copy, Check, RefreshCw, Landmark,
    Info, CreditCard, Banknote, AlertCircle,
    BookOpen, Send, Wallet, Layers, HelpCircle,
    ArrowRightLeft, ExternalLink, Zap, MapPin, FileText, ClipboardList
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { swiftDatabase, getCountries, getBanksByCountry, getAllCitiesByCountry, getBranchesByCity, findByBic, type SwiftRecord } from '@/lib/swift-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// --- Sub-Components ---

const BicStructureInfo = () => (
    <Card className="glass-card border-white/5 bg-zinc-900/40 overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-white/5">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" /> SWIFT/BIC Anatomy (ISO 9362)
            </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-4 gap-2 text-center">
                {[
                    { label: 'Bank', code: 'AAAA', desc: 'Institution', color: 'text-primary' },
                    { label: 'Country', code: 'BB', desc: 'ISO 3166', color: 'text-cyan-400' },
                    { label: 'Location', code: 'CC', desc: 'City/State', color: 'text-emerald-400' },
                    { label: 'Branch', code: 'DDD', desc: 'Optional', color: 'text-zinc-500' }
                ].map((part, i) => (
                    <div key={i} className="space-y-1">
                        <div className={cn("text-xl font-black font-mono tracking-tighter", part.color)}>{part.code}</div>
                        <div className="text-[10px] font-bold uppercase text-white/80">{part.label}</div>
                        <div className="text-[8px] uppercase text-zinc-500 tracking-tighter">{part.desc}</div>
                    </div>
                ))}
            </div>
            <div className="text-xs text-zinc-400 leading-relaxed space-y-2 border-t border-white/5 pt-4">
                <p>• <b>8 Characters:</b> Identifies the primary office of an institution.</p>
                <p>• <b>11 Characters:</b> Identifies a specific branch. 'XXX' is used for the head office.</p>
            </div>
        </CardContent>
    </Card>
);

const TransferInsights = () => (
    <Card className="glass-card border-amber-500/20 bg-amber-500/5 p-6 rounded-[2rem]">
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500">
                    <Info className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-amber-200">Transfer Insights</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                Most banks add a <span className="text-amber-400 font-bold">3% to 5% markup</span> on the mid-market exchange rate. When sending $1,000, you could be losing up to $50 in hidden fees.
            </p>
            <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 border-amber-500/30 text-amber-400 text-[10px] uppercase font-black tracking-widest h-10">Send Money</Button>
                <Button size="sm" variant="outline" className="flex-1 border-amber-500/30 text-amber-400 text-[10px] uppercase font-black tracking-widest h-10">Receive Money</Button>
            </div>
        </div>
    </Card>
);

export default function SwiftToolPage() {
    const router = useRouter();
    const { toast } = useToast();
    
    // Finder State
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedBank, setSelectedBank] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [branches, setBranches] = useState<SwiftRecord[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<SwiftRecord | null>(null);
    
    // Checker State
    const [checkInput, setCheckInput] = useState('');
    const [checkResult, setCheckResult] = useState<SwiftRecord | null>(null);
    const [checkError, setCheckError] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const countries = useMemo(() => getCountries(), []);
    const banks = useMemo(() => selectedCountry ? getBanksByCountry(selectedCountry) : [], [selectedCountry]);
    const cities = useMemo(() => selectedCountry ? getAllCitiesByCountry(selectedCountry) : [], [selectedCountry]);

    const handleCopy = (text: string, id: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast({ title: 'Copied to Clipboard!', description: 'Data formatted and copied.' });
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleCopyFullReport = (data: SwiftRecord, id: string) => {
        const text = `BIC/SWIFT: ${data.swiftCode}
BIC Code: ${data.swiftCode}
Bank Name: ${data.bank}
BIC: ${data.swiftCode}
Country: ${data.country} (${data.countryCode})
Bank Address: ${data.address}, ${data.city}`;
        
        handleCopy(text, id);
    };

    const handleBankChange = (bankName: string) => {
        setSelectedBank(bankName);
        setSelectedCity('');
        setBranches([]);
        setSelectedBranch(null);
    };

    const handleCityChange = (cityName: string) => {
        setSelectedCity(cityName);
        const results = getBranchesByCity(selectedCountry, selectedBank, cityName);
        setBranches(results);
        setSelectedBranch(results[0] || null);
    };

    const handleCheck = () => {
        setCheckError('');
        setCheckResult(null);
        const clean = checkInput.toUpperCase().replace(/[^A-Z0-9]/g, '');
        
        if (clean.length !== 8 && clean.length !== 11) {
            setCheckError('Invalid length. SWIFT must be 8 or 11 characters.');
            return;
        }

        const match = findByBic(clean);
        if (match) {
            setCheckResult(match);
            toast({ title: 'Verified', description: match.bank });
        } else {
            const isValidFormat = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(clean);
            if (isValidFormat) {
                setCheckError('Valid format, but bank not found in our database.');
            } else {
                setCheckError('Invalid BIC format.');
            }
        }
    };

    const handleNavigate = (path: string) => {
        if (path.startsWith('/')) router.push(path);
        else router.push(`/#${path}`);
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#05050a] text-zinc-100">
            <Navbar onNavigate={handleNavigate} />
            <main className="flex-1 container mx-auto py-8 px-4 max-w-6xl">
                <button onClick={() => router.push('/')} className="animated-border-card inline-block mb-6">
                    <span className={cn("inner-span flex items-center back-to-home-button")}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                    </span>
                </button>

                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-glow-primary font-headline uppercase italic leading-none">
                        Global SWIFT Hub
                    </h1>
                    <p className="mt-4 text-zinc-500 font-bold uppercase tracking-[0.4em] text-[10px]">
                        Professional Portal for BIC Verification & Global Bank Data
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* MAIN SEARCH AREA */}
                    <div className="lg:col-span-8 space-y-8">
                        <Tabs defaultValue="finder" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-zinc-900 border border-white/5 h-16 p-1 rounded-[1.2rem] mb-8 shadow-2xl">
                                <TabsTrigger value="finder" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black font-black uppercase text-xs tracking-widest gap-2">
                                    <Search className="w-4 h-4" /> SWIFT Finder
                                </TabsTrigger>
                                <TabsTrigger value="checker" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black font-black uppercase text-xs tracking-widest gap-2">
                                    <ShieldCheck className="w-4 h-4" /> SWIFT Checker
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="finder" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <Card className="glass-card border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">1. Select Country</Label>
                                            <Select value={selectedCountry} onValueChange={(v) => { setSelectedCountry(v); setSelectedBank(''); setSelectedCity(''); setBranches([]); setSelectedBranch(null); }}>
                                                <SelectTrigger className="h-14 bg-black/40 border-white/5 rounded-2xl"><SelectValue placeholder="Choose Country" /></SelectTrigger>
                                                <SelectContent className="bg-zinc-900 text-white border-white/10"><ScrollArea className="h-64">{countries.map(c => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}</ScrollArea></SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">2. Select Bank</Label>
                                            <Select value={selectedBank} onValueChange={handleBankChange} disabled={!selectedCountry}>
                                                <SelectTrigger className="h-14 bg-black/40 border-white/5 rounded-2xl"><SelectValue placeholder="Choose Bank" /></SelectTrigger>
                                                <SelectContent className="bg-zinc-900 text-white border-white/10"><ScrollArea className="h-64">{banks.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</ScrollArea></SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">3. Select City</Label>
                                            <Select value={selectedCity} onValueChange={handleCityChange} disabled={!selectedBank}>
                                                <SelectTrigger className="h-14 bg-black/40 border-white/5 rounded-2xl"><SelectValue placeholder="Choose City" /></SelectTrigger>
                                                <SelectContent className="bg-zinc-900 text-white border-white/10"><ScrollArea className="h-64">{cities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}</ScrollArea></SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {selectedBranch && (
                                        <div className="mt-10 animate-in zoom-in-95 duration-300">
                                            <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/20 relative overflow-hidden">
                                                <div className="absolute -right-10 -top-10 opacity-5">
                                                    <Landmark className="w-64 h-64" />
                                                </div>
                                                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                                    <div className="space-y-2">
                                                        <Badge className="bg-primary text-black font-black uppercase tracking-widest px-3 py-0.5">
                                                            {selectedBranch.branchCode === 'XXX' ? 'Primary Office' : 'Branch Office'}
                                                        </Badge>
                                                        <div className="flex items-center gap-2">
                                                            <h2 className="text-3xl font-black uppercase tracking-tighter italic">{selectedBranch.bank}</h2>
                                                            <Button size="icon" variant="ghost" className="h-6 w-6 text-zinc-500 hover:text-primary" onClick={() => handleCopy(selectedBranch.bank, 'finder-bank')}>
                                                                {copiedId === 'finder-bank' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                                            </Button>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-zinc-400 font-bold text-xs">
                                                            <MapPin className="w-3 h-3 text-primary shrink-0" /> 
                                                            <span>{selectedBranch.address}</span>
                                                            <Button size="icon" variant="ghost" className="h-6 w-6 text-zinc-600 hover:text-primary" onClick={() => handleCopy(selectedBranch.address, 'finder-address')}>
                                                                {copiedId === 'finder-address' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                                            </Button>
                                                        </div>
                                                        <div className="pt-4">
                                                            <Button 
                                                                onClick={() => handleCopyFullReport(selectedBranch, 'finder-full')} 
                                                                className={cn(
                                                                    "h-10 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 transition-all",
                                                                    copiedId === 'finder-full' ? "bg-emerald-600 hover:bg-emerald-500" : "bg-zinc-800 hover:bg-zinc-700"
                                                                )}
                                                            >
                                                                {copiedId === 'finder-full' ? <Check className="w-3 h-3" /> : <ClipboardList className="w-3 h-3" />}
                                                                {copiedId === 'finder-full' ? "Copied Full Details!" : "Copy Full Report"}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="text-center md:text-right bg-black/40 p-6 rounded-2xl border border-white/5 w-full md:w-auto">
                                                        <p className="text-[10px] font-black uppercase text-zinc-500 mb-2">BIC / SWIFT CODE</p>
                                                        <div className="flex items-center justify-center md:justify-end gap-4">
                                                            <span className="text-4xl md:text-5xl font-black text-glow-primary font-mono tracking-tighter">{selectedBranch.swiftCode}</span>
                                                            <Button size="icon" variant="ghost" className="h-10 w-10 hover:bg-primary/20" onClick={() => handleCopy(selectedBranch.swiftCode, 'finder-swift')}>
                                                                {copiedId === 'finder-swift' ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-primary" />}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </TabsContent>

                            <TabsContent value="checker" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <Card className="glass-card border-white/5 p-10 rounded-[3rem] shadow-2xl text-center">
                                    <div className="max-w-md mx-auto space-y-8">
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto ring-1 ring-primary/20">
                                                <ShieldCheck className="w-8 h-8 text-primary" />
                                            </div>
                                            <h2 className="text-2xl font-black uppercase italic tracking-tight">ISO 9362 Validator</h2>
                                        </div>
                                        <div className="relative">
                                            <Input 
                                                value={checkInput}
                                                onChange={(e) => setCheckInput(e.target.value)}
                                                placeholder="BIC CODE..."
                                                className="h-20 text-4xl font-mono font-black uppercase text-center bg-black/40 border-white/10 rounded-2xl focus:ring-primary"
                                            />
                                            <Button onClick={handleCheck} className="w-full mt-4 h-14 gradient-button-gold rounded-xl font-black uppercase tracking-widest">Verify Institution</Button>
                                        </div>

                                        {checkError && (
                                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                                                <AlertCircle className="w-5 h-5 text-red-500" />
                                                <p className="text-[10px] font-black text-red-400 uppercase">{checkError}</p>
                                            </div>
                                        )}

                                        {checkResult && (
                                            <div className="space-y-4 pt-4 text-left animate-in slide-in-from-top-4">
                                                <div className="bg-emerald-500/10 p-1 rounded-full text-center border border-emerald-500/20">
                                                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-2"><Check className="w-3 h-3" /> Structure & Institutional Match Found</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-black/40 p-4 rounded-xl border border-white/5 relative group">
                                                        <p className="text-[8px] font-black text-zinc-500 uppercase">Bank</p>
                                                        <p className="text-sm font-black uppercase">{checkResult.bank}</p>
                                                        <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleCopy(checkResult.bank, 'checker-bank')}>
                                                            {copiedId === 'checker-bank' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                                        </Button>
                                                    </div>
                                                    <div className="bg-black/40 p-4 rounded-xl border border-white/5 relative group">
                                                        <p className="text-[8px] font-black text-zinc-500 uppercase">Location</p>
                                                        <p className="text-sm font-black uppercase">{checkResult.city}, {checkResult.countryCode}</p>
                                                        <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleCopy(`${checkResult.city}, ${checkResult.countryCode}`, 'checker-location')}>
                                                            {copiedId === 'checker-location' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button 
                                                        variant="outline" 
                                                        className="flex-1 h-12 rounded-xl bg-primary/10 border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest gap-2" 
                                                        onClick={() => handleCopy(checkResult.swiftCode, 'checker-swift')}
                                                    >
                                                        {copiedId === 'checker-swift' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                                        Copy BIC Only
                                                    </Button>
                                                    <Button 
                                                        onClick={() => handleCopyFullReport(checkResult, 'checker-full')} 
                                                        className={cn(
                                                            "flex-1 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 transition-all",
                                                            copiedId === 'checker-full' ? "bg-emerald-600 hover:bg-emerald-500" : "bg-zinc-800 hover:bg-zinc-700"
                                                        )}
                                                    >
                                                        {copiedId === 'checker-full' ? <Check className="w-4 h-4" /> : <ClipboardList className="w-4 h-4" />}
                                                        Full Report
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* SIDEBAR: INFO & EDUCATION */}
                    <div className="lg:col-span-4 space-y-8">
                        <BicStructureInfo />
                        <TransferInsights />
                        <Card className="glass-card border-white/5 bg-zinc-900/40 p-6 rounded-3xl">
                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Zap className="w-4 h-4" /> Quick Check
                                </h4>
                                <ul className="space-y-3">
                                    {[
                                        { q: 'Is a SWIFT code required?', a: 'Yes, for all international transfers.' },
                                        { q: 'What is a BIC?', a: 'BIC is the same as a SWIFT code (Bank Identifier Code).' },
                                        { q: 'Can I use an 8-digit code?', a: 'Yes, if the branch code is unknown, XXX is the default.' }
                                    ].map((item, i) => (
                                        <li key={i} className="text-[10px] space-y-1 border-b border-white/5 pb-2 last:border-0">
                                            <p className="font-black text-zinc-300">Q: {item.q}</p>
                                            <p className="text-zinc-500 font-medium italic">A: {item.a}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* BOTTOM FAQ SECTION */}
                <section className="mt-20 py-16 border-t border-white/5 text-center">
                    <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter mb-12">Frequently Asked Questions</h2>
                    <div className="grid md:grid-cols-3 gap-8 text-left">
                        <div className="p-6 bg-white/5 rounded-2xl space-y-3">
                            <h3 className="font-black text-sm uppercase">What is ISO 9362?</h3>
                            <p className="text-xs text-zinc-500 leading-relaxed font-medium">ISO 9362 is the international standard for Bank Identifier Codes (BIC). It allows unique identification of financial institutions worldwide.</p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-2xl space-y-3">
                            <h3 className="font-black text-sm uppercase">BIC vs SWIFT?</h3>
                            <p className="text-xs text-zinc-500 leading-relaxed font-medium">There is no difference. BIC is the technical name, while SWIFT refers to the organization that assigns these codes.</p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-2xl space-y-3">
                            <h3 className="font-black text-sm uppercase">Are these codes current?</h3>
                            <p className="text-xs text-zinc-500 leading-relaxed font-medium">We periodically synchronize our database with global registries. However, always verify with your bank before large transfers.</p>
                        </div>
                    </div>
                </section>
            </main>
            <LandingFooter onNavigate={handleNavigate} />
        </div>
    );
}
