'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plane, Calendar, Users, ShieldCheck, Zap, Clock, ArrowLeft, RefreshCw, Star, FileQuestion, BadgeCheck, MessageSquare, Download, Loader2, Info, Globe, Eye, CheckCircle2, CreditCard, Mail } from 'lucide-react';
import { AirportSelector } from './components/AirportSelector';
import { CountrySelector } from './components/CountrySelector';
import { PassengerSelector } from './components/PassengerSelector';
import { DatePicker } from './components/DatePicker';
import { FlightResults } from './components/FlightResults';
import { CheckoutForm } from './components/CheckoutForm';
import { TicketPreview } from './components/TicketPreview';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Airport, airports } from '@/lib/airports';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { trackToolUsage } from '@/lib/tools';


type Step = 'search' | 'results' | 'checkout' | 'success';
export type Currency = 'AED' | 'NPR' | 'USD' | 'EUR' | 'USDT';

const ADULT_PRICE = 100;
const CHILD_PRICE = 80;
const INFANT_PRICE = 50;

const SuccessPage = ({pnr, bookingData}: {pnr: string, bookingData: any}) => {
    const ticketRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);
    const [showFullDetails, setShowFullDetails] = useState(false);

    const handleDownload = async () => {
        if (!ticketRef.current) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not find ticket to download.' });
            return;
        }

        setIsGenerating(true);
        toast({ title: 'Generating High-Quality PDF...', description: 'Please wait while we render your ticket.' });
        
        try {
            const canvas = await html2canvas(ticketRef.current, { 
                scale: 3, 
                useCORS: true, 
                backgroundColor: "#ffffff",
                windowWidth: 900,
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save(`Pending_Verification_Ticket_${pnr}.pdf`);
            toast({ title: 'Download Started!', description: 'Your unverified preview has been saved.' });
        } catch (error: any) {
            console.error("PDF Gen Error:", error);
            toast({ variant: 'destructive', title: 'PDF Generation Failed', description: error.message });
        } finally {
            setIsGenerating(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <Card className="glass-card border-primary/30">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-primary/20 p-4 rounded-full">
                            <CheckCircle2 className="h-12 w-12 text-primary animate-pulse" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-headline tracking-tighter">
                        Booking Received & Awaiting Payment
                    </CardTitle>
                    <CardDescription className="text-lg mt-2">
                        Your PNR: <span className="font-mono font-black text-primary bg-primary/10 px-3 py-1 rounded-md border border-primary/20">{pnr}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 flex flex-col items-center">
                    {/* Process Steps */}
                    <div className="w-full max-w-2xl grid grid-cols-3 gap-2 text-center pb-6">
                        <div className="flex flex-col items-center gap-2">
                            <div className="bg-primary text-primary-foreground h-10 w-10 rounded-full flex items-center justify-center font-bold">1</div>
                            <span className="text-xs font-bold uppercase">Pay Now</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="bg-muted text-muted-foreground h-10 w-10 rounded-full flex items-center justify-center font-bold">2</div>
                            <span className="text-xs font-bold uppercase">Verify (5-10m)</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="bg-muted text-muted-foreground h-10 w-10 rounded-full flex items-center justify-center font-bold">3</div>
                            <span className="text-xs font-bold uppercase">Get via Email</span>
                        </div>
                    </div>

                    <div className="w-full bg-blue-500/10 border border-blue-500/30 p-6 rounded-2xl text-center space-y-3">
                        <p className="text-blue-400 font-bold text-lg">
                            भुक्तानी गरेपछि तपाईंको टिकट ५ देखि १० मिनेटभित्र ईमेलमा पठाइनेछ।
                        </p>
                        <p className="text-blue-200/80 text-sm italic">
                            Your official verifiable ticket will be sent to <span className="underline font-bold">{bookingData.contactEmail}</span> within 5-10 minutes after payment verification.
                        </p>
                    </div>

                    <div className="w-full max-w-5xl p-4 md:p-10 bg-slate-900/80 rounded-3xl border border-white/10 shadow-2xl overflow-x-auto custom-scrollbar opacity-60">
                        <div className="text-center mb-4">
                            <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/50 uppercase font-black px-4 py-1">PREVIEW ONLY - AWAITING VERIFICATION</Badge>
                        </div>
                        <TicketPreview ref={ticketRef} bookingData={bookingData} onQrClick={() => setShowFullDetails(true)} />
                    </div>
                    
                    <div className="flex flex-wrap gap-4 justify-center w-full max-w-2xl">
                        <Button asChild size="lg" className="flex-1 h-16 text-xl font-black gradient-button-gold shadow-xl">
                            <a href={`https://wa.me/971567067618?text=I%20have%20paid%20for%20PNR%20${pnr}%20on%20OmniToolsAI.%20Email:%20${bookingData.contactEmail}.%20Please%20verify.`} target="_blank" rel="noopener noreferrer">
                                <MessageSquare className="mr-3 h-6 w-6" />
                                CONFIRM PAYMENT (WHATSAPP)
                            </a>
                        </Button>
                        <Button onClick={handleDownload} size="lg" variant="outline" className="flex-1 h-16 text-xl font-black border-border" disabled={isGenerating}>
                            {isGenerating ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Download className="mr-3 h-6 w-6" />}
                            DOWNLOAD PREVIEW
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showFullDetails} onOpenChange={setShowFullDetails}>
                <DialogContent className="max-w-3xl bg-white text-black p-0 overflow-hidden rounded-3xl border-0 shadow-2xl">
                    <DialogHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white border-b shadow-lg">
                        <DialogTitle className="text-3xl font-black flex items-center gap-3">
                            <ShieldCheck className="h-8 w-8" />
                            RESERVATION DATA RECORD
                        </DialogTitle>
                        <DialogDescription className="text-blue-100 text-lg opacity-90">Official manifest for PNR: {pnr}</DialogDescription>
                    </DialogHeader>
                    <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Reservation Status</p>
                                <p className="text-2xl font-black text-amber-600 flex items-center gap-2">
                                    <span className="h-3 w-3 rounded-full bg-amber-500 animate-pulse"></span>
                                    AWAITING PAYMENT
                                </p>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Operating Carrier</p>
                                <p className="text-2xl font-black text-gray-900">{bookingData.flightDetails?.airline}</p>
                            </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-6">
                            <h4 className="font-black text-xs text-gray-400 uppercase tracking-[0.3em]">Passenger Manifest</h4>
                            <div className="grid gap-4">
                                {bookingData.passengers.map((p: any, i: number) => (
                                    <div key={i} className="bg-gray-50/80 p-6 rounded-2xl flex justify-between items-center border border-gray-100 hover:border-blue-200 transition-colors">
                                        <div>
                                            <p className="font-black text-xl text-gray-900 uppercase">{p.title}. {p.firstName} {p.lastName}</p>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500 font-bold">
                                                <span className="flex items-center gap-1.5"><Globe className="h-4 w-4 text-blue-500" /> {p.nationality}</span>
                                                <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-blue-500" /> {p.passportNumber}</span>
                                                {p.bloodGroup && <span className="text-red-600">BLOOD: {p.bloodGroup}</span>}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-gray-400 uppercase mb-1">E-Ticket ID</p>
                                            <p className="font-mono text-base font-black text-blue-600">PENDING PAYMENT</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-6">
                            <h4 className="font-black text-xs text-gray-400 uppercase tracking-[0.3em]">Itinerary Information</h4>
                            <div className="bg-blue-50/30 p-8 rounded-3xl border border-blue-100 grid grid-cols-3 items-center text-center">
                                <div className="text-left">
                                    <p className="text-4xl font-black text-gray-900">{bookingData.fromAirport?.code}</p>
                                    <p className="text-xs font-black text-gray-500 uppercase mt-1">{bookingData.fromAirport?.city}</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <Plane className="h-8 w-8 text-blue-600 rotate-45" />
                                    <div className="w-full border-t-2 border-dashed border-blue-200 mt-2"></div>
                                    <p className="text-[10px] font-black text-blue-500 mt-2 italic uppercase">Operating Carrier: {bookingData.flightDetails?.airline}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-4xl font-black text-gray-900">{bookingData.toAirport?.code}</p>
                                    <p className="text-xs font-black text-gray-500 uppercase mt-1">{bookingData.toAirport?.city}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="bg-gray-50 p-6 border-t">
                        <Button onClick={() => setShowFullDetails(false)} className="w-full h-14 text-lg font-black bg-gray-900 hover:bg-black rounded-2xl shadow-xl">CLOSE MANIFEST</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
};

export default function DummyTicketPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();
    const [step, setStep] = useState<Step>('search');
    const [pnr, setPnr] = useState<string | null>(null);
    const [currency, setCurrency] = useState<Currency>('AED');
    const [bookingData, setBookingData] = useState<any>(null);

    const userDocRef = useMemoFirebase(() => (user ? doc(firestore, 'users', user.uid) : null), [user, firestore]);
    const { data: userProfile } = useDoc<any>(userDocRef);

    const [tripType, setTripType] = useState<'one-way' | 'return'>('one-way');
    const [fromCountry, setFromCountry] = useState('');
    const [toCountry, setToCountry] = useState('');
    const [fromAirport, setFromAirport] = useState('');
    const [toAirport, setToAirport] = useState('');
    const [departureDate, setDepartureDate] = useState<Date>();
    const [returnDate, setReturnDate] = useState<Date>();
    
    const [manualFromCountry, setManualFromCountry] = useState('');
    const [manualToCountry, setManualToCountry] = useState('');
    const [manualFromAirport, setManualFromAirport] = useState('');
    const [manualToAirport, setManualToAirport] = useState('');

    const [passengers, setPassengers] = useState({
        adults: 1,
        children: 0,
        infants: 0,
    });

    useEffect(() => {
        trackToolUsage('/dummy-ticket');
    }, []);
    
    const handleSwapLocations = () => {
        const tempFromCountry = fromCountry;
        const tempFromAirport = fromAirport;
        const tempManualFromCountry = manualFromCountry;
        const tempManualFromAirport = manualFromAirport;

        setFromCountry(toCountry);
        setFromAirport(toAirport);
        setManualFromCountry(manualToCountry);
        setManualFromAirport(manualToAirport);

        setToCountry(tempFromCountry);
        setToAirport(tempFromAirport);
        setManualToCountry(tempManualFromCountry);
        setManualToAirport(tempManualFromAirport);
    };

    const handlePassengerChange = (type: 'adults' | 'children' | 'infants', value: number) => {
        setPassengers(prev => ({...prev, [type]: value}));
    };
    
    const totalPriceInAED = useMemo(() => {
        return (passengers.adults * ADULT_PRICE) + (passengers.children * CHILD_PRICE) + (passengers.infants * INFANT_PRICE);
    }, [passengers]);

    const handleNavigate = (path: string) => {
        router.push(path.startsWith('/') ? path : `/#${path}`);
    };

    const handleSearch = () => {
        const finalFromAirport = fromAirport === 'Other' ? manualFromAirport : fromAirport;
        const finalToAirport = toAirport === 'Other' ? manualToAirport : toAirport;

        if (!finalFromAirport || !finalToAirport || !departureDate) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please select or enter departure/arrival airports and a date.',
            });
            return;
        }
        setStep('results');
    };
    
    const handleSelectFlight = (flight: any) => {
        const finalFromCountry = fromCountry === 'Other' ? manualFromCountry : fromCountry;
        const finalToCountry = toCountry === 'Other' ? manualToCountry : toCountry;

        const fromAirportObj = fromAirport === 'Other' 
            ? { code: manualFromAirport.toUpperCase(), name: manualFromAirport.toUpperCase(), city: finalFromCountry, country: finalFromCountry }
            : airports.find(a => a.code.toLowerCase() === fromAirport.toLowerCase());
        
        const toAirportObj = toAirport === 'Other'
            ? { code: manualToAirport.toUpperCase(), name: manualToAirport.toUpperCase(), city: finalToCountry, country: finalToCountry }
            : airports.find(a => a.code.toLowerCase() === toAirport.toLowerCase());

        setBookingData({
            tripType,
            fromAirport: fromAirportObj,
            toAirport: toAirportObj,
            departureDate,
            returnDate,
            flightDetails: flight,
            passengersCount: passengers,
        });
        setStep('checkout');
    };
    
    const handleBack = () => {
        if (step === 'results') {
            setStep('search');
        } else if (step === 'checkout') {
            setStep('results');
        } else if (step === 'success') {
            setStep('checkout');
        } else {
            router.push('/');
        }
    };
    
    const handlePaymentSuccess = (newBookingData: any) => {
        setBookingData(newBookingData);
        setPnr(newBookingData.pnr);
        setStep('success');
    };

    const renderHeader = () => {
        switch(step) {
            case 'results':
                return { title: "Select Your Flight", description: "Choose a reservation that fits your travel needs." };
            case 'checkout':
                 return { title: "Passenger Details", description: "Enter traveler information and issuance preferences." };
            case 'success':
                 return { title: "Step 1: Payment Verification", description: "Please complete your payment to receive your ticket." };
            default:
                 return null;
        }
    }
    
    const headerInfo = renderHeader();

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Navbar onNavigate={handleNavigate} />
            <main className="flex-1 container mx-auto px-4 md:px-6 py-8 md:py-12">
                 <button onClick={handleBack} className="animated-border-card inline-block mb-6">
                    <span className={cn("inner-span flex items-center back-to-home-button")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {step === 'search' ? 'Back to Home' : 'Back'}
                    </span>
                </button>
                {step === 'search' && <HeroSection 
                    onSearch={handleSearch} 
                    passengers={passengers} 
                    onPassengerChange={handlePassengerChange} 
                    tripType={tripType}
                    setTripType={setTripType}
                    fromCountry={fromCountry}
                    setFromCountry={setFromCountry}
                    toCountry={toCountry}
                    setToCountry={setToCountry}
                    fromAirport={fromAirport}
                    setFromAirport={setFromAirport}
                    toAirport={toAirport}
                    setToAirport={setToAirport}
                    departureDate={departureDate}
                    setDepartureDate={setDepartureDate}
                    returnDate={returnDate}
                    setReturnDate={setReturnDate}
                    manualFromCountry={manualFromCountry}
                    setManualFromCountry={setManualFromCountry}
                    manualToCountry={manualToCountry}
                    setManualToCountry={setManualToCountry}
                    manualFromAirport={manualFromAirport}
                    setManualFromAirport={setManualFromAirport}
                    manualToAirport={manualToAirport}
                    setManualToAirport={setManualToAirport}
                    handleSwapLocations={handleSwapLocations}
                    />}
                {step !== 'search' && (
                     <div className="space-y-8">
                        <div className="flex justify-between items-start">
                             <div>
                                {headerInfo?.title && <h1 className="text-3xl md:text-4xl font-bold font-headline">{headerInfo.title}</h1>}
                                {headerInfo?.description && <p className="text-muted-foreground mt-2">{headerInfo.description}</p>}
                            </div>
                        </div>

                        {step === 'results' && <FlightResults onSelectFlight={handleSelectFlight} currency={currency} onCurrencyChange={setCurrency} totalPriceInAED={totalPriceInAED} fromAirportCode={fromAirport === 'Other' ? manualFromAirport : fromAirport} toAirportCode={toAirport === 'Other' ? manualToAirport : toAirport} departureDate={departureDate!} />}
                        {step === 'checkout' && <CheckoutForm onPaymentSuccess={handlePaymentSuccess} currency={currency} passengers={passengers} totalPriceInAED={totalPriceInAED} bookingDetails={bookingData} userProfile={userProfile} />}
                        {step === 'success' && <SuccessPage pnr={pnr || ''} bookingData={bookingData} />}
                    </div>
                )}
            </main>
            <LandingFooter onNavigate={handleNavigate} />
        </div>
    );
}

const HeroSection = ({ onSearch, passengers, onPassengerChange, tripType, setTripType, fromCountry, setFromCountry, toCountry, setToCountry, fromAirport, setFromAirport, toAirport, setToAirport, departureDate, setDepartureDate, returnDate, setReturnDate, manualFromCountry, setManualFromCountry, manualToCountry, setManualToCountry, manualFromAirport, setManualFromAirport, manualToAirport, setManualToAirport, handleSwapLocations }: any) => {
    const [isClient, setIsClient] = useState(false);
    const [showSampleDialog, setShowSampleDialog] = useState(false);
    const [sampleType, setSampleType] = useState<'one-way' | 'return'>('one-way');

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleFromCountryChange = (country: string) => {
        setFromCountry(country);
        if (country !== 'Other') {
            setManualFromCountry('');
            // Auto-select first airport in the country
            const firstAirport = airports.find(a => a.country.toLowerCase() === country.toLowerCase());
            if (firstAirport) {
                setFromAirport(firstAirport.code.toLowerCase());
            } else {
                setFromAirport('');
            }
        } else {
            setFromAirport('');
        }
    };

    const handleToCountryChange = (country: string) => {
        setToCountry(country);
        if (country !== 'Other') {
            setManualToCountry('');
            // Auto-select first airport in the country
            const firstAirport = airports.find(a => a.country.toLowerCase() === country.toLowerCase());
            if (firstAirport) {
                setToAirport(firstAirport.code.toLowerCase());
            } else {
                setToAirport('');
            }
        } else {
            setToAirport('');
        }
    };
    
    const handleFromAirportChange = (airport: string) => {
        setFromAirport(airport);
        if (airport !== 'Other') setManualFromAirport('');
    };

    const handleToAirportChange = (airport: string) => {
        setToAirport(airport);
        if (airport !== 'Other') setManualToAirport('');
    };

    const sampleOneWayData = {
        pnr: "RA2081",
        tripType: 'one-way',
        fromAirport: { code: 'KTM', city: 'Kathmandu', name: 'Tribhuvan Int\'l' },
        toAirport: { code: 'DXB', city: 'Dubai', name: 'Dubai Int\'l' },
        departureDate: new Date(),
        passengers: [{ title: 'Mr', firstName: 'UDAYA RAJ', lastName: 'KHANAL', nationality: 'Nepalese', passportNumber: 'N1234567', bloodGroup: 'O+', eTicketNumber: '157-9876543210' }],
        flightDetails: { airline: 'Nepal Airlines', color: '#CC1F26', flightNumber: 'RA401', departureTime: '06:10', arrivalTime: '09:30', duration: '4h 35m', stops: 'Non-stop' },
        terminal: '1',
        createdAt: new Date(),
        issuedBy: 'OmniTools AI',
        agencyName: 'Nepal Travels & Tours',
        agencyAddress: 'Kathmandu, Nepal'
    };

    const sampleReturnData = {
        ...sampleOneWayData,
        pnr: "QR2082",
        tripType: 'return',
        toAirport: { code: 'LHR', city: 'London', name: 'Heathrow Airport' },
        flightDetails: { airline: 'Qatar Airways', color: '#8A1538', flightNumber: 'QR007', departureTime: '08:45', arrivalTime: '13:20', duration: '7h 35m', stops: 'Non-stop' },
        returnDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        returnFlightDetails: { airline: 'Qatar Airways', color: '#8A1538', flightNumber: 'QR008', departureTime: '15:30', arrivalTime: '06:15', duration: '7h 45m', stops: 'Non-stop' },
    };

    return (
        <>
        <section className="py-8 md:py-16">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                <div className="space-y-4 text-center lg:text-left">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight font-headline">
                        Verifiable Dummy Ticket <br/><span className="text-primary">From AED 100</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0">
                        Get instant verifiable flight reservations with a real PNR code for your visa application process. 
                    </p>
                </div>
                <div>
                    <Card className="glass-card shadow-lg rounded-xl overflow-hidden border">
                        <CardContent className="p-6 space-y-6">
                            {!isClient ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-11 w-full" />
                                    <Skeleton className="h-32 w-full" />
                                    <Skeleton className="h-14 w-full" />
                                    <Skeleton className="h-14 w-full" />
                                    <Skeleton className="h-14 w-full" />
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-lg">
                                        <Button onClick={() => setTripType('one-way')} variant={tripType === 'one-way' ? 'secondary' : 'ghost'} className="h-11 shadow-sm">One Way</Button>
                                        <Button onClick={() => setTripType('return')} variant={tripType === 'return' ? 'secondary' : 'ghost'} className="h-11 shadow-sm">Return</Button>
                                    </div>
                                    <div className="relative flex flex-col sm:flex-row items-stretch gap-4">
                                        <div className="w-full flex-1 space-y-3">
                                            <CountrySelector placeholder="From Country" value={fromCountry} onValueChange={handleFromCountryChange} />
                                            {fromCountry === 'Other' && (
                                                <Input
                                                    placeholder="Enter From Country"
                                                    value={manualFromCountry}
                                                    onChange={(e) => setManualFromCountry(e.target.value)}
                                                    className="h-14 text-base"
                                                />
                                            )}
                                            <AirportSelector placeholder="From Airport" value={fromAirport} onValueChange={handleFromAirportChange} country={fromCountry || manualFromCountry} />
                                            {fromAirport === 'Other' && (
                                                <Input
                                                    placeholder="Enter Airport Code (e.g. JFK)"
                                                    value={manualFromAirport}
                                                    onChange={(e) => setManualFromAirport(e.target.value.toUpperCase())}
                                                    className="h-14 text-base"
                                                    maxLength={3}
                                                />
                                            )}
                                        </div>
                                        <div className="flex items-center justify-center sm:relative">
                                          <div className="sm:absolute sm:left-1/2 sm:-translate-x-1/2 sm:top-1/2 sm:-translate-y-1/2 z-10 my-2 sm:my-0">
                                              <Button onClick={handleSwapLocations} variant="outline" size="icon" className="h-12 w-12 rounded-full bg-background group border-2">
                                                  <RefreshCw className="h-6 w-6 text-muted-foreground transition-transform group-hover:rotate-180"/>
                                              </Button>
                                          </div>
                                        </div>
                                        <div className="w-full flex-1 space-y-3">
                                            <CountrySelector placeholder="To Country" value={toCountry} onValueChange={handleToCountryChange} />
                                            {toCountry === 'Other' && (
                                                <Input
                                                    placeholder="Enter To Country"
                                                    value={manualToCountry}
                                                    onChange={(e) => setManualToCountry(e.target.value)}
                                                    className="h-14 text-base"
                                                />
                                            )}
                                            <AirportSelector placeholder="To Airport" value={toAirport} onValueChange={handleToAirportChange} country={toCountry || manualToCountry} />
                                            {toAirport === 'Other' && (
                                                <Input
                                                    placeholder="Enter Airport Code (e.g. LHR)"
                                                    value={manualToAirport}
                                                    onChange={(e) => setManualToAirport(e.target.value.toUpperCase())}
                                                    className="h-14 text-base"
                                                    maxLength={3}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className={cn("grid gap-4", tripType === 'return' ? 'sm:grid-cols-2' : 'grid-cols-1')}>
                                        <DatePicker placeholder="Departure" date={departureDate} setDate={setDepartureDate} />
                                        {tripType === 'return' && <DatePicker placeholder="Return" date={returnDate} setDate={setReturnDate} />}
                                    </div>
                                    <PassengerSelector adults={passengers.adults} children={passengers.children} infants={passengers.infants} onPassengerChange={onPassengerChange} />
                                    <Button onClick={onSearch} size="lg" className="w-full h-14 text-lg font-bold btn-accent">
                                        <Plane className="mr-2 h-5 w-5" />
                                        Search Flights
                                    </Button>
                                    
                                    <div className="pt-4 border-t border-border/50 text-center space-y-3">
                                        <p className="text-sm font-semibold text-muted-foreground">Preview Samples / नमुना हेर्नुहोस्</p>
                                        <div className="flex gap-2 justify-center">
                                            <Button variant="outline" size="sm" onClick={() => { setSampleType('one-way'); setShowSampleDialog(true); }} className="h-9 px-4 rounded-full">
                                                <Eye className="w-4 h-4 mr-2" /> One Way
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => { setSampleType('return'); setShowSampleDialog(true); }} className="h-9 px-4 rounded-full">
                                                <Eye className="w-4 h-4 mr-2" /> Return
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
        
        <Dialog open={showSampleDialog} onOpenChange={setShowSampleDialog}>
            <DialogContent className="max-w-[900px] max-h-[90vh] overflow-y-auto custom-scrollbar p-6 bg-popover border-border backdrop-blur-xl">
                <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                        <Star className="text-yellow-500" />
                        Sample {sampleType === 'one-way' ? 'One Way' : 'Return'} Ticket
                    </DialogTitle>
                    <DialogDescription>
                        This is a representation of how your final ticket will look after booking.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center">
                    <TicketPreview bookingData={sampleType === 'one-way' ? sampleOneWayData : sampleReturnData} />
                </div>
                <DialogFooter className="mt-8">
                    <Button onClick={() => setShowSampleDialog(false)} variant="secondary" className="w-full sm:w-auto h-12 px-8 font-bold">Close Preview</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <TrustBadges />
        <HowItWorksSection />
        <FaqSection />
        </>
    );
}

const TrustBadges = () => (
    <section className="py-12 md:py-16">
         <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-xl flex-shrink-0">
                    <BadgeCheck className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold font-headline">Real PNR</h3>
                    <p className="text-muted-foreground">Get a genuine flight reservation with a real PNR code, verifiable on airline websites.</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-xl flex-shrink-0">
                    <Zap className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold font-headline">Delivery in Minutes</h3>
                    <p className="text-muted-foreground">Your dummy ticket is generated and sent to your email instantly after booking.</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                 <div className="p-3 bg-primary/10 text-primary rounded-xl flex-shrink-0">
                    <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold font-headline">Visa Accepted</h3>
                    <p className="text-muted-foreground">Our tickets are widely accepted for visa applications worldwide, including Schengen areas.</p>
                </div>
            </div>
        </div>
    </section>
);


const HowItWorksSection = () => (
    <section className="py-12 md:py-20 text-center">
        <h2 className="text-3xl font-bold tracking-tight font-headline">How It Works</h2>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">Get your dummy ticket in three simple steps.</p>
        <div className="grid md:grid-cols-3 gap-8 mt-10 max-w-4xl mx-auto">
            <div className="relative flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold z-10">1</div>
                <h3 className="mt-4 text-lg font-semibold">Search Flights</h3>
                <p className="text-muted-foreground text-sm">Enter your desired route and dates.</p>
            </div>
                <div className="relative flex flex-col items-center">
                <div className="absolute top-8 left-1/2 w-full h-0.5 bg-border hidden md:block" />
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold z-10">2</div>
                <h3 className="mt-4 text-lg font-semibold">Select Reservation</h3>
                <p className="text-muted-foreground text-sm">Choose a flight that suits your needs.</p>
            </div>
                <div className="relative flex flex-col items-center">
                <div className="absolute top-8 left-0 w-1/2 h-0.5 bg-border hidden md:block" />
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold z-10">3</div>
                <h3 className="mt-4 text-lg font-semibold">Pay & Download</h3>
                <p className="text-muted-foreground text-sm">Complete payment and get your ticket.</p>
            </div>
        </div>
    </section>
);

const FaqSection = () => {
    const faqs = [
        { q: "Is this a real, paid ticket?", a: "No, this is a verifiable flight reservation, not a paid ticket. It's designed to show proof of travel plans for visa applications without you having to buy an expensive, non-refundable ticket upfront." },
        { q: "How long is the reservation valid?", a: "Reservations are typically valid for a period ranging from 48 hours to two weeks, depending on the airline. This is usually sufficient time for visa processing." },
        { q: "Can I verify the PNR on the airline's website?", a: "Yes. Each dummy ticket comes with a unique 6-digit PNR code that you can use to check your reservation status directly on the respective airline's official website." },
        { q: "Is this service accepted for Schengen visas?", a: "Absolutely. Providing a flight itinerary is a standard requirement for Schengen and many other visa types. Our service is widely used and accepted for this purpose." }
    ];
    return (
        <section className="py-12 md:py-20 max-w-3xl mx-auto">
             <h2 className="text-3xl font-bold tracking-tight text-center mb-8 font-headline">Frequently Asked Questions</h2>
             <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger className="text-lg text-left">{faq.q}</AccordionTrigger>
                        <AccordionContent className="text-base text-muted-foreground">
                            {faq.a}
                        </AccordionContent>
                    </AccordionItem>
                ))}
             </Accordion>
        </section>
    );
};
