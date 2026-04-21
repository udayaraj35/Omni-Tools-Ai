'use client';
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileUp } from 'lucide-react';

interface PDFUploaderProps {
    onFilesUploaded: (files: File[]) => void;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ onFilesUploaded }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            onFilesUploaded(Array.from(event.target.files));
        }
    };

    return (
        <>
            <Input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".pdf"
                multiple
                onChange={handleFileChange}
            />
            <Button onClick={() => inputRef.current?.click()} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <FileUp className="mr-2 h-4 w-4" /> Upload Files
            </Button>
        </>
    );
};

export default PDFUploader;
