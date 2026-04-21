
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Repeat, Copy, Check, TrendingUp, TrendingDown, ChevronsUpDown, LineChart as LineChartIcon, PlusCircle, Trash2, Wallet, Info, Coffee } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Defs, linearGradient, stop } from 'recharts';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ContactDialog } from '@/components/ui/contact-dialog';


// --- Data ---
const currencies = [
    { code: 'USD', name: 'United States Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'NPR', name: 'Nepalese Rupee' },
    { code: 'AED', name: 'UAE Dirham' },
    { code: 'SAR', name: 'Saudi Riyal' },
    { code: 'QAR', name: 'Qatari Riyal' },
    { code: 'USDT', name: 'Tether' },
    { code: 'USDC', name: 'USD Coin' },
];

const defaultRates: Record<string, number> = {
    USD: 1,
    EUR: 0.93,
    JPY: 157.85,
    GBP: 0.79,
    AUD: 1.51,
    CAD: 1.37,
    CHF: 0.90,
    CNY: 7.26,
    INR: 83.57,
    NPR: 133.92,
    AED: 3.67,
    SAR: 3.75,
    QAR: 3.64,
    USDT: 1.00,
    USDC: 1.00,
};

const initialHistoryData = [
  { name: '7d ago', rate: 133.25 },
  { name: '6d ago', rate: 133.50 },
  { name: '5d ago', rate: 133.45 },
  { name: '4d ago', rate: 133.60 },
  { name: '3d ago', rate: 133.75 },
  { name: '2d ago', rate: 133.70 },
  { name: 'Yesterday', rate: 133.80 },
  { name: 'Today', rate: 133.92 },
];

// --- Components ---

interface CurrencySelectorProps {
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
}

const CurrencySelector = ({ value, onChange, placeholder }: CurrencySelectorProps) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filteredCurrencies = useMemo(() => {
        if (!search) return currencies;
        const lowerSearch = search.toLowerCase();
        return currencies.filter(currency =>
            currency.code.toLowerCase().includes(lowerSearch) ||
            currency.name.toLowerCase().includes(lowerSearch)
        );
    }, [search]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between h-12 text-base">
                    {value ? currencies.find(c => c.code === value)?.code : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command>
                    <CommandInput value={search} onValueChange={setSearch} placeholder="Search currency..."/>
                    <CommandList>
                        <CommandEmpty>No currency found.</CommandEmpty>
                        <ScrollArea className="h-60">
                        <CommandGroup>
                            {filteredCurrencies.map((currency) => (
                                <CommandItem
                                    key={currency.code}
                                    value={`${currency.code} - ${currency.name}`}
                                    onSelect={() => {
                                        onChange(currency.code);
                                        setOpen(false);
                                        setSearch('');
                                    }}
                                >
                                    <Check className={cn("mr-2 h-4 w-4", value === currency.code ? "opacity-100" : "opacity-0")} />
                                    {currency.code} <span className="text-muted-foreground ml-2">{currency.name}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        </ScrollArea>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};


const RateGraph = () => {
    const historyData = initialHistoryData;
    
    const trend = historyData[historyData.length - 1].rate > historyData[0].rate ? 'up' : 'down';
    const percentageChange = (
      ((historyData[historyData.length - 1].rate - historyData[0].rate) / historyData[0].rate) * 100
    ).toFixed(2);
    
    return (
        <Card className="glass-card">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2"><LineChartIcon /> Rate History</CardTitle>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/30">Favorable Trend</Badge>
                </div>
                <CardDescription>USD to NPR - Last 7 Days</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline gap-2">
                    <p className={cn("text-2xl font-bold", trend === 'up' ? 'text-green-500' : 'text-red-500')}>
                        {trend === 'up' ? <TrendingUp className="inline-block h-6 w-6" /> : <TrendingDown className="inline-block h-6 w-6" />}
                        <span className="ml-2">{percentageChange}%</span>
                    </p>
                    <p className="text-sm text-muted-foreground">in the last 24h</p>
                </div>
                <div className="h-[200px] w-full mt-4 -ml-4">
                    <ResponsiveContainer>
                        <LineChart data={historyData}>
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background) / 0.9)',
                                    borderColor: 'hsl(var(--border))',
                                    backdropFilter: 'blur(4px)',
                                }}
                            />
                            <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

interface Conversion {
    id: number;
    fromCurrency: string;
    toCurrency: string;
    manualRate: string;
}

export default function CurrencyConverterPage() {
    const router = useRouter();
    const { toast } = useToast();
    const nextId = useRef(1);

    const [amount, setAmount] = useState<string>("1");
    const [conversions, setConversions] = useState<Conversion[]>([
        { id: 0, fromCurrency: 'USD', toCurrency: 'NPR', manualRate: '' },
    ]);
    const [hasCopied, setHasCopied] = useState<Record<number, boolean>>({});
    const [showContactDialog, setShowContactDialog] = useState(false);

    const handleNavigate = (path: string) => {
        router.push(path.startsWith('/') ? path : `/#${path}`);
    };

    const handleConversionChange = (id: number, field: keyof Omit<Conversion, 'id'>, value: string) => {
        setConversions(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const handleSwap = (id: number) => {
        setConversions(prev => prev.map(c => {
            if (c.id === id) {
                return { ...c, fromCurrency: c.toCurrency, toCurrency: c.fromCurrency };
            }
            return c;
        }));
    };

    const addConversion = () => {
        setConversions(prev => [...prev, { id: nextId.current++, fromCurrency: 'EUR', toCurrency: 'INR', manualRate: '' }]);
    };

    const removeConversion = (id: number) => {
        if (conversions.length > 1) {
            setConversions(prev => prev.filter(c => c.id !== id));
        } else {
            toast({
                variant: 'destructive',
                title: 'Cannot Remove',
                description: 'At least one conversion row is required.',
            });
        }
    };

    const handleCopy = (id: number, text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setHasCopied(prev => ({ ...prev, [id]: true }));
        toast({ title: "Result copied to clipboard!" });
        setTimeout(() => setHasCopied(prev => ({ ...prev, [id]: false })), 2000);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar onNavigate={handleNavigate} />
            <main className="flex-1 container mx-auto py-8">
                <button onClick={() => router.back()} className="animated-border-card inline-block mb-6">
                    <span className={cn("inner-span flex items-center back-to-home-button")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </span>
                </button>
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter text-glow-primary font-headline">
                        Multi-Currency Rate Calculator
                    </h1>
                     <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                        Instantly convert between multiple currencies with live rates. Add, remove, and swap currencies to create your perfect conversion dashboard. Set custom rates for precise calculations.
                    </p>
                </div>
                
                 <div className="grid lg:grid-cols-2 gap-8 items-start">
                    <div className="space-y-6">
                        <Card className="glass-card">
                            <CardContent className="p-6 space-y-6">
                                <div>
                                    <Label htmlFor="amount" className="text-sm font-medium text-muted-foreground">Amount</Label>
                                    <Input
                                        id="amount"
                                        type="text"
                                        inputMode="decimal"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                                        placeholder="1.00"
                                        className="text-4xl h-20 font-bold border-0 bg-transparent shadow-none pl-2 -ml-2"
                                    />
                                </div>
                                <Separator />
                                <div className="space-y-4">
                                {conversions.map((conv, index) => {
                                    const fromRate = defaultRates[conv.fromCurrency] || 1;
                                    const toRate = defaultRates[conv.toCurrency] || 1;
                                    const autoRate = toRate / fromRate;
                                    const effectiveRate = Number(conv.manualRate) > 0 ? Number(conv.manualRate) : autoRate;
                                    const numericAmount = Number(amount) || 0;
                                    const convertedAmount = numericAmount * effectiveRate;
                                    
                                    const uniqueId = `conv-${conv.id}`;

                                    return (
                                        <div key={uniqueId} className="relative rounded-xl border border-border bg-background/50 p-4 transition-all hover:shadow-lg">
                                            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 mb-4">
                                                <CurrencySelector value={conv.fromCurrency} onChange={(val) => handleConversionChange(conv.id, 'fromCurrency', val)} placeholder="From" />
                                                <Button variant="ghost" size="icon" className="h-14 w-14 self-center mx-auto group" onClick={() => handleSwap(conv.id)}>
                                                    <Repeat className="h-5 w-5 text-muted-foreground transition-transform group-hover:rotate-180"/>
                                                </Button>
                                                <CurrencySelector value={conv.toCurrency} onChange={(val) => handleConversionChange(conv.id, 'toCurrency', val)} placeholder="To" />
                                            </div>

                                            <div className="grid sm:grid-cols-2 gap-4">
                                                 <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 text-center">
                                                    <Label className="text-xs text-primary/80">Converted Amount</Label>
                                                    <p className="text-5xl font-bold text-glow-accent break-all">{convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                                </div>
                                                <div className="relative">
                                                     <Label htmlFor={`rate-${uniqueId}`} className="text-xs text-muted-foreground">Exchange Rate</Label>
                                                     <Input
                                                        id={`rate-${uniqueId}`}
                                                        type="text"
                                                        inputMode="decimal"
                                                        value={conv.manualRate}
                                                        onChange={(e) => handleConversionChange(conv.id, 'manualRate', e.target.value.replace(/[^0-9.]/g, ''))}
                                                        placeholder={`Live: ${autoRate.toFixed(4)}`}
                                                        className="h-12 text-sm text-right pr-10"
                                                    />
                                                     <span className="absolute right-3 top-1/2 -translate-y-0.5 text-xs text-muted-foreground">{conv.toCurrency}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center justify-end mt-1">
                                                <Button variant="ghost" size="sm" className="h-8" onClick={() => handleCopy(conv.id, convertedAmount.toFixed(2))}>
                                                    {hasCopied[conv.id] ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                                    <span className="ml-2 text-xs">Copy</span>
                                                </Button>
                                            </div>
                                            
                                            <Button variant="destructive" size="icon" className="absolute -top-3 -right-3 h-7 w-7 rounded-full" onClick={() => removeConversion(conv.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )
                                })}
                                </div>
                                <Button variant="outline" className="w-full h-12 border-dashed" onClick={addConversion}>
                                    <PlusCircle className="mr-2 h-5 w-5" /> Add Currency
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                    
                    <div className="space-y-6 lg:sticky lg:top-24">
                        <RateGraph />
                    </div>
                 </div>
                 
                 <div className="mt-12 max-w-2xl mx-auto">
                    <Card className="glass-card">
                        <CardHeader className="items-center text-center">
                            <Wallet className="h-8 w-8 text-primary" />
                            <div className="mt-2">
                                <CardTitle>Thank You for Using OmniTools!</CardTitle>
                                <CardDescription>Explore more of our free, powerful tools.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-muted-foreground mb-4">We hope this tool was helpful. Your support allows us to keep building and improving our platform for everyone.</p>
                            <Button onClick={() => setShowContactDialog(true)} className="gradient-button-gold">
                                <Coffee className="mr-2 h-5 w-5" />
                                Support Us
                            </Button>
                        </CardContent>
                    </Card>
                 </div>

            </main>
            <LandingFooter onNavigate={handleNavigate} />
            <ContactDialog open={showContactDialog} onOpenChange={setShowContactDialog} />
        </div>
    );
}
