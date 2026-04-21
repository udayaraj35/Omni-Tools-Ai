'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createSocialContent } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Instagram, Youtube, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Clipboard, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Separator } from '@/components/ui/separator';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';

const formSchema = z.object({
  userInput: z.string().min(10, "Please enter your idea (at least 10 characters)."),
  platform: z.enum(['Facebook', 'Instagram', 'TikTok', 'YouTube']),
});

type SocialContentFormData = z.infer<typeof formSchema>;

const TikTokIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.15 3.06.22 4.59.54-.17 1.09-.34 1.64-.51 1.32-.42 2.64-.85 3.96-1.27a.9.9 0 0 1 1.21.78c.02.26.04.52.06.78.03 1.25.06 2.5.09 3.75.01.42-.17.8-.52.97-.49.23-1 .47-1.5.7-.28.13-.57.26-.85.39a19.4 19.4 0 0 1-3.9 1.54c-.23.09-.46.17-.69.26-.53.2-1.07.4-1.6.6a1.02 1.02 0 0 1-.45.08c-.29-.02-.57-.09-.84-.2-.59-.26-1.18-.52-1.77-.78a.98.98 0 0 1-.61-1.01c.02-.3.04-.6.06-.9.04-1.25.08-2.5.12-3.75.02-.38.2-.73.54-.88.6-.26 1.2-.52 1.8-.78.29-.12.58-.25.87-.37.59-.25 1.18-.5 1.77-.75.29-.12.58-.25.87-.37.1-.04.19-.09.29-.13.3-.13.6-.26.9-.39a.9.9 0 0 1 .45-.07Z" />
    </svg>
);

const FacebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.323-1.325z"/>
    </svg>
);

const platformConfig = {
    Facebook: { icon: FacebookIcon, color: 'bg-blue-600/20 text-blue-400 border-blue-500/50' },
    Instagram: { icon: Instagram, color: 'bg-pink-600/20 text-pink-400 border-pink-500/50' },
    TikTok: { icon: TikTokIcon, color: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/50' },
    YouTube: { icon: Youtube, color: 'bg-red-600/20 text-red-400 border-red-500/50' },
};

export default function SocialWriterPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [generatedContent, setGeneratedContent] = useState<{ toolName: string; platform: string; content: string; callToAction: string; hashtags: string } | null>(null);

    const form = useForm<SocialContentFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            userInput: '',
            platform: 'Facebook',
        },
    });
    
    const { isSubmitting } = form.formState;

    const handleNavigate = (path: string) => {
        if (path.startsWith('/')) {
            router.push(path);
        } else {
            router.push(`/#${path}`);
        }
    }

    const handleGenerate = async (data: SocialContentFormData) => {
        setGeneratedContent(null);
        try {
            const result = await createSocialContent(data);
            if ('content' in result && result.content) {
                setGeneratedContent(result as any);
                toast({ title: 'Content Generated Successfully!' });
            } else {
                 throw new Error((result as any).error || 'AI did not return the expected content.');
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Generation Failed',
                description: error.message || 'Could not generate content from Omni AI.',
            });
        }
    };
    
    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: `${type} Copied to Clipboard!` });
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar onNavigate={handleNavigate} />
            <main className="w-full max-w-4xl mx-auto flex-grow container py-8">
                 <button onClick={() => router.push('/')} className="animated-border-card inline-block mb-6">
                    <span className={cn("inner-span flex items-center back-to-home-button")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </span>
                </button>
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold tracking-tight text-glow-primary">OmniTools AI Social Writer</h1>
                    <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                        Generate powerful social media status, captions, descriptions, and viral hashtags.
                    </p>
                </div>

                <Card className="glass-card">
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleGenerate)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="userInput"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-lg">Your Idea or Topic</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    rows={4}
                                                    placeholder="e.g., 'A beautiful sunrise over the mountains in Nepal' or 'My new product launch for a coffee brand'"
                                                    className="bg-background/70 text-base"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="platform"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-lg">Select a Platform</FormLabel>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {Object.entries(platformConfig).map(([name, config]) => (
                                                    <button
                                                        key={name}
                                                        type="button"
                                                        onClick={() => form.setValue('platform', name as SocialContentFormData['platform'])}
                                                        className={cn(
                                                            'p-4 border-2 rounded-lg transition-all flex flex-col items-center justify-center gap-2 text-center',
                                                            field.value === name ? config.color : 'border-border/30 hover:bg-accent/10 hover:border-accent'
                                                        )}
                                                    >
                                                        <config.icon />
                                                        <span className="font-semibold">{name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={isSubmitting} className="w-full text-base h-12 gradient-button-gold">
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Sparkles />}
                                    Generate with OmniTools AI
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {isSubmitting && (
                    <Card className="glass-card mt-6">
                        <CardContent className="p-10 text-center">
                            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
                            <p className="mt-4 text-muted-foreground">Omni AI is writing... Please wait.</p>
                        </CardContent>
                    </Card>
                )}

                {generatedContent && !isSubmitting && (
                    <Card className="glass-card mt-6">
                        <CardHeader>
                            <CardTitle>Generated Content for {generatedContent.platform}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="prose prose-invert max-w-none prose-p:my-2 prose-h3:my-3 bg-background/50 p-4 rounded-md border">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {`${generatedContent.content}\n\n*${generatedContent.callToAction}*`}
                                </ReactMarkdown>
                                <Separator className="my-4" />
                                <p className="text-primary font-mono text-sm break-words !my-0">{generatedContent.hashtags}</p>
                            </div>
                            <Button 
                                className='w-full' 
                                onClick={() => copyToClipboard(`${generatedContent.content}\n\n${generatedContent.callToAction}\n\n${generatedContent.hashtags}`, 'All Content')}>
                                <Copy className="mr-2 h-4 w-4" /> Copy All Content
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </main>
            <LandingFooter onNavigate={handleNavigate} />
        </div>
    );
}
