'use client';
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Unlock, Download, UploadCloud } from 'lucide-react';
import { PDFDocument, InvalidPDFError } from 'pdf-lib';
import { useDropzone } from 'react-dropzone';
import { Label } from '@/components/ui/label';

export function UnlockPdf({ onTaskComplete }: { onTaskComplete: () => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const pdfFile = acceptedFiles.find(file => file.type === 'application/pdf');
        if (pdfFile) {
            setFile(pdfFile);
            toast({ title: 'File selected', description: pdfFile.name });
        } else {
            toast({ variant: 'destructive', title: 'Invalid file', description: 'Please upload a PDF file.' });
        }
    }, [toast]);
    
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false
    });

    const handleUnlock = async () => {
        if (!file) {
            toast({ variant: 'destructive', title: 'No file selected' });
            return;
        }
        if (!password) {
            toast({ variant: 'destructive', title: 'Password required' });
            return;
        }

        setIsLoading(true);
        toast({ title: 'Attempting to unlock PDF...' });

        try {
            const existingPdfBytes = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(existingPdfBytes, {
                ownerPassword: password,
                userPassword: password,
            });

            if (pdfDoc.isEncrypted) {
                // This block will only be reached if the provided password was an owner password
                // but not the user password, and the doc is still encrypted for users.
                // Re-saving it without encryption options will remove it.
            }
            
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `unlocked-${file.name}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            
            toast({ title: 'Success!', description: 'Your PDF has been unlocked and downloaded.' });
            onTaskComplete();
            setFile(null);
            setPassword('');
        } catch (error) {
            if (error instanceof InvalidPDFError && error.message.includes('password')) {
                toast({ variant: 'destructive', title: 'Unlock Failed', description: 'Incorrect password.' });
            } else {
                console.error('Error unlocking PDF:', error);
                toast({ variant: 'destructive', title: 'An error occurred', description: 'Could not unlock the PDF. It may not be encrypted or is corrupted.' });
            }
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
                            <p className="font-medium">Drag & drop an encrypted PDF here, or click to select</p>
                            <p className="text-xs text-muted-foreground mt-2">Only single .pdf file is accepted</p>
                        </div>
                    )}
                </div>
                {file && (
                     <div className="space-y-2">
                        <Label htmlFor="password">PDF Password</Label>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter the PDF password"/>
                    </div>
                )}
                <Button onClick={handleUnlock} disabled={isLoading || !file || !password} className="w-full h-12 text-base font-bold gradient-button-gold">
                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Unlock className="mr-2" />}
                    Unlock & Download
                </Button>
            </CardContent>
        </Card>
    );
}
