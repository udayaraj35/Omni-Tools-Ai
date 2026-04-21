'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileImage, Download, X } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import Image from 'next/image';

export function JpgToPdf({ onTaskComplete }: { onTaskComplete: () => void }) {
    const [images, setImages] = useState<{file: File, url: string}[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles = Array.from(event.target.files).filter(file => file.type.startsWith('image/'));
            const newImageObjects = newFiles.map(file => ({ file, url: URL.createObjectURL(file) }));
            setImages(prev => [...prev, ...newImageObjects]);
        }
    };
    
    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleConvert = async () => {
        if (images.length === 0) {
            toast({ variant: 'destructive', title: 'No images selected' });
            return;
        }

        setIsLoading(true);
        toast({ title: 'Converting images to PDF...' });

        try {
            const pdfDoc = await PDFDocument.create();
            for (const { file } of images) {
                const imageBytes = await file.arrayBuffer();
                const image = file.type === 'image/png' 
                    ? await pdfDoc.embedPng(imageBytes) 
                    : await pdfDoc.embedJpg(imageBytes);
                
                const page = pdfDoc.addPage([image.width, image.height]);
                page.drawImage(image, {
                    x: 0,
                    y: 0,
                    width: image.width,
                    height: image.height,
                });
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'converted-omnitools.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            
            toast({ title: 'Success!', description: 'Your images have been converted to a PDF.' });
            onTaskComplete();
        } catch (error) {
            console.error('Error converting to PDF:', error);
            toast({ variant: 'destructive', title: 'An error occurred' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardContent className="p-6 space-y-4">
                <Input type="file" multiple accept="image/jpeg,image/png" onChange={handleFileChange} />
                {images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {images.map((img, index) => (
                            <div key={index} className="relative group aspect-square">
                                <Image src={img.url} alt={`preview-${index}`} layout="fill" className="object-cover rounded-md" />
                                <Button size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => removeImage(index)}>
                                    <X className="w-4 h-4"/>
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
                <Button onClick={handleConvert} disabled={isLoading || images.length === 0} className="w-full">
                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Download className="mr-2" />}
                    Convert to PDF & Download
                </Button>
            </CardContent>
        </Card>
    );
}
