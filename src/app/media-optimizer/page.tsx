'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/landing/Navbar';
import { LandingFooter } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
    Loader2, ArrowLeft, Download, Image as ImageIcon, 
    Video, CheckCircle2, RefreshCw, 
    Gauge, Sparkles, Trash2, File, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';

const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface PendingFile {
    file: File;
    preview: string;
    status: 'pending' | 'processing' | 'completed' | 'error';
    isPreviewLoading?: boolean;
}

interface ProcessedFile {
    name: string;
    originalSize: number;
    newSize: number;
    blob: Blob;
    type: 'image' | 'video';
    originalPreview: string;
    optimizedPreview: string;
}

export default function MediaOptimizerPage() {
    const router = useRouter();
    const { toast } = useToast();
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
    const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
    const [activeTab, setActiveTab] = useState('image');
    
    const [imageFormat, setImageFormat] = useState('image/jpeg');
    const [imageQuality, setImageQuality] = useState(80);
    const [videoQuality, setVideoQuality] = useState(28); 

    const processImages = async () => {
        if (pendingFiles.length === 0) return;
        setIsProcessing(true);
        setProgress(0);
        
        try {
            const { default: heic2any } = await import('heic2any');
            const results: ProcessedFile[] = [];
            
            for (let i = 0; i < pendingFiles.length; i++) {
                const pending = pendingFiles[i];
                const isHeic = pending.file.name.toLowerCase().endsWith('.heic');
                let blob = pending.file;
                
                if (isHeic) {
                    const result = await heic2any({ blob: pending.file, toType: imageFormat, quality: imageQuality / 100 });
                    blob = Array.isArray(result) ? result[0] : result;
                }

                results.push({
                    name: `optimized-${pending.file.name.replace('.heic', '.jpg')}`,
                    originalSize: pending.file.size,
                    newSize: blob.size,
                    blob: blob,
                    type: 'image',
                    originalPreview: pending.preview,
                    optimizedPreview: URL.createObjectURL(blob)
                });
                setProgress(Math.round(((i + 1) / pendingFiles.length) * 100));
            }
            
            setProcessedFiles(prev => [...prev, ...results]);
            setPendingFiles([]);
            toast({ title: 'Optimization Complete!' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Processing failed' });
        } finally {
            setIsProcessing(false);
        }
    };

    const compressVideo = async () => {
        if (pendingFiles.length === 0) return;
        setIsProcessing(true);
        setProgress(10);
        
        try {
            const { FFmpeg } = await import('@ffmpeg/ffmpeg');
            const { toBlobURL, fetchFile } = await import('@ffmpeg/util');
            
            const ffmpeg = new FFmpeg();
            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });

            const videoFile = pendingFiles[0].file;
            await ffmpeg.writeFile('input', await fetchFile(videoFile));
            await ffmpeg.exec(['-i', 'input', '-vcodec', 'libx264', '-crf', String(videoQuality), 'output.mp4']);
            
            const data = await ffmpeg.readFile('output.mp4');
            const blob = new Blob([data], { type: 'video/mp4' });

            setProcessedFiles(prev => [...prev, {
                name: `optimized-${videoFile.name}`,
                originalSize: videoFile.size,
                newSize: blob.size,
                blob: blob,
                type: 'video',
                originalPreview: pendingFiles[0].preview,
                optimizedPreview: URL.createObjectURL(blob)
            }]);
            setPendingFiles([]);
            toast({ title: 'Video Optimized!' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Video compression failed' });
        } finally {
            setIsProcessing(false);
            setProgress(100);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploaded = Array.from(e.target.files || []);
        if (uploaded.length === 0) return;
        
        setPendingFiles(uploaded.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            status: 'pending',
        })));
    };

    const downloadAll = async () => {
        const { default: JSZip } = await import('jszip');
        const { saveAs } = await import('file-saver');
        
        if (processedFiles.length === 1) {
            saveAs(processedFiles[0].blob, processedFiles[0].name);
            return;
        }
        
        const zip = new JSZip();
        processedFiles.forEach(f => zip.file(f.name, f.blob));
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, 'optimized-media.zip');
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar onNavigate={p => router.push(p)} />
            <main className="flex-1 container mx-auto py-10 px-4 max-w-4xl">
                <h1 className="text-4xl font-bold text-center mb-10">Media Optimizer</h1>
                <Card className="glass-card p-10 text-center border-dashed border-2">
                    <input type="file" id="upload" hidden onChange={handleFileChange} multiple={activeTab === 'image'} />
                    <label htmlFor="upload" className="cursor-pointer space-y-4">
                        <div className="p-6 bg-muted rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                            <ImageIcon className="w-10 h-10 text-primary" />
                        </div>
                        <p className="text-xl font-bold">Click to Upload Files</p>
                    </label>
                </Card>
                
                {pendingFiles.length > 0 && (
                    <div className="mt-8 flex justify-center gap-4">
                        <Button onClick={activeTab === 'image' ? processImages : compressVideo} className="gradient-button-gold h-14 px-10 text-xl font-black">
                            {isProcessing ? <Loader2 className="animate-spin mr-2"/> : <Sparkles className="mr-2"/>} OPTIMIZE NOW
                        </Button>
                    </div>
                )}

                {processedFiles.length > 0 && (
                    <div className="mt-8 grid gap-4">
                        {processedFiles.map((file, i) => (
                            <Card key={i} className="glass-card p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-bold">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{formatSize(file.originalSize)} → {formatSize(file.newSize)}</p>
                                </div>
                                <Button onClick={downloadAll} variant="outline"><Download className="w-4 h-4 mr-2"/> Download</Button>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
            <LandingFooter onNavigate={p => router.push(p)} />
        </div>
    );
}