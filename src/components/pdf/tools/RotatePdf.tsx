'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, File, Download, UploadCloud, RotateCcw, RotateCw } from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

interface PdfPagePreview {
  id: string;
  previewUrl: string;
  pageNumber: number;
}

export function RotatePdf({ onTaskComplete }: { onTaskComplete: () => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [previews, setPreviews] = useState<PdfPagePreview[]>([]);
    const [rotations, setRotations] = useState<Record<number, number>>({});
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
            const initialRotations: Record<number, number> = {};
            for (let i = 1; i <= doc.numPages; i++) {
                const page = await doc.getPage(i);
                initialRotations[i] = 0; // Initialize rotation state
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
            setRotations(initialRotations);
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
        setPreviews([]);
        toast({ title: 'Processing PDF...', description: `Generating previews for ${newFile.name}.` });
        
        const newPreviews = await generatePreviews(newFile);
        setPreviews(newPreviews);
        if (newPreviews.length > 0) {
            toast({ title: 'Ready to rotate!', description: `Click the buttons on each page to rotate.` });
        }

    }, [generatePreviews, toast]);
    
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false
    });

    const handleRotation = (pageNumber: number, direction: 'cw' | 'ccw') => {
        setRotations(prev => {
            const currentRotation = prev[pageNumber] || 0;
            const newRotation = direction === 'cw' 
                ? (currentRotation + 90) % 360 
                : (currentRotation - 90 + 360) % 360;
            return { ...prev, [pageNumber]: newRotation };
        });
    };
    
    const handleApplyRotation = async () => {
        if (!file) {
            toast({ variant: 'destructive', title: 'No file selected.' });
            return;
        }

        setIsLoading(true);
        toast({ title: 'Applying rotations...' });

        try {
            const existingPdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            
            pdfDoc.getPages().forEach((page, index) => {
                const pageNumber = index + 1;
                const rotationAngle = rotations[pageNumber];
                if (rotationAngle && rotationAngle !== 0) {
                    const currentRotation = page.getRotation().angle;
                    page.setRotation(degrees(currentRotation + rotationAngle));
                }
            });

            const newPdfBytes = await pdfDoc.save();
            const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `rotated-${file.name}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            
            toast({ title: 'Success!', description: 'Your rotated PDF has been downloaded.' });
            onTaskComplete();
            setFile(null);
            setPreviews([]);
            setRotations({});

        } catch (error) {
            console.error('Error rotating pages:', error);
            toast({ variant: 'destructive', title: 'An error occurred', description: 'Could not rotate the PDF.' });
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
                            <h4 className="font-semibold">Rotate Pages:</h4>
                        </div>
                        <div className="p-2 border rounded-md max-h-[40vh] overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {previews.map((page) => (
                                <div key={page.id} className="relative group">
                                    <div className="relative aspect-[3/4] p-2 bg-muted rounded-md flex flex-col items-center justify-center">
                                        <Image 
                                            src={page.previewUrl} 
                                            alt={`Page ${page.pageNumber}`} 
                                            width={100} height={141} 
                                            className="object-contain rounded-sm shadow-md transition-transform duration-200"
                                            style={{ transform: `rotate(${rotations[page.pageNumber] || 0}deg)` }}
                                        />
                                        <span className="absolute bottom-1 right-2 text-xs font-bold bg-black/50 text-white px-1.5 py-0.5 rounded-full">{page.pageNumber}</span>
                                    </div>
                                    <div className='absolute bottom-2 left-2 flex gap-1'>
                                        <Button size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleRotation(page.pageNumber, 'ccw'); }}>
                                            <RotateCcw className="w-4 h-4" />
                                        </Button>
                                        <Button size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleRotation(page.pageNumber, 'cw'); }}>
                                            <RotateCw className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                <Button onClick={handleApplyRotation} disabled={isLoading || !file} className="w-full h-12 text-base font-bold gradient-button-gold">
                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Download className="mr-2" />}
                    Apply Changes & Download
                </Button>
            </CardContent>
        </Card>
    );
}