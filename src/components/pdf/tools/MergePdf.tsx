'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Combine, File, X, Download, UploadCloud } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

interface PdfFile {
  id: string;
  file: File;
  previewUrl: string;
}

export function MergePdf({ onTaskComplete }: { onTaskComplete: () => void }) {
    const [files, setFiles] = useState<PdfFile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pdfjsLib, setPdfjsLib] = useState<any>(null);
    const { toast } = useToast();
    const dragItem = React.useRef<number | null>(null);
    const dragOverItem = React.useRef<number | null>(null);

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
    
    const generatePreview = useCallback(async (file: File): Promise<string> => {
        if (!pdfjsLib) return '';
        try {
            const doc = await pdfjsLib.getDocument(await file.arrayBuffer()).promise;
            const page = await doc.getPage(1);
            const viewport = page.getViewport({ scale: 0.5 });
            const canvas = document.createElement('canvas');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            const context = canvas.getContext('2d');
            if (context) {
                await page.render({ canvasContext: context, viewport }).promise;
                return canvas.toDataURL();
            }
        } catch (error) {
            console.error("Failed to generate preview", error);
        }
        return '';
    }, [pdfjsLib]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
        if (newFiles.length === 0) return;

        toast({ title: 'Processing files...', description: `Generating previews for ${newFiles.length} PDFs.` });

        const newPdfFiles: PdfFile[] = await Promise.all(
            newFiles.map(async (file, index) => ({
                id: `${file.name}-${Date.now()}-${index}`,
                file,
                previewUrl: await generatePreview(file),
            }))
        );

        setFiles(prev => [...prev, ...newPdfFiles]);
    }, [generatePreview, toast]);
    
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] }
    });
    
    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleSort = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        const newFiles = [...files];
        const draggedItem = newFiles.splice(dragItem.current, 1)[0];
        newFiles.splice(dragOverItem.current, 0, draggedItem);
        dragItem.current = null;
        dragOverItem.current = null;
        setFiles(newFiles);
    };

    const handleMerge = async () => {
        if (files.length < 2) {
            toast({ variant: 'destructive', title: 'Not enough files', description: 'Please select at least two PDF files to merge.' });
            return;
        }

        setIsLoading(true);
        toast({ title: 'Merging PDFs...' });

        try {
            const mergedPdf = await PDFDocument.create();
            for (const { file } of files) {
                const pdfBytes = await file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(pdfBytes);
                const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            const mergedPdfBytes = await mergedPdf.save();
            
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'merged-omnitools.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            
            toast({ title: 'Success!', description: 'Your PDFs have been merged and downloaded.' });
            onTaskComplete();
        } catch (error) {
            console.error('Error merging PDFs:', error);
            toast({ variant: 'destructive', title: 'An error occurred', description: 'Could not merge the PDFs. Please ensure they are valid files.' });
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
                    {isDragActive ? (
                        <p className="font-semibold text-primary">Drop PDF files here...</p>
                    ) : (
                        <div>
                            <p className="font-medium">Drag & drop PDFs here, or click to select files</p>
                            <p className="text-xs text-muted-foreground mt-2">Only .pdf files are accepted</p>
                        </div>
                    )}
                </div>
                
                {files.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="font-semibold">Files to merge ({files.length}):</h4>
                        <p className="text-sm text-muted-foreground">Drag and drop to reorder.</p>
                        <div className="p-2 border rounded-md max-h-[40vh] overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {files.map((pdfFile, index) => (
                                <div 
                                    key={pdfFile.id}
                                    draggable
                                    onDragStart={() => dragItem.current = index}
                                    onDragEnter={() => dragOverItem.current = index}
                                    onDragEnd={handleSort}
                                    onDragOver={(e) => e.preventDefault()}
                                    className="relative group p-2 bg-muted rounded-md aspect-[3/4] flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
                                >
                                    {pdfFile.previewUrl ? (
                                        <Image src={pdfFile.previewUrl} alt={pdfFile.file.name} width={100} height={141} className="object-contain rounded-sm" />
                                    ) : (
                                        <File className="w-10 h-10 text-muted-foreground"/>
                                    )}
                                    <span className="text-xs font-medium truncate mt-2 text-center w-full">{pdfFile.file.name}</span>
                                    <Button size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => removeFile(pdfFile.id)}>
                                        <X className="w-4 h-4"/>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <Button onClick={handleMerge} disabled={isLoading || files.length < 2} className="w-full h-12 text-base font-bold gradient-button-gold">
                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Combine className="mr-2" />}
                    Merge & Download
                </Button>
            </CardContent>
        </Card>
    );
}
