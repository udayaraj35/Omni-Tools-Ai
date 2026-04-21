'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, File, Download, UploadCloud, FileImage } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import JSZip from 'jszip';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface PdfPagePreview {
  id: string;
  previewUrl: string;
  pageNumber: number;
}

export function PdfToJpg({ onTaskComplete }: { onTaskComplete: () => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [previews, setPreviews] = useState<PdfPagePreview[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pdfjsLib, setPdfjsLib] = useState<any>(null);
    const [imageFormat, setImageFormat] = useState<'jpeg' | 'png'>('jpeg');
    const [imageQuality, setImageQuality] = useState(90);
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
        setPreviews([]);
        toast({ title: 'Processing PDF...', description: `Generating previews for ${newFile.name}.` });
        
        const newPreviews = await generatePreviews(newFile);
        setPreviews(newPreviews);
        if (newPreviews.length > 0) {
            toast({ title: 'Ready to convert!', description: `Your PDF has ${newPreviews.length} pages.` });
        }

    }, [generatePreviews, toast]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false
    });

    const handleConvert = async () => {
        if (!file || !pdfjsLib) {
            toast({ variant: 'destructive', title: 'Please select a PDF file.' });
            return;
        }

        setIsLoading(true);
        toast({ title: `Converting PDF to ${imageFormat.toUpperCase()}...` });

        try {
            const zip = new JSZip();
            const doc = await pdfjsLib.getDocument(await file.arrayBuffer()).promise;

            for(let i=1; i<=doc.numPages; i++) {
                const page = await doc.getPage(i);
                // Use higher scale for better quality output
                const viewport = page.getViewport({ scale: 2.0 });
                const canvas = document.createElement('canvas');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                const context = canvas.getContext('2d');
                if (context) {
                    await page.render({ canvasContext: context, viewport }).promise;
                    const dataUrl = canvas.toDataURL(`image/${imageFormat}`, imageQuality / 100);
                    const blob = await (await fetch(dataUrl)).blob();
                    zip.file(`page_${i}.${imageFormat === 'jpeg' ? 'jpg' : 'png'}`, blob);
                }
            }

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${file.name.replace('.pdf', '')}-images.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            
            toast({ title: 'Success!', description: 'Images have been zipped and downloaded.' });
            onTaskComplete();
            setFile(null);
            setPreviews([]);
        } catch (error) {
            console.error('Error converting PDF to images:', error);
            toast({ variant: 'destructive', title: 'An error occurred during conversion.' });
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
                    <div className="space-y-4">
                        <h4 className="font-semibold">Page Previews ({previews.length}):</h4>
                        <div className="p-2 border rounded-md max-h-[40vh] overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {previews.map((page) => (
                                <div key={page.id} className="relative group">
                                    <div className="relative aspect-[3/4] p-2 bg-muted rounded-md flex flex-col items-center justify-center">
                                        <Image src={page.previewUrl} alt={`Page ${page.pageNumber}`} width={100} height={141} className="object-contain rounded-sm shadow-md" />
                                        <span className="absolute bottom-1 right-2 text-xs font-bold bg-black/50 text-white px-1.5 py-0.5 rounded-full">{page.pageNumber}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Image Format</Label>
                                <Select value={imageFormat} onValueChange={(value: 'jpeg' | 'png') => setImageFormat(value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="jpeg">JPG</SelectItem>
                                        <SelectItem value="png">PNG</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {imageFormat === 'jpeg' && (
                                <div>
                                    <Label>JPG Quality ({imageQuality}%)</Label>
                                    <Slider value={[imageQuality]} onValueChange={(value) => setImageQuality(value[0])} max={100} min={10} step={5} />
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                <Button onClick={handleConvert} disabled={isLoading || !file} className="w-full h-12 text-base font-bold gradient-button-gold">
                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Download className="mr-2" />}
                    Convert & Download as ZIP
                </Button>
            </CardContent>
        </Card>
    );
}