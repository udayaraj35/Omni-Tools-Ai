'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, Shield, Plane, Search, Calendar, Users, Plus, Minus, ChevronsUpDown, Check, User } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';

const DatePicker = ({ placeholder, date, setDate }: { placeholder: string; date?: Date; setDate: (date?: Date) => void }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal h-14 border-light-gray",
                        !date && "text-muted-foreground"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-primary"/>
                        <div className="flex flex-col">
                             <span className="text-xs text-muted-foreground">{placeholder}</span>
                             <span className="text-base">
                                {date ? format(date, "PPP") : "Select date"}
                             </span>
                        </div>
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={{ before: today }}
                />
            </PopoverContent>
        </Popover>
    );
};

const regions = [
    { value: 'gulf', title: 'Gulf', description: 'Qatar, Saudi Arabia, UAE, Oman, Kuwait, and Bahrain.' },
    { value: 'europe', title: 'Europe', description: 'Europe including Schengen countries.' },
    { value: 'worldwide_excluding', title: 'Worldwide (Excluding USA & Canada)', description: 'Worldwide excluding USA, Canada, and all islands in the Caribbean and Bahamas.' },
    { value: 'worldwide', title: 'Worldwide', description: 'Worldwide including USA, Canada, and all islands in the Caribbean and Bahamas.' },
    { value: 'asia', title: 'Asian Subcontinent', description: 'Bangladesh, India, Pakistan, and Sri Lanka.' },
];

const RegionSelector = ({ value, onValueChange }: { value: string; onValueChange: (value: string) => void }) => {
    const [open, setOpen] = useState(false);
    const selectedRegion = useMemo(() => regions.find(r => r.value === value), [value]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between h-14 text-left font-normal border-light-gray">
                    <div className="flex items-center gap-3">
                        <Plane className="h-5 w-5 text-primary" />
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Region</span>
                            <span className={cn("text-base truncate", !value && "text-muted-foreground")}>
                                {selectedRegion ? selectedRegion.title : 'Select a region'}
                            </span>
                        </div>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command>
                    <CommandInput placeholder="Search for regions..." />
                    <CommandEmpty>No region found.</CommandEmpty>
                    <ScrollArea className="h-72">
                        <CommandGroup>
                            {regions.map(region => (
                                <CommandItem
                                    key={region.value}
                                    value={region.title}
                                    onSelect={() => {
                                        onValueChange(region.value);
                                        setOpen(false);
                                    }}
                                >
                                    <Check className={cn("mr-2 h-4 w-4", value === region.value ? 'opacity-100' : 'opacity-0')} />
                                    <div className="flex flex-col">
                                        <span>{region.title}</span>
                                        <span className="text-xs text-muted-foreground">{region.description}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </ScrollArea>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

const TravelerSelector = () => {
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [seniors, setSeniors] = useState(0);

    const TravelerCounter = ({ label, value, onDecrement, onIncrement, note }: { label: string, value: number, onDecrement: () => void, onIncrement: () => void, note?: string }) => (
        <div className="flex items-center justify-between">
            <div>
                <p className="font-medium">{label}</p>
                {note && <p className="text-xs text-muted-foreground">{note}</p>}
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={onDecrement} disabled={value === (label === 'Adults' ? 1 : 0)}>
                    <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-bold">{value}</span>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={onIncrement}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
    
    return (
         <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between h-14 text-left font-normal border-light-gray">
                    <div className="flex items-center gap-3">
                         <Users className="h-5 w-5 text-primary"/>
                        <div className="flex flex-col">
                             <span className="text-xs text-muted-foreground">Travelers</span>
                             <span className="text-base">{adults + children + seniors} traveler(s)</span>
                        </div>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-4 space-y-4">
                <TravelerCounter label="Adults" value={adults} onDecrement={() => setAdults(v => Math.max(1, v - 1))} onIncrement={() => setAdults(v => v + 1)} note="17–65" />
                <TravelerCounter label="Children" value={children} onDecrement={() => setChildren(v => Math.max(0, v - 1))} onIncrement={() => setChildren(v => v + 1)} note="0–16" />
                <TravelerCounter label="Seniors" value={seniors} onDecrement={() => setSeniors(v => Math.max(0, v - 1))} onIncrement={() => setSeniors(v => v + 1)} note="66–75" />
            </PopoverContent>
        </Popover>
    );
};


export default function TravelInsurancePage() {
  const router = useRouter();
  const [tripType, setTripType] = useState<'single' | 'annual'>('single');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [region, setRegion] = useState('gulf');

  const handleNavigate = (path: string) => {
    router.push(path.startsWith('/') ? path : `/#${path}`);
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-soft-white">
        <Navbar onNavigate={handleNavigate} />
        <main className="flex-grow container mx-auto py-8">
            <button onClick={() => router.push('/')} className="animated-border-card inline-block mb-6">
                <span className={cn("inner-span flex items-center back-to-home-button")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </span>
            </button>
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-navy font-headline">Travel Insurance</h1>
                <p className="max-w-2xl mx-auto mt-4 text-muted-foreground md:text-xl">
                    Get your travel insurance for visa applications and peace of mind.
                </p>
            </div>
            
            <Card className="max-w-xl mx-auto shadow-soft rounded-xl border-light-gray">
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-lg">
                    <Button onClick={() => setTripType('single')} variant={tripType === 'single' ? 'secondary' : 'ghost'} className="h-11 shadow-sm">Single Trip</Button>
                    <Button onClick={() => setTripType('annual')} variant={tripType === 'annual' ? 'secondary' : 'ghost'} className="h-11 shadow-sm">Annual</Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                    <DatePicker placeholder="Start Date" date={startDate} setDate={setStartDate} />
                    <DatePicker placeholder="End Date" date={endDate} setDate={setEndDate} />
                </div>
                <RegionSelector value={region} onValueChange={setRegion} />
                <TravelerSelector />
                <p className="text-xs text-muted-foreground text-center pt-2">By proceeding, you confirm that you are a resident/citizen of the UAE.</p>
                <Button size="lg" className="w-full h-14 text-lg font-bold btn-accent">
                    <Search className="mr-2 h-5 w-5" />
                    Search Policies
                </Button>
              </CardContent>
            </Card>
        </main>
        <LandingFooter onNavigate={handleNavigate} />
    </div>
  );
}
