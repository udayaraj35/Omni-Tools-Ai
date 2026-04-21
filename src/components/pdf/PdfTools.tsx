
      'use client';

import React from 'react';
import {
  Combine, Scissors, ArrowDownToLine, FileImage, FileKey, ShieldCheck, FileLock, RotateCcw, Pencil, FileType, FileInput, FileOutput, FilePlus, FileMinus, ScanSearch, Wrench, Sparkles, Hash,
} from 'lucide-react';
import { Card, CardTitle, CardContent } from '../ui/card';

// Exporting the type to be used in the page
export interface PdfTool {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  category: string;
  pro: boolean;
  ai: boolean;
  disabled?: boolean;
}

interface PdfToolsProps {
    onSelectTool: (tool: PdfTool) => void;
}

const pdfToolsList: PdfTool[] = [
    { id: "merge-pdf", name: "Merge PDF", icon: Combine, description: "Combine multiple PDFs into one.", category: 'Organize', pro: false, ai: true },
    { id: "split-pdf", name: "Split PDF", icon: Scissors, description: "Extract a range of pages.", category: 'Organize', pro: false, ai: true, disabled: false },
    { id: "remove-pages", name: "Remove Pages", icon: FileMinus, description: "Delete specific pages from a PDF.", category: 'Organize', pro: true, ai: false, disabled: false },
    { id: "extract-pages", name: "Extract Pages", icon: FileOutput, description: "Create a new PDF with selected pages.", category: 'Organize', pro: true, ai: false, disabled: false },
    { id: "add-page-numbers", name: "Add Page Numbers", icon: Hash, description: "Insert page numbers into your PDF.", category: 'Organize', pro: true, ai: true, disabled: false },
    
    { id: "compress-pdf", name: "Compress PDF", icon: ArrowDownToLine, description: "Reduce file size without quality loss.", category: 'Optimize', pro: false, ai: true, disabled: true },
    { id: "repair-pdf", name: "Repair PDF", icon: Wrench, description: "Fix corrupted or damaged PDF files.", category: 'Optimize', pro: true, ai: false, disabled: true },
    { id: "ocr-pdf", name: "OCR PDF", icon: ScanSearch, description: "Make scanned PDFs searchable.", category: 'Optimize', pro: true, ai: true, disabled: true },

    { id: "jpg-to-pdf", name: "JPG to PDF", icon: FileInput, description: "Convert JPG images to PDF.", category: 'Convert', pro: false, ai: true },
    { id: "pdf-to-jpg", name: "PDF to JPG", icon: FileImage, description: "Convert each PDF page to a JPG.", category: 'Convert', pro: false, ai: false },
    
    { id: "rotate-pdf", name: "Rotate PDF", icon: RotateCcw, description: "Rotate all or specific pages.", category: 'Edit', pro: false, ai: false, disabled: false },
    { id: "watermark-pdf", name: "Add Watermark", icon: ShieldCheck, description: "Add text or image watermarks.", category: 'Edit', pro: true, ai: true, disabled: false },
    { id: "edit-pdf", name: "Edit PDF", icon: Pencil, description: "Add text, shapes, and annotations.", category: 'Edit', pro: true, ai: false, disabled: false },
    
    { id: "lock-pdf", name: "Lock PDF", icon: FileLock, description: "Add a password to your PDF.", category: 'Security', pro: false, ai: false, disabled: false },
    { id: "unlock-pdf", name: "Unlock PDF", icon: FileKey, description: "Remove password protection.", category: 'Security', pro: true, ai: false, disabled: false },
];

export function PdfToolsGrid({ onSelectTool }: PdfToolsProps) {
    const categories = ['Organize', 'Optimize', 'Convert', 'Edit', 'Security'];

    return (
        <div className="w-full space-y-8">
            {categories.map(category => (
                <ToolCategory 
                    key={category}
                    title={`${category} PDF`} 
                    tools={pdfToolsList.filter(t => t.category === category)} 
                    onToolSelect={onSelectTool}
                />
            ))}
        </div>
    );
}

const ToolCategory = ({ title, tools, onToolSelect }: { title: string, tools: PdfTool[], onToolSelect: (tool: PdfTool) => void }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-glow-primary">{title}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {tools.map((tool: any) => (
                <button key={tool.id} onClick={() => onToolSelect(tool)} disabled={tool.disabled} className="animated-border-card group text-left h-full disabled:opacity-50 disabled:cursor-not-allowed">
                    <Card className="h-full bg-card/60 flex flex-col justify-between p-3">
                        <div>
                            <div className="flex justify-between items-start">
                                <tool.icon className="h-6 w-6 text-primary mb-2" />
                                <div className="flex space-x-1">
                                    {tool.ai && <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded-full">AI</span>}
                                    {tool.pro && <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full">PRO</span>}
                                </div>
                            </div>
                            <CardTitle className="text-sm font-bold">{tool.name}</CardTitle>
                            <CardContent className="p-0 text-xs text-muted-foreground mt-1">{tool.description}</CardContent>
                        </div>
                         <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2">
                            <span className="text-primary font-medium text-xs">Use Tool →</span>
                        </div>
                    </Card>
                </button>
            ))}
        </div>
    </div>
);
    