
'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Image from 'next/image';
import { Coffee, X, Mail, Phone, Send, Wallet, Landmark, Info as InfoIcon, ArrowLeft, Hash, ShieldCheck, Zap } from 'lucide-react';
import { Button } from './button';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialView?: 'esewa' | 'khalti' | 'global' | 'paypal' | 'bmac' | 'usdt' | string | null;
}

const PaymentOptionBox = ({ href, onClick, children }: { href?: string, onClick?: () => void, children: React.ReactNode }) => {
    const commonProps = {
        className: "flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-muted/40 h-full w-full transition-all duration-300 hover:bg-muted/80 group"
    };

    const wrapperClassName = cn(
        "relative p-[1px] rounded-[1.3rem] overflow-hidden transition-all duration-300 border border-border/50",
        "hover:border-primary/50 hover:shadow-[0_10px_25px_rgba(0,229,255,0.1)] active:scale-95"
    );

    if (href) {
        return (
            <div className={wrapperClassName}>
                <a href={href} target="_blank" rel="noopener noreferrer" {...commonProps}>
                    {children}
                </a>
            </div>
        );
    }
    return (
        <div className={wrapperClassName}>
            <button onClick={onClick} {...commonProps}>
                {children}
            </button>
        </div>
    );
};


export function ContactDialog({ open, onOpenChange, initialView = null }: ContactDialogProps) {
  const [activeTab, setActiveTab] = useState('nepal');
  const [qrDetails, setQrDetails] = useState<{ title: string; image: string; address?: string; chain?: string; details?: string } | null>(null);
  
  const firestore = useFirestore();
  const configRef = useMemoFirebase(() => doc(firestore, 'systemConfig', 'global'), [firestore]);
  const { data: config } = useDoc(configRef);

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
        setQrDetails(null);
        setActiveTab('nepal');
    }, 300);
  };
  
  const showQrFor = (paymentType: string) => {
      if (!config) return;

      if (paymentType === 'esewa') {
          setQrDetails({ title: "eSewa QR", image: config.esewaQrUrl || "https://i.imgur.com/3c4tGf3.png" });
      } else if (paymentType === 'khalti') {
          setQrDetails({ title: "Khalti QR", image: config.khaltiQrUrl || "https://i.imgur.com/0Yi0XPc.png" });
      } else if (paymentType === 'global') {
          setQrDetails({ title: config.bankName || "Bank QR", image: config.bankQrUrl || "https://i.imgur.com/1cIK64b.png", address: config.bankAccountNumber || config.bankHolder, details: `Holder: ${config.bankHolder}\nBranch: ${config.bankBranch}` });
      } else if (paymentType.startsWith('bank_')) {
          const bankIndex = parseInt(paymentType.split('_')[1]);
          const bank = config.bankAssets?.[bankIndex];
          if (bank) {
              setQrDetails({ 
                  title: `${bank.bankName} QR`, 
                  image: bank.bankQrUrl || "https://i.imgur.com/1cIK64b.png", 
                  address: bank.accountNumber,
                  details: `Holder: ${bank.accountHolder}\nSWIFT: ${bank.swiftCode}\nBranch: ${bank.bankBranch}`
              });
          }
      } else {
          // Dynamic Crypto Assets
          const asset = config.cryptoAssets?.find((a: any) => a.coin === paymentType);
          if (asset) {
              setQrDetails({ title: `${asset.coin} (${asset.chain}) QR`, image: asset.qrUrl || "https://i.imgur.com/jY14yAm.png", address: asset.address, chain: asset.chain });
          }
      }
  };

  useEffect(() => {
    if (open && initialView) {
        if (['esewa', 'khalti', 'global'].includes(initialView) || initialView.startsWith('bank_')) {
            setActiveTab('nepal');
            showQrFor(initialView);
        } else if (initialView === 'paypal' || initialView === 'bmac') {
            setActiveTab('international');
            setQrDetails(null);
        } else {
            const asset = config?.cryptoAssets?.find((a: any) => a.coin === initialView);
            if (asset) {
                setActiveTab('international');
                showQrFor(initialView);
            }
        }
    }
  }, [open, initialView, config]);


  const renderDescription = () => {
    if (qrDetails) {
        return (
            <div className="text-center space-y-5 animate-in fade-in slide-in-from-bottom-2">
                <p className="text-muted-foreground text-sm font-medium">Scan to process payment via {qrDetails.title.replace(" QR", "")}.</p>
                
                {qrDetails.address && (
                    <div className="space-y-1.5 max-w-[300px] mx-auto">
                      <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">{qrDetails.chain ? 'Wallet Address' : 'Account Number'}</p>
                      <div className="group relative">
                        <p className="text-[13px] font-mono break-all bg-muted border border-border p-4 rounded-2xl select-all whitespace-pre-wrap leading-relaxed shadow-inner">
                            {qrDetails.address}
                        </p>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black uppercase">Click to Copy</Badge>
                        </div>
                      </div>
                    </div>
                )}

                {qrDetails.details && (
                    <div className="space-y-1 max-w-[300px] mx-auto text-left">
                      <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest pl-2">Security Details</p>
                      <div className="text-[10px] font-bold text-muted-foreground bg-muted/50 p-4 rounded-2xl border border-border/50 whitespace-pre-wrap leading-relaxed">
                        {qrDetails.details}
                      </div>
                    </div>
                )}

                <div className="bg-primary/5 border border-primary/20 p-5 rounded-[2rem] space-y-3 shadow-xl">
                    <p className="text-xs font-black text-primary flex items-center justify-center gap-2 uppercase tracking-[0.2em]">
                        <Zap className="h-3.5 w-3.5" /> Next Steps
                    </p>
                    <p className="text-sm font-black text-foreground leading-tight px-4">
                        भुक्तानी गरेपछि कृपया स्क्रिनसट ह्वाट्सएपमा पठाउनुहोस्।
                    </p>
                    <Separator className="bg-primary/10 mx-auto w-1/2" />
                    <p className="text-[10px] text-muted-foreground font-bold leading-relaxed px-2">
                        After verification, your verified document will be dispatched to your email within 5-10 minutes.
                    </p>
                </div>
            </div>
        )
    }
    return (
        <AlertDialogDescription asChild>
            <div className="text-muted-foreground pt-3 text-sm text-center font-medium leading-relaxed">
                 <p className="px-6">
                    Our platform is free for everyone. Any contribution helps maintain our high-resolution AI nodes and add more professional tools.
                </p>
                 <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] pt-6 flex items-center justify-center gap-2">
                    <ShieldCheck className="h-3 w-3 text-primary" /> Encrypted & Secure Processing
                </p>
            </div>
        </AlertDialogDescription>
    );
  }

  const renderContent = () => {
      if (qrDetails) {
          return (
            <div className="flex flex-col items-center w-full">
                <AlertDialogTitle className="text-2xl text-foreground font-black tracking-tighter uppercase italic leading-none mb-2">
                   {qrDetails.title}
               </AlertDialogTitle>
               <div className="relative my-6 p-4 bg-white rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.5)] ring-1 ring-black/5">
                    <Image src={qrDetails.image} alt={qrDetails.title} width={260} height={260} className="rounded-2xl object-contain" />
               </div>
               {renderDescription()}
           </div>
          );
      }

      return (
          <>
            <div className="flex justify-center mb-6">
                <div className="relative">
                    <Image 
                        src="https://i.imgur.com/KWh3A5y.png"
                        alt="Udaya Raj's Profile"
                        width={100}
                        height={100}
                        className="rounded-full border-4 border-primary/20 shadow-2xl"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-green-500 h-4 w-4 rounded-full border-4 border-zinc-950 animate-pulse"></div>
                </div>
            </div>
            <AlertDialogTitle className="text-3xl text-foreground font-black tracking-tighter uppercase italic leading-none mb-1">
                Support & Contact
            </AlertDialogTitle>
            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-primary mb-4">Official OmniTools Hub</p>
            
            {renderDescription()}
            
             <div className="grid grid-cols-1 gap-3 pt-8 w-full max-w-sm mx-auto">
                <a href={`mailto:${config?.supportEmail || 'omnitoolsai@gmail.com'}`} className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl border border-border group hover:bg-muted transition-all">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform"><Mail className="w-4 h-4" /></div>
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-500 group-hover:text-foreground">Support Email</span>
                    </div>
                    <span className="text-xs font-bold text-primary">{config?.supportEmail || 'omnitoolsai@gmail.com'}</span>
                </a>
                
                <a href="https://wa.me/971567067618" target="_blank" className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl border border-border group hover:bg-muted transition-all">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform"><Send className="w-4 h-4" /></div>
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-500 group-hover:text-foreground">WhatsApp Hub</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-500">+971 56 706 7618</span>
                </a>

                <a href="tel:+9779864353535" className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl border border-border group hover:bg-muted transition-all">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform"><Phone className="w-4 h-4" /></div>
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-500 group-hover:text-foreground">Nepal Hotline</span>
                    </div>
                    <span className="text-xs font-bold text-amber-500">+977 986 435 3535</span>
                </a>
            </div>
            
            <div className="my-8 w-full">
                <Tabs defaultValue="nepal" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-muted h-14 p-1 rounded-2xl border border-border shadow-inner">
                        <TabsTrigger value="nepal" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black font-black uppercase text-[10px] tracking-widest">Nepal Nodes</TabsTrigger>
                        <TabsTrigger value="international" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-black font-black uppercase text-[10px] tracking-widest">Global Nodes</TabsTrigger>
                    </TabsList>
                    <TabsContent value="nepal" className="mt-8">
                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {config?.esewaActive !== false && (
                                <PaymentOptionBox onClick={() => showQrFor('esewa')}>
                                    <Image src="https://i.imgur.com/robpgw7.png" alt="eSewa" width={60} height={30} className="object-contain group-hover:scale-110 transition-transform"/>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-foreground">eSewa</span>
                                </PaymentOptionBox>
                            )}
                            {config?.khaltiActive !== false && (
                                <PaymentOptionBox onClick={() => showQrFor('khalti')}>
                                    <Image src="https://i.imgur.com/YJP9q4j.png" alt="Khalti" width={70} height={30} className="object-contain group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-foreground">Khalti</span>
                                </PaymentOptionBox>
                            )}
                            {config?.bankAssets?.map((bank: any, i: number) => (
                                <PaymentOptionBox key={i} onClick={() => showQrFor(`bank_${i}`)}>
                                    <Landmark className="w-7 h-7 text-amber-500/80 group-hover:scale-110 transition-transform" />
                                    <div className="text-center overflow-hidden">
                                        <span className="text-[9px] font-black text-foreground uppercase leading-none block mb-1 truncate">{bank.bankName}</span>
                                        <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-tighter">{bank.swiftCode}</span>
                                    </div>
                                </PaymentOptionBox>
                            ))}
                            {config?.globalImeActive !== false && (!config?.bankAssets || config.bankAssets.length === 0) && (
                                <PaymentOptionBox onClick={() => showQrFor('global')}>
                                    <Landmark className="w-7 h-7 text-amber-500/80" />
                                    <span className="text-[10px] font-black uppercase text-zinc-500">Bank Pay</span>
                                </PaymentOptionBox>
                            )}
                        </div>
                        <div className="mt-8 border border-border bg-muted/30 p-6 rounded-[2rem] text-center shadow-inner relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-3 opacity-10"><Hash className="w-12 h-12" /></div>
                           <p className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.3em] mb-2">Direct Payment ID</p>
                           <p className="text-2xl font-black text-foreground tracking-widest italic select-all">
                                {config?.esewaId || '+977 9864353535'}
                            </p>
                            <div className="flex justify-center items-center gap-6 mt-4">
                                <a href="https://esewa.com.np" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase text-primary hover:underline underline-offset-4">Open eSewa App</a>
                                <a href="https://khalti.com" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase text-primary hover:underline underline-offset-4">Open Khalti App</a>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="international" className="mt-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {config?.paypalActive !== false && (
                                <PaymentOptionBox href={config?.paypalId ? `https://www.paypal.com/paypalme/${config.paypalId}` : 'https://www.paypal.com/paypalme/UdayaRaj35'}>
                                    <Image src="https://www.paypalobjects.com/webstatic/mktg/logo/bdg_now_accepting_pp_2line_w.png" alt="PayPal" width={120} height={60} className="object-contain group-hover:scale-105 transition-transform" />
                                    <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">PayPal Node</span>
                                </PaymentOptionBox>
                            )}
                            {config?.bmacActive !== false && (
                                <PaymentOptionBox href={config?.bmacId ? `https://buymeacoffee.com/${config.bmacId}` : 'https://buymeacoffee.com/udayaraj'}>
                                    <div className="flex items-center gap-3">
                                        <Coffee className="h-8 w-8 text-yellow-500 group-hover:rotate-12 transition-transform" />
                                        <span className="text-lg font-black text-foreground uppercase italic tracking-tighter">Buy Coffee</span>
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Optional Support</span>
                                </PaymentOptionBox>
                            )}
                        </div>
                         <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {config?.cryptoAssets?.map((asset: any, i: number) => (
                                <PaymentOptionBox key={i} onClick={() => showQrFor(asset.coin)}>
                                    <Wallet className="w-7 h-7 text-emerald-500 group-hover:scale-110 transition-transform" />
                                    <div className="text-center">
                                        <span className="text-xs font-black text-foreground uppercase italic leading-none block mb-1">{asset.coin}</span>
                                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter">{asset.chain}</span>
                                    </div>
                                </PaymentOptionBox>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
            
            <div className="mt-4 w-full">
                <a href="https://hostinger.com?REFERRALCODE=XQIUDAYARNHQ" target="_blank" rel="noopener noreferrer" className="flex items-center gap-5 group p-5 rounded-[2rem] bg-zinc-900 border border-white/5 hover:border-primary/30 transition-all shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full"></div>
                    <div className="bg-white/10 p-3 rounded-2xl shrink-0"><Image src="https://hpanel.hostinger.com/assets/images/logos/hostinger-black.svg" alt="Hostinger" width={100} height={20} className="invert transition-transform group-hover:scale-110" /></div>
                    <div className="text-left relative z-10 flex-1">
                        <p className="font-black text-[10px] uppercase text-primary tracking-[0.2em] mb-1">Architect Special</p>
                        <p className="text-[11px] text-zinc-400 font-bold leading-tight">Secure your domain today. Refer and earn up to US$ 450.</p>
                    </div>
                </a>
            </div>
          </>
      );
  }

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="glass-card border-border bg-background text-foreground rounded-[3.5rem] p-10 max-w-lg shadow-[0_50px_100px_rgba(0,0,0,0.2)] max-h-[90vh] overflow-y-auto custom-scrollbar">
        <AlertDialogHeader className="text-center items-center">
            {renderContent()}
        </AlertDialogHeader>
        
        <AlertDialogFooter className="sm:justify-center mt-8 gap-4">
            {qrDetails ? (
                 <Button variant="outline" onClick={() => setQrDetails(null)} className="h-14 px-10 rounded-2xl font-black uppercase text-xs tracking-widest text-muted-foreground border-border hover:bg-muted group">
                    <ArrowLeft className="mr-3 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Previous Screen
                 </Button>
            ) : (
                <Button onClick={handleClose} variant="ghost" className="h-12 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest text-zinc-500 hover:text-foreground hover:bg-muted/50">
                    Exit Workspace
                </Button>
            )}
        </AlertDialogFooter>
        <button onClick={handleClose} aria-label="Close" className="absolute right-8 top-8 rounded-full p-2.5 bg-muted/50 border border-border opacity-70 transition-all hover:opacity-100 hover:bg-muted hover:scale-110">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
        </button>
      </AlertDialogContent>
    </AlertDialog>
  );
}
