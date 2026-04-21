
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { 
    Loader2, ArrowLeft, Download, Plus, Trash2, 
    Palette, Sparkles, Lock, Unlock, 
    Upload, Phone, ArrowUpToLine, ArrowDownToLine, 
    ZoomIn, ZoomOut, CheckSquare, X, Layout, 
    FileText, Calendar as CalendarIcon, MapPin, Heart, BookOpen, Clock,
    Wand2, Settings2, MonitorPlay,
    Type as TypeIcon, FileUp, Users, Send, Bot, MessageSquare,
    ImageIcon, Contact, User, BookCheck, Rows, Columns, PanelsTopLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import Papa from 'papaparse';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionItem, AccordionContent, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { studioThemes, studioSymbols, relationshipTitles, shlokas, ceremonyMessages, commonGotras, premiumNepaliMessages } from '@/lib/invitation-studio-data';
import { getStudioSuggestionsAction, editInvitationWithAiAction } from '@/app/actions';
import { ProcessingOverlay } from '@/components/ui/processing-overlay';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import Image from 'next/image';

// --- Data Schemas ---

const familyMemberSchema = z.object({
    name: z.string().default(''),
    relation: z.string().default(''),
});

const subEventSchema = z.object({
    name: z.string().default(''),
    date: z.string().default(''),
    time: z.string().default(''),
    venue: z.string().default(''),
    mapLink: z.string().optional().default(''),
});

const canvasElementSchema = z.object({
    id: z.string(),
    type: z.enum(['text', 'symbol', 'photo', 'qrcode', 'decoration']),
    content: z.string(),
    position: z.object({ x: z.number(), y: z.number() }),
    size: z.number(),
    rotation: z.number(),
    opacity: z.number(),
    color: z.string().optional(),
    font: z.string().optional(),
    isGold: z.boolean().optional().default(false),
    isLocked: z.boolean().default(false),
    zIndex: z.number(),
});

const formSchema = z.object({
    eventType: z.string().default('wedding'),
    cardFormat: z.enum(['single', '2-fold', '3-fold']).default('3-fold'),
    invitationSide: z.enum(['groom', 'bride']).default('groom'),
    language: z.enum(['ne', 'en', 'bilingual']).default('ne'),
    recipientName: z.string().default(''),
    recipientAddress: z.string().default(''),
    recipientPhone: z.string().default(''),
    recipientPhoto: z.string().default(''),
    headerPhoto: z.string().default(''),
    groomName: z.string().default(''),
    groomGotra: z.string().default(''),
    brideName: z.string().default(''),
    brideGotra: z.string().default(''),
    boyName: z.string().default(''),
    boyGotra: z.string().default(''),
    babyName: z.string().default(''),
    celebrantName: z.string().default(''),
    groomParents: z.array(familyMemberSchema).optional(),
    brideParents: z.array(familyMemberSchema).optional(),
    parents: z.array(familyMemberSchema).optional(),
    extendedFamily: z.array(familyMemberSchema).optional(),
    ceremonies: z.array(subEventSchema).optional(),
    invitationMessage: z.string().default(''),
    mantra: z.string().default(''),
    rsvp: z.string().default(''),
});

type InvitationData = z.infer<typeof formSchema>;
type CanvasElement = z.infer<typeof canvasElementSchema>;

interface BulkRecipient {
    name: string;
    address: string;
}

const fontOptions = [
    { name: 'Royal Cinzel', value: "'Cinzel', serif" },
    { name: 'Classic Poppins', value: "Poppins, sans-serif" },
    { name: 'Pinyon Luxury', value: "'Pinyon Script', cursive" },
    { name: 'Great Vibes', value: "'Great Vibes', cursive" },
    { name: 'Dancing Script', value: "'Dancing Script', cursive" },
    { name: 'Alex Brush', value: "'Alex Brush', cursive" },
    { name: 'Playfair Serif', value: "'Playfair Display', serif" },
    { name: 'Nepali Devanagari', value: "'Noto Sans Devanagari', sans-serif" },
];

const goldTextGradient = 'linear-gradient(to bottom, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C)';

// --- Draggable Component ---

const DraggableElement = ({ element, onUpdate, isSelected, onSelect, scale, zoom, format }: { 
    element: CanvasElement, 
    onUpdate: (id: string, updates: Partial<CanvasElement>) => void,
    isSelected: boolean,
    onSelect: () => void,
    scale: number,
    zoom: number,
    format: string
}) => {
    const dragRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    let panelWidthFactor = 100;
    if (format === '2-fold') panelWidthFactor = 50;
    if (format === '3-fold') panelWidthFactor = 33.333;

    const relativeX = element.position.x % panelWidthFactor;
    const xInFoldPercent = (relativeX / panelWidthFactor) * 100;

    const handleMouseDown = (e: React.MouseEvent) => {
        if (element.isLocked) return;
        e.preventDefault();
        e.stopPropagation();
        onSelect();
        setIsDragging(true);

        const startX = e.clientX;
        const startY = e.clientY;
        const initialPos = { ...element.position };

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const dx = (moveEvent.clientX - startX) / (scale * zoom);
            const dy = (moveEvent.clientY - startY) / (scale * zoom);
            const newGlobalX = Math.max(0, Math.min(initialPos.x + (dx / 900) * 100, 100));
            const newGlobalY = Math.max(0, Math.min(initialPos.y + (dy / 550) * 100, 100));
            onUpdate(element.id, { position: { x: newGlobalX, y: newGlobalY } });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <motion.div
            ref={dragRef}
            onMouseDown={handleMouseDown}
            className={cn(
                "absolute cursor-move select-none group",
                isSelected && "ring-2 ring-primary ring-offset-2 rounded-sm",
                element.isLocked && "cursor-not-allowed opacity-80"
            )}
            style={{
                left: `${xInFoldPercent}%`,
                top: `${element.position.y}%`,
                transform: `translate(-50%, -50%) rotate(${element.rotation}deg)`,
                zIndex: element.zIndex,
                opacity: element.opacity,
            }}
        >
            {element.type === 'text' ? (
                <p style={{ 
                    fontSize: `${element.size}px`, 
                    color: element.isGold ? 'transparent' : element.color, 
                    backgroundImage: element.isGold ? goldTextGradient : 'none',
                    WebkitBackgroundClip: element.isGold ? 'text' : 'unset',
                    fontFamily: element.font,
                    whiteSpace: 'pre-wrap',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    lineHeight: 1.2
                }}>
                    {element.content}
                </p>
            ) : (
                <div style={{ width: `${element.size}px`, height: 'auto' }}>
                    <img src={element.content} alt="Element" className="w-full h-auto pointer-events-none" />
                </div>
            )}
        </motion.div>
    );
};

// --- Main Page Component ---

export default function InvitationStudioPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();
    const [isLoading, setIsLoading] = useState(false);
    const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([]);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [currentTheme, setCurrentTheme] = useState<any>(studioThemes.nepaliTraditional[0] || {});
    const [zoom, setZoom] = useState(0.7);
    const [cardsPerPage, setCardsPerPage] = useState<number>(1);
    const [isFolded, setIsFolded] = useState(false);
    
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    
    const [bulkRecipients, setBulkRecipients] = useState<BulkRecipient[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    
    const canvasRef = useRef<HTMLDivElement>(null);
    const manualSymbolInputRef = useRef<HTMLInputElement>(null);
    const bulkFileInputRef = useRef<HTMLInputElement>(null);

    const userDocRef = useMemoFirebase(() => (user ? doc(firestore, 'users', user.uid) : null), [user, firestore]);
    const { data: userProfile } = useDoc<any>(userDocRef);

    const form = useForm<InvitationData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            eventType: 'wedding',
            cardFormat: '3-fold',
            invitationSide: 'groom',
            language: 'ne',
            recipientName: '',
            recipientAddress: '',
            recipientPhone: '',
            recipientPhoto: '',
            headerPhoto: '',
            groomName: '',
            groomGotra: '',
            brideName: '',
            brideGotra: '',
            boyName: '',
            boyGotra: '',
            babyName: '',
            celebrantName: '',
            groomParents: [
                { name: '', relation: 'आदरणीय बुवा' },
                { name: '', relation: 'आदरणीय आमा' }
            ],
            brideParents: [
                { name: '', relation: 'आदरणीय बुवा' },
                { name: '', relation: 'आदरणीय आमा' }
            ],
            parents: [
                { name: '', relation: 'आदरणीय बुवा' },
                { name: '', relation: 'आदरणीय आमा' }
            ],
            extendedFamily: [],
            ceremonies: [
                { name: 'शुभ-विवाह', date: '२०८१ साल मंसीर २१', time: 'बिहान ८:०० बजे', venue: 'हाम्रो निवास', mapLink: '' }
            ],
            mantra: shlokas.wedding,
            invitationMessage: ceremonyMessages.wedding,
            rsvp: ''
        }
    });

    const { fields: groomParentFields, append: appendGroomParent, remove: removeGroomParent } = useFieldArray({ control: form.control, name: "groomParents" });
    const { fields: brideParentFields, append: appendBrideParent, remove: removeBrideParent } = useFieldArray({ control: form.control, name: "brideParents" });
    const { fields: parentFields, append: appendParent, remove: removeParent } = useFieldArray({ control: form.control, name: "parents" });
    const { fields: extendedFields, append: appendExtended, remove: removeExtended } = useFieldArray({ control: form.control, name: "extendedFamily" });
    const { fields: ceremonyFields, append: appendCeremony, remove: removeCeremony } = useFieldArray({ control: form.control, name: "ceremonies" });

    const eventType = form.watch('eventType');
    const cardFormat = form.watch('cardFormat');

    // Handle initial event switch defaults
    useEffect(() => {
        if (eventType === 'wedding') {
            form.setValue('mantra', shlokas.wedding);
            form.setValue('invitationMessage', ceremonyMessages.wedding);
            form.setValue('ceremonies.0.name', 'शुभ-विवाह');
        } else if (eventType === 'bratabandha') {
            form.setValue('mantra', shlokas.bratabandha);
            form.setValue('invitationMessage', ceremonyMessages.bratabandha);
            form.setValue('ceremonies.0.name', 'चूडाकर्म (व्रतबन्ध)');
        } else if (eventType === 'nuworan' || eventType === 'pasni') {
            form.setValue('mantra', shlokas.nuworan);
            form.setValue('invitationMessage', ceremonyMessages.nuworan);
            form.setValue('ceremonies.0.name', eventType === 'nuworan' ? 'न्वारन' : 'पास्नी (अन्नप्राशन)');
        }
    }, [eventType, form]);

    useEffect(() => {
        if (userProfile) {
            const currentValues = form.getValues();
            if (eventType === 'wedding') {
                if (!currentValues.groomName) form.setValue('groomName', userProfile.name?.toUpperCase() || '');
            } else if (eventType === 'bratabandha') {
                if (!currentValues.boyName) form.setValue('boyName', userProfile.name?.toUpperCase() || '');
            } else {
                if (!currentValues.celebrantName) form.setValue('celebrantName', userProfile.name?.toUpperCase() || '');
            }
            if (!currentValues.rsvp && userProfile.phone) {
                form.setValue('rsvp', `${userProfile.name}: ${userProfile.phone}`);
            }
        }
    }, [userProfile, form, eventType]);

    const addElement = (type: CanvasElement['type'], content: string) => {
        const maxZ = canvasElements.length > 0 ? Math.max(...canvasElements.map(e => e.zIndex)) : 0;
        const newEl: CanvasElement = {
            id: `el-${Date.now()}`,
            type,
            content,
            position: { x: 50, y: 50 },
            size: type === 'text' ? 32 : type === 'decoration' ? 150 : 100,
            rotation: 0,
            opacity: 1,
            color: currentTheme.textColor || '#FFFFFF',
            font: 'Poppins',
            isGold: false,
            zIndex: Math.max(maxZ + 1, 100), 
            isLocked: false,
        };
        setCanvasElements([...canvasElements, newEl]);
        setSelectedElementId(newEl.id);
    };

    const updateElement = (id: string, updates: Partial<CanvasElement>) => {
        setCanvasElements(els => els.map(el => el.id === id ? { ...el, ...updates } : el));
    };

    const deleteElement = (id: string) => {
        setCanvasElements(els => els.filter(el => el.id !== id));
        if (selectedElementId === id) setSelectedElementId(null);
    };

    const handleManualSymbolUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            addElement('symbol', ev.target?.result as string);
            toast({ title: "Asset added!" });
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const applyAiMagic = async () => {
        setIsLoading(true);
        try {
            const values = form.getValues();
            const combinedParents = eventType === 'wedding' 
                ? [...(values.groomParents || []), ...(values.brideParents || [])]
                : (values.parents || []);

            const result = await getStudioSuggestionsAction({
                eventType: values.eventType,
                language: values.language,
                groomName: values.groomName,
                brideName: values.brideName,
                boyName: values.boyName,
                babyName: values.babyName,
                parents: combinedParents.map(p => ({ name: p.name, relation: p.relation })),
                extendedFamily: values.extendedFamily?.map(f => ({ name: f.name, relation: f.relation })),
                currentMessage: values.invitationMessage
            });

            if ('error' in result) throw new Error(result.error);

            form.setValue('invitationMessage', result.refinedMessage);
            form.setValue('mantra', result.shloka);
            const allThemes = [...studioThemes.nepaliTraditional, ...studioThemes.indianRegal, ...studioThemes.ceremonySpecific];
            const matchedTheme = allThemes.find(t => t.id === result.suggestedTheme);
            if (matchedTheme) setCurrentTheme(matchedTheme as any);

            const matchedFont = fontOptions.find(f => f.name.includes(result.suggestedFont) || f.value.includes(result.suggestedFont));
            if (matchedFont) {
                setCanvasElements(els => els.map(el => el.type === 'text' ? { ...el, font: matchedFont.value } : el));
            }

            if (result.recommendedSymbol) {
                const symbol = studioSymbols.find(s => s.id === result.recommendedSymbol);
                if (symbol) addElement('decoration', symbol.src);
            }

            toast({ title: "AI Magic Applied!" });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "AI Error", description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChatSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!chatInput.trim()) return;

        const userMessage = chatInput;
        setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
        setChatInput('');
        setIsLoading(true);

        try {
            const result = await editInvitationWithAiAction({
                instruction: userMessage,
                currentState: {
                    formValues: form.getValues(),
                    canvasElements: canvasElements,
                    currentThemeId: currentTheme.id
                }
            });

            if ('error' in result) throw new Error(result.error);

            if (result.updatedFormValues) {
                Object.entries(result.updatedFormValues).forEach(([key, value]) => {
                    form.setValue(key as any, value);
                });
            }
            if (result.updatedCanvasElements) {
                setCanvasElements(result.updatedCanvasElements);
            }
            if (result.suggestedThemeId) {
                const allThemes = [...studioThemes.nepaliTraditional, ...studioThemes.indianRegal, ...studioThemes.ceremonySpecific];
                const matchedTheme = allThemes.find(t => t.id === result.suggestedThemeId);
                if (matchedTheme) setCurrentTheme(matchedTheme as any);
            }

            setChatHistory(prev => [...prev, { role: 'assistant', content: result.aiResponse }]);
            toast({ title: "AI updated design!" });

        } catch (error: any) {
            toast({ variant: 'destructive', title: "Chat Failed", description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const downloadInvite = async (formatType: 'pdf' | 'jpg') => {
        if (!canvasRef.current) return;
        setIsLoading(true);
        const wasFolded = isFolded;
        setIsFolded(false);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            const canvas = await html2canvas(canvasRef.current, { scale: 4, useCORS: true, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            if (formatType === 'jpg') {
                const link = document.createElement('a');
                link.download = `Studio-Invite-${Date.now()}.jpg`;
                link.href = imgData;
                link.click();
            } else {
                const pdf = new jsPDF('l', 'mm', 'a4');
                pdf.addImage(imgData, 'JPEG', 10, 10, 277, 190);
                pdf.save(`Studio-Invite-${Date.now()}.pdf`);
            }
            toast({ title: "Export Successful!" });
        } catch (error) {
            toast({ variant: 'destructive', title: "Export Failed" });
        } finally {
            setIsLoading(false);
            if (wasFolded) setIsFolded(true);
        }
    };

    const selectedElement = canvasElements.find(el => el.id === selectedElementId);

    const foldBgStyle = (position: string) => {
        let size = '900px 550px';
        if (cardFormat === 'single') size = '450px 600px';
        if (cardFormat === '2-fold') size = '600px 550px';

        return {
            backgroundImage: currentTheme.bg,
            backgroundSize: size,
            backgroundPosition: position,
            backgroundColor: '#FFFFFF',
            border: currentTheme.border,
            boxShadow: currentTheme.shadow,
            borderImage: currentTheme.borderImage
        };
    };

    const getEventLabel = (type: string) => {
        switch(type) {
            case 'wedding': return 'SHUBHA VIVAHA';
            case 'bratabandha': return 'CHUDĀKARMA';
            case 'nuworan': return 'NAMAKARAN';
            case 'pasni': return 'ANNAPRASHAN';
            case 'birthday': return 'HAPPY BIRTHDAY';
            default: return type.toUpperCase();
        }
    };

    const RenderCeremonies = () => {
        const ceremonies = form.watch('ceremonies');
        if (!ceremonies || ceremonies.length === 0) return null;
        return (
            <div className="w-full space-y-3 mt-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: currentTheme.accent }}>उत्सव कार्यतालिका</h4>
                <div className="grid gap-2">
                    {ceremonies.map((ev, i) => (
                        <div key={i} className="bg-black/5 p-3 rounded-xl border border-black/10 space-y-1 shadow-sm text-left">
                            <p className="text-[11px] font-black uppercase tracking-tight" style={{ color: currentTheme.accent }}>{ev.name}</p>
                            <div className="flex justify-between items-center text-[9px] font-bold">
                                <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3"/> {ev.date}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {ev.time}</span>
                            </div>
                            <p className="text-[8px] opacity-60 flex items-center gap-1 truncate font-medium"><MapPin className="w-3 h-3"/> {ev.venue}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#05050a] text-white">
            <Navbar onNavigate={path => router.push(path)} />
            <main className="flex-1 container mx-auto p-4 md:p-6 pb-20">
                
                {/* CENTERED HEADER */}
                <div className="flex flex-col items-center text-center mb-12 gap-6">
                    <button onClick={() => router.push('/')} className="flex items-center text-zinc-500 hover:text-primary transition-all gap-2 text-xs font-black uppercase tracking-[0.2em] group">
                        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Back to Tools
                    </button>
                    
                    <div className="flex flex-col items-center gap-4">
                        <h1 className="text-5xl md:text-8xl font-black text-glow-primary tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-400 to-zinc-600 leading-none pb-2">
                            Invitation Studio Pro
                        </h1>
                        <div className="flex items-center justify-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                            <p className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-[0.5em]">
                                Royal Designs • AI Chat Assistant • Gold Letters ✨
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-12 items-start">
                    
                    {/* LEFT PANEL: MODULAR MANUAL TABS */}
                    <div className="lg:col-span-4">
                        <Card className="glass-card border-white/5 bg-zinc-900/40 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden p-1">
                            <Form {...form}>
                                <Tabs defaultValue="setup" className="w-full">
                                    <div className="p-6 bg-zinc-950/50 border-b border-white/5">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                                            <Settings2 className="w-4 h-4" /> Studio Controls
                                        </h3>
                                        <TabsList className="grid w-full grid-cols-6 bg-zinc-900 h-14 p-1 rounded-xl">
                                            <TabsTrigger value="setup" title="Setup" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-black"><Layout className="w-4 h-4"/></TabsTrigger>
                                            <TabsTrigger value="recipient" title="Recipient" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-black"><Contact className="w-4 h-4"/></TabsTrigger>
                                            <TabsTrigger value="subject" title="Subject" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-black">
                                                <User className={cn("w-4 h-4", eventType === 'wedding' ? 'text-blue-400' : 'text-primary')}/>
                                            </TabsTrigger>
                                            {eventType === 'wedding' && (
                                                <TabsTrigger value="bride" title="Bride" className="rounded-lg data-[state=active]:bg-pink-500 data-[state=active]:text-white"><User className="w-4 h-4 text-pink-400"/></TabsTrigger>
                                            )}
                                            <TabsTrigger value="family" title="Family" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-black"><Users className="w-4 h-4"/></TabsTrigger>
                                            <TabsTrigger value="event" title="Event" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-black"><Clock className="w-4 h-4"/></TabsTrigger>
                                        </TabsList>
                                    </div>

                                    <div className="p-8">
                                        <ScrollArea className="h-[55vh] pr-4">
                                            <TabsContent value="setup" className="space-y-6 mt-0">
                                                <div className="space-y-4">
                                                    <h4 className="text-xs font-black uppercase text-primary">१. प्रोजेक्ट सेटअप (Project Setup)</h4>
                                                    <FormField control={form.control} name="eventType" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] font-bold text-zinc-500 uppercase">उत्सव रोज्नुहोस् (Event Type)</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl><SelectTrigger className="bg-zinc-950 border-white/10 h-12 rounded-xl"><SelectValue /></SelectTrigger></FormControl>
                                                                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                                                    <SelectItem value="wedding">💍 शुभ विवाह (Wedding)</SelectItem>
                                                                    <SelectItem value="bratabandha">🕉️ व्रतबन्ध (Bratabandha)</SelectItem>
                                                                    <SelectItem value="nuworan">👶 न्वारन (Naming)</SelectItem>
                                                                    <SelectItem value="pasni">🥣 पास्नी (Rice Feeding)</SelectItem>
                                                                    <SelectItem value="birthday">🎂 जन्मदिन (Birthday)</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </FormItem>
                                                    )} />

                                                    <FormField control={form.control} name="cardFormat" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] font-bold text-zinc-500 uppercase">कार्डको ढाँचा (Card Format)</FormLabel>
                                                            <FormControl>
                                                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 gap-2">
                                                                    <FormItem className="flex items-center space-x-3 space-y-0 bg-zinc-950/50 p-4 rounded-xl border border-white/5 cursor-pointer hover:bg-white/5 transition-colors">
                                                                        <FormControl><RadioGroupItem value="single" /></FormControl>
                                                                        <div className="flex items-center gap-3">
                                                                            <Rows className="w-4 h-4 text-primary" />
                                                                            <FormLabel className="font-bold text-xs cursor-pointer">Normal Card (Single Page)</FormLabel>
                                                                        </div>
                                                                    </FormItem>
                                                                    <FormItem className="flex items-center space-x-3 space-y-0 bg-zinc-950/50 p-4 rounded-xl border border-white/5 cursor-pointer hover:bg-white/5 transition-colors">
                                                                        <FormControl><RadioGroupItem value="2-fold" /></FormControl>
                                                                        <div className="flex items-center gap-3">
                                                                            <Columns className="w-4 h-4 text-primary" />
                                                                            <FormLabel className="font-bold text-xs cursor-pointer">2-Fold Card</FormLabel>
                                                                        </div>
                                                                    </FormItem>
                                                                    <FormItem className="flex items-center space-x-3 space-y-0 bg-zinc-950/50 p-4 rounded-xl border border-white/5 cursor-pointer hover:bg-white/5 transition-colors">
                                                                        <FormControl><RadioGroupItem value="3-fold" /></FormControl>
                                                                        <div className="flex items-center gap-3">
                                                                            <PanelsTopLeft className="w-4 h-4 text-primary" />
                                                                            <FormLabel className="font-bold text-xs cursor-pointer">3-Fold Royal</FormLabel>
                                                                        </div>
                                                                    </FormItem>
                                                                </RadioGroup>
                                                            </FormControl>
                                                        </FormItem>
                                                    )} />
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="recipient" className="space-y-6 mt-0">
                                                <div className="space-y-4">
                                                    <FormField control={form.control} name="recipientName" render={({ field }) => (
                                                        <FormItem><FormLabel className="text-[10px] font-bold uppercase text-zinc-500">Name (नाम)</FormLabel><FormControl><Input {...field} placeholder="Guest Full Name" className="bg-zinc-950 border-white/10 h-12 rounded-xl" /></FormControl></FormItem>
                                                    )} />
                                                    <FormField control={form.control} name="recipientAddress" render={({ field }) => (
                                                        <FormItem><FormLabel className="text-[10px] font-bold uppercase text-zinc-500">Location (ठेगाना)</FormLabel><FormControl><Input {...field} placeholder="City, Area" className="bg-zinc-950 border-white/10 h-12 rounded-xl" /></FormControl></FormItem>
                                                    )} />
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="subject" className="space-y-6 mt-0">
                                                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl space-y-4">
                                                    <h4 className="text-xs font-black uppercase text-primary">
                                                        {eventType === 'wedding' ? 'बेहुलाको विवरण (Groom)' : eventType === 'bratabandha' ? 'बटुकको विवरण (Son)' : 'विवरण (Celebrant)'}
                                                    </h4>
                                                    <FormField 
                                                        control={form.control} 
                                                        name={eventType === 'wedding' ? 'groomName' : eventType === 'bratabandha' ? 'boyName' : eventType === 'nuworan' || eventType === 'pasni' ? 'babyName' : 'celebrantName'} 
                                                        render={({ field }) => (
                                                            <FormItem><FormLabel className="text-[10px] font-bold text-zinc-500 uppercase">Name</FormLabel><FormControl><Input {...field} className="bg-zinc-950 border-white/10 h-12 rounded-xl" /></FormControl></FormItem>
                                                        )} 
                                                    />
                                                    {(eventType === 'wedding' || eventType === 'bratabandha') && (
                                                        <FormField 
                                                            control={form.control} 
                                                            name={eventType === 'wedding' ? 'groomGotra' : 'boyGotra'} 
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-[10px] font-bold text-zinc-500 uppercase">Gotra (Optional)</FormLabel>
                                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                                        <FormControl><SelectTrigger className="bg-zinc-950 border-white/10 h-12 rounded-xl"><SelectValue placeholder="Select Gotra"/></SelectTrigger></FormControl>
                                                                        <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                                                            <ScrollArea className="h-64">{commonGotras.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</ScrollArea>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </FormItem>
                                                            )} 
                                                        />
                                                    )}
                                                </div>
                                            </TabsContent>

                                            {eventType === 'wedding' && (
                                                <TabsContent value="bride" className="space-y-6 mt-0">
                                                    <div className="p-4 bg-pink-500/5 border border-pink-500/10 rounded-2xl space-y-4">
                                                        <h4 className="text-xs font-black uppercase text-pink-400">बेहुलीको विवरण (Bride)</h4>
                                                        <FormField control={form.control} name="brideName" render={({ field }) => (
                                                            <FormItem><FormLabel className="text-[10px] font-bold text-zinc-500 uppercase">Bride Name</FormLabel><FormControl><Input {...field} className="bg-zinc-950 border-white/10 h-12 rounded-xl" /></FormControl></FormItem>
                                                        )} />
                                                        <FormField control={form.control} name="brideGotra" render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-[10px] font-bold text-zinc-500 uppercase">Bride Gotra (Optional)</FormLabel>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <FormControl><SelectTrigger className="bg-zinc-950 border-white/10 h-12 rounded-xl"><SelectValue placeholder="Select Gotra"/></SelectTrigger></FormControl>
                                                                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                                                        <ScrollArea className="h-64">{commonGotras.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</ScrollArea>
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormItem>
                                                        )} />
                                                    </div>
                                                </TabsContent>
                                            )}

                                            <TabsContent value="family" className="space-y-8 mt-0">
                                                {eventType === 'wedding' ? (
                                                    <>
                                                        <div className="space-y-4">
                                                            <h4 className="text-xs font-black uppercase text-blue-400 flex items-center gap-2">बेहुलाको तर्फबाट (Groom's Side)</h4>
                                                            {groomParentFields.map((field, index) => (
                                                                <div key={field.id} className="grid grid-cols-2 gap-2 relative bg-blue-500/5 p-3 rounded-xl border border-blue-500/10">
                                                                    <FormField control={form.control} name={`groomParents.${index}.name`} render={({ field }) => (<FormControl><Input {...field} placeholder="नाम (Name)" className="h-10 text-xs rounded-lg bg-zinc-950 border-white/5" /></FormControl>)} />
                                                                    <FormField control={form.control} name={`groomParents.${index}.relation`} render={({ field }) => (
                                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                                            <FormControl><SelectTrigger className="h-10 text-xs rounded-lg bg-zinc-950 border-white/5"><SelectValue placeholder="नाता"/></SelectTrigger></FormControl>
                                                                            <SelectContent className="bg-zinc-900 text-white border-white/10">
                                                                                <ScrollArea className="h-64">{relationshipTitles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</ScrollArea>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    )} />
                                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeGroomParent(index)} className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500/20 text-red-500"><Trash2 className="w-3 h-3"/></Button>
                                                                </div>
                                                            ))}
                                                            <Button type="button" variant="outline" onClick={() => appendGroomParent({ name: '', relation: '' })} className="w-full h-10 border-dashed border-blue-500/20 text-xs font-bold text-blue-400">+ Add Member</Button>
                                                        </div>
                                                        <Separator className="bg-white/5" />
                                                        <div className="space-y-4">
                                                            <h4 className="text-xs font-black uppercase text-pink-400 flex items-center gap-2">बेहुलीको तर्फबाट (Bride's Side)</h4>
                                                            {brideParentFields.map((field, index) => (
                                                                <div key={field.id} className="grid grid-cols-2 gap-2 relative bg-pink-500/5 p-3 rounded-xl border border-pink-500/10">
                                                                    <FormField control={form.control} name={`brideParents.${index}.name`} render={({ field }) => (<FormControl><Input {...field} placeholder="नाम (Name)" className="h-10 text-xs rounded-lg bg-zinc-950 border-white/5" /></FormControl>)} />
                                                                    <FormField control={form.control} name={`brideParents.${index}.relation`} render={({ field }) => (
                                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                                            <FormControl><SelectTrigger className="h-10 text-xs rounded-lg bg-zinc-950 border-white/5"><SelectValue placeholder="नाता"/></SelectTrigger></FormControl>
                                                                            <SelectContent className="bg-zinc-900 text-white border-white/10">
                                                                                <ScrollArea className="h-64">{relationshipTitles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</ScrollArea>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    )} />
                                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeBrideParent(index)} className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500/20 text-red-500"><Trash2 className="w-3 h-3"/></Button>
                                                                </div>
                                                            ))}
                                                            <Button type="button" variant="outline" onClick={() => appendBrideParent({ name: '', relation: '' })} className="w-full h-10 border-dashed border-pink-500/20 text-xs font-bold text-pink-400">+ Add Member</Button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <h4 className="text-xs font-black uppercase text-primary">अभिभावक विवरण (Family)</h4>
                                                        {parentFields.map((field, index) => (
                                                            <div key={field.id} className="grid grid-cols-2 gap-2 relative bg-primary/5 p-3 rounded-xl border border-primary/10">
                                                                <FormField control={form.control} name={`parents.${index}.name`} render={({ field }) => (<FormControl><Input {...field} placeholder="नाम (Name)" className="h-10 text-xs rounded-lg bg-zinc-950 border-white/5" /></FormControl>)} />
                                                                <FormField control={form.control} name={`parents.${index}.relation`} render={({ field }) => (
                                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                                        <FormControl><SelectTrigger className="h-10 text-xs rounded-lg bg-zinc-950 border-white/5"><SelectValue placeholder="नाता"/></SelectTrigger></FormControl>
                                                                        <SelectContent className="bg-zinc-900 text-white border-white/10">
                                                                            <ScrollArea className="h-64">{relationshipTitles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</ScrollArea>
                                                                        </SelectContent>
                                                                    </Select>
                                                                )} />
                                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeParent(index)} className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500/20 text-red-500"><Trash2 className="w-3 h-3"/></Button>
                                                            </div>
                                                        ))}
                                                        <Button type="button" variant="outline" onClick={() => appendParent({ name: '', relation: '' })} className="w-full h-10 border-dashed border-primary/20 text-xs font-bold text-primary">+ Add Family Member</Button>
                                                    </div>
                                                )}
                                            </TabsContent>

                                            <TabsContent value="event" className="space-y-6 mt-0">
                                                <div className="space-y-4">
                                                    <h4 className="text-xs font-black uppercase text-zinc-400">समारोह विवरण (Schedule)</h4>
                                                    {ceremonyFields.map((field, index) => (
                                                        <div key={field.id} className="p-4 border border-white/5 bg-zinc-950/40 rounded-2xl space-y-3 relative">
                                                            <FormField control={form.control} name={`ceremonies.${index}.name`} render={({ field }) => (<Input {...field} placeholder="Event Name" className="h-10 text-xs" />)} />
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <FormField control={form.control} name={`ceremonies.${index}.date`} render={({ field }) => (<Input {...field} placeholder="Date" className="h-10 text-xs" />)} />
                                                                <FormField control={form.control} name={`ceremonies.${index}.time`} render={({ field }) => (<Input {...field} placeholder="Time" className="h-10 text-xs" />)} />
                                                            </div>
                                                            <FormField control={form.control} name={`ceremonies.${index}.venue`} render={({ field }) => (<Input {...field} placeholder="Venue" className="h-10 text-xs" />)} />
                                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeCeremony(index)} className="absolute top-2 right-2 text-zinc-600"><Trash2 className="w-4 h-4"/></Button>
                                                        </div>
                                                    ))}
                                                    <Button type="button" variant="outline" onClick={() => appendCeremony({ name: '', date: '', time: '', venue: '' })} className="w-full h-10 border-dashed border-white/10 text-xs uppercase font-bold">+ Add Ceremony</Button>
                                                </div>
                                                <Separator className="bg-white/5" />
                                                <div className="space-y-4">
                                                    <h4 className="text-xs font-black uppercase text-zinc-400">निमन्त्रणा सन्देश (Message)</h4>
                                                    <FormField control={form.control} name="invitationMessage" render={({ field }) => (
                                                        <Textarea {...field} rows={6} className="bg-zinc-950 border-white/10 rounded-xl text-xs" />
                                                    )} />
                                                </div>
                                            </TabsContent>
                                        </ScrollArea>
                                    </div>
                                </Tabs>
                            </Form>
                        </Card>
                    </div>

                    {/* RIGHT PANEL: RENDERING WORKSPACE */}
                    <div className="lg:col-span-8 flex flex-col items-center">
                        <div className="w-full flex flex-col sm:flex-row justify-between items-center mb-10 gap-6 px-10 py-4 bg-zinc-900/60 border border-white/10 rounded-[2rem] shadow-2xl backdrop-blur-xl">
                            <div className="flex items-center gap-4">
                                <MonitorPlay className="w-5 h-5 text-primary" />
                                <div className="text-left">
                                    <h2 className="text-lg font-black uppercase tracking-tighter italic text-white/90">Studio Viewport</h2>
                                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{cardFormat.toUpperCase()} Mode</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-zinc-950/80 p-1.5 rounded-xl border border-white/5 shadow-inner">
                                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}><ZoomOut className="w-4 h-4"/></Button>
                                <span className="text-[10px] font-black w-12 text-center text-primary">{Math.round(zoom * 100)}%</span>
                                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setZoom(z => Math.min(2, z + 0.1))}><ZoomIn className="w-4 h-4"/></Button>
                            </div>
                        </div>

                        <div className="relative flex justify-center items-start w-full group overflow-x-auto custom-scrollbar py-8 px-4 rounded-[3.5rem] bg-zinc-950/50 border border-white/5 shadow-inner perspective-[2000px]">
                            <div 
                                ref={canvasRef}
                                className={cn(
                                    "relative overflow-hidden transition-all duration-1000 bg-white shadow-[0_60px_150px_rgba(0,0,0,1)] border-white/10 ring-1 ring-white/20 rounded-md flex preserve-3d",
                                    isFolded && cardFormat !== 'single' && "rotate-x-[10deg]"
                                )}
                                style={{
                                    width: cardFormat === 'single' ? '450px' : cardFormat === '2-fold' ? '600px' : '900px', 
                                    height: cardFormat === 'single' ? '600px' : '550px', 
                                    transform: `scale(${zoom}) ${isFolded && cardFormat !== 'single' ? 'rotateX(10deg)' : ''}`,
                                    transformOrigin: 'top center',
                                }}
                            >
                                {/* Panel 1: FRONT */}
                                <motion.div 
                                    className={cn(
                                        "h-full p-8 border-r border-black/5 relative z-50 flex flex-col items-center text-center origin-right preserve-3d",
                                        cardFormat === 'single' ? 'w-full' : cardFormat === '2-fold' ? 'w-[300px]' : 'w-[300px]'
                                    )}
                                    animate={{ rotateY: isFolded && cardFormat !== 'single' ? (cardFormat === '2-fold' ? 180 : 170) : 0 }}
                                    transition={{ duration: 1.2, ease: "easeInOut" }}
                                    style={{ ...foldBgStyle('0% center'), color: currentTheme.textColor || 'black', backfaceVisibility: 'hidden' }}
                                >
                                    <div className="mt-2 mb-4 flex flex-col items-center">
                                        <img src="https://i.imgur.com/0U6WIqT.png" alt="Ganesha" className="w-14 h-14 mb-2 object-contain" />
                                        <p className="text-[8px] italic font-bold opacity-80 leading-tight devanagari px-4">{form.watch('mantra')}</p>
                                    </div>
                                    <div className="mb-8 w-full flex flex-col items-center">
                                        <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none" 
                                            style={{ backgroundImage: goldTextGradient, WebkitBackgroundClip: 'text', color: 'transparent', fontFamily: "'Cinzel', serif" }}>
                                            {getEventLabel(eventType)}
                                        </h2>
                                    </div>
                                    <div className="mt-auto w-full space-y-4">
                                        <p className="text-[10px] font-black uppercase opacity-50 tracking-[0.4em]" style={{ color: currentTheme.accent }}>To:</p>
                                        <p className="text-xl font-black uppercase tracking-tighter italic" style={{ fontFamily: "'Cinzel', serif" }}>{form.watch('recipientName') || 'Guest Name'}</p>
                                        <div className="w-full bg-black/5 p-4 rounded-[2.5rem] border border-black/5">
                                            <p className="text-sm font-bold opacity-80">{form.watch('recipientAddress') || 'Full Address'}</p>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Panel 2: MAIN SUBJECTS */}
                                {(cardFormat === '2-fold' || cardFormat === '3-fold') && (
                                    <div 
                                        className={cn("h-full p-6 border-r border-black/5 relative z-40 flex flex-col items-center justify-center text-center", cardFormat === '2-fold' ? 'w-[300px]' : 'w-[300px]')} 
                                        style={{ ...foldBgStyle(cardFormat === '2-fold' ? '100% center' : '50% center'), color: currentTheme.textColor || 'black' }}
                                    >
                                        <h1 className="text-4xl font-black font-headline mb-6 tracking-tighter uppercase italic leading-none" style={{ color: currentTheme.accent }}>INVITATION</h1>
                                        
                                        <div className="mb-6 scale-110">
                                            <div className="flex flex-col items-center mb-2">
                                                <span className="text-3xl font-black uppercase tracking-tighter">
                                                    {eventType === 'wedding' ? form.watch('groomName') : eventType === 'bratabandha' ? form.watch('boyName') : eventType === 'nuworan' || eventType === 'pasni' ? form.watch('babyName') : form.watch('celebrantName')}
                                                </span>
                                                {(eventType === 'wedding' || eventType === 'bratabandha') && (
                                                    <span className="text-[10px] font-bold opacity-60">({eventType === 'wedding' ? form.watch('groomGotra') : form.watch('boyGotra')})</span>
                                                )}
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-[7px] uppercase font-bold opacity-50">अभिभावक (Parents)</p>
                                                {(eventType === 'wedding' ? form.watch('groomParents') : form.watch('parents'))?.map((p, i) => (
                                                    <p key={i} className="text-[10px] font-bold leading-tight">{p.relation}: {p.name}</p>
                                                ))}
                                            </div>
                                        </div>

                                        <Heart className="w-6 h-6 text-primary animate-pulse fill-current mb-6" style={{ color: currentTheme.accent }} />

                                        <div className="w-full">
                                            <p className="text-[10px] font-bold leading-relaxed opacity-80 italic">{form.watch('invitationMessage')}</p>
                                        </div>

                                        {form.watch('invitationSide') === 'groom' && <RenderCeremonies />}
                                    </div>
                                )}

                                {/* Panel 3: BRIDE / OTHER */}
                                {cardFormat === '3-fold' && (
                                    <motion.div 
                                        className="w-[300px] h-full p-6 relative z-50 flex flex-col items-center text-center origin-left preserve-3d"
                                        animate={{ rotateY: isFolded ? -170 : 0 }}
                                        transition={{ duration: 1.2, ease: "easeInOut" }}
                                        style={{ ...foldBgStyle('100% center'), color: currentTheme.textColor || 'black', backfaceVisibility: 'hidden' }}
                                    >
                                        {eventType === 'wedding' && (
                                            <div className="mb-8">
                                                <div className="flex flex-col items-center mb-2">
                                                    <span className="text-3xl font-black uppercase tracking-tighter">{form.watch('brideName') || 'BRIDE'}</span>
                                                    <span className="text-[10px] font-bold opacity-60">({form.watch('brideGotra')})</span>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-[7px] uppercase font-bold opacity-50">अभिभावक (Bride's Side)</p>
                                                    {form.watch('brideParents')?.map((p, i) => (
                                                        <p key={i} className="text-[10px] font-bold leading-tight">{p.relation}: {p.name}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {form.watch('invitationSide') === 'bride' && <RenderCeremonies />}

                                        <div className="mt-auto w-full pt-4">
                                            <div className="px-6 py-3 border-2 border-dashed border-black/10 rounded-2xl bg-white/5">
                                                <span className="text-[9px] uppercase font-black tracking-[0.3em] opacity-70 block mb-1">RSVP</span>
                                                <span className="text-[11px] font-bold block">{form.watch('rsvp') || 'सम्पर्क विवरणहरू'}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* PRODUCTION HUB */}
                        <div className="w-full max-w-5xl mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                            <Card className="bg-zinc-900/80 border-white/5 rounded-[2.5rem] shadow-2xl p-6 flex flex-col h-[400px]">
                                <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2"><Bot className="w-4 h-4" /> AI Studio Chat</h3>
                                <ScrollArea className="flex-1 pr-4 mb-4 border border-white/5 rounded-2xl p-4 bg-black/20">
                                    <div className="space-y-4 text-left">
                                        {chatHistory.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full opacity-30 py-10">
                                                <MessageSquare className="w-10 h-10 mb-4" />
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-center">डिजाइनर एआईसँग कुरा गर्नुहोस्...<br/>(Instruction based editing)</p>
                                            </div>
                                        ) : (
                                            chatHistory.map((msg, i) => (
                                                <div key={i} className={cn("flex flex-col max-w-[85%]", msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start')}>
                                                    <div className={cn("px-4 py-2 rounded-2xl text-[11px] font-medium", msg.role === 'user' ? 'bg-primary text-black' : 'bg-zinc-800 text-white border border-white/5')}>{msg.content}</div>
                                                </div>
                                            ))
                                        )}
                                        {isLoading && <div className="flex items-center gap-2 text-primary text-[9px] font-black uppercase tracking-widest"><Loader2 className="w-3 h-3 animate-spin"/> Thinking...</div>}
                                    </div>
                                </ScrollArea>
                                <form onSubmit={handleChatSubmit} className="flex gap-2">
                                    <Input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Add a gold Ganesha, Move text to center..." className="bg-zinc-950 border-white/10 h-12 rounded-xl text-xs" />
                                    <Button type="submit" disabled={isLoading || !chatInput.trim()} className="h-12 w-12 rounded-xl bg-primary text-black"><Send className="w-4 h-4"/></Button>
                                </form>
                            </Card>

                            <Card className="bg-zinc-900/80 border-white/5 rounded-[2.5rem] shadow-2xl p-8 flex flex-col justify-between">
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <MonitorPlay className={cn("w-5 h-5 transition-colors", isFolded ? "text-primary" : "text-zinc-600")} />
                                            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">3D Preview Mode</span>
                                        </div>
                                        <Switch disabled={cardFormat === 'single'} checked={isFolded} onCheckedChange={setIsFolded} className="data-[state=checked]:bg-primary" />
                                    </div>
                                    <Separator className="bg-white/5" />
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Print Density</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[1, 2].map(n => (<Button key={n} variant={cardsPerPage === n ? 'default' : 'outline'} onClick={() => setCardsPerPage(n)} className="h-10 text-[10px] uppercase font-black">{n} per A4</Button>))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-8">
                                    <Button onClick={applyAiMagic} disabled={isLoading} variant="outline" className="w-full h-14 rounded-2xl border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 gap-3 font-black uppercase text-[10px] tracking-[0.2em] shadow-xl">
                                        {isLoading ? <Loader2 className="animate-spin w-4 h-4"/> : <Wand2 className="w-4 h-4"/>} AI Magic Assist
                                    </Button>
                                    <Button onClick={() => downloadInvite('pdf')} disabled={isLoading} className="w-full gradient-button-gold rounded-2xl h-16 font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-primary/30">
                                        <Download className="w-5 h-5 mr-3" /> Export Studio PDF
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            {isLoading && <ProcessingOverlay message="Studio Engine Processing..." />}
            <LandingFooter onNavigate={path => router.push(path)} />
        </div>
    );
}
