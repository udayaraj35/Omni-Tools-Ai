'use client';
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudUpload } from 'lucide-react';
import { Button } from '../ui/button';

const FileUploadArea = ({ onFilesUploaded }: { onFilesUploaded: (files: File[]) => void }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesUploaded(acceptedFiles);
  }, [onFilesUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    }
  });

  return (
    <div className="rounded-xl bg-card p-6 shadow-sm border border-border">
      <h3 className="text-lg font-semibold mb-4 text-center">Upload Files</h3>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-accent'}`}
      >
        <input {...getInputProps()} />
        <CloudUpload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        {isDragActive ? (
          <p className="font-semibold text-primary">Drop the files here...</p>
        ) : (
          <div>
            <p className="font-medium">Drag & drop files here</p>
            <p className="text-sm text-muted-foreground mt-2">or</p>
            <Button variant="outline" className="mt-2">Browse Files</Button>
            <p className="text-xs text-muted-foreground mt-2">Supports PDF, JPG, PNG</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadArea;
