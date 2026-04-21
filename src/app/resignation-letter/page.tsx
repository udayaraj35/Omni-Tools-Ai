'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Loader2, ArrowLeft, Download, FileText, User, 
    Building, Briefcase, Calendar, Palette, Sparkles, 
    MapPin, Mail, Phone, Printer, CheckCircle2, ShieldCheck,
    Type, Layers, PenTool, X, Lock, Unlock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { format } from 'date-fns';
import Image from 'next/image';

const formSchema = z.object({
  fullName: z.string().min(1, 'Full name is required.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().min(1, 'Phone number is required.'),
  currentAddress: z.string().optional(),
  
  jobTitle: z.string().min(1, 'Your job title is required.'),
  companyName: z.string().min(1, 'Company name is required.'),
  companyAddress: z.string().optional(),
  
  recipientName: z.string().min(1, 'Manager/HR name is required.'),
  recipientTitle: z.string().min(1, 'Recipient title is required.'),
  
  resignationDate: z.string().min(1, 'Date is required.'),
  lastWorkingDay: z.string().min(1, 'Last working day is required.'),
  reason: z.string().optional(),
  additionalNotes: z.string().optional(),
  
  templateStyle: z.string().default('modern'),
  fontFamily: z.string().default('Poppins, sans-serif'),
  templateColor: z.string().default('#003366'),
  paperStyle: z.string().default('standard'),
  signature: z.any().optional(),
});

type ResignationFormData = z.infer<typeof formSchema>;

const fontOptions = [
    { name: 'Modern Poppins', value: "'Poppins', sans-serif" },
    { name: 'Arial Standard', value: 'Arial, sans-serif' },
    { name: 'Classic Serif', value: "'Times New Roman', Times, serif" },
    { name: 'Professional Garamond', value: 'Garamond, serif' },
    { name: 'Clean Montserrat', value: "'Montserrat', sans-serif" },
];

const paperStyles: Record<string, string> = {
    standard: 'bg-white',
    cream: 'bg-[#FFFDD0]',
    lokta: 'bg-[#EAE0D5]',
};

export default function ResignationLetterPage() {
    const { toast } = useToast();
    const router = useRouter();
    const letterPreviewRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
    const [lockSignature, setLockSignature] = useState(false);
    const [lockStamp, setLockStamp] = useState(false);

    const { user } = useUser();
    const firestore = useFirestore();
    const userDocRef = useMemoFirebase(() => (user ? doc(firestore, 'users', user.uid) : null), [user, firestore]);
    const { data: userProfile } = useDoc<any>(userDocRef);

    const form = useForm<ResignationFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: '',
            email: '',
            phone: '',
            currentAddress: '',
            jobTitle: '',
            companyName: '',
            companyAddress: '',
            recipientName: '',
            recipientTitle: 'HR Manager',
            resignationDate: new Date().toISOString().split('T')[0],
            lastWorkingDay: '',
            reason: 'I am writing to formally resign from my position. I have decided to move on to a new opportunity that aligns more closely with my long-term career goals.',
            additionalNotes: 'I want to thank you for the opportunity to work at the company. I have enjoyed my time here and appreciate the support I have received.',
            templateStyle: 'modern',
            fontFamily: "'Poppins', sans-serif",
            templateColor: '#003366',
            paperStyle: 'standard',
        },
    });

    useEffect(() => {
        if (userProfile) {
            form.setValue('fullName', userProfile.name || '');
            form.setValue('email', userProfile.email || '');
            form.setValue('phone', userProfile.phone || '');
            form.setValue('jobTitle', userProfile.currentJob || '');
            const addr = [userProfile.currentStreetAddress, userProfile.currentCity, userProfile.currentCountry].filter(Boolean).join(', ');
            form.setValue('currentAddress', addr);
        }
    }, [userProfile, form]);

    const watchedValues = form.watch();

    const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setSignaturePreview(result);
                form.setValue('signature', result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDownload = async () => {
        if (!letterPreviewRef.current) return;
        setIsLoading(true);
        toast({ title: 'Generating Studio PDF...', description: 'Optimizing letter layout for export.' });
        
        try {
            const { default: html2canvas } = await import('html2canvas');
            const { default: jsPDF } = await import('jspdf');
            
            const canvas = await html2canvas(letterPreviewRef.current, { scale: 3, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
            pdf.save(`Resignation_Letter_${watchedValues.fullName || 'Draft'}.pdf`);
            toast({ title: 'Download Successful!', description: 'Your resignation letter has been saved.' });
        } catch (e) {
            toast({ variant: 'destructive', title: 'Export failed' });
        } finally {
            setIsLoading(false);
        }
    };

    const letterDateFormatted = watchedValues.resignationDate 
        ? format(new Date(watchedValues.resignationDate), 'MMMM dd, yyyy')
        : format(new Date(), 'MMMM dd, yyyy');

    const lastDayFormatted = watchedValues.lastWorkingDay
        ? format(new Date(watchedValues.lastWorkingDay), 'MMMM dd, yyyy')
        : '[Date]';

    const renderLetterContent = () => {
        const data = watchedValues;
        
        const closingBlock = `
            <div style="margin-top: 1.5rem;">
                <p style="margin-bottom: 0.25rem;">Sincerely,</p>
                ${signaturePreview ? `<div style="margin: 0.5rem 0;"><img src="${signaturePreview}" style="max-height: 50px; max-width: 180px; object-fit: contain;" /></div>` : '<div style="margin: 1.5rem 0; border-bottom: 1px solid #ddd; width: 180px;"></div>'}
                <p style="margin: 0; font-weight: bold; font-size: 1.05rem;">${data.fullName || '[Your Name]'}</p>
                <div style="margin-top: 0.25rem; font-size: 0.85rem; color: #666; line-height: 1.3;">
                    ${data.phone ? `<p style="margin: 0;">${data.phone}</p>` : ''}
                    ${data.email ? `<p style="margin: 0;">${data.email}</p>` : ''}
                </div>
            </div>
        `;

        const body = `
            <p style="margin-bottom: 1rem;">${letterDateFormatted}</p>
            
            <div style="margin-bottom: 1.5rem;">
                <p style="margin: 0;"><b>${data.recipientName || '[Recipient Name]'}</b></p>
                <p style="margin: 0;">${data.recipientTitle || '[Title]'}</p>
                <p style="margin: 0;">${data.companyName || '[Company Name]'}</p>
                <p style="margin: 0;">${data.companyAddress || '[Company Address]'}</p>
            </div>

            <p style="margin-bottom: 1rem;">Dear ${data.recipientName || 'Manager'},</p>

            <p style="margin-bottom: 1rem; text-align: justify;">
                Please accept this letter as formal notification that I am resigning from my position as <b>${data.jobTitle || '[Job Title]'}</b> at <b>${data.companyName || '[Company Name]'}</b>. 
                My last day of employment will be <b>${lastDayFormatted}</b>.
            </p>

            <p style="margin-bottom: 1rem; text-align: justify;">
                ${data.reason || 'I have decided to pursue other opportunities.'}
            </p>

            <p style="margin-bottom: 1rem; text-align: justify;">
                ${data.additionalNotes || 'I appreciate the opportunities I’ve had while working at the company and wish the team the very best.'}
            </p>

            <p style="margin-bottom: 1rem; text-align: justify;">
                During my remaining time here, I will do my best to complete my current tasks and assist in handing over my responsibilities to other team members to ensure a smooth transition.
            </p>

            ${closingBlock}
        `;

        if (data.templateStyle === 'modern') {
            return (
                <div style={{ fontFamily: data.fontFamily, fontSize: '10.5pt', color: '#1a1a1a', lineHeight: 1.5 }}>
                    <header style={{ borderLeft: `6px solid ${data.templateColor}`, paddingLeft: '1.25rem', marginBottom: '1.5rem' }}>
                        <h1 style={{ fontSize: '24pt', fontWeight: '900', margin: 0, color: data.templateColor, letterSpacing: '-0.02em' }}>{data.fullName.toUpperCase() || 'YOUR NAME'}</h1>
                        <p style={{ fontSize: '9pt', fontWeight: 'bold', color: '#666', marginTop: '0.15rem', letterSpacing: '0.05em' }}>{data.currentAddress || 'STREET ADDRESS, CITY, COUNTRY'}</p>
                    </header>
                    <div dangerouslySetInnerHTML={{ __html: body }} />
                </div>
            );
        }

        if (data.templateStyle === 'classic') {
            return (
                <div style={{ fontFamily: data.fontFamily, fontSize: '11pt', color: '#000', lineHeight: 1.4 }}>
                    <div style={{ textAlign: 'right', marginBottom: '2rem' }}>
                        <p style={{ fontWeight: 'bold', margin: 0 }}>{data.fullName || 'YOUR NAME'}</p>
                        <p style={{ margin: 0 }}>{data.currentAddress}</p>
                        <p style={{ margin: 0 }}>{data.phone}</p>
                        <p style={{ margin: 0 }}>{data.email}</p>
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: body }} />
                </div>
            );
        }

        return (
            <div style={{ fontFamily: data.fontFamily, fontSize: '10.5pt', color: '#333', lineHeight: 1.5 }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                    <h1 style={{ fontSize: '20pt', fontWeight: 'bold', margin: 0 }}>{data.fullName || 'YOUR NAME'}</h1>
                    <p style={{ fontSize: '9pt', color: '#888', marginTop: '0.25rem' }}>{data.email} | {data.phone}</p>
                </div>
                <div dangerouslySetInnerHTML={{ __html: body }} />
            </div>
        );
    };

    const handleNavigate = (path: string) => router.push(path.startsWith('/') ? path : `/#${path}`);

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Navbar onNavigate={handleNavigate} />
            <main className="flex-1 container mx-auto py-8 px-4 md:px-10">
                <button onClick={() => router.push('/')} className="animated-border-card inline-block mb-6">
                    <span className={cn("inner-span flex items-center back-to-home-button")}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</span>
                </button>
                
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-glow-primary font-headline uppercase italic leading-none">Resignation Maker Pro</h1>
                    <p className="text-muted-foreground font-bold uppercase tracking-[0.4em] text-[10px] mt-4">A4 Precision Layout • Minimalist Design • Studio PDF</p>
                </div>

                <div className="grid lg:grid-cols-12 gap-10 items-start">
                    {/* INPUTS COLUMN */}
                    <div className="lg:col-span-5 space-y-6">
                        <Card className="glass-card border-border shadow-2xl rounded-[2.5rem] overflow-hidden p-1">
                            <CardHeader className="bg-muted/30 border-b border-border p-8">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-3">
                                    <FileText className="w-4 h-4" /> Document Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <Form {...form}>
                                    <Tabs defaultValue="profile" className="w-full">
                                        <TabsList className="grid w-full grid-cols-4 bg-muted h-14 p-1 rounded-2xl mb-8">
                                            <TabsTrigger value="profile" title="My Info" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black"><User className="w-4 h-4"/></TabsTrigger>
                                            <TabsTrigger value="company" title="Company" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black"><Building className="w-4 h-4"/></TabsTrigger>
                                            <TabsTrigger value="letter" title="Letter" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black"><Briefcase className="w-4 h-4"/></TabsTrigger>
                                            <TabsTrigger value="design" title="Style" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black"><Palette className="w-4 h-4"/></TabsTrigger>
                                        </TabsList>

                                        <ScrollArea className="h-[55vh] pr-4 text-left">
                                            <TabsContent value="profile" className="space-y-6 mt-0">
                                                <FormField control={form.control} name="fullName" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase text-zinc-500">Full Legal Name</FormLabel><FormControl><Input {...field} className="h-12 rounded-xl" /></FormControl></FormItem>)} />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase text-zinc-500">Email</FormLabel><FormControl><Input {...field} className="h-12 rounded-xl" /></FormControl></FormItem>)} />
                                                    <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase text-zinc-500">Phone</FormLabel><FormControl><Input {...field} className="h-12 rounded-xl" /></FormControl></FormItem>)} />
                                                </div>
                                                <FormField control={form.control} name="currentAddress" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase text-zinc-500">Your Address</FormLabel><FormControl><Textarea {...field} rows={3} className="rounded-2xl" /></FormControl></FormItem>)} />
                                                
                                                <div className="space-y-3 pt-4">
                                                    <Label className="text-[10px] font-bold uppercase text-zinc-500">Digital Signature</Label>
                                                    <div className="flex items-center gap-4">
                                                        {signaturePreview ? (
                                                            <div className="relative group">
                                                                <div className="bg-white p-2 rounded-xl shadow-lg border border-border">
                                                                    <img src={signaturePreview} alt="Signature" className="h-12 w-auto object-contain" />
                                                                </div>
                                                                <Button size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => setSignaturePreview(null)}><X className="h-3 w-3"/></Button>
                                                            </div>
                                                        ) : (
                                                            <Button asChild variant="outline" className="w-full h-12 border-dashed rounded-xl gap-2 font-bold text-xs">
                                                                <label className="cursor-pointer flex items-center justify-center w-full h-full">
                                                                    <PenTool className="w-4 h-4" /> Upload Signature
                                                                    <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
                                                                </label>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="company" className="space-y-6 mt-0">
                                                <FormField control={form.control} name="companyName" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase text-zinc-500">Company Name</FormLabel><FormControl><Input {...field} className="h-12 rounded-xl" /></FormControl></FormItem>)} />
                                                <FormField control={form.control} name="jobTitle" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase text-zinc-500">Your Job Position</FormLabel><FormControl><Input {...field} className="h-12 rounded-xl" /></FormControl></FormItem>)} />
                                                <Separator className="bg-border" />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField control={form.control} name="recipientName" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase text-zinc-500">Manager/HR Name</FormLabel><FormControl><Input {...field} className="h-12 rounded-xl" /></FormControl></FormItem>)} />
                                                    <FormField control={form.control} name="recipientTitle" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase text-zinc-500">Recipient Title</FormLabel><FormControl><Input {...field} className="h-12 rounded-xl" /></FormControl></FormItem>)} />
                                                </div>
                                                <FormField control={form.control} name="companyAddress" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase text-zinc-500">Company Address</FormLabel><FormControl><Textarea {...field} rows={2} className="rounded-xl text-xs" /></FormControl></FormItem>)} />
                                            </TabsContent>

                                            <TabsContent value="letter" className="space-y-6 mt-0">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField control={form.control} name="resignationDate" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase text-zinc-500">Date of Notice</FormLabel><FormControl><Input type="date" {...field} className="h-12 rounded-xl" /></FormControl></FormItem>)} />
                                                    <FormField control={form.control} name="lastWorkingDay" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase text-zinc-500">Last Working Day</FormLabel><FormControl><Input type="date" {...field} className="h-12 rounded-xl" /></FormControl></FormItem>)} />
                                                </div>
                                                <FormField control={form.control} name="reason" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase text-zinc-500">Reason for Resigning</FormLabel><FormControl><Textarea {...field} rows={4} className="rounded-2xl" /></FormControl></FormItem>)} />
                                                <FormField control={form.control} name="additionalNotes" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase text-zinc-500">Gratitude / Additional Notes</FormLabel><FormControl><Textarea {...field} rows={4} className="rounded-2xl" /></FormControl></FormItem>)} />
                                            </TabsContent>

                                            <TabsContent value="design" className="space-y-8 mt-0">
                                                <div className="p-6 bg-muted/30 border border-border rounded-3xl space-y-6">
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <div className="space-y-3">
                                                            <Label className="text-[9px] uppercase font-black text-zinc-500 tracking-widest">Layout Node</Label>
                                                            <Select value={watchedValues.templateStyle} onValueChange={v => form.setValue('templateStyle', v)}>
                                                                <SelectTrigger className="h-12 rounded-xl text-xs font-black"><SelectValue /></SelectTrigger>
                                                                <SelectContent className="bg-popover border-border">
                                                                    <SelectItem value="modern">Modern Professional</SelectItem>
                                                                    <SelectItem value="classic">Classic Formal</SelectItem>
                                                                    <SelectItem value="minimal">Simple Clean</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <Label className="text-[9px] uppercase font-black text-zinc-500 tracking-widest">Theme Color</Label>
                                                            <Input type="color" value={watchedValues.templateColor} onChange={e => form.setValue('templateColor', e.target.value)} className="h-12 p-1 rounded-xl cursor-pointer" />
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="space-y-3">
                                                        <Label className="text-[9px] uppercase font-black text-zinc-500 tracking-widest">Typography Cluster</Label>
                                                        <Select value={watchedValues.fontFamily} onValueChange={v => form.setValue('fontFamily', v)}>
                                                            <SelectTrigger className="h-12 rounded-xl text-xs font-bold"><SelectValue /></SelectTrigger>
                                                            <SelectContent className="bg-popover border-border">
                                                                {fontOptions.map(f => <SelectItem key={f.value} value={f.value} style={{fontFamily: f.value}}>{f.name}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <Label className="text-[9px] uppercase font-black text-zinc-500 tracking-widest">Paper Texture</Label>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {Object.keys(paperStyles).map(style => (
                                                                <Button key={style} variant={watchedValues.paperStyle === style ? 'default' : 'outline'} onClick={() => form.setValue('paperStyle', style)} className="h-10 text-[8px] uppercase font-black">
                                                                    {style}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TabsContent>
                                        </ScrollArea>
                                    </Tabs>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* PREVIEW COLUMN */}
                    <div className="lg:col-span-7 flex flex-col items-center">
                        <div className="w-full bg-muted/30 p-1.5 rounded-[3.5rem] border border-border shadow-2xl backdrop-blur-xl relative">
                            <div className="absolute -top-4 -right-4 z-50">
                                <Badge className="bg-primary text-primary-foreground font-black uppercase px-6 py-2 rounded-full tracking-widest shadow-2xl">Studio Preview Node</Badge>
                            </div>
                            
                            <ScrollArea className="h-[85vh] w-full p-6 md:p-12">
                                <div 
                                    ref={letterPreviewRef} 
                                    className={cn("w-full mx-auto aspect-[210/297] text-black shadow-[0_80px_150px_rgba(0,0,0,0.1)] dark:shadow-[0_80px_150px_rgba(0,0,0,1)] relative flex flex-col overflow-hidden", paperStyles[watchedValues.paperStyle])}
                                    style={{ fontFamily: watchedValues.fontFamily, padding: '1cm 1.5cm' }}
                                >
                                    <div className="relative z-10 flex-1 flex flex-col">
                                        {renderLetterContent()}
                                    </div>

                                    <footer className="mt-auto pt-6 text-center border-t border-black/5 opacity-30 select-none grayscale">
                                        <p className="text-[7px] font-black uppercase tracking-[0.5em] text-gray-400">Verified System Node • OmniTools AI Studio • Depart Responsibly</p>
                                    </footer>
                                </div>
                            </ScrollArea>
                        </div>

                        {/* EXPORT HUB */}
                        <div className="w-full mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto px-4">
                            <Button onClick={handleDownload} disabled={isLoading} size="lg" className="h-20 text-xl font-black uppercase tracking-[0.2em] gradient-button-gold rounded-[1.5rem] shadow-2xl group transition-all hover:scale-[1.02]">
                                {isLoading ? <Loader2 className="animate-spin mr-4 h-8 w-8" /> : <Download className="mr-4 h-8 w-8 group-hover:translate-y-1 transition-transform" />}
                                EXPORT STUDIO PDF
                            </Button>
                            <Button variant="outline" size="lg" onClick={() => window.print()} className="h-20 text-base font-black uppercase tracking-[0.3em] border-border bg-card hover:bg-accent rounded-[1.5rem] gap-4 shadow-xl">
                                <Printer className="w-7 h-7 text-primary" /> SYSTEM PRINT
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
            <LandingFooter onNavigate={handleNavigate} />
        </div>
    );
}
