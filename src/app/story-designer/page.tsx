'use client';

import { StoryDesigner } from '@/components/story-designer/StoryDesigner';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StoryDesignerPage() {
  const router = useRouter();
  
  const handleNavigate = (path: string) => {
    if (path.startsWith('/')) {
        router.push(path);
    } else {
        router.push(`/#${path}`);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onNavigate={handleNavigate} />
      <main className="flex-grow container mx-auto py-8">
         <button onClick={() => router.push('/')} className="animated-border-card inline-block mb-6">
            <span className={cn("inner-span flex items-center back-to-home-button")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
            </span>
        </button>
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-glow-primary font-headline">
            Advanced PDF &amp; Image Editor
          </h1>
          <p className="max-w-2xl mx-auto mt-4 text-muted-foreground md:text-xl">
            Add watermarks, text, and logos to your images and PDFs. Use AI tools to remove backgrounds, crop images, and navigate PDF pages with ease.
          </p>
        </div>
        <StoryDesigner />
      </main>
      <LandingFooter onNavigate={handleNavigate} />
    </div>
  );
}
