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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Download, Upload, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  municipality: z.string().min(1, 'Municipality name is required'),
  wardNo: z.string().min(1, 'Ward number is required'),
  officeAddress: z.string().min(1, 'Office address is required'),
  taxpayerName: z.string().min(1, 'Taxpayer name is required'),
  applicantName: z.string().min(1, 'Applicant name is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  fiscalYear: z.string().min(1, 'Fiscal year is required'),
});

type CertificateFormData = z.infer<typeof formSchema>;

export default function TaxClearancePage() {
  const { toast } = useToast();
  const router = useRouter();
  const previewRef = useRef<HTMLDivElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const form = useForm<CertificateFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      municipality: 'Sharada Municipality',
      wardNo: '14',
      officeAddress: 'West Malneta, Salyan',
      fiscalYear: '2079/80',
      issueDate: new Date().toISOString().split('T')[0],
    },
  });

  const handleDownload = async () => {
    if (!previewRef.current) return;
    toast({ title: 'Generating PDF...' });
    
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
        pdf.save('Tax_Clearance_Certificate.pdf');
        toast({ title: 'PDF Downloaded!' });
    } catch (e) {
        toast({ variant: 'destructive', title: 'Export failed' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onNavigate={(p) => router.push(p)} />
      <main className="flex-1 container mx-auto py-8">
        <button onClick={() => router.push('/')} className="animated-border-card inline-block mb-6">
          <span className={cn("inner-span flex items-center back-to-home-button")}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</span>
        </button>
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="glass-card">
            <CardHeader><CardTitle>Tax Clearance Details</CardTitle></CardHeader>
            <CardContent>
                <Form {...form}>
                    <form className="space-y-4">
                        <FormField control={form.control} name="taxpayerName" render={({ field }) => (<FormItem><FormLabel>Taxpayer Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                    </form>
                </Form>
            </CardContent>
          </Card>
          <div className="sticky top-8">
            <div ref={previewRef} className="bg-white p-10 text-black shadow-2xl min-h-[400px]">
                <h2 className="text-center font-bold text-red-600 uppercase mb-6">TAX CLEARANCE CERTIFICATE</h2>
                <p>This is to certify that <b>{form.watch('taxpayerName') || '[NAME]'}</b> has cleared all taxes.</p>
            </div>
            <Button onClick={handleDownload} className="w-full gradient-button-gold mt-6"><Download className="mr-2"/> Download PDF</Button>
          </div>
        </div>
      </main>
      <LandingFooter onNavigate={(p) => router.push(p)} />
    </div>
  );
}