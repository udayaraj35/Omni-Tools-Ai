'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { generateImage } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Image as ImageIcon, Download, ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const formSchema = z.object({
    prompt: z.string().min(5, "Please describe the image you want to create (min. 5 characters)."),
});

type ImageGeneratorFormData = z.infer<typeof formSchema>;

export default function ImageGeneratorPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<ImageGeneratorFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            prompt: '',
        },
    });

    const handleGenerate = async (data: ImageGeneratorFormData) => {
        setIsLoading(true);
        setGeneratedImage(null);
        toast({ title: "Generating Image...", description: "The AI is creating your image, please wait." });
        try {
            const result = await generateImage({ prompt: data.prompt });
            if ('imageUrl' in result) {
                setGeneratedImage(result.imageUrl);
                toast({ title: 'Image Generated Successfully!' });
            } else {
                throw new Error((result as any).error || 'AI did not return a valid image.');
            }
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Generation Failed',
                description: error.message || 'Could not generate an image from the prompt.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!generatedImage) return;
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = 'generated-image-omnitools.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-glow-primary uppercase italic">AI Image Generator</h1>
                        <p className="mt-4 text-xl text-zinc-400 font-medium">
                            Describe the image you want to create, and let our AI bring it to life.
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
                                                        rows={4}
                                                        placeholder="e.g., 'An astronaut riding a horse on Mars, cinematic lighting, detailed'"
                                                        className="bg-black/40 border-white/10 rounded-3xl text-xl p-8 resize-none focus:ring-primary shadow-inner"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" disabled={isLoading} className="w-full text-xl font-black h-20 gradient-button-gold rounded-3xl shadow-2xl tracking-[0.2em]">
                                        {isLoading ? <Loader2 className="animate-spin h-8 w-8" /> : <Sparkles className="h-8 w-8" />}
                                        GENERATE MASTERPIECE
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    {(isLoading || generatedImage) && (
                        <Card className="glass-card mt-12 p-8 md:p-16 rounded-[3.5rem] border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <CardContent className="p-0 text-center">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20 space-y-6">
                                        <Loader2 className="h-16 w-16 text-primary animate-spin" />
                                        <p className="text-zinc-400 font-black uppercase tracking-widest animate-pulse">Generating your masterpiece...</p>
                                    </div>
                                ) : generatedImage ? (
                                    <div className="space-y-8">
                                        <div className="relative group max-w-2xl mx-auto rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,229,255,0.2)]">
                                            <Image
                                                src={generatedImage}
                                                alt={form.getValues('prompt')}
                                                width={1024}
                                                height={1024}
                                                className="w-full h-auto"
                                                unoptimized
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                <Button onClick={handleDownload} size="lg" className="h-16 px-10 rounded-2xl text-lg font-black gradient-button-gold shadow-2xl">
                                                    <Download className="mr-3 h-6 w-6" /> Download 4K
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="max-w-2xl mx-auto p-6 bg-white/5 rounded-2xl border border-white/10 text-zinc-400 italic text-sm">
                                            "{form.getValues('prompt')}"
                                        </div>
                                    </div>
                                ) : null}
                            </CardContent>
                        </Card>
                    )}

                    {!isLoading && !generatedImage && (
                        <div className="text-center mt-20 py-20 border-2 border-dashed border-white/5 rounded-[3.5rem] opacity-20">
                            <ImageIcon className="mx-auto h-24 w-24 text-zinc-500" />
                            <p className="mt-6 text-xl font-black uppercase tracking-widest italic">Awaiting creative prompt...</p>
                        </div>
                    )}
                </div>
            </main>
            <LandingFooter onNavigate={handleNavigate} />
        </div>
    );
}
