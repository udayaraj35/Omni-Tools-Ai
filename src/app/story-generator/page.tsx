'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { generateStory } from '@/app/actions';
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
    prompt: z.string().min(10, "Please describe the story you want (min. 10 characters)."),
});

type StoryGeneratorFormData = z.infer<typeof formSchema>;

export default function StoryGeneratorPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [generatedStory, setGeneratedStory] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<StoryGeneratorFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            prompt: 'A magic backpack that can hold anything',
        },
    });

    const handleGenerate = async (data: StoryGeneratorFormData) => {
        setIsLoading(true);
        setGeneratedStory(null);
        toast({ title: "Generating Story...", description: "The AI is writing your story, please wait." });
        try {
            const result = await generateStory({ prompt: data.prompt });
            if ('story' in result) {
                setGeneratedStory(result.story);
                toast({ title: 'Story Generated Successfully!' });
            } else {
                throw new Error((result as any).error || 'AI did not return a valid story.');
            }
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Generation Failed',
                description: error.message || 'Could not generate a story from the prompt.',
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
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-glow-primary uppercase italic">AI Story Generator</h1>
                        <p className="mt-4 text-xl text-zinc-400 font-medium">
                            Provide a prompt, and let our AI storyteller weave a unique narrative for you.
                        </p>
                    </div>
                    
                    <Card className="glass-card p-2 md:p-6 rounded-[3.5rem] border-white/5 overflow-hidden">
                        <CardContent className="p-6 md:p-10">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleGenerate)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="prompt"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        rows={5}
                                                        placeholder="e.g., 'A detective who can talk to cats solves a mystery in a futuristic city.'"
                                                        className="bg-black/40 border-white/10 rounded-3xl text-xl p-8 resize-none focus:ring-primary"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" disabled={isLoading} className="w-full text-xl font-black h-20 gradient-button-gold rounded-3xl shadow-2xl tracking-[0.2em]">
                                        {isLoading ? <Loader2 className="animate-spin h-8 w-8" /> : <Sparkles className="h-8 w-8" />}
                                        GENERATE STORY
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    {(isLoading || generatedStory) && (
                        <Card className="glass-card mt-12 p-8 md:p-16 rounded-[3.5rem] border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <CardContent className="p-0">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20 space-y-6">
                                        <Loader2 className="h-16 w-16 text-primary animate-spin" />
                                        <p className="text-zinc-400 font-black uppercase tracking-widest animate-pulse">The AI is crafting your story...</p>
                                    </div>
                                ) : generatedStory ? (
                                    <div className="space-y-8">
                                        <div className="flex items-start gap-6">
                                            <div className="p-4 rounded-2xl bg-primary/10 text-primary shrink-0 shadow-lg"><Bot className="h-8 w-8" /></div>
                                            <div className="prose prose-invert prose-xl max-w-none flex-1 leading-relaxed text-zinc-200">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {generatedStory}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </CardContent>
                        </Card>
                    )}

                    {!isLoading && !generatedStory && (
                        <div className="text-center mt-20 py-20 border-2 border-dashed border-white/5 rounded-[3.5rem] opacity-20">
                            <Bot className="mx-auto h-24 w-24 text-zinc-500" />
                            <p className="mt-6 text-xl font-black uppercase tracking-widest italic">Awaiting your prompt...</p>
                        </div>
                    )}
                </div>
            </main>
            <LandingFooter onNavigate={handleNavigate} />
        </div>
    );
}
