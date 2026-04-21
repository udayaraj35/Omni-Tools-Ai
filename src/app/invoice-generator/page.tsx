'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
    Loader2, ArrowLeft, Download, Upload, Building, User, 
    DollarSign, Palette, Sparkles, Phone, Mail, MapPin, 
    Globe, FileText, Plus, Trash2, Printer, Type, 
    Percent, ClipboardList, Truck, Tag, Receipt, X, 
    ShieldCheck, Calendar, Lock, Unlock, Layers, LayoutTemplate
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';

const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required.'),
  quantity: z.number().min(1).default(1),
  unitPrice: z.number().optional(),
  currency: z.string().default('USD'),
  manualCurrency: z.string().optional(),
  exchangeRate: z.number().optional().default(1),
  tax: z.number().min(0).max(100).optional().default(0),
});

const invoiceFormSchema = z.object({
  invoiceType: z.enum(['invoice', 'payment_voucher']).default('invoice'),
  companyName: z.string().min(1, 'Company name is required.'),
  companyLogo: z.any().optional(),
  companyStamp: z.any().optional(),
  companyAddress: z.string().optional(),
  companyPhone: z.string().optional(),
  companyEmail: z.string().email({ message: "Invalid email" }).optional().or(z.literal('')),
  companyWebsite: z.string().url({ message: "Invalid URL" }).optional().or(z.literal('')),
  companyReg: z.string().optional(),

  authPersonName: z.string().optional(),
  authPersonPosition: z.string().optional(),
  manualAuthPersonPosition: z.string().optional(),
  authSignature: z.any().optional(),

  recipientType: z.enum(['Client', 'Candidate', 'Customer']).default('Client'),
  clientTitle: z.enum(['Mr.', 'Ms.', 'None']).default('None'),
  clientName: z.string().min(1, 'Client name is required.'),
  clientCompanyName: z.string().optional(),
  clientAddress: z.string().optional(),
  clientPhone: z.string().optional(),
  clientEmail: z.string().email({ message: "Invalid email" }).optional().or(z.literal('')),
  clientCountry: z.string().optional(),
  
  invoiceNumber: z.string().min(1, 'Invoice number is required.'),
  invoiceDate: z.date().optional(),
  dueDate: z.date().optional(),
  reference: z.string().optional(),
  
  lineItems: z.array(lineItemSchema).min(1, "Please add at least one item."),
  
  discountType: z.enum(['percentage', 'fixed']).default('percentage'),
  discountValue: z.number().optional(),
  shippingValue: z.number().optional(),
  withholdingType: z.enum(['percentage', 'fixed']).default('percentage'),
  withholdingValue: z.number().optional(),

  currency: z.string().default('USD'),
  manualCurrency: z.string().optional(),
  currencyName: z.string().optional(),
  
  amountPaid: z.number().optional(),
  paymentCurrency: z.string().optional(),
  manualPaymentCurrency: z.string().optional(),
  exchangeRate: z.number().optional(),

  notes: z.string().optional(),
  terms: z.string().optional(),
  paymentInstructions: z.string().optional(),
  
  showTerms: z.boolean().optional().default(true),
  showPaymentInstructions: z.boolean().optional().default(true),
  footerNote: z.string().optional().default('Thank you for your business!'),

  // Design Fields
  templateStyle: z.string().default('modern'),
  fontFamily: z.string().default('sans-serif'),
  templateColor: z.string().default('#003366'),
  paperStyle: z.string().default('standard'),
  frameStyle: z.string().default('none'),
  frameWidth: z.number().default(1),
  showTaxColumn: z.boolean().default(true),
});

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

const currencies = [
    { value: 'NPR', label: 'NPR', name: 'Nepalese Rupee', symbol: 'रु' },
    { value: 'INR', label: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { value: 'USD', label: 'USD', name: 'US Dollar', symbol: '$' },
    { value: 'EUR', label: 'EUR', name: 'Euro', symbol: '€' },
    { value: 'AED', label: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
    { value: 'USDT', label: 'USDT', name: 'Tether', symbol: '₮' },
    { value: 'other', label: 'Other', name: 'Currency', symbol: '' },
];

const fontOptions = [
    { name: 'Standard Sans', value: 'sans-serif' },
    { name: 'Classic Serif', value: "'Times New Roman', Times, serif" },
    { name: 'Modern Arial', value: 'Arial, Helvetica, sans-serif' },
    { name: 'Professional Garamond', value: 'Garamond, serif' },
    { name: 'Sleek Montserrat', value: "'Montserrat', sans-serif" },
    { name: 'Clean Roboto', value: "'Roboto', sans-serif" },
];

const paperStyles: Record<string, string> = {
    standard: 'bg-white',
    cream: 'bg-[#FFFDD0]',
    lokta: 'bg-[#EAE0D5]',
    modern: 'bg-[#f0f4f8]',
};

const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const thousands = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];

function numberToWords(num: number): string {
  if (num === 0) return 'Zero';
  let words = '';
  let i = 0;
  function convertLessThanOneThousand(num: number): string {
    let currentWords = '';
    if (num >= 100) { currentWords += `${ones[Math.floor(num / 100)]} Hundred`; num %= 100; if (num > 0) currentWords += ' '; }
    if (num >= 10 && num <= 19) { currentWords += teens[num - 10]; } 
    else if (num >= 20) { currentWords += tens[Math.floor(num / 10)]; num %= 10; if (num > 0) currentWords += ' ' + ones[num]; }
    else if (num > 0) { currentWords += ones[num]; }
    return currentWords;
  }
  while (num > 0) {
    if (num % 1000 !== 0) { words = `${convertLessThanOneThousand(num % 1000)} ${thousands[i]} ${words}`.trim(); }
    num = Math.floor(num / 1000); i++;
  }
  return words.trim();
}

const paymentPresets = [
    { value: "bank", label: "Bank Transfer", template: "Please make payment via bank transfer to account #[DETAIL]." },
    { value: "paypal", label: "PayPal", template: "Please send PayPal payment to the email: [DETAIL]." },
    { value: "iban", label: "IBAN", template: "Please use IBAN: [DETAIL] for the transfer." },
    { value: "phone", label: "Phone Pay", template: "Payment can be sent to mobile number: [DETAIL]." },
    { value: "custom", label: "Custom", template: "" }
];

export default function InvoiceGeneratorPage() {
    const { toast } = useToast();
    const router = useRouter();
    const invoicePreviewRef = useRef<HTMLDivElement>(null);
    const stampRef = useRef<HTMLDivElement>(null);
    const signatureRef = useRef<HTMLDivElement>(null);

    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [stampPreview, setStampPreview] = useState<string | null>(null);
    const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
    const [stampPosition, setStampPosition] = useState({ x: 85, y: 80 });
    const [signaturePosition, setSignaturePosition] = useState({ x: 15, y: 80 });
    const [lockStamp, setLockStamp] = useState(false);
    const [lockSignature, setLockSignature] = useState(false);
    const [paymentDetail, setPaymentDetail] = useState("");
    const [paymentPreset, setPaymentPreset] = useState("bank");

    const useDraggable = (elRef: React.RefObject<HTMLElement>, onDrag: (pos: { x: number, y: number }) => void, isLocked: boolean) => {
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
                const dx = e.clientX - dragStartRef.current.x;
                const dy = e.clientY - dragStartRef.current.y;
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

    const onStampDrag = useCallback((pos: { x: number, y: number }) => {
        if (!invoicePreviewRef.current) return;
        const rect = invoicePreviewRef.current.getBoundingClientRect();
        setStampPosition({ x: (pos.x / rect.width) * 100, y: (pos.y / rect.height) * 100 });
    }, []);
    const { onMouseDown: onStampMouseDown } = useDraggable(stampRef, onStampDrag, lockStamp);

    const onSignatureDrag = useCallback((pos: { x: number, y: number }) => {
        if (!invoicePreviewRef.current) return;
        const rect = invoicePreviewRef.current.getBoundingClientRect();
        setSignaturePosition({ x: (pos.x / rect.width) * 100, y: (pos.y / rect.height) * 100 });
    }, []);
    const { onMouseDown: onSignatureMouseDown } = useDraggable(signatureRef, onSignatureDrag, lockSignature);

    const form = useForm<InvoiceFormData>({
        resolver: zodResolver(invoiceFormSchema),
        defaultValues: {
            invoiceType: 'invoice',
            companyName: '',
            invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
            invoiceDate: new Date(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            currency: 'USD',
            showTaxColumn: true,
            lineItems: [{ description: '', quantity: 1, unitPrice: 0, currency: 'USD', tax: 0, exchangeRate: 1 }],
            templateStyle: 'modern',
            templateColor: '#003366',
            paperStyle: 'standard',
            footerNote: 'Thank you for your business!',
            showTerms: true,
            showPaymentInstructions: true,
        },
    });

    const { fields, append, remove } = useFieldArray({ control: form.control, name: "lineItems" });
    const watchedValues = form.watch();

    useEffect(() => {
        const selectedTemplate = paymentPresets.find(p => p.value === paymentPreset)?.template;
        if (selectedTemplate) {
            const newInstruction = selectedTemplate.replace('[DETAIL]', paymentDetail);
            form.setValue('paymentInstructions', newInstruction);
        }
    }, [paymentPreset, paymentDetail, form]);

    const calculations = useMemo(() => {
        const mainCurrency = watchedValues.currency === 'other' ? watchedValues.manualCurrency : watchedValues.currency;
        const items = watchedValues.lineItems.map(item => {
            const itemCurrency = item.currency === 'other' ? item.manualCurrency : item.currency;
            const price = (itemCurrency && itemCurrency !== mainCurrency && item.exchangeRate) 
                ? (item.unitPrice || 0) / item.exchangeRate 
                : (item.unitPrice || 0);
            const total = price * (item.quantity || 1);
            const tax = watchedValues.showTaxColumn ? total * ((item.tax || 0) / 100) : 0;
            return { total, tax };
        });

        const subtotal = items.reduce((acc, curr) => acc + curr.total, 0);
        const totalTax = items.reduce((acc, curr) => acc + curr.tax, 0);
        
        let discount = 0;
        if (watchedValues.discountValue) {
            discount = watchedValues.discountType === 'percentage' 
                ? (subtotal * watchedValues.discountValue) / 100 
                : watchedValues.discountValue;
        }

        let withholding = 0;
        if (watchedValues.withholdingValue) {
            withholding = watchedValues.withholdingType === 'percentage'
                ? (subtotal * watchedValues.withholdingValue) / 100
                : watchedValues.withholdingValue;
        }

        const shipping = watchedValues.shippingValue || 0;
        const grandTotal = subtotal + totalTax - discount + shipping;
        const amountDue = grandTotal - withholding - (watchedValues.amountPaid || 0);

        return { subtotal, totalTax, discount, withholding, shipping, grandTotal, amountDue };
    }, [watchedValues]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string | null) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setter(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleDownload = async () => {
        if (!invoicePreviewRef.current) return;
        toast({ title: 'Generating High-Resolution PDF...' });
        
        try {
            const { default: html2canvas } = await import('html2canvas');
            const { default: jsPDF } = await import('jspdf');
            
            const canvas = await html2canvas(invoicePreviewRef.current, { scale: 3, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
            pdf.save(`Invoice-${watchedValues.invoiceNumber}.pdf`);
            toast({ title: 'Invoice Downloaded!' });
        } catch (e) {
            toast({ variant: 'destructive', title: 'Export failed' });
        }
    };

    const handleNavigate = (path: string) => router.push(path.startsWith('/') ? path : `/#${path}`);

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Navbar onNavigate={handleNavigate} />
            <main className="flex-1 container mx-auto py-8">
                <button onClick={() => router.push('/')} className="animated-border-card inline-block mb-6">
                    <span className={cn("inner-span flex items-center back-to-home-button")}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</span>
                </button>
                
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-glow-primary font-headline uppercase italic">Professional Invoice Studio</h1>
                    <p className="text-muted-foreground font-bold uppercase tracking-[0.4em] text-[10px] mt-2">Precision Billing • Custom Design • Multi-Currency</p>
                </div>

                <Form {...form}>
                    <div className="grid lg:grid-cols-12 gap-10 items-start">
                        <div className="lg:col-span-5 space-y-6">
                            <Card className="glass-card border-border shadow-2xl rounded-[2.5rem] overflow-hidden p-1">
                                <CardHeader className="bg-muted/30 border-b border-border p-6">
                                    <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                        <ClipboardList className="w-4 h-4" /> Document Builder
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <Tabs defaultValue="company" className="w-full">
                                        <TabsList className="grid w-full grid-cols-6 bg-muted h-14 p-1 rounded-xl mb-6">
                                            <TabsTrigger value="company" title="Company"><Building className="w-4 h-4"/></TabsTrigger>
                                            <TabsTrigger value="client" title="Client"><User className="w-4 h-4"/></TabsTrigger>
                                            <TabsTrigger value="items" title="Items"><Receipt className="w-4 h-4"/></TabsTrigger>
                                            <TabsTrigger value="totals" title="Payments"><DollarSign className="w-4 h-4"/></TabsTrigger>
                                            <TabsTrigger value="notes" title="Notes"><FileText className="w-4 h-4"/></TabsTrigger>
                                            <TabsTrigger value="design" title="Styles"><Palette className="w-4 h-4"/></TabsTrigger>
                                        </TabsList>

                                        <ScrollArea className="h-[60vh] pr-4">
                                            <TabsContent value="company" className="space-y-6 mt-0">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField control={form.control} name="invoiceType" render={({ field }) => (
                                                        <FormItem className="col-span-2">
                                                            <FormControl>
                                                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-4">
                                                                    <Label className={cn("flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-all", field.value === 'invoice' ? "bg-primary/10 border-primary text-primary" : "bg-muted/50 border-border hover:bg-muted")}>
                                                                        <RadioGroupItem value="invoice" className="hidden" /> Standard Invoice
                                                                    </Label>
                                                                    <Label className={cn("flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-all", field.value === 'payment_voucher' ? "bg-primary/10 border-primary text-primary" : "bg-muted/50 border-border hover:bg-muted")}>
                                                                        <RadioGroupItem value="payment_voucher" className="hidden" /> Payment Voucher
                                                                    </Label>
                                                                </RadioGroup>
                                                            </FormControl>
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={form.control} name="invoiceNumber" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase">Invoice #</FormLabel><FormControl><Input {...field} className="h-12 rounded-xl" /></FormControl></FormItem>)} />
                                                    <FormField control={form.control} name="invoiceDate" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase">Date</FormLabel><FormControl><Input type="date" value={field.value ? format(field.value, 'yyyy-MM-dd') : ''} onChange={e => field.onChange(new Date(e.target.value))} className="h-12 rounded-xl" /></FormControl></FormItem>)} />
                                                </div>
                                                <FormField control={form.control} name="companyName" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase">Your Company Name</FormLabel><FormControl><Input {...field} className="h-12 rounded-xl" /></FormControl></FormItem>)} />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormItem><FormLabel className="text-[10px] font-bold uppercase">Logo</FormLabel><Input type="file" accept="image/*" onChange={e => handleFileUpload(e, setLogoPreview)} className="h-12 file:text-primary file:font-black text-xs" /></FormItem>
                                                    <FormItem><FormLabel className="text-[10px] font-bold uppercase">Stamp</FormLabel><Input type="file" accept="image/*" onChange={e => handleFileUpload(e, setStampPreview)} className="h-12 file:text-primary file:font-black text-xs" /></FormItem>
                                                </div>
                                                <FormField control={form.control} name="companyAddress" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase">Full Address</FormLabel><FormControl><Textarea {...field} rows={3} className="rounded-2xl" /></FormControl></FormItem>)} />
                                            </TabsContent>

                                            <TabsContent value="client" className="space-y-6 mt-0">
                                                <FormField control={form.control} name="clientName" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase">Client/Customer Name</FormLabel><FormControl><Input {...field} className="h-12 rounded-xl" /></FormControl></FormItem>)} />
                                                <FormField control={form.control} name="clientCompanyName" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase">Client Organization (Optional)</FormLabel><FormControl><Input {...field} className="h-12 rounded-xl" /></FormControl></FormItem>)} />
                                                <FormField control={form.control} name="clientAddress" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase">Client Address</FormLabel><FormControl><Textarea {...field} rows={3} className="rounded-2xl" /></FormControl></FormItem>)} />
                                            </TabsContent>

                                            <TabsContent value="items" className="space-y-6 mt-0">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-[10px] font-black uppercase text-zinc-500">Billable Line Items</Label>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-zinc-500">Tax Col:</span>
                                                        <Switch checked={watchedValues.showTaxColumn} onCheckedChange={v => form.setValue('showTaxColumn', v)} />
                                                    </div>
                                                </div>
                                                {fields.map((field, index) => (
                                                    <div key={field.id} className="p-5 bg-muted/30 border border-border rounded-3xl space-y-4 relative group">
                                                        <FormField control={form.control} name={`lineItems.${index}.description`} render={({ field }) => (<FormItem><FormLabel className="text-[9px] font-bold">Item Description</FormLabel><Input {...field} className="h-10 rounded-xl text-xs" /></FormItem>)} />
                                                        <div className="grid grid-cols-3 gap-3">
                                                            <FormField control={form.control} name={`lineItems.${index}.quantity`} render={({ field }) => (<FormItem><FormLabel className="text-[9px] font-bold">Qty</FormLabel><Input type="number" {...field} className="h-10 rounded-xl text-xs" onChange={e => field.onChange(parseFloat(e.target.value))} /></FormItem>)} />
                                                            <FormField control={form.control} name={`lineItems.${index}.unitPrice`} render={({ field }) => (<FormItem><FormLabel className="text-[9px] font-bold">Unit Price</FormLabel><Input type="number" {...field} className="h-10 rounded-xl text-xs" onChange={e => field.onChange(parseFloat(e.target.value))} /></FormItem>)} />
                                                            {watchedValues.showTaxColumn && (
                                                                <FormField control={form.control} name={`lineItems.${index}.tax`} render={({ field }) => (<FormItem><FormLabel className="text-[9px] font-bold">Tax %</FormLabel><Input type="number" {...field} className="h-10 rounded-xl text-xs" onChange={e => field.onChange(parseFloat(e.target.value))} /></FormItem>)} />
                                                            )}
                                                        </div>
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-destructive/20 text-destructive opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4"/></Button>
                                                    </div>
                                                ))}
                                                <Button type="button" variant="outline" onClick={() => append({ description: '', quantity: 1, unitPrice: 0, currency: watchedValues.currency, tax: 0, exchangeRate: 1 })} className="w-full h-12 border-dashed rounded-2xl font-black uppercase text-[10px] tracking-widest">+ Add New Item Row</Button>
                                            </TabsContent>

                                            <TabsContent value="totals" className="space-y-6 mt-0">
                                                <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl space-y-6">
                                                    <h4 className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Adjustments & Discounts</h4>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-[9px] font-bold uppercase">Discount Type</Label>
                                                            <Select value={watchedValues.discountType} onValueChange={v => form.setValue('discountType', v as any)}>
                                                                <SelectTrigger className="h-10 rounded-xl"><SelectValue/></SelectTrigger>
                                                                <SelectContent className="bg-popover border-border"><SelectItem value="percentage">Percentage (%)</SelectItem><SelectItem value="fixed">Fixed Amount</SelectItem></SelectContent>
                                                            </Select>
                                                        </div>
                                                        <FormField control={form.control} name="discountValue" render={({ field }) => (<FormItem><FormLabel className="text-[9px] font-bold uppercase">Discount Val</FormLabel><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} className="h-10 rounded-xl" /></FormItem>)} />
                                                    </div>
                                                    <FormField control={form.control} name="shippingValue" render={({ field }) => (<FormItem><FormLabel className="text-[9px] font-bold uppercase">Shipping Costs</FormLabel><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} className="h-10 rounded-xl" /></FormItem>)} />
                                                </div>
                                                <div className="p-6 bg-primary/5 border border-primary/10 rounded-3xl space-y-4">
                                                    <h4 className="text-[10px] font-black uppercase text-primary tracking-widest">Amount Paid / Advance</h4>
                                                    <FormField control={form.control} name="amountPaid" render={({ field }) => (<FormItem><FormControl><Input type="number" {...field} placeholder="0.00" onChange={e => field.onChange(parseFloat(e.target.value))} className="h-14 rounded-2xl text-xl font-black" /></FormControl></FormItem>)} />
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="notes" className="space-y-6 mt-0">
                                                <FormField control={form.control} name="paymentInstructions" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-bold uppercase">Payment Instructions</FormLabel>
                                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                                            {paymentPresets.map(p => (
                                                                <Button key={p.value} variant={paymentPreset === p.value ? 'default' : 'outline'} size="sm" onClick={() => setPaymentPreset(p.value)} className="h-8 text-[8px] uppercase font-black">{p.label}</Button>
                                                            ))}
                                                        </div>
                                                        <Input placeholder="Account Details..." value={paymentDetail} onChange={e => setPaymentDetail(e.target.value)} className="h-10 rounded-xl mb-2 text-xs" />
                                                        <FormControl><Textarea {...field} rows={4} className="rounded-xl text-xs" /></FormControl>
                                                    </FormItem>
                                                )} />
                                                <FormField control={form.control} name="footerNote" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase">Footer Note (Greeting)</FormLabel><FormControl><Input {...field} className="h-12 rounded-xl" /></FormControl></FormItem>)} />
                                            </TabsContent>

                                            <TabsContent value="design" className="space-y-8 mt-0 text-left">
                                                <div className="p-6 bg-muted/30 border border-border rounded-[2.5rem] space-y-6">
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <div className="space-y-3">
                                                            <Label className="text-[9px] uppercase font-black text-zinc-500 tracking-widest">Template Base</Label>
                                                            <Select value={watchedValues.templateStyle} onValueChange={v => form.setValue('templateStyle', v)}>
                                                                <SelectTrigger className="h-12 rounded-2xl text-xs font-black"><SelectValue /></SelectTrigger>
                                                                <SelectContent className="bg-popover border-border">
                                                                    <SelectItem value="modern">Modern Professional</SelectItem>
                                                                    <SelectItem value="classic">Classic Business</SelectItem>
                                                                    <SelectItem value="simple">Minimalist Clean</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <Label className="text-[9px] uppercase font-black text-zinc-500 tracking-widest">Theme Accent</Label>
                                                            <Input type="color" value={watchedValues.templateColor} onChange={e => form.setValue('templateColor', e.target.value)} className="h-12 p-1 rounded-2xl cursor-pointer" />
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="space-y-3">
                                                        <Label className="text-[9px] uppercase font-black text-zinc-500 tracking-widest">Typography Engine</Label>
                                                        <Select value={watchedValues.fontFamily} onValueChange={v => form.setValue('fontFamily', v)}>
                                                            <SelectTrigger className="h-12 rounded-2xl text-xs font-bold"><SelectValue /></SelectTrigger>
                                                            <SelectContent className="bg-popover border-border">
                                                                {fontOptions.map(f => <SelectItem key={f.value} value={f.value} style={{fontFamily: f.value}}>{f.name}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <Separator className="bg-border" />

                                                    <div className="space-y-4">
                                                        <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Workspace Controls</Label>
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
                                                    </div>
                                                </div>
                                            </TabsContent>
                                        </ScrollArea>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:col-span-7 flex flex-col items-center">
                            <div className="w-full bg-muted/30 p-1.5 rounded-[3.5rem] border border-border shadow-2xl backdrop-blur-xl relative">
                                <div className="absolute -top-4 -right-4 z-50">
                                    <Badge className="bg-primary text-primary-foreground font-black uppercase px-6 py-2 rounded-full tracking-widest shadow-2xl">Studio Preview Engine</Badge>
                                </div>
                                
                                <ScrollArea className="h-[80vh] w-full p-6 md:p-12">
                                    <div 
                                        ref={invoicePreviewRef} 
                                        className={cn("w-full mx-auto aspect-[210/297] bg-white text-black shadow-[0_80px_150px_rgba(0,0,0,0.1)] dark:shadow-[0_80px_150px_rgba(0,0,0,1)] relative flex flex-col overflow-hidden", paperStyles[watchedValues.paperStyle])}
                                        style={{ fontFamily: watchedValues.fontFamily, fontSize: '10pt', padding: '1.5cm' }}
                                    >
                                        <div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none z-0 overflow-hidden">
                                            {Array.from({length: 15}).map((_, i) => (
                                                <div key={i} className="whitespace-nowrap font-black text-4xl -rotate-12 mb-12">OMNITOOLS AI VERIFIED INVOICE</div>
                                            ))}
                                        </div>

                                        <div className="relative z-10 flex-1 flex flex-col">
                                            {watchedValues.templateStyle === 'modern' && (
                                                <>
                                                    <div className="flex justify-between items-start mb-10 pb-6 border-b-2" style={{ borderBottomColor: watchedValues.templateColor }}>
                                                        <div className="space-y-4">
                                                            {logoPreview ? (
                                                                <div className="relative w-32 h-16"><Image src={logoPreview} alt="Logo" fill className="object-contain" unoptimized /></div>
                                                            ) : (
                                                                <h2 className="text-2xl font-black uppercase italic" style={{ color: watchedValues.templateColor }}>{watchedValues.companyName || 'COMPANY NAME'}</h2>
                                                            )}
                                                            <div className="text-[9px] text-gray-500 leading-tight">
                                                                <p className="flex items-center gap-1.5"><MapPin className="w-2.5 h-2.5"/> {watchedValues.companyAddress}</p>
                                                                <div className="flex gap-3 mt-1">
                                                                    {watchedValues.companyPhone && <span className="flex items-center gap-1"><Phone className="w-2.5 h-2.5"/> {watchedValues.companyPhone}</span>}
                                                                    {watchedValues.companyEmail && <span className="flex items-center gap-1"><Mail className="w-2.5 h-2.5"/> {watchedValues.companyEmail}</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none" style={{ color: watchedValues.templateColor }}>
                                                                {watchedValues.invoiceType === 'invoice' ? 'INVOICE' : 'PAYMENT VOUCHER'}
                                                            </h1>
                                                            <div className="mt-4 text-[10px] font-bold">
                                                                <p className="text-gray-400">REFERENCE: <span className="text-black">{watchedValues.invoiceNumber}</span></p>
                                                                <p className="text-gray-400">ISSUED: <span className="text-black">{watchedValues.invoiceDate ? format(watchedValues.invoiceDate, 'dd MMM yyyy') : 'N/A'}</span></p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-10 mb-10">
                                                        <div className="p-5 bg-black/5 rounded-2xl border border-black/5">
                                                            <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-2">Recipient / Bill To</p>
                                                            <h3 className="text-lg font-black text-gray-900 leading-none">{watchedValues.clientTitle !== 'None' ? watchedValues.clientTitle + ' ' : ''}{watchedValues.clientName || 'GUEST CLIENT'}</h3>
                                                            {watchedValues.clientCompanyName && <p className="text-xs font-bold text-gray-600 mt-1">{watchedValues.clientCompanyName}</p>}
                                                            <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">{watchedValues.clientAddress}</p>
                                                        </div>
                                                        <div className="flex flex-col justify-center text-right p-5">
                                                            <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">Status</p>
                                                            <span className="text-2xl font-black text-primary italic uppercase tracking-tighter">RESERVED</span>
                                                            <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase">Due Date: <span className="text-red-600">{watchedValues.dueDate ? format(watchedValues.dueDate, 'dd MMM yyyy') : 'N/A'}</span></p>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {watchedValues.templateStyle === 'classic' && (
                                                <div className="mb-10 text-center space-y-6">
                                                    <div className="flex flex-col items-center gap-2">
                                                        {logoPreview && <div className="relative w-24 h-24 mb-2"><Image src={logoPreview} alt="Logo" fill className="object-contain" unoptimized /></div>}
                                                        <h1 className="text-5xl font-black uppercase tracking-widest italic" style={{ color: watchedValues.templateColor }}>
                                                            {watchedValues.invoiceType === 'invoice' ? 'INVOICE' : 'VOUCHER'}
                                                        </h1>
                                                    </div>
                                                    <div className="h-1 w-full bg-black/10" />
                                                    <div className="grid grid-cols-3 text-left">
                                                        <div className="col-span-2 space-y-1">
                                                            <h2 className="text-2xl font-black uppercase">{watchedValues.companyName || 'COMPANY NAME'}</h2>
                                                            <p className="text-[10px] text-gray-500">{watchedValues.companyAddress}</p>
                                                        </div>
                                                        <div className="text-right space-y-1">
                                                            <p className="text-[10px] font-bold"># {watchedValues.invoiceNumber}</p>
                                                            <p className="text-[10px] text-gray-500">{watchedValues.invoiceDate ? format(watchedValues.invoiceDate, 'PPP') : ''}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <table className="w-full text-left mb-10 border-collapse">
                                                <thead>
                                                    <tr className="text-white bg-gray-900 uppercase text-[9px] font-black tracking-widest">
                                                        <th className="p-4 rounded-tl-xl">Description</th>
                                                        <th className="p-4 text-center">Qty</th>
                                                        <th className="p-4 text-right">Unit Price</th>
                                                        {watchedValues.showTaxColumn && <th className="p-4 text-right">Tax</th>}
                                                        <th className="p-4 text-right rounded-tr-xl">Total ({watchedValues.currency})</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-xs">
                                                    {watchedValues.lineItems.map((item, i) => {
                                                        const total = (item.quantity || 0) * (item.unitPrice || 0);
                                                        const tax = watchedValues.showTaxColumn ? total * ((item.tax || 0) / 100) : 0;
                                                        return (
                                                            <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                                                <td className="p-4 font-bold text-gray-800">{item.description || 'Line Item Description'}</td>
                                                                <td className="p-4 text-center font-medium">{item.quantity}</td>
                                                                <td className="p-4 text-right font-medium">{item.unitPrice?.toFixed(2)}</td>
                                                                {watchedValues.showTaxColumn && <td className="p-4 text-right text-gray-400">{item.tax}%</td>}
                                                                <td className="p-4 text-right font-black">{(total + tax).toFixed(2)}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>

                                            <div className="flex justify-end mt-auto">
                                                <div className="w-1/2 space-y-3 bg-black/5 p-6 rounded-[2rem] border border-black/5">
                                                    <div className="flex justify-between text-xs text-gray-500 font-bold uppercase tracking-widest"><span>Subtotal</span><span>{calculations.subtotal.toFixed(2)}</span></div>
                                                    {watchedValues.showTaxColumn && <div className="flex justify-between text-xs text-gray-500 font-bold uppercase tracking-widest"><span>Total Tax</span><span>+ {calculations.totalTax.toFixed(2)}</span></div>}
                                                    {calculations.discount > 0 && <div className="flex justify-between text-xs text-red-500 font-black uppercase tracking-widest"><span>Discount</span><span>- {calculations.discount.toFixed(2)}</span></div>}
                                                    {calculations.shipping > 0 && <div className="flex justify-between text-xs text-gray-500 font-bold uppercase tracking-widest"><span>Shipping</span><span>+ {calculations.shipping.toFixed(2)}</span></div>}
                                                    <div className="pt-3 border-t-2 border-dashed border-black/10">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: watchedValues.templateColor }}>Grand Total ({watchedValues.currency})</span>
                                                            <span className="text-3xl font-black tracking-tighter italic" style={{ color: watchedValues.templateColor }}>{calculations.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                        </div>
                                                    </div>
                                                    {watchedValues.amountPaid > 0 && (
                                                        <div className="flex justify-between text-xs font-bold text-emerald-600 uppercase border-t pt-2 border-emerald-500/20">
                                                            <span>Paid / Advance</span>
                                                            <span>- {watchedValues.amountPaid.toFixed(2)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-inner mt-2">
                                                        <span className="text-[9px] font-black uppercase text-gray-400">Balance Due</span>
                                                        <span className="text-xl font-black text-gray-900">{calculations.amountDue.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-10 grid grid-cols-2 gap-10">
                                                <div className="space-y-4">
                                                    {watchedValues.showPaymentInstructions && watchedValues.paymentInstructions && (
                                                        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                                            <p className="text-[8px] font-black uppercase tracking-widest text-primary mb-2">Payment Nodes</p>
                                                            <p className="text-[10px] font-medium leading-relaxed italic text-gray-600">{watchedValues.paymentInstructions}</p>
                                                        </div>
                                                    )}
                                                    {watchedValues.notes && (
                                                        <div className="text-[9px] text-gray-400 leading-relaxed italic">
                                                            <span className="font-bold uppercase text-[8px] text-gray-500 block mb-1">Internal Notes:</span>
                                                            {watchedValues.notes}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-black/5 rounded-2xl bg-black/5 relative min-h-[150px]">
                                                    <p className="text-[8px] font-black uppercase text-gray-400 tracking-[0.3em] mb-auto">AUTHORIZED SIGNATORY</p>
                                                    <p className="mt-auto text-xs font-black uppercase italic" style={{ color: watchedValues.templateColor }}>{watchedValues.companyName || 'STAMP AREA'}</p>
                                                </div>
                                            </div>

                                            <div 
                                                ref={signatureRef} 
                                                onMouseDown={onSignatureMouseDown}
                                                className={cn("absolute z-50 transition-shadow", !lockSignature && "cursor-move hover:ring-2 hover:ring-primary/50")} 
                                                style={{ left: `${signaturePosition.x}%`, top: `${signaturePosition.y}%`, transform: 'translate(-50%, -50%)' }}
                                            >
                                                {signaturePreview ? (
                                                    <div className="relative w-40 h-20"><Image src={signaturePreview} alt="Sig" fill className="object-contain" unoptimized /></div>
                                                ) : <div className="w-32 h-16 border border-dashed border-gray-200 flex items-center justify-center text-[8px] text-gray-300 uppercase">Load Signature</div>}
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
                                        </div>

                                        <footer className="mt-auto pt-10 text-center border-t border-black/5">
                                            <p className="text-[10px] font-bold italic opacity-80" style={{ color: watchedValues.templateColor }}>{watchedValues.footerNote}</p>
                                            <p className="text-[7px] font-black uppercase tracking-[0.5em] text-gray-300 mt-4">Verified Ecosystem Node • OmniTools AI Studio</p>
                                        </footer>
                                    </div>
                                </ScrollArea>
                            </div>

                            <div className="w-full mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto px-4">
                                <Button onClick={handleDownload} size="lg" className="h-20 text-xl font-black uppercase tracking-[0.2em] gradient-button-gold rounded-[1.5rem] shadow-2xl group transition-all hover:scale-[1.02]">
                                    <Download className="mr-4 h-8 w-8 group-hover:translate-y-1 transition-transform" /> EXPORT STUDIO PDF
                                </Button>
                                <Button variant="outline" size="lg" onClick={() => window.print()} className="h-20 text-base font-black uppercase tracking-[0.3em] border-border bg-card hover:bg-accent rounded-[1.5rem] gap-4 shadow-xl">
                                    <Printer className="w-7 h-7 text-primary" /> SYSTEM PRINT
                                </Button>
                            </div>
                        </div>
                    </div>
                </Form>
            </main>
            <LandingFooter onNavigate={handleNavigate} />
        </div>
    );
}