'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AccuracyPage() {
    const router = useRouter();

    const handleNavigate = (path: string) => {
        router.push(path.startsWith('/') ? path : `/#${path}`);
    };

    return (
        <div className="flex min-h-screen flex-col bg-[#05050a]">
            <Navbar onNavigate={handleNavigate} />
            <main className="flex-1 container mx-auto py-12 px-4 lg:px-8">
                <button onClick={() => router.back()} className="animated-border-card inline-block mb-8">
                    <span className={cn("inner-span flex items-center back-to-home-button")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </span>
                </button>
                <Card className="glass-card p-8 md:p-16 rounded-[3rem] border-white/5 w-full">
                    <CardHeader className="text-center pb-12">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 rounded-3xl bg-primary/10 text-primary border border-primary/20">
                                <ShieldCheck className="h-12 w-12" />
                            </div>
                        </div>
                        <CardTitle className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-glow-primary">
                            Accuracy & Data Transparency
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-invert max-w-5xl mx-auto space-y-8 text-center text-xl text-zinc-400">
                        <p className="leading-relaxed">
                            This tool converts dates between Gregorian (AD) and Bikram Sambat (BS)
                            using verified, year-wise calendar datasets.
                        </p>
                        <p className="leading-relaxed">
                            Each conversion is calculated from an official reference date
                            and validated through reverse verification.
                        </p>
                        <p className="leading-relaxed font-bold text-white">
                            No approximations or averaged month lengths are used.
                        </p>
                        <p className="leading-relaxed">
                            If data for a specific year is unavailable, the system
                            intentionally withholds results to prevent inaccuracies.
                        </p>
                    </CardContent>
                </Card>
            </main>
            <LandingFooter onNavigate={handleNavigate} />
        </div>
    );
}
