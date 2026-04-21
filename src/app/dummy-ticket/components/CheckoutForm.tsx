
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { ContactDialog } from '@/components/ui/contact-dialog';
import { Coffee, Loader2, UserCheck, Building2, MapPin, Mail, AlertCircle, ShieldCheck, CreditCard } from 'lucide-react';
import { type Currency } from '../page';
import { ScrollArea } from '@/components/ui/scroll-area';
import { nationalities } from '@/lib/cities';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { generatePNR } from '@/lib/pnr';
import { useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

const bloodGroups = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

const passengerSchema = z.object({
    title: z.string(),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    dob: z.string().min(1, 'Date of birth is required'),
    nationality: z.string().min(1, 'Nationality is required'),
    passportNumber: z.string().min(1, 'Passport number is required'),
    passportExpiry: z.string().min(1, 'Passport expiry is required'),
    bloodGroup: z.string().optional(),
});

const formSchema = z.object({
    passengers: z.array(passengerSchema).min(1),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().optional(),
    issuedBy: z.string().optional(),
    agencyName: z.string().optional(),
    agencyAddress: z.string().optional(),
    agreeToEmailTerms: z.boolean().refine(val => val === true, {
        message: "You must agree to the email delivery terms."
    }),
});

type CheckoutFormData = z.infer<typeof formSchema>;

type PaymentMethodType = 'esewa' | 'khalti' | 'global' | 'paypal' | 'bmac' | 'usdt' | null;

const CONVERSION_RATES = {
    AED: 1,
    NPR: 36.5,
    USD: 0.27,
    EUR: 0.25,
    USDT: 0.27,
};

export function CheckoutForm({ onPaymentSuccess, currency, passengers, totalPriceInAED, bookingDetails, userProfile }: { onPaymentSuccess: (bookingData: any) => void, currency: Currency, passengers: {adults: number, children: number, infants: number}, totalPriceInAED: number, bookingDetails: any, userProfile?: any }) {
    
    const numPassengers = passengers.adults + passengers.children + passengers.infants;
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const firestore = useFirestore();

    const form = useForm<CheckoutFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            passengers: Array.from({ length: numPassengers }, () => ({
                title: 'Mr',
                firstName: '',
                lastName: '',
                dob: '',
                nationality: 'Nepalese',
                passportNumber: '',
                passportExpiry: '',
                bloodGroup: '',
            })),
            email: '',
            phone: '',
            issuedBy: 'OmniTools AI',
            agencyName: '',
            agencyAddress: '',
            agreeToEmailTerms: false,
        }
    });

    useEffect(() => {
        if (userProfile) {
            const nameParts = userProfile.name?.split(' ') || [];
            const lastName = nameParts.length > 1 ? nameParts.pop() : '';
            const firstName = nameParts.join(' ');

            form.reset({
                ...form.getValues(),
                email: userProfile.email || '',
                phone: userProfile.phone || '',
                passengers: form.getValues('passengers').map((p, i) => i === 0 ? {
                    ...p,
                    firstName: firstName || p.firstName,
                    lastName: lastName || p.lastName,
                    dob: userProfile.dob || p.dob,
                    nationality: userProfile.nationality || p.nationality,
                    passportNumber: userProfile.passportNumber || p.passportNumber,
                    bloodGroup: userProfile.bloodGroup || p.bloodGroup,
                } : p)
            });
        }
    }, [userProfile, form]);
    
    const [totalPrice, setTotalPrice] = useState(totalPriceInAED * CONVERSION_RATES[currency]);
    const [showContactDialog, setShowContactDialog] = useState(false);
    const [initialPaymentView, setInitialPaymentView] = useState<PaymentMethodType>(null);


    useEffect(() => {
        const newPrice = totalPriceInAED * CONVERSION_RATES[currency];
        setTotalPrice(newPrice);
    }, [currency, totalPriceInAED]);
    
    const onSubmit = async (data: CheckoutFormData) => {
        setIsSubmitting(true);
        toast({title: 'Creating your booking request...'});
        
        const pnr = generatePNR();
        const passengersWithEtickets = data.passengers.map((p: any) => ({
            ...p,
            eTicketNumber: `157-${Math.floor(1000000000 + Math.random() * 9000000000)}`
        }));
        
        const terminal = `${Math.ceil(Math.random() * 4)}`;
        const creationDate = new Date();
        const bookingId = `dummy-${pnr}`;

        // Sanitize data for Firestore (replace undefined with null)
        const fullBookingData = {
            ...bookingDetails,
            id: bookingId,
            pnr,
            fromAirport: bookingDetails.fromAirport.code,
            toAirport: bookingDetails.toAirport.code,
            passengers: passengersWithEtickets,
            contactEmail: data.email,
            contactPhone: data.phone || null,
            issuedBy: data.issuedBy || 'OmniTools AI',
            agencyName: data.agencyName || null,
            agencyAddress: data.agencyAddress || null,
            totalPriceInAED,
            currency,
            userId: userProfile?.id || 'anonymous',
            terminal,
            createdAt: creationDate.toISOString(),
            status: 'pending',
            // Convert Dates to ISO strings and handle undefined returnDate
            departureDate: bookingDetails.departureDate instanceof Date ? bookingDetails.departureDate.toISOString() : bookingDetails.departureDate,
            returnDate: (bookingDetails.returnDate && bookingDetails.returnDate instanceof Date) ? bookingDetails.returnDate.toISOString() : null,
        };
        
        try {
            const bookingRef = doc(firestore, 'dummyBookings', bookingId);
            await setDoc(bookingRef, fullBookingData);

            toast({ title: "Request Received!", description: "Proceed to payment to confirm your booking."});
            
            onPaymentSuccess({
                ...fullBookingData,
                fromAirport: bookingDetails.fromAirport, 
                toAirport: bookingDetails.toAirport,
                flightDetails: bookingDetails.flightDetails,
            });
        } catch (error: any) {
            console.error("Booking creation error:", error);
            toast({
                variant: 'destructive',
                title: 'Booking Failed',
                description: error.message
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePaymentClick = (method: PaymentMethodType) => {
        if (method === 'paypal') {
            window.open('https://www.paypal.com/paypalme/UdayaRaj35', '_blank', 'noopener,noreferrer');
            return;
        }
        if (method === 'bmac') {
            window.open('https://buymeacoffee.com/udayaraj', '_blank', 'noopener,noreferrer');
            return;
        }
        setInitialPaymentView(method);
        setShowContactDialog(true);
    };
    
    const getPassengerLabel = (index: number) => {
        if (index < passengers.adults) return `Adult ${index + 1}`;
        if (index < passengers.adults + passengers.children) return `Child ${index - passengers.adults + 1}`;
        return `Infant ${index - passengers.adults - passengers.children + 1}`;
    }

    return (
        <>
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <Card className="border">
                                <CardHeader>
                                    <CardTitle className="font-headline">Passenger Details</CardTitle>
                                    <CardDescription>Enter details for each traveler. Information is auto-filled if available in your profile.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {form.getValues('passengers').map((_, index) => (
                                        <div key={index} className="space-y-4 p-4 border rounded-lg bg-background">
                                            <h4 className="font-semibold font-headline">{getPassengerLabel(index)}</h4>
                                            <div className="grid sm:grid-cols-3 gap-4">
                                                <FormField control={form.control} name={`passengers.${index}.title`} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Title</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                            <SelectContent><SelectItem value="Mr">Mr</SelectItem><SelectItem value="Mrs">Mrs</SelectItem><SelectItem value="Miss">Miss</SelectItem></SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )} />
                                                <FormField control={form.control} name={`passengers.${index}.firstName`} render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={form.control} name={`passengers.${index}.lastName`} render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            </div>
                                            <div className="grid sm:grid-cols-3 gap-4">
                                                <FormField control={form.control} name={`passengers.${index}.dob`} render={({ field }) => (<FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={form.control} name={`passengers.${index}.nationality`} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Nationality</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl><SelectTrigger><SelectValue placeholder="Select Nationality" /></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                <ScrollArea className="h-72">
                                                                    {nationalities.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                                                                </ScrollArea>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <FormField control={form.control} name={`passengers.${index}.bloodGroup`} render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Blood Group (Opt.)</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl><SelectTrigger><SelectValue placeholder="Select Group" /></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                {bloodGroups.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )} />
                                            </div>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <FormField control={form.control} name={`passengers.${index}.passportNumber`} render={({ field }) => (<FormItem><FormLabel>Passport Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={form.control} name={`passengers.${index}.passportExpiry`} render={({ field }) => (<FormItem><FormLabel>Passport Expiry</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card className="border">
                                <CardHeader>
                                    <CardTitle className="font-headline">Issuance & Agency Details</CardTitle>
                                    <CardDescription>Details for the ticket issuance and travel agency info.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="agencyName" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Travel Agency Name</FormLabel>
                                                <div className="relative">
                                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <FormControl><Input {...field} className="pl-10" placeholder="e.g. Nepal Travels & Tours" /></FormControl>
                                                </div>
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="agencyAddress" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Agency Address</FormLabel>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <FormControl><Input {...field} className="pl-10" placeholder="e.g. Kathmandu, Nepal" /></FormControl>
                                                </div>
                                            </FormItem>
                                        )} />
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Contact Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Contact Phone</FormLabel><FormControl><Input type="tel" {...field} /></FormControl></FormItem>)} />
                                    </div>
                                    <FormField control={form.control} name="issuedBy" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Issued By (Signature Text)</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input {...field} className="pl-10" placeholder="e.g. OmniTools AI or Your Name" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </CardContent>
                            </Card>

                            <Card className="border border-primary/20 bg-primary/5">
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                        <div className="space-y-3">
                                            <p className="text-sm font-semibold leading-none">Important Delivery Information</p>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                After successful payment, your official dummy ticket will be sent to your email within 5 to 10 minutes. Please ensure your email address is correct.
                                            </p>
                                            <FormField
                                                control={form.control}
                                                name="agreeToEmailTerms"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                        <div className="space-y-1 leading-none">
                                                            <FormLabel className="text-xs font-bold text-foreground cursor-pointer">
                                                                I agree that my ticket will be delivered to my email within 5-10 minutes after payment verification.
                                                            </FormLabel>
                                                            <FormMessage />
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Button type="submit" size="lg" className="w-full h-14 text-lg font-bold btn-accent" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting Request...</>
                                ) : (
                                    <><ShieldCheck className="mr-2 h-5 w-5" /> Proceed to Confirmation</>
                                )}
                            </Button>
                        </form>
                    </Form>
                </div>
                <div className="lg:col-span-1">
                    <Card className="sticky top-24 border shadow-xl">
                        <CardHeader className="bg-muted/30">
                            <CardTitle className="font-headline flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-primary" /> Order Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Payment Currency</span>
                                <span className="font-semibold text-base">{currency}</span>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                {passengers.adults > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Adults ({passengers.adults})</span><span>{currency} {(passengers.adults * 100 * CONVERSION_RATES[currency]).toFixed(2)}</span></div>}
                                {passengers.children > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Children ({passengers.children})</span><span>{currency} {(passengers.children * 80 * CONVERSION_RATES[currency]).toFixed(2)}</span></div>}
                                {passengers.infants > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Infants ({passengers.infants})</span><span>{currency} {(passengers.infants * 50 * CONVERSION_RATES[currency]).toFixed(2)}</span></div>}
                            </div>
                            
                            <div className="flex justify-between font-bold text-xl border-t pt-4 text-primary">
                                <span>Total Price</span>
                                <span>{currency} {totalPrice.toFixed(2)}</span>
                            </div>

                             <div className="space-y-3 pt-6">
                                <p className="text-xs font-bold text-center uppercase tracking-widest text-muted-foreground">Available Payment Gateways</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button type="button" onClick={() => handlePaymentClick('esewa')} className="p-2 flex items-center justify-center rounded-xl hover:bg-primary/5 transition-all border border-border hover:border-primary/50 h-16 group">
                                        <Image src="https://i.imgur.com/robpgw7.png" alt="eSewa" width={80} height={30} className="object-contain group-hover:scale-110 transition-transform" />
                                    </button>
                                    <button type="button" onClick={() => handlePaymentClick('khalti')} className="p-2 flex items-center justify-center rounded-xl hover:bg-primary/5 transition-all border border-border hover:border-primary/50 h-16 group">
                                        <Image src="https://i.imgur.com/YJP9q4j.png" alt="Khalti" width={90} height={30} className="object-contain group-hover:scale-110 transition-transform" />
                                    </button>
                                    <button type="button" onClick={() => handlePaymentClick('global')} className="p-2 flex items-center justify-center rounded-xl hover:bg-primary/5 transition-all border border-border hover:border-primary/50 h-16 group">
                                        <Image src="https://i.imgur.com/4t6FtIr.png" alt="Global IME Bank" width={40} height={40} className="object-contain group-hover:scale-110 transition-transform" />
                                    </button>
                                    <button type="button" onClick={() => handlePaymentClick('paypal')} className="p-2 flex items-center justify-center rounded-xl hover:bg-primary/5 transition-all border border-border hover:border-primary/50 h-16 group">
                                        <Image src="https://www.paypalobjects.com/webstatic/mktg/logo/bdg_now_accepting_pp_2line_w.png" alt="PayPal" width={100} height={40} className="object-contain group-hover:scale-110 transition-transform" />
                                    </button>
                                </div>
                                <button type="button" onClick={() => handlePaymentClick('bmac')} className="w-full p-2 flex items-center justify-center gap-2 rounded-xl hover:bg-yellow-500/10 transition-all border border-border hover:border-yellow-500/50 h-16 group">
                                    <Coffee className="h-8 w-8 text-yellow-500 group-hover:rotate-12 transition-transform" />
                                    <span className="font-bold">Buy Me a Coffee</span>
                                </button>
                                <button type="button" onClick={() => handlePaymentClick('usdt')} className="w-full p-2 flex items-center justify-center gap-2 rounded-xl hover:bg-emerald-500/10 transition-all border border-border hover:border-emerald-500/50 h-16 group">
                                    <Image src="https://i.imgur.com/T2nJ1jA.png" alt="USDT (Tether)" width={32} height={32} className="object-contain group-hover:scale-110 transition-transform" />
                                    <span className="font-bold">Pay with USDT</span>
                                </button>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground justify-center pt-2">
                                <Mail className="h-3 w-3" /> Automated Email Delivery Enabled
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <ContactDialog open={showContactDialog} onOpenChange={setShowContactDialog} initialView={initialPaymentView} />
        </>
    );
}
