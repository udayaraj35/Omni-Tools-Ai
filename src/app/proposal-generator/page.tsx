'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
    Loader2, ArrowLeft, Download, Plus, Trash2, Printer, 
    Palette, Building, User, FileText, ClipboardList, 
    DollarSign, Calendar, Globe, MapPin, Mail, Phone, 
    Sparkles, ShieldCheck, Lock, Unlock, X, LayoutTemplate,
    Clock, Award, Briefcase, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const budgetItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  amount: z.coerce.number().min(0).default(0),
});

const proposalFormSchema = z.object({
  proposalType: z.string().min(1, 'Proposal type is required'),
  proposalTitle: z.string().min(1, 'Proposal title is required'),
  proposalDate: z.string().min(1, 'Date is required'),
  
  companyName: z.string().min(1, 'Company name is required'),
  companyAddress: z.string().optional(),
  companyWebsite: z.string().url().optional().or(z.literal('')),
  companyPhone: z.string().optional(),
  companyEmail: z.string().email().optional().or(z.literal('')),
  
  clientName: z.string().min(1, 'Client name is required'),
  clientCompany: z.string().optional(),
  clientAddress: z.string().optional(),
  
  executiveSummary: z.string().optional(),
  scopeOfWork: z.string().optional(),
  timeline: z.string().optional(),
  
  budgetItems: z.array(budgetItemSchema).optional(),
  currency: z.string().default('USD'),
  
  paymentTerms: z.string().optional(),
  termsConditions: z.string().optional(),
  
  signatoryName: z.string().optional(),
  signatoryPosition: z.string().optional(),
  manualSignatoryPosition: z.string().optional(),
});

type ProposalFormData = z.infer<typeof proposalFormSchema>;

const proposalTypes = [
  "Business Proposal", "Project Proposal", "Service Proposal",
  "Financial Proposal", "Partnership Proposal", "Marketing Proposal", "Technical Proposal"
];

const fontOptions = [
    { name: 'Standard Arial', value: 'Arial, sans-serif' },
    { name: 'Classic Serif', value: "'Times New Roman', Times, serif" },
    { name: 'Professional Garamond', value: 'Garamond, serif' },
    { name: 'Modern Poppins', value: "'Poppins', sans-serif" },
    { name: 'Clean Montserrat', value: "'Montserrat', sans-serif" },
];

const layoutOptions = [
    { id: 'standard', name: 'Standard (Classic)' },
    { id: 'sidebar', name: 'Modern Sidebar' },
    { id: 'minimal', name: 'Clean Minimalist' },
    { id: 'corporate', name: 'Pro Corporate' },
];

const useDraggable = (elRef: React.RefObject<HTMLElement | null>, onDrag: (pos: { x: number, y: number }) => void, isLocked: boolean) => {
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const elStartRef = useRef({ x: 0, y: 0 });

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (isLocked) return;
        e.preventDefault();
        e.stopPropagation();
        if (!elRef.current) return;
        isDraggingRef.current = true;
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        const { x, y } = elRef.current.getBoundingClientRect();
        const parentRect = elRef.current.parentElement!.getBoundingClientRect();
        elStartRef.current = { x: x - parentRect.left, y: y - parentRect.top };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDraggingRef.current || !elRef.current?.parentElement) return;
            const dx = (e.clientX - dragStartRef.current.x);
            const dy = (e.clientY - dragStartRef.current.y);
            onDrag({ x: elStartRef.current.x + dx, y: elStartRef.current.y + dy });
        };

        const handleMouseUp = () => {
            isDraggingRef.current = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [elRef, onDrag, isLocked]);

    return { onMouseDown: handleMouseDown };
};

export default function ProposalGeneratorPage() {
    const { toast } = useToast();
    const router = useRouter();
    const previewRef = useRef<HTMLDivElement>(null);
    const stampRef = useRef<HTMLDivElement>(null);
    const signatureRef = useRef<HTMLDivElement>(null);

    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
    const [stampPreview, setStampPreview] = useState<string | null>(null);
    const [templateColor, setTemplateColor] = useState('#1e88e5');
    const [fontFamily, setFontFamily] = useState(fontOptions[3].value);
    const [proposalLayout, setProposalLayout] = useState('standard');
    
    const [stampPosition, setStampPosition] = useState({ x: 80, y: 85 });
    const [signaturePosition, setSignaturePosition] = useState({ x: 20, y: 85 });
    const [lockStamp, setLockStamp] = useState(false);
    const [lockSignature, setLockSignature] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<ProposalFormData>({
        resolver: zodResolver(proposalFormSchema),
        defaultValues: {
            proposalType: 'Business Proposal',
            proposalTitle: '',
            proposalDate: new Date().toISOString().split('T')[0],
            companyName: '',
            companyAddress: '',
            companyWebsite: '',
            clientName: '',
            clientCompany: '',
            clientAddress: '',
            executiveSummary: '',
            scopeOfWork: '',
            timeline: '',
            budgetItems: [{ name: '', amount: 0 }],
            currency: 'USD',
            paymentTerms: '50% upfront payment, 50% upon completion.',
            termsConditions: 'This proposal is valid for 30 days from the date of issuance.',
            signatoryName: '',
            signatoryPosition: 'Director',
        },
    });

    const { user } = useUser();
    const firestore = useFirestore();
    const userDocRef = useMemoFirebase(() => (user ? doc(firestore, 'users', user.uid) : null), [user, firestore]);
    const { data: userProfile } = useDoc<any>(userDocRef);

    useEffect(() => {
        if (userProfile) {
            form.setValue('signatoryName', userProfile.name || '');
            form.setValue('companyName', userProfile.currentJob || '');
        }
    }, [userProfile, form]);

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "budgetItems",
    });

    const watchedValues = form.watch();

    const totalAmount = useMemo(() => {
        return (watchedValues.budgetItems || []).reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    }, [watchedValues.budgetItems]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string | null) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setter(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const onStampDrag = useCallback((pos: { x: number, y: number }) => {
        if (!previewRef.current) return;
        const rect = previewRef.current.getBoundingClientRect();
        setStampPosition({
            x: Math.max(0, Math.min((pos.x / rect.width) * 100, 100)),
            y: Math.max(0, Math.min((pos.y / rect.height) * 100, 100))
        });
    }, []);
    const { onMouseDown: onStampMouseDown } = useDraggable(stampRef, onStampDrag, lockStamp);

    const onSignatureDrag = useCallback((pos: { x: number, y: number }) => {
        if (!previewRef.current) return;
        const rect = previewRef.current.getBoundingClientRect();
        setSignaturePosition({
            x: Math.max(0, Math.min((pos.x / rect.width) * 100, 100)),
            y: Math.max(0, Math.min((pos.y / rect.height) * 100, 100))
        });
    }, []);
    const { onMouseDown: onSignatureMouseDown } = useDraggable(signatureRef, onSignatureDrag, lockSignature);

    const handleDownload = async () => {
        if (!previewRef.current) return;
        setIsLoading(true);
        toast({ title: 'Optimizing & Generating PDF...' });
        
        try {
            const { default: html2canvas } = await import('html2canvas');
            const { default: jsPDF } = await import('jspdf');
            
            const canvas = await html2canvas(previewRef.current, { scale: 3, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
            pdf.save(`Proposal-${watchedValues.proposalTitle || 'Draft'}.pdf`);
            toast({ title: 'Download Successful!' });
        } catch (e) {
            toast({ variant: 'destructive', title: 'Export failed' });
        } finally {
            setIsLoading(false);
        }
    };

    const letterDate = watchedValues.proposalDate
        ? new Date(watchedValues.proposalDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Navbar onNavigate={(p) => router.push(p)} />
            <main className="flex-1 container mx-auto py-8 px-4">
                <button onClick={() => router.push('/')} className="animated-border-card inline-block mb-6">
                    <span className={cn("inner-span flex items-center back-to-home-button")}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                    </span>
                </button>
                
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-glow-primary font-headline uppercase italic leading-none">Smart Proposal Studio</h1>
                    <p className="text-muted-foreground font-bold uppercase tracking-[0.4em] text-[10px] mt-2">B2B Standards • Dynamic Content • Professional Export</p>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    {/* INPUTS COLUMN */}
                    <div className="lg:col-span-5 space-y-6">
                        <Card className="glass-card border-border shadow-2xl rounded-[2.5rem] overflow-hidden p-1">
                            <CardHeader className="bg-muted/30 border-b border-border p-6">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4" /> Proposal Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <Form {...form}>
                                    <Tabs defaultValue="company" className="w-full">
                                        <TabsList className="grid w-full grid-cols-5 bg-muted h-14 p-1 rounded-xl mb-6">
                                            <TabsTrigger value="company" title="Company"><Building className="w-4 h-4"/></TabsTrigger>
                                            <TabsTrigger value="client" title="Client"><User className="w-4 h-4"/></TabsTrigger>
                                            <TabsTrigger value="content" title="Content"><FileText className="w-4 h-4"/></TabsTrigger>
                                            <TabsTrigger value="budget" title="Budget"><DollarSign className="w-4 h-4"/></TabsTrigger>
                                            <TabsTrigger value="design" title="Styles"><Palette className="w-4 h-4"/></TabsTrigger>
                                        </TabsList>

                                        <ScrollArea className="h-[60vh] pr-4">
                                            <TabsContent value="company" className="space-y-6 mt-0">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField control={form.control} name="proposalType" render={({ field }) => (
                                                        <FormItem className="col-span-2">
                                                            <FormLabel className="text-[10px] font-bold uppercase">Proposal Category</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger></FormControl>
                                                                <SelectContent className="bg-popover border-border">
                                                                    {proposalTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={form.control} name="proposalTitle" render={({ field }) => (<FormItem className="col-span-2"><FormLabel className="text-[10px] font-bold uppercase">Proposal Title</FormLabel><FormControl><Input {...field} placeholder="Project Name / Goal" className="h-12 rounded-xl" /></FormControl></FormItem>)} />
                                                    <FormField control={form.control} name="proposalDate" render={({ field }) => (<FormItem className="col-span-2"><FormLabel className="text-[10px] font-bold uppercase">Date of Issuance</FormLabel><FormControl><Input type="date" {...field} className="h-12 rounded-xl" /></FormControl></FormItem>)} />
                                                </div>
                                                <Separator className="bg-border" />
                                                <FormField control={form.control} name="companyName" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase">Your Organization</FormLabel><FormControl><Input {...field} className="h-12 rounded-xl" /></FormControl></FormItem>)} />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormItem><FormLabel className="text-[10px] font-bold uppercase">Brand Logo</FormLabel><Input type="file" accept="image/*" onChange={e => handleFileUpload(e, setLogoPreview)} className="h-12 text-xs" /></FormItem>
                                                    <FormItem><FormLabel className="text-[10px] font-bold uppercase">Official Stamp</FormLabel><Input type="file" accept="image/*" onChange={e => handleFileUpload(e, setStampPreview)} className="h-12 text-xs" /></FormItem>
                                                </div>
                                                <FormField control={form.control} name="companyAddress" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase">HQ Address</FormLabel><FormControl><Textarea {...field} rows={2} className="rounded-xl text-xs" /></FormControl></FormItem>)} />
                                            </TabsContent>

                                            <TabsContent value="client" className="space-y-6 mt-0">
                                                <FormField control={form.control} name="clientName" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase">Recipient Name</FormLabel><FormControl><Input {...field} className="h-12 rounded-xl" /></FormControl></FormItem>)} />
                                                <FormField control={form.control} name="clientCompany" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase">Recipient Organization</FormLabel><FormControl><Input {...field} className="h-12 rounded-xl" /></FormControl></FormItem>)} />
                                                <FormField control={form.control} name="clientAddress" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase">Client Address</FormLabel><FormControl><Textarea {...field} rows={3} className="rounded-xl text-xs" /></FormControl></FormItem>)} />
                                            </TabsContent>

                                            <TabsContent value="content" className="space-y-6 mt-0">
                                                <FormField control={form.control} name="executiveSummary" render={({ field }) => (
                                                    <FormItem><FormLabel className="text-[10px] font-bold uppercase flex items-center gap-2"><Sparkles className="w-3 h-3 text-primary"/> Executive Summary</FormLabel><FormControl><Textarea {...field} rows={6} className="rounded-2xl text-xs leading-relaxed" placeholder="Summarize the core value proposition..." /></FormControl></FormItem>
                                                )} />
                                                <FormField control={form.control} name="scopeOfWork" render={({ field }) => (
                                                    <FormItem><FormLabel className="text-[10px] font-bold uppercase">Scope of Work</FormLabel><FormControl><Textarea {...field} rows={6} className="rounded-2xl text-xs leading-relaxed" placeholder="Detail the deliverables and objectives..." /></FormControl></FormItem>
                                                )} />
                                                <FormField control={form.control} name="timeline" render={({ field }) => (
                                                    <FormItem><FormLabel className="text-[10px] font-bold uppercase">Project Timeline</FormLabel><FormControl><Textarea {...field} rows={4} className="rounded-2xl text-xs" placeholder="Milestones and expected completion..." /></FormControl></FormItem>
                                                )} />
                                            </TabsContent>

                                            <TabsContent value="budget" className="space-y-6 mt-0">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-[10px] font-black uppercase text-zinc-500">Financial Breakdown</Label>
                                                    <Select value={watchedValues.currency} onValueChange={v => form.setValue('currency', v)}>
                                                        <SelectTrigger className="w-24 h-8 text-[10px] font-black uppercase"><SelectValue /></SelectTrigger>
                                                        <SelectContent className="bg-popover border-border">
                                                            <SelectItem value="USD">USD</SelectItem>
                                                            <SelectItem value="EUR">EUR</SelectItem>
                                                            <SelectItem value="NPR">NPR</SelectItem>
                                                            <SelectItem value="AED">AED</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                {fields.map((field, index) => (
                                                    <div key={field.id} className="grid grid-cols-12 gap-3 bg-muted/30 p-4 rounded-2xl border border-border relative group">
                                                        <div className="col-span-8">
                                                            <FormField control={form.control} name={`budgetItems.${index}.name`} render={({ field }) => (<Input {...field} placeholder="Service/Item Name" className="h-10 text-xs rounded-lg" />)} />
                                                        </div>
                                                        <div className="col-span-3">
                                                            <FormField control={form.control} name={`budgetItems.${index}.amount`} render={({ field }) => (<Input type="number" {...field} className="h-10 text-xs rounded-lg font-bold" />)} />
                                                        </div>
                                                        <div className="col-span-1 flex items-center justify-center">
                                                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4"/></Button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <Button type="button" variant="outline" onClick={() => append({ name: '', amount: 0 })} className="w-full h-12 border-dashed rounded-xl font-black uppercase text-[10px]">+ Add Budget Item</Button>
                                                
                                                <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl flex justify-between items-center">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Project Total Cost</span>
                                                    <span className="text-2xl font-black italic">{watchedValues.currency} {totalAmount.toLocaleString()}</span>
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="design" className="space-y-8 mt-0 text-left">
                                                <div className="p-6 bg-muted/30 border border-border rounded-[2rem] space-y-6">
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <div className="space-y-3">
                                                            <Label className="text-[9px] uppercase font-black text-zinc-500 tracking-widest">Layout Engine</Label>
                                                            <Select value={proposalLayout} onValueChange={setProposalLayout}>
                                                                <SelectTrigger className="h-12 rounded-xl text-xs font-black"><SelectValue /></SelectTrigger>
                                                                <SelectContent className="bg-popover border-border">
                                                                    {layoutOptions.map(opt => <SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>)}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <Label className="text-[9px] uppercase font-black text-zinc-500 tracking-widest">Theme Accent</Label>
                                                            <Input type="color" value={templateColor} onChange={e => setTemplateColor(e.target.value)} className="h-12 p-1 rounded-xl cursor-pointer" />
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="space-y-3">
                                                        <Label className="text-[9px] uppercase font-black text-zinc-500 tracking-widest">Typography Cluster</Label>
                                                        <Select value={fontFamily} onValueChange={setFontFamily}>
                                                            <SelectTrigger className="h-12 rounded-xl text-xs font-bold"><SelectValue /></SelectTrigger>
                                                            <SelectContent className="bg-popover border-border">
                                                                {fontOptions.map(f => <SelectItem key={f.value} value={f.value} style={{fontFamily: f.value}}>{f.name}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <Separator className="bg-border" />

                                                    <div className="space-y-4">
                                                        <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Digital Authentication</Label>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="flex items-center justify-between p-3 bg-muted rounded-xl border border-border">
                                                                <span className="text-[10px] font-bold uppercase text-zinc-500 flex items-center gap-2">{lockSignature ? <Lock className="w-3 h-3"/> : <Unlock className="w-3 h-3"/>} Signature</span>
                                                                <Switch checked={lockSignature} onCheckedChange={setLockSignature} />
                                                            </div>
                                                            <div className="flex items-center justify-between p-3 bg-muted rounded-xl border border-border">
                                                                <span className="text-[10px] font-bold uppercase text-zinc-500 flex items-center gap-2">{lockStamp ? <Lock className="w-3 h-3"/> : <Unlock className="w-3 h-3"/>} Stamp</span>
                                                                <Switch checked={lockStamp} onCheckedChange={setLockStamp} />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <FormItem><FormLabel className="text-[9px] font-bold uppercase">Signature</FormLabel><Input type="file" accept="image/*" onChange={e => handleFileUpload(e, setSignaturePreview)} className="h-10 text-[10px]" /></FormItem>
                                                            <FormItem><FormLabel className="text-[9px] font-bold uppercase">Stamp</FormLabel><Input type="file" accept="image/*" onChange={e => handleFileUpload(e, setStampPreview)} className="h-10 text-[10px]" /></FormItem>
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
                                    ref={previewRef} 
                                    className={cn("w-full mx-auto aspect-[210/297] bg-white text-black shadow-[0_80px_150px_rgba(0,0,0,0.1)] dark:shadow-[0_80px_150px_rgba(0,0,0,1)] relative flex flex-col overflow-hidden")}
                                    style={{ fontFamily, fontSize: '11pt', padding: proposalLayout === 'sidebar' ? '0' : '1.5cm' }}
                                >
                                    {/* BACKGROUND WATERMARK */}
                                    <div className="absolute inset-0 pointer-events-none opacity-[0.02] select-none z-0 overflow-hidden flex flex-wrap justify-center items-center gap-20">
                                        {Array.from({length: 12}).map((_, i) => (
                                            <div key={i} className="whitespace-nowrap font-black text-5xl -rotate-45 uppercase">PROPOSAL • OMNITOOLS AI</div>
                                        ))}
                                    </div>

                                    {/* LAYOUT LOGIC */}
                                    {proposalLayout === 'sidebar' ? (
                                        <div className="flex h-full relative z-10">
                                            <div className="w-1/3 p-10 h-full text-white space-y-10" style={{ backgroundColor: templateColor }}>
                                                {logoPreview && <div className="relative w-full aspect-video"><Image src={logoPreview} alt="Logo" fill className="object-contain filter brightness-0 invert" unoptimized /></div>}
                                                <div className="space-y-6">
                                                    <div>
                                                        <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Company Node</p>
                                                        <h2 className="text-xl font-black uppercase">{watchedValues.companyName || 'ORGANIZATION'}</h2>
                                                        <p className="text-[10px] font-medium leading-relaxed mt-2 opacity-80">{watchedValues.companyAddress}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Client Hub</p>
                                                        <h3 className="text-lg font-black uppercase">{watchedValues.clientName}</h3>
                                                        <p className="text-[10px] font-medium opacity-80 mt-1">{watchedValues.clientCompany}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-auto pt-20">
                                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Verified via OmniTools AI</p>
                                                </div>
                                            </div>
                                            <div className="w-2/3 p-12 space-y-8 flex flex-col">
                                                <div className="text-right border-b pb-6" style={{ borderColor: templateColor }}>
                                                    <h1 className="text-4xl font-black tracking-tighter italic uppercase leading-none" style={{ color: templateColor }}>{watchedValues.proposalType}</h1>
                                                    <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase">Ref: {watchedValues.proposalTitle || 'DRAFT'}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">{letterDate}</p>
                                                </div>
                                                <div className="space-y-8 flex-1">
                                                    {watchedValues.executiveSummary && (
                                                        <div className="space-y-2">
                                                            <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2" style={{ color: templateColor }}><Briefcase className="w-3 h-3"/> Executive Summary</h4>
                                                            <p className="text-xs leading-relaxed text-gray-600 text-justify">{watchedValues.executiveSummary}</p>
                                                        </div>
                                                    )}
                                                    {watchedValues.scopeOfWork && (
                                                        <div className="space-y-2">
                                                            <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2" style={{ color: templateColor }}><Settings2 className="w-3 h-3"/> Scope of Work</h4>
                                                            <p className="text-xs leading-relaxed text-gray-600 text-justify">{watchedValues.scopeOfWork}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative z-10 flex-1 flex flex-col space-y-10">
                                            {/* Header */}
                                            <div className="flex justify-between items-start border-b-2 pb-8" style={{ borderColor: templateColor }}>
                                                <div className="space-y-4">
                                                    {logoPreview ? (
                                                        <div className="relative w-40 h-20"><Image src={logoPreview} alt="Logo" fill className="object-contain" unoptimized /></div>
                                                    ) : (
                                                        <h2 className="text-3xl font-black uppercase italic" style={{ color: templateColor }}>{watchedValues.companyName || 'COMPANY NAME'}</h2>
                                                    )}
                                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                        <p className="flex items-center gap-2"><MapPin className="w-3 h-3 text-primary"/> {watchedValues.companyAddress}</p>
                                                        {watchedValues.companyWebsite && <p className="flex items-center gap-2 mt-1"><Globe className="w-3 h-3 text-primary"/> {watchedValues.companyWebsite}</p>}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <Badge variant="outline" className="border-primary text-primary font-black uppercase px-4 mb-4 tracking-widest">{watchedValues.proposalType}</Badge>
                                                    <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">{watchedValues.proposalTitle || 'PROPOSAL'}</h1>
                                                    <p className="text-xs font-black text-gray-400 mt-4 uppercase">ISSUED: {letterDate}</p>
                                                </div>
                                            </div>

                                            {/* Client Section */}
                                            <div className="grid grid-cols-2 gap-10">
                                                <div className="p-6 bg-black/5 rounded-2xl border border-black/5">
                                                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-400 mb-3">Prepared For:</p>
                                                    <h3 className="text-xl font-black text-gray-900 leading-none uppercase">{watchedValues.clientName || 'GUEST CLIENT'}</h3>
                                                    {watchedValues.clientCompany && <p className="text-sm font-bold text-gray-600 mt-1 uppercase tracking-tight">{watchedValues.clientCompany}</p>}
                                                    <p className="text-[10px] text-gray-500 mt-3 leading-relaxed font-medium">{watchedValues.clientAddress}</p>
                                                </div>
                                                <div className="flex flex-col justify-center">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase italic">"Ensuring precision and quality in every milestone."</p>
                                                </div>
                                            </div>

                                            {/* Core Sections */}
                                            <div className="space-y-10 flex-1">
                                                {watchedValues.executiveSummary && (
                                                    <div className="space-y-3">
                                                        <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-2" style={{ color: templateColor }}><Briefcase className="w-4 h-4"/> Executive Summary</h4>
                                                        <p className="text-xs leading-relaxed text-gray-700 text-justify whitespace-pre-wrap">{watchedValues.executiveSummary}</p>
                                                    </div>
                                                )}

                                                {watchedValues.scopeOfWork && (
                                                    <div className="space-y-3">
                                                        <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-2" style={{ color: templateColor }}><Settings2 className="w-4 h-4"/> Scope of Work</h4>
                                                        <p className="text-xs leading-relaxed text-gray-700 text-justify whitespace-pre-wrap">{watchedValues.scopeOfWork}</p>
                                                    </div>
                                                )}

                                                {watchedValues.budgetItems && watchedValues.budgetItems.length > 0 && (
                                                    <div className="space-y-4">
                                                        <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-2" style={{ color: templateColor }}><DollarSign className="w-4 h-4"/> Budget Breakdown</h4>
                                                        <table className="w-full text-[10pt] border-collapse">
                                                            <thead>
                                                                <tr className="bg-gray-900 text-white font-black uppercase text-[9px] tracking-widest">
                                                                    <th className="p-4 text-left rounded-tl-xl">Service Item / Task</th>
                                                                    <th className="p-4 text-right rounded-tr-xl">Allocation ({watchedValues.currency})</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {watchedValues.budgetItems.map((item, i) => (
                                                                    <tr key={i} className="border-b border-gray-100">
                                                                        <td className="p-4 font-bold text-gray-800">{item.name || 'Unnamed Item'}</td>
                                                                        <td className="p-4 text-right font-black">{item.amount?.toLocaleString()}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                            <tfoot>
                                                                <tr className="bg-gray-50 font-black">
                                                                    <td className="p-4 text-right uppercase text-[9px] tracking-widest text-gray-500">Proposed Investment:</td>
                                                                    <td className="p-4 text-right text-xl italic" style={{ color: templateColor }}>{watchedValues.currency} {totalAmount.toLocaleString()}</td>
                                                                </tr>
                                                            </tfoot>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Signatures */}
                                            <div className="pt-10 grid grid-cols-2 gap-10 border-t border-gray-100">
                                                <div className="space-y-4">
                                                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50 relative min-h-[120px]">
                                                        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-300 mb-auto">CLIENT APPROVAL</p>
                                                        <p className="mt-auto text-[10px] font-bold text-gray-400 uppercase italic">Date & Signature</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50 relative min-h-[120px]">
                                                        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-300 mb-auto">AUTHORIZED ISSUER</p>
                                                        <div className="mt-auto text-center">
                                                            <p className="text-xs font-black uppercase tracking-tight" style={{ color: templateColor }}>{watchedValues.signatoryName || 'SIGNATORY'}</p>
                                                            <p className="text-[9px] font-bold text-gray-500 uppercase">{finalSignatoryPosition}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* DRAGGABLE SIGNATURE & STAMP */}
                                    <div 
                                        ref={signatureRef} 
                                        onMouseDown={onSignatureMouseDown}
                                        className={cn("absolute z-50 transition-shadow", !lockSignature && "cursor-move hover:ring-2 hover:ring-primary/50")} 
                                        style={{ left: `${signaturePosition.x}%`, top: `${signaturePosition.y}%`, transform: 'translate(-50%, -50%)' }}
                                    >
                                        {signaturePreview ? (
                                            <div className="relative w-40 h-20"><Image src={signaturePreview} alt="Sig" fill className="object-contain" unoptimized /></div>
                                        ) : !proposalLayout.includes('sidebar') && <div className="w-32 h-16 border border-dashed border-gray-200 flex items-center justify-center text-[8px] text-gray-300 uppercase">Load Signature</div>}
                                    </div>

                                    {stampPreview && (
                                        <div 
                                            ref={stampRef} 
                                            onMouseDown={onStampMouseDown}
                                            className={cn("absolute opacity-60 z-40 transition-shadow", !lockStamp && "cursor-move hover:ring-2 hover:ring-primary/50")} 
                                            style={{ left: `${stampPosition.x}%`, top: `${stampPosition.y}%`, transform: 'translate(-50%, -50%)' }}
                                        >
                                            <div className="relative w-32 h-32"><Image src={stampPreview} alt="Stamp" fill className="object-contain" unoptimized /></div>
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <footer className={cn("mt-auto pt-10 text-center", proposalLayout === 'sidebar' ? 'p-10' : 'border-t border-black/5')}>
                                        <p className="text-[10px] font-bold italic opacity-80" style={{ color: templateColor }}>{watchedValues.footerNote || 'We look forward to working with you on this project.'}</p>
                                        <p className="text-[7px] font-black uppercase tracking-[0.5em] text-gray-300 mt-4">Verified Ecosystem Node • OmniTools AI Studio</p>
                                    </footer>
                                </div>
                            </ScrollArea>
                        </div>

                        {/* EXPORT HUB */}
                        <div className="w-full mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto px-4">
                            <Button onClick={handleDownload} disabled={isLoading} size="lg" className="h-20 text-xl font-black uppercase tracking-[0.2em] gradient-button-gold rounded-[1.5rem] shadow-2xl group transition-all hover:scale-[1.02]">
                                {isLoading ? <Loader2 className="animate-spin mr-4 h-8 w-8" /> : <Download className="mr-4 h-8 w-8 group-hover:translate-y-1 transition-transform" />}
                                {isLoading ? 'PROCESSING...' : 'EXPORT STUDIO PDF'}
                            </Button>
                            <Button variant="outline" size="lg" onClick={() => window.print()} className="h-20 text-base font-black uppercase tracking-[0.3em] border-border bg-card hover:bg-accent rounded-[1.5rem] gap-4 shadow-xl">
                                <Printer className="w-7 h-7 text-primary" /> SYSTEM PRINT
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
            <LandingFooter onNavigate={(p) => router.push(p)} />
            {isLoading && <ProcessingOverlay message="Studio HD Rendering Engine..." />}
        </div>
    );
}
