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
import { Loader2, ArrowLeft, Download, PlusCircle, Trash2, Home, Building, Landmark, ShieldAlert, Sprout, Banknote, Users, Map, School, FileText, HeartPulse, Phone, Ambulance, Siren, PersonStanding, Wind, ClipboardList, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { countriesWithCities, worldCountries, nepaliDistricts } from '@/lib/cities';
import { bsCalendarData } from '@/lib/bs-ad-calendar-data';
import { Separator } from '@/components/ui/separator';
import { countryToCode } from '@/lib/country-codes';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


const documentSchema = z.object({
  name: z.string().min(1, "कागजातको नाम लेख्नुहोस्"),
});

const nivedanSchema = z.object({
  officeType: z.string({ required_error: "निकायको प्रकार छान्नुहोस्" }),
  officeName: z.string().min(1, "कार्यालयको नाम अनिवार्य छ"),
  officeAddress: z.string().min(1, "कार्यालयको ठेगाना अनिवार्य छ"),
  applicationType: z.string().optional(),
  subject: z.string().optional(),
  
  applicantFullName: z.string().min(1, "निवेदकको पूरा नाम अनिवार्य छ"),
  fatherMotherName: z.string().min(1, "बाबु/आमाको नाम अनिवार्य छ"),
  grandfatherName: z.string().optional(),
  
  passportNumber: z.string().optional(),
  citizenshipNumber: z.string().min(1, "नागरिकता नम्बर अनिवार्य छ"),
  issuingDistrict: z.string().min(1, "जारी जिल्ला अनिवार्य छ"),

  permanentAddress: z.string().min(1, "स्थायी ठेगाना अनिवार्य छ"),
  permanentWard: z.string().min(1, "वडा नम्बर अनिवार्य छ"),
  
  currentStreetAddress: z.string().optional(),
  currentCity: z.string().optional(),
  manualCurrentCity: z.string().optional(),
  currentCountry: z.string().optional(),
  manualCurrentCountry: z.string().optional(),
  currentPostalCode: z.string().optional(),
  
  phoneNumber: z.string().min(1, "फोन नम्बर अनिवार्य छ"),
  phoneCountryCode: z.string().optional(),
  
  emailAddress: z.string().email("सही इमेल ठेगाना लेख्नुहोस्").optional().or(z.literal('')),
  
  profession: z.string().optional(),
  
  problemObjective: z.string().min(1, "समस्या वा उद्देश्य अनिवार्य छ"),
  detailedDescription: z.string().optional(),
  
  incidentDate: z.string().optional(),
  incidentPlace: z.string().optional(),
  requiredService: z.string().optional(),
  quantity: z.string().optional(),
  purposeOfUse: z.string().optional(),
  
  attachedDocuments: z.array(documentSchema).optional(),
  date: z.string().min(1, "मिति अनिवार्य छ"),
});

type NivedanFormData = z.infer<typeof nivedanSchema>;

const officeTypes = [
    { value: 'woda', label: 'वडा', icon: Home },
    { value: 'nagarpalika', label: 'नगरपालिका', icon: Building },
    { value: 'prahasan', label: 'प्रशासन', icon: Landmark },
    { value: 'prahari', label: 'प्रहरी', icon: ShieldAlert },
    { value: 'van', label: 'वन', icon: Sprout },
    { value: 'bank', label: 'बैंक', icon: Banknote },
    { value: 'sahakari', label: 'सहकारी', icon: Users },
    { value: 'malpot', label: 'मालपोत', icon: Map },
    { value: 'school', label: 'विद्यालय', icon: School },
    { value: 'health', label: 'स्वास्थ्य', icon: HeartPulse },
    { value: 'public_issue', label: 'सार्वजनिक समस्या', icon: Wind },
    { value: 'other', label: 'अन्य', icon: FileText },
];

const applicationTypesByOffice: Record<string, string[]> = {
    woda: ["बसोबास प्रमाण", "नागरिकता सिफारिस", "जन्म दर्ता सिफारिस", "मृत्यु दर्ता सिफारिस", "पासपोर्ट सिफारिस", "अविवाहित प्रमाणपत्र", "विवाह दर्ता सिफारिस", "जग्गा / घर स्थान प्रमाणपत्र", "विद्यालय भर्ना सिफारिस", "सामाजिक सुरक्षा भत्ता सिफारिस", "पारिवारिक समस्या", "अन्य"],
    nagarpalika: ["सेवा सम्बन्धी सिफारिस", "व्यवसाय / उद्योग दर्ता प्रमाणपत्र", "कर प्रमाणपत्र", "भवन अनुमति", "योजना / अनुदान सिफारिस", "सडक / सार्वजनिक सुविधा अनुरोध", "अन्य"],
    prahasan: ["पासपोर्ट सिफारिस", "नाबालक परिचयपत्र", "आपतकालीन सिफारिस", "प्रशासनिक अनुमति", "भूमि स्वामित्व सिफारिस", "विदेशी नागरिक अनुमति", "कानुनी सिफारिस", "आपतकालीन राहत", "अन्य"],
    prahari: ["चरित्र प्रमाण (Police Clearance)", "बैंक स्टेटमेन्ट अनुरोध", "उजुरी (चोरी, झगडा, दुर्घटना)", "सुरक्षा अनुरोध", "घटना विवरण सिफारिस", "अनुसन्धानका लागि अनुरोध", "अन्य"],
    van: ["काठ अनुमति", "दाउरा / घाँस अनुमति", "जडीबुटी संकलन अनुमति", "सामुदायिक वन उपयोग अनुमति", "पर्यावरण / संरक्षण सम्बन्धी निवेदन", "अन्य"],
    bank: ["खाता प्रमाणीकरण", "बैंक स्टेटमेन्ट अनुरोध", "खाता खोल्ने निवेदन", "ऋण / कर्जा सिफारिस", "खाता सच्याउने / अपडेट गर्ने", "अन्य"],
    sahakari: ["सदस्यता आवेदन", "ऋण आवेदन", "बचत खाता आवेदन", "आर्थिक सिफारिस", "अन्य"],
    malpot: ["जग्गा दर्ता / स्थानान्तरण सिफारिस", "जग्गाधनी प्रमाणपत्र", "जग्गा भाडा / अनुमति निवेदन", "वारिस प्रमाणपत्र", "अन्य"],
    school: ["ट्रान्सक्रिप्ट / शैक्षिक प्रमाणपत्र अनुरोध", "भर्ना आवेदन", "छात्रवृत्ति आवेदन", "स्थानान्तरण प्रमाणपत्र", "अन्य"],
    health: ["स्वास्थ्य प्रमाणपत्र", "अस्पताल सेवा निवेदन", "स्वास्थ्य रिपोर्ट", "आपतकालीन निवेदन", "अन्य"],
    public_issue: ["यातायात समस्या", "बत्ती / पानी / ढल समस्या", "पर्यावरण / प्रदूषण रिपोर्ट", "सामाजिक सहायता निवेदन", "अन्य"],
    other: ["रोजगार / पेशागत प्रमाणपत्र", "परियोजना / अनुदान अनुरोध", "सामुदायिक सहायता निवेदन", "अन्य निजी / सामाजिक निवेदन", "अन्य"],
};

function toNepaliDate(date: Date): string {
    const adYear = date.getUTCFullYear();
    const adMonth = date.getUTCMonth() + 1;
    const adDay = date.getUTCDate();

    const refAdTimestamp = Date.UTC(1913, 3, 14); // April 14, 1913 AD is 1970 Baishakh 1
    const inputAdTimestamp = Date.UTC(adYear, adMonth - 1, adDay);
    const daysDiff = Math.floor((inputAdTimestamp - refAdTimestamp) / (1000 * 60 * 60 * 24));

    let bsYear = 1970;
    let remainingDays = daysDiff;

    while(true) {
        if (!bsCalendarData[bsYear]) break;
        const daysInYear = bsCalendarData[bsYear].reduce((sum, days) => sum + days, 0);
        if (remainingDays >= daysInYear) {
            remainingDays -= daysInYear;
            bsYear++;
        } else {
            break;
        }
    }
    
    let bsMonth = 1;
    if (bsCalendarData[bsYear]) {
        while (remainingDays >= bsCalendarData[bsYear][bsMonth - 1]) {
            remainingDays -= bsCalendarData[bsYear][bsMonth - 1];
            bsMonth++;
        }
    }

    const bsDay = remainingDays + 1;
    
    const toNepaliNumeralsFunc = (num: number | string): string => {
        const str = String(num);
        const nepaliNumerals = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
        return str.replace(/[0-9]/g, d => nepaliNumerals[parseInt(d)]);
    };

    return `${toNepaliNumeralsFunc(bsYear)}-${toNepaliNumeralsFunc(String(bsMonth).padStart(2, '0'))}-${toNepaliNumeralsFunc(String(bsDay).padStart(2, '0'))}`;
}

export default function NivedanPatraPage() {
    const router = useRouter();
    const { toast } = useToast();
    const previewRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState(officeTypes[0].value);

    const form = useForm<NivedanFormData>({
        resolver: zodResolver(nivedanSchema),
        defaultValues: {
            officeType: officeTypes[0].value,
            date: '',
            attachedDocuments: [],
            passportNumber: '',
            permanentAddress: '',
            permanentWard: '',
            currentStreetAddress: '',
            currentCity: '',
            currentCountry: '',
            currentPostalCode: '',
            phoneCountryCode: '+977',
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "attachedDocuments"
    });

    const watchedValues = form.watch();
    
    const toNepaliNumerals = (num: number | string): string => {
        const str = String(num);
        if (!str) return '';
        const nepaliNumerals = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
        return str.replace(/[0-9]/g, d => nepaliNumerals[parseInt(d)]);
    };

    const emergencyContacts = [
        { name: 'प्रहरी', number: '100', icon: ShieldAlert, country: 'नेपाल' },
        { name: 'दमकल', number: '101', icon: Siren, country: 'नेपाल' },
        { name: 'एम्बुलेन्स', number: '102', icon: Ambulance, country: 'नेपाल' },
        { name: 'ट्राफिक प्रहरी', number: '103', icon: PersonStanding, country: 'नेपाल' },
        { name: 'सशस्त्र प्रहरी', number: '1114', icon: ShieldAlert, country: 'नेपाल' },
        { name: 'आपतकालीन सेवा', number: '112', icon: Phone, country: 'नेपाल' },
        { name: 'महिला हेल्पलाइन', number: '1145', icon: Phone, country: 'नेपाल' },
        { name: 'बाल हेल्पलाइन', number: '1098', icon: Phone, country: 'नेपाल' },
        { name: 'स्वास्थ्य सहायता', number: '1133', icon: HeartPulse, country: 'नेपाल' },
    ];

    useEffect(() => {
        if (!form.getValues('date')) {
            const today = new Date();
            const nptDate = new Date(today.getTime() + (5 * 60 + 45) * 60000);
            form.setValue('date', toNepaliDate(new Date(Date.UTC(nptDate.getUTCFullYear(), nptDate.getUTCMonth(), nptDate.getUTCDate()))));
        }
    }, [form]);

    useEffect(() => {
        const { officeType, applicationType } = watchedValues;

        if (applicationType && applicationType !== 'अन्य') {
             form.setValue('subject', `${applicationType} सम्बन्धी`);
        } else if (applicationType === 'अन्य') {
            form.setValue('subject', '');
        } else {
             let autoSubject = '';
             switch (officeType) {
                case 'woda': autoSubject = 'सिफारिस उपलब्ध गराईदिनु हुन सम्बन्धी'; break;
                case 'prahari': autoSubject = 'उजुरी तथा आवश्यक कारबाही सम्बन्धी'; break;
                default: autoSubject = 'सेवा उपलब्ध गराईदिनु हुन सम्बन्धी';
            }
            form.setValue('subject', autoSubject);
        }

    }, [watchedValues.officeType, watchedValues.applicationType, form]);
    
    const generateLetterHtml = (data: NivedanFormData): string => {
        const salutations: Record<string, string> = {
            woda: 'वडा अध्यक्षज्यू',
            nagarpalika: 'प्रमुख प्रशासकीय अधिकृतज्यू',
            prahasan: 'प्रमुख जिल्ला अधिकारीज्यू',
            prahari: 'कार्यालय प्रमुखज्यू',
            van: 'डिभिजन वन अधिकृतज्यू',
            bank: 'शाखा प्रबन्धकज्यू',
            sahakari: 'व्यवस्थापकज्यू',
            school: 'प्रधानाध्यापकज्यू',
            health: 'स्वास्थ्य चौकी प्रमुखज्यू',
            public_issue: 'सम्बन्धित अधिकारीज्यू',
            default: 'सम्बन्धित अधिकारीज्यू',
        };

        const salutation = salutations[data.officeType] || salutations.default;
        
        const permanentFullAddress = `${data.permanentAddress || '[स्थायी ठेगाना]'}, वडा नं. ${toNepaliNumerals(data.permanentWard || '[वडा]')}`;
        
        const introParagraph = `प्रस्तुत विषयमा, म निम्न विवरण भएको निवेदक`;

        const finalCurrentCountry = data.currentCountry === 'Other' ? data.manualCurrentCountry : data.currentCountry;
        const finalCurrentCity = data.currentCity === 'Other' ? data.manualCurrentCity : data.currentCity;
        const abroadAddress = [data.currentStreetAddress, finalCurrentCity, finalCurrentCountry, data.currentPostalCode].filter(Boolean).join(', ');
        
        let mainContent = `उपरोक्त सम्बन्धमा, ${data.problemObjective || '[समस्या/उद्देश्य]'}${data.detailedDescription ? ` विस्तृत विवरण: ${data.detailedDescription}`: ''}`;
    
        if (data.officeType === 'prahari' && (data.incidentDate || data.incidentPlace)) {
            mainContent = `मिति ${data.incidentDate ? toNepaliNumerals(data.incidentDate) : '[घटना मिति]'} मा ${data.incidentPlace || '[घटना स्थान]'} मा घटेको ${data.problemObjective || 'घटना'} को सम्बन्धमा निम्न उजुरी/विवरण पेश गरेको छु। ${data.detailedDescription ? `विस्तृत विवरण: ${data.detailedDescription}`: ''}`;
        } else if (data.officeType === 'van' && (data.requiredService || data.quantity || data.purposeOfUse)) {
            mainContent = `सामुदायिक वनबाट ${data.quantity ? toNepaliNumerals(data.quantity) : '[परिमाण]'} ${data.requiredService || '[स्रोत]'} मेरो ${data.purposeOfUse || '[उद्देश्य]'} प्रयोजनको लागि आवश्यक परेकोले, ${data.problemObjective || 'सो उपलब्ध गराईदिनु हुन'}। ${data.detailedDescription ? `थप विवरण: ${data.detailedDescription}` : ''}`;
        } else if (data.officeType === 'woda' && data.applicationType === 'बसोबास प्रमाण') {
             mainContent = `म स्थायी रूपमा यस वडामा बसोबास गर्दै आएको र ${data.problemObjective || 'विभिन्न कामको लागि'} बसोबास प्रमाणपत्र आवश्यक परेकोले सो को लागि सिफारिस गरिदिनु हुन अनुरोध गर्दछु।`;
        }

        const requestType = data.applicationType && data.applicationType !== 'अन्य' ? data.applicationType : 'आवश्यक कारबाही';
        const finalRequest = `अतः उपरोक्त सम्बन्धमा आवश्यक प्रक्रिया पुरा गरी, माग बमोजिमको ${requestType} उपलब्ध गराईदिनुहुन यो निवेदन पेश गरेको छु।`;
        
        const attachedDocsHtml = (data.attachedDocuments && data.attachedDocuments.length > 0)
        ? (`
            <div style="margin-top: 1.5rem;">
                <p style="font-weight: bold; text-decoration: underline;">संलग्न कागजातहरू:</p>
                <ul style="list-style-type: decimal; padding-left: 25px; margin-top: 0.5rem;">
                    ${data.attachedDocuments.map(doc => `<li>${doc.name}</li>`).join('')}
                </ul>
            </div>
        `)
        : '';
        
        const finalPhone = [data.phoneCountryCode, data.phoneNumber].filter(Boolean).join(' ');

        return (`<div style="font-family: 'Preeti', 'Kalimati', sans-serif; font-size: 14pt; line-height: 1.8;">
                <p style="text-align: right;">मिति: ${toNepaliNumerals(data.date || '')}</p>
                <br/>
                <p>श्री ${salutation},</p>
                <p>${data.officeName || '[कार्यालयको नाम]'}</p>
                <p>${data.officeAddress || '[कार्यालयको ठेगाना]'}</p>
                <br/>
                <p style="text-align: center; font-weight: bold;"><u>विषय: ${data.subject || '[विषय]'}</u></p>
                <br/>
                <p>महोदय,</p>
                <p style="text-indent: 2em;">${introParagraph} <strong>${data.applicantFullName}</strong> ले निम्न व्यहोराको निवेदन पेश गरेको छु।</p>
                <p style="text-indent: 2em;">${mainContent}</p>
                <p style="text-indent: 2em;">${finalRequest}</p>
                
                ${attachedDocsHtml}
                
                <div style="float: right; text-align: left; margin-top: 2.5rem; line-height: 1.7;">
                    <p>भवदीय,</p>
                    <p style="margin-top: 2rem;">.............................</p>
                    <p><strong>नाम:</strong> ${data.applicantFullName || ''}</p>
                    <p><strong>स्थायी ठेगाना:</strong> ${permanentFullAddress}</p>
                    <p><strong>ना.प्र.प.नं.:</strong> ${toNepaliNumerals(data.citizenshipNumber || '')} (${data.issuingDistrict || ''})</p>
                    <p><strong>सम्पर्क:</strong> ${toNepaliNumerals(finalPhone || '')}</p>
                </div>
                <div style="clear: both;"></div>
            </div>`);
    };

    const handleDownload = async () => {
        if (!previewRef.current) return;
        toast({ title: 'PDF बनाउँदै...' });
        const canvas = await html2canvas(previewRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const ratio = imgProps.height / imgProps.width;
        const imgHeight = pdfWidth * ratio;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
        pdf.save('Nivedan.pdf');
    };

    const handleNavigate = (path: string) => router.push(path.startsWith('/') ? path : `/#${path}`);

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar onNavigate={handleNavigate} />
            <main className="flex-1 container mx-auto py-8">
                <button onClick={() => router.push('/')} className="animated-border-card inline-block mb-6">
                    <span className={cn("inner-span flex items-center back-to-home-button")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        गृह पृष्ठमा फर्कनुहोस्
                    </span>
                </button>
                 <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter text-glow-primary font-headline">
                       स्मार्ट निवेदन पत्र
                    </h1>
                     <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                        विभिन्न सरकारी, अर्धसरकारी तथा संस्थागत निकायमा पेश गर्ने औपचारिक निवेदन तयार गर्नुहोस्।
                    </p>
                </div>
                <Card className="glass-card mb-8">
                    <CardHeader>
                        <CardTitle className="text-center text-lg">आपतकालीन हेल्पलाइन नम्बरहरू</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap items-center justify-center gap-2">
                        <TooltipProvider>
                            {emergencyContacts.map(contact => (
                                <Tooltip key={contact.number}>
                                    <TooltipTrigger asChild>
                                        <a href={`tel:${contact.number}`}>
                                            <Button variant="outline" size="icon" className="h-12 w-12 rounded-full">
                                                <contact.icon className="h-6 w-6" />
                                            </Button>
                                        </a>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{contact.name} ({contact.country}) - {toNepaliNumerals(contact.number)}</p>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </TooltipProvider>
                    </CardContent>
                </Card>
                 <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-8">
                    {officeTypes.map(office => (
                        <Card 
                            key={office.value} 
                            className={cn(
                                "text-center p-4 cursor-pointer transition-all duration-200 glass-card",
                                activeTab === office.value ? "ring-2 ring-primary scale-105" : "hover:bg-primary/10"
                            )}
                            onClick={() => { 
                                setActiveTab(office.value); 
                                form.setValue('officeType', office.value);
                                form.setValue('applicationType', '');
                                form.setValue('subject', '');
                            }}
                        >
                            <office.icon className="w-8 h-8 mx-auto text-primary"/>
                            <p className="mt-2 font-semibold text-sm">{office.label}</p>
                        </Card>
                    ))}
                </div>
                <div className="grid lg:grid-cols-5 gap-8 items-start">
                    <div className="lg:col-span-2">
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle>निवेदनको विवरण भर्नुहोस्</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form className="space-y-4">
                                        <Accordion type="multiple" defaultValue={['applicant', 'office', 'content']} className="w-full space-y-2">
                                            <AccordionItem value="applicant" className="border-b-0 rounded-lg overflow-hidden bg-muted/30">
                                                <AccordionTrigger className="p-4 hover:no-underline font-semibold text-primary text-base"><User className="mr-3 h-5 w-5" />निवेदकको विवरण</AccordionTrigger>
                                                <AccordionContent className="pt-0 p-4 space-y-4">
                                                    <FormField control={form.control} name="applicantFullName" render={({ field }) => (<FormItem><FormLabel>पूरा नाम</FormLabel><FormControl><Input placeholder="तपाईंको पूरा नाम" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                    <FormField control={form.control} name="fatherMotherName" render={({ field }) => (<FormItem><FormLabel>बाबु/आमाको नाम</FormLabel><FormControl><Input placeholder="बुबा वा आमाको नाम" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                    <FormField control={form.control} name="grandfatherName" render={({ field }) => (<FormItem><FormLabel>हजुरबुबाको नाम (वैकल्पिक)</FormLabel><FormControl><Input placeholder="हजुरबुबाको नाम" {...field} /></FormControl></FormItem>)} />
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <FormField control={form.control} name="passportNumber" render={({ field }) => (<FormItem><FormLabel>पासपोर्ट नम्बर (वैकल्पिक)</FormLabel><FormControl><Input placeholder="यदि छ भने" {...field} /></FormControl></FormItem>)} />
                                                        <FormField control={form.control} name="citizenshipNumber" render={({ field }) => (<FormItem><FormLabel>नागरिकता नम्बर</FormLabel><FormControl><Input placeholder="नागरिकता पत्र अनुसार" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                    </div>
                                                    <FormField control={form.control} name="issuingDistrict" render={({ field }) => (<FormItem><FormLabel>जारी जिल्ला</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="जिल्ला छान्नुहोस्" /></SelectTrigger></FormControl><SelectContent><ScrollArea className="h-72">{nepaliDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</ScrollArea></SelectContent></Select><FormMessage /></FormItem>)} />
                                                    <FormField control={form.control} name="profession" render={({ field }) => (<FormItem><FormLabel>पेशा (वैकल्पिक)</FormLabel><FormControl><Input placeholder="तपाईंको हालको पेशा" {...field} /></FormControl></FormItem>)} />
                                                </AccordionContent>
                                            </AccordionItem>
                                            <AccordionItem value="address-contact" className="border-b-0 rounded-lg overflow-hidden bg-muted/30">
                                                <AccordionTrigger className="p-4 hover:no-underline font-semibold text-primary text-base"><Map className="mr-3 h-5 w-5" />ठेगाना र सम्पर्क</AccordionTrigger>
                                                <AccordionContent className="pt-0 p-4 space-y-4">
                                                    <h4 className="font-semibold text-muted-foreground">स्थायी ठेगाना (नेपाल)</h4>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <FormField control={form.control} name="permanentAddress" render={({ field }) => (<FormItem><FormLabel>ठेगाना</FormLabel><FormControl><Input placeholder="उदा. भरतपुर-११, चितवन" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name="permanentWard" render={({ field }) => (<FormItem><FormLabel>वडा नम्बर</FormLabel><FormControl><Input type="number" placeholder="वडा नं." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                    </div>
                                                    <Separator />
                                                    <Accordion type="single" collapsible>
                                                        <AccordionItem value="foreign-address" className="border-none">
                                                            <AccordionTrigger className="p-0 text-sm font-semibold">हालको ठेगाना (विदेश भए)</AccordionTrigger>
                                                            <AccordionContent className="space-y-4 pt-4">
                                                                <FormField control={form.control} name="currentStreetAddress" render={({ field }) => (<FormItem><FormLabel>Street Address</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <FormField control={form.control} name="currentCity" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                                                    <FormField control={form.control} name="currentCountry" render={({ field }) => (
                                                                        <FormItem><FormLabel>Country</FormLabel>
                                                                            <Select onValueChange={(value) => { field.onChange(value); if (value !== 'Other') form.setValue('manualCurrentCountry', ''); }} value={field.value}>
                                                                                <FormControl><SelectTrigger><SelectValue placeholder="Country"/></SelectTrigger></FormControl>
                                                                                <SelectContent><ScrollArea className="h-72">{worldCountries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}<SelectItem value="Other">Other</SelectItem></ScrollArea></SelectContent>
                                                                            </Select>
                                                                        </FormItem>
                                                                    )} />
                                                                </div>
                                                                {form.watch('currentCountry') === 'Other' && <FormField control={form.control} name="manualCurrentCountry" render={({ field }) => (<FormItem><FormLabel>Specify Country</FormLabel><FormControl><Input {...field}/></FormControl></FormItem>)}/>}
                                                                <FormField control={form.control} name="currentPostalCode" render={({ field }) => (<FormItem><FormLabel>Postal Code</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    </Accordion>
                                                    <Separator />
                                                    <h4 className="font-semibold text-muted-foreground">सम्पर्क</h4>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                                                            <FormItem>
                                                            <FormLabel>फोन नम्बर</FormLabel>
                                                                <div className="flex items-center gap-2">
                                                                <Select onValueChange={(v) => form.setValue('phoneCountryCode', v)} value={form.getValues('phoneCountryCode')}>
                                                                    <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                                                                    <SelectContent>
                                                                        {Object.entries(countryToCode).map(([country, code]) => <SelectItem key={country} value={code}>{country} ({code})</SelectItem>)}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormControl><Input placeholder="सम्पर्क नम्बर" {...field} className="flex-1" /></FormControl>
                                                                </div>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )} />
                                                        <FormField control={form.control} name="emailAddress" render={({ field }) => (<FormItem><FormLabel>इमेल (वैकल्पिक)</FormLabel><FormControl><Input type="email" placeholder="इमेल ठेगाना" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                            <AccordionItem value="office" className="border-b-0 rounded-lg overflow-hidden bg-muted/30">
                                                <AccordionTrigger className="p-4 hover:no-underline font-semibold text-primary text-base"><Building className="mr-3 h-5 w-5" />कार्यालयको विवरण</AccordionTrigger>
                                                <AccordionContent className="pt-0 p-4 space-y-4">
                                                    <FormField control={form.control} name="officeName" render={({ field }) => (<FormItem><FormLabel>कार्यालयको नाम</FormLabel><FormControl><Input placeholder="पत्र पठाउने कार्यालय" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                    <FormField control={form.control} name="officeAddress" render={({ field }) => (<FormItem><FormLabel>कार्यालयको ठेगाना</FormLabel><FormControl><Input placeholder="कार्यालय रहेको स्थान" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                    <FormField control={form.control} name="date" render={({ field }) => (<FormItem><FormLabel>निवेदन मिति</FormLabel><FormControl><Input type="text" placeholder="YYYY-MM-DD" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                </AccordionContent>
                                            </AccordionItem>
                                            <AccordionItem value="content" className="border-b-0 rounded-lg overflow-hidden bg-muted/30">
                                                <AccordionTrigger className="p-4 hover:no-underline font-semibold text-primary text-base"><FileText className="mr-3 h-5 w-5" />निवेदनको व्यहोरा</AccordionTrigger>
                                                <AccordionContent className="pt-0 p-4 space-y-4">
                                                    <FormField control={form.control} name="applicationType" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>निवेदनको प्रकार</FormLabel>
                                                            <Select onValueChange={(value) => { field.onChange(value); if (value === 'अन्य') { form.setValue('subject', ''); } }} value={field.value}>
                                                                <FormControl><SelectTrigger><SelectValue placeholder="निवेदनको प्रकार छान्नुहोस्" /></SelectTrigger></FormControl>
                                                                <SelectContent>
                                                                    <ScrollArea className="h-72">
                                                                        {(applicationTypesByOffice[activeTab] || applicationTypesByOffice.other).map(type => (
                                                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                                                        ))}
                                                                    </ScrollArea>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={form.control} name="subject" render={({ field }) => (<FormItem><FormLabel>विषय</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>)} />
                                                    <FormField control={form.control} name="problemObjective" render={({ field }) => (<FormItem><FormLabel>समस्या / उद्देश्य</FormLabel><FormControl><Textarea placeholder="तपाईंको मुख्य समस्या वा निवेदनको उद्देश्य लेख्नुहोस्" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                    
                                                    {activeTab === 'prahari' && (<>
                                                        <FormField control={form.control} name="incidentDate" render={({ field }) => (<FormItem><FormLabel>घटना मिति</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>)} />
                                                        <FormField control={form.control} name="incidentPlace" render={({ field }) => (<FormItem><FormLabel>घटना स्थान</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                                                    </>)}
                                                    {activeTab === 'van' && (<>
                                                        <FormField control={form.control} name="requiredService" render={({ field }) => (<FormItem><FormLabel>चाहिएको स्रोत</FormLabel><FormControl><Input placeholder="उदा. काठ, दाउरा" {...field} /></FormControl></FormItem>)} />
                                                        <FormField control={form.control} name="quantity" render={({ field }) => (<FormItem><FormLabel>परिमाण</FormLabel><FormControl><Input placeholder="उदा. ५० के.जी." {...field} /></FormControl></FormItem>)} />
                                                        <FormField control={form.control} name="purposeOfUse" render={({ field }) => (<FormItem><FormLabel>प्रयोगको उद्देश्य</FormLabel><FormControl><Input placeholder="उदा. घर निर्माण" {...field} /></FormControl></FormItem>)} />
                                                    </>)}

                                                    <FormField control={form.control} name="detailedDescription" render={({ field }) => (<FormItem><FormLabel>विस्तृत विवरण (वैकल्पिक)</FormLabel><FormControl><Textarea rows={4} placeholder="आवश्यक परेमा थप विवरण दिनुहोस्" {...field} /></FormControl></FormItem>)} />
                                                    
                                                </AccordionContent>
                                            </AccordionItem>
                                            <AccordionItem value="documents" className="border-b-0 rounded-lg overflow-hidden bg-muted/30">
                                                <AccordionTrigger className="p-4 hover:no-underline font-semibold text-primary text-base"><ClipboardList className="mr-3 h-5 w-5" />संलग्न कागजातहरू</AccordionTrigger>
                                                <AccordionContent className="pt-0 p-4 space-y-2">
                                                    {fields.map((field, index) => (
                                                        <div key={field.id} className="flex items-center gap-2">
                                                            <FormField
                                                            control={form.control}
                                                            name={`attachedDocuments.${index}.name`}
                                                            render={({ field }) => (
                                                                <FormItem className="flex-grow">
                                                                    <FormControl><Input {...field} placeholder={`कागजात ${toNepaliNumerals(index + 1)}`} /></FormControl>
                                                                </FormItem>
                                                            )}
                                                            />
                                                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                                                        </div>
                                                    ))}
                                                    <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '' })}><PlusCircle className="mr-2 h-4 w-4" /> थप्नुहोस्</Button>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-3">
                        <Card className="lg:sticky lg:top-8">
                            <CardHeader>
                                <CardTitle>लाइभ पूर्वावलोकन</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div ref={previewRef} className="bg-white text-black p-8 rounded-md shadow-lg aspect-[210/297] w-full" style={{ border: '1px solid #eee' }}>
                                    <div dangerouslySetInnerHTML={{ __html: generateLetterHtml(watchedValues) }} />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleDownload} className="w-full gradient-button-gold">
                                    <Download className="mr-2" /> PDF डाउनलोड गर्नुहोस्
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </main>
            <LandingFooter onNavigate={handleNavigate} />
        </div>
    );
}
