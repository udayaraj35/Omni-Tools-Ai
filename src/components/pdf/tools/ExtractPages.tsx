'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, File, X, Download, UploadCloud, CheckSquare } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface PdfPagePreview {
  id: string;
  previewUrl: string;
  pageNumber: number;
}

export function ExtractPages({ onTaskComplete }: { onTaskComplete: () => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [previews, setPreviews] = useState<PdfPagePreview[]>([]);
    const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [pdfjsLib, setPdfjsLib] = useState<any>(null);
    const { toast } = useToast();

    useEffect(() => {
        const loadPdfLib = async () => {
          try {
            const pdfjs = await import('pdfjs-dist/build/pdf');
            if (typeof window !== 'undefined') {
                const workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`;
                pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
            }
            setPdfjsLib(pdfjs);
          } catch (error) {
            console.error("Failed to load pdfjs-dist", error);
            toast({ variant: 'destructive', title: 'PDF library failed to load.' });
          }
        };
        loadPdfLib();
    }, [toast]);
    
    const generatePreviews = useCallback(async (file: File): Promise<PdfPagePreview[]> => {
        if (!pdfjsLib) return [];
        try {
            const doc = await pdfjsLib.getDocument(await file.arrayBuffer()).promise;
            const previews: PdfPagePreview[] = [];
            for (let i = 1; i <= doc.numPages; i++) {
                const page = await doc.getPage(i);
                const viewport = page.getViewport({ scale: 0.5 });
                const canvas = document.createElement('canvas');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                const context = canvas.getContext('2d');
                if (context) {
                    await page.render({ canvasContext: context, viewport }).promise;
                    previews.push({
                        id: `${file.name}-page-${i}`,
                        pageNumber: i,
                        previewUrl: canvas.toDataURL(),
                    });
                }
            }
            return previews;
        } catch (error) {
            console.error("Failed to generate previews", error);
            toast({ variant: "destructive", title: "Could not generate previews."});
        }
        return [];
    }, [pdfjsLib, toast]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const newFile = acceptedFiles.find(file => file.type === 'application/pdf');
        if (!newFile) return;

        setFile(newFile);
        setSelectedPages(new Set());
        setPreviews([]);
        toast({ title: 'Processing PDF...', description: `Generating previews for ${newFile.name}.` });
        
        const newPreviews = await generatePreviews(newFile);
        setPreviews(newPreviews);
        if (newPreviews.length > 0) {
            toast({ title: 'Ready to extract!', description: `Select pages to extract.` });
        }

    }, [generatePreviews, toast]);
    
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false
    });

    const togglePageSelection = (pageNumber: number) => {
        setSelectedPages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(pageNumber)) {
                newSet.delete(pageNumber);
            } else {
                newSet.add(pageNumber);
            }
            return newSet;
        });
    };

    const toggleSelectAll = () => {
        if (selectedPages.size === previews.length) {
            setSelectedPages(new Set());
        } else {
            setSelectedPages(new Set(previews.map(p => p.pageNumber)));
        }
    };
    
    const handleExtract = async () => {
        if (!file || selectedPages.size === 0) {
            toast({ variant: 'destructive', title: 'No pages selected', description: 'Please select at least one page to extract.' });
            return;
        }

        setIsLoading(true);
        toast({ title: 'Extracting pages...' });

        try {
            const existingPdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            const newPdfDoc = await PDFDocument.create();
            
            const sortedPageIndices = Array.from(selectedPages).sort((a, b) => a - b).map(n => n - 1);
            
            const copiedPages = await newPdfDoc.copyPages(pdfDoc, sortedPageIndices);
            copiedPages.forEach(page => newPdfDoc.addPage(page));

            const newPdfBytes = await newPdfDoc.save();
            const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `extracted-omnitools.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            
            toast({ title: 'Success!', description: 'Your new PDF has been downloaded.' });
            onTaskComplete();
        } catch (error) {
            console.error('Error extracting pages:', error);
            toast({ variant: 'destructive', title: 'An error occurred', description: 'Could not extract pages from the PDF.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Card>
            <CardContent className="p-6 space-y-4">
                <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-accent'}`}>
                    <input {...getInputProps()} />
                    <UploadCloud className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                     {file ? (
                        <p className="font-semibold text-primary">{file.name}</p>
                     ) : isDragActive ? (
                        <p className="font-semibold text-primary">Drop PDF file here...</p>
                    ) : (
                        <div>
                            <p className="font-medium">Drag & drop a PDF here, or click to select a file</p>
                            <p className="text-xs text-muted-foreground mt-2">Only single .pdf file is accepted</p>
                        </div>
                    )}
                </div>
                
                {previews.length > 0 && (
                    <div className="space-y-2">
                         <div className="flex items-center justify-between">
                            <h4 className="font-semibold">Select pages to extract ({selectedPages.size} / {previews.length}):</h4>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="select-all" checked={selectedPages.size === previews.length} onCheckedChange={toggleSelectAll} />
                                <Label htmlFor="select-all">Select All</Label>
                            </div>
                        </div>
                        <div className="p-2 border rounded-md max-h-[40vh] overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {previews.map((page) => (
                                <div key={page.id} className="relative group cursor-pointer" onClick={() => togglePageSelection(page.pageNumber)}>
                                    <div className="relative aspect-[3/4] p-2 bg-muted rounded-md flex flex-col items-center justify-center">
                                        <Image src={page.previewUrl} alt={`Page ${page.pageNumber}`} width={100} height={141} className="object-contain rounded-sm shadow-md" />
                                        <span className="absolute bottom-1 right-2 text-xs font-bold bg-black/50 text-white px-1.5 py-0.5 rounded-full">{page.pageNumber}</span>
                                    </div>
                                    <div className={`absolute inset-0 rounded-md transition-all ${selectedPages.has(page.pageNumber) ? 'ring-2 ring-primary bg-primary/20' : 'bg-black/0 group-hover:bg-black/20'}`}>
                                        {selectedPages.has(page.pageNumber) && (
                                            <div className="absolute top-2 left-2 bg-primary text-primary-foreground rounded-full p-1">
                                                <CheckSquare className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                <Button onClick={handleExtract} disabled={isLoading || selectedPages.size === 0} className="w-full h-12 text-base font-bold gradient-button-gold">
                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Download className="mr-2" />}
                    Extract Pages & Download
                </Button>
            </CardContent>
        </Card>
    );
}