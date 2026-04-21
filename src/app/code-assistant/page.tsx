'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { generateCodeResponse } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, ArrowLeft, Bot, User, Send, Code } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';

const formSchema = z.object({
    prompt: z.string().min(1, "Please enter a message."),
});

type CodeAssistantFormData = z.infer<typeof formSchema>;

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

type Language = 'en' | 'ne';

export default function CodeAssistantPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [freeLimit, setFreeLimit] = useState(10000);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');

    const form = useForm<CodeAssistantFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            prompt: '',
        },
    });
    
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleQuery = async (data: CodeAssistantFormData) => {
        if (freeLimit <= 0) {
            toast({
                variant: 'destructive',
                title: 'Free Limit Reached',
                description: 'You have used all your free credits for today.',
            });
            return;
        }

        const userMessage: ChatMessage = { role: 'user', content: data.prompt };
        setChatHistory(prev => [...prev, userMessage]);
        form.reset();
        setIsLoading(true);

        try {
            const result = await generateCodeResponse({ prompt: data.prompt, language: selectedLanguage });
            if ('response' in result && result.response) {
                const assistantMessage: ChatMessage = { role: 'assistant', content: result.response };
                setChatHistory(prev => [...prev, assistantMessage]);
                setFreeLimit(prev => prev - 1);
            } else {
                throw new Error((result as any).error || 'AI did not return a valid response.');
            }
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'An Error Occurred',
                description: error.message || 'Could not get a response from the AI assistant.',
            });
             setChatHistory(prev => prev.slice(0, -1)); // Remove user message on error
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleNavigate = (path: string) => {
        if (path.startsWith('/')) {
            router.push(path);
        } else {
            router.push(`/#${path}`);
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#05050a]">
             <Navbar onNavigate={handleNavigate} />
            <main className="container mx-auto py-8 px-4 lg:px-8 flex-grow flex flex-col">
                <button onClick={() => router.push('/')} className="animated-border-card inline-block mb-6">
                    <span className={cn("inner-span flex items-center back-to-home-button")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </span>
                </button>
                
                <div className="flex flex-col lg:flex-row gap-8 flex-grow">
                    {/* INFO SIDEBAR */}
                    <div className="lg:w-80 flex-shrink-0 space-y-6">
                        <Card className="glass-card border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
                            <div className="space-y-6">
                                <div className="p-4 rounded-3xl bg-primary/10 text-primary border border-primary/20 w-fit">
                                    <Code className="h-10 w-10" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black uppercase italic tracking-tighter">Omni Code Assistant</h1>
                                    <p className="text-zinc-500 text-sm mt-2 font-bold uppercase tracking-widest">Neural Debugger V2.5</p>
                                </div>
                                <Separator className="bg-white/5" />
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-xs font-bold uppercase">
                                        <span className="text-zinc-500">Credits</span>
                                        <span className="text-primary">{freeLimit.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: '100%' }}></div>
                                    </div>
                                    <p className="text-[10px] text-zinc-600 font-bold uppercase text-center tracking-widest">Free daily limit: 10K</p>
                                </div>
                            </div>
                        </Card>
                        
                        <Card className="glass-card border-white/5 p-6 rounded-[2.5rem] bg-white/5">
                            <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-4">Programming Model</h4>
                            <div className="space-y-2">
                                <Badge className="w-full justify-start gap-2 py-2 px-4 rounded-xl bg-zinc-900 border-white/5">
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                    Gemini 1.5 Pro
                                </Badge>
                                <Badge className="w-full justify-start gap-2 py-2 px-4 rounded-xl bg-zinc-900 border-white/5">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                                    Low Latency
                                </Badge>
                            </div>
                        </Card>
                    </div>

                    {/* MAIN CHAT AREA */}
                    <Card className="glass-card flex-grow flex flex-col rounded-[3.5rem] border-white/5 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
                        <CardContent className="p-0 flex-grow flex flex-col">
                            <ScrollArea className="flex-grow min-h-[500px] p-8 md:p-12" ref={chatContainerRef}>
                                <div className="space-y-10 max-w-5xl mx-auto">
                                    {chatHistory.length === 0 && (
                                        <div className="flex flex-col items-center justify-center text-center text-zinc-500 h-full py-20 space-y-6">
                                            <div className="p-8 rounded-full bg-primary/5 border border-primary/10">
                                                <Bot className="w-20 h-20 text-primary" />
                                            </div>
                                            <div>
                                                <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">Neural Code Logic</h2>
                                                <p className="text-xl mt-2 font-medium">Ask anything about algorithms, debugging, or full-stack architecture.</p>
                                            </div>
                                        </div>
                                    )}
                                    {chatHistory.map((msg, index) => (
                                        <div key={index} className={`flex items-start gap-6 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                            {msg.role === 'assistant' && <div className="p-4 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-lg self-start"><Bot className="h-6 w-6" /></div>}
                                            <div className={cn("prose prose-invert prose-lg max-w-4xl rounded-[2rem] p-8 shadow-2xl transition-all", 
                                                msg.role === 'user' ? 'bg-primary/10 border border-primary/20 text-white rounded-tr-none' : 'bg-zinc-900/80 border border-white/5 text-zinc-200 rounded-tl-none',
                                            )}>
                                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                                                    pre: ({node, ...props}) => <pre className="bg-black/40 p-6 rounded-2xl border border-white/5 my-4 overflow-x-auto custom-scrollbar" {...props} />,
                                                    code: ({node, ...props}) => <code className="bg-primary/10 text-primary rounded px-1.5 py-0.5" {...props} />
                                                }}>
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                            {msg.role === 'user' && <div className="p-4 rounded-2xl bg-zinc-800 border border-white/5 text-zinc-400 self-start shadow-lg"><User className="h-6 w-6" /></div>}
                                        </div>
                                    ))}
                                    {isLoading && (
                                         <div className="flex items-start gap-6">
                                            <div className="p-4 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-lg"><Bot className="h-6 w-6" /></div>
                                            <div className="flex items-center gap-3 text-primary font-black uppercase tracking-widest text-xs py-4">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span className="animate-pulse">Analyzing Logic...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                            
                            <div className="mt-auto p-8 md:p-12 border-t border-white/5 bg-black/40 backdrop-blur-3xl">
                                <div className="max-w-5xl mx-auto space-y-6">
                                    <div className="flex items-center gap-3 bg-zinc-950/50 p-1.5 rounded-2xl border border-white/5 w-fit">
                                        <Button
                                            size="sm"
                                            variant={selectedLanguage === 'ne' ? 'secondary' : 'ghost'}
                                            onClick={() => setSelectedLanguage('ne')}
                                            className={cn("h-10 px-6 rounded-xl text-[10px] uppercase font-black tracking-widest", selectedLanguage === 'ne' && "bg-primary text-black hover:bg-primary/90")}
                                        >
                                            Nepali
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={selectedLanguage === 'en' ? 'secondary' : 'ghost'}
                                            onClick={() => setSelectedLanguage('en')}
                                            className={cn("h-10 px-6 rounded-xl text-[10px] uppercase font-black tracking-widest", selectedLanguage === 'en' && "bg-primary text-black hover:bg-primary/90")}
                                        >
                                            English
                                        </Button>
                                    </div>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(handleQuery)} className="flex items-end gap-4">
                                            <FormField
                                                control={form.control}
                                                name="prompt"
                                                render={({ field }) => (
                                                    <FormItem className="flex-grow">
                                                        <FormControl>
                                                            <Textarea
                                                                {...field}
                                                                rows={1}
                                                                placeholder="Paste code or ask a technical question..."
                                                                className="bg-zinc-900 border-white/10 text-lg rounded-2xl p-6 min-h-[70px] max-h-[400px] resize-none focus:ring-primary shadow-inner custom-scrollbar"
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                                        e.preventDefault();
                                                                        form.handleSubmit(handleQuery)();
                                                                    }
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="submit" disabled={isLoading} className="gradient-button-gold h-16 px-10 rounded-2xl text-xl shadow-2xl transition-transform active:scale-95">
                                                {isLoading ? <Loader2 className="animate-spin h-7 w-7" /> : <Send className="h-7 w-7" />}
                                            </Button>
                                        </form>
                                    </Form>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <LandingFooter onNavigate={handleNavigate} />
        </div>
    );
}
