
      'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { PdfToolsGrid, type PdfTool } from '@/components/pdf/PdfTools';
import { ContactDialog } from '@/components/ui/contact-dialog';

// Dynamic imports for tool components
import { MergePdf } from '@/components/pdf/tools/MergePdf';
import { JpgToPdf } from '@/components/pdf/tools/JpgToPdf';
import { PdfToJpg } from '@/components/pdf/tools/PdfToJpg';
import { SplitPdf } from '@/components/pdf/tools/SplitPdf';
import { RemovePages } from '@/components/pdf/tools/RemovePages';
import { ExtractPages } from '@/components/pdf/tools/ExtractPages';
import { LockPdf } from '@/components/pdf/tools/LockPdf';
import { UnlockPdf } from '@/components/pdf/tools/UnlockPdf';
import { RotatePdf } from '@/components/pdf/tools/RotatePdf';
import { ComingSoon } from '@/components/pdf/tools/ComingSoon';
import { StoryDesigner } from '@/components/story-designer/StoryDesigner';
import { AddPageNumbers } from '@/components/pdf/tools/AddPageNumbers';

const toolComponentMap: Record<string, React.ComponentType<any>> = {
  'merge-pdf': MergePdf,
  'jpg-to-pdf': JpgToPdf,
  'pdf-to-jpg': PdfToJpg,
  'split-pdf': SplitPdf,
  'remove-pages': RemovePages,
  'extract-pages': ExtractPages,
  'lock-pdf': LockPdf,
  'unlock-pdf': UnlockPdf,
  'rotate-pdf': RotatePdf,
  'watermark-pdf': StoryDesigner,
  'edit-pdf': StoryDesigner,
  'add-page-numbers': AddPageNumbers,
  // --- Other tools will use the ComingSoon component for now ---
  'compress-pdf': ComingSoon,
  'repair-pdf': ComingSoon,
  'ocr-pdf': ComingSoon,
};

const PDFToolsPage = () => {
  const [showContactDialog, setShowContactDialog] = useState(false);
  const router = useRouter();
  const [selectedTool, setSelectedTool] = useState<PdfTool | null>(null);

  const handleNavigate = (path: string) => {
    router.push(path.startsWith('/') ? path : `/#${path}`);
  };

  const handleTaskComplete = () => {
    setShowContactDialog(true);
  };
  
  const ToolComponent = selectedTool ? toolComponentMap[selectedTool.id] || ComingSoon : null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onNavigate={handleNavigate} />
      <main className="flex-grow container mx-auto py-8">
        <button onClick={() => selectedTool ? setSelectedTool(null) : router.push('/')} className="animated-border-card inline-block mb-6">
          <span className={cn("inner-span flex items-center back-to-home-button")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {selectedTool ? 'Back' : 'Back to Home'}
          </span>
        </button>
        
        {!selectedTool ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-glow-primary font-headline">
                PDF Tools
              </h1>
              <p className="max-w-2xl mx-auto mt-4 text-muted-foreground md:text-xl">
                A complete suite of online tools to work with PDF files. Merge, split, compress, convert, and more.
              </p>
            </div>
            <PdfToolsGrid onSelectTool={setSelectedTool} />
          </>
        ) : (
          <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-glow-primary font-headline">
                    {selectedTool.name}
                </h1>
                <p className="max-w-2xl mx-auto mt-4 text-muted-foreground md:text-xl">
                    {selectedTool.description}
                </p>
            </div>
            {ToolComponent && <ToolComponent onTaskComplete={handleTaskComplete} />}
          </div>
        )}
      </main>
      <LandingFooter onNavigate={handleNavigate} />
      <ContactDialog open={showContactDialog} onOpenChange={setShowContactDialog} />
    </div>
  );
};

export default PDFToolsPage;
    