'use client';
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, Download, UploadCloud } from 'lucide-react';
import { PDFDocument, InvalidPDFError } from 'pdf-lib';
import { useDropzone } from 'react-dropzone';
import { Label } from '@/components/ui/label';

export function LockPdf({ onTaskComplete }: { onTaskComplete: () => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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

    const handleLock = async () => {
        if (!file) {
            toast({ variant: 'destructive', title: 'No file selected' });
            return;
        }
        if (!password) {
            toast({ variant: 'destructive', title: 'Password required' });
            return;
        }
        if (password !== confirmPassword) {
            toast({ variant: 'destructive', title: 'Passwords do not match' });
            return;
        }

        setIsLoading(true);
        toast({ title: 'Encrypting PDF...' });

        try {
            const existingPdfBytes = await file.arrayBuffer();
            // Load the source PDF
            const srcDoc = await PDFDocument.load(existingPdfBytes);
            
            // Create a new PDF and copy the pages
            const pdfDoc = await PDFDocument.create();
            const copiedPages = await pdfDoc.copyPages(srcDoc, srcDoc.getPageIndices());
            copiedPages.forEach(page => pdfDoc.addPage(page));

            // Now encrypt the new document
            pdfDoc.encrypt({
                userPassword: password,
                ownerPassword: password,
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `locked-${file.name}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            
            toast({ title: 'Success!', description: 'Your PDF has been encrypted and downloaded.' });
            onTaskComplete();
            setFile(null);
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Error locking PDF:', error);
            if (error instanceof InvalidPDFError) {
                 toast({ variant: 'destructive', title: 'Invalid PDF', description: 'The uploaded file could not be processed. It might be corrupted or already encrypted.' });
            } else {
                toast({ variant: 'destructive', title: 'An error occurred', description: 'Could not encrypt the PDF.' });
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
                            <p className="font-medium">Drag & drop a PDF here, or click to select a file</p>
                            <p className="text-xs text-muted-foreground mt-2">Only single .pdf file is accepted</p>
                        </div>
                    )}
                </div>
                {file && (
                     <div className="space-y-4">
                        <div>
                            <Label htmlFor="password">Set Password</Label>
                            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter a strong password"/>
                        </div>
                        <div>
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password"/>
                        </div>
                    </div>
                )}
                <Button onClick={handleLock} disabled={isLoading || !file || !password || password !== confirmPassword} className="w-full h-12 text-base font-bold gradient-button-gold">
                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Lock className="mr-2" />}
                    Lock & Download
                </Button>
            </CardContent>
        </Card>
    );
}
