'use client';

import React, { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { createVisaCoverLetter, extractInfoFromDocument, createCoverLetter } from '@/app/actions';
import { type GenerateVisaCoverLetterInput } from '@/ai/flows/generate-visa-cover-letter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Printer, Wand2, FileText, Check, ChevronsUpDown, Upload, Bot, Sparkles, Image as ImageIcon, ArrowRight, Palette, User, Briefcase, Building, ShieldCheck, ClipboardList, Info } from 'lucide-react';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';


import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Logo from '@/components/ui/logo';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { countriesWithCities, worldCountries, nationalities, euCountries } from '@/lib/cities';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { visaRequirements } from '@/lib/visa-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog as UiDialog, DialogContent as UiDialogContent, DialogHeader as UiDialogHeader, DialogTitle as UiDialogTitle, DialogDescription as UiDialogDescription, DialogFooter as UiDialogFooter } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { nepalPostalCodes } from '@/lib/nepal-postal-codes';
import { countryToCode } from '@/lib/country-codes';

const commonJobTitles = [
    "Cook", "General Helper", "Construction Worker", "Cleaner", "Driver", "Waiter/Waitress",
    "Sales Associate", "Security Guard", "Electrician", "Plumber", "Other"
];

const residenceStatuses = [
    "UAE Residence Visa (Emirates ID)",
    "Saudi Arabia Residence Visa (Iqama)",
    "Qatar Residence Permit (QID)",
    "Oman Residence Card (Bataka)",
    "Kuwait Civil ID",
    "Bahrain Residence Permit (CPR Card)",
    "Nepal Residence Visa",
    "India Residence Visa",
    "Tourist Visa",
    "Visit Visa",
    "Student Visa",
    "Other"
];

const euVisaCategories = [
    "National Employment Visa (D)",
    "EU Blue Card",
    "Seasonal Worker Visa",
    "Intra-corporate Transferee Visa",
    "Self-employment / Freelancer Visa",
    "Study or Research Visa (D)",
    "Family Reunification Visa (D)",
    "Short-stay Visa (Schengen Type C - for business/tourism)",
    "Airport Transit Visa (Schengen Type A)",
    "Other"
];

const currencies = [
    { value: 'USD', label: 'USD', name: 'Dollars' },
    { value: 'EUR', label: 'EUR', name: 'Euros' },
    { value: 'GBP', label: 'GBP', name: 'Pounds' },
    { value: 'AUD', label: 'AUD', name: 'Dollars' },
    { value: 'CAD', label: 'CAD', name: 'Dollars' },
    { value: 'NPR', label: 'NPR', name: 'Rupees' },
    { value: 'INR', label: 'INR', name: 'Rupees' },
    { value: 'AED', label: 'AED', name: 'Dirhams' },
    { value: 'SAR', label: 'SAR', name: 'Riyals' },
    { value: 'QAR', label: 'QAR', name: 'Riyals' },
    { value: 'OMR', label: 'OMR', name: 'Rials' },
    { value: 'BHD', label: 'BHD', name: 'Dinars' },
    { value: 'KWD', label: 'KWD', name: 'Dinars' },
    { value: 'other', label: 'Other', name: 'Currency' },
];

const baseSchema = z.object({
  fullName: z.string().min(1, "This field is required."),
  phone: z.string().min(1, "This field is required."),
  email: z.string().email("Invalid email address."),
  employerName: z.string().min(1, "This field is required."),
  jobPosition: z.string().min(1, "This field is required."),
  manualJobPosition: z.string().optional(),
  letterDate: z.string().optional(),
});

const visaSchema = baseSchema.extend({
  letterType: z.literal('visa'),
  consulateType: z.string().min(1, "Type is required."),
  embassyOfCountry: z.string().min(1, "Country is required."),
  manualEmbassyOfCountry: z.string().optional(),
  addTheRepublicOf: z.boolean().optional(),
  embassyStreetAddress: z.string().optional(),
  embassyCity: z.string().min(1, "City is required."),
  embassyCountry: z.string().min(1, "Country is required."),
  manualEmbassyCountry: z.string().optional(),
  
  permanentCountry: z.string().min(1, "Permanent country is required."),
  manualPermanentCountry: z.string().optional(),
  permanentCity: z.string().min(1, 'Permanent city is required.'),
  manualPermanentCity: z.string().optional(),
  permanentStreetAddress: z.string().min(1, "Permanent street address is required."),
  permanentPostalCode: z.string().optional(),

  currentCountry: z.string().min(1, "Country is required."),
  manualCurrentCountry: z.string().optional(),
  currentCity: z.string().min(1, "City is required."),
  manualCurrentCity: z.string().optional(),
  currentStreetAddress: z.string().min(1, "Current street address is required."),
  currentPostalCode: z.string().optional(),
  
  addressToUseInClosing: z.enum(['current', 'permanent']).default('current'),

  visaCategory: z.string().min(1, "This field is required."),
  manualVisaCategory: z.string().optional(),
  passport: z.string().min(1, "This field is required."),
  nationality: z.string().min(1, "Country is required."),
  manualNationality: z.string().optional(),
  permitType: z.string().default('Work Permit'),
  manualPermitType: z.string().optional(),
  workPermit: z.string().min(1, "This field is required."),
  workPermitStartDate: z.string().optional(),
  workPermitEndDate: z.string().optional(),
  dob: z.string().min(1, "Date of birth is required in YYYY-MM-DD format."),
  employerFullAddress: z.string().min(1, "Employer address is required."),
  employerCountry: z.string().min(1, "Employer country is required."),
  manualEmployerCountry: z.string().optional(),
  
  insuranceProvider: z.string().optional(),
  insuranceCoverage: z.string().optional(),
  insuranceCoverageCurrency: z.string().optional(),
  manualCurrency: z.string().optional(),
  insuranceStartDate: z.string().optional(),
  insuranceExpiryDate: z.string().optional(),
  currentJob: z.string().min(1, "This field is required."),
  manualCurrentJob: z.string().optional(),
  visaStatus: z.string().min(1, "This field is required."),
  manualVisaStatus: z.string().optional(),
  idNumber: z.string().optional(),
  residenceIssueDate: z.string().optional(),
  residenceExpiryDate: z.string().optional(),
  incomeAmount: z.string().min(1, "Salary amount is required."),
  incomeCurrency: z.string().min(1, "Currency for salary is required."),
  manualIncomeCurrency: z.string().optional(),
  incomeCurrencyName: z.string().optional(),
  docs: z.array(z.string()).optional(),
  hiringManagerName: z.string().optional(),
  jobDescription: z.string().optional(),
  cvContent: z.string().optional(),

  // New optional fields
  workingHours: z.string().optional(),
  employerRegNo: z.string().optional(),
  employerRep: z.string().optional(),
  employerPhone: z.string().optional(),
  employerEmail: z.string().email().optional().or(z.literal('')),
  contractDuration: z.string().optional(),
  accommodationDetails: z.string().optional(),
  yearsOfExperience: z.string().optional(),
  travelArrangements: z.string().optional(),
  tiesToHomeCountry: z.string().optional(),
});

const jobSchema = baseSchema.extend({
  letterType: z.literal('job'),
  hiringManagerName: z.string().optional(),
  jobDescription: z.string().min(1, "Job description is required."),
  cvContent: z.string().min(1, "Your CV/Summary/content is required."),
  employerFullAddress: z.string().min(1, "Employer address is required."),
  permanentStreetAddress: z.string().min(1, "Your street address is required."),
  permanentCity: z.string().min(1, "Your city is required."),
  manualPermanentCity: z.string().optional(),
  permanentCountry: z.string().min(1, "Your country is required."),
  manualPermanentCountry: z.string().optional(),
  
  // Visa fields made optional
  consulateType: z.string().optional(),
  embassyOfCountry: z.string().optional(),
  manualEmbassyOfCountry: z.string().optional(),
  embassyStreetAddress: z.string().optional(),
  addTheRepublicOf: z.boolean().optional(),
  embassyCity: z.string().optional(),
  embassyCountry: z.string().optional(),
  manualEmbassyCountry: z.string().optional(),
  permanentPostalCode: z.string().optional(),
  currentCountry: z.string().optional(),
  manualCurrentCountry: z.string().optional(),
  currentCity: z.string().optional(),
  manualCurrentCity: z.string().optional(),
  currentStreetAddress: z.string().optional(),
  currentPostalCode: z.string().optional(),
  addressToUseInClosing: z.enum(['current', 'permanent']).optional(),
  visaCategory: z.string().optional(),
  manualVisaCategory: z.string().optional(),
  passport: z.string().optional(),
  nationality: z.string().optional(),
  manualNationality: z.string().optional(),
  permitType: z.string().optional(),
  manualPermitType: z.string().optional(),
  workPermit: z.string().optional(),
  workPermitStartDate: z.string().optional(),
  workPermitEndDate: z.string().optional(),
  dob: z.string().optional(),
  employerCountry: z.string().optional(),
  manualEmployerCountry: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insuranceCoverage: z.string().optional(),
  insuranceCoverageCurrency: z.string().optional(),
  manualCurrency: z.string().optional(),
  insuranceStartDate: z.string().optional(),
  insuranceExpiryDate: z.string().optional(),
  currentJob: z.string().optional(),
  manualCurrentJob: z.string().optional(),
  visaStatus: z.string().optional(),
  manualVisaStatus: z.string().optional(),
  idNumber: z.string().optional(),
  residenceIssueDate: z.string().optional(),
  residenceExpiryDate: z.string().optional(),
  incomeAmount: z.string().optional(),
  incomeCurrency: z.string().optional(),
  manualIncomeCurrency: z.string().optional(),
  incomeCurrencyName: z.string().optional(),
  docs: z.array(z.string()).optional(),

  // New optional fields
  workingHours: z.string().optional(),
  employerRegNo: z.string().optional(),
  employerRep: z.string().optional(),
  employerPhone: z.string().optional(),
  employerEmail: z.string().email().optional().or(z.literal('')),
  contractDuration: z.string().optional(),
  accommodationDetails: z.string().optional(),
  yearsOfExperience: z.string().optional(),
  travelArrangements: z.string().optional(),
  tiesToHomeCountry: z.string().optional(),
});


const formSchema = z.discriminatedUnion("letterType", [visaSchema, jobSchema]);

type VisaLetterFormData = z.infer<typeof formSchema>;

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
  
    if (num >= 100) {
      currentWords += `${ones[Math.floor(num / 100)]} Hundred`;
      num %= 100;
      if (num > 0) currentWords += ' ';
    }
  
    if (num >= 10 && num <= 19) {
      currentWords += teens[num - 10];
    } else if (num >= 20) {
      currentWords += tens[Math.floor(num / 10)];
      num %= 10;
      if (num > 0) currentWords += ' ';
    }
  
    if (num > 0 && num < 10) {
      currentWords += ones[num];
    }
  
    return currentWords;
  }

  while (num > 0) {
    if (num % 1000 !== 0) {
      words = `${convertLessThanOneThousand(num % 1000)} ${thousands[i]} ${words}`.trim();
    }
    num = Math.floor(num / 1000);
    i++;
  }

  return words.trim();
}

const fontOptions = [
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Times New Roman', value: "'Times New Roman', Times, serif" },
    { name: 'Garamond', value: 'Garamond, serif' },
    { name: 'Poppins', value: "'Poppins', sans-serif" },
    { name: 'Montserrat', value: "'Montserrat', sans-serif" },
    { name: 'Roboto', value: "'Roboto', sans-serif" },
    { name: 'Lato', value: "'Lato', sans-serif" },
    { name: 'Open Sans', value: "'Open Sans', sans-serif" },
];

const paperStyleClasses: Record<string, string> = {
    standard: 'bg-white',
    cream: 'bg-[#FFFDD0]',
    lokta: 'bg-[#EAE0D5]',
};


const VisaBuilderContent = () => {
    const { toast } = useToast();
    const router = useRouter();
    
    const [letterType, setLetterType] = useState<'visa' | 'job'>('visa');
    const [checklistStyle, setChecklistStyle] = useState('disc');
    const [templateStyle, setTemplateStyle] = useState('modern');
    const [fontFamily, setFontFamily] = useState(fontOptions[0].value);
    const [paperStyle, setPaperStyle] = useState('standard');
    const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
    const [templateColor, setTemplateColor] = useState('#003366');

    const [isExtracting, setIsExtracting] = useState(false);
    const [isAiLoading, setIsLoading] = useState(false);
    const letterPreviewRef = useRef<HTMLDivElement>(null);
    const [pdfjsLib, setPdfjsLib] = useState<any>(null);
    const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
    const [pastedText, setPastedText] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isExtractionDialogOpen, setIsExtractionDialogOpen] = useState(false);
    const [extractionSource, setExtractionSource] = useState<'text' | 'pdf' | 'image' | null>(null);

    const form = useForm<VisaLetterFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            letterType: 'visa',
            fullName: '', passport: '', nationality: 'Nepalese', manualNationality: '', phone: '', email: '',
            consulateType: 'Embassy', embassyOfCountry: '', manualEmbassyOfCountry: '', embassyCity: '', embassyStreetAddress: '', embassyCountry: '', manualEmbassyCountry: '',
            permanentCountry: '', manualPermanentCountry: '', permanentCity: '', manualPermanentCity: '', permanentStreetAddress: '', permanentPostalCode: '',
            currentCountry: '', manualCurrentCountry: '', currentCity: '', manualCurrentCity: '', currentStreetAddress: '', currentPostalCode: '',
            addressToUseInClosing: 'current',
            addTheRepublicOf: false,
            visaCategory: '', manualVisaCategory: '', 
            permitType: 'Work Permit', manualPermitType: '', workPermit: '', workPermitStartDate: '', workPermitEndDate: '',
            employerName: '', employerFullAddress: '', employerCountry: '', manualEmployerCountry: '',
            jobPosition: '',
            manualJobPosition: '', insuranceProvider: '', insuranceCoverage: '', insuranceCoverageCurrency: 'USD', manualCurrency: '',
            currentJob: '', manualCurrentJob: '',
            visaStatus: '', manualVisaStatus: '', idNumber: '', docs: [], dob: '', insuranceStartDate: '', insuranceExpiryDate: '',
            residenceIssueDate: '', residenceExpiryDate: '',
            incomeAmount: '', incomeCurrency: 'AED', manualIncomeCurrency: '', incomeCurrencyName: 'Dirhams',
            hiringManagerName: '',
            jobDescription: '',
            cvContent: '',
            letterDate: '',
            workingHours: '40 hours per week (8 hours per day, 5 days a week)',
            employerRegNo: '',
            employerRep: '',
            employerPhone: '',
            employerEmail: '',
            contractDuration: '1 year',
            accommodationDetails: 'Accommodation will be provided by the employer.',
            yearsOfExperience: '3',
            travelArrangements: 'All travel arrangements, including flight bookings, have been made.',
            tiesToHomeCountry: 'My family is permanently settled in my home country, and I have property and strong family ties, therefore I have no intention of staying abroad for an extended period after my contract.',
        },
    });
    
    useEffect(() => {
        if (!form.getValues('letterDate')) {
            const today = new Date();
            const offset = today.getTimezoneOffset();
            const localDate = new Date(today.getTime() - (offset * 60 * 1000));
            form.setValue('letterDate', localDate.toISOString().split('T')[0]);
        }
    }, [form]);
    
    const permanentCountry = form.watch('permanentCountry');
    const currentCountry = form.watch('currentCountry');
    const embassyCountry = form.watch('embassyCountry');

    const currentCities = useMemo(() => countriesWithCities.find(c => c.country === currentCountry)?.cities || [], [currentCountry]);
    const permanentCities = useMemo(() => countriesWithCities.find(c => c.country === permanentCountry)?.cities || [], [permanentCountry]);
    const embassyCities = useMemo(() => countriesWithCities.find(c => c.country === embassyCountry)?.cities || [], [embassyCountry]);

    const [countryCode, setCountryCode] = useState('');
    const manualCurrentCountry = form.watch('manualCurrentCountry');

    useEffect(() => {
        const finalCountry = currentCountry === 'Other' ? manualCurrentCountry : currentCountry;
        if (finalCountry) {
            const code = countryToCode[finalCountry] || '';
            setCountryCode(code);
        } else {
            setCountryCode('');
        }
    }, [currentCountry, manualCurrentCountry]);


    useEffect(() => {
        if (permanentCountry === 'Nepal' && form.getValues('permanentCity')) {
            const code = nepalPostalCodes[form.getValues('permanentCity') as keyof typeof nepalPostalCodes];
            if (code) form.setValue('permanentPostalCode', code);
        }
    }, [form.watch('permanentCity'), permanentCountry, form]);

    useEffect(() => {
        if (currentCountry === 'Nepal' && form.getValues('currentCity')) {
            const code = nepalPostalCodes[form.getValues('currentCity') as keyof typeof nepalPostalCodes];
            if (code) form.setValue('currentPostalCode', code);
        }
    }, [form.watch('currentCity'), currentCountry, form]);
    
    const embassyOfCountry = form.watch('embassyOfCountry');

    useEffect(() => {
        const finalEmbassyOfCountry = form.watch('embassyOfCountry') === 'Other' ? form.watch('manualEmbassyOfCountry') : form.watch('embassyOfCountry');
        if (finalEmbassyOfCountry && letterType === 'visa') {
            const requiredDocs = visaRequirements[finalEmbassyOfCountry] || [];
            if (requiredDocs.length > 0) {
                const currentDocs = form.getValues('docs') || [];
                const newDocs = Array.from(new Set([...currentDocs, ...requiredDocs]));
                form.setValue('docs', newDocs);
            }
        }
    }, [embassyOfCountry, form, letterType]);


    useEffect(() => {
        const loadPdfLib = async () => {
          try {
            const pdfjs = await import('pdfjs-dist/build/pdf');
            if (typeof window !== 'undefined') {
                const workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`;
                pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
            }
            setPdfjsLib(pdfjs);
          } catch (error) {
            console.error("Failed to load pdfjs-dist", error);
            toast({
                variant: 'destructive',
                title: 'PDF Library Error',
                description: 'Could not load PDF processing components. Please refresh the page.',
            });
          }
        };
        loadPdfLib();
    }, [toast]);

    const allDocsList = useMemo(() => {
        const baseDocs = [
            "Completed Visa Application Form with Photo",
            "Cover Letter",
            "Passport Copy (All pages)", "Passport Copy (Bio page)", "Civil ID / National ID Copy",
            "Birth Certificate", "Marriage Certificate", "Family Relationship Certificate",
            "Work Permit (Original and Copy)", "Signed Employment Contract", "Appointment Letter",
            "No Objection Certificate (NOC)", "Salary Certificate",
            "Proof of Work Experience", "Reference Letters from Previous Employers",
            "Educational Qualifications (Transcripts & Certificates)", "Character Certificate", "Professional Certifications / Licenses",
            "Flight Ticket Reservation", "Accommodation Confirmation Letter", "Travel & Medical Insurance Policy", "Medical Fitness Report",
            "Police Clearance Certificate", "Bank Statements (Last 3 Months)", "Bank Statements (Last 6 Months)",
            "Property Valuation Report", "Tax Clearance Certificate", "Supporting Documents from the Employer",
        ];

        const finalPermanentCountry = permanentCountry === 'Other' ? form.getValues('manualPermanentCountry') : permanentCountry;

        if (finalPermanentCountry) {
            const docSet = new Set(baseDocs);
            docSet.add(`${finalPermanentCountry} Residence ID Copy`);
            return Array.from(docSet);
        }

        return baseDocs;
    }, [permanentCountry, form]);

    const handleExtractionResult = (result: any) => {
        if ('error' in result) {
            toast({ variant: 'destructive', title: 'Extraction Failed', description: result.error });
        } else {
            Object.entries(result).forEach(([key, value]) => {
                if (value && key in form.getValues()) {
                     form.setValue(key as keyof VisaLetterFormData, value as any);
                }
            });
            toast({ title: 'Success!', description: 'Form has been auto-filled from the document.' });
        }
        setIsExtracting(false);
        setIsExtractionDialogOpen(false);
    };

    const handlePastedTextExtraction = async () => {
        if (!pastedText.trim()) {
            toast({ variant: 'destructive', title: 'No Text', description: 'Please paste some text to extract.' });
            return;
        }
        setIsExtracting(true);
        toast({ title: 'Processing Document...', description: 'AI is extracting information.' });
        try {
            const result = await extractInfoFromDocument({ documentText: pastedText });
            handleExtractionResult(result);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to extract from text.' });
            setIsExtracting(false);
        }
    };

    const processFileForExtraction = async (file: File) => {
        if (!pdfjsLib) {
            toast({
                variant: 'destructive',
                title: 'Library Not Ready',
                description: 'The PDF processing library is still loading. Please try again in a moment.',
            });
            return;
        }
        setIsExtracting(true);
        toast({ title: 'Processing Document...', description: 'AI is extracting information.' });
        try {
            if (file.type === 'application/pdf') {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
                    const pdf = await pdfjsLib.getDocument(typedArray).promise;
                    let fullText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        fullText += textContent.items.map((item: any) => ('str' in item ? item.str : '')).join(' ');
                    }
                    const textResult = await extractInfoFromDocument({ documentText: fullText });
                    handleExtractionResult(textResult);
                };
                reader.readAsArrayBuffer(file);
            } else if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const imageDataUri = e.target?.result as string;
                    const imageResult = await extractInfoFromDocument({ documentImageDataUri: imageDataUri });
                    handleExtractionResult(imageResult);
                };
                reader.readAsDataURL(file);
            } else {
                 throw new Error("Unsupported file type. Please upload a PDF or an image.");
            }
        } catch (error: any) {
            console.error('Error processing file:', error);
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to read or process the document.' });
            setIsExtracting(false);
        } finally {
            if(fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const processFileOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.[0]) {
            processFileForExtraction(event.target.files[0]);
        }
        if (event.target) {
            event.target.value = "";
        }
    };

    const handleGenerateJobCoverLetter = async () => {
        if (form.getValues('letterType') !== 'job') return;

        const { cvContent, jobDescription, employerName } = form.getValues();
        if (!jobDescription || !cvContent) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Please provide both the Job Description and your CV/Summary to generate a cover letter.",
            });
            return;
        }
        setIsAiLoading(true);
        toast({ title: 'Generating Cover Letter...', description: 'AI is crafting a personalized cover letter for you.' });
        try {
            const result = await createCoverLetter({
                cvContent,
                jobDescription,
                companyName: employerName,
            });
            if (result.coverLetterContent && !result.coverLetterContent.startsWith('Error:')) {
                form.setValue('cvContent', result.coverLetterContent);
                toast({ title: 'Success!', description: 'AI-generated cover letter content has been added.' });
            } else {
                throw new Error(result.coverLetterContent || 'An unknown error occurred during AI generation.');
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'AI Generation Failed', description: error.message });
        } finally {
            setIsAiLoading(false);
        }
    };


    const downloadPDF = async () => {
        const printArea = letterPreviewRef.current;
        if (!printArea) return;

        const { default: html2canvas } = await import('html2canvas');
        const { default: jsPDF } = await import('jspdf');
    
        const canvas = await html2canvas(printArea, { scale: 4 });
        const imgData = canvas.toDataURL('image/png');
    
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
    
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / imgHeight;
    
        let finalPdfWidth = pdfWidth;
        let finalPdfHeight = pdfWidth / ratio;
    
        if (finalPdfHeight > pdfHeight) {
            finalPdfHeight = pdfHeight;
            finalPdfWidth = pdfHeight * ratio;
        }
    
        pdf.addImage(imgData, 'PNG', 0, 0, finalPdfWidth, finalPdfHeight);
        pdf.save(`Cover_Letter_${form.getValues('fullName')}.pdf`);
        toast({ title: 'Download Started!' });
    };

    const handleNavigate = (path: string) => {
        if (path.startsWith('/')) {
            router.push(path);
        } else {
            router.push(`/#${path}`);
        }
    }

    const selectedDocs = form.watch('docs') || [];
    const allFormValues = form.watch();

    const renderCvContent = () => {
        const data = allFormValues;
        
        const letterDate = data.letterDate
            ? new Date(data.letterDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        const jobLetterBody = (bodyContent: string) => `
            <p style="margin: 2rem 0;">${letterDate}</p>
            <div style="margin-bottom: 2rem;">
                <p style="margin: 0;">${data.hiringManagerName || '[Hiring Manager Name]'}</p>
                <p style="margin: 0; font-weight: bold;">${data.employerName || '[Company Name]'}</p>
                <p style="margin: 0;">${data.employerFullAddress || '[Company Address]'}</p>
            </div>
            <p style="margin-bottom: 1rem;"><b>Dear ${data.hiringManagerName || 'Hiring Manager'},</b></p>
            <div style="line-height: 1.6;">${bodyContent.replace(/\n/g, '<br/>')}</div>
            <p style="margin-top: 2rem;">Sincerely,</p>
            <p style="margin: 0; font-weight: bold;">${data.fullName || '[Your Name]'}</p>
        `;

        if (letterType === 'job' && data.letterType === 'job') {
            const bodyContent = data.cvContent || '[Your cover letter content, based on the CV/Summary you provide, will appear here.]';

            const finalPermanentCity = data.permanentCity === 'Other' ? data.manualPermanentCity : data.permanentCity;
            const finalPermanentCountry = data.permanentCountry === 'Other' ? data.manualPermanentCountry : data.permanentCountry;
            const permanentAddressString = [data.permanentStreetAddress, finalPermanentCity, finalPermanentCountry].filter(Boolean).join(', ');

             const header = `
                <div style="text-align: ${textAlign}; margin-bottom: 2rem; border-bottom: 2px solid ${templateColor}; padding-bottom: 1rem;">
                    <h1 style="font-size: 24pt; font-weight: bold; margin: 0; color: ${templateColor};">${data.fullName || '[Your Name]'}</h1>
                    <p style="font-size: 10pt; margin-top: 0.5rem; color: #555;">
                        ${[permanentAddressString, data.phone, data.email].filter(Boolean).join(' | ')}
                    </p>
                </div>
            `;
            
            const body = jobLetterBody(bodyContent);

            return <div style={{ fontFamily: fontFamily, fontSize: '12pt' }} dangerouslySetInnerHTML={{ __html: header + body }} />;
        }

        if (data.letterType !== 'visa') return null;

        // --- Data preparation for Visa Letter ---
        const employerCountry = data.employerCountry === 'Other' ? data.manualEmployerCountry : data.employerCountry;
        const visaCategory = data.visaCategory === 'Other' ? data.manualVisaCategory : data.visaCategory;
        const visaStatus = data.visaStatus === 'Other' ? data.manualVisaStatus : data.visaStatus;
        const currentJob = data.currentJob === 'Other' ? data.manualCurrentJob : data.currentJob;
        const jobPosition = data.jobPosition === 'Other' ? data.manualJobPosition : data.jobPosition;
        const currentCity = data.currentCity === 'Other' ? data.manualCurrentCity : data.currentCity;
        const permanentCity = data.permanentCity === 'Other' ? data.manualPermanentCity : data.permanentCity;
        const nationality = data.nationality === 'Other' ? data.manualNationality : data.nationality;
        const embassyCountry = data.embassyCountry === 'Other' ? data.manualEmbassyCountry : data.embassyCountry;
        const currentCountry = data.currentCountry === 'Other' ? data.manualCurrentCountry : data.currentCountry;
        const permanentCountryValue = data.permanentCountry === 'Other' ? data.manualPermanentCountry : data.permanentCountry;
        const finalEmbassyOfCountry = data.embassyOfCountry === 'Other' ? data.manualEmbassyOfCountry : data.embassyOfCountry;
        
        const idSentence = data.idNumber ? ` My ID Number is <b>${data.idNumber}</b>` : '';
        const issueDateSentence = data.residenceIssueDate ? `, issued on <b>${data.residenceIssueDate}</b>` : '';
        const expiryDateSentence = data.residenceExpiryDate ? ` and valid until <b>${data.residenceExpiryDate}</b>` : '';
        
        const incomeCurrencyInfo = currencies.find(c => c.value === data.incomeCurrency);
        const incomeCurrencyName = data.incomeCurrency === 'other' ? data.incomeCurrencyName : incomeCurrencyInfo?.name;
        const incomeCurrencySymbol = data.incomeCurrency === 'other' ? data.manualIncomeCurrency : incomeCurrencyInfo?.value;
        const incomeInWords = data.incomeAmount ? numberToWords(Number(data.incomeAmount)) : '';
        const incomeDetails = data.incomeAmount ? `My monthly salary is ${incomeCurrencySymbol || ''} ${data.incomeAmount} (${titleCase(incomeInWords)} ${incomeCurrencyName} only).` : '';
        
        const currency = data.insuranceCoverageCurrency === 'other' ? data.manualCurrency : data.insuranceCoverageCurrency;
        const coverageAmount = data.insuranceCoverage ? `${currency || ''} ${data.insuranceCoverage}`: '';
        const insuranceSentence = data.insuranceProvider
            ? ` I have also secured a travel medical insurance policy from <b>${data.insuranceProvider}</b>, valid from <b>${data.insuranceStartDate || '[Start Date]'}</b> to <b>${data.insuranceExpiryDate || '[End Date]'}</b>, with a coverage of <b>${coverageAmount}</b>.`
            : '';

        const finalParagraph = `I am currently residing in ${currentCity || '[City]'}, ${currentCountry || '[Country]'} under a valid <b>${visaStatus || '[Visa Status]'}</b>${idSentence}${issueDateSentence}${expiryDateSentence}. I am employed as a <b>${currentJob || '[Current Job]'}</b>.${insuranceSentence} ${incomeDetails}`;
        
        const countryName = data.addTheRepublicOf ? `the Republic of ${finalEmbassyOfCountry}` : finalEmbassyOfCountry;
        const consulateName = data.consulateType && finalEmbassyOfCountry ? `${data.consulateType} of ${countryName}` : '[Consulate/Embassy Name]';

        const permitLabel = data.permitType === 'Other' ? data.manualPermitType : data.permitType;
        const permitDates = data.workPermitStartDate && data.workPermitEndDate ? `, valid from <b>${data.workPermitStartDate}</b> until <b>${data.workPermitEndDate}</b>` : '';

        const permanentAddressString = [data.permanentStreetAddress, permanentCity, data.permanentPostalCode, permanentCountryValue].filter(Boolean).join(', ');
        const currentAddressString = [data.currentStreetAddress, currentCity, data.currentPostalCode, currentCountry].filter(Boolean).join(', ');

        const closingAddress = data.addressToUseInClosing === 'current'
            ? (currentAddressString || '[Current Address]')
            : (permanentAddressString || '[Permanent Address]');
        
        const getPrefix = (index: number) => {
            switch (checklistStyle) {
                case 'decimal': return `${index + 1}. `;
                case 'star': return '★ ';
                default: return '• ';
            }
        };

        const visaLetterBody = `
            <div style="margin-bottom: 2rem;">
                <p style="margin: 0;">To:</p>
                <p style="margin: 0;"><b>${consulateName}</b></p>
                ${data.embassyStreetAddress ? `<p style="margin: 0;"><b>${data.embassyStreetAddress}</b></p>` : ''}
                <p style="margin: 0;"><b>${data.embassyCity || '[Embassy City]'}, ${embassyCountry || '[Embassy Country]'}</b></p>
            </div>
            <p style="margin-bottom: 2rem;"><b>Subject: Request for Granting ${visaCategory || '[Visa Category]'} Visa</b></p>
            <p style="margin-bottom: 1rem;">Dear Sir/Madam,</p>
            
            <p style="margin-bottom: 1rem;">I, <b>${data.fullName || '[Full Name]'}</b>, holder of passport number <b>${data.passport || '[Passport No.]'}</b>, am applying for a National Visa for employment purposes. I intend to work as a <b>${jobPosition || '[Job Position]'}</b>, with a valid work permit (No. <b>${data.workPermit || '[Permit No.]'}</b>)${permitDates}.</p>
            
            ${(data.incomeAmount || data.workingHours) ? `<p style="margin-bottom: 1rem;">${data.incomeAmount ? `My gross salary will be <b>${incomeCurrencySymbol || ''} ${data.incomeAmount} per month</b>` : ''}${data.incomeAmount && data.workingHours ? ', and ' : ''}${data.workingHours ? `I will be working <b>${data.workingHours}</b>` : ''}.</p>` : ''}

            <p style="margin-bottom: 1rem;">My employer is <b>${data.employerName || '[Employer Name]'}</b>
            ${data.employerRegNo ? `, registered under company number <b>${data.employerRegNo}</b>,` : ''}
            with its legal address at <b>${data.employerFullAddress || '[Employer Address]'}, ${employerCountry || '[Employer Country]'}</b>.
            ${data.employerRep ? ` The company’s representative is <b>${data.employerRep}</b>.` : ''}</p>
            
            ${data.contractDuration ? `<p style="margin-bottom: 1rem;">My employment contract specifies a fixed-term duration of <b>${data.contractDuration}</b>.</p>`: ''}
            ${data.accommodationDetails ? `<p style="margin-bottom: 1rem;">${data.accommodationDetails}</p>` : ''}
            
            ${data.yearsOfExperience ? `<p style="margin-bottom: 1rem;">With over <b>${data.yearsOfExperience} years of experience</b> in the same field, I am confident in my ability to adapt quickly and perform effectively in my role.</p>`: ''}
            
            ${data.travelArrangements ? `<p style="margin-bottom: 1rem;">${data.travelArrangements}</p>`: ''}
            
            ${data.tiesToHomeCountry ? `<p style="margin-bottom: 1rem;">${data.tiesToHomeCountry}</p>`: ''}
            
            ${insuranceSentence ? `<p style="margin-bottom: 1rem;">${insuranceSentence.trim()}</p>` : ''}

            <p style="margin-bottom: 1rem;">I would be deeply grateful if you could kindly consider my application for a ${countryName} National Employment Visa. Should you require any further information or clarification, please feel free to contact my future employer at the details below:</p>

            ${(data.employerPhone || data.employerEmail) ? `
            <div style="margin: 1rem 0; padding-left: 1rem; border-left: 2px solid #ccc;">
                <b>${data.employerName || '[Employer Name]'}</b><br>
                Legal Address: ${data.employerFullAddress || '[Employer Address]'}, ${employerCountry || '[Employer Country]'}<br>
                ${data.employerPhone ? `Phone: ${data.employerPhone}<br>` : ''}
                ${data.employerEmail ? `Email: <a href="mailto:${data.employerEmail}">${data.employerEmail}</a>` : ''}
            </div>
            ` : ''}

            ${selectedDocs.length > 0 ? `
                <div style="margin-bottom: 1rem;">
                    <p><b>Supporting Documents:</b></p>
                    <ul style="list-style-type: none; padding-left: 1.5rem; margin-top: 0.5rem;">
                        ${selectedDocs.map((doc, index) => `<li style="text-indent: -1.5rem; margin-bottom: 0.25rem;">${getPrefix(index)}${doc}</li>`).join('')}
                    </ul>
                </div>` : ''}
            <p style="margin-bottom: 1rem;">I humbly request the Consul to issue my National Visa for work at the earliest convenience. Thank you for your time and attention. I look forward to your favorable response.</p>
            <p style="margin-top: 2rem; margin-bottom: 1rem;">Yours faithfully,</p>
            <div class="closing-block" style="line-height: 1.2;">
                <p style="margin: 0;"><b>${data.fullName || '[Your Name]'}</b></p>
                <p style="margin: 0;">Date of Birth: ${data.dob || '[YYYY-MM-DD]'}</p>
                <p style="margin: 0;">Passport No.: ${data.passport || '[Passport No.]'}</p>
                <p style="margin: 0;">Address: ${closingAddress || '[Address]'}</p>
                <div style="margin-top: 0.5rem;">
                    <p style="margin: 0;"><b>Contact Information:</b></p>
                    <p style="margin: 0;">Phone Number: ${data.phone || '[Phone Number]'}</p>
                    <p style="margin: 0;">Email: <a href="mailto:${data.email}">${data.email || '[Email Address]'}</a></p>
                </div>
            </div>
        `;
        
        // --- LAYOUTS ---
        const ModernLayout = (
            <div style={{ fontFamily, fontSize: '11pt', lineHeight: 1.6 }}>
                <header style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: `2px solid ${templateColor}`, paddingBottom: '1rem' }}>
                    <h1 style={{ fontSize: '28pt', fontWeight: 'bold', margin: 0, color: templateColor }}>{data.fullName || '[Your Name]'}</h1>
                    <p style={{ fontSize: '11pt', margin: '0.25rem 0 0', color: '#555' }}>
                        {[closingAddress, data.phone, data.email].filter(Boolean).join(' | ')}
                    </p>
                </header>
                 <p style={{textAlign: 'right', margin: '1rem 0'}}>{letterDate}</p>
                <div dangerouslySetInnerHTML={{ __html: visaLetterBody }} />
            </div>
        );

        const ClassicLayout = (
            <div style={{ fontFamily, fontSize: '12pt', lineHeight: 1.5 }}>
                 <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{data.fullName || '[Your Name]'}</p>
                    <p style={{ margin: 0 }}>{closingAddress || '[Address]'}</p>
                    <p style={{ margin: 0 }}>{data.phone || ''}</p>
                    <p style={{ margin: 0 }}>{data.email || ''}</p>
                    <p style={{ margin: '1rem 0 0' }}>{letterDate}</p>
                </div>
                <div dangerouslySetInnerHTML={{ __html: visaLetterBody }} />
            </div>
        );

         const ElegantLayout = (
            <div style={{ fontFamily: 'Garamond, serif', fontSize: '12pt', lineHeight: 1.7 }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '24pt', fontWeight: 'normal', letterSpacing: '0.1em', margin: 0, borderBottom: `1px solid ${templateColor}`, display: 'inline-block', paddingBottom: '0.5rem' }}>{data.fullName || '[Your Name]'}</h1>
                    <p style={{ fontSize: '10pt', letterSpacing: '0.1em', marginTop: '0.5rem', color: '#777' }}>
                        {[closingAddress, data.phone, data.email].filter(Boolean).join(' • ')}
                    </p>
                </div>
                <p style={{textAlign: 'right', marginBottom: '2rem'}}>{letterDate}</p>
                <div dangerouslySetInnerHTML={{ __html: visaLetterBody }} />
            </div>
        );


        switch (templateStyle) {
            case 'classic': return ClassicLayout;
            case 'elegant': return ElegantLayout;
            default: return ModernLayout;
        }
    };
    
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
        const value = e.target.value;
        field.onChange(value);

        if (value && !value.includes('@')) {
            setEmailSuggestions(commonEmailDomains.map(domain => value + domain));
        } else {
            setEmailSuggestions([]);
        }
    };
    
    const handleSuggestionClick = (suggestion: string, field: any) => {
        field.onChange(suggestion);
        setEmailSuggestions([]);
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar onNavigate={handleNavigate} />
            <main className="flex-1 container mx-auto p-4 md:p-6">
                <button onClick={() => router.push('/')} className="animated-border-card inline-block mb-6">
                    <span className={cn("inner-span flex items-center back-to-home-button")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </span>
                </button>
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter text-glow-primary">
                        AI Cover Letter Generator
                    </h1>
                    <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                        Generate a formal, compliant Cover Letter for your visa or job application.
                    </p>
                </div>
                
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* INPUTS COLUMN */}
                    <div className="w-full lg:w-2/5 no-print space-y-6">
                         <Card className="glass-card">
                            <CardHeader>
                                <CardTitle>Content Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <Accordion type="multiple" defaultValue={['applicant-details']} className="w-full space-y-2">
                                        <AccordionItem value="applicant-details" className="border-b-0 rounded-lg overflow-hidden bg-muted/30">
                                            <AccordionTrigger className="p-4 hover:no-underline font-semibold text-primary">
                                                <span className="flex items-center text-base"><User className="mr-3 h-5 w-5"/>Applicant Details</span>
                                            </AccordionTrigger>
                                            <AccordionContent className="pt-0 p-4 space-y-4">
                                                <FormField control={form.control} name="fullName" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Full Name</FormLabel>
                                                        <FormControl><Input {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                     <FormField control={form.control} name="phone" render={({ field }) => (
                                                        <FormItem>
                                                          <FormLabel>Phone Number</FormLabel>
                                                            <div className="flex items-center gap-2">
                                                              <Input value={countryCode} className="w-[80px]" readOnly/>
                                                              <Input {...field} placeholder="e.g. 9812345678" className="flex-1" />
                                                            </div>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                     <FormField control={form.control} name="email" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Email Address</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} onChange={(e) => handleEmailChange(e, field)} />
                                                            </FormControl>
                                                            {emailSuggestions.length > 0 && (
                                                                <div className="p-2 border rounded-md bg-secondary/50 text-sm">
                                                                    {emailSuggestions.map(s => <button type="button" key={s} onClick={() => handleSuggestionClick(s, field)} className="block w-full text-left p-1 rounded hover:bg-background">{s}</button>)}
                                                                </div>
                                                            )}
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                </div>
                                                <Separator className="my-4" />
                                                <h4 className="font-semibold text-muted-foreground text-sm">Permanent Address</h4>
                                                 <FormField control={form.control} name="permanentStreetAddress" render={({ field }) => (<FormItem><FormLabel>Street</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                      <FormField control={form.control} name="permanentCountry" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Country</FormLabel>
                                                            <FormControl>
                                                                <Select onValueChange={(value) => { field.onChange(value); form.setValue('permanentCity', ''); }} value={field.value}>
                                                                    <SelectTrigger><SelectValue placeholder="Country"/></SelectTrigger>
                                                                    <SelectContent><ScrollArea className="h-72">{worldCountries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}<SelectItem value="Other">Other</SelectItem></ScrollArea></SelectContent>
                                                                </Select>
                                                            </FormControl>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={form.control} name="permanentCity" render={({ field }) => (
                                                      <FormItem>
                                                        <FormLabel>City/District</FormLabel>
                                                        <FormControl>
                                                          <Select onValueChange={field.onChange} value={field.value} disabled={permanentCities.length === 0}>
                                                              <SelectTrigger><SelectValue placeholder="Select"/></SelectTrigger>
                                                              <SelectContent><ScrollArea className="h-72">
                                                                  {permanentCities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                                                                  <SelectItem value="Other">Other</SelectItem>
                                                              </ScrollArea></SelectContent>
                                                          </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                      </FormItem>
                                                    )} />
                                                    <FormField control={form.control} name="permanentPostalCode" render={({ field }) => (<FormItem><FormLabel>Postal Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                 </div>
                                                 {form.watch('permanentCity') === 'Other' && <FormField control={form.control} name="manualPermanentCity" render={({ field }) => (<FormItem><FormLabel className="text-[9px]">Specify City</FormLabel><FormControl><Input {...field}/></FormControl></FormItem>)}/>}
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="employment-details" className="border-b-0 rounded-lg overflow-hidden bg-muted/30">
                                            <AccordionTrigger className="p-4 hover:no-underline font-semibold text-primary">
                                                <span className="flex items-center text-base"><Briefcase className="mr-3 h-5 w-5"/>Employment Details</span>
                                            </AccordionTrigger>
                                            <AccordionContent className="pt-0 p-4 space-y-4">
                                                <h4 className="font-semibold text-muted-foreground pt-2">Current Employment</h4>
                                                 <FormField control={form.control} name="currentJob" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Current Job Title</FormLabel>
                                                        <FormControl>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <SelectTrigger><SelectValue placeholder="Select current job"/></SelectTrigger>
                                                                <SelectContent><ScrollArea className="h-72">{commonJobTitles.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</ScrollArea></SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                 )}/>
                                                {form.watch('currentJob') === 'Other' && <FormField control={form.control} name="manualCurrentJob" render={({ field }) => (<FormItem><FormLabel>Specify Current Job</FormLabel><FormControl><Input {...field}/></FormControl></FormItem>)}/>}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField control={form.control} name="incomeAmount" render={({ field }) => (<FormItem><FormLabel>Current Salary</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                                    <FormField control={form.control} name="incomeCurrency" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Salary Currency</FormLabel>
                                                            <FormControl>
                                                                <Select onValueChange={(value) => {
                                                                    field.onChange(value);
                                                                    const currencyName = currencies.find(c => c.value === value)?.name || '';
                                                                    form.setValue('incomeCurrencyName', currencyName);
                                                                }} value={field.value}>
                                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                                    <SelectContent>{currencies.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                                                                </Select>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}/>
                                                </div>
                                                {form.watch('incomeCurrency') === 'other' && <div className="grid grid-cols-2 gap-4"><FormField control={form.control} name="manualIncomeCurrency" render={({ field }) => (<FormItem><FormLabel>Specify Currency Symbol</FormLabel><FormControl><Input placeholder="e.g., JPY"/></FormControl></FormItem>)}/><FormField control={form.control} name="incomeCurrencyName" render={({ field }) => (<FormItem><FormLabel>Currency Name (plural)</FormLabel><FormControl><Input placeholder="e.g., Yen"/></FormControl></FormItem>)}/></div>}
                                                <Separator/>
                                                <h4 className="font-semibold text-muted-foreground pt-2">Future Employment</h4>
                                                <FormField control={form.control} name="employerName" render={({ field }) => (<FormItem><FormLabel>Employer Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                                <FormField control={form.control} name="employerFullAddress" render={({ field }) => (<FormItem><FormLabel>Employer Full Address</FormLabel><FormControl><Input placeholder="Street, City, Postal Code" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                                <FormField control={form.control} name="employerCountry" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Employer Country</FormLabel>
                                                        <FormControl>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <SelectTrigger> <SelectValue placeholder="Select Country" /> </SelectTrigger>
                                                                <SelectContent> <ScrollArea className="h-72"> {worldCountries.map((c) => ( <SelectItem key={c} value={c}>{c}</SelectItem> ))} <SelectItem value="Other">Other</SelectItem> </ScrollArea> </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}/>
                                                {form.watch('employerCountry') === 'Other' && <FormField control={form.control} name="manualEmployerCountry" render={({ field }) => (<FormItem><FormLabel>Specify Employer Country</FormLabel><FormControl><Input {...field}/></FormControl></FormItem>)}/>}
                                                <FormField control={form.control} name="jobPosition" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Offered Job Position</FormLabel>
                                                        <FormControl>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <SelectTrigger><SelectValue placeholder="Select job position"/></SelectTrigger>
                                                                <SelectContent><ScrollArea className="h-72">{commonJobTitles.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</ScrollArea></SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}/>
                                                {form.watch('jobPosition') === 'Other' && <FormField control={form.control} name="manualJobPosition" render={({ field }) => (<FormItem><FormLabel>Specify Job Position</FormLabel><FormControl><Input {...field}/></FormControl></FormItem>)}/>}
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="embassy-visa-details" className="border-b-0 rounded-lg overflow-hidden bg-muted/30">
                                            <AccordionTrigger className="p-4 hover:no-underline font-semibold text-primary">
                                                <span className="flex items-center text-base"><Building className="mr-3 h-5 w-5"/>Embassy &amp; Visa Details</span>
                                            </AccordionTrigger>
                                            <AccordionContent className="pt-0 p-4 space-y-4">
                                                <h4 className="font-semibold text-muted-foreground pt-2">Recipient Embassy Details</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                     <FormField control={form.control} name="consulateType" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Recipient Type</FormLabel>
                                                            <FormControl>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="Embassy">Embassy</SelectItem>
                                                                        <SelectItem value="Consulate Section">Consulate Section</SelectItem>
                                                                        <SelectItem value="Consulate General">Consulate General</SelectItem>
                                                                        <SelectItem value="High Commission">High Commission</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormControl>
                                                        </FormItem>
                                                     )}/>
                                                     <FormField control={form.control} name="embassyOfCountry" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Embassy of (Country)</FormLabel>
                                                            <FormControl>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <SelectTrigger> <SelectValue placeholder="Select Embassy Country" /> </SelectTrigger>
                                                                    <SelectContent> <ScrollArea className="h-72"> {worldCountries.map((c) => ( <SelectItem key={c} value={c}>{c}</SelectItem> ))} <SelectItem value="Other">Other</SelectItem> </ScrollArea> </SelectContent>
                                                                </Select>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                     )}/>
                                                </div>
                                                {form.watch('embassyOfCountry') === 'Other' && <FormField control={form.control} name="manualEmbassyOfCountry" render={({ field }) => (<FormItem><FormLabel>Specify Embassy Country</FormLabel><FormControl><Input {...field}/></FormControl></FormItem>)}/>}
                                                <div className="flex items-center space-x-2"> <Checkbox id="addTheRepublicOf" checked={form.watch('addTheRepublicOf')} onCheckedChange={(checked) => form.setValue('addTheRepublicOf', !!checked)} /> <label htmlFor="addTheRepublicOf" className="text-sm font-medium leading-none">Add "the Republic of" prefix</label> </div>
                                                
                                                <FormField control={form.control} name="embassyStreetAddress" render={({ field }) => (<FormItem><FormLabel>Embassy Street Address</FormLabel><FormControl><Input placeholder="e.g., B8 Anand Niketan, 110021" {...field}/></FormControl></FormItem>)} />
                                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <FormField control={form.control} name="embassyCountry" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Embassy Location (Country)</FormLabel>
                                                            <FormControl>
                                                                <Select onValueChange={(v) => { field.onChange(v); form.setValue('embassyCity', ''); }} value={field.value}>
                                                                    <SelectTrigger><SelectValue placeholder="Select Location" /></SelectTrigger>
                                                                    <SelectContent>
                                                                        <ScrollArea className="h-72">{worldCountries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</ScrollArea>
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormControl>
                                                        </FormItem>
                                                    )}/>
                                                    <FormField control={form.control} name="embassyCity" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Embassy City</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value} disabled={embassyCities.length === 0}>
                                                                <FormControl><SelectTrigger><SelectValue placeholder="Select City"/></SelectTrigger></FormControl>
                                                                <SelectContent><ScrollArea className="h-72">
                                                                    {embassyCities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                                                                    <SelectItem value="Other">Other</SelectItem>
                                                                </ScrollArea></SelectContent>
                                                            </Select>
                                                        </FormItem>
                                                    )}/>
                                                </div>
                                                
                                                <Separator className="my-4"/>
                                                <h4 className="font-semibold text-muted-foreground">Visa &amp; Permit Details</h4>
                                                <FormField control={form.control} name="visaCategory" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Visa Category</FormLabel>
                                                        <FormControl>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <SelectTrigger><SelectValue placeholder="Select visa category"/></SelectTrigger>
                                                                <SelectContent><ScrollArea className="h-72">{euVisaCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</ScrollArea></SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                    </FormItem>
                                                )}/>
                                                {form.watch('visaCategory') === 'Other' && <FormField control={form.control} name="manualVisaCategory" render={({ field }) => (<FormItem><FormLabel>Specify Visa Category</FormLabel><FormControl><Input {...field}/></FormControl></FormItem>)}/>}
                                                <FormField control={form.control} name="permitType" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Permit Type</FormLabel>
                                                        <FormControl>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <SelectTrigger><SelectValue/></SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="Work Permit">Work Permit</SelectItem>
                                                                    <SelectItem value="Employment Contract">Employment Contract</SelectItem>
                                                                    <SelectItem value="Other">Other</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                    </FormItem>
                                                )}/>
                                                {form.watch('permitType') === 'Other' && <FormField control={form.control} name="manualPermitType" render={({ field }) => (<FormItem><FormLabel>Specify Permit Type</FormLabel><FormControl><Input {...field}/></FormControl></FormItem>)}/>}
                                                <FormField control={form.control} name="workPermit" render={({ field }) => (<FormItem><FormLabel>Work Permit / Contract Number</FormLabel><FormControl><Input {...field}/></FormControl></FormItem>)}/>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <FormField control={form.control} name="workPermitStartDate" render={({ field }) => (<FormItem><FormLabel>Permit Start Date (Opt.)</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>)} />
                                                    <FormField control={form.control} name="workPermitEndDate" render={({ field }) => (<FormItem><FormLabel>Permit End Date (Opt.)</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>)} />
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="status-insurance" className="border-b-0 rounded-lg overflow-hidden bg-muted/30">
                                            <AccordionTrigger className="p-4 hover:no-underline font-semibold text-primary">
                                                <span className="flex items-center text-base"><ShieldCheck className="mr-3 h-5 w-5"/>Status &amp; Insurance</span>
                                            </AccordionTrigger>
                                            <AccordionContent className="pt-0 p-4 space-y-4">
                                                <FormField control={form.control} name="visaStatus" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Current Visa/Residence Status</FormLabel>
                                                        <FormControl>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <SelectTrigger><SelectValue placeholder="Select status"/></SelectTrigger>
                                                                <SelectContent><ScrollArea className="h-72">{residenceStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</ScrollArea></SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}/>
                                                {form.watch('visaStatus') === 'Other' && <FormField control={form.control} name="manualVisaStatus" render={({ field }) => (<FormItem><FormLabel>Specify Status</FormLabel><FormControl><Input {...field}/></FormControl></FormItem>)}/>}
                                                <FormField control={form.control} name="idNumber" render={({ field }) => (<FormItem><FormLabel>Residence ID Number (Opt.)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField control={form.control} name="residenceIssueDate" render={({ field }) => (<FormItem><FormLabel>ID Issue Date (Opt.)</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>)} />
                                                    <FormField control={form.control} name="residenceExpiryDate" render={({ field }) => (<FormItem><FormLabel>ID Expiry Date (Opt.)</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>)} />
                                                </div>
                                                <Separator/>
                                                <FormField control={form.control} name="insuranceProvider" render={({ field }) => (<FormItem><FormLabel>Insurance Provider (Opt.)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                     <FormField control={form.control} name="insuranceCoverage" render={({ field }) => (<FormItem><FormLabel>Coverage Amount (Opt.)</FormLabel><FormControl><Input type="number" {...field}/></FormControl></FormItem>)}/>
                                                      <FormField control={form.control} name="insuranceCoverageCurrency" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Currency (Opt.)</FormLabel>
                                                            <FormControl>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                                                    <SelectContent>{currencies.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                                                                </Select>
                                                            </FormControl>
                                                        </FormItem>
                                                    )}/>
                                                </div>
                                                {form.watch('insuranceCoverageCurrency') === 'other' && <FormField control={form.control} name="manualCurrency" render={({ field }) => (<FormItem><FormLabel>Specify Currency</FormLabel><FormControl><Input {...field} placeholder="e.g., JPY"/></FormControl></FormItem>)} />}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField control={form.control} name="insuranceStartDate" render={({ field }) => (<FormItem><FormLabel>Insurance Start (Opt.)</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>)} />
                                                    <FormField control={form.control} name="insuranceExpiryDate" render={({ field }) => (<FormItem><FormLabel>Insurance Expiry (Opt.)</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>)} />
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="document-checklist" className="border-b-0 rounded-lg overflow-hidden bg-muted/30">
                                            <AccordionTrigger className="p-4 hover:no-underline font-semibold text-primary">
                                                <span className="flex items-center text-base"><ClipboardList className="mr-3 h-5 w-5"/>Document Checklist</span>
                                            </AccordionTrigger>
                                            <AccordionContent className="pt-0 p-4 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-muted-foreground">Select documents you will attach.</p>
                                                    <Select value={checklistStyle} onValueChange={setChecklistStyle}>
                                                        <SelectTrigger className="w-[120px]"><SelectValue/></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="disc">Bullets</SelectItem>
                                                            <SelectItem value="decimal">Numbers</SelectItem>
                                                            <SelectItem value="star">Stars</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <ScrollArea className="h-64 rounded-md border p-4">
                                                    <div className="space-y-3">
                                                        {allDocsList.map((item) => (
                                                            <FormField key={item} control={form.control} name="docs"
                                                                render={({ field }) => (
                                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                                        <FormControl><Checkbox checked={field.value?.includes(item)} onCheckedChange={(checked) => { return checked ? field.onChange([...(field.value || []), item]) : field.onChange(field.value?.filter((value) => value !== item)) }} /></FormControl>
                                                                        <FormLabel className="font-normal">{item}</FormLabel>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        ))}
                                                    </div>
                                                </ScrollArea>
                                            </AccordionContent>
                                        </AccordionItem>
                                        
                                        <AccordionItem value="design-settings" className="border-b-0 rounded-lg overflow-hidden bg-muted/30">
                                            <AccordionTrigger className="p-4 hover:no-underline font-semibold text-primary">
                                                <span className="flex items-center text-base"><Palette className="mr-3 h-5 w-5"/>Document Design</span>
                                            </AccordionTrigger>
                                            <AccordionContent className="pt-0 p-4 space-y-4">
                                                <FormField control={form.control} name="letterType" render={({ field }) => (
                                                    <FormItem>
                                                      <FormLabel>Letter Type</FormLabel>
                                                      <FormControl>
                                                        <Select onValueChange={(v) => { field.onChange(v); setLetterType(v as 'visa'|'job'); }} value={field.value}>
                                                          <SelectTrigger><SelectValue /></SelectTrigger>
                                                          <SelectContent>
                                                            <SelectItem value="visa">Visa Cover Letter</SelectItem>
                                                            <SelectItem value="job">Job Application Letter</SelectItem>
                                                          </SelectContent>
                                                        </Select>
                                                      </FormControl>
                                                    </FormItem>
                                                )} />
                                                <FormItem><FormLabel>Template Style</FormLabel><Select value={templateStyle} onValueChange={setTemplateStyle}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="modern">Modern</SelectItem><SelectItem value="classic">Classic</SelectItem><SelectItem value="elegant">Elegant</SelectItem></SelectContent></Select></FormItem>
                                                <FormItem><FormLabel>Font Family</FormLabel><Select value={fontFamily} onValueChange={setFontFamily}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{fontOptions.map(font => <SelectItem key={font.value} value={font.value} style={{fontFamily: font.value}}>{font.name}</SelectItem>)}</SelectContent></Select></FormItem>
                                                <FormItem><FormLabel>Paper Style</FormLabel><Select value={paperStyle} onValueChange={setPaperStyle}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(paperStyleClasses).map(([key, value]) => <SelectItem key={key} value={key}>{key.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}</SelectContent></Select></FormItem>
                                                <FormItem><FormLabel>Header/Theme Color</FormLabel><Input type="color" value={templateColor} onChange={(e) => setTemplateColor(e.target.value)} /></FormItem>
                                                <FormItem><FormLabel>Header Text Alignment</FormLabel><Select value={textAlign} onValueChange={(v) => setTextAlign(v as any)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="left">Left</SelectItem><SelectItem value="center">Center</SelectItem><SelectItem value="right">Right</SelectItem></SelectContent></Select></FormItem>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>
                    {/* PREVIEW COLUMN */}
                        <div className="w-full lg:w-3/5 sticky top-6">
                        <Card className="h-full flex flex-col">
                            <CardHeader className="flex flex-row items-start justify-between no-print">
                                <div className="space-y-1.5">
                                    <CardTitle>Cover Letter Preview</CardTitle>
                                    <CardDescription>Your letter will appear here.</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <div ref={letterPreviewRef} className={cn("text-black p-8 rounded-md shadow-lg min-h-[50vh] prose-sm max-w-none", paperStyleClasses[paperStyle as keyof typeof paperStyleClasses])}>
                                    {(renderCvContent())}
                                </div>
                            </CardContent>
                             <CardFooter className="justify-center pt-4">
                                <Button onClick={downloadPDF} size="lg" className="h-12 text-base gradient-button-gold">
                                    <Printer className="mr-2" /> Print / Download
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </main>
            <LandingFooter onNavigate={handleNavigate} />
             <UiDialog open={isExtractionDialogOpen} onOpenChange={setIsExtractionDialogOpen}>
                <UiDialogContent>
                    <UiDialogHeader>
                        <UiDialogTitle>Auto-fill from Document</UiDialogTitle>
                        <UiDialogDescription>
                            Extract information from a CV, passport, or ID card to automatically fill the form.
                        </UiDialogDescription>
                    </UiDialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Paste Text</Label>
                            <Textarea
                                value={pastedText}
                                onChange={(e) => setPastedText(e.target.value)}
                                placeholder="Paste the content of your CV or document here."
                                rows={8}
                            />
                             <Button onClick={handlePastedTextExtraction} disabled={isExtracting || !pastedText.trim()} className="w-full">
                                {isExtracting && extractionSource === 'text' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                                Extract from Text
                            </Button>
                        </div>
                        <div className="relative">
                           <div className="absolute inset-0 flex items-center">
                               <span className="w-full border-t" />
                           </div>
                           <div className="relative flex justify-center text-xs uppercase">
                               <span className="bg-background px-2 text-muted-foreground">Or</span>
                           </div>
                       </div>
                        <div className="space-y-2">
                           <Label>Upload File</Label>
                           <Input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,image/*"
                                onChange={processFileOnChange}
                                disabled={isExtracting}
                                className="file:text-primary file:font-semibold"
                           />
                           {isExtracting && (extractionSource === 'pdf' || extractionSource === 'image') && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    Processing your file...
                                </div>
                           )}
                       </div>
                    </div>
                    <UiDialogFooter>
                        <Button variant="outline" onClick={() => setIsExtractionDialogOpen(false)}>Cancel</Button>
                    </UiDialogFooter>
                </UiDialogContent>
            </UiDialog>
            {/* Hidden div for printing */}
            <div className="hidden print:block">
                <div id="print-area" className="bg-white text-black p-[1cm]" style={{ fontFamily: fontFamily, fontSize: '12pt', lineHeight: '1.5' }}>
                    {allFormValues && (
                        <>
                            {renderCvContent()}
                            
                            {letterType === 'visa' && selectedDocs && selectedDocs.length > 0 && (
                                <>
                                    <div style={{ pageBreakBefore: 'always' }}></div>
                                    <h2 style={{ fontWeight: 'bold', fontSize: '16pt', marginBottom: '1.5rem', textDecoration: 'underline' }}>List of Attached Documents</h2>
                                    <ul style={{ listStyleType: 'none', paddingLeft: '20px' }}>
                                        {selectedDocs.map((doc, index) => {
                                            const getPrefix = () => {
                                                switch(checklistStyle) {
                                                    case 'decimal': return `${index + 1}. `;
                                                    case 'star': return '★ ';
                                                    default: return '• ';
                                                }
                                            };
                                            return <li key={doc} style={{ marginBottom: '0.5em', textIndent: '-20px' }}>{getPrefix()}{doc}</li>
                                        })}
                                    </ul>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

const VisaBuilderPage = () => (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
        <VisaBuilderContent />
    </Suspense>
);

export default VisaBuilderPage;
