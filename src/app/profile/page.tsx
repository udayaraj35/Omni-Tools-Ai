'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Loader2, User, Mail, Phone, MapPin, LogOut, ArrowLeft, Save, Briefcase, ShieldCheck, LayoutDashboard, Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { useToast } from '@/hooks/use-toast';
import { signOut, getAuth } from 'firebase/auth'; 
import { cn, clearUserSessionData } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { nationalities, worldCountries, countriesWithCities } from '@/lib/cities';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

const ADMIN_EMAIL = "udayarajkhanal21@gmail.com";

const commonJobTitles = [ "Accountant", "Actor", "Architect", "Baker", "Barista", "Bartender", "Beautician", "Bellboy", "Bus Driver", "Butcher", "Carpenter", "Cashier", "Chef", "Cleaner", "Construction Worker", "Cook", "Customer Service Representative", "Data Entry Clerk", "Delivery Driver", "Designer", "Dishwasher", "Doctor", "Electrician", "Engineer", "Farmer", "Fashion Designer", "Firefighter", "Fisherman", "Flight Attendant", "Florist", "Foreman", "Forklift Operator", "Factory Worker", "General Helper", "Graphic Designer", "Hairdresser", "Heavy Driver", "Heavy Equipment Operator", "Heavy Trailer Driver", "Hotel Manager", "Housekeeper", "Human Resources Manager", "IT Specialist", "Janitor", "Journalist", "Laborer", "Landscaper", "Laundry Worker", "Lawyer", "Librarian", "Lifeguard", "Light Vehicle Driver", "Line Cook", "Machine Operator", "Maid", "Maintenance Worker", "Manager", "Marketing Manager", "Mason", "Mechanic", "Motorcycle Driver", "Nanny", "Nurse", "Office Assistant", "Painter", "Packer", "Pharmacist", "Photographer", "Pilot", "Plumber", "Police Officer", "Porter", "Project Manager", "Real Estate Agent", "Receptionist", "Sales Associate", "Sales Manager", "Scientist", "Seaman", "Security Guard", "Server", "Software Developer", "Storekeeper", "Supervisor", "Tailor", "Taxi Driver", "Teacher", "Technician", "Telemarketer", "Tile Fitter", "Tour Guide", "Translator", "Travel Agent", "Truck Driver", "Waiter", "Waitress", "Warehouse Worker", "Welder", "Writer", "Other" ];
const genders = ["Male", "Female", "Other"];
const bloodGroups = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

const experienceSchema = z.object({
    jobTitle: z.string().optional(),
    company: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isCurrent: z.boolean().optional(),
    duties: z.string().optional(),
});
const educationSchema = z.object({
    degree: z.string().optional(),
    university: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    startDate: z.string().optional(),
    passingYear: z.string().optional(),
});
const trainingSchema = z.object({
    title: z.string().optional(),
    institution: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});
const languageSchema = z.object({
    language: z.string().optional(),
    listening: z.string().optional(),
    reading: z.string().optional(),
    spokenInteraction: z.string().optional(),
    spokenProduction: z.string().optional(),
    writing: z.string().optional(),
});

const profileSchema = z.object({
    name: z.string().min(1, 'Full name is required.'),
    email: z.string().email(),
    phone: z.string().optional(),
    dob: z.string().optional(),
    nationality: z.string().optional(),
    manualNationality: z.string().optional(),
    linkedin: z.string().url().optional().or(z.literal('')),
    facebook: z.string().url().optional().or(z.literal('')),
    whatsapp: z.string().optional(),
    currentJob: z.string().optional(),
    manualCurrentJob: z.string().optional(),
    passportNumber: z.string().optional(),
    permanentStreetAddress: z.string().optional(),
    permanentCity: z.string().optional(),
    manualPermanentCity: z.string().optional(),
    permanentCountry: z.string().optional(),
    manualPermanentCountry: z.string().optional(),
    permanentPostalCode: z.string().optional(),
    currentStreetAddress: z.string().optional(),
    currentCity: z.string().optional(),
    manualCurrentCity: z.string().optional(),
    currentCountry: z.string().optional(),
    manualCurrentCountry: z.string().optional(),
    currentPostalCode: z.string().optional(),
    bloodGroup: z.string().optional(),
    gender: z.string().optional(),
    placeOfBirth: z.string().optional(),
    countryOfBirth: z.string().optional(),
    manualPlaceOfBirth: z.string().optional(),
    manualCountryOfBirth: z.string().optional(),
    professionalSummary: z.string().optional(),
    skills: z.array(z.string()).optional(),
    motherLanguage: z.string().optional(),
    experience: z.array(experienceSchema).optional(),
    education: z.array(educationSchema).optional(),
    training: z.array(trainingSchema).optional(),
    languages: z.array(languageSchema).optional(),
    photoURL: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const defaultProfileValues: ProfileFormData = {
    name: '', email: '', phone: '', dob: '', nationality: '', manualNationality: '', linkedin: '', facebook: '', whatsapp: '',
    currentJob: '', manualCurrentJob: '', passportNumber: '', permanentStreetAddress: '', permanentCity: '', manualPermanentCity: '', permanentCountry: '', manualPermanentCountry: '', permanentPostalCode: '',
    currentStreetAddress: '', currentCity: '', manualCurrentCity: '', currentCountry: '', manualCurrentCountry: '', currentPostalCode: '', bloodGroup: '', gender: '', 
    placeOfBirth: '', countryOfBirth: '', manualPlaceOfBirth: '', manualCountryOfBirth: '',
    professionalSummary: '', skills: [], motherLanguage: '',
    experience: [], education: [], training: [], languages: [],
    photoURL: '',
};

const sanitizeData = (data: any, defaults: any): any => {
    if (data === null || typeof data !== 'object') return { ...defaults };
    const sanitized = { ...defaults };
    for (const key in defaults) {
        if (Object.prototype.hasOwnProperty.call(data, key) && data[key] !== null && data[key] !== undefined) {
            sanitized[key] = data[key];
        }
    }
    return sanitized;
};

export default function ProfilePage() {
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const auth = getAuth();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isAdmin = user?.email === ADMIN_EMAIL;

    useEffect(() => {
        if (!isUserLoading && user && isAdmin) {
            router.replace('/admin/dashboard');
        }
    }, [user, isUserLoading, isAdmin, router]);

    const userDocRef = useMemoFirebase(() => (user ? doc(firestore, 'users', user.uid) : null), [user, firestore]);
    const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);
    
    const form = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: defaultProfileValues
    });
    
    const countryOfBirth = form.watch('countryOfBirth');
    const permanentCountry = form.watch('permanentCountry');
    const currentCountry = form.watch('currentCountry');

    const birthCities = useMemo(() => countriesWithCities.find(c => c.country === countryOfBirth)?.cities || [], [countryOfBirth]);
    const permanentCities = useMemo(() => countriesWithCities.find(c => c.country === permanentCountry)?.cities || [], [permanentCountry]);
    const currentCities = useMemo(() => countriesWithCities.find(c => c.country === currentCountry)?.cities || [], [currentCountry]);

    useEffect(() => {
        if (isUserLoading || isProfileLoading) return;
        if (!user) {
            router.push('/login');
            return;
        }
        if (isAdmin) return; // Wait for the main redirect

        let dataToSet;
        if (userProfile) {
            dataToSet = sanitizeData(userProfile, defaultProfileValues);
        } else {
            dataToSet = {
                ...defaultProfileValues,
                name: user.displayName || '',
                email: user.email || '',
                photoURL: user.photoURL || '',
            };
        }
        form.reset(dataToSet);
        if (dataToSet.photoURL) setPhotoPreview(dataToSet.photoURL);
    }, [user, userProfile, isUserLoading, isProfileLoading, router, form, isAdmin]);
    
    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                setPhotoPreview(dataUrl);
                form.setValue('photoURL', dataUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            clearUserSessionData();
            toast({ title: 'Logged out successfully.' });
            router.push('/');
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Logout Failed', description: error.message });
        }
    };
    
    const onSubmit = async (data: ProfileFormData) => {
        if (!user) return;
        setIsSaving(true);
        const userRef = doc(firestore, 'users', user.uid);
        try {
            await setDoc(userRef, data, { merge: true });
            toast({ title: "Profile Updated", description: "Your information has been saved successfully." });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Save Failed", description: error.message });
        } finally {
            setIsSaving(false);
        }
    };

    if (isUserLoading || isProfileLoading || isAdmin) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!user) return null;

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
             <Navbar onNavigate={p => router.push(p)} />
             <main className="flex-1 container mx-auto py-10 md:py-16 px-4">
                 <button onClick={() => router.back()} className="animated-border-card inline-block mb-10">
                    <span className={cn("inner-span flex items-center back-to-home-button")}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </span>
                </button>

                <div className="max-w-4xl mx-auto space-y-8">
                    <Card className="glass-card border-border shadow-2xl rounded-[3rem] overflow-hidden">
                        <CardHeader className="text-center pb-10 border-b border-border bg-muted/20">
                            <div className="relative w-28 h-28 mx-auto mb-6 group">
                                <Avatar className="w-28 h-28 border-4 border-primary shadow-2xl">
                                    <AvatarImage src={photoPreview || user.photoURL || undefined} alt={userProfile?.name || 'User'} className="object-cover" />
                                    <AvatarFallback className="text-4xl font-black bg-zinc-800 text-primary">
                                        {form.getValues('name')?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <Button
                                    type="button"
                                    size="icon"
                                    className="absolute bottom-0 right-0 h-10 w-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity gradient-button-gold shadow-lg"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="h-5 w-5" />
                                </Button>
                                <Input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                            </div>
                            <h2 className="text-3xl font-black uppercase italic tracking-tight text-foreground">Personal Studio Profile</h2>
                            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.4em] mt-2">OmniTools AI Ecosystem Authorization</p>
                        </CardHeader>
                        
                        <CardContent className="p-8">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                                    <Accordion type="multiple" defaultValue={['personal']} className="w-full space-y-4">
                                        <AccordionItem value="personal" className="border-border">
                                            <AccordionTrigger className="text-sm font-black uppercase tracking-widest text-primary py-6">
                                                <span className="flex items-center gap-3"><User className="w-5 h-5"/> Identity & Biometrics</span>
                                            </AccordionTrigger>
                                            <AccordionContent className="space-y-6 pt-4 text-left">
                                                <FormField control={form.control} name="name" render={({ field }) => (
                                                    <FormItem><FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Full Legal Name</FormLabel><FormControl><Input {...field} className="h-12 bg-background border-border rounded-xl" /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                    <FormField control={form.control} name="dob" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Date of Birth</FormLabel><FormControl><Input type="date" {...field} className="h-12 bg-background border-border rounded-xl" /></FormControl></FormItem>)} />
                                                    <FormField control={form.control} name="gender" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Gender</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-12 bg-background border-border rounded-xl"><SelectValue placeholder="Select Gender"/></SelectTrigger></FormControl><SelectContent className="bg-popover text-popover-foreground border-border">{genders.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select>
                                                        </FormItem>
                                                    )} />
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                    <FormField control={form.control} name="nationality" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Nationality</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-12 bg-background border-border rounded-xl"><SelectValue placeholder="Select Nationality"/></SelectTrigger></FormControl><SelectContent className="bg-popover text-popover-foreground border-border"><ScrollArea className="h-64">{nationalities.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</ScrollArea></SelectContent></Select>
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={form.control} name="bloodGroup" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Blood Group</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-12 bg-background border-border rounded-xl"><SelectValue placeholder="Select Group"/></SelectTrigger></FormControl><SelectContent className="bg-popover text-popover-foreground border-border">{bloodGroups.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent></Select>
                                                        </FormItem>
                                                    )} />
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>

                                        <AccordionItem value="contact" className="border-border">
                                            <AccordionTrigger className="text-sm font-black uppercase tracking-widest text-primary py-6">
                                                <span className="flex items-center gap-3"><Phone className="w-5 h-5"/> Communication Hub</span>
                                            </AccordionTrigger>
                                            <AccordionContent className="space-y-6 pt-4 text-left">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                    <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Authorized Email</FormLabel><FormControl><Input type="email" {...field} disabled className="h-12 bg-muted text-muted-foreground border-border rounded-xl cursor-not-allowed" /></FormControl></FormItem>)} />
                                                    <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Phone Number</FormLabel><FormControl><Input {...field} className="h-12 bg-background border-border rounded-xl" /></FormControl></FormItem>)} />
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                    <FormField control={form.control} name="whatsapp" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">WhatsApp</FormLabel><FormControl><Input {...field} className="h-12 bg-background border-border rounded-xl" /></FormControl></FormItem>)} />
                                                    <FormField control={form.control} name="linkedin" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">LinkedIn Profile URL</FormLabel><FormControl><Input {...field} className="h-12 bg-background border-border rounded-xl" /></FormControl></FormItem>)} />
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>

                                        <AccordionItem value="address" className="border-border">
                                            <AccordionTrigger className="text-sm font-black uppercase tracking-widest text-primary py-6">
                                                <span className="flex items-center gap-3"><MapPin className="w-5 h-5"/> Residential History</span>
                                            </AccordionTrigger>
                                            <AccordionContent className="space-y-10 pt-4 text-left">
                                                <div className="space-y-6">
                                                    <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground border-l-4 border-primary pl-3">Permanent Address (Nepal)</h4>
                                                    <FormField control={form.control} name="permanentStreetAddress" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Street / Village</FormLabel><FormControl><Input {...field} className="h-12 bg-background border-border rounded-xl" /></FormControl></FormItem>)} />
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                        <FormField control={form.control} name="permanentCountry" render={({ field }) => ( <FormItem> <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Country</FormLabel> <Select onValueChange={(value) => { field.onChange(value); form.setValue('permanentCity', ''); }} value={field.value || ''}> <FormControl><SelectTrigger className="h-12 bg-background border-border rounded-xl"><SelectValue placeholder="Select Country"/></SelectTrigger></FormControl> <SelectContent className="bg-popover text-popover-foreground border-border"><ScrollArea className="h-64">{worldCountries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</ScrollArea></SelectContent> </Select> </FormItem> )}/>
                                                        <FormField control={form.control} name="permanentCity" render={({ field }) => ( <FormItem> <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">City / District</FormLabel> <Select onValueChange={field.onChange} value={field.value || ''} disabled={permanentCities.length === 0}> <FormControl><SelectTrigger className="h-12 bg-background border-border rounded-xl"><SelectValue placeholder="Select City"/></SelectTrigger></FormControl> <SelectContent className="bg-popover text-popover-foreground border-border"><ScrollArea className="h-64">{permanentCities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</ScrollArea></SelectContent> </Select> </FormItem> )}/>
                                                    </div>
                                                </div>
                                                
                                                <Separator className="bg-border" />

                                                <div className="space-y-6">
                                                    <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground border-l-4 border-accent pl-3">Current Address (Abroad)</h4>
                                                    <FormField control={form.control} name="currentStreetAddress" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Current Street / Flat No.</FormLabel><FormControl><Input {...field} className="h-12 bg-background border-border rounded-xl" /></FormControl></FormItem>)} />
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                        <FormField control={form.control} name="currentCountry" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Current Country</FormLabel><Select onValueChange={(value) => { field.onChange(value); form.setValue('currentCity', ''); }} value={field.value || ''}><FormControl><SelectTrigger className="h-12 bg-background border-border rounded-xl"><SelectValue placeholder="Select Country"/></SelectTrigger></FormControl><SelectContent className="bg-popover text-popover-foreground border-border"><ScrollArea className="h-64">{worldCountries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</ScrollArea></SelectContent></Select></FormItem>)}/>
                                                        <FormField control={form.control} name="currentCity" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Current City</FormLabel><Select onValueChange={field.onChange} value={field.value || ''} disabled={currentCities.length === 0}><FormControl><SelectTrigger className="h-12 bg-background border-border rounded-xl"><SelectValue placeholder="Select City"/></SelectTrigger></FormControl><SelectContent className="bg-popover text-popover-foreground border-border"><ScrollArea className="h-64">{currentCities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</ScrollArea></SelectContent></Select></FormItem>)} />
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>

                                        <AccordionItem value="professional" className="border-border">
                                            <AccordionTrigger className="text-sm font-black uppercase tracking-widest text-primary py-6">
                                                <span className="flex items-center gap-3"><Briefcase className="w-5 h-5"/> Career & Skillset</span>
                                            </AccordionTrigger>
                                            <AccordionContent className="space-y-6 pt-4 text-left">
                                                <FormField control={form.control} name="currentJob" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Current Occupation / Target Role</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-12 bg-background border-border rounded-xl"><SelectValue placeholder="Select Job Title"/></SelectTrigger></FormControl><SelectContent className="bg-popover text-popover-foreground border-border"><ScrollArea className="h-64">{commonJobTitles.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</ScrollArea></SelectContent></Select>
                                                    </FormItem>
                                                )} />
                                                <FormField control={form.control} name="professionalSummary" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Professional Summary (Auto-fills CV Builder)</FormLabel>
                                                        <FormControl><Textarea rows={6} {...field} className="bg-background border-border rounded-2xl resize-none p-4 text-sm leading-relaxed" placeholder="Briefly describe your expertise..." /></FormControl>
                                                    </FormItem>
                                                )} />
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>

                                    <div className="pt-6">
                                        <Button type="submit" className="w-full h-16 text-xl font-black uppercase tracking-[0.2em] gradient-button-gold rounded-[1.5rem] shadow-2xl transition-transform active:scale-95" disabled={isSaving}>
                                            {isSaving ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Save className="mr-2 h-6 w-6" />}
                                            SAVE STUDIO PROFILE
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                            
                            <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row gap-4">
                                <Button onClick={handleLogout} variant="ghost" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 hover:text-red-400">
                                    <LogOut className="mr-3 h-5 w-5" /> Logout & Clean History
                                </Button>
                                <Button onClick={() => router.push('/')} variant="outline" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest border-border text-muted-foreground hover:text-foreground hover:bg-accent">
                                    <ArrowLeft className="mr-3 h-5 w-5" /> Back to Workspace
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
             </main>
             <LandingFooter onNavigate={p => router.push(p)}/>
        </div>
    );
}
