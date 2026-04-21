'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { generateOmniResponse } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Bot, ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { cn } from '@/lib/utils';

const formSchema = z.object({
    prompt: z.string().min(2, "Please enter at least 2 characters."),
});

type OmniQueryFormData = z.infer<typeof formSchema>;

export default function OmniAiPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [response, setResponse] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<OmniQueryFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            prompt: '',
        },
    });

    const handleQuery = async (data: OmniQueryFormData) => {
        setIsLoading(true);
        setResponse(null);
        try {
            const result = await generateOmniResponse({ prompt: data.prompt });
            if ('response' in result) {
                setResponse(result.response);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Generation Failed',
                    description: (result as any).error,
                });
            }
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'An Error Occurred',
                description: error.message || 'Could not get a response from Omni AI.',
            });
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
            <main className="container mx-auto py-12 px-4 lg:px-8 flex-grow">
                <button onClick={() => router.push('/')} className="animated-border-card inline-block mb-8">
                    <span className={cn("inner-span flex items-center back-to-home-button")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </span>
                </button>
                <div className="w-full">
                    <div className="text-center mb-12">
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-glow-primary uppercase italic">Omni AI Assistant</h1>
                        <p className="mt-4 text-xl text-zinc-400 font-medium">
                            Your general-purpose AI assistant. Ask anything, get answers instantly.
                        </p>
                    </div>
                    
                    <Card className="glass-card p-2 md:p-6 rounded-[3rem] border-white/5">
                        <CardContent className="p-6 md:p-10">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleQuery)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="prompt"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        rows={6}
                                                        placeholder="Ask Omni AI anything... e.g., 'Write a poem about space' or 'Explain quantum computing in simple terms.'"
                                                        className="bg-black/40 border-white/10 rounded-3xl text-xl p-8 resize-none focus:ring-primary"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" disabled={isLoading} className="w-full text-xl font-black h-20 gradient-button-gold rounded-3xl shadow-2xl tracking-[0.2em]">
                                        {isLoading ? <Loader2 className="animate-spin h-8 w-8" /> : <Sparkles className="h-8 w-8" />}
                                        ASK OMNI AI
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    {isLoading && (
                        <div className="mt-12 text-center py-20 bg-white/5 rounded-[3rem] border border-white/5">
                            <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />
                            <p className="mt-6 text-zinc-400 font-bold uppercase tracking-widest animate-pulse">Omni AI is thinking...</p>
                        </div>
                    )}
                    
                    {response && !isLoading && (
                        <Card className="glass-card mt-12 p-8 md:p-12 rounded-[3rem] border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <CardContent className="p-0">
                                <div className="flex items-start gap-6">
                                    <div className="p-4 rounded-2xl bg-primary/10 text-primary shrink-0"><Bot className="h-8 w-8" /></div>
                                    <div className="prose prose-invert prose-xl max-w-none flex-1 leading-relaxed text-zinc-200">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {response}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
            <LandingFooter onNavigate={handleNavigate} />
        </div>
    );
}
