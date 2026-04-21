'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, Search, Clipboard, Check, Save, FileText, Highlighter, Repeat, UserCheck, ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { analyzeAiContent, humanizeText, saveHumanizerHistory } from './actions';
import { useUser } from '@/firebase';
import { ProcessingOverlay } from '@/components/ui/processing-overlay';
import jsPDF from 'jspdf';
import { cn } from '@/lib/utils';
import { trackToolUsage } from '@/lib/tools';

interface AnalysisResult {
    aiScore: number;
    explanation: string;
}

const getDiffHTML = (original: string, modified: string) => {
    if (!original || !modified) return `<p class="whitespace-pre-wrap">${modified}</p>`;

    const originalWords = original.split(/\s+/);
    const modifiedWords = modified.split(/\s+/);
    
    return modifiedWords.map(word => {
        if (originalWords.includes(word)) {
            return `<span>${word} </span>`;
        } else {
            return `<span class="bg-cyan-400/30 px-1 rounded font-bold text-cyan-200">${word} </span>`;
        }
    }).join('');
};

const getHighlightedHTML = (text: string, score: number) => {
    if (!text) return '';
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    return sentences.map((sentence, idx) => {
        const isHighRisk = score > 60 && Math.random() > 0.5;
        const colorClass = isHighRisk ? 'bg-red-500/20 border-b-2 border-red-500/50' : '';
        return `<span key="${idx}" class="${colorClass}">${sentence}</span>`;
    }).join(' ');
};


export default function OmniHumanizerPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useUser();

    const [inputText, setInputText] = useState('');
    const [originalText, setOriginalText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Processing...');
    const [hasCopied, setHasCopied] = useState(false);
    const [isDiffMode, setIsDiffMode] = useState(false);
    const [isHighlightMode, setIsHighlightMode] = useState(false);
    const [detectedLang, setDetectedLang] = useState('en');

    useEffect(() => {
        const lang = /[\u0900-\u097F]/.test(inputText) ? 'ne' : 'en';
        setDetectedLang(lang);
        document.body.classList.toggle('devanagari', lang === 'ne');
        return () => { document.body.classList.remove('devanagari'); }
    }, [inputText]);

    useEffect(() => {
        trackToolUsage('/omnihumanizer');
    }, []);
    
    const handleClearInput = () => {
        setInputText('');
        setOriginalText('');
        setOutputText('');
        setAnalysisResult(null);
        setIsDiffMode(false);
        setIsHighlightMode(false);
        toast({ title: 'Input cleared.' });
    };

    const handleAnalyze = async () => {
        if (!inputText.trim()) {
            toast({ variant: 'destructive', title: 'Input is empty', description: 'Please paste some content to analyze.' });
            return;
        }
        setIsLoading(true);
        setLoadingMessage('Detecting AI patterns...');
        setAnalysisResult(null);
        setOutputText('');
        setIsHighlightMode(false);
        
        try {
            const result = await analyzeAiContent({ text: inputText });
            if ('error' in result) throw new Error(result.error);
            setAnalysisResult(result);
            setOriginalText(inputText);
            setOutputText(inputText); 
            toast({ title: 'Analysis Complete!', description: `AI Score: ${result.aiScore}%` });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Analysis Failed', description: error.message });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleHumanize = async () => {
        if (!inputText.trim()) {
            toast({ variant: 'destructive', title: 'Input is empty', description: 'Please paste some content to humanize.' });
            return;
        }
        setIsLoading(true);
        setLoadingMessage('Humanizing your text...');
        setOriginalText(inputText);
        setIsHighlightMode(false);
        
        try {
            const humanizeResult = await humanizeText({ text: inputText });
            if ('error' in humanizeResult) throw new Error(humanizeResult.error);
            const newText = humanizeResult.humanizedText || '';
            setOutputText(newText);
            
            setLoadingMessage('Re-analyzing for quality...');
            const analysisResult = await analyzeAiContent({ text: newText });
            if ('error' in analysisResult) throw new Error(analysisResult.error);
            setAnalysisResult(analysisResult);
            toast({ title: 'Content Humanized!', description: 'The text has been rewritten to sound more human.' });

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Humanization Failed', description: error.message });
            setOutputText('');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (!outputText.trim()) return;
        navigator.clipboard.writeText(outputText);
        setHasCopied(true);
        toast({ title: 'Copied to clipboard!' });
        setTimeout(() => setHasCopied(false), 2000);
    };

    const handleDownloadPDF = () => {
        if (!outputText) {
            toast({variant: 'destructive', title: 'No text to download'});
            return;
        };
        const doc = new jsPDF();
        const lines = doc.splitTextToSize(outputText, 180);
        doc.text(lines, 15, 20);
        doc.save('humanized-' + new Date().toISOString().slice(0,10) + '.pdf');
    };

    const handleSave = async () => {
        if (!originalText.trim() || !outputText.trim() || !analysisResult) {
            toast({ variant: 'destructive', title: 'Cannot Save', description: 'Please analyze and humanize content first.' });
            return;
        }
        setIsLoading(true);
        setLoadingMessage('Saving to history...');
        try {
            const result = await saveHumanizerHistory({
                inputText: originalText,
                humanizedText: outputText,
                aiScore: analysisResult.aiScore,
                userId: user ? user.uid : 'anonymous'
            });
            if (result.error) throw new Error(result.error);
            toast({ title: 'Saved successfully!', description: 'You can view your history in your profile.' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Failed to save', description: error.message });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleNavigate = (path: string) => {
        router.push(path.startsWith('/') ? path : `/#${path}`);
    };
    
    const toggleHighlight = () => {
        if (!outputText) return;
        setIsHighlightMode(!isHighlightMode);
        setIsDiffMode(false);
    }

    const toggleDiff = () => {
        if (!outputText) return;
        setIsDiffMode(!isDiffMode);
        setIsHighlightMode(false);
    }

    const scoreColorClass = analysisResult ? 
        (analysisResult.aiScore > 75 ? 'text-red-400' : analysisResult.aiScore > 40 ? 'text-amber-400' : 'text-emerald-400')
        : 'text-white';
    
    const scoreStatusText = analysisResult ? 
        (analysisResult.aiScore > 75 ? 'HIGH RISK' : analysisResult.aiScore > 40 ? 'MEDIUM RISK' : 'LIKELY HUMAN')
        : '';
        
    const scoreStatusClass = analysisResult ?
        (analysisResult.aiScore > 75 ? 'bg-red-500/20 text-red-400' : analysisResult.aiScore > 40 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400')
        : '';


    return (
        <div className="flex flex-col min-h-screen">
            <Navbar onNavigate={handleNavigate} />
            <main className="flex-grow container mx-auto py-10 px-4 md:px-6">
                 <button onClick={() => router.push('/')} className="animated-border-card inline-block mb-6">
                    <span className={cn("inner-span flex items-center back-to-home-button")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </span>
                </button>

                <h1 className="text-4xl md:text-5xl font-bold text-center mb-3 text-glow-primary">OmniTools AI Humanizer</h1>
                <p className="text-center text-cyan-300 mb-10">AI Detector & 100% Undetectable Humanizer • Any Language</p>

                 <div className="grid md:grid-cols-2 gap-8 items-start">
                    {/* Input Column */}
                    <div className="glass-humanizer rounded-3xl p-6 md:p-8 flex flex-col h-full border border-border/50">
                        <div className="flex-grow flex flex-col">
                             <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold flex items-center gap-3"><Sparkles className="text-cyan-400"/> Paste AI Text</h2>
                                <Button onClick={handleClearInput} variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive flex items-center gap-1">
                                    <Trash2 className="w-4 h-4" /> Clear
                                </Button>
                            </div>
                            <Textarea value={inputText} onChange={(e) => setInputText(e.target.value)} rows={14} className="w-full rounded-2xl p-6 text-lg resize-none flex-grow bg-background/50 border-border/50" placeholder="Paste AI-written text here..."/>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <Button onClick={handleAnalyze} className="py-6 bg-zinc-800 hover:bg-zinc-700 rounded-2xl font-semibold flex items-center justify-center gap-3 transition">
                                <Search className="w-5 h-5" /> Check AI Score
                            </Button>
                            <Button onClick={handleHumanize} className="py-6 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl font-semibold flex items-center justify-center gap-3 transition hover:brightness-110">
                                <Sparkles className="w-5 h-5" /> Humanize
                            </Button>
                        </div>
                    </div>

                    {/* Output & Score Column */}
                    <div className="space-y-8 h-full">
                        {/* Output */}
                         <div className="glass-humanizer rounded-3xl p-6 md:p-8 flex flex-col border border-border/50 h-full">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold flex items-center gap-3"><UserCheck className="text-emerald-400"/> Result</h2>
                                <div className="flex gap-2">
                                    <Button onClick={toggleDiff} variant={isDiffMode ? "secondary" : "ghost"} size="sm" className="px-4 py-2 rounded-xl flex items-center gap-2 transition" disabled={!outputText}>
                                        <Repeat className="w-4 h-4" /> {isDiffMode ? 'Hide Changes' : 'View Changes'}
                                    </Button>
                                    <Button onClick={toggleHighlight} variant={isHighlightMode ? "secondary" : "ghost"} size="sm" className="px-4 py-2 rounded-xl flex items-center gap-2 transition" disabled={!outputText}>
                                        <Highlighter className="w-4 h-4" /> Highlight
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1 bg-zinc-950/70 border border-zinc-700 rounded-2xl p-6 text-lg overflow-auto leading-relaxed min-h-[300px]">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
                                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                                        <p>{loadingMessage}</p>
                                    </div>
                                ) : (
                                    <div className="w-full text-left">
                                        {isDiffMode ? (
                                            <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: getDiffHTML(originalText, outputText) }}></div>
                                        ) : isHighlightMode ? (
                                            <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: getHighlightedHTML(outputText, analysisResult?.aiScore || 0) }}></div>
                                        ) : (
                                            <p className="whitespace-pre-wrap">{outputText || 'Result will appear here...'}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Button onClick={handleCopy} disabled={!outputText} className="py-4 bg-emerald-700/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-700/30 rounded-2xl font-semibold flex items-center justify-center gap-2 transition">
                                    {hasCopied ? <Check className="w-4 h-4"/> : <Clipboard className="w-4 h-4" />} Copy
                                </Button>
                                <Button onClick={handleDownloadPDF} disabled={!outputText} className="py-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl font-semibold flex items-center justify-center gap-2 transition text-muted-foreground">
                                    <FileText className="w-4 h-4" /> PDF
                                </Button>
                                <Button onClick={handleSave} disabled={!user || !outputText || isLoading} className="py-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl font-semibold flex items-center justify-center gap-2 transition text-muted-foreground">
                                    <Save className="w-4 h-4" /> Save
                                </Button>
                                <Button onClick={handleClearInput} variant="ghost" className="py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 text-destructive hover:bg-destructive/10">
                                    <Trash2 className="w-4 h-4" /> Reset
                                </Button>
                            </div>
                        </div>

                         {analysisResult && (
                            <div className="glass-humanizer rounded-3xl p-8 border border-border/50">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-semibold">AI Detection Score</h3>
                                    {scoreStatusText && <span className={cn('px-5 py-1 text-sm font-medium rounded-full', scoreStatusClass)}>{scoreStatusText}</span>}
                                </div>
                                <div className="flex justify-center mb-8">
                                    <div className="score-circle relative" style={{ '--progress': `${analysisResult?.aiScore || 0}%`, background: `conic-gradient(hsl(var(--primary)) 0% var(--progress, 0%), #334155 var(--progress, 0%) 100%)` }} >
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                            <span className={cn("text-6xl font-bold", scoreColorClass)}>{analysisResult.aiScore}</span>
                                            <span className="text-cyan-400 text-sm -mt-2">%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center text-zinc-400 text-sm leading-relaxed">{analysisResult.explanation}</div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
             <LandingFooter onNavigate={handleNavigate} />
             {isLoading && <ProcessingOverlay message={loadingMessage} />}
        </div>
    );
}
