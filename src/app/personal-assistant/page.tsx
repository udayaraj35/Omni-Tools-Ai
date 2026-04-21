'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { generatePersonalAssistantResponse } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, Bot, User, Send, Mic, Volume2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';


const formSchema = z.object({
    prompt: z.string().min(1, "Please enter a message."),
});

type PersonalAssistantFormData = z.infer<typeof formSchema>;

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

// This needs to be checked on the client
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: ((this: SpeechRecognition, ev: any) => any) | null;
    onerror: ((this: SpeechRecognition, ev: any) => any) | null;
    onend: ((this: SpeechRecognition) => any) | null;
}

export default function PersonalAssistantPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const chatContainerRef = useRef<HTMLDivElement>(null);

    const form = useForm<PersonalAssistantFormData>({
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
    
    // Initialize SpeechRecognition on the client side
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'en-US';

                recognition.onresult = (event: any) => {
                    let finalTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        }
                    }
                    if (finalTranscript) {
                        form.setValue('prompt', form.getValues('prompt') + finalTranscript);
                    }
                };

                recognition.onerror = (event: any) => {
                    toast({ variant: "destructive", title: "Speech Recognition Error", description: event.error });
                    setIsRecording(false);
                };
                
                recognition.onend = () => {
                    setIsRecording(false);
                };

                recognitionRef.current = recognition;
            }
        }
    }, [form, toast]);


    const handleQuery = async (data: PersonalAssistantFormData) => {
        const userMessage: ChatMessage = { role: 'user', content: data.prompt };
        const currentChatHistory = [...chatHistory, userMessage];
        setChatHistory(currentChatHistory);
        form.reset();
        setIsLoading(true);

        try {
            const result = await generatePersonalAssistantResponse({ 
                prompt: data.prompt,
                chatHistory: currentChatHistory.slice(0, -1) // Send history without the current message
            });

            if ('response' in result && result.response) {
                const assistantMessage: ChatMessage = { role: 'assistant', content: result.response };
                setChatHistory(prev => [...prev, assistantMessage]);
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
    
    const handleVoiceInput = () => {
        if (!recognitionRef.current) {
            toast({ variant: 'destructive', title: 'Feature Not Available', description: 'Speech recognition is not supported on your browser.' });
            return;
        }

        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
        setIsRecording(!isRecording);
    };

    const speakText = (text: string) => {
        if ('speechSynthesis' in window) {
            // Cancel any previous speech
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        } else {
            toast({ variant: 'destructive', title: 'Unsupported Browser', description: 'Text-to-speech is not supported by your browser.'});
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
            <main className="container mx-auto py-12 px-4 lg:px-8 flex-grow flex flex-col">
                <button onClick={() => router.push('/')} className="animated-border-card inline-block mb-8">
                    <span className={cn("inner-span flex items-center back-to-home-button")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </span>
                </button>
                 <Card className="glass-card flex-grow flex flex-col rounded-[3.5rem] border-white/5 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
                    <CardContent className="p-0 flex-grow flex flex-col">
                        <ScrollArea className="flex-grow min-h-[500px] p-8 md:p-12" ref={chatContainerRef}>
                            <div className="space-y-10 max-w-6xl mx-auto">
                                {chatHistory.length === 0 && (
                                    <div className="flex flex-col items-center justify-center text-center text-zinc-500 h-full py-20 space-y-6">
                                        <div className="p-8 rounded-full bg-primary/5 border border-primary/10">
                                            <Bot className="w-20 h-20 text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">Personal AI Assistant</h2>
                                            <p className="text-xl mt-2 font-medium">How can I help you today? Try asking with your voice!</p>
                                        </div>
                                    </div>
                                )}
                                {chatHistory.map((msg, index) => (
                                    <div key={index} className={`flex items-start gap-6 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                        {msg.role === 'assistant' && (
                                            <div className="flex flex-col items-center gap-3 self-start">
                                                <div className="p-4 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-lg"><Bot className="h-6 w-6" /></div>
                                                 <Button variant="ghost" size="icon" onClick={() => speakText(msg.content)} className="h-10 w-10 hover:bg-white/5 text-zinc-500 hover:text-primary">
                                                    <Volume2 className="h-5 w-5"/>
                                                </Button>
                                            </div>
                                        )}
                                        <div className={cn("prose prose-invert prose-lg max-w-4xl rounded-[2rem] p-8 shadow-2xl transition-all", 
                                            msg.role === 'user' ? 'bg-primary/10 border border-primary/20 text-white rounded-tr-none' : 'bg-zinc-900/80 border border-white/5 text-zinc-200 rounded-tl-none',
                                        )}>
                                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                                                pre: ({node, ...props}) => <pre className="bg-black/40 p-6 rounded-2xl border border-white/5 my-4" {...props} />,
                                                code: ({node, ...props}) => <code className="bg-primary/10 text-primary rounded px-1.5 py-0.5" {...props} />
                                            }}>
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                        {msg.role === 'user' && (
                                            <div className="p-4 rounded-2xl bg-zinc-800 border border-white/5 text-zinc-400 self-start shadow-lg"><User className="h-6 w-6" /></div>
                                        )}
                                    </div>
                                ))}
                                {isLoading && (
                                     <div className="flex items-start gap-6">
                                        <div className="p-4 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-lg"><Bot className="h-6 w-6" /></div>
                                        <div className="flex items-center gap-3 text-primary font-black uppercase tracking-widest text-xs py-4">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span className="animate-pulse">Thinking...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                        <div className="mt-auto p-8 md:p-12 border-t border-white/5 bg-black/40 backdrop-blur-3xl">
                            <div className="max-w-6xl mx-auto">
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
                                                            placeholder="Ask me anything..."
                                                            className="bg-zinc-900 border-white/10 text-lg rounded-2xl p-6 min-h-[70px] max-h-[300px] resize-none focus:ring-primary shadow-inner"
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
                                        <div className="flex gap-3">
                                            <Button 
                                                type="button" 
                                                onClick={handleVoiceInput} 
                                                variant={isRecording ? "destructive" : "outline"} 
                                                className={cn("h-16 w-16 rounded-2xl border-white/10 bg-zinc-900 hover:bg-white/5 transition-all", isRecording && "animate-pulse ring-4 ring-red-500/20")}
                                            >
                                                <Mic className={cn("h-7 w-7", isRecording ? "text-white" : "text-primary")} />
                                            </Button>
                                            <Button type="submit" disabled={isLoading} className="gradient-button-gold h-16 px-10 rounded-2xl text-xl shadow-2xl transition-transform active:scale-95">
                                                {isLoading ? <Loader2 className="animate-spin h-7 w-7" /> : <Send className="h-7 w-7" />}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
            <LandingFooter onNavigate={handleNavigate} />
        </div>
    );
}
