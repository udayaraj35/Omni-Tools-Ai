'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Copy, Check, Volume2, Sparkles, BookOpen, Star, FileText, Search, Coffee, Bookmark, Book, BookCopy, Landmark, Wallet, Send } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { mantrasData } from '@/lib/mantra-data';
import { chalisaData } from '@/lib/chalisa-data';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShivaPuranaReader } from './ShivaPuranaReader';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';


type Mantra = {
    name: string;
    sanskrit: string;
    transliteration: string;
    englishMeaning: string;
    nepaliMeaning: string;
    audioUrl: string | null;
};

type Deity = {
    name: string;
    image: string | null;
    originStory: string | null;
    originStoryEnglish: string | null;
    aarti: string | null;
    aartiEnglish: string | null;
    mantras: Mantra[];
};

const toNepaliNumerals = (num: number | string): string => {
    const str = String(num);
    if (!str) return '';
    const nepaliNumerals = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return str.replace(/[0-9]/g, d => nepaliNumerals[parseInt(d)]);
};

const LINES_PER_PAGE = 8; // Define lines per page

const PaymentOptionBox = ({ href, onClick, children }: { href?: string, onClick?: () => void, children: React.ReactNode }) => {
    const commonProps = {
        className: "flex flex-col items-center justify-center gap-3 p-4 rounded-lg bg-muted/20 h-full w-full transition-all duration-300 hover:bg-muted/40"
    };

    const wrapperClassName = cn(
        "border p-0.5 rounded-xl transition-all duration-300 border-amber-700/50",
        "active:shadow-[0_0_15px_hsl(var(--primary))] active:shadow-amber-400/50"
    );

    if (href) {
        return <div className={wrapperClassName}><a href={href} target="_blank" rel="noopener noreferrer" {...commonProps}>{children}</a></div>;
    }
    return <div className={wrapperClassName}><button onClick={onClick} {...commonProps}>{children}</button></div>;
};

const ThankYouPage = () => {
  const [qrDetails, setQrDetails] = useState<{ title: string; image: string; address?: string } | null>(null);
  
  const firestore = useFirestore();
  const configRef = useMemoFirebase(() => doc(firestore, 'systemConfig', 'global'), [firestore]);
  const { data: config } = useDoc(configRef);

  const showQrFor = (paymentType: 'esewa' | 'khalti' | 'global' | 'usdt') => {
      if (!config) return;
      const details = {
          esewa: { title: "eSewa QR", image: config.esewaQrUrl || "https://i.imgur.com/3c4tGf3.png" },
          khalti: { title: "Khalti QR", image: config.khaltiQrUrl || "https://i.imgur.com/0Yi0XPc.png" },
          global: { title: config.bankName || "Bank QR", image: config.bankQrUrl || "https://i.imgur.com/1cIK64b.png", address: config.bankHolder },
          usdt: { title: `${config.cryptoCoin || 'USDT'} (${config.cryptoChain || 'TRC20'}) QR`, image: config.cryptoQrUrl || "https://i.imgur.com/jY14yAm.png", address: config.cryptoAddress },
      };
      setQrDetails(details[paymentType]);
  };

  if (qrDetails) {
     return (
        <div className="text-center p-8 parchment-background" style={{color: '#B8860B'}}>
            <h2 className="text-2xl font-bold devanagari">{qrDetails.title}</h2>
            <div className="bg-white p-3 rounded-2xl shadow-xl w-fit mx-auto my-6">
                <Image src={qrDetails.image} alt={qrDetails.title} width={256} height={256} className="rounded-lg object-contain" />
            </div>
             {qrDetails.address && (
                <div className="mt-2 space-y-1 max-w-sm mx-auto">
                  <p className="text-xs font-black uppercase tracking-widest opacity-60">Account/Wallet Detail</p>
                  <p className="text-xs font-mono break-all bg-black/10 p-3 rounded-xl border border-black/5 select-all">{qrDetails.address}</p>
                </div>
            )}
            <Button variant="outline" onClick={() => setQrDetails(null)} className="mt-8 h-12 rounded-xl font-bold border-amber-700/30">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Options
            </Button>
        </div>
     )
  }
  
  return (
    <div className="text-center p-8 parchment-background" style={{color: '#FFD700'}}>
        <h2 className="text-4xl font-bold devanagari" style={{fontSize: '3rem'}}>समाप्त</h2>
        <p className="text-lg mt-2">(End)</p>
        
        <div className="my-8 space-y-4">
            <p className="font-semibold text-lg">
                तपाईंले यो पवित्र ग्रन्थ पढेर कस्तो महसुस गर्नुभयो? कृपया आफ्नो अनुभव सामाजिक सञ्जालमा सेयर गर्नुहोस्।
            </p>
            <p className="italic text-base">
                How did you feel after reading this sacred text? Please share your experience on social media.
            </p>
             <p className="font-semibold text-lg devanagari">
                यह पवित्र ग्रंथ पढ़कर आपको कैसा लगा? कृपया अपना अनुभव सोशल मीडिया पर साझा करें।
            </p>
        </div>

        <Separator className="my-6 bg-amber-700/50" />

        <div className="my-8 space-y-4">
             <h3 className="text-2xl font-bold devanagari">हामीलाई सहयोग गर्नुहोस्</h3>
             <p className="font-semibold text-lg">
                यदि तपाईंलाई यो वेबसाइट मन पर्यो र भविष्यमा अझै राम्रो बनाउन सहयोग गर्न चाहनुहुन्छ भने, तपाईंले निम्न माध्यमबाट हामीलाई सहयोग गर्नुहोला।
            </p>
            <p className="italic text-base">
                If you liked this website and want to help us make it even better, you can support us here.
            </p>
        </div>
        
        <Tabs defaultValue="nepal" className="w-full max-w-lg mx-auto">
            <TabsList className="grid w-full grid-cols-2 bg-black/10 rounded-xl h-12 p-1 border border-amber-700/20">
                <TabsTrigger value="nepal" className="data-[state=active]:bg-amber-800/80 data-[state=active]:text-white font-bold rounded-lg uppercase text-[10px] tracking-widest">Nepal Users</TabsTrigger>
                <TabsTrigger value="international" className="data-[state=active]:bg-amber-800/80 data-[state=active]:text-white font-bold rounded-lg uppercase text-[10px] tracking-widest">International</TabsTrigger>
            </TabsList>
            <TabsContent value="nepal" className="mt-6">
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <PaymentOptionBox onClick={() => showQrFor('esewa')}>
                        <Image src="https://i.imgur.com/robpgw7.png" alt="eSewa" width={50} height={50} className="object-contain"/>
                        <span className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-br from-green-400 to-emerald-600">eSewa</span>
                    </PaymentOptionBox>
                    <PaymentOptionBox onClick={() => showQrFor('khalti')}>
                        <Image src="https://i.imgur.com/YJP9q4j.png" alt="Khalti" width={70} height={50} className="object-contain" />
                        <span className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-br from-purple-400 to-indigo-600">Khalti</span>
                    </PaymentOptionBox>
                    <PaymentOptionBox onClick={() => showQrFor('global')}>
                        <Landmark className="w-8 h-8 text-amber-400" />
                        <span className="text-xs font-black text-amber-400 uppercase leading-tight">Bank Pay</span>
                    </PaymentOptionBox>
                </div>
                <div className="mt-6 border border-amber-700/30 bg-black/10 p-4 rounded-2xl text-center shadow-inner">
                   <p className="text-[10px] font-black uppercase text-amber-600/60 tracking-widest mb-1">Direct Pay ID</p>
                   <p className="text-xl font-black text-white tracking-widest">
                        {config?.esewaId || '+977 9864353535'}
                    </p>
                    <div className="flex justify-center items-center gap-4 mt-3">
                        <a href="https://esewa.com.np" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase text-amber-600 hover:underline">
                            eSewa
                        </a>
                        <a href="https://khalti.com" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase text-amber-600 hover:underline">
                            Khalti
                        </a>
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="international" className="mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <PaymentOptionBox href="https://www.paypal.com/paypalme/UdayaRaj35">
                        <Image src="https://www.paypalobjects.com/webstatic/mktg/logo/bdg_now_accepting_pp_2line_w.png" alt="PayPal" width={120} height={60} className="object-contain" />
                    </PaymentOptionBox>
                    <PaymentOptionBox href="https://buymeacoffee.com/udayaraj">
                        <Coffee className="h-10 w-10 text-yellow-400" />
                        <span className="text-lg font-black text-yellow-400 uppercase italic">Buy Coffee</span>
                    </PaymentOptionBox>
                </div>
                 <div className="mt-4">
                    <PaymentOptionBox onClick={() => showQrFor('usdt')}>
                        <Wallet className="w-8 h-8 text-emerald-400" />
                        <span className="text-lg font-black text-emerald-400 uppercase italic tracking-tighter">Crypto Pay</span>
                    </PaymentOptionBox>
                </div>
            </TabsContent>
        </Tabs>
    </div>
  );
};

const BookReader = ({ bookKey, onBack }: { bookKey: string; onBack: () => void }) => {
    const book = chalisaData[bookKey as keyof typeof chalisaData];
    const { toast } = useToast();
    const [jumpToLine, setJumpToLine] = useState('');
    const [meaningLanguage, setMeaningLanguage] = useState('nepali');
    const [currentPage, setCurrentPage] = useState(1);
    const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

    const speakText = (text: string, lang: string = 'en-US') => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            window.speechSynthesis.speak(utterance);
        } else {
            toast({ variant: 'destructive', title: 'Unsupported Browser', description: 'Text-to-speech is not supported by your browser.' });
        }
    };

    const handleCopy = (text: string, key: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedStates(prev => ({ ...prev, [key]: true }));
        toast({ title: 'Copied to clipboard!' });
        setTimeout(() => setCopiedStates(prev => ({...prev, [key]: false})), 2000);
    };

    if (!book) return null;

    const originalLines = book.content.trim().split('\n');
    const nepaliMeaningLines = book.nepaliMeaning.trim().split('\n');
    const englishMeaningLines = book.englishMeaning.trim().split('\n');
    const hindiMeaningLines = book.hindiMeaning.trim().split('\n');

    const totalLines = originalLines.length;
    const totalContentPages = Math.ceil(totalLines / LINES_PER_PAGE);
    const totalPages = totalContentPages + 1; // For the thank you page

    const handleJumpToLine = () => {
        const lineNum = parseInt(jumpToLine, 10);
        if (!isNaN(lineNum) && lineNum > 0 && lineNum <= totalLines) {
            const page = Math.ceil(lineNum / LINES_PER_PAGE);
            setCurrentPage(page);
            toast({ title: `Jumped to page ${page} for line ${lineNum}` });
        } else {
            toast({ variant: 'destructive', title: `Invalid line number. Please enter a number between 1 and ${totalLines}.` });
        }
    };
    
    const startIndex = (currentPage - 1) * LINES_PER_PAGE;
    const endIndex = startIndex + LINES_PER_PAGE;

    const currentOriginalLines = originalLines.slice(startIndex, endIndex);
    const currentNepaliLines = nepaliMeaningLines.slice(startIndex, endIndex);
    const currentEnglishLines = englishMeaningLines.slice(startIndex, endIndex);
    const currentHindiLines = hindiMeaningLines.slice(startIndex, endIndex);
    
    if (currentPage > totalContentPages) {
        return (
             <Card className="glass-card">
                 <CardHeader>
                    <div className="flex justify-end">
                        <Button variant="outline" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <ThankYouPage />
                </CardContent>
                <CardFooter className="flex justify-between items-center mt-4">
                    <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                        अघिल्लो पृष्ठ (Previous)
                    </Button>
                    <span className="font-semibold text-muted-foreground">
                        अन्तिम पृष्ठ
                    </span>
                    <Button disabled>
                        अर्को पृष्ठ (Next)
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="glass-card">
            <CardHeader>
                <div className="flex justify-between items-center flex-wrap gap-4 relative">
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center">
                        <p className="font-bold devanagari text-5xl" style={{color: '#FFD700', fontSize: '3rem', textShadow: '0 0 10px #000'}}>ॐ</p>
                        <p className="font-bold devanagari text-2xl" style={{color: '#FFD700', fontSize: '1.5rem', textShadow: '0 0 5px #000'}}>श्री गणेशाय नमः</p>
                    </div>
                    <CardTitle className="text-3xl font-bold devanagari" style={{fontSize: '2.5rem'}}>{book.title}</CardTitle>
                    <div className="flex items-center gap-2">
                         <Input 
                            type="number" 
                            placeholder="Go to line..." 
                            className="w-28" 
                            value={jumpToLine}
                            onChange={(e) => setJumpToLine(e.target.value)}
                        />
                        <Button onClick={handleJumpToLine}>Go</Button>
                        <Button variant="outline" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                 <div className="book-page grid md:grid-cols-2 gap-8 p-6 md:p-8 min-h-[60vh] rounded-lg mt-4 parchment-background">
                    <div>
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold devanagari" style={{color: '#B8860B'}}>मूल पाठ (Original)</h3>
                            <div className="flex gap-1">
                                <Button size="icon" variant="ghost" onClick={() => speakText(currentOriginalLines.join('\n'), 'hi-IN')}><Volume2/></Button>
                                <Button size="icon" variant="ghost" onClick={() => handleCopy(currentOriginalLines.join('\n'), 'original')} >
                                    {copiedStates['original'] ? <Check /> : <Copy />}
                                </Button>
                            </div>
                        </div>
                        <div className="devanagari text-lg leading-loose space-y-2 font-bold" style={{color: '#8B4513'}}>
                            {currentOriginalLines.map((line, index) => (
                                <p key={index} id={`line-${startIndex + index + 1}`}>{line || <>&nbsp;</>}</p>
                            ))}
                        </div>
                    </div>
                    <div>
                         <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold devanagari" style={{color: '#B8860B'}}>अर्थ (Meaning)</h3>
                            <div className="flex gap-1">
                                <Button size="icon" variant="ghost" onClick={() => {
                                    let textToSpeak = '';
                                    let lang = 'en-US';
                                    if (meaningLanguage === 'nepali') {
                                        textToSpeak = currentNepaliLines.join('\n');
                                        lang = 'ne-NP';
                                    } else if (meaningLanguage === 'english') {
                                        textToSpeak = currentEnglishLines.join('\n');
                                        lang = 'en-US';
                                    } else if (meaningLanguage === 'hindi') {
                                        textToSpeak = currentHindiLines.join('\n');
                                        lang = 'hi-IN';
                                    }
                                    speakText(textToSpeak, lang);
                                }}><Volume2/></Button>
                                <Button size="icon" variant="ghost" onClick={() => {
                                    let textToCopy = '';
                                    if (meaningLanguage === 'nepali') textToCopy = currentNepaliLines.join('\n');
                                    else if (meaningLanguage === 'english') textToCopy = currentEnglishLines.join('\n');
                                    else if (meaningLanguage === 'hindi') textToCopy = currentHindiLines.join('\n');
                                    handleCopy(textToCopy, 'meaning');
                                }} >
                                    {copiedStates['meaning'] ? <Check /> : <Copy />}
                                </Button>
                            </div>
                        </div>
                        <Tabs value={meaningLanguage} onValueChange={setMeaningLanguage}>
                            <TabsList className="my-2 grid grid-cols-3">
                                <TabsTrigger value="nepali">नेपाली</TabsTrigger>
                                <TabsTrigger value="english">English</TabsTrigger>
                                <TabsTrigger value="hindi">हिन्दी</TabsTrigger>
                            </TabsList>
                            <TabsContent value="nepali">
                                <div className="text-base leading-relaxed space-y-2 font-bold devanagari" style={{color: '#4a2c2a'}}>
                                    {currentNepaliLines.map((line, index) => (
                                        <p key={`ne-${index}`}>{line || <>&nbsp;</>}</p>
                                    ))}
                                </div>
                            </TabsContent>
                            <TabsContent value="english">
                                 <div className="text-base leading-relaxed space-y-2 font-bold" style={{color: '#4a2c2a'}}>
                                    {currentEnglishLines.map((line, index) => (
                                        <p key={`en-${index}`}>{line || <>&nbsp;</>}</p>
                                    ))}
                                </div>
                            </TabsContent>
                            <TabsContent value="hindi">
                                 <div className="text-base leading-relaxed space-y-2 font-bold devanagari" style={{color: '#4a2c2a'}}>
                                    {currentHindiLines.map((line, index) => (
                                        <p key={`hi-${index}`}>{line || <>&nbsp;</>}</p>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
                <div className="text-center mt-6 text-xs text-red-500/80 italic space-y-1">
                    <p>यहाँ केही अशुद्ध लेखिएको हुन सक्छ, यस्तो भएमा क्षमा चाहन्छु। आउने दिनमा यसलाई सच्याइनेछ।</p>
                    <p>There might be some inaccuracies in the text. If so, I apologize. It will be corrected in the coming days.</p>
                    <p>यहाँ कुछ अशुद्धियाँ हो सकती हैं, इसके लिए मैं क्षमा चाहता हूँ। आने वाले दिनों में इसे सुधारा जाएगा।</p>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                        अघिल्लो पृष्ठ (Previous)
                    </Button>
                    <span className="font-semibold text-muted-foreground">
                        पृष्ठ {toNepaliNumerals(currentPage)} / {toNepaliNumerals(totalPages)}
                    </span>
                    <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                        अर्को पृष्ठ (Next)
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};


export default function MantraGeneratorPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [selectedDeityKey, setSelectedDeityKey] = useState(Object.keys(mantrasData)[0]);
    const [readingBookKey, setReadingBookKey] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
    const [activeLibraryTab, setActiveLibraryTab] = useState('chalisa');

    const speakText = (text: string, lang: string = 'en-US') => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            window.speechSynthesis.speak(utterance);
        } else {
            toast({
                variant: 'destructive',
                title: 'Unsupported Browser',
                description: 'Text-to-speech is not supported by your browser.',
            });
        }
    };

    const handleCopy = (text: string, key: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedStates(prev => ({ ...prev, [key]: true }));
        toast({ title: 'Copied to clipboard!' });
        setTimeout(() => setCopiedStates(prev => ({...prev, [key]: false})), 2000);
    };

    const selectedDeity = mantrasData[selectedDeityKey as keyof typeof mantrasData];

    const handleDeitySelect = (key: string) => {
        setSelectedDeityKey(key);
    };
    
    const handleNavigate = (path: string) => {
        router.push(path.startsWith('/') ? path : `/#${path}`);
    };
    
    const placeholderBooks = [
        { title: { sanskrit: "श्री हनुमान चालिसा", english: "Shri Hanuman Chalisa" }, key: 'hanumanChalisa', category: 'chalisa' },
        { title: { sanskrit: "श्री शिव चालिसा", english: "Shri Shiva Chalisa" }, key: 'shivaChalisa', category: 'chalisa' },
        { title: { sanskrit: "श्री शनि चालिसा", english: "Shri Shani Chalisa" }, key: 'shaniChalisa', category: 'chalisa' },
        { title: { sanskrit: "श्री गणेश चालिसा", english: "Shri Ganesh Chalisa" }, key: 'ganeshChalisa', category: 'chalisa' },
        { title: { sanskrit: "श्री लक्ष्मी चालिसा", english: "Shri Lakshmi Chalisa" }, key: 'lakshmiChalisa', category: 'chalisa' },
        { title: { sanskrit: "श्री दुर्गा चालिसा", english: "Shri Durga Chalisa" }, key: 'durgaChalisa', category: 'chalisa' },
        { title: { sanskrit: "श्री गायत्री चालिसा", english: "Shri Gayatri Chalisa" }, key: 'gayatriChalisa', category: 'chalisa' },
        
        { title: { sanskrit: "श्रीमद्भगवद्गीता", english: "Bhagavad Gita" }, key: null, category: 'epic' },
        { title: { sanskrit: "रामायण", english: "Ramayana" }, key: null, category: 'epic' },
        { title: { sanskrit: "महाभारत", english: "Mahabharata" }, key: null, category: 'epic' },
        
        { title: { sanskrit: "ऋग्वेद", english: "Rigveda" }, key: null, category: 'veda' },
        { title: { sanskrit: "यजुर्वेद", english: "Yajurveda" }, key: null, category: 'veda' },
        { title: { sanskrit: "सामवेद", english: "Samaveda" }, key: null, category: 'veda' },
        { title: { sanskrit: "अथर्ववेद", english: "Atharvaveda" }, key: null, category: 'veda' },
        
        { title: { sanskrit: "विष्णु पुराण", english: "Vishnu Purana" }, key: null, category: 'purana' },
        { title: { sanskrit: "शिव पुराण", english: "Shiva Purana" }, key: 'shivaPurana', category: 'purana' },
        { title: { sanskrit: "ब्रह्म पुराण", english: "Brahma Purana" }, key: null, category: 'purana' },
        { title: { sanskrit: "पद्म पुराण", english: "Padma Purana" }, key: null, category: 'purana' },
        { title: { sanskrit: "भागवत पुराण", english: "Bhagavata Purana" }, key: null, category: 'purana' },
        { title: { sanskrit: "नारद पुराण", english: "Narada Purana" }, key: null, category: 'purana' },
        { title: { sanskrit: "मार्कण्डेय पुराण", english: "Markandeya Purana" }, key: null, category: 'purana' },
        { title: { sanskrit: "अग्नि पुराण", english: "Agni Purana" }, key: null, category: 'purana' },
        { title: { sanskrit: "भविष्य पुराण", english: "Bhavishya Purana" }, key: null, category: 'purana' },
        { title: { sanskrit: "ब्रह्मवैवर्त पुराण", english: "Brahmavaivarta Purana" }, key: null, category: 'purana' },
        { title: { sanskrit: "लिङ्ग पुराण", english: "Linga Purana" }, key: null, category: 'purana' },
        { title: { sanskrit: "वराह पुराण", english: "Varaha Purana" }, key: null, category: 'purana' },
        { title: { sanskrit: "स्कन्द पुराण", english: "Skanda Purana" }, key: null, category: 'purana' },
        { title: { sanskrit: "वामन पुराण", english: "Vamana Purana" }, key: null, category: 'purana' },
        { title: { sanskrit: "कूर्म पुराण", english: "Kurma Purana" }, key: null, category: 'purana' },
        { title: { sanskrit: "मत्स्य पुराण", english: "Matsya Purana" }, key: null, category: 'purana' },
        { title: { sanskrit: "गरुड पुराण", english: "Garuda Purana" }, key: null, category: 'purana' },
        { title: { sanskrit: "ब्रह्माण्ड पुराण", english: "Brahmanda Purana" }, key: null, category: 'purana' },
    ];
    
    const filteredBooks = (category: string) => placeholderBooks.filter(book => 
        book.category === category &&
        (book.title.sanskrit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.title.english.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    const bookCategories = [
        { id: 'chalisa', name: 'चालिसा', english: 'Chalisas', icon: Bookmark, nepaliDescription: "७ चालिसा" },
        { id: 'epic', name: 'महाकाव्य', english: 'Epics', icon: Book, nepaliDescription: "३ महाकाव्य" },
        { id: 'veda', name: 'वेद', english: 'Vedas', icon: BookCopy, nepaliDescription: "४ वेद" },
        { id: 'purana', name: 'पुराण', english: 'Puranas', icon: BookOpen, nepaliDescription: "१८ पुराण" },
    ];

    const renderBookGrid = (books: typeof placeholderBooks) => (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {books.map((book) => (
                <div 
                    key={book.title.sanskrit} 
                    className="group relative aspect-[3/4] overflow-hidden rounded-lg shadow-lg border-2 border-amber-800/50 cursor-pointer flex flex-col justify-center items-center p-4 bg-gradient-to-br from-red-900 via-orange-800 to-yellow-900 transition-all duration-300 hover:shadow-amber-400/20 hover:shadow-2xl"
                    onClick={() => book.key ? setReadingBookKey(book.key) : toast({ title: "Coming Soon!", description: `${book.title.sanskrit} will be available to read soon.`})}
                >
                     <div 
                        className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-300"
                        style={{backgroundImage: 'url(https://www.transparenttextures.com/patterns/old-paper.png)'}}
                    />
                    <div className="relative text-center text-amber-300 p-2 border-2 border-yellow-300/50 rounded-md bg-black/20 backdrop-blur-sm">
                        <h3 className="font-bold text-xl devanagari" style={{color: '#FFD700', textShadow: '2px 2px 4px rgba(0,0,0,0.7)'}}>{book.title.sanskrit}</h3>
                        <p className="text-sm font-sans" style={{color: '#FFD700', textShadow: '1px 1px 2px rgba(0,0,0,0.7)'}}>{book.title.english}</p>
                    </div>
                    {!book.key && <Badge variant="outline" className="absolute bottom-4 bg-amber-500/20 text-amber-300 border-amber-400/50">Coming Soon</Badge>}
                </div>
            ))}
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar onNavigate={handleNavigate} />
            <main className="flex-1 w-full max-w-full mx-auto px-4 py-8 md:px-8">
                 <button onClick={() => router.push('/')} className="animated-border-card inline-block mb-6">
                    <span className={cn("inner-span flex items-center back-to-home-button")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </span>
                </button>
                 <div className="text-center mb-8">
                     <h2 className="text-4xl font-bold text-center mb-4 devanagari" style={{fontSize: '2rem', color: '#FFD700', textShadow: '0 0 8px rgba(255, 215, 0, 0.7)'}}>
                        🙏 ॐ नमः शिवाय 🙏
                    </h2>
                    <h1 className="text-4xl font-bold tracking-tight text-glow-primary devanagari">
                        Mantra Generator / मन्त्र संग्रह
                    </h1>
                     <p className="text-2xl text-primary font-semibold mt-2 devanagari">
                        मंत्र, उत्पत्ति कथा, र आरती संग्रह
                    </p>
                </div>
                
                 <Tabs defaultValue="deities" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 gap-2 rounded-lg bg-background/50 p-2 border-2 border-amber-800/30">
                        <TabsTrigger value="deities" className="text-base py-3 font-bold devanagari flex items-center gap-2 rounded-md data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-600 data-[state=active]:to-red-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:ring-2 data-[state=active]:ring-amber-400">
                            <Sparkles className="w-5 h-5"/>देव-देवता संग्रह (Deity Collection)
                        </TabsTrigger>
                        <TabsTrigger value="library" className="text-base py-3 font-bold devanagari flex items-center gap-2 rounded-md data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-600 data-[state=active]:to-red-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:ring-2 data-[state=active]:ring-amber-400">
                            <BookOpen className="w-5 h-5"/>ग्रन्थालय (Library)
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="deities" className="mt-6">
                        <div className="grid lg:grid-cols-[350px_1fr] gap-8 items-start">
                             <Card className="glass-card lg:sticky lg:top-24">
                                <CardHeader>
                                    <CardTitle className="devanagari text-lg">देव-देवता संग्रह (Deity Collection)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-[60vh] pr-3">
                                         <div className="grid grid-cols-2 gap-4">
                                            {Object.entries(mantrasData).map(([key, deity]) => {
                                                const deityNameParts = deity.name.match(/^(.*?)\s*\((.*)\)\s*$/);
                                                const nepaliName = deityNameParts ? deityNameParts[1] : deity.name;
                                                const englishName = deityNameParts ? `(${deityNameParts[2]})` : '';

                                                return (
                                                    <div 
                                                        key={key} 
                                                        className="group relative aspect-[3/4] overflow-hidden rounded-lg shadow-lg border-2 border-amber-800/50 cursor-pointer flex flex-col justify-center items-center p-4 bg-gradient-to-br from-red-900 via-orange-800 to-yellow-900 transition-all duration-300 hover:shadow-amber-400/20 hover:shadow-2xl"
                                                        onClick={() => handleDeitySelect(key)}
                                                    >
                                                        {deity.image && (
                                                            <Image src={deity.image} alt={deity.name} fill className="absolute inset-0 object-cover opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                                                        )}
                                                        <div className="text-center text-amber-300 p-2 border-2 border-yellow-300/50 rounded-md bg-black/20 backdrop-blur-sm relative z-10">
                                                            <h3 className="font-bold text-lg devanagari" style={{color: '#FFD700', textShadow: '2px 2px 4px rgba(0,0,0,0.7)'}}>{nepaliName}</h3>
                                                            <p className="text-sm font-sans" style={{color: '#FFD700', textShadow: '1px 1px 2px rgba(0,0,0,0.7)'}}>{englishName}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>

                            <div className="w-full">
                                <Card className="glass-card">
                                    <CardHeader className="text-center items-center p-4">
                                        {selectedDeity.image ? (
                                            <Image src={selectedDeity.image} alt={selectedDeity.name} width={120} height={120} className="rounded-lg shadow-lg object-cover mb-3 border-2 border-primary/40"/>
                                        ) : <h2 className="text-3xl font-bold devanagari text-primary">{selectedDeity.name}</h2>}
                                        <CardTitle className="text-2xl devanagari text-primary">{selectedDeity.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Accordion type="multiple" defaultValue={['mantras']} className="w-full space-y-4">
                                            <AccordionItem value="mantras" className="border-b-0 rounded-lg overflow-hidden glass-card">
                                                <AccordionTrigger className="p-4 hover:no-underline font-semibold text-primary text-lg flex items-center gap-4">
                                                    <Sparkles className="w-6 h-6"/>
                                                    <span>Mantra Details / मन्त्र विवरण</span>
                                                </AccordionTrigger>
                                                <AccordionContent className="p-4">
                                                    <Accordion type="single" collapsible className="w-full space-y-2">
                                                        {selectedDeity.mantras.map((mantra, index) => (
                                                            <AccordionItem key={index} value={`item-${index}`} className="border-b-0 rounded-lg overflow-hidden bg-background/50">
                                                                <AccordionTrigger className="p-4 hover:no-underline font-semibold text-base">
                                                                    <div className="text-left">
                                                                        <p className="devanagari">{mantra.name}</p>
                                                                        <p className="text-xs text-muted-foreground font-normal italic">{mantra.transliteration.split('\n')[0]}</p>
                                                                    </div>
                                                                </AccordionTrigger>
                                                                <AccordionContent className="px-4 pb-4">
                                                                    <div className="relative p-4 border border-primary/20 rounded-lg bg-primary/5 mt-4">
                                                                        <h3 className="font-bold text-primary mb-2 devanagari">Original Mantra (Sanskrit) / मूल मन्त्र (संस्कृत)</h3>
                                                                        <p className="whitespace-pre-wrap text-xl text-center font-extrabold text-glow-accent devanagari py-2 leading-relaxed">{mantra.sanskrit}</p>
                                                                        <p className="text-center text-muted-foreground italic">{mantra.transliteration}</p>
                                                                        <div className="absolute top-2 right-2 flex gap-1">
                                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-foreground/70 hover:bg-accent" onClick={() => speakText(mantra.sanskrit, 'hi-IN')}>
                                                                                <Volume2 className="h-5 w-5" />
                                                                            </Button>
                                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-foreground/70 hover:bg-accent" onClick={() => handleCopy(mantra.sanskrit, `sanskrit-${index}`)}>
                                                                                {copiedStates[`sanskrit-${index}`] ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                    <div className="relative p-4 border border-primary/20 rounded-lg bg-primary/5 mt-4">
                                                                        <h3 className="font-bold text-primary mb-2 devanagari">Nepali Meaning (नेपाली अर्थ)</h3>
                                                                        <p className="whitespace-pre-wrap leading-relaxed devanagari text-foreground font-medium">{mantra.nepaliMeaning}</p>
                                                                        <div className="absolute top-2 right-2 flex gap-1">
                                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-foreground/70 hover:bg-accent" onClick={() => speakText(mantra.nepaliMeaning, 'ne-NP')}>
                                                                                <Volume2 className="h-5 w-5" />
                                                                            </Button>
                                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-foreground/70 hover:bg-accent" onClick={() => handleCopy(mantra.nepaliMeaning, `nepali-${index}`)}>
                                                                                {copiedStates[`nepali-${index}`] ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                    <div className="relative p-4 border border-primary/20 rounded-lg bg-primary/5 mt-4">
                                                                        <h3 className="font-bold text-primary mb-2 devanagari">English Meaning / अंग्रेजी अर्थ</h3>
                                                                        <p className="whitespace-pre-wrap leading-relaxed text-foreground font-medium">{mantra.englishMeaning}</p>
                                                                        <div className="absolute top-2 right-2 flex gap-1">
                                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-foreground/70 hover:bg-accent" onClick={() => speakText(mantra.englishMeaning, 'en-US')}>
                                                                                <Volume2 className="h-5 w-5" />
                                                                            </Button>
                                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-foreground/70 hover:bg-accent" onClick={() => handleCopy(mantra.englishMeaning, `english-${index}`)}>
                                                                                {copiedStates[`english-${index}`] ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </AccordionContent>
                                                            </AccordionItem>
                                                        ))}
                                                    </Accordion>
                                                </AccordionContent>
                                            </AccordionItem>

                                            <AccordionItem value="origin" className="border-b-0 rounded-lg overflow-hidden glass-card">
                                                <AccordionTrigger className="p-4 hover:no-underline font-semibold text-primary text-lg flex items-center gap-4">
                                                    <BookOpen className="w-6 h-6"/>
                                                    <span>Origin Story / उत्पत्ति कथा</span>
                                                </AccordionTrigger>
                                                <AccordionContent className="p-4">
                                                     <div className="relative">
                                                        <div className="absolute top-0 right-0 flex gap-1 z-10">
                                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => speakText(selectedDeity.originStory || '', 'ne-NP')}>
                                                                <Volume2 className="h-5 w-5" />
                                                            </Button>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleCopy(selectedDeity.originStory || '', 'origin-nepali')}>
                                                                {copiedStates['origin-nepali'] ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                                                            </Button>
                                                        </div>
                                                        <ScrollArea className="h-[60vh] text-base">
                                                            <p className="whitespace-pre-wrap leading-relaxed devanagari p-2 text-foreground font-medium" style={{color: 'darkgoldenrod'}}>{selectedDeity.originStory || 'Information not available.'}</p>
                                                            {selectedDeity.originStoryEnglish && (
                                                                <>
                                                                    <Separator className="my-4 bg-border"/>
                                                                    <div className="relative">
                                                                         <div className="absolute top-0 right-0 flex gap-1 z-10">
                                                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => speakText(selectedDeity.originStoryEnglish || '', 'en-US')}>
                                                                                <Volume2 className="h-5 w-5" />
                                                                            </Button>
                                                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleCopy(selectedDeity.originStoryEnglish || '', 'origin-english')}>
                                                                                {copiedStates['origin-english'] ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                                                                            </Button>
                                                                        </div>
                                                                        <h3 className="font-bold text-primary mb-2 text-xl">Origin Story (English)</h3>
                                                                        <p className="whitespace-pre-wrap leading-relaxed p-2 text-foreground font-medium">{selectedDeity.originStoryEnglish}</p>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </ScrollArea>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                            
                                            {selectedDeity.aarti && (
                                                 <AccordionItem value="aarti" className="border-b-0 rounded-lg overflow-hidden glass-card">
                                                    <AccordionTrigger className="p-4 hover:no-underline font-semibold text-primary text-lg flex items-center gap-4">
                                                        <Star className="w-6 h-6"/>
                                                        <span>Aarti / आरती</span>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="p-4">
                                                        <div className="relative">
                                                            <div className="absolute top-0 right-0 flex gap-1 z-10">
                                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => speakText(selectedDeity.aarti || '', 'hi-IN')}>
                                                                    <Volume2 className="h-5 w-5" />
                                                                </Button>
                                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleCopy(selectedDeity.aarti || '', 'aarti-hindi')}>
                                                                    {copiedStates['aarti-hindi'] ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                                                                </Button>
                                                            </div>
                                                            <ScrollArea className="h-[60vh]">
                                                                <p className="whitespace-pre-wrap leading-relaxed devanagari p-2 text-foreground font-medium" style={{color: 'darkgoldenrod'}}>{selectedDeity.aarti}</p>
                                                                {selectedDeity.aartiEnglish && (
                                                                    <>
                                                                        <Separator className="my-4 bg-border" />
                                                                        <div className="relative">
                                                                            <div className="absolute top-0 right-0 flex gap-1 z-10">
                                                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => speakText(selectedDeity.aartiEnglish || '', 'en-US')}>
                                                                                    <Volume2 className="h-5 w-5" />
                                                                                </Button>
                                                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleCopy(selectedDeity.aartiEnglish || '', 'aarti-english')}>
                                                                                    {copiedStates['aarti-english'] ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                                                                                </Button>
                                                                            </div>
                                                                            <h3 className="font-bold text-primary mb-2 text-xl">Aarti (Transliteration)</h3>
                                                                            <p className="whitespace-pre-wrap leading-relaxed p-2 text-muted-foreground font-medium italic">{selectedDeity.aartiEnglish}</p>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </ScrollArea>
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            )}
                                        </Accordion>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="library" className="mt-6">
                         {readingBookKey ? (
                            readingBookKey === 'shivaPurana' ? (
                                <ShivaPuranaReader onBack={() => setReadingBookKey(null)} />
                            ) : (
                                <BookReader bookKey={readingBookKey} onBack={() => setReadingBookKey(null)} />
                            )
                        ) : (
                            <Card className="glass-card">
                                <CardHeader>
                                    <CardTitle className="text-center text-3xl font-bold devanagari" style={{fontSize: '2.5rem'}}>ग्रन्थालय (Library)</CardTitle>
                                    <div className="relative mt-6 max-w-lg mx-auto">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input 
                                            placeholder="Search in library..." 
                                            className="pl-10 h-12"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Tabs value={activeLibraryTab} onValueChange={setActiveLibraryTab} className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 rounded-lg bg-background/50 p-2 border-2 border-amber-800/30 h-auto">
                                            {bookCategories.map(category => (
                                                <TabsTrigger 
                                                    key={category.id} 
                                                    value={category.id} 
                                                    className="text-base py-3 font-bold devanagari flex flex-col items-center gap-2 rounded-md data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-600 data-[state=active]:to-red-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:ring-2 data-[state=active]:ring-amber-400 h-full"
                                                >
                                                    <category.icon className="w-8 h-8"/>
                                                    <div className="text-center">
                                                        <span>{category.name}</span>
                                                        <span className="text-xs block">({category.nepaliDescription})</span>
                                                    </div>
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                        <TabsContent value={activeLibraryTab} className="p-4 mt-8 border-t border-amber-800/50">
                                            {filteredBooks(activeLibraryTab).length > 0 ? renderBookGrid(filteredBooks(activeLibraryTab)) : (
                                                <p className="text-muted-foreground text-center py-8">No books found for this category.</p>
                                            )}
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </main>
            <LandingFooter onNavigate={handleNavigate} />
        </div>
    );
}