'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, UploadCloud } from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface PdfPagePreview {
  previewUrl: string;
  pageNumber: number;
}

export function AddPageNumbers({ onTaskComplete }: { onTaskComplete: () => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [previews, setPreviews] = useState<PdfPagePreview[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pdfjsLib, setPdfjsLib] = useState<any>(null);
    const { toast } = useToast();

    // Customization state
    const [position, setPosition] = useState('bottom_center');
    const [margin, setMargin] = useState(10);
    const [startNumber, setStartNumber] = useState(1);
    const [format, setFormat] = useState('{page} of {total}');
    const [fontSize, setFontSize] = useState(12);

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
            const numPages = doc.numPages > 4 ? 4 : doc.numPages; // Limit previews for performance
            for (let i = 1; i <= numPages; i++) {
                const page = await doc.getPage(i);
                const viewport = page.getViewport({ scale: 0.3 });
                const canvas = document.createElement('canvas');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                const context = canvas.getContext('2d');
                if (context) {
                    await page.render({ canvasContext: context, viewport }).promise;
                    previews.push({
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
        setPreviews([]);
        toast({ title: 'Processing PDF...', description: `Generating previews for ${newFile.name}.` });
        
        const newPreviews = await generatePreviews(newFile);
        setPreviews(newPreviews);
        if (newPreviews.length > 0) {
            toast({ title: 'Ready to add page numbers!' });
        }
    }, [generatePreviews, toast]);
    
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false
    });
    
    const handleAddNumbers = async () => {
        if (!file) {
            toast({ variant: 'destructive', title: 'No file selected' });
            return;
        }
        setIsLoading(true);
        toast({ title: 'Adding page numbers...' });

        try {
            const existingPdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const totalPages = pdfDoc.getPageCount();

            for (let i = 0; i < totalPages; i++) {
                const page = pdfDoc.getPage(i);
                const { width, height } = page.getSize();
                const pageNumber = i + startNumber;
                
                const text = format.replace('{page}', String(pageNumber)).replace('{total}', String(totalPages));
                const textWidth = font.widthOfTextAtSize(text, fontSize);

                let x, y;
                const [vAlign, hAlign] = position.split('_');

                // Vertical alignment
                if (vAlign === 'top') {
                    y = height - fontSize - margin;
                } else { // bottom
                    y = margin;
                }
                
                // Horizontal alignment
                if (hAlign === 'left') {
                    x = margin;
                } else if (hAlign === 'center') {
                    x = width / 2 - textWidth / 2;
                } else { // right
                    x = width - textWidth - margin;
                }
                
                page.drawText(text, {
                    x, y,
                    font,
                    size: fontSize,
                    color: rgb(0, 0, 0),
                });
            }

            const newPdfBytes = await pdfDoc.save();
            const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `numbered-${file.name}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            
            toast({ title: 'Success!', description: 'Your new PDF has been downloaded.' });
            onTaskComplete();
        } catch (error) {
            toast({ variant: 'destructive', title: 'An error occurred', description: 'Could not add page numbers.' });
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
                     ) : (
                        <div>
                            <p className="font-medium">Drag & drop a PDF here, or click to select a file</p>
                            <p className="text-xs text-muted-foreground mt-2">Only single .pdf file is accepted</p>
                        </div>
                    )}
                </div>

                {previews.length > 0 && (
                    <div className="p-2 border rounded-md">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {previews.map((page, index) => (
                                <div key={index} className="relative group">
                                    <div className="relative aspect-[3/4] p-2 bg-muted rounded-md flex flex-col items-center justify-center">
                                        <Image src={page.previewUrl} alt={`Page ${page.pageNumber}`} width={100} height={141} className="object-contain rounded-sm shadow-md" />
                                        <span className="absolute bottom-1 right-2 text-xs font-bold bg-black/50 text-white px-1.5 py-0.5 rounded-full">{page.pageNumber}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {file && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border-t pt-4">
                        <div>
                            <Label>Position</Label>
                            <Select value={position} onValueChange={setPosition}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bottom_center">Bottom Center</SelectItem>
                                    <SelectItem value="bottom_left">Bottom Left</SelectItem>
                                    <SelectItem value="bottom_right">Bottom Right</SelectItem>
                                    <SelectItem value="top_center">Top Center</SelectItem>
                                    <SelectItem value="top_left">Top Left</SelectItem>
                                    <SelectItem value="top_right">Top Right</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Text Format</Label>
                            <Input value={format} onChange={e => setFormat(e.target.value)} placeholder="{page} of {total}" />
                        </div>
                        <div>
                            <Label>Font Size</Label>
                            <Input type="number" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} />
                        </div>
                        <div>
                            <Label>Margin (from edge)</Label>
                            <Input type="number" value={margin} onChange={e => setMargin(Number(e.target.value))} />
                        </div>
                        <div>
                            <Label>Start Number</Label>
                            <Input type="number" value={startNumber} onChange={e => setStartNumber(Number(e.target.value))} />
                        </div>
                    </div>
                )}
                
                <Button onClick={handleAddNumbers} disabled={isLoading || !file} className="w-full h-12 text-base font-bold gradient-button-gold">
                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Download className="mr-2" />}
                    Add Page Numbers & Download
                </Button>
            </CardContent>
        </Card>
    );
}