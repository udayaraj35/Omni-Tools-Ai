'use client';

import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft, Download, Plus, Trash2, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DatePicker } from '@/components/ui/date-picker';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
    name: z.string().optional(),
    surname: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

function TemporaryResidencePermitPage() {
  const router = useRouter();
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        name: 'NARAYAN',
        surname: 'KHANAL',
    },
  });

  const handleDownload = async () => {
    if (!previewRef.current) return;
    toast({ title: "Generating PDF..." });
    
    try {
        const { default: jsPDF } = await import('jspdf');
        const { default: html2canvas } = await import('html2canvas');
        
        const canvas = await html2canvas(previewRef.current, { scale: 3, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
        pdf.save('Residence_Permit_Application.pdf');
        toast({ title: "PDF downloaded!" });
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
            <CardContent className="p-6">
                <Form {...form}>
                    <form className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                    </form>
                </Form>
            </CardContent>
          </Card>
          <div className="sticky top-8">
            <div ref={previewRef} className="bg-white p-10 text-black shadow-2xl min-h-[500px]">
                <h2 className="text-center font-bold uppercase mb-6">RESIDENCE PERMIT APPLICATION</h2>
                <p>Applicant: {form.watch('name')} {form.watch('surname')}</p>
            </div>
            <Button onClick={handleDownload} className="w-full gradient-button-gold mt-6"><Download className="mr-2"/> Download PDF</Button>
          </div>
        </div>
      </main>
      <LandingFooter onNavigate={(p) => router.push(p)} />
    </div>
  );
}

export default function TemporaryResidencePermitPageSuspense() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
            <TemporaryResidencePermitPage />
        </Suspense>
    );
}