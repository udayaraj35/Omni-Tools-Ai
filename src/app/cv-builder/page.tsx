'use client';

import { useState, Suspense, useEffect, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
    ArrowLeft, Loader2, PlusCircle, Trash2, Wand2, Upload, 
    Scissors, Download, Palette, Image as ImageIcon, 
    LayoutTemplate, User, Briefcase, GraduationCap, 
    Sparkles, ShieldCheck, Globe, Mail, Phone, 
    Linkedin, Facebook, MessageSquare, 
    QrCode, PenTool, Languages, Check, Settings2, Bot, FileText, ChevronDown, X,
    LayoutGrid, RefreshCw, FileUp
} from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Accordion, AccordionItem, AccordionContent, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { EuropassCVPreview } from '@/components/cv/europass/EuropassCVPreview';
import { NormalCVPreview } from '@/components/cv/normal/NormalCVPreview';
import { AtsCVPreview } from '@/components/cv/ats/AtsCVPreview';
import { createEuropassCV, removeImageBackground, smartFillProfileAction, extractInfoFromDocument } from '@/app/actions';
import { ProcessingOverlay } from '@/components/ui/processing-overlay';
import ReactCrop, { centerCrop, makeAspectCrop, type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { worldCountries, nationalities, countriesWithCities } from '@/lib/cities';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { trackToolUsage } from '@/lib/tools';

const commonLanguages = [
    "Nepali", "English", "Hindi", "Arabic", "Spanish", "French", "German", "Chinese", 
    "Japanese", "Korean", "Portuguese", "Russian", "Italian", "Urdu", "Bengali", 
    "Turkish", "Dutch", "Thai", "Vietnamese", "Maithili", "Bhojpuri", "Newari", "Tamang", "Magar", "Other"
].sort();

const ImageCropDialog = ({ src, onCrop, open, onOpenChange }: { src: string; onCrop: (croppedImageUrl: string) => void; open: boolean; onOpenChange: (open: boolean) => void; }) => {
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const imgRef = useRef<HTMLImageElement>(null);

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget;
        const newCrop = centerCrop(
            makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
            width, height
        );
        setCrop(newCrop);
    }
    
    async function handleCrop() {
        if (completedCrop && imgRef.current) {
            const canvas = document.createElement('canvas');
            const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
            const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
            canvas.width = completedCrop.width;
            canvas.height = completedCrop.height;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
                ctx.drawImage(
                    imgRef.current,
                    completedCrop.x * scaleX,
                    completedCrop.y * scaleY,
                    completedCrop.width * scaleX,
                    completedCrop.height * scaleY,
                    0, 0,
                    completedCrop.width,
                    completedCrop.height
                );
                onCrop(canvas.toDataURL('image/jpeg'));
                onOpenChange(false);
            }
        }
    }

    return (
        <div className={cn("fixed inset-0 bg-black/80 z-[100] flex items-center justify-center", !open && "hidden")}>
            <div className="bg-background p-6 rounded-[2.5rem] border border-border max-w-xl w-full mx-4 text-left shadow-2xl">
                <div className="mb-6 text-center">
                    <h3 className="text-xl font-black uppercase tracking-widest text-primary italic">Crop Profile Photo</h3>
                    <p className="text-xs text-muted-foreground font-bold uppercase mt-1">Adjust framing for biometric standard</p>
                </div>
                <div className="bg-muted/40 rounded-2xl overflow-hidden flex justify-center border border-border">
                    <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} aspect={1}>
                        <Image ref={imgRef} src={src} alt="Crop preview" onLoad={onImageLoad} width={400} height={400} style={{maxHeight: '50vh', objectFit: 'contain'}} unoptimized />
                    </ReactCrop>
                </div>
                <div className="flex justify-end gap-3 mt-8">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl uppercase font-black text-xs text-muted-foreground">Cancel</Button>
                    <Button onClick={handleCrop} className="gradient-button-gold rounded-xl px-8 font-black uppercase text-xs tracking-widest h-12 shadow-xl">
                        <Scissors className="w-4 h-4 mr-2"/> Apply Crop
                    </Button>
                </div>
            </div>
        </div>
    );
};

const commonJobTitles = [ "Accountant", "Actor", "Architect", "Baker", "Barista", "Bartender", "Beautician", "Bellboy", "Bus Driver", "Butcher", "Carpenter", "Cashier", "Chef", "Cleaner", "Construction Worker", "Cook", "Customer Service Representative", "Data Entry Clerk", "Delivery Driver", "Designer", "Dishwasher", "Doctor", "Electrician", "Engineer", "Farmer", "Fashion Designer", "Firefighter", "Fisherman", "Flight Attendant", "Florist", "Foreman", "Forklift Operator", "Factory Worker", "General Helper", "Graphic Designer", "Hairdresser", "Heavy Driver", "Heavy Equipment Operator", "Heavy Trailer Driver", "Hotel Manager", "Housekeeper", "Human Resources Manager", "IT Specialist", "Janitor", "Journalist", "Laborer", "Landscaper", "Laundry Worker", "Lawyer", "Librarian", "Lifeguard", "Light Vehicle Driver", "Line Cook", "Machine Operator", "Maid", "Maintenance Worker", "Manager", "Marketing Manager", "Mason", "Mechanic", "Motorcycle Driver", "Nanny", "Nurse", "Office Assistant", "Painter", "Packer", "Pharmacist", "Photographer", "Pilot", "Plumber", "Police Officer", "Porter", "Project Manager", "Real Estate Agent", "Receptionist", "Sales Associate", "Sales Manager", "Scientist", "Seaman", "Security Guard", "Server", "Software Developer", "Storekeeper", "Supervisor", "Tailor", "Taxi Driver", "Teacher", "Technician", "Telemarketer", "Tile Fitter", "Tour Guide", "Translator", "Travel Agent", "Truck Driver", "Waiter", "Waitress", "Warehouse Worker", "Welder", "Writer", "Other" ];

const declarationPresets = [
    "I hereby declare that the information provided in this curriculum vitae is true, complete, and correct to the best of my knowledge and belief. I understand that any misrepresentation of facts may lead to my disqualification or termination of employment.",
    "I, the undersigned, certify that all the information and details furnished in this document are true, complete and correct to the best of my knowledge and belief. I authorize the investigation of all statements contained in this application as may be necessary in arriving at an employment decision.",
    "I solemnly declare that the information furnished above is free from errors to the best of my knowledge and belief. I remain fully responsible for the authenticity of the documents and details presented herein.",
    "I hereby certify that all information provided in this CV is accurate and reflects my professional and educational background truthfully. I am aware that I shall be liable for any consequences arising from any incorrect information provided by me.",
    "I hereby declare that all the information provided above is true to the best of my knowledge. I also declare that I have never been convicted by any court of law or involved in any criminal activities.",
    "Other",
];

const fontOptions = [
    { name: 'Poppins Modern', value: "Poppins, sans-serif" },
    { name: 'Arial Standard', value: 'Arial, sans-serif' },
    { name: 'Classic Serif', value: "'Times New Roman', Times, serif" },
    { name: 'Great Vibes Luxury', value: "'Great Vibes', cursive" },
    { name: 'Handwritten', value: "'Dancing Script', cursive" },
    { name: 'Elegant Serif', value: "'Playfair Display', serif" },
];

const europassLayoutOptions = [
    { id: 'default', name: 'Standard Blue (Europass)' },
    { id: 'royal-framed', name: 'Royal Framed (Gold Borders)' },
    { id: 'classic', name: 'Classic Slate' },
    { id: 'corporate', name: 'Corporate Royal' },
    { id: 'modern', name: 'Modern Emerald' },
    { id: 'minimal', name: 'Minimalist Gray' },
    { id: 'executive', name: 'Executive Pro' },
    { id: 'technical', name: 'Technical Expert' },
    { id: 'sidebar-pro', name: 'Sidebar Focus' },
    { id: 'compact', name: 'Compact Efficient' },
    { id: 'academic', name: 'Academic Researcher' },
];

const normalLayoutOptions = [
    { id: 'standard', name: 'Standard Grid' },
    { id: 'creative', name: 'Creative Reverse' },
    { id: 'executive', name: 'Executive Pro' },
    { id: 'minimalist', name: 'Clean Minimalist' },
    { id: 'pro-sidebar', name: 'Professional Sidebar' },
    { id: 'gradient', name: 'Gradient Accent' },
    { id: 'two-column', name: 'Balanced Split' },
    { id: 'technical', name: 'Tech Optimized' },
    { id: 'formal', name: 'High Contrast Formal' },
    { id: 'compact', name: 'Compact Modern' },
];

const atsLayoutOptions = [
    { id: 'standard', name: 'Standard Clean (Classic)' },
    { id: 'executive', name: 'Executive Bold' },
    { id: 'modern', name: 'Modern Minimal' },
    { id: 'technical', name: 'Technical Pro' },
    { id: 'sleek', name: 'Sleek Line' },
    { id: 'emerald', name: 'Emerald Accent' },
    { id: 'compact', name: 'Compact Professional' },
    { id: 'summary', name: 'High-Point Summary' },
    { id: 'traditional', name: 'Classic Serif' },
    { id: 'header', name: 'Header Optimized' },
];

const experienceSchema = z.object({
    jobTitle: z.string().min(1, 'Job title is required'),
    company: z.string().min(1, 'Company is required'),
    city: z.string().default(''),
    country: z.string().default(''),
    startDate: z.string().min(1, 'Joining date is required'),
    endDate: z.string().default(''),
    isCurrent: z.boolean().default(false),
    duties: z.string().min(1, 'Responsibilities are required'),
});

const educationSchema = z.object({
    degree: z.string().min(1, 'Degree is required'),
    manualDegree: z.string().default(''),
    university: z.string().min(1, 'Institution is required'),
    city: z.string().default(''),
    country: z.string().default(''),
    startDate: z.string().default(''),
    passingYear: z.string().min(1, 'Passing Year is required'),
});

const trainingSchema = z.object({
    title: z.string().min(1, 'Training title is required'),
    institution: z.string().min(1, 'Institution is required'),
    startDate: z.string().default(''),
    endDate: z.string().default(''),
});

const languageSchema = z.object({
    language: z.string().min(1, 'Language is required'),
    manualLanguage: z.string().default(''),
    listening: z.string().default('B2'),
    reading: z.string().default('B2'),
    writing: z.string().default('B2'),
    spokenInteraction: z.string().default('B2'),
    spokenProduction: z.string().default('B2'),
});

const formSchema = z.object({
    firstName: z.string().min(1, "First name is required.").default(''),
    middleName: z.string().default(''),
    lastName: z.string().min(1, "Last name is required.").default(''),
    currentJob: z.string().default(''),
    manualCurrentJob: z.string().default(''),
    photo: z.any().default(null),
    photoShape: z.enum(['square', 'round', 'oval']).default('round'),
    photoPlacement: z.object({
        europass: z.boolean().default(true),
        normal: z.boolean().default(true),
        ats: z.boolean().default(false),
    }).default({ europass: true, normal: true, ats: false }),
    phone: z.string().default(''),
    email: z.string().email('Invalid email address.').default(''),
    linkedin: z.string().default(''),
    facebook: z.string().default(''),
    whatsapp: z.string().default(''),
    currentStreetAddress: z.string().default(''),
    currentCity: z.string().default(''),
    manualCurrentCity: z.string().default(''),
    currentCountry: z.string().default('Nepal'),
    manualCurrentCountry: z.string().default(''),
    currentPostalCode: z.string().default(''),
    permanentStreetAddress: z.string().default(''),
    permanentCity: z.string().default(''),
    manualPermanentCity: z.string().default(''),
    permanentCountry: z.string().default('Nepal'),
    manualPermanentCountry: z.string().default(''),
    permanentPostalCode: z.string().default(''),
    nationality: z.string().default('Nepalese'),
    manualNationality: z.string().default(''),
    dob: z.string().default(''),
    gender: z.string().default(''),
    placeOfBirth: z.string().default(''),
    passportNumber: z.string().default(''),
    professionalSummary: z.string().default(''),
    experience: z.array(experienceSchema).default([]),
    education: z.array(educationSchema).default([]),
    training: z.array(trainingSchema).default([]),
    skills: z.array(z.string()).default([]),
    motherLanguage: z.string().default(''),
    manualMotherLanguage: z.string().default(''),
    languages: z.array(languageSchema).default([]),
    availability: z.string().default(''),
    declaration: z.string().default(declarationPresets[0]),
    manualDeclaration: z.string().default(''),
    signature: z.any().default(null),
    showQrCode: z.boolean().default(false),
    templateColor: z.string().default('#003366'),
    fontFamily: z.string().default("Poppins, sans-serif"),
    europassLayout: z.string().default('default'),
    atsLayout: z.string().default('standard'),
    normalLayout: z.string().default('standard'),
    languageDisplayStyle: z.enum(['star', 'level']).default('level'),
    signaturePlacement: z.object({
        europass: z.boolean().default(true),
        normal: z.boolean().default(true),
        ats: z.boolean().default(false),
    }).default({ europass: true, normal: true, ats: false }),
});

export type CombinedCVFormData = z.infer<typeof formSchema>;

const defaultFormValues: CombinedCVFormData = {
    firstName: '',
    middleName: '',
    lastName: '',
    currentJob: '',
    manualCurrentJob: '',
    photo: null,
    photoShape: 'round',
    photoPlacement: { europass: true, normal: true, ats: false },
    phone: '',
    email: '',
    linkedin: '',
    facebook: '',
    whatsapp: '',
    currentStreetAddress: '',
    currentCity: '',
    manualCurrentCity: '',
    currentCountry: 'Nepal',
    manualCurrentCountry: '',
    currentPostalCode: '',
    permanentStreetAddress: '',
    permanentCity: '',
    manualPermanentCity: '',
    permanentCountry: 'Nepal',
    manualPermanentCountry: '',
    permanentPostalCode: '',
    nationality: 'Nepalese',
    manualNationality: '',
    dob: '',
    gender: '',
    placeOfBirth: '',
    passportNumber: '',
    professionalSummary: '',
    experience: [],
    education: [],
    training: [],
    skills: [],
    motherLanguage: '',
    manualMotherLanguage: '',
    languages: [],
    availability: '',
    declaration: declarationPresets[0],
    manualDeclaration: '',
    signature: null,
    showQrCode: false,
    templateColor: '#003366',
    fontFamily: "Poppins, sans-serif",
    europassLayout: 'default',
    atsLayout: 'standard',
    normalLayout: 'standard',
    languageDisplayStyle: 'level',
    signaturePlacement: { europass: true, normal: true, ats: false },
};

const CVCreatorContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    
    const initialTab = searchParams.get('type') || 'europass';
    const [activeTab, setActiveTab] = useState(initialTab);
    
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [processingMessage, setProcessingMessage] = useState("AI Processing...");
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
    const [imgSrc, setImgSrc] = useState('');
    const [showCropDialog, setShowCropDialog] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    
    const [isExtractionDialogOpen, setIsExtractionDialogOpen] = useState(false);
    const [pastedText, setPastedText] = useState("");

    const europassPdfRef = useRef<HTMLDivElement>(null);
    const normalPdfRef = useRef<HTMLDivElement>(null);
    const atsPdfRef = useRef<HTMLDivElement>(null);

    const form = useForm<CombinedCVFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultFormValues,
    });

    const currentCountry = form.watch('currentCountry');
    const permanentCountry = form.watch('permanentCountry');

    const currentCities = useMemo(() => {
        return countriesWithCities.find(c => c.country === currentCountry)?.cities || [];
    }, [currentCountry]);

    const permanentCities = useMemo(() => {
        return countriesWithCities.find(c => c.country === permanentCountry)?.cities || [];
    }, [permanentCountry]);

    const { user } = useUser();
    const firestore = useFirestore();
    const userDocRef = useMemoFirebase(() => (user ? doc(firestore, 'users', user.uid) : null), [user, firestore]);
    const { data: userProfile } = useDoc<any>(userDocRef);
    
    useEffect(() => {
        const type = searchParams.get('type');
        if (type && ['europass', 'normal', 'ats'].includes(type)) {
            setActiveTab(type);
        }
        trackToolUsage('/cv-builder');
    }, [searchParams]);

    useEffect(() => {
        if (userProfile) {
            const { name, ...rest } = userProfile;
            const nameParts = name?.split(' ') || [];
            const lastName = nameParts.length > 1 ? nameParts.pop() : '';
            const firstName = nameParts.join(' ');
            
            const sanitizedData = {
                ...defaultFormValues,
                ...rest,
                firstName: firstName || '',
                lastName: lastName || '',
                photoPlacement: rest.photoPlacement || { europass: true, normal: true, ats: false }
            };

            Object.keys(sanitizedData).forEach(key => {
                const k = key as keyof typeof sanitizedData;
                if (sanitizedData[k] === null || typeof sanitizedData[k] === 'undefined') {
                    if (Array.isArray(defaultFormValues[k])) {
                        (sanitizedData as any)[k] = [];
                    } else if (typeof defaultFormValues[k] === 'string') {
                        (sanitizedData as any)[k] = '';
                    } else {
                        (sanitizedData as any)[k] = defaultFormValues[k];
                    }
                }
            });

            form.reset(sanitizedData);
            if (rest.photoURL) setPhotoPreview(rest.photoURL);
        }
    }, [userProfile, form]);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const originalImage = reader.result as string;
                setProcessingMessage("Studio AI: Erasing Background...");
                setIsAiLoading(true);
                try {
                    const result = await removeImageBackground({ photoDataUri: originalImage });
                    if (result.photoDataUri && !result.photoDataUri.startsWith('Error:')) {
                        setImgSrc(result.photoDataUri);
                        setShowCropDialog(true);
                    } else {
                        setImgSrc(originalImage);
                        setShowCropDialog(true);
                    }
                } catch (error) {
                    setImgSrc(originalImage);
                    setShowCropDialog(true);
                } finally {
                    setIsAiLoading(false);
                }
            };
        }
    };
    
    const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result as string;
                setSignaturePreview(dataUrl);
                form.setValue('signature', dataUrl);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleGenerateSummary = async () => {
        setProcessingMessage("AI is crafting your profile summary...");
        setIsAiLoading(true);
        try {
            const v = form.getValues();
            const result = await createEuropassCV({
                fullName: `${v.firstName} ${v.lastName}`,
                targetJobTitle: v.currentJob || '',
                contactInfo: { phone: v.phone || '', email: v.email || '' },
                summaryOfSelf: 'AI_GENERATE',
                workHistory: (v.experience || []).map(w => ({ jobTitle: w.jobTitle, company: w.company, dates: `${w.startDate}-${w.endDate}`, duties: w.duties })),
                education: (v.education || []).map(e => ({ degree: e.degree, university: e.university, year: e.passingYear })),
                keySkills: v.skills || [],
            });
            if (result.cvContent) {
                form.setValue('professionalSummary', result.cvContent);
                toast({ title: "AI Generated Successfully!" });
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: "AI Error", description: error.message });
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleSmartFill = async () => {
        setProcessingMessage("Smart AI filling in the gaps...");
        setIsAiLoading(true);
        try {
            const values = form.getValues();
            const result = await smartFillProfileAction({
                firstName: values.firstName,
                lastName: values.lastName,
                nationality: values.nationality,
                currentJob: values.currentJob,
                experience: values.experience,
                skills: values.skills,
                languages: values.languages,
            });

            if ('error' in result) throw new Error(result.error);

            if (result.suggestedMotherLanguage) form.setValue('motherLanguage', result.suggestedMotherLanguage);
            if (result.suggestedLanguages && result.suggestedLanguages.length > 0) {
                form.setValue('languages', result.suggestedLanguages);
            }
            if (result.suggestedSkills && result.suggestedSkills.length > 0) {
                form.setValue('skills', Array.from(new Set([...(values.skills || []), ...result.suggestedSkills])));
            }
            if (result.suggestedSummary && !values.professionalSummary) {
                form.setValue('professionalSummary', result.suggestedSummary);
            }

            toast({ title: "Profile Auto-filled!", description: "AI suggested languages and skills based on your role." });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "AI Error", description: error.message });
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleExtraction = async () => {
        if (!pastedText.trim()) return;
        setProcessingMessage("Extracting structured data...");
        setIsAiLoading(true);
        try {
            const result = await extractInfoFromDocument({ documentText: pastedText });
            if ('error' in result) throw new Error(result.error);

            if (result.fullName) {
                const parts = result.fullName.split(' ');
                form.setValue('lastName', parts.pop() || '');
                form.setValue('firstName', parts.join(' '));
            }
            if (result.email) form.setValue('email', result.email);
            if (result.phone) form.setValue('phone', result.phone);
            if (result.professionalSummary) form.setValue('professionalSummary', result.professionalSummary);
            if (result.skills) form.setValue('skills', result.skills);
            if (result.motherLanguage) form.setValue('motherLanguage', result.motherLanguage);
            if (result.languages) form.setValue('languages', result.languages);
            
            toast({ title: "Data Extracted!", description: "Languages and skills have been populated." });
            setIsExtractionDialogOpen(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Extraction Failed", description: error.message });
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleDownload = async (type: 'europass' | 'normal' | 'ats') => {
        const content = type === 'europass' ? europassPdfRef : type === 'normal' ? normalPdfRef : atsPdfRef;
        if (!content.current) return;
        
        setIsAiLoading(true);
        setProcessingMessage("Studio Engine: Generating HD PDF...");
        
        try {
            // Lazy load heavy libraries
            const { default: jsPDF } = await import('jspdf');
            const { default: html2canvas } = await import('html2canvas');
            const { default: QRCode } = await import('qrcode');

            if (form.getValues('showQrCode')) {
                const url = await QRCode.toDataURL(window.location.href, { width: 150 });
                setQrCodeUrl(url);
            }

            const canvas = await html2canvas(content.current, { scale: 3, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
            pdf.save(`${form.getValues('firstName')}_CV_${type.toUpperCase()}.pdf`);
            toast({ title: "HD PDF Exported!" });
        } catch (e) {
            toast({ variant: 'destructive', title: "Export Error" });
        } finally {
            setIsAiLoading(false);
        }
    };

    const changeFormat = (type: string) => {
        router.push(`/cv-builder?type=${type}`);
        setActiveTab(type);
    };

    const allFormValues = form.watch();
    const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control: form.control, name: "experience" });
    const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control: form.control, name: "education" });
    const { fields: trainFields, append: appendTrain, remove: removeTrain } = useFieldArray({ control: form.control, name: "training" });
    const { fields: langFields, append: appendLang, remove: removeLang } = useFieldArray({ control: form.control, name: "languages" });

    const proficiencyLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

    return (
        <Form {...form}>
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Navbar onNavigate={p => router.push(p)} />
            <main className="flex-grow w-full py-8 px-4 md:px-12 xl:px-20 text-left">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
                    <button onClick={() => router.push('/')} className="animated-border-card inline-block">
                        <span className={cn("inner-span flex items-center back-to-home-button")}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</span>
                    </button>
                    
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => setIsExtractionDialogOpen(true)} className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 border-primary/30 text-primary hover:bg-primary/10">
                            <FileUp className="w-3.5 h-3.5" /> Auto-fill from Doc
                        </Button>
                        <div className="flex items-center gap-3 bg-card p-1.5 rounded-2xl border border-border shadow-2xl backdrop-blur-3xl">
                            <p className="text-[10px] font-black uppercase text-muted-foreground ml-4 mr-2 hidden md:block">Switch Format:</p>
                            <Button 
                                variant={activeTab === 'europass' ? 'default' : 'ghost'} 
                                onClick={() => changeFormat('europass')}
                                className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2"
                            >
                                <Globe className="w-3.5 h-3.5" /> Europass
                            </Button>
                            <Button 
                                variant={activeTab === 'normal' ? 'default' : 'ghost'} 
                                onClick={() => changeFormat('normal')}
                                className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2"
                            >
                                <LayoutTemplate className="w-3.5 h-3.5" /> Modern
                            </Button>
                            <Button 
                                variant={activeTab === 'ats' ? 'default' : 'ghost'} 
                                onClick={() => changeFormat('ats')}
                                className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2"
                            >
                                <ShieldCheck className="w-3.5 h-3.5" /> ATS Sharp
                            </Button>
                        </div>
                    </div>
                </div>
                
                <section className="text-center mb-12 space-y-3">
                    <div className="flex justify-center">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 uppercase font-black px-4 py-1.5 text-[9px] tracking-[0.3em] rounded-full">Active Tool: {activeTab.toUpperCase()}</Badge>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-glow-primary tracking-tighter uppercase italic leading-none">CV Builder Studio</h1>
                    <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-4xl mx-auto leading-relaxed">
                        Data is synchronized across all formats. Switch templates anytime.
                    </p>
                </section>
                
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
                    <div className="xl:col-span-4 space-y-6">
                        <Card className="glass-card border-border rounded-[2.5rem] overflow-hidden p-1 shadow-2xl">
                            <div className="p-6 bg-muted/30 border-b border-border flex items-center justify-between">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-3">
                                    <Sparkles className="w-4 h-4 animate-pulse" /> Data Architecture
                                </CardTitle>
                            </div>
                            <CardContent className="p-6">
                                <Tabs defaultValue="personal" className="w-full">
                                    <TabsList className="grid w-full grid-cols-6 bg-muted h-14 p-1 rounded-xl mb-6">
                                        <TabsTrigger value="personal" title="Personal"><User className="w-4 h-4"/></TabsTrigger>
                                        <TabsTrigger value="experience" title="Work"><Briefcase className="w-4 h-4"/></TabsTrigger>
                                        <TabsTrigger value="education" title="Academic"><GraduationCap className="w-4 h-4"/></TabsTrigger>
                                        <TabsTrigger value="skills" title="Skills"><Languages className="w-4 h-4"/></TabsTrigger>
                                        <TabsTrigger value="design" title="Styles"><Palette className="w-4 h-4"/></TabsTrigger>
                                        <TabsTrigger value="finalize" title="Export"><Check className="w-4 h-4"/></TabsTrigger>
                                    </TabsList>

                                    <ScrollArea className="h-[65vh] pr-4">
                                        <TabsContent value="personal" className="space-y-6 mt-0">
                                            <Accordion type="multiple" defaultValue={['basic', 'contact', 'address']} className="w-full space-y-4">
                                                <AccordionItem value="basic" className="border-0">
                                                    <AccordionTrigger className="text-xs font-black uppercase text-muted-foreground py-0">Basic Identity</AccordionTrigger>
                                                    <AccordionContent className="pt-4 space-y-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase">First Name</FormLabel><Input {...field} className="h-12 rounded-xl text-xs"/></FormItem>)} />
                                                            <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase">Last Name</FormLabel><Input {...field} className="h-12 rounded-xl text-xs"/></FormItem>)} />
                                                        </div>
                                                        <FormField control={form.control} name="currentJob" render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-[10px] font-bold uppercase">Target Role</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <FormControl><SelectTrigger className="h-12 rounded-xl text-xs"><SelectValue placeholder="Select Role"/></SelectTrigger></FormControl>
                                                                    <SelectContent className="bg-popover text-popover-foreground border-border">
                                                                        <ScrollArea className="h-64">
                                                                            {commonJobTitles.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                                                        </ScrollArea>
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormItem>
                                                        )} />
                                                        {form.watch('currentJob') === 'Other' && <FormField control={form.control} name="manualCurrentJob" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold">Specify Role</FormLabel><Input {...field} className="h-12 rounded-xl text-xs"/></FormItem>)} />}
                                                    </AccordionContent>
                                                </AccordionItem>
                                                <AccordionItem value="contact" className="border-0">
                                                    <AccordionTrigger className="text-xs font-black uppercase text-muted-foreground py-0">Contact & Social</AccordionTrigger>
                                                    <AccordionContent className="pt-4 space-y-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase">Phone</FormLabel><Input {...field} className="h-12 rounded-xl text-xs"/></FormItem>)} />
                                                            <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase">Email</FormLabel><Input {...field} className="h-12 rounded-xl text-xs"/></FormItem>)} />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <FormField control={form.control} name="linkedin" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase">LinkedIn</FormLabel><Input {...field} className="h-12 rounded-xl text-xs" placeholder="https://..."/></FormItem>)} />
                                                            <FormField control={form.control} name="whatsapp" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase">WhatsApp</FormLabel><Input {...field} className="h-12 rounded-xl text-xs" /></FormItem>)} />
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                                <AccordionItem value="address" className="border-0">
                                                    <AccordionTrigger className="text-xs font-black uppercase text-muted-foreground py-0">Current Address</AccordionTrigger>
                                                    <AccordionContent className="pt-4 space-y-4">
                                                        <FormField control={form.control} name="currentStreetAddress" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase">Street Address</FormLabel><Input {...field} className="h-12 rounded-xl text-xs"/></FormItem>)} />
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <FormField control={form.control} name="currentCountry" render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-[10px] font-bold uppercase">Country</FormLabel>
                                                                    <Select onValueChange={(v) => { field.onChange(v); form.setValue('currentCity', ''); }} value={field.value}>
                                                                        <FormControl><SelectTrigger className="h-12 rounded-xl text-xs"><SelectValue/></SelectTrigger></FormControl>
                                                                        <SelectContent className="bg-popover text-popover-foreground border-border">
                                                                            <ScrollArea className="h-64">{worldCountries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}<SelectItem value="Other">Other</SelectItem></ScrollArea>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </FormItem>
                                                            )} />
                                                            <FormField control={form.control} name="currentCity" render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-[10px] font-bold uppercase">City/District</FormLabel>
                                                                    <Select onValueChange={field.onChange} value={field.value} disabled={currentCities.length === 0}>
                                                                        <FormControl><SelectTrigger className="h-12 rounded-xl text-xs"><SelectValue placeholder="Select"/></SelectTrigger></FormControl>
                                                                        <SelectContent className="bg-popover text-popover-foreground border-border">
                                                                            <ScrollArea className="h-64">
                                                                                {currentCities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                                                                                <SelectItem value="Other">Other</SelectItem>
                                                                            </ScrollArea>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </FormItem>
                                                            )} />
                                                        </div>
                                                        {form.watch('currentCity') === 'Other' && <FormField control={form.control} name="manualCurrentCity" render={({ field }) => (<FormItem><FormLabel className="text-[9px]">Specify City</FormLabel><Input {...field} className="h-10 rounded-xl text-xs"/></FormItem>)} />}
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </Accordion>
                                        </TabsContent>

                                        <TabsContent value="experience" className="space-y-6 mt-0">
                                            <div className="p-6 bg-primary/5 border border-primary/10 rounded-3xl space-y-4 shadow-inner">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2"><Bot className="w-4 h-4"/> AI Logic Synthesis</h4>
                                                <FormField control={form.control} name="professionalSummary" render={({ field }) => (<FormItem><FormControl><Textarea {...field} rows={5} className="rounded-2xl resize-none text-xs leading-relaxed" placeholder="Drafting your career mission..." /></FormControl></FormItem>)} />
                                                <Button type="button" onClick={handleGenerateSummary} disabled={isAiLoading} className="w-full h-12 gradient-button-gold rounded-xl font-black uppercase tracking-[0.1em] text-[10px] shadow-lg">
                                                    {isAiLoading ? <Loader2 className="animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />} Auto-Optimize Profile
                                                </Button>
                                            </div>
                                            <Separator className="bg-border" />
                                            {expFields.map((field, index) => (
                                                <div key={field.id} className="p-5 bg-muted/30 border border-border rounded-3xl space-y-4 relative group">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <FormField control={form.control} name={`experience.${index}.jobTitle`} render={({ field }) => (<Input {...field} placeholder="Target Role" className="h-11 rounded-xl text-xs" />)} />
                                                        <FormField control={form.control} name={`experience.${index}.company`} render={({ field }) => (<Input {...field} placeholder="Institution" className="h-11 rounded-xl text-xs" />)} />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <FormField control={form.control} name={`experience.${index}.startDate`} render={({ field }) => (<Input {...field} placeholder="Joining Epoch" className="h-11 rounded-xl text-[10px]" />)} />
                                                        <FormField control={form.control} name={`experience.${index}.endDate`} render={({ field }) => (<Input {...field} disabled={form.watch(`experience.${index}.isCurrent`)} placeholder="Resignation" className="h-11 rounded-xl text-[10px]" />)} />
                                                    </div>
                                                    <FormField control={form.control} name={`experience.${index}.duties`} render={({ field }) => (<Textarea {...field} rows={4} placeholder="Major Accomplishments & Duties..." className="text-xs rounded-2xl" />)} />
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeExp(index)} className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-destructive/20 text-destructive opacity-0 group-hover:opacity-100 transition-all border border-destructive/10"><Trash2 className="w-4 h-4"/></Button>
                                                </div>
                                            ))}
                                            <Button type="button" variant="outline" onClick={() => appendExp({ jobTitle: '', company: '', startDate: '', duties: '' })} className="w-full h-12 border-dashed rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-accent text-muted-foreground">+ Add Performance Record</Button>
                                        </TabsContent>

                                        <TabsContent value="education" className="space-y-6 mt-0">
                                            <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Academic Credentials</h4>
                                            {eduFields.map((field, index) => (
                                                <div key={field.id} className="p-5 bg-muted/30 border border-border rounded-3xl space-y-4 relative group">
                                                    <FormField control={form.control} name={`education.${index}.degree`} render={({ field }) => (
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl><SelectTrigger className="h-11 rounded-xl text-xs"><SelectValue placeholder="Degree Level"/></SelectTrigger></FormControl>
                                                            <SelectContent className="bg-popover text-popover-foreground border-border">
                                                                <SelectItem value="SEE / High School">SEE / High School</SelectItem>
                                                                <SelectItem value="+2 / HSEB">+2 / HSEB</SelectItem>
                                                                <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                                                                <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                                                                <SelectItem value="PhD / Professional">Doctorate / Professional</SelectItem>
                                                                <SelectItem value="Other">Other</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )} />
                                                    {form.watch(`education.${index}.degree`) === 'Other' && <FormField control={form.control} name={`education.${index}.manualDegree`} render={({ field }) => (<Input {...field} placeholder="Custom Degree Name" className="h-11 rounded-xl text-xs" />)} />}
                                                    <FormField control={form.control} name={`education.${index}.university`} render={({ field }) => (<Input {...field} placeholder="Alma Mater / School" className="h-11 rounded-xl text-xs" />)} />
                                                    <FormField control={form.control} name={`education.${index}.passingYear`} render={({ field }) => (<Input {...field} placeholder="Graduation Year" className="h-11 rounded-xl text-xs" />)} />
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeEdu(index)} className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-destructive/20 text-destructive opacity-0 group-hover:opacity-100 transition-all border border-destructive/10"><Trash2 className="w-4 h-4"/></Button>
                                                </div>
                                            ))}
                                            <Button type="button" variant="outline" onClick={() => appendEdu({ degree: '', university: '', passingYear: '' })} className="w-full h-12 border-dashed rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-accent text-muted-foreground">+ Add Academic Node</Button>
                                            <Separator className="bg-border" />
                                            <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Global Certifications</h4>
                                            {trainFields.map((field, index) => (
                                                <div key={field.id} className="p-5 bg-muted/30 border border-border rounded-3xl space-y-4 relative group">
                                                    <FormField control={form.control} name={`training.${index}.title`} render={({ field }) => (<Input {...field} placeholder="Credential Title" className="h-11 rounded-xl text-xs" />)} />
                                                    <FormField control={form.control} name={`training.${index}.institution`} render={({ field }) => (<Input {...field} placeholder="Issuing Authority" className="h-11 rounded-xl text-xs" />)} />
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeTrain(index)} className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-destructive/20 text-destructive opacity-0 group-hover:opacity-100 transition-all border border-destructive/10"><Trash2 className="w-4 h-4"/></Button>
                                                </div>
                                            ))}
                                            <Button type="button" variant="outline" onClick={() => appendTrain({ title: '', institution: '' })} className="w-full h-12 border-dashed rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-accent text-muted-foreground">+ Add Certification</Button>
                                        </TabsContent>

                                        <TabsContent value="skills" className="space-y-8 mt-0">
                                            <div className="p-6 bg-primary/5 border border-primary/10 rounded-3xl space-y-4 shadow-inner mb-6">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2"><Sparkles className="w-4 h-4"/> Smart Profile Completion</h4>
                                                <p className="text-[9px] text-muted-foreground font-bold uppercase">Let AI suggest your language levels and professional skills based on your profile.</p>
                                                <Button type="button" onClick={handleSmartFill} disabled={isAiLoading} className="w-full h-12 gradient-button-gold rounded-xl font-black uppercase tracking-[0.1em] text-[10px] shadow-lg">
                                                    {isAiLoading ? <Loader2 className="animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />} Smart Fill Languages & Skills
                                                </Button>
                                            </div>

                                            <div className="space-y-6">
                                                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Linguistic Proficiencies</Label>
                                                <FormField control={form.control} name="motherLanguage" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-bold">Native Tongue</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl><SelectTrigger className="h-12 rounded-xl text-xs"><SelectValue placeholder="Select Mother Tongue"/></SelectTrigger></FormControl>
                                                            <SelectContent className="bg-popover border-border">
                                                                <ScrollArea className="h-64">
                                                                    {commonLanguages.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                                                </ScrollArea>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )} />
                                                {form.watch('motherLanguage') === 'Other' && (
                                                    <FormField control={form.control} name="manualMotherLanguage" render={({ field }) => (<FormItem><FormLabel className="text-[9px]">Specify Language</FormLabel><FormControl><Input {...field} className="h-10 rounded-xl text-xs" /></FormControl></FormItem>)} />
                                                )}
                                                
                                                {langFields.map((field, index) => (
                                                    <div key={field.id} className="p-5 bg-muted/30 border border-border rounded-3xl space-y-4 relative group">
                                                        <FormField control={form.control} name={`languages.${index}.language`} render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-[10px] font-bold">Additional Language</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <FormControl><SelectTrigger className="h-11 rounded-xl text-xs"><SelectValue placeholder="Select Language"/></SelectTrigger></FormControl>
                                                                    <SelectContent className="bg-popover border-border">
                                                                        <ScrollArea className="h-64">
                                                                            {commonLanguages.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                                                        </ScrollArea>
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormItem>
                                                        )} />
                                                        {form.watch(`languages.${index}.language`) === 'Other' && (
                                                            <FormField control={form.control} name={`languages.${index}.manualLanguage`} render={({ field }) => (<FormItem><FormLabel className="text-[9px]">Specify Language</FormLabel><FormControl><Input {...field} className="h-10 rounded-xl text-xs" /></FormControl></FormItem>)} />
                                                        )}
                                                        
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <FormField control={form.control} name={`languages.${index}.listening`} render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-[8px] uppercase text-muted-foreground">Listening</FormLabel>
                                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                                        <FormControl><SelectTrigger className="h-10 rounded-xl text-[10px]"><SelectValue /></SelectTrigger></FormControl>
                                                                        <SelectContent className="bg-popover border-border">{proficiencyLevels.map(lv => <SelectItem key={lv} value={lv}>{lv}</SelectItem>)}</SelectContent>
                                                                    </Select>
                                                                </FormItem>
                                                            )} />
                                                            <FormField control={form.control} name={`languages.${index}.reading`} render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-[8px] uppercase text-muted-foreground">Reading</FormLabel>
                                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                                        <FormControl><SelectTrigger className="h-10 rounded-xl text-[10px]"><SelectValue /></SelectTrigger></FormControl>
                                                                        <SelectContent className="bg-popover border-border">{proficiencyLevels.map(lv => <SelectItem key={lv} value={lv}>{lv}</SelectItem>)}</SelectContent>
                                                                    </Select>
                                                                </FormItem>
                                                            )} />
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3">
                                                            <FormField control={form.control} name={`languages.${index}.spokenInteraction`} render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-[8px] uppercase text-muted-foreground">Spoken Interaction</FormLabel>
                                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                                        <FormControl><SelectTrigger className="h-10 rounded-xl text-[10px]"><SelectValue /></SelectTrigger></FormControl>
                                                                        <SelectContent className="bg-popover border-border">{proficiencyLevels.map(lv => <SelectItem key={lv} value={lv}>{lv}</SelectItem>)}</SelectContent>
                                                                    </Select>
                                                                </FormItem>
                                                            )} />
                                                            <FormField control={form.control} name={`languages.${index}.spokenProduction`} render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-[8px] uppercase text-muted-foreground">Spoken Production</FormLabel>
                                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                                        <FormControl><SelectTrigger className="h-10 rounded-xl text-[10px]"><SelectValue /></SelectTrigger></FormControl>
                                                                        <SelectContent className="bg-popover border-border">{proficiencyLevels.map(lv => <SelectItem key={lv} value={lv}>{lv}</SelectItem>)}</SelectContent>
                                                                    </Select>
                                                                </FormItem>
                                                            )} />
                                                        </div>

                                                        <FormField control={form.control} name={`languages.${index}.writing`} render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-[8px] uppercase text-muted-foreground">Writing</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <FormControl><SelectTrigger className="h-10 rounded-xl text-[10px]"><SelectValue /></SelectTrigger></FormControl>
                                                                    <SelectContent className="bg-popover border-border">{proficiencyLevels.map(lv => <SelectItem key={lv} value={lv}>{lv}</SelectItem>)}</SelectContent>
                                                                </Select>
                                                            </FormItem>
                                                        )} />

                                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeLang(index)} className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-destructive/20 text-destructive opacity-0 group-hover:opacity-100 transition-all border border-destructive/10"><Trash2 className="w-4 h-4"/></Button>
                                                    </div>
                                                ))}
                                                <Button type="button" variant="outline" onClick={() => appendLang({ language: '', listening: 'B2', reading: 'B2', spokenInteraction: 'B2', spokenProduction: 'B2', writing: 'B2' })} className="w-full h-12 border-dashed rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-accent text-muted-foreground">+ Add Secondary Language</Button>
                                            </div>
                                            <Separator className="bg-border" />
                                            <div className="space-y-4">
                                                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Technical Stack & Expert Skills</Label>
                                                <Textarea 
                                                    value={form.watch('skills')?.join(', ')} 
                                                    onChange={e => form.setValue('skills', e.target.value.split(',').map(s => s.trim()))}
                                                    placeholder="Skill 1, Skill 2, Technical Expertise, Soft Skills..." 
                                                    className="rounded-2xl text-xs leading-relaxed p-5 min-h-[150px]"
                                                />
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="design" className="space-y-8 mt-0 text-left">
                                            <div className="p-6 bg-muted/30 border border-border rounded-[2.5rem] space-y-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-20 h-20 rounded-[1.5rem] bg-muted border border-border overflow-hidden flex items-center justify-center shadow-2xl">
                                                        {photoPreview ? <Image src={photoPreview} alt="Preview" width={80} height={80} className="object-cover w-full h-full" unoptimized /> : <ImageIcon className="text-muted-foreground w-8 h-8" />}
                                                    </div>
                                                    <div className="flex-1 space-y-3">
                                                        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Biometric Portrait</Label>
                                                        <Button asChild variant="outline" className="w-full h-10 border-primary/30 text-primary hover:bg-primary/10 rounded-xl font-black text-[10px] uppercase tracking-widest">
                                                            <label className="cursor-pointer">
                                                                <Upload className="w-4 h-4 mr-2" /> Load Master Photo
                                                                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                                                            </label>
                                                        </Button>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-3">
                                                        <Label className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">Accent Palette</Label>
                                                        <Input type="color" {...form.register('templateColor')} className="h-12 p-1 rounded-2xl cursor-pointer" />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <Label className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">Primary Font</Label>
                                                        <Select value={form.watch('fontFamily')} onValueChange={v => form.setValue('fontFamily', v)}>
                                                            <SelectTrigger className="h-12 rounded-2xl text-xs font-bold"><SelectValue /></SelectTrigger>
                                                            <SelectContent className="bg-popover border-border">
                                                                {fontOptions.map(f => <SelectItem key={f.value} value={f.value} style={{fontFamily: f.value}}>{f.name}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                
                                                <Separator className="bg-border" />
                                                
                                                <div className="space-y-4">
                                                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Focal Layout & Styling</Label>
                                                    
                                                    <div className="space-y-4">
                                                        {activeTab === 'europass' && (
                                                            <div className="space-y-3">
                                                                <Label className="text-[8px] uppercase text-zinc-600 font-bold">Standardized Europass Styles</Label>
                                                                <Select value={form.watch('europassLayout')} onValueChange={v => form.setValue('europassLayout', v)}>
                                                                    <SelectTrigger className="h-12 rounded-2xl text-xs font-black"><SelectValue /></SelectTrigger>
                                                                    <SelectContent className="bg-popover border-border">
                                                                        <ScrollArea className="h-64">
                                                                            {europassLayoutOptions.map(opt => <SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>)}
                                                                        </ScrollArea>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        )}

                                                        {activeTab === 'normal' && (
                                                            <div className="space-y-3">
                                                                <Label className="text-[8px] uppercase text-zinc-600 font-bold">Modern Visual Styles</Label>
                                                                <Select value={form.watch('normalLayout')} onValueChange={v => form.setValue('normalLayout', v)}>
                                                                    <SelectTrigger className="h-12 rounded-2xl text-xs font-black"><SelectValue /></SelectTrigger>
                                                                    <SelectContent className="bg-popover border-border">
                                                                        <ScrollArea className="h-64">
                                                                            {normalLayoutOptions.map(opt => <SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>)}
                                                                        </ScrollArea>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        )}

                                                        {activeTab === 'ats' && (
                                                            <div className="space-y-3">
                                                                <Label className="text-[8px] uppercase text-zinc-600 font-bold">ATS High-Precision Styles</Label>
                                                                <Select value={form.watch('atsLayout')} onValueChange={v => form.setValue('atsLayout', v)}>
                                                                    <SelectTrigger className="h-12 rounded-2xl text-xs font-black"><SelectValue /></SelectTrigger>
                                                                    <SelectContent className="bg-popover border-border">
                                                                        <ScrollArea className="h-64">
                                                                            {atsLayoutOptions.map(opt => <SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>)}
                                                                        </ScrollArea>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="finalize" className="space-y-8 mt-0 text-left">
                                            <div className="space-y-6">
                                                <h4 className="text-xs font-black uppercase text-muted-foreground tracking-widest">Digital Authentication</h4>
                                                <div className="p-6 bg-muted/30 border border-border rounded-[2.5rem] space-y-6 shadow-inner">
                                                    <FormField control={form.control} name="showQrCode" render={({ field }) => (
                                                        <div className="flex items-center justify-between">
                                                            <Label className="text-xs font-black uppercase flex items-center gap-3"><QrCode className="w-5 h-5 text-primary"/> Embed Profile QR</Label>
                                                            <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-primary" />
                                                        </div>
                                                    )} />
                                                    <Separator className="bg-border" />
                                                    <div className="space-y-3">
                                                        <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Authorized Signature</Label>
                                                        <div className="flex items-center gap-4">
                                                            {signaturePreview && <div className="bg-white p-2 rounded-xl shadow-lg"><Image src={signaturePreview} alt="Sig" width={80} height={40} className="object-contain" unoptimized /></div>}
                                                            <Button asChild variant="outline" className="flex-1 h-12 border-border bg-background rounded-xl text-[10px] uppercase font-black tracking-widest hover:bg-accent">
                                                                <label className="cursor-pointer">
                                                                    <PenTool className="w-4 h-4 mr-2" /> Load Signature
                                                                    <input type="file" accept="image/*" className="hidden" onChange={handleSignatureUpload} />
                                                                </label>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Legal Declaration Statement</Label>
                                                    <FormField control={form.control} name="declaration" render={({ field }) => (
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl><SelectTrigger className="h-14 rounded-2xl text-xs font-bold leading-tight"><SelectValue /></SelectTrigger></FormControl>
                                                            <SelectContent className="bg-popover border-border w-[350px]">
                                                                <ScrollArea className="h-80">
                                                                    {declarationPresets.map((d, i) => <SelectItem key={i} value={d} className="py-3 text-[10px] border-b border-border last:border-0">{d.substring(0, 100)}...</SelectItem>)}
                                                                </ScrollArea>
                                                            </SelectContent>
                                                        </Select>
                                                    )} />
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </ScrollArea>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="xl:col-span-8 flex flex-col items-center">
                        <div className="w-full bg-muted/30 p-1.5 rounded-[3.5rem] border border-border shadow-2xl backdrop-blur-xl relative group">
                            <div className="absolute -top-4 -right-4 z-50">
                                <Badge className="bg-primary text-primary-foreground font-black uppercase px-6 py-2 rounded-full tracking-[0.2em] shadow-2xl animate-bounce-slow">Studio Engine v4.5</Badge>
                            </div>
                            
                            <ScrollArea className="h-[80vh] w-full p-6 md:p-12">
                                <div className="max-w-[800px] mx-auto shadow-[0_80px_150px_rgba(0,0,0,0.1)] dark:shadow-[0_80px_150px_rgba(0,0,0,1)] ring-1 ring-border rounded-sm">
                                    {activeTab === 'europass' && (
                                        <EuropassCVPreview 
                                            allFormValues={allFormValues} photoPreview={photoPreview} signatureImage={signaturePreview} qrCodeUrl={qrCodeUrl} ref={europassPdfRef}
                                            templateColor={form.watch('templateColor')} fontFamily={form.watch('fontFamily')} europassLayout={form.watch('europassLayout')}
                                        />
                                    )}
                                    {activeTab === 'normal' && (
                                        <NormalCVPreview 
                                            allFormValues={allFormValues} photoPreview={photoPreview} signatureImage={signaturePreview} qrCodeUrl={qrCodeUrl} ref={normalPdfRef}
                                            templateColor={form.watch('templateColor')} fontFamily={form.watch('fontFamily')}
                                            languageDisplayStyle={form.watch('languageDisplayStyle')}
                                            normalLayout={form.watch('normalLayout')}
                                        />
                                    )}
                                    {activeTab === 'ats' && (
                                        <AtsCVPreview 
                                            allFormValues={allFormValues} photoPreview={photoPreview} signatureImage={signaturePreview} qrCodeUrl={qrCodeUrl} ref={atsPdfRef} 
                                            fontFamily={form.watch('fontFamily')} atsLayout={form.watch('atsLayout')}
                                        />
                                    )}
                                </div>
                            </ScrollArea>
                        </div>

                        <div className="w-full mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                            <Button onClick={() => handleDownload(activeTab as any)} size="lg" className="h-20 text-xl font-black uppercase tracking-[0.2em] gradient-button-gold rounded-[1.5rem] shadow-2xl group transition-all hover:scale-[1.02]">
                                <Download className="mr-4 h-8 w-8 group-hover:translate-y-1 transition-transform" /> EXPORT {activeTab.toUpperCase()} PDF
                            </Button>
                            <Button variant="outline" className="h-20 text-base font-black uppercase tracking-[0.3em] border-border bg-card hover:bg-accent rounded-[1.5rem] gap-4 shadow-xl">
                                <ShieldCheck className="w-7 h-7 text-primary" /> VALIDATED FORMAT
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
            <LandingFooter onNavigate={p => router.push(p)} />
            
            <Dialog open={isExtractionDialogOpen} onOpenChange={setIsExtractionDialogOpen}>
                <DialogContent className="border-border bg-background text-foreground rounded-[2.5rem] p-8 max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-primary flex items-center gap-3">
                            <Sparkles className="w-6 h-6" /> Structured Extraction
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-xs font-bold uppercase mt-2">
                            Paste your old CV text to automatically fill languages, skills, and summary.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-6 space-y-4">
                        <Textarea 
                            value={pastedText}
                            onChange={(e) => setPastedText(e.target.value)}
                            placeholder="Paste your CV text here..."
                            className="bg-muted/40 border-border min-h-[250px] rounded-2xl p-6 text-sm"
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsExtractionDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleExtraction} disabled={isAiLoading || !pastedText.trim()} className="gradient-button-gold rounded-xl px-10 h-14 font-black uppercase tracking-widest shadow-xl">
                            {isAiLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />} Perform Smart Extraction
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {isAiLoading && <ProcessingOverlay message={processingMessage} />}
            {showCropDialog && imgSrc && <ImageCropDialog src={imgSrc} onCrop={(c) => { setPhotoPreview(c); form.setValue('photo', c); }} open={showCropDialog} onOpenChange={setShowCropDialog} />}
        </div>
        </Form>
    );
};

export default function CVBuilderPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
            <CVCreatorContent />
        </Suspense>
    );
}
