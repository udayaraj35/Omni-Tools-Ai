
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Copy, Check, UserCheck, Mic, Wand2, BadgeCheck, Repeat, Calendar as CalendarIcon, FileClock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { bsCalendarData } from '@/lib/bs-ad-calendar-data';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';


// --- Constants and Utility Functions (outside the component for performance) ---

interface DateOutput {
    bsYear: number;
    bsMonth: number;
    bsDay: number;
    adYear: number;
    adMonth: number;
    adDay: number;
    weekDay: number;
}
interface Age {
    years: number;
    months: number;
    days: number;
    totalMonths: number;
    totalDays: number;
    totalHours: number;
}
const NEPALI_MONTHS = ["बैशाख", "जेष्ठ", "असार", "श्रावण", "भदौ", "आश्विन", "कार्तिक", "मंसिर", "पौष", "माघ", "फाल्गुण", "चैत्र"];
const ENGLISH_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEK_DAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEK_DAYS_NP = ["आइत", "सोम", "मङ्गल", "बुध", "बिही", "शुक्र", "शनिबार"];
const BS_START_YEAR = 1970;
const BS_END_YEAR = 2100;
const AD_START_YEAR = 1913;
const AD_END_YEAR = 2044;

const toNepaliNumerals = (num: number | string): string => {
    const str = String(num);
    const nepaliNumerals = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return str.replace(/[0-9]/g, d => nepaliNumerals[parseInt(d)]);
};

function convertAdToBs(adYear: number, adMonth: number, adDay: number): DateOutput | 'out-of-range' | null {
    if (adYear < AD_START_YEAR || adYear > AD_END_YEAR) return "out-of-range";
    
    const daysInMonth = new Date(adYear, adMonth, 0).getDate();
    if (adDay < 1 || adDay > daysInMonth) return null;

    const refAdTimestamp = Date.UTC(1913, 3, 14); // Ref date is April 14, 1913 AD for Baishakh 1, 1970 BS
    const inputAdTimestamp = Date.UTC(adYear, adMonth - 1, adDay);
    const daysDiff = Math.floor((inputAdTimestamp - refAdTimestamp) / (1000 * 60 * 60 * 24));

    let bsYear = 1970;
    let remainingDays = daysDiff;

    while (true) {
        if (!bsCalendarData[bsYear]) return 'out-of-range';
        const daysInYear = bsCalendarData[bsYear].reduce((sum, days) => sum + days, 0);
        if (remainingDays >= daysInYear) {
            remainingDays -= daysInYear;
            bsYear++;
        } else {
            break;
        }
    }
    
    if (!bsCalendarData[bsYear]) return 'out-of-range';
    
    let bsMonth = 1;
    while (remainingDays >= bsCalendarData[bsYear][bsMonth - 1]) {
        remainingDays -= bsCalendarData[bsYear][bsMonth - 1];
        bsMonth++;
    }

    const bsDay = remainingDays + 1;
    const date = new Date(inputAdTimestamp);

    return { bsYear, bsMonth, bsDay, adYear, adMonth, adDay, weekDay: date.getUTCDay() };
}


function convertBsToAd(bsYear: number, bsMonth: number, bsDay: number): DateOutput | 'out-of-range' | null {
    if (bsYear < BS_START_YEAR || bsYear > BS_END_YEAR) return "out-of-range";
    
    const daysInMonth = bsCalendarData[bsYear]?.[bsMonth - 1];
    if (!daysInMonth || bsDay < 1 || bsDay > daysInMonth) return null;

    let daysCount = 0;
    for (let i = 1970; i < bsYear; i++) {
        if (!bsCalendarData[i]) return 'out-of-range';
        daysCount += bsCalendarData[i].reduce((a, b) => a + b, 0);
    }
    for (let i = 0; i < bsMonth - 1; i++) {
        daysCount += bsCalendarData[bsYear][i];
    }
    daysCount += bsDay - 1;

    const refAdDate = new Date(Date.UTC(1913, 3, 14)); // Ref date is April 14, 1913
    refAdDate.setUTCDate(refAdDate.getUTCDate() + daysCount);

    return { 
        bsYear, bsMonth, bsDay,
        adYear: refAdDate.getUTCFullYear(), 
        adMonth: refAdDate.getUTCMonth() + 1, 
        adDay: refAdDate.getUTCDate(),
        weekDay: refAdDate.getUTCDay(),
    };
}


function calculateAge(birthDate: Date): Age | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  birthDate.setHours(0, 0, 0, 0);

  if (birthDate > today) return null;

  const totalDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalHours = totalDays * 24;

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();
  
  if (days < 0) {
    months--;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  const totalMonths = years * 12 + months;
  
  return { years, months, days, totalMonths, totalDays, totalHours };
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: ((this: SpeechRecognition, ev: any) => any) | null;
    onerror: ((this: SpeechRecognition, ev: any) => any) | null;
    onend: ((this: SpeechRecognition) => any) | null;
}

// --- Reusable Child Components ---

const TrustBadge = () => (
    <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/30">
        <BadgeCheck className="mr-1 h-3 w-3" /> Verified
    </Badge>
);

const TodayDateCard = () => {
    const [nepaliDate, setNepaliDate] = useState('');
    const [englishDate, setEnglishDate] = useState('');
    const [nepaliTime, setNepaliTime] = useState('');

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            // Nepal Standard Time adjustment +5:45
            const npt = new Date(now.getTime() + (5 * 60 + 45) * 60000);
            
            // AD Date
            const adDate = new Date(Date.UTC(npt.getUTCFullYear(), npt.getUTCMonth(), npt.getUTCDate()));
            const adDateString = adDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'UTC'
            });
            setEnglishDate(adDateString);
            
            // BS Date
            const bsResult = convertAdToBs(npt.getUTCFullYear(), npt.getUTCMonth() + 1, npt.getUTCDate());
            if (bsResult && typeof bsResult !== 'string') {
                const bsDateString = `${NEPALI_MONTHS[bsResult.bsMonth - 1]} ${toNepaliNumerals(bsResult.bsDay)}, ${toNepaliNumerals(bsResult.bsYear)} गते, ${WEEK_DAYS_NP[bsResult.weekDay]}`;
                setNepaliDate(bsDateString);
            }
            
            // Time
            const hours = String(npt.getUTCHours()).padStart(2, '0');
            const minutes = String(npt.getUTCMinutes()).padStart(2, '0');
            const timeString = `${toNepaliNumerals(hours)}:${toNepaliNumerals(minutes)} NPT`;
            setNepaliTime(timeString);
        };
        
        updateDateTime();
        const intervalId = setInterval(updateDateTime, 1000);
        
        return () => clearInterval(intervalId);
    }, []);

    if (!nepaliDate) {
        return (
             <div className="p-6 rounded-lg bg-background/30 text-center space-y-2">
                <Skeleton className="h-8 w-3/4 mx-auto" />
                <Skeleton className="h-5 w-1/2 mx-auto" />
                <Skeleton className="h-5 w-1/3 mx-auto" />
            </div>
        );
    }

    return (
        <div className="p-6 rounded-lg bg-background/30 text-center">
             <h3 className="flex justify-center items-center gap-2 text-lg font-semibold">
                <CalendarIcon className="h-5 w-5" />
                <span>आजको मिति र समय</span>
            </h3>
             <div className="mt-2 space-y-1">
                <p className="font-bold text-accent text-xl">
                    {nepaliDate}
                </p>
                 <p className="text-muted-foreground">
                    <b>English Date (AD):</b> {englishDate}
                 </p>
                 <p className="text-muted-foreground">
                    <b>Time:</b> {nepaliTime}
                 </p>
            </div>
        </div>
    );
};

// --- Main Page Component ---

export default function DateConverterPage() {
    const router = useRouter();
    const { toast } = useToast();
    
    // Initialize BS date based on today's AD date
    const initialBsDate = convertAdToBs(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());

    const [adYear, setAdYear] = useState(new Date().getFullYear());
    const [adMonth, setAdMonth] = useState(new Date().getMonth() + 1);
    const [adDay, setAdDay] = useState(new Date().getDate());
    
    const [bsYear, setBsYear] = useState(initialBsDate && typeof initialBsDate !== 'string' ? initialBsDate.bsYear : 2081);
    const [bsMonth, setBsMonth] = useState(initialBsDate && typeof initialBsDate !== 'string' ? initialBsDate.bsMonth : 1);
    const [bsDay, setBsDay] = useState(initialBsDate && typeof initialBsDate !== 'string' ? initialBsDate.bsDay : 1);
    
    const [conversionResult, setConversionResult] = useState<DateOutput | null>(null);
    const [ageResult, setAgeResult] = useState<Age | null>(null);


    const [lang, setLang] = useState<'en' | 'np'>('en');
    const [hasCopied, setHasCopied] = useState(false);
    
    const [textInput, setTextInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const [order, setOrder] = useState<'ad-first' | 'bs-first'>('ad-first');
    
    const handleConversionResult = (result: DateOutput | 'out-of-range' | null) => {
        if (result === 'out-of-range') {
            setConversionResult(null);
            setAgeResult(null);
            toast({ variant: 'destructive', title: 'Date Out of Range', description: `Conversions are supported for ${BS_START_YEAR}-${BS_END_YEAR} BS (approx. ${AD_START_YEAR}-${AD_END_YEAR} AD).` });
            return;
        }
        if (result === null) {
            setConversionResult(null);
            setAgeResult(null);
            return;
        }
        
        setAdYear(result.adYear);
        setAdMonth(result.adMonth);
        setAdDay(result.adDay);

        setBsYear(result.bsYear);
        setBsMonth(result.bsMonth);
        setBsDay(result.bsDay);

        setConversionResult(result);
        const birthDate = new Date(Date.UTC(result.adYear, result.adMonth - 1, result.adDay));
        setAgeResult(calculateAge(birthDate));
    };

    const handleAdChange = (value: number, part: 'year' | 'month' | 'day') => {
        if (part === 'year') setAdYear(value);
        if (part === 'month') setAdMonth(value);
        if (part === 'day') setAdDay(value);
        setConversionResult(null);
        setAgeResult(null);
    };
    
    const handleBsChange = (value: number, part: 'year' | 'month' | 'day') => {
        if (part === 'year') setBsYear(value);
        if (part === 'month') setBsMonth(value);
        if (part === 'day') setBsDay(value);
        setConversionResult(null);
        setAgeResult(null);
    };

    const handleConvert = () => {
        if (order === 'ad-first') {
            const result = convertAdToBs(adYear, adMonth, adDay);
            handleConversionResult(result);
        } else {
            const result = convertBsToAd(bsYear, bsMonth, bsDay);
            handleConversionResult(result);
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false; // Stop on first pause
                recognition.interimResults = true; // Show interim results
                
                recognition.onresult = (event: any) => {
                    let transcript = '';
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        transcript += event.results[i][0].transcript;
                    }
                    setTextInput(transcript);
                    
                    if (event.results[0].isFinal) {
                        toast({ title: "Voice input received", description: "AI auto-detection from voice is coming soon." });
                    }
                };

                recognition.onerror = (event: any) => {
                    let errorMessage = event.error;
                    if (event.error === 'no-speech') {
                        errorMessage = "No speech was detected. Please try again.";
                    } else if (event.error === 'audio-capture') {
                        errorMessage = "Microphone not found. Please ensure it's connected and enabled.";
                    } else if (event.error === 'not-allowed') {
                        errorMessage = "Permission to use microphone was denied. Please enable it in your browser settings.";
                    } else if (event.error === 'network') {
                        errorMessage = "A network error occurred. Please check your internet connection.";
                    }
                    toast({ variant: "destructive", title: "Speech Recognition Error", description: errorMessage });
                    setIsRecording(false);
                };
                
                recognition.onend = () => setIsRecording(false);
                recognitionRef.current = recognition;
            }
        }
    }, [toast]);

    const handleVoiceInput = () => {
        if (recognitionRef.current) {
            if (isRecording) {
                recognitionRef.current.stop();
            } else {
                setTextInput(''); 
                recognitionRef.current.lang = lang === 'np' ? 'ne-NP' : 'en-US';
                try {
                    recognitionRef.current.start();
                    setIsRecording(true);
                } catch (e: any) {
                    toast({ variant: "destructive", title: "Could not start voice recognition", description: e.message });
                }
            }
        } else {
            toast({ variant: 'destructive', title: 'Feature Not Available', description: 'Speech recognition is not supported on your browser.' });
        }
    };
    
    const copyResult = () => {
        if (!conversionResult) return;
        const resultAd = new Date(Date.UTC(conversionResult.adYear, conversionResult.adMonth - 1, conversionResult.adDay));
        const adString = resultAd.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
        const text = lang === 'en' ? 
            `AD: ${adString}, BS: ${conversionResult.bsYear}-${conversionResult.bsMonth}-${conversionResult.bsDay}` :
            `ई.सं.: ${toNepaliNumerals(conversionResult.adYear)}-${toNepaliNumerals(conversionResult.adMonth)}-${toNepaliNumerals(conversionResult.adDay)}, वि.सं.: ${toNepaliNumerals(conversionResult.bsYear)}-${toNepaliNumerals(conversionResult.bsMonth)}-${toNepaliNumerals(conversionResult.bsDay)}`;
        navigator.clipboard.writeText(text);
        setHasCopied(true);
        toast({title: 'Date copied!'});
        setTimeout(() => setHasCopied(false), 2000);
    };

    const ADInputs = () => (
        <div className="space-y-2">
            <h3 className="font-bold text-lg text-foreground">{lang === 'np' ? 'ईस्वी सम्वत् (AD)' : 'Gregorian (AD)'}</h3>
            <div className="grid grid-cols-3 gap-2">
                <div>
                    <Label className="text-xs text-muted-foreground pl-1">{lang === 'np' ? 'वर्ष' : 'Year'}</Label>
                    <Input type="number" min={AD_START_YEAR} max={AD_END_YEAR} value={adYear} onChange={e => handleAdChange(Number(e.target.value), 'year')} placeholder={lang === 'np' ? 'वर्ष' : 'Year'} />
                </div>
                <div>
                    <Label className="text-xs text-muted-foreground pl-1">{lang === 'np' ? 'महिना' : 'Month'}</Label>
                    <Select value={String(adMonth)} onValueChange={v => handleAdChange(Number(v), 'month')}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            {ENGLISH_MONTHS.map((month, i) => <SelectItem key={month} value={String(i + 1)}>{month}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label className="text-xs text-muted-foreground pl-1">{lang === 'np' ? 'दिन' : 'Day'}</Label>
                    <Select value={String(adDay)} onValueChange={v => handleAdChange(Number(v), 'day')}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <ScrollArea className="h-72">
                                {Array.from({length: new Date(adYear, adMonth, 0).getDate()}, (_, i) => i + 1).map(d => 
                                    <SelectItem key={d} value={String(d)}>{lang==='np' ? toNepaliNumerals(d) : d}</SelectItem>
                                )}
                            </ScrollArea>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
    
    const BSInputs = () => (
        <div className="space-y-2">
            <h3 className="font-bold text-lg text-foreground">{lang === 'np' ? 'विक्रम सम्वत् (BS)' : 'Bikram Sambat (BS)'}</h3>
            <div className="grid grid-cols-3 gap-2">
                 <div>
                    <Label className="text-xs text-muted-foreground pl-1">{lang === 'np' ? 'वर्ष' : 'Year'}</Label>
                    <Input type="number" min={BS_START_YEAR} max={BS_END_YEAR} value={bsYear} onChange={e => handleBsChange(Number(e.target.value), 'year')} placeholder={lang === 'np' ? 'वर्ष' : 'Year'} />
                </div>
                <div>
                    <Label className="text-xs text-muted-foreground pl-1">{lang === 'np' ? 'महिना' : 'Month'}</Label>
                    <Select value={String(bsMonth)} onValueChange={v => handleBsChange(Number(v), 'month')}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{Array.from({length: 12}, (_, i) => i + 1).map(m => <SelectItem key={m} value={String(m)}>{NEPALI_MONTHS[m-1]}</SelectItem>)}</SelectContent></Select>
                </div>
                <div>
                    <Label className="text-xs text-muted-foreground pl-1">{lang === 'np' ? 'दिन' : 'Day'}</Label>
                    <Select value={String(bsDay)} onValueChange={v => handleBsChange(Number(v), 'day')}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><ScrollArea className="h-72">{Array.from({length: bsCalendarData[bsYear]?.[bsMonth - 1] || 32}, (_, i) => i + 1).map(d => <SelectItem key={d} value={String(d)}>{lang==='np' ? toNepaliNumerals(d) : d}</SelectItem>)}</ScrollArea></SelectContent></Select>
                </div>
            </div>
        </div>
    );
    
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar onNavigate={(path) => router.push(path.startsWith('/') ? path : `/#${path}`)} />
            <main className="flex-1 container mx-auto py-4 md:py-8 px-4 md:px-6">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => router.back()} className="animated-border-card inline-block">
                        <span className={cn("inner-span flex items-center back-to-home-button")}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </span>
                    </button>
                </div>

                <div className="text-center mb-6">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter font-headline flex items-center justify-center gap-3 text-glow-primary">
                        <Image src="https://i.imgur.com/dS8Bj8T.png" alt="Nepal Flag" width={40} height={40} />
                        Date Intelligence System
                    </h1>
                    <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                        An advanced Nepali date conversion tool for converting Bikram Sambat (BS) to Gregorian (AD) dates and vice versa. It also calculates your age accurately based on the selected date.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-1 lg:max-w-4xl lg:mx-auto">
                     <Card className="glass-card">
                        <CardContent className="p-6 space-y-6">
                            <TodayDateCard />
                            
                            <div className="relative">
                               <Input 
                                   value={textInput}
                                   onChange={(e) => setTextInput(e.target.value)}
                                   placeholder='Paste text or use voice (e.g., "I was born on 2055/05/12")'
                                   className="h-12 pl-10 pr-12 bg-background/50 border-border"
                                />
                               <Wand2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                               <Button size="icon" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9" onClick={handleVoiceInput}>
                                   <Mic className={cn("h-5 w-5", isRecording && "text-destructive animate-pulse")} />
                               </Button>
                           </div>
                           
                            <Separator />
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-xl text-foreground">Date Converter</h3>
                                    <div className="flex items-center border rounded-md">
                                        <Button size="sm" variant={lang === 'en' ? 'secondary': 'ghost'} onClick={() => setLang('en')} className="rounded-r-none border-r h-8">EN</Button>
                                        <Button size="sm" variant={lang === 'np' ? 'secondary': 'ghost'} onClick={() => setLang('np')} className="rounded-l-none h-8">NE</Button>
                                    </div>
                                </div>
                                {order === 'ad-first' ? <ADInputs /> : <BSInputs />}
                                <div className="flex justify-center items-center py-2">
                                     <Button variant="outline" size="icon" onClick={() => setOrder(prev => prev === 'ad-first' ? 'bs-first' : 'ad-first')} className="flex-shrink-0" aria-label="Swap date inputs">
                                        <Repeat className="h-5 w-5"/>
                                    </Button>
                                </div>
                                {order === 'ad-first' ? <BSInputs /> : <ADInputs />}
                            </div>

                            <Button onClick={handleConvert} className="w-full h-12 gradient-button-gold">
                                Convert
                            </Button>

                             {conversionResult && (
                                <div className="space-y-4 pt-4 border-t">
                                     <div className="p-4 bg-muted/30 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-bold text-xl text-foreground">Conversion Result</h3>
                                            <TrustBadge />
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4 text-center">
                                            <div>
                                                <p className="text-sm text-muted-foreground">{lang === 'np' ? 'ईस्वी सम्वत् (AD)' : 'Gregorian (AD)'}</p>
                                                <p className="text-xl font-bold min-h-[28px] text-accent">
                                                    {new Date(Date.UTC(conversionResult.adYear, conversionResult.adMonth - 1, conversionResult.adDay)).toLocaleDateString(lang === 'np' ? 'ne-NP-u-nu-deva' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}, {WEEK_DAYS_EN[conversionResult.weekDay]}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">{lang === 'np' ? 'विक्रम सम्वत् (BS)' : 'Bikram Sambat (BS)'}</p>
                                                <p className="text-xl font-bold min-h-[28px] text-accent">
                                                    {lang === 'np' ? `${NEPALI_MONTHS[conversionResult.bsMonth - 1]} ${toNepaliNumerals(conversionResult.bsDay)}, ${toNepaliNumerals(conversionResult.bsYear)}` : `${NEPALI_MONTHS[conversionResult.bsMonth - 1]} ${conversionResult.bsDay}, ${conversionResult.bsYear}`}, {WEEK_DAYS_NP[conversionResult.weekDay]}
                                                </p>
                                            </div>
                                        </div>
                                         <div className="text-right mt-2">
                                            <Button onClick={copyResult} variant="ghost" size="icon">
                                                {hasCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                                            </Button>
                                        </div>
                                    </div>
                                    
                                     {ageResult && (
                                         <div className="p-4 bg-muted/30 rounded-lg">
                                             <div className="flex justify-between items-center mb-2">
                                                  <h3 className="flex items-center gap-2 font-bold text-xl text-foreground"><UserCheck />{lang === 'np' ? 'तपाईंको उमेर' : 'Your Age'}</h3>
                                                 <TrustBadge />
                                            </div>
                                            <p className="text-center text-lg font-bold text-primary mb-4">
                                                {lang === 'np' ? 
                                                    `${toNepaliNumerals(ageResult.years)} वर्ष, ${toNepaliNumerals(ageResult.months)} महिना, र ${toNepaliNumerals(ageResult.days)} दिन` : 
                                                    `${ageResult.years} years, ${ageResult.months} months, and ${ageResult.days} days old.`
                                                }
                                            </p>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center border-t pt-4">
                                                <div><p className="text-xs text-muted-foreground">कुल वर्ष</p><p className="font-bold text-lg">{lang === 'np' ? toNepaliNumerals(ageResult.years) : ageResult.years}</p></div>
                                                <div><p className="text-xs text-muted-foreground">कुल महिना</p><p className="font-bold text-lg">{lang === 'np' ? toNepaliNumerals(ageResult.totalMonths.toLocaleString()) : ageResult.totalMonths.toLocaleString()}</p></div>
                                                <div><p className="text-xs text-muted-foreground">कुल दिन</p><p className="font-bold text-lg">{lang === 'np' ? toNepaliNumerals(ageResult.totalDays.toLocaleString()) : ageResult.totalDays.toLocaleString()}</p></div>
                                                <div><p className="text-xs text-muted-foreground">कुल घण्टा</p><p className="font-bold text-lg">{lang === 'np' ? toNepaliNumerals(ageResult.totalHours.toLocaleString()) : ageResult.totalHours.toLocaleString()}</p></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                             {!conversionResult && (
                                <div className="p-8 text-center text-muted-foreground border-t">
                                    <p>Click "Convert" to see the result and your calculated age.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
            <LandingFooter onNavigate={(path) => router.push(path.startsWith('/') ? path : `/#${path}`)} />
        </div>
    );
}
