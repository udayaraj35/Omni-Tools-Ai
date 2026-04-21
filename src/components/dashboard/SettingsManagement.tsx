'use client';
import React, { useState, useEffect } from 'react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Loader2, Save, Cpu, Globe, ShieldCheck, Zap, 
    Server, Lock, Wallet, Landmark, CreditCard, 
    MessageSquare, AlertCircle, Key, X, Coffee, 
    Terminal, CheckCircle2, BadgeCheck, Mail, Plus, Trash2, Hash, Eye, EyeOff
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface CryptoAsset {
    coin: string;
    chain: string;
    address: string;
    qrUrl: string;
}

interface BankAsset {
    bankName: string;
    accountHolder: string;
    accountNumber: string;
    swiftCode: string;
    bankBranch: string;
    bankQrUrl: string;
}

interface SettingsManagementProps {
    mode?: 'ai' | 'payment';
}

const SettingsManagement = ({ mode }: SettingsManagementProps) => {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [isSaving, setIsSaving] = useState<string | null>(null);
    const [showAiKey, setShowAiKey] = useState(false);
    const [showStripeSecret, setShowStripeSecret] = useState(false);

    // Fetch Global System Config
    const configRef = useMemoFirebase(() => doc(firestore, 'systemConfig', 'global'), [firestore]);
    const { data: config, isLoading } = useDoc(configRef);

    const [formState, setFormState] = useState({
        aiModel: 'gemini-1.5-flash',
        aiTemperature: '0.7',
        googleAiKey: '',
        maintenanceMode: false,
        esewaActive: true,
        khaltiActive: true,
        globalImeActive: true,
        paypalActive: true,
        bmacActive: true,
        stripeActive: false,
        masterPrompt: '',
        supportEmail: 'omnitoolsai@gmail.com',
        paypalId: '',
        bmacId: '',
        stripePublicKey: '',
        stripeSecretKey: '',
        cryptoAssets: [] as CryptoAsset[],
        bankAssets: [] as BankAsset[],
        esewaId: '',
        esewaQrUrl: '',
        khaltiId: '',
        khaltiQrUrl: ''
    });

    useEffect(() => {
        if (config) {
            setFormState({
                aiModel: config.aiModel || 'gemini-1.5-flash',
                aiTemperature: String(config.aiTemperature || '0.7'),
                googleAiKey: config.googleAiKey || '',
                maintenanceMode: !!config.maintenanceMode,
                esewaActive: config.esewaActive !== false,
                khaltiActive: config.khaltiActive !== false,
                globalImeActive: config.globalImeActive !== false,
                paypalActive: config.paypalActive !== false,
                bmacActive: config.bmacActive !== false,
                stripeActive: !!config.stripeActive,
                masterPrompt: config.masterPrompt || '',
                supportEmail: config.supportEmail || 'omnitoolsai@gmail.com',
                paypalId: config.paypalId || '',
                bmacId: config.bmacId || '',
                stripePublicKey: config.stripePublicKey || '',
                stripeSecretKey: config.stripeSecretKey || '',
                cryptoAssets: config.cryptoAssets || [],
                bankAssets: config.bankAssets || [],
                esewaId: config.esewaId || '',
                esewaQrUrl: config.esewaQrUrl || '',
                khaltiId: config.khaltiId || '',
                khaltiQrUrl: config.khaltiQrUrl || ''
            });
        }
    }, [config]);

    const handleSaveSection = async (sectionId: string, fields: string[]) => {
        setIsSaving(sectionId);
        try {
            const updateData: any = {};
            fields.forEach(field => {
                if (field === 'aiTemperature') {
                    updateData[field] = parseFloat(formState.aiTemperature);
                } else {
                    updateData[field] = (formState as any)[field];
                }
            });
            updateData.updatedAt = new Date().toISOString();

            await setDoc(configRef, updateData, { merge: true });
            toast({ title: "Configuration Synchronized", description: `Cluster [${sectionId.toUpperCase()}] updated successfully.` });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Sync Failed", description: error.message });
        } finally {
            setIsSaving(null);
        }
    };

    const addCryptoAsset = () => {
        setFormState(prev => ({
            ...prev,
            cryptoAssets: [...prev.cryptoAssets, { coin: 'USDT', chain: 'TRC20', address: '', qrUrl: '' }]
        }));
    };

    const removeCryptoAsset = (index: number) => {
        setFormState(prev => ({
            ...prev,
            cryptoAssets: prev.cryptoAssets.filter((_, i) => i !== index)
        }));
    };

    const updateCryptoAsset = (index: number, field: keyof CryptoAsset, value: string) => {
        const newAssets = [...formState.cryptoAssets];
        newAssets[index] = { ...newAssets[index], [field]: value };
        setFormState(prev => ({ ...prev, cryptoAssets: newAssets }));
    };

    const addBankAsset = () => {
        setFormState(prev => ({
            ...prev,
            bankAssets: [...prev.bankAssets, { bankName: '', accountHolder: '', accountNumber: '', swiftCode: '', bankBranch: '', bankQrUrl: '' }]
        }));
    };

    const removeBankAsset = (index: number) => {
        setFormState(prev => ({
            ...prev,
            bankAssets: prev.bankAssets.filter((_, i) => i !== index)
        }));
    };

    const updateBankAsset = (index: number, field: keyof BankAsset, value: string) => {
        const newAssets = [...formState.bankAssets];
        newAssets[index] = { ...newAssets[index], [field]: value };
        setFormState(prev => ({ ...prev, bankAssets: newAssets }));
    };

    if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary opacity-20"/></div>;

    const renderAiSection = () => (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <Card className="glass-card border-white/5 bg-zinc-900/40 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <CardHeader className="p-10 border-b border-white/5 bg-white/5">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-4">
                                <Cpu className="h-7 w-7 text-primary" /> Neural Logic Engine
                            </CardTitle>
                            <CardDescription className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Adjust the fundamental behavior of the platform's AI nodes.</CardDescription>
                        </div>
                        <Badge className="bg-primary text-black font-black uppercase text-[10px] px-4 py-1">V2 Inference</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2"><Server className="w-3 h-3"/> Preferred Inference Model</Label>
                                <Select value={formState.aiModel} onValueChange={v => setFormState({...formState, aiModel: v})}>
                                    <SelectTrigger className="h-14 bg-black/40 border-white/10 rounded-2xl text-sm font-bold"><SelectValue/></SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                        <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash (Latency Optimized)</SelectItem>
                                        <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro (Accuracy Optimized)</SelectItem>
                                        <SelectItem value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Advanced Experimental)</SelectItem>
                                        <SelectItem value="gemini-1.0-pro">Gemini 1.0 Pro (Standard)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                    <Key className="w-3 h-3 text-primary"/> Manual Google AI API Key
                                </Label>
                                <div className="relative">
                                    <Input 
                                        type={showAiKey ? "text" : "password"} 
                                        value={formState.googleAiKey} 
                                        onChange={e => setFormState({...formState, googleAiKey: e.target.value})}
                                        placeholder="Paste AI API Key here..."
                                        className="h-14 bg-black/40 border-white/10 rounded-2xl text-sm font-mono pr-12 focus:border-primary" 
                                    />
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                                        onClick={() => setShowAiKey(!showAiKey)}
                                    >
                                        {showAiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2"><Zap className="w-3 h-3"/> Creativity Index (Temperature)</Label>
                                <div className="p-6 bg-black/30 rounded-2xl border border-white/5 space-y-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-zinc-500 uppercase">Current:</span>
                                        <span className="text-2xl font-black text-primary italic">{formState.aiTemperature}</span>
                                    </div>
                                    <Slider 
                                        value={[parseFloat(formState.aiTemperature)]} 
                                        onValueChange={v => setFormState({...formState, aiTemperature: String(v[0])})}
                                        max={1} 
                                        min={0} 
                                        step={0.1}
                                        className="py-4"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2"><MessageSquare className="w-3 h-3"/> Core Persona Prompt</Label>
                        <Textarea 
                            value={formState.masterPrompt}
                            onChange={e => setFormState({...formState, masterPrompt: e.target.value})}
                            placeholder="Define the identity and constraints of OmniTools AI..."
                            className="bg-black/40 border-white/10 rounded-3xl min-h-[200px] p-8 text-base leading-relaxed focus:ring-primary shadow-inner"
                        />
                    </div>

                    <Button 
                        onClick={() => handleSaveSection('ai_engine', ['aiModel', 'googleAiKey', 'aiTemperature', 'masterPrompt'])} 
                        disabled={isSaving === 'ai_engine'} 
                        className="w-full h-16 gradient-button-gold rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-primary/20 transition-all active:scale-95"
                    >
                        {isSaving === 'ai_engine' ? <Loader2 className="animate-spin h-5 w-5" /> : <ShieldCheck className="h-6 w-6 mr-3" />} Commit AI Changes
                    </Button>
                </CardContent>
            </Card>
        </div>
    );

    const renderPaymentSection = () => (
        <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
            {/* 1. MASTER TOGGLES */}
            <Card className="glass-card border-white/5 bg-zinc-900/40 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-white/5 bg-white/5">
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" /> Active Gateway Nodes
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                        {[
                            { id: 'esewaActive', label: 'eSewa', color: 'text-green-500' },
                            { id: 'khaltiActive', label: 'Khalti', color: 'text-purple-500' },
                            { id: 'globalImeActive', label: 'Bank', color: 'text-amber-500' },
                            { id: 'paypalActive', label: 'PayPal', color: 'text-blue-500' },
                            { id: 'bmacActive', label: 'BMAC', color: 'text-yellow-500' },
                            { id: 'stripeActive', label: 'Stripe', color: 'text-indigo-400' },
                        ].map((toggle) => (
                            <div key={toggle.id} className="flex items-center justify-between p-4 bg-black/30 rounded-2xl border border-white/5">
                                <span className={cn("text-[10px] font-black uppercase tracking-widest", toggle.color)}>{toggle.label}</span>
                                <Switch 
                                    checked={(formState as any)[toggle.id]} 
                                    onCheckedChange={v => setFormState({...formState, [toggle.id]: v})} 
                                />
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="p-4 border-t border-white/5 flex justify-end">
                    <Button 
                        size="sm" 
                        onClick={() => handleSaveSection('toggles', ['esewaActive', 'khaltiActive', 'globalImeActive', 'paypalActive', 'bmacActive', 'stripeActive'])} 
                        disabled={isSaving === 'toggles'}
                        className="bg-primary text-black font-black uppercase text-[10px] px-6 h-10 rounded-xl"
                    >
                        {isSaving === 'toggles' ? <Loader2 className="animate-spin h-3 w-3" /> : <Save className="h-3 w-3 mr-2" />} Save Toggles
                    </Button>
                </CardFooter>
            </Card>

            {/* 2. STRIPE CONFIGURATION */}
            <Card className="glass-card border-white/5 bg-zinc-900/40 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-white/5 bg-white/5">
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-indigo-400" /> Stripe Infrastructure
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase text-zinc-500">Stripe Public Key (Publishable)</Label>
                            <div className="relative">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                                <Input value={formState.stripePublicKey} onChange={e => setFormState({...formState, stripePublicKey: e.target.value})} placeholder="pk_live_..." className="pl-12 h-12 bg-black/20 border-white/5 rounded-xl font-mono text-xs" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase text-zinc-500">Stripe Secret Key</Label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                                <Input 
                                    type={showStripeSecret ? "text" : "password"} 
                                    value={formState.stripeSecretKey} 
                                    onChange={e => setFormState({...formState, stripeSecretKey: e.target.value})} 
                                    placeholder="sk_live_..." 
                                    className="pl-12 h-12 bg-black/20 border-white/5 rounded-xl font-mono text-xs pr-12" 
                                />
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                                    onClick={() => setShowStripeSecret(!showStripeSecret)}
                                >
                                    {showStripeSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="p-4 border-t border-white/5 flex justify-end">
                    <Button 
                        size="sm" 
                        onClick={() => handleSaveSection('stripe', ['stripePublicKey', 'stripeSecretKey'])} 
                        disabled={isSaving === 'stripe'}
                        className="bg-primary text-black font-black uppercase text-[10px] px-6 h-10 rounded-xl"
                    >
                        {isSaving === 'stripe' ? <Loader2 className="animate-spin h-3 w-3" /> : <Save className="h-3 w-3 mr-2" />} Save Stripe Node
                    </Button>
                </CardFooter>
            </Card>

            {/* 3. INTERNATIONAL GATEWAYS */}
            <Card className="glass-card border-white/5 bg-zinc-900/40 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-white/5 bg-white/5">
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-400" /> International Legacy Accounts
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase text-zinc-500">PayPal User ID</Label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                            <Input value={formState.paypalId} onChange={e => setFormState({...formState, paypalId: e.target.value})} className="pl-12 h-12 bg-black/20 border-white/5 rounded-xl font-bold" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase text-zinc-500">BuyMeACoffee ID</Label>
                        <div className="relative">
                            <Coffee className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                            <Input value={formState.bmacId} onChange={e => setFormState({...formState, bmacId: e.target.value})} className="pl-12 h-12 bg-black/20 border-white/5 rounded-xl font-bold" />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="p-4 border-t border-white/5 flex justify-end">
                    <Button 
                        size="sm" 
                        onClick={() => handleSaveSection('international', ['paypalId', 'bmacId'])} 
                        disabled={isSaving === 'international'}
                        className="bg-primary text-black font-black uppercase text-[10px] px-6 h-10 rounded-xl"
                    >
                        {isSaving === 'international' ? <Loader2 className="animate-spin h-3 w-3" /> : <Save className="h-3 w-3 mr-2" />} Save International
                    </Button>
                </CardFooter>
            </Card>

            {/* 4. DYNAMIC CRYPTO ASSETS */}
            <Card className="glass-card border-white/5 bg-zinc-900/40 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-white/5 bg-white/5">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-cyan-400" /> Crypto Asset Registry
                        </CardTitle>
                        <Button onClick={addCryptoAsset} size="sm" variant="outline" className="h-9 rounded-xl border-cyan-400/30 text-cyan-400 font-black uppercase text-[9px]">
                            <Plus className="h-3 w-3 mr-1.5" /> Add New Asset
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    {formState.cryptoAssets.length === 0 && (
                        <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-2xl opacity-20">
                            <p className="text-[10px] font-black uppercase tracking-widest">No Crypto Nodes Mapped</p>
                        </div>
                    )}
                    {formState.cryptoAssets.map((asset, index) => (
                        <div key={index} className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-6 bg-black/30 rounded-2xl border border-white/5 relative group">
                            <div className="space-y-2">
                                <Label className="text-[8px] font-black text-zinc-600 uppercase">Coin</Label>
                                <Input value={asset.coin} onChange={e => updateCryptoAsset(index, 'coin', e.target.value.toUpperCase())} className="h-10 bg-zinc-900 border-white/5 rounded-lg font-bold" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[8px] font-black text-zinc-600 uppercase">Chain</Label>
                                <Input value={asset.chain} onChange={e => updateCryptoAsset(index, 'chain', e.target.value.toUpperCase())} className="h-10 bg-zinc-900 border-white/5 rounded-lg font-bold" />
                            </div>
                            <div className="space-y-2 lg:col-span-2">
                                <Label className="text-[8px] font-black text-zinc-600 uppercase">Wallet Address</Label>
                                <div className="flex gap-2">
                                    <Input value={asset.address} onChange={e => updateCryptoAsset(index, 'address', e.target.value)} className="h-10 bg-zinc-900 border-white/5 rounded-lg font-mono text-[10px]" />
                                    <Button size="icon" variant="destructive" className="h-10 w-10 shrink-0" onClick={() => removeCryptoAsset(index)}><Trash2 className="h-4 w-4"/></Button>
                                </div>
                            </div>
                            <div className="lg:col-span-4 space-y-2">
                                <Label className="text-[8px] font-black text-zinc-600 uppercase">QR Image URL (Optional)</Label>
                                <Input value={asset.qrUrl} onChange={e => updateCryptoAsset(index, 'qrUrl', e.target.value)} placeholder="https://..." className="h-10 bg-zinc-900 border-white/5 rounded-lg text-[9px]" />
                            </div>
                        </div>
                    ))}
                </CardContent>
                <CardFooter className="p-4 border-t border-white/5 flex justify-end">
                    <Button 
                        size="sm" 
                        onClick={() => handleSaveSection('crypto', ['cryptoAssets'])} 
                        disabled={isSaving === 'crypto'}
                        className="bg-primary text-black font-black uppercase text-[10px] px-6 h-10 rounded-xl"
                    >
                        {isSaving === 'crypto' ? <Loader2 className="animate-spin h-3 w-3" /> : <Save className="h-3 w-3 mr-2" />} Save Crypto Node
                    </Button>
                </CardFooter>
            </Card>

            {/* 5. BANKING NODES */}
            <Card className="glass-card border-white/5 bg-zinc-900/40 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-white/5 bg-white/5">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <Landmark className="w-4 h-4 text-amber-400" /> Institutional Banking Registry
                        </CardTitle>
                        <Button onClick={addBankAsset} size="sm" variant="outline" className="h-9 rounded-xl border-amber-400/30 text-amber-400 font-black uppercase text-[9px]">
                            <Plus className="h-3 w-3 mr-1.5" /> Add New Bank
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-8 space-y-10">
                    {formState.bankAssets.length === 0 && (
                        <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-2xl opacity-20">
                            <p className="text-[10px] font-black uppercase tracking-widest">No Banking Nodes Configured</p>
                        </div>
                    )}
                    {formState.bankAssets.map((bank, index) => (
                        <div key={index} className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-8 bg-black/30 rounded-[2rem] border border-white/5 relative group shadow-inner">
                            <div className="space-y-2">
                                <Label className="text-[8px] font-black uppercase text-zinc-600">Bank Name</Label>
                                <Input value={bank.bankName} onChange={e => updateBankAsset(index, 'bankName', e.target.value)} className="h-11 bg-zinc-900 border-white/5 rounded-xl font-bold" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[8px] font-black uppercase text-zinc-600">Account Holder</Label>
                                <Input value={bank.accountHolder} onChange={e => updateBankAsset(index, 'accountHolder', e.target.value)} className="h-11 bg-zinc-900 border-white/5 rounded-xl font-bold" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[8px] font-black uppercase text-zinc-600 flex items-center gap-1"><Hash className="w-2.5 h-2.5"/> Account Number</Label>
                                <div className="flex gap-2">
                                    <Input value={bank.accountNumber} onChange={e => updateBankAsset(index, 'accountNumber', e.target.value)} className="h-11 bg-zinc-900 border-white/5 rounded-xl font-mono text-xs" />
                                    <Button size="icon" variant="destructive" className="h-11 w-11 shrink-0 rounded-xl" onClick={() => removeBankAsset(index)}><Trash2 className="h-4 w-4"/></Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[8px] font-black uppercase text-zinc-600">SWIFT / BIC Code</Label>
                                <Input value={bank.swiftCode} onChange={e => updateBankAsset(index, 'swiftCode', e.target.value.toUpperCase())} className="h-11 bg-zinc-900 border-white/5 rounded-xl font-mono text-xs" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[8px] font-black uppercase text-zinc-600">Branch Address</Label>
                                <Input value={bank.bankBranch} onChange={e => updateBankAsset(index, 'bankBranch', e.target.value)} className="h-11 bg-zinc-900 border-white/5 rounded-xl text-xs" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[8px] font-black uppercase text-zinc-600">QR Asset Link</Label>
                                <Input value={bank.bankQrUrl} onChange={e => updateBankAsset(index, 'bankQrUrl', e.target.value)} placeholder="https://..." className="h-11 bg-zinc-900 border-white/5 rounded-xl text-[9px]" />
                            </div>
                        </div>
                    ))}
                </CardContent>
                <CardFooter className="p-4 border-t border-white/5 flex justify-end">
                    <Button 
                        size="sm" 
                        onClick={() => handleSaveSection('banks', ['bankAssets'])} 
                        disabled={isSaving === 'banks'}
                        className="bg-primary text-black font-black uppercase text-[10px] px-6 h-10 rounded-xl"
                    >
                        {isSaving === 'banks' ? <Loader2 className="animate-spin h-3 w-3" /> : <Save className="h-3 w-3 mr-2" />} Save Banking Grid
                    </Button>
                </CardFooter>
            </Card>

            {/* 6. LOCAL NP WALLETS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="glass-card border-white/5 bg-zinc-900/40 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 border-b border-white/5 bg-white/5">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-green-500">eSewa Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                        <div className="space-y-2"><Label className="text-[8px] font-black uppercase text-zinc-600">ID / Number</Label><Input value={formState.esewaId} onChange={e => setFormState({...formState, esewaId: e.target.value})} className="h-11 bg-zinc-900 border-white/5 rounded-xl font-bold" /></div>
                        <div className="space-y-2"><Label className="text-[8px] font-black uppercase text-zinc-600">QR Asset Link</Label><Input value={formState.esewaQrUrl} onChange={e => setFormState({...formState, esewaQrUrl: e.target.value})} className="h-11 bg-zinc-900 border-white/5 rounded-xl text-[9px]" /></div>
                    </CardContent>
                    <CardFooter className="p-4 border-t border-white/5 flex justify-end">
                        <Button 
                            size="sm" 
                            onClick={() => handleSaveSection('esewa', ['esewaId', 'esewaQrUrl'])} 
                            disabled={isSaving === 'esewa'}
                            className="bg-primary text-black font-black uppercase text-[10px] px-6 h-10 rounded-xl"
                        >
                            {isSaving === 'esewa' ? <Loader2 className="animate-spin h-3 w-3" /> : <Save className="h-3 w-3 mr-2" />} Save eSewa
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="glass-card border-white/5 bg-zinc-900/40 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 border-b border-white/5 bg-white/5">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-purple-500">Khalti Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                        <div className="space-y-2"><Label className="text-[8px] font-black uppercase text-zinc-600">ID / Number</Label><Input value={formState.khaltiId} onChange={e => setFormState({...formState, khaltiId: e.target.value})} className="h-11 bg-zinc-900 border-white/5 rounded-xl font-bold" /></div>
                        <div className="space-y-2"><Label className="text-[8px] font-black uppercase text-zinc-600">QR Asset Link</Label><Input value={formState.khaltiQrUrl} onChange={e => setFormState({...formState, khaltiQrUrl: e.target.value})} className="h-11 bg-zinc-900 border-white/5 rounded-xl text-[9px]" /></div>
                    </CardContent>
                    <CardFooter className="p-4 border-t border-white/5 flex justify-end">
                        <Button 
                            size="sm" 
                            onClick={() => handleSaveSection('khalti', ['khaltiId', 'khaltiQrUrl'])} 
                            disabled={isSaving === 'khalti'}
                            className="bg-primary text-black font-black uppercase text-[10px] px-6 h-10 rounded-xl"
                        >
                            {isSaving === 'khalti' ? <Loader2 className="animate-spin h-3 w-3" /> : <Save className="h-3 w-3 mr-2" />} Save Khalti
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* 7. INTEGRATION GUIDE */}
            <Card className="glass-card border-white/5 bg-zinc-900/40 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-white/5 bg-white/5">
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-zinc-400" /> Infrastructure Integration Guide
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-2">
                                <BadgeCheck className="w-3 h-3"/> Configured Nodes
                            </h4>
                            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                                Stripe keys and international accounts are now mapped to the system core. You can update these live without redeploying the application.
                            </p>
                            <ul className="space-y-2 text-[9px] font-black uppercase text-zinc-500 tracking-wider">
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500"/> Stripe Public & Secret Keys</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500"/> PayPal & BuyMeACoffee Routing</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500"/> Multi-Coin Crypto Wallet Registry</li>
                                <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500"/> Institutional Bank Mapping</li>
                            </ul>
                        </div>
                        <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-4">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-500" />
                                <span className="text-[10px] font-black uppercase text-amber-500">Security Advisory</span>
                            </div>
                            <p className="text-[10px] text-zinc-500 leading-relaxed font-bold">
                                Manual verification via WhatsApp remains active for all gateways. Ensure you update keys regularly to maintain checkout reliability.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div className="animate-in fade-in slide-in-from-right-2 duration-500">
            {mode === 'ai' ? renderAiSection() : renderPaymentSection()}
        </div>
    );
};

export default SettingsManagement;
